# Item rename — v2.7

- Renamed the default Tamil item `கமாவு` to `கல்லமாவு` in `index.html`, `billing.html` and `rates.html`.
- Retained **₹60 per kg** default price, unit, item order and existing PDF layout from v2.6.
- Added voice/search aliases: `kallamavu`, `kalla maavu`, `கல்ல மாவு` and retained `kamavu`.
- Existing saved items with the old default name are renamed automatically on launch; custom prices and unrelated products are preserved. User-created custom products with the same name are not automatically changed.
- To build an APK, update the source in your existing GitHub repository and push to `main`. Download the APK from GitHub Actions after a successful build. These are source files, not an already-compiled APK.
