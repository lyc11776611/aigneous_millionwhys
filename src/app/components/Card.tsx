import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'gradient' | 'glass' | 'hover';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variants = {
    default: 'bg-white border border-gray-200',
    gradient: 'relative p-[2px] bg-gradient-to-br from-[#D94E33]/40 via-[#FF6B52]/30 to-orange-300/20',
    glass: 'backdrop-blur-lg bg-white/70 border border-orange-100/50',
    hover: 'bg-white border border-gray-200 hover:border-[#D94E33]/50 hover:shadow-xl hover:shadow-orange-200/30 transform hover:scale-105',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const interactiveStyles = onClick ? 'cursor-pointer' : '';

  if (variant === 'gradient') {
    return (
      <div
        className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
        onClick={onClick}
      >
        <div className={`bg-white rounded-[14px] h-full ${paddings[padding]}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${interactiveStyles}
        ${className}
      `.trim()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}