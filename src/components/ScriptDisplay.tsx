'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { ScriptItem, Mode } from '@/lib/types';
import { ScriptItemRow } from './ScriptItemRow';

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

  const registerRef = useCallback((index: number, el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  return (
    <div
      ref={scrollRef}
      className="w-full h-[500px] lg:h-[650px] overflow-y-auto p-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
    >
      {items.map((item, index) => {
        const status = index === currentIndex ? 'active' : index < currentIndex ? 'past' : 'future';

        return (
          <ScriptItemRow
            key={index}
            registerRef={registerRef}
            item={item}
            index={index}
            mode={mode}
            status={status}
          />
        );
      })}
    </div>
  );
};
