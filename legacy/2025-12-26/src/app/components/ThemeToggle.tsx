"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const THEME_KEY = "dm_theme";
const ANIM_MS = 700;

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as Theme) || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;

    root.setAttribute("data-theme-anim", next === "dark" ? "to-dark" : "to-light");

    requestAnimationFrame(() => {
      root.setAttribute("data-theme", next);
      setTheme(next);
      localStorage.setItem(THEME_KEY, next);
      setTimeout(() => root.removeAttribute("data-theme-anim"), ANIM_MS);
    });
  };

  if (!mounted) {
    return <div style={{ width: 38, height: 38 }} aria-hidden />;
  }

  return (
    <button
      type="button"
      className="dm-theme-btn"
      onClick={toggle}
      aria-label={theme === "light" ? "다크모드" : "라이트모드"}
      title={theme === "light" ? "다크모드" : "라이트모드"}
      style={{ transform: theme === "dark" ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
