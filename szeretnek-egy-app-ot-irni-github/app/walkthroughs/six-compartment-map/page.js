import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Six-Compartment Communication Map",
  description: "Guided educational hotspot walkthrough for Chinese and Ayurvedic terminology, tissue organisation and signalling compartments."
};

export default function SixCompartmentCommunicationMapWalkthroughPage() {
  const walkthrough = getImageWalkthrough("six-compartment-communication-map");

  return (
    <>
      <nav className="diagram-nav" aria-label="Six-compartment communication map walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/connection-of-life-energy">Life Energy</Link>
        <Link href="/walkthroughs/dampening-signal-fidelity">Dampening Fidelity</Link>
        <Link href="/walkthroughs/signal-propagation-fragmented-media">Signal Propagation</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
