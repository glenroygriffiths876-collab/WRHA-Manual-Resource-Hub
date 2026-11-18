#!/usr/bin/env python3
"""Publish authorized source files themselves. Preserve provenance, original bytes and previous copies."""
import json,os,re,shutil,tempfile,hashlib,sys,subprocess
from pathlib import Path
from importlib.util import spec_from_file_location,module_from_spec
import fitz
root=Path.cwd()
def load(name,path):
    spec=spec_from_file_location(name,path); m=module_from_spec(spec);spec.loader.exec_module(m);return m
recover=load('recover',root/'scripts/recover-public-sources.py')
prepare=load('prepare',root/'tools/prepare-document-library.py')
approval=json.loads((root/'documents/publication-authorization.json').read_text())
manifest_path=root/'document-library-manifest.js'
manifest=json.loads(re.search(r'Object\.freeze\((\{[\s\S]*\})\);',manifest_path.read_text()).group(1))
rows=json.loads((root/'document-recovery-report.json').read_text())['records']
mode=sys.argv[1] if len(sys.argv)>1 else 'pdf'
# Authoritative copies identified independently of the failing Justice host.
alternates={
'law-5':[('https://natlex.ilo.org/dyn/natlex2/natlex2/files/download/31034/JAM31034.pdf','ILO NATLEX reference copy; check amendments')],
'law-7':[('https://bellevuehospital.org.jm/pdf/mental_health_act.pdf','Bellevue Hospital reference copy; check amendments')],
'law-11':[('https://icta.gov.jm/wp-content/uploads/2025/08/Electronic-Transactions-Act-Jamaica.pdf','ICT Authority reference copy; check amendments')],
'law-22':[('https://websitearchive2020.nepa.gov.jm/new/legal_matters/laws/Environmental_Laws/National_Solid_Waste_Management_Act_2001.pdf','NEPA 2001 as enacted; check amendments')],
'audit-law-nhf':[('https://www.nhf.org.jm/wp-content/uploads/2025/12/National-Health-Fund-Act.pdf','NHF reference copy; check amendments')]
}
for d in rows:
    known=[{'url':u,'label':label,'alternate':True} for u,label in alternates.get(d['id'],[])]
    d['routes']=known+[r for r in (d.get('routes') or [{'url':d['document'],'label':'Original source'}]) if r.get('url','').startswith('https://')]
# The known Word and image sources are each handled by their own conversion run.
rows=[d for d in rows if (d.get('format') in ('office','image'))==(mode=='convert') and d.get('format')!='page']
out=root/'documents/library';out.mkdir(parents=True,exist_ok=True)
originals=root/'documents/originals'
results=[]
with tempfile.TemporaryDirectory(prefix='wrha-publish-') as td:
    os.environ['WRHA_RECOVERY_DIRECTORY']=td
    import concurrent.futures
    def fetch(d):
        # Public catalogue only. No alternate instrument substituted merely because a URL returns PDF.
        if d['id']=='audit-law-pesticides-residue':
            return {'id':d['id'],'title':d['title'],'state':'identity_review_required','attempts':[]}
        return recover.audit(d)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        candidates=list(pool.map(fetch,rows))
    for d,result in zip(rows,candidates):
        ident=prepare.safe_id(d['id'])
        good=next((v for v in result['attempts'] if v.get('recoveredFile')),None)
        if not good:
            results.append(result);continue
        try:
            src=Path(td)/good['recoveredFile']
            dest=out/(ident+'.pdf')
            converted=src.suffix.lower()!='.pdf'
            if converted:
                originals.mkdir(exist_ok=True,parents=True)
                shutil.copyfile(src,originals/src.name)
                pages=prepare.pdf_from_input(src,dest)
            else:
                shutil.copyfile(src,dest)
                pages=prepare.validate_pdf(dest,good.get('pages'))
            with fitz.open(dest) as pdf:
                evidence=' '.join(pdf[i].get_text() for i in range(min(2,pdf.page_count)))[:1200]
                metadata=pdf.metadata or {}
            # A valid exact catalogue source is accepted; previously discovered alternate legal
            # editions retain warnings and original links. No claim of current consolidation.
            route=next((r for r in d['routes'] if r['url']==good['url']),{})
            alt=bool(good.get('alternate'))
            label=route.get('label') if alt else ('Converted from official '+src.suffix.upper().lstrip('.')+'; formatting review pending' if converted else 'Authorized source copy')
            label=(label or 'Alternate legal reference; check amendments')
            if d['kind']=='legislation' and not alt:label+='; verify amendments and commencement'
            manifest[ident]={'recordUrl':d['document'],'path':'documents/library/'+ident+'.pdf','edition':label,'sha256':prepare.sha(dest.read_bytes()),'pages':pages,'legalAlternate':alt,'sourceUrl':good['resolvedUrl'],'permissionRef':'documents/publication-authorization.json','verifiedOn':'2026-11-17','originalPath':'documents/originals/'+src.name if converted else None,'sourceSha256':good['sha256']}
            try:prepare.write_cover(dest,root/'covers'/(ident+'.webp'))
            except Exception as e:result['coverWarning']=str(e)[:200]
            result.update(published=True,pages=pages,source=good['resolvedUrl'],bytes=dest.stat().st_size,pdfTitle=metadata.get('title'),firstPagesText=evidence,conversionReviewPending=converted)
            print(json.dumps({'published':ident,'pages':pages,'bytes':dest.stat().st_size}),flush=True)
        except Exception as e:
            if ident not in manifest:dest.unlink(missing_ok=True)
            result.update(published=False,error=str(e)[:250])
        results.append(result)
manifest_path.write_text('window.WRHA_LIBRARY_MANIFEST=Object.freeze('+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n')
report={'mode':mode,'manifestCount':len(manifest),'publishedThisRun':sum(bool(r.get('published')) for r in results),'unresolvedThisRun':sum(not r.get('published') for r in results),'records':results}
(root/'reports'/('authorized-publication-'+mode+'.json')).write_text(json.dumps(report,indent=2)+'\n')
print('PUBLICATION_SUMMARY '+json.dumps({k:v for k,v in report.items() if k!='records'}),flush=True)
if not report['publishedThisRun'] and mode=='pdf':raise SystemExit('No newly recovered PDF files')
