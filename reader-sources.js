/* WRHA unified document delivery. Do not copy publisher files without permission.
 * Existing public links are preserved; approved copies require explicit edition and permission metadata. */
(function(){'use strict';
const D=window.WRHA_DATA;if(!D)return;
const find=id=>[...D.manuals,...D.legislation].find(d=>d.id===id);
const patch=(id,values)=>{const d=find(id);if(d)Object.assign(d,values)};
const mo='https://www.moh.gov.jm/',law='https://laws.moj.gov.jm/';
patch('law-23',{url:law+'legislation/statutes/N/The%20Natural%20Resources%20Conservation%20Authority%20Act.pdf',sourceUrl:law+'library/statute/the-natural-resources-conservation-authority-act',format:'pdf',resourceKind:'pdf',status:'Direct official statute PDF identified — confirm current edition'});
patch('law-20',{url:law+'library/statute/the-food-storage-and-prevention-of-infestation-act',sourceUrl:law+'library/statute/the-food-storage-and-prevention-of-infestation-act',status:'Official statute record; full Act PDF not yet verified'});
const extra=[
 ['pa-pregnancy','Physical Activity Guide for Pregnancy','Health Promotion',mo+'wp-content/uploads/2024/04/PHYSICAL-ACTIVITY-AND-PREGNANCY-Feb-20-2023.pdf',mo+'manuals/'],
 ['pa-practitioners','Physical Activity Guide for Medical Practitioners','Health Promotion',mo+'wp-content/uploads/2021/01/PA-Guide-for-Medical-Praticitioners-compressed.pdf',mo+'manuals/'],
 ['pa-older-persons','Physical Activity Guide for Older Persons','Health Promotion',mo+'wp-content/uploads/2020/11/Physical-Activity-and-Older-Persons-Updated.pdf',mo+'manuals/'],
 ['pa-braille','Physical Activity — Braille Resource','Health Promotion',mo+'wp-content/uploads/2021/01/PA-in-Braille.pdf',mo+'manuals/'],
 ['pa-wellness-coordinators','Physical Activity Resource for Wellness Coordinators','Health Promotion',mo+'wp-content/uploads/2021/05/Final-Wellness-Coordinators-Checklist.pdf',mo+'manuals/']
];
for(const [id,title,category,url,sourceUrl] of extra)if(!find(id))D.manuals.push({id,title,category,url,sourceUrl,format:'pdf',publisher:'Ministry of Health & Wellness, Jamaica',status:'Official download listed — confirm edition and reader availability',description:'Official resource linked from the Ministry’s Physical Activity Manuals collection.'});
if(!find('law-food-storage-regs'))D.legislation.push({id:'law-food-storage-regs',title:'Food Storage and Prevention of Infestation Regulations, 1973',category:'Environmental Health',year:1973,url:law+'legislation/subsids/F/The%20Food%20Storage%20and%20Prevention%20of%20Infestation%20Act.pdf',sourceUrl:law+'library/subsidiary-legislation/the-food-storage-and-prevention-of-infestation-act',format:'pdf',publisher:'Ministry of Justice, Jamaica',status:'Official subsidiary legislation — verify amendments',description:'Subsidiary legislation, not the principal Act.'});
// Images linked by the publisher's physical activity resource index: https://www.moh.gov.jm/manuals/ .
const publisherCovers={
  "pa-pregnancy": "2024/04/guides-pregnancy.jpg",
  "pa-practitioners": "2021/02/Physical-Activity-Guide-for-Medical-Practioners.jpg",
  "pa-older-persons": "2021/02/Physical-Activity-Guide-for-Older-Persons.jpg",
  "pa-braille": "2021/02/Physical-Activity-Guide-for-Persons-in-Disabilities.jpg",
  "expanded-14": "2021/02/Physical-Activity-Bible.jpg",
  "deep-workplace-physical-activity": "2021/02/Physical-Activity-Guide-for-the-Workplace.jpg",
  "pa-wellness-coordinators": "2021/05/Wellness-Coordinator-Checklist-2.jpg",
  "deep-workplace-wellness-checklist": "2021/05/Wellness-Coordinator-Checklist-2.jpg",
  "deep-workplace-fitness-guide": "2024/04/guides-fitness-test_.jpg"
};
for(const [id,file] of Object.entries(publisherCovers))patch(id,{coverUrl:mo+'wp-content/uploads/'+file,coverCredit:'MOHW publisher artwork'});
patch('pa-pregnancy',{fileSizeNote:'Large PDF — approximately 35 MB'});
patch('pa-practitioners',{fileSizeNote:'Large PDF — approximately 39 MB'});
patch('pa-wellness-coordinators',{fileSizeNote:'Large PDF — approximately 13 MB'});
const collections={
 'expanded-16':{intro:'A reference overview for short-term volunteer health missions. The Ministry’s separate registration form can be read below. The guidance itself is an official webpage, not a single PDF.',note:'Coordinate with local health authorities; obtain the necessary professional registration and work-permit exemption as applicable. Check the official requirements for your profession and mission before submission.',ids:['form-volunteer-2024']},
 'expanded-19':{intro:'Browse the Ministry’s physical activity publications in this collection. Select a title to open the original PDF in the WRHA reader.',ids:['pa-pregnancy','pa-practitioners','pa-older-persons','pa-braille','expanded-14','deep-workplace-physical-activity','pa-wellness-coordinators']},
 'expanded-20':{intro:'Historical COVID-19 resources published by the Ministry. These documents reflect guidance at the time of issue and should not be treated as current clinical guidance without confirmation.',ids:['expanded-6','expanded-7','expanded-9','mohw-dental-2020']},
 'expanded-21':{intro:'Reference collection for the Ministry’s Mental Health Unit. The source page describes its role; the items below are related legal references, not a substitute for current clinical guidance.',ids:['law-7','law-8']},
 'expanded-22':{intro:'Reference collection for environmental health policy and programmes. The related documents below can be opened directly inside the resource hub.',ids:['expanded-6','expanded-7','law-17','law-20','law-food-storage-regs','law-21','law-22','law-23']},
 'law-2':{intro:'The Ministry of Justice publishes subsidiary instruments separately. The related documents listed here are not necessarily the complete body of regulations under the Act.',ids:['law-1','law-17']},
 'law-6':{intro:'Official subsidiary legislation record. A standalone PDF of these subsidiary instruments has not yet been verified. The principal Act is a separate document.',ids:['law-5']},
 'law-8':{intro:'Official subsidiary legislation record. A standalone PDF of these subsidiary instruments has not yet been verified. The principal Act is a separate document.',ids:['law-7']},
 'law-20':{intro:'Official record for the principal Act, concerning food storage and infestation prevention. A direct PDF of the principal Act has not yet been verified. The regulations are a distinct legal instrument.',ids:['law-food-storage-regs']},
};
// The publisher's WordPress download-manager links include a public tmstv parameter.
// Preserve the catalogue's stable ID and URL for reading-position and cache keys.
patch('deep-nutrition-colorectal-care',{format:'image',status:'Official public education image — source confirmed'});
function directUrl(doc){
 try{const url=new URL(doc.url,typeof location==='undefined'?'https://glenroygriffiths876-collab.github.io/WRHA-Manual-Resource-Hub/':location.href);
 if(url.hostname==='ncdip.moh.gov.jm'&&/^\/download\/\d+\/?$/.test(url.pathname))url.searchParams.set('tmstv',String(Math.floor(Date.now()/1000)));
 return url.href;}catch(_){return doc.url}
}
const approved=Object.freeze({
 // Example only (not enabled): 'record-id': {original:'https://publisher.example/exact.pdf',
 // url:'./authorised-documents/record-id.pdf', permissionRef:'written approval reference',
 // reviewedOn:'YYYY-MM-DD', edition:'exact matching published edition'}
});
function candidates(doc){
 const list=[],entry=approved[doc.id];
 if(entry&&entry.original===doc.url&&entry.permissionRef&&entry.reviewedOn&&entry.edition){
   try{const u=new URL(entry.url,location.href);if(u.protocol==='https:'||u.origin===location.origin)list.push({url:u.href,label:'Authorised hosted copy · '+entry.edition})}catch(_){}
 }
 list.push({url:directUrl(doc),label:'Original publisher document'});
 return list.filter((x,i)=>list.findIndex(y=>y.url===x.url)===i);
}
function deliveryUrl(doc){
 if(doc.deviceCopy||doc.format==='page'||!find(doc.id)||find(doc.id).url!==doc.url)return null;
 try{const base=new URL(window.WRHA_DELIVERY_ORIGIN||'');
 if(base.protocol!=='https:'||base.pathname!=='/'||base.search||base.hash||base.username||base.password)return null;
 const source=new URL(doc.url);if(source.hostname==='glenroygriffiths876-collab.github.io')return null;
 return new URL('/document/'+encodeURIComponent(doc.id),base).href;}catch(_){return null}
}
function readerCandidates(doc){
 const direct=candidates(doc),delivery=deliveryUrl(doc);if(!delivery)return direct;
 const route={url:delivery,label:'Publisher document via WRHA delivery',delivery:true};
 return /ncdip\.moh\.gov\.jm\/download\//i.test(doc.url)||['unconfirmed','fallback','blocked'].includes(window.WRHA_READER_AVAIL?.state(doc))?[...direct.filter(x=>x.label.startsWith('Authorised')),route,...direct.filter(x=>!x.label.startsWith('Authorised'))]:[...direct,route];
}
window.WRHA_READER_SOURCES=Object.freeze({get:find,collection:id=>collections[id]||null,candidates,directUrl,readerCandidates,deliveryUrl});
})();