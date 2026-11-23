# Optional high-accuracy AI voice billing (Tamil + Tanglish + English)

The app **already has a no-key voice mode** which uses the phone's installed speech recognition (Android SpeechRecognizer / Apple Speech). This works without an OpenAI API key and is the recommended starting point for your personal shop app. Some recognizers need internet; offline performance and language support depend on device settings.

## AI model choice

For longer grocery dictation, the optional mode uses **OpenAI `gpt-transcribe`** speech to text. It can receive context/keyword hints and code-switched speech. A **local deterministic billing parser** extracts products, quantities, customer and payment from the recognized words. Products are never added automatically: review and correct them before pressing Add to bill.

AI audio calls are **online and paid**, and may mishear shop vocabulary. Do not upload real customers' speech without their consent. No customer conversations are stored by this application server. The source includes a private relay but *no deployed service or credentials*.

## Run a private HTTPS backend

1. Use a Node 22+ server with an HTTPS domain, e.g. behind a reverse proxy or a cloud application host with HTTPS.
2. Deploy the `server/transcription-server.mjs` code (no npm dependencies).
3. Set secrets in your hosting control panel, **never in a git repository or mobile app**:

   - `OPENAI_API_KEY`: your own API key with paid API access.
   - `VOICE_API_TOKEN`: a long randomly generated private token (at least 16 characters).
   - `VOICE_ALLOWED_ORIGINS`: comma-separated allowed origins, e.g. `capacitor://localhost,http://localhost` plus a development URL only when needed.
   - `PORT`: optional; defaults to `8787`.

4. Start the server with `node server/transcription-server.mjs`.
5. In the app select **Advanced AI (online setup)**, enter the server HTTPS root URL and token, tap Speak, dictate, then tap Stop. Review recognized bill before applying.

The relay enforces request authentication and a basic per-token request limit, accepts a 20MB maximum recording and only relays it to the transcription API. For broad internet deployment, also put a WAF/HTTPS proxy, process supervisor, monitoring, and suitable stricter per-user limits in front of it. Rotate tokens if exposed.

## Model vs business logic

- Phone mode: built-in OS recognizer (no app key).
- Advanced mode: GPT-Transcribe for transcription only; key belongs on private server.
- Both: audited JS rules for product names and aliases, units, fractions, old balances and payments.
- Always: explicit review, correction and confirmation before updating the receipt.

## Limitations

AI transcription is **not turned on by default**; no private backend is deployed with this ZIP. A device may require an internet connection for native speech recognition too. Both engines need microphone permission. Users must verify quantities and totals before sending receipts.
