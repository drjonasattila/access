import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Trigeminovascular Headache Pathways",
  description: "Guided educational hotspot walkthrough for trigeminovascular headache pathways and headache syndrome networks."
};

export default function TrigeminovascularHeadachePathwaysWalkthroughPage() {
  const walkthrough = getImageWalkthrough("trigeminovascular-headache-pathways");

  return (
    <>
      <nav className="diagram-nav" aria-label="Trigeminovascular headache pathways walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/six-compartment-map">Six Compartments</Link>
        <Link href="/walkthroughs/connection-of-life-energy">Life Energy</Link>
        <Link href="/walkthroughs/signal-propagation-fragmented-media">Signal Propagation</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
