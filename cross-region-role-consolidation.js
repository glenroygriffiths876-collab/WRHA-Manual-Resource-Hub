/* Cross-region role directory: one professional title/grade row, many evidence regions.
 * Titles are merged only when official spelling (minor typography normalized) AND
 * classification agree. Unrelated grades are always separate records.
 * Do NOT claim every region uses a title merely because one RHA advertised it.
 */
(function(){'use strict';
const D=window.WRHA_DATA;if(!D?.roleGroups)return;
const all=D.roleGroups.flatMap(g=>g.roles);
const regions=['WRHA','SRHA','NERHA','SERHA'];
const norm=t=>String(t||'').toLowerCase().replace(/&/g,'and').replace(/\b(tb|tuberculosis)\b/g,'tb').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const index=new Map(),countByAuthority={},merged=[];
for(const r of all){
 if(!['B','C'].includes(r.verificationTier))continue;
 const grade=String(r.classification||'not-specified').toLowerCase().replace(/\s+/g,'').replace(/\//g,'');
 const identity=(r.verificationTier==='C'?'CENTRAL|':'RHA|')+norm(r.title)+'|'+grade;
 const src=(r.source||[]).filter(x=>x.url&&/^https:\/\//.test(x.url));
 if(!src.length)continue;
 const region=r.verificationTier==='C'?'MOHW':r.authority;
 countByAuthority[region]=(countByAuthority[region]||0)+1;
 const current=index.get(identity);
 if(!current){
  const result={...r,source:[],authorities:[],evidenceCount:0};
  if(r.verificationTier==='C')result.authorities=['MOHW'];
  result.authority=r.verificationTier==='C'?'MOHW':r.authority;
  index.set(identity,result);merged.push(result);
 }
 const item=index.get(identity);
 for(const source of src)if(!item.source.some(x=>x.url===source.url)){
  item.source.push(source);
 }
 if(!item.authorities.includes(region))item.authorities.push(region);
 if(r.documentedResponsibilities&&!item.documentedResponsibilities)item.documentedResponsibilities=r.documentedResponsibilities;
 if(r.verifiedQualifications&&!item.verifiedQualifications)item.verifiedQualifications=r.verifiedQualifications;
 if(r.verifiedReportsTo&&!item.verifiedReportsTo)item.verifiedReportsTo=r.verifiedReportsTo;
 if(r.verificationTier==='B'){
  item.verificationLabel='Officially documented RHA title / classification';
  item.warning='Documented through one or more official RHA sources. The role may exist in other RHAs, but those institutions are listed as verified only where evidence was found. Historical advertisements do not establish a current vacancy.';
 }
}
for(const r of merged){
 r.authorities.sort((a,b)=>regions.indexOf(a)-regions.indexOf(b));
 r.evidenceCount=r.source.length;
 if(r.verificationTier==='B')r.authority=r.authorities.join(', ');
}
const groups=new Map();
const icons={'Health Promotion':'📣','Nutrition & Dietetics':'🥬','Clinical & Programme Services':'⚕','Environmental & Public Health':'🌿','Nursing & Maternal Care':'🩺','MOHW Central Government Establishment':'🏛'};
for(const row of merged){
 const name=row.group||'Other Health Service Roles';
 if(!groups.has(name))groups.set(name,{name,icon:icons[name]||D.roleGroups.find(g=>g.name===name)?.icon||'🏥',roles:[]});
 groups.get(name).roles.push(row);
}
D.roleGroups=[...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
for(const g of D.roleGroups)g.roles.sort((a,b)=>a.title.localeCompare(b.title)||(a.classification||'').localeCompare(b.classification||''));
D.roleEvidenceCounts={
rha:merged.filter(r=>r.verificationTier==='B').length,
civilService:merged.filter(r=>r.verificationTier==='C').length,
total:merged.length,unverified:0,
sourceRecordCount:all.length,regionEvidenceCount:Object.values(countByAuthority).reduce((n,v)=>n+v,0)
};
D.roleDirectoryNotice='Distinct title/grade positions are consolidated across RHAs only when exact official evidence agrees. Regions listed are evidence sources, not a claim that all four RHAs have an identical approved establishment.';
})();
