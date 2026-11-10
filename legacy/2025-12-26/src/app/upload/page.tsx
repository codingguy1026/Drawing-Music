import PageShell from "../components/PageShell";

export default function UploadPage() {
  return (
    <PageShell
      title="⬆️ Upload"
      subtitle="음악을 올리고, 분석을 시작하자"
      right={<span className="dm-pill">🎛️ Analyzer</span>}
    >
      <div className="dm-card dm-upload">
        <strong>🎶 Upload a Track</strong>
        <p className="dm-muted" style={{ marginTop: 8 }}>
          지금은 UI만 만들어둔 상태! (나중에 Web Audio API로 BPM/에너지 분석 붙이면 진짜 미친다 😳)
        </p>

        <div className="dm-upload-box">
          <div className="dm-upload-icon">🗂️</div>
          <div>
            <div style={{ fontWeight: 900 }}>Drop your file here</div>
            <div className="dm-muted">mp3 / wav (나중에 제한 걸자)</div>
          </div>
          <button className="ink-btn" type="button">Choose file</button>
        </div>

        <div className="dm-form-grid">
          <label className="dm-label">
            Title
            <input className="dm-input" placeholder="Track title" />
          </label>
          <label className="dm-label">
            Artist
            <input className="dm-input" placeholder="Artist name" />
          </label>
          <label className="dm-label">
            Tags
            <input className="dm-input" placeholder="lofi, rock, 120bpm…" />
          </label>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="ink-btn" type="button">Upload</button>
          <button className="dm-chip" type="button">Analyze after upload</button>
        </div>
      </div>
    </PageShell>
  );
}
