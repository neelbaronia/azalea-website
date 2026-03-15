"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full py-3 bg-black text-white rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? "Redirecting to checkout..." : "Subscribe Now"}
    </button>
  );
}
