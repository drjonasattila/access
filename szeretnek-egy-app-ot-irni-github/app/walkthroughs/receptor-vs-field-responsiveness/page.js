import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Receptor Modulation vs Field Responsiveness",
  description: "Guided educational hotspot walkthrough for receptor modulation, coherence and field responsiveness."
};

export default function ReceptorVsFieldResponsivenessWalkthroughPage() {
  const walkthrough = getImageWalkthrough("receptor-modulation-vs-field-responsiveness");

  return (
    <>
      <nav className="diagram-nav" aria-label="Receptor modulation versus field responsiveness walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/trigeminovascular-headache-pathways">Headache Pathways</Link>
        <Link href="/walkthroughs/six-compartment-map">Six Compartments</Link>
        <Link href="/walkthroughs/dampening-signal-fidelity">Dampening Fidelity</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
