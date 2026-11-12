"""Research-only extractor for SRHA's formal 34-page Regional Office qualification list.
No automatic publication. Exports page, column geometry, exact candidate title/grade.
"""
import requests, fitz, re, json, pathlib, collections
url='https://www.srha.gov.jm/pdf/HR/Positions-Qualifications.pdf'
response=requests.get(url,timeout=100,headers={'User-Agent':'Mozilla/5.0'});response.raise_for_status()
assert response.content[:4]==b'%PDF','Document was not a PDF'
doc=fitz.open(stream=response.content,filetype='pdf')
out=[];samples=[]
for page_no,page in enumerate(doc):
 words=page.get_text('words',sort=True)
 if page_no==0:
  samples=[{'x':round(w[0],1),'y':round(w[1],1),'word':w[4]} for w in words[:140]]
 # Recognize classification anchors by the exact printed RHA code and grade.
 # The table's middle column is consistently located at ~1/3–1/2 page width.
 # Join adjacent words on a common line but never synthesize a title.
 lines=collections.defaultdict(list)
 for w in words:
  x0,y0,x1,y1,text,*_=w
  key=round(y0/3)*3
  lines[key].append(w)
 anchors=[]
 for key,group in lines.items():
  group=sorted(group,key=lambda z:z[0])
  full=' '.join(w[4] for w in group)
  for m in re.finditer(r'\b((?:HPC|GMG|SOG|MIS|FMG|LMO|PIDG|JLG|PLG|MCG|HSC|HTAC|CPSM|OPS|SCS)\s*/\s*[A-Z]{2,5})\s*(\d)\b',full,re.I):
   matched=m.group(1).replace(' ','')+' '+m.group(2)
   # Find approximate grade position on the line
   anchor=next((w for w in group if re.match(r'^(?:HPC|GMG|SOG|MIS|FMG|LMO|PIDG|JLG|PLG|MCG|HSC|HTAC|OPS)',w[4],re.I)),None)
   if anchor and page.width*.23 <= anchor[0] <= page.width*.65:
    anchors.append((key,matched,anchor[0]))
 # Independently group left-column title words by anchor y, excluding header.
 anchors=sorted(set(anchors))
 for i,(y,grade,x) in enumerate(anchors):
  previous=anchors[i-1][0] if i else 80
  next_y=anchors[i+1][0] if i+1<len(anchors) else page.height-55
  # Title spans the beginning of row and may wrap to a second line.
  first=max(previous+6,y-9)
  limit=min(next_y-6,y+35)
  left=[w for w in words if page.width*.05 <= w[0] <= x-10 and first<=w[1]<=limit and w[1]>75]
  title=' '.join(w[4] for w in sorted(left,key=lambda w:(round(w[1]/4),w[0])))
  title=re.sub(r'\s+',' ',title).strip(' |,.;')
  if len(title)<4 or len(title)>115:continue
  if re.search(r'QUALIFICATION LISTING|Southern Regional Health|Compassion|POSITION|CLASSIFICATION|QUALIFICATIONS',title,re.I):continue
  out.append({'title':title,'classification':grade,'authority':'SRHA','sourceUrl':url,'sourcePage':page_no+1,'sourceType':'Regional Office Qualifications Listing','verificationTier':'B'})
pathlib.Path('reports').mkdir(exist_ok=True)
report={'source':url,'pages':len(doc),'samplePage0Words':samples,'candidates':out,'candidateCount':len(out),'warning':'Research-extracted candidate titles must be checked against original page table before public use; older source list not a current establishment certificate'}
pathlib.Path('reports/srha-qualification-candidates.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print('Extracted',len(out),'candidate rows; source PDF',len(doc),'pages')
for item in out[:60]:print(item['sourcePage'],item['title'],item['classification'])
