import { NextResponse } from 'next/server'
import type { SearchResponse, SearchResult } from '@/types'

// Simple in-memory cache with TTL
const cache = new Map<string, { ts: number; data: SearchResponse }>()
const TTL_MS = 60 * 1000 // 60s

function getCache(key: string) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.ts > TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.data
}

function setCache(key: string, data: SearchResponse) {
  cache.set(key, { ts: Date.now(), data })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const termRaw = (searchParams.get('term') || '').trim()
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 10), 1), 20)
    const l = (searchParams.get('l') || 'zh-cn').toLowerCase()
    const cc = (searchParams.get('cc') || 'us').toLowerCase()

    // minimum term length
    if (termRaw.length < 2) {
      const empty: SearchResponse = { ok: true, results: [] }
      return NextResponse.json(empty)
    }

    const term = termRaw.toLowerCase()
    const cacheKey = `${term}|${limit}|${l}|${cc}`
    const cached = getCache(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const url = new URL('https://store.steampowered.com/api/storesearch/')
    url.searchParams.set('term', term)
    url.searchParams.set('l', l)
    url.searchParams.set('cc', cc)
    url.searchParams.set('category1', '998')

    const resp = await fetch(url.toString(), {
      // cache a bit at edge as well
      next: { revalidate: 60 },
      headers: {
        // a basic UA to avoid some 403 cases
        'User-Agent': 'Mozilla/5.0 (compatible; SteamCoverBot/1.0)'
      }
    })

    if (!resp.ok) {
      return NextResponse.json({ ok: false, results: [], error: `upstream ${resp.status}` }, { status: 200 })
    }

    const data: unknown = await resp.json()
    const itemsRaw: unknown[] = (typeof data === 'object' && data !== null && 'items' in data && Array.isArray((data as { items: unknown }).items))
      ? (data as { items: unknown[] }).items
      : []

    const results: SearchResult[] = itemsRaw
      .slice(0, limit)
      .map((it) => {
        if (typeof it !== 'object' || it === null) return null
        const hasId = 'id' in it
        const hasAppid = 'appid' in it
        const idVal = hasId ? (it as { id?: unknown }).id : (hasAppid ? (it as { appid?: unknown }).appid : undefined)
        const appid = Number(idVal)
        const nameVal = 'name' in it ? (it as { name?: unknown }).name : ''
        const name = typeof nameVal === 'string' ? nameVal : String(nameVal ?? '')
        if (!Number.isFinite(appid) || !name) return null
        return {
          appid,
          name,
          capsule: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/capsule_184x69.jpg`
        }
      })
      .filter((r): r is SearchResult => r !== null)

    const payload: SearchResponse = { ok: true, results }
    setCache(cacheKey, payload)

    return NextResponse.json(payload)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unexpected error'
    const payload: SearchResponse = { ok: false, results: [], error: message }
    return NextResponse.json(payload, { status: 200 })
  }
}