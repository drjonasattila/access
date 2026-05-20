import Link from "next/link";
import ImageHotspotWalkthrough from "@/app/components/ImageHotspotWalkthrough";
import { getImageWalkthrough } from "@/src/data/imageWalkthroughs";

export const metadata = {
  title: "Liver Yang Rising and Posterior Fossa Dysregulation",
  description: "Guided educational systems-map walkthrough for posterior fossa dysregulation, Liver Yang rising and compensatory bottom-up signalling."
};

export default function LiverYangPosteriorFossaWalkthroughPage() {
  const walkthrough = getImageWalkthrough("liver-yang-posterior-fossa-dysregulation");

  return (
    <>
      <nav className="diagram-nav" aria-label="Liver Yang posterior fossa walkthrough navigation">
        <Link href="/">Back to Avicenna Engine</Link>
        <Link href="/walkthroughs/receptor-to-field-responsiveness">Receptor to Field</Link>
        <Link href="/walkthroughs/trigeminovascular-headache-pathways">Headache Pathways</Link>
        <Link href="/walkthroughs/six-compartment-map">Six Compartments</Link>
      </nav>
      <ImageHotspotWalkthrough walkthrough={walkthrough} />
    </>
  );
}
