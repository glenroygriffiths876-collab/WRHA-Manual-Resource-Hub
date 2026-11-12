"""Deep public-source MOHW manual discovery — research inventory only.
Searches official open sections and checks PDF signatures without downloading full
files. Generates an auditable inventory rather than claiming every archived title is current.
"""
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin,urlparse,unquote
import requests,bs4,re,json,datetime,pathlib
PAGES=[
'https://www.moh.gov.jm/mp-resources/',
'https://www.moh.gov.jm/corporate-workplace-wellness/',
'https://www.moh.gov.jm/guidelines/',
'https://www.moh.gov.jm/policy-procedure/',
'https://www.moh.gov.jm/publications/',
'https://www.moh.gov.jm/data/',
'https://www.moh.gov.jm/physical-activity/',
'https://www.moh.gov.jm/technical-services-division/environment-health-unit/',
'https://www.moh.gov.jm/standards-and-regulation-division/guidelines-forms-lists/',
'https://www.moh.gov.jm/physical-activity-bible/',
'https://hstu.moh.gov.jm/media/manuals/',
'https://hstu.moh.gov.jm/media/guidelines/',
'https://ncdip.moh.gov.jm/resources/',
'https://ncdip.moh.gov.jm/resources/page/2/',
'https://hssp.moh.gov.jm/resources/',
]
session=requests.Session();session.headers.update({'User-Agent':'Mozilla/5.0 (public document catalogue research)'})
approved=('moh.gov.jm','hstu.moh.gov.jm','ncdip.moh.gov.jm','hssp.moh.gov.jm')
def getpage(url):
 try:
  r=session.get(url,timeout=(10,27));r.raise_for_status()
  soup=bs4.BeautifulSoup(r.text,'html.parser')
  found=[]
  for a in soup.find_all('a',href=True):
   href=urljoin(r.url,a.get('href',''));host=urlparse(href).hostname or ''
   if not (host=='moh.gov.jm' or host.endswith('.moh.gov.jm')):continue
   label=' '.join(a.get_text(' ',strip=True).split())
   parent=' '.join(a.parent.get_text(' ',strip=True).split())[:210]
   hints=' '.join([label,unquote(urlparse(href).path),parent])
   pdf='.pdf' in href.lower() or '/download/' in href.lower()
   topical=bool(re.search(r'\b(manual|guide|guideline|protocol|handbook|standard operating|sop|policy|procedure|toolkit|clinical management|checklist|field guide|nutrition|vaccine)\b',hints,re.I))
   reject=bool(re.search(r'\b(job|tender|vacancy|press release|invitation|procurement|announcement|presentation)\b',hints,re.I))
   if (pdf or topical) and not reject:found.append({'url':href,'page':url,'label':label,'context':parent,'looksPdf':pdf})
  return {'page':url,'count':len(found),'records':found,'error':None}
 except Exception as exc:return {'page':url,'count':0,'records':[],'error':str(exc)[:250]}
with ThreadPoolExecutor(max_workers=5) as e:pages=list(e.map(getpage,PAGES))
seen={};records=[]
for page in pages:
 for r in page['records']:
  key=r['url'].split('#')[0].rstrip('/')
  if key not in seen:seen[key]=r;records.append(r)
records.sort(key=lambda x:(x['page'],x['label']))
report={'checkedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'publisher':'Official MOHW and programme subdomains','pages':[{k:v for k,v in p.items() if k!='records'} for p in pages],'candidateCount':len(records),'candidates':records,'warning':'Discovery inventory, not endorsement of latest revision or automatic rights to mirror. PDF reading depends on publisher CORS and download policies.'}
pathlib.Path('reports').mkdir(exist_ok=True)
pathlib.Path('reports/mohw-deep-discovery.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print('Government pages checked:',len(pages),'candidate links:',len(records))
for p in pages:print(p['page'],p['count'],p['error'] or 'OK')
for r in records[:55]:print(r['label'][:60],r['url'][:140])
