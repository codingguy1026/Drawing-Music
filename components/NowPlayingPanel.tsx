"use client";

import { useEffect, useState } from "react";
import { AudioLines, Disc3, Heart, ListMusic, Pause, Play, Repeat2, Shuffle, SkipBack, SkipForward, X } from "lucide-react";
import type { DemoTrack } from "../lib/demoTracks";
import { DEMO_TRACKS, displayTime } from "../lib/demoTracks";
import AlbumArt from "./AlbumArt";

type Props = {
  track: DemoTrack;
  progress: number;
  playing: boolean;
  liked: boolean;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  onClose: () => void;
  onSeek: (position: number) => void;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLike: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onTrack: (track: DemoTrack) => void;
};

export default function NowPlayingPanel({
  track, progress, playing, liked, shuffle, repeat, onClose, onSeek, onToggle,
  onPrevious, onNext, onLike, onShuffle, onRepeat, onTrack,
}: Props) {
  const [tab, setTab] = useState<"queue" | "details">("queue");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const currentIndex = DEMO_TRACKS.findIndex(item => item.id === track.id);
  const queue = Array.from({ length: DEMO_TRACKS.length - 1 }, (_, index) =>
    DEMO_TRACKS[(currentIndex + index + 1) % DEMO_TRACKS.length]
  );
  // Demo visual levels derived from each note, not analyzed from a recording.
  const waveform = Array.from({ length: 68 }, (_, index) => {
    const pitch = track.notes[index % track.notes.length];
    return 18 + ((Math.round(pitch * 7) + index * 19 + (index % 6) * 17) % 74);
  });

  return (
    <div className="np-backdrop" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="np-panel" role="dialog" aria-modal="true" aria-label="확장 음악 플레이어">
        <header className="np-header">
          <div className="np-wordmark"><AudioLines size={22} /> DRAWING MUSIC <span>NOW PLAYING</span></div>
          <button onClick={onClose} className="np-close" aria-label="확장 플레이어 닫기"><X size={21}/></button>
        </header>
        <div className="np-content">
          <div className="np-main">
            <AlbumArt track={track} className="np-cover" playing={playing}/>
            <div className="np-track-meta">
              <div><div className="np-eyebrow">LISTENING NOW</div>
                <h2>{track.title}</h2><p>{track.artist} · {track.album}</p></div>
              <button className={liked ? "icon-btn liked" : "icon-btn"} onClick={onLike} aria-label={liked ? "좋아요 취소" : "좋아요"}>
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
                aria-label="파형에서 재생 위치 이동" />
            </div>
            <div className="np-time"><span>{displayTime(progress)}</span><span>{displayTime(track.duration)}</span></div>
            <div className="np-controls">
              <button className={shuffle ? "control accent" : "control"} onClick={onShuffle} aria-label="셔플"><Shuffle size={19}/></button>
              <button className="control" onClick={onPrevious} aria-label="이전 곡"><SkipBack size={24} fill="currentColor"/></button>
              <button className="big-play" onClick={onToggle} aria-label={playing ? "일시정지" : "재생"}>
                {playing ? <Pause size={26} fill="currentColor"/> : <Play size={26} fill="currentColor"/>}
              </button>
              <button className="control" onClick={onNext} aria-label="다음 곡"><SkipForward size={24} fill="currentColor"/></button>
              <button className={repeat !== "off" ? "control accent" : "control"} onClick={onRepeat}
                aria-label={repeat === "one" ? "한 곡 반복" : repeat === "all" ? "전체 반복" : "반복 없음"}>
                <Repeat2 size={19}/>{repeat === "one" && <span className="repeat-one">1</span>}
              </button>
            </div>
            <p className="np-disclaimer">파형은 데모 멜로디의 음을 바탕으로 만든 시각 패턴이며 실제 녹음 파형이 아니에요.</p>
          </div>
          <aside className="np-side">
            <div className="np-tabs" role="tablist" aria-label="재생 정보">
              <button className={tab === "queue" ? "selected" : ""} role="tab" aria-selected={tab === "queue"}
                onClick={() => setTab("queue")}><ListMusic size={17}/> 대기열</button>
              <button className={tab === "details" ? "selected" : ""} role="tab" aria-selected={tab === "details"}
                onClick={() => setTab("details")}><Disc3 size={17}/> 곡 정보</button>
            </div>
            {tab === "queue" ? <div className="np-queue" role="tabpanel">
              <div className="np-queue-label">지금 재생 중</div>
              <div className="np-queue-item current">
                <AlbumArt track={track} compact className="np-queue-art"/>
                <span className="np-queue-info"><strong>{track.title}</strong><small>{track.artist}</small></span>
                <AudioLines size={17}/>
              </div>
              <div className="np-queue-label">다음 곡 · 기본 데모 순서</div>
              {queue.map(item => <button key={item.id} className="np-queue-item" onClick={() => onTrack(item)}>
                <AlbumArt track={item} compact className="np-queue-art"/>
                <span className="np-queue-info"><strong>{item.title}</strong><small>{item.artist}</small></span>
                <Play size={15}/></button>)}
              {shuffle && <p className="np-queue-disclaimer">셔플을 사용하면 실제 재생 순서가 달라질 수 있어요.</p>}
            </div> : <div className="np-details" role="tabpanel">
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
              <div className="np-detail-note">상업 음원 스트리밍과 가사는 아직 제공하지 않아요.</div>
            </div>}
          </aside>
        </div>
      </section>
    </div>
  );
}
