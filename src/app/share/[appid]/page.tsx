import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'

// Build absolute URL based on metadataBase defined in root layout
function buildURL(path: string, params?: Record<string, string | number | undefined>) {
  const base = SITE_URL
  const url = new URL(path, base)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

async function fetchName(appid: number, l = 'en', cc = 'us'): Promise<string | null> {
  try {
    const url = new URL('https://store.steampowered.com/api/appdetails')
    url.searchParams.set('appids', String(appid))
    url.searchParams.set('l', l)
    url.searchParams.set('cc', cc)
    const resp = await fetch(url.toString(), { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) })
    if (!resp.ok) return null
    const data = (await resp.json()) as unknown
    const node = (data as Record<string, unknown>)?.[String(appid)]
    if (!node || typeof node !== 'object' || !('success' in node)) return null
    const obj = node as { success?: unknown; data?: { name?: unknown } }
    const rawName = obj.data?.name
    const name = obj.success === true && typeof rawName === 'string' ? rawName : null
    return name
  } catch {
    return null
  }
}

export async function generateMetadata(input: unknown): Promise<Metadata> {
  const props = (input || {}) as {
    params?: Promise<{ appid?: string }>
    searchParams?: Promise<Record<string, string | string[] | undefined>>
  }
  const [params, searchParams] = await Promise.all([props.params, props.searchParams])

  const appidNum = params?.appid ? Number(params.appid) : NaN
  const lRaw = (searchParams && typeof searchParams.l === 'string') ? searchParams.l : 'en'
  const ccRaw = (searchParams && typeof searchParams.cc === 'string') ? searchParams.cc : 'us'
  const l = lRaw.toLowerCase()
  const cc = ccRaw.toLowerCase()
  const valid = Number.isFinite(appidNum) && appidNum > 0

  const name = valid ? await fetchName(appidNum, l, cc) : null
  const title = name ? `${name} - Steam 封面获取器` : (valid ? `Steam App ${appidNum} - Steam 封面获取器` : 'Steam 封面获取器')
  const description = name ? `获取 ${name} 的官方封面图片` : '输入 AppID、链接或名称，快速获取 Steam 游戏封面'

  const ogImg = buildURL('/opengraph-image', { appid: valid ? appidNum : undefined, l, cc })
  const twImg = buildURL('/twitter-image', { appid: valid ? appidNum : undefined, l, cc })

  return {
    title,
    description,
    alternates: { canonical: buildURL(`/share/${valid ? appidNum : ''}`) },
    openGraph: {
      title,
      description,
      type: 'website',
      url: buildURL(`/share/${params?.appid ?? ''}`),
      locale: l === 'zh' || l === 'zh-cn' ? 'zh_CN' : 'en_US',
      images: [ogImg],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [twImg],
    },
  }
}

export default async function SharePage(input: unknown) {
  const props = (input || {}) as { params?: Promise<{ appid?: string }> }
  const params = await props.params
  const appid = params?.appid ?? ''
  return (
    <main className="container-responsive py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold">分享卡片页</h1>
        <p className="mt-2 text-text-muted">本页面用于为 AppID {appid} 生成社交分享卡片的元数据。</p>
        <p className="mt-2 text-text-muted">你可以直接分享此链接到 Twitter / Facebook 等平台，预览图会自动匹配对应游戏。</p>
        <a className="inline-block mt-6 px-4 py-2 rounded bg-blue-600 text-white" href={`/?appid=${appid}`}>
          返回首页并查看封面
        </a>
      </div>
    </main>
  )
}
