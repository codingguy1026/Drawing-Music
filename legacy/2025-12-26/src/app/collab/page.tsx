import PageShell from "../components/PageShell";

const rooms = [
  { name: "Lo-fi Study Room", members: 12, vibe: "☁️ 포근" },
  { name: "Rock Band Garage", members: 8, vibe: "🖤 폭발" },
  { name: "Synth Night Drive", members: 15, vibe: "🟣 네온" },
];

export default function CollabPage() {
  return (
    <PageShell
      title="🤝 Collab"
      subtitle="사람들이랑 같이 만들고, 같이 듣고, 같이 성장"
      right={<button className="dm-chip" type="button">+ New Room</button>}
    >
      <section className="dm-feed-grid">
        {rooms.map((r) => (
          <article key={r.name} className="dm-card">
            <strong style={{ fontSize: 16 }}>{r.name}</strong>
            <p className="dm-muted" style={{ margin: "8px 0 0" }}>
              👥 {r.members}명 · {r.vibe}
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="ink-btn" href="#">Enter</a>
              <a className="dm-chip" href="#">Preview</a>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
