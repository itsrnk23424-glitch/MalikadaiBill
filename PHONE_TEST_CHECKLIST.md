# Physical phone acceptance checklist (required before calling the app finished)

Run this separately on **each** Android phone and iPhone after installing a successfully compiled and appropriately signed build. Tick only what you actually observe.

- [ ] App launches with no white screen, error, or missing images.
- [ ] App name/icon visible; billing and Rates pages open and navigate back.
- [ ] Add a new shop product, price and alias; close/restart the app and confirm it persists.
- [ ] Allow microphone and speech permissions when prompted.
- [ ] Choose Tamil, say “மல்லி இரண்டு கிலோ, சீரகம் 250 கிராம், வரவு 500”; review what was heard, correct any errors, tap Add to bill.
- [ ] Say a Tanglish order such as “malli half kilo, chicken one kilo, paid 500”; check units, total and due.
- [ ] Say an ambiguous or unknown item. Confirm the app *does not* silently guess or add it.
- [ ] Change item quantity in the review sheet before applying; make sure the new quantity is used.
- [ ] PDF bill opens in the native share/save dialog; Tamil characters, customer name and item totals render correctly.
- [ ] Save PDF to Files/Downloads, reopen it, and check old balance, paid and due.
- [ ] Check different screen sizes and orientation; no button is cut off.
- [ ] Turn off mobile data/Wi‑Fi and test ordinary billing; test speech again to see whether this device supports offline speech recognition (not guaranteed).
- [ ] Close/reopen the app, ensure saved rates persist and sensitive data are not exposed.
- [ ] If AI mode is configured, confirm private server HTTPS, authorization failure handling and expected API usage charges.

**Do not check these boxes in advance.** A real device or authorized remote test service is necessary.
