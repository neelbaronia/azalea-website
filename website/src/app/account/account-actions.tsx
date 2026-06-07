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
          className="h-[56px] w-full rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-[0_16px_42px_rgba(0,0,0,0.14)] transition-colors hover:bg-gray-800 disabled:opacity-50 font-[family-name:var(--font-geist-sans)]"
        >
          {loading ? "Loading..." : "Manage Subscription"}
        </button>
      )}

      {!isActive && (
        <Link
          href="/subscribe"
          className="flex h-[56px] w-full items-center justify-center rounded-xl bg-[#1f6b4e] px-5 text-center text-sm font-semibold text-white shadow-[0_16px_42px_rgba(31,107,78,0.18)] transition-colors hover:bg-[#184f3a] font-[family-name:var(--font-geist-sans)]"
        >
          Subscribe Now
        </Link>
      )}

      <button
        onClick={handleSignOut}
        className="h-[56px] w-full rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 font-[family-name:var(--font-geist-sans)]"
      >
        Sign Out
      </button>
    </div>
  );
}
