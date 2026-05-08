import headacheEngine from "@/lib/avicenna/headacheEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(headacheEngine.evaluateHeadache(input));
  } catch (error) {
    return Response.json(
      { error: "Headache pattern evaluation failed" },
      { status: 500 }
    );
  }
}
