import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import {parseVoiceBill} from '../src/voice-parser.js';
const old='மிதூள்';
const updated='மிளகாய்த்தூள்';
for (const page of ['index.html','billing.html','rates.html']) {
  const html=readFileSync(new URL('../'+page, import.meta.url),'utf8');
  test(page+' includes the new product name, correct price and old voice alias',()=>{
    assert.match(html,/name: "மிளகாய்த்தூள்", unit: "1kg", price: 240/);
    assert.ok(!html.includes('{ name: "மிதூள்"'));
    assert.match(html,/"mithool", "milagaithul"/);
  });
  test(page+' migrates old saved names without changing price',()=>{
    const start=html.indexOf('function migrateMilagaiThoolName(');
    const end=html.indexOf('function '+(page==='rates.html'?'loadItems':'loadSavedPrices')+'()',start);
    assert.ok(start>=0&&end>start);
    const migrate=vm.runInNewContext(html.slice(start,end)+'; migrateMilagaiThoolName');
    const data=[{id:'def_2',name:old,price:999,unit:'1kg',aliases:['mithool'],isCustom:false},{id:'def_1',name:'மிளகாய்',price:280,aliases:['milagai','milagai thool'],isCustom:false}];
    assert.equal(migrate(data),true);
    assert.equal(data[0].name,updated);
    assert.equal(data[0].price,999);
    assert.ok(data[0].aliases.includes('milagai thool'));
    assert.ok(!data[1].aliases.includes('milagai thool'));
    assert.equal(migrate(data),false);
  });
}
test('voice parser identifies milagai thool as powder, not whole chilli',()=>{
  const items=[
    {name:'மிளகாய்',price:280,unit:'1kg',aliases:['milagai','chilli','red chilli']},
    {name:'மிளகாய்த்தூள்',price:240,unit:'1kg',aliases:['mithool','milagaithul','milagai thul','milagai thool','மிளகாய் தூள்','chilli powder','milagai podi']}
  ];
  const r=parseVoiceBill('milagai thool 2 kg',items);
  assert.ok(r.lines.some(l=>l.name==='மிளகாய்த்தூள்' && l.qty===2),JSON.stringify(r));
  assert.ok(!r.lines.some(l=>l.name==='மிளகாய்' && l.qty>0));
});
