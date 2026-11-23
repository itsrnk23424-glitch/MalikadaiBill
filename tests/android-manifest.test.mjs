import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// The generated native AndroidManifest must remain valid and have one permission
// and one visibility declaration even if the build step runs twice.
test('Android microphone permission and speech service visibility are idempotent', () => {
  const temp=mkdtempSync(join(tmpdir(),'malikadai-android-'));
  const file=join(temp,'AndroidManifest.xml');
  try {
    writeFileSync(file, `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:label="Malikadai Bill"><activity android:name=".MainActivity" /></application>
  <uses-permission android:name="android.permission.INTERNET" />
</manifest>`);
    for (let i=0;i<2;i++) {
      const result=spawnSync(process.execPath,['scripts/prepare-android-manifest.mjs',file],{encoding:'utf8'});
      assert.equal(result.status,0,result.stderr);
    }
    const contents=readFileSync(file,'utf8');
    assert.equal((contents.match(/android\.permission\.RECORD_AUDIO/g)||[]).length,1);
    assert.equal((contents.match(/android\.speech\.RecognitionService/g)||[]).length,1);
    assert.ok(contents.indexOf('<queries>') < contents.indexOf('<application'));
    assert.ok(contents.includes('<activity android:name=".MainActivity" />'));
  } finally {
    rmSync(temp,{recursive:true,force:true});
  }
});
