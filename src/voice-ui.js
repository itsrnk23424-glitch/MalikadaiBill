import { parseVoiceBill } from './voice-parser.js';

let current=null;
let listening=false;
let recorder=null;
let recordingStream=null;
let webRecognition=null;
let starting=false;
const $=(id)=>document.getElementById(id);

function state(message,active=false){
  $('voiceStatus').textContent=message;
  $('statusText').textContent=message;
  $('statusBadge').classList.toggle('listening', active);
  $('startVoice').textContent=active?'■ நிறுத்து / Stop':'🎙 பேசுங்கள் / Speak';
  const fab=$('fabMic');
  if(fab){fab.classList.toggle('listening',active);fab.setAttribute('aria-label',active?'Stop microphone':'Start voice billing');}
}
function error(message){state('Ready');$('voiceErrors').textContent=message;}
function language(){return $('voiceLanguage').value;}
function engine(){return $('voiceEngine').value;}
function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function reviewTranscript(text){
  listening=false; state('Review before adding to bill');
  $('rawSpeech').value=text;
  current=parseVoiceBill(text,items);
  const wrap=$('voiceReviewRows');
  wrap.replaceChildren();
  current.lines.forEach((line,n)=>{
    const row=document.createElement('div');
    row.className='voice-review-item';
    const label=document.createElement('span');label.textContent=`${line.name} · ₹${line.price}/${line.unit}`;
    const qty=document.createElement('input');qty.type='number';qty.step='0.001';qty.min='0.001';qty.max='10000';qty.inputMode='decimal';qty.value=line.qty;
    qty.setAttribute('aria-label',`${line.name} quantity`);
    qty.addEventListener('input',()=>{current.lines[n].qty=Number(qty.value);});
    row.append(label,qty);wrap.append(row);
  });
  const fields=$('voiceFields');fields.replaceChildren();
  for(const [name,label] of [['customer','Customer'],['oldBalance','Old balance ₹'],['paid','Paid ₹']]){
    if(current.fields[name]===undefined) continue;
    const field=document.createElement('label');field.textContent=label;
    const input=document.createElement('input');input.className='voice-field-input';input.type=name==='customer'?'text':'number';input.value=current.fields[name];
    input.addEventListener('input',()=>{ current.fields[name] = name==='customer'?input.value:Number(input.value); });
    field.append(input); fields.append(field);
  }
  $('voiceErrors').textContent=current.warnings.join('\n');
  $('voiceReview').hidden=false;
  $('applyVoice').disabled=!current.lines.length && !Object.keys(current.fields).length;
  $('dictationText').textContent=text||'Nothing was recognized. You can type instead.';
  $('voiceReview').scrollIntoView({block:'nearest',behavior:'smooth'});
}

async function webListenOnce(){
  const Recognizer=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognizer) throw new Error('This browser has no speech recognition. Use the installed app or type your command.');
  return await new Promise((resolve,reject)=>{
    const api=new Recognizer();webRecognition=api;
    api.lang=language();api.interimResults=false;api.continuous=false;api.maxAlternatives=3;
    let result='';let failure=null;
    api.onresult=(ev)=>{result=Array.from(ev.results).map(r=>r[0]?.transcript||'').join(' ');};
    api.onerror=(ev)=>{failure=new Error('Voice recognition: '+ev.error);};
    api.onend=()=>{webRecognition=null;failure?reject(failure):resolve(result);};
    try{api.start();}catch(e){webRecognition=null;reject(e);}
  });
}

async function cloudRecording(){
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){throw new Error('Audio recording is not supported on this phone/browser.');}
  const backend=$('voiceServer').value.trim();
  if(!/^https:\/\//i.test(backend)){throw new Error('Advanced AI requires a configured HTTPS server URL. See ADVANCED_VOICE_SETUP.md.');}
  const token=$('voiceToken').value.trim();
  if(!token)throw new Error('Enter your private server access token.');
  recordingStream=await navigator.mediaDevices.getUserMedia({audio:true});
  const supported=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  recorder=new MediaRecorder(recordingStream,supported?{mimeType:supported}:undefined);
  const chunks=[];
  recorder.ondataavailable=(ev)=>{if(ev.data.size)chunks.push(ev.data);};
  recorder.onstop=async()=>{
    recordingStream?.getTracks().forEach(t=>t.stop());recordingStream=null;
    const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
    recorder=null;state('AI transcription in progress…');
    try {
      if(blob.size<500) throw new Error('No audio was recorded.');
      if(blob.size>20*1024*1024) throw new Error('Recording too large; speak in shorter parts.');
      const form=new FormData();form.append('file',blob,blob.type.includes('mp4')?'speech.m4a':'speech.webm');
      form.append('language',language());
      form.append('keywords',items.flatMap(it=>[it.name,...(it.aliases||[])]).slice(0,100).join('\n'));
      const response=await fetch(backend.replace(/\/$/,'')+'/api/transcribe',{
        method:'POST',headers:{'x-voice-token':token},body:form
      });
      const result=await response.json();
      if(!response.ok||!result.text)throw new Error(result.error||`Server returned ${response.status}`);
      reviewTranscript(result.text);
    }catch(e){error(e.message||String(e));}
  };
  recorder.start(); listening=true;state('Recording for advanced AI… tap Stop',true);
}

async function start(){
  if(starting && listening && window.mobileSpeech?.isNative()) {
    try {await window.mobileSpeech.stop();}catch{}
    state('Stopped');
    return;
  }
  if(starting)return;
  if(listening){
    if(recorder?.state==='recording'){ recorder.stop();listening=false;return; }
    if(webRecognition){webRecognition.stop();return;}
    if(window.mobileSpeech?.isNative()) { await window.mobileSpeech.stop().catch(()=>{}); listening=false;state('Stopped'); return; }
  }
  $('voiceErrors').textContent='';
  if(engine()==='advanced') {try{await cloudRecording();}catch(e){error(e.message||String(e));}return;}
  starting=true; listening=true; state('Listening… speak clearly',true);
  try{
    const text=window.mobileSpeech?.isNative()?await window.mobileSpeech.listenOnce(language()):await webListenOnce();
    if(text?.trim())reviewTranscript(text.trim());
    else{state('Ready');$('voiceErrors').textContent='No speech recognized. Try again or type a command.';}
  }catch(e){error(e.message||String(e));}
  finally{starting=false;listening=false;if(!$('voiceReview').hidden)state('Review before adding to bill');else state('Ready');}
}

function apply(){
  if(!current)return;
  for(const line of current.lines){
    if(!Number.isFinite(line.qty)||line.qty<=0||line.qty>10000){error('Please correct all quantities before applying.');return;}
    if(line.index<0||line.index>=items.length)continue;
  }
  for(const line of current.lines) quantities[line.index]=line.qty;
  if(current.fields.customer!==undefined) $('custName').value=current.fields.customer;
  if(Number.isFinite(current.fields.paid)&&current.fields.paid>=0)$('amountGiven').value=current.fields.paid;
  if(Number.isFinite(current.fields.oldBalance)&&current.fields.oldBalance>=0)$('oldBalance').value=current.fields.oldBalance;
  renderItems($('searchBox').value);
  $('voiceReview').hidden=true;
  const parts=current.lines.length;
  const msg=`Applied ${parts} item(s) to bill. Review total before PDF.`;
  $('dictationText').textContent=msg;
  state(msg);
  if(window.speechSynthesis && $('voiceSpeakBack').checked){
    speechSynthesis.cancel();const read=new SpeechSynthesisUtterance(language()==='ta-IN'?`பில் சேர்க்கப்பட்டது. மொத்தம் ${$('mobileGrandTotal').textContent} ரூபாய்`:msg);
    read.lang=language();speechSynthesis.speak(read);
  }
  current=null;
}

$('startVoice').addEventListener('click',start);
$('manualVoice').addEventListener('click',()=>reviewTranscript('')); 
$('applyVoice').addEventListener('click',apply);
$('reparseVoice').addEventListener('click',()=>reviewTranscript($('rawSpeech').value));
$('cancelVoice').addEventListener('click',()=>{$('voiceReview').hidden=true;current=null;state('Ready');});
$('voiceEngine').addEventListener('change',()=>{$('advancedOptions').hidden=engine()!=='advanced';});
$('voiceLanguage').addEventListener('change',()=>{try{voiceLang=language();}catch{}});
$('fabMic').setAttribute('aria-label','Voice bill');
$('fabMic').setAttribute('title','Voice bill');
window.toggleVoice=start;
window.addEventListener('beforeunload',()=>recordingStream?.getTracks().forEach(t=>t.stop()));
