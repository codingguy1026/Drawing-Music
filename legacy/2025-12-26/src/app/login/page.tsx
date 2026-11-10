"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import AuthShell from "../components/AuthShell";

function LoginContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const error = sp.get("error");

  const errorMsg = useMemo(() => {
    if (!error) return "";
    return "로그인 실패… 이메일/비번 확인 ㄱㄱ 😵";
  }, [error]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    setLoading(false);

    if (res?.ok) router.push(res.url || "/");
    else router.push("/login?error=1");
  };

  return (
    <AuthShell
      title="Login"
      subtitle="너의 음악 세계로 다시 들어가자 🎶"
      footer={
        <>
          아직 계정 없음? <a className="dm-auth-link" href="/signup">회원가입</a>
        </>
      }
    >
      <h2 className="dm-auth-title">Login 🎧</h2>
      <p className="dm-muted">이메일로 로그인하면 됨. 돌려 말 안 함 😤</p>

      {errorMsg && <div className="dm-auth-error">{errorMsg}</div>}

      <form onSubmit={onSubmit} className="dm-auth-form">
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
          Password
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}


// Next.js compatibility: wrap useSearchParams in a Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense fallback={<main className="dm-page"><div className="dm-container">로그인 불러오는 중…</div></main>}>
      <LoginContent />
    </Suspense>
  );
}
