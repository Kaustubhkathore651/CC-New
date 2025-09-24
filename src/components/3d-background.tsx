import { useEffect, useRef } from 'react';

export function FloatingElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-float" 
           style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg rotate-45 animate-float" 
           style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-accent/15 to-secondary/15 rounded-full animate-float" 
           style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-primary/25 to-accent/25 rounded-lg animate-float" 
           style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-secondary/30 to-primary/30 rounded-full animate-float" 
           style={{ animationDelay: '3s' }} />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-primary/40 rounded-full blur-xl animate-pulse-slow" 
           style={{ animationDelay: '0s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-accent/40 rounded-full blur-xl animate-pulse-slow" 
           style={{ animationDelay: '2s' }} />
      <div className="absolute top-3/4 left-1/2 w-12 h-12 bg-secondary/40 rounded-full blur-xl animate-pulse-slow" 
           style={{ animationDelay: '4s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
           style={{
             backgroundImage: `
               linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
               linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }} />
    </div>
  );
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(79, 70, 229, 0.6)',  // primary
      'rgba(251, 146, 60, 0.6)', // secondary  
      'rgba(196, 181, 253, 0.6)' // accent
    ];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // Draw connections to nearby particles
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (100 - distance) / 100 * 0.2;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}