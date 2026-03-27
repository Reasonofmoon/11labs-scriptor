'use client';

import React, { useEffect, useRef } from 'react';
import { Mode } from '@/lib/types';

interface VisualizerProps {
  isPlaying: boolean;
  mode: Mode;
  analyser?: AnalyserNode | null;
}

// Fixed heights to prevent hydration mismatch and unnecessary re-renders
const IDLE_BAR_HEIGHTS = [12, 16, 14, 20, 18, 12, 16, 14];

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

    // OPTIMIZATION: Create gradient once instead of per-bar per-frame
    // This saves ~60k object creations per second at 60fps with 1024 bins
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, secondaryColor);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 3;
      let x = 0;

      // Use the pre-created gradient for all bars
      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        // OPTIMIZATION: Stop drawing when off-screen
        // Saves ~66% of iterations (only draws visible 340/1024 bars)
        if (x > canvas.width) break;

        const barHeight = (dataArray[i] / 255) * canvas.height;
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
        {IDLE_BAR_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full ${mode === 'children_book' ? 'bg-emerald-500/30' : 'bg-amber-500/30'}`}
            style={{ height: `${height}px` }}
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
