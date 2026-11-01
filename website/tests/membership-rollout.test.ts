import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, dynamic } from "@/app/api/membership-rollout/route";
import { deletePendingPaymentAccount } from "@/lib/membership-access";
import {
  isPendingAccountCleanupPaused,
  MEMBERSHIP_BACKFILL_PAUSED,
  MEMBERSHIP_ACCESS_VERSION,
} from "@/lib/membership-rollout";

afterEach(() => vi.unstubAllEnvs());

describe("membership rollout deployment marker", () => {
  it("reports the exact deployed Git commit and effective cleanup pause without caching", async () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "1234567890abcdef1234567890abcdef12345678");
    vi.stubEnv("PENDING_ACCOUNT_CLEANUP_PAUSED", "0");
    const response = await GET();
    expect(dynamic).toBe("force-dynamic");
    expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(await response.json()).toEqual({
      cleanup_paused: MEMBERSHIP_BACKFILL_PAUSED,
      commit: "1234567890abcdef1234567890abcdef12345678",
      access_version: MEMBERSHIP_ACCESS_VERSION,
    });
  });

  it("lets the existing environment flag keep cleanup paused after a source resume", async () => {
    vi.stubEnv("PENDING_ACCOUNT_CLEANUP_PAUSED", "1");
    expect(isPendingAccountCleanupPaused()).toBe(true);
    expect((await (await GET()).json()).cleanup_paused).toBe(true);
  });

  it("does not read or delete accounts while the source rollout pause is enabled", async () => {
    vi.stubEnv("PENDING_ACCOUNT_CLEANUP_PAUSED", "0");
    const from = vi.fn();
    const deleteUser = vi.fn();
    const admin = { from, auth: { admin: { deleteUser } } } as unknown as Parameters<typeof deletePendingPaymentAccount>[0];
    if (MEMBERSHIP_BACKFILL_PAUSED) {
      expect(await deletePendingPaymentAccount(admin, "pending-user")).toBe(false);
      expect(from).not.toHaveBeenCalled();
      expect(deleteUser).not.toHaveBeenCalled();
    }
  });
});
