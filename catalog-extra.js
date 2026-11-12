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
const settings={
 leadership:['Regional headquarters, hospitals and parish health departments','Clinical, nursing, corporate and programme teams'],
 public:['Parish health departments, communities and health centres','MO(H), clinical services, surveillance and community teams'],
 hospital:['Hospitals, wards, clinics and emergency services','Clinical, nursing, allied-health and support teams'],
 community:['Health centres, schools, clinics and outreach settings','Public health nurses, medical officers and community partners'],
 support:['Hospitals, regional offices and health facilities','Clinical teams, administrators and facilities managers']
};
const groups=[
['Regional Leadership & Governance','🏛',settings.leadership,`
Regional Director|Directs regional service strategy, performance, governance and resource stewardship.
Regional Technical Director|Coordinates technical quality, programme implementation and professional standards across the region.
Regional Nursing Director|Leads nursing service delivery, nursing quality and workforce development.
Regional Medical Director|Coordinates medical leadership, clinical governance and medical service quality where designated.
Regional Programme Coordinator|Plans regional programme implementation, indicators and follow-up.
Parish Manager|Manages parish operational resources and coordination of health-centre services.
Medical Officer of Health|Leads parish disease prevention, public-health surveillance and health protection.
Deputy Medical Officer of Health|Supports parish medical and population-health leadership where this post exists.
Chief Executive Officer — Hospital|Directs hospital operations, patient experience and institutional performance.
Senior Medical Officer|Oversees medical practice, clinical services, medical staff and standards in the hospital.
Director of Nursing Services|Manages nursing services, rosters, nursing supervision and practice quality.
Hospital Administrator|Coordinates administrative operations and facility management.
Quality Assurance Officer|Monitors standards, quality indicators, investigations and service improvement.
Patient Safety Officer|Supports incident reporting, harm-prevention systems and patient-safety improvement.
Health Services Planner|Supports service planning, needs assessment, performance and infrastructure planning.
Monitoring and Evaluation Officer|Develops indicators, tracks outcomes and assists programme evaluation.
Internal Auditor|Reviews financial and operational controls and compliance with procedures.
Administrative Services Director|Leads cross-functional administrative services within delegated authority.
`],
['Environmental & Public Health Inspection','🌱',settings.public,`
Public Health Inspector|Inspects food premises, water, sanitation and environmental risks; supports enforcement.
Senior Public Health Inspector|Supervises inspections, complex investigations and quality of environmental-health work.
Chief Public Health Inspector|Provides technical oversight and management of parish environmental-health operations.
Regional Environmental Health Officer|Coordinates regional standards, assessment and environmental-health initiatives where designated.
Food Safety Inspector|Assesses food-handling practices, premises hygiene and food safety risks.
Vector Control Officer|Coordinates surveillance and control of mosquitoes and other disease vectors.
Vector Control Supervisor|Supervises vector-control field teams, deployment and reporting.
Vector Control Worker|Undertakes assigned vector-control operations and field inspections.
Water Quality Surveillance Officer|Supports monitoring, inspection and response to drinking-water safety concerns.
Environmental Health Technician|Assists inspections, samples, investigations and field programmes.
Port Health Officer|Supports health measures at ports and points of entry as assigned.
Occupational Health and Safety Officer|Coordinates workplace hazard identification and health-and-safety initiatives.
Waste Management Officer|Supports healthcare and environmental waste management programmes.
Institutional Health Inspector|Assesses health and safety arrangements in care institutions.
Public Health Laboratory Liaison Officer|Coordinates specimen referral and environmental/public-health laboratory communication.
`],
['Surveillance, STI & Communicable Disease','🧬',settings.public,`
Contact Investigator (Level 1)|Investigates communicable-disease cases, elicits contacts, undertakes follow-up and provides counselling.
Senior Contact Investigator (Level 2)|Supervises investigations, data quality, field operations and case-review activities.
Regional Contact Investigator (Level 3)|Coordinates regional investigation oversight, reporting and technical support.
Disease Intervention Officer — proposed title|Would provide contact investigation and partner-services functions; verify formal title implementation.
Communicable Disease Surveillance Officer|Supports notification, case classification, investigations and reporting.
Epidemiologist|Analyses disease trends, evaluates surveillance and contributes to outbreak response.
Surveillance Data Officer|Checks records, produces timely surveillance summaries and improves reporting completeness.
Outbreak Response Coordinator|Coordinates investigation logistics, teams and communication during outbreaks.
HIV Testing Services Counsellor|Provides pre- and post-test support, risk assessment and service linkage.
HIV Treatment and Care Coordinator|Supports multidisciplinary care pathways, retention and clinical coordination.
STI Clinic Nurse|Provides assigned STI clinical nursing care, counselling and specimen support.
Tuberculosis Programme Coordinator|Coordinates TB prevention, diagnosis pathways, adherence support and monitoring.
TB Contact Investigation Officer|Supports TB exposure investigations and contact screening.
Infection Control Surveillance Nurse|Monitors healthcare-associated infection indicators and supports prevention activities.
Health Informatics Surveillance Officer|Supports reliable reporting through approved digital systems and data workflows.
`],
['Health Promotion, Community & NCD Services','💚',settings.community,`
Health Education Officer|Develops and delivers health education sessions, behaviour-change initiatives and campaigns.
Senior Health Education Officer|Supervises health-promotion programmes, staff mentoring and community partnerships.
Health Promotion Officer|Plans health-promotion messages, outreach and engagement strategies.
Community Health Aide|Supports outreach, basic screening, follow-up, referrals and community engagement.
Community Health Aide Supervisor|Supports field scheduling, mentorship, quality checks and reporting.
Physical Activity Specialist|Supports assessments, exercise education and programme delivery within qualifications.
NCD Programme Coordinator|Coordinates NCD prevention, screening, care initiatives and data monitoring.
Diabetes Educator|Supports diabetes self-management education and patient understanding.
Hypertension Clinic Coordinator|Supports continuity of hypertension services and multidisciplinary follow-up.
School Health Officer|Coordinates health education, screening and school health liaison.
Adolescent Health Coordinator|Coordinates youth-friendly services and adolescent health programme activities.
Tobacco Cessation Counsellor|Supports evidence-based tobacco cessation and behavioural counselling.
Health Communication Officer|Produces accessible public-health materials and manages health communication.
Community Outreach Coordinator|Organises outreach sessions, partnerships and referral pathways.
Social Marketing Officer — health programmes|Supports health campaign planning and public engagement where appointed.
`],
['Public Health Nursing & Maternal and Child Health','🤱',settings.community,`
Public Health Nurse|Coordinates community nursing services, immunisation, maternal-child health and follow-up.
Senior Public Health Nurse|Supervises public-health nursing teams, clinical quality and reporting.
Family Nurse Practitioner|Assesses and manages eligible primary-care patients within approved practice arrangements.
Community Midwife|Provides maternity assessment, education and referral within authorised scope.
Registered Midwife|Provides maternity care, monitoring and safe childbirth support.
Maternal and Child Health Nurse|Supports antenatal, postnatal and child health services and education.
Antenatal Clinic Nurse|Delivers antenatal nursing assessment, education and service coordination.
Postnatal Clinic Nurse|Monitors postpartum care needs, infant wellness and maternal support.
Child Health Clinic Nurse|Provides child-health monitoring, immunisation and family advice.
Family Planning Nurse|Supports reproductive health assessment, education and contraception services.
Immunisation Nurse|Administers vaccines, observes safety procedures and documents doses.
EPI Programme Officer|Coordinates vaccination planning, coverage monitoring and cold-chain support.
Cold Chain Technician|Maintains and monitors vaccine refrigeration and transport systems.
Growth Monitoring Aide|Supports measurements, recording and referral within delegated duties.
Breastfeeding Support Counsellor|Provides lactation education, practical assistance and referral.
PMTCT Programme Nurse|Supports prevention of vertical transmission through antenatal follow-up.
`],
['Hospital Nursing & Ward Services','🩺',settings.hospital,`
Registered Nurse|Provides nursing assessment, medication administration, monitoring and patient education.
Enrolled Assistant Nurse|Assists nursing care under authorised supervision and approved scope.
Staff Nurse|Provides direct nursing care and clinical documentation on assigned wards.
Charge Nurse|Coordinates daily ward nursing, staffing and patient care prioritisation.
Nursing Supervisor|Oversees nursing teams, mentoring, compliance and shift coordination.
Nurse Manager|Manages nursing staffing, quality and ward/service performance.
Clinical Nurse Specialist|Provides advanced nursing expertise in a defined clinical area where appointed.
Emergency Department Nurse|Provides triage support, rapid assessment and emergency nursing care.
Critical Care Nurse|Provides intensive patient monitoring and high-dependency nursing support.
Operating Theatre Nurse|Coordinates perioperative nursing, sterile practice and surgical safety.
Recovery Room Nurse|Monitors and supports patients after anaesthesia.
Paediatric Nurse|Delivers developmentally appropriate nursing care for children.
Neonatal Nurse|Provides specialised nursing care and monitoring for newborns.
Maternity Ward Nurse|Coordinates nursing care for pregnant and postpartum patients.
Mental Health Nurse|Supports psychiatric assessment, therapeutic care and risk monitoring.
Infection Prevention and Control Nurse|Develops IPC education, audits and surveillance support.
Dialysis Nurse|Supports renal replacement therapy monitoring within approved service.
Oncology Nurse|Coordinates cancer treatment nursing care, symptom support and education.
`],
['Medical Officers & Specialist Clinical Services','⚕',settings.hospital,`
Medical Officer|Assesses, diagnoses, treats and refers patients within registration and clinical privileges.
Senior House Officer|Provides supervised hospital medical care as assigned by specialty team.
Medical Intern|Provides supervised medical care while completing internship requirements.
General Practitioner|Delivers primary clinical assessment, diagnosis and management.
Consultant Physician|Leads specialist medical diagnosis, management and clinical teaching.
Consultant Paediatrician|Oversees specialist medical care for infants, children and adolescents.
Consultant Obstetrician/Gynaecologist|Leads specialist obstetric and gynaecological care.
Consultant General Surgeon|Provides specialist surgical assessment and operations.
Consultant Anaesthetist|Manages anaesthesia, perioperative assessment and resuscitation.
Emergency Medicine Physician|Assesses and stabilises acute illness and trauma.
Intensivist|Leads critical-care assessment and complex organ support.
Psychiatrist|Provides medical psychiatric assessment, treatment and consultation.
Dermatologist|Diagnoses and manages skin conditions.
Cardiologist|Diagnoses and manages cardiovascular disease.
Endocrinologist|Provides specialist management of endocrine disorders.
Nephrologist|Provides specialist assessment and treatment for kidney disease.
Infectious Diseases Physician|Advises on complex infections and antimicrobial management.
Radiologist|Interprets medical imaging and supports imaging-guided care.
Pathologist|Provides laboratory diagnostic interpretation and clinical consultation.
Medical Oncologist|Provides systemic cancer care and multidisciplinary coordination.
Orthopaedic Surgeon|Treats musculoskeletal injuries and surgical conditions.
Urologist|Provides specialist urinary-system and male reproductive care.
`],
['Dental & Oral Health Services','🦷',settings.community,`
Dental Surgeon|Provides dental assessment, prevention, treatment and referral.
Senior Dental Surgeon|Coordinates dental clinical services, complex care and professional oversight.
Community Dental Officer|Supports preventive and outreach dental services where appointed.
Dental Nurse|Assists dental clinicians, infection control, patient preparation and oral health education.
Dental Hygienist|Provides preventive oral-health services and patient education within licensed scope.
Dental Therapist|Provides designated preventive and restorative services where licensed.
Dental Assistant|Supports dental instruments, patient care and clinic preparation.
Dental Laboratory Technician|Produces or repairs dental appliances on approved prescriptions.
Dental Receptionist|Coordinates appointments, patient records and communication.
Oral Health Promotion Coordinator|Organises oral health campaigns and school/community programmes.
`],
['Allied Health, Rehabilitation & Nutrition','🧠',settings.hospital,`
Physiotherapist|Assesses movement and develops rehabilitation plans for functional recovery.
Senior Physiotherapist|Provides advanced rehabilitation and supervises physiotherapy services.
Occupational Therapist|Supports daily living function, adaptations and rehabilitation.
Speech and Language Therapist|Assesses and manages speech, language, communication and swallowing needs.
Audiologist|Assesses hearing and supports hearing rehabilitation and referral.
Dietitian|Provides clinical nutrition assessment and therapeutic meal planning.
Public Health Nutritionist|Supports population nutrition programmes, counselling and surveillance.
Food Service Dietitian|Coordinates nutritional adequacy and clinical meal planning.
Medical Social Worker|Assesses psychosocial needs and coordinates social support and discharge plans.
Rehabilitation Aide|Assists approved rehabilitation activities under supervision.
Prosthetist/Orthotist|Provides limb or orthotic fitting and technical rehabilitation services where available.
Optometrist|Assesses vision and provides optometric care within licensed scope.
Ophthalmic Technician|Assists visual assessment and eye-clinic procedures.
Respiratory Therapist|Provides respiratory support and testing where such services are staffed.
Psychologist|Delivers psychological assessment and interventions within professional scope.
`],
['Mental Health & Psychosocial Services','🫶',settings.community,`
Mental Health Officer|Coordinates assigned community mental-health services and referrals.
Community Mental Health Nurse|Conducts outreach, monitoring and support for mental-health clients.
Clinical Psychologist|Undertakes psychological assessment, formulation and therapeutic interventions.
Counselling Psychologist|Provides counselling and psychological support within authorised scope.
Psychiatric Social Worker|Coordinates psychosocial care and community reintegration.
Substance Use Counsellor|Provides education, screening, counselling and onward referral.
Child and Adolescent Mental Health Clinician|Supports youth assessment, intervention and family engagement.
Mental Health Programme Coordinator|Plans and monitors mental-health programme activities.
Psychosocial Support Worker|Assists basic psychosocial support and referral under supervision.
`],
['Laboratory, Diagnostics & Pharmacy','🔬',settings.hospital,`
Medical Laboratory Technologist|Conducts diagnostic testing, quality controls and laboratory reporting.
Medical Laboratory Technician|Prepares samples and performs authorised diagnostic laboratory procedures.
Phlebotomist|Collects blood specimens safely and maintains identification protocols.
Laboratory Aide|Supports sample handling, equipment preparation and laboratory logistics.
Microbiology Technologist|Performs microbiological testing and quality assurance.
Haematology Technologist|Provides haematology investigations and quality checks.
Histopathology Technician|Prepares tissue specimens for diagnostic examination.
Radiographer|Performs diagnostic imaging examinations and supports radiation safety.
Sonographer|Performs diagnostic ultrasound examinations within training and scope.
ECG Technician|Supports electrocardiography testing and equipment preparation.
Pharmacist|Provides dispensing oversight, medication review and medicines information.
Chief Pharmacist|Manages pharmacy services, medication governance and quality.
Pharmacy Technician|Prepares and processes prescriptions under pharmacist supervision.
Pharmacy Assistant|Supports inventory, labelling and customer services under supervision.
Pharmacy Storekeeper|Maintains stock records, expiry tracking and pharmacy supply logistics.
Medical Equipment Sterilisation Technician|Processes and monitors instrument sterilisation workflows.
`],
['Medical Records, Information & Digital Health','💻',settings.support,`
Medical Records Clerk|Registers and retrieves patient records and ensures filing accuracy.
Medical Records Officer|Oversees health-record handling, information quality and confidentiality.
Health Information Officer|Coordinates health information processing, reporting and data standards.
Health Information Manager|Directs records governance, disclosure processes and service improvement.
Data Entry Clerk|Enters and validates administrative or clinical programme data.
Data Quality Officer|Checks completeness, accuracy and consistency of reported information.
Health Statistician|Produces health-statistics analyses and reporting support.
Medical Coding Officer|Classifies diagnoses and procedures where coding services operate.
ICT Officer|Provides technical support, system access and network coordination.
ICT Helpdesk Technician|Resolves user incidents, devices and service requests.
Systems Administrator|Maintains digital accounts, infrastructure and system operations.
Network Engineer|Supports connectivity, network resilience and troubleshooting.
Health Informatics Officer|Supports digital care/surveillance systems and user training.
Software Support Technician|Maintains software installations, updates and incident workflows.
Information Security Officer|Supports cyber-risk controls, user permissions and confidentiality.
Data Protection Officer|Advises on personal-data governance and compliance responsibilities.
Records Archivist|Manages long-term records retention and controlled disposal.
`],
['Human Resources, Finance & Administration','📊',settings.support,`
Human Resources Officer|Handles staffing administration, recruitment and employment policies.
Human Resources Manager|Oversees workforce planning, HR operations and staff welfare.
Training and Development Officer|Coordinates staff development, training records and programmes.
Payroll Officer|Processes payroll and verifies payment inputs.
Finance Officer|Maintains financial controls, reconciliations and reporting.
Accountant|Prepares accounts, reconciliations and management financial reports.
Accounts Clerk|Processes accounts entries, invoices and supporting documents.
Procurement Officer|Coordinates purchasing, supplier evaluation and procurement compliance.
Purchasing Clerk|Supports quotations, purchase orders and procurement records.
Stores Manager|Oversees receiving, stock movements and inventory control.
Inventory Control Clerk|Maintains stock cards, counts and item movement records.
Administrative Officer|Coordinates correspondence, office procedures and service support.
Executive Secretary|Coordinates schedules, correspondence and senior office administration.
Receptionist|Welcomes visitors, directs service users and manages reception.
Telephone Operator|Routes calls and supports facility communication.
Customer Service Officer|Supports public enquiries, complaints and service communication.
Communications Officer|Manages public information, community messaging and stakeholder notices.
Legal/Compliance Officer|Coordinates regulatory obligations, policy interpretation and legal referrals.
`],
['Patient Support, Facilities & Emergency Operations','🚑',settings.support,`
Orderly|Assists patient movement, preparation, room readiness and non-clinical ward tasks.
Porter|Moves patients, documents and equipment safely throughout healthcare facilities.
Patient Transport Attendant|Supports safe, authorised movement of patients between care locations.
Ambulance Driver|Operates emergency transport vehicles and supports transport safety.
Emergency Medical Technician|Provides prehospital emergency response within certification and duty.
Security Officer|Maintains access control, incident reporting and facility safety.
Housekeeper|Cleans and disinfects healthcare areas following IPC procedures.
Sanitation Worker|Supports waste separation, disposal and environmental cleanliness.
Laundry Attendant|Handles linen processing, infection-control segregation and delivery.
Linen Room Attendant|Receives, issues and monitors clinical linen stock.
Kitchen Assistant|Supports meal preparation, food safety and tray services.
Hospital Cook|Prepares therapeutic and regular meals according to approved menus.
Dietary Aide|Assists distribution of prescribed meals and dietary service routines.
Maintenance Technician|Repairs facilities and coordinates preventive maintenance.
Electrician|Maintains electrical systems and responds to safety concerns.
Plumber|Maintains water, drainage and plumbing infrastructure.
Biomedical Equipment Technician|Inspects and services medical devices under approved procedures.
Facilities Manager|Coordinates site repairs, utilities, waste and environmental readiness.
Groundskeeper|Maintains grounds, outdoor walkways and landscaping.
Disaster Preparedness Officer|Develops and exercises emergency plans and incident response.
Fire Safety Officer|Coordinates fire risk controls, drills and emergency evacuation procedures.
Logistics Coordinator|Manages service supplies and deployment support for clinics and emergencies.
Driver/Transport Officer|Provides approved staff, supplies and programme transport.
Ward Clerk|Supports admissions, ward documentation and patient communication.
Patient Affairs Officer|Supports patient navigation, complaints and service experience.
`]
];
const seen=new Set();
D.roleGroups=groups.map(([name,icon,context,raw])=>{
 const roles=raw.trim().split('\n').map(line=>{const p=line.split('|');return {title:p[0].trim(),summary:p.slice(1).join('|').trim(),setting:context[0],collaborates:context[1],disclaimer:'General functional overview; confirm official post and scope with the relevant authority.'};}).filter(x=>{const k=x.title.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});
 return {name,icon,roles};
});

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
