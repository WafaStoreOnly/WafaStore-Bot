// WAFASTOREONLY - FIX PAKSA V3 - FINAL
console.log("WafaStore Fix Loaded V3!");
const NEW_IMGS = [
  "https://cdn1.codashop.com/S/content/common/images/mno/roblox_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/mlbb_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/pubgm_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/freefire_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/genshin-impact_320x320.png",
  "https://cdn1.codashop.com/S/content/common/images/mno/valorant_320x320.png"
];

function fixNow(){
  // INI YANG BENER - ADA SPASINYA
  const cards = document.querySelectorAll('.grid-game.card-game');
  if(cards.length < 6) return;

  cards.forEach((card, i)=>{
    const img = card.querySelector('img');
    if(!img) return;
    if(NEW_IMGS[i] &&!img.src.includes('codashop')){
      img.src = NEW_IMGS[i];
    }
    img.style.display = "block";
    img.style.background = "#fff";
    img.onerror = function(){
      this.style.background = "#121631";
      this.style.display = "block";
    }
  });
}

document.addEventListener('DOMContentLoaded', fixNow);
window.addEventListener('load', fixNow);
// cukup 1x aja, jangan interval
setTimeout(fixNow, 1000);
