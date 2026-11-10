/**
 * Public browser-only Drawing ID Supabase configuration.
 * These values were already intentionally published in .env.example.
 * Publishable keys are not secret keys; never use sb_secret/service_role here.
 *
 * Both deployment vars take priority when provided as a matching pair.
 * Partial configuration fails closed to avoid mixing different projects.
 * Prefer Vercel environment variables in production for easier key rotation.
 */
export const publicAuthConfig = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (url || publishableKey) {
    return url && publishableKey ? { url, publishableKey } : null;
  }
  return {
    url: "https://nfdwatnoxsoozsiqrwxz.supabase.co",
    publishableKey: "sb_publishable_9tXH_OuJ_bGFhowqhadd9A_tQm7z5X8",
  };
})();
