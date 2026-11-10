# Drawing Music · Distributor Gateway v0.1

> **DESIGN / NOT CONNECTED.** No actual distributor account, contract, music asset,
> external API, DDEX feed, or streaming license is connected by this design.

## Why this exists

Drawing Music currently plays six original synthesized demos with `DemoAudioEngine`
and stores library state in the browser. Do **not** replace this player or make
the existing demos appear to be licensed third-party recordings.

The gateway is an internal, server-side content ingestion interface. It is
**not** an end-user "Connect Spotify/Apple Music" OAuth screen, and an upstream
distributor should never be treated as a public streaming URL provider.

## Intended flow

```text
Direct creator upload          Contracted music distributor (future)
          |                                |
          +------------+-------------------+
                       |
             Server-side adapter
                 fetch / webhook
                       |
          Validation + deduplication
                       |
            Rights & territory review
                       |
             Music catalog registry
                       |
        Authenticated playback entitlement
                       |
         Authorized audio asset / embed
```

A DDEX ERN feed is a possible **future** partner input format. Build an
ERN-to-`MusicReleaseDelivery` parser only after a real partner shares their
supported ERN version, release profile, transfer protocol and required fields.
DDEX DSR is a separate **outbound** usage-reporting standard.

## Core internal interface

The typed design contracts live in `lib/distribution/contracts.ts`.

- `DistributorConnection`: provider status and supported capabilities.
- `DistributorAdapter`: server-only `healthCheck` and `fetchDeliveries`.
- `MusicReleaseDelivery`: normalized releases/tracks, unique delivery ID,
  territory offers, and upsert/takedown intent.
- `CatalogReleaseRecord`: internal review and publication state.
- `checkReleaseEligibility`: *metadata-level, fail-closed* precheck; never
  sufficient by itself to start a stream.

A real adapter must be implemented for a **signed and approved** provider.
Partner credentials reside only in server-managed secrets, not in
`NEXT_PUBLIC_*` variables, browser bundles or repository files.

## Admin experience · proposed / NOT IMPLEMENTED

Dedicated restricted screen: `/admin/distributors` (do not expose publicly
until server-side admin authentication/authorization exists).

```text
DRAWING MUSIC  /  DISTRIBUTOR CONNECTIONS

[Direct Creator Upload]      Local intake    [Planned]
[Demo Partner (fictional)]   Demo mode       [Inspect sample]
[Partner A]                  Not connected   [Requirements]

RELEASE INBOX
- Received
- Validating
- Rights review
- Ready to publish
- Published
- Blocked / Takedown

For each delivery:
  provider, external ID, title, artists, UPC/ISRC, territories,
  start/end date, allowed use, validation errors, rights evidence
  [Approve after legal verification] [Reject] [Inspect audit trail]
```

Avoid a working "Connect" button before a provider agreement, secure
credential flow and actual compatible API/feed exist. Sandbox mock data must be
clearly labelled **fictional, not playable**.

## Import invariants

1. **Idempotency:** dedupe by `(providerId, deliveryId)`. Upsert releases using
   `(providerId, providerReleaseId)`; never use title as an identifier.
2. **Tracking:** keep original raw manifests in private server storage for audit,
   preserve import timestamps and review history.
3. **Asset safety:** validate file type, size and hashes. Store media in
   access-controlled object storage. Do not hand out a raw storage key as a URL.
4. **Rights are separate:** a delivered metadata record is NOT proof of
   licensing. Keep recordings and underlying compositions accounted for.
5. **Territorial availability:** apply use, time, territory, takedown and
   revocation restrictions before each new playback authorization.
6. **Default deny:** unverified records, absent contracts and expired grants are
   excluded from playable catalog results.
7. **Takedowns:** deactivate immediately in search and new playback; invalidate
   playback credentials where possible and propagate cache changes.
8. **No misleading claims:** a successfully fetched feed means *data arrived*,
   not *songs are cleared for public playback*.
9. **Server-side only:** authentication, rate limits, input validation,
   audit logging and explicit admin approval are mandatory for partner import.
10. **Respect privacy:** usage reporting and rights settlements should use
    minimum necessary data and partner-approved aggregation rules.

## Future database entities (conceptual only)

```text
distributor_connections
distributor_deliveries
catalog_releases
catalog_recordings
territory_offers
rights_approvals
audio_assets
import_audit_events
usage_events  (later, with privacy and accounting controls)
```

The current frontend uses `DemoTrack`; do not force external assets into the
procedural `notes` / `bpm` audio engine. A future playback controller should
dispatch by explicit track source:

- `synthetic_demo` -> current `DemoAudioEngine`
- `licensed_asset` -> authenticated, entitled stream player (not built)
- `external_embed` -> official provider-controlled embed (not built)

## Incremental implementation plan

1. **Now:** contracts and this design note. Existing demo music unchanged.
2. **Next:** fictional in-memory adapter and non-public admin preview with
   disabled credentials, ingestion validation and tests.
3. **Then:** own-music uploads after rights statements, moderation workflow and
   secure storage are ready.
4. **Later, conditional on agreement:** partner adapter, delivery ingestion,
   actual rights validation, regional access restrictions and playback gateway.
5. **Last:** accounting, usage reports, takedown sync and operational monitoring.

## Relevant standards

- DDEX Release Delivery / ERN: https://ddex.net/standards-2023/release-delivery/
- DDEX ERN information: https://kb.ddex.net/implementing-each-standard/electronic-release-notification-message-suite-%28ern%29/
- DDEX Sales & Usage Reporting / DSR: https://ddex-standards.net/standards/sales-and-usage-reporting/
- DDEX implementation licence: https://kb.ddex.net/about-ddex-standards/ddex-standards/

DDEX standards have an implementation licence requirement. Check the current
terms before implementing a standard. Neither DDEX compliance nor an ingest
API grants rights to stream a recording.
