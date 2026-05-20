import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Water-Colloid Fragmentation in Low-Energy States",
  description: "Guided educational hotspot walkthrough for water-colloid fragmentation, microvascular flow and layered biological scale transitions."
};

export default function WaterColloidFragmentationWalkthroughPage() {
  const walkthrough = getImageWalkthrough("water-colloid-fragmentation-low-energy");

  return (
    <>
      <nav className="diagram-nav" aria-label="Water-colloid fragmentation walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
