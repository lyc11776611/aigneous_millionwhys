'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface InfiniteCarouselProps {
  items: string[];
  direction: 'left' | 'right';
  speed?: number;
  className?: string;
  onItemClick?: (item: string) => void;
  icon?: string;
}

// Pre-calculate item width constant
const ITEM_WIDTH = 296; // 280px + 16px margin

export default function InfiniteCarousel({
  items,
  direction,
  speed = 50, // pixels per second
  className = '',
  onItemClick,
  icon = '❓'
}: InfiniteCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const positionRef = useRef(0);
  const currentIndexRef = useRef(0);

  // Pre-render all items to avoid state updates during animation
  const [allItems] = useState(() => {
    if (items.length === 0) return [];
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const itemsNeeded = Math.ceil(screenWidth / ITEM_WIDTH) + 20; // Large buffer
    const result = [];
    for (let i = 0; i < itemsNeeded; i++) {
      result.push(items[i % items.length]);
    }
    return result;
  });

  useEffect(() => {
    if (!scrollRef.current) return;
    if (items.length === 0) return; // Exit if no items

    // Calculate animation parameters
    const singleSetWidth = items.length * ITEM_WIDTH;
    const duration = singleSetWidth / speed;

    // Create unique class name to avoid conflicts
    const animationId = `carousel-${direction}-${Date.now()}`;

    // Create inline style for animation
    const style = document.createElement('style');

    // For seamless loop:
    // Left: moves from 0 to -33.33% (one set width)
    // Right: moves from -66.66% to -33.33% (appears to go right)
    style.textContent = `
      @keyframes ${animationId} {
        from {
          transform: translate3d(${direction === 'left' ? '0' : `-${singleSetWidth * 2}px`}, 0, 0);
        }
        to {
          transform: translate3d(${direction === 'left' ? `-${singleSetWidth}px` : `-${singleSetWidth}px`}, 0, 0);
        }
      }
      .${animationId} {
        animation: ${animationId} ${duration}s linear infinite;
        will-change: transform;
        transform: translateZ(0);
      }
    `;
    document.head.appendChild(style);

    // Apply animation class
    scrollRef.current.classList.add(animationId);

    return () => {
      // Cleanup
      if (scrollRef.current) {
        scrollRef.current.classList.remove(animationId);
      }
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, [items, direction, speed]);

  // Pause on hover using CSS
  const handleMouseEnter = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.style.animationPlayState = 'paused';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.style.animationPlayState = 'running';
    }
  }, []);

  // Render duplicated items for seamless loop
  const renderItems = useMemo(() => {
    // Ensure we always have items to render
    const itemsToUse = items.length > 0 ? items : ['Loading...'];
    // Duplicate items 3 times for perfect seamless loop
    return [...itemsToUse, ...itemsToUse, ...itemsToUse];
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollRef}
        className="flex"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transform: 'translateZ(0)' // Force GPU layer
        }}
      >
        {renderItems.map((item, index) => (
          <button
            key={`carousel-item-${index}`}
            className="flex-shrink-0 mx-2 p-[2px] rounded-2xl bg-gradient-to-br from-[#D94E33]/40 via-[#FF6B52]/30 to-orange-300/20 hover:from-[#D94E33]/60 hover:via-[#FF6B52]/50 hover:to-orange-300/40 transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-orange-200/50 hover:z-10"
            onClick={() => onItemClick && onItemClick(item)}
            style={{
              minWidth: '280px',
              flexShrink: 0,
              transform: 'translateZ(0)' // Force GPU layer for each item
            }}
          >
            <div className="relative bg-white rounded-[14px] px-5 py-3 flex items-center space-x-3 backdrop-blur-sm">
              <div className="text-xl flex-shrink-0">{icon}</div>
              <p className="text-sm text-left text-gray-700 hover:text-gray-900 font-medium">
                {item}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}