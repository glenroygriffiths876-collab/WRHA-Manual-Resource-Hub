#!/usr/bin/env python3
"""Recover exact alternate documents, keep previous manifest entries, verify page counts."""
import json,os,re,shutil,tempfile
from pathlib import Path
from importlib.util import spec_from_file_location,module_from_spec
root=Path.cwd()
def load(name,path):
    spec=spec_from_file_location(name,path);m=module_from_spec(spec);spec.loader.exec_module(m);return m
recover=load('recover',root/'scripts/recover-public-sources.py')
prepare=load('prepare',root/'tools/prepare-document-library.py')
rows={d['id']:d for d in json.loads((root/'document-recovery-report.json').read_text())['records']}
mp=root/'document-library-manifest.js'
manifest=json.loads(re.search(r'Object\.freeze\((\{[\s\S]*\})\);',mp.read_text()).group(1))
# Links from the issuing government and FAOLEX records, with exact titles/page counts checked.
sources={
'audit-food-security':[('https://jamaicatradeportal.gov.jm/upload/files/Legal_1548181278.pdf',72,'Jamaica Trade Portal; National Food and Nutrition Security Policy')],
'law-10':[('https://mlgcd.s3.amazonaws.com/localauthorities.gov.jm/s3fs-public/resources/the_access__to_information_act.pdf',28,'St Catherine Municipal Corporation; revised pages authorized 2005; verify amendments')],
'law-15':[('https://www.jamaicatradeportal.gov.jm/upload/files/Legal_1550634878.pdf',43,'Jamaica Trade Portal; revised Act copy; verify amendments')],
'law-22':[('https://faolex.fao.org/docs/pdf/jam71313.pdf',51,'FAOLEX; 2001 Act revised through 2003; verify amendments')],
'audit-law-water-resources':[('https://faolex.fao.org/docs/pdf/jam5536.pdf',65,'FAOLEX; 1995 Act revised through 1998; verify amendments')],
'law-12':[('https://dcj.gov.jm/wp-content/uploads/2022/08/Dental-Act.pdf',None,'Dental Council; revised Act copy; verify amendments')],
'audit-law-pesticides-residue':[('https://www.pca.gov.jm/tpac_pesticides_act.pdf',None,'Pesticides Control Authority; 2017 instrument; check gazette and commencement')],
'audit-pca-labelling':[('https://www.pca.gov.jm/pdf_folder/labelling_standards.pdf',None,'Pesticides Control Authority; labelling reference')],
'law-20':[('https://jamaicatradeportal.gov.jm/upload/files/Legal_1549912055.pdf',None,'Jamaica Trade Portal; original 1958 Act; read with 2019 amendments')],
'audit-law-precursor':[('https://www.jamaicatradeportal.gov.jm/upload/files/Legal_1559236380.pdf',29,'Jamaica Trade Portal; revised Act pages authorized 2006; verify amendments')],
'audit-law-precursor-regs':[('https://jamaicatradeportal.gov.jm/upload/files/Legal_1562945374.pdf',28,'Jamaica Trade Portal; 2013 Regulations (L.N. 269A/2013), revised pages 2017; verify any other subsidiary instruments')],
'audit-law-factories':[('https://natlex.ilo.org/dyn/natlex2/natlex2/files/download/31021/JAM31021%202009.pdf',None,'ILO NATLEX; revised Factories Act including 2009 amendments; verify subsequent changes')]
}
# Do not substitute a single regulation for an entire subsidiary-legislation compilation.
results=[]
with tempfile.TemporaryDirectory() as td:
    os.environ['WRHA_RECOVERY_DIRECTORY']=td
    for ident,routes in sources.items():
        if ident not in rows:continue
        d=rows[ident]
        for url,pages,label in routes:
            try:
                q=recover.try_url(d,{'url':url,'pages':pages,'alternate':d['kind']=='legislation'})
                if q.get('state')!='rendered_pdf_candidate':raise ValueError('Wrong file type')
                src=Path(td)/q['recoveredFile']; dest=root/'documents/library'/(ident+'.pdf')
                # Additional identity checks for unpinned candidates where text is available.
                if pages is None:
                    import fitz
                    with fitz.open(src) as doc:
                        text=' '.join(doc[i].get_text() for i in range(min(3,doc.page_count))).lower()
                    required={'law-12':['dental act'],'audit-law-pesticides-residue':['maximum residue limits'],'audit-pca-labelling':['labelling'],'law-20':['food storage','infestation'],'audit-law-precursor':['precursor','chemicals','act'],'audit-law-factories':['factories act']}[ident]
                    norm=' '.join(text.split())
                    if any(token not in norm for token in required):raise ValueError('Unconfirmed exact title; manual review required')
                shutil.copyfile(src,dest);prepare.write_cover(dest,root/'covers'/(ident+'.webp'))
                manifest[ident]={'recordUrl':d['document'],'path':'documents/library/'+ident+'.pdf','edition':label,'sha256':q['sha256'],'pages':q['pages'],'legalAlternate':d['kind']=='legislation','sourceUrl':q['resolvedUrl'],'permissionRef':'documents/publication-authorization.json','verifiedOn':'2026-11-17'}
                results.append({'id':ident,'pages':q['pages'],'bytes':q['bytes'],'source':url});break
            except Exception as e:results.append({'id':ident,'source':url,'error':str(e)[:250]})
mp.write_text('window.WRHA_LIBRARY_MANIFEST=Object.freeze('+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n')
(root/'reports/alternate-source-publication.json').write_text(json.dumps({'manifestCount':len(manifest),'results':results},indent=2)+'\n')
print(json.dumps({'manifestCount':len(manifest),'results':results},indent=2))
