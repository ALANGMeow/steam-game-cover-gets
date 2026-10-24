'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'default' | 'glass' | 'liquid'
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = true, onClick, variant = 'default' }) => {
  if (variant === 'liquid') {
    return (
      <div
        className={cn(
          'liquidGlass-wrapper',
          className
        )}
        onClick={onClick}
      >
        <div className="liquidGlass-effect"></div>
        <div className="liquidGlass-tint"></div>
        <div className="liquidGlass-shine"></div>
        <div className="liquidGlass-text w-full">
          {children}
        </div>
      </div>
    )
  }

  if (variant === 'glass') {
    return (
      <div
        className={cn(
          'glass-card',
          className
        )}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={`
        relative p-3 pb-5 rounded-2xl
        bg-white/5 border border-white/10
        shadow-xl shadow-black/30
        transition-all duration-500 ease-out-quart
        ${hover ? 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* 胶片效果 */}
      <div className="absolute left-3 right-3 top-2 h-3 bg-gradient-to-r from-transparent via-black/75 to-transparent opacity-60"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.75), rgba(0,0,0,0.75) 6px, transparent 6px, transparent 14px)'
        }} />
      <div className="absolute left-3 right-3 bottom-11 h-3 bg-gradient-to-r from-transparent via-black/75 to-transparent opacity-60"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.75), rgba(0,0,0,0.75) 6px, transparent 6px, transparent 14px)'
        }} />

      {children}
    </div>
  )
}

export default Card