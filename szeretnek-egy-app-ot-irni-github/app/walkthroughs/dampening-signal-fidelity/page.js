import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Dampening, Metabolic Waste and Signal Fidelity",
  description: "Guided educational hotspot walkthrough for dampness, metabolic waste and biological signal fidelity."
};

export default function DampeningSignalFidelityWalkthroughPage() {
  const walkthrough = getImageWalkthrough("dampening-metabolic-waste-signal-fidelity");

  return (
    <>
      <nav className="diagram-nav" aria-label="Dampening signal fidelity walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/water-colloid-fragmentation">Water-Colloid Fragmentation</Link>
        <Link href="/walkthroughs/signal-propagation-fragmented-media">Signal Propagation</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
