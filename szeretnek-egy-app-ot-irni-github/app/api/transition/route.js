import transitionEngine from "@/lib/avicenna/transitionEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(transitionEngine.evaluateTransitionEngine(input));
  } catch (error) {
    return Response.json(
      { error: "Transition engine evaluation failed" },
      { status: 500 }
    );
  }
}
