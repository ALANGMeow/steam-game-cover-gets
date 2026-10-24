export interface SteamVariant {
  key: string
  url: (id: string) => string
  hint: string
}

export interface LoadedImage {
  url: string
  label: string
  naturalWidth?: number
  naturalHeight?: number
  variant: string
  // 文件扩展名（用于下载命名与类型判断），如 'jpg' | 'png'
  ext: string
  // 是否为带透明通道的图片（如 logo.png），预览时需棋盘格背景
  transparent?: boolean
}

export interface ToastMessage {
  message: string
  type?: 'success' | 'error' | 'info'
  id?: string
}

// 新增：按名称搜索的返回类型
export interface SearchResult {
  appid: number
  name: string
  capsule: string
}

export interface SearchResponse {
  ok: boolean
  results: SearchResult[]
  error?: string
}