import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const VOICE_ID_MINHEE = 'EXAVITQu4vr4xnSDxMaL';
const VOICE_ID_DAL = 'ErXwobaYiN019PkySvjV';

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

    const voiceId = requestedVoiceId || (mode === 'children_book' ? VOICE_ID_MINHEE : VOICE_ID_DAL);
    const finalText = type === 'sfx' ? `[${text}]` : text;
    const model = modelId || 'eleven_turbo_v2_5';

    console.log(`[ElevenLabs] Generating audio: Voice=${voiceId}, Model=${model}, Type=${type}, Length=${finalText.length}`);

    const stability = voiceSettings?.stability ?? 0.5;
    const normalizedStability = [0.0, 0.5, 1.0].reduce((prev, curr) =>
      Math.abs(curr - stability) < Math.abs(prev - stability) ? curr : prev
    );

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: finalText,
        model_id: model,
        voice_settings: {
          stability: normalizedStability,
          similarity_boost: voiceSettings?.similarity_boost ?? 0.75,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ElevenLabs] API Error (${response.status}):`, errorText);

      let errorMessage = 'Failed to generate audio';
      if (response.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded or quota exceeded';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request parameters';
      }

      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`[ElevenLabs] Audio generated successfully: ${audioBuffer.byteLength} bytes`);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error('[ElevenLabs] Audio Generation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
