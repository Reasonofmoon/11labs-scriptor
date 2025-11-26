'use client';

import React, { useEffect, useRef } from 'react';
import { ScriptItem, Mode } from '@/lib/types';
import { motion } from 'framer-motion';

interface ScriptDisplayProps {
  items: ScriptItem[];
  currentIndex: number;
  mode: Mode;
}

export const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ items, currentIndex, mode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (currentIndex >= 0 && itemRefs.current[currentIndex]) {
      itemRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentIndex]);

  const themeColor = mode === 'children_book' ? 'text-emerald-400' : 'text-amber-400';
  const borderColor = mode === 'children_book' ? 'border-emerald-500/30' : 'border-amber-500/30';

  return (
    <div 
      ref={scrollRef}
      className="w-full h-[500px] overflow-y-auto p-6 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4 scrollbar-thin scrollbar-thumb-slate-600"
    >
      {items.map((item, index) => {
        const isActive = index === currentIndex;
        const isSfx = item.type === 'sfx';

        return (
          <motion.div
            key={index}
            ref={el => { itemRefs.current[index] = el; }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border transition-all duration-300 ${
              isActive 
                ? `bg-slate-800 ${borderColor} shadow-lg scale-[1.02]` 
                : 'bg-transparent border-transparent opacity-60 hover:opacity-80'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl select-none">
                {isSfx ? '🔊' : '🗣️'}
              </span>
              <div className="flex-1">
                <div className={`text-xs font-bold mb-1 uppercase tracking-wider ${isSfx ? 'text-pink-400' : themeColor}`}>
                  {isSfx ? 'Sound Effect' : 'Narrator'}
                </div>
                <div className={`text-lg leading-relaxed ${isSfx ? 'text-slate-400 italic' : 'text-slate-200'}`}>
                  {isSfx ? `[SFX: ${item.content}]` : item.content}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
