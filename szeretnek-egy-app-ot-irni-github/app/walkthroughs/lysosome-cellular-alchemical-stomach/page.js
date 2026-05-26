import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Lysosome - The Cellular Alchemical Stomach",
  description: "Guided educational walkthrough for lysosomes, autophagy, proton gradients, redox sorting and adaptive transformation."
};

export default function LysosomeCellularAlchemicalStomachPage() {
  const walkthrough = getImageWalkthrough("lysosome-cellular-alchemical-stomach");

  return (
    <>
      <nav className="diagram-nav" aria-label="Lysosome walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/lysosomotropic-agents">Lysosomotropic Agents</Link>
        <Link href="/walkthroughs/mitochondrial-hydration-shell">Mito Hydration Shell</Link>
        <Link href="/walkthroughs/glycocalyx-ecm-fascia">Glycocalyx ECM Fascia</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
