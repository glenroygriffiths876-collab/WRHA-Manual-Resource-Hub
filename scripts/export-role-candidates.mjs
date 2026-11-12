// Export only source-backed candidates for strict independent verification.
// No generic or related-title-only role can enter this public data pipeline.
import fs from 'node:fs';import vm from 'node:vm';
if(fs.existsSync('reports/role-source-candidates.json')){
 const previous=JSON.parse(fs.readFileSync('reports/role-source-candidates.json','utf8'));
 if(previous.length>=60){
  console.log('Reusing historical source-linked candidate inventory:',previous.length);
  process.exit(0);
 }
}
const root={};
for(const p of ['data.js','catalog-extra.js','document-overrides.js','role-evidence.js'])vm.runInNewContext(fs.readFileSync(p,'utf8'),{window:root},{timeout:12000});
const D=root.WRHA_DATA;
const all=D.roleGroups.flatMap(g=>g.roles.map(r=>({...r,group:g.name,groupIcon:g.icon})));
const candidates=all.filter(r=>r.verification==='source-backed-title'&&r.source?.length).map(r=>{
 const e=r.source[0];return {title:r.title,classification:r.classification,category:r.group,icon:r.groupIcon,sourceUrl:e.url,
 publisher:e.authority,sourceKind:e.kind,sourceDate:e.sourceDate||null,
 documentedResponsibilities:r.documentedResponsibilities||null,verifiedQualifications:r.verifiedQualifications||null,
 verifiedReportsTo:r.verifiedReportsTo||null};
});
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/role-source-candidates.json',JSON.stringify(candidates,null,2)+'\n');
console.log('Candidate roles with pre-existing source links:',candidates.length);
