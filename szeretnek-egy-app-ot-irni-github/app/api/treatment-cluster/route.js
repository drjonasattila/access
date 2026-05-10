import treatmentClusterEngine from "@/lib/avicenna/treatmentClusterEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(treatmentClusterEngine.evaluateTreatmentClusterEngine(input));
  } catch (error) {
    return Response.json(
      { error: "Treatment cluster evaluation failed" },
      { status: 500 }
    );
  }
}
