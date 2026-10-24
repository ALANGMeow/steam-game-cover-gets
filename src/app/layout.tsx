import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { LanguageProvider } from '@/components/layout/LanguageProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Steam 封面获取器',
  description: '获取Steam游戏封面图片的工具',
  keywords: ['Steam', '封面', '游戏封面', 'Steam Cover', 'AppID', 'Game Art'],
  authors: [{ name: 'laogou717' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010'),
  openGraph: {
    title: 'Steam 封面获取器',
    description: '输入 AppID、链接或名称，快速获取 Steam 游戏封面',
    type: 'website',
    url: '/',
    locale: 'zh_CN',
    alternateLocale: ['en_US'],
    images: [{ url: '/opengraph-image' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Steam 封面获取器',
    description: '输入 AppID、链接或名称，快速获取 Steam 游戏封面',
    images: ['/twitter-image'],
  },
  // 指定多语言 URL，英文版本使用查询参数
  alternates: { canonical: '/', languages: { zh: '/', en: '/?lang=en' } },
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        {/* Google AdSense（仅生产启用，且要求提供 client） */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        {/* 多语言 SEO 辅助 */}
        <meta property="og:locale" content="zh_CN" />
        <meta property="og:locale:alternate" content="en_US" />
        {/* 结构化数据：WebSite + SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010'}/`,
              name: 'Steam 封面获取器',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010'}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-black flex flex-col`}>
        {/* SVG 滤镜定义 */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id="glass-distortion" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
            </filter>
          </defs>
        </svg>
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}