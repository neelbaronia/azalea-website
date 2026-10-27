"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import styles from "./unlimited.module.css";
import { sendWaitlistSignupConversion } from "./google-ads";

export default function WaitlistForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus("pending");
    setError("");
    const fields = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          website: fields.get("website") ?? "",
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        setStatus("error");
        setError(
          typeof result.error === "string"
            ? result.error
            : "We couldn’t save your email. Please try again.",
        );
        return;
      }

      setStatus("success");
      // Only new saved signups are conversions. Never send email to analytics.
      if (!result.alreadySubscribed) {
        try {
          const analyticsWindow = window as Window & {
            dataLayer?: Record<string, unknown>[];
          };
          const params = new URLSearchParams(window.location.search);
          const campaign = Object.fromEntries(
            [
              "utm_source",
              "utm_medium",
              "utm_campaign",
              "utm_content",
              "utm_term",
            ].flatMap((key) => {
              const value = params.get(key);
              return value ? [[key, value.slice(0, 200)]] : [];
            }),
          );
          analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
          analyticsWindow.dataLayer.push({
            event: "azalea_waitlist_signup",
            product: "unlimited",
            ...campaign,
          });
          sendWaitlistSignupConversion();
        } catch {
          // An analytics/consent integration must never undo a saved signup.
        }
      }
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error &&
          (caught.name === "TimeoutError" || caught.name === "AbortError")
          ? "That took a little too long. Please try again."
          : "We couldn’t connect just now. Please try again.",
      );
    } finally {
      submitting.current = false;
    }
  }

  if (status === "success")
    return (
      <div
        className={styles.success}
        ref={successRef}
        tabIndex={-1}
        role="status"
      >
        <span className={styles.successIcon}>
          <Check size={22} aria-hidden="true" />
        </span>
        <div>
          <strong>You’re on the list.</strong>
          <p>
            {compact
              ? "We’ll email you at launch."
              : "A new chapter is coming. We’ll email you when it’s time."}
          </p>
        </div>
      </div>
    );

  return (
    <div className={styles.formWrap}>
      {!compact ? (
        <p className={styles.formHeading}>Be first to hear when we launch.</p>
      ) : null}
      <form
        onSubmit={submit}
        action="/api/waitlist"
        method="post"
        aria-label="Join the Azalea Audio waitlist"
        aria-busy={status === "pending"}
      >
        <label className={styles.srOnly} htmlFor={`${id}-email`}>
          Email address
        </label>
        <div className={styles.formRow}>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            autoCapitalize="none"
            maxLength={254}
            required
            placeholder="Your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "pending"}
            aria-invalid={status === "error"}
            aria-describedby={`${id}-note${status === "error" ? ` ${id}-error` : ""}`}
          />
          <button type="submit" disabled={status === "pending"}>
            {status === "pending" ? (
              <>
                Saving your spot{" "}
                <LoaderCircle
                  className={styles.spinner}
                  size={17}
                  aria-hidden="true"
                />
              </>
            ) : (
              <>
                Join the waitlist <ArrowUpRight size={19} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor={`${id}-website`}>Leave this field empty</label>
          <input
            id={`${id}-website`}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        {status === "error" ? (
          <p className={styles.formError} id={`${id}-error`} role="alert">
            {error}
          </p>
        ) : null}
        <p className={styles.formFinePrint} id={`${id}-note`}>
          {compact ? (
            <>
              Free waitlist. Launch updates only.{" "}
              <Link href="/privacy">Privacy</Link>.
            </>
          ) : (
            <>
              Free to join. No card needed.
              <br />
              By joining, you agree to receive launch updates.{" "}
              <Link href="/privacy">Privacy policy</Link>.
            </>
          )}
        </p>
        <noscript>
          <p className={styles.formFinePrint}>
            Enable JavaScript for the best signup experience.
          </p>
        </noscript>
      </form>
    </div>
  );
}
