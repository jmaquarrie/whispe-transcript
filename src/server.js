import express from "express";
import multer from "multer";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ratePerMinute = parseFloat(
  process.env.TRANSCRIBE_RATE_PER_MINUTE ?? "0.0002"
);

app.use(express.static(path.join(__dirname, "..", "public")));

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(500)
      .json({ error: "Missing OPENAI_API_KEY in environment variables" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  try {
    const audioPath = req.file.path;

    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "gpt-4o-transcribe",
      response_format: "verbose_json",
    });

    const durationSeconds = response?.usage?.total_duration;
    const estimatedCost =
      typeof durationSeconds === "number"
        ? ((durationSeconds / 60) * ratePerMinute).toFixed(6)
        : null;

    res.json({
      text: response?.text ?? "",
      usage: response?.usage ?? {},
      durationSeconds,
      ratePerMinute,
      estimatedCost,
    });
  } catch (error) {
    console.error("Transcription error", error);
    res.status(500).json({
      error: "Transcription failed",
      detail: error?.response?.data ?? error.message,
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
