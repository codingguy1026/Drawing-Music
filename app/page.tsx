"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, AudioLines, Check, ChevronRight, Disc3, Heart,
  Home, Library, ListMusic, Music2, Pause, Play, Plus, Repeat2,
  Search, Shuffle, SkipBack, SkipForward, Sparkles, Volume2, VolumeX,
  X, Orbit, Headphones, Radio, ExternalLink, PanelLeftClose, PanelLeftOpen, Maximize2
} from "lucide-react";
import { DEMO_TRACKS, displayTime, type DemoTrack } from "../lib/demoTracks";
import { DemoAudioEngine } from "../lib/audioEngine";
import NowPlayingPanel from "../components/NowPlayingPanel";

type PageView = "home" | "search" | "liked" | "playlist";
type Playlist = { id: string; name: string; trackIds: string[] };
type RepeatMode = "off" | "all" | "one";

const verseUrl = process.env.NEXT_PUBLIC_DRAWING_VERSE_URL?.trim() || "";
const moods = ["전체", "편안", "밤", "집중", "에너지", "우주"];

export default function MusicHome() {
  const engine = useRef<DemoAudioEngine | null>(null);
  const [view, setView] = useState<PageView>("home");
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState("전체");
  const [activeId, setActiveId] = useState(DEMO_TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(65);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [liked, setLiked] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const active = DEMO_TRACKS.find(track => track.id === activeId) || DEMO_TRACKS[0];
  const selectedPlaylist = playlists.find(list => list.id === playlistId);

  useEffect(() => {
    try {
      const savedLiked = JSON.parse(window.localStorage.getItem("dmusic:liked") || "[]");
      const savedPlaylists = JSON.parse(window.localStorage.getItem("dmusic:playlists") || "[]");
      const savedRecent = JSON.parse(window.localStorage.getItem("dmusic:recent") || "[]");
      if (Array.isArray(savedRecent)) setRecentIds(savedRecent.filter((id): id is string => typeof id === "string" && DEMO_TRACKS.some(t => t.id === id)).slice(0, 8));
      if (Array.isArray(savedLiked)) setLiked(savedLiked.filter((id): id is string => typeof id === "string"));
      if (Array.isArray(savedPlaylists)) {
        setPlaylists(savedPlaylists.filter(
          (item): item is Playlist => item && typeof item.id === "string" &&
            typeof item.name === "string" && Array.isArray(item.trackIds)
        ));
      }
    } catch { /* A corrupt local preference should not break the player. */ }
    setHydrated(true);
    return () => engine.current?.dispose();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("dmusic:liked", JSON.stringify(liked));
      window.localStorage.setItem("dmusic:playlists", JSON.stringify(playlists));
      window.localStorage.setItem("dmusic:recent", JSON.stringify(recentIds));
    } catch { /* Private browsing may disable storage. */ }
  }, [hydrated, liked, playlists, recentIds]);

  const getEngine = () => {
    if (!engine.current) engine.current = new DemoAudioEngine();
    return engine.current;
  };

  const playTrack = useCallback((track: DemoTrack, position = 0) => {
    try {
      const player = getEngine();
      player.setVolume(volume / 100);
      player.play(track, position);
      setActiveId(track.id);
      setRecentIds(old => [track.id, ...old.filter(id => id !== track.id)].slice(0, 8));
      setProgress(position);
      setIsPlaying(true);
      setNotice("");
    } catch {
      setNotice("이 브라우저에서 Web Audio 재생을 시작할 수 없어요.");
    }
  }, [volume]);

  const nextTrack = useCallback((automatic = false) => {
    if (automatic && repeat === "one") {
      playTrack(active);
      return;
    }
    const index = DEMO_TRACKS.findIndex(track => track.id === active.id);
    if (automatic && !shuffle && index === DEMO_TRACKS.length - 1 && repeat === "off") {
      engine.current?.pause();
      setProgress(active.duration);
      setIsPlaying(false);
      return;
    }
    const nextIndex = shuffle
      ? (index + 1 + Math.floor(Math.random() * (DEMO_TRACKS.length - 1))) % DEMO_TRACKS.length
      : (index + 1) % DEMO_TRACKS.length;
    playTrack(DEMO_TRACKS[nextIndex]);
  }, [active, playTrack, repeat, shuffle]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      const position = engine.current?.getPosition() || 0;
      setProgress(position);
      if (position >= active.duration - 0.06) nextTrack(true);
    }, 250);
    return () => window.clearInterval(timer);
  }, [isPlaying, active.duration, nextTrack]);

  const togglePlayback = () => {
    if (isPlaying) {
      engine.current?.pause();
      setProgress(engine.current?.getPosition() || progress);
      setIsPlaying(false);
    } else if (engine.current && progress < active.duration) {
      engine.current.resume();
      setIsPlaying(true);
    } else {
      playTrack(active);
    }
  };

  const previousTrack = () => {
    if (progress > 3) {
      engine.current?.seek(0);
      setProgress(0);
      return;
    }
    const index = DEMO_TRACKS.findIndex(track => track.id === active.id);
    playTrack(DEMO_TRACKS[(index - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length]);
  };

  const seek = (position: number) => {
    engine.current?.seek(position);
    setProgress(position);
  };

  const changeVolume = (amount: number) => {
    setVolume(amount);
    engine.current?.setVolume(amount / 100);
  };

  const toggleLiked = (id: string) => setLiked(old =>
    old.includes(id) ? old.filter(item => item !== id) : [...old, id]
  );

  const createPlaylist = () => {
    const name = newName.trim();
    if (!name) return;
    const id = "list-" + Date.now().toString(36);
    setPlaylists(old => [...old, { id, name: name.slice(0, 50), trackIds: [] }]);
    setPlaylistId(id);
    setView("playlist");
    setCreating(false);
    setNewName("");
  };

  const addToPlaylist = (id: string) => {
    const targetId = view === "playlist" && selectedPlaylist ? selectedPlaylist.id : playlists[0]?.id;
    if (!targetId) {
      const generatedId = "list-" + Date.now().toString(36);
      setPlaylists([{ id: generatedId, name: "My Mix", trackIds: [id] }]);
      setPlaylistId(generatedId);
      setNotice("My Mix 재생목록을 만들고 곡을 추가했어!");
      return;
    }
    setPlaylists(old => old.map(list => list.id === targetId
      ? { ...list, trackIds: list.trackIds.includes(id) ? list.trackIds : [...list.trackIds, id] }
      : list
    ));
    setNotice("재생목록에 추가했어!");
  };

  const visibleTracks = useMemo(() => DEMO_TRACKS.filter(track => {
    if (view === "liked" && !liked.includes(track.id)) return false;
    if (view === "playlist" && (!selectedPlaylist || !selectedPlaylist.trackIds.includes(track.id))) return false;
    if (view === "home" && mood !== "전체" && track.mood !== mood) return false;
    const needle = search.toLocaleLowerCase().trim();
    return !needle || [track.title, track.artist, track.album, track.genre, track.mood]
      .some(value => value.toLocaleLowerCase().includes(needle));
  }), [view, liked, selectedPlaylist, mood, search]);

  const sectionTitle = view === "liked" ? "좋아요 표시한 곡"
    : view === "playlist" ? (selectedPlaylist?.name || "재생목록")
    : view === "search" ? "음악 탐색" : "오늘의 사운드";

  const recentTracks = recentIds.map(id => DEMO_TRACKS.find(t => t.id === id)).filter((t): t is DemoTrack => Boolean(t)).slice(0, 4);

  return (
    <div className={sidebarCollapsed ? "dm-app sidebar-compact" : "dm-app"}>
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("home")} aria-label="Drawing Music 홈">
          <div className="brand-mark"><AudioLines size={23} strokeWidth={2.4} /></div>
          <div><strong>Drawing<span>Music</span></strong><small>LISTEN YOUR WAY</small></div>
        </button>
        <p className="nav-label">DISCOVER</p>
        <nav className="sidebar-nav" aria-label="기본 탐색">
          <button className={view === "home" ? "nav-item active" : "nav-item"} onClick={() => { setView("home"); setSearch(""); setMood("전체"); }}>
            <Home size={19}/> 홈
          </button>
          <button className={view === "search" ? "nav-item active" : "nav-item"} onClick={() => setView("search")}>
            <Search size={19}/> 둘러보기
          </button>
          <button className={view === "liked" ? "nav-item active" : "nav-item"} onClick={() => { setView("liked"); setSearch(""); }}>
            <Heart size={19}/> 좋아하는 음악
          </button>
        </nav>
        <div className="library-heading">
          <span>내 라이브러리</span>
          <button title="새 재생목록" aria-label="새 재생목록" onClick={() => setCreating(true)}><Plus size={19}/></button>
        </div>
        <button className="nav-item library-link" onClick={() => setCreating(true)}>
          <ListMusic size={19}/> 새 재생목록 만들기
        </button>
        <div className="playlist-nav">
          {playlists.map(list => (
            <button key={list.id} className={view === "playlist" && playlistId === list.id ? "nav-item active" : "nav-item"}
              onClick={() => { setPlaylistId(list.id); setView("playlist"); setSearch(""); }}>
              <Disc3 size={18}/><span className="ellipsis">{list.name}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="universe-mini"><AudioLines size={19}/><div><strong>DRAWING MUSIC</strong><span>A part of Drawing.</span></div></div>
          {verseUrl ? <a className="back-verse" href={verseUrl} target="_blank" rel="noopener noreferrer">Drawing Verse로 이동 <ArrowRight size={16}/></a>
          : <span className="back-verse muted-link">Drawing Verse 연동 준비 중 <ArrowRight size={16}/></span>}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-start"><button className="sidebar-toggle" onClick={() => setSidebarCollapsed(c => !c)} aria-label={sidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"} title={sidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}>{sidebarCollapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}</button>
          <div className="breadcrumbs"><span>Drawing Music</span><ChevronRight size={14}/><strong>{view === "home" ? "홈" : view === "search" ? "탐색" : view === "liked" ? "좋아요" : "내 재생목록"}</strong></div></div>
          <div className="top-actions">
            <div className="searchbox"><Search size={18}/><input aria-label="음악 검색" placeholder="노래, 아티스트, 분위기 검색"
              value={search} onFocus={() => setView("search")} onChange={e => { setSearch(e.target.value); setView("search"); }}/></div>
            <span className="prototype-pill"><span className="green-dot"/> LIVE DEMO</span>
            <span className="user-avatar" title="로컬 데모 프로필">D</span>
          </div>
        </header>

        <div className="main-scroll">
          {view === "home" && (
            <>
              <section className="hero">
                <div className="hero-deco deco-one"/><div className="hero-deco deco-two"/>
                <div className="hero-content">
                  <div className="eyebrow"><AudioLines size={14}/> DMUSIC DAILY ROTATION</div>
                  <h1>Play your mood.<br/><em>Feel everything.</em></h1>
                  <p>지금 듣고 싶은 음악이 여기 있어. 찾고, 저장하고, 이어서 들어봐.</p>
                  <div className="hero-ctas">
                    <button className="primary-cta" onClick={() => playTrack(DEMO_TRACKS[0])}><Play size={18} fill="currentColor"/> 지금 듣기</button>
                    <button className="secondary-cta" onClick={() => setView("search")}>음악 탐색 <ArrowRight size={17}/></button>
                  </div>
                </div>
                <div className="hero-record-stage" aria-hidden="true">
                  <div className="hero-record"><div className="record-sticker"><AudioLines size={34}/><span>DM.</span></div></div>
                  <div className="hero-waves">{[26,44,66,39,82,56,95,63,47,74,32,53,90,48,30].map((value,index)=>
                    <span key={index} style={{height: value + "%"}} />)}</div>
                </div>
              </section>
              {recentTracks.length > 0 && <section className="recent-section" aria-label="최근 재생한 음악">
                <div className="section-head recent-head"><div><div className="section-kicker">PICK UP WHERE YOU LEFT OFF</div><h2>다시 듣기</h2></div><span className="track-count">최근 재생</span></div>
                <div className="recent-grid">{recentTracks.map(track => <button className="recent-card" key={track.id} onClick={() => playTrack(track)}>
                  <span className={"art recent-art art-" + track.artwork}><Disc3 size={21}/></span>
                  <span className="recent-title">{track.title}</span><Play size={17} className="recent-play" fill="currentColor"/>
                </button>)}</div></section>}
              <div className="section-head"><div><div className="section-kicker">ONE TAP, ONE MOOD</div><h2>지금 기분대로 재생</h2></div></div>
              <div className="mood-row" aria-label="분위기 필터">
                {moods.map(item => <button key={item} className={mood === item ? "mood-pill selected" : "mood-pill"}
                  onClick={() => { setMood(item); const first = DEMO_TRACKS.find(track => item === "전체" || track.mood === item); if(first) playTrack(first); }}
                  aria-label={item + " 음악 바로 재생"}><Play size={12} fill="currentColor"/>{item}</button>)}
              </div>
              <div className="featured-grid">
                {DEMO_TRACKS.slice(0, 3).map((track, index) =>
                  <button key={track.id} className="featured-card" onClick={() => playTrack(track)}>
                    <div className={"art featured-art art-" + track.artwork}><div className="art-symbol"><Disc3 size={56}/></div></div>
                    <span className="featured-index">0{index + 1}</span>
                    <span className="featured-title">{track.title}</span>
                    <span className="featured-meta">{track.genre} · {track.mood}</span>
                    <span className="featured-play"><Play size={17} fill="currentColor"/></span>
                  </button>
                )}
              </div>
            </>
          )}

          <section className="tracks-section">
            <div className="section-head">
              <div><div className="section-kicker">{view === "search" ? "EXPLORE MUSIC" : view === "home" ? "EDITOR'S DEMO PICKS" : "YOUR COLLECTION"}</div>
                <h2>{view === "home" ? "이번 주의 추천 데모" : sectionTitle} {view === "home" && <span className="section-note">✦</span>}</h2></div>
              <div className="section-tools"><span className="track-count">{visibleTracks.length}곡</span><button className="create-inline" onClick={() => setCreating(true)}><Plus size={15}/> 재생목록 만들기</button></div>
            </div>
            <div className="track-table">
              <div className="track-table-header"><span>#</span><span>제목</span><span className="desktop-only">앨범</span><span className="desktop-only">분위기</span><span className="duration-head">시간</span><span/></div>
              {visibleTracks.length ? visibleTracks.map((track, index) =>
                <div className={activeId === track.id && isPlaying ? "track-row playing" : "track-row"} key={track.id}>
                  <span className="track-number">{activeId === track.id && isPlaying ? <AudioLines size={16}/> : index + 1}</span>
                  <button className="track-main" onClick={() => playTrack(track)} aria-label={track.title + " 재생"}>
                    <div className={"art track-art art-" + track.artwork}><Disc3 size={21}/></div>
                    <span className="song-info"><strong>{track.title}</strong><small>{track.artist}</small></span>
                    <Play className="row-play" size={17} fill="currentColor"/>
                  </button>
                  <span className="row-album desktop-only">{track.album}</span>
                  <span className="row-mood desktop-only">{track.mood}</span>
                  <span className="row-duration">{displayTime(track.duration)}</span>
                  <div className="row-actions">
                    <button className={liked.includes(track.id) ? "icon-btn liked" : "icon-btn"} onClick={() => toggleLiked(track.id)}
                      aria-label={liked.includes(track.id) ? "좋아요 취소" : "좋아요"} title="좋아요"><Heart size={17} fill={liked.includes(track.id) ? "currentColor" : "none"}/></button>
                    <button className="icon-btn" onClick={() => addToPlaylist(track.id)} aria-label={track.title + " 재생목록에 추가"} title="재생목록에 추가"><Plus size={18}/></button>
                  </div>
                </div>
              ) : <div className="empty-state"><Library size={30}/><strong>아직 여기는 조용하네.</strong><p>{view === "liked" ? "마음에 드는 곡에 하트를 눌러봐!" : view === "playlist" ? "곡 옆의 + 버튼으로 재생목록에 추가해 봐." : "다른 검색어나 분위기를 선택해 봐."}</p></div>}
            </div>
          </section>
          <section className="soundmap-section">
            <div className="soundmap-copy">
              <div className="section-kicker"><AudioLines size={13}/> THE DMUSIC EXPERIENCE</div>
              <h2>취향을 고르는<br/><span>새로운 방법.</span></h2>
              <p>Sound Palette. 사운드 카드 하나를 골라 누르면 새로운 음악이 시작돼.</p>
              <span className="soundmap-caption">SOUND PALETTE · INTERACTIVE DEMO</span>
            </div>
            <div className="soundmap-canvas" role="group" aria-label="사운드 팔레트">
              {DEMO_TRACKS.slice(0,5).map((track, index) => (
                <button key={track.id} type="button"
                  className={"palette-card art-" + track.artwork + (activeId === track.id && isPlaying ? " active" : "")}
                  onClick={() => playTrack(track)}
                  aria-label={track.title + " 재생"} title={track.title}>
                  <span className="palette-index">0{index + 1}</span>
                  <span className="palette-bars">{[28,64,42,83,49,70,36].map((h,i)=>
                    <i key={i} style={{height: h + "%"}} />)}</span>
                  <span className="palette-track">{track.title}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="connection-panel">
            <div className="connection-icon"><AudioLines size={23}/></div>
            <div><strong>Music, connected.</strong>
              <p>Drawing Verse의 음악 유니버스 및 프로필 활동과 연동될 예정이에요. 디자인은 드뮤직만의 스타일로 유지합니다.</p></div>
            <span className="planned-pill">COMING NEXT</span>
          </section>
          <footer className="legal-note">본 버전은 자체 생성된 데모 멜로디만 재생합니다. 상업 음원 스트리밍 및 계정 연동은 아직 지원하지 않습니다.</footer>
        </div>
      </main>

      <div className="player" role="region" aria-label="음악 플레이어">
        <div className="player-track">
          <button className={"art player-art art-" + active.artwork} onClick={() => setExpanded(true)} aria-label="확장 플레이어 열기"><Disc3 size={26}/></button>
          <div className="player-song"><strong>{active.title}</strong><span>{active.artist}</span></div>
          <button className={liked.includes(active.id) ? "icon-btn liked" : "icon-btn"} onClick={() => toggleLiked(active.id)} aria-label="현재 곡 좋아요">
            <Heart size={18} fill={liked.includes(active.id) ? "currentColor" : "none"}/>
          </button>
        </div>
        <div className="player-center">
          <div className="player-buttons">
            <button className={shuffle ? "control accent" : "control"} onClick={() => setShuffle(s => !s)} aria-label="셔플"><Shuffle size={17}/></button>
            <button className="control" onClick={previousTrack} aria-label="이전 곡"><SkipBack size={21} fill="currentColor"/></button>
            <button className="big-play" onClick={togglePlayback} aria-label={isPlaying ? "일시정지" : "재생"}>{isPlaying ? <Pause size={21} fill="currentColor"/> : <Play size={21} fill="currentColor"/>}</button>
            <button className="control" onClick={() => nextTrack()} aria-label="다음 곡"><SkipForward size={21} fill="currentColor"/></button>
            <button className={repeat !== "off" ? "control accent" : "control"} onClick={() => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off")}
              title={repeat === "one" ? "한 곡 반복" : repeat === "all" ? "전체 반복" : "반복 안 함"} aria-label="반복 모드">
              <Repeat2 size={17}/>{repeat === "one" && <span className="repeat-one">1</span>}
            </button>
          </div>
          <div className="seek-row"><span>{displayTime(progress)}</span>
            <input type="range" min={0} max={active.duration} value={Math.min(progress, active.duration)} step={0.1}
              aria-label="재생 위치" onChange={event => seek(Number(event.target.value))}
              style={{ backgroundSize: (progress / active.duration * 100) + "% 100%" }}/>
            <span>{displayTime(active.duration)}</span>
          </div>
        </div>
        <div className="player-extra"><button className="control expand-control" aria-label="확장 플레이어 열기" title="확장 플레이어" onClick={() => setExpanded(true)}><Maximize2 size={18}/></button><span className="demo-tag"><Radio size={14}/> Original demo</span>
          <button className="control" aria-label={volume ? "음소거" : "음소거 해제"} onClick={() => changeVolume(volume ? 0 : 65)}>
            {volume ? <Volume2 size={20}/> : <VolumeX size={20}/>}
          </button>
          <input type="range" className="volume-range" min={0} max={100} value={volume}
            aria-label="음량" onChange={event => changeVolume(Number(event.target.value))}
            style={{ backgroundSize: volume + "% 100%" }}/>
        </div>
      </div>
      {notice && <div className="toast" role="status"><Check size={17}/>{notice}<button onClick={() => setNotice("")} aria-label="알림 닫기"><X size={16}/></button></div>}
      {expanded && <NowPlayingPanel track={active} progress={progress} playing={isPlaying} liked={liked.includes(active.id)}
        shuffle={shuffle} repeat={repeat} onClose={() => setExpanded(false)} onSeek={seek} onToggle={togglePlayback}
        onPrevious={previousTrack} onNext={() => nextTrack()} onLike={() => toggleLiked(active.id)}
        onShuffle={() => setShuffle(v => !v)} onRepeat={() => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off")}
        onTrack={track => playTrack(track)}/>} 
      {creating && (
        <div className="dialog-backdrop" onClick={() => setCreating(false)}>
          <form className="dialog" onClick={event => event.stopPropagation()} onSubmit={event => { event.preventDefault(); createPlaylist(); }}>
            <div className="dialog-heading"><span><ListMusic size={24}/> 새 재생목록</span>
              <button type="button" onClick={() => setCreating(false)} aria-label="닫기"><X size={20}/></button></div>
            <p>좋아하는 소리를 한 곳에 모아봐.</p>
            <label htmlFor="playlist-name">재생목록 이름</label>
            <input id="playlist-name" autoFocus maxLength={50} placeholder="예: 밤하늘 산책" value={newName} onChange={event => setNewName(event.target.value)}/>
            <button className="primary-cta dialog-submit" disabled={!newName.trim()} type="submit"><Plus size={18}/> 재생목록 만들기</button>
          </form>
        </div>
      )}
    </div>
  );
}
