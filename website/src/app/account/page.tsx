import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AccountActions from "./account-actions";
import Stripe from "stripe";

const IOS_APP_URL = "https://apps.apple.com/us/app/azalea-audio/id6761150322";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

type SubscriptionRow = {
  id?: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at?: string;
};

async function syncLatestStripeSubscription({
  userId,
  customerId,
}: {
  userId: string;
  customerId: string;
}) {
  const stripe = getStripe();
  const admin = createAdminClient();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });

  const subscription =
    subscriptions.data.find((item) => item.status === "active" || item.status === "trialing") ??
    subscriptions.data[0];

  if (!subscription) return null;

  const item = subscription.items.data[0];
  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: item?.price.id ?? null,
    status: subscription.status,
    current_period_start: item
      ? new Date(item.current_period_start * 1000).toISOString()
      : null,
    current_period_end: item
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  const { data, error } = await admin
    .from("subscriptions")
    .upsert(subscriptionData, { onConflict: "stripe_subscription_id" })
    .select("*")
    .single();

  if (error) {
    console.error("Error syncing Stripe subscription:", error);
    return null;
  }

  if (subscription.status === "active" || subscription.status === "trialing") {
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...(authUser.user?.user_metadata ?? {}),
        pending_payment: false,
      },
    });
  }

  return data as SubscriptionRow;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, stripe_customer_id")
    .eq("id", user.id)
    .single();

  let { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!subscription && params?.success === "true" && profile?.stripe_customer_id) {
    subscription = await syncLatestStripeSubscription({
      userId: user.id,
      customerId: profile.stripe_customer_id,
    });
  }

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mx-auto mb-10 flex w-fit items-center gap-2 transition-opacity hover:opacity-75"
          aria-label="Back to Azalea Labs"
        >
          <Image
            src="/azalea-icon.webp"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl bg-[#1f6b4e] p-1 shadow-[0_12px_28px_rgba(31,107,78,0.18)]"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="font-[family-name:var(--font-geist-sans)] text-sm font-extrabold uppercase tracking-[0.18em] text-black">
              Azalea
            </span>
            <span className="font-[family-name:var(--font-geist-sans)] text-sm font-extrabold uppercase tracking-[0.18em] text-black">
              Labs
            </span>
          </span>
        </Link>
        {!isActive && (
          <h1 className="text-3xl font-bold text-center mb-8 font-[family-name:var(--font-geist-sans)]">
            Account
          </h1>
        )}

        {isActive ? (
          <div>
            <a
              href={IOS_APP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Download on the App Store"
              className="flex h-[56px] w-full items-center justify-center gap-3 rounded-xl bg-[#1f6b4e] px-5 text-white shadow-[0_16px_42px_rgba(31,107,78,0.22)] transition-colors hover:bg-[#184f3a]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 fill-current"
              >
                <path d="M16.7 12.6c0-2 1.6-3 1.7-3.1-1-1.4-2.6-1.6-3.1-1.6-1.3-.1-2.6.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.1 2.8 2.1 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.1.8-1.2 1.1-2.3 1.1-2.3-.1 0-2.6-1-2.6-3.6ZM14.5 6.5c.6-.8 1.1-1.9 1-3-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.6-1.2Z" />
              </svg>
              <span className="font-[family-name:var(--font-geist-sans)] text-sm font-semibold">
                Download on iOS
              </span>
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-[family-name:var(--font-geist-sans)]">
                Name
              </p>
              <p className="text-sm font-medium font-[family-name:var(--font-geist-sans)]">
                {profile?.full_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-[family-name:var(--font-geist-sans)]">
                Email
              </p>
              <p className="text-sm font-medium font-[family-name:var(--font-geist-sans)]">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-[family-name:var(--font-geist-sans)]">
                Subscription
              </p>
              {subscription ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium font-[family-name:var(--font-geist-sans)]">
                    <span className="inline-block w-2 h-2 rounded-full mr-2 bg-red-400" />
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                    {subscription.cancel_at_period_end && " (cancels at period end)"}
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-xs text-gray-400 font-[family-name:var(--font-geist-sans)]">
                      Ended{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-[family-name:var(--font-geist-sans)]">
                  No active subscription
                </p>
              )}
            </div>
          </div>
        )}

        <AccountActions hasSubscription={!!subscription} isActive={isActive} />
      </div>
    </div>
  );
}
