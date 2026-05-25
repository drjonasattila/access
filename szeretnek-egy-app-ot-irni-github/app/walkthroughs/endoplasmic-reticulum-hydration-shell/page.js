import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Endoplasmic Reticulum Hydration Shell",
  description:
    "Guided educational walkthrough for ER hydration, calcium oscillations, protein folding, UPR, PEMF and symbolic systems-medicine correspondences."
};

export default function EndoplasmicReticulumHydrationShellWalkthroughPage() {
  const walkthrough = getImageWalkthrough("endoplasmic-reticulum-hydration-shell");

  return (
    <>
      <nav className="diagram-nav" aria-label="Endoplasmic reticulum hydration shell walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/mitochondrial-hydration-shell">Mitochondrial Hydration Shell</Link>
        <Link href="/walkthroughs/dna-hydration-shell">DNA Hydration Shell</Link>
        <Link href="/walkthroughs/yangming-taiyin-disconnection">Yangming-Taiyin</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
