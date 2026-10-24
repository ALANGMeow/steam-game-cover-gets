'use client'

import React from 'react'
import { useI18n } from '@/components/layout/LanguageProvider'

export default function AboutPage() {
  const { lang } = useI18n()
  return (
    <section className="container-responsive py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-xs text-text-muted">
            <i className="fa-brands fa-steam text-sm"/>
            <span>{lang === 'zh' ? '项目介绍' : 'Project Intro'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 apple-gradient">
            {lang === 'zh' ? '关于这个项目' : 'About This Project'}
          </h1>
          <p className="mt-3 text-text-muted text-sm md:text-base">
            {lang === 'zh'
              ? '一个专注于快速获取 Steam 官方封面的轻量工具。'
              : 'A tiny tool focused on fetching official Steam covers fast.'}
          </p>
        </header>

        <article className="prose prose-invert prose-sm md:prose-base max-w-none leading-relaxed">
          <p>
            {lang === 'zh'
              ? '有一天我准备发一篇游戏的博文，需要配一张封面。与其每次去找，不如做个工具：输入 AppID、链接或直接输入游戏名称，即可快速获取官方封面图，并一键复制。'
              : 'I was about to publish a game post and needed a cover. Instead of searching every time, I built this tool: enter an AppID, a link, or just the name to fetch official covers and copy in one click.'}
          </p>

          <h2>{lang === 'zh' ? '特点' : 'Features'}</h2>
          <ul>
            <li>{lang === 'zh' ? '多种封面尺寸：header、library、capsule 等' : 'Multiple sizes: header, library, capsule, and more'}</li>
            <li>{lang === 'zh' ? '按名称联想搜索，快速定位游戏' : 'Typeahead by name to find games quickly'}</li>
            <li>{lang === 'zh' ? '完全免费，开箱即用' : 'Free and ready to use'}</li>
          </ul>

          <h2>{lang === 'zh' ? '开源与反馈' : 'Open Source & Feedback'}</h2>
          <p>
            {lang === 'zh' ? '如果你有建议或想一起改进这个工具，欢迎在 GitHub 提 Issue/PR：' : 'Suggestions and contributions are welcome on GitHub:'}
            <a className="ml-2" href="https://github.com/laogou717/Steam-game-cover-gets" target="_blank" rel="noopener">GitHub</a>
          </p>
        </article>
      </div>
    </section>
  )
}