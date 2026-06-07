"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const covers = [
  {
    title: "The Red Seal",
    src: "/audiobook-covers/red-seal.png",
  },
  {
    title: "The Hand in the Dark",
    src: "/audiobook-covers/hand-in-the-dark.png",
  },
  {
    title: "The Sign of the Seven Sins",
    src: "/audiobook-covers/sign-seven-sins.png",
  },
  {
    title: "The Phantom Public",
    src: "/audiobook-covers/phantom-public.png",
  },
  {
    title: "Tarrano the Conqueror",
    src: "/audiobook-covers/tarrano.png",
  },
  {
    title: "The Evolution of the Oil Industry",
    src: "/audiobook-covers/oil-industry.png",
  },
];

const waterfallSlots = [
  {
    left: "2%",
    top: "2%",
    rotate: "-8deg",
    zIndex: 6,
    opacity: 1,
  },
  {
    left: "24%",
    top: "12%",
    rotate: "5deg",
    zIndex: 5,
    opacity: 0.96,
  },
  {
    left: "48%",
    top: "24%",
    rotate: "-5deg",
    zIndex: 4,
    opacity: 0.92,
  },
  {
    left: "64%",
    top: "44%",
    rotate: "8deg",
    zIndex: 3,
    opacity: 0.9,
  },
  {
    left: "36%",
    top: "58%",
    rotate: "-7deg",
    zIndex: 4,
    opacity: 0.94,
  },
  {
    left: "10%",
    top: "42%",
    rotate: "6deg",
    zIndex: 5,
    opacity: 0.98,
  },
];

function CoverWaterfall({ desktop = false }: { desktop?: boolean }) {
  const [offset, setOffset] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);

  function rotate(direction: 1 | -1) {
    setOffset((current) => (current + direction + covers.length) % covers.length);
  }

  return (
    <div>
      <div
        aria-label="Swipe audiobook covers"
        className={`relative mx-auto aspect-square w-full cursor-grab touch-pan-y select-none active:cursor-grabbing ${
          desktop ? "mt-8 max-w-[520px]" : "mt-5 max-w-[292px]"
        }`}
        onPointerDown={(event) => {
          setDragStart(event.clientX);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (dragStart == null) return;
          const delta = event.clientX - dragStart;
          if (Math.abs(delta) > 24) {
            rotate(delta < 0 ? 1 : -1);
          }
          setDragStart(null);
        }}
        onPointerCancel={() => setDragStart(null)}
      >
        {covers.map((cover, index) => {
          const slot = waterfallSlots[(index + offset) % waterfallSlots.length];

          return (
            <div
              key={cover.title}
              className={`absolute aspect-square w-[34%] overflow-hidden border border-white/80 bg-[#edf2ec] shadow-[0_16px_34px_rgba(20,28,22,0.18)] transition-[left,top,transform,opacity] duration-300 ease-out ${
                desktop ? "rounded-[22px]" : "rounded-[14px]"
              }`}
              style={{
                left: slot.left,
                top: slot.top,
                transform: `rotate(${slot.rotate})`,
                zIndex: slot.zIndex,
                opacity: slot.opacity,
              }}
              onClick={() => rotate(index % 2 === 0 ? 1 : -1)}
            >
              <Image
                src={cover.src}
                alt={`${cover.title} cover`}
                fill
                sizes={desktop ? "180px" : "120px"}
                className="object-cover"
                draggable={false}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-7 text-[10px] font-bold leading-tight text-white">
                {cover.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SignupForm({
  firstName,
  lastName,
  email,
  password,
  error,
  loading,
  setFirstName,
  setLastName,
  setEmail,
  setPassword,
  handleSubmit,
  idPrefix,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  idPrefix: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={`${idPrefix}-firstName`}
            className="mb-1 block font-[family-name:var(--font-geist-sans)] text-xs font-semibold text-[#6f746f]"
          >
            First name
          </label>
          <input
            id={`${idPrefix}-firstName`}
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-[52px] w-full rounded-[10px] border border-[#e1e5dd] bg-white px-4 font-[family-name:var(--font-geist-sans)] text-sm text-[#111] outline-none transition focus:border-[#b7c4b3] focus:ring-4 focus:ring-[#1f6b4e]/10"
            placeholder="Jane"
            autoComplete="given-name"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-lastName`}
            className="mb-1 block font-[family-name:var(--font-geist-sans)] text-xs font-semibold text-[#6f746f]"
          >
            Last name
          </label>
          <input
            id={`${idPrefix}-lastName`}
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-[52px] w-full rounded-[10px] border border-[#e1e5dd] bg-white px-4 font-[family-name:var(--font-geist-sans)] text-sm text-[#111] outline-none transition focus:border-[#b7c4b3] focus:ring-4 focus:ring-[#1f6b4e]/10"
            placeholder="Doe"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-email`}
          className="mb-1 block font-[family-name:var(--font-geist-sans)] text-xs font-semibold text-[#6f746f]"
        >
          Email
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-[52px] w-full rounded-[10px] border border-[#e1e5dd] bg-white px-4 font-[family-name:var(--font-geist-sans)] text-sm text-[#111] outline-none transition focus:border-[#b7c4b3] focus:ring-4 focus:ring-[#1f6b4e]/10"
          placeholder="jane@example.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-password`}
          className="mb-1 block font-[family-name:var(--font-geist-sans)] text-xs font-semibold text-[#6f746f]"
        >
          Password
        </label>
        <div className="relative">
          <input
            id={`${idPrefix}-password`}
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[52px] w-full rounded-[10px] border border-[#e1e5dd] bg-white px-4 pr-12 font-[family-name:var(--font-geist-sans)] text-sm text-[#111] outline-none transition focus:border-[#b7c4b3] focus:ring-4 focus:ring-[#1f6b4e]/10"
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#6f746f] transition hover:bg-[#f2f6ef] hover:text-[#111]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-[10px] bg-red-50 px-3 py-2 font-[family-name:var(--font-geist-sans)] text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-[54px] w-full rounded-[10px] bg-[#111] font-[family-name:var(--font-geist-sans)] text-sm font-extrabold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Continue"}
      </button>
    </form>
  );
}

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          pending_payment: true,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/subscribe");
  }

  const renderSignupForm = (idPrefix: string) => (
    <SignupForm
      firstName={firstName}
      lastName={lastName}
      email={email}
      password={password}
      error={error}
      loading={loading}
      setFirstName={setFirstName}
      setLastName={setLastName}
      setEmail={setEmail}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
      idPrefix={idPrefix}
    />
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(232,243,238,0.95),transparent_26rem),radial-gradient(circle_at_90%_10%,rgba(31,107,78,0.10),transparent_24rem),#fbfbfb] px-4 py-5 sm:py-8 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-sm flex-col lg:hidden">
        <Link
          href="/"
          className="mb-7 flex w-fit items-center gap-3 font-[family-name:var(--font-geist-sans)] text-lg font-black tracking-[-0.01em]"
        >
          <Image
            src="/azalea-icon.webp"
            alt="Azalea"
            width={44}
            height={44}
            className="rounded-[13px] bg-[#1f6b4e] p-1 shadow-[0_12px_28px_rgba(31,107,78,0.22)]"
            priority
          />
          <span>Azalea</span>
        </Link>

        <section className="flex-1">
          <h1 className="font-[family-name:var(--font-geist-sans)] text-[2.45rem] font-black leading-[0.98] tracking-[-0.055em] text-[#111]">
            Start listening in two minutes
          </h1>

          <CoverWaterfall />

          <div className="mt-4 grid grid-cols-[1fr_auto] items-end rounded-[14px] bg-[#e8f3ee] p-4">
            <div>
              <p className="font-[family-name:var(--font-geist-sans)] text-sm font-extrabold text-[#1f6b4e]">
                Azalea Unlimited
              </p>
              <p className="mt-1 font-[family-name:var(--font-geist-sans)] text-3xl font-black tracking-[-0.04em] text-[#111]">
                $9/mo
              </p>
            </div>
            <p className="pb-1 font-[family-name:var(--font-geist-sans)] text-sm text-[#6f746f]">
              Cancel anytime
            </p>
          </div>

          {renderSignupForm("mobile-signup")}

          <p className="mt-3 text-center font-[family-name:var(--font-geist-sans)] text-xs leading-relaxed text-[#6f746f]">
            Next: secure payment on Stripe. No card details stored by Azalea.
          </p>
        </section>

        <p className="mt-6 text-center font-[family-name:var(--font-geist-sans)] text-sm text-[#6f746f]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#111] underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mx-auto hidden min-h-[calc(100vh-64px)] w-full max-w-6xl grid-cols-[minmax(0,1.12fr)_minmax(390px,440px)] items-center gap-14 lg:grid">
        <section>
          <Link
            href="/"
            className="mb-12 flex w-fit items-center gap-4 font-[family-name:var(--font-geist-sans)] text-xl font-black tracking-[-0.01em]"
          >
            <Image
              src="/azalea-icon.webp"
              alt="Azalea"
              width={52}
              height={52}
              className="rounded-[15px] bg-[#1f6b4e] p-1.5 shadow-[0_12px_28px_rgba(31,107,78,0.22)]"
              priority
            />
            <span>Azalea</span>
          </Link>

          <h1 className="max-w-2xl font-[family-name:var(--font-geist-sans)] text-[clamp(4rem,7vw,6.5rem)] font-black leading-[0.9] tracking-[-0.065em] text-[#111]">
            Start listening in two minutes
          </h1>

          <p className="mt-6 max-w-xl font-[family-name:var(--font-geist-sans)] text-lg leading-8 text-[#6f746f]">
            Create your Azalea account, then finish payment through secure Stripe Checkout. The library is ready as soon as your subscription is active.
          </p>

          <CoverWaterfall desktop />
        </section>

        <aside className="rounded-[24px] border border-[#e1e5dd] bg-white/80 p-7 shadow-[0_24px_70px_rgba(23,35,26,0.10)] backdrop-blur">
          <div className="grid grid-cols-[1fr_auto] items-end rounded-[16px] bg-[#e8f3ee] p-5">
            <div>
              <p className="font-[family-name:var(--font-geist-sans)] text-sm font-extrabold text-[#1f6b4e]">
                Azalea Unlimited
              </p>
              <p className="mt-1 font-[family-name:var(--font-geist-sans)] text-4xl font-black tracking-[-0.04em] text-[#111]">
                $9/mo
              </p>
            </div>
            <p className="pb-1 font-[family-name:var(--font-geist-sans)] text-sm text-[#6f746f]">
              Cancel anytime
            </p>
          </div>

          {renderSignupForm("desktop-signup")}

          <p className="mt-3 text-center font-[family-name:var(--font-geist-sans)] text-xs leading-relaxed text-[#6f746f]">
            Next: secure payment on Stripe. No card details stored by Azalea.
          </p>

          <p className="mt-6 text-center font-[family-name:var(--font-geist-sans)] text-sm text-[#6f746f]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#111] underline">
              Sign in
            </Link>
          </p>
        </aside>
      </div>
    </main>
  );
}
