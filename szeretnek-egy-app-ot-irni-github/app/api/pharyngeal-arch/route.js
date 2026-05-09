import pharyngealArchEngine from "@/lib/avicenna/pharyngealArchEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(pharyngealArchEngine.evaluatePharyngealArch(input));
  } catch (error) {
    return Response.json(
      { error: "Pharyngeal arch evaluation failed" },
      { status: 500 }
    );
  }
}
