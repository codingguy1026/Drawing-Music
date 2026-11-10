"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Heart, Play, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import AlbumArt from "./AlbumArt";
import type { DemoTrack } from "../lib/demoTracks";
import {
  DEFAULT_VIBE, clamp01, learnFromLike, vibeReason, vibeScore,
  type VibeProfile,
} from "../lib/vibeRecommendation";

type Props = {
  tracks: DemoTrack[];
  liked: string[];
  recent: string[];
  onPlay: (track: DemoTrack) => void;
  onLike: (id: string) => void;
};

const STORAGE_KEY = "dmusic:vibe:2025-2026:v1";
type TasteMode = "forYou" | "fresh";

function isVibeProfile(input: unknown): input is VibeProfile {
  if (typeof input !== "object" || input === null) return false;
  const value = input as Record<string, unknown>;
  return ["bpm", "energy", "danceability", "valence"].every(key =>
    typeof value[key] === "number" && Number.isFinite(value[key])
  ) && Number(value.bpm) >= 60 && Number(value.bpm) <= 180
    && ["energy", "danceability", "valence"].every(key =>
      Number(value[key]) >= 0 && Number(value[key]) <= 1
    );
}

export default function VibeDiscovery({ tracks, liked, recent, onPlay, onLike }: Props) {
  const [profile, setProfile] = useState<VibeProfile>(DEFAULT_VIBE);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<TasteMode>("forYou");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: unknown = JSON.parse(raw);
        if (isVibeProfile(stored)) setProfile(stored);
      }
    } catch {
      // Safari private mode and disabled storage should not block discovery.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // The recommendation UI continues to work without storage.
    }
  }, [profile, ready]);

  const recommendations = useMemo(() => {
    const ranked = tracks.map(track => ({
      track,
      score: vibeScore(track, profile),
      explanation: vibeReason(track, profile),
    }));
    ranked.sort((a, b) => {
      if (mode === "fresh") {
        const unseenA = liked.includes(a.track.id) || recent.includes(a.track.id) ? 0 : 1;
        const unseenB = liked.includes(b.track.id) || recent.includes(b.track.id) ? 0 : 1;
        if (unseenA !== unseenB) return unseenB - unseenA;
      }
      return b.score - a.score || a.track.title.localeCompare(b.track.title);
    });
    return ranked.slice(0, 3);
  }, [tracks, profile, mode, liked, recent]);

  const updatePreference = (field: keyof VibeProfile, value: number) => {
    setProfile(current => ({ ...current, [field]: field === "bpm" ? value : clamp01(value) }));
  };

  const likeTrack = (track: DemoTrack) => {
    if (!liked.includes(track.id)) {
      setProfile(current => learnFromLike(current, track));
    }
    onLike(track.id);
  };

  const sliders: { field: keyof VibeProfile; name: string; min: number; max: number; step: number; value: string }[] = [
    { field: "bpm", name: "템포", min: 60, max: 180, step: 1, value: Math.round(profile.bpm) + " BPM" },
    { field: "energy", name: "에너지", min: 0, max: 1, step: 0.01, value: Math.round(profile.energy * 100) + "%" },
    { field: "danceability", name: "리듬감", min: 0, max: 1, step: 0.01, value: Math.round(profile.danceability * 100) + "%" },
    { field: "valence", name: "밝기", min: 0, max: 1, step: 0.01, value: Math.round(profile.valence * 100) + "%" },
  ];

  return (
    <section id="for-you" className="vibe-section" aria-labelledby="vibe-title">
      <div className="vibe-shell">
        <div className="vibe-head">
          <div>
            <span className="vibe-eyebrow"><Sparkles size={14} /> THE 2025 LAB, REIMAGINED</span>
            <h2 id="vibe-title">너의 취향으로, 음악을 그리다.</h2>
            <p>2025년의 추천 실험실을 2026년 플레이어에 연결했어요.</p>
          </div>
          <span className="vibe-edition">DM <span>25</span> × <span>26</span></span>
        </div>

        <div className="vibe-grid">
          <aside className="vibe-profile">
            <div className="vibe-panel-heading">
              <strong><SlidersHorizontal size={17}/> MY VIBE</strong>
              <button type="button" onClick={() => setProfile(DEFAULT_VIBE)} aria-label="음악 취향 초기화" title="기본 취향으로 초기화"><RotateCcw size={15}/> 초기화</button>
            </div>
            <p>슬라이더를 조절하거나 음악에 하트를 눌러 취향을 조금씩 학습시켜 보세요.</p>
            <div className="vibe-sliders">
              {sliders.map(slider => (
                <label className="vibe-slider" key={slider.field}>
                  <span><b>{slider.name}</b><output>{slider.value}</output></span>
                  <input type="range" min={slider.min} max={slider.max} step={slider.step}
                    value={profile[slider.field]} onChange={event => updatePreference(slider.field, Number(event.target.value))}
                    aria-label={slider.name} />
                </label>
              ))}
            </div>
            <div className="vibe-profile-foot">
              <span className="vibe-soft-dot" />
              이 브라우저에만 취향이 저장돼요.
            </div>
          </aside>

          <div className="vibe-results">
            <div className="vibe-results-head">
              <div><strong>DISCOVER YOUR SOUND</strong><small>지금 들을 수 있는 데모 3곡</small></div>
              <div className="vibe-tabs" aria-label="음악 추천 방식">
                <button type="button" aria-pressed={mode === "forYou"} className={mode === "forYou" ? "active" : ""} onClick={() => setMode("forYou")}>For You</button>
                <button type="button" aria-pressed={mode === "fresh"} className={mode === "fresh" ? "active" : ""} onClick={() => setMode("fresh")}>새로운 발견</button>
              </div>
            </div>

            <div className="vibe-rec-list">
              {recommendations.map(({ track, score, explanation }, index) => {
                const isLiked = liked.includes(track.id);
                return (
                  <article className="vibe-rec" key={track.id}>
                    <span className="vibe-rec-index">{String(index + 1).padStart(2, "0")}</span>
                    <AlbumArt track={track} compact className="vibe-cover" />
                    <div className="vibe-rec-body">
                      <div className="vibe-rec-name">
                        <strong>{track.title}</strong>
                        <span>{track.genre} · {track.mood} · {track.bpm} BPM</span>
                      </div>
                      <p><Sparkles size={12}/>{explanation}</p>
                    </div>
                    <div className="vibe-rec-actions">
                      <div className="vibe-match"><b>{score}%</b><small>취향 적합도</small></div>
                      <div className="vibe-action-buttons">
                        <button type="button" className="vibe-listen" onClick={() => onPlay(track)} aria-label={track.title + " 재생"}><Play size={15} fill="currentColor"/> 듣기</button>
                        <button type="button" className={isLiked ? "vibe-like active" : "vibe-like"} aria-label={track.title + (isLiked ? " 좋아요 취소" : " 좋아요 및 취향 학습")} aria-pressed={isLiked} onClick={() => likeTrack(track)}>
                          <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {!recommendations.length && <p className="vibe-empty">추천할 수 있는 음악이 아직 없어요.</p>}
            </div>
            <div className="vibe-results-foot">
              <span>추천 점수는 데모의 BPM·장르·분위기를 바탕으로 한 간단한 취향 계산입니다. AI 음원 분석이나 실제 청취 데이터가 아니에요.</span>
              <a href="#discover">전체 데모 보기 <ArrowUpRight size={15}/></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
