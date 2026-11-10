import "./globals.css";
import Header from "./components/Header";
import Providers from "./providers";

export const metadata = {
  title: "Drawing Music",
  description: "음악을 그리고, 음악으로 연결된다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
