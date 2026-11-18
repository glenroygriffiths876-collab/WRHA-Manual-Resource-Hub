# Reader recovery — 17 November 2026

Baseline: 41821b3a251e0133677e69683c5edd5920c8ba82. The public Pages build did not copy seven scripts referenced by the HTML, the premium stylesheet, two logo files used by the service worker, or any prepared document library. The current library manifest and approved input list are empty.

The exact official Peer Approval Signature Form — Medical Staff is already listed correctly:
https://www.moh.gov.jm/wp-content/uploads/2026/03/Peer-Approval-Signature-Form-Medical-Staff.pdf
Publisher index: https://www.moh.gov.jm/mp-resources/
Confirmed three pages; the form page states updated March 2025. The public source is distinct from the Peer Approval Instructions and Checklist. Source identification does not itself establish permission for public republication.

This change fixes the deployment asset allowlist, includes prepared local files in the public build, invalidates old shell caches, and rejects missing reader assets or a missing/corrupt/hash-mismatched declared local PDF. It does not claim that external catalogue documents are recovered. The existing permission-aware ingestion process remains in effect; source-register entries must not be assumed approved because publicly accessible. No catalogue entry has been removed. The complete catalogue still needs per-resource recovery, edition and publication-rights review, and a rendered-page test.
