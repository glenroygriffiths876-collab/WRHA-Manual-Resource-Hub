"""Extract evidence safely from the MOFPS 2026 General Establishment Order.
The Order describes CENTRAL CIVIL SERVICE establishments, not RHA statutory establishments.
The extraction is evidence for examination; it does not certify RHA jobs.
"""
from __future__ import annotations
import json, re, hashlib, pathlib, datetime, requests, fitz
URL="https://www.mof.gov.jm/wp-content/uploads/Civil-Service-Establishment-General-Order-2026.pdf"
OUT=pathlib.Path("reports")
OUT.mkdir(exist_ok=True)
headers={"User-Agent":"Mozilla/5.0 (WRHA public-service reference verification)","Accept":"application/pdf"}
with requests.get(URL,timeout=(12,90),headers=headers,stream=True) as r:
    r.raise_for_status()
    content=bytearray()
    for chunk in r.iter_content(1024*1024):
        if chunk: content.extend(chunk)
        if len(content)>55_000_000:raise ValueError("Document exceeds safety limit")
if not content.startswith(b"%PDF"):raise ValueError("MOFPS response is not PDF")
pdf=fitz.open(stream=bytes(content),filetype="pdf")
pages=[]
for index,page in enumerate(pdf):
    text=page.get_text(sort=True)
    matched=bool(re.search(r"Ministry\s+of\s+Health|Health\s*(?:and|&)\s*Wellness|Health\s+Establishment|Regional\s+Health",text,re.I))
    if matched:pages.append({"physicalPage":index+1,"sample":text[:11000],"kind":"explicit health-related text"})
pdf.close()
report={
 "sourceUrl":URL,"publisher":"Ministry of Finance and the Public Service, Jamaica",
 "sourceTitle":"Civil Service Establishment (General) Order 2026",
 "published":"2026-04-22",
 "verifiedUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),
 "documentSHA256":hashlib.sha256(content).hexdigest(),
 "totalPages":len(fitz.open(stream=bytes(content),filetype="pdf")),
 "healthMatchingPages":len(pages),"pageEvidence":pages[:80],
 "caution":"Central Government civil-service establishment, NOT an RHA establishment. No titles should be transferred to an RHA without additional RHA-source evidence."
}
(OUT/"mofps-2026-establishment-evidence.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PDF loaded",report["totalPages"],"pages; health-related search matches",len(pages))
print("SHA256",report["documentSHA256"])
for p in pages[:25]:
    print("PAGE",p["physicalPage"],"SAMPLE",p["sample"][:250].replace("\n"," | "))
