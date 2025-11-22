export class SoundManager {
  private static instance: SoundManager;
  private audioCtx: AudioContext | null = null;

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  public playTypingSound() {
    this.initAudioContext();
    if (!this.audioCtx) return;

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    // Low frequency click/thud
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(150, this.audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      50,
      this.audioCtx.currentTime + 0.1
    );

    // Short burst
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioCtx.currentTime + 0.1
    );

    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + 0.1);
  }
}
