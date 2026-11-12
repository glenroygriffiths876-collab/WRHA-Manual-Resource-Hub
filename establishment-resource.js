/* MOFPS 2026 Civil Service Establishment: original official PDF, next to Staff Orders.
 * This is a central civil-service order, NOT an establishment certificate for RHA posts.
 */
(function(){
 const D=window.WRHA_DATA;if(!D?.manuals)return;
 const id='mofps-civil-establishment-2026';
 if(D.manuals.some(m=>m.id===id))return;
 const record={
  id,
  title:'Civil Service Establishment (General) Order 2026',
  category:'Administration & Governance',
  year:2026,
  url:'https://www.mof.gov.jm/wp-content/uploads/Civil-Service-Establishment-General-Order-2026.pdf',
  sourceUrl:'https://www.mof.gov.jm/documents/publications/',
  description:'Official MOFPS central-government establishment order, published 22 April 2026. It does not, by itself, certify posts established within Jamaica’s statutory Regional Health Authorities.',
  publisher:'Ministry of Finance and the Public Service, Jamaica',
  format:'pdf',local:false,
  status:'Official 2026 Civil Service Order — not an RHA establishment register'
 };
 const staffIndex=D.manuals.findIndex(m=>m.id==='local-16'||/Staff Orders for the Public Service/i.test(m.title));
 if(staffIndex>=0)D.manuals.splice(staffIndex+1,0,record);else D.manuals.push(record);
})();
