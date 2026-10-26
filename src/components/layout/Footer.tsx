'use client'

import React from 'react'
import Link from 'next/link'
import { useI18n } from './LanguageProvider'
import { REPOSITORY_URL, SITE_MAINTAINER } from '@/lib/site'

export default function Footer() {
  const { lang } = useI18n()
  return (
    <footer className="mt-0 border-t border-white/10 bg-black/40">
      <div className="container-responsive py-6 text-sm text-text-muted flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <p>{lang === 'zh' ? `本站由 ${SITE_MAINTAINER} 维护` : `Maintained by ${SITE_MAINTAINER}`}</p>
          <p className="mt-1 text-xs">Steam and the Steam logo are trademarks of Valve Corporation.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-white">{lang === 'zh' ? '项目来源' : 'Project credits'}</Link>
          <a href={REPOSITORY_URL} target="_blank" rel="noopener" className="hover:text-white">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
