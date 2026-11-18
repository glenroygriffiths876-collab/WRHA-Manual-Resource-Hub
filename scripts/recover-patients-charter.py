#!/usr/bin/env python3
"""Faithful reader PDF from the Ministry's official online Charter (not an invented publication)."""
import urllib.request,json,re,hashlib,html,io,unicodedata
from pathlib import Path
from bs4 import BeautifulSoup
import fitz
from importlib.util import spec_from_file_location,module_from_spec
root=Path.cwd()
spec=spec_from_file_location('prep',root/'tools/prepare-document-library.py');prep=module_from_spec(spec);spec.loader.exec_module(prep)
rows={d['id']:d for d in json.loads((root/'document-recovery-report.json').read_text())['records']}
ident='audit-patients-charter'
if ident not in rows:raise SystemExit('No matching unresolved Charter entry')
d=rows[ident]
source='https://www.moh.gov.jm/charter-of-patients-rights/'
req=urllib.request.Request(source,headers={'User-Agent':'WRHA authorised document recovery'})
with urllib.request.urlopen(req,timeout=30) as r:
    raw=r.read(8*1024*1024)
    if not urllib.parse.urlsplit(r.geturl()).hostname.endswith('moh.gov.jm'):raise ValueError('Unexpected source')
soup=BeautifulSoup(raw,'html.parser')
heading=next((h for h in soup.find_all(re.compile('^h[1-6]$')) if 'Your Rights as a Patient' in h.get_text(' ',strip=True)),None)
if not heading:raise ValueError('Charter heading not found')
parent=heading.parent
for _ in range(7):
    text=parent.get_text(' ',strip=True)
    if 'Your Responsibilities as Our Patient' in text and 'dress code' in text:break
    parent=parent.parent
else:raise ValueError('Could not establish complete charter')
# Preserve source order, headings and list text; isolate only the Charter boundaries.
blocks=[]
for element in parent.find_all(['h1','h2','h3','h4','h5','p','li']):
    if element.find_parent('li'):continue
    t=' '.join(element.get_text(' ',strip=True).split())
    if not t:continue
    if not blocks and 'Your Rights as a Patient' not in t:continue
    if element.find(['li','h1','h2','h3','h4','p']) and element.name!='li':continue
    blocks.append((element.name,t))
    if 'dress code' in t:break
alltext=' '.join(t for _,t in blocks)
required=['ACCESS','COMMUNICATION AND PARTICIPATION','CONFIDENTIALITY','PRIVACY','RESPECT','SAFETY','INFORMED CONSENT','FEEDBACK AND COMPLAINTS','Your Responsibilities as Our Patient','dress code']
if any(term not in alltext for term in required):raise ValueError('Incomplete Charter')
content='<h1>Charter of Patients Rights</h1><p class="source">Ministry of Health and Wellness, Jamaica — authorized reading copy of official online text. Source: '+html.escape(source)+' . Retrieved 17 November 2026.</p>'
for typ,t in blocks:
    tag='h2' if typ.startswith('h') else 'p'
    content+=f'<{tag}>'+('• ' if typ=='li' else '')+html.escape(t)+f'</{tag}>'
css='body{font-family:sans-serif;font-size:11pt;line-height:1.35;color:#172e49} h1{font-size:21pt} h2{font-size:15pt;margin-top:13pt} p{margin:7pt 0} .source{font-size:9pt;color:#475569}'
out=root/'documents/library'/(ident+'.pdf')
story=fitz.Story(html=content,user_css=css)
writer=fitz.DocumentWriter(str(out));box=fitz.Rect(42,42,570,750);page=fitz.Rect(0,0,612,792)
while True:
    dev=writer.begin_page(page); more,_=story.place(box);story.draw(dev);writer.end_page()
    if not more:break
writer.close()
pages=prep.validate_pdf(out)
with fitz.open(out) as pdf:
    rendered=' '.join(' '.join(p.get_text().split()) for p in pdf)
def normalized(s):return ''.join(c for c in unicodedata.normalize('NFKC',s).casefold() if c.isalnum())
for _,t in blocks:
    if normalized(t) not in normalized(rendered):raise ValueError('Converted copy text omitted or altered: '+t[:80])
prep.write_cover(out,root/'covers'/(ident+'.webp'))
mp=root/'document-library-manifest.js'
manifest=json.loads(re.search(r'Object\.freeze\((\{[\s\S]*\})\);',mp.read_text()).group(1))
manifest[ident]={'recordUrl':d['document'],'path':'documents/library/'+ident+'.pdf','edition':'Authorized reading copy of complete official web Charter; sourced 17 November 2026','sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'pages':pages,'sourceUrl':source,'sourceSha256':hashlib.sha256(raw).hexdigest(),'permissionRef':'documents/publication-authorization.json','verifiedOn':'2026-11-17','legalAlternate':False}
mp.write_text('window.WRHA_LIBRARY_MANIFEST=Object.freeze('+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n')
print(json.dumps({'id':ident,'pages':pages,'source':source,'verifiedBlocks':len(blocks)}))
