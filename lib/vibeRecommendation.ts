import type { DemoTrack } from "./demoTracks";

/**
 * The 2025 Drawing Music taste engine, mapped to the 2026 demo library.
 * The feature vectors are editorial approximations based on demo track mood
 * and genre, NOT DSP measurements, an AI model, or real listener analytics.
 */
export type VibeProfile = {
  bpm: number;
  energy: number;
  danceability: number;
  valence: number;
};

export const DEFAULT_VIBE: VibeProfile = {
  bpm: 104,
  energy: 0.53,
  danceability: 0.54,
  valence: 0.62,
};

type FeatureVector = VibeProfile;
const MOOD_FEATURES: Record<string, Omit<FeatureVector, "bpm">> = {
  "편안": { energy: 0.26, danceability: 0.26, valence: 0.68 },
  "밤": { energy: 0.69, danceability: 0.73, valence: 0.48 },
  "집중": { energy: 0.32, danceability: 0.38, valence: 0.59 },
  "에너지": { energy: 0.87, danceability: 0.81, valence: 0.77 },
  "우주": { energy: 0.47, danceability: 0.31, valence: 0.44 },
};
const DEFAULT_FEATURES = { energy: 0.5, danceability: 0.5, valence: 0.5 };

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function getTrackVibe(track: DemoTrack): FeatureVector {
  return {
    bpm: track.bpm,
    ...(MOOD_FEATURES[track.mood] ?? DEFAULT_FEATURES),
  };
}

export function vibeScore(track: DemoTrack, profile: VibeProfile): number {
  const features = getTrackVibe(track);
  const bpmDistance = Math.min(1, Math.abs(features.bpm - profile.bpm) / 90);
  const distance = bpmDistance * 0.25
    + Math.abs(features.energy - profile.energy) * 0.25
    + Math.abs(features.danceability - profile.danceability) * 0.30
    + Math.abs(features.valence - profile.valence) * 0.20;
  return Math.round(clamp01(1 - distance) * 100);
}

export function vibeReason(track: DemoTrack, profile: VibeProfile): string {
  const features = getTrackVibe(track);
  if (Math.abs(features.bpm - profile.bpm) < 12) return "선호 템포에 가까운 리듬";
  if (Math.abs(features.energy - profile.energy) < 0.14) return "지금 고른 에너지와 비슷한 무드";
  if (features.energy > profile.energy) return "조금 더 선명하고 역동적인 발견";
  if (features.valence > profile.valence) return "조금 더 밝은 색감의 멜로디";
  return "분위기를 차분하게 전환할 수 있는 곡";
}

export function learnFromLike(profile: VibeProfile, track: DemoTrack): VibeProfile {
  const vibe = getTrackVibe(track);
  const lerp = (current: number, next: number) => current * 0.75 + next * 0.25;
  return {
    bpm: Math.round(lerp(profile.bpm, vibe.bpm)),
    energy: clamp01(lerp(profile.energy, vibe.energy)),
    danceability: clamp01(lerp(profile.danceability, vibe.danceability)),
    valence: clamp01(lerp(profile.valence, vibe.valence)),
  };
}
