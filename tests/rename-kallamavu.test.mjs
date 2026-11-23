import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import {parseVoiceBill} from '../src/voice-parser.js';

for (const page of ['index.html','billing.html','rates.html']) {
  const html = readFileSync(new URL('../'+page,import.meta.url),'utf8');
  test(`${page} uses the updated Tamil item name and unchanged price`, () => {
    assert.match(html,/name: "கல்லமாவு", unit: "1kg", price: 60/);
    assert.ok(!html.includes('{ name: "கமாவு"'));
    assert.match(html, /"kamavu", "kallamavu", "kalla maavu"/);
  });
  test(`${page} migrates existing price without changing custom items`, () => {
    const start = html.indexOf('function migrateKallaMaavuName(');
    const end = html.indexOf('function '+(page === 'rates.html'?'loadItems':'loadSavedPrices')+'()', start);
    assert.ok(start>=0 && end>start);
    const migrate = vm.runInNewContext(html.slice(start,end)+'; migrateKallaMaavuName');
    const products=[
      {id:'def_6',name:'கமாவு',price:199,unit:'1kg',aliases:['kamavu'],isCustom:false},
      {id:'cust_1',name:'கமாவு',price:100,aliases:['kamavu'],isCustom:true},
      {id:'def_0',name:'மல்லி',price:180,isCustom:false}
    ];
    assert.equal(migrate(products),true);
    assert.equal(products[0].name,'கல்லமாவு');
    assert.equal(products[0].price,199);
    assert.equal(products[0].id,'def_6');
    assert.ok(products[0].aliases.includes('kallamavu'));
    assert.equal(products[1].name,'கமாவு');
    assert.equal(products[2].name,'மல்லி');
    assert.equal(migrate(products),false);
  });
}

test('voice parser recognizes kallamavu and Tamil text',()=>{
  const products=[{name:'கல்லமாவு',price:60,unit:'1kg',aliases:['kamavu','kallamavu','kalla maavu','கல்ல மாவு','gram flour','kadalai maavu']}];
  const english=parseVoiceBill('kallamavu 2 kg',products);
  assert.equal(english.lines.find(x=>x.name==='கல்லமாவு')?.qty,2,JSON.stringify(english));
  const tamil=parseVoiceBill('கல்லமாவு 250 கிராம்',products);
  assert.equal(tamil.lines.find(x=>x.name==='கல்லமாவு')?.qty,0.25,JSON.stringify(tamil));
});
