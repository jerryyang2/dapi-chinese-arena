(function(root){
  'use strict';
  const TYPES={glyph:'生字挑戰',sound:'字音挑戰',word:'詞義挑戰',story:'課文偵探',idiom:'成語・四字詞',order:'句子重組',connect:'連接詞',typo:'錯字修復',memory:'記憶配對',rhetoric:'修辭挑戰',punctuation:'標點解碼'};
  const MODES={words:{name:'字詞競技場',icon:'字',sub:'認國字、辨字音、讀懂詞義',types:['glyph','sound','word']},story:{name:'課文偵探',icon:'探',sub:'從線索讀懂人物、事件與主旨',types:['story']},idiom:{name:'成語擂臺',icon:'詞',sub:'成語與四字詞，意思一看就懂',types:['idiom']},sentence:{name:'句子修復站',icon:'句',sub:'重組句子、選連接詞、修正錯字',types:['order','connect','typo']},memory:{name:'記憶配對賽',icon:'配',sub:'翻卡記住字音、詞義與人物事件',types:['memory']},rhetoric:{name:'修辭挑戰',icon:'修',sub:'辨認六種修辭，讀懂表達效果',types:['rhetoric']},punctuation:{name:'標點解碼站',icon:'標',sub:'補上標點，讀懂停頓與語氣',types:['punctuation']},ultimate:{name:'終極團隊賽',icon:'冠',sub:'混合各類題目，期中期末一次複習',types:Object.keys(TYPES)}};
  const shuffle=(arr,random=Math.random)=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const unique=a=>[...new Set(a)];
  function createBank(lessons,extra,{semester='upper'}={}){
    const bank=[], allChars=unique(lessons.flatMap(l=>l.chars.map(c=>c.char))),allWords=lessons.flatMap(l=>l.words);
    const options=(answer,candidates)=>[answer,...unique(candidates).filter(s=>s!==answer).slice(0,3)];
    function push(l,type,id,data){bank.push({id:`${semester==='upper'?'':'lower-'}${l.id}-${type}-${id}`,semester,lesson:l.id,title:l.title,type,...data});}
    lessons.forEach((l,i)=>{
      l.chars.forEach((c,j)=>{
        const local=unique([...l.chars.map(x=>x.char),...allChars]);
        const context=c.word.replaceAll(c.char,'□');
        push(l,'glyph',j,{prompt:`看注音，補出正確的國字`,display:c.reading,context,answer:c.char,options:options(c.char,shuffle(local.filter(x=>x!==c.char))),explanation:`「${c.word}」的「${c.char}」讀作 ${c.reading}。`});
        const other=shuffle(lessons.flatMap(x=>x.chars).filter(x=>x.char!==c.char&&x.reading!==c.reading));
        push(l,'glyph',j+'-word',{prompt:'依照注音與缺字線索，選出完整詞語。',display:c.reading,context,answer:c.word,options:options(c.word,other.map(x=>c.word.replaceAll(c.char,x.char))),explanation:`完整詞語是「${c.word}」，「${c.char}」讀作 ${c.reading}。`});
        const base=c.reading.replace(/[ˊˇˋ˙]/g,'');
        push(l,'sound',j,{prompt:`「${c.word}」中「${c.char}」的正確讀音是？`,display:c.char,context:c.word,answer:c.reading,options:options(c.reading,c.reading.includes('˙')?[base+'ˊ',base+'ˇ',base+'ˋ']:[base,base+'ˊ',base+'ˇ',base+'ˋ']),explanation:`在「${c.word}」中，「${c.char}」讀作 ${c.reading}。字音以此詞語中的讀法為準。`});
        const named=`${c.char}（${c.word}）`;
        push(l,'sound',j+'-reverse',{prompt:'依本課詞語讀音，找出與下方注音對應的生字。',display:c.reading,answer:named,options:options(named,other.map(x=>`${x.char}（${x.word}）`)),explanation:`${named} 讀作 ${c.reading}；以括號內的詞語讀法為準。`});
      });
      l.words.forEach((w,j)=>{
        const data={prompt:'哪個詞語符合下面的意思？',display:w.definition,answer:w.word,options:options(w.word,shuffle(allWords.map(x=>x.word))),explanation:`${w.word}：${w.definition}`};
        push(l,'word',j,data);if(w.word.length>=4)push(l,'idiom',j,{...data,prompt:'找出符合意思的成語或四字詞。'});
        const reverse={prompt:`「${w.word}」最接近下列哪個意思？`,display:w.word,answer:w.definition,options:options(w.definition,shuffle(allWords.map(x=>x.definition))),explanation:`${w.word}：${w.definition}`};
        push(l,'word',j+'-meaning',reverse);if(w.word.length>=4)push(l,'idiom',j+'-meaning',{...reverse,prompt:'讀讀這個成語或四字詞，選出正確意思。'});
      });
      [...l.stories,...(extra[i].stories2||[])].forEach((s,j)=>push(l,'story',j,{...s,options:[s.answer,...s.wrong],display:'',explanation:s.explanation}));
      const rhetoricEffects={譬喻:'把兩種不同事物相比，幫助讀者想像',擬人:'賦予事物人的動作或情感，使描寫活潑',排比:'用三個以上相似句式，增強節奏與語勢',設問:'先提出問題再回答，引導讀者思考',誇飾:'故意誇大事物特徵，強調感受或程度',映襯:'把不同景象或感受並列，凸顯彼此差異'};
      for(const [j,r] of (root.RHETORIC?.[semester]?.[i]||[]).entries()){
        const common={display:r.sentence,context:'課文主題延伸・自編例句',device:r.device,explanation:r.explanation};
        push(l,'rhetoric',j+'-identify',{...common,kind:'identify',prompt:'這個自編例句主要用了哪一種修辭？',answer:r.device,options:options(r.device,shuffle(Object.keys(rhetoricEffects)))});
        push(l,'rhetoric',j+'-effect',{...common,kind:'effect',prompt:`這個例句用了「${r.device}」，主要的表達效果是什麼？`,answer:r.effect,options:options(r.effect,shuffle(Object.entries(rhetoricEffects).filter(([d])=>d!==r.device).map(([,effect])=>effect)))});
      }
      const markRoles={'。':'表示一個完整句子的結束','、':'分隔並列的短詞語','：':'引出接下來的說話內容','；':'分開同層次的並列分句','？':'標示完整問句的疑問語氣','！':'表示強烈的感嘆或情緒','「」':'標示引用或直接說出的話','《》':'標示書籍名稱'};
      for(const [j,p] of (root.PUNCTUATION?.[semester]?.[i]||[]).entries()){
        const common={context:'課文主題延伸・自編例句',mark:p.mark,explanation:p.explanation};
        push(l,'punctuation',j+'-fill',{...common,kind:'fill',prompt:p.prompt||`要${p.role}，方框應補哪種標點？`,display:p.gapSentence,answer:p.mark,options:options(p.mark,shuffle(Object.keys(markRoles)))});
        push(l,'punctuation',j+'-role',{...common,kind:'role',prompt:`例句中的${({'。':'句號','、':'頓號','：':'冒號','；':'分號','？':'問號','！':'驚嘆號','「」':'引號','《》':'書名號'})[p.mark]}，主要用途是什麼？`,display:p.sentence,answer:p.role,options:options(p.role,shuffle(Object.entries(markRoles).filter(([mark])=>mark!==p.mark).map(([,role])=>role)))});
      }
      const e=extra[i];
      for(const [variant,chunks] of [e.order,e.order2].entries())if(chunks)push(l,'order',variant,{prompt:'依序點選四個片段，組成通順的句子。',display:'把句子，排回來。',chunks,validAnswers:((variant?e.validOrders2:e.validOrders)||(semester==='upper'&&!variant?(l.id===7?[[1,0,2,3]]:l.id===9?[[0,2,1,3],[2,0,1,3]]:[]):[])).map(order=>order.map(n=>chunks[n]).join('')),answer:chunks.join(''),explanation:chunks.join('')});
      const [prompt,answer,...rest]=e.connect;
      push(l,'connect',0,{prompt:'選出最適合的連接詞。',display:prompt,answer,options:[answer,...rest.slice(0,3)],explanation:rest[3]});
      if(e.connect2){const [prompt,answer,...rest]=e.connect2;push(l,'connect',1,{prompt:'選出最適合的連接詞。',display:prompt,answer,options:[answer,...rest.slice(0,3)],explanation:rest[3]});}
      const [correct,right,wrong,explanation]=e.typo;
      push(l,'typo',0,{prompt:'句子裡框出的字寫錯了，應該換成哪個字？',display:correct.replace(`「${right}」`,`「${wrong}」`),answer:right,options:options(right,[wrong,...shuffle(allChars)]),explanation:`正確句子：${correct} ${explanation}`});
      if(e.typo2){const [correct,right,wrong,explanation]=e.typo2;push(l,'typo',1,{prompt:'句子裡框出的字寫錯了，應該換成哪個字？',display:correct.replace(`「${right}」`,`「${wrong}」`),answer:right,options:options(right,[wrong,...shuffle(allChars)]),explanation:`正確句子：${correct} ${explanation}`});}
      const charPairs=[];const seen=new Set();for(const c of l.chars){if(!seen.has(c.reading)){seen.add(c.reading);charPairs.push([`${c.char}（${c.word}）`,c.reading]);}}
      const pools=[['sound','字音配對',charPairs],['meaning','詞義配對',l.words.map(w=>[w.word,w.definition])],['event','人物／事物與事件',[...e.pairs,...(e.pairs2||[])]]];
      pools.forEach(([kind,label,pairs])=>{const split=Math.ceil(pairs.length/2);for(const [variant,part]of[pairs.slice(0,split),pairs.slice(split)].entries())push(l,'memory',kind+(variant?'-2':''),{prompt:`翻開卡片，完成四組${label}。`,display:label,kind,pairs:part,answer:'完成四組配對',explanation:`${label}：完成後可以再看一次配對內容。`});});
    });
    return bank;
  }
  function selectQuestions(bank,settings,random=Math.random){
    let pool=bank.filter(q=>settings.lessons.includes(q.lesson)&&MODES[settings.mode].types.includes(q.type));
    if(settings.mode==='memory'&&settings.memoryKind!=='all')pool=pool.filter(q=>q.kind===settings.memoryKind);
    if(settings.mode==='words'&&settings.wordKind!=='all')pool=pool.filter(q=>q.type===settings.wordKind);
    if(settings.mode==='sentence'&&settings.sentenceKind!=='all')pool=pool.filter(q=>q.type===settings.sentenceKind);
    if(settings.mode==='punctuation'&&settings.punctuationKind&&settings.punctuationKind!=='all')pool=pool.filter(q=>q.kind===settings.punctuationKind);
    if(settings.mode==='rhetoric'){if(settings.rhetoricKind&&settings.rhetoricKind!=='all')pool=pool.filter(q=>q.kind===settings.rhetoricKind);if(settings.rhetoricDevice&&settings.rhetoricDevice!=='all')pool=pool.filter(q=>q.device===settings.rhetoricDevice);}
    // 混合賽輪流取題型，避免大量生字題淹沒其他關卡。
    if(settings.mode==='ultimate'){
      const groups=shuffle(unique(pool.map(q=>q.type)),random).map(t=>shuffle(pool.filter(q=>q.type===t),random));
      const balanced=[];while(groups.some(g=>g.length))for(const g of groups)if(g.length)balanced.push(g.pop());pool=balanced;
    }else pool=shuffle(pool,random);
    return pool.slice(0,settings.count==='all'?pool.length:Number(settings.count));
  }
  function prepareQuestion(q,teamCount,random=Math.random){
    const pairs=q.type==='memory'?shuffle(q.pairs,random).slice(0,4):null;
    const teams=Array.from({length:teamCount},()=>({answered:false,correct:false,choice:null,sequence:[],flipped:[],matched:[],busy:false,options:q.options?shuffle(q.options,random):q.chunks?shuffle(q.chunks,random):[],cards:pairs?shuffle(pairs.flatMap((p,id)=>p.map((text,side)=>({text,pair:id,side}))),random):[]}));
    return {q,teams,pairs};
  }
  root.ArenaEngine={TYPES,MODES,shuffle,unique,createBank,selectQuestions,prepareQuestion};
})(typeof window==='undefined'?globalThis:window);
