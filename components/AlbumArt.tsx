import type { CSSProperties } from "react";
import type { DemoTrack } from "../lib/demoTracks";

type Props = {
  track: DemoTrack;
  className?: string;
  compact?: boolean;
  playing?: boolean;
};

const series: Record<string, { issue: string; mark: string; accent: string }> = {
  afterglow: { issue: "01", mark: "GLOW", accent: "#FBD8A6" },
  nightdrive: { issue: "02", mark: "NIGHT", accent: "#6DF0D9" },
  paperplanets: { issue: "03", mark: "PAPER", accent: "#E6F0B2" },
  tidal: { issue: "04", mark: "TIDES", accent: "#A3FBCA" },
  martianrain: { issue: "05", mark: "RAIN", accent: "#F6D0B4" },
  signal: { issue: "06", mark: "SIGNAL", accent: "#F7DDC2" },
};

export default function AlbumArt({ track, className = "", compact = false, playing = false }: Props) {
  const config = series[track.id] || series.afterglow;
  return (
    <div className={["cover", "cover--" + track.artwork, compact ? "cover--compact" : "", playing ? "cover--playing" : "", className].filter(Boolean).join(" ")}
      style={{ "--cover-highlight": config.accent } as CSSProperties} aria-hidden="true">
      <span className="cover-grain" />
      <span className="cover-ellipse cover-ellipse-one" />
      <span className="cover-ellipse cover-ellipse-two" />
      <span className="cover-visual">
        <span className="cover-vinyl">
          <span className="cover-vinyl-core" />
        </span>
      </span>
      <span className="cover-topline"><b>DM / STUDIO</b><b>{config.issue}</b></span>
      <span className="cover-type">{config.mark}</span>
      <span className="cover-footer"><b>DRAWING MUSIC</b><b>ORIGINALS</b></span>
    </div>
  );
}
