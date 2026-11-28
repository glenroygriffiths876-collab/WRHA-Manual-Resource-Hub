import json, pathlib, subprocess, re
root=pathlib.Path('_site')
manifest=json.loads((root/'document-library-manifest.js').read_text().split('Object.freeze(',1)[1].rsplit(')',1)[0])
entries=[]; unreadable=[]
for id,meta in manifest.items():
    path=root/meta['path']
    if not path.is_file(): continue
    try:
        p=subprocess.run(['pdftotext','-layout',str(path),'-'],capture_output=True,timeout=120,check=True)
        count=0
        for page,raw in enumerate(p.stdout.decode('utf-8','replace').split('\f'),1):
            words=re.sub(r'\s+',' ',raw).strip().split()
            for start in range(0,len(words),85):
                chunk=' '.join(words[start:start+110])
                if len(chunk)<35: continue
                entries.append(dict(id=id,page=page,text=chunk));count+=1
        if not count: unreadable.append(id)
    except Exception: unreadable.append(id)
(root/'gia-index.json').write_text(json.dumps(dict(entries=entries,unreadable=unreadable),ensure_ascii=False))
print(f'Gia: {len(entries)} passages; {len(unreadable)} unreadable documents')
