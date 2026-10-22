# Drawing Music ↔ Drawing Verse integration contract (proposed)

Drawing Music belongs to the **Drawing project** and is a distinct music service.
Drawing Verse provides a music universe within the hobby universe; its upper-right
"Drawing Music ↗" action should open the canonical, verified deployed DMUSIC URL.
Drawing Music links back to Drawing Verse using NEXT_PUBLIC_DRAWING_VERSE_URL.

## Planned auth integration (not implemented)
1. Use a vetted common OIDC/OAuth identity provider rather than sharing password tables or browser cookies between unrelated sites.
2. Validate redirect URIs, state, PKCE, token audience and scopes.
3. Keep each service's authorization and privacy settings independent, even with a shared user ID.
4. Never trust a user ID sent directly from a client.

## Planned opt-in now-playing API (not implemented)
- An authenticated Drawing Music session writes a short-lived activity record:
  `{user_id, track_id, display_title, artist, artwork_url, started_at, expires_at}`.
- The record may only be read across services when the user explicitly enables
  **Share what I'm listening to**. Default is OFF.
- Clear the activity on stop, logout, disconnect and privacy opt-out.
- Apply expiry if the client disconnects; do not show stale playback.
- Limit public fields to track metadata; never expose listening history or private playlists.
- Both services should use server-side validation, RLS, rate limits and HTTPS.
- Server-to-server events or short-polling should use access-controlled APIs;
  the localStorage prototype in this repository is not shared between sites.

## Catalog and rights
Commercial releases require appropriate licenses for sound recordings and
underlying musical compositions. Do not scrape or proxy Spotify/YouTube playback
without authorization. The bundled prototype only synthesizes its original demo sounds.

## Next tasks
- Confirm actual deployed URLs and shared identity strategy.
- Implement licensed music data catalog or creator-owned uploads with rights verification.
- Add server-side personal library and secure cross-service account linking.
- Add Drawing Verse hobby/music universe entry point and optional profile card.
- Test against real multi-device sessions and privacy settings.
