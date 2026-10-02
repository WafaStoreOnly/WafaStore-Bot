// SIDEBAR WAFASTORE - AUTO INJECT WITH FIREBASE GAME ICONS
(function(){
  const sidebarHTML = `
    <div id="wsOverlay" onclick="wsCloseSidebar()"></div>
    <aside id="wsSidebar">
      <div class="ws-logo">
        <img src="./logo.png" alt="logo" id="wsLogoImg">
        <span id="wsBrandName">WafaStoreOnly</span>
      </div>
      <nav class="ws-menu">
        <div class="ws-item" id="wsMenuBeranda" onclick="wsOpen('beranda')">
          🏠 <span>Beranda</span>
        </div>

        <div class="ws-item" id="wsMenuTopup" onclick="wsToggleTopup(event)">
          ⚡ <span>Top Up Game</span> <span class="arrow">▼</span>
        </div>
        <div class="ws-submenu" id="wsSubTopup">
          <a onclick="wsGo('roblox')" data-game-key="roblox">
            <img class="ws-game-icon" data-game-icon="roblox" src="./roblox.png" alt="roblox" style="width:20px;height:20px;object-fit:contain;border-radius:4px">
            <span data-game-name="roblox">Roblox</span>
            <span class="ws-game-status" data-game-status="roblox" style="margin-left:auto;font-size:9px;color:#00ff88">AKTIF</span>
          </a>
          <a onclick="wsGo('mlbb')" data-game-key="mlbb">
            <img class="ws-game-icon" data-game-icon="mlbb" src="./mlbb.png" alt="mlbb" style="width:20px;height:20px;object-fit:contain;border-radius:4px">
            <span data-game-name="mlbb">Mobile Legends</span>
            <span class="ws-game-status" data-game-status="mlbb" style="margin-left:auto;font-size:9px;color:#8d94b8">SOON</span>
          </a>
          <a onclick="wsGo('pubg')" data-game-key="pubg">
            <img class="ws-game-icon" data-game-icon="pubg" src="./pubg.png" alt="pubg" style="width:20px;height:20px;object-fit:contain;border-radius:4px">
            <span data-game-name="pubg">PUBG Mobile</span>
            <span class="ws-game-status" data-game-status="pubg" style="margin-left:auto;font-size:9px;color:#8d94b8">SOON</span>
          </a>
          <a onclick="wsGo('ff')" data-game-key="ff">
            <img class="ws-game-icon" data-game-icon="ff" src="./ff.png" alt="ff" style="width:20px;height:20px;object-fit:contain;border-radius:4px">
            <span data-game-name="ff">Free Fire</span>
            <span class="ws-game-status" data-game-status="ff" style="margin-left:auto;font-size:9px;color:#8d94b8">SOON</span>
          </a>
          <a onclick="wsGo('genshin')" data-game-key="genshin">
            <img class="ws-game-icon" data-game-icon="genshin" src="./genshin.png" alt="genshin" style="width:20px;height:20px;object-fit:contain;border-radius:4px">
            <span data-game-name="genshin">Genshin Impact</span>
            <span class="ws-game-status" data-game-status="genshin" style="margin-left:auto;font-size:9px;color:#8d94b8">SOON</span>
          </a>
          <a onclick="wsGo('valorant')" data-game-key="valorant">
            <img class="ws-game-icon" data-game-icon="valorant" src="./valorant.png" alt="valorant" style="width:20px;height:20px;object-fit:contain;border-radius:4px">
            <span data-game-name="valorant">Valorant</span>
            <span class="ws-game-status" data-game-status="valorant" style="margin-left:auto;font-size:9px;color:#8d94b8">SOON</span>
          </a>
        </div>

        <div class="ws-item" id="wsMenuPesanan" onclick="wsOpen('pesanan')">
          📦 <span>Pesanan</span>
        </div>

        <div class="ws-item" id="wsMenuDompet" onclick="wsOpen('dompet')">
          👛 <span>Dompet</span>
        </div>

        <div class="ws-item" id="wsMenuProfil" onclick="wsOpen('profil')">
          👤 <span>Profil</span>
        </div>

        <div class="ws-item" id="wsMenuAdmin" style="display:none" onclick="wsOpen('admin')">
          🛡️ <span>Admin Panel</span>
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

  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
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
  } else {
    // Game lain: cek status aktif/nonaktif
    const statusEl = document.querySelector(`[data-game-status="${page}"]`);
    const gameName = document.querySelector(`[data-game-name="${page}"]`);
    const nameText = gameName ? gameName.innerText : page;
    if(statusEl && statusEl.innerText.trim() === 'SOON'){
      alert(`⚡ Layanan ${nameText} sedang diproses.\n\nTunggu update dari admin ya! 🙏`);
    } else {
      // Kalau aktif, tetap arahin ke halaman default (karena cuma Roblox yang siap)
      alert(`⚡ Layanan ${nameText} sedang diproses.\n\nTunggu update dari admin ya! 🙏`);
    }
  }
}
function wsOpen(page){
  wsCloseSidebar();
  if(page === 'beranda'){
    if(typeof goHome === 'function') goHome();
    else window.location.href = 'index.html';
  } else if(page === 'pesanan'){
    if(typeof openPesanan === 'function') openPesanan();
    else window.location.href = 'index.html#pesanan';
  } else if(page === 'dompet'){
    window.location.href = 'dompet.html';
  } else if(page === 'profil'){
    window.location.href = 'profil.html';
  } else if(page === 'admin'){
    window.location.href = 'admin.html';
  }
}
function wsSetActive(menu){
  document.querySelectorAll('.ws-item').forEach(i=>i.classList.remove('active'));
  const map = { 'beranda': 'wsMenuBeranda', 'pesanan': 'wsMenuPesanan', 'dompet': 'wsMenuDompet', 'profil': 'wsMenuProfil', 'admin': 'wsMenuAdmin' };
  const id = map[menu];
  if(id){ const el = document.getElementById(id); if(el) el.classList.add('active'); }
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

// UID ADMIN
const ADMIN_UIDS = ['5jLY5Gafn7VJvEIarXxDyfMf7v12'];

// ===== LOAD USER INFO =====
async function wsLoadUser(){
  try{
    if(!window.wafaDB || !window.wafaRef || !window.wafaGet){
      setTimeout(wsLoadUser, 500);
      return;
    }
    const uid = localStorage.getItem('wafa_uid');
    if(!uid) return;

    const snap = await window.wafaGet(window.wafaRef(window.wafaDB, 'users/' + uid));
    const data = snap.val();

    if(data){
      const name = data.nickname || data.name || data.email || 'User';
      const email = data.email || '-';
      const el1 = document.getElementById('wsUserName');
      const el2 = document.getElementById('wsUserEmail');
      const el3 = document.getElementById('wsHeaderUser');
      if(el1) el1.innerText = name.slice(0,18);
      if(el2) el2.innerText = email.length > 20 ? email.slice(0,18)+'...' : email;
      if(el3) el3.innerText = '👤 ' + name.slice(0,12);
    }

    if(ADMIN_UIDS.includes(uid)){
      const adminMenu = document.getElementById('wsMenuAdmin');
      if(adminMenu) adminMenu.style.display = 'flex';
    }

    try{ localStorage.setItem('wafa_user', JSON.stringify({nickname:data.nickname||'',email:data.email||'',saldo:data.saldo||0})); }catch(e){}
  }catch(e){ console.log('wsLoadUser error:', e); }
}

// ===== LOAD BRANDING (logo + nama brand) =====
function wsLoadBranding(){
  try{
    if(!window.wafaDB || !window.wafaRef || !window.wafaOnValue){
      setTimeout(wsLoadBranding, 500);
      return;
    }
    window.wafaOnValue(window.wafaRef(window.wafaDB, 'settings/branding'), (snap)=>{
      const d = snap.val();
      if(!d) return;
      if(d.logo){
        const logoImg = document.getElementById('wsLogoImg');
        if(logoImg) logoImg.src = d.logo;
        // Favicon
        const fav = document.querySelector('link[rel="icon"]') || document.createElement('link');
        fav.rel = 'icon'; fav.href = d.logo;
        document.head.appendChild(fav);
      }
      if(d.brandName){
        const brandEl = document.getElementById('wsBrandName');
        if(brandEl) brandEl.innerText = d.brandName;
        const titleEl = document.getElementById('wsPageTitle');
        if(titleEl) titleEl.innerText = d.brandName + ' ⚡';
      }
    });
  }catch(e){ console.log('wsLoadBranding error:', e); }
}

// ===== LOAD GAME ICONS + NAMA + STATUS =====
function wsLoadGames(){
  try{
    if(!window.wafaDB || !window.wafaRef || !window.wafaOnValue){
      setTimeout(wsLoadGames, 500);
      return;
    }
    window.wafaOnValue(window.wafaRef(window.wafaDB, 'settings/games'), (snap)=>{
      const data = snap.val() || {};
      Object.keys(data).forEach(key=>{
        const g = data[key] || {};
        
        // Update icon
        if(g.logo){
          document.querySelectorAll(`[data-game-icon="${key}"]`).forEach(img=>{
            img.src = g.logo;
          });
        }
        
        // Update nama
        if(g.name){
          document.querySelectorAll(`[data-game-name="${key}"]`).forEach(el=>{
            el.innerText = g.name;
          });
        }
        
        // Update status
        const statusEl = document.querySelector(`[data-game-status="${key}"]`);
        if(statusEl){
          const isActive = g.active === true;
          if(isActive){
            statusEl.innerText = 'AKTIF';
            statusEl.style.color = '#00ff88';
          } else {
            statusEl.innerText = 'SOON';
            statusEl.style.color = '#8d94b8';
          }
        }
      });
    });
  }catch(e){ console.log('wsLoadGames error:', e); }
}

// ===== LOAD THEME (warna) =====
function wsLoadTheme(){
  try{
    if(!window.wafaDB || !window.wafaRef || !window.wafaOnValue){
      setTimeout(wsLoadTheme, 500);
      return;
    }
    window.wafaOnValue(window.wafaRef(window.wafaDB, 'settings/theme'), (snap)=>{
      const d = snap.val();
      if(!d) return;
      if(d.primary){
        document.documentElement.style.setProperty('--primary', d.primary);
        document.documentElement.style.setProperty('--killua-primary', d.primary);
      }
      if(d.accent){
        document.documentElement.style.setProperty('--accent', d.accent);
        document.documentElement.style.setProperty('--killua-accent', d.accent);
      }
    });
  }catch(e){ console.log('wsLoadTheme error:', e); }
}

// ===== INIT =====
function wsInitAll(){
  wsLoadUser();
  wsLoadBranding();
  wsLoadGames();
  wsLoadTheme();
}

if(document.readyState === 'complete'){
  wsInitAll();
} else {
  window.addEventListener('load', wsInitAll);
}
