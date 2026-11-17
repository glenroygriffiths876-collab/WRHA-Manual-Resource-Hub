# WRHA authorised document delivery
The reader first attempts any expressly approved, exact-edition hosted copy configured in reader-sources.js, then the original publisher PDF. No public third-party proxy or unapproved mirror is used. The approval table starts empty; this does not imply that all external PDFs can already render.
For each blocked PDF:
1. Verify its exact original URL and current publication edition with the responsible publisher.
2. Obtain written hosting or delivery permission where required. Record the permission reference and date.
3. Publish the complete, unmodified PDF at the WRHA-approved origin (same-origin hosting preferred; other approved origins must provide CORS). Use application/pdf and inline response disposition. Enable HTTP byte ranges for large documents.
4. Add the document ID, exact original URL, approved URL, permission reference, review date and edition in the approved table in reader-sources.js.
5. Test both the hosted copy and original fallback on the actual hub. Do not use a different edition as a silent alternative.
6. Repeat for new editions. Maintain the original publisher link and do not cache confidential or patient information.
A device-file fallback reads a PDF selected by the user in browser memory; it does not upload or verify the copy. Web-only entries use in-app reference collections, not fabricated PDFs. Only explicitly titled, publisher-linked documents are added.
For a permanent solution, WRHA/MOHW IT can enable CORS for the hub origin on the official servers or host authorised files on the approved origin. Do not deploy an open proxy or circumvent authentication, access controls or licensing restrictions.
