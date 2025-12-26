'use client';

import React, { useState } from 'react';
import { Mode, DifficultyLevel, ProblemType, ScriptItem } from '@/lib/types';
import { generateScript } from '@/lib/script-generator';
import { AudioSequencer, AudioSequencerRef } from '@/components/AudioSequencer';
import { Visualizer } from '@/components/Visualizer';
import { ScriptDisplay } from '@/components/ScriptDisplay';
import { BookOpen, GraduationCap, Sparkles, BrainCircuit, Sun, Moon, Download, FileText, FileJson, FileAudio } from 'lucide-react';
import { VoiceSelector } from '@/components/VoiceSelector';
import { downloadScriptAsJson, downloadScriptAsText, generateAndDownloadSrt } from '@/lib/export-utils';

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
  
  const sequencerRef = React.useRef<AudioSequencerRef>(null);

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

  const handleDownloadText = () => downloadScriptAsText(scriptItems);
  const handleDownloadJson = () => downloadScriptAsJson(scriptItems);
  
  const handleDownloadSrt = async () => {
    if (!sequencerRef.current) return;
    try {
      const blobs = await sequencerRef.current.fetchAllAudio();
      await generateAndDownloadSrt(scriptItems, blobs);
    } catch (error) {
      console.error('Failed to export SRT:', error);
      alert('Failed to export SRT. Please try again.');
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
    <main className={`min-h-screen bg-gradient-to-br ${bgGradient} ${textColor} p-4 sm:p-8 transition-colors duration-500 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="relative text-center space-y-6 pt-8 pb-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute right-0 top-0 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-sm text-yellow-400 hover:bg-slate-700 shadow-lg shadow-yellow-500/10' : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-white shadow-xl'}`}
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-6xl sm:text-7xl font-black tracking-tight flex items-center justify-center gap-4">
              <span className={`bg-gradient-to-r ${mode === 'children_book' ? 'from-emerald-400 via-teal-400 to-cyan-400' : 'from-amber-400 via-orange-400 to-red-400'} bg-clip-text text-transparent drop-shadow-sm`}>
                ReadMaster AI
              </span>
              <span className="text-5xl animate-bounce">
                {mode === 'children_book' ? '🧚' : '🎓'}
              </span>
            </h1>
            <p className={`${subTextColor} text-xl font-semibold tracking-wide`}>
              {mode === 'children_book'
                ? 'Immersive Storytelling for Kids'
                : 'Professional CSAT Analysis for Students'}
            </p>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
          <button
            onClick={() => setMode('children_book')}
            className={`group relative flex items-center gap-4 px-6 sm:px-8 py-5 rounded-2xl transition-all duration-300 border-2 transform hover:scale-105 ${
              mode === 'children_book'
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500 text-emerald-400 shadow-2xl shadow-emerald-500/30 scale-105'
                : `${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white/70 border-slate-300'} ${subTextColor} hover:border-emerald-400/50 hover:shadow-lg`
            }`}
          >
            <div className={`p-2 rounded-xl ${mode === 'children_book' ? 'bg-emerald-500/20' : 'bg-slate-700/50'} transition-colors`}>
              <BookOpen size={28} />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg sm:text-xl">Story Mode</div>
              <div className="text-xs sm:text-sm opacity-70">Immersive Narration</div>
            </div>
            {mode === 'children_book' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setMode('exam_passage')}
            className={`group relative flex items-center gap-4 px-6 sm:px-8 py-5 rounded-2xl transition-all duration-300 border-2 transform hover:scale-105 ${
              mode === 'exam_passage'
                ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500 text-amber-400 shadow-2xl shadow-amber-500/30 scale-105'
                : `${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white/70 border-slate-300'} ${subTextColor} hover:border-amber-400/50 hover:shadow-lg`
            }`}
          >
            <div className={`p-2 rounded-xl ${mode === 'exam_passage' ? 'bg-amber-500/20' : 'bg-slate-700/50'} transition-colors`}>
              <GraduationCap size={28} />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg sm:text-xl">Exam Mode</div>
              <div className="text-xs sm:text-sm opacity-70">Academic Analysis</div>
            </div>
            {mode === 'exam_passage' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6 animate-in slide-in-from-left duration-700">
            <div className={`${cardBg} backdrop-blur-xl p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all hover:shadow-3xl`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <label className={`font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-3`}>
                  <div className={`p-2 rounded-lg ${mode === 'children_book' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                    {mode === 'children_book' ? <Sparkles size={20} className="text-emerald-400"/> : <BrainCircuit size={20} className="text-amber-400"/>}
                  </div>
                  Input Text
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  className={`${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'} border-2 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 transition-all cursor-pointer hover:border-${themeColor}-400`}
                >
                  <option value="Beginner">🟢 Beginner</option>
                  <option value="Intermediate">🟡 Intermediate</option>
                  <option value="Advanced">🔴 Advanced</option>
                </select>
              </div>

              <div className="mb-6">
                <label className={`block mb-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
                  <span>🎤</span> Voice & Model Settings
                </label>
                <VoiceSelector
                  selectedVoiceId={selectedVoiceId}
                  onVoiceSelect={setSelectedVoiceId}
                  selectedModelId={selectedModelId}
                  onModelSelect={setSelectedModelId}
                  className="w-full"
                />
              </div>

              <div className="relative group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={mode === 'children_book' ? "✨ Paste your story here...\n\nExample: Once upon a time in a magical forest..." : "📚 Paste your exam passage here...\n\nExample: The following passage discusses..."}
                  className={`w-full h-72 ${isDarkMode ? 'bg-slate-800/70 border-slate-600 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'} border-2 rounded-2xl p-5 resize-none focus:outline-none focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-500/20 transition-all font-mono text-sm leading-relaxed`}
                />
                <div className={`absolute bottom-3 right-3 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
                  {inputText.length} characters
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className={`relative w-full mt-6 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 overflow-hidden group ${
                  isGenerating
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${mode === 'children_book' ? 'from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400' : 'from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400'} text-white shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] active:scale-[0.98]`
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-3 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    Processing AI Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="animate-pulse" size={22} />
                    Generate Immersive Audio
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </>
                )}
              </button>
            </div>

            {scriptItems.length > 0 && (
              <div className={`${cardBg} backdrop-blur-xl p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all animate-in slide-in-from-bottom duration-500`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className={`font-bold text-xl ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-3`}>
                    <div className={`p-2 rounded-lg ${mode === 'children_book' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                      <span className="text-2xl">🎵</span>
                    </div>
                    Audio Controller
                  </h3>
                  <Visualizer isPlaying={isPlaying} mode={mode} analyser={analyser} />
                </div>

                <AudioSequencer
                  ref={sequencerRef}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <button
                    onClick={handleDownloadText}
                    className={`flex items-center justify-center gap-2 px-4 py-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'} border-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 hover:shadow-lg`}
                  >
                    <FileText size={18} /> Script (TXT)
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className={`flex items-center justify-center gap-2 px-4 py-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'} border-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 hover:shadow-lg`}
                  >
                    <FileJson size={18} /> Script (JSON)
                  </button>
                  <button
                    onClick={handleDownloadSrt}
                    className={`flex items-center justify-center gap-2 px-4 py-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'} border-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 hover:shadow-lg`}
                  >
                    <FileAudio size={18} /> Export SRT
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 animate-in slide-in-from-right duration-700">
             <div className={`${cardBg} backdrop-blur-xl p-6 sm:p-8 rounded-3xl border-2 shadow-2xl h-full min-h-[600px] lg:min-h-[800px] transition-all`}>
                <h3 className={`font-bold text-xl ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-6 flex items-center gap-3`}>
                  <div className={`p-2 rounded-lg ${mode === 'children_book' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                    <span className="text-2xl">📜</span>
                  </div>
                  Live Script
                </h3>
                {scriptItems.length > 0 ? (
                  <ScriptDisplay
                    items={scriptItems}
                    currentIndex={currentPlayIndex}
                    mode={mode}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-60">
                    <div className="relative">
                      <div className="text-8xl animate-bounce">🎧</div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        No Script Yet
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Generate audio to see the script appear here
                      </p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
