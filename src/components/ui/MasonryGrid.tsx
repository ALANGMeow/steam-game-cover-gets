'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MasonryGridProps {
  children: React.ReactNode[]
  gap?: number
  minColumnWidth?: number
  className?: string
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  children, 
  gap = 24, 
  minColumnWidth = 280, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  // removed unused state 'columns'
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const parentElement = container.parentElement as HTMLElement
      if (!parentElement) return
      
      // 使用父容器的内容宽度（clientWidth - padding），避免含内边距导致的列数误差
      const computed = window.getComputedStyle(parentElement)
      const paddingLeft = parseFloat(computed.paddingLeft) || 0
      const paddingRight = parseFloat(computed.paddingRight) || 0
      const availableWidth = parentElement.clientWidth - paddingLeft - paddingRight
      
      // 计算列数（不超过子元素数量，避免出现空列导致视觉不居中）
      const maxColumnsByWidth = Math.max(1, Math.floor((availableWidth + gap) / (minColumnWidth + gap)))
      const effectiveColumns = Math.max(1, Math.min(maxColumnsByWidth, children.length))
      
      // 计算实际容器宽度（居中显示）
      const actualWidth = effectiveColumns * minColumnWidth + (effectiveColumns - 1) * gap
      
      setContainerWidth(Math.min(actualWidth, availableWidth))
      
      // 清除之前的样式
      const items = container.querySelectorAll('.masonry-item')
      items.forEach(item => {
        const element = item as HTMLElement
        element.style.position = 'absolute'
        element.style.width = `${minColumnWidth}px`
        element.style.left = '0'
        element.style.top = '0'
      })
      
      // 计算每列的高度
      const columnHeights = new Array(effectiveColumns).fill(0)
      
      items.forEach((item) => {
        const element = item as HTMLElement
        
        // 找到最短的列
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
        
        // 计算位置
        const left = shortestColumnIndex * (minColumnWidth + gap)
        const top = columnHeights[shortestColumnIndex]
        
        // 设置位置
        element.style.left = `${left}px`
        element.style.top = `${top}px`
        
        // 获取元素高度，如果为0则使用默认高度
        let elementHeight = element.offsetHeight
        if (elementHeight === 0) {
          // 强制重新计算布局
          element.style.visibility = 'hidden'
          element.style.position = 'static'
          elementHeight = element.offsetHeight
          element.style.visibility = 'visible'
          element.style.position = 'absolute'
        }
        
        // 更新列高度
        columnHeights[shortestColumnIndex] += elementHeight + gap
      })
      
      // 设置容器高度
      const maxHeight = Math.max(...columnHeights) - gap
      container.style.height = `${maxHeight}px`
    }

    // 初始布局
    const timer = setTimeout(updateLayout, 100)
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateLayout)
    
    // 监听图片加载完成
    const images = containerRef.current?.querySelectorAll('img')
    images?.forEach(img => {
      if (img.complete) {
        updateLayout()
      } else {
        img.addEventListener('load', updateLayout)
      }
    })
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateLayout)
      images?.forEach(img => {
        img.removeEventListener('load', updateLayout)
      })
    }
  }, [children, gap, minColumnWidth])

  return (
    <div className={`w-full ${className}`}>
      <div 
        ref={containerRef}
        className="relative mx-auto"
        style={{ width: containerWidth ? `${containerWidth}px` : '100%', position: 'relative', paddingBottom: gap }}
      >
        {children.map((child, index) => (
          <div key={index} className="masonry-item">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MasonryGrid