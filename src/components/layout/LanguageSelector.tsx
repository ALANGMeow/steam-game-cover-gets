'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown, Languages } from 'lucide-react'
import { useI18n } from './LanguageProvider'

const options = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
] as const

export default function LanguageSelector({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const selectedIndex = options.findIndex(option => option.value === lang)

  useEffect(() => {
    if (!open) return
    optionRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    const handleOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handleOutsidePointer)
    return () => document.removeEventListener('pointerdown', handleOutsidePointer)
  }, [open])

  function openMenu(index: number) {
    setActiveIndex(index)
    setOpen(true)
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    const nextIndex = event.key === 'ArrowDown' ? (activeIndex + 1) % options.length
      : event.key === 'ArrowUp' ? (activeIndex + options.length - 1) % options.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? options.length - 1
      : null
    if (nextIndex !== null) {
      event.preventDefault()
      setActiveIndex(nextIndex)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        aria-label={t('language')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        onClick={() => open ? setOpen(false) : openMenu(Math.max(0, selectedIndex))}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            openMenu(event.key === 'ArrowDown' ? 0 : options.length - 1)
          }
        }}
        className="inline-flex w-full min-w-[118px] items-center justify-between gap-2 rounded-xl border border-white/15 bg-bg-secondary px-3 py-2 text-sm text-text-primary transition-colors hover:border-white/25 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      >
        <Languages className="h-4 w-4 text-text-muted" aria-hidden="true" />
        <span>{options[selectedIndex]?.label || '中文'}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={`${id}-menu`}
          role="menu"
          aria-labelledby={`${id}-trigger`}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-2 min-w-full rounded-xl border border-white/15 bg-bg-secondary p-1.5 shadow-xl shadow-black/50"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={element => { optionRefs.current[index] = element }}
              type="button"
              role="menuitemradio"
              aria-checked={lang === option.value}
              tabIndex={-1}
              onFocus={() => setActiveIndex(index)}
              onClick={() => {
                setLang(option.value)
                setOpen(false)
                triggerRef.current?.focus()
              }}
              className="flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-white/10 focus:bg-emerald-500/15 focus:text-emerald-300 focus:outline-none"
            >
              {option.label}
              <span className="h-4 w-4">{lang === option.value && <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
