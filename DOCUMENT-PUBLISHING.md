# WRHA document publishing policy (JASDIS method)

JASDIS stores actual PDFs beside its website and loads those PDFs using PDF.js. WRHA now prefers actual, validated local files, followed by exact existing JASDIS PDF copies, followed by direct publisher PDF responses. No third-party site or maintenance HTML is presented as a document.

## For new or repaired documents
1. Obtain the complete original document and confirm authority to host it in this public library. Never put client records, patient information or confidential files in this repository.
2. Put the file in `documents/inbox/` and record its SHA-256, source catalogue ID, exact existing catalogue URL, edition and permission reference in `documents/approved-inputs.json`. For an alternate legal edition, set `legalAlternate: true` and clearly state the edition.
3. Run `python -m pip install pymupdf pillow` and install LibreOffice for Word, Excel or PowerPoint formats.
4. Run `python tools/prepare-document-library.py --publish-approved`. It validates PDF bytes, opens first/middle/last pages, produces an HD cover and writes the manifest.
5. For Office or image conversions, review the output visually and check pagination, tables, charts and footnotes; then submit the reviewed PDF as an approved PDF input with the original source metadata. Do not publish unreviewed conversions.
6. Commit only the approved outputs, manifest and covers. Test every listed file in the live WRHA reader (first/middle/last page, download, search and audio where text exists). The reader does not open raw DOC binaries.
7. Run `python tools/prepare-document-library.py --verify-jasdis` to check exact public JASDIS file bytes against their pinned Git blob IDs without storing duplicate copies.

The source register contains 14 existing JASDIS PDF routes, matched by filename to existing WRHA entries. The Word-only Community and Private Health Facilities Guidelines source is a legacy .doc file, not a PDF. It requires document conversion and review before publication. The prepared manifest starts empty: no new publisher files have yet been physically copied or cleared. Source delivery and document currentness must be verified separately.

Public Health and Pharmacy Act alternate sources have been inspected, but browser access is not equivalent to server retrieval. The optional dedicated backend remains the route for permitted on-demand delivery when CORS blocks direct access. It is not yet active; the Render workspace must be selected by the user.