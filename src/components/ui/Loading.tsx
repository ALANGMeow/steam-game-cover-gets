'use client'

import React from 'react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]} border-2 border-current border-t-transparent rounded-full
          animate-spin
        `}
        style={{
          animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
        }}
      />
    </div>
  )
}

export default Loading