import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketing Work | Azalea Labs",
  description:
    "A look at short-form audiobook campaigns created by Azalea Labs for The Truth About the O.J. Simpson Trial and Killing Kennedy.",
};

type Clip = {
  id: string;
  title: string;
  format: string;
  video: string;
  poster: string;
  caption: string;
  note?: string;
};

type Campaign = {
  id: string;
  title: string;
  author: string;
  cover: string;
  spotify: string;
  summary: string;
  accent: string;
  clips: Clip[];
};

const campaigns: Campaign[] = [
  {
    id: "oj",
    title: "The Truth About the O.J. Simpson Trial",
    author: "F. Lee Bailey",
    cover: "/sample-covers/the-truth-about-the-oj-simpson-trial.webp",
    spotify: "https://open.spotify.com/show/75D1hObxJKNo3s5CGktk1f",
    summary:
      "An Evidence File series built around questions from the trial, with careful distinctions between testimony, prosecution theories, and Bailey’s defense-side memoir account.",
    accent: "#16877f",
    clips: [
      {
        id: "oj-evidence-01",
        title: "The 15 Minutes Before the Glove",
        format: "Evidence File 01 · Vertical video",
        video: "/marketing/oj-evidence-01.mp4",
        poster: "/marketing/oj-evidence-01.jpg",
        caption:
          "What happened during the roughly 15 minutes before the Rockingham glove was reported?\n\nThis Evidence File follows F. Lee Bailey’s defense-side memoir account of that timeline. It does not establish that evidence was planted.",
      },
      {
        id: "oj-evidence-02",
        title: "The “Mysterious” Dark Bag",
        format: "Evidence File 02 · Vertical video",
        video: "/marketing/oj-evidence-02.mp4",
        poster: "/marketing/oj-evidence-02.jpg",
        caption:
          "A witness observation and a prosecution theory are not the same thing.\n\nIn F. Lee Bailey’s summary, Kato Kaelin testified about a small dark bag. Prosecutors later gave the bag an incriminating interpretation. This Evidence File keeps those claims separate.",
      },
    ],
  },
  {
    id: "kennedy",
    title: "Killing Kennedy",
    author: "Jack Roth",
    cover: "/sample-covers/killing-kennedy.webp",
    spotify: "https://open.spotify.com/show/6PLTDAQcC6aIFOdOMWE2bN",
    summary:
      "Short historical explainers that turn details and competing accounts in the audiobook into focused, attributed questions for listeners.",
    accent: "#b33d3c",
    clips: [
      {
        id: "kennedy-evidence-09a",
        title: "Two Caskets. Two Claimed Arrival Times.",
        format: "Evidence File 09A · Vertical video",
        video: "/marketing/kennedy-evidence-09a.mp4",
        poster: "/marketing/kennedy-evidence-09a.jpg",
        caption:
          "Two accounts place different caskets at Bethesda at different times on November 22, 1963. In Killing Kennedy, William Matson Law contrasts the Honor Guard’s reported 8:00 p.m. arrival with Dennis David’s account of a shipping casket at about 6:35 p.m. How should the discrepancy be understood?",
      },
      {
        id: "kennedy-evidence-26a",
        title: "Oswald: Unknown—or Monitored for Four Years?",
        format: "Evidence File 26A · Vertical video",
        video: "/marketing/kennedy-evidence-26a.mp4",
        poster: "/marketing/kennedy-evidence-26a.jpg",
        caption:
          "Lee Harvey Oswald is often described as an unknown figure who suddenly entered history. In Killing Kennedy, Jefferson Morley says the CIA had monitored him for four years and collected information that reached James Angleton’s office. What does that change about the timeline?",
        note:
          "This clip presents Jefferson Morley’s account as discussed in the audiobook, not as a settled historical finding.",
      },
    ],
  },
];

function CampaignSection({ campaign }: { campaign: Campaign }) {
  return (
    <section id={campaign.id} className="scroll-mt-8 border-t border-[#171717]/15 py-14 md:py-20">
      <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-5 md:gap-7">
          <Image
            src={campaign.cover}
            alt={`Cover of ${campaign.title}`}
            width={88}
            height={132}
            className="h-[108px] w-[72px] shrink-0 rounded-sm object-cover shadow-md md:h-[132px] md:w-[88px]"
          />
          <div>
            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: campaign.accent }}
            >
              Audiobook campaign
            </p>
            <h2 className="max-w-2xl font-[family-name:var(--font-garamond)] text-3xl font-semibold leading-tight tracking-[-0.035em] md:text-5xl">
              {campaign.title}
            </h2>
            <p className="mt-1 text-sm text-[#171717]/60">{campaign.author}</p>
          </div>
        </div>
        <Link
          href={campaign.spotify}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#171717]/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:bg-[#171717] hover:text-white"
        >
          Listen on Spotify <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <p className="mb-8 max-w-3xl text-base leading-7 text-[#171717]/70 md:mb-10 md:text-lg">
        {campaign.summary}
      </p>

      <div className="grid gap-5 md:grid-cols-2 md:gap-7">
        {campaign.clips.map((clip, index) => (
          <article
            key={clip.id}
            className="overflow-hidden border border-[#171717]/15 bg-white/55"
          >
            <div className="flex items-center justify-between border-b border-[#171717]/10 px-5 py-4 md:px-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#171717]/55">
                {clip.format}
              </span>
              <span className="font-[family-name:var(--font-garamond)] text-xl text-[#171717]/35">
                0{index + 1}
              </span>
            </div>
            <div className="flex justify-center bg-[#e8e5dc] px-5 py-6 md:px-8 md:py-8">
              <video
                controls
                playsInline
                preload="none"
                poster={clip.poster}
                aria-label={clip.title}
                className="aspect-[9/16] max-h-[520px] w-full max-w-[292px] bg-black object-contain shadow-lg"
              >
                <source src={clip.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-5 md:p-7">
              <h3 className="font-[family-name:var(--font-garamond)] text-2xl font-semibold leading-tight md:text-3xl">
                {clip.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[#171717]/75 md:text-base md:leading-7">
                {clip.caption}
              </p>
              {clip.note && (
                <p className="mt-4 border-l-2 pl-3 text-xs leading-5 text-[#171717]/55" style={{ borderColor: campaign.accent }}>
                  {clip.note}
                </p>
              )}
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#171717]/45">
                Sample social caption · Instagram
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#f2f0e8] text-[#171717]">
      <header className="flex min-h-[64px] items-center justify-between gap-4 border-b border-white/15 bg-[#282142] px-5 text-white md:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Azalea Labs home">
          <Image src="/azalea-icon.webp" alt="" width={30} height={30} priority className="h-7 w-7" />
          <span className="text-xs font-extrabold uppercase tracking-[0.18em]">Azalea Labs</span>
        </Link>
        <nav className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.1em] md:gap-8 md:text-[11px] md:tracking-[0.14em]" aria-label="Main navigation">
          <Link href="/samples" className="text-white/70 transition-colors hover:text-white">Samples</Link>
          <Link href="/translations" className="text-white/70 transition-colors hover:text-white">Translations</Link>
          <Link href="/publications" className="text-white/70 transition-colors hover:text-white">Publications</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 md:px-10">
        <section className="py-16 md:py-24 lg:py-28">
          <p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#355cff] md:text-xs">
            <span className="h-px w-9 bg-[#355cff]" />
            Azalea Labs · Campaign work
          </p>
          <div className="grid gap-8 border-b border-[#171717]/15 pb-10 md:grid-cols-[1.25fr_0.75fr] md:items-end md:gap-14 md:pb-12">
            <h1 className="max-w-4xl font-[family-name:var(--font-garamond)] text-6xl font-medium leading-[0.88] tracking-[-0.055em] md:text-8xl lg:text-[108px]">
              Stories made to <em className="font-normal">travel.</em>
            </h1>
            <div className="max-w-xl md:pb-1">
              <p className="text-base leading-7 text-[#171717]/70 md:text-lg md:leading-8">
                Short-form campaigns created to help listeners discover the books behind them. Explore selected video and social copy for two Azalea audiobook titles.
              </p>
              <p className="mt-4 text-xs leading-5 text-[#171717]/50">
                Four vertical video samples · Two audiobook campaigns
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-7 gap-y-3 pt-5 text-[10px] font-bold uppercase tracking-[0.15em]" aria-label="Campaigns">
            {campaigns.map((campaign) => (
              <a key={campaign.id} href={`#${campaign.id}`} className="transition-colors hover:text-[#355cff]">
                {campaign.title} <span aria-hidden="true">↓</span>
              </a>
            ))}
          </nav>
        </section>

        {campaigns.map((campaign) => (
          <CampaignSection key={campaign.id} campaign={campaign} />
        ))}
      </main>
    </div>
  );
}
