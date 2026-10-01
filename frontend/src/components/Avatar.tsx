'use client';

import React, { useEffect, useRef } from 'react';

interface AvatarProps {
  speaking?: boolean;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ speaking = false, size = 260 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // Rotate angle increment speed varies if speaking
      const speed = speaking ? 0.05 : 0.008;
      angle += speed;

      // Ring 1 (Cyan)
      ctx.save();
      ctx.rotate(angle);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.38, size * 0.13, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(size * 0.38 * Math.cos(angle * 2), size * 0.13 * Math.sin(angle * 2), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ring 2 (Purple)
      ctx.save();
      ctx.rotate(angle + Math.PI / 3);
      ctx.strokeStyle = 'rgba(189, 0, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.38, size * 0.13, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#bd00ff';
      ctx.beginPath();
      ctx.arc(size * 0.38 * Math.cos(angle * 1.5), size * 0.13 * Math.sin(angle * 1.5), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ring 3 (Faded Cyan)
      ctx.save();
      ctx.rotate(angle + (2 * Math.PI) / 3);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.38, size * 0.13, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      canvas.width = size;
      canvas.height = size;
    };
    handleResize();

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speaking, size]);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      {/* Central Pulsing Sphere */}
      <div 
        className="w-20 h-20 rounded-full bg-gradient-to-br from-white via-[#00f0ff] to-[#bd00ff] z-10 transition-all duration-300"
        style={{
          boxShadow: speaking 
            ? '0 0 50px rgba(0, 240, 255, 0.8), 0 0 20px rgba(189, 0, 255, 0.5)' 
            : '0 0 35px rgba(0, 240, 255, 0.4)',
          transform: speaking ? 'scale(1.05)' : 'scale(1)',
          animation: 'pulse 2s infinite ease-in-out'
        }}
      />
    </div>
  );
};
