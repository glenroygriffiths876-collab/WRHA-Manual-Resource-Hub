/* Legal source routes: individually identified public copies, not new consolidations. */
(()=>{'use strict';
const D=window.WRHA_DATA,prior=window.WRHA_READER_SOURCES;if(!D||!prior)return;
const alt={
  "law-1": [
    [
      "https://www.jamaicatradeportal.gov.jm/upload/files/Legal_1550612324.pdf",
      "Jamaica Trade Portal · revised copy, check amendments",
      18
    ],
    [
      "https://cac.gov.jm/portal/index.php/special-features/publications/category/24-relevant-laws?download=125%3Athe-public-health-act",
      "Consumer Affairs Commission · revised copy, check amendments",
      18
    ]
  ],
  "law-3": [
    [
      "https://cac.gov.jm/portal/index.php/special-features/publications/category/24-relevant-laws?download=121%3Athe-food-and-drugs-act",
      "Consumer Affairs Commission · revised Act, check amendments",
      20
    ]
  ],
  "law-4": [
    [
      "https://cac.gov.jm/portal/index.php/special-features/publications/category/24-relevant-laws?download=124%3Athe-pharmacy-act",
      "Consumer Affairs Commission · revised Act, check amendments",
      25
    ]
  ],
  "law-12": [
    [
      "https://dentalcouncilofjamaica.org/dcj/wp-content/uploads/2022/08/Dental-Act.pdf",
      "Dental Council · revised copy incorporating 2011 amendment; check later amendments"
    ]
  ],
  "law-13": [
    [
      "https://www.srha.gov.jm/pdf/regulations/National%20Health%20Services%20Act.pdf",
      "SRHA · revised copy with 2006 authorized pages; check later amendments"
    ]
  ],
  "law-16": [
    [
      "https://www.jamaicatradeportal.gov.jm/upload/files/Legal_1550522126.pdf",
      "Jamaica Trade Portal · 1975 Regulations, check amendments",
      62
    ]
  ],
  "law-21": [
    [
      "https://cac.gov.jm/portal/index.php/special-features/publications/category/24-relevant-laws?download=126%3Athe-pesticides-act",
      "Consumer Affairs Commission · revised Act, check amendments",
      22
    ]
  ],
  "law-23": [
    [
      "https://cac.gov.jm/portal/index.php/special-features/publications/category/24-relevant-laws?download=129%3Anatural-resources-conservation-authority-nrca-act",
      "Consumer Affairs Commission · revised Act, check amendments"
    ]
  ],
  "law-extra-25": [
    [
      "https://dcj.gov.jm/wp-content/uploads/2022/08/Dental-Regulations.pdf",
      "Dental Council · 1974 Regulations, check amendments",
      22
    ]
  ],
  "law-extra-29": [
    [
      "https://jamaicamedicalcouncil.org/wp-content/uploads/2018/06/Medical-Act_1.pdf",
      "Medical Council · revised copy incorporating 2011 amendment; check later amendments"
    ]
  ],
  "audit-law-processed-food": [
    [
      "https://cac.gov.jm/portal/index.php/special-features/publications/category/24-relevant-laws?download=130%3Athe-processed-food-act",
      "Consumer Affairs Commission · revised Act, check amendments",
      17
    ]
  ],
  "law-food-storage-regs": [
    [
      "https://cac.gov.jm/portal/index.php/special-features/publications/category/24-relevant-laws?download=128%3Athe-food-storage-and-prevention-of-infestation-act",
      "Consumer Affairs Commission · 1973 Regulations, check amendments"
    ]
  ],
  "audit-law-domestic-violence": [
    [
      "https://japarliament.gov.jm/attachments/article/2565/339_Domestic-Violence-Act.pdf",
      "Houses of Parliament · check against 2023 amendment"
    ]
  ]
};
const patches={
  "audit-law-cremation": {
    "url": "https://laws.moj.gov.jm/legislation/statutes/C/The%20Cremation%20Act.pdf",
    "format": "pdf",
    "status": "Official revised Act located — source access intermittent; check amendments"
  },
  "audit-law-domestic-violence": {
    "url": "https://jeijamaica.gov.jm/wp-content/uploads/2024/01/The-Domestic-Violence-ActAmended-2004-1.pdf",
    "format": "pdf",
    "status": "2004-amended copy — read together with the separate 2023 Amendment Act and check later changes"
  },
  "audit-law-domestic-amendment": {
    "url": "https://japarliament.gov.jm/attachments/article/339/The-Domestic-Violence---Amendment--Act--2023-No.-20---_.pdf",
    "format": "pdf",
    "status": "Act No. 20 of 2023 — official assented PDF; check commencement and later changes"
  }
};
for(const law of D.legislation){if(patches[law.id]){const original=law.url;Object.assign(law,patches[law.id]);law.sourceUrl=law.sourceUrl||original;delete law.resourceKind;}if(alt[law.id])law.alternateLegalSources=alt[law.id].map(([url,label,pages])=>({url,label,pages:pages||null,legalAlternate:true}));}
function candidates(doc){const routes=prior.candidates(doc);const extra=(D.legislation.find(x=>x.id===doc.id&&x.url===doc.url)?.alternateLegalSources||[]);return [...routes,...extra].filter((x,i,a)=>a.findIndex(y=>y.url===x.url)===i);}
function readerCandidates(doc){const base=prior.readerCandidates(doc);const extra=(D.legislation.find(x=>x.id===doc.id&&x.url===doc.url)?.alternateLegalSources||[]);return [...base,...extra].filter((x,i,a)=>a.findIndex(y=>y.url===x.url)===i);}
window.WRHA_READER_SOURCES=Object.freeze({...prior,candidates,readerCandidates});
})();
