import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser } from "../../../lib/userStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body?.name || "").toString().trim();
    const email = (body?.email || "").toString().trim().toLowerCase();
    const password = (body?.password || "").toString();

    if (!email.includes("@")) {
      return NextResponse.json({ ok: false, message: "이메일 형식이 이상함 😅" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: "비밀번호는 6자 이상!" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, passwordHash });

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "EMAIL_EXISTS") {
      return NextResponse.json({ ok: false, message: "이미 가입된 이메일이야 🙃" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: "회원가입 실패 😭" }, { status: 500 });
  }
}
