"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AudioLines, Disc3, Heart, ListMusic, Pause, Play, Repeat2, Shuffle, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import type { DemoTrack } from "../lib/demoTracks";
import { DEMO_TRACKS, displayTime } from "../lib/demoTracks";
import AlbumArt from "./AlbumArt";
import {currentLyricIndex,getDemoLyrics} from "../lib/demoLyrics";

type Props = {
  track: DemoTrack;
  queueTracks?: DemoTrack[];
  progress: number;
  playing: boolean;
  liked: boolean;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  volume: number;
  statusMessage: string;
  onClose: () => void;
  onSeek: (position: number) => void;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLike: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onVolume: (volume: number) => void;
  onTrack: (track: DemoTrack) => void;
};


const ALBUM_LIGHT: Record<string, { rgb: string; glow: string }> = {
  afterglow: { rgb: "255, 199, 154", glow: "#ffd2ad" },
  nightdrive: { rgb: "130, 104, 232", glow: "#bdafff" },
  paperplanets: { rgb: "181, 204, 160", glow: "#d3e5bb" },
  tidal: { rgb: "87, 205, 180", glow: "#a4f1dc" },
  martianrain: { rgb: "216, 153, 145", glow: "#f4bab3" },
  signal: { rgb: "113, 158, 187", glow: "#b5d9ea" },
};

export default function NowPlayingPanel({
  track, progress, playing, liked, shuffle, repeat, onClose, onSeek, onToggle,
  onPrevious, onNext, onLike, onShuffle, onRepeat, onTrack, queueTracks,
  volume, onVolume, statusMessage,
}: Props) {
  const [tab, setTab] = useState<"queue" | "lyrics" | "details">("queue");

  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    // Native modal behavior keeps keyboard focus inside and makes the page inert.
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);

  const lyricCues = getDemoLyrics(track.id);
  const currentCue = currentLyricIndex(lyricCues,progress);
  const palette = ALBUM_LIGHT[track.artwork] ?? ALBUM_LIGHT.afterglow;
  const paletteStyle = {
    "--np-glow-rgb": palette.rgb,
    "--np-glow-color": palette.glow,
  } as CSSProperties;
  const playbackList = queueTracks?.length ? queueTracks : DEMO_TRACKS;
  const currentIndex = Math.max(0, playbackList.findIndex(item => item.id === track.id));
  const queue = Array.from({ length: Math.max(0, playbackList.length - 1) }, (_, index) =>
    playbackList[(currentIndex + index + 1) % playbackList.length]
  );
  // Demo visual levels derived from each note, not analyzed from a recording.
  const waveform = Array.from({ length: 68 }, (_, index) => {
    const pitch = track.notes[index % track.notes.length];
    return 18 + ((Math.round(pitch * 7) + index * 19 + (index % 6) * 17) % 74);
  });

  return (
    <dialog ref={dialogRef} className="np-backdrop" aria-label="확장 음악 플레이어"
      onCancel={event => { event.preventDefault(); onClose(); }} onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="np-panel np-panel-fused" style={paletteStyle} aria-label="재생 컨트롤">
        <header className="np-header">
          <div className="np-wordmark"><AudioLines size={22} /> DRAWING MUSIC <span>2025 × 2026 · NOW PLAYING</span></div>
          <button onClick={onClose} className="np-close" aria-label="확장 플레이어 닫기"><X size={21}/></button>
        </header>
        <div className="np-content">
          <div className="np-main">
            <div className="np-art-stage">
              <div className="np-art-label"><span className="np-live-dot" /> IMMERSIVE LISTENING <span>DM / 2026</span></div>
              <AlbumArt track={track} className="np-cover" playing={playing}/>
              <div className="np-stage-caption">YOUR SOUND, IN COLOR <span>✦</span> ORIGINAL DEMO</div>
            </div>
            <div className="np-track-meta">
              <div aria-live="polite" aria-atomic="true"><div className="np-eyebrow">NOW PLAYING · COLOR-REACTIVE STUDIO</div>
                <h2>{track.title}</h2><p>{track.artist} · {track.album}</p></div>
              <button className={liked ? "icon-btn liked" : "icon-btn"} onClick={onLike} aria-pressed={liked} aria-label={liked ? "좋아요 취소" : "좋아요"}>
                <Heart size={24} fill={liked ? "currentColor" : "none"}/></button>
            </div>
            <div className="np-waveform">
              <div className="np-bars" aria-hidden="true">
                {waveform.map((height, index) => <span key={index}
                  className={(index / waveform.length) <= (progress / track.duration) ? "heard" : ""}
                  style={{ height: height + "%" }} />)}
              </div>
              <input type="range" min={0} max={track.duration} step={0.1}
                value={Math.min(track.duration,progress)} onChange={event => onSeek(Number(event.target.value))}
                aria-label="재생 위치" aria-valuetext={displayTime(progress) + " / " + displayTime(track.duration)} />
            </div>
            <div className="np-time"><span>{displayTime(progress)}</span><span>{displayTime(track.duration)}</span></div>
            <div className="np-controls">
              <button className={shuffle ? "control accent" : "control"} onClick={onShuffle} aria-label="셔플" aria-pressed={shuffle}><Shuffle size={19}/></button>
              <button className="control" onClick={onPrevious} aria-label="이전 곡"><SkipBack size={24} fill="currentColor"/></button>
              <button className="big-play" onClick={onToggle} aria-label={playing ? "일시정지" : "재생"}>
                {playing ? <Pause size={26} fill="currentColor"/> : <Play size={26} fill="currentColor"/>}
              </button>
              <button className="control" onClick={onNext} aria-label="다음 곡"><SkipForward size={24} fill="currentColor"/></button>
              <button className={repeat !== "off" ? "control accent" : "control"} onClick={onRepeat}
                aria-label={(repeat === "one" ? "한 곡 반복" : repeat === "all" ? "전체 반복" : "반복 없음") + ", 다음 모드: " + (repeat === "off" ? "전체 반복" : repeat === "all" ? "한 곡 반복" : "반복 없음")}>
                <Repeat2 size={19}/>{repeat === "one" && <span className="repeat-one">1</span>}
              </button>
            </div>
            <div className="np-volume">
              <Volume2 size={18} aria-hidden="true"/>
              <input type="range" min={0} max={100} value={volume}
                aria-label="볼륨" aria-valuetext={volume + "%"}
                onChange={event => onVolume(Number(event.target.value))}/>
              <span aria-hidden="true">{volume}%</span>
            </div>
            <p className="np-feedback" role="status">{statusMessage}</p>
            <p className="np-disclaimer">앨범 색상은 디자인용 팔레트, 파형은 데모 멜로디 음표에서 만든 시각 패턴입니다. 실제 녹음 파일 분석 결과는 아니에요.</p>
          </div>
          <aside className="np-side">
            <div className="np-tabs" role="tablist" aria-label="재생 정보" onKeyDown={event => {
              const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
              if (!keys.includes(event.key)) return;
              event.preventDefault();
              const options = ["queue","lyrics","details"] as const;
              const index = options.indexOf(tab);
              const nextTab = event.key === "Home" ? options[0] : event.key === "End" ? options[2]
                : options[(index + (event.key === "ArrowRight" ? 1 : options.length-1)) % options.length];
              setTab(nextTab);
              document.getElementById("np-tab-" + nextTab)?.focus();
            }}>
              <button className={tab === "queue" ? "selected" : ""} id="np-tab-queue" aria-controls="np-panel-queue" tabIndex={tab === "queue" ? 0 : -1} role="tab" aria-selected={tab === "queue"}
                onClick={() => setTab("queue")}><ListMusic size={17}/> 대기열</button>
              <button className={tab === "lyrics" ? "selected" : ""} id="np-tab-lyrics" aria-controls="np-panel-lyrics" tabIndex={tab === "lyrics" ? 0 : -1} role="tab" aria-selected={tab === "lyrics"}
                onClick={() => setTab("lyrics")}><AudioLines size={17}/> 가사</button>
              <button className={tab === "details" ? "selected" : ""} id="np-tab-details" aria-controls="np-panel-details" tabIndex={tab === "details" ? 0 : -1} role="tab" aria-selected={tab === "details"}
                onClick={() => setTab("details")}><Disc3 size={17}/> 곡 정보</button>
            </div>
            <div hidden={tab !== "queue"} className="np-queue" id="np-panel-queue" aria-labelledby="np-tab-queue" tabIndex={0} role="tabpanel">
              <div className="np-queue-label">지금 재생 중</div>
              <div className="np-queue-item current">
                <AlbumArt track={track} compact className="np-queue-art"/>
                <span className="np-queue-info"><strong>{track.title}</strong><small>{track.artist}</small></span>
                <AudioLines size={17}/>
              </div>
              <div className="np-queue-label">다음 곡 · 선택한 재생 순서</div>
              {!queue.length && <p className="np-queue-disclaimer">다음 곡이 없어요. 다른 곡이나 앨범을 선택해 보세요.</p>}
              {queue.map(item => <button key={item.id} className="np-queue-item" onClick={() => onTrack(item)}>
                <AlbumArt track={item} compact className="np-queue-art"/>
                <span className="np-queue-info"><strong>{item.title}</strong><small>{item.artist}</small></span>
                <Play size={15}/></button>)}
              {shuffle && <p className="np-queue-disclaimer">셔플을 사용하면 실제 재생 순서가 달라질 수 있어요.</p>}
            </div>
            <div hidden={tab !== "lyrics"} className="np-lyrics" id="np-panel-lyrics" aria-labelledby="np-tab-lyrics" tabIndex={0} role="tabpanel">
              <p className="np-lyrics-disclaimer">오리지널 데모 멜로디에 맞춰 만든 창작 가사예요. 이 곡에 녹음된 보컬은 없어요.</p>
              {lyricCues.length ? <ol className="np-lyric-lines" aria-label="시간 동기화 창작 가사">
                {lyricCues.map((cue,index) => <li key={cue.start}>
                  <button type="button" className={index === currentCue ? "np-lyric active" : "np-lyric"}
                    aria-current={index === currentCue ? "true" : undefined}
                    onClick={() => onSeek(cue.start)}>
                    <time>{displayTime(cue.start)}</time><span>{cue.text}</span>
                  </button>
                </li>)}
              </ol> : <p className="np-lyrics-empty">이 데모곡에는 준비된 창작 가사가 없어요. 음악은 그대로 감상할 수 있어요.</p>}
            </div>
            <div hidden={tab !== "details"} className="np-details" id="np-panel-details" aria-labelledby="np-tab-details" tabIndex={0} role="tabpanel">
              <div className="np-eyebrow">ABOUT THIS TRACK</div>
              <h3>{track.title}</h3>
              <p>Drawing Music에서 직접 생성한 오리지널 데모 멜로디예요.</p>
              <dl>
                <div><dt>아티스트</dt><dd>{track.artist}</dd></div>
                <div><dt>앨범</dt><dd>{track.album}</dd></div>
                <div><dt>장르</dt><dd>{track.genre}</dd></div>
                <div><dt>분위기</dt><dd>{track.mood}</dd></div>
                <div><dt>길이</dt><dd>{displayTime(track.duration)}</dd></div>
              </dl>
              <div className="np-detail-note">상업 음원 스트리밍과 상업곡 가사는 제공하지 않아요.</div>
            </div>
          </aside>
        </div>
      </section>
    </dialog>
  );
}
