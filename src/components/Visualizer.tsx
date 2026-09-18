'use client';

import React, { useEffect, useRef } from 'react';
import { Mode } from '@/lib/types';

interface VisualizerProps {
  isPlaying: boolean;
  mode: Mode;
  analyser?: AnalyserNode | null;
}

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

    // ⚡ Bolt Optimization: Pre-calculate the 256 possible gradient states.
    // Web Audio API frequency data is bounded Uint8Array (0-255).
    // This avoids creating thousands of CanvasGradient objects per second in the loop,
    // significantly reducing Garbage Collection pressure.
    const gradients = new Array<CanvasGradient>(256);
    for (let i = 0; i < 256; i++) {
      const barHeight = (i / 255) * canvas.height;
      // Handle edge cases where bar height could be zero to avoid non-finite gradient coordinates
      const height = Math.max(1, barHeight);
      const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, secondaryColor);
      gradients[i] = gradient;
    }

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 3;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // ⚡ Bolt Optimization: Break early if rendering off-screen
        if (x > canvas.width) break;

        const barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = gradients[dataArray[i]];

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

  // ⚡ Bolt Fix: Use deterministic mock heights for idle visualizer to prevent Next.js hydration mismatches
  const IDLE_BARS = [0.2, 0.5, 0.8, 0.3, 0.9, 0.4, 0.6, 0.7];

  if (!isPlaying) {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
        {IDLE_BARS.map((val, i) => (
          <div
            key={i}
            className={`w-1 rounded-full ${mode === 'children_book' ? 'bg-emerald-500/30' : 'bg-amber-500/30'}`}
            style={{ height: `${8 + val * 16}px` }}
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
