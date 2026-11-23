import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

for (const f of ['index.html', 'billing.html']) {
  const html = readFileSync(new URL('../'+f,import.meta.url),'utf8');
  test(`${f} renders bill preview before saving`, () => {
    assert.match(html, /id="billPreviewDialog"/);
    assert.match(html, /id="billPreviewImage"/);
    assert.match(html, /function closeBillPreview\(\)/);
    assert.match(html, /function downloadPreviewBill\(\)/);
    assert.match(html, /onclick="downloadPreviewBill\(\)"/);
    assert.match(html, /const requestId = \+\+billPreviewRequestId/);
    assert.match(html, /imgData: canvas\.toDataURL\('image\/jpeg', 0\.80\)/);
    assert.match(html, /pdf\.addImage\(data\.imgData, 'JPEG'/);
    assert.match(html, /await window\.saveBillPDF\(pdf,/);
    assert.match(html, /confirm\.disabled = false/);
    assert.match(html, /role="dialog" aria-modal="true"/);
  });
  test(`${f} has blue accent, without purple gradients`, () => {
    assert.match(html, /--primary: #2563eb/);
    assert.match(html, /--primary-gradient: linear-gradient\(135deg, #2563eb 0%, #0284c7 100%\)/);
    assert.doesNotMatch(html, /#4f46e5|#7c3aed|#4338ca/);
  });
}
const rateHtml=readFileSync(new URL('../rates.html',import.meta.url),'utf8');
test('rate editor uses blue main color',()=>{
  assert.match(rateHtml, /--primary: #2563eb/);
  assert.doesNotMatch(rateHtml, /#4f46e5|#7c3aed/);
});
const manifest=readFileSync(new URL('../public/manifest.json',import.meta.url),'utf8');
test('installed PWA uses blue theme',()=>assert.match(manifest, /"theme_color": "#2563eb"/));
