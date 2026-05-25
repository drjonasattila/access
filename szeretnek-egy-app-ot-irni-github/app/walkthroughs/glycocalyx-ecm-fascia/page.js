import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Glycocalyx ECM Fascia",
  description:
    "Guided educational walkthrough for the glycocalyx, extracellular matrix and fascia as a continuous structured-water communication body."
};

export default function GlycocalyxEcmFasciaWalkthroughPage() {
  const walkthrough = getImageWalkthrough("glycocalyx-ecm-fascia-water-body");

  return (
    <>
      <nav className="diagram-nav" aria-label="Glycocalyx ECM fascia walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/cell-membrane-hydration-shell">Cell Membrane Hydration Shell</Link>
        <Link href="/walkthroughs/microtubule-hydration-shell">Microtubule Hydration Shell</Link>
        <Link href="/walkthroughs/mitochondrial-hydration-shell">Mitochondrial Hydration Shell</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
