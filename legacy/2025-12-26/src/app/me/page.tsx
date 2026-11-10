import { auth } from "../../auth";

export default async function MePage() {
  const session = await auth();

  return (
    <main className="dm-page">
      <div className="dm-container">
        <div className="dm-card">
          <h1 style={{ marginTop: 0 }}>🧾 My Page</h1>
          <p className="dm-muted">로그인 상태 확인 페이지!</p>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
