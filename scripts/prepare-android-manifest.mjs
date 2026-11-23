/**
 * Add Android microphone permission and package visibility for the OS recognition
 * service. Android 11+ limits visibility of installed recognition services.
 * Safe and repeatable: this script modifies only the generated native manifest.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const manifestPath = resolve(process.argv[2] || 'android/app/src/main/AndroidManifest.xml');
let contents = readFileSync(manifestPath, 'utf8');
if (!contents.includes('<manifest')) throw new Error('AndroidManifest.xml is not a manifest');
if (!contents.includes('android.permission.RECORD_AUDIO')) {
  contents = contents.replace(/<application\b/, '<uses-permission android:name="android.permission.RECORD_AUDIO" />\n    <application');
}
if (!contents.includes('android.speech.RecognitionService')) {
  const addition = `    <queries>\n        <intent>\n            <action android:name="android.speech.RecognitionService" />\n        </intent>\n    </queries>\n`;
  contents = contents.replace(/<application\b/, addition + '    <application');
}
if (!contents.includes('android.permission.RECORD_AUDIO') || !contents.includes('android.speech.RecognitionService')) {
  throw new Error('Android voice configuration was not applied');
}
writeFileSync(manifestPath, contents);
console.log('Android microphone permission and speech-recognition service visibility verified.');
