import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { transcribeFile } from "./transcribe.js";

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
const ratePerMinute = parseFloat(
  process.env.TRANSCRIBE_RATE_PER_MINUTE ?? "0.0002"
);

app.use(express.static(path.join(__dirname, "..", "public")));

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  const suppliedKey = req.get("x-openai-key");
  const apiKey = suppliedKey?.trim() || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      error:
        "Provide an API key via the x-openai-key header or set OPENAI_API_KEY.",
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  try {
    const audioPath = req.file.path;
    const result = await transcribeFile({
      filePath: audioPath,
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
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
