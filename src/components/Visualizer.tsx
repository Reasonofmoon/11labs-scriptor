'use client';

import React, { useEffect, useRef } from 'react';
import { Mode } from '@/lib/types';

// Deterministic heights for idle state to prevent hydration mismatch
const IDLE_BAR_HEIGHTS = [12, 16, 20, 14, 18, 12, 16, 20];

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

    // Pre-calculate gradients for all possible byte frequency values (0-255)
    // This avoids creating thousands of gradient objects per second in the animation loop
    const gradients = new Array(256);
    for (let i = 0; i < 256; i++) {
      const barHeight = (i / 255) * canvas.height;
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, secondaryColor);
      gradients[i] = gradient;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 3;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Optimization: Stop drawing if we're outside the visible canvas area
        if (x > canvas.width) break;

        const value = dataArray[i];
        const barHeight = (value / 255) * canvas.height;

        // Use pre-calculated gradient
        ctx.fillStyle = gradients[value];

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
