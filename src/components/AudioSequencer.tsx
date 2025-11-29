'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScriptItem, Mode } from '@/lib/types';

interface AudioSequencerProps {
  items: ScriptItem[];
  mode: Mode;
  voiceId?: string;
  modelId?: string; // Add modelId prop
  onItemStart?: (index: number) => void;
  onComplete?: () => void;
  onAnalyserReady?: (analyser: AnalyserNode) => void;
}

export const AudioSequencer: React.FC<AudioSequencerProps> = ({ 
  items, 
  mode,
  voiceId,
  modelId, // Destructure modelId
  onItemStart,
  onComplete,
  onAnalyserReady
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cache for audio blobs: index -> BlobUrl
  const audioCache = useRef<Map<number, string>>(new Map());
  const prefetchQueue = useRef<Set<number>>(new Set());

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      // Cleanup blobs
      audioCache.current.forEach(url => URL.revokeObjectURL(url));
      audioCache.current.clear();
    };
  }, []);

  // Clear cache when voiceId or modelId changes
  useEffect(() => {
    audioCache.current.forEach(url => URL.revokeObjectURL(url));
    audioCache.current.clear();
  }, [voiceId, modelId]);

  const fetchAudio = useCallback(async (index: number): Promise<string> => {
    if (audioCache.current.has(index)) {
      return audioCache.current.get(index)!;
    }

    const item = items[index];
    if (!item) throw new Error('Item not found');

    const response = await fetch('/api/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: item.content,
        type: item.type,
        voiceSettings: item.voiceSettings,
        mode,
        voiceId,
        modelId // Pass modelId to API
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audio');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audioCache.current.set(index, url);
    return url;
  }, [items, mode, voiceId, modelId]);

  const prefetchNext = useCallback(async (startIndex: number) => {
    // Prefetch next 2 items
    for (let i = startIndex; i < Math.min(startIndex + 2, items.length); i++) {
      if (!audioCache.current.has(i) && !prefetchQueue.current.has(i)) {
        prefetchQueue.current.add(i);
        fetchAudio(i).catch(console.error).finally(() => {
          prefetchQueue.current.delete(i);
        });
      }
    }
  }, [items, fetchAudio]);

  const playNext = useCallback(async (index: number) => {
    if (index >= items.length) {
      setIsPlaying(false);
      setCurrentIndex(-1);
      onComplete?.();
      return;
    }

    setCurrentIndex(index);
    onItemStart?.(index);

    if (abortControllerRef.current?.signal.aborted) return;

    const speakFallback = (text: string) => {
      if (!('speechSynthesis' in window)) {
        console.error('Browser does not support speech synthesis');
        playNext(index + 1);
        return;
      }
  
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
  
      utterance.onstart = () => {
        // Already called onItemStart above
      };
  
      utterance.onend = () => {
        playNext(index + 1);
      };
  
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        playNext(index + 1);
      };
  
      window.speechSynthesis.speak(utterance);
    };

    try {
      let url = audioCache.current.get(index);
      
      // Try to fetch if not cached
      if (!url) {
        try {
          url = await fetchAudio(index);
        } catch (fetchError) {
          console.warn(`API fetch failed for index ${index}, falling back to browser TTS`, fetchError);
          speakFallback(items[index].content);
          return;
        }
      }

      if (url && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onplay = () => { /* already handled */ };
        audioRef.current.onended = () => {
          playNext(index + 1);
        };
        audioRef.current.onerror = () => {
           console.warn(`Audio playback failed for index ${index}, falling back to browser TTS`);
           speakFallback(items[index].content);
        };
        
        await audioRef.current.play();
        prefetchNext(index + 1);
      }
    } catch (err) {
      console.error('Playback setup error for index', index, err);
      speakFallback(items[index].content);
    }
  }, [items, onItemStart, onComplete, prefetchNext, fetchAudio]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      if (audioRef.current) {
        // Check if source already exists (shouldn't if context is new, but good practice)
        if (!sourceNodeRef.current) {
             sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
             sourceNodeRef.current.connect(analyserRef.current);
             analyserRef.current.connect(audioContextRef.current.destination);
        }
      }
      
      if (onAnalyserReady && analyserRef.current) {
        onAnalyserReady(analyserRef.current);
      }
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const startPlayback = () => {
    if (items.length === 0) return;
    initAudioContext();
    setIsPlaying(true);
    setError(null);
    playNext(0);
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentIndex(-1);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
      <button
        onClick={isPlaying ? stopPlayback : startPlayback}
        className={`px-6 py-3 rounded-lg font-bold transition-all ${
          isPlaying 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
        }`}
      >
        {isPlaying ? '⏹️ Stop' : '▶️ Play Immersive Audio'}
      </button>
      
      {isPlaying && (
        <div className="flex-1">
          <div className="text-sm text-slate-400 mb-1">
            Now Playing ({currentIndex + 1}/{items.length})
          </div>
          <div className="text-slate-200 font-medium truncate">
            {items[currentIndex]?.type === 'sfx' ? '🔊 Sound Effect' : '🗣️ Narrator'}
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
    </div>
  );
};
