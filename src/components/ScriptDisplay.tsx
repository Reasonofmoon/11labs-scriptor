'use client';

import React, { useEffect, useRef, memo, forwardRef } from 'react';
import { ScriptItem, Mode } from '@/lib/types';
import { motion } from 'framer-motion';

interface ScriptDisplayProps {
  items: ScriptItem[];
  currentIndex: number;
  mode: Mode;
}

interface ScriptItemRowProps {
  item: ScriptItem;
  isActive: boolean;
  isPast: boolean;
  index: number;
  mode: Mode;
}

const ScriptItemRow = memo(forwardRef<HTMLDivElement, ScriptItemRowProps>(({ item, isActive, isPast, index, mode }, ref) => {
  const isSfx = item.type === 'sfx';
  const borderColor = mode === 'children_book' ? 'border-emerald-500' : 'border-amber-500';
  const bgGradient = mode === 'children_book'
    ? 'from-emerald-500/10 to-teal-500/10'
    : 'from-amber-500/10 to-orange-500/10';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative group p-5 rounded-2xl border-2 transition-all duration-500 ${
        isActive
          ? `bg-gradient-to-r ${bgGradient} ${borderColor} shadow-2xl scale-[1.02] ring-4 ring-${mode === 'children_book' ? 'emerald' : 'amber'}-500/20`
          : isPast
          ? 'bg-slate-800/30 border-slate-700/30 opacity-40'
          : 'bg-slate-800/50 border-slate-700/50 opacity-70 hover:opacity-100 hover:border-slate-600 hover:scale-[1.01]'
      }`}
    >
      {isActive && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-12 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full animate-pulse" />
      )}

      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
          isActive
            ? `bg-gradient-to-br ${mode === 'children_book' ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500'} shadow-lg scale-110`
            : 'bg-slate-700/50'
        }`}>
          <span className="text-2xl">
            {isSfx ? '🎵' : '💬'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isSfx
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : isActive
                ? `bg-gradient-to-r ${mode === 'children_book' ? 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' : 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'} border`
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              {isSfx ? '🎼 Sound Effect' : '🗣️ Narrator'}
            </span>
            <span className="text-xs text-slate-500 font-mono">#{index + 1}</span>
            {isActive && (
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-emerald-400 animate-pulse">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                PLAYING
              </span>
            )}
          </div>

          <div className={`text-base sm:text-lg leading-relaxed transition-colors ${
            isSfx
              ? 'text-pink-300/90 italic font-medium'
              : isActive
              ? 'text-slate-100 font-medium'
              : 'text-slate-300'
          }`}>
            {isSfx ? `[${item.content}]` : item.content}
          </div>
        </div>
      </div>

      {isPast && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
          <span className="text-xs text-slate-400">✓</span>
        </div>
      )}
    </motion.div>
  );
}));

ScriptItemRow.displayName = 'ScriptItemRow';

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

  return (
    <div
      ref={scrollRef}
      className="w-full h-[500px] lg:h-[650px] overflow-y-auto p-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
    >
      {items.map((item, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;

        return (
          <ScriptItemRow
            key={index}
            ref={(el) => { itemRefs.current[index] = el; }}
            item={item}
            isActive={isActive}
            isPast={isPast}
            index={index}
            mode={mode}
          />
        );
      })}
    </div>
  );
};
