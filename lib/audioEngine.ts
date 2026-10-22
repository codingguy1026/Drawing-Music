import type { DemoTrack } from "./demoTracks";

// No external recordings are streamed. Demo melodies are synthesized locally
// through Web Audio after a user presses Play.
export class DemoAudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private track: DemoTrack | null = null;
  private offset = 0;
  private startedAt = 0;
  private playing = false;
  private nextBeat = 0;
  private nextBeatTime = 0;
  private scheduler: number | null = null;
  private voices: Set<OscillatorNode> = new Set();
  private volume = 0.65;

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
      this.setVolume(this.volume);
    }
    void this.context.resume();
    return this.context;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.volume * 0.22, this.context.currentTime, 0.02);
    }
  }

  getPosition(): number {
    if (!this.track) return 0;
    if (!this.playing || !this.context) return this.offset;
    return Math.min(this.track.duration, this.offset + this.context.currentTime - this.startedAt);
  }

  private haltVoices(): void {
    if (this.scheduler !== null) {
      window.clearInterval(this.scheduler);
      this.scheduler = null;
    }
    for (const voice of this.voices) {
      try { voice.stop(); } catch { /* Already stopped. */ }
    }
    this.voices.clear();
  }

  private playNote(frequency: number, when: number, beat: number): void {
    const ctx = this.context;
    const master = this.master;
    if (!ctx || !master || !frequency) return;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.type = beat % 4 === 0 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    const duration = Math.min(0.6, 48 / (this.track?.bpm || 100));
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.exponentialRampToValueAtTime(0.27, when + 0.035);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(envelope);
    envelope.connect(master);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.02);
    this.voices.add(oscillator);
    oscillator.onended = () => {
      this.voices.delete(oscillator);
      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  private scheduleAhead = (): void => {
    const ctx = this.context;
    const track = this.track;
    if (!this.playing || !ctx || !track) return;
    const beatLength = 60 / track.bpm;
    while (this.nextBeatTime < ctx.currentTime + 0.25) {
      const note = track.notes[this.nextBeat % track.notes.length];
      this.playNote(note, Math.max(ctx.currentTime, this.nextBeatTime), this.nextBeat);
      this.nextBeat += 1;
      this.nextBeatTime += beatLength;
    }
  };

  play(track: DemoTrack, position = 0): void {
    const ctx = this.ensureContext();
    this.haltVoices();
    this.track = track;
    this.offset = Math.min(track.duration, Math.max(0, position));
    this.startedAt = ctx.currentTime;
    this.nextBeat = Math.floor(this.offset / (60 / track.bpm));
    this.nextBeatTime = ctx.currentTime + 0.04;
    this.playing = true;
    this.scheduleAhead();
    this.scheduler = window.setInterval(this.scheduleAhead, 90);
  }

  pause(): void {
    if (!this.playing) return;
    this.offset = this.getPosition();
    this.playing = false;
    this.haltVoices();
  }

  resume(): void {
    if (this.track) this.play(this.track, this.offset);
  }

  seek(position: number): void {
    if (!this.track) return;
    const next = Math.max(0, Math.min(this.track.duration, position));
    if (this.playing) this.play(this.track, next);
    else this.offset = next;
  }

  dispose(): void {
    this.haltVoices();
    this.playing = false;
    if (this.context) void this.context.close();
    this.context = null;
    this.master = null;
  }
}
