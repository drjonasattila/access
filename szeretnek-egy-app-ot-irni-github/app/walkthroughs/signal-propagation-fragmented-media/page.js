import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Signal Propagation on Fragmented Biological Media",
  description: "Guided educational hotspot walkthrough for signal propagation, fragmented biological media and water-colloid coherence."
};

export default function SignalPropagationFragmentedMediaWalkthroughPage() {
  const walkthrough = getImageWalkthrough("signal-propagation-fragmented-media");

  return (
    <>
      <nav className="diagram-nav" aria-label="Signal propagation walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/water-colloid-fragmentation">Water-Colloid Fragmentation</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
