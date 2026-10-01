// SIDEBAR WAFASTORE - AUTO INJECT
(function(){
  const sidebarHTML = `
    <div id="wsOverlay" onclick="wsCloseSidebar()"></div>
    <aside id="wsSidebar">
      <div class="ws-logo">
        <img src="./logo.png" alt="logo">
        <span>WafaStoreOnly</span>
      </div>
      <nav class="ws-menu">
        <div class="ws-item" id="wsMenuTopup" onclick="wsToggleTopup(event)">
          ⚡ <span>Top Up Game</span> <span class="arrow">▼</span>
        </div>
        <div class="ws-submenu" id="wsSubTopup">
          <a onclick="wsGo('roblox')">🎮 Roblox <span style="margin-left:auto;font-size:9px;color:#00ff88">AKTIF</span></a>
          <a class="soon" onclick="wsSoon('Mobile Legends')">⚔️ Mobile Legends</a>
          <a class="soon" onclick="wsSoon('PUBG Mobile')">🔫 PUBG Mobile</a>
          <a class="soon" onclick="wsSoon('Free Fire')">🔥 Free Fire</a>
          <a class="soon" onclick="wsSoon('Genshin Impact')">✨ Genshin Impact</a>
          <a class="soon" onclick="wsSoon('Valorant')">🎯 Valorant</a>
        </div>

        <div class="ws-item" onclick="wsOpen('pesanan')">
          📦 <span>Pesanan</span>
        </div>

        <div class="ws-item" onclick="wsOpen('dompet')">
          👛 <span>Dompet</span>
        </div>

        <div class="ws-item" onclick="wsOpen('profil')">
          👤 <span>Profil</span>
        </div>
      </nav>

      <div class="ws-userbox">
        <div class="ws-user" onclick="wsOpen('profil')">
          <span id="wsUserName">Loading...</span>
          <small id="wsUserEmail">-</small>
        </div>
      </div>
    </aside>
  `;

  const headerHTML = `
    <header class="ws-header">
      <div class="ws-hamburger" onclick="wsToggleSidebar()">☰</div>
      <div style="font-weight:900;font-size:14px" id="wsPageTitle">WafaStoreOnly ⚡</div>
      <div class="ws-header-user" id="wsHeaderUser" onclick="wsOpen('profil')">👤 Loading...</div>
    </header>
  `;

  // Inject sidebar + overlay ke body
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  // Inject header di dalam konten
  const content = document.getElementById('wsContent');
  if(content){
    content.insertAdjacentHTML('afterbegin', headerHTML);
  } else {
    document.body.insertAdjacentHTML('beforeend', `<div id="wsContent">${headerHTML}</div>`);
  }
})();

function wsToggleSidebar(){
  document.getElementById('wsSidebar').classList.toggle('open');
  document.getElementById('wsOverlay').classList.toggle('open');
}
function wsCloseSidebar(){
  document.getElementById('wsSidebar').classList.remove('open');
  document.getElementById('wsOverlay').classList.remove('open');
}
function wsToggleTopup(e){
  e.stopPropagation();
  const item = document.getElementById('wsMenuTopup');
  const sub = document.getElementById('wsSubTopup');
  item.classList.toggle('open');
  sub.classList.toggle('open');
}
function wsSoon(game){
  alert(`⚡ Layanan ${game} sedang diproses.\n\nTunggu update dari admin ya! 🙏`);
  wsCloseSidebar();
}
function wsGo(page){
  wsCloseSidebar();
  if(page === 'roblox'){
    if(typeof openRoblox === 'function') openRoblox();
    else window.location.href = 'index.html#roblox';
  }
}
function wsOpen(page){
  wsCloseSidebar();
  if(page === 'pesanan'){
    if(typeof openPesanan === 'function') openPesanan();
    else window.location.href = 'index.html#pesanan';
  } else if(page === 'dompet'){
    window.location.href = 'dompet.html';
  } else if(page === 'profil'){
    window.location.href = 'profil.html';
  }
}
function wsSetActive(menu){
  document.querySelectorAll('.ws-item').forEach(i=>i.classList.remove('active'));
  const el = document.getElementById('wsMenu_' + menu);
  if(el) el.classList.add('active');
}
function wsSetTitle(txt){
  const el = document.getElementById('wsPageTitle');
  if(el) el.innerText = txt;
}
function wsToast(msg){
  let t = document.querySelector('.ws-toast');
  if(!t){
    t = document.createElement('div');
    t.className = 'ws-toast';
    document.body.appendChild(t);
  }
  t.innerText = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 2500);
}
// Load user info
async function wsLoadUser(){
  try{
    const uid = localStorage.getItem('wafa_uid');
    if(!uid) return;
    const res = await fetch(`https://wafastoreonly-default-rtdb.asia-southeast1.firebasedatabase.app/users/${uid}.json`);
    const data = await res.json();
    if(data){
      const name = data.nickname || data.email || 'User';
      const email = data.email || '-';
      const el1 = document.getElementById('wsUserName');
      const el2 = document.getElementById('wsUserEmail');
      const el3 = document.getElementById('wsHeaderUser');
      if(el1) el1.innerText = name.slice(0,18);
      if(el2) el2.innerText = email.length > 20 ? email.slice(0,18)+'...' : email;
      if(el3) el3.innerText = '👤 ' + name.slice(0,12);
    }
  }catch(e){}
}
window.addEventListener('load', wsLoadUser);
