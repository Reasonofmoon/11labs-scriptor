# ReadMaster AI

An immersive audiobook generator powered by ElevenLabs AI. Transform any text into high-quality, expressive audio with multiple voice options and models.

## Features

- Real-time text-to-speech generation using ElevenLabs API
- Multiple voice and model selection
- Two modes: Story Mode and Exam Mode
- Audio visualization with waveform display
- Export options: TXT, JSON, and SRT formats
- Prefetching and caching for smooth playback
- Fallback to browser TTS if API fails

## Prerequisites

- Node.js 18+ installed
- ElevenLabs API key (get one at [elevenlabs.io](https://elevenlabs.io))

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure your ElevenLabs API key:

Create or edit the `.env` file in the project root:

```bash
ELEVENLABS_API_KEY=your_actual_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## ElevenLabs Configuration

The application uses the following ElevenLabs settings:

- **Default Model**: `eleven_turbo_v2_5` (fastest, multilingual)
- **Available Models**:
  - Eleven v3 (Flagship, most expressive)
  - Turbo v2.5 (Fastest, multilingual)
  - Flash v2.5 (Ultra-low latency)
  - Multilingual v2 (Legacy high quality)
  - English v1 (Legacy)

- **Voice Settings**:
  - Stability: 0.5 (normalized to 0.0, 0.5, or 1.0)
  - Similarity Boost: 0.75

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-audio/   # ElevenLabs TTS API endpoint
│   │   └── voices/            # Voice list API endpoint
│   └── page.tsx               # Main application page
├── components/
│   ├── AudioSequencer.tsx     # Audio playback controller
│   ├── ScriptDisplay.tsx      # Script viewer
│   ├── Visualizer.tsx         # Audio visualizer
│   └── VoiceSelector.tsx      # Voice/model selector
└── lib/
    ├── audio-player.ts        # Audio player utility
    ├── audio-cache.ts         # Audio caching system
    ├── export-utils.ts        # Export functionality
    ├── script-generator.ts    # Script generation
    └── types.ts               # TypeScript types
```

## API Routes

### POST /api/generate-audio

Generates audio from text using ElevenLabs API.

**Request Body**:
```json
{
  "text": "Text to convert to speech",
  "type": "speech" | "sfx",
  "mode": "children_book" | "exam_passage",
  "voiceId": "optional_voice_id",
  "modelId": "optional_model_id",
  "voiceSettings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}
```

**Response**: Audio file (audio/mpeg)

### GET /api/voices

Retrieves available voices from ElevenLabs.

**Response**:
```json
{
  "voices": [
    {
      "voice_id": "...",
      "name": "...",
      "category": "...",
      "labels": {...}
    }
  ]
}
```

## Usage

1. Select a mode (Story or Exam)
2. Choose a voice and model
3. Paste your text
4. Click "Generate Immersive Audio"
5. Play the generated audio
6. Export in your preferred format

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

**API Key not working**: Ensure your ElevenLabs API key is correctly set in the `.env` file

**Quota exceeded**: Check your ElevenLabs account credits

**Audio not playing**: The app will fallback to browser TTS if the API fails

## Technologies Used

- Next.js 16
- React 19
- ElevenLabs API
- Tailwind CSS
- Framer Motion
- TypeScript
