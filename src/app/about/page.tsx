'use client'

import React from 'react'
import { useI18n } from '@/components/layout/LanguageProvider'
import { REPOSITORY_URL, SITE_MAINTAINER, UPSTREAM_REPOSITORY_URL } from '@/lib/site'

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

        <article className="text-sm md:text-base leading-relaxed text-text-secondary [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_a]:text-emerald-400 [&_a]:underline [&_a]:underline-offset-4">
          <p>
            {lang === 'zh'
              ? 'Steam 封面获取器支持通过 AppID、Steam 商店链接或游戏名称查找游戏图片, 提供封面预览、图片链接复制和 ZIP 打包下载. 图片直接来自 Steam CDN, 支持当前资源路径与旧地址回退.'
              : 'Steam Cover helps find game artwork by AppID, Steam store link, or game name. It provides previews, link copying, and ZIP downloads using images from the Steam CDN, with support for current asset paths and legacy fallbacks.'}
          </p>

          <h2>{lang === 'zh' ? '特点' : 'Features'}</h2>
          <ul>
            <li>{lang === 'zh' ? '多种封面尺寸：header、library、capsule 等' : 'Multiple sizes: header, library, capsule, and more'}</li>
            <li>{lang === 'zh' ? '按名称联想搜索，快速定位游戏' : 'Typeahead by name to find games quickly'}</li>
            <li>{lang === 'zh' ? '支持高清资源与透明 Logo, 一键打包下载' : 'High-resolution artwork and transparent logos with ZIP downloads'}</li>
            <li>{lang === 'zh' ? '完全免费，开箱即用' : 'Free and ready to use'}</li>
          </ul>

          <h2>{lang === 'zh' ? '项目来源与维护' : 'Project Origin & Maintenance'}</h2>
          <p>
            {lang === 'zh' ? '本项目基于 laogou717 的 ' : 'This project is based on '}
            <a href={UPSTREAM_REPOSITORY_URL} target="_blank" rel="noopener">Steam-game-cover-gets</a>
            {lang === 'zh'
              ? ` 修改和维护, 原作版权归原作者所有. 本版本由 ${SITE_MAINTAINER} 维护, 改进了新资源路径解析、Logo 获取和下载兼容性.`
              : ` by laogou717. Copyright in the original work remains with its author. This version is maintained by ${SITE_MAINTAINER}, with improvements to asset URL resolution, logo retrieval, and download compatibility.`}
          </p>
          <p>
            {lang === 'zh'
              ? '原项目 README 声明采用 MIT 许可证, 许可说明与致谢见本仓库 README.'
              : 'The upstream README declares the MIT license. See this repository\'s README for licensing information and acknowledgements.'}
          </p>
          <h2>{lang === 'zh' ? '反馈与贡献' : 'Feedback & Contributions'}</h2>
          <p>
            {lang === 'zh' ? '如果你有建议或想一起改进这个工具，欢迎在 GitHub 提 Issue/PR：' : 'Suggestions and contributions are welcome on GitHub:'}
            <a className="ml-2" href={REPOSITORY_URL} target="_blank" rel="noopener">GitHub</a>
          </p>
          <p className="text-sm text-text-muted">
            {lang === 'zh'
              ? '本站是独立维护的第三方工具, 与 Valve 或游戏发行商无隶属或背书关系. 游戏图片及商标归各自权利人所有.'
              : 'This is an independently maintained third-party tool, not affiliated with or endorsed by Valve or game publishers. Game artwork and trademarks belong to their respective owners.'}
          </p>
        </article>
      </div>
    </section>
  )
}
