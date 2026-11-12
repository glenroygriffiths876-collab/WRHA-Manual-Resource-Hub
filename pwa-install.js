/* WRHA Hub installable PWA — adapted from WAPS's native-install + device-help flow.
 * Browser must approve installation; the site cannot silently install an app.
 */
(function(){'use strict';
const $=id=>document.getElementById(id);
const button=$('hubInstallFab'),dialog=$('hubInstallDialog');
if(!button||!dialog)return;
let deferredPrompt=null,justInstalled=false;
const standalone=()=>window.matchMedia?.('(display-mode: standalone)').matches===true||navigator.standalone===true;
const isIOS=()=>/iPad|iPhone|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isSamsung=()=>/SamsungBrowser/i.test(navigator.userAgent);
const isAndroid=()=>/Android/i.test(navigator.userAgent);
const isFirefox=()=>/Firefox|FxiOS/i.test(navigator.userAgent);
function isInstalled(){return standalone()||justInstalled}
function syncInstallButton(){
 const installed=isInstalled();
 button.hidden=installed;
 button.setAttribute('aria-hidden',String(installed));
 if(installed&&dialog.open)dialog.close();
}
function setSteps(steps){
 const el=$('hubInstallSteps');el.replaceChildren();
 steps.forEach(([title,description],index)=>{
  const row=document.createElement('div');row.className='hub-install-step';
  const number=document.createElement('span');number.className='hub-install-step-num';number.textContent=String(index+1);
  const body=document.createElement('div');const strong=document.createElement('strong');strong.textContent=title;
  const detail=document.createElement('small');detail.textContent=description;
  body.append(strong,detail);row.append(number,body);el.appendChild(row);
 });
}
function openInstallHelp(message=''){
 if(isInstalled()){syncInstallButton();return;}
 const now=$('hubInstallNow');
 let steps,title='Install WRHA Hub',browserNote='The browser controls whether an install prompt is available.';
 if(isIOS()){
  title='Add WRHA Hub on iPhone or iPad';
  steps=[['Open this page in Safari','If using another browser, open the WRHA Hub link in Safari first.'],
   ['Tap Share','In Safari tap the Share icon (square with upward arrow).'],
   ['Add to Home Screen','Scroll the Share options and tap Add to Home Screen, then Add.']];
  browserNote='iOS uses the Safari Share menu rather than the Android Install prompt.';
 }else if(isSamsung()){
  title='Install WRHA Hub in Samsung Internet';
  steps=[['Open the browser menu','Tap the Samsung Internet menu (☰).'],
   ['Choose Add page to','Select Add page to, then Home screen (or Install app if offered).'],
   ['Confirm','Approve the home-screen icon named WRHA Hub.']];
 }else if(isAndroid()){
  title='Install WRHA Hub on Android';
  steps=[['Open the browser menu','Tap the browser menu (⋮) if an Install prompt did not appear.'],
   ['Choose Install app','Select Install app or Add to Home screen.'],
   ['Confirm','Approve installation. WRHA Hub will appear among your apps or on your home screen.']];
 }else if(isFirefox()){
  title='Add WRHA Hub to your device';
  steps=[['Open the browser menu','Find Add to Home Screen or an install option, if available.'],
   ['Confirm','Some Firefox desktop versions do not support app installation; use Chrome or Edge if necessary.']];
 }else{
  title='Install WRHA Hub on your computer';
  steps=[['Check the address bar','Look for the Install icon in Chrome or Edge, or open the browser menu.'],
   ['Install this site','Choose Install WRHA Hub or Apps → Install this site as an app.'],
   ['Confirm','Approve the browser prompt; the hub can open in a separate app window.']];
 }
 $('hubInstallTitle').textContent=title;
 $('hubInstallLead').textContent=message||'Add the WRHA Manual & Resource Hub with its own official WRHA logo icon for quick, app-like access.';
 setSteps(steps);
 $('hubInstallBrowserNote').textContent=browserNote;
 now.hidden=!deferredPrompt;
 if(!dialog.open)dialog.showModal();
}
async function beginInstall(){
 if(isInstalled()){syncInstallButton();return;}
 if(!deferredPrompt){openInstallHelp();return;}
 const prompt=deferredPrompt;
 deferredPrompt=null;
 try{
  // Prompt is initiated by the actual click; no silent or background installation.
  await prompt.prompt();
  const choice=await prompt.userChoice;
  if(choice?.outcome==='accepted'){
   if(!dialog.open)dialog.showModal();
   $('hubInstallTitle').textContent='Installation accepted';
   $('hubInstallLead').textContent='Your browser is preparing WRHA Hub. Complete any confirmation on your device, then look for its WRHA icon.';
   $('hubInstallNow').hidden=true;
   $('hubInstallBrowserNote').textContent='The installation is confirmed only when the browser finishes adding the app.';
  }else{
   openInstallHelp('Installation was not completed. You can use the browser menu instructions below.');
  }
 }catch(error){
  openInstallHelp('The browser could not show the install prompt. Follow the steps below to add WRHA Hub manually.');
 }
}
button.addEventListener('click',()=>{if(deferredPrompt)beginInstall();else openInstallHelp()});
$('hubInstallNow').addEventListener('click',beginInstall);
$('hubCloseInstall').addEventListener('click',()=>dialog.close());
$('hubInstallDone').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();deferredPrompt=event;syncInstallButton();
});
window.addEventListener('appinstalled',()=>{
 deferredPrompt=null;justInstalled=true;syncInstallButton();
});
try{const mq=window.matchMedia?.('(display-mode: standalone)');mq?.addEventListener?.('change',syncInstallButton)}catch(error){/* Older Safari */ }
function syncConnectivity(){
 const banner=$('hubOfflineBanner');
 if(banner)banner.hidden=navigator.onLine!==false;
}
window.addEventListener('online',syncConnectivity);
window.addEventListener('offline',syncConnectivity);
syncConnectivity();syncInstallButton();
// GitHub Pages serves under /WRHA-Manual-Resource-Hub/; relative SW scope is intentional.
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})
   .then(reg=>reg.update().catch(()=>{}))
   .catch(()=>{/* Browser may block service workers; manual home-screen option still works. */});
 },{once:true});
}
window.WRHA_PWA={installed:isInstalled,openInstallHelp,shareHome:'https://glenroygriffiths876-collab.github.io/WRHA-Manual-Resource-Hub/#home'};
})();
