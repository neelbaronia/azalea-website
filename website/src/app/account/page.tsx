import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountActions from "./account-actions";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8 font-[family-name:var(--font-geist-sans)]">
          Account
        </h1>

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
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      isActive ? "bg-green-500" : "bg-red-400"
                    }`}
                  />
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                  {subscription.cancel_at_period_end && " (cancels at period end)"}
                </p>
                {subscription.current_period_end && (
                  <p className="text-xs text-gray-400 font-[family-name:var(--font-geist-sans)]">
                    {isActive ? "Renews" : "Ended"}{" "}
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

        <AccountActions hasSubscription={!!subscription} isActive={isActive} />
      </div>
    </div>
  );
}
