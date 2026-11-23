/**
 * PRIVATE, OPTIONAL speech-to-text relay. Node 22+ (no extra dependencies).
 * NEVER put OPENAI_API_KEY into the mobile app or public source repository.
 * Set OPENAI_API_KEY and VOICE_API_TOKEN only in the secure server environment.
 */
import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.OPENAI_API_KEY;
const ACCESS = process.env.VOICE_API_TOKEN;
const allowed = (process.env.VOICE_ALLOWED_ORIGINS || 'capacitor://localhost,http://localhost,http://localhost:5173').split(',').map(x=>x.trim());
const MAX_BODY=20*1024*1024;
const recent = new Map();
if (!API_KEY || !ACCESS || ACCESS.length<16) {
  console.error('Set OPENAI_API_KEY and a strong VOICE_API_TOKEN (16+ chars) on the private server.');
  process.exit(1);
}
function safeToken(received=''){
  const a=Buffer.from(String(received));const b=Buffer.from(ACCESS);
  return a.length===b.length && timingSafeEqual(a,b);
}
const send=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));};
createServer(async(req,res)=>{
  const origin=String(req.headers.origin||'');
  if(origin&&allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Voice-Token');
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  }
  if(req.method==='OPTIONS')return origin&&allowed.includes(origin)?send(res,200,{ok:true}):send(res,403,{error:'Origin not allowed'});
  if(req.url!=='/api/transcribe'||req.method!=='POST')return send(res,404,{error:'Not found'});
  if(origin&&!allowed.includes(origin))return send(res,403,{error:'Origin not allowed'});
  if(!safeToken(req.headers['x-voice-token']))return send(res,401,{error:'Unauthorized'});
  const now=Date.now();const hits=(recent.get('user')||[]).filter(t=>now-t<60000);
  if(hits.length>=10)return send(res,429,{error:'Too many requests. Try again shortly.'});
  hits.push(now);recent.set('user',hits);
  if(Number(req.headers['content-length']||0)>MAX_BODY)return send(res,413,{error:'Audio too large'});
  try {
    let size=0;const chunks=[];
    for await(const part of req){size+=part.length;if(size>MAX_BODY)throw new Error('Recording is too large');chunks.push(part);}
    // Parse the browser's multipart FormData with Node's standard Request API.
    const incoming=new Request('http://localhost/api/transcribe',{
      method:'POST',headers:{'content-type':String(req.headers['content-type']||'')},
      body:Buffer.concat(chunks)
    });
    const form=await incoming.formData();
    const audio=form.get('file');
    if(!(audio instanceof Blob)||audio.size<500||audio.size>MAX_BODY) return send(res,400,{error:'Valid recorded audio is required'});
    const forward=new FormData();
    forward.append('model','gpt-transcribe');
    forward.append('file',audio,audio.name||'speech.webm');
    forward.append('prompt','Short grocery shop billing instructions, often code-switching Tamil, Tanglish and Indian English. Return exactly what the customer said, not a calculated bill.');
    const words=String(form.get('keywords')||'').split('\n').map(s=>s.trim().slice(0,70)).filter(Boolean).slice(0,60);
    words.forEach(word=>forward.append('keywords[]',word));
    const result=await fetch('https://api.openai.com/v1/audio/transcriptions',{
      method:'POST',headers:{Authorization:`Bearer ${API_KEY}`},body:forward,signal:AbortSignal.timeout(45000)
    });
    if(!result.ok){console.error('Transcription upstream HTTP',result.status);return send(res,502,{error:'Transcription service unavailable. Try phone recognition.'});}
    const payload=await result.json();
    if(typeof payload.text!=='string')return send(res,502,{error:'No transcript received.'});
    return send(res,200,{text:payload.text.slice(0,10000)});
  }catch(err){console.error('Transcription processing failed:',err.message);return send(res,400,{error:'Could not process audio. Use a shorter recording or phone recognition.'});}
}).listen(PORT,()=>console.log(`Private voice server ready on port ${PORT}`));
