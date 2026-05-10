import biophysicalSubstrateEngine from "@/lib/avicenna/biophysicalSubstrateEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(biophysicalSubstrateEngine.evaluateBiophysicalSubstrateEngine(input));
  } catch (error) {
    return Response.json(
      { error: "Biophysical substrate evaluation failed" },
      { status: 500 }
    );
  }
}
