import assert from 'node:assert/strict';
import test from 'node:test';
import {parseVoiceBill} from '../src/voice-parser.js';
const items=[
  {name:'மல்லி',unit:'1kg',price:180,aliases:['malli','coriander']},
  {name:'சிக்கன்',unit:'1kg',price:325,aliases:['chicken']},
  {name:'சீரகம்',unit:'1kg',price:360,aliases:['seeragam','jeera']},
  {name:'சோப்பு',unit:'1ps',price:10,aliases:['soap']},
  {name:'மஞ்சள்',unit:'500g',price:60,aliases:['manjal','turmeric']},
  {name:'தக்காளி',unit:'1ps',price:40,aliases:['tomato']}
];
const parsed=(s)=>parseVoiceBill(s,items);
const qty=(r,n)=>r.lines.find(l=>l.name===n)?.qty;
test('Tamil full bill with multiple products and payment',()=>{
  const r=parsed('மல்லி 2 கிலோ சிக்கன் ஒன்றரை கிலோ சீரகம் 250 கிராம் பெயர் குமார் வரவு 500');
  assert.equal(qty(r,'மல்லி'),2);
  assert.equal(qty(r,'சிக்கன்'),1.5);
  assert.equal(qty(r,'சீரகம்'),0.25);
  assert.equal(r.fields.paid,500);
  assert.equal(r.fields.customer,'குமார்');
});
test('Tanglish spoken quantities and piece products',()=>{
  const r=parsed('malli half kilo, jeera 250 grams, soap 3 pieces, paid 1000');
  assert.equal(qty(r,'மல்லி'),0.5);
  assert.equal(qty(r,'சீரகம்'),0.25);
  assert.equal(qty(r,'சோப்பு'),3);
  assert.equal(r.fields.paid,1000);
});
test('quantity before item and Tamil numerals',()=>{
  const r=parsed('500 கிராம் மல்லி, சிக்கன் ௨ கிலோ');
  assert.equal(qty(r,'மல்லி'),0.5);
  assert.equal(qty(r,'சிக்கன்'),2);
});
test('normalizes weight against rate basis',()=>{
  const r=parsed('manjal 250g');
  assert.equal(qty(r,'மஞ்சள்'),0.5); // 250g is half of the priced 500g unit
});
test('no hallucinated item or quantity',()=>{
  const r=parsed('nonexistent item seventy rupees');
  assert.equal(r.lines.length,0);
  assert.ok(r.warnings.length>0);
});
test('reject quantity-less item',()=>{
  const r=parsed('chicken');
  assert.equal(r.lines.length,0);
  assert.match(r.warnings[0],/Quantity/);
});
test('repeat item is not silently added twice',()=>{
  const r=parsed('malli 2 kg malli 3 kg');
  assert.equal(r.lines.length,1);
  assert.ok(r.warnings.some(w=>/repeated/i.test(w)));
});
test('old balance and paid amounts do not appear as quantities',()=>{
  const r=parsed('old balance 300, paid 200, malli half kg');
  assert.equal(qty(r,'மல்லி'),0.5);
  assert.equal(r.fields.oldBalance,300);
  assert.equal(r.fields.paid,200);
});
test('products with similar aliases are flagged rather than assumed',()=>{
  const ambiguous=[{name:'A',unit:'1kg',price:1,aliases:['pepper']},{name:'B',unit:'1kg',price:1,aliases:['pepper']}];
  const r=parseVoiceBill('pepper 2 kg',ambiguous);
  assert.equal(r.lines.length,0);
  assert.ok(r.warnings.some(w=>/ambiguous/i.test(w)));
});

test('quantity does not jump from known to unknown product',()=>{
  const r=parsed('500 grams malli, unknown 250 grams');
  assert.equal(qty(r,'மல்லி'),0.5);
});
test('quantity is not reused for following item',()=>{
  const r=parsed('malli 2kg chicken');
  assert.equal(qty(r,'மல்லி'),2);
  assert.equal(qty(r,'சிக்கன்'),undefined);
});
test('one and half English fraction',()=>{
  const r=parsed('chicken one and half kilo');
  assert.equal(qty(r,'சிக்கன்'),1.5);
});
