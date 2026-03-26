// ============================================
//  MERIDIAN POST — app.js
//  Supabase: fioilphrakfblmvcseef.supabase.co
// ============================================

const SUPA_URL = 'https://fioilphrakfblmvcseef.supabase.co';
const SUPA_KEY = 'sb_publishable_iUfqV3CK2zvQZpNj_WVXtw_VkGkLXa2';
const EDITOR_PWD = 'Haider@123';
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

const RSS_FEEDS = {
  all:        ['https://feeds.bbci.co.uk/news/world/rss.xml','https://www.aljazeera.com/xml/rss/all.xml','https://feeds.reuters.com/reuters/worldNews'],
  geopolitics:['https://feeds.bbci.co.uk/news/world/rss.xml','https://www.aljazeera.com/xml/rss/all.xml'],
  world:      ['https://feeds.bbci.co.uk/news/world/rss.xml','https://feeds.reuters.com/reuters/worldNews'],
  markets:    ['https://feeds.reuters.com/reuters/businessNews','https://feeds.bbci.co.uk/news/business/rss.xml'],
  technology: ['https://feeds.bbci.co.uk/news/technology/rss.xml','https://feeds.reuters.com/reuters/technologyNews']
};

const CAT_META = {
  geopolitics:{label:'Geopolitics',   cls:'cat-geo', icon:'🌍',bg:'linear-gradient(135deg,#1a1a2e,#16213e)'},
  world:      {label:'World Politics',cls:'cat-pol', icon:'🏛️',bg:'linear-gradient(135deg,#0d1b2a,#1b2a3a)'},
  markets:    {label:'Markets',       cls:'cat-mkt', icon:'📈',bg:'linear-gradient(135deg,#0a1a0a,#1a2a1a)'},
  technology: {label:'Technology',    cls:'cat-tech',icon:'💻',bg:'linear-gradient(135deg,#1a0a2e,#2d1a4a)'},
  opinion:    {label:'Opinion',       cls:'cat-opin',icon:'✍️',bg:'linear-gradient(135deg,#1a1400,#3a2c00)'}
};

const MARKETS_DATA = [
  {name:'S&P 500',  val:'5,480.32',chg:'+0.62%',up:true, spark:[40,42,38,45,43,47,50,48,52,55]},
  {name:'NASDAQ',   val:'17,890',  chg:'+0.88%',up:true, spark:[60,58,62,65,63,68,70,67,72,75]},
  {name:'DOW',      val:'42,311',  chg:'-0.14%',up:false,spark:[55,57,53,50,52,49,47,50,48,46]},
  {name:'Gold /oz', val:'$3,124',  chg:'+1.2%', up:true, spark:[30,35,32,38,40,36,42,45,43,48]},
  {name:'Crude WTI',val:'$74.30',  chg:'-0.8%', up:false,spark:[60,58,55,52,54,50,48,51,49,47]},
  {name:'Bitcoin',  val:'$87,440', chg:'+2.1%', up:true, spark:[40,45,42,50,55,52,58,62,60,65]},
  {name:'NIFTY 50', val:'23,412',  chg:'+0.45%',up:true, spark:[35,37,36,40,42,40,44,46,45,48]},
  {name:'USD/INR',  val:'₹83.42',  chg:'+0.1%', up:false,spark:[50,50,51,50,51,52,51,52,52,53]}
];

const DEFAULT_ALERTS = [
  'Iran nuclear talks reach critical impasse as US deadline expires — diplomats warn of collapse',
  'Gold surges to all-time record as central banks accelerate dollar diversification',
  'Russia launches largest drone strike on Kyiv in six months — power outages reported',
  'China GDP growth beats expectations at 5.2% despite Western tariffs',
  'OpenAI faces EU regulatory action over data privacy violations'
];

const CITIES = [
  {name:'New York', tz:'America/New_York'},
  {name:'London',   tz:'Europe/London'},
  {name:'Dubai',    tz:'Asia/Dubai'},
  {name:'Delhi',    tz:'Asia/Kolkata'},
  {name:'Tokyo',    tz:'Asia/Tokyo'},
  {name:'Sydney',   tz:'Australia/Sydney'},
  {name:'Moscow',   tz:'Europe/Moscow'}
];

const COUNTRIES = [
  {flag:'🇺🇸',name:'United States',s:'med',st:'Moderate tension'},
  {flag:'🇷🇺',name:'Russia',       s:'high',st:'High alert'},
  {flag:'🇨🇳',name:'China',        s:'med',st:'Elevated watch'},
  {flag:'🇮🇷',name:'Iran',         s:'high',st:'Critical'},
  {flag:'🇮🇱',name:'Israel',       s:'high',st:'Active conflict'},
  {flag:'🇮🇳',name:'India',        s:'low', st:'Stable'},
  {flag:'🇵🇰',name:'Pakistan',     s:'med',st:'Economic stress'},
  {flag:'🇩🇪',name:'Germany',      s:'low', st:'Stable'},
  {flag:'🇸🇦',name:'Saudi Arabia', s:'med',st:'Strategic shift'},
  {flag:'🇺🇦',name:'Ukraine',      s:'high',st:'Active conflict'},
  {flag:'🇹🇷',name:'Turkey',       s:'med',st:'Elevated watch'},
  {flag:'🇧🇷',name:'Brazil',       s:'low', st:'Stable'}
];

// ---- STATE ----
var editorUnlocked = false;
var newsCache = {};
var currentAlertIdx = 0;
var alertTimer = null;
var editingId = null;

// ============================================
//  HELPERS
// ============================================
function H(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function A(s) { return String(s||'').replace(/"/g,'&quot;'); }
function cleanSrc(s) {
  if (!s) return 'News';
  return s.replace(/ - .*/,'').replace(/https?:\/\//,'').replace(/www\./,'').split('/')[0].split('.')[0].split(',')[0].trim() || 'News';
}
function timeAgo(str) {
  if (!str) return '';
  try {
    var d = (Date.now() - new Date(str).getTime()) / 1000;
    if (d < 60) return 'Just now';
    if (d < 3600) return Math.floor(d/60) + 'm ago';
    if (d < 86400) return Math.floor(d/3600) + 'h ago';
    if (d < 604800) return Math.floor(d/86400) + 'd ago';
    return new Date(str).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  } catch(e) { return ''; }
}
function readTime(text) { return Math.max(1, Math.ceil((text||'').split(/\s+/).length / 200)); }
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 3200);
}

// ============================================
//  THEME
// ============================================
function initTheme() {
  var t = localStorage.getItem('mp-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  var btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme');
  var nxt = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nxt);
  localStorage.setItem('mp-theme', nxt);
  var btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = nxt === 'dark' ? '☀️' : '🌙';
}

// ============================================
//  NAV
// ============================================
function toggleMobileNav() {
  var nav = document.getElementById('mobileNav');
  var hb = document.getElementById('hamburger');
  if (nav) nav.classList.toggle('open');
  if (hb) hb.classList.toggle('open');
}
function closeMobileNav() {
  var nav = document.getElementById('mobileNav');
  var hb = document.getElementById('hamburger');
  if (nav) nav.classList.remove('open');
  if (hb) hb.classList.remove('open');
}

// ============================================
//  TICKER
// ============================================
function buildTicker() {
  var el = document.getElementById('tickerTrack');
  if (!el) return;
  var items = [
    {l:'S&P 500',v:'5,480',c:'+0.62%',u:true},{l:'NASDAQ',v:'17,890',c:'+0.88%',u:true},
    {l:'DOW',v:'42,311',c:'-0.14%',u:false},{l:'GOLD',v:'$3,124',c:'+1.2%',u:true},
    {l:'OIL',v:'$74.30',c:'-0.8%',u:false},{l:'BTC',v:'$87,440',c:'+2.1%',u:true},
    {l:'ETH',v:'$3,210',c:'+1.4%',u:true},{l:'NIFTY',v:'23,412',c:'+0.45%',u:true},
    {l:'SENSEX',v:'77,102',c:'+0.38%',u:true},{l:'USD/INR',v:'₹83.42',c:'+0.1%',u:false},
    {l:'EUR/USD',v:'1.0831',c:'-0.3%',u:false},{l:'SILVER',v:'$32.80',c:'+0.9%',u:true}
  ];
  el.innerHTML = items.concat(items).map(function(i) {
    return '<span>' + i.l + ' <b class="' + (i.u?'up':'dn') + '">' + (i.u?'▲':'▼') + ' ' + i.v + ' ' + i.c + '</b></span>';
  }).join('');
}

// ============================================
//  ALERT BANNER
// ============================================
function buildAlert() {
  var el = document.getElementById('alertText');
  if (!el) return;
  var alerts = JSON.parse(localStorage.getItem('mp-breaking') || 'null') || DEFAULT_ALERTS;
  el.textContent = alerts[0];
  clearInterval(alertTimer);
  alertTimer = setInterval(function() {
    var alerts2 = JSON.parse(localStorage.getItem('mp-breaking') || 'null') || DEFAULT_ALERTS;
    currentAlertIdx = (currentAlertIdx + 1) % alerts2.length;
    el.style.opacity = '0';
    setTimeout(function() { el.textContent = alerts2[currentAlertIdx]; el.style.opacity = '1'; }, 400);
  }, 6000);
}
function dismissAlert() {
  var el = document.getElementById('alertBanner');
  if (el) el.style.display = 'none';
  clearInterval(alertTimer);
}

// ============================================
//  WORLD CLOCK
// ============================================
function buildClock() {
  var el = document.getElementById('worldClock');
  if (!el) return;
  function update() {
    el.innerHTML = CITIES.map(function(c, i) {
      return (i > 0 ? '<div class="clock-sep"></div>' : '') +
        '<div class="clock-item">' +
          '<span class="clock-city">' + c.name + '</span>' +
          '<span class="clock-time">' + new Date().toLocaleTimeString('en-US',{timeZone:c.tz,hour:'2-digit',minute:'2-digit',hour12:false}) + '</span>' +
        '</div>';
    }).join('');
  }
  update();
  setInterval(update, 1000);
}

// ============================================
//  DATE
// ============================================
function buildDate() {
  var el = document.getElementById('heroDate');
  if (!el) return;
  var d = new Date();
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  el.textContent = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

// ============================================
//  MARKETS WIDGET
// ============================================
function buildMarkets() {
  var el = document.getElementById('marketWidget');
  if (!el) return;
  var bullish = MARKETS_DATA.filter(function(m){ return m.up; }).length > MARKETS_DATA.length / 2;
  var html = MARKETS_DATA.map(function(m) {
    var maxH = Math.max.apply(null, m.spark);
    var minH = Math.min.apply(null, m.spark);
    var bars = m.spark.map(function(v) {
      var h = Math.max(3, Math.round(((v - minH) / ((maxH - minH) || 1)) * 14) + 3);
      return '<span class="spark-bar" style="height:' + h + 'px;background:' + (m.up ? 'var(--green)' : 'var(--red)') + '"></span>';
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
  }).join('');
  html += '<div class="market-mood">' +
    (bullish ? '<span style="color:var(--green)">▲ Bullish Market</span>' : '<span style="color:var(--red)">▼ Bearish Market</span>') +
    '<span style="margin-left:auto;font-size:0.63rem;color:var(--muted);font-family:\'DM Mono\',monospace">' + new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) + '</span>' +
  '</div>';
  el.innerHTML = html;
}

// ============================================
//  CURRENCY CONVERTER
// ============================================
function buildConverter() {
  var el = document.getElementById('converterWidget');
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
  var val = parseFloat(document.getElementById('convInput') && document.getElementById('convInput').value) || 0;
  var inr = (val * 83.42).toFixed(2);
  var el = document.getElementById('convResult');
  if (!el) return;
  el.innerHTML =
    '<div style="font-family:\'DM Mono\',monospace;font-size:1.1rem;font-weight:700;color:var(--accent)">₹' + parseFloat(inr).toLocaleString('en-IN') + '</div>' +
    '<div style="font-size:0.67rem;color:var(--muted);margin-top:2px">' + val + ' USD = ₹' + inr + ' INR</div>';
}

// ============================================
//  COUNTRY SPOTLIGHT
// ============================================
function buildCountries(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = COUNTRIES.map(function(c) {
    return '<div class="country-card">' +
      '<div class="country-flag">' + c.flag + '</div>' +
      '<div class="country-name">' + c.name + '</div>' +
      '<div class="country-status"><span class="status-dot s-' + c.s + '"></span>' + c.st + '</div>' +
    '</div>';
  }).join('');
}

// ============================================
//  RSS NEWS
// ============================================
async function fetchFeed(url) {
  try {
    var res = await fetch(RSS2JSON + encodeURIComponent(url) + '&count=12');
    var data = await res.json();
    return (data.status === 'ok' && data.items) ? data.items : [];
  } catch(e) { return []; }
}

async function fetchNews(category) {
  if (newsCache[category]) return newsCache[category];
  var feeds = RSS_FEEDS[category] || RSS_FEEDS.all;
  var results = await Promise.all(feeds.map(fetchFeed));
  var seen = new Set();
  var merged = [];
  results.forEach(function(items) {
    items.forEach(function(item) {
      if (item.title && item.title !== '[Removed]' && !seen.has(item.title)) {
        seen.add(item.title);
        merged.push(item);
      }
    });
  });
  merged.sort(function(a,b){ return new Date(b.pubDate) - new Date(a.pubDate); });
  newsCache[category] = merged;
  return merged;
}

// ============================================
//  RENDER NEWS CARDS
// ============================================
function renderCards(articles, category, containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var meta = CAT_META[category] || CAT_META.geopolitics;
  if (!articles || !articles.length) {
    el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 0">' +
      '<div style="font-size:2.5rem;margin-bottom:14px">📡</div>' +
      '<p style="color:var(--muted);font-size:0.88rem">Could not load news right now.</p>' +
      '<button onclick="location.reload()" style="margin-top:14px;background:var(--accent);color:#000;border:none;padding:9px 22px;border-radius:5px;font-size:0.78rem;font-weight:700;cursor:pointer">Try Again</button>' +
    '</div>';
    return;
  }
  el.innerHTML = '<div class="cards-grid">' +
    articles.slice(0,8).map(function(item, i) {
      var src = cleanSrc(item.author || item.feed || '');
      var time = timeAgo(item.pubDate);
      var hasImg = item.thumbnail && item.thumbnail.startsWith('http');
      var rt = readTime(item.description || '');
      var desc = item.description ? item.description.replace(/<[^>]*>/g,'') : '';
      var payload = {
        title: item.title,
        description: desc.slice(0, 500),
        source: src, time: time, url: item.link,
        image: hasImg ? item.thumbnail : '',
        category: meta.label
      };
      var enc = encodeURIComponent(JSON.stringify(payload));
      return '<div class="card" style="animation-delay:' + (i*0.07) + 's" onclick="goNews(\'' + enc + '\')">' +
        '<div class="card-img" style="background:' + meta.bg + '">' +
          (hasImg ? '<img src="' + A(item.thumbnail) + '" alt="" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'">' : '') +
          '<div class="card-img-fallback" style="background:' + meta.bg + '">' + meta.icon + '</div>' +
          '<div class="card-img-overlay"></div>' +
          '<div class="card-img-src">' + H(src) + '</div>' +
        '</div>' +
        '<div class="card-cat ' + meta.cls + '">' + H(meta.label) + '</div>' +
        '<div class="card-title">' + H(item.title) + '</div>' +
        (desc ? '<div class="card-excerpt">' + H(desc.slice(0,120)) + '...</div>' : '') +
        '<div class="card-footer">' +
          '<span class="card-src"><span class="card-dot"></span>' + H(src) + '</span>' +
          '<span>⏱ ' + rt + 'min · ' + time + '</span>' +
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
  var el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '<div class="cards-grid">' +
    Array.from({length: count}, function(_, i) {
      return '<div style="animation:fadeUp 0.5s ease ' + (i*0.08) + 's both">' +
        '<div class="skeleton skel-img"></div>' +
        '<div class="skeleton" style="height:10px;width:55%;margin-bottom:8px;border-radius:3px"></div>' +
        '<div class="skeleton skel-l" style="height:16px;margin-bottom:6px;border-radius:3px"></div>' +
        '<div class="skeleton skel-m" style="height:16px;margin-bottom:12px;border-radius:3px"></div>' +
        '<div class="skeleton skel-l" style="height:12px;margin-bottom:5px;border-radius:3px"></div>' +
        '<div class="skeleton" style="height:12px;width:60%;border-radius:3px"></div>' +
      '</div>';
    }).join('') +
  '</div>';
}

// ============================================
//  SUPABASE
// ============================================
async function sbFetch(path, opts) {
  var url = SUPA_URL + '/rest/v1/' + path;
  var headers = {
    'apikey': SUPA_KEY,
    'Authorization': 'Bearer ' + SUPA_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  if (opts && opts.headers) Object.assign(headers, opts.headers);
  var res = await fetch(url, Object.assign({}, opts, {headers: headers}));
  if (!res.ok) {
    var err = await res.text();
    throw new Error(err);
  }
  var text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function getArticles(draftsOnly) {
  try {
    var q = draftsOnly
      ? 'articles?is_draft=eq.true&order=created_at.desc&select=*'
      : 'articles?is_draft=eq.false&order=created_at.desc&select=*';
    return await sbFetch(q);
  } catch(e) { return []; }
}

async function getAllArticles() {
  try { return await sbFetch('articles?order=created_at.desc&select=*'); }
  catch(e) { return []; }
}

async function getArticleById(id) {
  try {
    var data = await sbFetch('articles?id=eq.' + id + '&select=*');
    return (data && data[0]) ? data[0] : null;
  } catch(e) { return null; }
}

async function saveArticle(payload) {
  return await sbFetch('articles', {method:'POST', body:JSON.stringify(payload)});
}

async function updateArticle(id, updates) {
  return await sbFetch('articles?id=eq.' + id, {
    method: 'PATCH',
    headers: {'Prefer':'return=minimal'},
    body: JSON.stringify(updates)
  });
}

async function deleteArticle(id) {
  await sbFetch('articles?id=eq.' + id, {
    method: 'DELETE',
    headers: {'Prefer':'return=minimal'}
  });
}

async function incrementViews(id) {
  try {
    var data = await sbFetch('articles?id=eq.' + id + '&select=views');
    var views = ((data && data[0] && data[0].views) || 0) + 1;
    await sbFetch('articles?id=eq.' + id, {
      method:'PATCH',
      headers:{'Prefer':'return=minimal'},
      body: JSON.stringify({views: views})
    });
  } catch(e) {}
}

// ============================================
//  PASSWORD
// ============================================
async function hashPwd(p) {
  var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p));
  return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
}
async function checkPwd(input) {
  var a = await hashPwd(input);
  var b = await hashPwd(EDITOR_PWD);
  return a === b;
}
function openPwdModal(onSuccess) {
  var overlay = document.getElementById('pwdOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  var input = document.getElementById('pwdInput');
  if (input) { input.value = ''; input.type = 'password'; setTimeout(function(){ input.focus(); }, 100); }
  var err = document.getElementById('pwdError');
  if (err) err.style.display = 'none';
  window._pwdCb = onSuccess;
}
function closePwdModal() {
  var overlay = document.getElementById('pwdOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}
async function submitPwd() {
  var input = document.getElementById('pwdInput');
  var err = document.getElementById('pwdError');
  if (!input || !input.value.trim()) return;
  var ok = await checkPwd(input.value.trim());
  if (ok) {
    editorUnlocked = true;
    closePwdModal();
    if (window._pwdCb) window._pwdCb();
  } else {
    if (err) { err.style.display = 'block'; err.textContent = 'Incorrect password. Try again.'; }
    input.value = '';
    input.focus();
  }
}
function togglePwdEye() {
  var i = document.getElementById('pwdInput');
  var b = document.getElementById('pwdEye');
  if (!i || !b) return;
  i.type = i.type === 'password' ? 'text' : 'password';
  b.textContent = i.type === 'password' ? '👁' : '🙈';
}

// ============================================
//  EDITOR MODAL
// ============================================
function openEditor(articleId) {
  if (!editorUnlocked) { openPwdModal(function(){ openEditor(articleId); }); return; }
  var overlay = document.getElementById('editorOverlay');
  if (!overlay) return;
  editingId = articleId || null;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (articleId) { loadIntoEditor(articleId); }
  else { resetEditor(); }
}
function closeEditor() {
  var overlay = document.getElementById('editorOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
}
function resetEditor() {
  ['edTitle','edExcerpt','edBody','edSchedule'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var icon = document.getElementById('edIcon');
  if (icon) icon.value = '🌍';
  var cat = document.getElementById('edCat');
  if (cat) cat.value = 'Geopolitics';
  var wc = document.getElementById('wordCount');
  if (wc) wc.textContent = '0 words';
  var prev = document.getElementById('previewArea');
  if (prev) prev.classList.remove('show');
  var title = document.querySelector('#editorOverlay .modal-title');
  if (title) title.textContent = '✏️ Write & Publish';
}
async function loadIntoEditor(id) {
  var a = await getArticleById(id);
  if (!a) return;
  var title = document.querySelector('#editorOverlay .modal-title');
  if (title) title.textContent = '✏️ Edit Article';
  var set = function(elId, val){ var el = document.getElementById(elId); if(el) el.value = val || ''; };
  set('edTitle', a.title);
  set('edExcerpt', a.excerpt);
  set('edBody', a.body);
  set('edIcon', a.icon || '🌍');
  var cat = document.getElementById('edCat');
  if (cat) cat.value = a.category || 'Geopolitics';
  updateWordCount();
}
function updateWordCount() {
  var body = document.getElementById('edBody');
  var wc = document.getElementById('wordCount');
  if (!body || !wc) return;
  var w = body.value.trim().split(/\s+/).filter(Boolean).length;
  wc.textContent = w + ' word' + (w !== 1 ? 's' : '');
}
function previewArticle() {
  var title = document.getElementById('edTitle') ? document.getElementById('edTitle').value.trim() : '';
  var body = document.getElementById('edBody') ? document.getElementById('edBody').value.trim() : '';
  var cat = document.getElementById('edCat') ? document.getElementById('edCat').value : '';
  if (!title || !body) { showToast('Fill in headline and body first.'); return; }
  var prev = document.getElementById('previewArea');
  var inner = document.getElementById('previewInner');
  if (!prev || !inner) return;
  inner.innerHTML =
    '<div style="font-size:0.6rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent2);margin-bottom:8px">' + H(cat) + '</div>' +
    '<div style="font-family:\'Playfair Display\',serif;font-size:1.2rem;font-weight:900;line-height:1.2;margin-bottom:14px">' + H(title) + '</div>' +
    '<div style="font-size:0.88rem;line-height:1.85;white-space:pre-line">' + H(body) + '</div>';
  prev.classList.add('show');
  prev.scrollIntoView({behavior:'smooth', block:'start'});
}
async function publishArticle(isDraft) {
  var title = document.getElementById('edTitle') ? document.getElementById('edTitle').value.trim() : '';
  var excerpt = document.getElementById('edExcerpt') ? document.getElementById('edExcerpt').value.trim() : '';
  var body = document.getElementById('edBody') ? document.getElementById('edBody').value.trim() : '';
  var cat = document.getElementById('edCat') ? document.getElementById('edCat').value : 'Geopolitics';
  var icon = document.getElementById('edIcon') ? document.getElementById('edIcon').value.trim() : '🌍';
  var schedule = document.getElementById('edSchedule') ? document.getElementById('edSchedule').value : '';
  if (!title) { showToast('Please enter a headline.'); return; }
  if (!body) { showToast('Please write the article body.'); return; }
  var btn = document.getElementById('btnPublish');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>'; }
  try {
    var payload = {
      title: title,
      excerpt: excerpt || body.slice(0,180) + '...',
      body: body,
      category: cat,
      icon: icon || '🌍',
      author: 'J. Asghar',
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
    if (typeof loadAdminData === 'function') loadAdminData();
  } catch(e) {
    showToast('Error: ' + e.message);
  }
  if (btn) { btn.disabled = false; btn.textContent = '🚀 Publish Now'; }
}
function saveDraft() { publishArticle(true); }

// ============================================
//  PUBLISHED ARTICLES
// ============================================
async function loadPublished() {
  var wrapper = document.getElementById('pubWrapper');
  var grid = document.getElementById('pubGrid');
  if (!wrapper || !grid) return;
  var articles = await getArticles(false);
  if (!articles.length) { wrapper.style.display = 'none'; return; }
  wrapper.style.display = 'block';
  grid.innerHTML = articles.map(function(a) {
    return '<div class="pub-card">' +
      '<span class="pub-badge">Live</span>' +
      (editorUnlocked ? '<button class="pub-delete" onclick="handleDelPub(' + a.id + ',event)" title="Delete">×</button>' : '') +
      '<div class="pub-cat">' + H(a.category) + '</div>' +
      '<div class="pub-title" onclick="goPub(' + a.id + ')">' + H(a.title) + '</div>' +
      '<div class="pub-excerpt">' + H(a.excerpt || '') + '</div>' +
      '<div class="pub-meta">J. Asghar · ' + timeAgo(a.created_at) + (a.views ? ' · 👁 ' + a.views : '') + '</div>' +
    '</div>';
  }).join('');
}

function goPub(id) {
  localStorage.setItem('mp-pub-id', id);
  window.location.href = 'article.html';
}

async function handleDelPub(id, e) {
  if (e) e.stopPropagation();
  if (!editorUnlocked) return;
  if (!confirm('Delete this article permanently?')) return;
  try { await deleteArticle(id); showToast('Article deleted.'); loadPublished(); }
  catch(e) { showToast('Error deleting.'); }
}

// ============================================
//  MOST READ
// ============================================
async function buildMostRead() {
  var el = document.getElementById('mostReadWidget');
  if (!el) return;
  try {
    var articles = await sbFetch('articles?is_draft=eq.false&order=views.desc&limit=5&select=id,title,views,category');
    if (!articles.length) { el.innerHTML = '<p style="font-size:0.8rem;color:var(--muted)">No articles yet.</p>'; return; }
    el.innerHTML = articles.map(function(a, i) {
      return '<div class="most-read-item" onclick="goPub(' + a.id + ')">' +
        '<span class="mr-rank">0' + (i+1) + '</span>' +
        '<div><div class="mr-title">' + H(a.title) + '</div>' +
        '<div class="mr-views">👁 ' + (a.views||0) + ' · ' + H(a.category) + '</div></div>' +
      '</div>';
    }).join('');
  } catch(e) { el.innerHTML = '<p style="font-size:0.8rem;color:var(--muted)">Could not load.</p>'; }
}

// ============================================
//  SEARCH
// ============================================
async function handleSearch(query) {
  var clear = document.getElementById('searchClear');
  if (clear) clear.classList.toggle('visible', query.length > 0);
  if (!query.trim()) { loadPublished(); return; }
  try {
    var articles = await sbFetch('articles?is_draft=eq.false&select=*');
    var q = query.toLowerCase();
    var filtered = articles.filter(function(a) {
      return (a.title||'').toLowerCase().includes(q) ||
             (a.excerpt||'').toLowerCase().includes(q) ||
             (a.category||'').toLowerCase().includes(q);
    });
    var wrapper = document.getElementById('pubWrapper');
    var grid = document.getElementById('pubGrid');
    if (!wrapper || !grid) return;
    wrapper.style.display = 'block';
    if (!filtered.length) {
      grid.innerHTML = '<p style="color:var(--muted);font-size:0.88rem;padding:20px 0">No results for "' + H(query) + '"</p>';
      return;
    }
    grid.innerHTML = filtered.map(function(a) {
      return '<div class="pub-card">' +
        '<span class="pub-badge">Live</span>' +
        '<div class="pub-cat">' + H(a.category) + '</div>' +
        '<div class="pub-title" onclick="goPub(' + a.id + ')">' + H(a.title) + '</div>' +
        '<div class="pub-excerpt">' + H(a.excerpt||'') + '</div>' +
        '<div class="pub-meta">J. Asghar · ' + timeAgo(a.created_at) + '</div>' +
      '</div>';
    }).join('');
  } catch(e) {}
}

function clearSearch() {
  var input = document.getElementById('searchInput');
  if (input) input.value = '';
  var clear = document.getElementById('searchClear');
  if (clear) clear.classList.remove('visible');
  loadPublished();
}

// ============================================
//  SCROLL EFFECTS
// ============================================
function initScroll() {
  window.addEventListener('scroll', function() {
    var pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    var pb = document.getElementById('progressBar');
    if (pb) pb.style.width = pct + '%';
    var bt = document.getElementById('backTop');
    if (bt) bt.classList.toggle('visible', window.scrollY > 400);
  });
}

// ============================================
//  EMAIL POPUP
// ============================================
function initEmailPopup() {
  if (localStorage.getItem('mp-popup')) return;
  setTimeout(function() {
    var popup = document.getElementById('emailPopup');
    if (popup) popup.style.display = 'flex';
  }, 5000);
}
function dismissEmail() {
  var popup = document.getElementById('emailPopup');
  if (popup) {
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.3s';
    setTimeout(function(){ popup.style.display = 'none'; }, 300);
  }
  localStorage.setItem('mp-popup', '1');
}
function subscribeEmail() {
  var input = document.getElementById('emailField');
  var email = input ? input.value.trim() : '';
  if (!email || !email.includes('@')) { showToast('Please enter a valid email.'); return; }
  dismissEmail();
  showToast('Subscribed! Thank you.');
}

// ============================================
//  SHARE
// ============================================
function shareArticle(title, url) {
  if (navigator.share) {
    navigator.share({title: title, url: url}).catch(function(){});
  } else {
    navigator.clipboard.writeText(url).then(function(){ showToast('Link copied!'); }).catch(function(){ showToast('Copy the URL from your browser.'); });
  }
}
function shareWA(title, url) {
  window.open('https://wa.me/?text=' + encodeURIComponent(title + ' ' + url), '_blank');
}
function shareTW(title, url) {
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url), '_blank');
}

// ============================================
//  SHARED HTML BUILDERS
// ============================================
function navHTML(active) {
  var pages = [
    {id:'index',        label:'Home',          href:'index.html'},
    {id:'geopolitics',  label:'Geopolitics',   href:'geopolitics.html'},
    {id:'world-politics',label:'World Politics',href:'world-politics.html'},
    {id:'markets',      label:'Markets',       href:'markets.html'},
    {id:'technology',   label:'Technology',    href:'technology.html'}
  ];
  return '<nav class="nav">' +
    '<a href="index.html" class="nav-logo"><div class="nav-logo-mark">M</div><span class="nav-logo-text">Meridian Post</span></a>' +
    '<ul class="nav-links">' + pages.map(function(p){
      return '<li><a href="' + p.href + '"' + (active===p.id?' class="active"':'') + '>' + p.label + '</a></li>';
    }).join('') + '</ul>' +
    '<div class="nav-right">' +
      '<button class="btn-theme" id="btnTheme" onclick="toggleTheme()">☀️</button>' +
      '<button class="btn-plus" onclick="openEditor()" title="Write new post">+</button>' +
      '<button class="hamburger" id="hamburger" onclick="toggleMobileNav()"><span></span><span></span><span></span></button>' +
    '</div>' +
  '</nav>' +
  '<div class="mobile-nav" id="mobileNav">' +
    pages.map(function(p){
      return '<a href="' + p.href + '"' + (active===p.id?' class="active"':'') + ' onclick="closeMobileNav()">' + p.label + '</a>';
    }).join('') +
    '<a href="admin.html" onclick="closeMobileNav()">⚙️ Admin Panel</a>' +
    '<a href="#" onclick="openEditor();closeMobileNav()">✏️ Write New Post</a>' +
  '</div>';
}

function progressHTML() { return '<div class="progress-bar" id="progressBar"></div>'; }
function alertHTML()    { return '<div class="alert-banner" id="alertBanner"><span class="alert-label"><span class="alert-dot"></span>Breaking</span><span class="alert-text" id="alertText" style="transition:opacity 0.4s"></span><button class="alert-close" onclick="dismissAlert()">×</button></div>'; }
function tickerHTML()   { return '<div class="ticker"><div class="ticker-label"><span class="ticker-dot"></span>Live</div><div class="ticker-body"><div class="ticker-track" id="tickerTrack"></div></div></div>'; }
function clockHTML()    { return '<div class="world-clock" id="worldClock"></div>'; }
function backTopHTML()  { return '<button class="back-top" id="backTop" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">↑</button>'; }
function toastHTML()    { return '<div class="toast" id="toast"></div>'; }

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
      '<div class="modal-head"><div><div class="modal-title">✏️ Write & Publish</div><div class="modal-sub">Published articles are visible to everyone worldwide via Supabase</div></div>' +
      '<button class="modal-close" onclick="closeEditor()">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="form-row">' +
          '<div class="form-group" style="margin-bottom:0"><label class="form-label">Category</label>' +
            '<select class="form-select" id="edCat"><option>Geopolitics</option><option>World Politics</option><option>Markets</option><option>Technology</option><option>Opinion</option></select>' +
          '</div>' +
          '<div class="form-group" style="margin-bottom:0"><label class="form-label">Icon (emoji)</label>' +
            '<input class="form-input" id="edIcon" maxlength="4" value="🌍">' +
          '</div>' +
        '</div>' +
        '<div class="form-group" style="margin-top:14px"><label class="form-label">Headline *</label>' +
          '<input class="form-input" id="edTitle" placeholder="Write a strong, clear headline..." style="font-size:0.97rem;font-weight:700">' +
        '</div>' +
        '<div class="form-group"><label class="form-label">Short Summary (shown on cards — optional)</label>' +
          '<textarea class="form-textarea" id="edExcerpt" placeholder="1-2 sentence summary..." style="min-height:60px"></textarea>' +
        '</div>' +
        '<div class="form-group"><label class="form-label">Schedule Publish Date (optional)</label>' +
          '<input class="form-input" type="datetime-local" id="edSchedule">' +
          '<div class="form-hint">Leave blank to publish immediately.</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">' +
            '<label class="form-label" style="margin-bottom:0">Article Body *</label>' +
            '<span class="word-count" id="wordCount">0 words</span>' +
          '</div>' +
          '<textarea class="form-textarea" id="edBody" oninput="updateWordCount()" placeholder="Write your full article here...\n\nLeave a blank line between paragraphs."></textarea>' +
        '</div>' +
        '<button class="btn-secondary" onclick="previewArticle()">👁 Preview Article</button>' +
        '<div class="btn-pub-row">' +
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
    '<div class="footer-bottom">' +
      '<span>© 2026 Meridian Post. All rights reserved.</span>' +
      '<span>Founded by J. Asghar · Independent Global News</span>' +
    '</div>' +
  '</footer>';
}

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
  document.addEventListener('click', function(e) {
    if (e.target.id === 'pwdOverlay') closePwdModal();
    if (e.target.id === 'editorOverlay') closeEditor();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closePwdModal(); closeEditor(); }
  });
}
