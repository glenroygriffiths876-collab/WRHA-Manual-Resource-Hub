/* Hosted-file routing based on the existing JASDIS collection. */
(()=>{'use strict';
const D=window.WRHA_DATA,prior=window.WRHA_READER_SOURCES;if(!D||!prior)return;
const J={
  "local-1": {
    "file": "CI_Field_Guide_2025.pdf",
    "sha": "af11edb22f5506564f761db4b7cc41e147dbfcfb",
    "size": 5261769,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/CI_Field_Guide_2025.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/CI_Field_Guide_2025.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-1.svg"
  },
  "local-2": {
    "file": "DHIS2_User_Manual_May_2026.pdf",
    "sha": "a3db3779038eeaa25d11bb297803e8d61aa9f1ca",
    "size": 5509072,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/DHIS2_User_Manual_May_2026.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/DHIS2_User_Manual_May_2026.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-2.svg"
  },
  "local-3": {
    "file": "HIV_Clinical_Management_2020.pdf",
    "sha": "fd8cac3f7c711c986f3c0fbab21f7748b2047914",
    "size": 2484999,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/HIV_Clinical_Management_2020.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/HIV_Clinical_Management_2020.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-3.svg"
  },
  "local-4": {
    "file": "HIV_Disclosure_Protocol_2021.pdf",
    "sha": "5f08e112dcd81346b1efc7a2ec5c835ae264813f",
    "size": 874527,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/HIV_Disclosure_Protocol_2021.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/HIV_Disclosure_Protocol_2021.pdf",
    "local": true,
    "cover": "./covers/jasdis-local-4.svg"
  },
  "local-5": {
    "file": "Linkage_Retention_Recovery_Protocol.pdf",
    "sha": "d910643aa82b1a7598c67d249accacaf019f480c",
    "size": 4273424,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/Linkage_Retention_Recovery_Protocol.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/Linkage_Retention_Recovery_Protocol.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-5.svg"
  },
  "local-6": {
    "file": "National_Strategic_Plan_HIV_2023_2030.pdf",
    "sha": "4339d5dad872ee1bbd604d1d065d0f90d73568e5",
    "size": 4532798,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/National_Strategic_Plan_HIV_2023_2030.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/National_Strategic_Plan_HIV_2023_2030.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-6.svg"
  },
  "local-7": {
    "file": "PITC_Facilitator_Manual.pdf",
    "sha": "4e595a3c5de24110283668db61f7fade217eec32",
    "size": 1122975,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PITC_Facilitator_Manual.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/PITC_Facilitator_Manual.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-7.svg"
  },
  "local-8": {
    "file": "PITC_Participant_Manual.pdf",
    "sha": "4b8891b13f6b17902ec25d522adc71248ade878c",
    "size": 11178059,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PITC_Participant_Manual.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/PITC_Participant_Manual.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-8.svg"
  },
  "local-9": {
    "file": "PMTCT_Vertical_Transmission_Guidelines_2020.pdf",
    "sha": "6c0bfd81f455d06022ed5dfaf4d010e3788eef6a",
    "size": 2219506,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PMTCT_Vertical_Transmission_Guidelines_2020.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/PMTCT_Vertical_Transmission_Guidelines_2020.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-9.svg"
  },
  "local-10": {
    "file": "Paediatric_Adolescent_HIV_2021.pdf",
    "sha": "84d927a28b7b18122f4889d907304468adda5317",
    "size": 1351904,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/Paediatric_Adolescent_HIV_2021.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/Paediatric_Adolescent_HIV_2021.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-10.svg"
  },
  "local-11": {
    "file": "Patient_Referral_Transfer_Manual_2016.pdf",
    "sha": "d03d9d154fcd6cf4e1e0dee4db97d4d6705f4931",
    "size": 3472226,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/Patient_Referral_Transfer_Manual_2016.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/Patient_Referral_Transfer_Manual_2016.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-11.svg"
  },
  "local-12": {
    "file": "PrEP_Handbook_2023.pdf",
    "sha": "da9ffd31f40a93ad6ced3d9ee847e7394706c4d1",
    "size": 9300461,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PrEP_Handbook_2023.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/PrEP_Handbook_2023.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-12.svg"
  },
  "local-13": {
    "file": "PrEP_Implementation_Guide_2025.pdf",
    "sha": "95af175339d91be3a12af9995086c1c4d04eb2fd",
    "size": 4010198,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PrEP_Implementation_Guide_2025.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/PrEP_Implementation_Guide_2025.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-13.svg"
  },
  "local-14": {
    "file": "STI_Case_Management_2020.pdf",
    "sha": "5cb8498e78b80b9d3347e131f3ca4504ec8c0cef",
    "size": 3481787,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/STI_Case_Management_2020.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/STI_Case_Management_2020.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-14.svg"
  },
  "local-15": {
    "file": "STI_Handbook_2026.pdf",
    "sha": "11139928228f3111689d239ffc3b144caf7802f0",
    "size": 2593985,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/STI_Handbook_2026.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/STI_Handbook_2026.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-15.svg"
  },
  "local-16": {
    "file": "Staff_Orders_for_Public_Service.pdf",
    "sha": "e23636c88bf7136532dadee2cde26d59a48a48f0",
    "size": 369276,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/Staff_Orders_for_Public_Service.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/Staff_Orders_for_Public_Service.pdf",
    "local": true,
    "cover": "./covers/jasdis-local-16.svg"
  },
  "local-17": {
    "file": "TB_Guidelines_2021.pdf",
    "sha": "37826eb37bc808bd5900441fa54e04d374f6bbd8",
    "size": 3119945,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/TB_Guidelines_2021.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/TB_Guidelines_2021.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-17.svg"
  },
  "local-18": {
    "file": "TSIS2_User_Guide_2026.pdf",
    "sha": "67e0a0352775a95d883c72d87e9d9d25d7ef085d",
    "size": 14916709,
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/TSIS2_User_Guide_2026.pdf",
    "pagesUrl": "https://jasdis876.github.io/JASDIS-Resource-Center/TSIS2_User_Guide_2026.pdf",
    "local": false,
    "cover": "./covers/jasdis-local-18.svg"
  }
};
const published=window.WRHA_LOCAL_PUBLICATIONS||{};
const all=[...D.manuals,...D.legislation];
const docx=all.find(d=>d.id==='audit-community-private-reg');
if(docx){docx.sourceUrl='https://www.moh.gov.jm/standards-and-regulation-division/guidelines-forms-lists/';docx.url='https://moh.gov.jm/wp-content/uploads/2015/07/Guidelines-for-Community-and-Private-Health-Facilities.doc';docx.format='office';docx.status='Official Word publication';docx.description='Official Ministry guidance for community and private health facilities.'}
function localEntry(d){
 if(d.deviceCopy)return null;
 const x=published[d.id];if(x&&x.original===d.url&&x.path==='pdfs/'+d.id+'.pdf'&&/^[a-f0-9]{64}$/.test(x.sha256)&&Number.isSafeInteger(x.pages)&&x.pages>0&&x.permissionRef&&x.reviewedOn&&x.edition){
 return {url:'./'+x.path,label:'Hosted publication · '+x.edition,pages:x.pages,hostedFile:true,converted:!!x.converted,cover:x.cover};
 }
 const j=J[d.id];if(j?.local)return {url:'./pdfs/'+d.id+'.pdf',label:'WRHA-hosted JASDIS publication',hostedFile:true};
 return null;
}
for(const d of all){
 const j=J[d.id],local=localEntry(d);
 if(j){d.coverPath=j.cover;d.hostedReference=true;}
 if(local){d.hostedReference=true;if(local.cover&&local.cover==='covers/'+d.id+'.webp')d.coverPath='./'+local.cover;if(d.format==='office'){d.originalFormat='office';d.format='pdf';d.status+=' · PDF reading copy';}}
}
function legacy(d,r){try{return new URL(r.url,location.href).hostname==='laws.moj.gov.jm'}catch(_){return false}}
function routes(d,reader){
 const local=localEntry(d),j=J[d.id],base=(reader?prior.readerCandidates(d):prior.candidates(d))||[];
 // Exact JASDIS file paths are pinned to the inspected Git commit, not a moving branch.
 // The two local copies have their original Git blob identities verified.
 const refs=j?[{url:j.url,label:'JASDIS-hosted publication · '+j.file,hostedFile:true},{url:j.pagesUrl,label:'JASDIS public library · '+j.file,hostedFile:true}]:[];
 const other=base.filter(r=>!legacy(d,r)),old=base.filter(r=>legacy(d,r));
 // The original MOJ URL remains as provenance. During its known maintenance incident
 // prefer individually inspected alternate legal copies before trying the older host.
 const list=[...(local?[local]:[]),...refs,...other,...old];
 return list.filter((x,i)=>list.findIndex(y=>y.url===x.url)===i);
}
function primaryDownload(d){const local=localEntry(d);if(local)return local.url;const j=J[d.id];return j?j.url:prior.directUrl(d)}
window.WRHA_READER_SOURCES=Object.freeze({...prior,candidates:d=>routes(d,false),readerCandidates:d=>routes(d,true),primaryDownload,localEntry});
})();