import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deletePendingPaymentAccount,
  getMembershipAccess,
  hasGrandfatheredAccess,
  MembershipAccessError,
} from "@/lib/membership-access";

const NOW = Date.parse("2026-11-01T12:00:00Z");
const grant = { grant_type: "grandfathered", revoked_at: null, expires_at: null };
type Result = { data: unknown; error: unknown };

beforeEach(() => vi.stubEnv("PENDING_ACCOUNT_CLEANUP_PAUSED", "0"));
afterEach(() => vi.unstubAllEnvs());

function adminFixture({
  entitlement = { data: null, error: null },
  subscription = { data: null, error: null },
  userError = null,
  pendingPayment = true,
}: {
  entitlement?: Result;
  subscription?: Result;
  userError?: unknown;
  pendingPayment?: boolean;
} = {}) {
  const filters: unknown[][] = [];
  const from = vi.fn((table: string) => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn((...args: unknown[]) => { filters.push([table, "eq", ...args]); return query; }),
      is: vi.fn((...args: unknown[]) => { filters.push([table, "is", ...args]); return query; }),
      in: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => table === "access_entitlements" ? entitlement : subscription),
    };
    return query;
  });
  const deleteUser = vi.fn(async () => ({ error: null }));
  const client = {
    from,
    auth: { admin: {
      getUserById: vi.fn(async () => ({
        data: { user: { user_metadata: { pending_payment: pendingPayment } } },
        error: userError,
      })),
      deleteUser,
    } },
  };
  return {
    client: client as unknown as Parameters<typeof deletePendingPaymentAccount>[0],
    from, filters, deleteUser,
  };
}

describe("current-user membership RPC", () => {
  it.each(["grandfathered", "subscription"] as const)("accepts %s access without passing a user ID", async (source) => {
    const rpc = vi.fn(async () => ({ data: { has_access: true, source, expires_at: null }, error: null }));
    const client = { rpc } as unknown as Parameters<typeof getMembershipAccess>[0];
    expect(await getMembershipAccess(client, NOW)).toEqual({ has_access: true, source, expires_at: null });
    expect(rpc).toHaveBeenCalledWith("get_membership_access");
  });

  it("accepts explicit denial and future expiry", async () => {
    for (const data of [
      { has_access: false, source: null, expires_at: null },
      { has_access: true, source: "subscription", expires_at: "2026-11-02T00:00:00Z" },
    ]) {
      const client = { rpc: async () => ({ data, error: null }) } as unknown as Parameters<typeof getMembershipAccess>[0];
      expect(await getMembershipAccess(client, NOW)).toEqual(data);
    }
  });

  it.each([
    null,
    [],
    { has_access: true, source: null, expires_at: null },
    { has_access: false, source: "grandfathered", expires_at: null },
    { has_access: false, source: null, expires_at: "2026-11-02T00:00:00Z" },
    { has_access: true, source: "grandfathered", expires_at: "not a date" },
    { has_access: true, source: "grandfathered", expires_at: "2026-11-01T12:00:00Z" },
    { has_access: true, source: "grandfathered", expires_at: "2026-10-31T00:00:00Z" },
  ])("fails closed for malformed or expired RPC data: %j", async (data) => {
    const client = { rpc: async () => ({ data, error: null }) } as unknown as Parameters<typeof getMembershipAccess>[0];
    await expect(getMembershipAccess(client, NOW)).rejects.toBeInstanceOf(MembershipAccessError);
  });

  it("fails closed on a query error even if data is also present", async () => {
    const client = { rpc: async () => ({ data: { has_access: false, source: null, expires_at: null }, error: { code: "timeout" } }) } as unknown as Parameters<typeof getMembershipAccess>[0];
    await expect(getMembershipAccess(client, NOW)).rejects.toBeInstanceOf(MembershipAccessError);
  });
});

describe("pending-payment account cleanup", () => {
  it("performs no protection reads or deletion while cleanup is paused", async () => {
    vi.stubEnv("PENDING_ACCOUNT_CLEANUP_PAUSED", "1");
    const fixture = adminFixture();
    expect(await deletePendingPaymentAccount(fixture.client, "pending-user")).toBe(false);
    expect(fixture.from).not.toHaveBeenCalled();
    expect(fixture.client.auth.admin.getUserById).not.toHaveBeenCalled();
    expect(fixture.deleteUser).not.toHaveBeenCalled();
  });

  it("preserves a grandfathered pending-payment user before examining billing", async () => {
    const fixture = adminFixture({ entitlement: { data: grant, error: null } });
    expect(await deletePendingPaymentAccount(fixture.client, "legacy-user")).toBe(false);
    expect(fixture.deleteUser).not.toHaveBeenCalled();
    expect(fixture.from).toHaveBeenCalledTimes(1);
    expect(fixture.filters).toEqual([
      ["access_entitlements", "eq", "user_id", "legacy-user"],
      ["access_entitlements", "eq", "grant_type", "grandfathered"],
      ["access_entitlements", "is", "revoked_at", null],
    ]);
  });

  it("checks expiration and does not consider an expired grant active", async () => {
    const future = adminFixture({ entitlement: { data: { ...grant, expires_at: "2026-11-02T00:00:00Z" }, error: null } });
    const expired = adminFixture({ entitlement: { data: { ...grant, expires_at: "2026-11-01T12:00:00Z" }, error: null } });
    expect(await hasGrandfatheredAccess(future.client, "user", NOW)).toBe(true);
    expect(await hasGrandfatheredAccess(expired.client, "user", NOW)).toBe(false);
  });

  it.each([
    { entitlement: { data: null, error: { code: "timeout" } } },
    { entitlement: { data: { ...grant, expires_at: 0 }, error: null } },
    { entitlement: { data: { ...grant, expires_at: "invalid" }, error: null } },
    { subscription: { data: null, error: { code: "timeout" } } },
    { userError: { code: "timeout" } },
  ])("never deletes when a protection read fails: %j", async (options) => {
    const fixture = adminFixture(options);
    await expect(deletePendingPaymentAccount(fixture.client, "user")).rejects.toBeInstanceOf(MembershipAccessError);
    expect(fixture.deleteUser).not.toHaveBeenCalled();
  });

  it("preserves paid users and accounts no longer marked pending", async () => {
    for (const options of [
      { subscription: { data: { id: "paid" }, error: null } },
      { pendingPayment: false },
    ]) {
      const fixture = adminFixture(options);
      expect(await deletePendingPaymentAccount(fixture.client, "user")).toBe(false);
      expect(fixture.deleteUser).not.toHaveBeenCalled();
    }
  });

  it("deletes a pending unpaid account only after all protection reads succeed", async () => {
    const fixture = adminFixture();
    expect(await deletePendingPaymentAccount(fixture.client, "new-user")).toBe(true);
    expect(fixture.deleteUser).toHaveBeenCalledExactlyOnceWith("new-user");
  });
});
