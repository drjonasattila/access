import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Taiyang-Shaoyin Dissociation",
  description: "Guided educational resonance-map walkthrough for dysfunctional Heart-Kidney communication and core-to-surface ventilation failure."
};

export default function TaiyangShaoyinDissociationWalkthroughPage() {
  const walkthrough = getImageWalkthrough("taiyang-shaoyin-dissociation");

  return (
    <>
      <nav className="diagram-nav" aria-label="Taiyang-Shaoyin dissociation walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/liver-yang-posterior-fossa">Liver Yang Map</Link>
        <Link href="/walkthroughs/extended-central-sensitisation">Central Sensitisation</Link>
        <Link href="/walkthroughs/visceral-fat-internal-swamp">Internal Swamp</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
