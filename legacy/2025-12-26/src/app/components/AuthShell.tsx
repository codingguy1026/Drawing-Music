import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="dm-page">
      <div className="dm-container">
        <div className="dm-auth-shell">
          {/* 왼쪽: 브랜드/감성 */}
          <section className="dm-auth-left" aria-hidden>
            <div className="dm-auth-badge">
              <span>🎧</span>
              <span>Drawing Music</span>
              <span className="dm-auth-badge-sub">— Drawing Connections</span>
            </div>

            <h1 className="dm-auth-left-title">{title}</h1>
            <p className="dm-auth-left-sub dm-muted">{subtitle}</p>

            <div className="dm-auth-left-hints">
              <div className="dm-auth-hint">🖌️ 종이+잉크 무드</div>
              <div className="dm-auth-hint">✨ 다크모드 붓칠 전환</div>
              <div className="dm-auth-hint">🔒 안전하게 로그인</div>
            </div>

            <div className="dm-auth-left-links">
              <Link className="dm-auth-mini" href="/">
                ← Home
              </Link>
              <Link className="dm-auth-mini" href="/explore">
                Explore →
              </Link>
            </div>
          </section>

          {/* 오른쪽: 폼 */}
          <section className="dm-card dm-auth-right">
            {children}
            <div className="dm-auth-footer">{footer}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
