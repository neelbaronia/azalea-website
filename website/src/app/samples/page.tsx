import { getFeaturedSamples } from "./sample-data";
import SamplesView from "./samples-view";

// Render the cards into the initial HTML and refresh them in the background.
export const revalidate = 3600;

export default async function SamplesPage() {
  const samples = await getFeaturedSamples();
  return <SamplesView samples={samples} />;
}
