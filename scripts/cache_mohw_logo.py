"""Cache the authentic Ministry of Health & Wellness logo from the official MOHW site.
Do not approximate/redraw the artwork. Print all candidates for review.
"""
import requests, bs4, re, pathlib, urllib.parse
home='https://www.moh.gov.jm/'
res=requests.get(home,timeout=25,headers={'User-Agent':'Mozilla/5.0'})
res.raise_for_status()
soup=bs4.BeautifulSoup(res.text,'html.parser')
candidates=[]
for img in soup.find_all('img'):
 text=' '.join(str(img.get(k,'')) for k in ('src','alt','class','data-src'))
 src=img.get('src') or img.get('data-src') or ''
 if 'logo' in text.lower() or 'ministry' in text.lower() or 'health' in text.lower():
  candidates.append((text[:230],urllib.parse.urljoin(home,src)))
for t,u in candidates[:28]:print('CANDIDATE:',t,'URL:',u,flush=True)
good=[(t,u) for t,u in candidates if ('logo' in t.lower() and ('mohw' in t.lower() or 'ministry' in t.lower() or 'health' in t.lower() or 'main' in t.lower()))]
if not good:
 # Look for header-linked logo candidate.
 good=[(t,u) for t,u in candidates if ('logo' in t.lower() and 'goj-logo' not in t.lower())]
if not good:raise RuntimeError('Could not identify official MOHW logo from ministry website; do not substitute a generic icon')
t,u=good[0];print('SELECTED',u)
img=requests.get(u,timeout=25,headers={'User-Agent':'Mozilla/5.0'});img.raise_for_status()
raw=img.content
suffix=pathlib.PurePosixPath(urllib.parse.urlparse(u).path).suffix.lower()
if suffix not in ('.svg','.png','.webp','.jpg','.jpeg'):raise RuntimeError('Unknown file format '+suffix)
if suffix=='.svg' and b'<svg' not in raw[:3000]:raise RuntimeError('Logo URL is not valid SVG')
if suffix!='.svg' and len(raw)<2000:raise RuntimeError('Logo too small')
pathlib.Path('assets').mkdir(exist_ok=True)
out=pathlib.Path('assets/mohw-logo'+suffix);out.write_bytes(raw)
print('SAVED',str(out),len(raw),flush=True)
