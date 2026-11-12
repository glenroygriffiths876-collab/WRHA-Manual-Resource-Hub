/* 12 November 2026 — traceable RHA role evidence.
 * Only titles/grades explicitly visible on the linked government source receive a verified-title status.
 * Responsibilities without a job-description source remain marked editorial.
 * Civil Service General Establishment Orders do not themselves prove RHA post establishment.
 */
(function(){
'use strict';
const D=window.WRHA_DATA;if(!D)return;
const src={
 wrha1:'https://www.wrha.gov.jm/vacancy/',
 wrha2:'https://www.wrha.gov.jm/vacancy/page/2/',
 wrha3:'https://www.wrha.gov.jm/vacancy/page/3/',
 wrha6:'https://www.wrha.gov.jm/vacancy/page/6/',
 srha:'https://srha.gov.jm/pdf/HR/Positions-Qualifications.pdf',
 srhaJobs:'https://srha.gov.jm/jobs.php',
 phi:'https://srha.gov.jm/pdf/jobs/Advertisement%20-%20Public%20Health%20Inspector%201AYSQ.pdf',
 dental:'https://srha.gov.jm/pdf/jobs/Advertisement%20-%20Dental%20Assistant%202026nmM1.pdf',
 nerha:'https://www.nerha.gov.jm/vacancies',
 nerhaMaintenance:'https://www.nerha.gov.jm/news-item?news=MjI2',
 nerhaArtisan:'https://www.nerha.gov.jm/news-item?news=MjIy',
 nerhaElectrician:'https://www.nerha.gov.jm/news-item?news=MjI0',
 nerhaGardener:'https://www.nerha.gov.jm/news-item?news=MjIz',
 mofps:'https://www.mof.gov.jm/documents/publications/'
};
const verified=[
 // [Official published job title, published classification code, publisher, source key, evidence status, advertised or source date, function notes from official job document if known]
 ['Health Records Clerk','HTAC/HRT 1','WRHA','wrha1','advertised','2026-10-13',''],
 ['Public Relations Officer','MCG/IE 3','WRHA','wrha1','advertised','2026-10-08',''],
 ['Boiler Operator','LMO/TS 5','WRHA','wrha1','advertised','2026-10-01',''],
 ['Senior Plumber','LMO/TS 5','WRHA','wrha1','advertised','2026-10-01',''],
 ['Senior Maintenance Officer','LMO/TS 5','WRHA','wrha2','advertised','2026-10-01',''],
 ['Manager, Enterprise Application & Client Support','MIS/IT 6','WRHA','wrha2','advertised','2026-09-28',''],
 ['Regional Quality Control Officer','HPC/MO 4','WRHA','wrha2','advertised','2026-09-25',''],
 ['Operating Theatre Technician','HTAC/HT 2','WRHA','wrha2','advertised','2026-09-24',''],
 ['Enrolled Assistant Nurse','HTAC/EAN 1','WRHA','wrha2','advertised','2026-09-24',''],
 ['Senior Medical Social Worker','HPC/MSW 2','WRHA','wrha2','advertised','2026-09-24',''],
 ['Medical Social Worker','HPC/MSW 1','WRHA','wrha2','advertised','2026-09-24',''],
 ['Nurse Anaesthetist','HPC/RN 4','WRHA','wrha2','advertised','2026-09-24',''],
 ['Registered General Nurse','HPC/RN 1','WRHA','wrha2','advertised','2026-09-24',''],
 ['Clinical Psychologist','HPC/ALH 1','WRHA','wrha3','advertised','2026-09-20',''],
 ['Psychologist','HPC/ALH 3','WRHA','wrha3','advertised','2026-09-20',''],
 ['Counselling Psychologist','HPC/ALH 1','WRHA','wrha3','advertised','2026-09-20',''],
 ['Supervisor, Physiotherapy Services','HPC/PT 4','WRHA','wrha3','advertised','2026-09-20',''],
 ['Physical Therapy Specialist','HPC/PT 3','WRHA','wrha3','advertised','2026-09-20',''],
 ['Physiotherapist II','HPC/PT 2','WRHA','wrha3','advertised','2026-09-20',''],
 ['Physiotherapist I','HPC/PT 1','WRHA','wrha3','advertised','2026-09-20',''],
 ['Technical Assistant (Radiology)','HTAC/HT 1','WRHA','wrha3','advertised','2026-09-20',''],
 ['Hospital Administrator','GMG/AM 4','WRHA','wrha3','advertised','2026-09-20',''],
 ['Medical Imaging Practitioner','HPC/MIP 3','WRHA','wrha3','advertised','2026-09-20',''],
 ['Consultant — Microbiology','HPC/MO 4','WRHA','wrha6','advertised','2026-03-09',''],
 ['Resident (Medical Officer 2) — Accident & Emergency','HPC/MO 2','WRHA','wrha6','advertised','2026-03-09',''],
 ['Public Health Inspector 1','HPC/EH 1','SRHA','phi','advertised','2026-11-02','Inspect food premises, care establishments and other sites for compliance; investigate insanitary conditions and contaminated food or water; conduct communicable/food-borne disease investigations; compile reports.'],
 ['Dental Assistant','HTAC/DA 1','SRHA','dental','advertised','2026-11-02','Prepare and sterilise dental instruments, assist dental surgeons and dental nurses chairside, maintain infection control, appointments and dental records.'],
 ['Orthopaedic Technician','HTAC/HT 2','SRHA','srhaJobs','advertised','2026-11-10',''],
 ['Fixed Asset/Inventory Officer','PIDG/RIM 3','SRHA','srhaJobs','advertised','2026-11-05',''],
 ['Senior Public Procurement Officer','GMG/SEG 1','SRHA','srhaJobs','advertised','2026-11-03',''],
 ['Supervisor, CCTV Surveillance System','SOG/ST 4','SRHA','srhaJobs','advertised','2026-11-05',''],
 ['Regional Director','GMG/CTD 1','SRHA','srha','qualification-list','', ''],
 ['Regional Technical Director','HPC/MO 6','SRHA','srha','qualification-list','', ''],
 ['Regional Dental Surgeon','HPC/DS 5','SRHA','srha','qualification-list','', ''],
 ['Regional Nursing Supervisor','HPC/RN 6','SRHA','srha','qualification-list','', ''],
 ['Regional HIV/STI/TB Coordinator','HPC/MO 4','SRHA','srha','qualification-list','', ''],
 ['Regional NCD Coordinator','HPC/MO 4','SRHA','srha','qualification-list','', ''],
 ['Regional Psychiatrist','HPC/MO 4','SRHA','srha','qualification-list','', ''],
 ['Regional Medical Epidemiologist','HPC/MO 4','SRHA','srha','qualification-list','', ''],
 ['Regional Mental Health Officer','HPC/RN 5','SRHA','srha','qualification-list','', ''],
 ['Regional Health Records Administrator','HPC/HR 4','SRHA','srha','qualification-list','', ''],
 ['Regional Nutritionist','HPC/ND 5','SRHA','srha','qualification-list','', ''],
 ['Regional BCC Coordinator','HPC/HPE 3','SRHA','srha','qualification-list','', ''],
 ['Regional Health Promotion & Education Officer','HPC/HPE 3','SRHA','srha','qualification-list','', ''],
 ['Regional Public Health Specialist (Occupational Health & Safety)','HPC/EH 5','SRHA','srha','qualification-list','', ''],
 ['Regional Public Health Specialist (Waste Water)','HPC/EH 5','SRHA','srha','qualification-list','', ''],
 ['Regional Public Health Specialist (Food Safety)','HPC/EH 5','SRHA','srha','qualification-list','', ''],
 ['Regional Public Health Specialist (Vector Control)','HPC/EH 5','SRHA','srha','qualification-list','', ''],
 ['Regional Physiotherapist','HPC/PT 5','SRHA','srha','qualification-list','', ''],
 ['Regional Physical Activity Specialist','GMG/SEG 2','SRHA','srha','qualification-list','', ''],
 ['Regional Clinical Psychologist (HIV/STI/TB)','HPC/ALH 3','SRHA','srha','qualification-list','', ''],
 ['Regional Medical Social Work Services Officer','HPC/MSW 3','SRHA','srha','qualification-list','', ''],
 ['PMTCT Nurse','HPC/RN 2','SRHA','srha','qualification-list','', ''],
 ['Bio-Statistician','SOG/ST 7','SRHA','srha','qualification-list','', ''],
 ['Statistical Analyst','SOG/ST 6','SRHA','srha','qualification-list','', ''],
 ['Data Entry Clerk','MIS/IT 2','SRHA','srha','qualification-list','', ''],
 ['Office Attendant','LMO/TS 1','SRHA','srha','qualification-list','', ''],
 ['Groundsman','LMO/TS 1','SRHA','srha','qualification-list','', ''],
 ['Administrative Officer','GMG/SEG 1','SRHA','srha','qualification-list','', ''],
 ['Treatment, Care & Support Officer','HPC/ALH 1','SRHA','srha','qualification-list','', ''],
 ['Surveillance Officer (HIV/STI/TB)','HPC/ALH 2','SRHA','srha','qualification-list','', ''],
 ['Electro Mechanical Technician','SOG/ST 4','SRHA','srha','qualification-list','', ''],
 ['Chief Electro Mechanical Engineer','SOG/ST 6','SRHA','srha','qualification-list','', ''],
 ['AC & Refrigeration Technician','SOG/ST 3','SRHA','srha','qualification-list','', ''],
 ['Supervisor, AC & Refrigeration Maintenance','SOG/ST 4','SRHA','srha','qualification-list','', ''],
 ['Supervisor, Plumbing Services','SOG/ST 4','SRHA','srha','qualification-list','', ''],
 ['Driver 1','LMO/DR 1','SRHA','srha','qualification-list','', ''],
 ['Waste Disposal Officer','LMO/TS 3','SRHA','srha','qualification-list','', ''],
 ['CCTV Operator','SOG/ST 2','SRHA','srha','qualification-list','', ''],
 ['Final Accounts Officer','FMG/AT 3','SRHA','srha','qualification-list','', ''],
 ['Accounts Payable Officer','FMG/AT 2','SRHA','srha','qualification-list','', ''],
 ['Bank Reconciliation Officer','FMG/AT 2','SRHA','srha','qualification-list','', ''],
 ['Director, Information Communication Technology','MIS/IT 7','SRHA','srha','qualification-list','', ''],
 ['Software Database Administrator','MIS/IT 4','SRHA','srha','qualification-list','', ''],
 ['Systems Administrator','MIS/IT 4','SRHA','srha','qualification-list','', ''],
 ['Manager, Systems & Network Administration','MIS/IT 5','SRHA','srha','qualification-list','', ''],
 ['Chief Biomedical Engineer','','NERHA','nerha','advertised','', ''],
 ['Maintenance Supervisor','SOG/ST 4','NERHA','nerhaMaintenance','advertised','', ''],
 ['Artisan (General Construction / Carpentry)','LMO/TS 4','NERHA','nerhaArtisan','advertised','', ''],
 ['Artisan (Electrician)','LMO/TS 4','NERHA','nerhaElectrician','advertised','', ''],
 ['Gardener / Groundsman','LMO/TS 1','NERHA','nerhaGardener','advertised','', '']
];
const aliases={
 'Registered General Nurse':['Registered Nurse','Staff Nurse'],
 'Health Records Clerk':['Medical Records Clerk'],
 'Public Health Inspector 1':['Public Health Inspector'],
 'Regional Health Promotion & Education Officer':['Health Education Officer','Health Promotion Officer'],
 'Regional Nutritionist':['Nutritionist'],
 'Regional Physiotherapist':['Physiotherapist'],
 'Regional Mental Health Officer':['Mental Health Officer'],
 'Supervisor, Plumbing Services':['Plumber'],
 'Director, Information Communication Technology':['ICT Officer']
};
function normalize(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
const existing=new Map();for(const g of D.roleGroups)for(const r of g.roles)existing.set(normalize(r.title),{r,g});
function chooseGroup(title){
 const t=title.toLowerCase();
 return D.roleGroups.find(g=>
  /inspector|vector|waste water|food safety|environmental|occupational/.test(t)?g.name.includes('Environmental'):
  /nurs|midwi|pmtct/.test(t)?g.name.includes('Nursing'):
  /psych|mental/.test(t)?g.name.includes('Mental Health'):
  /dent/.test(t)?g.name.includes('Dental'):
  /physio|physical therapy|nutrition|social work/.test(t)?g.name.includes('Allied Health'):
  /health records|data entry|statistic|information communication|systems admin|application/.test(t)?g.name.includes('Medical Records'):
  /medical officer|consultant|resident|patholog|microbiolog/.test(t)?g.name.includes('Medical Officers'):
  /plumb|maintenance|boiler|cctv|driver|artis|grounds|mechanic/.test(t)?g.name.includes('Patient Support'):
  /payable|finance|procurement|inventory|account|administrative|public relations/.test(t)?g.name.includes('Human Resources'):
  g.name.includes('Regional Leadership'));
}
for(const [title,grade,publisher,key,type,date,sourceSummary] of verified){
 const exact=normalize(title);
 const found=existing.get(exact);
 const srcInfo={authority:publisher,url:src[key],kind:type,grade:grade||null,sourceDate:date||null,sourceTitle:title};
 const common={title,classification:grade||null,verification:'source-backed-title',source:[srcInfo],sourceDate:date||null,publisher,documentedResponsibilities:sourceSummary||null};
 if(found){
  Object.assign(found.r,common);
  found.r.summary=sourceSummary||found.r.summary;
 }else{
  const g=chooseGroup(title);const rec={...common,summary:sourceSummary||'This job title and published classification are evidenced in a government recruitment notice or RHA qualification listing. Detailed tasks should be checked against the linked source.',setting:'Source-specific healthcare location or regional office; consult the advertisement',collaborates:'See the original job description for official reporting relationships'};
  g.roles.push(rec);existing.set(exact,{r:rec,g});
 }
 for(const alias of aliases[title]||[]){
  const e=existing.get(normalize(alias));
  if(e&&!e.r.source){e.r.relatedEvidence=[srcInfo];e.r.verification='related-title-only';}
 }
}
for(const g of D.roleGroups)for(const r of g.roles){
 if(!r.verification)r.verification='general-overview-unverified';
 if(!r.source)r.source=[];
 if(!r.classification)r.classification=null;
 if(!r.documentedResponsibilities)r.documentedResponsibilities=null;
}
D.roleEvidenceSources=src;
D.roleEvidenceUpdated='2026-11-12';
D.roleEvidenceCounts={sourceBacked:D.roleGroups.reduce((n,g)=>n+g.roles.filter(r=>r.verification==='source-backed-title').length,0),total:D.roleGroups.reduce((n,g)=>n+g.roles.length,0)};
})();
