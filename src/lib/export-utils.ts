import { ScriptItem } from './types';

export function downloadScriptAsText(items: ScriptItem[], filename: string = 'script.txt') {
  const textContent = items.map((item, index) => {
    const typeLabel = item.type === 'sfx' ? '[SFX]' : '[Speech]';
    return `${index + 1}. ${typeLabel}\n${item.content}\n`;
  }).join('\n');

  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadScriptAsJson(items: ScriptItem[], filename: string = 'script.json') {
  const jsonContent = JSON.stringify(items, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatSrtTime(seconds: number): string {
  const date = new Date(0);
  date.setMilliseconds(seconds * 1000);
  const iso = date.toISOString();
  // HH:mm:ss,SSS format
  return iso.substr(11, 8) + ',' + iso.substr(20, 3);
}

export async function generateAndDownloadSrt(
  items: ScriptItem[], 
  audioBlobs: Map<number, Blob>, 
  filename: string = 'subtitles.srt'
) {
  let currentTime = 0;
  let srtContent = '';

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const blob = audioBlobs.get(i);
    
    if (!blob) {
      console.warn(`Missing audio for item ${i}, skipping SRT entry`);
      continue;
    }

    // Get duration from blob
    const duration = await getBlobDuration(blob);
    
    const startTime = currentTime;
    const endTime = currentTime + duration;

    srtContent += `${i + 1}\n`;
    srtContent += `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n`;
    srtContent += `${item.content}\n\n`;

    currentTime = endTime;
  }

  const blob = new Blob([srtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getBlobDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(URL.createObjectURL(blob));
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = (e) => {
      reject(e);
      URL.revokeObjectURL(audio.src);
    };
  });
}

const MIX_SAMPLE_RATE = 44100;

async function decodeBlob(blob: Blob): Promise<AudioBuffer> {
  const ctx = new AudioContext();
  try {
    const data = await blob.arrayBuffer();
    return await ctx.decodeAudioData(data.slice(0));
  } finally {
    await ctx.close();
  }
}

async function resampleBuffer(buffer: AudioBuffer, sampleRate: number): Promise<AudioBuffer> {
  if (buffer.sampleRate === sampleRate) return buffer;
  const frameCount = Math.max(1, Math.ceil(buffer.duration * sampleRate));
  const offline = new OfflineAudioContext(buffer.numberOfChannels, frameCount, sampleRate);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0);
  return offline.startRendering();
}

function concatStereo(buffers: AudioBuffer[], sampleRate: number): AudioBuffer {
  const length = Math.max(1, buffers.reduce((total, buffer) => total + buffer.length, 0));
  const ctx = new AudioContext({ sampleRate });
  const output = ctx.createBuffer(2, length, sampleRate);
  void ctx.close();
  const left = output.getChannelData(0);
  const right = output.getChannelData(1);

  let offset = 0;
  for (const buffer of buffers) {
    const sourceLeft = buffer.getChannelData(0);
    const sourceRight = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : sourceLeft;
    left.set(sourceLeft, offset);
    right.set(sourceRight, offset);
    offset += buffer.length;
  }

  return output;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = samples * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let channel = 0; channel < numChannels; channel += 1) {
    channels.push(buffer.getChannelData(channel));
  }

  let offset = 44;
  for (let i = 0; i < samples; i += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function generateAndDownloadMix(
  items: ScriptItem[],
  audioBlobs: Map<number, Blob>,
  filename: string = 'readmaster-mix.wav'
) {
  const decoded: AudioBuffer[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const blob = audioBlobs.get(i);
    if (!blob) {
      console.warn(`Missing audio for item ${i}, skipping mix entry`);
      continue;
    }
    const buffer = await decodeBlob(blob);
    decoded.push(await resampleBuffer(buffer, MIX_SAMPLE_RATE));
  }

  if (decoded.length === 0) {
    throw new Error('No audio available to mix');
  }

  const mixed = concatStereo(decoded, MIX_SAMPLE_RATE);
  triggerDownload(audioBufferToWav(mixed), filename);
}
