"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type Track = {
  id?: string;
  title: string;
  artist: string;

  coverEmoji?: string; // "🎧" 같은거
  bpm?: number;
  key?: string;

  energy?: number; // 0~100 (선택)
  vibe?: string; // "차분", "네온", "폭발" 같은거
  tags?: string[];

  note?: string; // 추천 이유(짧게)
  href?: string; // 있으면 카드 전체가 링크처럼 동작
};

export default function TrackCard({ track }: { track: Track }) {
  const [open, setOpen] = useState(false);

  const energyLabel = useMemo(() => {
    if (track.energy === undefined) return null;
    if (track.energy >= 75) return "🔥 High";
    if (track.energy >= 45) return "⚡ Mid";
    return "🫧 Low";
  }, [track.energy]);

  const CardInner = (
    <>
      <div className="dm-track-head">
        <div className="dm-track-cover" aria-hidden>
          {track.coverEmoji || "🎵"}
        </div>

        <div className="dm-track-meta">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <strong className="dm-track-title">{track.title}</strong>
            {track.vibe ? <span className="dm-mini">✨ {track.vibe}</span> : null}
          </div>
          <div className="dm-muted" style={{ marginTop: 2 }}>
            {track.artist}
          </div>
        </div>

        <div className="dm-track-actions">
          <button className="dm-icon-btn" type="button" title="Play (mock)">
            ▶
          </button>
          <button className="dm-icon-btn" type="button" title="Like (mock)">
            ♡
          </button>
        </div>
      </div>

      {/* stats */}
      {(track.bpm || track.key || track.energy !== undefined) && (
        <div className="dm-track-stats">
          {track.bpm ? <span className="dm-stat">🎚️ {track.bpm} BPM</span> : null}
          {track.key ? <span className="dm-stat">🎼 {track.key}</span> : null}
          {track.energy !== undefined ? (
            <span className="dm-stat">
              {energyLabel} · {track.energy}%
            </span>
          ) : null}
        </div>
      )}

      {/* energy bar */}
      {track.energy !== undefined && (
        <div className="dm-meter" aria-label="energy meter">
          <div className="dm-meter-bar" style={{ width: `${track.energy}%` }} />
        </div>
      )}

      {/* tags */}
      {track.tags?.length ? (
        <div className="dm-tags">
          {track.tags.map((t) => (
            <span key={t} className="dm-tag">
              #{t}
            </span>
          ))}
        </div>
      ) : null}

      {/* reason (toggle) */}
      {track.note ? (
        <>
          <button
            type="button"
            className="dm-chip"
            style={{ marginTop: 10 }}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "🙈 이유 접기" : "🧠 추천 이유 보기"}
          </button>

          {open ? (
            <p className="dm-muted" style={{ marginTop: 10, marginBottom: 0 }}>
              {track.note}
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );

  return track.href ? (
    <Link href={track.href} className="dm-card dm-track" style={{ display: "block" }}>
      {CardInner}
    </Link>
  ) : (
    <article className="dm-card dm-track">{CardInner}</article>
  );
}
