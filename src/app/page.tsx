'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import JSZip from 'jszip'
import { Button, Input, Loading, Toast, Modal, MasonryGrid } from '@/components/ui'
import { LoadedImage, ToastMessage, SearchResult, SearchResponse } from '@/types'
import { parseAppId, copyToClipboard } from '@/lib/utils'
import { useI18n } from '@/components/layout/LanguageProvider'
import AdSlot from '@/components/ads/AdSlot'

// 读取广告单元 ID（生产环境可配置），未配置则保持占位
const ADS_SLOT_RECT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECT || ''
const ADS_SLOT_BANNER = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || ''

const HomePage: React.FC = () => {
  const { t } = useI18n()
  const [appId, setAppId] = useState('')
  const [images, setImages] = useState<LoadedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  // 当前已加载封面对应的 appid（用于打包命名取游戏名）
  const [currentAppId, setCurrentAppId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  // 新增：联想搜索状态
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const suggestAbortRef = useRef<AbortController | null>(null)
  const suggestCacheRef = useRef<Map<string, { results: SearchResult[]; ts: number }>>(new Map())
  const inFlightSuggestRef = useRef<Map<string, Promise<SearchResponse>>>(new Map())

  // 新增：广告可见性与高度同步
  const [leftAdVisible, setLeftAdVisible] = useState(false)
  const [rightAdVisible, setRightAdVisible] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [searchCardHeight, setSearchCardHeight] = useState<number | undefined>(undefined)
  const searchCardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = searchCardRef.current
    if (!el) return
    const update = () => setSearchCardHeight(el.offsetHeight)
    update()
    let ro: ResizeObserver | null = null
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => update())
      ro.observe(el)
    }
    const onResize = () => update()
    window.addEventListener('resize', onResize)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // 图片加载检测函数
  const tryLoadImageWithDetails = (url: string): Promise<{ ok: boolean; naturalWidth?: number; naturalHeight?: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.onload = () => resolve({ ok: true, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })
      img.onerror = () => resolve({ ok: false })
      // 添加时间戳防止缓存影响检测
      img.src = url + (url.includes('?') ? '&' : '?') + 'ts=' + Date.now()
    })
  }

  // 新增：抽取的封面抓取函数，供表单提交和建议选择复用
  const fetchCovers = useCallback(async (parsedId: string) => {
    setLoading(true)
    setImages([])
    setCurrentAppId(parsedId)

    // 资源清单：封面为 jpg，logo 为带透明通道的 png
    const variants: { name: string; ext: string; transparent?: boolean }[] = [
      { name: 'header', ext: 'jpg' },
      { name: 'library_600x900', ext: 'jpg' },
      { name: 'library_hero', ext: 'jpg' },
      { name: 'capsule_616x353', ext: 'jpg' },
      { name: 'capsule_467x181', ext: 'jpg' },
      { name: 'capsule_231x87', ext: 'jpg' },
      { name: 'logo', ext: 'png', transparent: true },
      { name: 'logo_2x', ext: 'png', transparent: true },
    ]

    try {
      const tasks = variants.map(async (v) => {
        const url = `https://cdn.akamai.steamstatic.com/steam/apps/${parsedId}/${v.name}.${v.ext}`
        const result = await tryLoadImageWithDetails(url)
        return result.ok ? {
          variant: v.name,
          url,
          label: v.name.replace(/_/g, ' '),
          ext: v.ext,
          transparent: v.transparent,
          naturalWidth: result.naturalWidth,
          naturalHeight: result.naturalHeight
        } as LoadedImage : null
      })

      const results = await Promise.all(tasks)
      const loadedImages = results.filter(Boolean) as LoadedImage[]

      if (loadedImages.length === 0) {
        addToast({ type: 'error', message: t('toasts_not_found') })
      } else {
        addToast({ type: 'success', message: t('toasts_loaded', { n: loadedImages.length }) })
      }

      setImages(loadedImages)
    } catch {
      addToast({ type: 'error', message: t('toasts_error_loading') })
    } finally {
      setLoading(false)
    }
  }, [addToast, t])

  // 新增：当输入不是 APPID/链接 且 长度>=2 时触发联想
  useEffect(() => {
    const term = appId.trim()

    if (parseAppId(term) || term.length < 2) {
      setSuggestions([])
      setSuggestOpen(false)
      setActiveIndex(-1)
      if (suggestAbortRef.current) suggestAbortRef.current.abort()
      return
    }

    // 取消上一请求（不同 term）
    if (suggestAbortRef.current) suggestAbortRef.current.abort()

    setSuggestLoading(true)

    let localController: AbortController | null = null
    let active = true

    const timer = setTimeout(async () => {
      // 1) 命中缓存（2 分钟 TTL）
      const cached = suggestCacheRef.current.get(term)
      if (cached && Date.now() - cached.ts < 2 * 60 * 1000) {
        if (!active) return
        setSuggestions(cached.results)
        setSuggestOpen(cached.results.length > 0)
        setActiveIndex(cached.results.length > 0 ? 0 : -1)
        setSuggestLoading(false)
        return
      }

      // 2) 并发合并：已有同 term 在飞请求则复用其 Promise
      const existing = inFlightSuggestRef.current.get(term)
      if (existing) {
        try {
          const data = await existing
          if (!active) return
          if (data.ok) {
            suggestCacheRef.current.set(term, { results: data.results, ts: Date.now() })
            setSuggestions(data.results)
            setSuggestOpen(data.results.length > 0)
            setActiveIndex(data.results.length > 0 ? 0 : -1)
          } else {
            setSuggestions([])
            setSuggestOpen(false)
            setActiveIndex(-1)
          }
        } catch {
          if (!active) return
          setSuggestions([])
          setSuggestOpen(false)
          setActiveIndex(-1)
        } finally {
          if (active) setSuggestLoading(false)
        }
        return
      }

      // 3) 发起新请求
      localController = new AbortController()
      suggestAbortRef.current = localController

      const promise = fetch(`/api/search?term=${encodeURIComponent(term)}&limit=10`, { signal: localController.signal })
        .then(res => res.json() as Promise<SearchResponse>)

      inFlightSuggestRef.current.set(term, promise)

      try {
        const data = await promise
        if (!active || localController.signal.aborted) return
        if (data.ok) {
          suggestCacheRef.current.set(term, { results: data.results, ts: Date.now() })
          setSuggestions(data.results)
          setSuggestOpen(data.results.length > 0)
          setActiveIndex(data.results.length > 0 ? 0 : -1)
        } else {
          setSuggestions([])
          setSuggestOpen(false)
          setActiveIndex(-1)
        }
      } catch (err: unknown) {
        const aborted = err instanceof DOMException ? err.name === 'AbortError' : (typeof err === 'object' && err !== null && 'name' in err && (err as { name?: unknown }).name === 'AbortError')
        if (aborted) return
        if (!active) return
        setSuggestions([])
        setSuggestOpen(false)
        setActiveIndex(-1)
      } finally {
        inFlightSuggestRef.current.delete(term)
        if (active) setSuggestLoading(false)
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
      if (localController) localController.abort()
    }
  }, [appId])

  // 新增：选择建议项（立即触发封面抓取）
  const selectSuggestion = useCallback((s: SearchResult) => {
    setAppId(String(s.appid))
    setSuggestOpen(false)
    setSuggestions([])
    setActiveIndex(-1)
    fetchCovers(String(s.appid))
  }, [fetchCovers])

  // 新增：输入框键盘交互
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((idx) => (idx + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((idx) => (idx - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault()
        selectSuggestion(suggestions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setSuggestOpen(false)
    }
  }, [suggestOpen, suggestions, activeIndex, selectSuggestion])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const parsedId = parseAppId(appId.trim())
    if (!parsedId) {
      addToast({ type: 'error', message: t('toasts_input_invalid') })
      return
    }

    // 使用抽取的函数
    fetchCovers(parsedId)
  }, [appId, addToast, fetchCovers, t])

  const handleCopy = useCallback(async (url: string) => {
    const success = await copyToClipboard(url)
    if (success) {
      addToast({ type: 'success', message: t('toasts_copy_ok') })
    } else {
      addToast({ type: 'error', message: t('toasts_copy_fail') })
    }
  }, [addToast, t])

  // 获取适合做文件名的游戏 slug（如 CounterStrike_2），失败回退 appid
  const fetchGameSlug = useCallback(async (id: string): Promise<string> => {
    try {
      const res = await fetch(`/api/appinfo?appid=${encodeURIComponent(id)}`)
      const data = await res.json() as { ok: boolean; slug?: string }
      const slug = (data.slug || '').trim()
      return slug || id
    } catch {
      return id
    }
  }, [])

  // 一键打包下载：fetch 所有已加载图片二进制 → 生成 zip
  const handleDownloadAll = useCallback(async () => {
    if (images.length === 0 || !currentAppId) {
      addToast({ type: 'error', message: t('toasts_pack_empty') })
      return
    }

    setDownloading(true)
    addToast({ type: 'info', message: t('toasts_packing', { n: images.length }) })

    try {
      const slug = await fetchGameSlug(currentAppId)
      const zip = new JSZip()

      // 并发拉取图片二进制（CDN 带 Access-Control-Allow-Origin: *，可直接 fetch）
      const entries = await Promise.all(
        images.map(async (img) => {
          const cleanUrl = img.url.replace(/\?ts=\d+$/, '')
          const resp = await fetch(cleanUrl)
          if (!resp.ok) throw new Error(`fetch ${img.variant} failed: ${resp.status}`)
          const blob = await resp.blob()
          // 文件名：游戏名_类型.后缀，如 CounterStrike_2_header.jpg
          const filename = `${slug}_${img.variant}.${img.ext}`
          return { filename, blob }
        })
      )

      entries.forEach(({ filename, blob }) => zip.file(filename, blob))

      const content = await zip.generateAsync({ type: 'blob' })
      const zipName = `${slug}.zip`

      // 触发浏览器下载
      const objectUrl = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = zipName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)

      addToast({ type: 'success', message: t('toasts_pack_ok', { name: zipName }) })
    } catch {
      addToast({ type: 'error', message: t('toasts_pack_fail') })
    } finally {
      setDownloading(false)
    }
  }, [images, currentAppId, addToast, fetchGameSlug, t])

  const handleSteamBtn = useCallback(async () => {
    try {
      // 优先尝试从剪贴板读取链接并解析 APPID
      if (navigator?.clipboard?.readText) {
        const text = (await navigator.clipboard.readText())?.trim()
        if (text) {
          const id = parseAppId(text)
          if (id) {
            setAppId(id)
            addToast({ type: 'success', message: t('appid_from_clipboard') })
            return
          }
        }
      }
      // 兜底：打开 Steam 商店首页
      window.open('https://store.steampowered.com/', '_blank', 'noopener')
    } catch {
      window.open('https://store.steampowered.com/', '_blank', 'noopener')
    }
  }, [addToast, t])

  return (
    <div>
      <div className="container-responsive py-6 md:py-8">
        {/* 搜索区域 */}
        <div className="mb-12 md:mb-16 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* 左侧小卡片广告（桌面端显示） */}
            <div className="hidden lg:block lg:col-span-3">
              <div
                className={leftAdVisible ? "glass-card h-full flex items-center justify-center p-4 transition-all duration-300 opacity-100" : "relative h-0 p-0 opacity-0 transition-all duration-300"}
                style={leftAdVisible && searchCardHeight ? { height: searchCardHeight } : undefined}
              >
                <AdSlot
                  className="max-w-full"
                  format="rectangle"
                  slot={ADS_SLOT_RECT || undefined}
                  onFilled={() => setLeftAdVisible(true)}
                />
              </div>
            </div>

            {/* 中间搜索卡片 */}
            <div className="lg:col-span-6">
              <div ref={searchCardRef} className="glass-card">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 apple-gradient text-center">{t('search_title')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={t('placeholder')}
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
                      onBlur={() => setTimeout(() => setSuggestOpen(false), 100)}
                      className="w-full text-lg py-3 bg-black/30 border border-white/10 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 placeholder:text-text-muted backdrop-blur-sm"
                      disabled={loading}
                    />

                    {suggestOpen && (
                      <div className="absolute left-0 right-0 mt-2 z-50">
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/80 backdrop-blur-md shadow-2xl">
                          {suggestLoading && (
                            <div className="p-4 flex items-center justify-center">
                              <Loading />
                            </div>
                          )}
                          {!suggestLoading && suggestions.length === 0 && (
                            <div className="p-3 text-sm text-text-muted text-center">{t('no_results')}</div>
                          )}
                          {!suggestLoading && suggestions.length > 0 && (
                            <ul role="listbox" className="max-h-72 overflow-auto divide-y divide-white/5">
                              {suggestions.map((s, idx) => (
                                <li
                                  role="option"
                                  aria-selected={idx === activeIndex}
                                  key={s.appid}
                                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${idx === activeIndex ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                                  onMouseEnter={() => setActiveIndex(idx)}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => selectSuggestion(s)}
                                >
                                  <img src={s.capsule} alt="" className="h-8 w-auto rounded-md ring-1 ring-white/10" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{s.name}</p>
                                    <p className="text-xs text-text-muted">APPID: {s.appid}</p>
                                  </div>
                                  <i className="fa-solid fa-arrow-turn-down-left text-text-muted" />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      size="md"
                      disabled={loading || !appId.trim()}
                      className="flex-1"
                    >
                      <i className="fa-solid fa-download mr-2"></i>
                      {loading ? t('btn_fetching') : t('btn_get')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSteamBtn}
                      className="px-4 border-white/10 hover:border-emerald-400/50 text-text-secondary hover:text-white"
                      aria-label="Steam"
                    >
                      <i className="fa-brands fa-steam"></i>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHelpModalOpen(true)}
                      className="px-4 border-white/10 hover:border-emerald-400/50 text-text-secondary hover:text-white"
                    >
                      <i className="fa-solid fa-circle-question"></i>
                    </Button>
                  </div>
                </form>
                
                {loading && (
                  <div className="flex justify-center mt-6">
                    <Loading />
                  </div>
                )}
              </div>
            </div>

            {/* 右侧小卡片广告（桌面端显示） */}
            <div className="hidden lg:block lg:col-span-3">
              <div
                className={rightAdVisible ? "glass-card h-full flex items-center justify-center p-4 transition-all duration-300 opacity-100" : "relative h-0 p-0 opacity-0 transition-all duration-300"}
                style={rightAdVisible && searchCardHeight ? { height: searchCardHeight } : undefined}
              >
                <AdSlot
                  className="max-w-full"
                  format="rectangle"
                  slot={ADS_SLOT_RECT || undefined}
                  onFilled={() => setRightAdVisible(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 封面展示区域 */}
        {images.length > 0 && (
          <div className="animate-slide-up">
            <div className="flex justify-center">
              <div className="text-center mb-6 md:mb-8 px-4">
                <h2 className="large-text apple-gradient mb-2">{t('cover_preview')}</h2>
                <p className="accent-text">{t('click_to_copy')}</p>
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    size="md"
                    onClick={handleDownloadAll}
                    disabled={downloading}
                  >
                    <i className={`fa-solid ${downloading ? 'fa-spinner fa-spin' : 'fa-file-zipper'} mr-2`}></i>
                    {downloading ? t('btn_packing') : t('btn_download_all')}
                  </Button>
                </div>
              </div>
            </div>

            <MasonryGrid className="max-w-screen-xl mx-auto" minColumnWidth={200} gap={16}>
              {images.map((image, index) => {
                const sizeText = image.naturalWidth && image.naturalHeight ? ` · ${image.naturalWidth}×${image.naturalHeight}` : '';
                return (
                  <div
                    key={`${image.variant}-${index}`}
                    className="liquidGlass-wrapper animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleCopy(image.url.replace(/\?ts=\d+$/, ''))}
                  >
                    <div className="liquidGlass-effect"></div>
                    <div className="liquidGlass-tint"></div>
                    <div className="liquidGlass-shine"></div>
                    <div className="liquidGlass-text w-full">
                      <div
                        className="relative overflow-hidden rounded-2xl mb-4 ring-1 ring-white/10 bg-black/20"
                        style={image.transparent ? {
                          // 透明 PNG（logo）用棋盘格背景，便于看清白色 logo
                          backgroundColor: '#3a3a3a',
                          backgroundImage:
                            'linear-gradient(45deg, #4a4a4a 25%, transparent 25%), linear-gradient(-45deg, #4a4a4a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a4a4a 75%), linear-gradient(-45deg, transparent 75%, #4a4a4a 75%)',
                          backgroundSize: '16px 16px',
                          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
                        } : undefined}
                      >
                        <img
                          src={image.url.replace(/\?ts=\d+$/, '')}
                          alt={image.label}
                          className="w-full h-auto transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-white capitalize mb-1">
                          {image.label}{sizeText}
                        </h3>
                        <p className="accent-text">
                          {t('click_to_copy')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </MasonryGrid>
          </div>
        )}
        {/* 底部横幅广告（页脚上方） */}
        <div className="mt-8 md:mt-12 px-4 mb-8 md:mb-12">
          <div className={bannerVisible ? "glass-card p-2 transition-all duration-300 opacity-100" : "relative h-0 p-0 opacity-0 transition-all duration-300"}>
            <AdSlot
              className="w-full"
              format="horizontal"
              responsive
              slot={ADS_SLOT_BANNER || undefined}
              onFilled={() => setBannerVisible(true)}
            />
          </div>
        </div>
      </div>

      {/* 帮助模态框 */}
      <Modal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title={t('help_title')}
      >
        <div className="space-y-4 text-sm text-text-muted">
          <div>
            <h3 className="font-semibold text-text-primary mb-2">{t('help_formats')}</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Steam游戏ID：<code className="bg-white/10 px-1 rounded">730</code></li>
              <li>Steam商店链接：<code className="bg-white/10 px-1 rounded">https://store.steampowered.com/app/730/</code></li>
              <li>Steam社区链接：<code className="bg-white/10 px-1 rounded">https://steamcommunity.com/app/730</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-2">{t('help_howto')}</h3>
            <ol className="space-y-1 list-decimal list-inside">
              <li>{t('help_step1')}</li>
              <li>{t('help_step2')}</li>
              <li>{t('help_step3')}</li>
            </ol>
          </div>
        </div>
      </Modal>

      {/* Toast通知 */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast}
          onClose={() => removeToast(toast.id!)}
        />
      ))}
    </div>
  )
}

export default HomePage