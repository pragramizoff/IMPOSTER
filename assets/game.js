// ===== GAME STATE =====
const G = {
  playerCount: 5,
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

// ===== MENU =====
function openMenu() {
  showScreen('screen-menu');
}

// ===== PLAYER COUNT =====
function openPlayerCount() {
  updateCount(G.playerCount);
  showScreen('screen-players');
}

function updateCount(n) {
  G.playerCount = Math.max(3, Math.min(10, n));
  document.getElementById('countNum').textContent = G.playerCount;
  document.getElementById('countLabel').textContent =
    G.playerCount === 1 ? 'oyinchi' : 'oyinchi';
  document.getElementById('btnMinus').disabled = G.playerCount <= 3;
  document.getElementById('btnPlus').disabled = G.playerCount >= 10;

  const dots = document.querySelectorAll('.player-dot');
  dots.forEach((d, i) => d.classList.toggle('filled', i < G.playerCount));
}

// ===== START GAME =====
async function startGame() {
  // Fetch random word
  try {
    const res = await fetch('api.php?action=random_word');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    G.word = data.word;
  } catch (e) {
    showToast("So'z yuklanmadi: " + e.message, 'error');
    return;
  }

  // Assign imposter randomly
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
  const card = G.cards[p];

  // Update header
  document.getElementById('dealPlayerNum').textContent = `${p + 1}-chi oyinchi`;
  document.getElementById('dealPlayerName').textContent = getPlayerName(p);
  document.getElementById('dealInstruction').textContent =
    "Telefonni oling va kartangizni ko'ring";

  // Progress bar
  const pct = (p / G.playerCount) * 100;
  document.getElementById('dealProgress').style.width = pct + '%';

  // Reset card
  const scene = document.getElementById('cardScene');
  scene.classList.remove('flipped');

  // Build card front
  buildCardFront(card);

  // Hide next button
  document.getElementById('btnNext').style.display = 'none';
  document.getElementById('btnNext').textContent =
    p < G.playerCount - 1 ? `✓  Keyingi →` : `🎮  O'yinni Boshlash`;

  // Instruction
  document.getElementById('cardInstruction').textContent =
    '👆 Kartani bosib ko\'ring';

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

function getPlayerName(index) {
  const names = ['Birinchi', 'Ikkinchi', 'Uchinchi', 'To\'rtinchi',
    'Beshinchi', 'Oltinchi', 'Yettinchi', 'Sakkizinchi',
    'To\'qqizinchi', 'O\'ninchi'];
  return names[index] || `${index + 1}-chi`;
}

// ===== CARD FLIP =====
function flipCard() {
  if (G.revealed) return;
  G.revealed = true;

  const scene = document.getElementById('cardScene');
  scene.classList.add('flipped');

  // Vibrate if supported
  if (navigator.vibrate) navigator.vibrate(30);

  document.getElementById('cardInstruction').textContent =
    G.cards[G.currentPlayer].isImposter
      ? '🔴 Siz imposterisiz! Kimga ham aytmang'
      : `✅ So'zingizni yodlab oling`;

  // Show next button after short delay
  setTimeout(() => {
    const btn = document.getElementById('btnNext');
    btn.style.display = 'flex';
    btn.style.animation = 'fadeIn 0.3s ease';
  }, 600);
}

// ===== NEXT PLAYER =====
function nextPlayer() {
  G.currentPlayer++;
  if (G.currentPlayer >= G.playerCount) {
    showGameStart();
  } else {
    showDealScreen();
  }
}

// ===== GAME START SCREEN =====
function showGameStart() {
  showScreen('screen-go');
}

function restartGame() {
  openMenu();
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
    <button class="filter-chip ${c === activeFilter ? 'active' : ''}"
      onclick="setFilter('${c}')">
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
    ? allWords
    : allWords.filter(w => w.category === activeFilter);

  if (filtered.length === 0) {
    document.getElementById('wordList').innerHTML =
      '<p style="color:var(--text2);text-align:center;padding:20px">So\'z yo\'q</p>';
    return;
  }

  document.getElementById('wordList').innerHTML = filtered.map((w, i) => `
    <div class="word-item ${w.active == 0 ? 'inactive' : ''}" id="word-${w.id}"
         style="animation-delay:${i * 0.03}s">
      <div style="flex:1">
        <div class="word-text">${escHtml(w.word)}</div>
        <div class="word-cat">${escHtml(w.category)}</div>
      </div>
      <div class="word-actions">
        <button class="icon-btn toggle ${w.active == 0 ? 'off' : ''}"
          onclick="toggleWord(${w.id})" title="${w.active ? 'O\'chirish' : 'Yoqish'}">
          ${w.active ? '✓' : '○'}
        </button>
        <button class="icon-btn del" onclick="deleteWord(${w.id})" title="O'chirish">✕</button>
      </div>
    </div>
  `).join('');
}

async function addWord() {
  const wordInput = document.getElementById('newWord');
  const catInput = document.getElementById('newCategory');
  const word = wordInput.value.trim();
  const category = catInput.value || 'umumiy';

  if (!word) {
    showToast("So'z kiriting!", 'error');
    wordInput.focus();
    return;
  }

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
  } catch (e) {
    showToast(e.message, 'error');
  }
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

    const updated = document.getElementById('statActive');
    const active = allWords.filter(x => x.active == 1).length;
    updated.textContent = active;
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function deleteWord(id) {
  const w = allWords.find(x => x.id == id);
  if (!w) return;

  if (!confirm(`"${w.word}" ni o'chirasizmi?`)) return;

  try {
    const res = await fetch('api.php?action=delete_word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    allWords = allWords.filter(x => x.id != id);
    renderWords();
    renderFilters();
    showToast("O'chirildi", 'success');

    document.getElementById('statTotal').textContent = allWords.length;
    document.getElementById('statActive').textContent = allWords.filter(x => x.active == 1).length;
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ===== TOAST =====
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('show'); }, 2800);
}

// ===== UTILS =====
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== TELEGRAM WEB APP INIT =====
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#080c14');
  tg.setBackgroundColor('#080c14');

  // Handle back button
  tg.BackButton.onClick(() => {
    const active = document.querySelector('.screen.active');
    if (active?.id === 'screen-players' || active?.id === 'screen-admin') {
      openMenu();
      tg.BackButton.hide();
    } else if (active?.id === 'screen-deal') {
      if (confirm("O'yinni to'xtatmoqchimisiz?")) openMenu();
    }
  });

  // Show back button on non-menu screens
  document.querySelectorAll('.screen').forEach(s => {
    new MutationObserver(() => {
      if (s.classList.contains('active') && s.id !== 'screen-menu') {
        tg.BackButton.show();
      } else if (s.classList.contains('active') && s.id === 'screen-menu') {
        tg.BackButton.hide();
      }
    }).observe(s, { attributes: true });
  });
}

// Enter key for word input
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('newWord')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addWord();
  });
});
