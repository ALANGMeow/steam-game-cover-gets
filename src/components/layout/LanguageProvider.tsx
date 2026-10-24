'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'zh' | 'en'

type Dict = Record<string, string>

const zh: Dict = {
  site_title: 'Steam 封面获取器',
  site_brand: 'Steam Cover',
  nav_home: '首页',
  nav_blog: '博客',
  nav_about: '关于',
  nav_github: 'GitHub',
  language: '语言',
  zh: '中文',
  en: 'English',
  hero_title1: 'Steam',
  hero_title2: '封面获取器',
  hero_tag: '获取高质量游戏封面',
  stats_cover_types: '封面类型',
  stats_games_supported: '支持游戏',
  stats_max_resolution: '最高分辨率',
  stats_always_free: '永久免费',
  search_title: '获取封面',
  placeholder: '输入Steam游戏ID、链接或名称...',
  btn_get: '获取封面',
  btn_fetching: '获取中...',
  toasts_loaded: '成功加载 {n} 张图片',
  toasts_not_found: '未找到该游戏的封面图片',
  toasts_error_loading: '加载图片时发生错误',
  toasts_input_invalid: '请输入有效的Steam游戏ID或链接',
  toasts_copy_ok: '链接已复制到剪贴板',
  toasts_copy_fail: '复制失败，请手动复制',
  help_title: '使用帮助',
  help_formats: '支持的输入格式：',
  help_howto: '如何使用：',
  help_step1: '在搜索框中输入Steam游戏ID或链接',
  help_step2: '点击「获取封面」按钮',
  help_step3: '点击任意图片即可复制链接到剪贴板',
  cover_preview: '封面预览',
  click_to_copy: '点击复制链接',
  appid_from_clipboard: '已从剪贴板提取 APPID',
  no_results: '未找到匹配的游戏',
  btn_download_all: '打包下载全部',
  btn_packing: '打包中...',
  toasts_packing: '正在打包 {n} 张图片...',
  toasts_pack_ok: '已生成 {name}',
  toasts_pack_fail: '打包失败，请重试',
  toasts_pack_empty: '没有可下载的图片',
}

const en: Dict = {
  site_title: 'Steam Cover Fetcher',
  site_brand: 'Steam Cover',
  nav_home: 'Home',
  nav_blog: 'Blog',
  nav_about: 'About',
  nav_github: 'GitHub',
  language: 'Language',
  zh: '中文',
  en: 'English',
  hero_title1: 'Steam',
  hero_title2: 'Cover Fetcher',
  hero_tag: 'GET HIGH-QUALITY GAME COVERS',
  stats_cover_types: 'COVER TYPES',
  stats_games_supported: 'GAMES SUPPORTED',
  stats_max_resolution: 'MAX RESOLUTION',
  stats_always_free: 'ALWAYS FREE',
  search_title: 'Get Covers',
  placeholder: 'Enter Steam AppID, link, or name...',
  btn_get: 'Get Covers',
  btn_fetching: 'Fetching...',
  toasts_loaded: 'Loaded {n} images',
  toasts_not_found: 'No covers found for this game',
  toasts_error_loading: 'Error while loading images',
  toasts_input_invalid: 'Please enter a valid Steam AppID or link',
  toasts_copy_ok: 'Copied to clipboard',
  toasts_copy_fail: 'Copy failed, please copy manually',
  help_title: 'Help',
  help_formats: 'Supported input formats:',
  help_howto: 'How to use:',
  help_step1: 'Enter Steam AppID or link in the input box',
  help_step2: 'Click "Get Covers"',
  help_step3: 'Click any image to copy the URL',
  cover_preview: 'Cover Preview',
  click_to_copy: 'CLICK TO COPY URL',
  appid_from_clipboard: 'Extracted AppID from clipboard',
  no_results: 'No matching games found',
  btn_download_all: 'Download All (ZIP)',
  btn_packing: 'Packing...',
  toasts_packing: 'Packing {n} images...',
  toasts_pack_ok: 'Generated {name}',
  toasts_pack_fail: 'Packing failed, please retry',
  toasts_pack_empty: 'No images to download',
}

const dicts: Record<Lang, Dict> = { zh, en }

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const Ctx = createContext<I18nCtx | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('lang') as Lang | null) : null
    const init = saved || (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en')
    setLangState(init)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem('lang', l)
  }

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const text = (dicts[lang] && dicts[lang][key]) || key
      if (!params) return text
      return Object.keys(params).reduce((acc, k) => acc.replace(new RegExp(`{${k}}`, 'g'), String(params[k]!)), text)
    }
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider')
  return ctx
}