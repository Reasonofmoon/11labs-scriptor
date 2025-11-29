import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice IDs
const VOICE_ID_MINHEE = 'EXAVITQu4vr4xnSDxMaL'; // Bella
const VOICE_ID_DAL = 'ErXwobaYiN019PkySvjV'; // Antoni

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 500 });
  }

  try {
    const { text, type, voiceSettings, mode, voiceId: requestedVoiceId, modelId } = await req.json();

    if (type === 'speech' || type === 'sfx') {
      const voiceId = requestedVoiceId || (mode === 'children_book' ? VOICE_ID_MINHEE : VOICE_ID_DAL);
      
      // If it's an SFX item, wrap it in audio tags for v3 model
      const finalText = type === 'sfx' ? `[${text}]` : text;

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: finalText,
          model_id: modelId || 'eleven_turbo_v2_5', // Default to Turbo v2.5
          voice_settings: voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API Error: ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: { 'Content-Type': 'audio/mpeg' },
      });

    } 
    /* 
    // SFX Endpoint disabled to save quota - using Audio Tags instead
    else if (type === 'sfx') {
      ...
    } 
    */

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  } catch (error: any) {
    console.error('Audio Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
