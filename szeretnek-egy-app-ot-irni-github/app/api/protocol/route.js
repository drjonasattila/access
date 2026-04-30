import engine from "@/lib/avicenna/engine.cjs";

const requiredFields = [
  "thermal",
  "moisture",
  "energy_state",
  "symptom_intensity",
  "digestive_sensitivity"
];

export async function POST(request) {
  try {
    const input = await request.json();
    const missing = requiredFields.filter((field) => !input[field]);

    if (missing.length) {
      return Response.json(
        { error: `Missing required field(s): ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    return Response.json(engine.generateProtocol(input));
  } catch (error) {
    return Response.json(
      { error: "Protocol generation failed" },
      { status: 500 }
    );
  }
}
