import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Extended Central Sensitisation Map",
  description: "Guided educational systems narrative for oscillatory instability, affective-autonomic failure and somatic amplification."
};

export default function ExtendedCentralSensitisationWalkthroughPage() {
  const walkthrough = getImageWalkthrough("extended-central-sensitisation-map");

  return (
    <>
      <nav className="diagram-nav" aria-label="Extended central sensitisation walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/liver-yang-posterior-fossa">Liver Yang Map</Link>
        <Link href="/walkthroughs/receptor-to-field-responsiveness">Receptor to Field</Link>
        <Link href="/walkthroughs/trigeminovascular-headache-pathways">Headache Pathways</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
