# Malikadai Bill v2.9 checks (23 November 2026)

- **45/45 Node automated tests passed** (`node --test tests/*.test.mjs`).
- **8/8 PDF preview browser interactions passed:** index.html and billing.html at 320, 360, 390, 430px; preview before save, edit/cancel without download, confirm PDF, no JavaScript page errors or horizontal overflow.
- **12/12 compact-header layout checks passed:** both billing pages at 320, 340, 360, 390, 430, 600px; header remains one row, remaining four controls stay visible, and fixed bottom buttons retain at least 44px tap targets.
- JavaScript syntax checked for scripts, UI, parser, and transcription backend.
- **Not tested:** Android native compilation, Android speech recognizer/microphone on a real phone, native PDF sharing, and upgrade data persistence. These require a GitHub Actions build and on-device tests.

This is a source ZIP, not an APK.
