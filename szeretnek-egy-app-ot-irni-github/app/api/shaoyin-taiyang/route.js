import shaoyinTaiyangEngine from "@/lib/avicenna/shaoyinTaiyangDissociationEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(shaoyinTaiyangEngine.evaluateShaoyinTaiyang(input));
  } catch (error) {
    return Response.json(
      { error: "Shaoyin-Taiyang meta-pattern evaluation failed" },
      { status: 500 }
    );
  }
}
