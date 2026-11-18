#!/usr/bin/env python3
import json,os,shutil,tempfile,re
from pathlib import Path
from importlib.util import spec_from_file_location,module_from_spec
root=Path.cwd()
def load(name,path):
    spec=spec_from_file_location(name,path);m=module_from_spec(spec);spec.loader.exec_module(m);return m
recovery=load('recovery',root/'scripts/recover-public-sources.py')
prepare=load('prepare',root/'tools/prepare-document-library.py')
terms='https://japarliament.gov.jm/index.php?Itemid=13&id=51&option=com_content&view=article'
rows={r['id']:r for r in json.loads((root/'document-recovery-report.json').read_text())['records']}
sources={
'law-9':('https://www.japarliament.gov.jm/attachments/article/341/The%20Data%20Protection%20Act,%202020%20No.%207.pdf',118,'2020 Act No. 7 as enacted'),
'audit-law-domestic-amendment':('https://japarliament.gov.jm/attachments/article/339/The-Domestic-Violence---Amendment--Act--2023-No.-20---_.pdf',6,'2023 Act No. 20 as enacted'),
'audit-law-disaster':('https://japarliament.gov.jm/attachments/341_The%20Disater%20and%20Preparedness%20and%20Emergency%20Management%20Act%2C%202015%20No.1.pdf',None,'2015 Act No. 1 as enacted'),
'audit-law-sexual-offences':('https://www.japarliament.gov.jm/attachments/341_The%20Sexual%20Offences%20Act,%202009.pdf',42,'2009 Act No. 12 as enacted'),
'law-18':('https://japarliament.gov.jm/attachments/339_Child%20Care%20and%20Protection%20Act.pdf',84,'2005 revised-page copy from parliamentary committee; check 2018 and 2023 amendments')
}
manifest_path=root/'document-library-manifest.js'
manifest=json.loads(re.search(r'Object\.freeze\((\{[\s\S]*\})\);',manifest_path.read_text()).group(1))
out=root/'documents/library';out.mkdir(parents=True,exist_ok=True)
results=[]
with tempfile.TemporaryDirectory() as temp:
    os.environ['WRHA_RECOVERY_DIRECTORY']=temp
    for ident,(url,pages,edition) in sources.items():
        d=rows.get(ident)
        if not d:
            results.append({'id':ident,'error':'No unresolved matching catalogue record'});continue
        try:
            result=recovery.try_url(d,{'url':url,'pages':pages,'alternate':True})
            if result.get('state')!='rendered_pdf_candidate':raise ValueError('Not PDF')
            if recovery.urllib.parse.urlsplit(result['resolvedUrl']).hostname not in ('japarliament.gov.jm','www.japarliament.gov.jm'):raise ValueError('Outside permission scope')
            dest=out/(ident+'.pdf');shutil.copyfile(Path(temp)/result['recoveredFile'],dest)
            prepare.write_cover(dest,root/'covers'/(ident+'.webp'))
            manifest[ident]={'recordUrl':d['document'],'path':'documents/library/'+ident+'.pdf','edition':'Source: Houses of Parliament; '+edition+'; reference reproduction only, no official endorsement; check amendments','sha256':result['sha256'],'pages':result['pages'],'legalAlternate':True,'sourceUrl':url,'permissionRef':terms,'verifiedOn':'2026-11-17'}
            results.append({'id':ident,'pages':result['pages'],'sha256':result['sha256'],'source':url})
        except Exception as e:results.append({'id':ident,'error':str(e)[:250]})
manifest_path.write_text('window.WRHA_LIBRARY_MANIFEST=Object.freeze('+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n')
(root/'reports/parliament-recovery.json').write_text(json.dumps({'results':results,'sourceTerms':terms},indent=2)+'\n')
print(json.dumps(results,indent=2))
if not any('pages' in r for r in results):raise SystemExit('No verified PDF recovered')
