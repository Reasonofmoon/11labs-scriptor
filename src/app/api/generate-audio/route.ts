import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_MODEL_ID } from '@/lib/tts';

export const maxDuration = 60;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Default-catalog IDs (Bella / Antoni). They expire 2026-12-31.
// Override with ELEVENLABS_VOICE_MINHEE / ELEVENLABS_VOICE_DAL.
const VOICE_ID_MINHEE = process.env.ELEVENLABS_VOICE_MINHEE || 'EXAVITQu4vr4xnSDxMaL';
const VOICE_ID_DAL = process.env.ELEVENLABS_VOICE_DAL || 'ErXwobaYiN019PkySvjV';

const SFX_MODEL_ID = 'eleven_text_to_sound_v2';
const SFX_DURATION_SECONDS = 1.5;

interface GenerateAudioRequest {
  text: string;
  type: 'speech' | 'sfx';
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
  };
  mode: 'children_book' | 'exam_passage';
  voiceId?: string;
  modelId?: string;
}

function errorMessageFromStatus(status: number): string {
  if (status === 401) return 'Invalid API key';
  if (status === 429) return 'Rate limit exceeded or quota exceeded';
  if (status === 400) return 'Invalid request parameters';
  return 'Failed to generate audio';
}

async function elevenLabsAudio(
  url: string,
  body: Record<string, unknown>
): Promise<{ buffer: ArrayBuffer } | { status: number; details: string }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY as string,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    return { status: response.status, details };
  }

  return { buffer: await response.arrayBuffer() };
}

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY is not configured');
    return NextResponse.json(
      { error: 'ElevenLabs API Key not configured. Please add your API key to .env file.' },
      { status: 500 }
    );
  }

  try {
    const body: GenerateAudioRequest = await req.json();
    const { text, type, voiceSettings, mode, voiceId: requestedVoiceId, modelId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (type !== 'speech' && type !== 'sfx') {
      return NextResponse.json({ error: 'Invalid type. Must be "speech" or "sfx"' }, { status: 400 });
    }

    let result: { buffer: ArrayBuffer } | { status: number; details: string };

    if (type === 'sfx') {
      console.log(`[ElevenLabs] Generating SFX: "${text.slice(0, 80)}" model=${SFX_MODEL_ID}`);
      result = await elevenLabsAudio('https://api.elevenlabs.io/v1/sound-generation', {
        text,
        duration_seconds: SFX_DURATION_SECONDS,
        prompt_influence: 0.5,
        model_id: SFX_MODEL_ID,
      });
    } else {
      const voiceId = requestedVoiceId || (mode === 'children_book' ? VOICE_ID_MINHEE : VOICE_ID_DAL);
      const model = modelId || FALLBACK_MODEL_ID;
      const stability = voiceSettings?.stability ?? 0.5;
      const normalizedStability = [0.0, 0.5, 1.0].reduce((prev, curr) =>
        Math.abs(curr - stability) < Math.abs(prev - stability) ? curr : prev
      );

      console.log(`[ElevenLabs] Generating speech: Voice=${voiceId}, Model=${model}, Length=${text.length}`);

      result = await elevenLabsAudio(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        text,
        model_id: model,
        voice_settings: {
          stability: normalizedStability,
          similarity_boost: voiceSettings?.similarity_boost ?? 0.75,
        },
      });
    }

    if ('status' in result) {
      console.error(`[ElevenLabs] API Error (${result.status}):`, result.details);
      return NextResponse.json(
        { error: errorMessageFromStatus(result.status), details: result.details },
        { status: result.status }
      );
    }

    console.log(`[ElevenLabs] Audio generated successfully: ${result.buffer.byteLength} bytes`);

    return new NextResponse(result.buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': result.buffer.byteLength.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ElevenLabs] Audio Generation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
