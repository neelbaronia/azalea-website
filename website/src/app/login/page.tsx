"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/account");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8 font-[family-name:var(--font-geist-sans)]">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1 font-[family-name:var(--font-geist-sans)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm font-[family-name:var(--font-geist-sans)] focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1 font-[family-name:var(--font-geist-sans)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm font-[family-name:var(--font-geist-sans)] focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-[family-name:var(--font-geist-sans)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg text-sm font-semibold font-[family-name:var(--font-geist-sans)] hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-[family-name:var(--font-geist-sans)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-black underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
