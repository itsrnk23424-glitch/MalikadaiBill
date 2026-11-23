/**
 * Safe rule-based billing NLU. Works locally without an LLM or an API key.
 * This module does not change the bill. The UI must show suggestions for review.
 */
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TAMIL_NUMERALS = '௦௧௨௩௪௫௬௭௮௯';
const NUMBER_WORDS = {
  'ஒரு': 1, 'ஒன்று': 1, 'ஒன்னு': 1, 'ஒன்ன': 1, 'one': 1, 'oru': 1,
  'இரண்டு': 2, 'ரெண்டு': 2, 'two': 2, 'rendu': 2,
  'மூன்று': 3, 'மூணு': 3, 'three': 3, 'moonu': 3,
  'நான்கு': 4, 'நாலு': 4, 'four': 4,
  'ஐந்து': 5, 'அஞ்சு': 5, 'five': 5,
  'ஆறு': 6, 'six': 6,
  'ஏழு': 7, 'seven': 7,
  'எட்டு': 8, 'eight': 8,
  'ஒன்பது': 9, 'nine': 9,
  'பத்து': 10, 'ten': 10,
  'அரை': .5, 'arai': .5, 'half': .5,
  'கால்': .25, 'kaal': .25, 'quarter': .25,
  'முக்கால்': .75, 'mukkaal': .75, 'threequarter': .75,
  'ஒன்றரை': 1.5, 'onnarai': 1.5, 'oneandhalf': 1.5, 'one and half': 1.5, 'one and a half': 1.5,
  'இரண்டரை': 2.5, 'rendarai': 2.5
};
const WORDS = Object.keys(NUMBER_WORDS).sort((a,b)=>b.length-a.length).map(escapeRegExp).join('|');
const NUMERIC = '(?:[0-9]+(?:\\.[0-9]+)?|'+ WORDS +')';
const UNIT = '(?:கிலோ(?:கிராம்)?|கிலோ|kg|kgs|kilogram|kilograms|kilo|kilos|கிராம்|க்ராம்|grams?|gms?|gm|g|லிட்டர்|லீட்டர்|litres?|liters?|ltr|ml|மில்லி|பீஸ்|பீசு|pieces?|pcs?|ps|packet|packets?)';
const QUANTITY_REGEX = new RegExp('('+ NUMERIC + ')\\s*('+ UNIT + ')?','giu');
const BOUNDARY = '[\\s,.;:!?()\\[\\]/\\-]';

export function normaliseVoice(s = '') {
  return String(s).toLowerCase().replace(/[௦-௯]/g, c => String(TAMIL_NUMERALS.indexOf(c))).replace(/\s+/g,' ').trim();
}

function numberValue(raw) {
  const text=normaliseVoice(raw);
  return Object.hasOwn(NUMBER_WORDS,text) ? NUMBER_WORDS[text] : Number(text);
}

function getQty(fragment, unitName, preferLast = false) {
  const text=normaliseVoice(fragment);
  const candidates=[];
  QUANTITY_REGEX.lastIndex=0;
  for (const m of text.matchAll(QUANTITY_REGEX)) {
    const before=text.slice(Math.max(0,m.index-12),m.index);
    // Exclude numbers intended as prices / unrelated monetary amounts.
    if (/(?:₹|rs\s?|ரூபாய்\s?)$/i.test(before)) continue;
    const value=numberValue(m[1]);
    if (!Number.isFinite(value) || value <= 0 || value > 100000) continue;
    const unit=(m[2]||'').toLowerCase();
    if (!m[2] && /^[0-9]+$/.test(m[1]) && text.includes('பெயர்')) continue;
    let absolute;
    let kind='base';
    if (/^(?:g|gm|gms|gram|grams|கிராம்|க்ராம்)$/.test(unit)) { absolute=value / 1000; kind='mass'; }
    else if (/^(?:kg|kgs|kilogram|kilograms|kilo|kilos|கிலோ|கிலோகிராம்)$/.test(unit)) { absolute=value; kind='mass'; }
    else if (/^(?:ml|மில்லி)$/.test(unit)) { absolute=value/1000; kind='volume'; }
    else if (/^(?:litres?|liters?|ltr|லிட்டர்|லீட்டர்)$/.test(unit)) { absolute=value; kind='volume'; }
    else if (/(?:pcs?|pieces?|ps|பீஸ்|பீசு|packets?)/.test(unit)) { absolute=value; kind='piece'; }
    else { absolute=value; kind='base'; }
    const baseUnit=String(unitName || '1kg').toLowerCase();
    const per = baseUnit === '500g' ? .5 : baseUnit === '250g' ? .25 : baseUnit === '100g' ? .1 : 1;
    if (kind==='mass' && (baseUnit.endsWith('g') || baseUnit.endsWith('kg'))) absolute/=per;
    if (kind==='volume' && baseUnit==='1ltr') absolute=value / (/^(?:ml|மில்லி)$/.test(unit) ? 1000 : 1);
    candidates.push({qty: Math.round(absolute*1000)/1000, start: m.index, end: m.index + m[0].length, explicitUnit:!!m[2]});
  }
  if(!candidates.length) return null;
  return preferLast ? candidates.at(-1) : candidates[0];
}

function matchesForItems(text,items) {
  const matches=[];
  items.forEach((item,index) => {
    const terms = [item.name, ...(item.aliases||[])];
    for (const alias of terms) {
      const term=normaliseVoice(alias);
      if (!term || term.length < 2) continue;
      const re=new RegExp(`(^|${BOUNDARY})(${escapeRegExp(term)})(?=$|${BOUNDARY}|[0-9௦-௯])`,'giu');
      let m;
      while ((m=re.exec(text)) !== null) {
        const start=m.index+m[1].length;
        matches.push({start,end:start+term.length,index,term,score: term===normaliseVoice(item.name)?2:1});
        if (re.lastIndex === m.index) re.lastIndex++;
      }
    }
  });
  matches.sort((a,b)=>a.start-b.start || (b.end-b.start)-(a.end-a.start) || b.score-a.score);
  const chosen=[];
  for (const match of matches) {
    // same alias may refer to multiple items; flag it rather than guessing.
    const overlaps=chosen.some(c=>match.start<c.end && match.end>c.start);
    if (!overlaps) chosen.push(match);
  }
  return {chosen, matches};
}

export function parseVoiceBill(raw, items = []) {
  const transcript=String(raw||'').trim();
  let text=normaliseVoice(transcript);
  const warnings=[];
  const fields={};
  if (!text) return {transcript,lines:[],fields,warnings:['Nothing was heard. Please try again.']};
  const fieldRe = [
    ['oldBalance',/(?:பழைய\s*பாக்கி|old\s*balance)\s*(?:₹|rs\s*)?([0-9]+(?:\.[0-9]+)?)/iu],
    ['paid',/(?:வரவு|செலுத்தியது|கொடுத்தது|paid|cash received|received|cash)\s*(?:₹|rs\s*)?([0-9]+(?:\.[0-9]+)?)/iu],
    ['customer',/(?:பெயர்|வாடிக்கையாளர்|customer name|customer|name)\s+([a-z\u0b80-\u0bff]+(?:\s+[a-z\u0b80-\u0bff]+)?)/iu]
  ];
  for(const [field,re] of fieldRe){
    const m=text.match(re);
    if(m){ fields[field] = field==='customer'?m[1].trim():Number(m[1]); text=text.replace(m[0], ' '.repeat(m[0].length)); }
  }
  const {chosen,matches}=matchesForItems(text,items);
  const lines=[];
  const usedQuantitySpans=[];
  for(let i=0;i<chosen.length;i++) {
    const here=chosen[i];
    const next=chosen[i+1];
    const before=text.slice(i===0?0:chosen[i-1].end,here.start).trim();
    const after=text.slice(here.end,next?next.start:text.length).trim();
    // Prefer a quantity immediately following an item. Otherwise allow "500 கிராம் மல்லி".
    let result=getQty(after,items[here.index].unit);
    let span=null;
    // The quantity must be adjacent to the product (or it may belong to
    // an unmatched product mentioned later in the same sentence).
    if(result && result.start===0) span={start:here.end+text.slice(here.end,next?next.start:text.length).indexOf(after)+result.start,end:here.end+text.slice(here.end,next?next.start:text.length).indexOf(after)+result.end};
    else result=null;
    if(!result && before) {
      const candidate=getQty(before,items[here.index].unit,true);
      if(candidate && candidate.end===before.length) {
        const raw=text.slice(i===0?0:chosen[i-1].end,here.start);
        const start=(i===0?0:chosen[i-1].end)+raw.lastIndexOf(before)+candidate.start;
        const end=start+candidate.end-candidate.start;
        if(!usedQuantitySpans.some(s=>start<s.end&&end>s.start)) {result=candidate;span={start,end};}
      }
    }
    const competing=matches.filter(m=>m.start===here.start && m.end===here.end && m.index!==here.index);
    if (competing.length) {
      const names=[...new Set([items[here.index].name,...competing.map(m=>items[m.index].name)])];
      warnings.push(`Ambiguous product “${here.term}”: ${names.join(' / ')}. Say the full product name.`);
      continue;
    }
    if (!result) { warnings.push(`Quantity not found for ${items[here.index].name}. Say e.g. “2 kg”.`); continue; }
    if (!Number.isFinite(result.qty) || result.qty<=0 || result.qty>10000) {warnings.push(`Check quantity for ${items[here.index].name}.`);continue;}
    const duplicate=lines.find(l=>l.index===here.index);
    // A repeated product in one utterance needs human review; don't silently sum/replace.
    if(duplicate){ warnings.push(`Product ${items[here.index].name} repeated. Review the quantity.`); continue; }
    if(span)usedQuantitySpans.push(span);
    lines.push({index:here.index,name:items[here.index].name,unit:items[here.index].unit,qty:result.qty,price:Number(items[here.index].price)||0});
  }
  if (!chosen.length && !Object.keys(fields).length) warnings.push('No matching product or billing command was found.');
  return {transcript,lines,fields,warnings};
}
