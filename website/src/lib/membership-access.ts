import type { SupabaseClient } from "@supabase/supabase-js";
import { isPendingAccountCleanupPaused } from "./membership-rollout";

export type MembershipAccess = {
  has_access: boolean;
  source: "grandfathered" | "subscription" | null;
  expires_at: string | null;
};

export class MembershipAccessError extends Error {
  constructor(message = "Membership access could not be verified") {
    super(message);
    this.name = "MembershipAccessError";
  }
}

// Use the signed-in user's client: this RPC is deliberately current-user scoped.
export async function getMembershipAccess(
  client: Pick<SupabaseClient, "rpc">,
  now = Date.now(),
): Promise<MembershipAccess> {
  const { data, error } = await client.rpc("get_membership_access");
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    throw new MembershipAccessError();
  }

  const { has_access, source, expires_at } = data;
  if (
    typeof has_access !== "boolean" ||
    ![null, "grandfathered", "subscription"].includes(source) ||
    (has_access ? source === null : source !== null) ||
    (!has_access && expires_at !== null) ||
    (expires_at !== null &&
      (typeof expires_at !== "string" ||
        !Number.isFinite(Date.parse(expires_at)) ||
        Date.parse(expires_at) <= now))
  ) {
    throw new MembershipAccessError("Invalid membership access response");
  }

  return { has_access, source, expires_at };
}

// Webhooks have a service-role client, not the user's JWT, so they cannot use
// the current-user RPC. Always scope this direct query to the resolved user ID.
export async function hasGrandfatheredAccess(
  admin: Pick<SupabaseClient, "from">,
  userId: string,
  now = Date.now(),
): Promise<boolean> {
  if (!userId) throw new MembershipAccessError("Missing entitlement user ID");
  const { data, error } = await admin
    .from("access_entitlements")
    .select("grant_type, revoked_at, expires_at")
    .eq("user_id", userId)
    .eq("grant_type", "grandfathered")
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw new MembershipAccessError();
  if (!data) return false;
  if (data.grant_type !== "grandfathered" || data.revoked_at !== null) {
    throw new MembershipAccessError("Invalid grandfathered entitlement response");
  }
  if (data.expires_at === null) return true;
  if (typeof data.expires_at !== "string") {
    throw new MembershipAccessError("Invalid entitlement expiry");
  }
  const expiresAt = Date.parse(data.expires_at);
  if (!Number.isFinite(expiresAt)) {
    throw new MembershipAccessError("Invalid entitlement expiry");
  }
  return expiresAt > now;
}

// A canceled/expired checkout must never remove an account with membership.
// Throwing on read failures keeps callers from treating unavailable data as
// proof that the user has no access. Webhooks can then retry safely.
export async function deletePendingPaymentAccount(
  admin: Pick<SupabaseClient, "from" | "auth">,
  userId: string,
): Promise<boolean> {
  if (isPendingAccountCleanupPaused()) return false;
  if (await hasGrandfatheredAccess(admin, userId)) return false;

  const { data: subscription, error: subscriptionError } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .limit(1)
    .maybeSingle();
  if (subscriptionError) throw new MembershipAccessError();
  if (subscription) return false;

  const { data, error: userError } = await admin.auth.admin.getUserById(userId);
  if (userError) throw new MembershipAccessError();
  if (data.user?.user_metadata?.pending_payment !== true) return false;

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) throw new Error("Could not remove pending unpaid account");
  return true;
}
