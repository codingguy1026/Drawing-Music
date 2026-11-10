"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, AudioLines, ChevronDown, Disc3, Heart, ListMusic, Play,
  Radio, Sparkles, Waves,
} from "lucide-react";
import AlbumArt from "./AlbumArt";
import type { DemoTrack } from "../lib/demoTracks";
import { displayTime } from "../lib/demoTracks";

type Props = {
  tracks: DemoTrack[];
  activeId: string;
  playing: boolean;
  liked: string[];
  recent: string[];
  onPlay: (track: DemoTrack) => void;
  onPlayCollection: (tracks: DemoTrack[]) => void;
  onLike: (id: string) => void;
  onAdd: (id: string) => void;
};

type Album = { title: string; tracks: DemoTrack[] };

const MIXES = [
  {
    id: "slow", title: "느린 아침", english: "SLOW MORNING", icon: "☀",
    description: "하루를 부드럽게 여는 세 곡",
    trackIds: ["afterglow", "martianrain", "paperplanets"],
  },
  {
    id: "night", title: "도시의 밤", english: "AFTER HOURS", icon: "☾",
    description: "네온과 어둠 사이의 리듬",
    trackIds: ["nightdrive", "tidal", "signal"],
  },
  {
    id: "focus", title: "고요한 궤도", english: "FOCUS SPACE", icon: "✳",
    description: "몰입이 필요한 시간의 사운드",
    trackIds: ["paperplanets", "signal", "afterglow"],
  },
] as const;

export default function ListeningHub({
  tracks, activeId, playing, liked, recent, onPlay, onPlayCollection, onLike, onAdd,
}: Props) {
  const albums = useMemo<Album[]>(() => {
    const groups = new Map<string, DemoTrack[]>();
    tracks.forEach(track => groups.set(track.album, [...(groups.get(track.album) || []), track]));
    return Array.from(groups, ([title, albumTracks]) => ({ title, tracks: albumTracks }));
  }, [tracks]);

  const [selected, setSelected] = useState<string | null>(null);
  const focused = albums.find(album => album.title === selected) || albums[0];
  const recentlyPlayed = useMemo(() =>
    recent.map(id => tracks.find(track => track.id === id))
      .filter((item): item is DemoTrack => Boolean(item)).slice(0, 4),
    [recent, tracks]
  );
  const firstListen = recentlyPlayed.length === 0;
  const listeningRows = firstListen ? tracks.slice(0, 4) : recentlyPlayed;

  const mixes = useMemo(() => MIXES.map(mix => ({
    ...mix,
    tracks: mix.trackIds.map(id => tracks.find(track => track.id === id))
      .filter((item): item is DemoTrack => Boolean(item)),
  })).filter(mix => mix.tracks.length > 0), [tracks]);

  return (
    <div className="hub" aria-label="앨범과 플레이리스트 탐색">
      <section className="hub-recent" aria-labelledby="hub-recent-title">
        <div className="hub-heading">
          <div><span className="hub-kicker"><AudioLines size={14}/> LISTEN AGAIN</span>
            <h2 id="hub-recent-title">{firstListen ? "이 음악부터 시작해 볼까요?" : "다시 듣고 싶은 순간"}</h2>
            <p>{firstListen ? "처음 방문했다면 이 오리지널 데모를 추천해요." : "이 브라우저에서 최근 재생했던 음악이에요."}</p>
          </div>
          <a href="#discover">전체 음악 <ArrowRight size={17}/></a>
        </div>
        <div className="hub-recent-grid">
          {listeningRows.map(track => (
            <button type="button" className={activeId === track.id && playing ? "hub-recent-card active" : "hub-recent-card"} key={track.id} onClick={() => onPlay(track)}>
              <AlbumArt track={track} compact className="hub-recent-art"/>
              <span className="hub-recent-info"><strong>{track.title}</strong><small>{track.genre} · {track.mood}</small></span>
              <span className="hub-recent-play"><Play size={17} fill="currentColor"/></span>
            </button>
          ))}
        </div>
      </section>

      <section id="collection" className="hub-collection" aria-labelledby="hub-albums-title">
        <div className="hub-heading">
          <div><span className="hub-kicker"><Disc3 size={14}/> THE DRAWING DISCOGRAPHY</span>
            <h2 id="hub-albums-title">앨범으로 만나는 음악</h2>
            <p>한 곡 너머의 이야기. 세 개의 데모 컬렉션을 탐험해 보세요.</p>
          </div>
          <span className="hub-count">{albums.length} ALBUMS</span>
        </div>
        <div className="hub-album-grid">
          {albums.map((album, index) => (
            <article key={album.title} className={focused?.title === album.title ? "hub-album selected" : "hub-album"}>
              <button type="button" className="hub-album-open" onClick={() => setSelected(album.title)} aria-label={album.title + " 수록곡 보기"} aria-expanded={focused?.title === album.title}>
                <div className={"hub-album-visual hub-album-visual-" + index}>
                  <div className="hub-vinyl" aria-hidden="true"/>
                  <AlbumArt track={album.tracks[0]} className="hub-album-cover"/>
                  <span className="hub-album-index">DRAWING ORIGINALS / 0{index + 1}</span>
                </div>
                <span className="hub-album-details"><strong>{album.title}</strong><small>{album.tracks.length}곡 · Drawing Studio</small><ChevronDown size={17}/></span>
              </button>
              <button type="button" className="hub-album-play" onClick={() => onPlayCollection(album.tracks)} aria-label={album.title + " 앨범 순서대로 재생"}><Play size={15} fill="currentColor"/> 앨범 듣기</button>
            </article>
          ))}
        </div>
        {focused && (
          <div className="hub-album-expanded">
            <div className="hub-expanded-top"><div><span>SELECTED ALBUM</span><h3>{focused.title}</h3><p>수록곡을 선택하거나 앨범 전체를 재생해 보세요.</p></div>
              <button type="button" onClick={() => onPlayCollection(focused.tracks)}><Play size={15} fill="currentColor"/> 전체 재생</button></div>
            <div className="hub-expanded-tracks">
              {focused.tracks.map((track, index) => (
                <div className={activeId === track.id && playing ? "hub-expanded-track active" : "hub-expanded-track"} key={track.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <button type="button" className="hub-track-title" onClick={() => onPlay(track)} aria-label={track.title + " 재생"}><Play size={15}/><strong>{track.title}</strong><small>{track.genre} / {track.mood}</small></button>
                  <span className="hub-track-time">{displayTime(track.duration)}</span>
                  <button type="button" className={liked.includes(track.id) ? "hub-icon active" : "hub-icon"} onClick={() => onLike(track.id)} aria-label={track.title + (liked.includes(track.id) ? " 좋아요 취소" : " 좋아요")}><Heart size={17} fill={liked.includes(track.id) ? "currentColor" : "none"}/></button>
                  <button type="button" className="hub-icon" onClick={() => onAdd(track.id)} aria-label={track.title + " 플레이리스트에 추가"}><ListMusic size={17}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="mixes" className="hub-mixes" aria-labelledby="hub-mixes-title">
        <div className="hub-heading">
          <div><span className="hub-kicker"><Radio size={14}/> READY-TO-PLAY MIXES</span>
            <h2 id="hub-mixes-title">지금 기분엔 어떤 색?</h2>
            <p>취향에 따라 고른 데모 3곡을 순서대로 이어서 재생해요.</p>
          </div>
          <span className="hub-count"><Sparkles size={14}/> CURATED</span>
        </div>
        <div className="hub-mix-grid">
          {mixes.map((mix, index) => (
            <button type="button" className={"hub-mix hub-mix-" + index} key={mix.id} onClick={() => onPlayCollection(mix.tracks)} aria-label={mix.title + " 믹스 연속 재생"}>
              <span className="hub-mix-top"><span>{mix.english}</span><Waves size={25}/></span>
              <span className="hub-mix-art">{mix.icon}</span>
              <span className="hub-mix-bottom"><strong>{mix.title}</strong><small>{mix.description}</small><span className="hub-mix-action"><Play size={17} fill="currentColor"/> {mix.tracks.length}곡 연속 듣기</span></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
