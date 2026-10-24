import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Steam相关工具函数
export function parseAppId(text: string): string | null {
  const t = (text || '').trim()
  const m = t.match(/app\/(\d+)/)
  if (m) return m[1]
  if (/^\d{3,10}$/.test(t)) return t
  return null
}

// 图片加载测试
export function tryLoadImage(url: string): Promise<{ ok: boolean; img?: HTMLImageElement }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.referrerPolicy = 'no-referrer'
    img.onload = () => resolve({ ok: true, img })
    img.onerror = () => resolve({ ok: false })
    // 加时间戳防缓存，只用于测试加载
    img.src = url + (url.includes('?') ? '&' : '?') + 'ts=' + Date.now()
  })
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      return true
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}