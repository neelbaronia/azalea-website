import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import MarketingCarousel from "./marketing-carousel";
import type { Campaign } from "./marketing-types";

const title = "Marketing Content | Azalea Labs";
const description =
  "Short-form videos, visual storytelling, and campaign content created by Azalea Labs.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://www.azalea-labs.com/marketing",
    type: "website",
    images: [{ url: "https://www.azalea-labs.com/azalea-icon.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://www.azalea-labs.com/azalea-icon.png"],
  },
};

const campaigns: Campaign[] = [
  {
    id: "oj",
    title: "The Truth About the O.J. Simpson Trial",
    author: "F. Lee Bailey",
    cover: "/sample-covers/the-truth-about-the-oj-simpson-trial.webp",
    spotify: "https://open.spotify.com/show/75D1hObxJKNo3s5CGktk1f",
    summary:
      "A source-labeled Evidence File separates witness testimony from a prosecution theory in Bailey’s defense-side memoir.",
    accent: "#16877f",
    clips: [
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
    id: "restorative-teaching-tools",
    title: "The Little Book of Restorative Teaching Tools",
    author: "Lindsey Pointer · Kathleen McGoey · Haley Farrar",
    cover: "/sample-covers/little-book-of-restorative-teaching-tools.jpg",
    spotify: "https://open.spotify.com/show/3R9AKKQHQiTvznreMBQORN",
    summary:
      "A Practice File explores restorative pedagogy through the teacher’s role as a facilitator in a shared learning experience.",
    accent: "#3f806f",
    clips: [
      {
        id: "restorative-teacher-as-facilitator",
        title: "The Teacher’s Role Is to Make Space",
        format: "Practice File 04 · Vertical video",
        video: "/marketing/restorative-teaching-tools/teacher-as-facilitator.mp4",
        poster: "/marketing/restorative-teaching-tools/teacher-as-facilitator.jpg",
        caption:
          "How can a teacher guide learning without taking over as the sole expert?\n\nThis Chapter 3 excerpt presents the instructor as a facilitator who participates in the learning experience. The visual follows three ideas: create a safe space, reflect together, and share voice and power.",
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
      "A historical explainer uses attributed accounts and a visual timeline to frame one focused question.",
    accent: "#b33d3c",
    clips: [
      {
        id: "kennedy-evidence-09a",
        title: "Conflicting Casket Arrival Times",
        format: "Evidence File 09A · Vertical video",
        video: "/marketing/kennedy-evidence-09a.mp4",
        poster: "/marketing/kennedy-evidence-09a.jpg",
        caption:
          "Two accounts place different caskets at Bethesda at different times on November 22, 1963. In Killing Kennedy, William Matson Law contrasts the Honor Guard’s reported 8:00 p.m. arrival with Dennis David’s account of a shipping casket at about 6:35 p.m. How should the discrepancy be understood?",
      },
    ],
  },
  {
    id: "kremlin-wives",
    title: "Kremlin Wives",
    author: "Larissa Vasilyeva · Cathy Porter",
    cover: "/sample-covers/kremlin-wives.jpg",
    spotify: "https://open.spotify.com/show/035jpZT0xyX07KSLnIApV2",
    summary:
      "A portrait-led video follows Polina Zhemchuzhina through turning points in Soviet public life.",
    accent: "#a33f5c",
    clips: [
      {
        id: "kremlin-wives-polina-zhemchuzhina",
        title: "Polina at the 1921 Women’s Conference",
        format: "Portrait story · Vertical video",
        video: "/marketing/kremlin-wives/polina-zhemchuzhina.mp4",
        poster: "/marketing/kremlin-wives/polina-zhemchuzhina.jpg",
        caption:
          "At a 1921 women’s conference, Molotov noticed Polina Zhemchuzhina. She went on to lead major Soviet industries before her 1949 arrest.\n\nTimeline: 1921 · 1936 · 1939 · 1949",
        photoCredit:
          "Photo: unknown Associated Press photographer, 1936. Wikimedia Commons marks it public domain in the United States; rights may vary elsewhere.",
        photoUrl:
          "https://commons.wikimedia.org/wiki/File:Polina_Zhemchuzhina_1936.jpg",
      },
    ],
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#f2f0e8] text-[#171717]">
      <header className="flex min-h-[64px] items-center justify-between gap-4 border-b border-white/15 bg-[#282142] px-5 text-white md:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Azalea Labs home">
          <Image src="/azalea-icon.webp" alt="" width={30} height={30} priority className="h-7 w-7" />
          <span className="text-xs font-extrabold uppercase tracking-[0.18em]">Azalea Labs</span>
        </Link>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="py-5 md:py-6">
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#282142]/65">
            Selected work
          </p>
          <h1 className="font-[family-name:var(--font-garamond)] text-3xl font-semibold leading-tight tracking-[-0.035em] md:text-4xl">
            Marketing content
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#171717]/65 md:text-sm md:leading-6">
            Short-form videos, visual storytelling, and campaign creative by Azalea Labs. Swipe or use the arrows to explore.
          </p>
        </div>
        <MarketingCarousel campaigns={campaigns} />
      </main>
    </div>
  );
}
