import headacheTriAxialEngine from "@/lib/avicenna/headacheTriAxialEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(headacheTriAxialEngine.evaluateBatch17Modules(input));
  } catch (error) {
    return Response.json(
      { error: "Batch 17 headache/metabolic module evaluation failed" },
      { status: 500 }
    );
  }
}
