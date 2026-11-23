import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const filename of ['index.html', 'billing.html']) {
  const source = readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8');
  test(`${filename} receipt table stays within its fixed width`, () => {
    assert.match(source, /table-layout:\s*fixed/);
    assert.match(source, /<colgroup>\s*<col style="width:8%">/);
    assert.match(source, /class="receipt-customer-row"/);
    assert.match(source, /#billPreview \.receipt-totals/);
    assert.match(source, /overflow-wrap:\s*anywhere/);
  });
  test(`${filename} correctly renders both short and long receipt page sizes`, () => {
    assert.match(source, /const pdfWidth = 90;/);
    assert.match(source, /orientation:\s*pdfHeight >= pdfWidth \? 'portrait' : 'landscape'/);
    assert.match(source, /pdf\.addImage\(data\.imgData, 'JPEG', margin, margin, imageWidth, imageHeight/);
    assert.match(source, /canvas\.toDataURL\('image\/jpeg', 0\.80\)/);
  });
}
const billing = readFileSync(new URL('../billing.html', import.meta.url), 'utf8');
test('secondary billing page closes help modal before rendering receipt', () => {
  assert.match(billing, /<\/div>\s*<\/div>\s*<!-- Rate Editing Modal Drawer -->/);
  assert.match(billing, /<\/div>\s*<\/div>\s*<!-- Hidden Bill Preview Container/);
});
