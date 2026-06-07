import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import SubscribeButton from "./subscribe-button";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams?: Promise<{ canceled?: string }>;
}) {
  const params = await searchParams;

  if (params?.canceled === "true") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/signup?payment=canceled");
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .single();

    if (subscription) {
      redirect("/account");
    }

    if (user.user_metadata?.pending_payment === true) {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(user.id);
      await supabase.auth.signOut();
      redirect("/signup?payment=canceled");
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already has an active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .single();

  if (subscription) {
    redirect("/account");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 h-10 w-10 animate-pulse rounded-full bg-[#e8f3ee]" />
        <h1 className="mb-2 font-[family-name:var(--font-geist-sans)] text-3xl font-bold">
          Sending you to checkout
        </h1>
        <p className="mb-8 font-[family-name:var(--font-geist-sans)] text-gray-500">
          Stripe will handle payment securely. If you are not redirected, use the button below.
        </p>
        <SubscribeButton />
      </div>
    </div>
  );
}
