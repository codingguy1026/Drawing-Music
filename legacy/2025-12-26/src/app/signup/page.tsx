"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "../components/AuthShell";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setMsg(data?.message || "회원가입 실패 😭");
      return;
    }

    // 가입 성공 → 자동 로그인
    const login = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    setLoading(false);
    if (login?.ok) router.push(login.url || "/");
    else router.push("/login");
  };

  return (
    <AuthShell
      title="Sign up"
      subtitle="계정 만들고 바로 시작하자 ✍️🔥"
      footer={
        <>
          이미 계정 있음? <a className="dm-auth-link" href="/login">로그인</a>
        </>
      }
    >
      <h2 className="dm-auth-title">Sign up ✨</h2>
      <p className="dm-muted">6자 이상 비번이면 통과. 심플하게 간다 😎</p>

      {msg && <div className="dm-auth-error">{msg}</div>}

      <form onSubmit={onSubmit} className="dm-auth-form">
        <label className="dm-auth-label">
          Name
          <input
            className="dm-auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="드가이"
          />
        </label>

        <label className="dm-auth-label">
          Email
          <input
            className="dm-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="dm-auth-label">
          Password (6+)
          <input
            className="dm-auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            required
          />
        </label>

        <button className="ink-btn dm-auth-submit" type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
