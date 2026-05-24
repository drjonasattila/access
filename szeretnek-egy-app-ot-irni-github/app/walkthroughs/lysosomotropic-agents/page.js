import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Lysosomotropic Agents - Adaptive Phase-Transition Protocol",
  description: "Guided educational walkthrough for chaotic overload, absorber phase tools, monitoring, exit criteria and rebuilding."
};

export default function LysosomotropicAgentsWalkthroughPage() {
  const walkthrough = getImageWalkthrough("lysosomotropic-agents-phase-transition-protocol");

  return (
    <>
      <nav className="diagram-nav" aria-label="Lysosomotropic agents walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/yangming-taiyin-disconnection">Yangming-Taiyin</Link>
        <Link href="/walkthroughs/dampening-signal-fidelity">Dampening Fidelity</Link>
        <Link href="/walkthroughs/visceral-fat-internal-swamp">Internal Swamp</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
