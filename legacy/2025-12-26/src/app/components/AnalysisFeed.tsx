"use client";

import { useEffect, useMemo, useState } from "react";

type Track = {
  id: string;
  title: string;
  artist: string;
  coverEmoji: string;
  bpm: number;
  key: string;
  energy: number;       // 0~1
  danceability: number; // 0~1
  valence: number;      // 0~1 (밝기/긍정)
  tags: string[];
};

type VibeProfile = {
  bpm: number;
  energy: number;
  danceability: number;
  valence: number;
};

const PROFILE_KEY = "dm_vibe_profile_v1";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const TRACKS: Track[] = [
  {
    id: "t1",
    title: "Paper Sky",
    artist: "Luna Draft",
    coverEmoji: "☁️",
    bpm: 92,
    key: "C major",
    energy: 0.38,
    danceability: 0.42,
    valence: 0.62,
    tags: ["Lo-fi", "따뜻", "공부용", "잔잔"],
  },
  {
    id: "t2",
    title: "Neon Alley",
    artist: "Grape Runner",
    coverEmoji: "🟣",
    bpm: 128,
    key: "F minor",
    energy: 0.82,
    danceability: 0.78,
    valence: 0.46,
    tags: ["EDM", "드라이브", "밤", "펀치"],
  },
  {
    id: "t3",
    title: "Mint Steps",
    artist: "Aqua Sketch",
    coverEmoji: "🌿",
    bpm: 110,
    key: "D major",
    energy: 0.55,
    danceability: 0.66,
    valence: 0.72,
    tags: ["Pop", "상큼", "산책", "리듬"],
  },
  {
    id: "t4",
    title: "Inkstorm",
    artist: "Black Brush",
    coverEmoji: "🖤",
    bpm: 140,
    key: "E minor",
    energy: 0.92,
    danceability: 0.62,
    valence: 0.30,
    tags: ["Rock", "폭발", "드럼", "집중"],
  },
  {
    id: "t5",
    title: "Peach Sunset",
    artist: "Soft Palette",
    coverEmoji: "🍑",
    bpm: 100,
    key: "A major",
    energy: 0.46,
    danceability: 0.58,
    valence: 0.84,
    tags: ["Acoustic", "감성", "노을", "포근"],
  },
  {
    id: "t6",
    title: "Circuit Bloom",
    artist: "Synth Garden",
    coverEmoji: "🌸",
    bpm: 124,
    key: "G minor",
    energy: 0.74,
    danceability: 0.81,
    valence: 0.55,
    tags: ["Synthwave", "레트로", "빛", "질주"],
  },
  {
    id: "t7",
    title: "Quiet Museum",
    artist: "Gray Canvas",
    coverEmoji: "🏛️",
    bpm: 78,
    key: "B♭ major",
    energy: 0.22,
    danceability: 0.28,
    valence: 0.58,
    tags: ["Piano", "고요", "전시", "힐링"],
  },
  {
    id: "t8",
    title: "Collab Spark",
    artist: "Roommates",
    coverEmoji: "⚡",
    bpm: 115,
    key: "E major",
    energy: 0.64,
    danceability: 0.72,
    valence: 0.66,
    tags: ["Indie", "합주", "청량", "기분업"],
  },
];

function defaultProfile(): VibeProfile {
  return { bpm: 110, energy: 0.55, danceability: 0.6, valence: 0.62 };
}

function loadProfile(): VibeProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const p = JSON.parse(raw) as VibeProfile;
    return {
      bpm: typeof p.bpm === "number" ? p.bpm : 110,
      energy: clamp01(typeof p.energy === "number" ? p.energy : 0.55),
      danceability: clamp01(typeof p.danceability === "number" ? p.danceability : 0.6),
      valence: clamp01(typeof p.valence === "number" ? p.valence : 0.62),
    };
  } catch {
    return defaultProfile();
  }
}

function saveProfile(p: VibeProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

function scoreTrack(track: Track, p: VibeProfile) {
  // bpm은 범위가 크니까 60~160 사이로 정규화해서 거리 계산
  const bpmN = (n: number) => clamp01((n - 60) / 100);
  const dbpm = Math.abs(bpmN(track.bpm) - bpmN(p.bpm));
  const de = Math.abs(track.energy - p.energy);
  const dd = Math.abs(track.danceability - p.danceability);
  const dv = Math.abs(track.valence - p.valence);

  // 가중치: bpm/댄스/에너지/밝기
  const dist = dbpm * 0.25 + dd * 0.30 + de * 0.25 + dv * 0.20;
  const s = clamp01(1 - dist);
  return s; // 0~1
}

function makeReasons(track: Track, p: VibeProfile) {
  const reasons: string[] = [];

  const bpmDiff = Math.abs(track.bpm - p.bpm);
  if (bpmDiff <= 6) reasons.push(`BPM이 딱 비슷함 (${track.bpm})`);
  else if (bpmDiff <= 14) reasons.push(`BPM이 근처라 자연스러움 (${track.bpm})`);
  else reasons.push(`BPM은 좀 다르지만 분위기로 커버 가능`);

  const energyDiff = Math.abs(track.energy - p.energy);
  if (energyDiff <= 0.10) reasons.push(`에너지 레벨이 취향대 (${Math.round(track.energy * 100)}%)`);
  else if (track.energy > p.energy) reasons.push(`지금보다 더 불타는 에너지 🔥`);
  else reasons.push(`지금보다 더 차분하게 내려앉는 에너지 🌙`);

  const vDiff = Math.abs(track.valence - p.valence);
  if (vDiff <= 0.12) reasons.push(`무드 밝기 딱 맞음 ✨`);
  else if (track.valence > p.valence) reasons.push(`좀 더 상큼/희망 느낌 🍑`);
  else reasons.push(`좀 더 어둡고 멋있는 톤 🖤`);

  return reasons;
}

export default function AnalysisFeed() {
  const [profile, setProfile] = useState<VibeProfile | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"forYou" | "new">("forYou");

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
  }, []);

  const ranked = useMemo(() => {
    if (!profile) return [];
    const list = [...TRACKS];

    if (mode === "new") {
      // "New" 모드: 점수보다 "랜덤 느낌" + 아직 Like 안 한 것 우선
      const notLiked = list.filter((t) => !likedIds[t.id]);
      const liked = list.filter((t) => likedIds[t.id]);
      return [...notLiked, ...liked];
    }

    // For You 모드: 점수순 정렬
    return list
      .map((t) => ({ t, s: scoreTrack(t, profile) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.t);
  }, [profile, likedIds, mode]);

  const vibeSummary = useMemo(() => {
    if (!profile) return null;
    return {
      bpm: Math.round(profile.bpm),
      energy: Math.round(profile.energy * 100),
      danceability: Math.round(profile.danceability * 100),
      valence: Math.round(profile.valence * 100),
    };
  }, [profile]);

  const onLike = (track: Track) => {
    if (!profile) return;

    setLikedIds((prev) => ({ ...prev, [track.id]: true }));

    // 👍 간단 학습: 현재 프로필과 트랙 특징을 평균내서 다음 프로필로
    const next: VibeProfile = {
      bpm: Math.round(profile.bpm * 0.75 + track.bpm * 0.25),
      energy: clamp01(profile.energy * 0.75 + track.energy * 0.25),
      danceability: clamp01(profile.danceability * 0.75 + track.danceability * 0.25),
      valence: clamp01(profile.valence * 0.75 + track.valence * 0.25),
    };

    setProfile(next);
    saveProfile(next);
  };

  const onReset = () => {
    const p = defaultProfile();
    setProfile(p);
    saveProfile(p);
    setLikedIds({});
  };

  if (!profile) {
    return <div className="dm-card">분석 엔진 부팅 중… 🧠⚙️</div>;
  }

  return (
    <div className="dm-feed-wrap">
      <div className="dm-feed-top">
        <div className="dm-card dm-vibe">
          <div className="dm-vibe-title">
            <strong>🎯 Your Vibe Profile</strong>
            <span className="dm-muted">로컬에서만 저장됨</span>
          </div>

          <div className="dm-vibe-grid">
            <div className="dm-vibe-pill">BPM <b>{vibeSummary?.bpm}</b></div>
            <div className="dm-vibe-pill">Energy <b>{vibeSummary?.energy}%</b></div>
            <div className="dm-vibe-pill">Dance <b>{vibeSummary?.danceability}%</b></div>
            <div className="dm-vibe-pill">Mood <b>{vibeSummary?.valence}%</b></div>
          </div>

          <div className="dm-vibe-actions">
            <button className="dm-chip" type="button" onClick={() => setMode("forYou")}>
              For You
            </button>
            <button className="dm-chip" type="button" onClick={() => setMode("new")}>
              New
            </button>
            <button className="dm-chip" type="button" onClick={onReset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="dm-feed-grid">
        {ranked.map((track) => {
          const s = scoreTrack(track, profile);
          const percent = Math.round(s * 100);
          const reasons = makeReasons(track, profile);

          return (
            <article key={track.id} className="dm-card dm-track">
              <div className="dm-track-head">
                <div className="dm-track-cover" aria-hidden>
                  {track.coverEmoji}
                </div>

                <div className="dm-track-meta">
                  <strong className="dm-track-title">{track.title}</strong>
                  <div className="dm-muted">{track.artist}</div>
                </div>

                <div className="dm-score" title="취향 매칭 점수">
                  <span className="dm-score-num">{percent}</span>
                  <span className="dm-score-unit">%</span>
                </div>
              </div>

              <div className="dm-track-stats">
                <span className="dm-stat">🎚️ {track.bpm} BPM</span>
                <span className="dm-stat">🎼 {track.key}</span>
                <span className="dm-stat">⚡ {Math.round(track.energy * 100)}%</span>
                <span className="dm-stat">🕺 {Math.round(track.danceability * 100)}%</span>
                <span className="dm-stat">✨ {Math.round(track.valence * 100)}%</span>
              </div>

              <div className="dm-tags">
                {track.tags.map((tag) => (
                  <span key={tag} className="dm-tag">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="dm-analysis">
                <div className="dm-analysis-title">🧠 Algorithm Insight</div>
                <ul className="dm-analysis-list">
                  {reasons.slice(0, 3).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="dm-track-actions">
                <button
                  className="ink-btn"
                  type="button"
                  onClick={() => onLike(track)}
                >
                  👍 Like & Learn
                </button>

                <button
                  className="dm-chip"
                  type="button"
                  onClick={() => setLikedIds((p) => ({ ...p, [track.id]: false }))}
                  title="좋아요 상태 해제"
                >
                  Undo
                </button>

                <a className="dm-chip" href="/feed">
                  Go Feed →
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
