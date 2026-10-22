export type DemoTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string;
  duration: number;
  bpm: number;
  notes: number[];
  artwork: string;
};

export const DEMO_TRACKS: DemoTrack[] = [
  {
    id: "afterglow", title: "Afterglow", artist: "Drawing Studio",
    album: "Colors of Space", genre: "Ambient", mood: "편안",
    duration: 102, bpm: 92, artwork: "afterglow",
    notes: [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66, 261.63, 329.63, 440, 392],
  },
  {
    id: "nightdrive", title: "Midnight Circuit", artist: "Drawing Studio",
    album: "Digital Dreams", genre: "Electronic", mood: "밤",
    duration: 116, bpm: 122, artwork: "nightdrive",
    notes: [220, 261.63, 329.63, 440, 392, 329.63, 261.63, 196, 220, 329.63, 392, 293.66],
  },
  {
    id: "paperplanets", title: "Paper Planets", artist: "Drawing Studio",
    album: "Colors of Space", genre: "Lo-fi", mood: "집중",
    duration: 128, bpm: 78, artwork: "paperplanets",
    notes: [293.66, 349.23, 440, 523.25, 440, 349.23, 293.66, 261.63, 293.66, 392, 349.23, 329.63],
  },
  {
    id: "tidal", title: "Neon Tides", artist: "Drawing Studio",
    album: "Digital Dreams", genre: "Synthwave", mood: "에너지",
    duration: 108, bpm: 114, artwork: "tidal",
    notes: [329.63, 392, 493.88, 587.33, 493.88, 392, 329.63, 392, 440, 523.25, 440, 349.23],
  },
  {
    id: "martianrain", title: "Rain on Mars", artist: "Drawing Studio",
    album: "Quiet Orbit", genre: "Ambient", mood: "편안",
    duration: 142, bpm: 72, artwork: "martianrain",
    notes: [196, 246.94, 293.66, 369.99, 329.63, 293.66, 246.94, 220, 196, 246.94, 329.63, 293.66],
  },
  {
    id: "signal", title: "The Last Signal", artist: "Drawing Studio",
    album: "Quiet Orbit", genre: "Cinematic", mood: "우주",
    duration: 134, bpm: 88, artwork: "signal",
    notes: [174.61, 261.63, 349.23, 392, 349.23, 293.66, 261.63, 220, 196, 261.63, 329.63, 293.66],
  },
];

export function displayTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return String(Math.floor(safe / 60)) + ":" + String(safe % 60).padStart(2, "0");
}
