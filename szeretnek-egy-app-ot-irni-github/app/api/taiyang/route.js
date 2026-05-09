import taiyangModule from "@/lib/avicenna/taiyangModule.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(taiyangModule.evaluateTaiyangModule(input));
  } catch (error) {
    return Response.json(
      { error: "Taiyang terrain module evaluation failed" },
      { status: 500 }
    );
  }
}
