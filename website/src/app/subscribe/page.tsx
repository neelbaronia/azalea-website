import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubscribeButton from "./subscribe-button";

export default async function SubscribePage() {
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
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-geist-sans)]">
          Azalea Unlimited
        </h1>
        <p className="text-gray-500 mb-8 font-[family-name:var(--font-geist-sans)]">
          Unlimited access to the world&apos;s largest audio library.
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <div className="text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-1">
            $9
            <span className="text-lg font-normal text-gray-400">/mo</span>
          </div>
          <ul className="text-sm text-gray-600 mt-6 space-y-3 text-left font-[family-name:var(--font-geist-sans)]">
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Unlimited audiobook streaming
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Access on all devices
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">&#10003;</span> Cancel anytime
            </li>
          </ul>
        </div>

        <SubscribeButton />
      </div>
    </div>
  );
}
