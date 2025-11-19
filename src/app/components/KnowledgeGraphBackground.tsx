'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  connections: number[];
}

export default function KnowledgeGraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nodes: Node[] = [];
    let mouse = { x: -1000, y: -1000, down: false };
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    const initNodes = () => {
      const count = 15;
      nodes = [];

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 2 + Math.random(),
          connections: []
        });
      }

      // Connect to nearest neighbors
      nodes.forEach((node, i) => {
        const sorted = nodes
          .map((n, idx) => ({ idx, dist: idx === i ? Infinity : Math.hypot(n.x - node.x, n.y - node.y) }))
          .sort((a, b) => a.dist - b.dist);
        node.connections = sorted.slice(0, 2).map(s => s.idx);
      });
    };

    const handleMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleDown = () => { mouse.down = true; };
    const handleUp = () => { mouse.down = false; };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(node => {
        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Mouse interaction
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const force = mouse.down ? 1 : 0.3;
          const push = ((150 - dist) / 150) * force;
          node.vx += (dx / dist) * push;
          node.vy += (dy / dist) * push;
        }

        node.vx *= 0.98;
        node.vy *= 0.98;

        // Draw connections
        node.connections.forEach(idx => {
          const target = nodes[idx];
          const d = Math.hypot(target.x - node.x, target.y - node.y);

          if (d < 350) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(217, 78, 51, ${(1 - d / 350) * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        });

        // Draw node
        const hover = dist < 80;
        ctx.beginPath();
        ctx.fillStyle = `rgba(217, 78, 51, ${hover ? 0.7 : 0.35})`;
        ctx.arc(node.x, node.y, hover ? node.radius * 1.4 : node.radius, 0, Math.PI * 2);
        ctx.fill();

        if (hover) {
          ctx.beginPath();
          ctx.fillStyle = 'rgba(217, 78, 51, 0.08)';
          ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
