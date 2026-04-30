import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  twinkleSpeed: number;
  type: "dot" | "sparkle";
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
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const clickParticlesRef = useRef<ClickParticle[]>([]);
  const animFrameStarsRef = useRef<number>(0);
  const animFrameDustRef = useRef<number>(0);
  const scrollYRef = useRef<number>(0);

  const makeRandomStar = useCallback((width: number, height: number): Star => {
    const isSparkle = Math.random() < 0.18;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: isSparkle ? Math.random() * 3.5 + 2.5 : Math.random() * 1.5 + 0.5,
      opacity: 0,
      targetOpacity: isSparkle
        ? Math.random() * 0.5 + 0.4
        : Math.random() * 0.4 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.015,
      type: isSparkle ? "sparkle" : "dot",
    };
  }, []);

  const initStars = useCallback(
    (width: number, height: number) => {
      const count = Math.floor((width * height) / 25000);
      starsRef.current = Array.from({ length: count }, () =>
        makeRandomStar(width, height),
      );
    },
    [makeRandomStar],
  );

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
    const starCanvas = starCanvasRef.current;
    const dustCanvas = dustCanvasRef.current;
    if (!starCanvas || !dustCanvas) return;
    const starCtx = starCanvas.getContext("2d");
    const dustCtx = dustCanvas.getContext("2d");
    if (!starCtx || !dustCtx) return;

    const resize = () => {
      starCanvas.width = window.innerWidth;
      starCanvas.height = window.innerHeight;
      dustCanvas.width = window.innerWidth;
      dustCanvas.height = window.innerHeight;
      initStars(starCanvas.width, starCanvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("click", handleClick);

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const drawStars = () => {
      starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      const parallaxOffset = scrollYRef.current * 0.8;

      for (const star of starsRef.current) {
        // When star fully fades out, relocate it to a new random position
        if (star.targetOpacity === 0 && star.opacity < 0.005) {
          const next = makeRandomStar(starCanvas.width, starCanvas.height);
          Object.assign(star, next);
        } else if (Math.abs(star.opacity - star.targetOpacity) < 0.02) {
          // Occasionally send star to fade out entirely, then it relocates
          star.targetOpacity =
            Math.random() < 0.15
              ? 0
              : star.type === "sparkle"
                ? Math.random() * 0.5 + 0.4
                : Math.random() * 0.4 + 0.2;
        }

        star.opacity += (star.targetOpacity - star.opacity) * star.twinkleSpeed;

        const x = star.x;
        const y = (star.y - parallaxOffset) % starCanvas.height;
        const drawY = y < 0 ? y + starCanvas.height : y;
        const { size, opacity } = star;
        const gold = `rgba(212, 175, 55, ${opacity})`;

        if (star.type === "sparkle") {
          // Soft radial glow
          const glowR = size * 5;
          const glow = starCtx.createRadialGradient(
            x,
            drawY,
            0,
            x,
            drawY,
            glowR,
          );
          glow.addColorStop(0, `rgba(212, 175, 55, ${opacity * 0.55})`);
          glow.addColorStop(1, "rgba(212, 175, 55, 0)");
          starCtx.beginPath();
          starCtx.arc(x, drawY, glowR, 0, Math.PI * 2);
          starCtx.fillStyle = glow;
          starCtx.fill();

          // Bright core dot
          starCtx.beginPath();
          starCtx.arc(x, drawY, size * 0.55, 0, Math.PI * 2);
          starCtx.fillStyle = `rgba(255, 240, 180, ${opacity})`;
          starCtx.fill();

          // 4-pointed spikes
          const spikeLen = size * 7;
          const spikeWidth = size * 0.35;
          starCtx.save();
          for (let s = 0; s < 4; s++) {
            starCtx.save();
            starCtx.translate(x, drawY);
            starCtx.rotate((Math.PI / 2) * s);
            const spikeGrad = starCtx.createLinearGradient(0, 0, spikeLen, 0);
            spikeGrad.addColorStop(0, `rgba(255, 240, 180, ${opacity})`);
            spikeGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
            starCtx.beginPath();
            starCtx.moveTo(0, -spikeWidth);
            starCtx.quadraticCurveTo(
              spikeLen * 0.3,
              -spikeWidth * 0.3,
              spikeLen,
              0,
            );
            starCtx.quadraticCurveTo(
              spikeLen * 0.3,
              spikeWidth * 0.3,
              0,
              spikeWidth,
            );
            starCtx.closePath();
            starCtx.fillStyle = spikeGrad;
            starCtx.fill();
            starCtx.restore();
          }
          starCtx.restore();
        } else {
          // Small plain dot with subtle glow
          starCtx.beginPath();
          starCtx.arc(x, drawY, size, 0, Math.PI * 2);
          starCtx.fillStyle = gold;
          starCtx.fill();

          if (opacity > 0.3) {
            const glowR = size * 3;
            const glow = starCtx.createRadialGradient(
              x,
              drawY,
              0,
              x,
              drawY,
              glowR,
            );
            glow.addColorStop(0, `rgba(212, 175, 55, ${opacity * 0.35})`);
            glow.addColorStop(1, "rgba(212, 175, 55, 0)");
            starCtx.beginPath();
            starCtx.arc(x, drawY, glowR, 0, Math.PI * 2);
            starCtx.fillStyle = glow;
            starCtx.fill();
          }
        }
      }

      animFrameStarsRef.current = requestAnimationFrame(drawStars);
    };

    const drawDust = () => {
      dustCtx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);

      clickParticlesRef.current = clickParticlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.opacity = Math.pow(1 - p.life / p.maxLife, 1.5);

        const radius = p.size * (1 - (p.life / p.maxLife) * 0.4);

        dustCtx.beginPath();
        dustCtx.arc(p.x, p.y, Math.max(radius, 0.1), 0, Math.PI * 2);
        dustCtx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        dustCtx.fill();

        return p.life < p.maxLife;
      });

      animFrameDustRef.current = requestAnimationFrame(drawDust);
    };

    drawStars();
    drawDust();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      if (animFrameStarsRef.current)
        cancelAnimationFrame(animFrameStarsRef.current);
      if (animFrameDustRef.current)
        cancelAnimationFrame(animFrameDustRef.current);
    };
  }, [initStars, makeRandomStar, handleClick]);

  const canvasBase: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  };

  return (
    <>
      {/* Stars behind everything */}
      <canvas
        ref={starCanvasRef}
        style={{ ...canvasBase, zIndex: 1 }}
        aria-hidden="true"
      />
      {/* Click dust on top of everything */}
      <canvas
        ref={dustCanvasRef}
        style={{ ...canvasBase, zIndex: 9999 }}
        aria-hidden="true"
      />
    </>
  );
}
