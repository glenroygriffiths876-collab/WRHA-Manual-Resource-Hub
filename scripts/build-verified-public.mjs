// Build the ONLY public Roles & Functions asset from individually verified sources.
// No broad occupational descriptions or related-title matches can be included.
import fs from 'node:fs';
const rha=JSON.parse(fs.readFileSync('verified-roles.json','utf8'));
const ministry=JSON.parse(fs.readFileSync('reports/mofps-2026-verified-ministry-posts.json','utf8')).records;
const httpOfficial=url=>/^https:\/\/(?:www\.)?(?:wrha\.gov\.jm|srha\.gov\.jm|nerha\.gov\.jm|serha\.gov\.jm|mof\.gov\.jm)\//.test(url);
function groupFor(title){
 const s=title.toLowerCase();
 if(/dental|oral/.test(s))return 'Dental & Oral Health';
 if(/inspection|environmental|vector|water|waste|pesticid|entomolog|food safety/.test(s))return 'Environmental & Public Health';
 if(/nurs|midwi|pmtct/.test(s))return 'Nursing & Maternal Care';
 if(/psychiatr|psycholog|mental|counsell/.test(s))return 'Mental Health & Counselling';
 if(/medical|physician|consultant|epidemiolog|surveillance|ncd|hiv|sti|tubercul|laborator|patholog/.test(s))return 'Clinical & Programme Services';
 if(/record|statistic|data|informatic|information technology|systems|database|software|application/.test(s))return 'Health Information & ICT';
 if(/pharmac|nutrition|diet|physiotherap|social work|radiolog|imaging|rehabilit|physical activity/.test(s))return 'Allied Health & Rehabilitation';
 if(/maintenance|plumb|electric|engineer|artisan|transport|driver|security|attendant|boiler|store|inventory|asset|library|facilities|grounds|dispatcher/.test(s))return 'Facilities & Support Services';
 if(/human resource|account|payroll|financ|procure|administrat|office|secretar|relations|registrar|clerk|communication|public relations/.test(s))return 'Administration & Corporate Services';
 return 'Regional & Programme Leadership';
}
const normalized=new Set(),records=[];
for(const a of rha){
 if(a.verificationMethod!=='EXACT_TITLE_MATCH_IN_OFFICIAL_SOURCE'||a.verificationTier!=='B'||!httpOfficial(a.sourceUrl)||!a.title?.trim())continue;
 const key='RHA|'+a.authority+'|'+a.title.toLowerCase()+'|'+(a.classification||'');
 if(normalized.has(key))continue;normalized.add(key);
 records.push({
  title:a.title,classification:a.classification||null,authority:a.authority,
  verificationTier:'B',verificationLabel:'Exact title found in official RHA publication',
  group:groupFor(a.title),publisher:a.authority+' (Regional Health Authority)',
  source:[{authority:a.authority,url:a.sourceUrl,kind:a.sourceKind,grade:a.classification||null,
   sourceTitle:a.title,sourceDate:a.sourceDate,physicalPage:a.documentPage||null}],
  sourcePage:a.documentPage||null,
  gradeUnconfirmed:a.gradeUnconfirmed||null,
  documentedResponsibilities:a.summary||null,verifiedQualifications:a.verifiedQualifications||null,
  verifiedReportsTo:a.verifiedReportsTo||null,
  warning:'A source-listed or historically advertised RHA title is not proof of current post establishment or an active vacancy.'
 });
}
for(const a of ministry){
 if(a.verificationTier!=='C'||!a.title||!a.classification||!a.pdfPage||!a.postIds?.length||!httpOfficial(a.sourceUrl.replace(/#.*$/,'')))continue;
 const key='MOHW|'+a.title.toLowerCase()+'|'+a.classification;
 if(normalized.has(key))continue;normalized.add(key);
 records.push({
  title:a.title,classification:a.classification,authority:'MOHW',
  verificationTier:'C',verificationLabel:'MOHW central civil-service post in 2026 Order',
  group:'MOHW Central Government Establishment',
  publisher:'Ministry of Finance and the Public Service, Jamaica',
  source:[{authority:'MOHW',url:a.sourceUrl,kind:'2026 General Establishment Order',
    grade:a.classification,sourceTitle:a.title,sourceDate:a.published,
    physicalPage:a.pdfPage,postIds:a.postIds}],
  sourcePage:a.pdfPage,postIds:a.postIds,
  documentedResponsibilities:null,verifiedQualifications:null,verifiedReportsTo:null,
  warning:'This established central MOHW civil-service post is NOT an RHA establishment or vacancy.'
 });
}
records.sort((a,b)=>a.group.localeCompare(b.group)||a.title.localeCompare(b.title)||a.authority.localeCompare(b.authority));
if(!records.length)throw Error('Refuse to create a directory with zero independently verified records');
const data=JSON.stringify(records);
const js=`/* GENERATED FROM reports/strict-role-source-audit.json and the source-checked MOFPS 2026 PDF. Do not hand-edit. */
(function(){'use strict';
const D=window.WRHA_DATA;
const rows=${data};
const icons={'MOHW Central Government Establishment':'🏛','Environmental & Public Health':'🌿','Nursing & Maternal Care':'🩺','Dental & Oral Health':'🦷','Health Information & ICT':'💻','Allied Health & Rehabilitation':'♿','Facilities & Support Services':'🔧','Administration & Corporate Services':'📂','Clinical & Programme Services':'⚕','Mental Health & Counselling':'💚','Regional & Programme Leadership':'🏥'};
const groups=new Map();
for(const role of rows){
 if(role.verificationTier!=='B'&&role.verificationTier!=='C')continue;
 const name=role.group;
 if(!groups.has(name))groups.set(name,{name,icon:icons[name]||'🏥',roles:[]});
 groups.get(name).roles.push(role);
}
D.roleGroups=[...groups.values()];
D.roleEvidenceCounts={rha:rows.filter(x=>x.verificationTier==='B').length,
 civilService:rows.filter(x=>x.verificationTier==='C').length,
 total:rows.length,unverified:0};
D.roleDirectoryNotice='Only exact titles independently found in official RHA documents or the MOFPS 2026 Civil Service Establishment Order are published. Ministry posts are not RHA posts.';
})();`;
fs.writeFileSync('verified-role-public.js',js+'\n');
fs.writeFileSync('reports/public-role-reconciliation.json',JSON.stringify({verifiedRHA:rha.length,acceptedRHA:records.filter(x=>x.verificationTier==='B').length,
 acceptedCentralMOHW:records.filter(x=>x.verificationTier==='C').length,publishedCount:records.length,
 rule:'Exact source title, source URL, and provenance only. Generic and related-title-only roles are excluded.',
 scope:'MOHW central-government post verification is not RHA establishment verification.'},null,2)+'\n');
console.log('Published exact role entries:',records.length,'RHA',records.filter(x=>x.verificationTier==='B').length,'MOHW',records.filter(x=>x.verificationTier==='C').length);
