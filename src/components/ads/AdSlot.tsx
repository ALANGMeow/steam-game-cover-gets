"use client"

import React, { CSSProperties, useEffect, useRef, useState } from 'react'

interface AdSlotProps {
  slot?: string
  style?: CSSProperties
  responsive?: boolean
  className?: string
  // rectangle | horizontal | auto 仅用于占位时的语义化
  format?: 'rectangle' | 'horizontal' | 'auto'
  // 开发环境下是否显示占位（避免布局抖动）。默认不显示，以免误导。
  showPlaceholderInDev?: boolean
  // 生产环境：在广告真正填充（ins 内出现 iframe 且高度>0）之前隐藏组件
  hideUntilFilled?: boolean
  // 广告填充完成回调
  onFilled?: () => void
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

export default function AdSlot({
  slot,
  style,
  responsive = true,
  className = '',
  format = 'auto',
  showPlaceholderInDev = false,
  hideUntilFilled = true,
  onFilled,
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement | null>(null)

  const isProd = process.env.NODE_ENV === 'production'
  const hasSlot = !!slot
  const [filled, setFilled] = useState(false)

  // 触发 adsbygoogle 并在生产环境监听填充状态
  useEffect(() => {
    if (!isProd || !hasSlot) return

    try {
      // @ts-expect-error adsbygoogle is injected by AdSense script
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}

    const check = () => {
      const el = insRef.current as unknown as HTMLElement | null
      if (!el) return
      const hasIframe = el.querySelector('iframe')
      const h = el.offsetHeight
      if (hasIframe && h > 0) {
        if (!filled) {
          setFilled(true)
          onFilled?.()
        }
      }
    }

    // 轮询检测，Adsense 无官方完成事件，这里采用轻量轮询（最多 12s）
    const checkTimer = window.setInterval(check, 300)
    const timeoutTimer = window.setTimeout(() => {
      window.clearInterval(checkTimer)
    }, 12000)

    return () => {
      window.clearInterval(checkTimer)
      window.clearTimeout(timeoutTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProd, hasSlot, slot])

  // 计算开发态占位尺寸
  const getDevPlaceholderStyle = (): CSSProperties => {
    const fallback: CSSProperties =
      format === 'horizontal'
        ? { width: '100%', height: 90 }
        : { width: 300, height: 250 }
    return { ...fallback, ...(style || {}) }
  }

  // 计算预加载尺寸（用于填充前将 ins 放到视口外加载，但不占据页面空间）
  const getPreloadSize = (): { width: number | string; height: number } => {
    if (format === 'horizontal') return { width: 728, height: 90 }
    if (format === 'rectangle') return { width: 300, height: 250 }
    return { width: 300, height: 250 }
  }

  // 渲染分支（在 hooks 之后执行，以满足 hooks 顺序规则）
  if (!isProd) {
    if (!showPlaceholderInDev) return null
    return (
      <div
        className={`glass-card flex items-center justify-center text-xs text-text-muted ${className}`}
        style={getDevPlaceholderStyle()}
      >
        Ad Placeholder
      </div>
    )
  }

  // 生产环境但缺少 client 或 slot：不渲染
  if (isProd && (!ADSENSE_CLIENT || !hasSlot)) {
    return null
  }

  // 生产环境：渲染实际广告位
  // 在 filled 前，ins 会被放置在视口外，避免占据任何空间；一旦 filled，恢复为正常 block 显示
  const preload = getPreloadSize()
  const invisibleStyle: CSSProperties = hideUntilFilled && !filled
    ? {
        position: 'absolute',
        left: -10000,
        top: -10000,
        width: preload.width,
        height: preload.height,
        opacity: 0,
        pointerEvents: 'none',
        display: 'block',
      }
    : { display: 'block', ...(style || {}) }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${hideUntilFilled && !filled ? '' : 'block'} ${className}`}
      style={invisibleStyle}
      data-ad-client={ADSENSE_CLIENT}
      {...(slot ? { 'data-ad-slot': slot } : {})}
      {...(responsive ? { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' } : {})}
    />
  )
}