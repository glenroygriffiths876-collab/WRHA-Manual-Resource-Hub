/* JASDIS-style verified file delivery. Never display a publisher HTML page as a document. */
(()=>{'use strict';
const D=window.WRHA_DATA,previous=window.WRHA_READER_SOURCES;if(!D||!previous)return;
const jasdis={
  "local-1": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/CI_Field_Guide_2025.pdf",
    "gitBlob": "af11edb22f5506564f761db4b7cc41e147dbfcfb"
  },
  "local-2": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/DHIS2_User_Manual_May_2026.pdf",
    "gitBlob": "a3db3779038eeaa25d11bb297803e8d61aa9f1ca"
  },
  "local-4": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/HIV_Disclosure_Protocol_2021.pdf",
    "gitBlob": "5f08e112dcd81346b1efc7a2ec5c835ae264813f"
  },
  "local-5": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/Linkage_Retention_Recovery_Protocol.pdf",
    "gitBlob": "d910643aa82b1a7598c67d249accacaf019f480c"
  },
  "local-7": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PITC_Facilitator_Manual.pdf",
    "gitBlob": "4e595a3c5de24110283668db61f7fade217eec32"
  },
  "local-8": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PITC_Participant_Manual.pdf",
    "gitBlob": "4b8891b13f6b17902ec25d522adc71248ade878c"
  },
  "local-10": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/Paediatric_Adolescent_HIV_2021.pdf",
    "gitBlob": "84d927a28b7b18122f4889d907304468adda5317"
  },
  "local-12": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PrEP_Handbook_2023.pdf",
    "gitBlob": "da9ffd31f40a93ad6ced3d9ee847e7394706c4d1"
  },
  "local-13": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/PrEP_Implementation_Guide_2025.pdf",
    "gitBlob": "95af175339d91be3a12af9995086c1c4d04eb2fd"
  },
  "local-14": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/STI_Case_Management_2020.pdf",
    "gitBlob": "5cb8498e78b80b9d3347e131f3ca4504ec8c0cef"
  },
  "local-15": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/STI_Handbook_2026.pdf",
    "gitBlob": "11139928228f3111689d239ffc3b144caf7802f0"
  },
  "local-16": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/Staff_Orders_for_Public_Service.pdf",
    "gitBlob": "e23636c88bf7136532dadee2cde26d59a48a48f0"
  },
  "local-17": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/TB_Guidelines_2021.pdf",
    "gitBlob": "37826eb37bc808bd5900441fa54e04d374f6bbd8"
  },
  "local-18": {
    "url": "https://raw.githubusercontent.com/jasdis876/JASDIS-Resource-Center/329c5b6a2ee94ac0e4d9dc82c8ca6b0e4ffdf099/TSIS2_User_Guide_2026.pdf",
    "gitBlob": "67e0a0352775a95d883c72d87e9d9d25d7ef085d"
  }
};
const officialOffice=previous.get('audit-community-private-reg');
if(officialOffice){officialOffice.format='office';officialOffice.url='https://moh.gov.jm/wp-content/uploads/2015/07/Guidelines-for-Community-and-Private-Health-Facilities.doc';officialOffice.status='Official Word publication; PDF preparation required for flipbook';}
function localRoute(d){const entry=window.WRHA_LIBRARY_MANIFEST?.[d.id];if(!entry||entry.recordUrl!==d.url||!entry.sha256||!Number.isInteger(entry.pages)||entry.pages<1)return null;
 if(!/^documents\/library\/[a-zA-Z0-9_-]+\.pdf$/.test(entry.path))return null;
 return {url:new URL('./'+entry.path,location.href).href,label:'WRHA prepared copy · '+entry.edition,pages:entry.pages,localLibrary:true,legalAlternate:!!entry.legalAlternate};
}
function stableRoutes(d){if(d.deviceCopy)return previous.readerCandidates(d);const local=localRoute(d),registered=jasdis[d.id],pinned=registered&&d.url==='https://glenroygriffiths876-collab.github.io/National-HIV-STI-TB-Programme-Staff-Resource-Centre/'+registered.url.split('/').at(-1)?registered:null;const prior=previous.readerCandidates(d);
 if(local)return [local];
 if(d.format==='office')return [{url:d.url,label:'Original Word publication'}];
 const direct=prior.filter(r=>!r.legalAlternate),alts=prior.filter(r=>r.legalAlternate);
 const unavailableJustice=/^https:\/\/laws\.moj\.gov\.jm\//i.test(d.url);
 // During the known Justice outage, try independent document copies first;
 // retain alternate-edition labels and never mark a maintenance notice as success.
 const gatewayAlts=[];try{const base=new URL(window.WRHA_DELIVERY_ORIGIN||'');if(base.protocol==='https:'&&base.pathname==='/'&&!base.search&&!base.hash&&!base.username&&!base.password)for(const [i,alt] of (d.alternateLegalSources||[]).entries())gatewayAlts.push({...alt,url:new URL('/document/'+encodeURIComponent(d.id)+'/'+i,base).href,label:alt.label+' · WRHA delivery',delivery:true});}catch(_){}
 const routed=unavailableJustice&&alts.length?[...gatewayAlts,...alts,...direct]:[...prior,...gatewayAlts];
 const list=[...(local?[local]:[]),...(pinned?[{url:pinned.url,label:'JASDIS repository PDF · pinned edition',jasdis:true}]:[]),...routed];
 return list.filter((r,i)=>list.findIndex(x=>x.url===r.url)===i);
}
function candidates(d){return stableRoutes(d).filter(r=>!r.delivery)}
window.WRHA_READER_SOURCES=Object.freeze({...previous,candidates,readerCandidates:stableRoutes,localRoute,directUrl:d=>localRoute(d)?.url||previous.directUrl(d)});
})();
