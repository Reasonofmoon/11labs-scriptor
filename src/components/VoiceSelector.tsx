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

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
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
    { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5 (Fastest, Multilingual)' },
    { id: 'eleven_multilingual_v2', name: 'Multilingual v2 (Better Quality)' },
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

  if (loading) return <div className="text-sm text-slate-500">Loading voices...</div>;
  if (error) return <div className="text-sm text-red-500">Error loading voices</div>;

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Voice</label>
        <select
          value={selectedVoiceId}
          onChange={(e) => onVoiceSelect(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Default Voice</option>
          {voices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} ({voice.labels?.accent || 'Unknown'} {voice.labels?.gender || ''})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Model / Language</label>
        <select
          value={selectedModelId}
          onChange={(e) => onModelSelect(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
};
