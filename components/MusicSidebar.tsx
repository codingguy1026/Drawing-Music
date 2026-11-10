"use client";

import {
  AudioLines, Compass, Disc3, Heart, Home, ListMusic, Orbit, Radio,
  Sparkles, Waves,
} from "lucide-react";
import type { DemoTrack } from "../lib/demoTracks";

type Props = {
  active: DemoTrack;
  playing: boolean;
  likedCount: number;
  playlistCount: number;
};

const NAV = [
  { href: "#home", label: "홈", icon: Home },
  { href: "#collection", label: "앨범 컬렉션", icon: Disc3 },
  { href: "#mixes", label: "오늘의 믹스", icon: Radio },
  { href: "#for-you", label: "취향 스튜디오", icon: Sparkles },
  { href: "#discover", label: "음악 탐색", icon: Compass },
  { href: "#library", label: "내 보관함", icon: ListMusic },
  { href: "#visualizer", label: "사운드 시각화", icon: Waves },
] as const;

export default function MusicSidebar({ active, playing, likedCount, playlistCount }: Props) {
  return (
    <aside className="music-sidebar" aria-label="Drawing Music 탐색">
      <div className="music-sidebar-top">
        <span className="music-sidebar-eyebrow">YOUR MUSIC SPACE</span>
        <nav aria-label="음악 섹션 바로가기" className="music-sidebar-nav">
          {NAV.map(({ href, label, icon: Icon }) => (
            <a key={href} href={href} className={href === "#home" ? "music-sidebar-link first" : "music-sidebar-link"}>
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="music-sidebar-bottom">
        <div className="music-sidebar-counts">
          <div><Heart size={15}/><span>좋아요</span><strong>{likedCount}</strong></div>
          <div><ListMusic size={15}/><span>플레이리스트</span><strong>{playlistCount}</strong></div>
        </div>
        <a href="#connection" className="music-sidebar-ecosystem"><Orbit size={16}/> DRAWING ECOSYSTEM</a>
        <div className="music-sidebar-now">
          <span><AudioLines size={14}/> {playing ? "지금 듣는 중" : "선택한 음악"}</span>
          <strong>{active.title}</strong>
          <small>{active.artist} · 오리지널 데모</small>
        </div>
      </div>
    </aside>
  );
}
