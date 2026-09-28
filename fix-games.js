// WafaStoreOnly - Fix Gambar Game Auto Muncul
// Taruh file ini sejajar sama index.html, jangan edit index.html selain tambah <script src="./fix-games.js"></script>

document.addEventListener('DOMContentLoaded', () => {
  const FIX = {
    roblox: "https://cdn1.codashop.com/S/content/common/images/mno/roblox_320x320.png",
    ml: "https://cdn1.codashop.com/S/content/common/images/mno/mlbb_320x320.png",
    pubg: "https://cdn1.codashop.com/S/content/common/images/mno/pubgm_320x320.png",
    ff: "https://cdn1.codashop.com/S/content/common/images/mno/freefire_320x320.png",
    genshin: "https://cdn1.codashop.com/S/content/common/images/mno/genshin-impact_320x320.png",
    valorant: "https://cdn1.codashop.com/S/content/common/images/mno/valorant_320x320.png"
  };

  document.querySelectorAll('.grid-game .card-game').forEach(card => {
    const nameEl = card.querySelector('.name');
    const img = card.querySelector('img');
    if (!nameEl || !img) return;
    const n = nameEl.innerText.toLowerCase();

    if (n.includes('roblox')) img.src = FIX.roblox;
    else if (n.includes('mobile') || n.includes('legend')) img.src = FIX.ml;
    else if (n.includes('pubg')) img.src = FIX.pubg;
    else if (n.includes('free')) img.src = FIX.ff;
    else if (n.includes('genshin')) img.src = FIX.genshin;
    else if (n.includes('valorant')) img.src = FIX.valorant;

    img.onerror = function() {
      this.onerror = null;
      this.src = './logo.png';
    };
  });
});
