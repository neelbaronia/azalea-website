import {
  isPendingAccountCleanupPaused,
  MEMBERSHIP_ACCESS_VERSION,
} from "@/lib/membership-rollout";

export const dynamic = "force-dynamic";

// Public deployment marker. It contains no account or credential information.
export async function GET() {
  return Response.json(
    {
      cleanup_paused: isPendingAccountCleanupPaused(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      access_version: MEMBERSHIP_ACCESS_VERSION,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
