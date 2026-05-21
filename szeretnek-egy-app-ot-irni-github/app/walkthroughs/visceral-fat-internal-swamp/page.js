import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Visceral Fat as a Stagnant Internal Swamp",
  description: "Guided educational terrain walkthrough for visceral fat, dampness, lymphatic flow and coherent restoration."
};

export default function VisceralFatInternalSwampWalkthroughPage() {
  const walkthrough = getImageWalkthrough("visceral-fat-internal-swamp");

  return (
    <>
      <nav className="diagram-nav" aria-label="Visceral fat internal swamp walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/extended-central-sensitisation">Central Sensitisation</Link>
        <Link href="/walkthroughs/liver-yang-posterior-fossa">Liver Yang Map</Link>
        <Link href="/walkthroughs/dampening-signal-fidelity">Dampening Fidelity</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
