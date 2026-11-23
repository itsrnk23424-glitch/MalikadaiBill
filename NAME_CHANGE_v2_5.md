# Item name update — v2.5

Changed the default item **மிதூள்** to **மிளகாய்த்தூள்** on the billing and item-rate pages.

- The same product keeps its ₹240-per-kg default price. Saved prices are not reset.
- Previous voice alias `mithool` still works.
- New voice aliases include `milagaithul`, `milagai thul`, `milagai thool`, and `மிளகாய் தூள்`.
- Removed `milagai thool` from the separate `மிளகாய்` item to reduce voice confusion.
- Existing saved default-product entries with the old name are renamed automatically on app launch.
- The original (non-compact) PDF format remains unchanged.
- The Android build workflow remains unchanged.

## Update your GitHub repository
Clone your existing MalikadaiBill repository in GitHub Desktop. Copy all the files from this extracted project folder into the cloned folder, replacing the old ones. Commit and push to `main`, then download the APK from the successful GitHub Actions run. A new debug APK may not be installable over the previous debug APK if GitHub changed the signing key; avoid uninstalling the old app without saving your local rate data.
