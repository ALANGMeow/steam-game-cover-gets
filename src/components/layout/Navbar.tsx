'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useI18n } from './LanguageProvider'
import { Button } from '@/components/ui'

type Lang = 'zh' | 'en'

export default function Navbar() {
  const { lang, setLang, t } = useI18n()
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
            <a href="https://www.laogou717.com" target="_blank" rel="noopener" className="accent-text hover:text-white transition-colors">{t('nav_blog')}</a>
            <Link href="/about" className="accent-text hover:text-white transition-colors">{t('nav_about')}</Link>
            <Button variant="ghost" size="sm" onClick={() => window.open('https://github.com/laogou717/Steam-game-cover-gets', '_blank', 'noopener')}>
              <i className="fa-brands fa-github mr-2"/>
              {t('nav_github')}
            </Button>
            <select
              aria-label={t('language')}
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-transparent border border-white/15 rounded-lg px-2.5 py-1 text-sm text-text-secondary hover:text-white"
            >
              <option value="zh">{t('zh')}</option>
              <option value="en">{t('en')}</option>
            </select>
          </div>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
        </div>
        {open && (
          <div className="md:hidden py-2 space-y-2">
            <Link href="/" className="block accent-text hover:text-white">{t('nav_home')}</Link>
            <a href="https://www.laogou717.com" target="_blank" rel="noopener" className="block accent-text hover:text-white">{t('nav_blog')}</a>
            <Link href="/about" className="block accent-text hover:text-white">{t('nav_about')}</Link>
            <button className="block accent-text hover:text-white" onClick={() => window.open('https://github.com/laogou717/Steam-game-cover-gets', '_blank', 'noopener')}>
              {t('nav_github')}
            </button>
            <div className="pt-2">
              <select
                aria-label={t('language')}
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="w-full bg-transparent border border-white/15 rounded-lg px-2.5 py-1 text-sm text-text-secondary"
              >
                <option value="zh">{t('zh')}</option>
                <option value="en">{t('en')}</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}