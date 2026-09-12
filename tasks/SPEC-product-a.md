# Product A — TTS quality, real SFX, voice sunset, mix export

Date: 2026-09-12

## Goal

Turn the current demo into a usable first product slice:

1. Replace deprecated Turbo with current ElevenLabs models via quality presets.
2. Generate real SFX through `eleven_text_to_sound_v2`.
3. Make default Minhee/Dal voices overridable before Default voices expire on 2026-12-31.
4. Pass Exam `problemType` into the LLM prompt (and show a selector).
5. Export a single mixed audio file of the full sequence.

## Quality presets

| Preset | Model ID | Default for |
|--------|----------|-------------|
| Fast | `eleven_flash_v2_5` | API fallback |
| Stable | `eleven_multilingual_v2` | Exam Mode |
| Expressive | `eleven_v3` | Story Mode |

Removed from UI: `eleven_turbo_v2_5`, `eleven_monolingual_v1`.

## Voices

Hardcoded Bella/Antoni IDs remain as last-resort fallbacks (still work until 2026-12-31).
Override with `ELEVENLABS_VOICE_MINHEE` / `ELEVENLABS_VOICE_DAL`.
Voice dropdown marks `premade` voices as expiring.

## SFX

`type: sfx` → `POST /v1/sound-generation` with `eleven_text_to_sound_v2`.
Speech still uses `/v1/text-to-speech/{voiceId}`.

## Mix export

Decode each generated blob, resample to 44.1 kHz, concatenate, download WAV.
WAV (not MP3) because SFX and speech may use different codecs/sample rates.

## Out of scope

Auth, billing, multi-provider TTS, realtime conversational tutor.
