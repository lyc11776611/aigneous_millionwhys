'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface Volcano {
  id: number;
  x: number;
  y: number;
  life: number;
}

export default function ClickVolcanoEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [volcanoes, setVolcanoes] = useState<Volcano[]>([]);
  const nextParticleIdRef = useRef(0);
  const nextVolcanoIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const handleClick = (e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    // Create volcano at click position
    const newVolcano: Volcano = {
      id: nextVolcanoIdRef.current++,
      x,
      y,
      life: 1
    };

    setVolcanoes(prev => {
      const filtered = prev.filter(v => v.life > 0);
      if (filtered.length > 5) {
        return [...filtered.slice(-4), newVolcano];
      }
      return [...filtered, newVolcano];
    });

    // Create 3 particles with volcanic ejection pattern
    const newParticles: Particle[] = [
      {
        id: nextParticleIdRef.current++,
        x,
        y,
        vx: -15 + Math.random() * 5,
        vy: -40 - Math.random() * 10,
        life: 1,
        maxLife: 1
      },
      {
        id: nextParticleIdRef.current++,
        x,
        y,
        vx: -5 + Math.random() * 10,
        vy: -50 - Math.random() * 10,
        life: 1,
        maxLife: 1
      },
      {
        id: nextParticleIdRef.current++,
        x,
        y,
        vx: 10 + Math.random() * 5,
        vy: -45 - Math.random() * 10,
        life: 1,
        maxLife: 1
      }
    ];

    setParticles(prev => {
      // Limit total particles to prevent performance issues
      const filtered = prev.filter(p => p.life > 0);
      if (filtered.length > 30) {
        return [...filtered.slice(-27), ...newParticles];
      }
      return [...filtered, ...newParticles];
    });
  };

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (particles.length === 0 && volcanoes.length === 0) return;

    const animate = () => {
      setParticles(prev => {
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * 0.016,
            y: p.y + p.vy * 0.016,
            vy: p.vy + 120 * 0.016, // gravity
            vx: p.vx * 0.99, // friction
            life: p.life - 0.016 / 1.2 // fade over 1.2 seconds
          }))
          .filter(p => p.life > 0);
      });

      setVolcanoes(prev => {
        return prev
          .map(v => ({
            ...v,
            life: v.life - 0.016 / 1.5 // fade over 1.5 seconds
          }))
          .filter(v => v.life > 0);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length > 0 || volcanoes.length > 0]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Static volcano base - always visible at click positions */}
      {volcanoes.map(v => (
        <div
          key={v.id}
          className="absolute"
          style={{
            left: `${v.x}px`,
            top: `${v.y}px`,
            transform: 'translate(-50%, -40%)',
            opacity: v.life,
            width: '60px',
            height: '60px'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 235.3 235.3"
            style={{
              width: '100%',
              height: '100%',
              filter: `drop-shadow(0 0 ${8 * v.life}px rgba(217, 78, 51, ${v.life * 0.6}))`
            }}
          >
            <defs>
              <linearGradient
                id={`linear-gradient-volcano-${v.id}`}
                x1="117.5"
                y1="48.6"
                x2="117.5"
                y2="116.5"
                gradientTransform="translate(0 247.2) scale(1 -1)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#D94E33" />
                <stop offset=".4" stopColor="#ff4b3b" />
                <stop offset="1" stopColor="#FF6B52" />
              </linearGradient>
            </defs>

            <g>
              <g>
                <g>
                  {/* Main structure - volcano outline */}
                  <path
                    d="M199.7,205.9h17.1l-77.9-104.5h-7.1l-11.1,16.5h-6.1l-11.1-16.5h-7.1L18.5,205.9h17.1M35.7,205.9l55.9-73.3M145.9,133.7l53.8,72.2"
                    fill="none"
                    stroke="#222323"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Side paths - smoke/steam lines */}
                  <path
                    d="M107.9,98.7c-4.5-13.6-16.2-25.3-30.8-26.6-2.6-.3-2.2-4.2.4-4,15.3,2.7,26.9,15.8,30.3,30.6h.1Z"
                    fill="#222323"
                  />
                  <path
                    d="M117.7,104.1l-2-44c0-1.1.8-2,1.9-2.1,1.2,0,2.1.9,2.1,2.1l-2,44h0Z"
                    fill="#222323"
                  />
                  <path
                    d="M127.6,98.7c3.4-14.7,14.9-27.7,30.2-30.5,2.7-.4,3.3,3.6.6,4-14.6,1.3-26.3,13-30.8,26.6h0Z"
                    fill="#222323"
                  />

                  {/* Triangle - lava/magma fill */}
                  <path
                    d="M66.9,198.6l50.7-67.9,50.7,67.9h-101.5.1Z"
                    fill={`url(#linear-gradient-volcano-${v.id})`}
                    stroke="#000"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>
      ))}

      {/* Dynamic particles - animated yellow balls */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: '12px',
            height: '12px',
            transform: 'translate(-50%, -50%)',
            background: '#ffb939',
            border: '2px solid #000',
            opacity: p.life,
            boxShadow: `0 0 ${8 * p.life}px rgba(255, 185, 57, ${p.life * 0.8})`
          }}
        />
      ))}
    </div>
  );
}
