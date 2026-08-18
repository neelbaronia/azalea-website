import Image from "next/image";

const ELEVENLABS_GRANTS_URL = "https://elevenlabs.io/startup-grants";
const ELEVENLABS_GRANTS_LOGO_URL =
  "https://eleven-public-cdn.elevenlabs.io/payloadcms/cy7rxce8uki-IIElevenLabsGrants%201.webp";

export default function SiteFooter() {
  return (
    <footer id="site-footer" className="w-full bg-black text-white/60">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-8">
        <div className="space-y-2">
          <p className="text-white font-bold text-sm uppercase tracking-[0.3em]">
            Azalea Labs
          </p>
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Azalea Labs. All rights reserved.
          </p>
          <div className="pt-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">
              Supported by ElevenLabs Grants
            </p>
            <a
              href={ELEVENLABS_GRANTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex opacity-85 transition-opacity hover:opacity-100"
              aria-label="Supported by ElevenLabs Grants"
            >
              <Image
                src={ELEVENLABS_GRANTS_LOGO_URL}
                alt="ElevenLabs Grants"
                width={250}
                height={48}
                className="h-auto w-[170px] md:w-[190px]"
              />
            </a>
          </div>
        </div>

        <nav
          className="flex flex-wrap gap-x-10 gap-y-4 text-sm"
          aria-label="Footer"
        >
          <a
            href="mailto:neel@azalea-labs.com"
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
          <a href="/samples" className="hover:text-white transition-colors">
            Samples
          </a>
          <a
            href="/publications"
            className="hover:text-white transition-colors"
          >
            Our Publications
          </a>
          <a
            href="/payout.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Payout Dashboard
          </a>
          <a href="#" className="hover:text-white transition-colors">
            About
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
          <a href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}
