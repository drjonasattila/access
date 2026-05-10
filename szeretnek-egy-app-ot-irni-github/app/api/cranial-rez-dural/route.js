import cranialRezDuralEngine from "@/lib/avicenna/cranialRezDuralEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(cranialRezDuralEngine.evaluateCranialRezDuralEngine(input));
  } catch (error) {
    return Response.json(
      { error: "Cranial REZ / dural engine evaluation failed" },
      { status: 500 }
    );
  }
}
