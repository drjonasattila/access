import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Cell Membrane Hydration Shell",
  description:
    "Guided educational walkthrough for the cell membrane as a structured water, lipid and electron interface with hydration shells, membrane viscosity, PEMF and symbolic systems-medicine bridges."
};

export default function CellMembraneHydrationShellWalkthroughPage() {
  const walkthrough = getImageWalkthrough("cell-membrane-hydration-shell");

  return (
    <>
      <nav className="diagram-nav" aria-label="Cell membrane hydration shell walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/microtubule-hydration-shell">Microtubule Hydration Shell</Link>
        <Link href="/walkthroughs/endoplasmic-reticulum-hydration-shell">ER Hydration Shell</Link>
        <Link href="/walkthroughs/mitochondrial-hydration-shell">Mitochondrial Hydration Shell</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
