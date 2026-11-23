# Malikadai Bill — Android Voice Pro 2.3

**Android-first app source for personal use. This is not an APK.**

Open **ANDROID_START_HERE.md** to build a debug APK through GitHub Actions or Android Studio.

## Features

- Tamil, Tanglish and English voice billing, using the phone recognizer by default
- Review recognized text, quantities and customer payments before changing the bill
- Multiple items in one utterance, unit conversions, and changeable shop rates
- Saved product catalog on the device, compact 80mm PDF receipts for saving/sharing
- Optional privately hosted advanced `gpt-transcribe` service (not enabled by default)

## Tests run here (23 November 2026)

- 20 automated Node checks, including Android speech-service manifest setup and private server security
- Browser simulation at 320, 360, 390, 430px, with sample total ₹612.50 and due ₹112.50, no page errors or horizontal scrolling
- Native APK build and real Android voice / PDF tests: **NOT RUN**. This environment lacks Android SDK and access to the npm registry, so an installable APK cannot be produced here.

## Privacy

The app stores product prices in local storage on the phone. Phone speech recognition might use internet services depending on Android's speech provider. The optional AI transcription feature uploads recorded audio to your separately hosted private server. Never embed any API key in the app or source repository.

## Project contents

`index.html`, `billing.html`, `rates.html`: existing billing UI plus voice interaction.
`src/voice-parser.js`: local deterministic recognition of product names, units and payments.
`src/voice-ui.js`: dictation, review, and confirmation workflow.
`src/mobile-bridge.js`: Capacitor Android mic and PDF sharing.
`.github/workflows/android-apk.yml`: cloud debug APK build job.
`GET_ANDROID_APK.md`, `ANDROID_START_HERE.md`: installation steps.
`tests/`: automated tests.

## Low-storage PDF receipts

- Both Billing pages now generate compact single-receipt PDFs, with an 80mm paper width.
- Tamil text is captured at a controlled pixel density, compressed to JPEG and embedded once in the PDF. No online compression service is used.
- Longer bills naturally produce bigger files. The compressor will not truncate items to force a size limit.
- One example generated using the same browser compressor was only ~19 KB, but actual size depends on the number of products and text.
- Saved/shared PDFs use the same compact PDF data in the Android app.
