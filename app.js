const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE_KEY = 'maths-playground-progress-v1';
const defaultProgress = { points: 0, practiceCorrect: 0, practiceAnswered: 0, challengeCorrect: 0, challengeAnswered: 0 };
let progress = loadProgress();
let practiceIndex = 0;
let practiceAnswered = false;
let challengeIndex = 0;
let challengeAnswered = false;
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
  { fractions: [{n:1,d:2},{n:1,d:4},{n:3,d:4}], correct: '3/4', hint: 'Imagine each fraction as a pizza. Which one covers the most pizza?', explain: '3/4 is the largest: three of four equal parts is more than one half or one quarter.' },
  { fractions: [{n:2,d:3},{n:1,d:3},{n:3,d:3}], correct: '3/3', hint: 'One fraction fills every part. Which one has the same number on top and bottom?', explain: '3/3 is one whole, so it is larger than 2/3 and 1/3.' },
  { fractions: [{n:1,d:5},{n:1,d:2},{n:1,d:4}], correct: '1/2', hint: 'When the top number is 1, fewer equal pieces means each piece is bigger.', explain: 'One half is larger than one quarter and one fifth.' },
  { fractions: [{n:2,d:4},{n:3,d:4},{n:1,d:4}], correct: '3/4', hint: 'All the fractions have the same bottom number. Compare the top numbers.', explain: 'When the denominators match, the fraction with the largest numerator is largest: 3/4.' },
  { fractions: [{n:2,d:6},{n:4,d:6},{n:1,d:6}], correct: '4/6', hint: 'Each fraction is made from sixths. Which one has the most sixths?', explain: '4/6 has four sixths, which is more than two sixths or one sixth.' }
];

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...defaultProgress, ...saved };
  } catch { return { ...defaultProgress }; }
}
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Storage may be disabled. */ }
  renderProgress();
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
  const percent = Math.min(100, Math.round((Math.min(answered, practiceQuestions.length) / practiceQuestions.length) * 100));
  if (progressBar) progressBar.style.width = percent + '%';
  if (progressLabel) progressLabel.textContent = answered
    ? `${Math.min(answered, practiceQuestions.length)} of ${practiceQuestions.length} practice questions tried`
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
let modelShape='pizza';
let modelSplit='quarters';
function getModelSegments(){
 const circle=modelShape==='pizza',x=modelShape==='square'?50:30,y=modelShape==='square'?25:45,w=modelShape==='square'?140:180,h=modelShape==='square'?140:110;
 if(circle){
  if(modelSplit==='quarters')return [
   {d:'M120 100 L120 20 A80 80 0 0 1 200 100 Z',label:'Top-right quarter'},
   {d:'M120 100 L200 100 A80 80 0 0 1 120 180 Z',label:'Bottom-right quarter'},
   {d:'M120 100 L120 180 A80 80 0 0 1 40 100 Z',label:'Bottom-left quarter'},
   {d:'M120 100 L40 100 A80 80 0 0 1 120 20 Z',label:'Top-left quarter'}];
  if(modelSplit==='horizontal')return [
   {d:'M40 100 A80 80 0 0 1 200 100 L120 100 Z',label:'First half'},
   {d:'M200 100 A80 80 0 0 1 40 100 L120 100 Z',label:'Second half'}];
  if(modelSplit==='vertical')return [
   {d:'M120 20 A80 80 0 0 0 120 180 L120 100 Z',label:'Left half'},
   {d:'M120 180 A80 80 0 0 0 120 20 L120 100 Z',label:'Right half'}];
  return [
   {d:'M176.6 43.4 A80 80 0 0 1 63.4 156.6 Z',label:'Diagonal half one'},
   {d:'M63.4 156.6 A80 80 0 0 1 176.6 43.4 Z',label:'Diagonal half two'}];
 }
 if(modelSplit==='horizontal')return [
  {d:`M${x} ${y} H${x+w} V${y+h/2} H${x} Z`,label:'Top half'},
  {d:`M${x} ${y+h/2} H${x+w} V${y+h} H${x} Z`,label:'Bottom half'}];
 if(modelSplit==='vertical')return [
  {d:`M${x} ${y} H${x+w/2} V${y+h} H${x} Z`,label:'Left half'},
  {d:`M${x+w/2} ${y} H${x+w} V${y+h} H${x+w/2} Z`,label:'Right half'}];
 if(modelSplit==='diagonal')return [
  {d:`M${x} ${y} H${x+w} L${x} ${y+h} Z`,label:'Diagonal half one'},
  {d:`M${x+w} ${y} V${y+h} H${x} Z`,label:'Diagonal half two'}];
 return [
  {d:`M${x} ${y} H${x+w/2} V${y+h/2} H${x} Z`,label:'Top-left quarter'},
  {d:`M${x+w/2} ${y} H${x+w} V${y+h/2} H${x+w/2} Z`,label:'Top-right quarter'},
  {d:`M${x+w/2} ${y+h/2} H${x+w} V${y+h} H${x+w/2} Z`,label:'Bottom-right quarter'},
  {d:`M${x} ${y+h/2} H${x+w/2} V${y+h} H${x} Z`,label:'Bottom-left quarter'}];
}
function renderPizza(){
 const model=$('#learn-pizza');if(!model)return;
 const segments=getModelSegments(),colors=['#ffc45f','#ff8da7','#8c83ed','#65d4ae'],ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 240 200');svg.setAttribute('class','fraction-model-svg');svg.setAttribute('role','group');svg.setAttribute('aria-label',`${modelShape} divided into ${segments.length} equal parts`);
 segments.forEach((segment,index)=>{
  const path=document.createElementNS(ns,'path');path.setAttribute('d',segment.d);path.setAttribute('fill',selectedSlices.has(index)?'#6b63df':colors[index%colors.length]);path.setAttribute('stroke','#fff');path.setAttribute('stroke-width','3');path.setAttribute('class','model-segment'+(selectedSlices.has(index)?' is-selected':''));path.setAttribute('role','button');path.setAttribute('tabindex','0');path.setAttribute('aria-label',segment.label);path.setAttribute('aria-pressed',String(selectedSlices.has(index)));
  const toggle=()=>{if(selectedSlices.has(index))selectedSlices.delete(index);else selectedSlices.add(index);renderPizza();};
  path.addEventListener('click',toggle);path.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});svg.append(path);
 });
 if(modelShape==='pizza'){const o=document.createElementNS(ns,'circle');o.setAttribute('cx','120');o.setAttribute('cy','100');o.setAttribute('r','80');o.setAttribute('fill','none');o.setAttribute('stroke','#fff');o.setAttribute('stroke-width','3');svg.append(o);}
 else{const o=document.createElementNS(ns,'rect');o.setAttribute('x',modelShape==='square'?'50':'30');o.setAttribute('y',modelShape==='square'?'25':'45');o.setAttribute('width',modelShape==='square'?'140':'180');o.setAttribute('height',modelShape==='square'?'140':'110');o.setAttribute('rx','2');o.setAttribute('fill','none');o.setAttribute('stroke','#fff');o.setAttribute('stroke-width','3');svg.append(o);}
 model.replaceChildren(svg);const count=selectedSlices.size,total=segments.length,name=modelShape==='pizza'?'pizza':modelShape;
 $('#pizza-readout').textContent=`${count}/${total}`;
 $('#pizza-caption').textContent=count===0?`A ${name} divided into ${total} equal parts. Tap a part to select it.`:count===total?`You selected all ${total} parts: one whole ${name}!`:`You selected ${count} of ${total} equal parts: ${count}/${total}.`;
}

function renderPractice() {
  const q = practiceQuestions[practiceIndex % practiceQuestions.length];
  practiceAnswered = false;
  $('#practice-counter').textContent = `QUESTION ${(practiceIndex % practiceQuestions.length) + 1} OF ${practiceQuestions.length}`;
  $('#practice-progress').style.width = `${((practiceIndex % practiceQuestions.length) / practiceQuestions.length) * 100}%`;
  $('#practice-question').textContent = q.question;
  $('#practice-visual').replaceChildren();
  for (let i = 0; i < q.parts; i++) {
    const piece = document.createElement('span');
    piece.className = 'chocolate-piece' + (i >= q.selected ? ' eaten' : '');
    piece.textContent = i < q.selected ? '✦' : '';
    piece.setAttribute('aria-hidden', 'true');
    $('#practice-visual').append(piece);
  }
  const answers = $('#practice-answers');
  answers.replaceChildren();
  q.answers.forEach(answer => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'answer-button'; button.textContent = answer;
    button.addEventListener('click', () => answerPractice(answer, button));
    answers.append(button);
  });
  $('#practice-feedback').hidden = true;
  $('#practice-feedback').className = 'feedback-message';
  $('#practice-next').disabled = true;
  $('#practice-next').textContent = practiceIndex % practiceQuestions.length === practiceQuestions.length - 1 ? 'Finish round →' : 'Next question →';
  $('#practice-hint-message').hidden = true;
  $('#practice-hint').disabled = false;
}
function answerPractice(answer, clicked) {
  if (practiceAnswered) return;
  practiceAnswered = true;
  const q = practiceQuestions[practiceIndex % practiceQuestions.length];
  const correct = answer === q.correct;
  $$('.answer-button', $('#practice-answers')).forEach(button => {
    button.disabled = true;
    if (button.textContent === q.correct) button.classList.add('correct');
  });
  if (!correct) clicked.classList.add('incorrect');
  const feedback = $('#practice-feedback');
  feedback.hidden = false;
  feedback.className = 'feedback-message ' + (correct ? 'good' : 'try-again');
  feedback.textContent = (correct ? 'Brilliant! 🌟 ' : 'Good try! 💛 ') + q.explain;
  $('#practice-next').disabled = false;
  $('#practice-hint').disabled = true;
  progress.practiceAnswered++;
  if (correct) { progress.points += 10; progress.practiceCorrect++; }
  saveProgress(); playTone(correct);
}
function nextPractice() {
  practiceIndex++;
  if (practiceIndex % practiceQuestions.length === 0) {
    showToast('Round complete! You can practise again or try the challenge.');
    switchPanel('challenge');
    renderChallenge();
    return;
  }
  renderPractice();
}
function renderChallenge() {
  const q = challengeQuestions[challengeIndex % challengeQuestions.length];
  challengeAnswered = false;
  $('#challenge-question').textContent = 'Which fraction is the largest?';
  const visuals = $('#challenge-visuals');
  const answers = $('#challenge-answers');
  visuals.replaceChildren(); answers.replaceChildren();
  q.fractions.forEach(f => {
    const value = `${f.n}/${f.d}`;
    const card = document.createElement('div');
    card.className = 'fraction-choice-visual';
    const bar = document.createElement('div'); bar.className = 'fraction-bar';
    for (let i = 0; i < f.d; i++) {
      const part = document.createElement('span');
      if (i < f.n) part.className = 'filled';
      bar.append(part);
    }
    const label = document.createElement('strong'); label.textContent = value;
    card.append(bar, label); visuals.append(card);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'answer-button'; button.textContent = value;
    button.addEventListener('click', () => answerChallenge(value, button));
    answers.append(button);
  });
  $('#challenge-feedback').hidden = true;
  $('#challenge-feedback').className = 'feedback-message';
  $('#challenge-next').disabled = true;
  $('#challenge-hint-message').hidden = true;
  $('#challenge-hint').disabled = false;
}
function answerChallenge(answer, clicked) {
  if (challengeAnswered) return;
  challengeAnswered = true;
  const q = challengeQuestions[challengeIndex % challengeQuestions.length];
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
  if (correct) { progress.points += 20; progress.challengeCorrect++; }
  saveProgress(); playTone(correct);
}
function bindHint(buttonId, messageId, getHint) {
  $(buttonId).addEventListener('click', () => {
    const box = $(messageId); box.textContent = getHint(); box.hidden = false;
  });
}

if ($('#fraction-workspace')) {
 $$('.tab-button').forEach(button=>button.addEventListener('click',()=>switchPanel(button.dataset.panel)));
 $$('[data-go]').forEach(button=>button.addEventListener('click',()=>{switchPanel(button.dataset.go);if(button.dataset.go==='practice')renderPractice();}));
 $$('.tab-button').forEach(button=>button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('.tab-button'),current=tabs.indexOf(button),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();switchPanel(tabs[next].dataset.panel);}));
 $$('[data-shape]').forEach(button=>button.addEventListener('click',()=>{modelShape=button.dataset.shape;selectedSlices.clear();$$('[data-shape]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});renderPizza();}));
 $$('[data-split]').forEach(button=>button.addEventListener('click',()=>{modelSplit=button.dataset.split;selectedSlices.clear();$$('[data-split]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});renderPizza();}));
 $('#pizza-reset').addEventListener('click',()=>{selectedSlices.clear();renderPizza();});
 $('#practice-next').addEventListener('click',nextPractice);
 $('#challenge-next').addEventListener('click',()=>{challengeIndex++;renderChallenge();});
 bindHint('#practice-hint','#practice-hint-message',()=>practiceQuestions[practiceIndex%practiceQuestions.length].hint);
 bindHint('#challenge-hint','#challenge-hint-message',()=>challengeQuestions[challengeIndex%challengeQuestions.length].hint);
 $('#reset-progress').addEventListener('click',()=>{if(!window.confirm('Reset your points and learning progress on this device?'))return;progress={...defaultProgress};practiceIndex=0;challengeIndex=0;saveProgress();renderPractice();renderChallenge();showToast('Progress reset. A fresh start! 🌱');});
 renderPizza();renderPractice();renderChallenge();
}
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