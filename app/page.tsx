"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, AudioLines, Check, ChevronRight, Disc3, Heart,
  Home, Library, ListMusic, Music2, Pause, Play, Plus, Repeat2,
  Search, Shuffle, SkipBack, SkipForward, Sparkles, Volume2, VolumeX,
  X, Orbit, Headphones, Radio, ExternalLink, PanelLeftClose, PanelLeftOpen, Maximize2,
  ArrowUpRight, Layers3, Trash2
} from "lucide-react";
import { DEMO_TRACKS, displayTime, type DemoTrack } from "../lib/demoTracks";
import { DemoAudioEngine } from "../lib/audioEngine";
import NowPlayingPanel from "../components/NowPlayingPanel";
import AlbumArt from "../components/AlbumArt";

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
  const [genreFilter, setGenreFilter] = useState("전체");
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);

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
    setPlaylists(old => [...old, { id, name: name.slice(0, 50), trackIds: addingTrackId ? [addingTrackId] : [] }]);
    setPlaylistId(id);
    setView("playlist");
    setCreating(false);
    setAddingTrackId(null);
    setNewName("");
    setNotice(addingTrackId ? "새 재생목록을 만들고 곡을 추가했어요." : "새 재생목록이 만들어졌어요.");
  };

  const addToPlaylist = (id: string) => {
    if (view === "playlist" && selectedPlaylist) {
      setPlaylists(old => old.map(list => list.id === selectedPlaylist.id
        ? { ...list, trackIds: list.trackIds.includes(id) ? list.trackIds : [...list.trackIds, id] }
        : list
      ));
      setNotice("재생목록에 추가했어요.");
      return;
    }
    setAddingTrackId(id);
    if (playlists.length === 0) setCreating(true);
  };

  const addSelectedToPlaylist = (targetId: string) => {
    if (!addingTrackId) return;
    setPlaylists(old => old.map(list => list.id === targetId
      ? { ...list, trackIds: list.trackIds.includes(addingTrackId) ? list.trackIds : [...list.trackIds, addingTrackId] }
      : list
    ));
    setNotice("재생목록에 추가했어요.");
    setAddingTrackId(null);
  };

  const visibleTracks = useMemo(() => DEMO_TRACKS.filter(track => {
    if (view === "liked" && !liked.includes(track.id)) return false;
    if (view === "playlist" && (!selectedPlaylist || !selectedPlaylist.trackIds.includes(track.id))) return false;
    if (view === "home" && mood !== "전체" && track.mood !== mood) return false;
    if (view === "search" && genreFilter !== "전체" && track.genre !== genreFilter) return false;
    const needle = search.toLocaleLowerCase().trim();
    return !needle || [track.title, track.artist, track.album, track.genre, track.mood]
      .some(value => value.toLocaleLowerCase().includes(needle));
  }), [view, liked, selectedPlaylist, mood, search, genreFilter]);

  const sectionTitle = view === "liked" ? "좋아요 표시한 곡"
    : view === "playlist" ? (selectedPlaylist?.name || "재생목록")
    : view === "search" ? "음악 탐색" : "오늘의 사운드";

  const recentTracks = recentIds.map(id => DEMO_TRACKS.find(t => t.id === id)).filter((t): t is DemoTrack => Boolean(t)).slice(0, 4);
  const genres = ["전체", ...new Set(DEMO_TRACKS.map(track => track.genre))];
  const onSelectView = (target: PageView) => { setView(target); setSearch(""); setGenreFilter("전체"); setMood("전체"); };
  const removeFromPlaylist = (id: string) => { if (!selectedPlaylist) return; setPlaylists(previous => previous.map(list => list.id === selectedPlaylist.id ? {...list, trackIds:list.trackIds.filter(t => t !== id)} : list)); setNotice("재생목록에서 곡을 뺐어요."); };
  const deletePlaylist = () => { if (!selectedPlaylist) return; if (!window.confirm(`"${selectedPlaylist.name}" 재생목록을 삭제할까요?`)) return; setPlaylists(old => old.filter(list => list.id !== selectedPlaylist.id)); setPlaylistId(null); onSelectView("home"); setNotice("재생목록이 삭제되었어요."); };

  return (
    <div className={sidebarCollapsed ? "dm-app sidebar-compact" : "dm-app"}>
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("home")} aria-label="Drawing Music 홈">
          <div className="brand-mark"><span>dm<span className="logo-dot">.</span></span></div>
          <div><strong>Drawing<span>Music</span></strong><small>THE SOUND OF YOU</small></div>
        </button>
        <p className="nav-label">DISCOVER <span>01</span></p>
        <nav className="sidebar-nav" aria-label="기본 탐색">
          <button className={view === "home" ? "nav-item active" : "nav-item"} onClick={() => onSelectView("home")}>
            <Home size={19}/> 홈
          </button>
          <button className={view === "search" ? "nav-item active" : "nav-item"} onClick={() => setView("search")}>
            <Search size={19}/> 둘러보기
          </button>
          <button className={view === "liked" ? "nav-item active" : "nav-item"} onClick={() => onSelectView("liked")}>
            <Heart size={19}/> 좋아하는 음악
          </button>
        </nav>
        <div className="library-heading">
          <span>YOUR LIBRARY</span>
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
          <div className="universe-mini"><Headphones size={20}/><div><strong>YOUR MUSIC, YOUR WAY.</strong><span>Find your own frequency.</span></div></div>
          {verseUrl ? <a className="back-verse" href={verseUrl} target="_blank" rel="noopener noreferrer">Drawing Verse로 이동 <ArrowRight size={16}/></a>
          : <span className="back-verse muted-link">Drawing Verse 연동 준비 중 <ArrowRight size={16}/></span>}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-start"><button className="sidebar-toggle" onClick={() => setSidebarCollapsed(c => !c)} aria-label={sidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"} title={sidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}>{sidebarCollapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}</button>
          <div className="breadcrumbs"><span>DM / 001</span><ChevronRight size={14}/><strong>{view === "home" ? "Discover" : view === "search" ? "Explore" : view === "liked" ? "Liked" : "My Playlist"}</strong></div></div>
          <div className="top-actions">
            <div className="searchbox"><Search size={18}/><input aria-label="음악 검색" placeholder="노래, 아티스트, 분위기 검색"
              value={search} onFocus={() => setView("search")} onChange={e => { setSearch(e.target.value); setView("search"); }}/></div>
            <span className="prototype-pill"><span className="green-dot"/> ORIGINAL DEMOS</span>
            <span className="user-avatar" title="로그인 연동 전 데모 프로필">DM</span>
          </div>
        </header>

        <div className="main-scroll"><div className="content-layout"><div className="content-primary">
          {view === "home" && (
            <>
              <section className="hero" aria-labelledby="hero-title">
                <div className="hero-content">
                  <div className="hero-pretitle"><span className="pretitle-pip"/> THE SOUND OF A NEW DAY</div>
                  <h1 id="hero-title">More music.<br/><em>More you.</em></h1>
                  <p>순간을 채우는 소리, 취향이 되는 발견.<br/>너의 음악 이야기는 여기서 시작돼.</p>
                  <div className="hero-ctas">
                    <button className="primary-cta" onClick={() => playTrack(DEMO_TRACKS[0])}><Play size={17} fill="currentColor"/> 믹스 재생</button>
                    <button className="secondary-cta" onClick={() => onSelectView("search")}>음악 둘러보기 <ArrowUpRight size={17}/></button>
                  </div>
                  <div className="hero-edition"><span>VOL. 001</span><i/><span>DRAWING MUSIC ORIGINALS</span></div>
                </div>
                <div className="hero-illustration" aria-hidden="true">
                  <div className="hero-plate"><div className="hero-platter"><div className="hero-label"><b>DM</b><small>33⅓ RPM</small></div></div></div>
                  <div className="hero-music-note"><AudioLines size={29}/></div>
                  <span className="hero-stamp">YOUR SOUND.<br/>YOUR RULES.</span>
                </div>
              </section>
              {recentTracks.length > 0 && <section className="recent-section" aria-label="최근 재생한 음악">
                <div className="section-head recent-head"><div><div className="section-kicker">PICK UP WHERE YOU LEFT OFF</div><h2>다시 듣기 <span className="section-arrow">↗</span></h2></div><span className="track-count">RECENT</span></div>
                <div className="recent-grid">{recentTracks.map(track => <button className="recent-card" key={track.id} onClick={() => playTrack(track)}>
                  <AlbumArt track={track} compact className="recent-art"/>
                  <span className="recent-title">{track.title}</span><Play size={17} className="recent-play" fill="currentColor"/>
                </button>)}</div></section>}
              <div className="section-head"><div><div className="section-kicker">TUNE YOUR DAY</div><h2>어떤 분위기야?</h2></div><span className="section-trailing">PICK A MOOD <ArrowUpRight size={15}/></span></div>
              <div className="mood-row" aria-label="분위기 필터">
                {moods.map(item => <button key={item} className={mood === item ? "mood-pill selected" : "mood-pill"}
                  onClick={() => { setMood(item); const first = DEMO_TRACKS.find(track => item === "전체" || track.mood === item); if(first) playTrack(first); }}
                  aria-label={item + " 음악 바로 재생"}><Play size={12} fill="currentColor"/>{item}</button>)}
              </div>
              <div className="featured-grid">
                {DEMO_TRACKS.slice(0, 4).map((track, index) =>
                  <button key={track.id} className="featured-card" onClick={() => playTrack(track)}>
                    <AlbumArt track={track} className="featured-art" playing={active.id === track.id && isPlaying}/>
                    <span className="featured-index">FEATURED 0{index + 1}</span>
                    <span className="featured-title">{track.title}</span>
                    <span className="featured-meta">{track.artist} / {track.genre}</span>
                    <span className="featured-play"><Play size={17} fill="currentColor"/></span>
                  </button>
                )}
              </div>
            </>
          )}

          <section className="tracks-section">
            {view === "search" && <div className="explore-heading"><span className="section-kicker">THE MUSIC INDEX / DEMO COLLECTION</span>
                <h1>새로운 소리를 찾아봐.</h1><p>장르와 분위기로 골라 듣는 Drawing Music 오리지널 데모.</p>
                <div className="explore-categories">{genres.map(g=><button key={g} className={genreFilter===g ? "selected" : ""} onClick={()=>setGenreFilter(g)}>{g}</button>)}</div>
              </div>}
            {view === "liked" && <div className="collection-heading"><div className="collection-icon"><Heart size={34} fill="currentColor"/></div><div><span className="section-kicker">YOUR FAVORITES</span><h1>좋아하는 음악</h1><p>{liked.length}곡을 보관 중이에요.</p></div></div>}
            {view === "playlist" && <div className="collection-heading"><div className="collection-icon playlist"><ListMusic size={35}/></div><div><span className="section-kicker">MY PLAYLIST</span><h1>{selectedPlaylist?.name || "재생목록"}</h1><p>{selectedPlaylist?.trackIds.length || 0}곡을 담았어요.</p></div>{selectedPlaylist && <button className="delete-playlist" onClick={deletePlaylist} aria-label="현재 재생목록 삭제"><Trash2 size={17}/> 삭제</button>}</div>}
            <div className="section-head">
              <div><div className="section-kicker">{view === "search" ? "EXPLORE MUSIC" : view === "home" ? "CURATED / ORIGINAL DEMOS" : "YOUR COLLECTION"}</div>
                <h2>{view === "home" ? "좋아할 만한 트랙" : sectionTitle}</h2></div>
              <div className="section-tools"><span className="track-count">{visibleTracks.length}곡</span><button className="create-inline" onClick={() => setCreating(true)}><Plus size={15}/> 재생목록 만들기</button></div>
            </div>
            <div className="track-table">
              <div className="track-table-header"><span>#</span><span>제목</span><span className="desktop-only">앨범</span><span className="desktop-only">분위기</span><span className="duration-head">시간</span><span/></div>
              {visibleTracks.length ? visibleTracks.map((track, index) =>
                <div className={activeId === track.id && isPlaying ? "track-row playing" : "track-row"} key={track.id}>
                  <span className="track-number">{activeId === track.id && isPlaying ? <AudioLines size={16}/> : index + 1}</span>
                  <button className="track-main" onClick={() => playTrack(track)} aria-label={track.title + " 재생"}>
                    <AlbumArt track={track} compact className="track-art" playing={active.id===track.id && isPlaying}/>
                    <span className="song-info"><strong>{track.title}</strong><small>{track.artist}</small></span>
                    <Play className="row-play" size={17} fill="currentColor"/>
                  </button>
                  <span className="row-album desktop-only">{track.album}</span>
                  <span className="row-mood desktop-only"><span className="genre-tag">{track.mood}</span></span>
                  <span className="row-duration">{displayTime(track.duration)}</span>
                  <div className="row-actions">
                    <button className={liked.includes(track.id) ? "icon-btn liked" : "icon-btn"} onClick={() => toggleLiked(track.id)}
                      aria-label={liked.includes(track.id) ? "좋아요 취소" : "좋아요"} title="좋아요"><Heart size={17} fill={liked.includes(track.id) ? "currentColor" : "none"}/></button>
                    {view === "playlist" ? <button className="icon-btn" onClick={() => removeFromPlaylist(track.id)} aria-label={track.title + " 재생목록에서 빼기"} title="재생목록에서 빼기"><X size={17}/></button> : <button className="icon-btn" onClick={() => addToPlaylist(track.id)} aria-label={track.title + " 재생목록에 추가"} title="재생목록에 추가"><Plus size={18}/></button>}
                  </div>
                </div>
              ) : <div className="empty-state"><Library size={30}/><strong>아직 여기는 조용하네.</strong><p>{view === "liked" ? "마음에 드는 곡에 하트를 눌러봐!" : view === "playlist" ? "곡 옆의 + 버튼으로 재생목록에 추가해 봐." : "다른 검색어나 분위기를 선택해 봐."}</p></div>}
            </div>
          </section>
          <section className="soundmap-section">
            <div className="soundmap-copy">
              <div className="section-kicker"><AudioLines size={13}/> THE SOUND LAB</div>
              <h2>Sound, in color.</h2>
              <p>Sound Palette에서 원하는 색을 골라봐.<br/>각 색깔에는 다른 멜로디가 담겨 있어.</p>
              <span className="soundmap-caption">DMUSIC SIGNATURE · INTERACTIVE EXPERIMENT</span>
            </div>
            <div className="soundmap-canvas" role="group" aria-label="사운드 팔레트">
              {DEMO_TRACKS.slice(0,5).map((track, index) => (
                <button key={track.id} type="button"
                  className={"palette-card art-" + track.artwork + (activeId === track.id && isPlaying ? " active" : "")}
                  onClick={() => playTrack(track)}
                  aria-label={track.title + " 재생"} title={track.title}>
                  <span className="palette-index">{track.genre}</span>
                  <span className="palette-bars">{[28,64,42,83,49,70,36].map((h,i)=>
                    <i key={i} style={{height: h + "%"}} />)}</span>
                  <span className="palette-track">{track.title}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="connection-panel">
            <div className="connection-icon"><Layers3 size={24}/></div>
            <div><strong>One account. More ways to connect.</strong>
              <p>Drawing Verse의 음악 유니버스와 프로필 활동 연동은 다음 단계에서 준비 중이에요.</p></div>
            <span className="planned-pill">COMING NEXT</span>
          </section>
          <footer className="legal-note">오리지널 데모 음악만 제공됩니다. 상업 음원 및 Drawing 계정 연동은 아직 지원하지 않아요.</footer>
          </div>
          <aside className="listening-rail" aria-label="뮤직 사이드 패널">
            <div className="rail-header"><div><span className="rail-caption">YOUR LISTENING SPACE</span><h2>Now playing<span className="rail-heading-dot">.</span></h2></div><span className={isPlaying ? "rail-status" : "rail-status paused"}><span/> {isPlaying ? "PLAYING" : "READY"}</span></div>
            <button className="rail-cover-button" onClick={() => setExpanded(true)} aria-label="현재 재생 곡의 전체 플레이어 열기"><AlbumArt track={active} className="rail-cover" playing={isPlaying}/><span className="rail-cover-overlay"><Maximize2 size={20}/></span></button>
            <div className="rail-now-meta"><div><strong>{active.title}</strong><p>{active.artist} <span>·</span> {active.album}</p></div><button aria-label={liked.includes(active.id) ? "좋아요 취소" : "좋아요"} className={liked.includes(active.id) ? "rail-heart liked" : "rail-heart"} onClick={()=>toggleLiked(active.id)}><Heart size={19} fill={liked.includes(active.id) ? "currentColor" : "none"}/></button></div>
            <div className="rail-wave-wrap"><span className="rail-wave-label">SOUND ACTIVITY</span><div className={isPlaying ? "rail-wave playing" : "rail-wave"} aria-hidden="true">{[26,58,35,78,46,89,39,65,33,82,54,30,72,40,94,52,64,27,81,42,60,36,86,45].map((h,index)=><span key={index} style={{height:h+"%",animationDelay:index*.045+"s"}}/>)}</div><div className="rail-progress"><span style={{width:(progress/active.duration*100)+"%"}} /></div></div>
            <div className="rail-divider"/>
            <div className="rail-next"><h3>UP NEXT</h3><button onClick={()=>setExpanded(true)}>대기열 전체 <ArrowUpRight size={14}/></button></div>
            {DEMO_TRACKS.slice(1,4).map((_,i)=> { const pos=(DEMO_TRACKS.findIndex(t=>t.id===active.id)+i+1)%DEMO_TRACKS.length;const t=DEMO_TRACKS[pos];return <button className="rail-queue-row" key={t.id} onClick={()=>playTrack(t)}><AlbumArt track={t} compact className="rail-queue-cover"/><span><strong>{t.title}</strong><small>{t.artist}</small></span><Play size={15}/></button>;})}
            <div className="rail-cross-service"><span className="rail-caption">DRAWING ECOSYSTEM</span><strong>Connected by music.</strong><p>음악 유니버스에서 서로의 취향을 공유할 수 있도록 준비 중이에요.</p>{verseUrl && <a href={verseUrl} target="_blank" rel="noreferrer">Drawing Verse <ArrowUpRight size={14}/></a>}</div>
          </aside>
          </div>
        </div>
      </main>

      <div className="player" role="region" aria-label="음악 플레이어">
        <div className="player-track">
          <button className="player-cover-button" onClick={() => setExpanded(true)} aria-label="확장 플레이어 열기"><AlbumArt track={active} compact className="player-art" playing={isPlaying}/></button>
          <button className="player-song" onClick={() => setExpanded(true)} aria-label="지금 재생 중인 곡 보기"><strong>{active.title}</strong><span>{active.artist}</span></button>
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
      {addingTrackId && !creating && playlists.length > 0 && <div className="dialog-backdrop" onMouseDown={event => { if(event.target === event.currentTarget) setAddingTrackId(null); }}>
        <section className="dialog playlist-chooser" role="dialog" aria-modal="true" aria-label="곡을 추가할 재생목록 선택">
          <div className="dialog-heading"><span><ListMusic size={22}/> 재생목록에 추가</span><button onClick={() => setAddingTrackId(null)} aria-label="닫기"><X size={19}/></button></div>
          <p>곡을 저장할 재생목록을 선택해 주세요.</p>
          <div className="chooser-options">{playlists.map(list => <button key={list.id} onClick={() => addSelectedToPlaylist(list.id)}><Disc3 size={19}/><span><strong>{list.name}</strong><small>{list.trackIds.length}곡</small></span>{list.trackIds.includes(addingTrackId) ? <Check size={18}/> : <Plus size={18}/>}</button>)}</div>
          <button className="chooser-create" onClick={() => {setNewName("");setCreating(true);}}><Plus size={17}/> 새 재생목록 만들기</button>
        </section>
      </div>}
      {creating && (
        <div className="dialog-backdrop" onClick={() => {setCreating(false);setAddingTrackId(null);}}>
          <form className="dialog" onClick={event => event.stopPropagation()} onSubmit={event => { event.preventDefault(); createPlaylist(); }}>
            <div className="dialog-heading"><span><ListMusic size={24}/> 새 재생목록</span>
              <button type="button" onClick={() => {setCreating(false);setAddingTrackId(null);}} aria-label="닫기"><X size={20}/></button></div>
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
