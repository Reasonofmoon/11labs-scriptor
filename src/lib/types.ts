export type Mode = 'children_book' | 'exam_passage';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ProblemType = '주제/제목/요지' | '빈칸 추론' | '글의 순서' | '문장 삽입' | '내용 일치/불일치' | '어법/어휘';

export interface SemanticChunk {
  id: number;
  text: string;
  wordCount: number;
  type: 'narrative' | 'dialogue' | 'transition' | 'conclusion';
}

export interface ScriptItem {
  type: 'speech' | 'sfx';
  content: string; // Text for speech, Prompt for SFX
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface GeneratedScript {
  items: ScriptItem[];
  fullScript: string; // For display/editing
  estimatedDuration: number;
}
