// ============================================
//  MERIDIAN POST — COMPLETE APP LOGIC v2
// ============================================

const SUPABASE_URL = 'https://fioilphrakfblmvcseef.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iUfqV3CK2zvQZpNj_WVXtw_VkGkLXa2';
const EDITOR_PWD  = 'Haider@123';
const RSS2JSON    = 'https://api.rss2json.com/v1/api.json?rss_url=';

const RSS_FEEDS = {
  all:        ['https://feeds.bbci.co.uk/news/world/rss.xml','https://www.aljazeera.com/xml/rss/all.xml','https://feeds.reuters.com/reuters/worldNews'],
  geopolitics:['https://feeds.bbci.co.uk/news/world/rss.xml','https://www.aljazeera.com/xml/rss/all.xml'],
  world:      ['https://feeds.bbci.co.uk/news/world/rss.xml','https://feeds.reuters.com/reuters/worldNews'],
  markets:    ['https://feeds.reuters.com/reuters/businessNews','https://feeds.bbci.co.uk/news/business/rss.xml'],
  technology: ['https://feeds.bbci.co.uk/news/technology/rss.xml','https://feeds.reuters.com/reuters/technologyNews']
};

const CAT_META = {
  geopolitics: { label:'Geopolitics',    cls:'cat-geo',  icon:'🌍', bg:'linear-gradient(135deg,#1a1a2e,#16213e)' },
  world:       { label:'World Politics', cls:'cat-pol',  icon:'🏛️', bg:'linear-gradient(135deg,#0d1b2a,#1b2a3a)' },
  markets:     { label:'Markets',        cls:'cat-mkt',  icon:'📈', bg:'linear-gradient(135deg,#0a1a0a,#1a2a1a)' },
  technology:  { label:'Technology',     cls:'cat-tech', icon:'💻', bg:'linear-gradient(135deg,#1a0a2e,#2d1a4a)' },
  opinion:     { label:'Opinion',        cls:'cat-opin', icon:'✍️', bg:'linear-gradient(135deg,#1a1400,#3a2c00)' }
};

const MARKETS_DATA = [
  {name:'S&P 500',  val:'5,480.32', chg:'+0.62%', up:true,  spark:[40,42,38,45,43,47,50,48,52,55]},
  {name:'NASDAQ',   val:'17,890',   chg:'+0.88%', up:true,  spark:[60,58,62,65,63,68,70,67,72,75]},
  {name:'DOW',      val:'42,311',   chg:'-0.14%', up:false, spark:[55,57,53,50,52,49,47,50,48,46]},
  {name:'Gold /oz', val:'$3,124',   chg:'+1.2%',  up:true,  spark:[30,35,32,38,40,36,42,45,43,48]},
  {name:'Crude WTI',val:'$74.30',   chg:'-0.8%',  up:false, spark:[60,58,55,52,54,50,48,51,49,47]},
  {name:'Bitcoin',  val:'$87,440',  chg:'+2.1%',  up:true,  spark:[40,45,42,50,55,52,58,62,60,65]},
  {name:'NIFTY 50', val:'23,412',   chg:'+0.45%', up:true,  spark:[35,37,36,40,42,40,44,46,45,48]},
  {name:'USD/INR',  val:'₹83.42',   chg:'+0.1%',  up:false, spark:[50,50,51,50,51,52,51,52,52,53]},
];

const TICKER_DATA = [
  {l:'S&P 500',v:'5,480',c:'+0.62%',u:true},{l:'NASDAQ',v:'17,890',c:'+0.88%',u:true},
  {l:'DOW',v:'42,311',c:'-0.14%',u:false},{l:'GOLD',v:'$3,124',c:'+1.2%',u:true},
  {l:'OIL',v:'$74.30',c:'-0.8%',u:false},{l:'BTC',v:'$87,440',c:'+2.1%',u:true},
  {l:'ETH',v:'$3,210',c:'+1.4%',u:true},{l:'NIFTY',v:'23,412',c:'+0.45%',u:true},
  {l:'SENSEX',v:'77,102',c:'+0.38%',u:true},{l:'USD/INR',v:'₹83.42',c:'+0.1%',u:false},
  {l:'EUR/USD',v:'1.0831',c:'-0.3%',u:false},{l:'SILVER',v:'$32.80',c:'+0.9%',u:true},
];

const ALERTS = [
  'Iran nuclear talks reach critical impasse as US deadline expires — diplomats warn of collapse',
  'Gold surges to all-time record as central banks accelerate dollar diversification',
  'Russia launches largest drone strike on Kyiv in six months — power outages reported',
  'China GDP growth beats expectations at 5.2% despite Western tariffs',
  'OpenAI faces EU regulatory action over data privacy violations'
];

const CITIES = [
  {name:'New York',  tz:'America/New_York'},
  {name:'London',    tz:'Europe/London'},
  {name:'Dubai',     tz:'Asia/Dubai'},
  {name:'Delhi',     tz:'Asia/Kolkata'},
  {name:'Tokyo',     tz:'Asia/Tokyo'},
  {name:'Sydney',    tz:'Australia/Sydney'},
  {name:'Moscow',    tz:'Europe/Moscow'},
];

const COUNTRIES = [
  {flag:'🇺🇸',name:'United States',s:'med',st:'Moderate tension'},
  {flag:'🇷🇺',name:'Russia',s:'high',st:'High alert'},
  {flag:'🇨🇳',name:'China',s:'med',st:'Elevated watch'},
  {flag:'🇮🇷',name:'Iran',s:'high',st:'Critical'},
  {flag:'🇮🇱',name:'Israel',s:'high',st:'Active conflict'},
  {flag:'🇮🇳',name:'India',s:'low',st:'Stable'},
  {flag:'🇵🇰',name:'Pakistan',s:'med',st:'Economic stress'},
  {flag:'🇩🇪',name:'Germany',s:'low',st:'Stable'},
  {flag:'🇸🇦',name:'Saudi Arabia',s:'med',st:'Strategic shift'},
  {flag:'🇺🇦',name:'Ukraine',s:'high',st:'Active conflict'},
  {flag:'🇹🇷',name:'Turkey',s:'med',st:'Elevated watch'},
  {flag:'🇧🇷',name:'Brazil',s:'low',st:'Stable'},
];

// ---- STATE ----
let editorUnlocked = false;
let newsCache = {};
let currentAlertIdx = 0;
let alertInterval = null;

// ============================================
//  THEME
// ============================================
function initTheme() {
  const t = localStorage.getItem('mp-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const nxt = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nxt);
  localStorage.setItem('mp-theme', nxt);
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = nxt === 'dark' ? '☀️' : '🌙';
}

// ============================================
//  NAV
// ============================================
function toggleMobileNav() {
  document.getElementById('mobileNav')?.classList.toggle('open');
  document.getElementById('hamburger')?.classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('mobileNav')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
}

// ============================================
//  TICKER
// ============================================
function buildTicker() {
  const el = document.getElementById('tickerTrack');
  if (!el) return;
  el.innerHTML = [...TICKER_DATA,...TICKER_DATA].map(i =>
    '<span>' + i.l + ' <b class="' + (i.u?'up':'dn') + '">' + (i.u?'▲':'▼') + ' ' + i.v + ' ' + i.c + '</b></span>'
  ).join('');
}

// ============================================
//  ALERT BANNER
// ============================================
function buildAlert() {
  const el = document.getElementById('alertText');
  if (!el) return;
  el.textContent = ALERTS[0];
  alertInterval = setInterval(() => {
    currentAlertIdx = (currentAlertIdx + 1) % ALERTS.length;
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = ALERTS[currentAlertIdx]; el.style.opacity = '1'; }, 400);
  }, 6000);
}
function dismissAlert() {
  document.getElementById('alertBanner')?.style.setProperty('display','none');
  clearInterval(alertInterval);
}

// ============================================
//  WORLD CLOCK
// ============================================
function buildClock() {
  const el = document.getElementById('worldClock');
  if (!el) return;
  function update() {
    el.innerHTML = CITIES.map((c, i) =>
      (i > 0 ? '<div class="clock-sep"></div>' : '') +
      '<div class="clock-item">' +
        '<span class="clock-city">' + c.name + '</span>' +
        '<span class="clock-time">' + new Date().toLocaleTimeString('en-US',{timeZone:c.tz,hour:'2-digit',minute:'2-digit',hour12:false}) + '</span>' +
      '</div>'
    ).join('');
  }
  update();
  setInterval(update, 1000);
}

// ============================================
//  DATE
// ============================================
function buildDate() {
  const el = document.getElementById('heroDate');
  if (!el) return;
  const d = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  el.textContent = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

// ============================================
//  MARKETS
// ============================================
function buildMarkets() {
  const el = document.getElementById('marketWidget');
  if (!el) return;
  const bullish = MARKETS_DATA.filter(m => m.up).length > MARKETS_DATA.length / 2;
  el.innerHTML = MARKETS_DATA.map(m => {
    const sparkH = m.spark;
    const maxH = Math.max(...sparkH);
    const minH = Math.min(...sparkH);
    const bars = sparkH.map(v => {
      const h = Math.max(3, Math.round(((v - minH) / (maxH - minH || 1)) * 16) + 3);
      return '<span class="spark-bar" style="height:' + h + 'px;color:var(' + (m.up?'--green':'--red') + ')"></span>';
    }).join('');
    return '<div class="market-row">' +
      '<span class="market-name">' + m.name + '</span>' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span class="sparkline">' + bars + '</span>' +
        '<div class="market-right">' +
          '<span class="market-price ' + (m.up?'up':'dn') + '">' + (m.up?'▲':'▼') + ' ' + m.val + '</span>' +
          '<span class="market-chg ' + (m.up?'up':'dn') + '">' + m.chg + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('') +
  '<div class="market-mood">' +
    (bullish ? '<span class="mood-bull">▲ Market Mood: Bullish</span>' : '<span class="mood-bear">▼ Market Mood: Bearish</span>') +
    '<span style="margin-left:auto;font-size:0.65rem;color:var(--muted);font-family:\'DM Mono\',monospace">Updated: ' + new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) + '</span>' +
  '</div>';
}

// ============================================
//  CURRENCY CONVERTER
// ============================================
function buildConverter() {
  const el = document.getElementById('converterWidget');
  if (!el) return;
  el.innerHTML =
    '<div class="conv-grid">' +
      '<div class="conv-item"><div class="conv-from">1 USD</div><div class="conv-val">₹83.42</div></div>' +
      '<div class="conv-item"><div class="conv-from">1 EUR</div><div class="conv-val">₹90.12</div></div>' +
      '<div class="conv-item"><div class="conv-from">1 GBP</div><div class="conv-val">₹105.30</div></div>' +
      '<div class="conv-item"><div class="conv-from">1 AED</div><div class="conv-val">₹22.71</div></div>' +
    '</div>' +
    '<div class="conv-input-row">' +
      '<span class="conv-label">USD</span>' +
      '<input class="conv-input" type="number" id="convInput" value="1" min="0" oninput="convertCurrency()">' +
    '</div>' +
    '<div id="convResult" style="margin-top:10px;background:var(--surface2);border:1px solid var(--accent);border-radius:7px;padding:12px;text-align:center">' +
      '<div style="font-family:\'DM Mono\',monospace;font-size:1.1rem;font-weight:700;color:var(--accent)">₹83.42</div>' +
      '<div style="font-size:0.67rem;color:var(--muted);margin-top:2px">1 USD = ₹83.42 INR</div>' +
    '</div>';
}
function convertCurrency() {
  const val = parseFloat(document.getElementById('convInput')?.value) || 0;
  const inr = (val * 83.42).toFixed(2);
  const el = document.getElementById('convResult');
  if (!el) return;
  el.innerHTML =
    '<div style="font-family:\'DM Mono\',monospace;font-size:1.1rem;font-weight:700;color:var(--accent)">₹' + parseFloat(inr).toLocaleString('en-IN') + '</div>' +
    '<div style="font-size:0.67rem;color:var(--muted);margin-top:2px">' + val + ' USD = ₹' + inr + ' INR</div>';
}

// ============================================
//  COUNTRY SPOTLIGHT
// ============================================
function buildCountries(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = COUNTRIES.map(c =>
    '<div class="country-card" onclick="filterByCountry(\'' + c.name + '\')">' +
      '<div class="country-flag">' + c.flag + '</div>' +
      '<div class="country-name">' + c.name + '</div>' +
      '<div class="country-status"><span class="status-dot s-' + c.s + '"></span>' + c.st + '</div>' +
    '</div>'
  ).join('');
}
function filterByCountry(name) {
  showToast('Showing news for ' + name);
}

// ============================================
//  RSS NEWS
// ============================================
async function fetchFeed(url) {
  try {
    const res = await fetch(RSS2JSON + encodeURIComponent(url) + '&count=12');
    const data = await res.json();
    return (data.status === 'ok' && data.items) ? data.items : [];
  } catch { return []; }
}

async function fetchNews(category) {
  if (newsCache[category]) return newsCache[category];
  const feeds = RSS_FEEDS[category] || RSS_FEEDS.all;
  const results = await Promise.all(feeds.map(fetchFeed));
  const seen = new Set();
  const merged = [];
  results.forEach(items => items.forEach(item => {
    if (item.title && item.title !== '[Removed]' && !seen.has(item.title)) {
      seen.add(item.title);
      merged.push(item);
    }
  }));
  merged.sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));
  newsCache[category] = merged;
  return merged;
}

// ============================================
//  RENDER CARDS
// ============================================
function renderCards(articles, category, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const meta = CAT_META[category] || CAT_META.geopolitics;
  if (!articles?.length) {
    el.innerHTML = '<div class="error-state" style="grid-column:1/-1;text-align:center;padding:60px 0"><div style="font-size:2.5rem;margin-bottom:14px">📡</div><p style="color:var(--muted);font-size:0.88rem">Could not load news right now.</p><button class="btn-retry" onclick="location.reload()" style="margin-top:14px;background:var(--accent);color:#000;border:none;padding:9px 22px;border-radius:5px;font-size:0.78rem;font-weight:700;cursor:pointer">Try Again</button></div>';
    return;
  }
  el.innerHTML = '<div class="cards-grid">' +
    articles.slice(0,8).map((item, i) => {
      const src = cleanSrc(item.author || item.feed || '');
      const time = timeAgo(item.pubDate);
      const hasImg = item.thumbnail?.startsWith('http');
      const views = Math.floor(Math.random() * 2000) + 100;
      const readTime = Math.ceil((item.description || '').split(' ').length / 200) + 2;
      const data = encodeURIComponent(JSON.stringify({
        title: item.title, description: item.description?.replace(/<[^>]*>/g,'').slice(0,500) || '',
        source: src, time: time, url: item.link,
        image: hasImg ? item.thumbnail : '', category: meta.label
      }));
      return '<div class="card" style="animation-delay:' + (i*0.07) + 's" onclick="goNews(\'' + data + '\')">' +
        '<div class="card-img" style="background:' + meta.bg + '">' +
          (hasImg ? '<img src="' + escA(item.thumbnail) + '" alt="" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'">' : '') +
          '<div class="card-img-fallback" style="background:' + meta.bg + '">' + meta.icon + '</div>' +
          '<div class="card-img-overlay"></div>' +
          '<div class="card-img-src">' + escH(src) + '</div>' +
        '</div>' +
        '<div class="card-cat ' + meta.cls + '">' + escH(meta.label) + '</div>' +
        '<div class="card-title">' + escH(item.title) + '</div>' +
        (item.description ? '<div class="card-excerpt">' + escH(item.description.replace(/<[^>]*>/g,'').slice(0,120)) + '...</div>' : '') +
        '<div class="card-footer">' +
          '<span class="card-src"><span class="card-dot"></span>' + escH(src) + '</span>' +
          '<div class="card-meta-right">' +
            '<span>⏱ ' + readTime + ' min</span>' +
            '<span>' + time + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function goNews(encoded) {
  localStorage.setItem('mp-news', decodeURIComponent(encoded));
  window.location.href = 'news-article.html';
}

// ============================================
//  SKELETON
// ============================================
function showSkeleton(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '<div class="cards-grid">' +
    Array.from({length:count},(_,i) =>
      '<div class="skel-card" style="animation-delay:' + (i*0.08) + 's">' +
        '<div class="skeleton skel-img"></div>' +
        '<div class="skeleton skel-line skel-s" style="height:10px;margin-bottom:8px"></div>' +
        '<div class="skeleton skel-line skel-l" style="height:16px;margin-bottom:6px"></div>' +
        '<div class="skeleton skel-line skel-m" style="height:16px;margin-bottom:12px"></div>' +
        '<div class="skeleton skel-line skel-l" style="height:12px;margin-bottom:5px"></div>' +
        '<div class="skeleton skel-line skel-s" style="height:12px"></div>' +
      '</div>'
    ).join('') +
  '</div>';
}

// ============================================
//  SUPABASE
// ============================================
async function sbFetch(path, opts) {
  const url = SUPABASE_URL + '/rest/v1/' + path;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  if (opts?.headers) Object.assign(headers, opts.headers);
  const res = await fetch(url, Object.assign({}, opts, {headers}));
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function getArticles(draftsOnly) {
  try {
    const path = draftsOnly
      ? 'articles?is_draft=eq.true&order=created_at.desc&select=*'
      : 'articles?is_draft=eq.false&order=created_at.desc&select=*';
    return await sbFetch(path);
  } catch { return []; }
}

async function getAllArticles() {
  try { return await sbFetch('articles?order=created_at.desc&select=*'); }
  catch { return []; }
}

async function getArticleById(id) {
  try {
    const data = await sbFetch('articles?id=eq.' + id + '&select=*');
    return data?.[0] || null;
  } catch { return null; }
}

async function saveArticle(article) {
  return await sbFetch('articles', {method:'POST', body:JSON.stringify(article)});
}

async function updateArticle(id, updates) {
  return await sbFetch('articles?id=eq.' + id, {
    method:'PATCH', headers:{'Prefer':'return=minimal'},
    body: JSON.stringify(updates)
  });
}

async function deleteArticle(id) {
  await sbFetch('articles?id=eq.' + id, {method:'DELETE',headers:{'Prefer':'return=minimal'}});
}

async function incrementViews(id) {
  try {
    const data = await sbFetch('articles?id=eq.' + id + '&select=views');
    const views = (data?.[0]?.views || 0) + 1;
    await sbFetch('articles?id=eq.' + id, {
      method:'PATCH', headers:{'Prefer':'return=minimal'},
      body: JSON.stringify({views})
    });
  } catch {}
}

// ============================================
//  PASSWORD
// ============================================
async function hashPwd(p) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
async function checkPwd(input) {
  const a = await hashPwd(input);
  const b = await hashPwd(EDITOR_PWD);
  return a === b;
}

function openPwdModal(onSuccess) {
  const overlay = document.getElementById('pwdOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  const input = document.getElementById('pwdInput');
  if (input) { input.value = ''; input.type = 'password'; input.focus(); }
  const err = document.getElementById('pwdError');
  if (err) err.style.display = 'none';
  window._pwdCb = onSuccess;
}
function closePwdModal() {
  document.getElementById('pwdOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
async function submitPwd() {
  const input = document.getElementById('pwdInput');
  const err = document.getElementById('pwdError');
  if (!input?.value.trim()) return;
  const ok = await checkPwd(input.value.trim());
  if (ok) {
    editorUnlocked = true;
    closePwdModal();
    if (window._pwdCb) window._pwdCb();
  } else {
    if (err) { err.style.display = 'block'; err.textContent = 'Incorrect password.'; }
    input.value = '';
    input.focus();
  }
}
function togglePwdEye() {
  const i = document.getElementById('pwdInput');
  const b = document.getElementById('pwdEye');
  if (!i||!b) return;
  i.type = i.type === 'password' ? 'text' : 'password';
  b.textContent = i.type === 'password' ? '👁' : '🙈';
}

// ============================================
//  EDITOR
// ============================================
let editingId = null;

function openEditor(articleId) {
  if (!editorUnlocked) { openPwdModal(() => openEditor(articleId)); return; }
  const overlay = document.getElementById('editorOverlay');
  if (!overlay) return;
  editingId = articleId || null;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (articleId) { loadArticleIntoEditor(articleId); } else { resetEditor(); }
}
function closeEditor() {
  document.getElementById('editorOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
}
function resetEditor() {
  ['edTitle','edExcerpt'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  const body = document.getElementById('edBody');
  if (body) body.value = '';
  const cat = document.getElementById('edCat');
  if (cat) cat.value = 'Geopolitics';
  const icon = document.getElementById('edIcon');
  if (icon) icon.value = '🌍';
  const sched = document.getElementById('edSchedule');
  if (sched) sched.value = '';
  const wc = document.getElementById('wordCount');
  if (wc) wc.textContent = '0 words';
  const prev = document.getElementById('previewArea');
  if (prev) prev.classList.remove('show');
  const title = document.querySelector('#editorOverlay .modal-title');
  if (title) title.textContent = '✏️ Write & Publish';
}
async function loadArticleIntoEditor(id) {
  const a = await getArticleById(id);
  if (!a) return;
  const title = document.querySelector('#editorOverlay .modal-title');
  if (title) title.textContent = '✏️ Edit Article';
  const set = (elId, val) => { const el = document.getElementById(elId); if(el) el.value = val || ''; };
  set('edTitle', a.title); set('edExcerpt', a.excerpt);
  set('edBody', a.body); set('edIcon', a.icon || '🌍');
  const cat = document.getElementById('edCat');
  if (cat) cat.value = a.category;
  updateWordCount();
}
function updateWordCount() {
  const body = document.getElementById('edBody');
  const wc = document.getElementById('wordCount');
  if (!body||!wc) return;
  const w = body.value.trim().split(/\s+/).filter(Boolean).length;
  wc.textContent = w + ' word' + (w!==1?'s':'');
}
function previewArticle() {
  const title = document.getElementById('edTitle')?.value.trim();
  const body = document.getElementById('edBody')?.value.trim();
  const cat = document.getElementById('edCat')?.value;
  if (!title||!body) { showToast('Fill in headline and body first.'); return; }
  const prev = document.getElementById('previewArea');
  const inner = document.getElementById('previewInner');
  if (!prev||!inner) return;
  inner.innerHTML =
    '<div style="font-size:0.6rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent2);margin-bottom:8px">' + escH(cat) + '</div>' +
    '<div style="font-family:\'Playfair Display\',serif;font-size:1.2rem;font-weight:900;line-height:1.2;margin-bottom:14px">' + escH(title) + '</div>' +
    '<div style="font-size:0.88rem;line-height:1.85;white-space:pre-line">' + escH(body) + '</div>';
  prev.classList.add('show');
  prev.scrollIntoView({behavior:'smooth',block:'start'});
}
async function publishArticle(isDraft) {
  const title = document.getElementById('edTitle')?.value.trim();
  const excerpt = document.getElementById('edExcerpt')?.value.trim();
  const body = document.getElementById('edBody')?.value.trim();
  const cat = document.getElementById('edCat')?.value || 'Geopolitics';
  const icon = document.getElementById('edIcon')?.value.trim() || '🌍';
  const schedule = document.getElementById('edSchedule')?.value;
  if (!title) { showToast('Please enter a headline.'); return; }
  if (!body) { showToast('Please write the article body.'); return; }
  const btn = document.getElementById('btnPublish');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>'; }
  try {
    const payload = {
      title, excerpt: excerpt || body.slice(0,180)+'...',
      body, category: cat, icon, author:'J. Asghar',
      is_draft: isDraft || false,
      views: 0,
      scheduled_at: schedule || null
    };
    if (editingId) {
      await updateArticle(editingId, payload);
      showToast(isDraft ? 'Draft saved.' : 'Article updated!');
    } else {
      await saveArticle(payload);
      showToast(isDraft ? 'Draft saved.' : 'Article published!');
    }
    closeEditor();
    if (typeof loadPublished === 'function') loadPublished();
    if (typeof loadAdminArticles === 'function') loadAdminArticles();
  } catch(e) {
    showToast('Error: ' + e.message);
  }
  if (btn) { btn.disabled = false; btn.textContent = '🚀 Publish to Meridian Post'; }
}
function saveDraft() { publishArticle(true); }

// ============================================
//  PUBLISHED ARTICLES
// ============================================
async function loadPublished() {
  const wrapper = document.getElementById('pubWrapper');
  const grid = document.getElementById('pubGrid');
  if (!wrapper||!grid) return;
  const articles = await getArticles(false);
  if (!articles.length) { wrapper.style.display='none'; return; }
  wrapper.style.display = 'block';
  grid.innerHTML = articles.map(a =>
    '<div class="pub-card">' +
      '<span class="pub-badge">Live</span>' +
      (editorUnlocked ? '<button class="pub-delete" onclick="handleDelete(' + a.id + ',event)" title="Delete">×</button>' : '') +
      '<div class="pub-cat">' + escH(a.category) + '</div>' +
      '<div class="pub-title" onclick="goPub(' + a.id + ')">' + escH(a.title) + '</div>' +
      '<div class="pub-excerpt">' + escH(a.excerpt||'') + '</div>' +
      '<div class="pub-meta" style="display:flex;gap:12px;align-items:center">' +
        'J. Asghar · ' + timeAgo(a.created_at) +
        (a.views ? '<span style="display:flex;align-items:center;gap:3px">👁 ' + a.views + '</span>' : '') +
      '</div>' +
    '</div>'
  ).join('');
}
function goPub(id) {
  localStorage.setItem('mp-pub-id', id);
  window.location.href = 'article.html';
}
async function handleDelete(id, e) {
  e.stopPropagation();
  if (!editorUnlocked) return;
  if (!confirm('Delete this article permanently?')) return;
  try { await deleteArticle(id); showToast('Deleted.'); loadPublished(); }
  catch { showToast('Error deleting.'); }
}

// ============================================
//  MOST READ
// ============================================
async function buildMostRead() {
  const el = document.getElementById('mostReadWidget');
  if (!el) return;
  try {
    const articles = await sbFetch('articles?is_draft=eq.false&order=views.desc&limit=5&select=id,title,views,category');
    if (!articles.length) { el.innerHTML = '<p style="font-size:0.8rem;color:var(--muted)">No articles yet.</p>'; return; }
    el.innerHTML = articles.map((a,i) =>
      '<div class="most-read-item" onclick="goPub(' + a.id + ')">' +
        '<span class="most-read-rank">0' + (i+1) + '</span>' +
        '<div><div class="most-read-title">' + escH(a.title) + '</div>' +
        '<div class="most-read-views">👁 ' + (a.views||0) + ' views · ' + escH(a.category) + '</div></div>' +
      '</div>'
    ).join('');
  } catch { el.innerHTML = '<p style="font-size:0.8rem;color:var(--muted)">Could not load.</p>'; }
}

// ============================================
//  SEARCH
// ============================================
async function handleSearch(query) {
  const clear = document.getElementById('searchClear');
  if (clear) clear.classList.toggle('visible', query.length > 0);
  if (!query.trim()) { loadPublished(); return; }
  try {
    const articles = await sbFetch('articles?is_draft=eq.false&select=*');
    const q = query.toLowerCase();
    const filtered = articles.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.excerpt?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
    const wrapper = document.getElementById('pubWrapper');
    const grid = document.getElementById('pubGrid');
    if (!wrapper||!grid) return;
    wrapper.style.display = 'block';
    if (!filtered.length) {
      grid.innerHTML = '<p style="color:var(--muted);font-size:0.88rem;padding:20px 0">No results for "' + escH(query) + '"</p>';
      return;
    }
    grid.innerHTML = filtered.map(a =>
      '<div class="pub-card">' +
        '<span class="pub-badge">Live</span>' +
        '<div class="pub-cat">' + escH(a.category) + '</div>' +
        '<div class="pub-title" onclick="goPub(' + a.id + ')">' + escH(a.title) + '</div>' +
        '<div class="pub-excerpt">' + escH(a.excerpt||'') + '</div>' +
        '<div class="pub-meta">J. Asghar · ' + timeAgo(a.created_at) + '</div>' +
      '</div>'
    ).join('');
  } catch {}
}
function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) { input.value = ''; }
  const clear = document.getElementById('searchClear');
  if (clear) clear.classList.remove('visible');
  loadPublished();
}

// ============================================
//  SCROLL EFFECTS
// ============================================
function initScroll() {
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    const pb = document.getElementById('progressBar');
    if (pb) pb.style.width = pct + '%';
    const bt = document.getElementById('backTop');
    if (bt) bt.classList.toggle('visible', window.scrollY > 400);
  });
}

// ============================================
//  EMAIL POPUP
// ============================================
function initEmailPopup() {
  if (localStorage.getItem('mp-popup')) return;
  setTimeout(() => {
    const popup = document.getElementById('emailPopup');
    if (popup) popup.style.display = 'flex';
  }, 4000);
}
function dismissEmail() {
  const popup = document.getElementById('emailPopup');
  if (popup) { popup.style.opacity='0'; popup.style.transition='opacity 0.3s'; setTimeout(()=>popup.style.display='none',300); }
  localStorage.setItem('mp-popup','1');
}
function subscribeEmail() {
  const input = document.getElementById('emailField');
  const email = input?.value.trim();
  if (!email||!email.includes('@')) { showToast('Enter a valid email.'); return; }
  dismissEmail();
  showToast('Subscribed! Thank you.');
}

// ============================================
//  SHARE
// ============================================
function shareArticle(title, url) {
  if (navigator.share) {
    navigator.share({title, url}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(url).then(()=>showToast('Link copied!')).catch(()=>showToast('Copy the URL manually.'));
  }
}
function shareWA(title, url) {
  window.open('https://wa.me/?text=' + encodeURIComponent(title + ' ' + url), '_blank');
}
function shareTW(title, url) {
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url), '_blank');
}

// ============================================
//  TOAST
// ============================================
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3200);
}

// ============================================
//  HELPERS
// ============================================
function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escA(s) { return String(s||'').replace(/"/g,'&quot;'); }
function cleanSrc(s) {
  if (!s) return 'News';
  return s.replace(/ - .*/g,'').replace(/https?:\/\//g,'').replace(/www\./g,'').split('/')[0].split('.')[0].split(',')[0].trim() || 'News';
}
function timeAgo(str) {
  if (!str) return '';
  try {
    const diff = (Date.now() - new Date(str).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
    return new Date(str).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  } catch { return ''; }
}
function readTime(text) {
  return Math.max(1, Math.ceil((text||'').split(/\s+/).length / 200));
}

// ============================================
//  SHARED HTML
// ============================================
function navHTML(active) {
  const pages = [
    {id:'index',label:'Home',href:'index.html'},
    {id:'geopolitics',label:'Geopolitics',href:'geopolitics.html'},
    {id:'world-politics',label:'World Politics',href:'world-politics.html'},
    {id:'markets',label:'Markets',href:'markets.html'},
    {id:'technology',label:'Technology',href:'technology.html'},
  ];
  return (
    '<nav class="nav">' +
      '<a href="index.html" class="nav-logo"><div class="nav-logo-mark">M</div><span class="nav-logo-text">Meridian Post</span></a>' +
      '<ul class="nav-links">' + pages.map(p=>'<li><a href="'+p.href+'"'+(active===p.id?' class="active"':'')+'>'+p.label+'</a></li>').join('') + '</ul>' +
      '<div class="nav-right">' +
        '<button class="btn-theme" id="btnTheme" onclick="toggleTheme()">☀️</button>' +
        '<button class="btn-plus" onclick="openEditor()" title="Write new post">+</button>' +
        '<button class="hamburger" id="hamburger" onclick="toggleMobileNav()"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</nav>' +
    '<div class="mobile-nav" id="mobileNav">' +
      pages.map(p=>'<a href="'+p.href+'"'+(active===p.id?' class="active"':'')+' onclick="closeMobileNav()">'+p.label+'</a>').join('') +
      '<a href="#" onclick="openEditor();closeMobileNav()">✏️ Write New Post</a>' +
    '</div>'
  );
}
function tickerHTML() {
  return '<div class="ticker"><div class="ticker-label"><span class="ticker-dot"></span>Live</div><div class="ticker-body"><div class="ticker-track" id="tickerTrack"></div></div></div>';
}
function alertHTML() {
  return '<div class="alert-banner" id="alertBanner"><span class="alert-label"><span class="alert-label-dot"></span>Breaking</span><span class="alert-text" id="alertText" style="transition:opacity 0.4s"></span><button class="alert-close" onclick="dismissAlert()">×</button></div>';
}
function clockHTML() {
  return '<div class="world-clock" id="worldClock"></div>';
}
function footerHTML() {
  return '<footer>' +
    '<div class="footer-grid">' +
      '<div><div class="footer-logo"><div class="footer-logo-mark">M</div><span class="footer-logo-text">Meridian Post</span></div>' +
      '<p class="footer-desc">Sharp global news. Real analysis. World politics, geopolitics, markets and technology — founded by J. Asghar.</p>' +
      '<p style="font-size:0.71rem;color:var(--muted)">News: BBC · Al Jazeera · Reuters</p></div>' +
      '<div class="footer-col"><h4>Sections</h4><ul>' +
        '<li><a href="geopolitics.html">Geopolitics</a></li>' +
        '<li><a href="world-politics.html">World Politics</a></li>' +
        '<li><a href="markets.html">Markets</a></li>' +
        '<li><a href="technology.html">Technology</a></li>' +
        '<li><a href="admin.html">Admin Panel</a></li>' +
      '</ul></div>' +
      '<div class="footer-col"><h4>About</h4><ul>' +
        '<li><a href="#">About J. Asghar</a></li>' +
        '<li><a href="#">Editorial Standards</a></li>' +
        '<li><a href="#">Contact</a></li>' +
      '</ul></div>' +
    '</div>' +
    '<div class="footer-bottom"><span>© 2026 Meridian Post. All rights reserved.</span><span>Founded by J. Asghar · Independent Global News</span></div>' +
  '</footer>';
}
function pwdModalHTML() {
  return '<div class="modal-overlay" id="pwdOverlay">' +
    '<div class="modal modal-sm">' +
      '<div class="modal-head"><div><div class="modal-title">Editor Access</div><div class="modal-sub">Password required to continue</div></div>' +
      '<button class="modal-close" onclick="closePwdModal()">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="form-group"><label class="form-label">Password</label>' +
          '<div class="pwd-wrap"><input class="form-input" type="password" id="pwdInput" placeholder="Enter editor password" onkeydown="if(event.key===\'Enter\')submitPwd()">' +
          '<button class="pwd-eye" id="pwdEye" onclick="togglePwdEye()">👁</button></div>' +
          '<div class="pwd-error" id="pwdError"></div>' +
        '</div>' +
        '<button class="btn-primary" onclick="submitPwd()">Unlock Editor</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}
function editorModalHTML() {
  return '<div class="modal-overlay" id="editorOverlay">' +
    '<div class="modal modal-md">' +
      '<div class="modal-head"><div><div class="modal-title">✏️ Write & Publish</div><div class="modal-sub">Published articles visible to everyone worldwide via Supabase</div></div>' +
      '<button class="modal-close" onclick="closeEditor()">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="form-row">' +
          '<div class="form-group" style="margin-bottom:0"><label class="form-label">Category</label>' +
            '<select class="form-select" id="edCat"><option>Geopolitics</option><option>World Politics</option><option>Markets</option><option>Technology</option><option>Opinion</option></select>' +
          '</div>' +
          '<div class="form-group" style="margin-bottom:0"><label class="form-label">Icon</label>' +
            '<input class="form-input" id="edIcon" maxlength="4" value="🌍">' +
          '</div>' +
        '</div>' +
        '<div class="form-group" style="margin-top:14px"><label class="form-label">Headline *</label>' +
          '<input class="form-input" id="edTitle" placeholder="Write a strong, clear headline..." style="font-size:0.97rem;font-weight:700">' +
        '</div>' +
        '<div class="form-group"><label class="form-label">Short Summary (shown on cards)</label>' +
          '<textarea class="form-textarea" id="edExcerpt" placeholder="1-2 sentence summary for the card preview..." style="min-height:60px"></textarea>' +
        '</div>' +
        '<div class="form-group"><label class="form-label">Schedule Publish Date (optional)</label>' +
          '<input class="form-input" type="datetime-local" id="edSchedule">' +
          '<div class="form-hint">Leave blank to publish immediately. Set a future date to schedule.</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">' +
            '<label class="form-label" style="margin-bottom:0">Article Body *</label>' +
            '<span class="word-count" id="wordCount">0 words</span>' +
          '</div>' +
          '<textarea class="form-textarea" id="edBody" oninput="updateWordCount()" placeholder="Write your full article here...\n\nLeave a blank line between paragraphs."></textarea>' +
        '</div>' +
        '<button class="btn-secondary" onclick="previewArticle()">👁 Preview Article</button>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
          '<button class="btn-secondary" style="margin-bottom:0" onclick="saveDraft()">💾 Save as Draft</button>' +
          '<button class="btn-primary" id="btnPublish" onclick="publishArticle(false)">🚀 Publish Now</button>' +
        '</div>' +
        '<div class="preview-area" id="previewArea"><div class="preview-inner" id="previewInner"></div><p class="preview-hint">↑ Preview — satisfied? Hit Publish above.</p></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}
function emailPopupHTML() {
  return '<div class="email-popup" id="emailPopup" style="display:none">' +
    '<div class="email-box">' +
      '<button class="email-box-close" onclick="dismissEmail()">×</button>' +
      '<div class="email-icon">📬</div>' +
      '<h2>Stay Informed</h2>' +
      '<p>Get the latest world news and geopolitical analysis from Meridian Post.</p>' +
      '<input class="email-field" id="emailField" type="email" placeholder="Your email address">' +
      '<button class="btn-sub" onclick="subscribeEmail()">Subscribe — It\'s Free</button>' +
      '<button class="btn-skip-email" onclick="dismissEmail()">No thanks, I\'ll browse instead</button>' +
    '</div>' +
  '</div>';
}
function toastHTML() { return '<div class="toast" id="toast"></div>'; }
function backTopHTML() { return '<button class="back-top" id="backTop" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">↑</button>'; }
function progressHTML() { return '<div class="progress-bar" id="progressBar"></div>'; }

// ============================================
//  PAGE INIT
// ============================================
function initPage(active) {
  initTheme();
  buildTicker();
  buildAlert();
  buildClock();
  buildDate();
  buildMarkets();
  buildConverter();
  initScroll();
  initEmailPopup();
  document.addEventListener('click', e => {
    if (e.target.id==='pwdOverlay') closePwdModal();
    if (e.target.id==='editorOverlay') closeEditor();
  });
  document.addEventListener('keydown', e => {
    if (e.key==='Escape') { closePwdModal(); closeEditor(); }
  });
}
