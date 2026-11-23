import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('GitHub workflow uses current Android SDK setup, packs complete APK build', () => {
  const workflow = readFileSync('.github/workflows/android-apk.yml', 'utf8');
  assert.match(workflow, /^name: Build Malikadai Android APK/m);
  assert.match(workflow, /android-actions\/setup-android@v4/);
  assert.doesNotMatch(workflow, /setup-android@v3|(?:sdkmanager\s+tools)/);
  assert.match(workflow, /platforms;android-35/);
  assert.match(workflow, /build-tools;35\.0\.0/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /push:\n\s+branches: \[main\]/);
  assert.match(workflow, /npx cap add android/);
  assert.match(workflow, /npx cap sync android/);
  assert.match(workflow, /\.\/gradlew assembleDebug/);
  assert.match(workflow, /actions\/upload-artifact@v6/);
  assert.match(workflow, /app-debug\.apk/);
  for (const file of ['package.json','index.html','billing.html','rates.html','public/sw.js','src/mobile-bridge.js','src/voice-parser.js','assets/icon.png','assets/splash.png']) {
    assert.ok(existsSync(file), `${file} missing`);
  }
});

test('original 2.2 receipt generator remains, without compact 2.3 additions', () => {
  for (const filename of ['index.html','billing.html']) {
    const file = readFileSync(filename, 'utf8');
    assert.match(file, /function generatePDF\(\)/);
    assert.match(file, /const pdfWidth = 90;/);
    assert.match(file, /const imgData = canvas\.toDataURL\('image\/jpeg', 0\.80\);/);
    assert.doesNotMatch(file, /compact\.jpg/);
  }
});
