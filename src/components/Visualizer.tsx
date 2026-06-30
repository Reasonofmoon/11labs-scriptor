'use client';

import React, { useEffect, useRef } from 'react';
import { Mode } from '@/lib/types';

interface VisualizerProps {
  isPlaying: boolean;
  mode: Mode;
  analyser?: AnalyserNode | null;
}

const IDLE_HEIGHTS = [12, 20, 15, 22, 10, 18, 14, 24];

export const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, mode, analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const primaryColor = mode === 'children_book' ? '#34d399' : '#fbbf24';
  const secondaryColor = mode === 'children_book' ? '#14b8a6' : '#f59e0b';

  useEffect(() => {
    if (!isPlaying || !analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    // ⚡ Bolt Optimization: Pre-calculate all 256 possible CanvasGradients
    // Web Audio API populates Uint8Array with integer values from 0-255.
    // Caching gradients avoids allocating thousands of objects per second and reduces GC pressure.
    const gradientCache: CanvasGradient[] = new Array(256);
    for (let i = 0; i < 256; i++) {
      const barHeight = (i / 255) * canvas.height;
      const safeHeight = Math.max(1, barHeight); // Prevent non-finite coordinates
      const gradient = ctx.createLinearGradient(0, canvas.height - safeHeight, 0, canvas.height);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, secondaryColor);
      gradientCache[i] = gradient;
    }

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 3;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        if (x > canvas.width) break; // ⚡ Bolt Optimization: Short-circuit off-screen bars

        const value = dataArray[i];
        const barHeight = (value / 255) * canvas.height;

        ctx.fillStyle = gradientCache[value];

        const centerY = canvas.height / 2;
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [isPlaying, analyser, primaryColor, secondaryColor]);

  if (!isPlaying) {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full ${mode === 'children_book' ? 'bg-emerald-500/30' : 'bg-amber-500/30'}`}
            style={{ height: `${IDLE_HEIGHTS[i]}px` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className={`absolute inset-0 ${mode === 'children_book' ? 'bg-emerald-500/10' : 'bg-amber-500/10'} rounded-xl blur-xl group-hover:blur-2xl transition-all`} />
      <div className="relative flex items-center justify-center h-20 w-full sm:w-64 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
