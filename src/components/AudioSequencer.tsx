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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <button
          onClick={isPlaying ? stopPlayback : startPlayback}
          disabled={items.length === 0}
          className={`relative flex-1 sm:flex-none px-8 py-4 rounded-2xl font-bold text-lg transition-all transform overflow-hidden group ${
            isPlaying
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-xl shadow-red-500/30'
              : items.length === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isPlaying ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 bg-white rounded-sm animate-pulse" />
              Stop
            </span>
          ) : (
            <>
              <span className="flex items-center justify-center gap-2">
                <span className="text-2xl">▶</span>
                Play Audio
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </>
          )}
        </button>

        {isPlaying && (
          <div className="flex-1 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-2 border-slate-600 rounded-2xl p-4 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-1 h-8 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0ms'}} />
                <div className="w-1 h-8 bg-teal-500 rounded-full animate-pulse" style={{animationDelay: '150ms'}} />
                <div className="w-1 h-8 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '300ms'}} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-400 font-semibold mb-1">
                  NOW PLAYING ({currentIndex + 1} of {items.length})
                </div>
                <div className="text-slate-200 font-bold truncate flex items-center gap-2">
                  <span className="text-lg">
                    {items[currentIndex]?.type === 'sfx' ? '🎵' : '🗣️'}
                  </span>
                  {items[currentIndex]?.type === 'sfx' ? 'Sound Effect' : 'Narrator'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {downloadProgress > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-emerald-400 font-bold">Preparing Export...</span>
            <span className="ml-auto text-emerald-400 font-bold text-lg">{downloadProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1 min-w-0">
              <div className="text-red-400 font-bold mb-1">Error</div>
              <div className="text-red-300 text-sm" title={error}>{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AudioSequencer.displayName = 'AudioSequencer';
