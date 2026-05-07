/* =========================================
   MindGuard · check.js
   자가 진단 질문 흐름 & 결과 계산
   ========================================= */

/* ── 질문 데이터 ── */
const QUESTIONS = [
  {
    cat:'😴 수면', catKey:'수면', num:'Q1 · 수면 패턴',
    text:'지난 2주 동안, 잠들기가 어렵거나 자다가 자주 깼나요?',
    hint:'수면의 질과 양 모두를 고려해 답해주세요.',
    type:'freq',
    opts:[
      {emoji:'😌', label:'전혀 없음',    days:'0일',  score:0},
      {emoji:'😕', label:'가끔 그랬음', days:'2~3일', score:1},
      {emoji:'😟', label:'자주 그랬음', days:'7일 이상', score:2},
      {emoji:'😩', label:'거의 매일',   days:'매일',  score:3},
    ]
  },
  {
    cat:'😴 수면', catKey:'수면', num:'Q2 · 수면 시간',
    text:'평소 하루 평균 수면 시간이 얼마나 되나요?',
    hint:'주말 포함 최근 2주 기준으로 답해주세요.',
    type:'slider',
    sliderMin:3, sliderMax:12, sliderDefault:7, sliderUnit:'시간',
    scoreFunc: v => v < 5 ? 3 : v < 6 ? 2 : v < 7 ? 1 : 0,
  },
  {
    cat:'😔 기분', catKey:'우울', num:'Q3 · 감정 상태',
    text:'지난 2주 동안, 기분이 가라앉거나 우울하다고 느꼈나요?',
    hint:'순간적인 감정이 아닌 전반적인 기분을 기준으로 해주세요.',
    type:'freq',
    opts:[
      {emoji:'😄', label:'전혀 없음',    days:'0일',     score:0},
      {emoji:'😐', label:'가끔 그랬음', days:'2~3일',   score:1},
      {emoji:'😟', label:'자주 그랬음', days:'7일 이상', score:2},
      {emoji:'😞', label:'거의 매일',   days:'매일',     score:3},
    ]
  },
  {
    cat:'😔 기분', catKey:'우울', num:'Q4 · 흥미·즐거움',
    text:'평소 즐기던 일에 흥미나 즐거움이 사라진 것 같나요?',
    hint:'취미, 친구 만남, 공부 등 좋아하던 활동을 떠올려 보세요.',
    type:'standard',
    opts:[
      {label:'아니요, 여전히 즐겁게 하고 있어요', score:0},
      {label:'조금 줄었지만 여전히 즐겨요',       score:1},
      {label:'상당히 줄었어요',                   score:2},
      {label:'거의 아무것도 즐겁지 않아요',        score:3},
    ]
  },
  {
    cat:'⚡ 에너지', catKey:'피로', num:'Q5 · 피로감',
    text:'지난 2주 동안, 이유 없이 피곤하거나 에너지가 부족하다고 느꼈나요?',
    hint:'충분히 잤음에도 피곤한 경우도 포함합니다.',
    type:'freq',
    opts:[
      {emoji:'💪', label:'전혀 없음',    days:'0일',     score:0},
      {emoji:'🙂', label:'가끔 그랬음', days:'2~3일',   score:1},
      {emoji:'😮‍💨', label:'자주 그랬음', days:'7일 이상', score:2},
      {emoji:'🪫', label:'거의 매일',   days:'매일',     score:3},
    ]
  },
  {
    cat:'🧠 집중', catKey:'집중력', num:'Q6 · 집중력',
    text:'최근 공부나 과제에 집중하기가 평소보다 어려워졌나요?',
    hint:'수업 중 멍해지거나, 읽은 내용이 기억나지 않는 경우도 포함합니다.',
    type:'standard',
    opts:[
      {label:'아니요, 집중 잘 돼요',    score:0},
      {label:'조금 어렵지만 괜찮아요',  score:1},
      {label:'상당히 어려워졌어요',     score:2},
      {label:'집중이 거의 안 돼요',     score:3},
    ]
  },
  {
    cat:'👥 관계', catKey:'사회성', num:'Q7 · 사회적 관계',
    text:'요즘 친구나 가족을 만나거나 연락하는 게 귀찮거나 부담스럽게 느껴지나요?',
    hint:'평소와 비교해서 얼마나 달라졌는지 생각해보세요.',
    type:'freq',
    opts:[
      {emoji:'😊', label:'전혀 그렇지 않음', days:'0일',     score:0},
      {emoji:'😶', label:'가끔 그래요',      days:'2~3일',   score:1},
      {emoji:'😬', label:'자주 그래요',      days:'7일 이상', score:2},
      {emoji:'🙈', label:'거의 매일 그래요', days:'매일',     score:3},
    ]
  },
  {
    cat:'💭 자기인식', catKey:'자존감', num:'Q8 · 자기 평가',
    text:'자신이 쓸모없거나 남에게 짐이 된다는 생각이 드나요?',
    hint:'이런 생각이 자주 든다면 꼭 전문가와 이야기해보세요.',
    type:'standard',
    opts:[
      {label:'전혀 그런 생각 안 해요',          score:0},
      {label:'가끔 그런 생각이 들어요',          score:1},
      {label:'꽤 자주 그런 생각이 들어요',       score:2},
      {label:'거의 매일 그런 생각이 들어요',     score:3},
    ]
  },
  {
    cat:'🌱 전반적', catKey:'전체', num:'Q9 · 전반적 컨디션',
    text:'지금 이 순간 자신의 정신건강 상태를 스스로 어떻게 평가하나요?',
    hint:'직관적으로 느끼는 그대로 답해주세요.',
    type:'slider',
    sliderMin:0, sliderMax:100, sliderDefault:50,
    sliderUnit:'점 (0 = 매우 나쁨, 100 = 매우 좋음)',
    scoreFunc: v => v >= 70 ? 0 : v >= 50 ? 1 : v >= 30 ? 2 : 3,
  },
];

const DIM_COLORS = {
  수면:'#818cf8', 우울:'#f472b6', 피로:'#f59e0b',
  집중력:'#2dd4bf', 사회성:'#34d399', 자존감:'#fb923c', 전체:'#60a5fa'
};

const RESOURCES = {
  low: [
    {icon:'🏫', bg:'rgba(129,100,248,.15)', name:'경북대 학생상담센터',    desc:'개인상담 예약 · 053-950-2124 · 무료'},
    {icon:'💻', bg:'rgba(45,212,191,.15)',  name:'마음이음 온라인 상담',   desc:'익명 채팅 상담 · 24시간 · 무료'},
  ],
  mid: [
    {icon:'🏫', bg:'rgba(45,212,191,.15)',  name:'경북대 학생상담센터',    desc:'우선 예약 가능 · 053-950-2124'},
    {icon:'🌐', bg:'rgba(129,100,248,.15)', name:'대구청년센터 심리지원',  desc:'심리검사 + 상담 연계 · 무료'},
  ],
  high: [
    {icon:'📞', bg:'rgba(239,68,68,.15)',   name:'자살예방상담전화',       desc:'24시간 운영 · 1393 (무료, 익명)'},
    {icon:'🏥', bg:'rgba(239,68,68,.12)',   name:'대구시 정신건강복지센터',desc:'24시간 위기상담 · 1577-0199'},
    {icon:'🏫', bg:'rgba(245,158,11,.15)',  name:'경북대 학생상담센터',    desc:'긴급 대면 상담 가능 · 053-950-2124'},
  ]
};

/* ── 상태 ── */
let current = 0;
let answers = new Array(QUESTIONS.length).fill(null);

/* ── 초기화 ── */
function init() {
  renderDots();
  renderQuestion();
}

/* ── 스텝 점 ── */
function renderDots() {
  const cont = document.getElementById('stepDots');
  if (!cont) return;
  cont.innerHTML = QUESTIONS.map((_, i) =>
    `<div class="step-dot ${i < current ? 'done' : i === current ? 'active' : ''}" id="dot${i}"></div>`
  ).join('');
}

function updateDots() {
  QUESTIONS.forEach((_, i) => {
    const d = document.getElementById('dot' + i);
    if (!d) return;
    d.className = 'step-dot ' + (i < current ? 'done' : i === current ? 'active' : '');
  });
}

/* ── 질문 렌더 ── */
function renderQuestion() {
  const q = QUESTIONS[current];
  const pct = Math.round(((current + 1) / QUESTIONS.length) * 100);

  setText('progressLabel', `${current + 1} / ${QUESTIONS.length}`);
  setText('progressPct',   `${pct}%`);
  setStyle('progressFill', 'width', `${pct}%`);
  setText('qCategory', q.cat);
  setText('qNum',      q.num);
  setText('qText',     q.text);
  setText('qHint',     q.hint);

  const cont = document.getElementById('optionsContainer');
  cont.innerHTML = '';

  if (q.type === 'freq') {
    const grid = document.createElement('div');
    grid.className = 'freq-opts';
    q.opts.forEach((opt, i) => {
      const el = document.createElement('div');
      el.className = 'freq-opt' + (answers[current] === i ? ' selected' : '');
      el.innerHTML = `<div class="freq-emoji">${opt.emoji}</div>
                      <div class="freq-label">${opt.label}</div>
                      <div class="freq-days">${opt.days}</div>`;
      el.addEventListener('click', () => selectOpt(i));
      grid.appendChild(el);
    });
    cont.appendChild(grid);

  } else if (q.type === 'standard') {
    const wrap = document.createElement('div');
    wrap.className = 'options';
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'opt' + (answers[current] === i ? ' selected' : '');
      btn.innerHTML = `<span class="opt-circle">${answers[current] === i ? '✓' : ''}</span>
                       ${opt.label}
                       <span class="opt-score">${opt.score}점</span>`;
      btn.addEventListener('click', () => selectOpt(i));
      wrap.appendChild(btn);
    });
    cont.appendChild(wrap);

  } else if (q.type === 'slider') {
    const saved = answers[current] !== null ? answers[current] : q.sliderDefault;
    const wrap  = document.createElement('div');
    wrap.className = 'slider-wrap';
    const fillPct = Math.round((saved - q.sliderMin) / (q.sliderMax - q.sliderMin) * 100);
    wrap.innerHTML = `
      <div class="slider-value" id="sliderVal">${saved}</div>
      <div class="slider-unit">${q.sliderUnit}</div>
      <input type="range" id="sliderInput"
        min="${q.sliderMin}" max="${q.sliderMax}" value="${saved}" step="1"
        style="background:linear-gradient(90deg,#2dd4bf ${fillPct}%,rgba(255,255,255,.1) 0%)">
      <div class="slider-labels"><span>${q.sliderMin}</span><span>${q.sliderMax}</span></div>`;
    cont.appendChild(wrap);

    document.getElementById('sliderInput').addEventListener('input', function () {
      const v = parseInt(this.value);
      const p = Math.round((v - q.sliderMin) / (q.sliderMax - q.sliderMin) * 100);
      document.getElementById('sliderVal').textContent = v;
      this.style.background = `linear-gradient(90deg,#2dd4bf ${p}%,rgba(255,255,255,.1) 0%)`;
      answers[current] = v;
      document.getElementById('nextBtn').disabled = false;
    });

    if (answers[current] === null) {
      answers[current] = saved;
    }
  }

  document.getElementById('prevBtn').disabled = current === 0;
  document.getElementById('nextBtn').disabled = answers[current] === null;
  document.getElementById('nextBtn').textContent =
    current === QUESTIONS.length - 1 ? '결과 보기 →' : '다음 →';

  updateDots();
}

function selectOpt(i) {
  answers[current] = i;
  renderQuestion();
  document.getElementById('nextBtn').disabled = false;
}

/* ── 이전 / 다음 ── */
function prevQ() {
  if (current > 0) { current--; renderQuestion(); }
}

function nextQ() {
  if (answers[current] === null) return;
  if (current < QUESTIONS.length - 1) { current++; renderQuestion(); }
  else showResult();
}

/* ── 결과 ── */
function showResult() {
  document.getElementById('questionWrapper').style.display = 'none';
  document.getElementById('progressArea').style.display   = 'none';
  document.getElementById('stepDots').style.display       = 'none';
  setText('topbarTitle', '분석 결과');
  document.getElementById('resultScreen').classList.add('show');

  /* 차원별 점수 */
  const dimScores = {};
  QUESTIONS.forEach((q, i) => {
    const raw = q.type === 'slider'
      ? q.scoreFunc(answers[i] ?? q.sliderDefault)
      : q.opts[answers[i] ?? 0].score;
    if (!dimScores[q.catKey]) dimScores[q.catKey] = [];
    dimScores[q.catKey].push(raw);
  });

  const totalRaw   = Object.values(dimScores).flat().reduce((a, b) => a + b, 0);
  const healthScore = Math.round((1 - totalRaw / (QUESTIONS.length * 3)) * 100);

  setTimeout(() => {
    setText('ringScore', healthScore);
    document.getElementById('resultCircle').style.strokeDashoffset =
      390 * (1 - healthScore / 100);
  }, 200);

  let level, desc, risk, levelColor;
  if (healthScore >= 75) {
    level = '✅ 양호'; risk = 'low'; levelColor = 'var(--safe)';
    desc  = '현재 정신건강 상태가 전반적으로 양호합니다. 꾸준한 자기관리로 좋은 상태를 유지하세요.';
  } else if (healthScore >= 50) {
    level = '⚠️ 경미한 주의'; risk = 'mid'; levelColor = 'var(--warn)';
    desc  = '일부 영역에서 주의 신호가 감지됩니다. 지금 전문가와 이야기해두면 큰 도움이 됩니다.';
  } else {
    level = '🔴 즉각 지원 권장'; risk = 'high'; levelColor = 'var(--danger)';
    desc  = '여러 영역에서 이상 신호가 감지됩니다. 혼자 감당하지 마시고 아래 전문 기관에 꼭 연락해보세요.';
  }

  const chip = document.getElementById('resultLevelChip');
  chip.textContent  = level;
  chip.style.color  = levelColor;
  setText('resultDesc', desc);

  /* 차원 바 */
  const barsHtml = Object.keys(dimScores).map(dim => {
    const avg = dimScores[dim].reduce((a, b) => a + b, 0) / dimScores[dim].length;
    const pct = Math.round((1 - avg / 3) * 100);
    const col = DIM_COLORS[dim] || '#818cf8';
    return `<div class="dim-bar-item">
      <div class="dim-bar-meta">
        <span style="font-size:12px;color:var(--sub)">${dim}</span>
        <span style="font-size:12px;font-family:'Space Grotesk',sans-serif;color:${col};font-weight:600">${pct}%</span>
      </div>
      <div class="dim-track">
        <div class="dim-fill" style="width:0%;background:${col}" data-w="${pct}"></div>
      </div>
    </div>`;
  }).join('');
  document.getElementById('dimBars').innerHTML = barsHtml;
  setTimeout(() => {
    document.querySelectorAll('.dim-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
  }, 350);

  /* AI 분석 */
  const aiTexts = {
    low:  `수면·집중·기분 지표 모두 <strong>정상 범위</strong>입니다. 전반적 자기보고 점수도 양호하며, 이상 패턴이 감지되지 않았습니다. 주 1회 간단한 자기 체크로 현재 상태를 유지하세요.`,
    mid:  `<strong>수면 또는 집중력 저하</strong> 신호가 감지됩니다. 현재는 경미한 수준이지만, 방치 시 심화될 수 있습니다. 경북대 상담센터 초기 상담(무료)으로 예방적 관리를 권장합니다.`,
    high: `<strong>복수의 우울 지표가 임계값을 초과</strong>했습니다. 수면·기분·사회성·자존감 영역에서 동시 이상이 감지됩니다. 전문적 개입이 필요합니다. 모든 데이터는 이 기기 안에서만 처리되었습니다.`
  };
  document.getElementById('aiBox').style.display = 'block';
  document.getElementById('aiBody').innerHTML    = aiTexts[risk];

  /* 추천 자원 */
  document.getElementById('resourceCards').innerHTML =
    RESOURCES[risk].map(r => `
      <div class="res-card">
        <div class="res-icon" style="background:${r.bg}">${r.icon}</div>
        <div>
          <div class="res-name">${r.name}</div>
          <div class="res-desc">${r.desc}</div>
        </div>
        <div class="res-arrow">›</div>
      </div>`).join('');
}

function restart() {
  answers = new Array(QUESTIONS.length).fill(null);
  current = 0;
  document.getElementById('resultScreen').classList.remove('show');
  document.getElementById('questionWrapper').style.display = '';
  document.getElementById('progressArea').style.display    = '';
  document.getElementById('stepDots').style.display        = '';
  setText('topbarTitle', '마음 체크');
  renderDots();
  renderQuestion();
}

/* ── 유틸 ── */
function setText(id, val)          { const el = document.getElementById(id); if (el) el.textContent = val; }
function setStyle(id, prop, val)   { const el = document.getElementById(id); if (el) el.style[prop] = val; }

/* ── 실행 ── */
document.addEventListener('DOMContentLoaded', init);