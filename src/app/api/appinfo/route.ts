import { NextResponse } from 'next/server'
import type { AppInfoResponse } from '@/types'
import { getSteamCovers } from '@/lib/steam-assets'

// 通过 keyless 的 IStoreBrowseService/GetItems 获取游戏名称和实际图片资源.
// 返回 store_url_path 中的末段（如 app/730/CounterStrike_2 -> CounterStrike_2），
// 该格式正好适合用作下载文件名；同时返回展示用 name。无需 API Key。

const cache = new Map<string, { ts: number; data: AppInfoResponse }>()
const TTL_MS = 10 * 60 * 1000 // 10min

function sanitizeSlug(raw: string): string {
  // 仅保留文件名安全字符，其余替换为下划线，并去除首尾下划线
  return raw.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '')
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const appid = Number(searchParams.get('appid'))

  if (!Number.isSafeInteger(appid) || appid <= 0) {
    return NextResponse.json(
      { ok: false, appid: 0, slug: '', covers: [], error: 'invalid appid' } satisfies AppInfoResponse,
      { status: 200 }
    )
  }

  const key = String(appid)
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < TTL_MS) {
    return NextResponse.json(hit.data)
  }

  const fallback: AppInfoResponse = {
    ok: true, appid, slug: String(appid), covers: getSteamCovers(String(appid)),
  }

  try {
    const input = {
      ids: [{ appid }],
      context: { language: 'english', country_code: 'US' },
      data_request: { include_assets: true, include_assets_without_overrides: true },
    }
    const url = new URL('https://api.steampowered.com/IStoreBrowseService/GetItems/v1/')
    url.searchParams.set('input_json', JSON.stringify(input))

    const resp = await fetch(url.toString(), {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SteamCoverBot/1.0)' },
    })

    if (!resp.ok) {
      return NextResponse.json(fallback)
    }

    const data: unknown = await resp.json()
    const items =
      typeof data === 'object' && data !== null && 'response' in data
        ? (data as { response?: { store_items?: unknown[] } }).response?.store_items
        : undefined
    const item = Array.isArray(items) && items.length > 0 ? items[0] : null

    if (item && typeof item === 'object') {
      const obj = item as {
        name?: unknown
        store_url_path?: unknown
        success?: unknown
        assets?: unknown
        assets_without_overrides?: unknown
      }
      if (obj.success !== 1) return NextResponse.json(fallback)
      const name = typeof obj.name === 'string' ? obj.name : undefined
      const storePath = typeof obj.store_url_path === 'string' ? obj.store_url_path : ''
      // store_url_path 形如 "app/730/CounterStrike_2"，取末段
      const tail = storePath.split('/').filter(Boolean).pop() || ''
      const slug = tail ? sanitizeSlug(tail) : (name ? sanitizeSlug(name) : String(appid))

      const payload: AppInfoResponse = {
        ok: true, appid, slug: slug || String(appid), name,
        covers: getSteamCovers(String(appid), obj.assets, obj.assets_without_overrides),
      }
      // 清理过期条目并限制容量, 避免长期运行时缓存持续增长.
      cache.forEach((cached, cachedKey) => {
        if (Date.now() - cached.ts >= TTL_MS) cache.delete(cachedKey)
      })
      if (cache.size >= 200) cache.delete(cache.keys().next().value!)
      cache.set(key, { ts: Date.now(), data: payload })
      return NextResponse.json(payload)
    }

    return NextResponse.json(fallback)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unexpected error'
    return NextResponse.json({ ...fallback, error: message })
  }
}
