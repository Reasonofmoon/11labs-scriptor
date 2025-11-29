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
