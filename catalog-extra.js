/* Verified-source extensions for the WRHA knowledge hub.
 * Public links were discovered from MOHW, NCDIP and Ministry of Justice.
 * A public source listing does NOT prove that a document is the latest edition.
 * Role titles are illustrative functional labels, not a certified establishment list.
 */
(function(){
'use strict';
const D=window.WRHA_DATA;
if(!D)return;
const OLD='https://glenroygriffiths876-collab.github.io/National-HIV-STI-TB-Programme-Staff-Resource-Centre/';
for(const m of D.manuals){
  if(m.local){m.url=OLD+m.url.replace(/^\.\.\//,'');m.local=false;m.hostedLegacy=true;m.sourceUrl=m.sourceUrl||m.url;m.status='Repository edition — check currentness';}
  m.format=m.format||'pdf';
}
const SOURCES={
  mohw:'https://www.moh.gov.jm/mp-resources/',
  ncd:'https://ncdip.moh.gov.jm/resources/',
  reports:'https://www.moh.gov.jm/publications/',
  policies:'https://www.moh.gov.jm/policy-procedure/'
};
const added=[
['Nutrition & Dietetics','Guide for the Promotion of Healthy Eating in Workplaces',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/07/Guide-for-the-Promotion-of-Healthy-Eating-in-Workplaces.pdf',SOURCES.mohw,'Practical workplace healthy-eating guidance'],
['Nutrition & Dietetics','Interim Guidelines for Beverages in Schools',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/07/Interim-Guidelines-For-Beverages-In-Schools.pdf',SOURCES.mohw,'Interim school beverage standards; check current policy'],
['Clinical Care & Hospital Services','Guidelines for the Importation of Human Remains into Jamaica',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/07/MOHW-Guidelines-for-the-importation-of-Human-Remains.pdf',SOURCES.mohw,'Instructions relating to the importation of human remains'],
['Nutrition & Dietetics','Tool for Assessing the Nutrition Environment in Workplaces',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/07/Tool-for-Assessing-the-Nutrition-Environment-in-Workplaces.pdf',SOURCES.mohw,'Assessment tool for workplace nutrition environments'],
['Infection Prevention & Control','Infection Prevention and Control Guidelines for 2019-nCoV in Healthcare Settings',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/04/IPC-Guidelines-for-COVID-19.pdf',SOURCES.mohw,'Historical interim pandemic guidance, not general current IPC guidance'],
['Environmental Health','SOP: Inspection of Healthcare Facilities and Nursing Homes',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/05/SOP_Environmental-Health-InspectionsAssessments_HCF_NHs_2.pdf','https://www.moh.gov.jm/technical-services-division/environment-health-unit/','Environmental health inspection procedures issued during COVID-19'],
['Environmental Health','Environmental Health Guidance for Employers — COVID-19 Interim',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/09/EH-Guidance-for-Employers-MOHWSep-2020.pdf','https://www.moh.gov.jm/technical-services-division/environment-health-unit/','Historical interim employer guidance, September 2020'],
['Infection Prevention & Control','Infection Prevention and Control Guidance for Public Establishments',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/05/IPC-Guidance-for-Public-Establishments-_COVID-19-FINAL-.pdf',SOURCES.mohw,'Public establishment guidance issued during COVID-19'],
['Maternal & Child Health','Guideline for the Management of Pregnancy During the COVID-19 Pandemic',2020,'https://www.moh.gov.jm/wp-content/uploads/2020/04/Guideline-for-the-Management-of-Pregnancy-During-the-COVID-19-Pandemic.pdf',SOURCES.mohw,'Historical maternal-health guidance during the pandemic'],
['Administration & Governance','MOHW Register of Guidelines, Manuals, Policies and Protocols — 2022',2022,'https://www.moh.gov.jm/wp-content/uploads/2023/05/Register-Guidelines-Manual-Policies-and-Protocols-MOHW-2022.pdf',SOURCES.policies,'Historical catalogue of MOHW resource-centre holdings, not a set of downloadable manuals'],
['Non-Communicable Diseases','Standard Operating Procedure for Writing an Exercise Prescription',2025,'https://ncdip.moh.gov.jm/download/4297/',SOURCES.ncd,'December 2025 exercise-prescription SOP'],
['Non-Communicable Diseases','National Screening Guidelines for Priority NCDs in Primary Health Care — 2nd Edition',2024,'https://ncdip.moh.gov.jm/download/4283/',SOURCES.ncd,'Updated screening guidance for seven priority NCDs'],
['Non-Communicable Diseases','National Screening Guidelines for Priority NCDs — Pocket Guide',2024,'https://ncdip.moh.gov.jm/download/4288/',SOURCES.ncd,'Concise NCD screening reference'],
['Health Promotion','Physical Activity Bible — Ministry of Health & Wellness',null,'https://www.moh.gov.jm/physical-activity-bible/',SOURCES.mohw,'MOHW physical activity resource page'],
['Public Health Research','Guidelines for the Conduct of Research on Human Subjects',null,'https://www.moh.gov.jm/guidelines/guidelines-for-the-conduct-of-research-on-human-subjects/',SOURCES.mohw,'MOHW research ethics and procedural guidance'],
['Clinical Care & Hospital Services','Guidelines for Short Term Volunteer Health Services',null,'https://www.moh.gov.jm/guidelines/guidelines-for-short-term-volunteer-health-services/',SOURCES.mohw,'Authorisation and procedural requirements for short-term health missions'],
['Public Health Research','National Health Research Agenda — Jamaica 2024–2028',2024,'https://www.moh.gov.jm/data/national-health-research-agenda-jamaica-2024-2028/',SOURCES.reports,'National research priorities and thematic agenda'],
['Nutrition & Dietetics','Nutrition at a Glance — Jamaica 2024',2024,'https://www.moh.gov.jm/data/nutrition-at-a-glance-2024/',SOURCES.reports,'Official nutrition report publication page'],
['Health Promotion','MOHW Physical Activity Resources and Guides',null,'https://www.moh.gov.jm/physical-activity/',SOURCES.mohw,'Physical activity guidance and linked publications'],
['Communicable Diseases','COVID-19 Resources and Protocols Archive',2020,'https://www.moh.gov.jm/coronavirus-disease-covid19/covid-19-resources-and-protocols/',SOURCES.mohw,'Archive of historical COVID-19 protocols and documents'],
['Mental Health','MOHW Mental Health Unit Resources',null,'https://www.moh.gov.jm/mental-health-unit/',SOURCES.mohw,'Policy and programme resource directory'],
['Environmental Health','MOHW Environmental Health Unit Guidance',null,'https://www.moh.gov.jm/technical-services-division/environment-health-unit/',SOURCES.mohw,'Environmental health programme and services resource page']
];
let newCounter=0;
for(const [category,title,year,url,sourceUrl,description] of added){
 if(D.manuals.some(x=>x.url.replace(/[?#].*/,'')===url.replace(/[?#].*/,'')))continue;
 D.manuals.push({id:'expanded-'+(++newCounter),category,title,year,url,sourceUrl,description,publisher:'Ministry of Health & Wellness, Jamaica',format:/\.pdf(?:\?|$)|\/download\//i.test(url)?'pdf':'page',local:false,status:'Official source located — verify latest edition'});
}
const lawSource='https://laws.moj.gov.jm/';
const acts=[
['Public Health','The Public Health Act','Act','https://laws.moj.gov.jm/library/statute/the-public-health-act',''],
['Public Health','Public Health Act — Subsidiary Legislation','Regulations','https://laws.moj.gov.jm/library/subsidiary-legislation/the-public-health-act',''],
['Medicines & Pharmacy','The Food and Drugs Act','Act','https://laws.moj.gov.jm/library/statute/the-food-and-drugs-act',''],
['Medicines & Pharmacy','The Pharmacy Act','Act','https://laws.moj.gov.jm/library/statute/the-pharmacy-act',''],
['Nursing & Midwifery','The Nurses and Midwives Act','Act','https://laws.moj.gov.jm/library/statute/the-nurses-and-midwives-act','https://laws.moj.gov.jm/legislation/statutes/N/Nurses%20and%20Midwives%20Act_1.pdf'],
['Nursing & Midwifery','Nurses and Midwives Act — Subsidiary Legislation','Regulations','https://laws.moj.gov.jm/library/subsidiary-legislation/the-nurses-and-midwives-act',''],
['Mental Health','The Mental Health Act','Act','https://laws.moj.gov.jm/library/statute/the-mental-health-act','https://laws.moj.gov.jm/legislation/statutes/M/Mental%20Health%20Act_1.pdf'],
['Mental Health','Mental Health Act — Subsidiary Legislation','Regulations','https://laws.moj.gov.jm/library/subsidiary-legislation/the-mental-health-act',''],
['Health Information','The Data Protection Act, 2020','Act','https://laws.moj.gov.jm/library/act-of-parliament/7-2020-the-data-protection-act','https://laws.moj.gov.jm/legislation/aop/2/7_2020-The%20Data%20Protection%20Act.pdf'],
['Health Information','The Access to Information Act','Act','https://laws.moj.gov.jm/library/statute/the-access-to-information-act',''],
['Health Information','The Electronic Transactions Act','Act','https://laws.moj.gov.jm/library/statute/the-electronic-transactions-act',''],
['Dental & Allied Professions','The Dental Act','Act','https://laws.moj.gov.jm/library/statutes/revised/D',''],
['Public Health','The National Health Services Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Public Health','The Regional Health Authorities Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Medicines & Pharmacy','The Dangerous Drugs Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Medicines & Pharmacy','Food and Drugs Regulations, 1975','Regulations','https://www.moh.gov.jm/standards-and-regulation-division/legislative-framework/',''],
['Public Health','Public Health (Food Handling) Regulations, 1998','Regulations','https://www.jamaicatradeportal.gov.jm/en-gb/legal-document/index',''],
['Children & Safeguarding','The Child Care and Protection Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Institutional Care','The Nursing Homes Registration Act','Act','https://www.moh.gov.jm/standards-and-regulation-division/legislative-framework/',''],
['Environmental Health','The Food Storage and Prevention of Infestation Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Environmental Health','The Pesticides Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Environmental Health','The National Solid Waste Management Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Environmental Health','The Natural Resources Conservation Authority Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Dental & Allied Professions','The Opticians Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Dental & Allied Professions','The Professions Supplementary to Medicine Act','Act','https://laws.moj.gov.jm/library/statutes/revised',''],
['Death & Registration','The Coroners Act','Act','https://laws.moj.gov.jm/library/statutes/revised','']
];
D.legislation=acts.map((r,i)=>({id:'law-'+(i+1),category:r[0],title:r[1],type:r[2],url:r[4]||r[3],sourceUrl:r[3],format:r[4]?'pdf':'page',publisher:'Ministry of Justice & Constitutional Affairs, Jamaica',status:r[3].includes('/statute/')||r[4]?'Official record located — check amendments':'Official index/reference — locate consolidated instrument',description:'Relevant Jamaican law or statutory instrument. Confirm current consolidation, amendments and commencement before relying on it.'}));
/* The former speculative occupational roles have been permanently excluded from
 * the published catalogue. The complete public directory is generated from
 * source-verified records in verified-role-public.js only. */
D.roleGroups=[];

/* Direct legal PDF improvements cross-checked with the Ministry of Justice. */
const directLawPDFs={
 'The Public Health Act':'https://laws.moj.gov.jm/legislation/statutes/P/Public%20Health%20Act.pdf',
 'The Pharmacy Act':'https://laws.moj.gov.jm/legislation/statutes/P/Pharmacy%20Act_1.pdf',
 'The Dental Act':'https://laws.moj.gov.jm/legislation/statutes/D/Dental%20Act.pdf',
 'The Food and Drugs Act':'https://laws.moj.gov.jm/library/statute/the-food-and-drugs-act/download',
 'The National Health Services Act':'https://laws.moj.gov.jm/library/statute/the-national-health-services-act/download',
 'The Nursing Homes Registration Act':'https://laws.moj.gov.jm/library/statute/the-nursing-homes-registration-act/download'
};
D.legislation=D.legislation.filter(l=>l.title!=='The Regional Health Authorities Act');
for(const law of D.legislation){
 if(directLawPDFs[law.title]){law.url=directLawPDFs[law.title];law.format='pdf';law.status='Official PDF located — verify amendments';}
 if(law.title==='The Dental Act')law.sourceUrl='https://laws.moj.gov.jm/library/statute/the-dental-act';
 if(law.title==='The Nursing Homes Registration Act')law.sourceUrl='https://laws.moj.gov.jm/library/statute/the-nursing-homes-registration-act';
 if(law.title==='The National Health Services Act')law.sourceUrl='https://laws.moj.gov.jm/library/statute/the-national-health-services-act';
}
const additionalLaws=[
 ['Dental & Allied Professions','Dental Regulations, 1974','Regulations','https://laws.moj.gov.jm/legislation/subsids/D/Dental%20Act%20LN%20409%20of%2074.pdf','https://laws.moj.gov.jm/library/subsidiary-legislation/the-dental-act'],
 ['Medicines & Pharmacy','Pharmacy Regulations, 1975','Regulations','https://laws.moj.gov.jm/legislation/subsids/P/Pharmacy%20Act_0.pdf','https://laws.moj.gov.jm/library/subsidiary-legislation/the-pharmacy-act'],
 ['Medicines & Pharmacy','Food and Drugs Regulations, 1975','Regulations','https://laws.moj.gov.jm/legislation/subsids/F/The%20Food%20and%20Drugs%20Act.pdf','https://laws.moj.gov.jm/library/subsidiary-legislation/the-food-and-drugs-act'],
 ['Institutional Care','Nursing Homes Registration Regulations, 1934','Regulations','https://laws.moj.gov.jm/legislation/subsids/N/Nursing%20Homes%20Registration%20Act_0.pdf','https://laws.moj.gov.jm/library/subsidiary-legislation/the-nursing-homes-registration-act'],
 ['Public Health','The Quarantine Act','Act','https://laws.moj.gov.jm/library/statute/the-quarantine-act/download','https://laws.moj.gov.jm/library/statute/the-quarantine-act'],
 ['Medical Practice','The Medical Act','Act','https://laws.moj.gov.jm/library/statute/the-medical-act','https://laws.moj.gov.jm/library/statute/the-medical-act']
];
for(const [category,title,type,url,sourceUrl] of additionalLaws){
 if(D.legislation.some(l=>l.title.toLowerCase()===title.toLowerCase()))continue;
 D.legislation.push({id:'law-extra-'+D.legislation.length,title,category,type,url,sourceUrl,format:url.endsWith('/download')||url.endsWith('.pdf')?'pdf':'page',publisher:'Ministry of Justice & Constitutional Affairs, Jamaica',status:'Official record located — verify current amendments',description:'Legal instrument relevant to Jamaican health services. Confirm current amendments and subsidiary rules before use.'});
}


/* Additional official first-party PDFs, with historical labels where applicable. */
const verifiedMore=[
 {id:'mohw-dental-2020',title:'Guidance to the Dental Team: COVID-19',category:'Dental & Oral Health',year:2020,url:'https://www.moh.gov.jm/wp-content/uploads/2020/04/Oral-Health-Document-What-Members-of-the-Dental-Team-Need-to-Know-About-COVID-19.pdf',sourceUrl:'https://www.moh.gov.jm/coronavirus-disease-covid19/covid-19-resources-and-protocols/',status:'Historical COVID-19 guidance — do not assume current',description:'Public MOHW oral-health IPC guidance for dental teams, issued March 2020.',publisher:'Ministry of Health & Wellness, Jamaica',format:'pdf',local:false},
 {id:'mohw-me-operations-2009',title:'Jamaica National HIV/STI Programme Monitoring & Evaluation System Operations Manual',category:'Health Information & Digital Systems',year:2009,url:'https://moh.gov.jm/wp-content/uploads/2015/07/Jamaica_NHP_ME_Operations_Manual_Aug_2009.pdf',sourceUrl:'https://moh.gov.jm/wp-content/uploads/2015/07/Jamaica_NHP_ME_Operations_Manual_Aug_2009.pdf',status:'Historical operational manual (2007–2012) — archival',description:'241-page historical monitoring and evaluation manual, useful for programme history rather than current reporting instructions.',publisher:'Ministry of Health, Jamaica',format:'pdf',local:false}
];
for(const m of verifiedMore)if(!D.manuals.some(x=>x.id===m.id||x.url===m.url))D.manuals.push(m);
const pmtct=D.manuals.find(x=>x.id==='local-9');
if(pmtct){
 pmtct.title='Guidelines for the Prevention of Vertical Transmission of HIV & Syphilis, Jamaica';
 pmtct.url='https://hstu.moh.gov.jm/wp-content/uploads/2023/07/Final-PMTCT-Manual.pdf';
 pmtct.sourceUrl='https://hstu.moh.gov.jm/wp-content/uploads/2023/07/Final-PMTCT-Manual.pdf';
 pmtct.year=2020;pmtct.publisher='Ministry of Health & Wellness, Jamaica';pmtct.hostedLegacy=false;pmtct.status='MOHW 2020 edition — check latest';
 pmtct.description='Official 2020 edition hosted on the HSTU website, covering HIV and syphilis prevention of vertical transmission.';
}

D.updated='2026-11-12';
})();
