import { Mode, DifficultyLevel, ProblemType, SemanticChunk, ScriptItem, GeneratedScript } from './types';

// ============================================================================
// SEMANTIC CHUNKING ENGINE
// ============================================================================

export const analyzeAndChunkText = (text: string, mode: Mode): SemanticChunk[] => {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  const chunks: SemanticChunk[] = [];
  let chunkId = 1;
  
  const targetMinWords = mode === 'children_book' ? 80 : 120;
  const targetMaxWords = mode === 'children_book' ? 180 : 250;
  
  let currentChunk = '';
  let currentWordCount = 0;
  
  const transitionMarkers = [
    'However', 'But', 'Yet', 'Nevertheless', 'On the other hand',
    'In contrast', 'Meanwhile', 'Furthermore', 'Moreover', 'Therefore',
    'Consequently', 'As a result', 'In fact', 'Indeed', 'For example'
  ];
  
  const isTransitionStart = (text: string): boolean => {
    return transitionMarkers.some(marker => 
      text.trim().startsWith(marker)
    );
  };
  
  const detectChunkType = (text: string): SemanticChunk['type'] => {
    if (text.includes('"') || text.includes("'") && text.includes('said')) {
      return 'dialogue';
    }
    if (isTransitionStart(text)) {
      return 'transition';
    }
    if (text.includes('In conclusion') || text.includes('Finally') || text.includes('In summary')) {
      return 'conclusion';
    }
    return 'narrative';
  };
  
  paragraphs.forEach((para) => {
    const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
    
    sentences.forEach((sentence) => {
      const sentenceWordCount = sentence.split(/\s+/).length;
      
      if (currentWordCount + sentenceWordCount > targetMaxWords && currentWordCount >= targetMinWords) {
        chunks.push({
          id: chunkId++,
          text: currentChunk.trim(),
          wordCount: currentWordCount,
          type: detectChunkType(currentChunk)
        });
        currentChunk = sentence;
        currentWordCount = sentenceWordCount;
      } else if (isTransitionStart(sentence) && currentWordCount >= targetMinWords) {
        chunks.push({
          id: chunkId++,
          text: currentChunk.trim(),
          wordCount: currentWordCount,
          type: detectChunkType(currentChunk)
        });
        currentChunk = sentence;
        currentWordCount = sentenceWordCount;
      } else {
        currentChunk += ' ' + sentence;
        currentWordCount += sentenceWordCount;
      }
    });
  });
  
  if (currentChunk.trim()) {
    chunks.push({
      id: chunkId,
      text: currentChunk.trim(),
      wordCount: currentWordCount,
      type: detectChunkType(currentChunk)
    });
  }
  
  return chunks;
};

// ============================================================================
// SCRIPT GENERATION (MOCK LLM)
// ============================================================================

import { generateScriptAction } from '@/app/actions';

// ============================================================================
// MOCK GENERATION (Fallback)
// ============================================================================

const generateMockScript = (
  _text: string,
  mode: Mode,
  chunks: SemanticChunk[],
  problemType?: ProblemType
): ScriptItem[] => {
  const items: ScriptItem[] = [];

  if (mode === 'children_book') {
    // Minhee Teacher Persona
    items.push({ type: 'sfx', content: 'magical glitter' });
    items.push({ 
      type: 'speech', 
      content: '안녕하세요, 여러분! [giggles] 민희샘이에요. 오늘 우리가 함께 읽을 이야기는 정말 흥미진진하답니다. [whispers] 자, 마법의 세계로 떠나볼까요?',
      voiceSettings: { style: 0.5, stability: 0.7 }
    });

    chunks.forEach((chunk, index) => {
      items.push({ type: 'sfx', content: 'page turn' });
      items.push({ 
        type: 'speech', 
        content: `자, ${index + 1}번째 부분을 볼까요? "${chunk.text.substring(0, 50)}..." [thoughtful] 이 부분에서는 주인공의 감정이 정말 잘 드러나요.`,
        voiceSettings: { style: 0.4 }
      });
      items.push({
        type: 'speech',
        content: `여기서 중요한 단어는 바로 이겁니다. [clears throat] 꼭 기억해두세요!`,
        voiceSettings: { style: 0.6 }
      });
    });

    items.push({ type: 'sfx', content: 'magical chime' });
    items.push({ 
      type: 'speech', 
      content: '오늘 정말 잘했어요! [happy] 다음 시간에 또 만나요!',
      voiceSettings: { style: 0.5 }
    });

  } else {
    // Dal Teacher Persona
    items.push({ type: 'sfx', content: 'drum roll' });
    items.push({ 
      type: 'speech', 
      content: `안녕하세요, 여러분의 1등급 메이커 달쌤입니다. [serious] 오늘은 ${problemType ?? '빈칸 추론'} 유형입니다. 지문, 만만치 않죠? 하지만 저와 함께라면 문제없습니다.`,
      voiceSettings: { style: 0.3, stability: 0.8 }
    });

    items.push({ type: 'sfx', content: 'chalk writing' });
    
    chunks.forEach((chunk, index) => {
      items.push({ 
        type: 'speech', 
        content: `섹션 ${index + 1}입니다. 여기서 필자의 의도가 드러납니다. "${chunk.text.substring(0, 50)}..." 보이죠?`,
        voiceSettings: { style: 0.3 }
      });
      
      if (index === chunks.length - 1) {
         items.push({ type: 'sfx', content: 'bell ding' });
         items.push({ 
            type: 'speech', 
            content: '[excited] 바로 여기가 정답의 단서입니다! 빈칸에 들어갈 말은 이것밖에 될 수 없죠.',
            voiceSettings: { style: 0.6, stability: 0.6 }
         });
      }
    });

    items.push({ 
      type: 'speech', 
      content: '복습 철저히 하시고, 다음 강의에서 봅시다. 이상 달쌤이었습니다.',
      voiceSettings: { style: 0.3 }
    });
  }
  return items;
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateScript = async (
  text: string,
  mode: Mode,
  level: DifficultyLevel,
  problemType?: ProblemType
): Promise<GeneratedScript> => {
  
  // 1. Try LLM Generation first
  let items: ScriptItem[] | null = null;
  try {
    items = await generateScriptAction(text, mode, level, problemType);
  } catch (e) {
    console.warn("LLM Action failed, falling back to mock", e);
  }

  // 2. Fallback to Mock if LLM fails or returns null
  if (!items || items.length === 0) {
    console.log("Using Mock Script Generation");
    // Simulate API delay for consistency
    await new Promise(resolve => setTimeout(resolve, 1000));
    const chunks = analyzeAndChunkText(text, mode);
    items = generateMockScript(text, mode, chunks, problemType);
  }

  // Construct full script for display
  const fullScript = items
    .map(item => item.type === 'speech' ? `🗣️ ${item.content}` : `🔊 [SFX: ${item.content}]`)
    .join('\n\n');

  return {
    items,
    fullScript,
    estimatedDuration: items.length * 5
  };
};
