// WAFASTOREONLY - FIX PAKSA V2 - ANTI CACHE
console.log("WafaStore Fix Loaded!");
const NEW_IMGS = [
  "https://cdn1.codashop.com/S/content/common/images/mno/roblox_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/mlbb_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/pubgm_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/freefire_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/genshin-impact_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/valorant_320x320.png"
];

function fixNow(){
  const imgs = document.querySelectorAll('.grid-game.card-game img');
  if(imgs.length < 6) return;
  imgs.forEach((img, i)=>{
    if(NEW_IMGS[i] &&!img.src.includes('codashop')){
      img.src = NEW_IMGS[i] + "?v=" + Date.now();
    }
    img.style.display = "block";
    img.style.background = "#fff";
  });
}

setInterval(fixNow, 500);
document.addEventListener('DOMContentLoaded', fixNow);
window.addEventListener('load', fixNow);
fixNow();
