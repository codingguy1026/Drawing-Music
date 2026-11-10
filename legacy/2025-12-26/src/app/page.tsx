import Link from "next/link";
import PageShell from "./components/PageShell";
import TrackCard, { Track } from "./components/TrackCard";

const preview: Track[] = [
  {
    title: "Peach Sunset",
    artist: "Soft Palette",
    coverEmoji: "🍑",
    bpm: 100,
    key: "A major",
    tags: ["감성", "노을", "어쿠스틱"],
    note: "추천 이유: 고역대가 부드럽고, 보컬 중심 믹스라 퇴근길 집중에 잘 맞음.",
  },
  {
    title: "Inkstorm",
    artist: "Black Brush",
    coverEmoji: "🖤",
    bpm: 140,
    key: "E minor",
    tags: ["록", "집중", "드럼"],
    note: "추천 이유: 킥/스네어 대비가 강해서 텐션 올릴 때 효율 좋음.",
  },
  {
    title: "Neon Alley",
    artist: "Grape Runner",
    coverEmoji: "🟣",
    bpm: 128,
    key: "F minor",
    tags: ["EDM", "밤", "드라이브"],
    note: "추천 이유: 베이스 라인이 일정해서 주행 리듬에 안정적으로 맞음.",
  },
];

export default function Home() {
  return (
    <PageShell
      title="🎨 Drawing Music"
      subtitle="음악을 그리고, 음악으로 연결된다."
      right={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="ink-btn" href="/feed">
            🎧 Go to Feed
          </Link>
          <Link className="dm-chip" href="/upload">
            ⬆️ Upload
          </Link>
        </div>
      }
    >
      {/* Hero */}
      <section className="dm-hero">
        <div className="dm-hero-card dm-card">
          <div className="dm-hero-top">
            <span className="dm-hero-emoji">🖌️</span>
            <div>
              <h2 className="dm-hero-title">그리는 음악, 보이는 추천</h2>
              <p className="dm-muted" style={{ margin: "6px 0 0" }}>
                “좋은 곡”만 던지는 게 아니라, <b>왜 좋은지</b>까지 말해주는 피드.
              </p>
            </div>
          </div>

          <div className="dm-hero-points">
            <div className="dm-point">
              <b>🧠 분석</b>
              <span className="dm-muted">BPM/키/에너지/분위기 요약</span>
            </div>
            <div className="dm-point">
              <b>✨ 추천</b>
              <span className="dm-muted">오늘의 무드에 맞춘 큐레이션</span>
            </div>
            <div className="dm-point">
              <b>🤝 연결</b>
              <span className="dm-muted">콜랩 룸에서 같이 제작/공유</span>
            </div>
          </div>

          <div className="dm-hero-cta">
            <Link className="ink-btn" href="/signup">
              ✨ Sign up
            </Link>
            <Link className="dm-chip" href="/login">
              🔑 Login
            </Link>
            <Link className="dm-chip" href="/explore">
              🔎 Explore
            </Link>
          </div>
        </div>

        {/* Right side mini panel */}
        <div className="dm-card dm-hero-side">
          <b>🗓️ Today’s Vibe</b>
          <p className="dm-muted" style={{ marginTop: 8 }}>
            “차분 + 약간 네온” 확률 높음 😏
          </p>
          <div className="dm-progress">
            <div className="dm-progress-bar" style={{ width: "68%" }} />
          </div>
          <p className="dm-muted" style={{ marginTop: 8 }}>Match 68%</p>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="dm-tag">#study</span>
            <span className="dm-tag">#night</span>
            <span className="dm-tag">#soft</span>
          </div>
        </div>
      </section>

      {/* Preview only */}
      <h2 className="dm-h2">👀 Feed Preview (맛보기)</h2>
      <section className="dm-feed-grid">
        {preview.map((t) => (
          <TrackCard key={t.title} track={t} />
        ))}
      </section>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
        <Link className="ink-btn" href="/feed">
          👉 피드에서 전체 보기
        </Link>
      </div>
    </PageShell>
  );
}
