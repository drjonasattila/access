import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Microtubule Hydration Shell",
  description:
    "Guided educational walkthrough for microtubule hydration, biophotons, structured water, coherence, anesthetic disruption, PEMF and symbolic systems-medicine bridges."
};

export default function MicrotubuleHydrationShellWalkthroughPage() {
  const walkthrough = getImageWalkthrough("microtubule-hydration-shell");

  return (
    <>
      <nav className="diagram-nav" aria-label="Microtubule hydration shell walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/mitochondrial-hydration-shell">Mitochondrial Hydration Shell</Link>
        <Link href="/walkthroughs/endoplasmic-reticulum-hydration-shell">ER Hydration Shell</Link>
        <Link href="/walkthroughs/dna-hydration-shell">DNA Hydration Shell</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
