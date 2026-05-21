import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Shaoyang-Jueyin Dissociation",
  description: "Guided educational mechanism walkthrough for Jueyin emotional integration failure and Shaoyang escape routes."
};

export default function ShaoyangJueyinDissociationWalkthroughPage() {
  const walkthrough = getImageWalkthrough("shaoyang-jueyin-dissociation");

  return (
    <>
      <nav className="diagram-nav" aria-label="Shaoyang-Jueyin dissociation walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/taiyang-shaoyin-dissociation">Taiyang-Shaoyin</Link>
        <Link href="/walkthroughs/extended-central-sensitisation">Central Sensitisation</Link>
        <Link href="/walkthroughs/visceral-fat-internal-swamp">Internal Swamp</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
