'use client';

import React, { useState } from 'react';
import { Mode, DifficultyLevel, ProblemType, ScriptItem } from '@/lib/types';
import { generateScript } from '@/lib/script-generator';
import { AudioSequencer } from '@/components/AudioSequencer';
import { Visualizer } from '@/components/Visualizer';
import { ScriptDisplay } from '@/components/ScriptDisplay';
import { BookOpen, GraduationCap, Sparkles, BrainCircuit, Sun, Moon } from 'lucide-react';
import { VoiceSelector } from '@/components/VoiceSelector';

export default function Home() {
  const [mode, setMode] = useState<Mode>('children_book');
  const [inputText, setInputText] = useState('');
  const [level, setLevel] = useState<DifficultyLevel>('Intermediate');
  const [problemType, setProblemType] = useState<ProblemType>('빈칸 추론');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptItems, setScriptItems] = useState<ScriptItem[]>([]);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('eleven_turbo_v2_5');

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setScriptItems([]);
    setCurrentPlayIndex(-1);
    
    try {
      const result = await generateScript(inputText, mode, level, problemType);
      setScriptItems(result.items);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('스크립트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const themeColor = mode === 'children_book' ? 'emerald' : 'amber';
  const bgGradient = mode === 'children_book' 
    ? (isDarkMode ? 'from-slate-950 via-emerald-950/20 to-slate-950' : 'from-emerald-50 via-emerald-100/20 to-white')
    : (isDarkMode ? 'from-slate-950 via-amber-950/20 to-slate-950' : 'from-amber-50 via-amber-100/20 to-white');

  const cardBg = isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200';
  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <main className={`min-h-screen bg-gradient-to-br ${bgGradient} ${textColor} p-8 transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="relative text-center space-y-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute right-0 top-0 p-3 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-md'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <h1 className="text-5xl font-black tracking-tight flex items-center justify-center gap-4">
            <span className={`bg-gradient-to-r ${mode === 'children_book' ? 'from-emerald-400 to-teal-300' : 'from-amber-400 to-orange-300'} bg-clip-text text-transparent`}>
              ReadMaster AI
            </span>
            <span className="text-3xl">
              {mode === 'children_book' ? '🧚' : '🎓'}
            </span>
          </h1>
          <p className={`${subTextColor} text-lg font-medium`}>
            {mode === 'children_book' 
              ? 'Immersive Storytelling for Kids' 
              : 'Professional CSAT Analysis for Students'}
          </p>
        </header>

        {/* Mode Selector */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => setMode('children_book')}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 border-2 ${
              mode === 'children_book'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/20 scale-105'
                : `${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} ${subTextColor} hover:bg-slate-800/10`
            }`}
          >
            <BookOpen size={24} />
            <div className="text-left">
              <div className="font-bold text-lg">Story Mode</div>
              <div className="text-xs opacity-70">With Minhee Teacher</div>
            </div>
          </button>

          <button
            onClick={() => setMode('exam_passage')}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 border-2 ${
              mode === 'exam_passage'
                ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-lg shadow-amber-500/20 scale-105'
                : `${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} ${subTextColor} hover:bg-slate-800/10`
            }`}
          >
            <GraduationCap size={24} />
            <div className="text-left">
              <div className="font-bold text-lg">Exam Mode</div>
              <div className="text-xs opacity-70">With Dal Teacher</div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input & Controls */}
          <div className="space-y-6">
            <div className={`${cardBg} backdrop-blur-xl p-6 rounded-2xl border shadow-xl transition-colors`}>
              <div className="flex justify-between items-center mb-4">
                <label className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
                  {mode === 'children_book' ? <Sparkles size={18} className="text-emerald-400"/> : <BrainCircuit size={18} className="text-amber-400"/>}
                  Input Text
                </label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  className={`${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'} border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="mb-4">
                <label className={`block mb-2 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Voice
                </label>
                <VoiceSelector 
                  selectedVoiceId={selectedVoiceId} 
                  onVoiceSelect={setSelectedVoiceId}
                  selectedModelId={selectedModelId}
                  onModelSelect={setSelectedModelId}
                  className="w-full"
                />
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'children_book' ? "Paste a story chapter here..." : "Paste an exam passage here..."}
                className={`w-full h-64 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border-2 rounded-xl p-4 resize-none focus:outline-none focus:border-${themeColor}-500 transition-colors`}
              />

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  isGenerating
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${mode === 'children_book' ? 'from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400' : 'from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400'} text-white shadow-lg`
                }`}
              >
                {isGenerating ? (
                  <>Processing AI Script...</>
                ) : (
                  <>Generate Immersive Audio ✨</>
                )}
              </button>
            </div>

            {/* Audio Controls */}
            {scriptItems.length > 0 && (
              <div className={`${cardBg} backdrop-blur-xl p-6 rounded-2xl border shadow-xl transition-colors`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`font-bold text-xl ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Audio Controller</h3>
                  <Visualizer isPlaying={isPlaying} mode={mode} analyser={analyser} />
                </div>
                
                <AudioSequencer 
                  items={scriptItems} 
                  mode={mode}
                  voiceId={selectedVoiceId}
                  modelId={selectedModelId}
                  onItemStart={(index) => {
                    setCurrentPlayIndex(index);
                    setIsPlaying(true);
                  }}
                  onComplete={() => {
                    setIsPlaying(false);
                    setCurrentPlayIndex(-1);
                  }}
                  onAnalyserReady={setAnalyser}
                />
              </div>
            )}
          </div>

          {/* Right Column: Script Display */}
          <div className="space-y-6">
             <div className={`${cardBg} backdrop-blur-xl p-6 rounded-2xl border shadow-xl h-full min-h-[600px] transition-colors`}>
                <h3 className={`font-bold text-xl ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-4 flex items-center gap-2`}>
                  <span>📜</span> Live Script
                </h3>
                {scriptItems.length > 0 ? (
                  <ScriptDisplay 
                    items={scriptItems} 
                    currentIndex={currentPlayIndex} 
                    mode={mode} 
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
                    <div className="text-6xl">🎧</div>
                    <p>Generate audio to see the script here</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
