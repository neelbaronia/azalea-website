import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://azalea-labs.com"),
  title: "Games: Agency as Art — Listening Sample | Azalea Labs",
  description:
    "Listen to an approximately 15-minute narrated excerpt from Games: Agency as Art by C. Thi Nguyen, with synchronized text highlighting.",
  openGraph: {
    title: "Games: Agency as Art — Listening Sample",
    description:
      "A narrated opening excerpt from Games: Agency as Art by C. Thi Nguyen.",
    images: ["/sample-covers/games-agency-as-art.png"],
  },
};

export default function GamesSampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
