// Bundled dependencies: these work without an internet connection once installed.
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/noto-sans-tamil/400.css';
import '@fontsource/noto-sans-tamil/500.css';
import '@fontsource/noto-sans-tamil/600.css';
import '@fontsource/noto-sans-tamil/700.css';

// Keep the globals used by the user's existing HTML/JavaScript intact.
window.jspdf = { jsPDF };
window.html2canvas = html2canvas;

// On phones, write the PDF to the app cache and open the native share sheet.
// On the browser/PWA, retain the original download behavior.
window.saveBillPDF = async (pdf, requestedFilename) => {
  const filename = (requestedFilename || 'Bill.pdf')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 90);
  if (!Capacitor.isNativePlatform()) {
    pdf.save(filename);
    return;
  }
  const uriData = pdf.output('datauristring');
  const base64 = uriData.substring(uriData.indexOf(',') + 1);
  const saved = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache
  });
  await Share.share({
    title: 'Malikadai Bill',
    text: 'Grocery bill / மளிகை கடை பில்',
    files: [saved.uri],
    dialogTitle: 'Save or share PDF bill'
  });
};

// Use the phone's built-in speech recognition as the no-key/default voice engine.
// This calls native Android/iOS speech services; availability/offline behavior
// depends on the phone's installed recognizer, language packs and settings.
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
window.mobileSpeech = {
  isNative: () => Capacitor.isNativePlatform(),
  async listenOnce(language='ta-IN') {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Native recognizer is available only inside the Android/iOS app.');
    }
    const capability = await SpeechRecognition.available();
    if (!capability.available) throw new Error('Speech recognition is not available on this phone.');
    const permissions = await SpeechRecognition.checkPermissions();
    if (permissions.speechRecognition !== 'granted') {
      const result = await SpeechRecognition.requestPermissions();
      if (result.speechRecognition !== 'granted') {
        throw new Error('Allow microphone and speech recognition permissions in phone settings.');
      }
    }
    const result=await SpeechRecognition.start({
      language, maxResults:3, partialResults:false, popup:true,
      prompt:'Speak items and quantities / பொருட்கள் மற்றும் அளவை சொல்லுங்கள்'
    });
    return (result.matches || [])[0] || '';
  },
  async stop() {
    if (Capacitor.isNativePlatform()) await SpeechRecognition.stop();
  }
};
