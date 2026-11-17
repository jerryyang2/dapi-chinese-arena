import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const file of ['data.js','extra-data.js','extension-data.js','lower-data.js','curricula.js','rhetoric-data.js','punctuation-data.js','engine.js'])vm.runInContext(readFileSync(new URL('../web/'+file,import.meta.url),'utf8'),ctx);
const E=ctx.ArenaEngine,books=ctx.CURRICULA,ids=new Set(),reports=[];
const oldUpper={glyph:216,sound:216,word:120,story:72,idiom:51,order:12,connect:12,typo:12,memory:36};
for(const [semester,book]of Object.entries(books)){
 const ls=book.lessons,bank=E.createBank(ls,book.extra,{semester}),contentKeys=new Set();
 assert.equal(ls.length,semester==='upper'?12:9);assert.equal(ls.reduce((n,l)=>n+l.chars.length,0),semester==='upper'?216:156);
 for(const q of bank){
  assert.ok(q.prompt&&q.answer&&q.explanation,q.id);assert.equal(q.semester,semester);assert.ok(!ids.has(q.id),'跨學期ID不可重複：'+q.id);ids.add(q.id);
  const contentKey=JSON.stringify([q.lesson,q.type,q.prompt,q.display,q.context,q.answer,q.chunks,q.pairs]);assert.ok(!contentKeys.has(contentKey),'同課同題型不可出現完全相同內容：'+q.id);contentKeys.add(contentKey);
  if(q.options){assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options).size,4,q.id);assert.ok(q.options.includes(q.answer),q.id);}
  if(q.type==='order'){assert.equal(q.chunks.length,4);assert.equal(new Set(q.chunks).size,4);assert.equal(q.chunks.join(''),q.answer);}
  if(q.type==='memory'){assert.ok(q.pairs.length>=4,q.id);assert.equal(new Set(q.pairs.map(p=>p[0])).size,q.pairs.length,q.id);assert.equal(new Set(q.pairs.map(p=>p[1])).size,q.pairs.length,q.id);}
  for(const n of [1,2,4]){const r=E.prepareQuestion(q,n);assert.equal(r.teams.length,n);if(q.type==='memory')for(const t of r.teams){assert.equal(t.cards.length,8);for(let p=0;p<4;p++)assert.equal(t.cards.filter(c=>c.pair===p).length,2);}}
 }
 const base={semester,lessons:ls.map(l=>l.id),teams:4,count:24,seconds:30,manual:true,memoryKind:'all',wordKind:'all',sentenceKind:'all',rhetoricKind:'all',rhetoricDevice:'all',punctuationKind:'all'};
 for(const mode of Object.keys(E.MODES))for(const scope of [[1],book.presets.final.ids,base.lessons]){const qs=E.selectQuestions(bank,{...base,mode,lessons:scope});assert.ok(qs.every(q=>scope.includes(q.lesson)&&q.semester===semester));assert.equal(new Set(qs.map(q=>q.id)).size,qs.length);assert.ok(qs.every(q=>E.MODES[mode].types.includes(q.type)));}
 for(let k=0;k<20;k++){const qs=E.selectQuestions(bank,{...base,mode:'ultimate'});assert.equal(new Set(qs.slice(0,12).map(q=>q.type)).size,11,'混合賽前12題包含全部11種題型');}
 assert.equal(bank.filter(q=>q.type==='punctuation').length,ls.length*4);
 for(const l of ls){const ps=bank.filter(q=>q.type==='punctuation'&&q.lesson===l.id);assert.equal(ps.length,4);assert.equal(new Set(ps.map(q=>q.mark)).size,2);assert.ok(ps.every(q=>q.context.includes('自編例句')));}
 for(const kind of ['fill','role']){const qs=E.selectQuestions(bank,{...base,mode:'punctuation',punctuationKind:kind,count:'all'});assert.equal(qs.length,ls.length*2);assert.ok(qs.every(q=>q.kind===kind));}
 assert.equal(bank.filter(q=>q.type==='rhetoric').length,ls.length*4);
 for(const l of ls){const rs=bank.filter(q=>q.type==='rhetoric'&&q.lesson===l.id);assert.equal(rs.length,4);assert.equal(new Set(rs.map(q=>q.device)).size,2);assert.ok(rs.every(q=>q.context.includes('自編例句')));}
 for(const kind of ['identify','effect']){const qs=E.selectQuestions(bank,{...base,mode:'rhetoric',rhetoricKind:kind,count:'all'});assert.equal(qs.length,ls.length*2);assert.ok(qs.every(q=>q.kind===kind));}
 for(const device of ['譬喻','擬人','排比','設問','誇飾','映襯']){const qs=E.selectQuestions(bank,{...base,mode:'rhetoric',rhetoricDevice:device,count:'all'});assert.ok(qs.length);assert.ok(qs.every(q=>q.device===device));}
 for(const kind of ['sound','meaning','event']){const qs=E.selectQuestions(bank,{...base,mode:'memory',memoryKind:kind,count:'all'});assert.ok(qs.every(q=>q.kind===kind));assert.equal(qs.length,ls.length*2);for(const l of ls){const pairQs=qs.filter(q=>q.lesson===l.id);assert.equal(pairQs.length,2);assert.ok(pairQs[0].pairs.every(p=>!pairQs[1].pairs.some(v=>v[0]===p[0])),'兩回合配對內容不可重複');}}
 assert.equal(E.selectQuestions(bank,{...base,mode:'words',lessons:[]}).length,0);
 const counts=Object.fromEntries(Object.keys(E.TYPES).map(t=>[t,bank.filter(q=>q.type===t).length]));
 if(semester==='upper')for(const [type,old]of Object.entries(oldUpper))assert.equal(counts[type],old*2,'六上各題型必須精確加倍：'+type);
 for(const l of ls){assert.equal(bank.filter(q=>q.lesson===l.id&&q.type==='story').length,12);for(const type of ['order','connect','typo'])assert.equal(bank.filter(q=>q.lesson===l.id&&q.type===type).length,2);}
 reports.push({semester,lessons:ls.length,questions:bank.length,types:counts});
}
assert.ok(books.lower.lessons[8].chars.length===8);
assert.equal(Object.keys(E.MODES).length,8);
for(const [semester,sets] of Object.entries(ctx.PUNCTUATION))for(const lesson of sets)for(const item of lesson){
 const marks=['「」','《》'].includes(item.mark)?[...item.mark]:[item.mark];let cursor=0;
 const rebuilt=item.gapSentence.replaceAll('□',()=>marks.length===2?marks[cursor++]:marks[0]);
 assert.equal(rebuilt,item.sentence,'標點空格必須可精確重建原句');
}
assert.equal(reports.reduce((n,r)=>n+r.questions,0),2752);
console.log(JSON.stringify({result:'PASS',semesters:reports,checks:'上下學期完整資料、各關卡加倍、不重複ID、配對分組、1/2/4隊、單課及範圍篩選、混合出題'}));
