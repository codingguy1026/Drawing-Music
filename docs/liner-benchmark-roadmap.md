# Liner-inspired DMUSIC development roadmap

> Benchmark: https://tryliner.fun/  
> Principle: study user experience and interaction patterns, but write independent DMUSIC designs and code. Do not copy Liner source, assets, or proprietary algorithms.

## Current baseline (verified from repository README and app)
- [x] Persistent demo player: play/pause, seek, volume, shuffle, repeat, queue
- [x] Home / Albums / Mixes / For You / Discovery / Library / Visualizer navigation
- [x] Browser-local likes and playlists
- [x] Versioned JSON playlist export/import for the **DMUSIC demo catalog only**
- [x] Expanded now-playing interface and decorative note-based visualizer
- [ ] Licensed music catalog or external streaming playback
- [ ] Synced lyrics and lyrics rights
- [ ] Multi-user shared listening rooms
- [ ] Shared account-backed playlist synchronization

## Phase 1: Player fundamentals
1. Add clear loading, error and empty states for player and library.
2. Audit keyboard navigation, focus indicators and screen-reader labels.
3. Make mobile now-playing, queue and playback controls work without layout overflow.
4. Keep audio engine mounted across navigation.

**Done when:** keyboard-only users can find and operate player controls; changing pages never restarts an active demo track; the demo build and typecheck pass.

## Phase 2: Lyrics experience
1. Define a track-linked, timestamped lyric cue schema and a no-lyrics fallback.
2. Use only original or appropriately licensed text.
3. Add a switchable lyrics pane to Now Playing.
4. Highlight cues from actual player time, not decorative animation.

**Done when:** seek, pause and next-track transitions update cue highlighting correctly; missing lyrics do not block playback.

## Phase 3: Music discovery and portability
1. Improve search results, no-results messaging and library filters.
2. Extend existing DMUSIC JSON import/export with clear duplicate and missing-track reports.
3. Explore third-party playlist **metadata** import only through permitted APIs and rights-compliant mappings.
4. Never suggest that a third-party track is playable without a licensed source.

**Done when:** playlist import never destroys existing lists; unavailable tracks are labeled honestly.

## Phase 4: Social listening (later)
1. Design opt-in profile visibility and privacy defaults.
2. Add authenticated listening rooms with host controls and participant consent.
3. Sync playback position and track state with latency recovery.
4. Ensure every participant has playback rights independently.

**Done when:** joining/leaving is predictable, rooms can be moderated, and no audio is redistributed without permission.

## Priorities
| Priority | Work | Reason |
| --- | --- | --- |
| P0 | Player usability, error states, mobile and accessibility | Foundational listening experience |
| P1 | Original/cleared synchronized lyrics | Liner-style immersion |
| P1 | Search and library polish | Core music discovery |
| P2 | External catalog integrations | Depends on APIs and licensing |
| P3 | Social listening rooms | Depends on auth, permissions and synchronization |

## Boundaries
- Existing original synthesized demos remain the playable catalog until licensed integrations exist.
- Do not present mock charts, synthesized waveforms or editorial mood scores as measured commercial-streaming data.
- Maintain DMUSIC's independent visual identity rather than cloning Liner.
- Test `npm run typecheck` and `npm run build` after each code implementation milestone.

## P0 accessibility implementation
- Native modal Now Playing: initial focus, keyboard containment, Escape dismissal, return to the opener, and background scroll lock.
- Queue/details tabs: linked panels, one tab stop, Arrow Left/Right and Home/End navigation.
- Screen-reader announcements for track changes; like/shuffle state, repeat mode and next mode, playback time, and volume labels.
- Visible player focus rings and 44px playback button targets. A stacked narrow-screen player keeps shuffle and repeat available; expanded playback includes a shared volume control.
- Existing playback notices are also shown inside Now Playing; notices can be dismissed with a keyboard. A single-track queue has an explicit empty state.
- Audio engine lifetime, demo catalog, queue selection, likes, playlists and backup behavior remain unchanged.

Verification: `npm run typecheck` and `npm run build`. Browser visual, keyboard and assistive-technology acceptance checks remain pending: this environment's managed preview launcher passes Vite-only flags (`--host`, `--strictPort`) to `next dev`, which rejects them. Do not treat the implementation as a completed browser accessibility audit.

## Next implementation slice
**P0: playback state feedback.** Cover audio initialization/resume failures and player/library loading and empty states. Complete keyboard, narrow-screen and continuous-playback browser checks from Phase 1 in a compatible preview environment before marking that phase done.
