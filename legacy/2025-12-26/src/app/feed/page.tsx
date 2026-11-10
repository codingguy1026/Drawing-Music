import PageShell from "../components/PageShell";
import AnalysisFeed from "../components/AnalysisFeed"; // 네가 만든 분석 피드 컴포넌트

export default function FeedPage() {
  return (
    <PageShell
      title="🎧 Feed"
      subtitle="알고리즘이 분석한 추천 + 이유까지 설명해주는 곳"
      right={<span className="dm-pill">🧠 Smart</span>}
    >
      <AnalysisFeed />
    </PageShell>
  );
}
