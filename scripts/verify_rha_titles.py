"""Strict source-by-source audit of RHA job titles.
A record is publishable ONLY when its exact published title is located in the official
RHA document/listing. Grade is displayed only if found in nearby source context.
No 'related title' or generic career description is imported.
"""
from __future__ import annotations
import re,json,pathlib,requests,fitz
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor,as_completed
from urllib.parse import urlparse
root=pathlib.Path("reports")
candidates=json.loads((root/"role-source-candidates.json").read_text())
allowed={"www.wrha.gov.jm","wrha.gov.jm","srha.gov.jm","www.srha.gov.jm","www.nerha.gov.jm","nerha.gov.jm","www.serha.gov.jm","serha.gov.jm"}
def norm(x):return re.sub(r"[^a-z0-9]+"," ",str(x or "").lower()).strip()
def download(url):
    p=urlparse(url)
    if p.scheme!="https" or p.hostname not in allowed:raise ValueError("Not an authorised RHA source domain")
    resp=requests.get(url,headers={"User-Agent":"Mozilla/5.0 (WRHA research source verification)"},timeout=(12,40),allow_redirects=True)
    resp.raise_for_status()
    if urlparse(resp.url).hostname not in allowed:raise ValueError("Redirected outside an RHA")
    if len(resp.content)>23_000_000:raise ValueError("Source exceeds 23 MB limit")
    if resp.content[:4]==b"%PDF":
        doc=fitz.open(stream=resp.content,filetype="pdf")
        return [{"page":i+1,"text":page.get_text(sort=True),"unsortedText":page.get_text(sort=False),"leftColumnText":page.get_text("text",clip=fitz.Rect(0,0,page.rect.width*.37,page.rect.height),sort=True)} for i,page in enumerate(doc)]
    if "html" in resp.headers.get("content-type","").lower() or b"<html" in resp.content[:500].lower():
        soup=BeautifulSoup(resp.content,"html.parser")
        for t in soup.select("script,style,noscript"):t.decompose()
        article=soup.select_one("main") or soup.body or soup
        return [{"page":None,"text":article.get_text(" ",strip=True)}]
    raise ValueError("Neither a readable official PDF nor an HTML listing")
urls=sorted({r["sourceUrl"] for r in candidates})
def fetch(url):
    try:return (url,{"pages":download(url),"error":None})
    except Exception as e:return (url,{"pages":[],"error":str(e)[:240]})
with ThreadPoolExecutor(max_workers=5) as pool:
    result=dict(pool.map(fetch,urls))
print("Official source URLs scanned:",len(result),flush=True)
accepted=[];rejected=[]
for row in candidates:
    src=result[row["sourceUrl"]]
    if src["error"]:
        rejected.append({**row,"reason":"SOURCE_UNAVAILABLE: "+src["error"]});continue
    title=norm(row["title"])
    hit=None
    for page in src["pages"]:
        # In a three-column PDF table the default plain-text order may interleave the
        # classification column in the middle of a multi-line title. A first-column
        # crop restores its exact wording without fuzzy/synonym matching.
        alternatives=[norm(page.get("text","")),norm(page.get("unsortedText","")),norm(page.get("leftColumnText",""))]
        located=None
        for text_body in alternatives:
            idx=text_body.find(title)
            if idx>=0:
                located=(text_body,idx)
                break
        if located is None:continue
        txt,idx=located
        original_code=row["classification"]
        # Grade must be adjacent to this row/title in the official text.
        matched_grade=bool(original_code and norm(original_code) in txt[max(0,idx-250):idx+450])
        context=txt[max(0,idx-110):idx+min(450,len(title)+350)]
        hit={"page":page["page"],"gradeFound":matched_grade,"context":context}
        break
    if hit is None:
        rejected.append({**row,"reason":"EXACT_TITLE_NOT_FOUND_IN_OFFICIAL_SOURCE"});continue
    tier="B" # RHA job advert, vacancy archive or approved qualification listing, not confirmed current establishment
    accepted.append({
      "title":row["title"],"classification":row["classification"] if hit["gradeFound"] else None,
      "gradeUnconfirmed":row["classification"] if not hit["gradeFound"] else None,
      "category":row["category"],"icon":row["icon"],
      "authority":row["publisher"],"sourceUrl":row["sourceUrl"],"sourceKind":row["sourceKind"],
      "sourceDate":row["sourceDate"],"documentPage":hit["page"],"evidenceExcerpt":hit["context"],
      "verificationTier":tier,"verificationMethod":"EXACT_TITLE_MATCH_IN_OFFICIAL_SOURCE",
      "summary":row["documentedResponsibilities"] if row["documentedResponsibilities"] and row["sourceKind"]=="full-job-advertisement" else None,
      "verifiedQualifications":row["verifiedQualifications"] if row["sourceKind"]=="full-job-advertisement" else None,
      "verifiedReportsTo":row["verifiedReportsTo"] if row["sourceKind"]=="full-job-advertisement" else None
    })
accepted.sort(key=lambda x:(x["category"],x["title"].casefold()))
rejected.sort(key=lambda x:x["title"].casefold())
report={
 "sourceScope":"Official WRHA/SRHA/NERHA/SERHA records only. No MOFPS central government title is misrepresented as an RHA position.",
 "reviewStatus":"Automated exact-title match; title evidence verified against source text, but grade and continuing post establishment may need human HR confirmation.",
 "examinedCandidates":len(candidates),"sourceFiles":len(urls),
 "verifiedTitleCount":len(accepted),"excludedCount":len(rejected),
 "verified":accepted,"excluded":rejected,
 "notes":["Exact title string located in official source only; false negatives can occur with scanned PDFs, broken line layouts, and temporary site access failures.","No inference from similar-sounding roles; grade only shown if located adjacent to title.","An archive advert is historical evidence and does not establish a post in the current RHA approved establishment.","Unverified role descriptions and qualifications are NOT displayed as verified responsibilities."]
}
(root/"strict-role-source-audit.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print("Role audit:",len(accepted),"exact title matches;",len(rejected),"rejected")
for x in rejected[:20]:print("REJECT",x["title"],x["reason"][:100])
# Dedicated publishable asset; derived exclusively from verified entries.
pathlib.Path("verified-roles.json").write_text(json.dumps(accepted,ensure_ascii=False,indent=2)+"\n")
