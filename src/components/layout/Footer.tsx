import React from 'react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-0 border-t border-white/10 bg-black/40">
      <div className="container-responsive py-6 text-sm text-text-muted flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          © {year} laogou717 · All rights reserved. Steam and the Steam logo are trademarks of Valve Corporation.
        </div>
        <div className="flex items-center gap-4">
          <a href="https://www.laogou717.com" target="_blank" rel="noopener" className="hover:text-white">Blog</a>
          <a href="https://github.com/laogou717/Steam-game-cover-gets" target="_blank" rel="noopener" className="hover:text-white">GitHub</a>
        </div>
      </div>
    </footer>
  )
}