import Link from "next/link";

export default function NotFound() {
  return (
    <main className="dm-page">
      <div className="dm-container">
        <div className="dm-card" style={{ textAlign: "center", padding: 26 }}>
          <div style={{ fontSize: 40 }}>🧭</div>
          <h1 style={{ margin: "10px 0 6px" }}>길 잃음 404</h1>
          <p className="dm-muted">여긴 없는 페이지다… 하지만 분위기는 지켰다 😤</p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="ink-btn" href="/">Home</Link>
            <Link className="dm-chip" href="/explore">Explore</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
