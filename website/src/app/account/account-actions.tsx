"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountActions({
  hasSubscription,
  isActive,
}: {
  hasSubscription: boolean;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleManageSubscription() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="mt-6 space-y-3">
      {hasSubscription && (
        <button
          onClick={handleManageSubscription}
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Manage Subscription"}
        </button>
      )}

      {!isActive && (
        <Link
          href="/subscribe"
          className="block w-full py-3 bg-black text-white rounded-lg text-sm font-semibold text-center font-[family-name:var(--font-geist-sans)] hover:bg-gray-800 transition-colors"
        >
          Subscribe Now
        </Link>
      )}

      <button
        onClick={handleSignOut}
        className="w-full py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 font-[family-name:var(--font-geist-sans)] hover:bg-gray-50 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
