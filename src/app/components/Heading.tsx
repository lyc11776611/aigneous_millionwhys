import React, { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'default' | 'gradient' | 'brand';
  align?: 'left' | 'center' | 'right';
  subtitle?: string;
  className?: string;
}

export default function Heading({
  children,
  level = 2,
  variant = 'default',
  align = 'left',
  subtitle,
  className = '',
}: HeadingProps) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

  const sizes = {
    1: 'text-5xl sm:text-6xl lg:text-7xl',
    2: 'text-3xl sm:text-4xl lg:text-5xl',
    3: 'text-2xl sm:text-3xl lg:text-4xl',
    4: 'text-xl sm:text-2xl lg:text-3xl',
    5: 'text-lg sm:text-xl lg:text-2xl',
    6: 'text-base sm:text-lg lg:text-xl',
  };

  const variants = {
    default: 'text-gray-900',
    gradient: 'bg-gradient-to-r from-[#D94E33] to-[#FF6B52] bg-clip-text text-transparent',
    brand: 'text-[#D94E33]',
  };

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`${alignments[align]} ${className}`}>
      <Tag className={`font-bold tracking-tight ${sizes[level]} ${variants[variant]} mb-4`}>
        {children}
      </Tag>
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}