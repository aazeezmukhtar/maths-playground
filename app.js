const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE_KEY = 'maths-playground-progress-v1';
const defaultProgress = { points: 0, practiceCorrect: 0, practiceAnswered: 0, challengeCorrect: 0, challengeAnswered: 0 };
let progress = loadProgress();
let practiceIndex = 0;
let practiceAnswered = false;
let challengeIndex = 0;
let challengeAnswered = false;
let activeChallengeLevelId = 'fraction-1';
let challengeRunAnswered = 0;
let challengeRunCorrect = 0;
let selectedSlices = new Set();
let soundEnabled = false;
let audioContext;

const practiceQuestions = [
  { question: 'A chocolate bar has 4 equal pieces. You eat 1 piece. What fraction did you eat?', parts: 4, selected: 1, answers: ['1/4', '1/3', '3/4', '4/1'], correct: '1/4', hint: 'Count the one piece you ate. That is the top number. Count all four equal pieces for the bottom number.', explain: 'You ate 1 out of 4 equal pieces, so the fraction is ¼.' },
  { question: 'A cake is cut into 6 equal slices. You take 2. What fraction did you take?', parts: 6, selected: 2, answers: ['2/4', '2/6', '6/2', '1/6'], correct: '2/6', hint: 'You took 2 slices from a cake with 6 equal slices.', explain: 'You took 2 of the 6 equal slices, so the fraction is 2/6. It is also equal to 1/3.' },
  { question: 'Which fraction means one half?', parts: 2, selected: 1, answers: ['1/4', '2/1', '1/2', '2/4'], correct: '1/2', hint: 'Half means one of two equal parts.', explain: 'One half is written 1/2: one part out of two equal parts.' },
  { question: 'An orange is divided into 8 equal parts. You eat 5. What fraction is left?', parts: 8, selected: 3, answers: ['5/8', '3/8', '8/3', '1/8'], correct: '3/8', hint: 'Start with 8 pieces and take away the 5 you ate. How many remain?', explain: '8 − 5 = 3 pieces left out of 8, so 3/8 remains.' },
  { question: 'Which fraction is equal to one whole?', parts: 4, selected: 4, answers: ['1/4', '2/4', '3/4', '4/4'], correct: '4/4', hint: 'A whole means every part is included. How many out of 4 is all 4?', explain: '4/4 means all four of the four equal parts: one whole.' }
];
const challengeQuestions = [
  { type:'largest', prompt:'Which fraction is the largest?', fractions:[{n:1,d:2},{n:1,d:4},{n:3,d:4}], choices:['1/2','1/4','3/4'], correct:'3/4', hint:'Imagine each fraction as a pizza. Which one covers the most pizza?', explain:'3/4 is the largest: three of four equal parts is more than one half or one quarter.' },
  { type:'smallest', prompt:'Which fraction is the smallest?', fractions:[{n:1,d:2},{n:1,d:4},{n:3,d:4}], choices:['1/2','1/4','3/4'], correct:'1/4', hint:'All three fractions have the same whole. Which fraction covers the least?', explain:'1/4 is the smallest because one quarter is less than one half and three quarters.' },
  { type:'equivalent', prompt:'Which fraction is equal to 2/3?', expression:'2/3 = ?', choices:['3/4','4/6','2/6','3/6'], correct:'4/6', hint:'To make an equivalent fraction, multiply the top and bottom numbers by the same number.', explain:'2/3 = 4/6 because both the numerator and denominator are multiplied by 2.' },
  { type:'compare', prompt:'Which fraction is smaller?', fractions:[{n:3,d:5},{n:3,d:8}], choices:['3/5','3/8'], correct:'3/8', hint:'Both fractions have 3 parts shaded. Eighths are smaller pieces than fifths.', explain:'3/8 is smaller than 3/5 because each eighth is smaller than each fifth.' },
  { type:'missing', prompt:'Find the missing number.', expression:'1/2 = ?/8', choices:['2','3','4','6'], correct:'4', hint:'The denominator changes from 2 to 8. What did you multiply it by? Multiply the numerator by the same amount.', explain:'1/2 = 4/8. Both the numerator and denominator are multiplied by 4.' },
  { type:'false-statement', prompt:'Which statement is NOT correct?', choices:['2/4 = 1/2','1/3 = 2/6','3/5 = 3/4','4/8 = 1/2'], correct:'3/5 = 3/4', hint:'Check each pair. Equivalent fractions name the same amount, even if their numbers look different.', explain:'3/5 is not equal to 3/4. Three fifths and three quarters are different amounts.' },
  { type:'number-line', prompt:'Which fraction is halfway between 0 and 1?', choices:['1/4','1/2','3/4','1/3'], correct:'1/2', hint:'Halfway means the same distance from 0 as from 1.', explain:'1/2 is exactly halfway between 0 and 1 on the number line.' },
  { type:'equivalent', prompt:'Which fraction is equal to 1/2?', expression:'1/2 = ?', choices:['2/3','2/4','3/4','1/4'], correct:'2/4', hint:'One half means half of the equal parts are included.', explain:'2/4 is equal to 1/2 because two of four equal parts make half a whole.' },
  { type:'smallest', prompt:'Which fraction is the smallest?', fractions:[{n:2,d:6},{n:5,d:6},{n:1,d:6}], choices:['2/6','5/6','1/6'], correct:'1/6', hint:'All the fractions are sixths. Compare the number of sixths in each.', explain:'1/6 is the smallest because one sixth is less than two sixths and five sixths.' },
  { type:'compare', prompt:'Which fraction is larger?', fractions:[{n:2,d:5},{n:4,d:5}], choices:['2/5','4/5'], correct:'4/5', hint:'Both fractions have fifths. Compare the top numbers.', explain:'4/5 is larger than 2/5 because four fifths is more than two fifths.' }
];

function getProgressStorageKey() {
  return window.LearnerProfiles ? window.LearnerProfiles.storageKey(STORAGE_KEY) : STORAGE_KEY;
}
function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(getProgressStorageKey()) || '{}');
    return { ...defaultProgress, ...saved };
  } catch { return { ...defaultProgress }; }
}
function saveProgress() {
  try { localStorage.setItem(getProgressStorageKey(), JSON.stringify(progress)); } catch { /* Storage may be disabled. */ }
  renderProgress();
  document.dispatchEvent(new CustomEvent('learningprogresschange'));
}
function renderProgress() {
  const totalPoints = $('#total-points');
  if (totalPoints) totalPoints.textContent = progress.points;

  const dashboardPoints = $('#dashboard-points');
  if (dashboardPoints) dashboardPoints.textContent = progress.points;
  const dashboardPractice = $('#dashboard-practice');
  if (dashboardPractice) dashboardPractice.textContent = progress.practiceAnswered;
  const dashboardChallenges = $('#dashboard-challenges');
  if (dashboardChallenges) dashboardChallenges.textContent = progress.challengeAnswered;

  const progressBar = $('#fraction-progress-bar');
  const progressLabel = $('#fraction-progress-label');
  const answered = progress.practiceAnswered;
  const practiceTotal = 16;
  const percent = Math.min(100, Math.round((Math.min(answered, practiceTotal) / practiceTotal) * 100));
  if (progressBar) progressBar.style.width = percent + '%';
  if (progressLabel) progressLabel.textContent = answered
    ? `${Math.min(answered, practiceTotal)} of ${practiceTotal} practice questions tried`
    : 'Your first adventure awaits';
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2400);
}
function playTone(correct) {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = correct ? 660 : 220;
    gain.gain.setValueAtTime(0.07, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + 0.18);
  } catch { /* Audio is an optional enhancement. */ }
}
function openWorkspace(panel = 'learn') {
  $('#fraction-workspace').hidden = false;
  switchPanel(panel);
  $('#fraction-workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function switchPanel(name) {
  $$('.tab-button').forEach(button => {
    const active = button.dataset.panel === name;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  $$('.activity-panel').forEach(panel => { panel.hidden = panel.dataset.activity !== name; });
}
let modelShape='pizza',modelSplit='quarters',modelDenominator=4;
function getModelSegments(){
 const circle=modelShape==='pizza',x=modelShape==='square'?50:30,y=modelShape==='square'?25:45,w=modelShape==='square'?140:180,h=modelShape==='square'?140:110,n=modelDenominator;
 if(circle&&modelSplit==='diagonal'&&n===2)return[{d:'M176.6 43.4 A80 80 0 0 1 63.4 156.6 Z',label:'Diagonal half one'},{d:'M63.4 156.6 A80 80 0 0 1 176.6 43.4 Z',label:'Diagonal half two'}];
 if(circle&&modelSplit==='horizontal'&&n===2)return[{d:'M40 100 A80 80 0 0 1 200 100 L120 100 Z',label:'Top half'},{d:'M200 100 A80 80 0 0 1 40 100 L120 100 Z',label:'Bottom half'}];
 if(circle&&modelSplit==='vertical'&&n===2)return[{d:'M120 20 A80 80 0 0 0 120 180 L120 100 Z',label:'Left half'},{d:'M120 180 A80 80 0 0 0 120 20 L120 100 Z',label:'Right half'}];
 if(circle&&modelSplit==='quarters'&&n===4)return[
 {d:'M120 100 L120 20 A80 80 0 0 1 200 100 Z',label:'Top-right quarter'},
 {d:'M120 100 L200 100 A80 80 0 0 1 120 180 Z',label:'Bottom-right quarter'},
 {d:'M120 100 L120 180 A80 80 0 0 1 40 100 Z',label:'Bottom-left quarter'},
 {d:'M120 100 L40 100 A80 80 0 0 1 120 20 Z',label:'Top-left quarter'}];
 if(circle){const out=[];for(let i=0;i<n;i++){const a=-Math.PI/2+2*Math.PI*i/n,b=-Math.PI/2+2*Math.PI*(i+1)/n,x1=120+80*Math.cos(a),y1=100+80*Math.sin(a),x2=120+80*Math.cos(b),y2=100+80*Math.sin(b);out.push({d:`M120 100 L${x1.toFixed(3)} ${y1.toFixed(3)} A80 80 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`,label:`Slice ${i+1} of ${n}`});}return out;}
 if(modelSplit==='diagonal'&&n===2)return[{d:`M${x} ${y} H${x+w} L${x} ${y+h} Z`,label:'Diagonal half one'},{d:`M${x+w} ${y} V${y+h} H${x} Z`,label:'Diagonal half two'}];
 if(modelSplit==='quarters'&&n===4)return[
 {d:`M${x} ${y} H${x+w/2} V${y+h/2} H${x} Z`,label:'Top-left quarter'},
 {d:`M${x+w/2} ${y} H${x+w} V${y+h/2} H${x+w/2} Z`,label:'Top-right quarter'},
 {d:`M${x+w/2} ${y+h/2} H${x+w} V${y+h} H${x+w/2} Z`,label:'Bottom-right quarter'},
 {d:`M${x} ${y+h/2} H${x+w/2} V${y+h} H${x} Z`,label:'Bottom-left quarter'}];
 const out=[],horizontal=modelSplit==='horizontal';for(let i=0;i<n;i++){if(horizontal){const bh=h/n,t=y+bh*i,b=y+bh*(i+1);out.push({d:`M${x} ${t} H${x+w} V${b} H${x} Z`,label:`Part ${i+1} of ${n}, horizontal`});}else{const bw=w/n,l=x+bw*i,r=x+bw*(i+1);out.push({d:`M${l} ${y} H${r} V${y+h} H${l} Z`,label:`Part ${i+1} of ${n}, vertical`});}}return out;
}
function renderPizza(){
 const model=$('#learn-pizza');if(!model)return;const segments=getModelSegments(),colors=['#ffc45f','#ff8da7','#8c83ed','#65d4ae','#f4a6dc','#8fd5f0','#f5d66d','#b9e49b','#f6ad8b','#b9b2ff','#8de0ce','#f3a9b9'],ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 240 200');svg.setAttribute('class','fraction-model-svg');svg.setAttribute('role','group');svg.setAttribute('aria-label',`${modelShape} divided into ${segments.length} equal parts`);
 segments.forEach((s,i)=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',s.d);p.setAttribute('fill',selectedSlices.has(i)?'#6b63df':colors[i%colors.length]);p.setAttribute('stroke','#fff');p.setAttribute('stroke-width','3');p.setAttribute('stroke-linejoin','round');p.setAttribute('class','model-segment'+(selectedSlices.has(i)?' is-selected':''));p.setAttribute('role','button');p.setAttribute('tabindex','0');p.setAttribute('aria-label',s.label);p.setAttribute('aria-pressed',String(selectedSlices.has(i)));const toggle=()=>{if(selectedSlices.has(i))selectedSlices.delete(i);else selectedSlices.add(i);renderPizza();};p.addEventListener('click',toggle);p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});svg.append(p);});
 if(modelShape==='pizza'){const o=document.createElementNS(ns,'circle');o.setAttribute('cx','120');o.setAttribute('cy','100');o.setAttribute('r','80');o.setAttribute('fill','none');o.setAttribute('stroke','#fff');o.setAttribute('stroke-width','3');svg.append(o);}else{const o=document.createElementNS(ns,'rect');o.setAttribute('x',modelShape==='square'?'50':'30');o.setAttribute('y',modelShape==='square'?'25':'45');o.setAttribute('width',modelShape==='square'?'140':'180');o.setAttribute('height',modelShape==='square'?'140':'110');o.setAttribute('fill','none');o.setAttribute('stroke','#fff');o.setAttribute('stroke-width','3');svg.append(o);}
 model.replaceChildren(svg);const count=selectedSlices.size,total=segments.length,name=modelShape==='pizza'?'pizza':modelShape;$('#pizza-readout').textContent=`${count}/${total}`;$('#pizza-caption').textContent=count===0?`A ${name} divided into ${total} equal parts. Tap a part to select it.`:count===total?`You selected all ${total} parts: one whole ${name}!`:`You selected ${count} of ${total} equal parts: ${count}/${total}.`;
 const value=$('#denominator-value'),slider=$('#denominator-slider'),minus=$('#denominator-minus'),plus=$('#denominator-plus');if(value)value.textContent=modelDenominator;if(slider)slider.value=modelDenominator;if(minus)minus.disabled=modelDenominator<=2;if(plus)plus.disabled=modelDenominator>=12;
}
function setModelDenominator(value){modelDenominator=Math.max(2,Math.min(12,Math.round(Number(value)||2)));if(modelSplit==='diagonal'&&modelDenominator!==2)modelSplit='vertical';if(modelSplit==='quarters'&&modelDenominator!==4)modelSplit='vertical';selectedSlices.clear();$$('[data-split]').forEach(b=>{const active=b.dataset.split===modelSplit;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});renderPizza();}

const practiceActivities = {
  shade:{title:'Shade the Fraction',icon:'🎨',description:'Build some models with the number scale, then shade the fraction.',questions:[
    {n:1,d:2,type:'fixed',hint:'The top number tells you how many pieces to shade.',explain:'1 out of 2 equal pieces is one half.'},
    {n:3,d:8,type:'build',hint:'First use the denominator scale to make 8 equal pieces. Then shade 3.',explain:'3 of 8 equal pieces are shaded, so the fraction is 3/8.'},
    {n:2,d:5,type:'fixed',hint:'Shade exactly two of the five equal pieces.',explain:'2 shaded pieces out of 5 equal pieces is 2/5.'},
    {n:4,d:6,type:'build',hint:'Set the denominator scale to 6. Then shade 4 pieces.',explain:'4 of the 6 equal pieces are shaded, so the fraction is 4/6.'}]},
  match:{title:'Match the Fraction',icon:'🧩',description:'Read the picture and choose the fraction it shows.',questions:[
    {n:1,d:3,hint:'Count the coloured parts first, then count all the equal parts.',explain:'One of three equal parts is 1/3.'},
    {n:3,d:5,hint:'The numerator is the number of coloured parts.',explain:'Three coloured parts out of five equal parts is 3/5.'},
    {n:2,d:4,hint:'There are four parts altogether. How many are coloured?',explain:'Two of four equal parts is 2/4, which is also one half.'},
    {n:5,d:8,hint:'Count the coloured parts and use the total number of parts as the denominator.',explain:'Five coloured parts out of eight is 5/8.'}]},
  compare:{title:'Which Is Bigger?',icon:'⚖️',description:'Compare two fractions and choose the larger one.',questions:[
    {a:{n:1,d:2},b:{n:1,d:4},correct:'1/2',hint:'When the top number is the same, each part is bigger when the bottom number is smaller.',explain:'One half is bigger than one quarter.'},
    {a:{n:2,d:5},b:{n:4,d:5},correct:'4/5',hint:'Both fractions have fifths. Compare the top numbers.',explain:'Four fifths is bigger than two fifths.'},
    {a:{n:2,d:3},b:{n:2,d:6},correct:'2/3',hint:'Both have two parts shaded. Thirds are bigger pieces than sixths.',explain:'2/3 is bigger than 2/6 because thirds are larger than sixths.'},
    {a:{n:3,d:8},b:{n:5,d:8},correct:'5/8',hint:'The denominators are the same, so compare the numerators.',explain:'Five eighths is bigger than three eighths.'}]},
  detective:{title:'Fraction Detective',icon:'🕵️',description:'Find the missing number and solve the fraction mystery.',questions:[
    {prompt:'1/2 = ?/4',correct:'2',answers:['1','2','3','4'],hint:'What number multiplied by 2 gives 4? Multiply the top number by the same amount.',explain:'1/2 equals 2/4. Multiply both the top and bottom numbers by 2.'},
    {prompt:'3/6 = 1/?',correct:'2',answers:['2','3','4','6'],hint:'3/6 simplifies when both numbers are divided by 3.',explain:'3/6 is equal to 1/2, so the missing number is 2.'},
    {prompt:'? / 8 = 1/2',correct:'4',answers:['2','3','4','6'],hint:'Half of 8 equal parts is 4 parts.',explain:'4/8 is equal to 1/2.'},
    {prompt:'2/4 = ?/8',correct:'4',answers:['2','3','4','6'],hint:'The denominator doubled from 4 to 8. Double the numerator too.',explain:'2/4 equals 4/8 because both fractions represent one half.'}]}
};
let activePracticeMode=null,activePracticeQuestion=0,shadeSelection=new Set(),activePracticeAnswered=false,shadeDenominator=2;
function renderPracticeMenu(){
 const menu=$('#practice-menu'),game=$('#practice-game');if(!menu||!game)return;menu.hidden=false;game.hidden=true;menu.replaceChildren();
 Object.entries(practiceActivities).forEach(([key,a])=>{const card=document.createElement('button');card.type='button';card.className='practice-activity-card';card.dataset.practiceMode=key;card.innerHTML='<span class="practice-activity-icon" aria-hidden="true"></span><span class="practice-activity-copy"><strong></strong><small></small></span><span class="practice-activity-arrow" aria-hidden="true">→</span>';$('.practice-activity-icon',card).textContent=a.icon;$('.practice-activity-copy strong',card).textContent=a.title;$('.practice-activity-copy small',card).textContent=a.description;card.addEventListener('click',()=>startPracticeActivity(key));menu.append(card);});
}
function startPracticeActivity(mode){activePracticeMode=mode;activePracticeQuestion=0;renderPracticeQuestion();$('#practice-menu').hidden=true;$('#practice-game').hidden=false;$('#practice-game').scrollIntoView({behavior:'smooth',block:'nearest'});}
function makeFractionPicture(n,d,interactive=false){
 const wrap=document.createElement('div');wrap.className='practice-fraction-picture';wrap.setAttribute('role',interactive?'group':'img');wrap.setAttribute('aria-label',`${n} of ${d} equal parts shaded`);
 for(let i=0;i<d;i++){const piece=document.createElement(interactive?'button':'span');if(interactive){piece.type='button';piece.className='shade-piece';piece.setAttribute('aria-label',`Part ${i+1}`);piece.setAttribute('aria-pressed',String(shadeSelection.has(i)));piece.addEventListener('click',()=>{if(activePracticeAnswered)return;if(shadeSelection.has(i))shadeSelection.delete(i);else shadeSelection.add(i);renderShadePieces();});piece.classList.toggle('is-shaded',shadeSelection.has(i));}else{piece.className='picture-piece'+(i<n?' filled':'');piece.textContent=i<n?'●':'';}wrap.append(piece);}return wrap;
}
function renderShadePieces(){const holder=$('#practice-interactive-visual');if(!holder||activePracticeMode!=='shade')return;const q=practiceActivities.shade.questions[activePracticeQuestion%practiceActivities.shade.questions.length],denominator=q.type==='build'?shadeDenominator:q.d;holder.replaceChildren(makeFractionPicture(q.n,denominator,true));$('#practice-live-count').textContent=`${shadeSelection.size} of ${denominator} pieces selected`;}
function renderPracticeQuestion(){
 if(!activePracticeMode)return renderPracticeMenu();const a=practiceActivities[activePracticeMode],qs=a.questions,q=qs[activePracticeQuestion%qs.length];activePracticeAnswered=false;shadeSelection=new Set();
 $('#practice-game-title').textContent=a.title;$('#practice-game-count').textContent=`ROUND ${activePracticeQuestion%qs.length+1} OF ${qs.length}`;$('#practice-game-progress').style.width=`${activePracticeQuestion%qs.length/qs.length*100}%`;
 $('#practice-game-prompt').textContent=activePracticeMode==='shade'?(q.type==='build'?`Build ${q.n}/${q.d}: set the denominator first, then shade ${q.n} pieces.`:`Show ${q.n}/${q.d} by shading the pieces.`):activePracticeMode==='match'?'Which fraction does this picture show?':activePracticeMode==='compare'?'Which fraction is bigger?':q.prompt;
 const shadePicker=$('#shade-denominator-picker'),shadeScale=$('#shade-denominator-control');
 if(shadePicker)shadePicker.hidden=activePracticeMode!=='shade'||q.type!=='build';
 if(shadeScale&&activePracticeMode==='shade'&&q.type==='build'){shadeDenominator=q.d===2?3:2;shadeScale.value=String(shadeDenominator);$('#shade-denominator-value').textContent=String(shadeDenominator);}
 const visual=$('#practice-game-visual'),interactive=$('#practice-interactive-visual'),answers=$('#practice-game-answers');visual.replaceChildren();interactive.replaceChildren();interactive.hidden=activePracticeMode!=='shade';$('#practice-live-count').textContent='';
 if(activePracticeMode==='shade')renderShadePieces();
 else if(activePracticeMode==='match')visual.append(makeFractionPicture(q.n,q.d));
 else if(activePracticeMode==='compare'){[q.a,q.b].forEach(f=>{const card=document.createElement('div');card.className='compare-fraction-card';card.append(makeFractionPicture(f.n,f.d));const label=document.createElement('strong');label.textContent=`${f.n}/${f.d}`;card.append(label);visual.append(card);});}
 else{const clue=document.createElement('div');clue.className='detective-clue';clue.textContent='🔎 Find the missing number';visual.append(clue);}
 answers.replaceChildren();$('#practice-check-shading').hidden=activePracticeMode!=='shade';
 if(activePracticeMode!=='shade'){
  let choices;
  if(activePracticeMode==='match') {
    const correct=`${q.n}/${q.d}`;
    choices=[correct,`${q.n===1?2:q.n-1}/${q.d}`,`${q.n}/${q.d+1}`,`${Math.min(q.d,q.n+1)}/${q.d}`];
    choices=[...new Set(choices)];
    for(let d=q.d+2;choices.length<4;d++) {const candidate=`${q.n}/${d}`;if(!choices.includes(candidate)&&candidate!==correct)choices.push(candidate);}
  } else if(activePracticeMode==='compare') choices=[q.a.n+'/'+q.a.d,q.b.n+'/'+q.b.d];
  else choices=q.answers.slice();
  choices.sort(()=>Math.random()-.5).forEach(answer=>{const b=document.createElement('button');b.type='button';b.className='answer-button';b.textContent=answer;b.addEventListener('click',()=>answerMiniPractice(answer,b));answers.append(b);});
 }
 $('#practice-game-feedback').hidden=true;$('#practice-game-feedback').className='feedback-message';$('#practice-game-next').disabled=true;$('#practice-game-next').textContent=activePracticeQuestion%qs.length===qs.length-1?'Play another round →':'Next question →';$('#practice-game-hint-message').hidden=true;$('#practice-game-hint').disabled=false;$('#practice-check-shading').disabled=false;
}
function showShadeRetry(message){const feedback=$('#practice-game-feedback');feedback.hidden=false;feedback.className='feedback-message try-again';feedback.textContent=message;}
function checkShadePractice(){
 if(activePracticeAnswered)return;const q=practiceActivities.shade.questions[activePracticeQuestion%practiceActivities.shade.questions.length];
 if(q.type==='build'&&shadeDenominator!==q.d){shadeSelection.clear();renderShadePieces();showShadeRetry(`Your model has ${shadeDenominator} parts, but the denominator needs to be ${q.d}. Adjust the scale and try again.`);return;}
 if(shadeSelection.size!==q.n){showShadeRetry(`You shaded ${shadeSelection.size} piece${shadeSelection.size===1?'':'s'}. Try shading exactly ${q.n}.`);return;}
 finishMiniPractice(true,q.explain);
}
function finishMiniPractice(correct,explain){
 if(activePracticeMode==='shade'){const q=practiceActivities.shade.questions[activePracticeQuestion%practiceActivities.shade.questions.length];$$('.shade-piece',$('#practice-interactive-visual')).forEach(b=>b.disabled=true);$('#practice-check-shading').disabled=true;correct=shadeSelection.size===q.n;}
 activePracticeAnswered=true;const feedback=$('#practice-game-feedback');feedback.hidden=false;feedback.className='feedback-message '+(correct?'good':'try-again');feedback.textContent=(correct?'Brilliant! 🌟 ':'Good try! 💛 ')+explain;$('#practice-game-next').disabled=false;$('#practice-game-hint').disabled=true;progress.practiceAnswered++;if(correct){progress.practiceCorrect++;const qs=practiceActivities[activePracticeMode].questions;const rewardKey='practice-'+activePracticeMode+'-question-'+(activePracticeQuestion%qs.length);const firstReward=window.PlaygroundGamification?window.PlaygroundGamification.awardQuestion(rewardKey,10,3):true;if(firstReward)progress.points+=10;}saveProgress();playTone(correct);
}
function answerMiniPractice(answer,clicked){
 if(activePracticeAnswered)return;const q=practiceActivities[activePracticeMode].questions[activePracticeQuestion%practiceActivities[activePracticeMode].questions.length],correct=String(answer)===(activePracticeMode==='match'?q.n+'/'+q.d:q.correct);activePracticeAnswered=true;
 $$('.answer-button',$('#practice-game-answers')).forEach(b=>{b.disabled=true;if(b.textContent===(activePracticeMode==='match'?q.n+'/'+q.d:q.correct))b.classList.add('correct');});if(clicked&&!correct)clicked.classList.add('incorrect');finishMiniPractice(correct,q.explain);
}
function nextMiniPractice(){const qs=practiceActivities[activePracticeMode].questions;activePracticeQuestion=(activePracticeQuestion+1)%qs.length;renderPracticeQuestion();}
function makeChallengeFractionCard(f) {
  const value = `${f.n}/${f.d}`;
  const card = document.createElement('div');
  card.className = 'fraction-choice-visual';
  const bar = document.createElement('div'); bar.className = 'fraction-bar';
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', `${f.n} of ${f.d} parts shaded`);
  for (let i = 0; i < f.d; i++) {
    const part = document.createElement('span');
    if (i < f.n) part.className = 'filled';
    bar.append(part);
  }
  const label = document.createElement('strong'); label.textContent = value;
  card.append(bar, label);
  return card;
}
function activeChallengeIndexes() {
  const level = window.PlaygroundGamification && window.PlaygroundGamification.getLevel(activeChallengeLevelId);
  return level ? level.questionIndexes : challengeQuestions.map((_, index) => index);
}
function renderChallenge() {
  const indexes = activeChallengeIndexes();
  const questionIndex = indexes[challengeIndex % indexes.length];
  const q = challengeQuestions[questionIndex];
  challengeAnswered = false;
  $('#challenge-question').textContent = q.prompt;
  const visuals = $('#challenge-visuals');
  const answers = $('#challenge-answers');
  visuals.replaceChildren(); answers.replaceChildren();
  visuals.className = 'challenge-visuals';
  if (q.fractions) {
    q.fractions.forEach(f => visuals.append(makeChallengeFractionCard(f)));
  } else if (q.type === 'number-line') {
    const line = document.createElement('div');
    line.className = 'challenge-number-line';
    line.setAttribute('role', 'img');
    line.setAttribute('aria-label', 'A number line from zero to one, divided into four equal intervals');
    const track = document.createElement('div'); track.className = 'number-line-track';
    [0, 25, 50, 75, 100].forEach((position, index) => {
      const mark = document.createElement('span');
      mark.className = 'number-line-mark' + (index === 2 ? ' midpoint' : '');
      mark.style.left = position + '%';
      const label = document.createElement('span');
      label.className = 'number-line-label';
      label.textContent = index === 0 ? '0' : index === 4 ? '1' : '';
      label.style.left = position + '%';
      track.append(mark, label);
    });
    line.append(track);
    const note = document.createElement('p');
    note.textContent = 'Look at the middle point between 0 and 1.';
    line.append(note);
    visuals.append(line);
  } else {
    const expression = document.createElement('div');
    expression.className = 'challenge-expression';
    expression.textContent = q.expression || 'Think carefully about each statement.';
    visuals.append(expression);
  }
  [...q.choices].sort(() => Math.random() - 0.5).forEach(value => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-button challenge-answer';
    button.textContent = value;
    button.addEventListener('click', () => answerChallenge(value, button));
    answers.append(button);
  });
  $('#challenge-feedback').hidden = true;
  $('#challenge-feedback').className = 'feedback-message';
  $('#challenge-next').disabled = true;
  $('#challenge-hint-message').hidden = true;
  $('#challenge-hint').disabled = false;
  $('#challenge-answers').setAttribute('aria-label', 'Choose your answer');
  const counter = $('#challenge-counter');
  if (counter) counter.textContent = `QUESTION ${challengeIndex % indexes.length + 1} OF ${indexes.length}`;
  const level = window.PlaygroundGamification && window.PlaygroundGamification.getLevel(activeChallengeLevelId);
  const badge = $('.challenge-badge');
  if (badge) badge.textContent = level ? `⭐ LEVEL ${level.number}` : '⭐ CHALLENGE';
  const title = $('#challenge-level-title');
  if (title) title.textContent = level ? `${level.title} · ${level.subtitle}` : 'Challenge time';
  const next = $('#challenge-next');
  if (next) next.textContent = challengeIndex % indexes.length === indexes.length - 1 ? 'Finish level →' : 'Next challenge →';
}
function answerChallenge(answer, clicked) {
  if (challengeAnswered) return;
  challengeAnswered = true;
  const indexes = activeChallengeIndexes();
  const questionIndex = indexes[challengeIndex % indexes.length];
  const q = challengeQuestions[questionIndex];
  const correct = answer === q.correct;
  $$('.answer-button', $('#challenge-answers')).forEach(button => {
    button.disabled = true;
    if (button.textContent === q.correct) button.classList.add('correct');
  });
  if (!correct) clicked.classList.add('incorrect');
  const feedback = $('#challenge-feedback');
  feedback.hidden = false;
  feedback.className = 'feedback-message ' + (correct ? 'good' : 'try-again');
  feedback.textContent = (correct ? 'Amazing thinking! 🏆 ' : 'Keep going! 🌱 ') + q.explain;
  $('#challenge-next').disabled = false;
  $('#challenge-hint').disabled = true;
  progress.challengeAnswered++;
  challengeRunAnswered++;
  if (correct) {
    progress.challengeCorrect++;
    challengeRunCorrect++;
    const rewardKey = 'fraction-challenge-question-' + questionIndex;
    const firstReward = window.PlaygroundGamification ? window.PlaygroundGamification.awardQuestion(rewardKey, 20, 5) : true;
    if (firstReward) progress.points += 20;
  }
  saveProgress(); playTone(correct);
  if (challengeRunAnswered >= indexes.length) {
    const percent = Math.round((challengeRunCorrect / indexes.length) * 100);
    const result = window.PlaygroundGamification ? window.PlaygroundGamification.recordLevel(activeChallengeLevelId, percent) : { stars: percent >= 100 ? 3 : percent >= 80 ? 2 : percent >= 60 ? 1 : 0, coinsAwarded: 0 };
    const stars = result.bestStars || result.stars || 0;
    feedback.textContent += ` Level finished: ${percent}% · ${'★'.repeat(stars)}${'☆'.repeat(3-stars)}. ${result.coinsAwarded ? `You earned ${result.coinsAwarded} coins! ` : ''}${stars ? 'Great work! Check the adventure map for your next level.' : 'Try again to earn your first star and unlock the next level.'}`;
    const nextButton = $('#challenge-next');
    if (nextButton) nextButton.textContent = 'Back to adventure map';
  }
}
function bindHint(buttonId, messageId, getHint) {
  $(buttonId).addEventListener('click', () => {
    const box = $(messageId); box.textContent = getHint(); box.hidden = false;
  });
}

if ($('#fraction-workspace')) {
 $$('.tab-button').forEach(button=>button.addEventListener('click',()=>switchPanel(button.dataset.panel)));
 $$('[data-go]').forEach(button=>button.addEventListener('click',()=>{switchPanel(button.dataset.go);if(button.dataset.go==='practice')renderPracticeMenu();}));
 $$('.tab-button').forEach(button=>button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('.tab-button'),current=tabs.indexOf(button),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();switchPanel(tabs[next].dataset.panel);}));
 $$('[data-shape]').forEach(button=>button.addEventListener('click',()=>{modelShape=button.dataset.shape;selectedSlices.clear();$$('[data-shape]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});renderPizza();}));
 const denominatorSlider=$('#denominator-slider');if(denominatorSlider)denominatorSlider.addEventListener('input',()=>setModelDenominator(denominatorSlider.value));
 const denominatorMinus=$('#denominator-minus');if(denominatorMinus)denominatorMinus.addEventListener('click',()=>setModelDenominator(modelDenominator-1));
 const denominatorPlus=$('#denominator-plus');if(denominatorPlus)denominatorPlus.addEventListener('click',()=>setModelDenominator(modelDenominator+1));
 $$('[data-split]').forEach(button=>button.addEventListener('click',()=>{modelSplit=button.dataset.split;if(modelSplit==='diagonal')modelDenominator=2;else if(modelSplit==='quarters')modelDenominator=4;selectedSlices.clear();$$('[data-split]').forEach(item=>{const active=item.dataset.split===modelSplit;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});renderPizza();}));
 $('#pizza-reset').addEventListener('click',()=>{selectedSlices.clear();renderPizza();});
 $('#practice-menu-back').addEventListener('click',()=>{activePracticeMode=null;renderPracticeMenu();});
 $('#practice-game-next').addEventListener('click',nextMiniPractice);
 $('#practice-check-shading').addEventListener('click',checkShadePractice);
 const shadeScale=$('#shade-denominator-control');if(shadeScale)shadeScale.addEventListener('input',()=>{shadeDenominator=Number(shadeScale.value);shadeSelection.clear();$('#shade-denominator-value').textContent=String(shadeDenominator);$('#practice-game-feedback').hidden=true;$('#practice-check-shading').disabled=false;renderShadePieces();});
 $('#practice-game-hint').addEventListener('click',()=>{const q=practiceActivities[activePracticeMode].questions[activePracticeQuestion%practiceActivities[activePracticeMode].questions.length];const box=$('#practice-game-hint-message');box.textContent=q.hint;box.hidden=false;});
 $('#challenge-next').addEventListener('click',()=>{
   const indexes = activeChallengeIndexes();
   if (challengeRunAnswered >= indexes.length) { challengeRunAnswered=0; challengeRunCorrect=0; challengeIndex=0; renderChallenge(); if(window.PlaygroundGamification)window.PlaygroundGamification.renderMap(); const map=$('#challenge-map'); if(map)map.scrollIntoView({behavior:'smooth',block:'start'}); return; }
   challengeIndex++;renderChallenge();
 });
 renderPracticeMenu();
 bindHint('#challenge-hint','#challenge-hint-message',()=>{const indexes=activeChallengeIndexes();return challengeQuestions[indexes[challengeIndex%indexes.length]].hint;});
 document.addEventListener('challengelevelselected',event=>{activeChallengeLevelId=event.detail.levelId;challengeIndex=0;challengeRunAnswered=0;challengeRunCorrect=0;switchPanel('challenge');renderChallenge();});
 const requestedLevel=new URLSearchParams(location.search).get('level');
 if(requestedLevel&&window.PlaygroundGamification&&window.PlaygroundGamification.isUnlocked(window.PlaygroundGamification.getLevel(requestedLevel))){activeChallengeLevelId=requestedLevel;switchPanel('challenge');}
 $('#reset-progress').addEventListener('click',()=>{if(!window.confirm('Reset this learner’s points, question totals, challenge stars, coins, purchases, and completed lesson activities? This cannot be undone. Export a backup first if you may want to keep this progress.'))return;progress={...defaultProgress};practiceIndex=0;challengeIndex=0;challengeRunAnswered=0;challengeRunCorrect=0;activePracticeMode=null;try{const activityKey=window.LearnerProfiles?window.LearnerProfiles.storageKey('maths-playground-learning-activities-v1'):'maths-playground-learning-activities-v1';localStorage.setItem(activityKey,'{}');}catch{}if(window.PlaygroundGamification)window.PlaygroundGamification.resetForCurrentLearner();saveProgress();renderPracticeMenu();renderChallenge();showToast('Progress reset. A fresh start! 🌱');});
 renderPizza();renderPracticeMenu();renderChallenge();
}
document.addEventListener('learningprogresschange',()=>{progress=loadProgress();renderProgress();});
const soundToggle=$('#sound-toggle');
if(soundToggle)soundToggle.addEventListener('click',()=>{soundEnabled=!soundEnabled;soundToggle.textContent=soundEnabled?'🔊':'🔈';soundToggle.setAttribute('aria-pressed',String(soundEnabled));soundToggle.setAttribute('aria-label',soundEnabled?'Turn sound effects off':'Turn sound effects on');if(soundEnabled)playTone(true);});
renderProgress();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    const nestedModulePage = location.pathname.includes('/modules/');
    const scriptUrl = nestedModulePage ? '../../service-worker.js' : './service-worker.js';
    const scope = nestedModulePage ? '../../' : './';
    navigator.serviceWorker.register(scriptUrl, { scope }).catch(() => {
      // The app remains usable if offline installation is unavailable.
    });
  });
}