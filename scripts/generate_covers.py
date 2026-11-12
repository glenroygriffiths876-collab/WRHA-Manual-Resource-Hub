"""Create real first-page cover images for publicly linked PDF resources.
Runs in GitHub Actions. Only listed official domains are permitted.
Failing/missing PDFs are skipped; app browser preview remains a fallback.
"""
import concurrent.futures
import io
import json
import os
import urllib.parse
import requests
import fitz
from PIL import Image

MAX_BYTES=40*1024*1024
ALLOWED={
    "www.moh.gov.jm","moh.gov.jm","ncdip.moh.gov.jm","hstu.moh.gov.jm",
    "glenroygriffiths876-collab.github.io","laws.moj.gov.jm"
}
os.makedirs("covers",exist_ok=True)
items=json.load(open("cover-input.json",encoding="utf-8"))
def one(item):
    url=item["url"]
    host=urllib.parse.urlparse(url).netloc.lower()
    if host not in ALLOWED:return item["id"],"skipped: unapproved host"
    path=os.path.join("covers",item["id"]+".webp")
    if os.path.isfile(path) and os.path.getsize(path)>1000:return item["id"],"already available"
    try:
        with requests.get(url,stream=True,timeout=(8,24),allow_redirects=True,headers={"User-Agent":"Mozilla/5.0 WRHA Manual Hub resource preview (public document)"}) as resp:
            resp.raise_for_status()
            final_host=urllib.parse.urlparse(resp.url).netloc.lower()
            if final_host not in ALLOWED:return item["id"],"skipped: redirected off approved host"
            buff=bytearray()
            for chunk in resp.iter_content(chunk_size=1024*256):
                if not chunk:continue
                buff.extend(chunk)
                if len(buff)>MAX_BYTES:raise ValueError("PDF exceeds cover-generation limit")
        if not buff.startswith(b"%PDF-"):raise ValueError("source returned non-PDF data")
        doc=fitz.open(stream=bytes(buff),filetype="pdf")
        if len(doc)<1:raise ValueError("empty PDF")
        page=doc.load_page(0)
        w=page.rect.width
        factor=min(2.0,max(0.5,500/w))
        pix=page.get_pixmap(matrix=fitz.Matrix(factor,factor),alpha=False,colorspace=fitz.csRGB)
        img=Image.frombytes("RGB",[pix.width,pix.height],pix.samples)
        img.thumbnail((650,840),Image.Resampling.LANCZOS)
        img.save(path,"WEBP",quality=84,method=5)
        doc.close()
        return item["id"],"generated %d bytes"%os.path.getsize(path)
    except Exception as exc:
        return item["id"],"unavailable: "+str(exc)[:130]

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(one,items))
for file_id,result in results:print(file_id, result)
print("generated/available:",sum(os.path.isfile(os.path.join("covers",x["id"]+".webp")) for x in items),"of",len(items))
