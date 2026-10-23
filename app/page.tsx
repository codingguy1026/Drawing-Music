"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {Heart,Play,Pause,SkipBack,SkipForward,Plus,Trash2,Search,Sun,Moon,Volume2,ListMusic,Orbit,AudioLines,Shuffle,Repeat2,X} from "lucide-react";
import {DEMO_TRACKS,displayTime,type DemoTrack} from "../lib/demoTracks";
import {DemoAudioEngine} from "../lib/audioEngine";
import AlbumArt from "../components/AlbumArt";
type Playlist={id:string;name:string;trackIds:string[]};
type RepeatMode="off"|"all"|"one";
const moods=["전체","편안","밤","집중","에너지","우주"];
const verseUrl=process.env.NEXT_PUBLIC_DRAWING_VERSE_URL?.trim()||"";
export default function MusicHome(){
 const engine=useRef<DemoAudioEngine|null>(null);
 const [activeId,setActiveId]=useState(DEMO_TRACKS[0].id),[playing,setPlaying]=useState(false),[progress,setProgress]=useState(0),[volume,setVolume]=useState(65);
 const [liked,setLiked]=useState<string[]>([]),[playlists,setPlaylists]=useState<Playlist[]>([]),[recent,setRecent]=useState<string[]>([]);
 const [hydrated,setHydrated]=useState(false),[dark,setDark]=useState(false),[query,setQuery]=useState(""),[mood,setMood]=useState("전체"),[genre,setGenre]=useState("전체");
 const [selected,setSelected]=useState<string|null>(null),[newName,setNewName]=useState(""),[shuffle,setShuffle]=useState(false),[repeat,setRepeat]=useState<RepeatMode>("off");
 const [notice,setNotice]=useState(""),[addId,setAddId]=useState<string|null>(null);
 const active=DEMO_TRACKS.find(t=>t.id===activeId)||DEMO_TRACKS[0];
 const selectedList=playlists.find(p=>p.id===selected);
 useEffect(()=>{try{
  const l=JSON.parse(localStorage.getItem("dmusic:liked")||"[]"),p=JSON.parse(localStorage.getItem("dmusic:playlists")||"[]"),r=JSON.parse(localStorage.getItem("dmusic:recent")||"[]");
  if(Array.isArray(l))setLiked(l.filter((x):x is string=>typeof x==="string"));
  if(Array.isArray(p))setPlaylists(p.filter((x):x is Playlist=>!!x&&typeof x.id==="string"&&typeof x.name==="string"&&Array.isArray(x.trackIds)));
  if(Array.isArray(r))setRecent(r.filter((x):x is string=>typeof x==="string").slice(0,8));
  setDark(localStorage.getItem("dmusic:classic-theme")==="dark");
 }catch{}setHydrated(true);return()=>engine.current?.dispose()},[]);
 useEffect(()=>{if(!hydrated)return;try{localStorage.setItem("dmusic:liked",JSON.stringify(liked));localStorage.setItem("dmusic:playlists",JSON.stringify(playlists));localStorage.setItem("dmusic:recent",JSON.stringify(recent));localStorage.setItem("dmusic:classic-theme",dark?"dark":"light")}catch{}},[liked,playlists,recent,dark,hydrated]);
 const playTrack=useCallback((track:DemoTrack,position=0)=>{try{if(!engine.current)engine.current=new DemoAudioEngine();engine.current.setVolume(volume/100);engine.current.play(track,position);setActiveId(track.id);setProgress(position);setPlaying(true);setRecent(old=>[track.id,...old.filter(id=>id!==track.id)].slice(0,8));setNotice("")}catch{setNotice("이 브라우저에서는 오디오를 재생할 수 없어요.")}},[volume]);
 const next=useCallback((automatic=false)=>{if(automatic&&repeat==="one"){playTrack(active);return}const i=DEMO_TRACKS.findIndex(t=>t.id===active.id);if(automatic&&!shuffle&&i===DEMO_TRACKS.length-1&&repeat==="off"){engine.current?.pause();setPlaying(false);setProgress(active.duration);return}const index=shuffle&&DEMO_TRACKS.length>1?(i+1+Math.floor(Math.random()*(DEMO_TRACKS.length-1)))%DEMO_TRACKS.length:(i+1)%DEMO_TRACKS.length;playTrack(DEMO_TRACKS[index])},[active,repeat,shuffle,playTrack]);
 useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>{const p=engine.current?.getPosition()??0;setProgress(p);if(p>=active.duration-.06)next(true)},250);return()=>clearInterval(id)},[playing,active.duration,next]);
 const toggle=()=>{if(playing){engine.current?.pause();setProgress(engine.current?.getPosition()??progress);setPlaying(false)}else if(engine.current&&progress<active.duration){engine.current.resume();setPlaying(true)}else playTrack(active)};
 const previous=()=>{if(progress>3){engine.current?.seek(0);setProgress(0);return}const i=DEMO_TRACKS.findIndex(t=>t.id===active.id);playTrack(DEMO_TRACKS[(i-1+DEMO_TRACKS.length)%DEMO_TRACKS.length])};
 const seek=(n:number)=>{engine.current?.seek(n);setProgress(n)};
 const toggleLike=(id:string)=>setLiked(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 const createList=()=>{const name=newName.trim().slice(0,50);if(!name)return;const id="list-"+Date.now().toString(36);setPlaylists(old=>[...old,{id,name,trackIds:addId?[addId]:[]}]);setSelected(id);setNewName("");setAddId(null)};
 const addTo=(listId:string,trackId:string)=>{setPlaylists(old=>old.map(p=>p.id===listId?{...p,trackIds:p.trackIds.includes(trackId)?p.trackIds:[...p.trackIds,trackId]}:p));setAddId(null);setNotice("재생목록에 추가했어요.")};
 const genres=useMemo(()=>["전체",...new Set(DEMO_TRACKS.map(t=>t.genre))],[]);
 const tracks=useMemo(()=>DEMO_TRACKS.filter(t=>(mood==="전체"||t.mood===mood)&&(genre==="전체"||t.genre===genre)&&[t.title,t.artist,t.album,t.genre,t.mood].some(s=>s.toLowerCase().includes(query.trim().toLowerCase()))),[mood,genre,query]);
 const wave=Array.from({length:42},(_,i)=>18+((Math.round(active.notes[i%active.notes.length]*7)+i*19)%74));
 return <div className={dark?"classic dark":"classic"}>
  <header className="classic-header"><a href="#home" className="classic-brand">Drawing Music</a><nav aria-label="사이트 메뉴"><a href="#discover">음악</a><a href="#library">보관함</a><a href="#visualizer">시각화</a><a href="#connection">연동</a><button onClick={()=>setDark(v=>!v)} aria-label={dark?"라이트 모드":"다크 모드"}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button></nav></header>
  <main>
   <section id="home" className="classic-hero"><span className="classic-eyebrow">DRAWING MUSIC · CLASSIC</span><h1>Drawing Music</h1><p>음악을 그리다.</p><a className="classic-enter" href="#discover">음악 둘러보기 ↓</a></section>
   <div className="classic-container">
    <section id="discover" className="classic-section"><div className="classic-section-head"><div><span className="classic-kicker">DISCOVER</span><h2>음악 탐색</h2><p>Drawing Music의 오리지널 데모 음악을 만나보세요.</p></div><span className="classic-counter">{tracks.length}곡</span></div>
     <div className="classic-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="곡명, 아티스트, 장르 검색" aria-label="음악 검색"/></div>
     <div className="classic-filters">{moods.map(m=><button key={m} className={mood===m?"selected":""} onClick={()=>setMood(m)}>{m}</button>)}</div>
     <div className="classic-filters genres">{genres.map(g=><button key={g} className={genre===g?"selected":""} onClick={()=>setGenre(g)}>{g}</button>)}</div>
     <div className="classic-tracks">{tracks.length?tracks.map(t=><article className="classic-track" key={t.id}><button className="classic-track-main" onClick={()=>playTrack(t)}><AlbumArt track={t} compact className="classic-art"/><span><strong>{t.title}</strong><small>{t.artist} · {t.album}</small></span></button><span className="classic-track-mood">{t.mood} · {t.genre}</span><span className="classic-duration">{displayTime(t.duration)}</span><button className={liked.includes(t.id)?"liked":""} aria-label={t.title+" 좋아요"} onClick={()=>toggleLike(t.id)}><Heart size={19} fill={liked.includes(t.id)?"currentColor":"none"}/></button><button aria-label={t.title+" 재생목록에 추가"} onClick={()=>setAddId(t.id)}><Plus size={19}/></button></article>):<p className="classic-empty">검색 결과가 없어요.</p>}</div>
    </section>
    <section id="library" className="classic-section"><div className="classic-section-head"><div><span className="classic-kicker">YOUR LIBRARY</span><h2>내 보관함</h2><p>좋아하는 음악과 재생목록을 한곳에.</p></div></div>
     <div className="classic-library"><div className="classic-panel"><h3><Heart size={18}/> 좋아하는 음악 <span>{liked.length}</span></h3>{liked.length?DEMO_TRACKS.filter(t=>liked.includes(t.id)).map(t=><button className="classic-mini" key={t.id} onClick={()=>playTrack(t)}><Play size={15}/>{t.title}</button>):<p className="classic-empty">음악 옆의 하트를 눌러 담아보세요.</p>}</div>
      <div className="classic-panel"><h3><ListMusic size={18}/> 내 플레이리스트</h3><form className="classic-newlist" onSubmit={e=>{e.preventDefault();createList()}}><input value={newName} onChange={e=>setNewName(e.target.value)} maxLength={50} placeholder="새 재생목록 이름" aria-label="새 재생목록 이름"/><button type="submit" disabled={!newName.trim()}><Plus size={17}/> 만들기</button></form>
      <div className="classic-list-tabs">{playlists.map(p=><button key={p.id} className={selected===p.id?"selected":""} onClick={()=>setSelected(p.id)}>{p.name} ({p.trackIds.length})</button>)}</div>
      {selectedList&&<div className="classic-selected"><div className="classic-selected-head"><strong>{selectedList.name}</strong><button onClick={()=>{if(window.confirm("재생목록을 삭제할까요?")){setPlaylists(old=>old.filter(p=>p.id!==selected));setSelected(null)}}} aria-label="재생목록 삭제"><Trash2 size={17}/></button></div>
      {selectedList.trackIds.length?selectedList.trackIds.map(id=>{const t=DEMO_TRACKS.find(x=>x.id===id);return t?<div key={id} className="classic-mini-row"><button onClick={()=>playTrack(t)}><Play size={14}/>{t.title}</button><button aria-label={t.title+" 제거"} onClick={()=>setPlaylists(old=>old.map(p=>p.id===selected?{...p,trackIds:p.trackIds.filter(x=>x!==id)}:p))}><X size={15}/></button></div>:null}):<p className="classic-empty">음악 목록에서 + 버튼으로 곡을 추가하세요.</p>}</div>}</div></div>
    </section>
    <section id="visualizer" className="classic-section"><div className="classic-section-head"><div><span className="classic-kicker">DRAW THE SOUND</span><h2>음악을 그리다.</h2><p>재생 중인 데모 멜로디를 색과 리듬으로 표현해요.</p></div></div><div className="classic-visual"><div className="classic-visual-top"><AudioLines size={20}/><span>{active.title} · {playing?"재생 중":"일시정지"}</span></div><div className="classic-wave" aria-label="데모 음표를 기반으로 만든 시각화">{wave.map((h,i)=><span key={i} className={playing?"moving":""} style={{height:h+"%",animationDelay:(i%8)*-.11+"s"}}/>)}</div><small>실제 음원 파형 분석이 아닌 음표 데이터 기반 시각화입니다.</small></div></section>
    <section id="connection" className="classic-section"><div className="classic-section-head"><div><span className="classic-kicker">DRAWING ECOSYSTEM</span><h2>Drawing Verse 연동</h2><p>음악 유니버스와 현재 듣는 음악 공유 기능을 준비하고 있어요.</p></div></div><div className="classic-connection"><Orbit size={26}/><div><strong>Drawing Verse × Drawing Music</strong><p>계정 연동과 프로필 활동 표시는 아직 연결되지 않았습니다.</p></div>{verseUrl?<a href={verseUrl} target="_blank" rel="noopener noreferrer">Drawing Verse ↗</a>:<span>연동 준비 중</span>}</div></section>
   </div>
  </main>
  <footer className="classic-player"><div className="classic-player-track"><AlbumArt track={active} compact className="classic-player-art"/><div><strong>{active.title}</strong><small>{active.artist}</small></div><button aria-label="현재 곡 좋아요" className={liked.includes(active.id)?"liked":""} onClick={()=>toggleLike(active.id)}><Heart size={17} fill={liked.includes(active.id)?"currentColor":"none"}/></button></div>
   <div className="classic-player-center"><div className="classic-controls"><button aria-label="셔플" className={shuffle?"selected":""} onClick={()=>setShuffle(v=>!v)}><Shuffle size={16}/></button><button aria-label="이전 곡" onClick={previous}><SkipBack size={18}/></button><button className="classic-play" aria-label={playing?"일시정지":"재생"} onClick={toggle}>{playing?<Pause size={20} fill="currentColor"/>:<Play size={20} fill="currentColor"/>}</button><button aria-label="다음 곡" onClick={()=>next()}><SkipForward size={18}/></button><button aria-label="반복 모드" className={repeat!=="off"?"selected":""} onClick={()=>setRepeat(r=>r==="off"?"all":r==="all"?"one":"off")}><Repeat2 size={16}/>{repeat==="one"&&<sup>1</sup>}</button></div><div className="classic-seek"><span>{displayTime(progress)}</span><input type="range" aria-label="재생 위치" min={0} max={active.duration} step={.1} value={Math.min(progress,active.duration)} onChange={e=>seek(Number(e.target.value))}/><span>{displayTime(active.duration)}</span></div></div>
   <div className="classic-volume"><Volume2 size={18}/><input aria-label="볼륨" type="range" min={0} max={100} value={volume} onChange={e=>{const v=Number(e.target.value);setVolume(v);engine.current?.setVolume(v/100)}}/></div>
  </footer>
  {addId&&<div className="classic-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setAddId(null)}}><section role="dialog" aria-modal="true" aria-label="재생목록에 추가" className="classic-modal"><div className="classic-selected-head"><h3>재생목록에 추가</h3><button onClick={()=>setAddId(null)} aria-label="닫기"><X size={19}/></button></div>{playlists.length?playlists.map(p=><button className="classic-mini" key={p.id} onClick={()=>addTo(p.id,addId)}><Plus size={16}/>{p.name}</button>):<p className="classic-empty">먼저 아래에서 새 재생목록을 만드세요.</p>}<form className="classic-newlist" onSubmit={e=>{e.preventDefault();createList()}}><input placeholder="새 재생목록 이름" aria-label="새 재생목록 이름" value={newName} onChange={e=>setNewName(e.target.value)}/><button type="submit" disabled={!newName.trim()}>만들기</button></form></section></div>}
  {notice&&<div className="classic-notice" role="status" onClick={()=>setNotice("")}>{notice} ×</div>}
 </div>
}