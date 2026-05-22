import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Yangming-Taiyin Disconnection",
  description: "Guided educational walkthrough for Yangming-Taiyin terrain physiology, water-grid coherence and metabolic regulation."
};

export default function YangmingTaiyinDisconnectionWalkthroughPage() {
  const walkthrough = getImageWalkthrough("yangming-taiyin-disconnection");

  return (
    <>
      <nav className="diagram-nav" aria-label="Yangming-Taiyin disconnection walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/shaoyang-jueyin-dissociation">Shaoyang-Jueyin</Link>
        <Link href="/walkthroughs/taiyang-shaoyin-dissociation">Taiyang-Shaoyin</Link>
        <Link href="/walkthroughs/dampening-signal-fidelity">Dampening Fidelity</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
