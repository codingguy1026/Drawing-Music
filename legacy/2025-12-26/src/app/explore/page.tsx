import PageShell from "../components/PageShell";
import TrackCard, { Track } from "../components/TrackCard";

const trending: Track[] = [
  { title: "Neon Alley", artist: "Grape Runner", coverEmoji: "🟣", bpm: 128, key: "F minor", tags: ["EDM", "밤", "드라이브"] },
  { title: "Peach Sunset", artist: "Soft Palette", coverEmoji: "🍑", bpm: 100, key: "A major", tags: ["Acoustic", "감성", "노을"] },
  { title: "Inkstorm", artist: "Black Brush", coverEmoji: "🖤", bpm: 140, key: "E minor", tags: ["Rock", "집중", "드럼"] },
];

export default function ExplorePage() {
  return (
    <PageShell
      title="🔎 Explore"
      subtitle="태그로 탐험하고, 분위기로 발견하는 곳"
      right={
        <div className="dm-inline">
          <input className="dm-input" placeholder="Search… (예: lofi, rock, 120bpm)" />
          <button className="dm-chip" type="button">Search</button>
        </div>
      }
    >
      <section className="dm-grid">
        <div className="dm-card dm-panel">
          <strong>✨ Quick Filters</strong>
          <div className="dm-chips" style={{ marginTop: 10 }}>
            <span className="dm-chip">Lo-fi</span>
            <span className="dm-chip">Rock</span>
            <span className="dm-chip">EDM</span>
            <span className="dm-chip">Acoustic</span>
            <span className="dm-chip">Piano</span>
            <span className="dm-chip">120 BPM+</span>
          </div>
          <p className="dm-muted" style={{ marginTop: 10 }}>
            (지금은 UI만! 나중에 실제 검색 로직 붙이면 됨 😈)
          </p>
        </div>

        <div className="dm-card dm-panel">
          <strong>📌 Today’s Mood</strong>
          <p className="dm-muted" style={{ marginTop: 10 }}>
            오늘은 어떤 느낌? <b>포근</b> / <b>폭발</b> / <b>몽환</b> / <b>청량</b>
          </p>
          <div className="dm-progress">
            <div className="dm-progress-bar" style={{ width: "62%" }} />
          </div>
          <p className="dm-muted" style={{ marginTop: 8 }}>Mood Match 62%</p>
        </div>
      </section>

      <h2 className="dm-h2">🔥 Trending</h2>
      <section className="dm-feed-grid">
        {trending.map((t) => (
          <TrackCard key={t.title} track={t} />
        ))}
      </section>
    </PageShell>
  );
}
