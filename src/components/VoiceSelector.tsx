'use client';

import React, { useEffect, useState } from 'react';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: {
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
    use_case?: string;
  };
}

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  className?: string;
}

export const VoiceSelector = React.memo<VoiceSelectorProps>(({
  selectedVoiceId, 
  onVoiceSelect,
  selectedModelId,
  onModelSelect,
  className 
}) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const models = [
    { id: 'eleven_v3', name: 'Eleven v3 (Flagship, Most Expressive)' },
    { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5 (Fastest, Multilingual)' },
    { id: 'eleven_flash_v2_5', name: 'Flash v2.5 (Ultra-low Latency)' },
    { id: 'eleven_multilingual_v2', name: 'Multilingual v2 (Legacy High Quality)' },
    { id: 'eleven_monolingual_v1', name: 'English v1 (Legacy)' },
  ];

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/voices');
        if (!response.ok) throw new Error('Failed to fetch voices');
        const data = await response.json();
        setVoices(data.voices || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load voices');
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Loading voices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
        <span className="text-xl">⚠️</span>
        <span className="text-sm text-red-400 font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
          <span>🎤</span> Voice Selection
        </label>
        <select
          value={selectedVoiceId}
          onChange={(e) => onVoiceSelect(e.target.value)}
          className="w-full bg-slate-800/70 border-2 border-slate-600 hover:border-emerald-500/50 text-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22rgb(148%20163%20184)%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
        >
          <option value="">🎯 Default Voice (Recommended)</option>
          {voices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} {voice.labels?.accent ? `• ${voice.labels.accent}` : ''} {voice.labels?.gender ? `• ${voice.labels.gender}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
          <span>⚡</span> AI Model
        </label>
        <select
          value={selectedModelId}
          onChange={(e) => onModelSelect(e.target.value)}
          className="w-full bg-slate-800/70 border-2 border-slate-600 hover:border-amber-500/50 text-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22rgb(148%20163%20184)%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

VoiceSelector.displayName = 'VoiceSelector';
