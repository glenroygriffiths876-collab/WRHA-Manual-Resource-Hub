import json, pathlib, subprocess, re, tempfile
root=pathlib.Path('_site')
manifest=json.loads((root/'document-library-manifest.js').read_text().split('Object.freeze(',1)[1].rsplit(')',1)[0])
entries=[]; unreadable=[]; missing=[]; seen=set(); coverage=[]
for id,meta in manifest.items():
    path=root/meta['path']
    if not path.is_file():
        missing.append(id); continue
    try:
        p=subprocess.run(['pdftotext','-layout',str(path),'-'],capture_output=True,timeout=120,check=True)
        count=0; ocr_pages=[]; failed_pages=[]
        pages=p.stdout.decode('utf-8','replace').split('\f')
        if pages and not pages[-1].strip(): pages.pop()
        for page,raw in enumerate(pages,1):
            if len(raw.strip())<35:
                try:
                    with tempfile.TemporaryDirectory() as tmp:
                        image=pathlib.Path(tmp)/'page'
                        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-r','180','-singlefile','-png',str(path),str(image)],capture_output=True,check=True,timeout=45)
                        result=subprocess.run(['tesseract',str(image)+'.png','stdout','-l','eng'],capture_output=True,check=True,timeout=60)
                        candidate=result.stdout.decode('utf-8','replace')
                        if len(candidate.strip())>len(raw.strip()): raw=candidate; ocr_pages.append(page)
                        if len(raw.strip())<35: failed_pages.append(page)
                except Exception: failed_pages.append(page)
            words=re.sub(r'\s+',' ',raw).strip().split()
            for start in range(0,len(words),85):
                chunk=' '.join(words[start:start+110])
                if len(chunk)<35: continue
                key=(id,page,chunk)
                if key in seen: continue
                seen.add(key)
                entries.append(dict(id=id,page=page,text=chunk, extraction='ocr' if page in ocr_pages else 'text'));count+=1
        coverage.append(dict(id=id,passages=count,pages=len(pages),ocr_pages=ocr_pages,low_text_pages=failed_pages))
        if not count: unreadable.append(id)
    except Exception: unreadable.append(id)
(root/'gia-index.json').write_text(json.dumps(dict(entries=entries,unreadable=unreadable,missing=missing,coverage=coverage),ensure_ascii=False))
assert all(e['page']>0 and e['id'] in manifest for e in entries)
print(f'Gia: {len(entries)} passages; {len(unreadable)} unreadable documents')
