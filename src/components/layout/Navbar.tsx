'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useI18n } from './LanguageProvider'
import { Button } from '@/components/ui'
import { REPOSITORY_URL } from '@/lib/site'
import LanguageSelector from './LanguageSelector'

export default function Navbar() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <i className="fa-brands fa-steam text-2xl apple-gradient" aria-hidden/>
            <Link href="/" className="text-xl font-bold">{t('site_brand')}</Link>
          </div>
          <div className="hidden md:flex items-center space-x-6 ml-auto">
            <Link href="/" className="accent-text hover:text-white transition-colors">{t('nav_home')}</Link>
            <Link href="/about" className="accent-text hover:text-white transition-colors">{t('nav_about')}</Link>
            <Button variant="ghost" size="sm" onClick={() => window.open(REPOSITORY_URL, '_blank', 'noopener')}>
              <i className="fa-brands fa-github mr-2"/>
              {t('nav_github')}
            </Button>
            <LanguageSelector />
          </div>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
        </div>
        {open && (
          <div className="md:hidden py-2 space-y-2">
            <Link href="/" className="block accent-text hover:text-white">{t('nav_home')}</Link>
            <Link href="/about" className="block accent-text hover:text-white">{t('nav_about')}</Link>
            <button className="block accent-text hover:text-white" onClick={() => window.open(REPOSITORY_URL, '_blank', 'noopener')}>
              {t('nav_github')}
            </button>
            <div className="pt-2">
              <LanguageSelector className="w-full" />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
