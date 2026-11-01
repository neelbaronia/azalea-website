import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { deletePendingPaymentAccount, getMembershipAccess } from "@/lib/membership-access";
import SubscribeButton from "./subscribe-button";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams?: Promise<{ canceled?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(params?.canceled === "true" ? "/signup?payment=canceled" : "/login");
  }

  let hasAccess: boolean;
  try {
    hasAccess = (await getMembershipAccess(supabase)).has_access;
  } catch (error) {
    console.error("Error verifying membership before checkout:", error);
    return <AccessUnavailable />;
  }

  if (hasAccess) redirect("/account");

  if (params?.canceled === "true" && user.user_metadata?.pending_payment === true) {
    let deleted: boolean;
    try {
      deleted = await deletePendingPaymentAccount(createAdminClient(), user.id);
    } catch (error) {
      console.error("Error verifying pending account cleanup:", error);
      return <AccessUnavailable />;
    }
    if (deleted) {
      await supabase.auth.signOut();
      redirect("/signup?payment=canceled");
    }
    // Access or account state changed since the initial check. Never restart
    // checkout after declining a deletion for a protected account.
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

function AccessUnavailable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-bold">Unable to check membership</h1>
        <p className="mb-6 text-gray-500">
          We could not confirm your existing access. Please try again before starting a subscription.
        </p>
        <Link href="/account" className="font-semibold underline">Return to account</Link>
      </div>
    </div>
  );
}
