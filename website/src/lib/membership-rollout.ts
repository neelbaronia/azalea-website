// Enable before a backfill, verify the deployment and drain old requests.
// Resume only after the grants have been committed and verified.
export const MEMBERSHIP_BACKFILL_PAUSED = false;
export const MEMBERSHIP_ACCESS_VERSION = 1;

export function isPendingAccountCleanupPaused(): boolean {
  return MEMBERSHIP_BACKFILL_PAUSED || process.env.PENDING_ACCOUNT_CLEANUP_PAUSED === "1";
}
