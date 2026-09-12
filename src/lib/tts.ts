import { Mode } from './types';

export type QualityPreset = 'preview' | 'stable' | 'expressive';

export interface QualityPresetOption {
  id: QualityPreset;
  modelId: string;
  name: string;
  hint: string;
}

export const QUALITY_PRESETS: QualityPresetOption[] = [
  {
    id: 'preview',
    modelId: 'eleven_flash_v2_5',
    name: 'Fast · Flash v2.5',
    hint: 'Low latency, lower cost',
  },
  {
    id: 'stable',
    modelId: 'eleven_multilingual_v2',
    name: 'Stable · Multilingual v2',
    hint: 'Long-form and numbers',
  },
  {
    id: 'expressive',
    modelId: 'eleven_v3',
    name: 'Expressive · v3',
    hint: 'Audio tags and emotion',
  },
];

export const FALLBACK_MODEL_ID = 'eleven_flash_v2_5';

export const DEFAULT_MODEL_BY_MODE: Record<Mode, string> = {
  children_book: 'eleven_v3',
  exam_passage: 'eleven_multilingual_v2',
};
