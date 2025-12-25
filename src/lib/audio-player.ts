export class AudioPlayer {
  private audio: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  constructor() {
    this.audio = new Audio();
  }

  async play(url: string): Promise<void> {
    this.audio.src = url;
    await this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = '';
  }

  onEnded(callback: () => void): void {
    this.audio.onended = callback;
  }

  onError(callback: () => void): void {
    this.audio.onerror = callback;
  }

  initializeAnalyser(): AnalyserNode | null {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      if (!this.sourceNode) {
        this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }
    } else if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.analyser;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  destroy(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
