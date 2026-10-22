import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drawing Music | 음악으로 연결되는 세계",
  description: "Drawing 프로젝트의 음악 공간. 음악을 발견하고, 듣고, 나만의 플레이리스트를 만들어 보세요.",
};

export const viewport: Viewport = { themeColor: "#090a14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
