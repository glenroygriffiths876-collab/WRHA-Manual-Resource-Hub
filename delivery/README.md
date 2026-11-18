# WRHA document delivery (prepared, not active until authorised)
The existing GitHub Pages app is static. Browser CORS, download headers and third-party preview failures can prevent source PDFs from opening, even when the publisher's public download works.

This service provides a narrow, on-demand original-document route for explicitly catalogued public publisher URLs. It is not an open CORS proxy. It accepts catalogue IDs, validates HTTPS/host/DNS/redirect destinations, rejects private-network addresses and upstream 401/403 access denials, verifies the actual PDF or image signature, streams bounded responses, applies origin and concurrency restrictions, and keeps no document copies or credentials. Only deploy with the appropriate WRHA/MOHW approval for the service and documents; remove any source whose publisher disallows this delivery. An actual PDF page render, not an iframe load or a header check, is the acceptance test.

## Deploy after authorisation
- Use a new dedicated web service (Node 22 or newer), not the existing JASDIS service. Free-tier hosting may sleep and have bandwidth quotas; do not upgrade to a paid plan without approval.
- Source repository: this repo, main branch. Build: `node --check delivery/server.mjs`. Start: `node delivery/server.mjs`.
- Check `/health`, `/check/official-3` (hypertension), `/check/official-2` (diabetes), `/check/official-4` (asthma), and `/check/mofps-civil-establishment-2026`. These check a source response signature only.
- Once service and source checks succeed, set `window.WRHA_DELIVERY_ORIGIN` in delivery-config.js to the approved service HTTPS origin, without any path. Bump config, application release and service worker versions. Open each PDF in the actual hub and verify first, middle and last page, download, search, narration where text is available, and phone layout. Record failed publisher sources individually, never silently substitute a different edition.
- For publisher-restricted/withdrawn or non-public documents, obtain approved copies or have the publisher enable an authorised delivery route. Web-only notices cannot be represented as full PDFs.
