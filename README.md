# Whispe Transcript

A lightweight web app to upload an audio file, send it to `gpt-4o-transcribe`, and display the transcript in a full-screen modal along with a cost estimate.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with your OpenAI key and (optionally) a custom pricing rate per minute:

   ```env
   OPENAI_API_KEY=sk-...
   # Optional: override default $0.0002 per minute rate used for cost estimates
   TRANSCRIBE_RATE_PER_MINUTE=0.0002
   ```

3. Start the server:

   ```bash
   npm start
   ```

   The app will be available at http://localhost:3000.

### Deploying to Vercel

- This repo now ships a serverless function at `api/transcribe.js`, so a Vercel
  deploy will serve the API at `/api/transcribe` alongside the static client.
- Add `OPENAI_API_KEY` (and optionally `TRANSCRIBE_RATE_PER_MINUTE`) to your
  Vercel project environment variables.
- The client will also send an API key from the **API Key** field if one is
  entered, which allows per-request keys without redeploying.

## Usage

1. Open the app and click the dropzone (or drag and drop) to select an audio file.
2. Optional: paste your own OpenAI key into the **API Key** field. It is stored locally in your browser and sent to the server per request (you can also rely on the server-side `OPENAI_API_KEY`).
3. Click **Transcribe** to upload the file and trigger the `gpt-4o-transcribe` request.
4. The transcript opens in a fullscreen modal and is streamed into view in real time with an estimated transcription cost beneath the title. The estimate is computed from the API-reported audio duration and the rate per minute value.
