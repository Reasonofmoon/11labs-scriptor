'use client';

import React, { useEffect, useRef } from 'react';
import { Mode } from '@/lib/types';

interface VisualizerProps {
  isPlaying: boolean;
  mode: Mode;
  analyser?: AnalyserNode | null;
}

// ⚡ Bolt: Pre-calculated heights for idle state to prevent Next.js hydration mismatch
// and satisfy React's strict purity rules (no Math.random() in render).
const IDLE_BAR_HEIGHTS = [12, 20, 16, 24, 14, 18, 10, 22];

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders when parent states
// (like currentPlayIndex or input text) change, but Visualizer props remain the same.
export const Visualizer: React.FC<VisualizerProps> = React.memo(({ isPlaying, mode, analyser }) => {
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

    // ⚡ Bolt: Cache linear gradients to avoid creating new objects inside the hot requestAnimationFrame loop.
    // We pre-calculate gradients for all possible byte values (0-255).
    const gradientCache: CanvasGradient[] = new Array(256);
    for (let i = 0; i < 256; i++) {
      const barHeight = (i / 255) * canvas.height;
      // Handle edge case where barHeight is 0, createLinearGradient expects y0 != y1 ideally,
      // but if 0, we just create a tiny gradient or fallback
      const h = Math.max(1, barHeight);
      const gradient = ctx.createLinearGradient(0, canvas.height - h, 0, canvas.height);
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
        // ⚡ Bolt: Early exit. If the x coordinate is past the canvas width, stop drawing to save CPU cycles.
        if (x > canvas.width) break;

        const byteValue = dataArray[i];
        const barHeight = (byteValue / 255) * canvas.height;

        // ⚡ Bolt: Use pre-calculated gradient from cache instead of creating a new one.
        ctx.fillStyle = gradientCache[byteValue];

        const centerY = canvas.height / 2;
        ctx.fillRect(x, Math.floor(centerY - barHeight / 2), Math.floor(barWidth - 2), Math.floor(barHeight));

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
            // ⚡ Bolt: Use deterministic heights instead of Math.random() to fix React purity rule and hydration mismatch
            style={{ height: `${IDLE_BAR_HEIGHTS[i]}px` }}
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
});

Visualizer.displayName = 'Visualizer';
