"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useSession, signOut } from "next-auth/react";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/explore", label: "Explore" },
  { href: "/upload", label: "Upload" },
  { href: "/collab", label: "Collab" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const { data: session } = useSession();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointerDown = (e: PointerEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node) && !burgerRef.current?.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header className="dm-header">
      <nav className="dm-nav">
        <Link href="/" className="dm-brand" aria-label="Drawing Music Home">
          <span className="dm-brand-emoji">🎧</span>
          <div className="dm-brand-text">
            <strong className="dm-title">Drawing Music</strong>
            <span className="dm-subtitle">Drawing Connections</span>
          </div>
        </Link>

        <div className="nav-links" aria-label="Main tabs">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`nav-link ${pathname === t.href ? "is-active" : ""}`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="dm-actions">
          <ThemeToggle />

          {session?.user ? (
            <>
              <Link href="/me" className="ink-btn">
                {session.user.name || "My Page"}
              </Link>
              <button
                type="button"
                className="ink-btn"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="ink-btn">
                Login
              </Link>
              <Link href="/signup" className="ink-btn">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav-burger"
          ref={burgerRef}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="dm-mobile-menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      <div
        id="dm-mobile-menu"
        ref={menuRef}
        className={`nav-mobile ${open ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="nav-mobile-link"
            onClick={() => setOpen(false)}
          >
            {t.label}
          </Link>
        ))}

        <div className="nav-mobile-sep" />

        {session?.user ? (
          <>
            <Link href="/me" className="nav-mobile-link" onClick={() => setOpen(false)}>
              My Page
            </Link>
            <button
              type="button"
              className="nav-mobile-link"
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{ background: "transparent", border: "none", textAlign: "left" }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-mobile-link" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link href="/signup" className="nav-mobile-link" onClick={() => setOpen(false)}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
