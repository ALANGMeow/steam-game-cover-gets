import { ImageResponse } from 'next/og'
import { SHARE_SITE_LABEL, SITE_URL } from '@/lib/site'

export const runtime = 'edge'
export const alt = 'Steam 封面获取器 - 分享图'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function fetchName(appid: number, l = 'en', cc = 'us'): Promise<string | null> {
  try {
    const url = new URL('https://store.steampowered.com/api/appdetails')
    url.searchParams.set('appids', String(appid))
    url.searchParams.set('l', l)
    url.searchParams.set('cc', cc)
    const resp = await fetch(url.toString(), { next: { revalidate: 3600 } })
    if (!resp.ok) return null
    const data = (await resp.json()) as unknown
    const node = (data as Record<string, unknown>)?.[String(appid)]
    if (!node || typeof node !== 'object' || !('success' in node)) return null
    const obj = node as { success?: unknown; data?: { name?: unknown } }
    const rawName = obj.data?.name
    const name = typeof rawName === 'string' ? rawName : null
    return name
  } catch {
    return null
  }
}

export default async function Image(req: Request) {
  const base = SITE_URL
  let url: URL
  try {
    url = new URL(req.url, base)
  } catch {
    url = new URL(base)
  }
  const searchParams = url.searchParams
  const appidRaw = searchParams.get('appid')
  const l = (searchParams.get('l') || 'en').toLowerCase()
  const cc = (searchParams.get('cc') || 'us').toLowerCase()
  const appid = appidRaw ? Number(appidRaw) : NaN

  const hasValidId = Number.isFinite(appid) && appid > 0
  const coverUrl = hasValidId
    ? `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/capsule_616x353.jpg`
    : null
  const titleFromAPI = hasValidId ? await fetchName(appid, l, cc) : null
  const title = titleFromAPI || (hasValidId ? `Steam App ${appid}` : 'Steam 封面获取器')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 35%, #3b82f6 100%)',
          color: '#fff',
          position: 'relative',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(59, 130, 246, 0.25) 0%, transparent 35%)',
          }}
        />
        {coverUrl ? (
          <img
            src={coverUrl}
            width={900}
            height={516}
            alt=""
            style={{ borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.45)', objectFit: 'cover' }}
          />
        ) : null}
        <div
          style={{
            marginTop: 24,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: -0.5,
            textShadow: '0 4px 16px rgba(0,0,0,.35)',
            textAlign: 'center',
            padding: '0 40px',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 10, fontSize: 20, opacity: 0.85 }}>{SHARE_SITE_LABEL}</div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    }
  )
}
