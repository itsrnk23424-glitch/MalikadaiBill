import assert from 'node:assert/strict';
import test from 'node:test';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {once} from 'node:events';

async function freePort() {
  const server=createServer();
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const port=server.address().port;
  await new Promise(resolve=>server.close(resolve));
  return port;
}
async function service() {
  const port=await freePort();
  const proc=spawn(process.execPath,['server/transcription-server.mjs'],{
    cwd:new URL('../',import.meta.url),
    env:{...process.env,PORT:String(port),OPENAI_API_KEY:'dummy-test-key',VOICE_API_TOKEN:'very-long-private-token',VOICE_ALLOWED_ORIGINS:'capacitor://localhost,http://localhost'},
    stdio:['ignore','pipe','pipe']
  });
  let buffer='';
  const ready=new Promise((resolve,reject)=>{
    proc.stdout.on('data',data=>{buffer+=String(data);if(buffer.includes('Private voice server ready'))resolve();});
    proc.once('error',reject);
    proc.once('exit',code=>reject(new Error(`Server exited unexpectedly (${code})`)));
    setTimeout(()=>reject(new Error('Server did not start')),5000).unref();
  });
  await ready;
  return {proc,url:`http://127.0.0.1:${port}`};
}

test('private AI relay: unauthorized, CORS, and malformed uploads are rejected',async()=>{
  const {proc,url}=await service();
  try {
    const unauthorized=await fetch(url+'/api/transcribe',{method:'POST'});
    assert.equal(unauthorized.status,401);
    const badOrigin=await fetch(url+'/api/transcribe',{method:'POST',headers:{origin:'https://attacker.invalid','x-voice-token':'very-long-private-token'}});
    assert.equal(badOrigin.status,403);
    const preflight=await fetch(url+'/api/transcribe',{method:'OPTIONS',headers:{origin:'capacitor://localhost'}});
    assert.equal(preflight.status,200);
    assert.equal(preflight.headers.get('access-control-allow-origin'),'capacitor://localhost');
    const invalid=await fetch(url+'/api/transcribe',{method:'POST',headers:{'x-voice-token':'very-long-private-token','content-type':'application/json'},body:'{}'});
    assert.equal(invalid.status,400);
  } finally {proc.kill('SIGTERM');}
});
