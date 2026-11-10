"use client";
import {AudioLines,Compass,Disc3,Heart,Home,ListMusic,Orbit,Radio,Sparkles,Waves} from "lucide-react";
import type {DemoTrack} from "../lib/demoTracks";
import {MUSIC_INFO,musicHref,type MusicView} from "../lib/musicNavigation";
type Props={active:DemoTrack;playing:boolean;likedCount:number;playlistCount:number;view:MusicView};
const NAV=[
 {id:"home",icon:Home},{id:"albums",icon:Disc3},{id:"mixes",icon:Radio},
 {id:"for-you",icon:Sparkles},{id:"discover",icon:Compass},{id:"library",icon:ListMusic},
 {id:"visualizer",icon:Waves},{id:"connection",icon:Orbit}
] as const;
export default function MusicSidebar({active,playing,likedCount,playlistCount,view}:Props){
 return <>
 <aside className="music-sidebar" aria-label="드뮤직 사이드바">
  <div><span className="music-sidebar-eyebrow">YOUR MUSIC SPACE</span>
   <nav aria-label="화면 메뉴" className="music-sidebar-nav">
    {NAV.map(({id,icon:Icon})=><a key={id} href={musicHref(id)}
      className={view===id?"music-sidebar-link first":"music-sidebar-link"}
      aria-current={view===id?"page":undefined}><Icon size={18}/><span>{MUSIC_INFO[id].title}</span></a>)}
   </nav>
  </div>
  <div className="music-sidebar-bottom">
   <div className="music-sidebar-counts">
    <div><Heart size={15}/><span>좋아요</span><strong>{likedCount}</strong></div>
    <div><ListMusic size={15}/><span>플레이리스트</span><strong>{playlistCount}</strong></div>
   </div>
   <div className="music-sidebar-now"><span><AudioLines size={14}/>{playing?"지금 듣는 중":"선택한 음악"}</span>
    <strong>{active.title}</strong><small>{active.artist} · 오리지널 데모</small>
   </div>
  </div>
 </aside>
 <nav className="music-mobile-nav" aria-label="모바일 화면 메뉴">
  {NAV.map(({id,icon:Icon})=><a key={id} href={musicHref(id)}
   className={view===id?"music-mobile-link active":"music-mobile-link"}
   aria-current={view===id?"page":undefined}><Icon size={16}/><span>{MUSIC_INFO[id].title}</span></a>)}
 </nav>
 </>;
}
