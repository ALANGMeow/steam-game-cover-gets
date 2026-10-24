'use client'

import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'>

interface ButtonProps extends MotionButtonProps {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, loading, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 ease-out-quart focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-lg shadow-emerald-600/35 hover:shadow-emerald-500/45',
      ghost: 'bg-transparent text-text-primary border border-white/16 hover:bg-white/5 hover:border-white/25',
      outline: 'bg-glass border border-white/14 text-text-primary hover:bg-glass-strong hover:border-white/25'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-3.5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button