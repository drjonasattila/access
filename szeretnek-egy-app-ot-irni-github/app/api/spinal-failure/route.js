import spinalFailureModeEngine from "@/lib/avicenna/spinalFailureModeEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(spinalFailureModeEngine.evaluateSpinalFailureMode(input));
  } catch (error) {
    return Response.json(
      { error: "Spinal failure mode evaluation failed" },
      { status: 500 }
    );
  }
}
