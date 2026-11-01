// Keep automated pending-account deletion paused until the grandfather backfill
// is verified. Resume with a second Git release after the rollout is complete.
export const MEMBERSHIP_BACKFILL_PAUSED = true;
export const MEMBERSHIP_ACCESS_VERSION = 1;

export function isPendingAccountCleanupPaused(): boolean {
  return MEMBERSHIP_BACKFILL_PAUSED || process.env.PENDING_ACCOUNT_CLEANUP_PAUSED === "1";
}
