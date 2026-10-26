import type { SteamCover } from '@/types'

interface CoverVariant {
  variant: string
  asset?: string
  logoSize?: 'image' | 'image2x'
  legacy?: string
  transparent?: boolean
}

const variants: CoverVariant[] = [
  { variant: 'header', asset: 'header', legacy: 'header.jpg' },
  { variant: 'header_2x', asset: 'header_2x' },
  { variant: 'library_600x900', asset: 'library_capsule', legacy: 'library_600x900.jpg' },
  { variant: 'library_600x900_2x', asset: 'library_capsule_2x' },
  { variant: 'library_hero', asset: 'library_hero', legacy: 'library_hero.jpg' },
  { variant: 'library_hero_2x', asset: 'library_hero_2x' },
  { variant: 'capsule_616x353', asset: 'main_capsule', legacy: 'capsule_616x353.jpg' },
  { variant: 'capsule_616x353_2x', asset: 'main_capsule_2x' },
  { variant: 'capsule_467x181', legacy: 'capsule_467x181.jpg' },
  { variant: 'capsule_231x87', asset: 'small_capsule', legacy: 'capsule_231x87.jpg' },
  { variant: 'capsule_231x87_2x', asset: 'small_capsule_2x' },
  { variant: 'hero_capsule', asset: 'hero_capsule' },
  { variant: 'hero_capsule_2x', asset: 'hero_capsule_2x' },
  { variant: 'logo', logoSize: 'image', legacy: 'logo.png', transparent: true },
  { variant: 'logo_2x', logoSize: 'image2x', legacy: 'logo_2x.png', transparent: true },
]

function resolveAsset(assets: unknown, field: string): string | null {
  if (!assets || typeof assets !== 'object') return null
  const record = assets as Record<string, unknown>
  const format = record.asset_url_format
  const filename = record[field]
  if (typeof format !== 'string' || !format.includes('${FILENAME}')) return null
  if (typeof filename !== 'string' || !filename) return null

  // Steam 返回的文件名已包含资源哈希、活动后缀和实际扩展名, 不再自行拼接图片名.
  try {
    const url = new URL(
      format.replace('${FILENAME}', filename),
      'https://shared.akamai.steamstatic.com/store_item_assets/'
    )
    if (url.origin !== 'https://shared.akamai.steamstatic.com') return null
    return url.toString()
  } catch {
    return null
  }
}

function resolveLibraryLogo(appid: string, libraryAssets: unknown, size: 'image' | 'image2x'): string | null {
  if (!libraryAssets || typeof libraryAssets !== 'object') return null
  const logo = (libraryAssets as Record<string, unknown>).library_logo
  if (!logo || typeof logo !== 'object') return null
  const localizedImages = (logo as Record<string, unknown>)[size]
  if (!localizedImages || typeof localizedImages !== 'object') return null
  const images = localizedImages as Record<string, unknown>
  // 与商店资源的英文上下文一致; 未提供英文时使用实际存在的其他语言版本.
  const filename = typeof images.english === 'string' && images.english
    ? images.english
    : Object.keys(images).map(key => images[key]).find(value => typeof value === 'string' && value)
  if (typeof filename !== 'string' || !filename) return null
  return resolveAsset({ asset_url_format: 'steam/apps/' + appid + '/${FILENAME}', logo: filename }, 'logo')
}

export function getSteamCovers(
  appid: string,
  assets?: unknown,
  originalAssets?: unknown,
  libraryAssets?: unknown
): SteamCover[] {
  const covers: SteamCover[] = []
  variants.forEach(({ variant, asset, logoSize, legacy, transparent }) => {
    const urls = [
      logoSize ? resolveLibraryLogo(appid, libraryAssets, logoSize) : null,
      asset ? resolveAsset(assets, asset) : null,
      asset ? resolveAsset(originalAssets, asset) : null,
      legacy ? `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/${legacy}` : null,
    ].filter((url): url is string => url !== null)

    if (urls.length > 0) {
      covers.push({ variant, label: variant.replace(/_/g, ' '), urls: Array.from(new Set(urls)), transparent })
    }
  })
  return covers
}
