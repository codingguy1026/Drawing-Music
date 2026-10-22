# Drawing Music · Studio Edition UI

The Drawing Music interface is **independent of Drawing Verse's visual theme**, even though the two belong to one ecosystem. The desired bar is the *craft and usability* of Drawing Verse, not visual imitation.

## Direction
- Editorial, music-first interface with strong typographic hierarchy
- Midnight-blue / charcoal base, warm peach highlights and subtle aqua accents
- Original, deterministic album cover art for the six synthesized demos
- Reserved space for album artwork, contextual listening and playlists
- Rounded but disciplined cards, restrained borders, predictable focus states
- Mobile-first fallback with bottom navigation and persistent mini-player

## Interaction patterns
- Left: Discover, Explore, Liked, saved playlists
- Center: prominent editorial hero, listening history, mood shortcuts, album feature cards, track browser
- Right (wide screens): listening rail with current track, live activity visualization, upcoming track shortcuts
- Footer: persistent playback controls
- Expanded: artwork, seekable demo waveform illustration, playback controls, queue and metadata
- Library: choose target playlist; create new; remove track; delete playlist with confirmation
- Search: genre filter and query search

## Technical and rights boundaries
- Track data: six synthesized original demos only; not a commercial library
- Album covers: CSS geometric artwork, not third-party copyrighted album covers
- 'Recommended': editorial demo selection, not a claim about real users or trends
- Playback visuals: illustrative note-derived bars, not recorded audio waveforms
- All likes, playlists and listening history currently live in browser localStorage only
- No Drawing Verse account sync, listening status broadcast or shared login has shipped
- Cross-service links use verified URL configuration, with a non-clickable placeholder otherwise

## Checks executed by CI
- TypeScript compile check
- Next.js production build

## Manual visual QA still required
1. Desktop widths 1440, 1280, 1024: rail placement, cover legibility and table columns.
2. Mobile 390/430: navigation above player, hero text safe area and horizontal overflow.
3. Keyboard: navigate side rail, track list, modal flow and full player.
4. Screen reader: current playback, dialog labels, track add/remove actions.
5. Audio: play/pause, track end, seek while paused, shuffled order, repeat modes.
6. Browser storage: refresh after creating playlists and liking tracks.
7. Network: confirm no commercial recordings or third-party album covers are fetched.

This document is the visual acceptance checklist, **not** a claim that browser screenshot QA has been performed.
