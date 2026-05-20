import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "From Receptor Targeting to Field Responsiveness",
  description: "Guided educational concept journey from receptor targeting to field responsiveness and coherence restoration."
};

export default function ReceptorToFieldResponsivenessWalkthroughPage() {
  const walkthrough = getImageWalkthrough("receptor-targeting-to-field-responsiveness");

  return (
    <>
      <nav className="diagram-nav" aria-label="Receptor targeting to field responsiveness walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/receptor-vs-field-responsiveness">Field Responsiveness</Link>
        <Link href="/walkthroughs/trigeminovascular-headache-pathways">Headache Pathways</Link>
        <Link href="/walkthroughs/six-compartment-map">Six Compartments</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
