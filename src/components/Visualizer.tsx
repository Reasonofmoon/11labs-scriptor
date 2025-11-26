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
  const themeColor = mode === 'children_book' ? '#34d399' : '#fbbf24'; // emerald-400 vs amber-400

  useEffect(() => {
    if (!isPlaying || !analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = themeColor;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [isPlaying, analyser, themeColor]);

  return (
    <div className="flex items-center justify-center h-16 w-full bg-slate-900/50 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={64} 
        className="w-full h-full"
      />
    </div>
  );
};
