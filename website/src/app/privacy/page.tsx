import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Azalea Labs",
  description: "Privacy Policy for Azalea Labs.",
};

const EFFECTIVE_DATE = "April 2, 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-black">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
        <div className="mb-10">
          <Link href="/" className="text-sm font-medium text-black/60 transition-colors hover:text-black">
            ← Back to home
          </Link>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur md:p-12">
          <header className="mb-10 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">Azalea Labs</p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Privacy Policy</h1>
            <p className="max-w-2xl text-base leading-7 text-black/70 md:text-lg">
              This Privacy Policy explains how Azalea Labs collects, uses, and shares information when you use our
              website, products, demos, and related services.
            </p>
            <p className="text-sm text-black/55">Effective date: {EFFECTIVE_DATE}</p>
          </header>

          <div className="space-y-8 text-[15px] leading-7 text-black/80 md:text-base">
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">1. Information We Collect</h2>
              <p>We may collect the following categories of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contact information, such as your name and email address, when you join a waitlist, create an account, or contact us.</li>
                <li>Account and authentication information if you sign up for an Azalea Labs account.</li>
                <li>Payment and subscription information when you purchase or manage a subscription. Payment card information is processed by our payment providers and is not stored by us in full.</li>
                <li>Usage information, including pages viewed, interactions, approximate device information, and analytics events.</li>
                <li>Communications you send to us, including support inquiries and other messages.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">2. How We Use Information</h2>
              <p>We may use information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, maintain, and improve our website and services.</li>
                <li>Create and manage user accounts.</li>
                <li>Process subscriptions, payments, and related account requests.</li>
                <li>Respond to inquiries, send service messages, and provide support.</li>
                <li>Understand how users interact with our site and improve performance, features, and content.</li>
                <li>Protect the security and integrity of our services and prevent misuse.</li>
                <li>Comply with applicable legal obligations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">3. Cookies and Analytics</h2>
              <p>
                We may use cookies and similar technologies to keep the site functioning, remember preferences, measure
                traffic, and understand product usage. We may also use third-party analytics tools to help us understand
                engagement with our website and services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">4. How We Share Information</h2>
              <p>We may share information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers that help us run the website and our business, such as hosting, analytics, authentication, email, database, and payment providers.</li>
                <li>Professional advisors or counterparties as reasonably necessary for legal, compliance, or business operations.</li>
                <li>Government authorities or other third parties when required by law or to protect rights, safety, and security.</li>
                <li>A buyer, investor, or successor entity in connection with a merger, financing, acquisition, reorganization, or sale of assets.</li>
              </ul>
              <p>We do not sell personal information for money.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">5. Data Retention</h2>
              <p>
                We retain personal information for as long as reasonably necessary to provide our services, maintain
                business records, resolve disputes, enforce agreements, and comply with legal obligations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">6. Your Choices</h2>
              <p>Depending on your relationship with us and where you live, you may be able to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request access to, correction of, or deletion of certain personal information.</li>
                <li>Opt out of marketing emails by using the unsubscribe link in those messages.</li>
                <li>Disable cookies through your browser settings, though some site features may not function properly.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">7. Security</h2>
              <p>
                We use reasonable administrative, technical, and organizational measures designed to protect personal
                information. No method of transmission over the internet or method of storage is completely secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">8. Children&apos;s Privacy</h2>
              <p>
                Our services are not directed to children under 13, and we do not knowingly collect personal information
                from children under 13.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If we make material changes, we may revise the
                effective date above and take other steps as appropriate under the circumstances.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-black">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, contact us at{" "}
                <a href="mailto:neel@azalea-labs.com" className="underline underline-offset-4">
                  neel@azalea-labs.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
