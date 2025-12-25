'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScriptItem, Mode } from '@/lib/types';
import { AudioPlayer } from '@/lib/audio-player';
import { AudioCache } from '@/lib/audio-cache';

interface AudioSequencerProps {
  items: ScriptItem[];
  mode: Mode;
  voiceId?: string;
  modelId?: string;
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

  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const audioCacheRef = useRef<AudioCache>(new AudioCache());
  const prefetchQueue = useRef<Set<number>>(new Set());

  React.useImperativeHandle(ref, () => ({
    getAudioBlobs: () => {
      const urlMap = new Map<number, string>();
      items.forEach((_, index) => {
        const url = audioCacheRef.current.getUrl(index);
        if (url) urlMap.set(index, url);
      });
      return urlMap;
    },
    fetchAllAudio: async () => {
      const total = items.length;

      for (let i = 0; i < total; i++) {
        setDownloadProgress(Math.round(((i + 1) / total) * 100));
        try {
          await fetchAudioBlob(i);
        } catch (e) {
          console.error(`Failed to fetch audio for item ${i}`, e);
        }
      }
      setDownloadProgress(0);
      return audioCacheRef.current.getAllBlobs();
    }
  }));

  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer();

    return () => {
      audioPlayerRef.current?.destroy();
      audioCacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    audioCacheRef.current.clear();
  }, [voiceId, modelId]);

  const fetchAudioBlob = useCallback(async (index: number): Promise<Blob> => {
    const cached = audioCacheRef.current.getBlob(index);
    if (cached) return cached;

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
    audioCacheRef.current.set(index, blob);

    return blob;
  }, [items, mode, voiceId, modelId]);

  const fetchAudio = useCallback(async (index: number): Promise<string> => {
    const cachedUrl = audioCacheRef.current.getUrl(index);
    if (cachedUrl) return cachedUrl;

    await fetchAudioBlob(index);
    return audioCacheRef.current.getUrl(index)!;
  }, [fetchAudioBlob]);

  const prefetchNext = useCallback(async (startIndex: number) => {
    for (let i = startIndex; i < Math.min(startIndex + 2, items.length); i++) {
      if (!audioCacheRef.current.has(i) && !prefetchQueue.current.has(i)) {
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

    const speakFallback = (text: string) => {
      setError(`Falling back to browser TTS for item ${index + 1}`);
      if (!('speechSynthesis' in window)) {
        console.error('Browser does not support speech synthesis');
        playNext(index + 1);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => playNext(index + 1);
      utterance.onerror = () => playNext(index + 1);
      window.speechSynthesis.speak(utterance);
    };

    try {
      let url = audioCacheRef.current.getUrl(index);

      if (!url) {
        try {
          url = await fetchAudio(index);
        } catch (fetchError: any) {
          console.warn(`API fetch failed for index ${index}`, fetchError);

          let errorMessage = `Generation Failed: ${fetchError.message}`;
          if (fetchError.message.includes('quota_exceeded')) {
            errorMessage = "API Quota Exceeded. Please check your ElevenLabs credits.";
          }

          setError(errorMessage);
          speakFallback(items[index].content);
          return;
        }
      }

      if (url && audioPlayerRef.current) {
        audioPlayerRef.current.onEnded(() => playNext(index + 1));
        audioPlayerRef.current.onError(() => speakFallback(items[index].content));

        await audioPlayerRef.current.play(url);
        prefetchNext(index + 1);
      }
    } catch (err) {
      console.error('Playback setup error', err);
      speakFallback(items[index].content);
    }
  }, [items, onItemStart, onComplete, prefetchNext, fetchAudio]);

  const initAudioContext = useCallback(() => {
    if (!audioPlayerRef.current) return;

    const analyser = audioPlayerRef.current.initializeAnalyser();
    if (analyser && onAnalyserReady) {
      onAnalyserReady(analyser);
    }
  }, [onAnalyserReady]);

  const startPlayback = useCallback(() => {
    if (items.length === 0) return;
    initAudioContext();
    setIsPlaying(true);
    setError(null);
    playNext(0);
  }, [items, initAudioContext, playNext]);

  const stopPlayback = useCallback(() => {
    audioPlayerRef.current?.pause();
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, []);

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
