"use client";

import React, { useEffect, useRef } from 'react';

interface AntigravityProps {
  gridSize?: number;
  particleSize?: number;
  particleColor?: string;
  magnetRadius?: number;
  fieldStrength?: number;
}

export function Antigravity({
  gridSize = 26,
  particleSize = 1.5,
  particleColor = '#00a844',
  magnetRadius = 65,
  fieldStrength = 1.0,
}: AntigravityProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Resolve CSS variable if passed
    let resolvedColor = particleColor;
    if (resolvedColor.startsWith('var(')) {
      const varName = resolvedColor.slice(4, -1).trim();
      resolvedColor = typeof window !== 'undefined'
        ? getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#00a844'
        : '#00a844';
    }

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      alpha: number;
      targetAlpha: number;
      chaosFactor: number;
      noiseOffset: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = particleSize * (0.8 + Math.random() * 0.4);
        // Subtle base alpha for grid dots
        this.alpha = 0.12 + Math.random() * 0.08;
        this.targetAlpha = this.alpha;
        this.chaosFactor = 0.6 + Math.random() * 0.9;
        this.noiseOffset = Math.random() * 100;
      }

      update() {
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < magnetRadius) {
          // Push particles away (magnetic repulsion)
          const force = (magnetRadius - distance) / magnetRadius;
          const angle = Math.atan2(dy, dx);
          
          // Evolve noise
          this.noiseOffset += 0.04;
          
          // Deflect particles with random variations and angular noise
          const chaoticAngle = angle + Math.sin(this.noiseOffset) * 0.35;
          const pushX = Math.cos(chaoticAngle) * force * fieldStrength * 20 * this.chaosFactor;
          const pushY = Math.sin(chaoticAngle) * force * fieldStrength * 20 * this.chaosFactor;

          // Swirl effect (tangential force) to break circle structure
          const swirlSpeed = 10 * this.chaosFactor;
          const swirlX = -Math.sin(angle) * force * fieldStrength * swirlSpeed;
          const swirlY = Math.cos(angle) * force * fieldStrength * swirlSpeed;

          this.x -= (pushX + swirlX);
          this.y -= (pushY + swirlY);
          
          // Increase opacity on interaction
          this.targetAlpha = 0.75;
        } else {
          // Smooth return to base grid position
          this.x += (this.baseX - this.x) * 0.08;
          this.y += (this.baseY - this.y) * 0.08;
          
          // Mute back to base alpha
          this.targetAlpha = 0.15;
        }

        // Lerp alpha for smooth fading
        this.alpha += (this.targetAlpha - this.alpha) * 0.1;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = resolvedColor;
        c.globalAlpha = this.alpha;
        
        // Add a glow effect when interacted with
        if (this.alpha > 0.3) {
          c.shadowBlur = 6;
          c.shadowColor = resolvedColor;
        }
        
        c.fill();
        c.restore();
      }
    }

    let particles: Particle[] = [];

    const initGrid = () => {
      particles = [];
      // Calculate offset to center grid dots nicely
      const xOffset = (width % gridSize) / 2;
      const yOffset = (height % gridSize) / 2;

      for (let x = xOffset; x < width; x += gridSize) {
        for (let y = yOffset; y < height; y += gridSize) {
          particles.push(new Particle(x, y));
        }
      }
    };

    initGrid();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initGrid();
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const eventTarget = canvas.parentElement?.parentElement || canvas.parentElement;
    if (eventTarget) {
      eventTarget.addEventListener('mousemove', handleMouseMove);
      eventTarget.addEventListener('mouseleave', handleMouseLeave);
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (eventTarget) {
        eventTarget.removeEventListener('mousemove', handleMouseMove);
        eventTarget.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridSize, particleSize, particleColor, magnetRadius, fieldStrength]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
