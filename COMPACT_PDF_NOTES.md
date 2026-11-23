# Low-storage PDF bills

**Android Voice Pro 2.3**: Both `index.html` and `billing.html` use `src/compact-receipt.js`.

- Compact 80mm receipt paper; no unnecessary A4 margins.
- Fonts remain readable for Tamil and English: HTML is rasterized once, compressed as a JPEG and written into a single compressed PDF page.
- Fixed capture scale 1.2x; image width usually 480px.
- JPEG starts at quality 60%. If an unusually large receipt exceeds a soft 90 KB JPEG target, quality and then pixel width are reduced; the text and items are never cropped or deleted. This target is for image data, **not a hard PDF size limit**.
- Native save/share continues using Android's standard share sheet; choose Save to Files / Drive / WhatsApp as available on the phone.

**Measured example:** A 3-item Tamil sample rendered on desktop was ~44 KB with the original 90mm, 1.5x, JPEG quality 80% method and ~24 KB with the new compact layout in a comparable PDF simulation. A separate sample using the new JavaScript compressor was ~19 KB. Different bill lengths will have different file sizes.

**Still needed:** test the native Android APK with physical microphone, PDF save/share applications and multiple lengths of bills.
