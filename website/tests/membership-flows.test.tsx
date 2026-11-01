import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as checkout } from "@/app/api/stripe/checkout/route";
import { POST as webhook } from "@/app/api/stripe/webhook/route";
import SubscribePage from "@/app/subscribe/page";
import AccountPage from "@/app/account/page";

const mocks = vi.hoisted(() => ({
  userClient: {} as unknown,
  adminClient: {} as unknown,
  createAdmin: vi.fn(),
  stripeConstructor: vi.fn(),
  stripe: {
    prices: { retrieve: vi.fn() },
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    webhooks: { constructEvent: vi.fn() },
  },
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: async () => mocks.userClient }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => {
  mocks.createAdmin();
  return mocks.adminClient;
} }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth: { signOut: vi.fn() } }) }));
vi.mock("stripe", () => ({ default: class {
  constructor() { mocks.stripeConstructor(); return mocks.stripe; }
} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); },
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next/image", () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", { src: props.src, alt: props.alt }) }));
vi.mock("next/link", () => ({ default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => React.createElement("a", props) }));

type QueryResult = { data: unknown; error: unknown };
const noAccess = { has_access: false, source: null, expires_at: null };
const legacyAccess = { has_access: true, source: "grandfathered", expires_at: null };

function fixture({
  membership = legacyAccess as unknown,
  membershipError = null as unknown,
  entitlement = { data: null, error: null } as QueryResult,
  subscription = { data: null, error: null } as QueryResult,
  profile = { data: { id: "legacy-user", full_name: "Reader", stripe_customer_id: null }, error: null } as QueryResult,
} = {}) {
  const from = vi.fn((table: string) => {
    const result = table === "access_entitlements" ? entitlement : table === "subscriptions" ? subscription : profile;
    const query = {
      select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(),
      single: vi.fn(async () => result), maybeSingle: vi.fn(async () => result),
    };
    return query;
  });
  const deleteUser = vi.fn(async () => ({ error: null }));
  const auth = {
    getUser: vi.fn(async () => ({ data: { user: { id: "legacy-user", email: "reader@example.com", user_metadata: { pending_payment: true } } }, error: null })),
    signOut: vi.fn(),
    admin: {
      getUserById: vi.fn(async () => ({ data: { user: { user_metadata: { pending_payment: true } } }, error: null })),
      deleteUser,
    },
  };
  mocks.userClient = { auth, from, rpc: vi.fn(async () => ({ data: membership, error: membershipError })) };
  mocks.adminClient = { auth, from };
  return { from, deleteUser };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture");
  vi.stubEnv("STRIPE_PRICE_ID", "price_fixture");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  vi.stubEnv("VERCEL_ENV", "preview");
  mocks.stripe.prices.retrieve.mockResolvedValue({ active: true, type: "recurring", livemode: false });
  mocks.stripe.checkout.sessions.create.mockResolvedValue({ url: "https://checkout.stripe.com/fixture" });
  fixture();
});

describe("checkout protection", () => {
  it.each([legacyAccess, { has_access: true, source: "subscription", expires_at: null }])("returns the account for existing membership without starting Stripe: %j", async (membership) => {
    fixture({ membership });
    const response = await checkout();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "/account" });
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
    expect(mocks.createAdmin).not.toHaveBeenCalled();
  });

  it("blocks checkout on membership lookup failure", async () => {
    fixture({ membership: null, membershipError: { code: "timeout" } });
    expect((await checkout()).status).toBe(503);
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
  });

  it("blocks checkout on a subscription lookup error", async () => {
    fixture({ membership: noAccess, subscription: { data: null, error: { code: "timeout" } } });
    expect((await checkout()).status).toBe(503);
    expect(mocks.stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("blocks checkout on a billing profile lookup error", async () => {
    fixture({ membership: noAccess, profile: { data: null, error: { code: "timeout" } } });
    expect((await checkout()).status).toBe(503);
    expect(mocks.stripe.customers.create).not.toHaveBeenCalled();
    expect(mocks.stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("still creates real Stripe checkout for a new member without access", async () => {
    fixture({ membership: noAccess, profile: { data: { stripe_customer_id: "cus_fixture" }, error: null } });
    const response = await checkout();
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.com/fixture" });
    expect(mocks.stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
      mode: "subscription",
      customer: "cus_fixture",
      client_reference_id: "legacy-user",
      line_items: [{ price: "price_fixture", quantity: 1 }],
    }));
  });
});

describe("subscribe and account pages", () => {
  it("redirects grandfathered members to account even after a canceled checkout", async () => {
    const { deleteUser } = fixture();
    await expect(SubscribePage({ searchParams: Promise.resolve({ canceled: "true" }) })).rejects.toThrow("REDIRECT:/account");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("rechecks grants before canceled-checkout cleanup", async () => {
    const { deleteUser } = fixture({
      membership: noAccess,
      entitlement: { data: { grant_type: "grandfathered", revoked_at: null, expires_at: null }, error: null },
    });
    await expect(SubscribePage({ searchParams: Promise.resolve({ canceled: "true" }) })).rejects.toThrow("REDIRECT:/account");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("renders a retry message without checkout or deletion if access is unavailable", async () => {
    const { deleteUser } = fixture({ membership: null, membershipError: { code: "timeout" } });
    const html = renderToStaticMarkup(await SubscribePage({ searchParams: Promise.resolve({ canceled: "true" }) }));
    expect(html).toContain("Unable to check membership");
    expect(html).not.toContain("Continue to Stripe");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("retains checkout and canceled-signup cleanup for users without membership", async () => {
    const { deleteUser } = fixture({ membership: noAccess });
    const html = renderToStaticMarkup(await SubscribePage({}));
    expect(html).toContain("Sending you to checkout");
    await expect(SubscribePage({ searchParams: Promise.resolve({ canceled: "true" }) })).rejects.toThrow("REDIRECT:/signup?payment=canceled");
    expect(deleteUser).toHaveBeenCalledExactlyOnceWith("legacy-user");
  });

  it("shows grandfathered membership without inventing a paid subscription", async () => {
    fixture();
    const html = renderToStaticMarkup(await AccountPage({}));
    expect(html).toContain("Grandfathered access");
    expect(html).toContain("This access does not expire");
    expect(html).toContain("No paid subscription");
    expect(html).toContain("Download on iOS");
    expect(html).not.toContain("Subscribe Now");
    expect(html).not.toContain("Manage Billing");
  });

  it("keeps billing management for a grandfathered member who still pays", async () => {
    fixture({ subscription: { data: { status: "active", cancel_at_period_end: false, current_period_end: "2026-12-01T00:00:00Z" }, error: null } });
    const html = renderToStaticMarkup(await AccountPage({}));
    expect(html).toContain("Grandfathered access");
    expect(html).toContain("Active");
    expect(html).toContain("Manage Billing");
    expect(html).not.toContain("Subscribe Now");
  });

  it("does not offer a subscription when membership lookup failed", async () => {
    fixture({ membership: null, membershipError: { code: "timeout" } });
    const html = renderToStaticMarkup(await AccountPage({}));
    expect(html).toContain("Membership status temporarily unavailable");
    expect(html).not.toContain("Subscribe Now");
  });
});

describe("expired-checkout webhook", () => {
  function request() {
    mocks.stripe.webhooks.constructEvent.mockReturnValue({
      type: "checkout.session.expired",
      data: { object: { mode: "subscription", customer: "cus_fixture" } },
    });
    return new NextRequest("https://example.com/api/stripe/webhook", {
      method: "POST", body: "{}", headers: { "stripe-signature": "fixture" },
    });
  }

  it("does not delete a pending-payment account with a grandfathered grant", async () => {
    const { deleteUser } = fixture({ entitlement: { data: { grant_type: "grandfathered", revoked_at: null, expires_at: null }, error: null } });
    expect((await webhook(request())).status).toBe(200);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("fails for retry and never deletes when entitlement reads fail", async () => {
    const { deleteUser } = fixture({ entitlement: { data: null, error: { code: "timeout" } } });
    await expect(webhook(request())).rejects.toThrow("Membership access could not be verified");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("cleans up an unpaid pending signup without a grant", async () => {
    const { deleteUser } = fixture();
    expect((await webhook(request())).status).toBe(200);
    expect(deleteUser).toHaveBeenCalledExactlyOnceWith("legacy-user");
  });
});
