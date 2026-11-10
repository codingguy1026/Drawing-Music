import Link from "next/link";

export default function PageShell({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="dm-page">
      <div className="dm-container">
        <header className="dm-section-head">
          <div>
            <h1 className="dm-section-title">{title}</h1>
            {subtitle ? (
              <p className="dm-muted" style={{ margin: "6px 0 0" }}>
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="dm-page-right">
            {right}
            <Link className="dm-chip" href="/explore">
              Explore →
            </Link>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
