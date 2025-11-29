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

export interface AudioSequencerRef {
  getAudioBlobs: () => Map<number, string>;
  fetchAllAudio: () => Promise<Map<number, Blob>>;
}

export const AudioSequencer = React.forwardRef<AudioSequencerRef, AudioSequencerProps>(({ 
  items, 
  mode,
  voiceId,
  modelId,
  onItemStart,
  onComplete,
  onAnalyserReady
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cache for audio blobs: index -> BlobUrl
  const audioCache = useRef<Map<number, string>>(new Map());
  // Cache for raw blobs (for export)
  const blobCache = useRef<Map<number, Blob>>(new Map());
  
  const prefetchQueue = useRef<Set<number>>(new Set());

  React.useImperativeHandle(ref, () => ({
    getAudioBlobs: () => audioCache.current,
    fetchAllAudio: async () => {
      const results = new Map<number, Blob>();
      const total = items.length;
      
      for (let i = 0; i < total; i++) {
        setDownloadProgress(Math.round(((i + 1) / total) * 100));
        try {
          if (blobCache.current.has(i)) {
            results.set(i, blobCache.current.get(i)!);
          } else {
            const blob = await fetchAudioBlob(i);
            results.set(i, blob);
          }
        } catch (e) {
          console.error(`Failed to fetch audio for item ${i}`, e);
        }
      }
      setDownloadProgress(0);
      return results;
    }
  }));

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
      blobCache.current.clear();
    };
  }, []);

  // Clear cache when voiceId or modelId changes
  useEffect(() => {
    audioCache.current.forEach(url => URL.revokeObjectURL(url));
    audioCache.current.clear();
    blobCache.current.clear();
  }, [voiceId, modelId]);

  const fetchAudioBlob = useCallback(async (index: number): Promise<Blob> => {
    if (blobCache.current.has(index)) {
      return blobCache.current.get(index)!;
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
        modelId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch audio: ${errorText}`);
    }

    const blob = await response.blob();
    blobCache.current.set(index, blob);
    
    // Also update URL cache for playback
    const url = URL.createObjectURL(blob);
    audioCache.current.set(index, url);
    
    return blob;
  }, [items, mode, voiceId, modelId]);

  const fetchAudio = useCallback(async (index: number): Promise<string> => {
    if (audioCache.current.has(index)) {
      return audioCache.current.get(index)!;
    }
    const blob = await fetchAudioBlob(index);
    return audioCache.current.get(index)!;
  }, [fetchAudioBlob]);

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
      setError(`API Error: Falling back to browser TTS for item ${index + 1}`);
      if (!('speechSynthesis' in window)) {
        console.error('Browser does not support speech synthesis');
        playNext(index + 1);
        return;
      }
  
      const utterance = new SpeechSynthesisUtterance(text);
      // ... (rest of fallback logic same as before)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
  
      utterance.onend = () => playNext(index + 1);
      utterance.onerror = () => playNext(index + 1);
      window.speechSynthesis.speak(utterance);
    };

    try {
      let url = audioCache.current.get(index);
      
      if (!url) {
        try {
          url = await fetchAudio(index);
        } catch (fetchError: any) {
          console.warn(`API fetch failed for index ${index}`, fetchError);
          
          let errorMessage = `Generation Failed: ${fetchError.message}`;
          if (fetchError.message.includes('quota_exceeded')) {
            errorMessage = "⚠️ API Quota Exceeded. Please check your ElevenLabs credits.";
          }
          
          setError(errorMessage);
          speakFallback(items[index].content);
          return;
        }
      }

      if (url && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => playNext(index + 1);
        audioRef.current.onerror = () => speakFallback(items[index].content);
        
        await audioRef.current.play();
        prefetchNext(index + 1);
      }
    } catch (err) {
      console.error('Playback setup error', err);
      speakFallback(items[index].content);
    }
  }, [items, onItemStart, onComplete, prefetchNext, fetchAudio]);

  // ... (AudioContext logic same as before)
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

      {downloadProgress > 0 && (
        <div className="text-emerald-400 text-sm font-medium animate-pulse">
          Preparing Export... {downloadProgress}%
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm max-w-[200px] truncate" title={error}>{error}</div>
      )}
    </div>
  );
});

AudioSequencer.displayName = 'AudioSequencer';
