import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "The Connection of Life Energy",
  description: "Guided educational hotspot walkthrough for light, water, membranes, mitochondria, fascia, blood vessels and nerves."
};

export default function ConnectionOfLifeEnergyWalkthroughPage() {
  const walkthrough = getImageWalkthrough("connection-of-life-energy");

  return (
    <>
      <nav className="diagram-nav" aria-label="Connection of life energy walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/water-colloid-fragmentation">Water-Colloid Fragmentation</Link>
        <Link href="/walkthroughs/signal-propagation-fragmented-media">Signal Propagation</Link>
        <Link href="/walkthroughs/dampening-signal-fidelity">Dampening Fidelity</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
