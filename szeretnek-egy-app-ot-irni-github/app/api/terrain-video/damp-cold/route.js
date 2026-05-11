import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";

export const runtime = "nodejs";

const DAMP_COLD_VIDEO_PATH =
  process.env.AVICENNA_DAMP_COLD_VIDEO_PATH ||
  "/Volumes/Extreme SSD/Kling videos/Avicenna videos/Avicenna Damp-Cold.mov";

function parseRange(rangeHeader, size) {
  if (!rangeHeader?.startsWith("bytes=")) return null;
  const [startText, endText] = rangeHeader.replace("bytes=", "").split("-");
  const start = Number(startText);
  const end = endText ? Number(endText) : size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end >= size || start > end) {
    return null;
  }

  return { start, end };
}

export async function GET(request) {
  try {
    const file = await stat(DAMP_COLD_VIDEO_PATH);
    const range = parseRange(request.headers.get("range"), file.size);

    if (range) {
      const stream = createReadStream(DAMP_COLD_VIDEO_PATH, range);
      return new Response(Readable.toWeb(stream), {
        status: 206,
        headers: {
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
          "Content-Length": String(range.end - range.start + 1),
          "Content-Range": `bytes ${range.start}-${range.end}/${file.size}`,
          "Content-Type": "video/quicktime"
        }
      });
    }

    const stream = createReadStream(DAMP_COLD_VIDEO_PATH);
    return new Response(Readable.toWeb(stream), {
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": String(file.size),
        "Content-Type": "video/quicktime"
      }
    });
  } catch (error) {
    return Response.json(
      {
        error: "Damp-Cold terrain video is not available from the configured local media path.",
        path: DAMP_COLD_VIDEO_PATH
      },
      { status: 404 }
    );
  }
}
