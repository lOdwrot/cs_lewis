import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  twinkleSpeed: number;
}

interface ClickParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  life: number;
  maxLife: number;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const clickParticlesRef = useRef<ClickParticle[]>([]);
  const animFrameRef = useRef<number>();

  const initStars = useCallback((width: number, height: number) => {
    const count = Math.floor((width * height) / 6000);
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.35 + 0.05,
      targetOpacity: Math.random() * 0.35 + 0.05,
      twinkleSpeed: Math.random() * 0.006 + 0.002,
    }));
  }, []);

  const spawnClickParticles = useCallback((x: number, y: number) => {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = Math.random() * 4 + 1.2;
      const size = Math.random() * 3.5 + 0.8;
      clickParticlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 1,
        size,
        life: 0,
        maxLife: 50 + Math.random() * 50,
      });
    }
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      spawnClickParticles(e.clientX, e.clientY);
    },
    [spawnClickParticles],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("click", handleClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background twinkling stars
      for (const star of starsRef.current) {
        if (Math.abs(star.opacity - star.targetOpacity) < 0.008) {
          star.targetOpacity = Math.random() * 0.45 + 0.04;
        }
        star.opacity += (star.targetOpacity - star.opacity) * star.twinkleSpeed;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${star.opacity})`;
        ctx.fill();

        // Soft glow for slightly larger stars
        if (star.size > 1.0 && star.opacity > 0.25) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 2.5,
          );
          gradient.addColorStop(0, `rgba(212, 175, 55, ${star.opacity * 0.3})`);
          gradient.addColorStop(1, "rgba(212, 175, 55, 0)");
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      // Click dust particles
      clickParticlesRef.current = clickParticlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gentle gravity
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.opacity = Math.pow(1 - p.life / p.maxLife, 1.5);

        const radius = p.size * (1 - (p.life / p.maxLife) * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(radius, 0.1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.fill();

        return p.life < p.maxLife;
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleClick);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initStars, handleClick]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
