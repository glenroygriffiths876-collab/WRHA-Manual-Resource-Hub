# WRHA Manual & Resource Hub

**Live preview:** https://glenroygriffiths876-collab.github.io/WRHA-Manual-Resource-Hub/

A responsive Western Regional Health Authority–branded knowledge-access platform for Jamaican health professionals and the public. **This is an independently developed preview pending any formal WRHA publication approval**—not a claim of official clinical endorsement.

## Universal embedded document reader (November 2026)

- **Primary card action stays inside the hub.** PDF records open the same modal for manuals and health legislation. Genuine web-only entries show an honest resource-details screen rather than navigating away or pretending an HTML page is a PDF.
- **Enhanced PDF.js:** page count/navigation, zoom, fit page/width, text search and selectable text where available. If the publisher prevents cross-origin PDF.js access, the reader attempts an embedded native PDF iframe instead.
- **Download / original source:** the publisher's verified PDF URL and original source page are retained as separate actions. On third-party hosts, the publisher and browser control whether clicking the PDF link opens or downloads it. The hub does not falsely promise forced downloads across origins.
- **Direct corrections:** the MOHW Nutrition at a Glance 2024, National Health Research Agenda 2024–2028, Physical Activity Bible and human-subject research guidelines point to real MOHW PDFs rather than publication pages. Additional identified Ministry of Justice Acts and regulations use direct official PDF endpoints.
- **No unauthorised mirroring:** MOHW PDFs expressly restrict storage and extensive reproduction without permission. We reference the official published files instead of copying them into GitHub without institutional clearance.
- **Full catalogue link audit:** `.github/workflows/document-audit.yml` checks every catalogue URL, recognises actual %PDF signatures, reports redirects, links and TLS issues in `reports/document-audit.json`. It runs after document changes and monthly.
- **Verified exceptions:** ministry archive/department index pages without one identified manual remain webpage records. Users can read the associated publisher page via the source action; no fake PDF or download is supplied.
- **Ministry of Justice source concern:** the audit runner reported a TLS certificate-verification problem for `laws.moj.gov.jm`. This means those legal PDFs cannot be guaranteed to embed on every device. The official Legal Information Portal of Jamaica at https://lipj.gov.jm/ is offered as an alternative. The audit does not bypass TLS validation.

**Verification:** Node catalogue checks, jsdom interaction checks and a real Chromium test of the Nutrition PDF link, in-page document dialog, legal fallback, and smartphone layout passed on the feature branch. This does not guarantee every third-party browser can render every external document.

## Features
- **Clinical & Public-Health Manuals:** 57 manually catalogued source-linked materials, including HIV/STI/TB, surveillance, NCD, nursing/maternal, immunisation, nutrition, environmental health, pharmacy, administration and additional programmes. Searchable, category-filterable PDF cover gallery and embedded document reader where technically permitted.
- **Health Legislation:** 30 laws and regulations indexed by topic and type. Direct PDF versions are preferred where source-verified; some entries must link to official Ministry of Justice legal records or index pages.
- **Health Centres:** 234 source-linked entries across 14 parishes. Region/parish/text search and clickable illustrated parish map. **This is not yet a complete or certified national facility directory.** The green markers represent the number of *catalogued* entries per parish, not verified facility coordinates.
- **Roles & Functions:** 229 specific individual healthcare roles grouped into 14 professional/operational areas with core functions, work settings and typical collaborators. These are general educational descriptions, not official job descriptions or proof that every title is an authorised post.
- **Training:** WRHA NCD Adherence Counselling Academy and JASDIS Study Hub only.
- **Institutional visuals:** WRHA source logo, enlarged/animated header and hero identity, responsive animations, social icons and WRHA/MOHW source links.

## Source, currentness and legal notices
- Official MOHW document libraries: https://www.moh.gov.jm/mp-resources/ and https://www.moh.gov.jm/publications/
- MOHW NCD: https://ncdip.moh.gov.jm/resources/
- Jamaica law: https://laws.moj.gov.jm/ and https://lipj.gov.jm/
- Region: https://www.wrha.gov.jm/
- National-source documents retain original MOHW branding/authorship. Their appearance in the hub **does not prove current approval, continuing validity or completeness of revisions**.
- Statute PDFs may not show the latest amendments or commencement. Review current consolidated instruments with official Jamaican legal publishers before relying on them.
- An official page about a manual does **not** equal access to its downloadable manual; such records are labelled as page links, not genuine PDF resources.
- **The catalogue is a curated initial subset, not all publicly available MOHW manuals.** New editions, full programme inventory and version-control review remain ongoing.
- The map is an amCharts Jamaica SVG asset with visible credit. Parish badges overlay the map as navigation, **not as geocoded facility pins**.
- Some historical local PDFs remain hosted on the predecessor repository at https://glenroygriffiths876-collab.github.io/National-HIV-STI-TB-Programme-Staff-Resource-Centre/ and must be migrated with appropriate reuse permission before decommissioning that repository.
- No staff or patient identifiers are stored in this public site.

## Implementation
A free, static GitHub Pages site. Core files:
- `index.html` — all pages, nav, search controls, dialogs and page content.
- `data.js` — source-linked baseline catalogue and facility dataset.
- `catalog-extra.js` — supplemental documents, Jamaican legislation and expanded healthcare-role data.
- `document-overrides.js` — direct PDF URL corrections and explicit web-resource classifications.
- `viewer.js`, `viewer.css` — universal on-page PDF reader with restrictions-aware fallback.
- `app-v2.js` — routing, search, pagination, PDF viewer and cover rendering, map filtering, facility and role cards.
- `styles.css`, `enhance.css` — base theme and enhancements.
- `wrha-logo.webp` — source WRHA logo (do not replace with an invented graphic).
- `covers/<document-id>.webp` — **real first-page PDF cover previews generated from accessible originals**. If no generated image exists, the site tries browser PDF.js preview and otherwise shows a clearly labelled cover fallback.
- `scripts/export-covers.mjs`, `scripts/generate_covers.py` — GitHub Action cover-generation pipeline.
- `audit.mjs`, `smoke.mjs` — integrity and UI interaction tests.
- `.github/workflows/pages.yml` — automatic validation and Pages publishing on changes to main.
- `.github/workflows/covers.yml` — PDF first-page cover generation for approved public-source hosts. Downloads limited to 40 MB each. Failed, redirected and non-PDF URLs are skipped without fabricating a cover.

## Editing resources
1. Add a unique-id source record with exact document title, publisher, programme, original URL, source page URL and publication date in `catalog-extra.js` (or refactor to a JSON catalogue in the future).
2. Determine whether the URL is a genuine PDF; use `format: 'page'` for HTML source-only entries.
3. Confirm public access, publication rights, edition status and superseded versions; include a clear status notice.
4. Push; GitHub Actions runs integrity tests and Pages deployment.
5. Re-run **Generate real document covers** in the Actions tab after adding new public PDF records, or allow its trigger on catalogue changes.
6. For facility changes, reconcile with an official regional directory; do not invent missing phone numbers, services, opening hours or coordinates.
7. For roles, preserve distinctions between established Jamaican posts, generic functions and proposed titles.

## Verification
The GitHub Actions workflow runs:
- Node source syntax and catalogue consistency checks;
- jsdom tests for navigation, manual search, legislation filters, parish badges, role search, training and social links;
- Pages deployment when validation succeeds.

**Not yet validated:** actual Safari/iOS and Android devices, every third-party iframe response and forced download, completeness of Jamaica-wide health-centre coverage, permission to mirror all documents, live facility coordinates, the entire MOHW catalogue and confirmation of every statute's latest amendments.

## Publication gate
This preview is suitable for user testing and review. Before presenting it as an official WRHA-managed resource, obtain institutional approval for branding, data governance and document publishing; fully test mobile devices, PDF embeds and every critical external source, and reconcile official document/facility inventories.
