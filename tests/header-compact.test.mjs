import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for (const name of ['index.html','billing.html']) {
  const html = readFileSync(new URL('../'+name,import.meta.url),'utf8');
  const header = html.match(/<header class="app-bar">([\s\S]*?)<\/header>/)?.[1];
  test(`${name}: no redundant Tamil top header rate button; all other controls remain`,()=>{
    assert.ok(header, 'Header missing');
    assert.doesNotMatch(header, /header-manage-btn|விலை & பொருள்|href="rates.html"/);
    assert.match(header, /class="header-pdf-btn"/);
    assert.match(header, /id="langIconBtn"/);
    assert.match(header, /id="ttsIconBtn"/);
    assert.match(header, /openHelpModal\(\)/);
    assert.match(html, /class="btn-manage-rates-hero"/); // retain management from main screen
    assert.match(html, /class="btn-rate-mobile"/); // retain management from footer
  });
  test(`${name}: compact right-aligned mobile header, footer controls are still medium`,()=>{
    assert.match(html, /\.app-bar \{ flex-wrap: nowrap; gap: 8px/);
    assert.match(html, /\.header-actions \{ width: auto; margin-left: auto; flex: 0 0 auto; justify-content: flex-end/);
    assert.match(html, /\.btn-pdf-mobile, \.btn-rate-mobile \{ padding: 8px 6px; font-size: 11px; min-height: 44px/);
    assert.match(html, /id="billPreviewDialog"/);
    assert.match(html, /--primary: #2563eb/);
  });
}
