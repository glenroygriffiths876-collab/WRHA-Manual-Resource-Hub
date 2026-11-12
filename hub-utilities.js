/* WAPS-inspired Feedback / Report Issue / Share.
 * WRHA styling and privacy safeguards. No backend or account needed.
 * Drafts are passed to WhatsApp only after an explicit user action.
 */
(function(){'use strict';
const SHARE_URL='https://glenroygriffiths876-collab.github.io/WRHA-Manual-Resource-Hub/#home';
const WHATSAPP_NUMBER='18765029756'; // Jamaica: +1 876 502 9756
const $=id=>document.getElementById(id);
const feedback=$('hubFeedbackDialog'),share=$('hubShareDialog');
if(!feedback||!share)return;
const pageNames={home:'Overview',manuals:'Manual Library',legislation:'Health Legislation',facilities:'Health Centres',training:'Training Academy',roles:'Verified Healthcare Positions',about:'About the Hub'};
const feedbackTypes=['Suggestion / new idea','Content correction','Missing manual or legislation','Health-centre information correction','Accessibility or readability','Something could be easier to use','Other feedback'];
const issueTypes=['PDF not opening or downloading unexpectedly','Broken link or missing document','Search or filter not working','Layout or display issue','Incorrect role title or classification','Incorrect or outdated information','Other technical issue'];
let pendingContext=null,mode='feedback';
function closeIfOpen(el){if(el.open)el.close()}
function currentContext(){
 const route=(location.hash||'#home').replace(/^#/,'').split(/[?&]/)[0]||'home';
 const name=pageNames[route]||'WRHA Resource Hub';
 const doc=$('pdfDialog');
 const role=$('roleDialog');
 const file=doc?.open?$('pdfTitle')?.textContent.trim():'';
 const job=role?.open?$('roleTitle')?.textContent.trim():'';
 const extra=file?'PDF: '+file:job?'Role: '+job:'';
 const screen=extra?name+' → '+extra:name;
 const standalone=window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
 const width=Math.round(window.innerWidth),height=Math.round(window.innerHeight);
 return {
  section:name,screen,route,url:location.href,
  screenSize:width+' × '+height,
  orientation:window.matchMedia?.('(orientation: landscape)').matches?'Landscape':'Portrait',
  mode:standalone?'Installed app':'Web browser',
  connectivity:navigator.onLine===false?'Offline':'Online',
  platform:navigator.userAgentData?.platform||navigator.platform||'Unknown',
  browser:(navigator.userAgent||'Unknown').slice(0,200),
  time:new Date().toLocaleString('en-JM'),
  documentPage:file?($('pdfPage')?.value||'1'):null
 };
}
function fillOptions(options,preferred){
 const select=$('hubFeedbackType');select.replaceChildren();
 options.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;select.appendChild(option)});
 if(preferred&&options.includes(preferred))select.value=preferred;
}
function openFeedback(nextMode='feedback',category=null){
 closeIfOpen(share);
 mode=nextMode==='issue'?'issue':'feedback';
 pendingContext=currentContext();
 $('hubFeedbackTitle').textContent=mode==='issue'?'Report an issue':'Share feedback';
 $('hubFeedbackLead').textContent=mode==='issue'?
  'Tell us what is not working so we can investigate the correct section.':
  'Share an idea, correction or improvement for the WRHA Hub.';
 $('hubFeedbackScreen').textContent=pendingContext.screen;
 fillOptions(mode==='issue'?issueTypes:feedbackTypes,category);
 $('hubFeedbackMessage').value='';
 $('hubFeedbackResult').hidden=true;
 $('hubWhatsAppFallback').removeAttribute('href');
 if(!feedback.open)feedback.showModal();
 $('hubFeedbackType').focus();
}
function whatsappMessage(){
 const c=pendingContext||currentContext();
 const content=$('hubFeedbackMessage').value.trim();
 const kind=$('hubFeedbackType').value;
 const lines=[
  mode==='issue'?'*WRHA RESOURCE HUB — ISSUE REPORT*':'*WRHA RESOURCE HUB — PAGE FEEDBACK*','',
  '*Section:* '+c.section,
  '*Screen:* '+c.screen,
  '*Category:* '+kind,
  mode==='issue'?'*Problem:* '+content:'*Feedback:* '+content,
  '',
  '*Technical context*',
  'Page: '+c.url,
  ...(c.documentPage?['PDF page: '+c.documentPage]:[]),
  'Screen size: '+c.screenSize+' · '+c.orientation,
  'Mode: '+c.mode+' · '+c.connectivity,
  'Platform: '+c.platform,
  'Browser: '+c.browser,
  'Time: '+c.time,
  '',
  '_Please attach a screenshot in WhatsApp if helpful. Do not share confidential patient information._'
 ];
 return lines.join('\n');
}
function sendFeedback(event){
 event.preventDefault();
 const message=$('hubFeedbackMessage').value.trim();
 if(!message){$('hubFeedbackMessage').setCustomValidity('Please describe your feedback or issue.');$('hubFeedbackMessage').reportValidity();$('hubFeedbackMessage').focus();return}
 $('hubFeedbackMessage').setCustomValidity('');
 const url='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(whatsappMessage());
 const link=$('hubWhatsAppFallback');
 link.href=url;
 link.target='_blank';link.rel='noopener noreferrer';
 $('hubFeedbackResult').hidden=false;
 // Open a compose window in direct response to the form's submit click.
 // This prepares a message; the user decides whether to press Send in WhatsApp.
 try{window.open(url,'_blank','noopener,noreferrer')}catch(error){/* The visible fallback remains available. */}
}
function openShare(){
 closeIfOpen(feedback);
 $('hubShareUrl').value=SHARE_URL;
 $('hubShareStatus').textContent='Share the official hub link or show its QR code.';
 $('hubShareChoices').hidden=false;
 $('hubQrPanel').hidden=true;
 if(!share.open)share.showModal();
 $('hubNativeShare').focus();
}
function showQr(){
 $('hubShareChoices').hidden=true;$('hubQrPanel').hidden=false;
 $('hubShareStatus').textContent='Scan this code to open the WRHA Manual & Resource Hub home page.';
 $('hubQrBack').focus();
}
function backToShare(){
 $('hubShareChoices').hidden=false;$('hubQrPanel').hidden=true;
 $('hubShareStatus').textContent='Choose how you would like to share the hub.';
 $('hubShowQr').focus();
}
async function copyLink(){
 const field=$('hubShareUrl');
 try{
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(SHARE_URL);$('hubShareStatus').textContent='WRHA Hub link copied ✓';return true}
 }catch(error){/* Try browser copy fallback. */}
 field.focus();field.select();field.setSelectionRange(0,field.value.length);
 let copied=false;
 try{copied=typeof document.execCommand==='function'&&document.execCommand('copy')}catch(error){}
 $('hubShareStatus').textContent=copied?'WRHA Hub link copied ✓':'Select the highlighted link and use Copy on your device.';
 return copied;
}
async function nativeShare(){
 const payload={title:'WRHA Manual & Resource Hub',text:'Explore Jamaican health manuals, legislation, training, health centres and verified healthcare positions.',url:SHARE_URL};
 if(navigator.share){
  try{await navigator.share(payload);$('hubShareStatus').textContent='Sharing options opened.';return}
  catch(e){if(e?.name==='AbortError'){ $('hubShareStatus').textContent='Sharing cancelled.';return}}
 }
 await copyLink();
}
function closeDialog(button){const dialog=button.closest('dialog');if(dialog?.open)dialog.close()}
$('hubFeedbackFab').addEventListener('click',()=>openFeedback('feedback'));
$('hubIssueFab').addEventListener('click',()=>openFeedback('issue'));
$('hubShareFab').addEventListener('click',openShare);
$('hubPdfReportIssue')?.addEventListener('click',()=>openFeedback('issue','PDF not opening or downloading unexpectedly'));
$('hubFeedbackMessage').addEventListener('input',()=>{$('hubFeedbackMessage').setCustomValidity('');$('hubFeedbackResult').hidden=true});
$('hubFeedbackType').addEventListener('change',()=>{$('hubFeedbackResult').hidden=true});
$('hubFeedbackForm').addEventListener('submit',sendFeedback);
$('hubNativeShare').addEventListener('click',nativeShare);
$('hubCopyLink').addEventListener('click',copyLink);
$('hubCopyLinkInline').addEventListener('click',copyLink);
$('hubShowQr').addEventListener('click',showQr);
$('hubQrBack').addEventListener('click',backToShare);
const qr=$('hubQrImage');
qr.addEventListener('error',()=>{qr.hidden=true;$('hubQrUnavailable').hidden=false;$('hubDownloadQr').hidden=true;$('hubShareStatus').textContent='QR image unavailable. Please copy the official link instead.'});
qr.addEventListener('load',()=>{qr.hidden=false;$('hubQrUnavailable').hidden=true;$('hubDownloadQr').hidden=false});
document.querySelectorAll('[data-hub-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(button)));
[feedback,share].forEach(dialog=>dialog.addEventListener('click',event=>{
 if(event.target===dialog)dialog.close();
}));
window.WRHA_HUB_UTILITIES={shareUrl:SHARE_URL,phone:WHATSAPP_NUMBER,openFeedback,openShare}; // Read-only integration reference.
})();