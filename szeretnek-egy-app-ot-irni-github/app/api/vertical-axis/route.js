import postSurgicalIntegrationEngine from "@/lib/avicenna/postSurgicalIntegrationEngine.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(postSurgicalIntegrationEngine.evaluatePostSurgicalIntegration(input));
  } catch (error) {
    return Response.json(
      { error: "Vertical-axis integration evaluation failed" },
      { status: 500 }
    );
  }
}
