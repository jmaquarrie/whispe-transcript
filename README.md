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

## Usage

1. Open the app and click the dropzone (or drag and drop) to select an audio file.
2. Click **Transcribe** to upload the file and trigger the `gpt-4o-transcribe` request.
3. The transcript opens in a fullscreen modal with an estimated transcription cost shown beneath the title. The estimate is computed from the API-reported audio duration and the rate per minute value.
