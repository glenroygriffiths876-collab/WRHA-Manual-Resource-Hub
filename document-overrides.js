/* Verified direct-document overrides — 2026-11-12.
 * Each URL here corresponds to an identified PDF document, not an HTML publication page.
 * Original publisher page remains as sourceUrl. Do not mirror copyrighted MOHW PDFs without permission.
 */
(function(){'use strict';
const D=window.WRHA_DATA;if(!D)return;
const overrides={
  "expanded-18": {
    "url": "https://www.moh.gov.jm/wp-content/uploads/2025/02/Nutrition-at-a-Glance-2024.pdf",
    "sourceUrl": "https://www.moh.gov.jm/data/nutrition-at-a-glance-2024/"
  },
  "expanded-17": {
    "url": "https://www.moh.gov.jm/wp-content/uploads/2026/09/Health-Research-Priority-Setting-Methodology-and-Report-Sept-25_.pdf",
    "sourceUrl": "https://www.moh.gov.jm/data/national-health-research-agenda-jamaica-2024-2028/"
  },
  "expanded-14": {
    "url": "https://www.moh.gov.jm/wp-content/uploads/2020/11/Physical-Activity-Bible.pdf",
    "sourceUrl": "https://www.moh.gov.jm/edu-resources/physical-activity-bible/"
  },
  "expanded-15": {
    "url": "https://www.moh.gov.jm/wp-content/uploads/2015/07/Guidelines-for-the-Conduct-of-Research.pdf",
    "sourceUrl": "https://www.moh.gov.jm/guidelines/guidelines-for-the-conduct-of-research-on-human-subjects/"
  },
  "law-10": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/A/The%20Access%20to%20Information%20Act.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-access-to-information-act"
  },
  "law-11": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/E/The%20Electronic%20Transactions%20Act_update.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-electronic-transactions-act"
  },
  "law-15": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/D/The%20Dangerous%20Drugs%20Act%20%282%29_0.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-dangerous-drugs-act"
  },
  "law-16": {
    "url": "https://laws.moj.gov.jm/legislation/subsids/F/The%20Food%20and%20Drugs%20Act.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/subsidiary-legislation/the-food-and-drugs-act"
  },
  "law-17": {
    "url": "https://laws.moj.gov.jm/legislation/subsids/P/The%20Public%20Health%20Act_0.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/subsidiary-legislation/the-public-health-act"
  },
  "law-18": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/C/Child%20Care%20and%20Protection%20Act_0.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-child-care-and-protection-act"
  },
  "law-21": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/P/Pesticides%20Act_1.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-pesticides-act"
  },
  "law-22": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/N/National%20Solid%20Waste%20Management%20Act.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-national-solid-waste-management-act"
  },
  "law-24": {
    "url": "https://laws.moj.gov.jm/library/statute/the-opticians-act/download",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-opticians-act"
  },
  "law-25": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/P/Professions%20Supplementary%20to%20Medicine%20Act_1.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-professions-supplementary-to-medicine-act"
  },
  "law-26": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/C/Coroners%20Act.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-coroners-act"
  },
  "law-extra-29": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/M/Medical%20Act_1.pdf",
    "sourceUrl": "https://laws.moj.gov.jm/library/statute/the-medical-act"
  }
};
for(const [id,patch] of Object.entries(overrides)){
 const entry=[...(D.manuals||[]),...(D.legislation||[])].find(d=>d.id===id);
 if(!entry)continue;
 Object.assign(entry,{...patch,format:'pdf',status:'Direct official PDF identified — confirm current edition'});
}
/* This is a downloadable registration FORM, not a PDF version of the web-based guidance. */
const volunteer=(D.manuals||[]).find(d=>d.id==='expanded-16');if(volunteer){volunteer.title='Short-Term Volunteer Health Services — Guidance (web)';volunteer.format='page';volunteer.status='Official web guidance — no matching PDF of full guidance verified';}
if(volunteer && !D.manuals.some(d=>d.id==='form-volunteer-2024'))D.manuals.push({id:'form-volunteer-2024',title:'Professional Registration for Short-Term Volunteers — Form',category:'Clinical Care & Hospital Services',year:2024,url:'https://www.moh.gov.jm/wp-content/uploads/2024/06/PROFESSIONAL-REGISTRATION-FOR-SHORT-TERM-VOLUNTEERS-updated.pdf',sourceUrl:'https://www.moh.gov.jm/guidelines/guidelines-for-short-term-volunteer-health-services/',format:'pdf',publisher:'Ministry of Health & Wellness, Jamaica',status:'Official 2024 form — verify use before submission',description:'The ministry’s separate one-page registration form, not the complete volunteer guidance.'});
/* Preserve resource hubs as informative web indexes; they are not single downloadable manuals. */
for(const d of D.manuals||[]){if(d.format==='page'){d.resourceKind='web-index';d.status=d.status||'Official web resource — no single PDF';}}
for(const d of D.legislation||[]){if(d.format==='page'){d.resourceKind='legal-index';d.status='Official legal index — select an individual instrument';}}
window.WRHA_DIRECT_OVERRIDES=Object.keys(overrides).length;
})();
