import fs from "fs";
import { IncomingForm } from "formidable";
import { transcribeFile } from "../src/transcribe.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ratePerMinute = parseFloat(
  process.env.TRANSCRIBE_RATE_PER_MINUTE ?? "0.0002"
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const suppliedKey = req.headers["x-openai-key"];
  const apiKey = suppliedKey?.toString().trim() || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      error: "Provide an API key via the x-openai-key header or set OPENAI_API_KEY.",
    });
  }

  const form = new IncomingForm({
    keepExtensions: true,
    multiples: false,
    uploadDir: "/tmp",
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error", err);
      return res.status(400).json({ error: "Invalid upload" });
    }

    const audioFile = files.audio;
    const filePath = Array.isArray(audioFile)
      ? audioFile[0]?.filepath
      : audioFile?.filepath;

    if (!filePath) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    try {
      const result = await transcribeFile({
        filePath,
        apiKey,
        ratePerMinute,
      });

      res.json(result);
    } catch (error) {
      console.error("Transcription error", error);
      res.status(500).json({
        error: "Transcription failed",
        detail: error?.response?.data ?? error.message,
      });
    } finally {
      fs.unlink(filePath, () => {});
    }
  });
}
