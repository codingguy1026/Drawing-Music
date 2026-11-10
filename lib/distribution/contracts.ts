/**
 * Drawing Music distributor gateway contracts (design-stage only).
 *
 * This module describes metadata and permission boundaries. It does not connect
 * to any real distributor, grant music licenses, or authorize audio playback.
 * Never call a partner API directly from a browser with service credentials.
 */

export type ConnectionStatus =
  | "not_connected"
  | "demo"
  | "pending_contract"
  | "connected"
  | "suspended";

export type IngestionStatus =
  | "received"
  | "validating"
  | "rights_review"
  | "ready"
  | "published"
  | "blocked"
  | "takedown";

export type RightsStatus = "unverified" | "verified" | "revoked" | "expired";
export type LicensedUse = "interactive_stream" | "preview";

export type ProviderCapability =
  | "release_import"
  | "updates"
  | "takedowns"
  | "usage_reporting";

export interface DistributorConnection {
  id: string;
  name: string;
  kind: "direct_upload" | "partner_feed";
  status: ConnectionStatus;
  capabilities: ProviderCapability[];
  /** References an access-controlled server-side configuration, never a secret. */
  credentialRef?: string;
  lastSuccessfulSyncAt?: string;
}

export interface TrackMetadata {
  /** Stable Drawing Music ID, assigned on ingest. */
  id: string;
  /** Provider-scoped immutable identifier (not guaranteed globally unique). */
  providerTrackId: string;
  isrc?: string;
  title: string;
  artists: string[];
  durationSeconds?: number;
  /** Internal storage key, NOT a public playback URL. */
  audioAssetRef?: string;
}

export interface TerritoryOffer {
  /** ISO 3166-1 alpha-2 territory, or WORLD when explicitly permitted. */
  territory: string;
  startsAt: string;
  endsAt?: string;
  uses: LicensedUse[];
}

export interface MusicReleaseDelivery {
  /** Unique delivery ID to handle retries idempotently. */
  deliveryId: string;
  providerId: string;
  providerReleaseId: string;
  receivedAt: string;
  title: string;
  artists: string[];
  upc?: string;
  tracks: TrackMetadata[];
  offers: TerritoryOffer[];
  /** Provider's claim, not itself legal proof or playback authorization. */
  providerRightsReference?: string;
  operation: "upsert" | "takedown";
}

export interface ReviewedRights {
  status: RightsStatus;
  /** Approved agreement record maintained by Drawing Music administrators. */
  approvedAgreementId?: string;
  verifiedAt?: string;
}

export interface CatalogReleaseRecord {
  internalReleaseId: string;
  providerId: string;
  providerReleaseId: string;
  status: IngestionStatus;
  delivery: MusicReleaseDelivery;
  rights: ReviewedRights;
}

export interface DeliveryBatch {
  deliveries: MusicReleaseDelivery[];
  /** Opaque provider cursor; persist server-side after processing succeeds. */
  nextCursor?: string;
}

export interface DistributorAdapter {
  readonly id: string;
  /** A health check does not imply contractual or playback permission. */
  healthCheck(): Promise<{ connected: boolean; message?: string }>;
  fetchDeliveries(cursor?: string): Promise<DeliveryBatch>;
}

/**
 * Fail-closed metadata-level eligibility check.
 * A real playback endpoint MUST additionally authenticate the user, confirm
 * current contracts and asset authorization on the server, and issue a
 * short-lived playback token only when all checks pass.
 */
export function checkReleaseEligibility(
  record: CatalogReleaseRecord,
  territory: string,
  use: LicensedUse,
  at: Date = new Date(),
): { allowed: boolean; reason: string } {
  if (record.status !== "published") return { allowed: false, reason: "not_published" };
  if (record.rights.status !== "verified" || !record.rights.approvedAgreementId) {
    return { allowed: false, reason: "rights_not_approved" };
  }
  const now = at.getTime();
  if (!Number.isFinite(now)) return { allowed: false, reason: "invalid_date" };
  const permitted = record.delivery.offers.some((offer) => {
    if (offer.territory !== territory && offer.territory !== "WORLD") return false;
    if (!offer.uses.includes(use)) return false;
    const from = Date.parse(offer.startsAt);
    const until = offer.endsAt ? Date.parse(offer.endsAt) : Infinity;
    return Number.isFinite(from) && (until === Infinity || Number.isFinite(until)) &&
      now >= from && now < until;
  });
  return permitted
    ? { allowed: true, reason: "metadata_eligible_requires_server_authorization" }
    : { allowed: false, reason: "unavailable_in_territory_or_time" };
}
