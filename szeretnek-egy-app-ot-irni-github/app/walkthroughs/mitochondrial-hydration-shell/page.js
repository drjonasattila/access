import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Mitochondrial Hydration Shell",
  description:
    "Guided educational walkthrough for mitochondrial hydration shells, proton cycling, biophoton emission and cellular coherence."
};

export default function MitochondrialHydrationShellWalkthroughPage() {
  const walkthrough = getImageWalkthrough("mitochondrial-hydration-shell-inner-sun");

  return (
    <>
      <nav className="diagram-nav" aria-label="Mitochondrial hydration shell walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/dna-hydration-shell">DNA Hydration Shell</Link>
        <Link href="/walkthroughs/lysosomotropic-agents">Lysosomotropic Agents</Link>
        <Link href="/walkthroughs/yangming-taiyin-disconnection">Yangming-Taiyin</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
