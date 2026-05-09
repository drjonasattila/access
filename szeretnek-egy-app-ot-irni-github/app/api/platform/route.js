import platformArchitecture from "@/lib/avicenna/platformArchitecture.cjs";

export async function POST(request) {
  try {
    const input = await request.json();
    return Response.json(platformArchitecture.evaluatePlatformArchitecture(input));
  } catch (error) {
    return Response.json(
      { error: "Platform architecture evaluation failed" },
      { status: 500 }
    );
  }
}
