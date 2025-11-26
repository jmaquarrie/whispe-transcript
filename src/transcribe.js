import fs from "fs";
import OpenAI from "openai";

export async function transcribeFile({ filePath, apiKey, ratePerMinute }) {
  const openai = new OpenAI({ apiKey });

  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "gpt-4o-transcribe",
    response_format: "verbose_json",
  });

  const durationSeconds = response?.usage?.total_duration;
  const estimatedCost =
    typeof durationSeconds === "number"
      ? ((durationSeconds / 60) * ratePerMinute).toFixed(6)
      : null;

  return {
    text: response?.text ?? "",
    usage: response?.usage ?? {},
    durationSeconds,
    ratePerMinute,
    estimatedCost,
  };
}
