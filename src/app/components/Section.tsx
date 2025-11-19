import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  id?: string;
  background?: 'white' | 'gray' | 'gradient' | 'orange';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Section({
  children,
  id,
  background = 'white',
  padding = 'lg',
  className = '',
}: SectionProps) {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-b from-white via-orange-50/30 to-white',
    orange: 'bg-gradient-to-br from-[#D94E33] via-[#FF6B52] to-orange-400',
  };

  const paddings = {
    sm: 'py-12 px-4 sm:px-6 lg:px-8',
    md: 'py-16 px-4 sm:px-6 lg:px-8',
    lg: 'py-20 px-4 sm:px-6 lg:px-8',
    xl: 'py-24 px-4 sm:px-6 lg:px-8',
  };

  return (
    <section
      id={id}
      className={`relative ${backgrounds[background]} ${paddings[padding]} ${className}`}
    >
      {children}
    </section>
  );
}