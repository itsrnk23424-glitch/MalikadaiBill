# PDF receipt layout correction v2.6

This project builds on Voice Pro v2.5, retaining the previous Tamil rename (மிளகாய்த்தூள்), prices, voice billing and original non-compact 90 mm receipt design.

## What was fixed

- The customer/date row wraps safely instead of extending past the right page edge.
- Receipt table uses fixed columns (8/40/18/34%) and wraps long product names; right-hand amounts remain visible.
- Totals stay within the receipt's width.
- PDF image has small 2 mm page margins.
- Short bills switch to landscape page *orientation* as required by jsPDF to prevent automatic width/height swapping; the receipt retains a 90 mm paper width.
- `billing.html` now closes a previously unclosed help dialog, which had caused the PDF preview to render inside a hidden overlay.

## Verification

- Automated Node tests: `npm run verify`
- Browser receipt layout simulated for index.html and billing.html at mobile viewport width 390 px with 1, 5, and 2 long-name items. Checked that receipt/table/child elements have no horizontal overflow.
- Native Android PDF sharing still needs confirmation on the installed APK.

## Updating the Android app

Extract this archive; replace the project files in the existing GitHub Desktop repository (do not replace its `.git` folder); Commit to main, then Push origin. Download the new Android APK under the successful GitHub Actions run's Artifacts section. Back up in-app custom rates before installing a debug APK because Android signatures may differ across builds.
