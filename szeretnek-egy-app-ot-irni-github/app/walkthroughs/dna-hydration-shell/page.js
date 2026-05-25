import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "DNA Hydration Shell - The Nuclear Light Architecture",
  description: "Guided educational walkthrough for DNA hydration shells, structured water, proton clouds, biophotonic signalling and telomere resilience."
};

export default function DnaHydrationShellWalkthroughPage() {
  const walkthrough = getImageWalkthrough("dna-hydration-shell-nuclear-light-architecture");

  return (
    <>
      <nav className="diagram-nav" aria-label="DNA hydration shell walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/yangming-taiyin-disconnection">Yangming-Taiyin</Link>
        <Link href="/walkthroughs/lysosomotropic-agents">Lysosomotropic Agents</Link>
        <Link href="/walkthroughs/signal-propagation-fragmented-media">Signal Propagation</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
