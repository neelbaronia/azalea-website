"use client";

import { useEffect, useRef, useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(false);

  async function handleSubscribe() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        setError("Could not start checkout. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Could not start checkout. Please try again.");
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void handleSubscribe();
  }, []);

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-[10px] bg-red-50 px-3 py-2 font-[family-name:var(--font-geist-sans)] text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full rounded-[10px] bg-black py-3 font-[family-name:var(--font-geist-sans)] text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Redirecting to checkout..." : "Continue to Stripe"}
      </button>
    </div>
  );
}
