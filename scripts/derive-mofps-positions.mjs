// Curated, exact one-line MOHW CIVIL-SERVICE positions from the official
// MOFPS 2026 Order. No ambiguous truncated titles, no RHA establishment claims.
import fs from 'node:fs';
const evidence=JSON.parse(fs.readFileSync('reports/mofps-2026-establishment-evidence.json','utf8'));
if(!evidence.documentSHA256 || !Array.isArray(evidence.pageEvidence))throw Error('MOFPS primary document was not retrieved and checked');
const allow=new Set([
'Permanent Secretary','Chief Programme Officer','Data Protection Officer',
'Executive Secretary 2','Executive Secretary 1','Senior Secretary','Secretary 2',
'Administrative Assistant','Principal Director, Corporate Services',
'Administrator 4','Administrator 2','Director, Administration',
'Stores Manager','Inventory Officer','Stores Clerk','Manager, Office Services',
'Senior Office Attendant','Office Attendant','Estate/Property Manager',
'Property Officer','Records Officer','Artisan 3','Artisan 2',
'Director, Transport & Security','Transport Manager','Transport Officer',
'Records Officer 1','Dispatcher','Driver 2','Security Coordinator','Access Officer',
'Librarian 5','Documentation & Filing Clerk','Senior Library Assistant',
'Library Assistant','Registrar','Civil Engineer','Electrical Engineer',
'Bio-Medical Engineer','Executive Engineer','Senior Biomedical Technician',
'Senior Civil Works Technician','Senior Electro-mechanical Technician',
'Electro-Mechanical Technician','Accounting Clerk 1','Records Clerk',
'Senior Industrial Relations Officer','Occupational Health & Safety Officer',
'Industrial Relations Officer','Senior Human Resource Officer','Data Entry Clerk',
'Co-ordinator, In-Service Education','Senior Nurse Educator/Tutor',
'Nurse Educator/Tutor','Office Administrator','National Physical Activity Specialist',
'Physical Activity Specialist','Epidemiological Clerk','Surveillance Officer',
'Helpline Counsellor','Director, Environmental Health'
]);
const sourceUrl=evidence.sourceUrl,gradeRx=/\b((?:GMG|HPC|LMO|OPS|FMG|PIDG|MIS|SOG|MCG|JLG|PLG|IT)\s*\/?\s*[A-Z]{2,5}\s+\d)\b/;
const records=new Map();
for(const page of evidence.pageEvidence){
  for(const line of page.sample.split(/\r?\n/)){
    if(!/^\s*\d+\s+Ministry of Health and Wellness\b/.test(line))continue;
    const post=/\b\d{5}\b/.exec(line);if(!post)continue;
    const after=line.slice(post.index+post[0].length),grade=gradeRx.exec(after);if(!grade)continue;
    const title=after.slice(0,grade.index).replace(/\s+/g,' ').trim();
    if(!allow.has(title))continue; // Explicit curation: no inferred/completed titles
    const code=grade[1].replace(/\s*\/\s*|\s+/g,' ').trim().split(' ');
    const classification=code[0]+'/'+code[1]+' '+code[2];
    const key=title.toLowerCase()+'|'+classification;
    if(!records.has(key))records.set(key,{title,classification,authority:'MOHW',sourceType:'Central Civil Service Establishment',verificationTier:'C',postIds:[],pdfPage:page.physicalPage,sourceUrl:sourceUrl+'#page='+page.physicalPage,documentTitle:evidence.sourceTitle,published:evidence.published,jobPurpose:null,verifiedQualifications:null,warning:'This is a Ministry of Health & Wellness CENTRAL CIVIL-SERVICE post, NOT evidence of an established RHA post.'});
    const row=records.get(key);if(row.postIds.length<20&&!row.postIds.includes(post[0]))row.postIds.push(post[0]);
  }
}
const result=[...records.values()].sort((a,b)=>a.title.localeCompare(b.title)||a.classification.localeCompare(b.classification));
if(result.length<25)throw Error('Unexpectedly few substantiated Ministry positions: '+result.length);
fs.writeFileSync('reports/mofps-2026-verified-ministry-posts.json',JSON.stringify({documentHash:evidence.documentSHA256,documentPages:evidence.totalPages,sourceUrl:evidence.sourceUrl,totalDistinctTitleGradePairs:result.length,scopeNotice:'Central civil service posts only, not RHA establishments',records:result},null,2)+'\n');
console.log('Curated exact Ministry title/grade pairs:',result.length);
for(const x of result.slice(0,7))console.log(x.title,x.classification,'PDF page',x.pdfPage);
