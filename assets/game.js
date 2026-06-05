// ===== GAME STATE =====
const G = {
  playerCount: 5,
  playerNames: [],
  currentPlayer: 0,
  word: '',
  imposterIndex: -1,
  cards: [],
  revealed: false,
};

// ===== SCREEN MANAGER =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function openMenu() { showScreen('screen-menu'); }

// ===== PLAYER COUNT =====
function openPlayerCount() {
  updateCount(G.playerCount);
  showScreen('screen-players');
}

function updateCount(n) {
  G.playerCount = Math.max(3, Math.min(10, n));
  document.getElementById('countNum').textContent = G.playerCount;
  document.getElementById('btnMinus').disabled = G.playerCount <= 3;
  document.getElementById('btnPlus').disabled = G.playerCount >= 10;
  const dots = document.querySelectorAll('.player-dot');
  dots.forEach((d, i) => d.classList.toggle('filled', i < G.playerCount));
}

// ===== PLAYER NAMES =====
function openNamesScreen() {
  const list = document.getElementById('namesList');
  list.innerHTML = '';
  for (let i = 0; i < G.playerCount; i++) {
    const row = document.createElement('div');
    row.className = 'name-row';
    row.style.animationDelay = (i * 0.05) + 's';
    row.innerHTML = `
      <div class="name-num">${i + 1}</div>
      <input class="input-field" id="name-${i}" type="text"
        placeholder="${i + 1}-chi oyinchi ismi..."
        value="${G.playerNames[i] || ''}"
        maxlength="20" autocomplete="off" autocorrect="off" autocapitalize="words">
    `;
    list.appendChild(row);
  }
  for (let i = 0; i < G.playerCount; i++) {
    document.getElementById(`name-${i}`).addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const next = document.getElementById(`name-${i + 1}`);
        if (next) next.focus(); else confirmNames();
      }
    });
  }
  showScreen('screen-names');
  setTimeout(() => document.getElementById('name-0')?.focus(), 300);
}

function confirmNames() {
  G.playerNames = [];
  for (let i = 0; i < G.playerCount; i++) {
    const val = document.getElementById(`name-${i}`)?.value.trim();
    G.playerNames.push(val || `${i + 1}-oyinchi`);
  }
  startGame();
}

// ===== START GAME =====
async function startGame() {
  try {
    const res = await fetch('api.php?action=random_word');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    G.word = data.word;
  } catch (e) {
    showToast("So'z yuklanmadi: " + e.message, 'error');
    return;
  }

  G.imposterIndex = Math.floor(Math.random() * G.playerCount);
  G.currentPlayer = 0;
  G.cards = Array.from({ length: G.playerCount }, (_, i) => ({
    index: i,
    isImposter: i === G.imposterIndex,
  }));

  showDealScreen();
}

// ===== DEAL SCREEN =====
function showDealScreen() {
  G.revealed = false;
  const p = G.currentPlayer;

  document.getElementById('dealPlayerNum').textContent = `${p + 1} / ${G.playerCount}`;
  document.getElementById('dealPlayerName').textContent = G.playerNames[p] || `${p+1}-oyinchi`;
  document.getElementById('dealInstruction').textContent = "Telefonni oling va kartangizni ko'ring";

  const pct = (p / G.playerCount) * 100;
  document.getElementById('dealProgress').style.width = pct + '%';

  // BUG FIX: transition o'chirib, yashirib, reset qilamiz
  const scene = document.getElementById('cardScene');
  const inner = document.querySelector('.card-inner');

  // 1. transition o'chir
  inner.style.transition = 'none';
  // 2. ko'rinmasin
  scene.style.visibility = 'hidden';
  // 3. orqaga qaytarish (flipped class olib tashlash)
  scene.classList.remove('flipped');
  // 4. yangi karta contentini qo'y
  buildCardFront(G.cards[p]);

  // 5. brauzer yangi holatni render qilsin (reflow)
  void inner.offsetHeight;

  // 6. keyingi frame da transition qaytaramiz va ko'rsatamiz
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      inner.style.transition = '';
      scene.style.visibility = 'visible';
    });
  });

  // next tugma
  const btnNext = document.getElementById('btnNext');
  btnNext.style.display = 'none';
  if (p < G.playerCount - 1) {
    btnNext.textContent = `✓  Keyingi: ${G.playerNames[p + 1] || (p + 2) + '-oyinchi'} →`;
  } else {
    btnNext.textContent = `🎮  O'yinni Boshlash`;
  }

  document.getElementById('cardInstruction').textContent = "👆 Kartani bosib ko'ring";
  showScreen('screen-deal');
}

function buildCardFront(card) {
  const front = document.getElementById('cardFront');
  front.innerHTML = '';
  front.className = 'card-face card-front';

  if (card.isImposter) {
    front.classList.add('imposter');
    front.innerHTML = `
      <div class="card-imp-pattern"></div>
      <div class="card-suits" style="color:rgba(231,76,60,0.4)">♠ ♥ ♦ ♣</div>
      <div class="card-imp-center">
        <div class="card-imp-icon">🎭</div>
        <div class="card-imp-title">IMPOSTER</div>
        <div class="card-imp-sub">Siz josussiz<br>Hech kim bilmasin!</div>
      </div>
      <div class="card-suits" style="color:rgba(231,76,60,0.4)">♣ ♦ ♥ ♠</div>
    `;
  } else {
    front.classList.add('normal');
    front.innerHTML = `
      <div class="card-corner">
        <div class="card-corner-sym">♦</div>
        <div class="card-corner-word">${G.word}</div>
      </div>
      <div class="card-center">
        <div class="card-word-label">So'zingiz</div>
        <div class="card-divider"></div>
        <div class="card-word">${G.word}</div>
        <div class="card-divider"></div>
      </div>
      <div class="card-corner right">
        <div class="card-corner-sym">♦</div>
        <div class="card-corner-word">${G.word}</div>
      </div>
    `;
  }
}

// ===== CARD FLIP =====
function flipCard() {
  if (G.revealed) return;
  G.revealed = true;

  const scene = document.getElementById('cardScene');
  scene.classList.add('flipped');

  if (navigator.vibrate) navigator.vibrate(30);

  document.getElementById('cardInstruction').textContent =
    G.cards[G.currentPlayer].isImposter
      ? '🔴 Siz imposterisiz! Kimga ham aytmang'
      : `✅ So'zingizni yodlab oling`;

  setTimeout(() => {
    const btn = document.getElementById('btnNext');
    btn.style.display = 'flex';
    btn.style.animation = 'fadeIn 0.3s ease';
  }, 700);
}

// ===== NEXT PLAYER =====
function nextPlayer() {
  G.currentPlayer++;
  if (G.currentPlayer >= G.playerCount) {
    showScreen('screen-go');
  } else {
    showDealScreen();
  }
}

// ===== RESULT SCREEN =====
function showResult() {
  const impName = G.playerNames[G.imposterIndex] || `${G.imposterIndex + 1}-oyinchi`;
  document.getElementById('resultImposterName').textContent = impName;
  document.getElementById('resultWord').textContent = G.word;

  const list = document.getElementById('resultPlayersList');
  list.innerHTML = G.playerNames.map((name, i) => `
    <div class="result-player-row">
      <div class="result-player-badge">${i === G.imposterIndex ? '🎭' : '😊'}</div>
      <div class="result-player-name">${escHtml(name)}</div>
      <div class="result-player-tag ${i === G.imposterIndex ? 'tag-imposter' : 'tag-normal'}">
        ${i === G.imposterIndex ? 'IMPOSTER' : 'ODDIY'}
      </div>
    </div>
  `).join('');

  showScreen('screen-result');
}

// ===== ADMIN PANEL =====
let allWords = [];
let activeFilter = 'all';

async function openAdmin() {
  showScreen('screen-admin');
  await loadWords();
}

async function loadWords() {
  document.getElementById('wordList').innerHTML =
    '<div class="loading-dots"><span></span><span></span><span></span></div>';
  try {
    const res = await fetch('api.php?action=words');
    const data = await res.json();
    allWords = data.words || [];
    document.getElementById('statTotal').textContent = data.total;
    document.getElementById('statActive').textContent = data.active;
    renderFilters();
    renderWords();
  } catch (e) {
    document.getElementById('wordList').innerHTML =
      '<p style="color:var(--text2);text-align:center;padding:20px">Yuklanmadi</p>';
  }
}

function renderFilters() {
  const cats = ['all', ...new Set(allWords.map(w => w.category))];
  const row = document.getElementById('filterRow');
  row.innerHTML = cats.map(c => `
    <button class="filter-chip ${c === activeFilter ? 'active' : ''}" onclick="setFilter('${c}')">
      ${c === 'all' ? '✦ Hammasi' : c}
    </button>
  `).join('');
}

function setFilter(cat) {
  activeFilter = cat;
  renderFilters();
  renderWords();
}

function renderWords() {
  const filtered = activeFilter === 'all'
    ? allWords : allWords.filter(w => w.category === activeFilter);
  if (!filtered.length) {
    document.getElementById('wordList').innerHTML =
      '<p style="color:var(--text2);text-align:center;padding:20px">So\'z yo\'q</p>';
    return;
  }
  document.getElementById('wordList').innerHTML = filtered.map((w, i) => `
    <div class="word-item ${w.active == 0 ? 'inactive' : ''}" style="animation-delay:${i * 0.03}s">
      <div style="flex:1">
        <div class="word-text">${escHtml(w.word)}</div>
        <div class="word-cat">${escHtml(w.category)}</div>
      </div>
      <div class="word-actions">
        <button class="icon-btn toggle ${w.active == 0 ? 'off' : ''}" onclick="toggleWord(${w.id})">
          ${w.active ? '✓' : '○'}
        </button>
        <button class="icon-btn del" onclick="deleteWord(${w.id})">✕</button>
      </div>
    </div>
  `).join('');
}

async function addWord() {
  const wordInput = document.getElementById('newWord');
  const catInput = document.getElementById('newCategory');
  const word = wordInput.value.trim();
  const category = catInput.value || 'umumiy';
  if (!word) { showToast("So'z kiriting!", 'error'); wordInput.focus(); return; }
  try {
    const res = await fetch('api.php?action=add_word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, category })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    wordInput.value = '';
    showToast(`"${word}" qo'shildi ✓`, 'success');
    await loadWords();
  } catch (e) { showToast(e.message, 'error'); }
}

async function toggleWord(id) {
  try {
    const res = await fetch('api.php?action=toggle_word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    const w = allWords.find(x => x.id == id);
    if (w) w.active = data.active;
    renderWords();
    document.getElementById('statActive').textContent = allWords.filter(x => x.active == 1).length;
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteWord(id) {
  const w = allWords.find(x => x.id == id);
  if (!w || !confirm(`"${w.word}" ni o'chirasizmi?`)) return;
  try {
    const res = await fetch('api.php?action=delete_word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    allWords = allWords.filter(x => x.id != id);
    renderWords(); renderFilters();
    document.getElementById('statTotal').textContent = allWords.length;
    document.getElementById('statActive').textContent = allWords.filter(x => x.active == 1).length;
    showToast("O'chirildi", 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

// ===== TOAST =====
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== TELEGRAM WEB APP =====
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready(); tg.expand();
  tg.setHeaderColor('#080c14');
  tg.setBackgroundColor('#080c14');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('newWord')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addWord();
  });
});
