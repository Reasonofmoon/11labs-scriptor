import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function GET() {
  if (!ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY is not configured');
    return NextResponse.json(
      { error: 'ElevenLabs API Key not configured. Please add your API key to .env file.' },
      { status: 500 }
    );
  }

  try {
    console.log('[ElevenLabs] Fetching available voices...');

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ElevenLabs] Failed to fetch voices (${response.status}):`, errorText);

      let errorMessage = 'Failed to fetch voices';
      if (response.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
      }

      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[ElevenLabs] Successfully fetched ${data.voices?.length || 0} voices`);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ElevenLabs] Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
