/* ================= Paper Stock v1 ================= */
const DB_KEY = 'paperstock_v1';
let DB = null;
const $ = id => document.getElementById(id);
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pkr = n => curCode() + ' ' + Number(n||0).toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2});
const pkrMinus = n => curCode() + ' -' + Number(n||0).toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}); // minus with the NUMBER: PKR -7,500.00
const dstr = d => { d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
(function(){
  const isFld=el=>el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.tagName==='SELECT');
  function setKb(open){ const nav=document.querySelector('nav.toptabs'); if(nav) nav.classList.toggle('kb-hidden',open); }
  document.addEventListener('focusin',e=>{ if(isFld(e.target)) setKb(true); });
  document.addEventListener('focusout',()=>setTimeout(()=>setKb(isFld(document.activeElement)),250));
})();
function toast(m){ const t=$('toast'); t.textContent=m; t.classList.remove('hidden'); clearTimeout(t._tm); t._tm=setTimeout(()=>t.classList.add('hidden'),2400); }

/* ================= CURRENCY: country list [name, iso2, code, symbol] ================= */
const COUNTRIES=[
["Pakistan","PK","PKR","Rs"],["Afghanistan","AF","AFN","؋"],["Albania","AL","ALL","L"],["Algeria","DZ","DZD","دج"],
["Andorra","AD","EUR","€"],["Angola","AO","AOA","Kz"],["Argentina","AR","ARS","$"],["Armenia","AM","AMD","֏"],
["Australia","AU","AUD","$"],["Austria","AT","EUR","€"],["Azerbaijan","AZ","AZN","₼"],["Bahamas","BS","BSD","$"],
["Bahrain","BH","BHD","ب.د"],["Bangladesh","BD","BDT","৳"],["Belarus","BY","BYN","Br"],["Belgium","BE","EUR","€"],
["Belize","BZ","BZD","$"],["Benin","BJ","XOF","CFA"],["Bhutan","BT","BTN","Nu."],["Bolivia","BO","BOB","$"],
["Bosnia & Herz.","BA","BAM","KM"],["Botswana","BW","BWP","P"],["Brazil","BR","BRL","R$"],["Brunei","BN","BND","$"],
["Bulgaria","BG","BGN","лв"],["Burkina Faso","BF","XOF","CFA"],["Burundi","BI","BIF","FBu"],["Cambodia","KH","KHR","៛"],
["Cameroon","CM","XAF","FCFA"],["Canada","CA","CAD","$"],["Cape Verde","CV","CVE","$"],["Chad","TD","XAF","FCFA"],
["Chile","CL","CLP","$"],["China","CN","CNY","¥"],["Colombia","CO","COP","$"],["Comoros","KM","KMF","CF"],
["Congo","CG","XAF","FCFA"],["Costa Rica","CR","CRC","₡"],["Croatia","HR","EUR","€"],["Cuba","CU","CUP","$"],
["Cyprus","CY","EUR","€"],["Czechia","CZ","CZK","Kč"],["Denmark","DK","DKK","kr"],["Djibouti","DJ","DJF","Fdj"],
["Dominica","DM","XCD","$"],["Dominican Rep.","DO","DOP","$"],["DR Congo","CD","CDF","FC"],["Ecuador","EC","USD","$"],
["Egypt","EG","EGP","£"],["El Salvador","SV","USD","$"],["Eritrea","ER","ERN","Nfk"],["Estonia","EE","EUR","€"],
["Eswatini","SZ","SZL","L"],["Ethiopia","ET","ETB","Br"],["Fiji","FJ","FJD","$"],["Finland","FI","EUR","€"],
["France","FR","EUR","€"],["Gabon","GA","XAF","FCFA"],["Gambia","GM","GMD","D"],["Georgia","GE","GEL","₾"],
["Germany","DE","EUR","€"],["Ghana","GH","GHS","₵"],["Greece","GR","EUR","€"],["Grenada","GD","XCD","$"],
["Guatemala","GT","GTQ","Q"],["Guinea","GN","GNF","FG"],["Guyana","GY","GYD","$"],["Haiti","HT","HTG","G"],
["Honduras","HN","HNL","L"],["Hungary","HU","HUF","Ft"],["Iceland","IS","ISK","kr"],["India","IN","INR","₹"],
["Indonesia","ID","IDR","Rp"],["Iran","IR","IRR","﷼"],["Iraq","IQ","IQD","ع.د"],["Ireland","IE","EUR","€"],
["Israel","IL","ILS","₪"],["Italy","IT","EUR","€"],["Ivory Coast","CI","XOF","CFA"],["Jamaica","JM","JMD","$"],
["Japan","JP","JPY","¥"],["Jordan","JO","JOD","د.ا"],["Kazakhstan","KZ","KZT","₸"],["Kenya","KE","KES","KSh"],
["Kuwait","KW","KWD","د.ك"],["Kyrgyzstan","KG","KGS","сом"],["Laos","LA","LAK","₭"],["Latvia","LV","EUR","€"],
["Lebanon","LB","LBP","ل.ل"],["Lesotho","LS","LSL","L"],["Liberia","LR","LRD","$"],["Libya","LY","LYD","ل.د"],
["Lithuania","LT","EUR","€"],["Luxembourg","LU","EUR","€"],["Madagascar","MG","MGA","Ar"],["Malawi","MW","MWK","MK"],
["Malaysia","MY","MYR","RM"],["Maldives","MV","MVR","Rf"],["Mali","ML","XOF","CFA"],["Malta","MT","EUR","€"],
["Mauritania","MR","MRU","UM"],["Mauritius","MU","MUR","₨"],["Mexico","MX","MXN","$"],["Moldova","MD","MDL","L"],
["Monaco","MC","EUR","€"],["Mongolia","MN","MNT","₮"],["Montenegro","ME","EUR","€"],["Morocco","MA","MAD","د.م."],
["Mozambique","MZ","MZN","MT"],["Myanmar","MM","MMK","K"],["Namibia","NA","NAD","$"],["Nepal","NP","NPR","₨"],
["Netherlands","NL","EUR","€"],["New Zealand","NZ","NZD","$"],["Nicaragua","NI","NIO","C$"],["Niger","NE","XOF","CFA"],
["Nigeria","NG","NGN","₦"],["North Macedonia","MK","MKD","ден"],["Norway","NO","NOK","kr"],["Oman","OM","OMR","ر.ع."],
["Panama","PA","USD","$"],["Papua New Guinea","PG","PGK","K"],["Paraguay","PY","PYG","₲"],["Peru","PE","PEN","S/"],
["Philippines","PH","PHP","₱"],["Poland","PL","PLN","zł"],["Portugal","PT","EUR","€"],["Qatar","QA","QAR","ر.ق"],
["Romania","RO","RON","lei"],["Russia","RU","RUB","₽"],["Rwanda","RW","RWF","RF"],["Saudi Arabia","SA","SAR","ر.س"],
["Senegal","SN","XOF","CFA"],["Serbia","RS","RSD","дин"],["Seychelles","SC","SCR","₨"],["Sierra Leone","SL","SLE","Le"],
["Singapore","SG","SGD","$"],["Slovakia","SK","EUR","€"],["Slovenia","SI","EUR","€"],["Somalia","SO","SOS","Sh"],
["South Africa","ZA","ZAR","R"],["South Korea","KR","KRW","₩"],["South Sudan","SS","SSP","£"],["Spain","ES","EUR","€"],
["Sri Lanka","LK","LKR","₨"],["Sudan","SD","SDG","£"],["Suriname","SR","SRD","$"],["Sweden","SE","SEK","kr"],
["Switzerland","CH","CHF","CHF"],["Syria","SY","SYP","£"],["Taiwan","TW","TWD","NT$"],["Tajikistan","TJ","TJS","ЅМ"],
["Tanzania","TZ","TZS","TSh"],["Thailand","TH","THB","฿"],["Togo","TG","XOF","CFA"],["Trinidad & Tob.","TT","TTD","$"],
["Tunisia","TN","TND","د.ت"],["Turkey","TR","TRY","₺"],["Turkmenistan","TM","TMT","m"],["Uganda","UG","UGX","USh"],
["Ukraine","UA","UAH","₴"],["UAE","AE","AED","د.إ"],["United Kingdom","GB","GBP","£"],["United States","US","USD","$"],
["Uruguay","UY","UYU","$"],["Uzbekistan","UZ","UZS","so'm"],["Venezuela","VE","VES","Bs"],["Vietnam","VN","VND","₫"],
["Yemen","YE","YER","﷼"],["Zambia","ZM","ZMW","K"],["Zimbabwe","ZW","ZWL","$"]
];
const flagEmoji=cc=>{try{return String.fromCodePoint(...[...cc.toUpperCase()].map(c=>127397+c.charCodeAt(0)));}catch(e){return "🏳";}};
const curCode=()=>(DB&&DB.profile&&DB.profile.currency)||'PKR';
function detectCurrency(){
  try{
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
    const TZM={'Asia/Karachi':'PKR','Asia/Dubai':'AED','Asia/Muscat':'OMR','Asia/Qatar':'QAR','Asia/Bahrain':'BHD','Asia/Kuwait':'KWD','Asia/Riyadh':'SAR','Asia/Jeddah':'SAR','Asia/Kolkata':'INR','Asia/Calcutta':'INR','Asia/Dhaka':'BDT','Asia/Kathmandu':'NPR','Asia/Colombo':'LKR','Asia/Kabul':'AFN','Asia/Tehran':'IRR','Asia/Baghdad':'IQD','Asia/Amman':'JOD','Asia/Beirut':'LBP','Asia/Damascus':'SYP','Asia/Yerevan':'AMD','Asia/Baku':'AZN','Asia/Tbilisi':'GEL','Asia/Almaty':'KZT','Asia/Tashkent':'UZS','Asia/Bishkek':'KGS','Asia/Dushanbe':'TJS','Asia/Ashgabat':'TMT','Asia/Yangon':'MMK','Asia/Rangoon':'MMK','Asia/Bangkok':'THB','Asia/Jakarta':'IDR','Asia/Kuala_Lumpur':'MYR','Asia/Singapore':'SGD','Asia/Manila':'PHP','Asia/Hong_Kong':'HKD','Asia/Shanghai':'CNY','Asia/Chongqing':'CNY','Asia/Taipei':'TWD','Asia/Seoul':'KRW','Asia/Tokyo':'JPY','Asia/Brunei':'BND','Australia/':'AUD','Pacific/Auckland':'NZD','Pacific/Port_Moresby':'PGK','Pacific/Suva':'FJD','Europe/London':'GBP','Europe/Dublin':'GBP','Europe/Paris':'EUR','Europe/Berlin':'EUR','Europe/':'EUR','America/New_York':'USD','America/Chicago':'USD','America/Denver':'USD','America/Los_Angeles':'USD','America/Anchorage':'USD','Pacific/Honolulu':'USD','America/Toronto':'CAD','America/Vancouver':'CAD','America/Mexico_City':'MXN','America/Sao_Paulo':'BRL','America/Argentina/Buenos_Aires':'ARS','America/Bogota':'COP','America/Lima':'PEN','America/Santiago':'CLP','America/Caracas':'VES','America/Havana':'CUP','America/Santo_Domingo':'DOP','America/Guatemala':'GTQ','America/Tegucigalpa':'HNL','America/Managua':'NIO','America/Costa_Rica':'CRC','America/Panama':'USD','America/El_Salvador':'USD','America/Jamaica':'JMD','America/Port_of_Spain':'TTD','Africa/Cairo':'EGP','Africa/Lagos':'NGN','Africa/Nairobi':'KES','Africa/Johannesburg':'ZAR','Africa/Accra':'GHS','Africa/Addis_Ababa':'ETB','Africa/Khartoum':'SDG','Africa/Tunis':'TND','Africa/Algiers':'DZD','Africa/Casablanca':'MAD','Africa/Dakar':'XOF','Africa/Abidjan':'XOF'};
    for(const k in TZM){ if(tz===k||tz.indexOf(k)===0) return TZM[k]; }
    const lang=((navigator&&navigator.language)||'en-US').split('-');
    if(lang[1]){ const f=COUNTRIES.find(x=>x[1]===lang[1].toUpperCase()); if(f) return f[2]; }
  }catch(e){}
  return 'PKR';
}
function paintCur(){ try{ document.querySelectorAll('[data-cur]').forEach(el=>el.textContent=curCode()); }catch(e){} }
window.openCurrency=()=>{
  openSheet(`<h3>💱 Currency <button class="link-btn" style="float:right" onclick="closeSheet()">Done</button></h3>
  <div class="search-wrap">🔍 <input id="cur-q" placeholder="Country or currency" autocomplete="off" oninput="renderCurList(this.value)"></div>
  <div id="cur-list" class="cur-list"></div>`);
  renderCurList(''); setTimeout(()=>{const q=$('cur-q'); if(q) q.focus();},150);
};
window.renderCurList=q=>{
  q=(q||'').toLowerCase().trim();
  const list=COUNTRIES.filter(c=>!q||c[0].toLowerCase().indexOf(q)>-1||c[2].toLowerCase().indexOf(q)>-1);
  const box=$('cur-list'); if(!box) return;
  box.innerHTML=list.map(c=>`<div class="cur-row${c[2]===curCode()?' sel':''}" onclick="setCurrency('${c[2]}')">
    <span class="cur-flag">${flagEmoji(c[1])}</span><span class="cur-name">${c[0]}</span>
    <span class="cur-code">${c[3]} ${c[2]}</span>${c[2]===curCode()?'<span class="cur-tick">✓</span>':''}</div>`).join('')||'<p class="note">No match</p>';
};
window.setCurrency=code=>{
  if(code===curCode()){ closeSheet(); return; }
  closeSheet();
  confirmDlg('Change currency?','All amounts will show in '+code+'. Continue?','CHANGE',()=>{
    DB.profile.currency=code; save(); paintCur();
    renderSales(); renderStock(); if(typeof renderReport==='function') renderReport(); if(typeof renderCredit==='function') renderCredit();
    toast('💱 Currency: '+code);
  });
};


/* ---------- Data ---------- */
function defDB(){ return { profile:{name:'ReamBook',email:'',logo:''}, products:[], sales:[], expenses:[], customers:[], printQueue:[], seq:{p:1,s:1,e:1,c:1,item:1} }; }
/* v206: PER-ACCOUNT data — har Gmail ka data phone par us ke APNE slot me
   rehta hai. Naya account = bilkul fresh; purana account wapas login ho to
   us ka data wapas. Purana single store (paperstock_v1) pehle sahi login
   par usi account ko claim ho jata hai jis ka wo data hai. */
function slotKey(em){ return DB_KEY+'@'+String(em||'').toLowerCase().trim(); }
function _lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function _lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function _lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
let DB_KEY_CUR=DB_KEY+'@gate';
let DB_SHOP_ID='main';
function legacyHardClaimed(){ return !!_lsGet('ps_legacy_hard'); }
function claimLegacyFor(em){
  em=String(em||'').toLowerCase().trim(); if(!em) return;
  const legacy=_lsGet(DB_KEY); if(!legacy||legacyHardClaimed()) return;
  let owner=em; try{ const pe=(JSON.parse(legacy).profile||{}).email; if(pe) owner=String(pe).toLowerCase().trim(); }catch(e){}
  if(!_lsGet(slotKey(owner))) _lsSet(slotKey(owner), legacy);
  _lsDel(DB_KEY); _lsSet('ps_legacy_hard', owner);
}
(function initDbSlot(){
  let em=_lsGet('ps_active_email')||'';
  const tok=window.PaperAuth&&PaperAuth.getToken&&PaperAuth.getToken();
  if(!em&&tok){ try{ const u=JSON.parse(_lsGet('ps_user')||'null'); if(u&&u.email) em=String(u.email).toLowerCase().trim(); }catch(e){} if(em) _lsSet('ps_active_email',em); }
  if(tok&&em){ const reg=ensureReg(em); DB_KEY_CUR=shopDataKey(em, reg.active); DB_SHOP_ID=reg.active; }
})();
/* v207: MULTI-SHOP — aik hi Gmail me kai stores. Har shop ka data alag key
   par, bilkul fresh. Pehli (main) shop kabhi delete nahi hoti; baqi shops
   delete ho sakti hain. Switch karne par app usi shop par dobara khulti hai. */
function curEmail(){ return (_lsGet('ps_active_email')||'').toLowerCase().trim(); }
function shopsRegKey(em){ return slotKey(em)+':shops'; }
function shopDataKey(em,id){ return id==='main' ? slotKey(em) : slotKey(em)+':shop:'+id; }
function readReg(em){ try{ const r=JSON.parse(_lsGet(shopsRegKey(em))||'null'); if(r&&r.shops&&r.shops.length) return r; }catch(e){} return null; }
function writeReg(em,reg){ _lsSet(shopsRegKey(em), JSON.stringify(reg)); }
function peekShopName(em,id){ try{ const d=JSON.parse(_lsGet(shopDataKey(em,id))||_lsGet(DB_KEY)||'null'); if(d&&d.profile&&d.profile.name) return d.profile.name; }catch(e){} return 'ReamBook'; }
function ensureReg(em){ let reg=readReg(em); if(!reg){ reg={ shops:[{id:'main', name:peekShopName(em,'main')}], active:'main' }; writeReg(em,reg); } if(!reg.shops.some(s=>s.id===reg.active)) reg.active=reg.shops[0].id; return reg; }
function curShopName(){ try{ const em=curEmail(); if(!em) return ''; const reg=ensureReg(em); const s=reg.shops.find(x=>x.id===reg.active); return s?s.name:''; }catch(e){ return ''; } }
window.openShops=(lockMsg)=>{
  const em=curEmail(); if(!em){ toast('Login first'); return; }
  const reg=ensureReg(em);
  const prem=_subPremiumActive(_subUser());
  openSheet(`<h3>🏬 Shops</h3>
  <div class="sub" style="margin:2px 0 8px">The app reopens on the shop you pick. Every shop has its own fresh, separate data — nothing mixes.</div>
  ${reg.shops.map(s=>{ const act=s.id===reg.active; return `<div class="menu-row" onclick="switchShop('${s.id}')">${act?'<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 3px #dcfce7;flex-shrink:0" title="Open now"></span>':'<span class="radio"></span>'}<div style="flex:1;min-width:0"><div>${esc(s.name)}${s.id==='main'?' <span class="sub" style="color:var(--pp-teal-d)">· Main shop</span>':''}</div><div class="sub">${act?'Current shop':'Tap to switch'}</div></div><button class="mini-pdf" onclick="event.stopPropagation();renameShop('${s.id}')">✏️ Rename</button>${(!act&&s.id!=='main')?`<button class="mini-pdf" style="color:#d7263d;background:#fdecec;padding:6px 10px;font-size:14px" onclick="event.stopPropagation();deleteShop('${s.id}')" title="Delete shop">🗑</button>`:''}</div>`; }).join('')}
  ${lockMsg?`<div style="background:#fdecec;color:#b3261e;border:1.5px solid #f0b4b4;border-radius:12px;padding:12px 14px;font-weight:700;text-align:center;margin-top:12px">Please Buy The Subscription To Add Multiple Stores Or Manage Your Products. Thank You (⌒‿⌒)</div><button class="btn-go" style="width:100%;margin-top:10px" onclick="openCloudSheet()">⭐ Buy subscription</button>`:''}
  <button class="btn-ghost" style="width:100%;margin-top:10px" onclick="${prem?'addShop()':'shopLockMsg()'}">${prem?'':'🔒 '}＋ Add a shop</button>
  <div class="mrow"><button class="btn-ghost" onclick="$('btn-profile').click()">Back</button></div>`);
};
window.shopLockMsg=()=>{ openShops(true); };
window.switchShop=id=>{ const em=curEmail(); const reg=ensureReg(em); if(id===reg.active){ $('btn-profile').click(); return; } reg.active=id; writeReg(em,reg); markDirty(); toast('Switching shop…'); const p=(syncCtl?syncCtl.push():Promise.resolve()); Promise.race([p,new Promise(r=>setTimeout(r,1500))]).then(()=>location.reload()); };
window.addShop=()=>{
  openSheet(`<h3>＋ Add a shop</h3>
  <div class="sub" style="margin:2px 0 8px">The new shop starts completely fresh — its own stock, sales and credit.</div>
  <div class="fld"><span class="fld-lbl">Shop name</span><div class="fld-in"><input id="ns-name" placeholder="e.g. City Branch"></div></div>
  <div class="mrow"><button class="btn-ghost" onclick="openShops()">Back</button><button class="btn-go" onclick="saveNewShop()">Create shop</button></div>`);
  setTimeout(()=>{ const i=$('ns-name'); if(i) i.focus(); },80);
};
window.saveNewShop=()=>{
  if(!_subPremiumActive(_subUser())){ openShops(true); return; }
  const em=curEmail(); const name=($('ns-name').value||'').trim(); if(!name){ toast('Enter a shop name'); return; }
  const reg=ensureReg(em); const id='s'+Date.now().toString(36);
  const d=defDB(); d.profile.name=name;
  _lsSet(shopDataKey(em,id), JSON.stringify(d));
  reg.shops.push({id, name}); reg.active=id; writeReg(em,reg); markDirty();
  toast('✅ Shop created — opening it…');
  const p=(syncCtl?syncCtl.push():Promise.resolve()); Promise.race([p,new Promise(r=>setTimeout(r,1500))]).then(()=>location.reload());
};
window.renameShop=id=>{
  const em=curEmail(); const reg=ensureReg(em); const s=reg.shops.find(x=>x.id===id); if(!s) return;
  openSheet(`<h3>✏️ Shop name</h3><div class="sub" style="margin:2px 0 8px">Shown on the app header, reports and exports.</div>
  <div class="fld"><span class="fld-lbl">Shop name</span><div class="fld-in"><input id="rs-name" value="${esc(s.name)}" maxlength="40"></div></div>
  <div class="mrow"><button class="btn-ghost" onclick="openShops()">Back</button><button class="btn-go" onclick="saveShopName('${id}')">Save</button></div>`);
};
window.saveShopName=id=>{
  const em=curEmail(); const reg=ensureReg(em); const s=reg.shops.find(x=>x.id===id); if(!s) return;
  const name=($('rs-name').value||'').trim(); if(!name){ toast('Enter a shop name'); return; }
  s.name=name; writeReg(em,reg);
  try{ if(id===reg.active){ DB.profile.name=name; save(); renderStoreName(); } else { const dk=shopDataKey(em,id); const d=JSON.parse(_lsGet(dk)||'null'); if(d){ d.profile.name=name; _lsSet(dk, JSON.stringify(d)); } } }catch(e){}
  markDirty(); if(syncCtl){ try{ syncCtl.push(); }catch(e){} }
  toast('✅ Shop renamed'); openShops();
};
window.deleteShop=id=>{
  const em=curEmail(); const reg=ensureReg(em); const s=reg.shops.find(x=>x.id===id);
  if(!s||id==='main'||id===reg.active) return;
  confirmDlg('Delete shop?','Delete "'+s.name+'" and ALL its data (stock, sales, credit)? This cannot be undone.','DELETE',()=>{
    _lsDel(shopDataKey(em,id));
    reg.shops=reg.shops.filter(x=>x.id!==id); writeReg(em,reg); markDirty(); if(syncCtl){ try{ syncCtl.push(); }catch(e){} }
    toast('Shop deleted'); openShops();
  });
};
function load(){ let raw=null; try{ raw=localStorage.getItem(DB_KEY_CUR); if(!raw&&!legacyHardClaimed()) raw=localStorage.getItem(DB_KEY); DB=JSON.parse(raw)||defDB(); }catch(e){ DB=defDB(); } if(!DB.seq)DB.seq={p:1,s:1,e:1,c:1,item:1}; if(!DB.printQueue)DB.printQueue=[]; if(!DB.profile)DB.profile=defDB().profile; if(!DB.profile.currency)DB.profile.currency=detectCurrency();
  /* v210: purana default naam 'Paper Store' tha — app ka naam ReamBook hai.
     Jis ne naam khud nahi badla, us ka default auto ReamBook ho jata hai. */
  try{ if(DB.profile&&DB.profile.name==='Paper Store'){ DB.profile.name='ReamBook'; setTimeout(()=>{ try{ localStorage.setItem(DB_KEY_CUR,JSON.stringify(DB)); }catch(e){} },60);
    const em=curEmail(); if(em){ const reg=readReg(em); if(reg){ const m=reg.shops.find(s=>s.id==='main'); if(m&&m.name==='Paper Store'){ m.name='ReamBook'; writeReg(em,reg); } } } } }catch(e){}
  /* Naam aik jagah: agar Shops list wala naam profile wale naam se alag ho
     to profile wala naam hi asal hai — list ko mila do */
  try{ const em=curEmail(); if(em&&DB.profile){ const reg=readReg(em); if(reg){ const s=reg.shops.find(x=>x.id===reg.active); if(s&&s.name!==DB.profile.name){ s.name=DB.profile.name; writeReg(em,reg); } } } }catch(e){}
}
function save(){ localStorage.setItem(DB_KEY_CUR,JSON.stringify(DB)); }

/* ---------- Cloud sync (Gmail login) ---------- */
let syncCtl=null, applyingRemote=false, syncedAt=0;
try{ syncedAt=+(localStorage.getItem('ps_synced_at')||0); }catch(e){}
const _saveLocal=save;
save=function(){ _saveLocal(); markDirty(); if(syncCtl&&!applyingRemote){ syncCtl.schedulePush(); setSyncPill('backing'); } };
/* dirty = local tabdeeli jo abhi cloud par NAHI gayi. Jab tak ye hai,
   cloud ki copy local ko kabhi nahi mitayegi. */
function markDirty(){ try{ localStorage.setItem('ps_dirty','1'); }catch(e){} }
function clearDirty(){ try{ localStorage.removeItem('ps_dirty'); }catch(e){} }
function isDirty(){ try{ return !!localStorage.getItem('ps_dirty'); }catch(e){ return false; } }
function setSyncPill(mode){
  // v180: status badge on the header cloud (backup) button — spinning circle
  // while backing up, green tick when synced; no badge when logged out.
  // v187: free plan = red lock badge (cloud backup is a Premium feature).
  const b=$('bk-badge'); if(!b) return;
  const btn=$('btn-backup');
  if(mode==='off'||!window.PaperAuth||!PaperAuth.getToken()){ b.classList.add('hidden'); return; }
  b.classList.remove('hidden');
  if(mode==='locked'){ b.classList.remove('backing'); b.classList.add('locked'); b.textContent='🔒'; if(btn) btn.title='Cloud Backup — Premium'; return; }
  b.classList.remove('locked');
  if(mode==='backing'){ b.classList.add('backing'); b.innerHTML='<span class="spin">↻</span>'; if(btn) btn.title='Backing up…'; }
  else { b.classList.remove('backing'); b.textContent='✓'; if(btn) btn.title='Cloud Backup'; }
}
function syncBundleOut(){
  try{
    const em=curEmail(); if(!em) return DB;
    const reg=readReg(em); if(!reg||reg.shops.length<=1) return DB;
    const shops={}; reg.shops.forEach(s=>{ if(s.id===DB_SHOP_ID) shops[s.id]=DB; else { try{ const d=JSON.parse(_lsGet(shopDataKey(em,s.id))||'null'); if(d) shops[s.id]=d; }catch(e){} } });
    return { __shops:1, reg:{shops:reg.shops, active:reg.active}, shops };
  }catch(e){ return DB; }
}
function applyRemote(data,updatedAt){
  if(!data||!updatedAt||updatedAt<=syncedAt) return;
  /* Local tabdeeli abhi cloud par nahi gayi to cloud ki copy ruk jaye */
  if(isDirty()) return;
  const em=curEmail();
  /* v207: multi-shop bundle — har shop ka data us ki apni key par jata hai */
  if(data.__shops&&data.shops&&em){
    applyingRemote=true;
    try{
      const localReg=ensureReg(em);
      const localActive=localReg.active;
      /* Shops ki list, naam aur khuli hui shop LOCAL faislay hain — cloud
         se sirf wo shops ati hain jo yahan hain hi nahi. Active shop aur
         mojooda naam cloud KABHI nahi badalta; badalna hai to user khud */
      ((data.reg&&data.reg.shops)||[]).forEach(rs=>{ if(rs&&rs.id&&!localReg.shops.some(s=>s.id===rs.id)) localReg.shops.push({id:rs.id, name:(rs.name||'Shop')}); });
      writeReg(em, localReg);
      Object.keys(data.shops).forEach(id=>{ _lsSet(shopDataKey(em,id), JSON.stringify(data.shops[id])); });
      syncedAt=updatedAt; try{ localStorage.setItem('ps_synced_at',syncedAt); }catch(e){}
      DB=data.shops[localActive]||DB; DB_SHOP_ID=localActive;
      if(!DB.seq)DB.seq={p:1,s:1,e:1,c:1,item:1}; if(!DB.printQueue)DB.printQueue=[]; if(!DB.profile)DB.profile=defDB().profile; if(!DB.profile.currency)DB.profile.currency=detectCurrency();
      _saveLocal();
      renderStoreName(); applyTheme(curTheme());
      const av=document.querySelector('.view.active'); if(av) showView(av.id);
    }finally{ applyingRemote=false; }
    toast('☁️ Cloud synced');
    return;
  }
  /* purana single-shop remote: agar koi aur shop khuli hai to data main shop me rakho */
  if(em){ const reg=readReg(em); if(reg&&reg.active!=='main'){ _lsSet(slotKey(em), JSON.stringify(data)); syncedAt=updatedAt; try{ localStorage.setItem('ps_synced_at',syncedAt); }catch(e){} return; } }
  applyingRemote=true;
  try{
    DB=data; if(!DB.seq)DB.seq={p:1,s:1,e:1,c:1,item:1}; if(!DB.printQueue)DB.printQueue=[]; if(!DB.profile)DB.profile=defDB().profile; if(!DB.profile.currency)DB.profile.currency=detectCurrency();
    _saveLocal();
    syncedAt=updatedAt; try{ localStorage.setItem('ps_synced_at',syncedAt); }catch(e){}
    renderStoreName(); applyTheme(curTheme());
    const av=document.querySelector('.view.active'); if(av) showView(av.id);
  }finally{ applyingRemote=false; }
  toast('☁️ Cloud synced');
}
function authSection(){
  if(!window.PaperAuth||!PaperAuth.isConfigured()) return '';
  if(!PaperAuth.getToken())
    return `<button class="btn-go" style="width:100%;margin-bottom:4px" onclick="openCodeLogin()">🔐 Login with Gmail</button>
    <div class="sub" style="text-align:center;margin-bottom:10px">We email you a login code — sync your data on 5 devices</div>`;
  let u=null; try{ u=JSON.parse(localStorage.getItem('ps_user')||'null'); }catch(e){}
  const nm=u?(u.name||u.email):'...', em=u?(u.email||''):'' ;
  const av=u&&u.picture?`<img src="${u.picture}">`:esc((nm||'G').charAt(0).toUpperCase());
  const prem=_subPremiumActive(u);
  let pkg=''; try{ pkg=PLAN_NAME[localStorage.getItem('ps_pkg')||'']||''; }catch(e){}
  return `<div class="mrow" style="align-items:center;margin-bottom:10px">
    <div class="pavatar" style="width:44px;height:44px;font-size:18px;flex-shrink:0">${av}</div>
    <div style="flex:1;min-width:0"><b style="font-size:15px">${esc(nm)}</b> ${prem?`<span class="pkg-pill" id="pkg-pill">${esc(pkg||'Premium')}</span>`:`<span class="pkg-pill free">Free</span>`}<div class="sub">${esc(em)}</div>${u&&u.uid?`<div class="sub" style="margin-top:8px;display:flex;align-items:center;gap:7px">Your ID: <b style="color:#14213d;font-size:13px">RB-${esc(u.uid)}</b><span onclick="copyTxt('RB-${esc(u.uid)}')" title="Copy ID" style="background:var(--pp-soft,#eef3ff);border-radius:8px;padding:3px 9px;font-size:13px;cursor:pointer;line-height:1.25">📋</span></div>`:''}</div></div>`;
}
window.doLogout=()=>{ if(!window.PaperAuth) return;
  /* Pehle logout server ke jawab ka intezaar karta tha — is liye pehla tap
     bekaar lagta tha. Ab: server ko peechay se batao, local sab foran saaf
     karke reload — aik hi tap, foran reaction. */
  try{ PaperAuth.logout(); }catch(e){}
  try{ localStorage.removeItem('ps_token'); localStorage.removeItem('ps_user'); localStorage.removeItem('ps_synced_at'); localStorage.removeItem('ps_active_email'); localStorage.removeItem('ps_paycfg'); localStorage.removeItem('ps_dirty'); }catch(e){}
  location.reload();
};
window.confirmLogout=()=>{
  const u=_subUser(); const email=(u&&u.email)||'';
  const store=(DB.profile&&DB.profile.name)||'this store';
  openSheet(`
  <div style="text-align:center;padding:6px 4px 2px">
    <div style="width:74px;height:74px;margin:2px auto 10px;border-radius:50%;background:linear-gradient(135deg,#ffe3e3,#ffc9c9);display:flex;align-items:center;justify-content:center;font-size:36px;box-shadow:0 8px 20px rgba(214,48,49,.25)">👋</div>
    <h3 style="margin:0 0 6px">Sign out of ReamBook?</h3>
    <div style="font-size:15px;line-height:1.55">Are you sure you want to sign out<br><b>${esc(email)}</b><br>from <b>${esc(store)}</b>?</div>
    <div class="sub" style="margin:10px auto 2px;max-width:300px">Don't worry — all your shop data stays saved. Sign in again with the same Gmail and everything comes right back. ✨</div>
  </div>
  <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Stay signed in</button><button class="btn-go" style="background:linear-gradient(135deg,#e03131,#c92a2a)" onclick="doLogout()">Yes, sign out</button></div>`);
};
function initAuth(){
  if(!window.PaperAuth) return;
  const fresh=PaperAuth.handleAuthRedirect();
  if(!PaperAuth.isConfigured()||!PaperAuth.getToken()) return;
  // v187: cloud backup is a Premium feature — always refresh the plan state,
  // then start sync only for Premium users; free users get the red lock.
  PaperAuth.api('/api/me').then(me=>{ try{ localStorage.setItem('ps_user',JSON.stringify(me)); }catch(e){}
    if(fresh&&me&&me.email){ try{ claimLegacyFor(me.email); _lsSet('ps_active_email', String(me.email).toLowerCase().trim()); }catch(e){}
      if(DB_KEY_CUR!==slotKey(me.email)){ location.reload(); return; } }
    else if(me&&me.email&&!_lsGet('ps_active_email')){ _lsSet('ps_active_email', String(me.email).toLowerCase().trim()); }
    refreshCloudGate(); }).catch(()=>{ refreshCloudGate(); });
  refreshCloudGate();
}
function refreshCloudGate(){
  const u=_subUser();
  if(_subPremiumActive(u)) enableCloudSync();
  else if(!syncCtl) setSyncPill('locked');
}
function enableCloudSync(){
  if(!window.PaperAuth||!PaperAuth.getToken()) return;
  if(!syncCtl){
    syncCtl=PaperAuth.startAutoSync(syncBundleOut, applyRemote, ts=>{ syncedAt=ts||Date.now(); try{ localStorage.setItem('ps_synced_at',syncedAt); }catch(e){} clearDirty(); setSyncPill('synced'); });
    if(isDirty()){ try{ syncCtl.push(); }catch(e){} }
  }
  setSyncPill('synced');
}

/* ---------- First-launch login gate ---------- */
function initGate(){
  const g=$('login-gate'); if(!g) return;
  const need=!!(window.PaperAuth&&PaperAuth.isConfigured()&&!PaperAuth.getToken());
  g.style.display=need?'flex':'none';
}
/* ---------- Email-code login (gate + profile) ---------- */
let clEmail='';
function clMsg(id,t,ok){ const m=$(id); if(m){ m.textContent=t||''; m.style.color=ok?'#1e9e57':''; } }
function clSend(ids){
  if(!window.PaperAuth) return;
  const em=($(ids.email).value||'').trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){ clMsg(ids.msg,'Please enter a valid email address.'); return; }
  if(typeof navigator!=='undefined'&&navigator.onLine===false){ clMsg(ids.msg,'No internet connection. Connect once to log in \u2014 after that, the app works offline.'); return; }
  const btn=$(ids.sendBtn);
  if(btn){ btn.disabled=true; btn.textContent='Sending code\u2026 (first time can take a minute)'; }
  clMsg(ids.msg,'');
  PaperAuth.requestCode(em).then(()=>{
    clEmail=em;
    $(ids.stepEmail).style.display='none';
    $(ids.stepCode).style.display='block';
    const n=$(ids.note); if(n) n.textContent='We emailed a 6-digit code to '+em+'. Enter it here:';
    const ci=$(ids.code); if(ci){ ci.value=''; setTimeout(()=>{ try{ci.focus();}catch(e){} },60); }
  }).catch(e=>{
    clMsg(ids.msg,(e&&e.message)||'Could not send the code. Please try again.');
  }).then(()=>{ if(btn){ btn.disabled=false; btn.textContent='Email me a login code'; } });
}
function clVerify(ids){
  const cd=($(ids.code).value||'').trim();
  if(!/^\d{6}$/.test(cd)){ clMsg(ids.msg,'Enter the 6-digit code from your email.'); return; }
  const btn=$(ids.verifyBtn);
  if(btn){ btn.disabled=true; btn.textContent='Checking\u2026'; }
  PaperAuth.verifyCode(clEmail, cd).then(()=>{ try{ claimLegacyFor(clEmail); _lsSet('ps_active_email', String(clEmail).toLowerCase().trim()); }catch(e){} location.reload(); })
    .catch(e=>{
      clMsg(ids.msg,(e&&e.message)||'Login failed. Please try again.');
      if(btn){ btn.disabled=false; btn.textContent='Login'; }
    });
}
function clBack(ids){
  $(ids.stepCode).style.display='none';
  $(ids.stepEmail).style.display='block';
  clMsg(ids.msg,'');
}
const GATE_IDS={email:'gate-email',code:'gate-code',stepEmail:'gate-step-email',stepCode:'gate-step-code',sendBtn:'gate-send-btn',verifyBtn:'gate-verify-btn',msg:'gate-msg',note:'gate-code-note'};
window.gateSendCode=function(){ clSend(GATE_IDS); };
window.gateVerifyCode=function(){ clVerify(GATE_IDS); };
window.gateBack=function(){ clBack(GATE_IDS); };
const CL_IDS={email:'cl-email',code:'cl-code',stepEmail:'cl-step-email',stepCode:'cl-step-code',sendBtn:'cl-send-btn',verifyBtn:'cl-verify-btn',msg:'cl-msg',note:'cl-code-note'};
window.clSendCode=function(){ clSend(CL_IDS); };
window.clVerifyCode=function(){ clVerify(CL_IDS); };
window.clBack=function(){ clBack(CL_IDS); };
window.openCodeLogin=function(){
  openSheet(`
  <div class="sheet-title">Login with Gmail</div>
  <div class="sub" style="margin:2px 0 10px">We email you a 6-digit code \u2014 no password needed. One login syncs your data on all your devices.</div>
  <div id="cl-step-email">
    <input class="inp" id="cl-email" type="email" inputmode="email" autocomplete="email" placeholder="Your Gmail address" style="width:100%;box-sizing:border-box;margin-bottom:10px">
    <button class="btn-go" id="cl-send-btn" style="width:100%" onclick="clSendCode()">Email me a login code</button>
  </div>
  <div id="cl-step-code" style="display:none">
    <div class="sub" id="cl-code-note" style="margin-bottom:8px"></div>
    <input class="inp" id="cl-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit code" style="width:100%;box-sizing:border-box;margin-bottom:10px;text-align:center;font-size:20px;font-weight:700;letter-spacing:6px">
    <button class="btn-go" id="cl-verify-btn" style="width:100%" onclick="clVerifyCode()">Login</button>
    <div style="margin-top:8px"><button class="btn-ghost" onclick="clBack()">\u2190 Different email</button>
    <button class="btn-ghost" onclick="clSendCode()">Resend code</button></div>
  </div>
  <div id="cl-msg" style="margin-top:10px;font-size:13px;color:#b3261e;min-height:18px"></div>
  <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Close</button></div>`);
};

/* ---------- Subscription (manual payment) ---------- */
const SUB_PLANS_FALLBACK=[
  {key:'monthly',amountRs:330,days:30,label:'Basic'},
  {key:'halfyearly',amountRs:1700,days:180,label:'Pro'},
  {key:'yearly',amountRs:2970,days:365,label:'Premium'},
];
let _subPlan='monthly', _subCfg=null, _subMine=[], _subSf=null;
/* Instant-paint cache: plans + payment numbers change rarely, so keep the last
   server response on the phone and render immediately on open; initPlanBox
   refreshes it in the background every time. Without this, a cold server
   left users staring at "Loading payment details…" for 30-60s. */
try{ const _pc=JSON.parse(localStorage.getItem('ps_paycfg')||'null'); if(_pc&&_pc.ts&&(Date.now()-_pc.ts)<7*86400000){ _subCfg=_pc.cfg||null; _subSf=_pc.sf||null; } }catch(e){}
function _savePayCfg(){ try{ localStorage.setItem('ps_paycfg',JSON.stringify({cfg:_subCfg,sf:_subSf,ts:Date.now()})); }catch(e){} }
function _subUser(){ try{ return JSON.parse(localStorage.getItem('ps_user')||'null'); }catch(e){ return null; } }
function _subPremiumActive(u){ return !!(u&&u.plan==='premium'&&u.planExpiresAt&&new Date(u.planExpiresAt).getTime()>Date.now()); }
function _fmtDate(iso){ try{ return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return ''; } }
function initPlanBox(){
  const box=$('plan-box'); if(!box) return;
  renderPlanBox();
  if(!window.PaperAuth||!PaperAuth.isConfigured()||!PaperAuth.getToken()) return;
  PaperAuth.api('/api/me').then(me=>{ try{ localStorage.setItem('ps_user',JSON.stringify(me)); }catch(e){} renderPlanBox(); }).catch(()=>{});
  PaperAuth.api('/api/pay/manual/config').then(c=>{ _subCfg=c; _savePayCfg(); renderPlanBox(); }).catch(()=>{});
  PaperAuth.api('/api/pay/manual/mine').then(r=>{ _subMine=(r&&r.payments)||[]; _cachePkg(); renderPlanBox(); }).catch(()=>{});
  PaperAuth.api('/api/safepay/config').then(c=>{ _subSf=c; _savePayCfg(); renderPlanBox(); }).catch(()=>{});
  sfPollPending(0);
}
const PLAN_NAME={monthly:'Basic',halfyearly:'Pro',yearly:'Premium'};
const PLAN_DUR={monthly:'30 days',halfyearly:'6 months',yearly:'1 year'};
const GET_HTML=`<div class="get-card">
  <div class="get-row"><div class="get-ic">☁️</div><div><b>Cloud backup</b><div class="sub">Saved automatically, so it's never lost.</div></div></div>
  <div class="get-row"><div class="get-ic">🔄</div><div><b>Multi-device sync</b><div class="sub">Same login — your data on up to 5 devices.</div></div></div>
  <div class="get-row"><div class="get-ic">⬇️</div><div><b>Backup &amp; restore</b><div class="sub">Download a copy anytime, restore it on a new phone.</div></div></div>
  <div class="get-row"><div class="get-ic">📄</div><div><b>Monthly reports</b><div class="sub">Download your monthly sales &amp; stock record as PDF or CSV.</div></div></div>
  <div class="get-row"><div class="get-ic">📴</div><div><b>Works offline</b><div class="sub">Syncs by itself whenever internet is available.</div></div></div>
  <div class="get-row"><div class="get-ic">✨</div><div><b>No ads</b><div class="sub">A clean app with nothing in your way.</div></div></div>
</div>`;
function _cachePkg(){ try{ const lastOk=_subMine.filter(x=>x.status==='success').sort((a,b)=>new Date(b.paidAt||b.createdAt||0)-new Date(a.paidAt||a.createdAt||0))[0]; if(lastOk) localStorage.setItem('ps_pkg',lastOk.plan); }catch(e){} }
function _activePkgName(){ const lastOk=_subMine.filter(x=>x.status==='success').sort((a,b)=>new Date(b.paidAt||b.createdAt||0)-new Date(a.paidAt||a.createdAt||0))[0]; if(lastOk) return PLAN_NAME[lastOk.plan]||''; try{ return PLAN_NAME[localStorage.getItem('ps_pkg')||'']||''; }catch(e){ return ''; } }
/* v191: clean plan cards (no discount %, no strikethrough) */
function fmtRs(n){ const v=Number(n); return isFinite(v)?v.toLocaleString('en-US'):String(n); }
function planCardsHtml(plans){
  const baseM=((plans.find(p=>p.key==='monthly')||{}).amountRs)||300;
  const card=(p,cls)=>{
    const full=baseM*Math.max(1,Math.round(p.days/30));
    const pct=full>p.amountRs?Math.round((1-p.amountRs/full)*100):0;
    return `<div class="plan-card ${cls} ${p.key===_subPlan?'sel':''}" onclick="pickSubPlan('${p.key}')"><span class="pc-check">✓</span>${p.key==='yearly'?`<span class="pc-badge">${pct?`Save ${pct}%`:'Best value'}</span>`:''}<div class="pc-name">${PLAN_NAME[p.key]||esc(p.label||p.key)}${pct&&p.key!=='yearly'?`<span class="pc-save">−${pct}%</span>`:''}</div><div class="pc-price">Rs ${fmtRs(p.amountRs)}${pct?`<span class="pc-was">Rs ${fmtRs(full)}</span>`:''}</div><div class="pc-per">${PLAN_DUR[p.key]||(p.days+' days')}${p.key==='monthly'?'':` · Rs ${Math.ceil(p.amountRs/Math.max(1,Math.round(p.days/30)))}/mo`}</div></div>`;
  };
  const by=k=>plans.find(p=>p.key===k);
  const order=[['monthly','pc-a'],['halfyearly','pc-b'],['yearly','plan-hero']];
  const cards=order.map(([k,cls])=>by(k)?card(by(k),cls):'').join('');
  return `<div class="plan-grid">${cards||plans.map(p=>card(p,'')).join('')}</div>`;
}
function renderPlanBox(){
  const box=$('plan-box'); if(!box) return;
  if(!window.PaperAuth||!PaperAuth.isConfigured()||!PaperAuth.getToken()){ box.innerHTML=''; return; }
  const u=_subUser(), active=_subPremiumActive(u);
  const cfg=_subCfg, plans=(cfg&&cfg.plans&&cfg.plans.length)?cfg.plans:(_subSf&&_subSf.plans&&_subSf.plans.length)?_subSf.plans:SUB_PLANS_FALLBACK;
  if(!plans.some(p=>p.key===_subPlan)) _subPlan=plans[0].key;
  let h='';
  if(active){
    const pkgName=_activePkgName();
    h+=`<div class="mrow" style="align-items:center;margin-bottom:8px"><span style="font-size:20px">⭐</span><div style="flex:1"><b>Cloud Backup active</b>${pkgName?` <span class="pkg-pill">${esc(pkgName)}</span>`:''}<div class="sub">Until ${_fmtDate(u.planExpiresAt)}</div></div></div>
    <div class="mrow" style="margin-bottom:10px">
      <button class="btn-ghost" onclick="cloudSyncNow()">☁️<br><b>Sync now</b><br><small>Back up to cloud</small></button>
      <button class="btn-ghost" onclick="cloudBackup()">⬇️<br><b>Backup file</b><br><small>Download a copy</small></button>
    </div>`;
    /* Premium users see ONLY the status + backup actions above — no packages,
       payment numbers or submit form (owner's rule, 2026-10-23). The packages
       return by themselves when the plan expires (the locked view below). */
    box.innerHTML=h; return;
  } else {
    h+=`<div class="mrow" style="align-items:center;margin-bottom:8px"><span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#dc2626;font-size:16px;flex-shrink:0">🔒</span><div style="flex:1"><b>Cloud Backup is locked</b><div class="sub">Subscribe to turn on automatic cloud backup.</div></div></div>
    <div class="lbl" style="margin:12px 0 6px">CHOOSE A PACKAGE</div>`;
  }
  if(!active&&u&&u.plan==='premium'){
    h+=`<div class="sub" style="margin-bottom:8px">Your Premium ended on ${_fmtDate(u.planExpiresAt)}. Renew below.</div>`;
  }
  const pend=_subMine.filter(x=>x.status==='manual_pending');
  if(pend.length){
    h+=pend.map(x=>`<div class="sub" style="margin-bottom:6px">⏳ <b>${esc(PLAN_NAME[x.plan]||x.plan)}</b> — Rs ${esc(x.amountRs)} — payment sent, waiting for verification.</div>`).join('');
  }
  const done=_subMine.filter(x=>x.status==='success').slice(0,2);
  if(done.length&&!active){
    h+=done.map(x=>`<div class="sub" style="margin-bottom:6px">✅ <b>${esc(PLAN_NAME[x.plan]||x.plan)}</b> payment verified.</div>`).join('');
  }
  const rej=_subMine.filter(x=>x.status==='rejected').slice(0,1);
  if(rej.length){
    h+=`<div class="sub" style="margin-bottom:6px;color:#b3261e">❌ Your last payment could not be verified. Please check the transaction ID and try again.</div>`;
  }
  if(_subSf&&_subSf.configured){
    const sel=plans.find(p=>p.key===_subPlan)||plans[0];
    h+=`${planCardsHtml(plans)}
    <div style="font-size:17px;font-weight:800;margin:16px 0 8px">What you get</div>${GET_HTML}
    <div class="sub" style="margin:12px 0 8px">Pay online with card, JazzCash or Easypaisa. Premium activates automatically — no waiting, no approval.</div>
    <button class="btn-subscribe" onclick="payWithSafepay()">Pay Rs ${esc(sel.amountRs)} — ${esc(PLAN_NAME[sel.key]||'')}</button>`;
  } else if(!cfg){
    h+=`<div class="sub">Loading payment details…</div>`;
  } else if(!cfg.configured){
    h+=`<div class="sub">Subscription payments are being set up. Please check back soon.</div>`;
  } else {
    const planRows=planCardsHtml(plans);
    const mlist=(cfg.methods&&cfg.methods.length)?cfg.methods:([['jazzcash','JazzCash',cfg.jazzcash],['easypaisa','Easypaisa',cfg.easypaisa]].filter(x=>x[2]).map(x=>({key:x[0],label:x[1],number:x[2].number,title:x[2].title})));
    const numRow=m=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #f7f9fb"><div style="flex:1;min-width:0"><div class="sub" style="margin:0">${esc(m.label)}</div><b style="font-size:16px">${esc(m.number)}</b> <span class="sub">${esc(m.title||'')}</span></div><button class="copy-chip" onclick="copyTxt('${esc(m.number)}')">Copy</button></div>`;
    const QR_FOR={jazzcash:'img/pay-qr-jazzcash.jpg',bank:'img/pay-qr-bank.jpg'};
    const qrHtml=mlist.filter(m=>QR_FOR[m.key]).map(m=>`<div style="text-align:center;margin:8px 0"><div class="sub" style="margin-bottom:4px">${esc(m.label)} — scan to pay</div><img src="${QR_FOR[m.key]}" alt="${esc(m.label)} QR code" loading="lazy" onerror="this.parentNode.style.display='none'" onclick="window.open(this.src)" style="width:210px;max-width:82%;border-radius:10px;border:1px solid #e3e8f2;cursor:pointer"></div>`).join('');
    const selP=plans.find(p=>p.key===_subPlan)||plans[0];
    _slipData='';
    const _cu=(()=>{ try{ return JSON.parse(localStorage.getItem('ps_user')||'null'); }catch(e){ return null; } })();
    const uidLine=(_cu&&_cu.uid)?`<div class="sub" style="margin:0 0 8px">Your ID: <b style="color:#14213d">RB-${esc(_cu.uid)}</b> — the shop owner sees this ID with your payment.</div>`:'';
    h+=`${planRows}
    <div style="font-size:17px;font-weight:800;margin:16px 0 8px">What you get</div>${GET_HTML}
    <div class="pay-card">
    ${uidLine}<div class="sub" style="margin:0 0 4px">Send <b style="color:#14213d">Rs ${fmtRs(selP.amountRs)}</b> to any one of these:</div>
    ${mlist.map(numRow).join('')}${qrHtml}
    <div class="sub" style="margin:10px 0 6px">After sending, fill these two things:</div>
    <select id="sub-method" style="width:100%;margin-bottom:6px">${mlist.map(m=>`<option value="${esc(m.key)}">${esc(m.label)}</option>`).join('')}</select>
    <div class="sub-lbl">Transaction ID <b style="color:#d33">*</b></div>
    <input id="sub-txn" placeholder="Transaction ID from your payment app" autocapitalize="characters" style="width:100%;margin-bottom:8px">
    <div class="sub-lbl">Payment slip photo <b style="color:#d33">*</b></div>
    <input id="sub-slip" type="file" accept="image/*" style="display:none" onchange="slipPicked(this)">
    <button type="button" id="sub-slip-btn" class="sbtn" style="width:100%;margin:0 0 6px" onclick="document.getElementById('sub-slip').click()">📷 Attach slip photo</button>
    <img id="sub-slip-prev" style="display:none;width:100%;border-radius:10px;margin:0 0 10px" alt="">
    <input id="sub-sname" placeholder="Your name (optional)" style="width:100%;margin-bottom:6px">
    <input id="sub-snum" placeholder="Your mobile number (optional)" inputmode="tel" style="width:100%;margin-bottom:10px">
    <button class="btn-subscribe" onclick="submitSubPayment()">Submit payment</button>
    <div style="margin-top:12px;background:#fdecec;border:1px solid #f5c6c6;border-radius:12px;padding:10px 12px;color:#b3261e;font-size:13px;line-height:1.5">⚠️ <b>Warning:</b> Don't try a fake payment, and don't send a low balance — always send the <b>full plan amount</b>. Every payment is checked before activation, and a fake or short payment will be rejected.</div></div>`;
  }
  box.innerHTML=h;
}
window.pickSubPlan=k=>{ _subPlan=k; renderPlanBox(); };
window.copyTxt=t=>{ const done=()=>toast('✅ Copied'); if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done).catch(done); } else done(); };
/* slip photo: picked file is shrunk on the phone (max 1100px, JPEG) before upload */
let _slipData='';
window.slipPicked=inp=>{
  const f=inp.files&&inp.files[0]; if(!f) return;
  const url=URL.createObjectURL(f); const img=new Image();
  img.onload=()=>{
    try{
      let w=img.naturalWidth||img.width||0, h=img.naturalHeight||img.height||0;
      const sc=Math.min(1, 1100/Math.max(w||1,h||1)); w=Math.max(1,Math.round(w*sc)); h=Math.max(1,Math.round(h*sc));
      const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
      cv.getContext('2d').drawImage(img,0,0,w,h);
      _slipData=cv.toDataURL('image/jpeg',0.82);
    }catch(e){ _slipData=''; }
    URL.revokeObjectURL(url);
    const pv=$('sub-slip-prev'); if(pv&&_slipData){ pv.src=_slipData; pv.style.display='block'; }
    const bt=$('sub-slip-btn'); if(bt) bt.textContent=_slipData?'📷 Slip attached ✓ — tap to change':'📷 Attach slip photo';
    if(!_slipData) toast('❌ That photo could not be read — try another');
  };
  img.onerror=()=>{ URL.revokeObjectURL(url); toast('❌ That photo could not be read — try another'); };
  img.src=url;
};
window.submitSubPayment=()=>{
  const txn=($('sub-txn')&&$('sub-txn').value||'').trim();
  if(txn.length<5){ toast('❌ Please enter the Transaction ID'); return; }
  if(!_slipData){ toast('❌ Please attach the payment slip photo'); return; }
  const body={ plan:_subPlan, method:($('sub-method')||{}).value, txnId:txn,
    senderName:($('sub-sname')||{}).value||'', senderNumber:($('sub-snum')||{}).value||'', slip:_slipData };
  PaperAuth.api('/api/pay/manual',{method:'POST',body}).then(()=>{
    _slipData='';
    toast('✅ Sent! Your plan will be activated after verification.');
    try{ initPlanBox(); }catch(e){}
  }).catch(e=>{
    const m=String(e&&e.message||'');
    if(m.indexOf('409')>=0) toast('❌ This Transaction ID was already submitted');
    else if(m.indexOf('503')>=0) toast('❌ Payments are not set up yet');
    else if(m.indexOf('400')>=0) toast('❌ Please check the details and try again');
    else toast('❌ Could not send. Check your internet and try again.');
  });
};

/* ---------- Safepay (automatic online payment) ---------- */
window.payWithSafepay=()=>{
  toast('Opening secure payment page…');
  PaperAuth.api('/api/safepay/checkout',{method:'POST',body:{plan:_subPlan}}).then(r=>{
    try{ localStorage.setItem('sf_tracker',r.tracker); }catch(e){}
    location.href=r.checkoutUrl; // wrapper opens it in the browser; polling settles on return
  }).catch(e=>{
    const m=String(e&&e.message||''), d=String(e&&e.detail||'');
    if(m.indexOf('503')>=0) toast('❌ Online payments are not set up yet');
    else if(d) toast(('❌ Payment error: '+d).slice(0,140));
    else toast('❌ Could not start payment. Check your internet and try again.');
  });
};
function sfPollPending(n){
  let tr=''; try{ tr=localStorage.getItem('sf_tracker')||''; }catch(e){}
  if(!tr||!window.PaperAuth||!PaperAuth.isConfigured()||!PaperAuth.getToken()) return;
  PaperAuth.api('/api/safepay/status?tracker='+encodeURIComponent(tr)).then(r=>{
    if(r&&r.status==='success'){
      try{ localStorage.removeItem('sf_tracker'); }catch(e){}
      toast('🎉 Cloud Backup active! Thank you.');
      PaperAuth.api('/api/me').then(me=>{ try{ localStorage.setItem('ps_user',JSON.stringify(me)); }catch(e){} refreshCloudGate(); renderPlanBox(); }).catch(()=>{ refreshCloudGate(); });
      try{ initPlanBox(); }catch(e){}
    } else if(n<18){ setTimeout(()=>sfPollPending(n+1),5000); }
    else { try{ localStorage.removeItem('sf_tracker'); }catch(e){} }
  }).catch(()=>{ if(n<18) setTimeout(()=>sfPollPending(n+1),5000); });
}
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) sfPollPending(0); });

/* ---------- App update (APK) ---------- */
let _apkInfo=null;
function _installedVc(){ try{ return (window.AndroidApp&&AndroidApp.getVersionCode)?AndroidApp.getVersionCode():0; }catch(e){ return 0; } }
const _VC_NAMES={11:'1.3.7',12:'1.3.8',13:'1.3.9'};
function _installedName(){ const vc=_installedVc(); if(!vc) return ''; return _VC_NAMES[vc]||('v'+vc); }
function _fetchApkInfo(){ return fetch('./apk-version-book.json?t='+Date.now()).then(r=>r.json()).then(j=>{ _apkInfo=j; return j; }); }
/* v222: Update row shows the installed version, and old -> new when an update is available */
function refreshUpdateBadge(){
  _fetchApkInfo().then(j=>{
    const mine=_installedVc(), dot=$('upd-dot'), txt=$('upd-txt');
    if(!dot) return;
    const name=_installedName();
    if(j&&j.versionCode&&mine&&j.versionCode>mine){ dot.style.display='inline-block'; if(txt)txt.textContent=(name?name+' → ':'')+(j.versionName||''); }
    else { dot.style.display='none'; if(txt)txt.textContent=name; }
  }).catch(()=>{ const dot=$('upd-dot'), txt=$('upd-txt'); if(dot)dot.style.display='none'; if(txt)txt.textContent=_installedName(); });
}
window.checkAppUpdate=()=>{
  const go=j=>{
    const mine=_installedVc();
    if(j&&j.versionCode&&mine&&j.versionCode<=mine){ toast('✅ Already on the latest version'); return; }
    if(window.AndroidApp&&AndroidApp.checkUpdate){ try{ AndroidApp.checkUpdate(); return; }catch(e){} }
    if(j&&j.apkUrl){ location.href=j.apkUrl; return; }
    toast('✅ Already on the latest version');
  };
  if(_apkInfo){ go(_apkInfo); return; }
  _fetchApkInfo().then(go).catch(()=>toast('❌ Could not check. Please check your internet.'));
};

/* ---------- Sheet / modal ---------- */
function openSheet(html){ $('sheet-box').innerHTML=html; $('sheet').classList.remove('hidden'); }
function closeSheet(){ $('sheet').classList.add('hidden'); $('sheet').classList.remove('center'); $('sheet-box').innerHTML=''; }
function openDlg(html){ $('sheet-box').innerHTML=html; $('sheet').classList.add('center'); $('sheet').classList.remove('hidden'); }
function confirmDlg(title,msg,okLabel,cb){
  openDlg(`<div class="dlg"><h2>${title}</h2><p>${msg}</p>
  <div class="dlg-btns"><button class="dlg-cancel" onclick="closeSheet()">CANCEL</button>
  <button class="dlg-ok" id="dlg-ok">${okLabel}</button></div></div>`);
  $('dlg-ok').onclick=()=>{ closeSheet(); cb(); };
}
function lossConfirm(kind,lossLines,cb,extra){
  if(DB.profile.lossAsk===false){ cb(); return; }
  const rows=lossLines.map(l=>'\u2022 '+esc(l.name)+' \u2014 rate '+pkr(l.unit)+' (cost '+pkr(l.cost)+')').join('<br>');
  openDlg(`<div class="dlg"><h2>Sell at a loss?</h2><p>${rows}<br><br>${extra||('Are you sure you want to '+kind+' at this rate?')}</p>
  <label class="dont-ask"><input type="checkbox" id="loss-noask"> Don't ask again</label>
  <div class="dlg-btns"><button class="dlg-cancel" onclick="closeSheet()">CANCEL</button>
  <button class="dlg-ok" id="dlg-ok">YES, SELL</button></div></div>`);
  $('dlg-ok').onclick=()=>{ if($('loss-noask')&&$('loss-noask').checked){ DB.profile.lossAsk=false; save(); } closeSheet(); cb(); };
}
window.openSettings=()=>{
  const on=DB.profile.lossAsk!==false;
  openSheet(`<h3>⚙️ Settings</h3>
  <div class="lbl" style="margin:8px 0 2px">WARNINGS</div>
  <div class="menu-row" onclick="toggleLossAsk()"><span class="ic">${IC_WARN}</span><div><div>Loss warning</div><div class="sub">Warns when below cost — sale, wholesale, edit & credit</div></div><button id="loss-tswitch" class="tswitch${on?' on':''}" onclick="event.stopPropagation();toggleLossAsk()"><span class="tlbl">${on?'On':'Off'}</span><span class="tknob"></span></button></div>
  <div class="lbl" style="margin:8px 0 2px">NOTIFICATIONS</div>
  <div class="menu-row" onclick="toggleBellAlert()"><span class="ic">${IC_BELL}</span><div><div>Overdue bell alert</div><div class="sub">Bell rings when a promise date passes</div></div><button id="bell-tswitch" class="tswitch${DB.profile.bellAlert!==false?' on':''}" onclick="event.stopPropagation();toggleBellAlert()"><span class="tlbl">${DB.profile.bellAlert!==false?'On':'Off'}</span><span class="tknob"></span></button></div>
  <div class="menu-row" onclick="togglePhoneAlarm()"><span class="ic">${IC_ALARM}</span><div><div>Phone alarm</div><div class="sub">Notification alarm at the promise time — even if the app is closed</div></div><button id="alarm-tswitch" class="tswitch${DB.profile.phoneAlarm!==false?' on':''}" onclick="event.stopPropagation();togglePhoneAlarm()"><span class="tlbl">${DB.profile.phoneAlarm!==false?'On':'Off'}</span><span class="tknob"></span></button></div>
  <div class="menu-row" onclick="openAlarmSounds()"><span class="ic">${IC_MUSIC}</span><div><div>Alarm sound</div><div class="sub">${alarmSoundName()} — tap to change &amp; hear</div></div><span class="arw">›</span></div>
  <div class="lbl" style="margin:8px 0 2px">NAVIGATION</div>
  <div class="menu-row" onclick="openTabOrder()"><span class="ic">${IC_LAYERS}</span><div><div>Tab order</div><div class="sub">${tabOrder().map(k=>TAB_LABEL[k]).join(', ')} — tap to change</div></div><span class="arw">›</span></div>
  <div class="lbl" style="margin:8px 0 2px">ABOUT</div>
  <div class="menu-row" onclick="openAbout()"><span class="ic">${IC_INFO}</span><div><div>About ReamBook</div><div class="sub">Version ${_installedName()||'—'} — tap for details</div></div><span class="arw">›</span></div>
  <div class="mrow"><button class="btn-ghost" onclick="$('btn-profile').click()">Back</button></div>`);
};
window.openAbout=(tried)=>{
  if(!_apkInfo&&!tried){ _fetchApkInfo().then(()=>openAbout(true)).catch(()=>openAbout(true)); return; }
  const mine=_installedVc(), name=_installedName(), j=_apkInfo;
  const updAvailable=j&&j.versionCode&&mine&&j.versionCode>mine;
  openSheet(`<h3>ℹ️ About ReamBook</h3>
  <div class="menu-row"><div><div>ReamBook</div><div class="sub">Sale, Stock, Credit &amp; Reports</div></div></div>
  <div class="menu-row"><div><div>Installed version</div><div class="sub">${name||'Browser — no APK installed'}</div></div></div>
  ${updAvailable?`<div class="menu-row"><div><div>New version available</div><div class="sub">${name} → ${j.versionName} — tap Download to update</div></div></div>
  <div class="mrow"><button class="btn-go" onclick="checkAppUpdate()">Download ${j.versionName}</button></div>`:j?`<div class="menu-row"><div><div>Update status</div><div class="sub">You are on the latest version</div></div></div>`:`<div class="menu-row"><div><div>Update status</div><div class="sub">Could not check — connect to the internet and reopen</div></div></div>`}
  <div class="mrow"><button class="btn-ghost" onclick="openSettings()">Back</button></div>`);
};
window.openTabOrder=()=>{
  const cur=DB.profile.tabOrder||0;
  const det=['Sale opens first — best for counter billing','Wholesale opens first — best for salesmen','Expense opens first — best for quick expense entry'];
  openSheet(`<h3>📑 Tab order</h3>
  <div class="sub" style="margin:2px 0 8px">Choose the order of the Sale, Wholesale and Expense tabs — the first one opens by default.</div>
  ${TAB_ORDERS.map((o,i)=>`<div class="menu-row" onclick="setTabOrder(${i})"><span class="radio${i===cur?' on':''}"></span><div><div>${o.map(k=>TAB_LABEL[k]).join(', ')}</div><div class="sub">${det[i]}</div></div></div>`).join('')}
  <div class="mrow"><button class="btn-ghost" onclick="openSettings()">Back</button></div>`);
};
window.setTabOrder=i=>{ DB.profile.tabOrder=i; save(); applyTabOrder(true); openTabOrder(); toast('✅ Tab order updated'); };
window.toggleBellAlert=()=>{ DB.profile.bellAlert=DB.profile.bellAlert===false; save(); updateBellBadge();
  const on=DB.profile.bellAlert!==false, btn=document.querySelector('#bell-tswitch');
  if(btn){ btn.classList.toggle('on',on); btn.querySelector('.tlbl').textContent=on?'On':'Off'; } };
window.togglePhoneAlarm=()=>{ DB.profile.phoneAlarm=DB.profile.phoneAlarm===false; save(); syncAlarms();
  const on=DB.profile.phoneAlarm!==false, btn=document.querySelector('#alarm-tswitch');
  if(btn){ btn.classList.toggle('on',on); btn.querySelector('.tlbl').textContent=on?'On':'Off'; }
  toast(on?'⏰ Phone alarm On':'⏰ Phone alarm Off'); };
window.toggleLossAsk=()=>{ DB.profile.lossAsk=DB.profile.lossAsk===false; save();
  const on=DB.profile.lossAsk!==false, btn=document.querySelector('#loss-tswitch');
  if(btn){ btn.classList.toggle('on',on); btn.querySelector('.tlbl').textContent=on?'On':'Off'; } };
window.__ppContactCbs={};
window.__ppContact=(id,n,ph)=>{ const cb=window.__ppContactCbs[id]; delete window.__ppContactCbs[id]; if(cb) cb(n||'',ph||''); };
function pickContact(cb){
  const id='c'+Date.now().toString(36)+Math.floor(Math.random()*999);
  window.__ppContactCbs[id]=cb;
  try{ if(window.AndroidApp&&AndroidApp.pickContact){ AndroidApp.pickContact(id); return; } }catch(e){}
  if(navigator.contacts&&navigator.contacts.select){
    navigator.contacts.select(['name','tel'],{multiple:false}).then(a=>{ const c=a[0]||{};
      cb((c.name&&c.name[0])||'',(c.tel&&c.tel[0])||''); delete window.__ppContactCbs[id];
    }).catch(()=>{ delete window.__ppContactCbs[id]; toast('Contact picker closed'); });
    return;
  }
  delete window.__ppContactCbs[id]; toast('Contact picker not available');
}
window.pickCreditContact=()=>pickContact((n,ph)=>{ if(n) $('cc-name').value=n; if(ph) $('cc-phone').value=ph; });
$('sheet').onclick=e=>{ if(e.target.id==='sheet') closeSheet(); };
/* Clean trash icon used for every delete option */
const TRASH='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

/* v205: one clean line-icon set for all menu rows (replaces emoji icons) */
const _svg=(inner,s)=>`<svg width="${s||20}" height="${s||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const IC_THEME=_svg('<circle cx="12" cy="12" r="9"/><circle cx="8.4" cy="10" r="1.2" fill="currentColor"/><circle cx="12" cy="7.4" r="1.2" fill="currentColor"/><circle cx="15.6" cy="10" r="1.2" fill="currentColor"/><circle cx="9.6" cy="15.2" r="1.2" fill="currentColor"/>');
const IC_SET=_svg('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>');
const IC_UPD=_svg('<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>');
const IC_DL=_svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>');
const IC_UL=_svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',26);
const IC_FOLDER=_svg('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',26);
const IC_EDIT=_svg('<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>');
const IC_OUT=_svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>');
const IC_CAM=_svg('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',17);
const IC_BELL=_svg('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>');
const IC_ALARM=_svg('<circle cx="12" cy="13" r="7"/><polyline points="12 10 12 13 14.5 15"/><path d="M5.5 2.5 3 5"/><path d="M18.5 2.5 21 5"/>');
const IC_MUSIC=_svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>');
const IC_WARN=_svg('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>');
const IC_LAYERS=_svg('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>');
const IC_INFO=_svg('<circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>');
const IC_SHOP=_svg('<path d="M3 9.5 4.6 4h14.8L21 9.5"/><path d="M4 9.5V20h16V9.5"/><path d="M9.5 20v-5.5h5V20"/><path d="M3 9.5c.6 1.2 1.7 2 3 2s2.4-.8 3-2c.6 1.2 1.7 2 3 2s2.4-.8 3-2c.6 1.2 1.7 2 3 2s2.4-.8 3-2"/>');
const IC_SHARE=_svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4"/><path d="M15.4 6.5l-6.8 4"/>');
/* v211: Share app — doston/groups ko download link bhejo. Jo pehle se
   user hai, us ke liye yehi file sirf UPDATE ban kar lagti hai (same
   package + same signature), data mehfooz rehta hai. */
const SHARE_LINK='https://malikmatti383-ship-it.github.io/Paper-Stock/download.html';
window.shareApp=()=>{
  openSheet(`<h3>📤 Share ReamBook</h3>
  <div style="text-align:center;margin:10px 0 4px"><img src="icon.svg" style="width:72px;height:72px;border-radius:18px;box-shadow:0 8px 18px rgba(0,60,100,.18)"></div>
  <div style="text-align:center;font-weight:800;font-size:17px">ReamBook</div>
  <div class="sub" style="text-align:center;margin-bottom:10px">Sale, Stock, Credit & Reports</div>
  <div style="font-size:14px;line-height:1.9">✔ Sale & billing — send bill photos on WhatsApp<br>✔ Stock management<br>✔ Credit record with auto reminders<br>✔ Daily & monthly reports<br>✔ Cloud backup — data is never lost<br>✔ Works without internet</div>
  <div class="fld" style="margin-top:12px"><span class="fld-lbl">Or share the download link</span><div class="fld-in" style="word-break:break-all;font-size:13px">${SHARE_LINK}</div></div>
  <div class="sub" style="text-align:center;margin-top:10px">Share APK sends the ReamBook app itself, with your message — the other person installs it directly.</div>
  <div class="mrow"><button class="btn-ghost" onclick="copyShareLink()">📋 Copy link</button><button class="btn-go" onclick="doShareApp()">📤 Share APK</button></div>
  <div class="mrow"><button class="btn-ghost" onclick="$('btn-profile').click()">Back</button></div>`);
};
function copyLinkToast(msg){ const done=()=>toast(msg||'🔗 Link copied'); if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(SHARE_LINK).then(done).catch(()=>{ fallbackCopy(SHARE_LINK); done(); }); } else { fallbackCopy(SHARE_LINK); done(); } }
window.copyShareLink=()=>{ copyLinkToast('🔗 Link copied'); };
window.doShareApp=()=>{
  const text='📒 *ReamBook* — Sale, Stock, Credit & Reports\n\n✔ Sale & billing — send bill photos on WhatsApp\n✔ Stock management\n✔ Credit record with auto reminders\n✔ Daily & monthly reports\n✔ Cloud backup — data is never lost\n✔ Works without internet\n\n👇 Download FREE:\n'+SHARE_LINK;
  if(window.AndroidApp&&AndroidApp.shareApk){ try{ AndroidApp.shareApk(text); return; }catch(e){} }
  if(window.AndroidApp&&AndroidApp.shareText){ try{ AndroidApp.shareText(text); return; }catch(e){} }
  if(navigator.share){ navigator.share({ title:'ReamBook', text:text }).then(()=>{}).catch(()=>{ copyLinkToast('🔗 Link copied — WhatsApp me paste karke bhej dein'); }); return; }
  copyLinkToast('🔗 Link copied — WhatsApp me paste karke bhej dein');
};
function fallbackCopy(t){ try{ const ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }catch(e){} }

/* ---------- Nav ---------- */
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  $(id).classList.add('active');
  document.querySelectorAll('.tt').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  window.scrollTo(0,0);
  if(id==='view-add') initAdd();
  if(id==='view-sales') renderSales();
  if(id==='view-stock') renderStock();
  if(id==='view-report') renderReport();
  if(id==='view-credit') renderCredit();
}
document.querySelectorAll('.tt').forEach(b=>b.onclick=()=>showView(b.dataset.view));

/* ---------- Profile / backup ---------- */
function renderStoreName(){ const nm=DB.profile.name||'ReamBook', el=$('store-name');
  el.innerHTML=`<span class="sn-txt" id="sn-txt">${esc(nm)}</span>`;
  requestAnimationFrame(()=>{ const t=$('sn-txt'); if(!t) return;
    if(el.scrollWidth>el.clientWidth+8){ el.classList.add('marquee-on');
      t.innerHTML=esc(nm)+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+esc(nm); }
    else el.classList.remove('marquee-on'); });
  $('btn-profile').innerHTML = DB.profile.logo?`<img class="tb-logo" src="${DB.profile.logo}">`:'👤'; }
window.setStoreLogo=input=>{ readImg(input.files[0],url=>{ if(!url) return;
  DB.profile.logo=url; save(); renderStoreName(); $('btn-profile').click(); toast('✅ Store photo updated'); }); };
/* ================= APP THEMES ================= */
const THEMES=[
 {id:'ocean',name:'Ocean Blue',g:'linear-gradient(135deg,#102c6b,#4a86f5)'},
 {id:'emerald',name:'Emerald Green',g:'linear-gradient(135deg,#0f6b49,#16c475)'},
 {id:'purple',name:'Royal Purple',g:'linear-gradient(135deg,#471c7d,#875ff0)'},
 {id:'red',name:'Cherry Red',g:'linear-gradient(135deg,#521010,#e03232)'},
 {id:'pink',name:'Rose Pink',g:'linear-gradient(135deg,#5c1630,#e03283)'},
 {id:'sunset',name:'Sunset Glow',g:'linear-gradient(135deg,#7933e0,#f7a716)'},
 {id:'grey',name:'Slate Grey',g:'linear-gradient(135deg,#1a2332,#78828f)'},
 {id:'cyan',name:'Aqua Cyan',g:'linear-gradient(135deg,#0d3d52,#2fd8f2)'},
 {id:'classic',name:'Classic Blue',g:'linear-gradient(135deg,#1268b1,#14b2d6)'},
 {id:'whitegold',name:'White Gold',g:'linear-gradient(135deg,#fbf7ec,#d4af37)'},
 {id:'blackgold',name:'Black Gold',g:'linear-gradient(135deg,#0c0a06,#d4af37)'},
 {id:'darknavy',name:'Dark Navy',g:'linear-gradient(135deg,#0a0f1e,#5b8def)'},
];
function curTheme(){ const id=DB&&DB.profile&&DB.profile.theme; return THEMES.some(x=>x.id===id)?id:'ocean'; }
function applyTheme(id){ document.body.dataset.theme=id; }
function themeName(id){ const x=THEMES.find(y=>y.id===id); return x?x.name:'Ocean Blue'; }
function themeDot(id){ const x=THEMES.find(y=>y.id===id)||THEMES[0]; return `<span class="theme-dot sm" style="background:${x.g}"></span>`; }
window.setTheme=id=>{ if(!THEMES.some(x=>x.id===id)) return; DB.profile.theme=id; save(); applyTheme(id); openThemePicker(); };
window.openThemePicker=()=>{
  const c=curTheme();
  const row=x=>`<div class="menu-row" onclick="setTheme('${x.id}')"><span class="ic"><span class="theme-dot sm" style="background:${x.g}"></span></span><span>${x.name}</span>${x.id===c?'<span class="arw" style="color:var(--teal)">✓</span>':'<span class="arw">›</span>'}</div>`;
  const sec=t=>`<div style="font-weight:800;font-size:13px;margin:12px 2px 6px;color:var(--teal)">${t}</div>`;
  const bizIds=['ocean','darknavy','emerald','blackgold','whitegold','grey'];
  const biz=bizIds.map(id=>THEMES.find(t=>t.id===id)).filter(Boolean);
  const rest=THEMES.filter(t=>!bizIds.includes(t.id));
  openSheet(`<h3>🎨 Colors Theme</h3><div class="sub" style="margin-bottom:8px">Pick a theme — it stays until you change it.</div>`+
   sec('💼 Business Themes')+biz.map(row).join('')+
   sec('🎨 Your Style Theme')+rest.map(row).join('')+
   `<div class="mrow"><button class="btn-ghost" onclick="$('btn-profile').click()">Back</button></div>`);
};
$('btn-profile').onclick=()=>{
  const p=DB.profile, init=(p.name||'P').slice(0,1).toUpperCase();
  const av=p.logo?`<img src="${p.logo}">`:esc(init);
  openSheet(`${authSection()}<div class="prof-head"><h3>Profile</h3><button class="prof-done" onclick="closeSheet()">Done</button></div>
    <div class="profile-top"><div class="pav-wrap"><div class="pavatar">${av}</div>
    <button class="pav-cam" onclick="$('logo-file').click()" title="Store photo">${IC_CAM}</button></div>
    <div><b style="font-size:19px">${esc(p.name||'ReamBook')}</b><button class="pname-edit" onclick="editProfile()" title="Rename">${IC_EDIT}</button><div class="sub">${esc(p.email||'')}</div></div></div>
    <input type="file" id="logo-file" accept="image/*" class="hidden" onchange="setStoreLogo(this)">
    <input type="file" id="import-file" accept=".json" class="hidden" onchange="importBackup(this)">
    <div class="prof-row" onclick="openShops()"><span class="prof-ic">${IC_SHOP}</span><span class="prof-lbl">Switch shop</span><span class="prof-val">${esc(curShopName())}</span><span class="arw">›</span></div>
    <div class="prof-row" onclick="shareApp()"><span class="prof-ic">${IC_SHARE}</span><span class="prof-lbl">Share app</span><span class="arw">›</span></div>
    ${(window.PaperAuth&&PaperAuth.getToken())?`<div class="prof-row" onclick="confirmLogout()"><span class="prof-ic ic-red">${IC_OUT}</span><span class="prof-lbl" style="color:#b3261e">Sign out</span></div>`:''}
    <div class="prof-sec">Shop</div>
    <div class="prof-row" onclick="editProfile()"><span class="prof-ic">${IC_EDIT}</span><span class="prof-lbl">Shop name</span><span class="prof-val">${esc(p.name||'ReamBook')}</span><span class="arw">›</span></div>
    <div class="prof-row" style="cursor:default"><span class="prof-ic">Rs</span><span class="prof-lbl">Currency</span><span class="prof-val">Rs · Pakistan</span></div>
    <div class="prof-row" onclick="openCloudSheet()"><span class="prof-ic">${IC_UL}</span><span class="prof-lbl">Multi-device sharing</span><span class="prof-val">1 account</span><span class="arw">›</span></div>
    <div class="prof-sec">Your data</div>
    <div class="prof-cards">
      <div class="prof-card" onclick="guardBackup()"><span class="prof-ic lg">${IC_UL}</span><b>Back up</b><small>${_bkLocked()?'🔒 Premium':lastBackupTxt()}</small></div>
      <div class="prof-card" onclick="guardRestore()"><span class="prof-ic lg">${IC_FOLDER}</span><b>Restore</b><small>${_bkLocked()?'🔒 Premium':'Bring back your latest data'}</small></div>
    </div>
    <div class="prof-row" onclick="openExportScreen()"><span class="prof-ic">${IC_DL}</span><span class="prof-lbl">Export data</span><span class="prof-val">${_bkLocked()?'🔒 Premium':'CSV / PDF'}</span><span class="arw">›</span></div>
    <div class="prof-row" onclick="openThemePicker()"><span class="prof-ic">${IC_THEME}</span><span class="prof-lbl">Colors Theme</span><span class="prof-val">${themeName(curTheme())}</span><span class="arw">›</span></div>
    <div class="prof-row" onclick="openSettings()"><span class="prof-ic">${IC_SET}</span><span class="prof-lbl">Settings</span><span class="arw">›</span></div>
    <div class="prof-row" onclick="checkAppUpdate()"><span class="prof-ic">${IC_UPD}</span><span class="prof-lbl">Update</span><span class="prof-val"><span id="upd-dot" style="display:none;width:9px;height:9px;border-radius:50%;background:#22c55e"></span><span id="upd-txt"></span></span><span class="arw">›</span></div>
    <div class="prof-row" onclick="resetAll()"><span class="prof-ic ic-red">${TRASH}</span><span class="prof-lbl" style="color:#b3261e">Delete all data</span></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Close</button></div>`);
  try{ refreshUpdateBadge(); }catch(e){}
  try{ if(window.PaperAuth&&PaperAuth.getToken()) PaperAuth.api('/api/pay/manual/mine').then(r=>{ _subMine=(r&&r.payments)||[]; _cachePkg(); const pel=$('pkg-pill'); if(pel){ const pn=_activePkgName(); if(pn) pel.textContent=pn; } }).catch(()=>{}); }catch(e){}
};
$('btn-backup').onclick=()=>{ openCloudSheet(); };
window.openCloudSheet=()=>{
  openSheet(`<h3>☁️ Cloud Backup</h3><div id="plan-box"></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Close</button></div>`);
  try{ initPlanBox(); }catch(e){}
};
window.cloudSyncNow=()=>{
  enableCloudSync();
  if(syncCtl){ try{ syncCtl.push(); syncCtl.pull(); }catch(e){} toast('☁️ Syncing…'); }
};
function lastBackupKey(){ try{ const em=curEmail(); const reg=em?ensureReg(em):null; return 'ps_lb_'+(em||'anon')+'_'+(reg?reg.active:'main'); }catch(e){ return 'ps_lb_anon_main'; } }
function lastBackupTxt(){ try{ const t=parseInt(localStorage.getItem(lastBackupKey())||'0'); if(!t) return 'Download file';
  const m=Math.round((Date.now()-t)/60000); if(m<1) return 'Last saved just now'; if(m<60) return 'Last saved '+m+' min ago';
  const h=Math.round(m/60); if(h<24) return 'Last saved '+h+' h ago'; return 'Last saved '+Math.round(h/24)+' d ago'; }catch(e){ return 'Download file'; } }
window.cloudBackup=()=>{
  const blob=new Blob([JSON.stringify(DB,null,1)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='paper-stock-backup-'+dstr()+'.json'; a.click(); URL.revokeObjectURL(a.href);
  try{ localStorage.setItem(lastBackupKey(), String(Date.now())); }catch(e){}
  toast('✅ Backup downloaded!');
};
/* v224: Back up / Restore are Premium-only (owner's rule 2026-10-29) — a free
   user tapping either gets the subscription sheet instead of a backup file. */
function _bkLocked(){ return !_subPremiumActive(_subUser()); }
window.guardBackup=()=>{ if(_bkLocked()) openCloudSheet(); else cloudBackup(); };
window.guardRestore=()=>{ if(_bkLocked()) openCloudSheet(); else $('import-file').click(); };
window.importBackup=function(inp){
  const f=inp.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{ const d=JSON.parse(r.result); if(!d.products||!d.seq) throw 0;
    confirmDlg('Replace data?','Current data will be replaced. Continue?','REPLACE',()=>{
      DB=d; save(); renderStoreName(); showView('view-add'); toast('✅ Backup restored!'); });
  }catch(e){ toast('❌ Invalid backup file'); } };
  r.readAsText(f); inp.value='';
};
window.editProfile=()=>{
  openSheet(`<h3>Business profile</h3>
    <input id="pf-name" value="${esc(DB.profile.name||'')}" placeholder="Store name">
    <input id="pf-phone" value="${esc(DB.profile.phone||'')}" placeholder="Phone" inputmode="tel">
    <input id="pf-addr" value="${esc(DB.profile.address||'')}" placeholder="Address">
    <input id="pf-email" value="${esc(DB.profile.email||'')}" placeholder="Email" inputmode="email">
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Cancel</button><button class="btn-go" onclick="saveProfile()">Save</button></div>`);
};
window.saveProfile=()=>{ DB.profile.name=$('pf-name').value.trim()||'ReamBook'; DB.profile.phone=$('pf-phone').value.trim(); DB.profile.address=$('pf-addr').value.trim(); DB.profile.email=$('pf-email').value.trim(); save();
  /* Naam aik jagah: profile se badlo to Shops list me bhi wahi naam aaye */
  try{ const em=curEmail(); if(em){ const reg=ensureReg(em); const s=reg.shops.find(x=>x.id===reg.active); if(s&&s.name!==DB.profile.name){ s.name=DB.profile.name; writeReg(em,reg); } } }catch(e){}
  renderStoreName(); closeSheet(); toast('✅ Saved'); };
window.resetAll=()=>{
  confirmDlg('Delete ALL data?','This will erase everything in the app. Are you sure?','DELETE',()=>{
    confirmDlg('Final warning','Really delete everything? This cannot be undone.','YES, DELETE',()=>{
      DB=defDB(); save(); renderStoreName(); closeSheet(); showView('view-add'); toast('Cleared'); }); }); };

/* ---------- Image helper ---------- */
function readImg(file,cb){
  if(!file) return cb(null);
  const r=new FileReader();
  r.onload=()=>{ const img=new Image();
    img.onload=()=>{ const c=document.createElement('canvas');
      const s=Math.min(1,256/Math.max(img.width,img.height));
      c.width=Math.round(img.width*s); c.height=Math.round(img.height*s);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      cb(c.toDataURL('image/jpeg',0.82)); };
    img.src=r.result; };
  r.readAsDataURL(file);
}
const pimg=(p,cls)=>p.image?`<img class="${cls||'sc-img'}" src="${p.image}">`:`<div class="${cls||'sc-img'} emoji">📄</div>`;

/* ================= ADD ================= */
let addImg=null, addId=null;
function initAdd(){
  addId=DB.seq.item; $('add-itemid').value=addId; addImg=null;
  $('add-photo-pick').innerHTML='<span>📷</span>';
}
$('add-itemid-auto').onclick=()=>{ $('add-itemid').value=DB.seq.item; };
$('opt-cam').onclick=()=>$('add-photo-cam').click();
$('opt-gal').onclick=()=>$('add-photo').click();
$('add-photo-pick').onclick=()=>$('add-photo').click();
const handleAddPhoto=e=>readImg(e.target.files[0],d=>{ addImg=d; if(d) $('add-photo-pick').innerHTML=`<img src="${d}">`; e.target.value=''; });
$('add-photo').onchange=handleAddPhoto;
$('add-photo-cam').onchange=handleAddPhoto;
/* ---- ADD tab: Add / Edit mode ---- */
let editPickId=null;
function setAddMode(m){ $('seg-addmode').classList.toggle('active',m==='add'); $('seg-editmode').classList.toggle('active',m==='edit');
  $('addmode-form').classList.toggle('hidden',m!=='add'); $('editmode-form').classList.toggle('hidden',m!=='edit'); }
$('seg-addmode').onclick=()=>setAddMode('add');
$('seg-editmode').onclick=()=>setAddMode('edit');
function renderEditDD(q){ const dd=$('edit-dd'); if(!dd) return;
  const list=(q?DB.products.filter(p=>pmatch(p,q)):DB.products.slice()).slice(0,50);
  dd.innerHTML=list.map(p=>'<div class="dd-item" onclick="pickEditDD('+p.id+')">'+pimg(p,'dd-img')
    +'<div style="flex:1;min-width:0">'+(p.brand?'<span class="dd-brand">'+esc(p.brand)+'</span>':'')
    +'<div class="nm">'+esc(p.name)+'</div><div class="sub">'+stockLbl(p)+(p.unit?' · '+esc(p.unit):'')+'</div></div>'
    +'<b class="r">'+pkr(p.sell)+'</b></div>').join('')||'<p class="note">No product found</p>';
  dd.classList.remove('hidden'); }
$('edit-psearch').onfocus=()=>{ editPickId=null; renderEditDD($('edit-psearch').value.toLowerCase().trim()); };
$('edit-psearch').oninput=e=>{ editPickId=null; renderEditDD(e.target.value.toLowerCase().trim()); };
window.pickEditDD=id=>{ const p=DB.products.find(x=>x.id===id); if(!p) return;
  editPickId=id; $('edit-dd').classList.add('hidden'); $('edit-psearch').value=p.name;
  $('edit-banner-name').textContent=p.name; $('edit-banner-id').textContent='ID '+(p.itemId||p.id);
  $('edit-banner').classList.remove('hidden'); $('edit-fields').classList.remove('hidden');
  $('edit-pimg').innerHTML=p.image?'<img src="'+p.image+'">':'';
  const cv=$('edit-curvals'); if(cv) cv.innerHTML='<span class="cv">Stock <b>'+(p.qty||0)+'</b></span><span class="cv">Cost <b>'+pkr(p.cost||0)+'</b></span><span class="cv">Rate <b>'+pkr(p.sell||0)+'</b></span>';
  $('edit-itemid').value=p.itemId||p.id; $('edit-name').value=p.name||'';
  $('edit-qty').value=''; $('edit-qty').placeholder='0';
  const qh=$('edit-qty-hint'); if(qh) qh.textContent='Current stock: '+(p.qty||0)+' '+(p.unit||'');
  $('edit-unit').value=p.unit||'Rim';
  $('edit-cost').value=p.cost||0; $('edit-sell').value=p.sell||0; $('edit-tax').value=p.tax||0;
  $('edit-cost-note').textContent='Cost + tax / unit: '+pkr(p.cost||0); };
window.cancelStockEdit=()=>{ editPickId=null; $('edit-psearch').value='';
  $('edit-banner').classList.add('hidden'); $('edit-fields').classList.add('hidden'); $('edit-dd').classList.add('hidden'); };
$('btn-edit-update').onclick=()=>{ const p=DB.products.find(x=>x.id===editPickId);
  if(!p){ toast('Select a product first'); return; }
  const nm=$('edit-name').value.trim(); if(!nm){ toast('Enter item name'); return; }
  p.name=nm; const addQ=Math.max(0,parseInt($('edit-qty').value)||0); p.qty=(p.qty||0)+addQ; p.unit=$('edit-unit').value;
  p.cost=Math.max(0,parseFloat($('edit-cost').value)||0); p.sell=Math.max(0,parseFloat($('edit-sell').value)||0);
  p.tax=Math.max(0,parseFloat($('edit-tax').value)||0);
  save(); renderStock(); toast('\u2705 "'+nm+'" updated!');
  $('edit-cost-note').textContent='Cost + tax / unit: '+pkr(p.cost);
  const qh2=$('edit-qty-hint'); if(qh2) qh2.textContent='Current stock: '+(p.qty||0)+' '+(p.unit||'');
  $('edit-qty').value=''; };
$('btn-add-save').onclick=()=>{
  const name=$('add-name').value.trim();
  if(!name){ toast('Enter item name'); return; }
  const itemId=parseInt($('add-itemid').value)||DB.seq.item;
  DB.products.push({ id:DB.seq.p++, itemId, brand:$('add-brand').value.trim(), name,
    unit:$('add-unit').value, qty:Math.max(0,parseInt($('add-qty').value)||0),
    cost:Math.max(0,parseFloat($('add-cost').value)||0), sell:Math.max(0,parseFloat($('add-sell').value)||0),
    tax:Math.max(0,parseFloat($('add-tax').value)||0), image:addImg });
  if(itemId>=DB.seq.item) DB.seq.item=itemId+1;
  save(); toast('✅ "'+name+'" added!');
  $('add-brand').value=''; $('add-name').value=''; $('add-qty').value=1; $('add-cost').value=0; $('add-sell').value=0; $('add-tax').value=0;
  initAdd();
};

/* ================= SALES ================= */
let saleMode='sale', salePickId=null, saleDate=dstr(), saleDay=dstr();
function saleProfit(s){ const its=saleItems(s); const tc=its.reduce((a,i)=>a+(i.qty||0)*(i.cost||0),0); return Math.round(((s.total||0)-tc)*100)/100; }
function saleLineProfit(s,it,its){ const sumAmt=(its||[]).reduce((a,x)=>a+(x.qty||0)*(x.price||0),0)||0; const amt=(it.qty||0)*(it.price||0); const share=sumAmt>0?(s.total||0)*(amt/sumAmt):amt; return Math.round((share-(it.qty||0)*(it.cost||0))*100)/100; }
function grossProfit(){ return DB.sales.reduce((s,x)=>s+saleProfit(x),0); }
let salesProfitNp=0;
function paintSalesProfit(){
  const el=$('s-profit'), eye=$('profit-eye-s'); if(!el) return;
  if(eye) eye.classList.toggle('eye-off',!DB.profitShow);
  if(DB.profitShow){ el.textContent=salesProfitNp<0?pkrMinus(-salesProfitNp):pkr(salesProfitNp); el.classList.remove('masked'); }
  else { el.textContent='\u2022\u2022\u2022\u2022\u2022\u2022'; el.classList.add('masked'); }
  el.classList.toggle('red-num',salesProfitNp<0); // loss -> stays red until profit recovers
  el.classList.toggle('green-num',salesProfitNp>=0); // recovered -> green again
}
function renderSales(){
  const td=dstr();
  const tSales=DB.sales.filter(x=>x.date===td), tExp=DB.expenses.filter(x=>x.date===td);
  const tot=tSales.reduce((s,x)=>s+x.total,0);
  const exp=tExp.reduce((s,x)=>s+x.amount,0);
  $('s-total').textContent=pkr(tot); $('s-exp').textContent=exp>0?pkrMinus(exp):pkr(0); paintCur();
  const bdS=$('bd-sale'), bdW=$('bd-ws');
  if(bdS) bdS.textContent=pkr(tSales.filter(x=>x.kind!=='wholesale').reduce((s,x)=>s+(x.total||0),0));
  if(bdW) bdW.textContent=pkr(tSales.filter(x=>x.kind==='wholesale').reduce((s,x)=>s+(x.total||0),0));
  salesProfitNp=tSales.reduce((s,x)=>s+saleProfit(x),0)-exp; // TODAY only: resets at midnight
  paintSalesProfit();
  $('sale-date-txt').textContent=fmtDate(saleDate);
  if(!$('exp-date').value) $('exp-date').value=dstr();
  $('sale-dd').classList.add('hidden'); renderSaleCart();
  const wdd=$('ws-dd'); if(wdd) wdd.classList.add('hidden');
  if($('ws-date-txt')) $('ws-date-txt').textContent=fmtDate(wsDate);
  renderWsCart(); renderDaySales(); paintNextIds();
}
function paintNextIds(){ const t='ID'+DB.seq.s; const a=$('sale-next-id'),b=$('ws-next-id'); if(a)a.textContent=t; if(b)b.textContent=t; }
function fmtDate(ds){ const d=new Date(ds+'T12:00'); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
const dtstr=d=>{ d=d||new Date(); return dstr(d)+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
function fmtDT(x){ if(!x) return ''; const p=String(x).split(' '); let r=p[0]; try{ r=fmtDate(p[0]); }catch(e){} if(p[1]){ const t=p[1].split(':'); let h=parseInt(t[0],10)||0; const ap=h>=12?'PM':'AM'; h=h%12||12; r+=' \u00b7 '+h+':'+(t[1]||'00')+' '+ap; } return r; }
function fmtDTs(x){ if(!x) return ''; const p=String(x).split(' '); let r=p[0]; try{ const d=new Date(p[0]+'T12:00'); r=d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}); }catch(e){} if(p[1]){ const t=p[1].split(':'); let h=parseInt(t[0],10)||0; const ap=h>=12?'PM':'AM'; h=h%12||12; r+=' \u00b7 '+h+':'+(t[1]||'00')+' '+ap; } return r; }
function setSeg(id){ ['seg-sale','seg-ws','seg-exp'].forEach(x=>$(x).classList.toggle('active',x===id));
  $('sale-form').classList.toggle('hidden',id!=='seg-sale');
  $('ws-form').classList.toggle('hidden',id!=='seg-ws');
  $('exp-form').classList.toggle('hidden',id!=='seg-exp'); }
$('seg-sale').onclick=()=>{ saleMode='sale'; setSeg('seg-sale'); };
$('seg-ws').onclick=()=>{ saleMode='ws'; setSeg('seg-ws'); };
$('seg-exp').onclick=()=>{ saleMode='exp'; setSeg('seg-exp'); };
/* ---- Tab order (Settings → Navigation): reorder Sale/Wholesale/Expense pills + which opens first ---- */
const TAB_ORDERS=[['sale','ws','exp'],['ws','sale','exp'],['exp','sale','ws']];
const TAB_ID={sale:'seg-sale',ws:'seg-ws',exp:'seg-exp'};
const TAB_MODE={sale:'sale',ws:'ws',exp:'exp'};
const TAB_LABEL={sale:'Sale',ws:'Wholesale',exp:'Expense'};
function tabOrder(){ const o=DB.profile?DB.profile.tabOrder:0; return TAB_ORDERS[o]||TAB_ORDERS[0]; }
function applyTabOrder(selectFirst){
  const order=tabOrder();
  const seg=document.querySelector('#view-sales .seg');
  if(seg) order.forEach(k=>{ const b=document.getElementById(TAB_ID[k]); if(b) seg.appendChild(b); });
  if(selectFirst){ const f=order[0]; saleMode=TAB_MODE[f]; setSeg(TAB_ID[f]); }
}
/* native date picker: showPicker() opens the calendar reliably on mobile (programmatic .click() often fails silently) */
function openDatePicker(id){ const el=$(id); if(!el) return;
  try{ if(el.showPicker) el.showPicker(); else el.click(); }catch(e){ try{ el.click(); }catch(_){} } }
$('sale-date-pill').onclick=()=>openDatePicker('sale-date');
$('sale-date').onchange=e=>{ if(e.target.value){ saleDate=e.target.value; $('sale-date-txt').textContent=fmtDate(saleDate); saleDay=saleDate; renderDaySales(); } };
/* ---- NADIR-style search dropdown + multi-item cart ---- */
let saleCart=[];
$('sale-psearch').onfocus=()=>{ salePickId=null; renderSaleDD($('sale-psearch').value.toLowerCase().trim()); };
$('sale-psearch').oninput=e=>{ salePickId=null; renderSaleDD(e.target.value.toLowerCase().trim()); };
document.addEventListener('click',e=>{ if(!e.target.closest('.dd-wrap')){ $('sale-dd').classList.add('hidden'); const w=$('ws-dd'); if(w) w.classList.add('hidden'); const ed=$('edit-dd'); if(ed) ed.classList.add('hidden'); } });
function paintSaleQtyWarn(){ const box=$('sale-qty-warn'); if(!box) return;
  const p=DB.products.find(x=>x.id===salePickId);
  const q=parseInt($('sale-qty').value)||0;
  box.innerHTML=(p&&q>p.qty)?`<span class="dd-na">Only ${p.qty} available</span>`:'';
}
function paintWsQtyWarn(){ const box=$('ws-qty-warn'); if(!box) return;
  const p=DB.products.find(x=>x.id===wsPickId);
  const q=parseInt($('ws-qty').value)||0;
  box.innerHTML=(p&&q>p.qty)?`<span class="dd-na">Only ${p.qty} available</span>`:'';
}
function pmatch(p,q){ return p.name.toLowerCase().includes(q)||String(p.itemId).includes(q)||(p.brand||'').toLowerCase().includes(q); }
function stockLbl(p){
  if(p.qty<=0) return '<span class="dd-na">Not available</span>';
  if(p.qty<=5) return '<span class="dd-low">Only '+p.qty+' left!</span>';
  return p.qty+' in stock';
}
function paintSaleDisc(){ const box=$('sale-disc-pill'); if(!box) return;
  const sub=saleSub();
  const bill=parseFloat($('sale-total-in').value)||0;
  const d=(bill>0&&sub>bill)?sub-bill:0;
  const dp=d>0?(d/sub*100).toFixed(1).replace(/\.0$/,'')+'%':'';
  box.innerHTML=d>0?`<span class="disc-pill">✓ ${pkr(d)}${dp?' - '+dp:''} discount applied</span>`:''; }function paintWsDisc(){ const box=$('ws-disc-pill'); if(!box) return;
  const tt=parseFloat($('ws-total').value)||0, sub=wsSub();
  const d=(tt>0&&sub>tt)?sub-tt:0;
  const dp=d>0?(d/sub*100).toFixed(1).replace(/\.0$/,'')+'%':'';
  box.innerHTML=d>0?`<span class="disc-pill">✓ ${pkr(d)}${dp?' - '+dp:''} discount applied</span>`:''; }/* ---- Explicit Discount (v149): amount or % via Discount button, below Add more items.
   Rule: rate edit => NO discount (rate is final). Discount button or typed lower total => discount. ---- */
/* ---- Inline Discount (v151): Amount + % boxes, bidirectional auto-calc.
   Rule: rate edit => NO discount. Discount boxes or typed lower total => discount. ---- */
let saleDiscPct=0, wsDiscPct=0, esDiscPct=0;
function saleSub(){ const p=DB.products.find(x=>x.id===salePickId);
  const staged=p?(parseFloat($('sale-rate').value)||p.sell)*(parseInt($('sale-qty').value)||1):0;
  return saleCart.reduce((s,l)=>s+l.qty*l.unit,0)+staged; }
function wsSub(){ const p=DB.products.find(x=>x.id===wsPickId);
  const staged=p?(parseFloat($('ws-rate').value)||p.sell)*(parseInt($('ws-qty').value)||1):0;
  return wsCart.reduce((s,l)=>s+l.qty*l.unit,0)+staged; }
function discIds(which){ return which==='sale'?['sale-disc-amt','sale-disc-pct','sale-total-in']
  :which==='ws'?['ws-disc-amt','ws-disc-pct','ws-total']:['es-disc-amt','es-disc-pct','es-total']; }
function discGetPct(which){ return which==='sale'?saleDiscPct:which==='ws'?wsDiscPct:esDiscPct; }
function discSetPct(which,v){ if(which==='sale')saleDiscPct=v; else if(which==='ws')wsDiscPct=v; else esDiscPct=v; }
function discSub(which){ return which==='sale'?saleSub():which==='ws'?wsSub():esTotal(); }
function discAmt(which){ return Math.round(discSub(which)*discGetPct(which)/100); }
function discApplyTotal(which){ const [ai,pi,ti]=discIds(which);
  const sub=discSub(which), amt=discAmt(which), totEl=$(ti);
  if(totEl) totEl.value=Math.max(0,sub-amt).toFixed(0);
  if(which==='sale') paintSaleDisc(); else if(which==='ws') paintWsDisc(); else { paintEsDisc(); paintEsProfit(); } }
function discSyncFromTotal(which){ const [ai,pi,ti]=discIds(which);
  const totEl=$(ti), amtEl=$(ai), pctEl=$(pi); if(!totEl||!amtEl||!pctEl) return;
  const sub=discSub(which), bill=parseFloat(totEl.value)||0;
  const d=Math.max(0,Math.round((sub-bill)*100)/100);
  const p=sub>0?Math.min(100,d/sub*100):0;
  discSetPct(which,p);
  if(document.activeElement!==amtEl) amtEl.value=d||'';
  if(document.activeElement!==pctEl) pctEl.value=p?+p.toFixed(2):'';
  if(which==='sale'){ paintSaleDisc(); paintSaleCostWarn(); }
  else if(which==='ws'){ paintWsDisc(); paintWsCostWarn(); }
  else { paintEsDisc(); paintEsProfit(); } }
function discSyncFields(which,fromAmt){ const [ai,pi]=discIds(which);
  const amtEl=$(ai), pctEl=$(pi); if(!amtEl||!pctEl) return;
  const sub=discSub(which);
  if(fromAmt){ const a=Math.max(0,parseFloat(amtEl.value)||0);
    const p=sub>0?Math.min(100,a/sub*100):0; discSetPct(which,p);
    if(document.activeElement!==pctEl) pctEl.value=p?+p.toFixed(2):'';
  }else{ const p=Math.min(100,Math.max(0,parseFloat(pctEl.value)||0)); discSetPct(which,p);
    if(document.activeElement!==amtEl) amtEl.value=Math.round(sub*p/100)||'';
  }
  discApplyTotal(which); }
function setupDiscInputs(which){ const [ai,pi]=discIds(which);
  const amtEl=$(ai), pctEl=$(pi); if(!amtEl||!pctEl) return;
  amtEl.oninput=()=>discSyncFields(which,true);
  pctEl.oninput=()=>discSyncFields(which,false); }
function reapplyDisc(which){ if(!(discGetPct(which)>0)) return;
  const [ai,pi]=discIds(which); const amtEl=$(ai), pctEl=$(pi);
  const sub=discSub(which), pct=discGetPct(which);
  if(amtEl) amtEl.value=Math.round(sub*pct/100)||'';
  if(pctEl&&document.activeElement!==pctEl) pctEl.value=pct||'';
  discApplyTotal(which); }
function discClearUI(which){ discSetPct(which,0); const [ai,pi]=discIds(which);
  const a=$(ai),p=$(pi); if(a)a.value=''; if(p)p.value=''; }
function discPctLbl(s){ const d=s.discount||0, c=s.correctTotal||s.total||0;
  if(!(d>0.005)||!(c>0)) return ''; return (d/c*100).toFixed(1).replace(/\.0$/,'')+'%'; }
setupDiscInputs('sale'); setupDiscInputs('ws');
let salePaid=true, wsPaid=true;
function paintPaidTg(){ const sb=$('sale-paid-tg'), wb=$('ws-paid-tg');
  if(sb){ sb.textContent=salePaid?'Paid':'Unpaid'; sb.className='paid-tg '+(salePaid?'paid':'unpaid'); }
  if(wb){ wb.textContent=wsPaid?'Paid':'Unpaid'; wb.className='paid-tg '+(wsPaid?'paid':'unpaid'); } }
window.toggleSalePaid=()=>{ salePaid=!salePaid; paintPaidTg(); };
window.toggleSaleBreakdown=e=>{ if(e) e.stopPropagation();
  const sub=$('sale-breakdown'), btn=$('sale-exp-btn'); if(!sub) return;
  sub.classList.toggle('hidden');
  if(btn) btn.textContent=sub.classList.contains('hidden')?'\u25BC':'\u25B2'; };
window.toggleWsPaid=()=>{ wsPaid=!wsPaid; paintPaidTg(); };
paintPaidTg();
function paintSaleCostWarn(){ const box=$('sale-cost-warn'); if(!box) return;
  const p=DB.products.find(x=>x.id===salePickId);
  const bill=parseFloat($('sale-total-in').value)||0;
  let tc=saleCart.reduce((ss,l)=>{ const pr=DB.products.find(x=>x.id===l.productId); return ss+l.qty*((pr&&pr.cost)||0); },0);
  let warn='';
  if(p){ const q=Math.max(1,parseInt($('sale-qty').value)||1);
    const r=parseFloat($('sale-rate').value)||0;
    if(r>0&&r<p.cost) warn=`<span class="loss-pill">\u26A0\uFE0F Below cost! Cost ${pkr(p.cost)} / unit</span>`;
    tc+=q*(p.cost||0); }
  if(!warn&&bill>0&&tc>0&&bill<tc) warn=`<span class="loss-pill">\u26A0\uFE0F Bill below cost! Cost total ${pkr(tc)}</span>`;
  box.innerHTML=warn;
}
function paintWsCostWarn(){ const box=$('ws-cost-warn'); if(!box) return;
  const p=DB.products.find(x=>x.id===wsPickId);
  const tt=parseFloat($('ws-total').value)||0;
  let tc=wsCart.reduce((ss,l)=>{ const pr=DB.products.find(x=>x.id===l.productId); return ss+l.qty*((pr&&pr.cost)||0); },0);
  let warn='';
  if(p){ const r=parseFloat($('ws-rate').value)||0;
    if(r>0&&r<p.cost) warn=`<span class="loss-pill">\u26A0\uFE0F Below cost! Cost ${pkr(p.cost)} / unit</span>`;
    tc+=(parseInt($('ws-qty').value)||1)*(p.cost||0); }
  if(!warn&&tt>0&&tc>0&&tt<tc) warn=`<span class="loss-pill">\u26A0\uFE0F Bill below cost! Cost total ${pkr(tc)}</span>`;
  box.innerHTML=warn;
}
function renderSaleDD(q){
  const dd=$('sale-dd');
  const list=(q?DB.products.filter(p=>pmatch(p,q)):DB.products.slice()).slice(0,50);
  dd.innerHTML=list.map(p=>`
    <div class="dd-item" onclick="pickSaleDD(${p.id})">${pimg(p,'dd-img')}
      <div style="flex:1;min-width:0">${p.brand?`<span class="dd-brand">${esc(p.brand)}</span>`:''}
      <div class="nm">${esc(p.name)}</div>
      <div class="sub">${stockLbl(p)}${p.unit?' · '+esc(p.unit):''}</div></div>
      <b class="r">${pkr(p.sell)}</b>
    </div>`).join('')||'<p class="note">No product found</p>';
  dd.classList.remove('hidden');
}
window.pickSaleDD=id=>{
  const p=DB.products.find(x=>x.id===id); if(!p) return;
  if(p.qty<=0){ toast('Not available — out of stock'); return; }
  salePickId=id;
  $('sale-psearch').value=p.name;
  $('sale-dd').classList.add('hidden');
  $('sale-cost').value=p.cost.toFixed(2);
  $('sale-rate').value=p.sell;
  $('sale-total-in').value=(cartGrand()+p.sell*($('sale-qty').value||1)).toFixed(0); // running bill total
  paintSaleDisc(); paintSaleCostWarn(); paintSaleQtyWarn();
};
$('sale-rate').oninput=()=>{ const q=Math.max(1,parseInt($('sale-qty').value)||1);
  const r=Math.max(0,parseFloat($('sale-rate').value)||0);
  $('sale-total-in').value=(cartGrand()+r*q).toFixed(0); paintSaleDisc(); paintSaleCostWarn(); paintSaleQtyWarn(); };
$('sale-qty').oninput=()=>{ const r=Math.max(0,parseFloat($('sale-rate').value)||0);
  $('sale-total-in').value=(cartGrand()+r*($('sale-qty').value||1)).toFixed(0); paintSaleDisc(); paintSaleCostWarn(); paintSaleQtyWarn(); };
const saleQtyStep=d=>{ const el=$('sale-qty');
  const p=DB.products.find(x=>x.id===salePickId);
  let v=(parseInt(el.value)||1)+d; v=Math.max(1,v);
  if(p&&v>p.qty){ v=p.qty; toast('Only '+p.qty+' available'); }
  el.value=v; el.oninput(); };
$('sale-total-in').oninput=()=>{ discSyncFromTotal('sale'); };
$('sale-qty-minus').onclick=()=>saleQtyStep(-1);
$('sale-qty-plus').onclick=()=>saleQtyStep(1);
function cartGrand(){ return saleCart.reduce((s,i)=>s+i.total,0); }
function renderSaleCart(){
  const box=$('sale-cart');
  if(!saleCart.length){ box.innerHTML=''; return; }
  box.innerHTML='<div class="cart-box">'+saleCart.map((i,ix)=>`
    <div class="cart-row"><div style="flex:1;min-width:0"><b>${esc(i.name)}</b><div class="sub">${i.qty} × ${pkr(i.unit)} = ${pkr(i.total)}</div></div>
    <div class="cart-step"><button class="mini-btn" onclick="saleStep(${ix},-1)">−</button><b class="qty-num" onclick="qtyTap('sale',${ix},this)" title="Tap to type quantity">${i.qty}</b><button class="mini-btn" onclick="saleStep(${ix},1)">+</button></div>
    <button class="cart-x" onclick="rmCartItem(${ix})">✕</button></div>`).join('')+
    `<div class="cart-total"><span>Items total</span><b>${pkr(cartGrand())}</b></div></div>`;
  paintSaleDisc(); paintSaleCostWarn();
}
window.rmCartItem=ix=>{ saleCart.splice(ix,1); renderSaleCart(); reapplyDisc('sale'); };
window.saleStep=(ix,d)=>{ const l=saleCart[ix]; if(!l) return;
  if(d>0){ const p=DB.products.find(x=>x.id===l.productId);
    if(p&&l.qty+1>p.qty){ toast('Only '+p.qty+' in stock!'); return; } }
  qtyReject=null; l.qty=Math.max(1,l.qty+d); l.total=l.qty*l.unit; renderSaleCart(); reapplyDisc('sale');
  $('sale-total-in').value=cartGrand().toFixed(0); };
/* Staged product -> a sale line. Line total = bill field minus cart sum (item's share of the bill). */
function stageLine(){
  const p=DB.products.find(x=>x.id===salePickId);
  if(!p||!$('sale-psearch').value.trim()) return null;
  const q=Math.max(1,parseInt($('sale-qty').value)||1);
  if(q>p.qty){ toast('Only '+p.qty+' in stock!'); return 'err'; }
  const bill=parseFloat($('sale-total-in').value)||0;
  let lineTotal=bill-cartGrand();
  const unit=Math.max(0,parseFloat($('sale-rate').value)||p.sell);
  if(!(lineTotal>0)) lineTotal=q*unit;
  return {productId:p.id,name:p.name,qty:q,unit,total:lineTotal,cost:p.cost,sellRate:p.sell};
}
function clearStaging(){ salePickId=null; $('sale-psearch').value=''; $('sale-cost').value=''; $('sale-rate').value=''; $('sale-qty').value=1;
  $('sale-total-in').value=cartGrand().toFixed(0); }
$('btn-add-item').onclick=()=>{
  const it=stageLine();
  if(it==='err') return;
  if(!it){ toast('Search and select a product first'); return; }
  saleCart.push(it); clearStaging();
  renderSaleCart(); reapplyDisc('sale'); toast('✅ Added: '+it.name);
};
$('sale-add-cust').onclick=()=>{ $('sale-cust').classList.remove('hidden'); $('sale-cust-phone').classList.remove('hidden'); $('sale-add-cust').classList.add('hidden'); $('sale-cust').focus(); };
/* null-guarded: a stale cached page must never kill the whole app (v57 lesson) */
const _sc=$('sale-contact'); if(_sc) _sc.onclick=()=>{ $('sale-cust').classList.remove('hidden'); $('sale-cust-phone').classList.remove('hidden'); $('sale-add-cust').classList.add('hidden');
  pickContact((n,ph)=>{ if(n) $('sale-cust').value=n; if(ph) $('sale-cust-phone').value=ph; }); };
const _wc=$('ws-contact'); if(_wc) _wc.onclick=()=>{ pickContact((n,ph)=>{ if(n) $('ws-shop').value=n; if(ph) $('ws-phone').value=ph; }); };
$('btn-sold').onclick=()=>{
  if(!guardQtyEdit('sale')) return;
  const lines=[...saleCart];
  const st=stageLine();
  if(st==='err') return;
  if(st) lines.push(st);
  if(!lines.length){ toast('Select a product first'); return; }
  for(const l of lines){ const pr=DB.products.find(x=>x.id===l.productId);
    if(!pr||l.qty>pr.qty){ toast('Out of stock: '+l.name); return; } }
  // Bill = whatever is typed in "Sold at (Total Price)" — divided across products by their rates
  const rateSum=lines.reduce((s,l)=>s+l.qty*l.unit,0);
  let bill=parseFloat($('sale-total-in').value);
  if(!(bill>0)) bill=rateSum;
  const correctTotal=Math.round(rateSum*100)/100;
  const billDiscount=Math.max(0,Math.round((correctTotal-bill)*100)/100);
  const totalCost=Math.round(lines.reduce((ss,l)=>{ const pr=DB.products.find(x=>x.id===l.productId); return ss+l.qty*((pr&&pr.cost)||0); },0)*100)/100;
  const items=lines.map((l)=>{
    const pr=DB.products.find(x=>x.id===l.productId);
    return {productId:l.productId,name:l.name,qty:l.qty,price:l.unit,cost:pr.cost};
  });
  const go=()=>{
    items.forEach(it=>{ const pr=DB.products.find(x=>x.id===it.productId); if(pr) pr.qty-=it.qty; });
  const firstBrand=lines.length===1?((DB.products.find(x=>x.id===lines[0].productId)||{}).brand||''):'';
  const sale={id:DB.seq.s++, productId:lines.length===1?lines[0].productId:null,
    name:lines.length===1?lines[0].name:(lines.length+' items'), brand:firstBrand,
    qty:lines.reduce((s,l)=>s+l.qty,0), total:bill, correctTotal, discount:billDiscount,
    customer:$('sale-cust').value.trim(), phone:$('sale-cust-phone').value.trim(), date:saleDate, ts:(saleDate===dstr()?Date.now():new Date(saleDate+'T12:00').getTime()), items};
  sale.unpaid=!salePaid;
  DB.sales.push(sale);
  DB.printQueue.push({qid:Date.now(), saleId:sale.id, done:false, ts:Date.now()}); // pending print
  save(); saleCart=[]; salePaid=true; paintPaidTg(); discClearUI('sale'); renderSaleCart(); clearStaging(); $('sale-cust').value=''; $('sale-cust-phone').value='';
  renderSales(); updatePrintBadge(); toast('✅ Sold! '+pkr(bill));
  };
  const sLoss=items.filter(it=>it.price<(it.cost||0));
  const billLoss=bill<totalCost;
  if(sLoss.length||billLoss) lossConfirm('sell',(sLoss.length?sLoss:items).map(l=>({name:l.name,unit:l.price,cost:l.cost})),go);
  else go();
};
/* ================= WHOLESALE (shopkeeper sales at stock rates) ================= */
let wsPickId=null, wsDate=dstr(), wsCart=[];
$('ws-psearch').onfocus=()=>{ wsPickId=null; renderWsDD($('ws-psearch').value.toLowerCase().trim()); };
$('ws-psearch').oninput=e=>{ wsPickId=null; renderWsDD(e.target.value.toLowerCase().trim()); };
$('ws-date-pill').onclick=()=>openDatePicker('ws-date');
$('ws-date').onchange=e=>{ if(e.target.value){ wsDate=e.target.value; $('ws-date-txt').textContent=fmtDate(wsDate); saleDay=wsDate; renderDaySales(); } };
function renderWsDD(q){
  const dd=$('ws-dd'); if(!dd) return;
  const list=(q?DB.products.filter(p=>pmatch(p,q)):DB.products.slice()).slice(0,50);
  dd.innerHTML=list.map(p=>`
    <div class="dd-item" onclick="pickWsDD(${p.id})">${pimg(p,'dd-img')}
      <div style="flex:1;min-width:0">${p.brand?`<span class="dd-brand">${esc(p.brand)}</span>`:''}
      <div class="nm">${esc(p.name)}</div>
      <div class="sub">${stockLbl(p)}${p.unit?' · '+esc(p.unit):''}</div></div>
      <b class="r">${pkr(p.sell)}</b>
    </div>`).join('')||'<p class="note">No product found</p>';
  dd.classList.remove('hidden');
}
window.pickWsDD=id=>{
  const p=DB.products.find(x=>x.id===id); if(!p) return;
  if(p.qty<=0){ toast('Not available — out of stock'); return; }
  wsPickId=id; $('ws-psearch').value=p.name; $('ws-dd').classList.add('hidden');
  $('ws-cost').value=p.cost.toFixed(2);
  $('ws-rate').value=p.sell; wsPreview();
};
const wsPreview=()=>{ const r=parseFloat($('ws-rate').value)||0;
  $('ws-total').value=(wsGrand()+r*(parseInt($('ws-qty').value)||1)).toFixed(0); paintWsDisc(); paintWsCostWarn(); paintWsQtyWarn(); };
$('ws-qty').oninput=wsPreview; $('ws-rate').oninput=wsPreview;
$('ws-total').oninput=()=>{ discSyncFromTotal('ws'); paintWsQtyWarn(); };
const wsQtyStep=d=>{ const el=$('ws-qty');
  const p=DB.products.find(x=>x.id===wsPickId);
  let v=(parseInt(el.value)||1)+d; v=Math.max(1,v);
  if(p&&v>p.qty){ v=p.qty; toast('Only '+p.qty+' available'); }
  el.value=v; wsPreview(); };
$('ws-qty-minus').onclick=()=>wsQtyStep(-1);
$('ws-qty-plus').onclick=()=>wsQtyStep(1);
function wsGrand(){ return wsCart.reduce((s,i)=>s+i.total,0); }
function renderWsCart(){
  const box=$('ws-cart'); if(!box) return;
  if(!wsCart.length){ box.innerHTML=''; return; }
  box.innerHTML='<div class="cart-box">'+wsCart.map((i,ix)=>`
    <div class="cart-row"><div style="flex:1;min-width:0"><b>${esc(i.name)}</b><div class="sub">${i.qty} \u00D7 ${pkr(i.unit)} = ${pkr(i.total)}</div></div>
    <div class="cart-step"><button class="mini-btn" onclick="wsStep(${ix},-1)">\u2212</button><b class="qty-num" onclick="qtyTap('ws',${ix},this)" title="Tap to type quantity">${i.qty}</b><button class="mini-btn" onclick="wsStep(${ix},1)">+</button></div>
    <button class="cart-x" onclick="rmWsItem(${ix})">\u2715</button></div>`).join('')+
    `<div class="cart-total"><span>Items total</span><b>${pkr(wsGrand())}</b></div></div>`;
  paintWsDisc(); paintWsCostWarn();
}
window.rmWsItem=ix=>{ wsCart.splice(ix,1); renderWsCart(); reapplyDisc('ws'); };
window.wsStep=(ix,d)=>{ const l=wsCart[ix]; if(!l) return;
  if(d>0){ const p=DB.products.find(x=>x.id===l.productId);
    if(p&&l.qty+1>p.qty){ toast('Only '+p.qty+' available'); return; } }
  qtyReject=null; l.qty=Math.max(1,l.qty+d); l.total=l.qty*l.unit; renderWsCart(); reapplyDisc('ws'); };
function stageWsLine(){
  const p=DB.products.find(x=>x.id===wsPickId);
  if(!p||!$('ws-psearch').value.trim()) return null;
  const q=Math.max(1,parseInt($('ws-qty').value)||1);
  if(q>p.qty){ toast('Only '+p.qty+' in stock!'); return 'err'; }
  const unit=Math.max(0,parseFloat($('ws-rate').value)||p.sell);
  return {productId:p.id,name:p.name,qty:q,unit,total:q*unit,cost:p.cost,sellRate:p.sell};
}
function clearWsStaging(){ wsPickId=null; $('ws-psearch').value=''; $('ws-qty').value=1; $('ws-rate').value=''; $('ws-cost').value='';
  $('ws-total').value=wsGrand().toFixed(0); }
$('btn-ws-add').onclick=()=>{
  const it=stageWsLine();
  if(it==='err') return;
  if(!it){ toast('Search and select a product first'); return; }
  wsCart.push(it); clearWsStaging(); renderWsCart(); reapplyDisc('ws'); toast('\u2705 Added: '+it.name);
};
$('btn-ws-sold').onclick=()=>{ try{
  if(!guardQtyEdit('ws')) return;
  const shop=$('ws-shop').value.trim(), phone=$('ws-phone').value.trim();
  if(!shop){ toast('Enter shop name'); $('ws-shop').focus(); return; }
  if(!phone){ toast('Enter shop phone number'); $('ws-phone').focus(); return; }
  const lines=[...wsCart];
  const st=stageWsLine();
  if(st==='err') return;
  if(st) lines.push(st);
  if(!lines.length){ toast('Select a product first'); return; }
  for(const l of lines){ const pr=DB.products.find(x=>x.id===l.productId);
    if(!pr||l.qty>pr.qty){ toast('Out of stock: '+l.name); return; } }
  const go=()=>{
  // Wholesale: each line billed EXACTLY at its stock sell rate — no bill dividing
  const items=lines.map(l=>{ const pr=DB.products.find(x=>x.id===l.productId); pr.qty-=l.qty;
    return {productId:l.productId,name:l.name,qty:l.qty,price:l.unit,cost:pr.cost}; });
  let total=parseFloat($('ws-total').value); if(!(total>0)) total=items.reduce((s,i)=>s+i.qty*i.price,0);
  const wsCorrect=Math.round(items.reduce((s,i)=>s+i.qty*i.price,0)*100)/100;
  const wsDisc=Math.max(0,Math.round((wsCorrect-total)*100)/100);
  const sale={id:DB.seq.s++, kind:'wholesale', correctTotal:wsCorrect, discount:wsDisc,
    productId:lines.length===1?lines[0].productId:null,
    name:lines.length===1?lines[0].name:(lines.length+' items'),
    qty:lines.reduce((s,l)=>s+l.qty,0), total,
    customer:shop, phone, date:wsDate, ts:(wsDate===dstr()?Date.now():new Date(wsDate+'T12:00').getTime()), items};
  sale.unpaid=!wsPaid;
  DB.sales.push(sale);
  DB.printQueue.push({qid:Date.now(), saleId:sale.id, done:false, ts:Date.now()});
  save(); wsCart=[]; wsPaid=true; paintPaidTg(); discClearUI('ws'); renderWsCart(); clearWsStaging(); $('ws-shop').value=''; $('ws-phone').value='';
  renderSales(); renderStock(); updatePrintBadge(); toast('\u2705 Wholesale sold! '+pkr(total));
  };
  const wsLoss=lines.filter(l=>l.unit<(l.cost||0));
  const wsTotalCost=lines.reduce((ss,l)=>{ const pr=DB.products.find(x=>x.id===l.productId); return ss+l.qty*((pr&&pr.cost)||0); },0);
  const wsBill=parseFloat($('ws-total').value)||0;
  const wsBillLoss=wsBill<wsTotalCost;
  if(wsLoss.length||wsBillLoss) lossConfirm('wholesale',(wsLoss.length?wsLoss:lines).map(l=>({name:l.name,unit:l.unit,cost:l.cost})),go);
  else go();
}catch(err){ toast('⚠️ Error: '+(err&&err.message||err)); console.error(err); } };

/* ---- Return: single item or whole bundle (NADIR style) ---- */
// Return item — bottom sheet like reference: stepper, refund, mark as unpaid
window.returnItem=(saleId,ix)=>{
  const s=DB.sales.find(x=>x.id===saleId); if(!s) return;
  const its=saleItems(s), it=its[ix]; if(!it||!(it.qty>0)) return;
  const maxQ=it.qty, unit=it.price||0, R={n:maxQ};
  const tm=new Date(s.ts||Date.now());
  const tstr=tm.toLocaleTimeString('en-GB',{hour:'numeric',minute:'2-digit'});
  const paint=()=>{
    const inp=$('ret-n-in'); if(inp) inp.value=R.n;
    $('ret-refund').textContent=pkr(Math.round(R.n*unit*100)/100);
    $('ret-go').textContent=R.n>=maxQ?`Return all ${maxQ}`:`Return ${R.n} of ${maxQ}`;
    const mn=$('ret-minus'),pl=$('ret-plus');
    if(mn) mn.classList.toggle('off',R.n<=1);
    if(pl) pl.classList.toggle('off',R.n>=maxQ);
  };
  window.retStep=d=>retSet(R.n+d);
  window.retSet=v=>{ const want=parseInt(v)||1, w=$('ret-warn');
    if(w){ if(want>maxQ){ w.textContent='Only '+maxQ+' available'; w.classList.add('show'); }
      else { w.textContent=''; w.classList.remove('show'); } }
    R.n=Math.min(maxQ,Math.max(1,want)); paint(); };
  window.retGo=unpaid=>{ if(unpaid) markSaleUnpaid(saleId); else doReturn(saleId,ix,R.n); };
  window.retPaid=()=>sheetMarkPaid(saleId);
  const stepHtml=maxQ>1?`<div class="ret-card col"><div class="lbl-c">HOW MANY TO RETURN</div>
    <div class="ret-step"><button id="ret-minus" class="step-btn" onclick="retStep(-1)">−</button>
    <input id="ret-n-in" type="number" min="1" max="${maxQ}" value="${R.n}" oninput="retSet(this.value)">
    <button id="ret-plus" class="step-btn" onclick="retStep(1)">+</button></div>
    <div class="bun-warn" id="ret-warn"></div>
    <div class="sub-c">of ${maxQ} sold</div>
    <div class="ret-quick"><button class="chip-btn" onclick="retSet(1)">Return 1</button><button class="chip-btn" onclick="retSet(${maxQ})">Return all ${maxQ}</button></div></div>`:'';
  openSheet(`<h3>Return item <button class="link-btn" style="float:right" onclick="closeSheet()">Cancel</button></h3>
  <div class="ret-card"><div><b>${esc(it.name||s.name)}</b><div class="sub">${tstr} · Qty ${maxQ}</div></div><b>${pkr(unit*maxQ)}</b></div>
  ${stepHtml}
  <div class="ret-refund"><span>Refund</span><b id="ret-refund"></b></div>
  <p class="note">Returned quantity goes back into stock.</p>
  ${s.unpaid?'<button class="btn-paid" onclick="retPaid()">Mark as paid</button>':'<button class="btn-unpaid" onclick="retGo(true)">Mark as unpaid</button>'}
  <button class="btn-return" id="ret-go" onclick="retGo(false)"></button>`);
  paint();
};
function doReturn(saleId,ix,n){
  const s=DB.sales.find(x=>x.id===saleId); if(!s){ closeSheet(); return; }
  const its=saleItems(s), it=its[ix]; if(!it){ closeSheet(); return; }
  n=Math.min(Math.max(1,n||1),it.qty||1);
  const refund=Math.round(n*(it.price||0)*100)/100;
  const p=DB.products.find(x=>x.id===it.productId); if(p) p.qty+=n;   // back to stock
  let empty;
  if(s.items&&s.items.length){ it.qty-=n; if(it.qty<=0) s.items.splice(ix,1); empty=!s.items.length; }
  else { empty=((s.qty||0)-n)<=0; }
  s.qty=Math.max(0,(s.qty||0)-n);
  s.total=Math.round(((s.total||0)-refund)*100)/100;
  if(empty){ DB.sales=DB.sales.filter(x=>x.id!==saleId); DB.printQueue=DB.printQueue.filter(q=>q.saleId!==saleId); }
  else { const left=saleItems(s); s.name=left.length===1?left[0].name:(left.length+' items'); }
  save(); closeSheet(); renderSales(); renderStock(); if(typeof renderReport==='function') renderReport(); updatePrintBadge();
  toast('↩️ Returned '+n+' × '+(it.name||'')+' — back to stock');
}
function markSaleUnpaid(saleId){
  const s=DB.sales.find(x=>x.id===saleId); if(!s){ closeSheet(); return; }
  s.unpaid=true; save(); closeSheet(); renderSales();
  toast('\uD83D\uDD34 Marked as unpaid');
}
window.unmarkPaid=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s||!s.unpaid) return;
  confirmDlg('Mark as paid?','This sale will no longer show as unpaid.','PAID',()=>{
    s.unpaid=false; save(); renderSales(); toast('\u2705 Marked as paid');
  });
};
window.sheetMarkPaid=saleId=>{ const s=DB.sales.find(x=>x.id===saleId); if(!s||!s.unpaid) return;
  s.unpaid=false; save(); closeSheet(); renderSales(); toast('\u2705 Marked as paid'); };

/* ---- Return from bundle: checkbox select sheet (reference style) ---- */
window.returnSale=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s) return;
  if(s.items&&!s.items.length){
    DB.sales=DB.sales.filter(x=>x.id!==id); DB.printQueue=DB.printQueue.filter(q=>q.saleId!==id);
    save(); renderSales(); renderStock(); updatePrintBadge();
    toast('\u2705 Already returned \u2014 removed from history'); return; }
  const its=saleItems(s); if(!its.length||!its.some(it=>(it.qty||0)>0)){ toast('\u2705 Already returned'); return; }
  const sel=new Set(its.map((_,i)=>i));
  const rq=its.map(it=>it.qty||0);   // return-qty per item
  const paint=()=>{
    const refund=Math.round([...sel].reduce((tt,i)=>tt+(rq[i]*(its[i].price||0)),0)*100)/100;
    $('bun-count').textContent=sel.size+' of '+its.length+' selected';
    $('bun-toggle').textContent=sel.size===its.length?'Clear all':'Select all';
    const fullAll=its.every((it,i)=>sel.has(i)&&rq[i]>=(it.qty||0));
    $('bun-rlabel').textContent=fullAll?'Whole bundle':'Refund';
    $('bun-refund').textContent=pkr(refund);
    $('bun-note').textContent=sel.size?'Returned quantity goes back into stock.':"This sale isn't linked to an inventory item, so no stock will be restored.";
    const go=$('bun-go');
    go.textContent=fullAll?'Return whole bundle':'Return '+sel.size+' item'+(sel.size===1?'':'s');
    go.classList.toggle('off',!sel.size);
    its.forEach((it,i)=>{
      const c=$('bun-chk-'+i); if(c) c.classList.toggle('sel',sel.has(i));
      const on=sel.has(i);
      const r=$('bun-ret-'+i); if(r) r.style.display=(on&&(it.qty||0)>1)?'flex':'none';
      const ch=$('bun-chips-'+i); if(ch) ch.style.display=(on&&(it.qty||0)>1)?'flex':'none';
      const q=$('bun-q-'+i); if(q&&document.activeElement!==q) q.value=rq[i];
    });
  };
  window.bunTog=i=>{ if(sel.has(i)){sel.delete(i);}else{sel.add(i);rq[i]=its[i].qty||0;} paint(); };
  window.bunTogAll=()=>{ if(sel.size===its.length){sel.clear();}else{its.forEach((_,i)=>{sel.add(i);rq[i]=its[i].qty||0;});} paint(); };
  const setQ=(i,v)=>{ const max=its[i].qty||1, want=parseInt(v)||1, w=$('bun-w-'+i);
    if(w){ if(want>max){ w.textContent='Only '+max+' available'; w.classList.add('show'); }
      else { w.textContent=''; w.classList.remove('show'); } }
    rq[i]=Math.min(Math.max(1,want),max); paint(); };
  window.bunMinus=i=>setQ(i,rq[i]-1);
  window.bunPlus=i=>setQ(i,rq[i]+1);
  window.bunSet=(i,v)=>setQ(i,v);
  window.bunOne=i=>setQ(i,1);
  window.bunAll=i=>setQ(i,its[i].qty||1);
  window.bunGo=()=>{ const list=[...sel].map(i=>({ix:i,n:rq[i]})).filter(x=>x.n>0); if(!list.length) return; doReturnBundle(id,list); };
  window.bunUnpaid=()=>markSaleUnpaid(id);
  window.bunPaid=()=>sheetMarkPaid(id);
  openSheet(`<h3>Return from bundle <button class="link-btn" style="float:right" onclick="closeSheet()">Cancel</button></h3>
  <div class="bun-head"><div style="display:flex;align-items:center;gap:10px"><span class="bun-ico">\uD83D\uDCE6</span><span>Bundle \u00B7 ${its.length} items</span></div><b>${pkr(s.total)}</b></div>
  <div class="bun-selrow"><span id="bun-count"></span><button class="link-btn" id="bun-toggle" onclick="bunTogAll()"></button></div>
  <div class="ret-card col bun-list">${its.map((it,i)=>`
    <div class="bun-item"><div class="bun-top" onclick="bunTog(${i})"><span class="bun-check sel" id="bun-chk-${i}">\u2713</span>
    <div class="bun-nm">${esc(it.name||s.name)}<div class="sub">Qty ${it.qty}</div></div><b>${pkr(Math.round(it.qty*(it.price||0)*100)/100)}</b></div>
    ${(it.qty||0)>1?`<div class="bun-ret" id="bun-ret-${i}">
      <span class="lbl">Returning</span>
      <button class="mini-btn" onclick="bunMinus(${i})">\u2212</button>
      <input class="bun-qty-in" id="bun-q-${i}" type="number" min="1" max="${it.qty}" value="${it.qty}" oninput="bunSet(${i},this.value)">
      <button class="mini-btn" onclick="bunPlus(${i})">+</button></div>
    <div class="bun-warn" id="bun-w-${i}"></div>
    <div class="ret-quick" id="bun-chips-${i}" style="justify-content:flex-start">
      <button class="chip-btn" onclick="bunOne(${i})">Return 1</button>
      <button class="chip-btn fill" onclick="bunAll(${i})">Return all ${it.qty}</button></div>`:''}
    </div>`).join('')}</div>
  <div class="ret-refund"><span id="bun-rlabel">Whole bundle</span><b id="bun-refund"></b></div>
  <p class="note" id="bun-note"></p>
  ${s.unpaid?'<button class="btn-paid" onclick="bunPaid()">Mark bundle as paid</button>':'<button class="btn-unpaid" onclick="bunUnpaid()">Mark bundle as unpaid</button>'}
  <button class="btn-return" id="bun-go" onclick="bunGo()"></button>`);
  paint();
};
function doReturnBundle(saleId,list){
  const s=DB.sales.find(x=>x.id===saleId); if(!s){ closeSheet(); return; }
  // Already fully returned (empty items from an earlier return) -> remove, never touch stock again
  if(s.items&&!s.items.length){
    DB.sales=DB.sales.filter(x=>x.id!==saleId); DB.printQueue=DB.printQueue.filter(q=>q.saleId!==saleId);
    save(); closeSheet(); renderSales(); renderStock(); updatePrintBadge();
    toast('\u2705 Already returned \u2014 cleaned up'); return;
  }
  const its=saleItems(s);
  let refund=0;
  [...list].sort((a,b)=>b.ix-a.ix).forEach(o=>{
    const it=its[o.ix]; if(!it||!(it.qty>0)) return;
    const n=Math.min(Math.max(1,o.n||1),it.qty||1);
    refund=Math.round((refund+n*(it.price||0))*100)/100;
    const pr=DB.products.find(x=>x.id===it.productId); if(pr) pr.qty+=n;
    if(s.items&&s.items.length){ it.qty-=n; if(it.qty<=0) s.items.splice(o.ix,1); }
    else { s.qty=Math.max(0,(s.qty||0)-n); }
  });
  s.total=Math.round(Math.max(0,(s.total||0)-refund)*100)/100;
  let gone=false;
  if(s.items){
    const left=s.items.filter(it=>(it.qty||0)>0);
    s.items=left;
    s.qty=left.reduce((tt,it)=>tt+(it.qty||0),0);
    if(left.length===1) s.name=left[0].name;
    else if(left.length>1) s.name=left.length+' items';
    else gone=true;
  } else if((s.qty||0)<=0){ gone=true; }
  if(gone){ DB.sales=DB.sales.filter(x=>x.id!==saleId); DB.printQueue=DB.printQueue.filter(q=>q.saleId!==saleId); }
  save(); closeSheet(); renderSales(); renderStock(); if(typeof renderReport==='function') renderReport(); updatePrintBadge();
  toast('\u21A9\uFE0F Returned '+list.length+' item(s) \u2014 back to stock');
}


$('btn-exp-add').onclick=()=>{
  const a=Math.max(0,parseFloat($('exp-amt').value)||0);
  if(!a){ toast('Enter amount'); return; }
  const ed=$('exp-date').value||dstr();
  DB.expenses.push({id:DB.seq.e++, title:$('exp-title').value.trim()||'Expense', amount:a, date:ed, ts:new Date(ed+'T12:00').getTime()});
  save(); $('exp-title').value=''; $('exp-amt').value=''; renderSales(); toast('✅ Expense added (-'+pkr(a)+')');
};
$('day-prev').onclick=()=>{ const d=new Date(saleDay+'T12:00'); d.setDate(d.getDate()-1); saleDay=dstr(d); renderDaySales(); };
$('day-next').onclick=()=>{ const d=new Date(saleDay+'T12:00'); d.setDate(d.getDate()+1); if(dstr(d)>dstr()){toast('Future date not allowed');return;} saleDay=dstr(d); renderDaySales(); };
$('sales-day-title').onclick=()=>openDatePicker('day-jump');
$('day-jump').onchange=e=>{ if(e.target.value){ saleDay=e.target.value; renderDaySales(); } };
let expSaleId=null;
window.toggleSaleExp=id=>{ expSaleId=(expSaleId===id?null:id); renderDaySales(); };
let expExpId=null;
window.toggleExp=id=>{ expExpId=(expExpId===id?null:id); renderDaySales(); };
/* ---- Expense history: edit + return (like sale/wholesale) ---- */
window.editExpense=id=>{
  const e=DB.expenses.find(x=>x.id===id); if(!e) return;
  openSheet(`<h3>✏️ Edit expense</h3>
    <div class="fld"><span class="fld-lbl">Title</span><div class="fld-in"><input id="ee-title" value="${esc(e.title||'')}" maxlength="60"></div></div>
    <div class="fld"><span class="fld-lbl">Amount</span><div class="fld-in"><input id="ee-amt" type="number" min="0" inputmode="decimal" value="${e.amount||0}"><span class="pkr" data-cur>PKR</span></div></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Back</button><button class="btn-go" onclick="saveEditExpense(${id})">Save</button></div>`);
};
window.saveEditExpense=id=>{
  const e=DB.expenses.find(x=>x.id===id); if(!e) return;
  e.title=$('ee-title').value.trim()||'Expense';
  e.amount=Math.max(0,parseFloat($('ee-amt').value)||0);
  save(); closeSheet(); renderSales(); toast('✅ Expense updated');
};
window.returnExpense=id=>{
  const e=DB.expenses.find(x=>x.id===id); if(!e) return;
  openSheet(`<h3>⤺ Return expense</h3>
    <div class="sub" style="margin-bottom:10px">Remove <b>${esc(e.title)}</b> (${pkr(e.amount)}) from expenses? The money came back.</div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Back</button><button class="btn-go" onclick="doReturnExpense(${id})">Return</button></div>`);
};
window.doReturnExpense=id=>{
  const i=DB.expenses.findIndex(x=>x.id===id); if(i<0) return;
  DB.expenses.splice(i,1); expExpId=null; save(); closeSheet(); renderSales(); toast('✅ Expense returned');
};
function hhmm(ts){ try{ return new Date(ts).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); }catch(e){ return ''; } }
function saleItems(s){ return (s.items&&s.items.length)?s.items:[{qty:s.qty||0,price:(s.total||0)/Math.max(1,s.qty||1),name:s.name,productId:s.productId}]; }
let fPaid='all', fType='all', fQ='';
function paintFPills(){
  const b1=$('f-paid'), b2=$('f-type');
  if(b1){ b1.innerHTML=(fPaid==='all'?'All':fPaid==='paid'?'Paid':'Unpaid')+' \u25BE'; b1.classList.toggle('on',fPaid!=='all'); }
  if(b2){ const lbl={all:'Type',sale:'🛒 Sale',wholesale:'🏪 Wholesale',expense:'📋 Expense'}[fType]; b2.innerHTML=lbl+' \u25BE'; b2.classList.toggle('on',fType!=='all'); }
}
window.openPaidFilter=()=>{
  const all=DB.sales.filter(s=>s.date===saleDay);
  const nP=all.filter(s=>!s.unpaid).length, nU=all.filter(s=>s.unpaid).length;
  const row=(v,lbl,n)=>`<div class="cur-row${fPaid===v?' sel':''}" onclick="setPaidFilter('${v}')"><div style="flex:1"><b>${lbl}</b> <span class="sub">(${n})</span></div><div>${fPaid===v?'🟢':'\u26AA'}</div></div>`;
  openSheet(`<h3>Payment <button class="link-btn" style="float:right" onclick="closeSheet()">Done</button></h3>`+row('all','All',all.length)+row('paid','Paid',nP)+row('unpaid','Unpaid',nU));
};
window.setPaidFilter=v=>{ fPaid=v; paintFPills(); closeSheet(); renderDaySales(); };
window.openTypeFilter=()=>{
  const row=(v,lbl)=>`<div class="cur-row${fType===v?' sel':''}" onclick="setTypeFilter('${v}')"><div style="flex:1"><b>${lbl}</b></div><div>${fType===v?'🟢':'\u26AA'}</div></div>`;
  openSheet(`<h3>Record type <button class="link-btn" style="float:right" onclick="closeSheet()">Done</button></h3>`+row('all','All')+row('sale','🛒 Sale')+row('wholesale','🏪 Wholesale')+row('expense','📋 Expense'));
};
window.setTypeFilter=v=>{ fType=v; paintFPills(); closeSheet(); renderDaySales(); };
const _fp=$('f-paid'); if(_fp) _fp.onclick=openPaidFilter;
const _ft=$('f-type'); if(_ft) _ft.onclick=openTypeFilter;
const _fsb=$('f-search-btn'); if(_fsb) _fsb.onclick=()=>{ const r=$('day-search-row'); r.classList.toggle('hidden'); const i=$('day-search'); if(!r.classList.contains('hidden')) setTimeout(()=>i.focus(),100); else { i.value=''; fQ=''; renderDaySales(); } };
const _ds=$('day-search'); if(_ds) _ds.oninput=e=>{ fQ=e.target.value.toLowerCase(); renderDaySales(); };
function renderDaySales(){
  paintFPills();
  let list=DB.sales.filter(s=>s.date===saleDay);
  if(fPaid==='paid') list=list.filter(s=>!s.unpaid);
  else if(fPaid==='unpaid') list=list.filter(s=>s.unpaid);
  if(fType==='sale') list=list.filter(s=>s.kind!=='wholesale');
  else if(fType==='wholesale') list=list.filter(s=>s.kind==='wholesale');
  else if(fType==='expense') list=[];
  const fq=fQ.trim();
  if(fq){ const m=fq.match(/^id\s*0*(\d+)$/); const eid=m?parseInt(m[1],10):(/^\d+$/.test(fq)?parseInt(fq,10):null);
    const exact=eid!=null?list.filter(s=>s.id===eid):[];
    const rest=list.filter(s=>exact.indexOf(s)<0).filter(s=>(((s.customer||'')+' '+(s.phone||'')+' '+(s.name||'')+' '+s.id+' id'+s.id+' '+saleItems(s).map(it=>it.name||'').join(' '))).toLowerCase().includes(fq));
    list=exact.concat(rest).sort((a,b)=>(exact.indexOf(b)-exact.indexOf(a))||(b.id-a.id)); }
  list=list.sort((a,b)=>b.id-a.id);
  let exps=DB.expenses.filter(e=>e.date===saleDay).sort((a,b)=>b.id-a.id);
  if(fType==='sale'||fType==='wholesale') exps=[];
  if(fq) exps=exps.filter(e=>(e.title||'').toLowerCase().includes(fq));
  const dlbl=saleDay===dstr()?'Today':fmtDate(saleDay);
  $('sales-day-title').textContent=dlbl+' · '+list.length+' sales';
  const saleRows=list.map(s=>{
    const its=saleItems(s), open=expSaleId===s.id;
    const sub=its.length>1?its.length+' items':'× '+s.qty;
    const lineP=it=>saleLineProfit(s,it,its);
    const hasCost=its.some(it=>it.cost!=null);
    const posP=hasCost?its.reduce((a,it)=>a+Math.max(0,lineP(it)),0):0;
    const negL=hasCost?its.reduce((a,it)=>a+Math.max(0,-lineP(it)),0):0;
    const sDisc=(s.discount||0), sCorr=(s.correctTotal!=null?s.correctTotal:s.total);
    const miniPL=hasCost?((its.some(it=>lineP(it)>0)?'<span class="mpl mp-pos" title="Profit">▲</span>':'')+(its.some(it=>lineP(it)<0)?'<span class="mpl mp-neg" title="Loss">▼</span>':'')):'';
    const det=open?`<div class="sale-det">`+its.map((it,ix)=>{
      const lp=hasCost?lineP(it):0;
      return `
      <div class="sdet-row"><div><b>${esc(it.name||s.name)}</b>${hasCost&&lineP(it)<0?'<span class="loss-tag">▼ LOSS</span>':''}${hasCost&&lineP(it)>0?'<span class="profit-tag">▲ PROFIT</span>':''}<div class="sub">${it.qty} × ${pkr(it.price)}</div></div>
      <div class="sdet-r"><div style="text-align:right"><b>${pkr(it.qty*it.price)}</b>
      ${hasCost&&lp!==0?`<div class="${lp>0?'lp-pos':'lp-neg'}">${lp>0?'+':'\u2212'} ${pkr(Math.abs(lp))}</div>`:''}</div>
      <button class="ret-one" onclick="event.stopPropagation();returnItem(${s.id},${ix})" title="Return item">⤺</button></div></div>`;}).join('')+
      (sDisc>0.005?`<div class="sdet-row"><div><b>Total</b></div><div class="sdet-r"><b>${pkr(sCorr)}</b></div></div><div class="sdet-row"><div><b>Discount</b></div><div class="sdet-r"><b style="color:var(--green)">− ${pkr(sDisc)}${(()=>{const dp=discPctLbl(s);return dp?' - '+dp:'';})()}</b></div></div>`:'')+(hasCost?`<div class="pl-row"><span class="pl-pos${posP>0?'':' dim'}">💰 Profit: ${pkr(posP)}</span><span class="pl-neg${negL>0?'':' dim'}">📉 Loss: ${pkr(negL)}</span></div>`:'')+
      `<button class="edit-sale-btn" onclick="event.stopPropagation();editSale(${s.id})">✏️ Edit sale</button>
   ${(s.discount||0)>0.005?(()=>{const dp=discPctLbl(s);return `<div class="disc-badge">🏷️ Discount: ${pkr(s.discount)}${dp?' - '+dp:''}</div>`;})():''}
      <button class="return-bundle" onclick="event.stopPropagation();returnSale(${s.id})">Return Bundle</button>
       <div class="bill-btns"><button class="bill-btn bill-print" onclick="event.stopPropagation();printSale(${s.id})"><span class="bi">🖨️</span><span>Print</span></button><button class="bill-btn bill-pdf" onclick="event.stopPropagation();shareBillPDF(${s.id})"><span class="bi">📄</span><span>PDF bill</span></button><button class="bill-btn bill-img" onclick="event.stopPropagation();shareBillImage(${s.id})"><span class="bi">🖼️</span><span>Send image</span></button></div></div>`:'';
    return `<div class="sale-card${open?' open':''}"><div class="sale-top" onclick="toggleSaleExp(${s.id})">
      <div style="flex:1;min-width:0"><div class="d">${esc(s.name)}${s.kind==='wholesale'?'<span class="ws-pill">🏪 Wholesale</span>':'<span class="sl-pill">🛒 Sale</span>'}${s.unpaid?`<span class="unpaid-pill" onclick="event.stopPropagation();unmarkPaid(${s.id})">Unpaid</span>`:''}<span class="t">${hhmm(s.ts)}</span></div>
      <div class="sub"><span class="id-box">ID${s.id}</span> ${sub}${s.customer?' · '+esc(s.customer):''}${miniPL}</div></div>
      <div class="a">${pkr(s.total)}</div><div class="xarw">${open?'▲':'▼'}</div></div>${det}</div>`;
  }).join('');
  const expRows=exps.map(e=>{
    const open=expExpId===e.id;
    const det=open?`<div class="sale-det">
      <button class="edit-sale-btn" onclick="event.stopPropagation();editExpense(${e.id})">✏️ Edit expense</button>
      <button class="return-bundle" onclick="event.stopPropagation();returnExpense(${e.id})">⤺ Return expense</button></div>`:'';
    return `<div class="sale-card exp-card${open?' open':''}"><div class="sale-top" onclick="toggleExp(${e.id})">
      <div style="flex:1;min-width:0"><div class="d">${esc(e.title)}<span class="ex-pill">📋 Expense</span><span class="t">${e.ts?hhmm(e.ts):''}</span></div>
      <div class="sub"><span class="id-box">ID${e.id}</span></div></div>
      <div class="a">${pkrMinus(e.amount)}</div><div class="xarw">${open?'▲':'▼'}</div></div>${det}</div>`; }).join('');
  $('sales-day-list').innerHTML=(saleRows+expRows)||'<p class="note" style="color:#fff">No records this day</p>';
}

/* ================= EDIT SALE ================= */
let esItems=[];
window.editSale=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s) return;
  esItems=saleItems(s).map(it=>({productId:it.productId,name:it.name||s.name,qty:it.qty,rate:it.price,cost:it.cost}));
  openSheet(`<h3>✏️ Edit sale</h3>
    <div id="es-items"></div>
    <div class="search-wrap">🔍 <input id="es-psearch" placeholder="Add product..."></div>
    <div id="es-pick-list"></div>
    <div class="fld"><span class="fld-lbl">Total</span><div class="fld-in"><input id="es-total" type="number" min="0" inputmode="decimal"><span class="pkr" data-cur>PKR</span></div></div>
    <div id="es-disc-pill"></div>
    <div class="two-col">
    <div class="fld"><span class="fld-lbl">Discount Amount</span><div class="fld-in"><input id="es-disc-amt" type="number" min="0" inputmode="decimal" placeholder="0" autocomplete="off"><span class="pkr" data-cur>PKR</span></div></div>
    <div class="fld"><span class="fld-lbl">Discount %</span><div class="fld-in"><input id="es-disc-pct" type="number" min="0" max="100" inputmode="decimal" placeholder="0" autocomplete="off"><span class="pkr">%</span></div></div>
    </div>
    <div id="es-profit-row" class="sub" style="margin:4px 0"></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Back</button><button class="btn-go" onclick="saveEditSale(${id})">Save</button></div>`);
  { const _esSub=esTotal();
    const _d=Math.min(s.discount||0,_esSub);
    esDiscPct=_esSub>0?(_d/_esSub*100):0;
    setupDiscInputs('es');
    const _ae=$('es-disc-amt'), _pe=$('es-disc-pct');
    if(_ae) _ae.value=_d||'';
    if(_pe) _pe.value=esDiscPct?+esDiscPct.toFixed(2):'';
    $('es-total').value=Math.max(0,_esSub-_d).toFixed(0); }
  paintEsDisc(); paintEsProfit();
  $('es-total').oninput=()=>{ discSyncFromTotal('es'); };
  renderEsItems();
  $('es-psearch').oninput=e=>renderEsPick(e.target.value.toLowerCase().trim());
};
function esTotal(){ return esItems.reduce((s,l)=>s+l.qty*l.rate,0); }
function renderEsItems(){
  const box=$('es-items'); if(!box) return;
  box.innerHTML=esItems.length?'<div class="cart-box">'+esItems.map((l,ix)=>`
    <div class="cart-row"><div style="flex:1;min-width:0"><b>${esc(l.name)}</b>
      <div class="sub"><div class="cart-step"><button class="mini-btn" onclick="esStep(${ix},-1)">\u2212</button><b>${l.qty}</b><button class="mini-btn" onclick="esStep(${ix},1)">+</button></div></div></div>
      <div class="fld-in" style="width:110px"><input type="number" min="0" value="${l.rate}" oninput="esRate(${ix},this.value)"><span class="pkr" data-cur>${curCode()}</span></div>
      <button class="cart-x" onclick="esRm(${ix})">\u2715</button></div>`).join('')+
    `<div class="cart-total"><span>Items total</span><b>${pkr(esTotal())}</b></div></div>`
    :'<p class="note">No items.</p>';
  $('es-total').value=esTotal().toFixed(0);
}
function paintEsTotals(){ const t=$('es-items'); if(!t) return;
  const el=t.querySelector('.cart-total b'); if(el) el.textContent=pkr(esTotal());
  const tt=$('es-total'); if(tt) tt.value=esTotal().toFixed(0); paintEsDisc(); paintEsProfit(); }
function paintEsDisc(){ const box=$('es-disc-pill'); if(!box) return;
  const sub=esTotal(), bill=parseFloat(($('es-total')||{}).value)||0;
  const d=(bill>0&&sub>bill)?sub-bill:0;
  box.innerHTML=d>0?`<span class="disc-pill">✓ ${pkr(d)} discount applied</span>`:''; }
function paintEsProfit(){ const box=$('es-profit-row'); if(!box) return;
  const bill=parseFloat(($('es-total')||{}).value)||0;
  const tc=esItems.reduce((a,l)=>{ const p=DB.products.find(x=>x.id===l.productId); return a+(l.qty||0)*(p?p.cost:(l.cost||0)); },0);
  const pf=Math.round((bill-tc)*100)/100;
  box.innerHTML=`Profit: <b style="color:${pf<0?'var(--red)':'var(--green)'}">${pkr(pf)}</b> <span class="sub">(Stock cost: ${pkr(tc)})</span>`; }
window.esStep=(ix,d)=>{ const l=esItems[ix]; if(!l) return; l.qty=Math.max(1,l.qty+d); renderEsItems(); reapplyDisc('edit'); };
window.esRate=(ix,v)=>{ const l=esItems[ix]; if(!l) return; l.rate=Math.max(0,parseFloat(v)||0); paintEsTotals(); reapplyDisc('edit'); };
window.esRm=ix=>{ esItems.splice(ix,1); renderEsItems(); reapplyDisc('edit'); };
function renderEsPick(q){
  const box=$('es-pick-list'); if(!box) return;
  if(!q){ box.innerHTML=''; return; }
  const list=DB.products.filter(p=>pmatch(p,q)).slice(0,6);
  box.innerHTML=list.map(p=>`
    <div class="pick-item" onclick="pickEsItem(${p.id})">
      ${pimg(p,'pick-img')}<div><b>${esc(p.name)}</b><div class="sub">Sell ${pkr(p.sell)} \u00B7 ${stockLbl(p)}</div></div>
    </div>`).join('')||'<p class="note">No product found</p>';
}
window.pickEsItem=id=>{ const p=DB.products.find(x=>x.id===id); if(!p) return;
  const ex=esItems.find(x=>x.productId===id);
  if(ex) ex.qty++; else esItems.push({productId:id,name:p.name,qty:1,rate:p.sell,cost:p.cost});
  $('es-psearch').value=''; renderEsPick(''); renderEsItems(); reapplyDisc('edit');
  toast('\u2705 Added: '+p.name); };
window.saveEditSale=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s) return;
  if(!esItems.length){ toast('Add at least one item'); return; }
  const oldIts=saleItems(s);
  const effAvail=pid=>{ const p=DB.products.find(x=>x.id===pid); if(!p) return 1e9;
    return p.qty+oldIts.filter(l=>l.productId===pid).reduce((a,l)=>a+(l.qty||0),0); };
  for(const l of esItems){ if(l.qty>effAvail(l.productId)){ toast('\u26A0\uFE0F Only '+effAvail(l.productId)+' "'+l.name+'" in stock!'); return; } }
  for(const l of oldIts){ const p=DB.products.find(x=>x.id===l.productId); if(p) p.qty+=(l.qty||0); }
  for(const l of esItems){ const p=DB.products.find(x=>x.id===l.productId); if(p) p.qty-=l.qty; }
  let total=parseFloat($('es-total').value); if(!(total>0)) total=esTotal();
  const esCostOf=l=>{ const p=DB.products.find(x=>x.id===l.productId); return p?p.cost:(l.cost||0); };
  const esTC=Math.round(esItems.reduce((a,l)=>a+(l.qty||0)*esCostOf(l),0)*100)/100;
  const goEs=()=>{
    s.items=esItems.map(l=>{ const p=DB.products.find(x=>x.id===l.productId);
      return {productId:l.productId,name:l.name,qty:l.qty,price:l.rate,cost:p?p.cost:(l.cost||0)}; });
    s.qty=s.items.reduce((a,i)=>a+i.qty,0);
    s.total=Math.round(total*100)/100;
    const esSub=Math.round(esTotal()*100)/100;
    s.correctTotal=esSub;
    s.discount=Math.max(0,Math.round((esSub-s.total)*100)/100);
  s.name=s.items.length===1?s.items[0].name:(s.items.length+' items');
    save(); renderStock(); renderSales(); closeSheet(); toast('\u2705 Sale updated');
  };
  const esRateLoss=esItems.filter(l=>l.rate<esCostOf(l));
  const esBillLoss=total<esTC;
  if(esRateLoss.length||esBillLoss){
    const cmsg='Cost total (stock): '+pkr(esTC)+'<br>Your total: '+pkr(total)+'<br><br>Save this edit at a loss?';
    lossConfirm('edit sale',esRateLoss.length?esRateLoss.map(l=>({name:l.name,unit:l.rate,cost:esCostOf(l)})):esItems.map(l=>({name:l.name,unit:l.rate,cost:esCostOf(l)})),goEs,cmsg);
  } else goEs();
};

/* ================= STOCK ================= */
let stockF='all', stockQ='';
document.querySelectorAll('#stock-chips .chip').forEach(c=>c.onclick=()=>{
  document.querySelectorAll('#stock-chips .chip').forEach(x=>x.classList.remove('active'));
  c.classList.add('active'); stockF=c.dataset.f; renderStock();
});
$('stock-search').oninput=e=>{ stockQ=e.target.value.toLowerCase(); renderStock(); };
function stockBadge(p){ if(p.qty<=0) return '<span class="badge out">OUT</span>'; if(p.qty<=5) return '<span class="badge low">Low</span>'; return ''; }
const STOCK_SORTS=[
 {id:'date',t:'Date added',s:'Newest first',ic:'🕐'},
 {id:'name-az',t:'Name',s:'A \u2192 Z',ic:'🔤'},
 {id:'name-za',t:'Name',s:'Z \u2192 A',ic:'🔤'},
 {id:'qty-hl',t:'Quantity',s:'High \u2192 low',ic:'📦'},
 {id:'qty-lh',t:'Quantity',s:'Low \u2192 high',ic:'📦'},
 {id:'cost-hl',t:'Cost price',s:'High \u2192 low',ic:'💰'},
 {id:'cost-lh',t:'Cost price',s:'Low \u2192 high',ic:'💰'}];
let stockSortBy='date', tmpSortBy='date', tmpStockF='all';
window.openStockSortSheet=()=>{ tmpSortBy=stockSortBy; tmpStockF=stockF; openSheet(sfSheetHTML()); paintSF(); };
function sfSheetHTML(){ return `<div class="sheet-head"><b style="font-size:18px">Sort &amp; Filter</b><button class="sf-reset" onclick="resetStockSF()">Reset</button></div>
 <div class="sf-lbl">SORT BY</div><div class="sf-list">`+STOCK_SORTS.map(o=>`<button class="sf-row" data-s="${o.id}" onclick="pickSFSort('${o.id}')"><span class="sf-ric">${o.ic}</span><span class="sf-rt"><span class="sf-t">${o.t}</span><span class="sf-s">${o.s}</span></span><span class="sf-tick">\u2713</span></button>`).join('')+`</div>
 <div class="sf-lbl">SHOW</div><div class="sf-shows">`+[['all','All'],['in','In stock'],['low','Low stock'],['out','Out of stock']].map(x=>`<button class="sf-show" data-f="${x[0]}" onclick="pickSFShow('${x[0]}')">${x[1]}</button>`).join('')+`</div>
 <div class="sf-btns"><button class="sf-cancel" onclick="closeSheet()">CANCEL</button><button class="sf-apply" onclick="applyStockSF()">APPLY</button></div>`; }
window.pickSFSort=id=>{ tmpSortBy=id; paintSF(); };
window.pickSFShow=f=>{ tmpStockF=f; paintSF(); };
window.resetStockSF=()=>{ tmpSortBy='date'; tmpStockF='all'; paintSF(); };
function paintSF(){ document.querySelectorAll('.sf-row').forEach(b=>b.classList.toggle('sel',b.dataset.s===tmpSortBy));
 document.querySelectorAll('.sf-show').forEach(b=>b.classList.toggle('sel',b.dataset.f===tmpStockF)); }
window.applyStockSF=()=>{ stockSortBy=tmpSortBy; stockF=tmpStockF; syncStockChips(); renderStock(); closeSheet(); };
function syncStockChips(){ document.querySelectorAll('#stock-chips .chip').forEach(ch=>ch.classList.toggle('active',ch.dataset.f===stockF)); }
function stockStatus(p){ return p.qty<=0?'out':(p.qty<=5?'low':'in'); }
function renderStock(){
  const cost=DB.products.reduce((s,p)=>s+p.qty*p.cost,0);
  const units=DB.products.reduce((s,p)=>s+p.qty,0);
  $('st-cost').textContent=pkr(cost); $('st-count').textContent=units+' items';
  const cAll=DB.products.length, cIn=DB.products.filter(p=>p.qty>5).length, cLow=DB.products.filter(p=>p.qty>0&&p.qty<=5).length, cOut=DB.products.filter(p=>p.qty<=0).length;
  const chips=document.querySelectorAll('#stock-chips .chip');
  chips[0].textContent='All ('+cAll+')'; chips[1].textContent='In stock ('+cIn+')'; chips[2].textContent='Low ('+cLow+')'; chips[3].textContent='Out ('+cOut+')';
  let list=DB.products.filter(p=>p.name.toLowerCase().includes(stockQ)||String(p.itemId).includes(stockQ)||(p.brand||'').toLowerCase().includes(stockQ));
  if(stockF==='in') list=list.filter(p=>p.qty>5);
  if(stockF==='low') list=list.filter(p=>p.qty>0&&p.qty<=5);
  if(stockF==='out') list=list.filter(p=>p.qty<=0);
  const by=stockSortBy;
  if(by==='date') list=[...list].sort((a,b)=>(b.id||0)-(a.id||0));
  else if(by==='name-az') list=[...list].sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  else if(by==='name-za') list=[...list].sort((a,b)=>(b.name||'').localeCompare(a.name||''));
  else if(by==='qty-hl') list=[...list].sort((a,b)=>(b.qty||0)-(a.qty||0));
  else if(by==='qty-lh') list=[...list].sort((a,b)=>(a.qty||0)-(b.qty||0));
  else if(by==='cost-hl') list=[...list].sort((a,b)=>(b.cost||0)-(a.cost||0));
  else if(by==='cost-lh') list=[...list].sort((a,b)=>(a.cost||0)-(b.cost||0));
  $('stock-list').innerHTML=list.map(p=>{
    const st=stockStatus(p);
    const lbl=st==='out'?'OUT OF STOCK':(st==='low'?'LOW STOCK':'IN STOCK');
    const pill=st==='out'?'<span class="st-pill out">OUT</span>':(st==='low'?'<span class="st-pill low">LOW</span>':'');
    return `<div class="stock-card ${st}" onclick="stockDetail(${p.id})">
      <div class="sc-idrow"><span class="sc-brand">${esc(p.brand||'\u2014')} \u00B7 #${p.itemId}</span>${pill}</div>
      <div class="sc-main">${pimg(p)}
        <div class="sc-info"><div class="sc-name">${esc(p.name)}</div>
          <div class="sc-prices">Cost <b>${pkr(p.cost)}</b> \u00B7 Sell <b>${pkr(p.sell)}</b> <span class="sub">/${esc(p.unit)}</span></div>
        </div>
        <div class="sc-qty ${st}"><b>${p.qty}</b><span>${lbl}</span></div>
        <span class="sc-chev">\u203A</span>
      </div></div>`; }).join('')||'<p class="note" style="color:#fff">No items</p>';
}


window.stockDetail=id=>{
  const p=DB.products.find(x=>x.id===id); if(!p) return;
  openSheet(`<div class="sheet-head"><button class="link-btn" onclick="closeSheet()">Cancel</button><b>Item</b><span style="width:52px"></span></div>
    <div class="ret-card"><div style="display:flex;gap:12px;align-items:center;flex:1">${pimg(p)}
      <div style="min-width:0"><span class="sc-brand">${esc(p.brand||'\u2014')} \u00B7 #${p.itemId}</span>
      <div class="sc-name" style="margin:4px 0 2px">${esc(p.name)}</div>
      <div class="sub">${p.qty} in stock \u00B7 ${pkr(p.cost)} avg cost</div></div></div></div>
    <div class="ret-card col act-list">
      <button class="act-row" onclick="addStockSheet(${p.id})"><span class="act-ico">\u2295</span><b>Add stock</b><span class="sc-chev">\u203A</span></button>
      <button class="act-row" onclick="editProduct(${p.id})"><span class="act-ico">\u270E</span><b>Edit item details</b><span class="sc-chev">\u203A</span></button>
      <button class="act-row danger" onclick="delProduct(${p.id})"><span class="act-ico red">${TRASH}</span><b>Delete item</b><span class="sc-chev">\u203A</span></button>
    </div>`);
};

/* ---- Add stock sheet (reference style) ---- */
window.addStockSheet=id=>{
  const p=DB.products.find(x=>x.id===id); if(!p) return;
  const A={n:1,cost:p.cost||0,sell:p.sell||0,showP:false,exp:false};
  const paint=()=>{
    const nIn=$('as-n'); if(nIn&&document.activeElement!==nIn) nIn.value=A.n;
    $('as-becomes').innerHTML='Stock becomes <b><u>'+((p.qty||0)+A.n)+' units</u></b>';
    $('as-go').textContent='Add '+A.n+' unit'+(A.n===1?'':'s');
    const batch=Math.round(A.cost*A.n*100)/100;
    $('as-eff').textContent=pkr(A.cost);
    $('as-batch').textContent=pkr(batch);
    $('as-exp-lbl').textContent='Also record '+pkr(batch)+' as an expense';
    $('as-prices').style.display=A.showP?'block':'none';
    $('as-pt').classList.toggle('open',A.showP);
    $('as-exp').classList.toggle('on',A.exp);
  };
  window.asStep=d=>{ A.n=Math.max(1,A.n+d); paint(); };
  window.asSet=v=>{ A.n=Math.max(1,parseInt(v)||1); paint(); };
  window.asAdd=v=>{ A.n+=v; paint(); };
  window.asPrices=()=>{ A.showP=!A.showP; paint(); };
  window.asCost=v=>{ A.cost=Math.max(0,parseFloat(v)||0); paint(); };
  window.asSell=v=>{ A.sell=Math.max(0,parseFloat(v)||0); };
  window.asExp=()=>{ A.exp=!A.exp; paint(); };
  window.asGo=()=>{
    p.qty=(p.qty||0)+A.n;
    if(A.showP){ p.cost=A.cost; p.sell=A.sell; }
    if(A.exp){ const amt=Math.round(A.cost*A.n*100)/100;
      DB.expenses.push({id:DB.seq.e++,title:'Stock: '+p.name+' (+'+A.n+')',amount:amt,date:dstr(),ts:Date.now()}); }
    save(); closeSheet(); renderStock(); if(typeof renderReport==='function') renderReport();
    toast('\u2705 Added '+A.n+' \u2014 stock now '+p.qty);
  };
  openSheet(`<h3>Add stock \u2014 ${esc(p.itemId)} <button class="link-btn" style="float:right" onclick="closeSheet()">Cancel</button></h3>
  <div class="ret-card col"><div class="lbl-c">HOW MANY ARRIVED</div>
    <div class="ret-step"><button class="step-btn" onclick="asStep(-1)">\u2212</button>
    <input id="as-n" type="number" min="1" value="1" oninput="asSet(this.value)" style="width:76px;text-align:center;font-size:34px;font-weight:800;border:none;background:transparent;color:#1c2733">
    <button class="step-btn" onclick="asStep(1)">+</button></div>
    <div class="ret-quick"><button class="chip-btn" onclick="asAdd(5)">+5</button><button class="chip-btn" onclick="asAdd(10)">+10</button><button class="chip-btn" onclick="asAdd(25)">+25</button></div>
    <div class="as-becomes" id="as-becomes"></div></div>
  <button class="price-toggle" id="as-pt" onclick="asPrices()"><span>Prices changed? Tap to update</span><span>\u203A</span></button>
  <div class="ret-card col" id="as-prices" style="display:none">
    <div class="lbl-c2">COST PRICE (${curCode()})</div><input id="as-cost" type="number" value="${p.cost||0}" oninput="asCost(this.value)">
    <div class="lbl-c2">SELLING PRICE (${curCode()})</div><input id="as-sell" type="number" value="${p.sell||0}" oninput="asSell(this.value)">
  </div>
  <div class="ret-card col"><div class="kv"><span>Effective cost / unit</span><b id="as-eff"></b></div>
  <div class="kv"><span>Batch cost</span><b id="as-batch"></b></div></div>
  <label class="exp-row"><span id="as-exp-lbl"></span><span class="switch" id="as-exp" onclick="asExp()"></span></label>
  <button class="btn-go" id="as-go" onclick="asGo()"></button>`);
  paint();
};

window.editProduct=id=>{
  const p=DB.products.find(x=>x.id===id); if(!p) return;
  const E={photo:p.image||null};
  window.epPick=inp=>{ readImg(inp.files[0],url=>{ if(url){ E.photo=url; $('ep-photo').innerHTML='<img src="'+url+'">'; } inp.value=''; }); };
  window.epSave=()=>{
    p.brand=$('ep-brand').value.trim(); p.name=$('ep-name').value.trim()||p.name;
    p.qty=Math.max(0,parseInt($('ep-qty').value)||0);
    p.cost=Math.max(0,parseFloat($('ep-cost').value)||0);
    p.sell=Math.max(0,parseFloat($('ep-sell').value)||0);
    p.tax=Math.max(0,parseFloat($('ep-tax').value)||0);
    p.image=E.photo;
    save(); closeSheet(); renderStock(); toast('\u2705 Updated');
  };
  window.epDel=()=>delProduct(p.id);
  const cc=curCode();
  openSheet(`<div class="edit-head"><button class="xh" onclick="closeSheet()">\u2715</button><b>EDIT ITEM</b><button class="xh" onclick="epDel()">${TRASH}</button></div>
  <div class="id-pill">ITEM ID&nbsp;&nbsp;<b>${esc(p.brand||'')} ${esc(p.itemId)}</b></div>
  <div class="photo-card" onclick="document.getElementById('ep-file').click()">
    <span id="ep-photo">${E.photo?'<img src="'+E.photo+'">':'<span style="font-size:40px">\uD83D\uDCC4</span>'}</span>
    <div class="sub">Tap to change photo</div></div>
  <input type="file" id="ep-file" accept="image/*" style="display:none" onchange="epPick(this)">
  <div class="white-card">
    <div class="lbl-c2">ITEM NAME</div><input id="ep-name" value="${esc(p.name)}">
    <div class="lbl-c2">BRAND</div><input id="ep-brand" value="${esc(p.brand||'')}">
    <div class="lbl-c2">QUANTITY</div><input id="ep-qty" type="number" value="${p.qty}">
    <div class="two-col"><div><div class="lbl-c2">COST PRICE</div><div class="in-suf"><input id="ep-cost" type="number" value="${p.cost}"><span>${cc}</span></div></div>
    <div><div class="lbl-c2">SELLING PRICE</div><div class="in-suf"><input id="ep-sell" type="number" value="${p.sell}"><span>${cc}</span></div></div></div>
    <div class="lbl-c2">TAX PERCENT</div><div class="in-suf"><input id="ep-tax" type="number" value="${p.tax||0}"><span>%</span></div>
    <div class="sub" id="ep-ctax" style="margin-top:8px"></div>
    <div class="note" style="margin-top:4px">\u24D8 Ignore taxes if already included in cost price.</div>
  </div>
  <div class="mrow"><button class="btn-cancel-red" onclick="closeSheet()">Cancel</button><button class="btn-go grow" onclick="epSave()">UPDATE</button></div>`);
  const upd=()=>{ const c=parseFloat($('ep-cost').value)||0, tx=parseFloat($('ep-tax').value)||0;
    $('ep-ctax').textContent='Cost + tax / unit: '+pkr(Math.round(c*(1+tx/100)*100)/100); };
  $('ep-cost').oninput=upd; $('ep-tax').oninput=upd; upd();
};

window.delProduct=id=>{ const p=DB.products.find(x=>x.id===id);
  if(!p) return;
  confirmDlg('Delete item?','Are you sure you want to delete "'+p.name+'"?','DELETE',()=>{
    DB.products=DB.products.filter(x=>x.id!==id); save(); closeSheet(); renderStock(); toast('Deleted'); }); };

/* ================= REPORT ================= */
let repY=new Date().getFullYear(), repM=new Date().getMonth(), chartMode='sales', repShowAll=false, repHalf=0;
const MNAME=['January','February','March','April','May','June','July','August','September','October','November','December'];
function renderReport(){
  $('period-txt').textContent=MNAME[repM].slice(0,3)+' '+repY;
  const sales=DB.sales.filter(s=>{ const d=new Date(s.ts); return d.getFullYear()===repY&&d.getMonth()===repM; });
  const prev=DB.sales.filter(s=>{ const d=new Date(s.ts); let pm=repM-1,py=repY; if(pm<0){pm=11;py--;} return d.getFullYear()===py&&d.getMonth()===pm; });
  const st=sales.reduce((a,s)=>a+s.total,0), pt=prev.reduce((a,s)=>a+s.total,0);
  const gross=sales.reduce((a,s)=>a+s.items.reduce((x,i)=>x+i.qty*((i.price||0)-(i.cost||0)),0),0);
  const pgross=prev.reduce((a,s)=>a+s.items.reduce((x,i)=>x+i.qty*((i.price||0)-(i.cost||0)),0),0);
  const pexp=DB.expenses.filter(e=>{ const d=new Date(e.ts); return d.getFullYear()===repY&&d.getMonth()===repM; }).reduce((a,e)=>a+e.amount,0);
  const ppexp=DB.expenses.filter(e=>{ const d=new Date(e.ts); let pm=repM-1,py=repY; if(pm<0){pm=11;py--;} return d.getFullYear()===py&&d.getMonth()===pm; }).reduce((a,e)=>a+e.amount,0);
  const profit=gross-pexp, prevProfit=pgross-ppexp;
  const prevShort=MNAME[(repM+11)%12].slice(0,3);
  const pct=(a,b)=>{ if(!b) return ''; const p=Math.round((a-b)/b*100); return (p>=0?'+':'')+p+'%'; };
  const setVs=(id,txt,up)=>{ const el=$(id); el.textContent=txt; el.classList.toggle('green-num',!!txt&&up); el.classList.toggle('red-num',!!txt&&!up); };
  // summary cards
  $('r-sales').textContent=pkr(st);
  const sv=pct(st,pt); setVs('r-vs',sv?sv+' vs '+prevShort:'',st>=pt);
  $('r-exp').textContent=pexp>0?pkrMinus(pexp):pkr(0);
  rProfitNp=Math.round(profit*100)/100; paintReportProfit();
  $('r-margin').textContent=st>0?Math.round(profit/st*100)+'% margin':'';
  const pv=pct(profit,prevProfit); setVs('r-vs-profit',pv&&prevProfit>0?pv+' vs '+prevShort:'',profit>=prevProfit);
  const wdays=new Set(sales.map(s=>s.date)).size;
  $('r-avg-num').textContent=pkr(wdays>0?Math.round(st/wdays*100)/100:0);
  $('r-avg-sub').textContent=sales.length+' sales · '+wdays+' working days';
  // trends chart (half-month)
  const dim=new Date(repY,repM+1,0).getDate();
  const d0=repHalf?16:1, d1=repHalf?dim:Math.min(15,dim);
  $('chart-month').textContent=MNAME[repM].slice(0,3)+' '+d0+' – '+d1+', '+repY;
  const byDay={}; sales.forEach(s=>{ const d=new Date(s.ts).getDate(); byDay[d]=byDay[d]||{s:0,p:0}; byDay[d].s+=s.total; byDay[d].p+=s.items.reduce((x,i)=>x+i.qty*((i.price||0)-(i.cost||0)),0); });
  const vals=[]; for(let d=d0;d<=d1;d++) vals.push(byDay[d]?((chartMode==='sales'?byDay[d].s:byDay[d].p)):0);
  const max=Math.max(1,...vals);
  const fmtK=v=>v>=1000?(Math.round(v/100)/10).toString().replace(/\.0$/,'')+'K':Math.round(v).toString();
  let bars=''; for(let d=d0;d<=d1;d++){ const v=byDay[d]; const val=v?(chartMode==='sales'?v.s:v.p):0; const h=Math.max(4,Math.round(val/max*110));
    bars+=`<div class="bar" style="height:${h}px"><span>${d}</span></div>`; }
  $('bar-chart').innerHTML=bars;
  $('chart-axis').innerHTML=`<span>${fmtK(max)}</span><span>${fmtK(max/2)}</span><span>0</span>`;
  // history by day
  const days={}; sales.forEach(s=>{ days[s.date]=days[s.date]||{total:0,profit:0}; days[s.date].total+=s.total; days[s.date].profit+=saleProfit(s); });
  const arr=Object.keys(days).sort().reverse();
  const show=repShowAll?arr:arr.slice(0,8);
  $('rep-history').innerHTML=show.map(ds=>{ const d=new Date(ds+'T12:00');
    const lbl=ds===dstr()?'Today · ':'';
    return `<div class="hist-row" onclick="dayDetail('${ds}')"><div><div class="d">${lbl}${d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</div>
    <div class="p">+ ${pkr(days[ds].profit)} profit</div></div><div class="a">${pkr(days[ds].total)}</div></div>`; }).join('')||'<p class="note" style="color:#fff">No sales this period</p>';
}
$('ch-sales').onclick=()=>{ chartMode='sales'; $('ch-sales').classList.add('active'); $('ch-profit').classList.remove('active'); renderReport(); };
$('ch-profit').onclick=()=>{ chartMode='profit'; $('ch-profit').classList.add('active'); $('ch-sales').classList.remove('active'); renderReport(); };
const toggleHistAll=()=>{ repShowAll=!repShowAll; $('rep-show-all').textContent=repShowAll?'Show less':'Show all'; renderReport(); const h=$('rep-history'); if(h) h.scrollIntoView({behavior:'smooth',block:'start'}); };
$('rep-show-all').onclick=toggleHistAll;
$('trend-detail').onclick=toggleHistAll;
window.trendNav=dir=>{ if(dir<0){ if(repHalf===1) repHalf=0; else{ repM--; if(repM<0){repM=11;repY--;} repHalf=1; } } else{ if(repHalf===0) repHalf=1; else{ repM++; if(repM>11){repM=0;repY++;} repHalf=0; } } renderReport(); };
$('trend-prev').onclick=()=>trendNav(-1);
$('trend-next').onclick=()=>trendNav(1);
$('btn-period').onclick=()=>{
  const months=MNAME.map((m,i)=>`<option value="${i}" ${i===repM?'selected':''}>${m}</option>`).join('');
  let years=''; for(let y=repY-3;y<=repY+1;y++) years+=`<option ${y===repY?'selected':''}>${y}</option>`;
  openSheet(`<h3 style="text-align:center">Select Period</h3>
    <div style="display:flex;gap:10px"><select id="pp-m">${months}</select><select id="pp-y">${years}</select></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">CANCEL</button><button class="btn-go" onclick="applyPeriod()">APPLY</button></div>`);
};
window.applyPeriod=()=>{ repM=parseInt($('pp-m').value); repY=parseInt($('pp-y').value); repHalf=0; repShowAll=false; $('rep-show-all').textContent='Show all'; closeSheet(); renderReport(); };
window.dayDetail=ds=>{
  const list=DB.sales.filter(s=>s.date===ds).reverse();
  openSheet(`<h3>${fmtDate(ds)} — ${list.length} sales</h3>`+list.map(s=>`
    <div class="kv"><span>${esc(s.name)} × ${s.qty}${s.customer?' · '+esc(s.customer):''}</span><b>${pkr(s.total)}</b></div>`).join('')+
    `<div class="mrow"><button class="btn-go" onclick="closeSheet()">Close</button></div>`);
};
function csvText(rows){
  return rows.map(r=>r.map(c=>'"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(',')).join('\n');
}
function csvDataUrl(rows){
  return 'data:text/csv;base64,'+btoa(unescape(encodeURIComponent(csvText(rows))));
}
function downloadCSV(name,rows){
  if(window.AndroidApp&&AndroidApp.downloadAndShare){ try{ AndroidApp.downloadAndShare(csvDataUrl(rows),name); return; }catch(e){} }
  if(window.AndroidApp&&AndroidApp.saveFile){ try{ AndroidApp.saveFile(csvDataUrl(rows),name); return; }catch(e){} }
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csvText(rows)],{type:'text/csv'})); a.download=name; a.click();
}
window.exportCSV=kind=>{
  /* v225: REPORT-tab CSV download is Premium-only, same as Export screen. */
  if(_bkLocked()){ openCloudSheet(); return; }
  if(kind==='sales'){ const rows=exSalesRows(DB.sales); downloadCSV('sales-'+dstr()+'.csv',[['Date','Time','Product','Name','Size','Qty','Sold At','Cost/Unit','Profit','Customer','Payment'],...rows.map(r=>[r.date,r.time,r.product,r.name,r.size,r.qty,r.sold,r.cost,r.profit,r.customer,r.payment])]); }
  else { const rows=DB.products; downloadCSV('inventory-'+dstr()+'.csv',[['ID','Name','Size','Group','Quantity','Cost Price','Selling Price','Tax %','Inventory Cost','Inventory Value'],...rows.map(p=>[p.itemId,p.name,'','',p.qty,p.cost,p.sell,0,exR2((p.qty||0)*(p.cost||0)),exR2((p.qty||0)*(p.sell||0))])]); }
  toast('⬇ Exported!');
};
$('btn-export-csv').onclick=()=>exportCSV('sales');

/* ================= EXPORT REPORT SCREEN (v217) ================= */
function exRange(){
  const r=$('ex-range').value, t=dstr(), d=new Date();
  if(r==='month') return {from:t.slice(0,8)+'01', to:t, label:'This month'};
  if(r==='last3'){ const dd=new Date(d.getFullYear(),d.getMonth()-2,1); return {from:dstr(dd), to:t, label:'Last 3 months'}; }
  if(r==='year') return {from:d.getFullYear()+'-01-01', to:t, label:'This year'};
  const f=$('ex-from').value, to=$('ex-to').value;
  return {from:f||t, to:to||t, label:'Custom'};
}
function exSalesList(){ const rg=exRange(); return DB.sales.filter(s=>{ const ds=(s.date||'').slice(0,10); return ds>=rg.from&&ds<=rg.to; }); }
/* SALES REPORT FORMAT (v219) - one row per sold item, reference layout */
const EX_MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function exFmtDate(ds){ const p=(ds||'').split('-'); if(p.length!==3) return ds||''; return p[2]+' '+EX_MONTHS[(parseInt(p[1])||1)-1]+' '+p[0]; }
function exFmtGen(d){ let h=d.getHours(); const ap=h>=12?'PM':'AM'; h=h%12||12; return d.getDate()+' '+EX_MONTHS[d.getMonth()]+' '+d.getFullYear()+', '+h+':'+String(d.getMinutes()).padStart(2,'0')+' '+ap; }
function exHHMM(ts){ const d=new Date(ts||0); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
function exR2(n){ return Math.round(n*100)/100; }
function exSalesRows(list){
  const rows=[];
  (list||[]).forEach(s=>{
    const items=(s.items&&s.items.length)?s.items:[{productId:s.productId,name:s.name,qty:s.qty,price:(s.qty?(s.total/s.qty):0),cost:0}];
    items.forEach(it=>{
      const pr=it.productId?DB.products.find(p=>p.id===it.productId):null;
      const qty=it.qty||0, price=it.price||0, cost=it.cost||0;
      rows.push({date:(s.date||'').slice(0,10), time:exHHMM(s.ts), product:(pr&&pr.brand)||s.brand||'', name:it.name||'', size:'', qty, sold:exR2(qty*price), cost, profit:exR2(qty*(price-cost)), customer:s.customer||'', payment:s.unpaid?'Unpaid':'Paid'});
    });
  });
  return rows;
}
function exSalesPdfDoc(rows,from,to){
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'});
  const L=10, R=200;
  doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text(curShopName().toUpperCase(),L,18);
  doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(13,148,136); doc.text('Sales Report',L,26); doc.setTextColor(0,0,0);
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(100,100,100);
  doc.text(exFmtDate(from)+' - '+exFmtDate(to),L,33);
  doc.text('Generated '+exFmtGen(new Date()),L,39); doc.setTextColor(0,0,0);
  const cols=[{t:'Date',w:20},{t:'Time',w:12},{t:'Product',w:18},{t:'Name',w:30},{t:'Size',w:10},{t:'Qty',w:10},{t:'Sold At',w:18},{t:'Cost/Unit',w:18},{t:'Profit',w:18},{t:'Customer',w:16},{t:'Payment',w:14}];
  const numCol=ci=>ci===5||ci===6||ci===7||ci===8;
  const drawHead=y=>{
    doc.setFillColor(219,234,254); doc.rect(L,y-5,R-L,7,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(9); let x=L;
    cols.forEach(c=>{ doc.text(c.t,x,y); x+=c.w; });
    doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
  };
  let y=48; drawHead(y); y+=7;
  rows.forEach((r,ri)=>{
    if(y>278){ doc.addPage(); y=16; drawHead(y); y+=7; }
    if(ri%2===1){ doc.setFillColor(243,244,246); doc.rect(L,y-4.5,R-L,6,'F'); }
    const vals=[r.date,r.time,r.product,r.name,r.size,String(r.qty),'Rs '+r.sold,'Rs '+r.cost,'Rs '+r.profit,r.customer,r.payment];
    let x=L;
    vals.forEach((v,ci)=>{
      if(numCol(ci)) doc.text(String(v),x+cols[ci].w-1,y,{align:'right'});
      else { const s=doc.splitTextToSize(String(v==null?'':v),cols[ci].w-1)[0]||''; doc.text(s,x,y); }
      x+=cols[ci].w;
    });
    y+=6;
  });
  const totSold=exR2(rows.reduce((a,r)=>a+r.sold,0)), totProf=exR2(rows.reduce((a,r)=>a+r.profit,0));
  y+=4; doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text('Total: Rs '+totSold+'  ·  Profit: Rs '+totProf,L,y);
  const pages=doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){ doc.setPage(i); doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.text('Page '+i+' of '+pages,R,290,{align:'right'}); }
  return doc;
}
/* INVENTORY REPORT FORMAT (v220) - reference layout */
function exMoney(n){ return n<0?('- Rs '+Math.abs(n)):('Rs '+n); }
function exInvPdfDoc(list){
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'});
  const L=10, R=200;
  doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text(curShopName().toUpperCase(),L,18);
  doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(13,148,136); doc.text('Inventory Report',L,26); doc.setTextColor(0,0,0);
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(100,100,100);
  doc.text('Current inventory snapshot',L,33);
  doc.text('Generated '+exFmtGen(new Date()),L,39); doc.setTextColor(0,0,0);
  const cols=[{t:'ID',w:16},{t:'Name',w:34},{t:'Size',w:10},{t:'Group',w:14},{t:'Quantity',w:14},{t:'Cost Price',w:20},{t:'Selling Price',w:20},{t:'Tax %',w:12},{t:'Inventory Cost',w:24},{t:'Inventory Value',w:24}];
  const drawHead=y=>{
    doc.setFillColor(219,234,254); doc.rect(L,y-5,R-L,7,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(9); let x=L;
    cols.forEach(c=>{ doc.text(c.t,x,y); x+=c.w; });
    doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
  };
  let y=48; drawHead(y); y+=7;
  list.forEach((p,ri)=>{
    if(y>278){ doc.addPage(); y=16; drawHead(y); y+=7; }
    if(ri%2===1){ doc.setFillColor(243,244,246); doc.rect(L,y-4.5,R-L,6,'F'); }
    const qty=p.qty||0, cost=p.cost||0, sell=p.sell||0;
    const vals=[String(p.itemId==null?'':p.itemId),p.name||'','','',String(qty),exMoney(cost),exMoney(sell),'0',exMoney(exR2(qty*cost)),exMoney(exR2(qty*sell))];
    let x=L;
    vals.forEach((v,ci)=>{
      if(ci>=4) doc.text(String(v),x+cols[ci].w-1,y,{align:'right'});
      else { const s=doc.splitTextToSize(String(v==null?'':v),cols[ci].w-1)[0]||''; doc.text(s,x,y); }
      x+=cols[ci].w;
    });
    y+=6;
  });
  const totCost=exR2(list.reduce((a,p)=>a+(p.qty||0)*(p.cost||0),0)), totVal=exR2(list.reduce((a,p)=>a+(p.qty||0)*(p.sell||0),0));
  y+=4; doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text('Total Inventory Cost: '+exMoney(totCost)+'  ·  Total Inventory Value: '+exMoney(totVal),L,y);
  const pages=doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){ doc.setPage(i); doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.text('Page '+i+' of '+pages,R,290,{align:'right'}); }
  return doc;
}
function exKey(){ try{ const em=curEmail(); const reg=em?ensureReg(em):null; return 'ps_rex_'+(em||'anon')+'_'+(reg?reg.active:'main'); }catch(e){ return 'ps_rex_anon_main'; } }
function exRecent(){ try{ return JSON.parse(localStorage.getItem(exKey())||'[]'); }catch(e){ return []; } }
function exPushRecent(en){ try{ const l=exRecent(); l.unshift(en); localStorage.setItem(exKey(),JSON.stringify(l.slice(0,8))); }catch(e){} }
window.exRefresh=()=>{
  const kind=$('ex-kind').value, rg=exRange();
  $('ex-range-row').style.display=kind==='sales'?'':'none';
  $('ex-custom-row').style.display=(kind==='sales'&&$('ex-range').value==='custom')?'':'none';
  $('ex-note').textContent=kind==='sales'?'':'Inventory is always the full stock list.';
  const n=kind==='sales'?exSalesRows(exSalesList()).length:DB.products.length;
  $('ex-count').textContent=n?n+' records':'No records in this range';
  const rec=exRecent();
  $('ex-recent').innerHTML=rec.length?rec.map((e,i)=>`<div class="menu-row" onclick="exRerun(${i})"><span class="ic">↺</span><span>${e.kind==='sales'?'Sales':'Inventory'} · ${e.fmt}<div class="sub" style="font-weight:400">${e.label} · ${e.count} records · ${e.when}</div></span><span class="arw">›</span></div>`).join(''):'<p class="note">No recent exports yet</p>';
};
window.openExportScreen=()=>{
  /* v225: Export is Premium-only — free users get the subscription sheet. */
  if(_bkLocked()){ openCloudSheet(); return; }
  openSheet(`<h3 style="text-align:center">Export Report</h3>
    <div style="font-weight:700;margin:10px 0 4px">What to export</div>
    <select id="ex-kind" onchange="exRefresh()"><option value="sales">Sales</option><option value="inventory">Inventory</option></select>
    <div style="font-weight:700;margin:10px 0 4px">Format</div>
    <select id="ex-fmt"><option value="CSV">CSV (opens in Excel)</option><option value="PDF">PDF</option></select>
    <div id="ex-range-row"><div style="font-weight:700;margin:10px 0 4px">Date range</div>
    <select id="ex-range" onchange="exRefresh()"><option value="month">This month</option><option value="last3">Last 3 months</option><option value="year">This year</option><option value="custom">Custom</option></select></div>
    <div id="ex-custom-row" style="display:none"><div style="display:flex;gap:10px;margin-top:10px"><input type="date" id="ex-from" onchange="exRefresh()"><input type="date" id="ex-to" onchange="exRefresh()"></div></div>
    <div id="ex-count" style="text-align:center;font-weight:700;margin:14px 0 2px"></div>
    <div id="ex-note" class="note" style="text-align:center"></div>
    <div class="mrow"><button class="btn-go" onclick="exDownload()">⬇ Download</button></div>
    <div style="font-weight:700;margin:16px 0 4px">Recent exports</div>
    <div id="ex-recent"></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Close</button></div>`);
  exRefresh();
};
window.exRerun=i=>{
  const e=exRecent()[i]; if(!e) return;
  $('ex-kind').value=e.kind; $('ex-fmt').value=e.fmt;
  if(e.kind==='sales'){ $('ex-range').value=e.range||'month'; if(e.range==='custom'){ $('ex-from').value=e.from||''; $('ex-to').value=e.to||''; } }
  exRefresh(); exDownload();
};
function exPdfDoc(title,cols,rows,total){
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'}); let y=18;
  doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text(title,14,y); y+=8;
  doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.text('ReamBook · '+curShopName(),14,y); y+=10;
  doc.setFont('helvetica','bold'); doc.setFontSize(11);
  let x=14; cols.forEach(c=>{ doc.text(c.t,x,y); x+=c.w; }); y+=7;
  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  rows.forEach(r=>{ if(y>275){ doc.addPage(); y=18; } x=14; r.forEach((v,ci)=>{ const w=cols[ci].w; const s=String(v==null?'':v); doc.text(doc.splitTextToSize(s,w-3).slice(0,2),x,y); x+=w; }); y+=6; });
  if(total!=null){ y+=4; doc.setFont('helvetica','bold'); doc.text('Total: '+total,14,y); }
  return doc;
}
function exSavePdf(doc,fname){
  if(window.AndroidApp&&AndroidApp.downloadAndShare){ try{ AndroidApp.downloadAndShare(doc.output('datauristring'),fname); return; }catch(e){} }
  if(window.AndroidApp&&AndroidApp.sharePdf){ try{ AndroidApp.sharePdf(doc.output('datauristring'),fname); return; }catch(e){} }
  doc.save(fname);
}
window.exDownload=()=>{
  const kind=$('ex-kind').value, fmt=$('ex-fmt').value, rg=exRange();
  const list=kind==='sales'?exSalesList():DB.products;
  if(!list.length){ toast('No records in this range'); return; }
  const rows=kind==='sales'?exSalesRows(list):null;
  if(fmt==='CSV'){
    if(kind==='sales') downloadCSV('sales-'+rg.from+'_to_'+rg.to+'.csv',[['Date','Time','Product','Name','Size','Qty','Sold At','Cost/Unit','Profit','Customer','Payment'],...rows.map(r=>[r.date,r.time,r.product,r.name,r.size,r.qty,r.sold,r.cost,r.profit,r.customer,r.payment])]);
    else downloadCSV('inventory-'+dstr()+'.csv',[['ID','Name','Size','Group','Quantity','Cost Price','Selling Price','Tax %','Inventory Cost','Inventory Value'],...list.map(p=>[p.itemId,p.name,'','',p.qty,p.cost,p.sell,0,exR2((p.qty||0)*(p.cost||0)),exR2((p.qty||0)*(p.sell||0))])]);
  } else {
    if(!window.jspdf){ toast('PDF not available right now, try CSV'); return; }
    if(kind==='sales') exSavePdf(exSalesPdfDoc(rows,rg.from,rg.to),'sales-report-'+rg.from+'_to_'+rg.to+'.pdf');
    else exSavePdf(exInvPdfDoc(list),'inventory-report.pdf');
  }
  exPushRecent({kind,fmt,range:kind==='sales'?$('ex-range').value:'all',from:rg.from,to:rg.to,label:kind==='sales'?rg.label:'Full stock list',count:kind==='sales'?rows.length:list.length,when:dstr()});
  toast('⬇ Exported!'); exRefresh();
};

/* ================= CREDIT ================= */
let creditQ='', creditFilter='record', creditSort='medium';
function paintCreditSort(){ const b=$('csort-btn'); if(b) b.textContent=(creditSort==='high'?'High':creditSort==='low'?'Low':'Sort')+' \u25BE'; }
window.setCreditFilter=f=>{ creditFilter=f; document.querySelectorAll('#cseg .seg-btn').forEach(b=>b.classList.toggle('active',b.dataset.cf===f)); renderCredit(); };
window.openCreditSort=()=>{
  const row=(id,t,sub)=>`<div class="menu-row" onclick="setCreditSort('${id}')"><span class="ic">${id==='high'?'\u2B06':id==='low'?'\u2B07':'\u25AA'}</span><span>${t}<div class="sub" style="font-weight:400">${sub}</div></span>${creditSort===id?'<span class="arw" style="color:var(--teal)">\u2713</span>':'<span class="arw">\u203A</span>'}</div>`;
  openSheet(`<h3>Sort customers</h3>`+row('high','High','Highest balance first')+row('medium','Medium','Normal order')+row('low','Low','Lowest balance first')+`<div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Back</button></div>`);
};
window.setCreditSort=v=>{ creditSort=v; paintCreditSort(); closeSheet(); renderCredit(); };
$('credit-search').oninput=e=>{ creditQ=e.target.value.toLowerCase(); renderCredit(); };
const custBal=c=>(c.credit||0)-(c.received||0);
function lineDisc(l){ const r=(l.rate!=null?l.rate:l.unit)||0; const sr=(l.sellRate!=null?l.sellRate:r); return Math.max(0,sr-r)*(l.qty||0); }
function custDisc(c){ return Math.round((c.items||[]).reduce((ss,l)=>ss+lineDisc(l),0)*100)/100; }
function itemsProfit(its){ return (its||[]).reduce((t,l)=>t+(l.cost!=null?(l.qty||0)*((l.rate||0)-(l.cost||0)):0),0); }
function curMonthKey(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function monthName(key){ try{ const p=String(key).split('-'); return new Date(+p[0],+p[1]-1,1).toLocaleDateString('en-GB',{month:'short',year:'numeric'}); }catch(e){ return key; } }
let profitBackfilled=false;
function backfillCreditProfit(){ if(profitBackfilled) return; profitBackfilled=true; let ch=false;
  DB.customers.forEach(c=>{ const cr=(c.log||[]).filter(e=>e.t==='Credit');
    if(cr.length===1&&cr[0].profit==null){ cr[0].profit=itemsProfit(c.items); ch=true; } });
  if(ch) save(); }
let creditProfitMonth=0;
function paintProfit(){
  const el=$('c-profit'), eye=$('profit-eye'); if(!el||!eye) return;
  eye.classList.toggle('eye-off',!DB.profitShow);
  if(DB.profitShow){ el.textContent=pkr(creditProfitMonth); el.classList.remove('masked'); }
  else { el.textContent='\u2022\u2022\u2022\u2022\u2022\u2022'; el.classList.add('masked'); }
  el.style.color=creditProfitMonth<0?'var(--red)':'var(--green)';
}
window.toggleProfitEye=()=>{ DB.profitShow=!DB.profitShow; save(); paintProfit(); paintSalesProfit(); paintReportProfit(); };
let rProfitNp=0;
function paintReportProfit(){ const el=$('r-profit'), eye=$('profit-eye-r'); if(!el) return;
  if(eye) eye.classList.toggle('eye-off',!DB.profitShow);
  if(DB.profitShow){ el.textContent=rProfitNp<0?pkrMinus(-rProfitNp):pkr(rProfitNp); el.classList.remove('masked'); }
  else{ el.textContent='••••••'; el.classList.add('masked'); }
  el.classList.toggle('red-num',rProfitNp<0); el.classList.toggle('green-num',rProfitNp>=0); }
function renderCredit(){
  const tot=DB.customers.reduce((s,c)=>s+custBal(c),0);
  $('c-total').textContent=pkr(tot); $('c-count').textContent=DB.customers.length+' customers';
  backfillCreditProfit();
  const mk=curMonthKey(), mLbl=monthName(mk);
  const mRecv=DB.customers.reduce((a,c)=>a+(c.log||[]).reduce((t,e)=>t+((e.t==='Received'&&String(e.d||'').slice(0,7)===mk)?(e.a||0):0),0),0);
  const rc=$('c-recv'); if(rc) rc.textContent=pkr(mRecv);
  const rm=$('c-recv-m'); if(rm) rm.textContent=mLbl;
  creditProfitMonth=DB.customers.reduce((a,c)=>a+(c.log||[]).reduce((t,e)=>{ if(String(e.d||'').slice(0,7)!==mk) return t; if(e.t==='Credit') return t+(e.profit||0); if(e.t==='Balance edit') return t+(e.profit!=null?e.profit:(e.a||0)); return t; },0),0);
  const pm=$('c-prof-m'); if(pm) pm.textContent=mLbl;
  paintProfit();
  paintCreditSort();
  const nP=DB.customers.filter(c=>custBal(c)>0).length, nC=DB.customers.filter(c=>custBal(c)<=0).length;
  const sc=(id,n)=>{const el=$(id); if(el) el.textContent='('+n+')';};
  sc('cf-n-pending',nP); sc('cf-n-clear',nC); sc('cf-n-record',DB.customers.length);
  let list=DB.customers.filter(c=>(c.name||'').toLowerCase().includes(creditQ)||String(c.custId).includes(creditQ)).reverse();
  if(creditFilter==='pending') list=list.filter(c=>custBal(c)>0);
  else if(creditFilter==='clear') list=list.filter(c=>custBal(c)<=0);
  if(creditSort==='high') list=list.slice().sort((a,b)=>custBal(b)-custBal(a));
  else if(creditSort==='low') list=list.slice().sort((a,b)=>custBal(a)-custBal(b));
  const prodShort=c=>{ const its=(c.items||[]).map(l=>l.name).filter(Boolean);
    const src=its.length?its:(c.product?String(c.product).split(',').map(x=>x.trim()).filter(Boolean):[]);
    if(!src.length) return '';
    return src.length>3?esc(src.slice(0,3).join(', '))+' <b>+'+(src.length-3)+' more</b>':esc(src.join(', ')); };
  const cpl=c=>{ const its=c.items||[]; if(!its.some(l=>l.cost!=null)) return '';
    const p=its.some(l=>(l.qty||0)*((l.rate||0)-(l.cost||0))>0), n=its.some(l=>(l.qty||0)*((l.rate||0)-(l.cost||0))<0);
    return (p?'<span class="mpl mp-pos" title="Profit">▲</span>':'')+(n?'<span class="mpl mp-neg" title="Loss">▼</span>':''); };
  $('credit-list').innerHTML=list.map(c=>{ const b=custBal(c), ps=prodShort(c);
    return `<div class="cust-card" onclick="creditDetail(${c.id})">
      <div class="nm">${esc(c.name)} <span class="sub">ID ${c.custId}</span>${cpl(c)}</div>
      <div class="meta">📞 ${esc(c.phone||'—')}${ps?' · 📄 '+ps:''}</div>
      <div class="bal" style="color:${Math.abs(b)<0.005?'var(--green)':'var(--red)'}">Balance: ${pkr(b)}</div>
      ${c.promiseDate?`<div class="pd">⏰ Promise: ${fmtDate(c.promiseDate)}</div>`:''}
    </div>`; }).join('')||'<p class="note" style="color:#fff">No credit customers yet</p>';
}
/* ---- Full credit history: tap the Total Credit (pending) box ----
   Profit + Received for the chosen period; Pending is ALWAYS all-time (never resets). */
let chPeriod={type:'month',key:curMonthKey()}, chQ='';
function chMatch(e){ const d=String(e.d||'');
  if(chPeriod.type==='all') return true;
  if(chPeriod.type==='year') return d.slice(0,4)===chPeriod.key;
  return d.slice(0,7)===chPeriod.key; }
window.chSetPeriod=t=>{ const n=new Date();
  if(t==='month') chPeriod={type:'month',key:curMonthKey()};
  else if(t==='last'){ const d=new Date(n.getFullYear(),n.getMonth()-1,1); chPeriod={type:'last',key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}; }
  else if(t==='year') chPeriod={type:'year',key:String(n.getFullYear())};
  else if(t==='all') chPeriod={type:'all',key:''};
  else chPeriod={type:'custom',key:curMonthKey()};
  renderCreditHistory(); };
window.chSetCustom=v=>{ if(v) chPeriod={type:'custom',key:v}; renderCreditHistory(); };
window.openCreditHistory=()=>{ chPeriod={type:'month',key:curMonthKey()}; chQ=''; renderCreditHistory(); };
window.fixProfit=()=>{
  let fixed=0, gain=0; const needCost=[];
  DB.customers.forEach(c=>{ (c.log||[]).forEach(e=>{
    if(e.t!=='Credit'||!(e.a>0)||(e.profit||0)!==0||e.rev) return;
    const pitems=(e.pitems&&e.pitems.length)?e.pitems.map(l=>({productId:l.productId,qty:l.qty})):parseCreditItems(e.items);
    if(!pitems.length) return;
    let np=0, ok=false;
    pitems.forEach(l=>{
      const p=l.productId!=null?DB.products.find(x=>x.id===l.productId):DB.products.find(x=>String(x.name||'').toLowerCase()===String(l.name||'').toLowerCase());
      if(p&&p.cost!=null){ np+=(l.qty||0)*((p.rate||0)-(p.cost||0)); ok=true; }
      else if(p&&!needCost.includes(p.name)) needCost.push(p.name);
    });
    if(ok){ gain+=np; e.profit=Math.round(np*100)/100; fixed++; }
  }); });
  if(fixed){ save(); renderCredit(); try{renderCreditHistory();}catch(_){} toast('\uD83D\uDD27 '+fixed+' entries fixed: +'+pkr(gain)); }
  else if(needCost.length) toast('\u26A0\uFE0F Pehle STOCK me cost dalo: '+needCost.join(', '));
  else toast('Koi fixable entry nahi mili');
};
function renderCreditHistory(keepFocus){
  const rows=[];
  DB.customers.forEach(c=>{ (c.log||[]).forEach(e=>{ if(e.t==='Balance edit') return; if(!chMatch(e)) return;
    rows.push({d:e.d,t:e.t,a:e.a,items:e.items,note:e.note,profit:e.profit||0,
      name:c.name,cid:c.custId,phone:c.phone||''}); }); });
  rows.sort((a,b)=>String(b.d||'').localeCompare(String(a.d||'')));
  const q=chQ.toLowerCase().trim();
  const fr=rows.filter(r=>!q||(r.name||'').toLowerCase().includes(q)||String(r.cid==null?'':r.cid).includes(q)||(r.phone||'').includes(q));
  const beProf=DB.customers.reduce((x,c)=>x+(c.log||[]).reduce((t,e)=>{ if(e.t!=='Balance edit'||!chMatch(e)) return t; return t+(e.profit!=null?e.profit:(e.a||0)); },0),0);
  const pProf=fr.reduce((x,r)=>x+(r.t==='Credit'?(r.profit||0):0),0)+beProf;
  const pRecv=fr.reduce((x,r)=>x+(r.t==='Received'?(r.a||0):0),0);
  const pend=DB.customers.reduce((x,c)=>x+custBal(c),0);
  const plbl=chPeriod.type==='all'?'All time':chPeriod.type==='year'?('Year '+chPeriod.key):monthName(chPeriod.key);
  const sb=(t,v)=>`<button class="seg-btn${chPeriod.type===v?' active':''}" onclick="chSetPeriod('${v}')">${t}</button>`;
  const listHtml=fr.map(r=>{ const ic=r.t==='Received'?'\uD83D\uDCB5':'\uD83D\uDCB0';
    return `<div class="kv"><span>${ic} <b>${r.t}</b> \u2014 ${esc(r.name||'')} <span class="sub">ID ${esc(String(r.cid==null?'':r.cid))}${r.phone?' \u00b7 '+esc(r.phone):''}</span>${r.items?`<br><span class="sub">\uD83D\uDCC4 ${esc(String(r.items))}</span>`:''}<br><span class="sub">\uD83D\uDD52 ${fmtDT(r.d)}</span></span><b style="color:${r.t==='Received'?'var(--green)':'inherit'}">${pkr(r.a)}</b></div>`; }).join('');
  openSheet(`<h3>\uD83D\uDCCA Credit History</h3>
    <div class="seg" style="margin-bottom:8px">${sb('This Month','month')}${sb('Last Month','last')}${sb('Year','year')}${sb('All','all')}${sb('Custom','custom')}</div>
    ${chPeriod.type==='custom'?`<input type="month" id="ch-month" value="${chPeriod.key}" onchange="chSetCustom(this.value)" style="margin-bottom:8px">`:''}
    <div class="lbl-c2" style="margin:4px 0 8px">${esc(plbl)}</div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <div class="cs-box" style="flex:1"><div class="lbl">Profit</div><div class="cs-num" style="color:${pProf<0?'var(--red)':'var(--green)'}">${pkr(pProf)}</div></div>
      <div class="cs-box" style="flex:1"><div class="lbl">Received</div><div class="cs-num green-num">${pkr(pRecv)}</div></div>
      <div class="cs-box" style="flex:1"><div class="lbl">Pending</div><div class="cs-num red-num">${pkr(pend)}</div></div>
    </div>
    <div style="margin:-4px 0 10px"><button class="link-btn" onclick="fixProfit()">\uD83D\uDD27 Fix missing profit</button> <span class="sub">purani entries ka profit dobara lagao</span></div>
    <div class="search-wrap" style="margin-bottom:8px">\uD83D\uDD0D <input id="ch-q" placeholder="Search ID, name, number..." value="${esc(chQ)}" oninput="chQ=this.value;renderCreditHistory(true)"></div>
    <div style="max-height:44vh;overflow:auto">${listHtml||'<p class="note">No entries in this period</p>'}</div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Close</button></div>`);
  if(keepFocus){ const qi=$('ch-q'); if(qi){ try{ qi.focus(); qi.setSelectionRange(qi.value.length,qi.value.length); }catch(_){} } }
}
let credPickQ='';
$('btn-add-credit').onclick=()=>{
  const cid=DB.seq.c; credPickQ='';
  openSheet(`<h3>New Credit</h3>
    <div class="id-row"><input id="cc-id" value="${cid}"><button class="link-btn" onclick="$('cc-id').value=${DB.seq.c}">AUTO</button></div>
    <input id="cc-name" placeholder="Customer name">
    <div style="display:flex;gap:8px"><input id="cc-phone" placeholder="Phone (03xx-xxxxxxx)" inputmode="tel" style="flex:1;min-width:0"><button class="cbtn" onclick="pickCreditContact()" title="Pick from contacts"><svg viewBox="0 0 64 64"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#fff" transform="translate(14,13) scale(1.25)"/><circle cx="46" cy="46" r="11" fill="#fff"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" style="fill:var(--cbtn-check,#4a86f5)" transform="translate(38.8,38.8) scale(0.6)"/></svg></button></div>
    <div class="search-wrap">🔍 <input id="cc-psearch" placeholder="Type product name..."></div>
    <div id="cc-pick-list"></div>
    <div id="cc-more"></div>
    <div id="cc-cart"></div>
    <input id="cc-credit" type="number" placeholder="Credit amount PKR">
    <div class="sub">Tap a product to add it below — search clears for the next item</div>
    <div class="two-col"><div><label class="fl" style="margin-top:4px">Promise date</label><input id="cc-promise" type="date"></div>
    <div><label class="fl" style="margin-top:4px">Promise time</label><input id="cc-ptime" type="time" value="10:00"></div></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Cancel</button><button class="btn-go" onclick="saveCredit()">Save</button></div>`);
  $('cc-psearch').oninput=e=>{ credPickQ=e.target.value.toLowerCase(); renderCredPick(); };
  renderCredPick(); renderCredCart();
};
/* Tap any editable number/text field -> its content gets selected, so typing
   replaces it (no need to delete the old value first). Tapping elsewhere changes nothing. */
document.addEventListener('focusin',e=>{
  const t=e.target;
  if(!t||t.tagName!=='INPUT'||t.readOnly||t.disabled) return;
  const ty=(t.type||'text').toLowerCase();
  if(ty!=='number'&&ty!=='text'&&ty!=='tel'&&ty!=='decimal') return;
  try{ t.select(); }catch(_){}
});
/* ---- shared qty helpers (New Credit / Add credit / Edit customer) ---- */
let editCust=null;
function findProd(pid){ return DB.products.find(x=>x.id===pid)||DB.products.find(x=>String(x.id)===String(pid)); }
function cartFor(kind){ return kind==='cred'?credCart:kind==='more'?moreCart:kind==='edit'?editItems:kind==='sale'?saleCart:wsCart; }
function renderCartFor(kind){ if(kind==='cred')renderCredCart(); else if(kind==='more')renderMoreCart(); else if(kind==='edit')renderEditItems(); else if(kind==='sale')renderSaleCart(); else renderWsCart(); qtyOverWarn=null; }
/* red inline warning row for rejected over-stock typed qty */
function qtyWarnHtml(kind,ix){ return (qtyOverWarn&&qtyOverWarn.kind===kind&&qtyOverWarn.ix===ix)?`<div class="red-sub">Only ${qtyOverWarn.mx} in stock!</div>`:''; }
function maxFor(kind,l){
  const p=findProd(l.productId);
  const base=p&&p.qty!=null?p.qty:1e9;
  if(kind==='edit'&&editCust!=null){ const c=DB.customers.find(x=>x.id===editCust);
    if(c) return base+((c.items||[]).filter(x=>String(x.productId)===String(l.productId)).reduce((s,x)=>s+x.qty,0)); }
  return base;
}
/* tap the qty number -> type quantity directly (for 20, 25, ...) */
let qtyOverWarn=null; /* transient: {kind,ix,mx} shown as red inline warning after over-stock typed qty */
let qtyReject=null; /* one-shot: {t,kind,ix,mx,name} — abort save if user taps Save right after a rejected over-stock edit */
window.qtyTap=(kind,ix,el)=>{
  const cart=cartFor(kind), l=cart[ix]; if(!l||!el||el.dataset.e) return; el.dataset.e='1';
  qtyReject=null;
  const mx=maxFor(kind,l);
  const inp=document.createElement('input');
  inp.type='number'; inp.min='1'; inp.value=l.qty; inp.className='qty-in';
  let settled=false;
  const done=ok=>{ if(settled) return; settled=true;
    if(ok){ const v=parseInt(inp.value,10);
      if(!(v>=1)){ /* ignore bad input */ }
      else if(v>mx){ toast('Only '+mx+' "'+l.name+'" in stock!'); qtyOverWarn={kind,ix,mx}; qtyReject={t:Date.now(),kind,ix,mx,name:l.name}; }
      else { qtyOverWarn=null; const oq=l.qty; l.qty=v;
        /* sale/ws rows store total (may include bill adjustments) — scale proportionally */
        if((kind==='sale'||kind==='ws')&&l.total!=null&&oq>0) l.total=Math.round(l.total*v/oq*100)/100; } }
    renderCartFor(kind);
    if(kind==='sale'&&$('sale-total-in')) $('sale-total-in').value=cartGrand().toFixed(0);
    if(kind==='ws'&&$('ws-total')) $('ws-total').value=wsGrand().toFixed(0); };
  inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); done(true); } };
  inp.onblur=()=>done(true);
  el.replaceWith(inp); inp.focus(); inp.select();
};
/* call at the top of every save: commits a mid-edit qty box, then aborts the save if that edit was just rejected for over-stock */
function guardQtyEdit(kind){
  const pend=document.querySelector('.qty-in'); if(pend) pend.blur();
  if(qtyReject&&qtyReject.kind===kind&&Date.now()-qtyReject.t<2500){
    const r=qtyReject; qtyReject=null;
    toast('⚠️ Only '+r.mx+' "'+r.name+'" in stock! Not saved.');
    return false;
  }
  return true;
}
let credCart=[];
function renderCredPick(){
  const q=(credPickQ||'').trim(), box=$('cc-pick-list'); if(!box) return;
  if(!q){ box.innerHTML=''; return; }
  const list=DB.products.filter(p=>pmatch(p,q)).slice(0,6);
  box.innerHTML=list.map(p=>`
    <div class="pick-item" onclick="pickCred(${p.id})">
      ${pimg(p,'pick-img')}<div><b>${esc(p.name)}</b><div class="sub">Sell ${pkr(p.sell)} · Cost ${pkr(p.cost)} · ${stockLbl(p)}</div></div>
    </div>`).join('')||'<p class="note">No product found</p>';
}
window.pickCred=id=>{ const p=DB.products.find(x=>x.id===id); if(!p) return;
  if(!(p.qty>0)){ toast('\u26A0\uFE0F \u201c'+p.name+'\u201d not available in stock!'); return; }
  const ex=credCart.find(x=>x.productId===id);
  if(ex){ if(ex.qty+1>p.qty){ toast('Only '+p.qty+' "'+p.name+'" in stock!'); return; } ex.qty++; }
  else credCart.push({productId:id,name:p.name,qty:1,rate:p.sell,cost:p.cost,unit:p.unit,sellRate:p.sell});
  $('cc-psearch').value=''; credPickQ=''; renderCredPick(); renderCredCart();
  toast('✅ Added: '+p.name); };

function credCartTotal(){ return credCart.reduce((s,l)=>s+l.qty*l.rate,0); }
function renderCredCart(){
  const box=$('cc-cart'); if(!box) return;
  const mw=$('cc-more');
  if(!credCart.length){ box.innerHTML=''; if(mw) mw.innerHTML=''; return; }
  if(mw) mw.innerHTML='<button class="btn-addmore" onclick="$(\'cc-psearch\').focus()">+ Add more products</button>';
  box.innerHTML='<div class="cart-box">'+credCart.map((l,ix)=>{
    const p=findProd(l.productId), over=p&&l.qty>p.qty;
    return `<div class="cart-row"><div style="flex:1;min-width:0">
      <div class="cr-top"><b>${esc(l.name)}</b> <span class="stk">· ${p&&p.qty!=null?p.qty:0} in stock</span><button class="cart-x" onclick="credRm(${ix})">✕</button></div>
      <div class="three-col cr-boxes">
        <div><label class="fl">RATE</label><input class="rate-in" type="number" min="0" value="${l.rate}" oninput="credRate(${ix},this.value,this)"></div>
        <div><label class="fl">QTY</label><div class="cart-step"><button class="mini-btn" onclick="credStep(${ix},-1)">−</button><b class="qty-num" onclick="qtyTap('cred',${ix},this)" title="Tap to type quantity">${l.qty}</b><button class="mini-btn" onclick="credStep(${ix},1)">+</button></div></div>
        <div><label class="fl">COST</label><input class="rate-in" type="number" min="0" style="font-size:13px;padding:6px 8px" placeholder="\u2014" value="${l.cost!=null?l.cost:''}" oninput="credCost(${ix},this.value)"></div>
      </div>
      <div class="sub" style="margin-top:4px">Total = <span class="line-total">${pkr(l.qty*l.rate)}</span></div>
      ${over?`<div class="red-sub">Only ${p.qty} in stock!</div>`:''}${qtyWarnHtml('cred',ix)}</div></div>`; }).join('')+
    `<div class="cart-total"><span>Items total</span><b id="cc-items-total">${pkr(credCartTotal())}</b></div></div>`;
  $('cc-credit').value=credCartTotal().toFixed(0);
}
window.credRate=(ix,v,el)=>{ const l=credCart[ix]; if(!l) return; l.rate=Math.max(0,parseFloat(v)||0);
  const row=el&&el.closest?el.closest('.cart-row'):null;
  if(row){ const lt=row.querySelector('.line-total'); if(lt) lt.textContent=pkr(l.qty*l.rate); }
  const t=credCartTotal();
  const it=document.querySelector('#cc-items-total'); if(it) it.textContent=pkr(t);
  const ca=$('cc-credit'); if(ca) ca.value=t.toFixed(0); };
window.credStep=(ix,d)=>{ const l=credCart[ix]; if(!l) return;
  if(d>0){ const p=DB.products.find(x=>x.id===l.productId);
    if(p&&l.qty+1>p.qty){ toast('Only '+p.qty+' "'+l.name+'" in stock!'); return; } }
  qtyReject=null; l.qty=Math.max(1,l.qty+d); renderCredCart(); };
window.credRm=ix=>{ qtyReject=null; credCart.splice(ix,1); renderCredCart(); };
window.saveCredit=()=>{
  if(!guardQtyEdit('cred')) return;
  const name=$('cc-name').value.trim(); if(!name){ toast('Enter customer name'); return; }
  const cid=parseInt($('cc-id').value)||DB.seq.c;
  const camt=Math.max(0,parseFloat($('cc-credit').value)||0);
  if(!credCart.length&&!camt){ toast('Add a product or enter credit amount'); return; }
  for(const l of credCart){ const p=findProd(l.productId);
    if(!p||!(p.qty>=l.qty)){ toast('⚠️ Only '+(p&&p.qty!=null?p.qty:0)+' "'+l.name+'" in stock!'); return; } }
  const items=credCart.map(l=>({productId:l.productId,name:l.name,qty:l.qty,rate:l.rate,cost:l.cost,unit:l.unit,sellRate:l.sellRate,total:l.qty*l.rate}));
  if(belowCostAsk(items,()=>window.saveCredit())) return;
  for(const l of items){ const p=DB.products.find(x=>x.id===l.productId); if(p) p.qty-=l.qty; }
  const newId=DB.seq.c++;
  DB.customers.push({ id:newId, custId:cid, name, phone:$('cc-phone').value.trim(),
    product:items.map(l=>l.name).join(', '), items, saleRate:camt, discount:0,
    qty:items.reduce((s,l)=>s+l.qty,0),
    credit:camt, received:0,
    promiseDate:$('cc-promise').value||'', promiseTime:$('cc-ptime').value||'',
    log:[{t:'Credit',a:camt,d:dtstr(),items:items.map(l=>l.name).join(', '),profit:itemsProfit(items),pitems:items.map(l=>({productId:l.productId,qty:l.qty}))}] });
  if(cid>=DB.seq.c) DB.seq.c=cid+1;
  save(); closeSheet(); renderCredit(); renderStock(); updateBellBadge(); credCart=[];
  creditDetail(newId); toast('✅ Credit saved');
};
window.creditDetail=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  const b=custBal(c);
  const ebAdj=(c.log||[]).reduce((t,e)=>(e.t==='Balance edit'&&e.note&&String(e.note).includes('\u2192'))?t+(e.a||0):t,0);
  openSheet(`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h3 style="margin:0">${esc(c.name)} <span class="sub">ID ${c.custId}</span></h3><button class="hist-box" onclick="creditHistory(${c.id},1)">📜 History${((c.log||[]).filter(e=>e.t!=='Balance edit').length)?' ('+(c.log||[]).filter(e=>e.t!=='Balance edit').length+')':''}</button></div>
    <div class="kv"><span>📞 Number</span><b>${esc(c.phone||'—')}</b></div>
    ${(c.items&&c.items.length)?c.items.map(l=>{const pl=l.cost!=null?(l.qty*((l.rate||0)-l.cost)>0?'<span class="mpl mp-pos">▲</span>':(l.qty*((l.rate||0)-l.cost)<0?'<span class="mpl mp-neg">▼</span>':'')):'';return `<div class="kv"><span>📄 ${esc(l.name)} × ${l.qty}${pl}</span><b>${pkr(l.total!=null?l.total:l.qty*(l.rate||0))}</b></div>`;}).join(''):(c.product?`<div class="kv"><span>📄 Item</span><b>${esc(c.product)}</b></div>`:'')}
    ${(c.saleRate&&!(c.items&&c.items.length))?`<div class="kv"><span>Sale rate</span><b>${pkr(c.saleRate)}</b></div>`:''}
    ${c.discount?`<div class="kv"><span>Discount rate</span><b>${pkr(c.discount)}</b></div>`:''}
    ${Math.abs(ebAdj)>0.005?`<div class="kv"><span>✏️ Edit balance</span><b style="color:${ebAdj>0?'var(--green)':'var(--red)'}">${ebAdj>0?'+':'\u2212'}${pkr(Math.abs(ebAdj))}</b></div>`:''}
    <div class="kv"><span>💰 Credit given</span><b>${pkr(c.credit)}</b></div>
    <div class="kv"><span>💵 Received</span><b style="color:var(--green)">${pkr(c.received)}</b></div>
    ${(()=>{ const dsc=custDisc(c); return dsc>0.005?`<div class="kv"><span>📊 Correct Balance</span><b>${pkr(b+dsc)}</b></div><div class="kv"><span>🏷️ Discount</span><b style="color:var(--green)">−${pkr(dsc)}</b></div>`:''; })()}
    <div class="kv" onclick="editBalance(${c.id})" style="cursor:pointer"><span>📌 Total Balance</span><b style="color:${Math.abs(b)<0.005?'var(--green)':'var(--red)'}">${pkr(b)} <span style="font-size:13px">✏️</span></b></div>
    ${c.promiseDate?`<div class="kv"><span>⏰ Promise</span><b>${fmtDate(c.promiseDate)}${c.promiseTime?' · '+c.promiseTime:''}</b></div>`:''}
    <div class="mrow">
      <button class="btn-ghost" onclick="addWusool(${c.id})">💵 Receive</button>
      <button class="btn-ghost" onclick="addCreditMore(${c.id})">➕ Add credit</button>
      <button class="btn-ghost" onclick="editCustomer(${c.id})">✏️ Edit</button>
    </div>
    <div class="msg-btns">
      <button class="msg-btn wa" onclick="sendMsg(${c.id},'wa')">💬 WhatsApp</button>
      <button class="msg-btn sms" onclick="sendMsg(${c.id},'sms')">✉️ SMS</button>
      <button class="msg-btn pdf" onclick="shareCreditPDF(${c.id})">📄 PDF</button>
      <button class="msg-btn img" onclick="shareCreditImage(${c.id})">🖼️ Image</button>
    </div>
    <div class="mrow"><button class="btn-ghost danger-t" onclick="delCustomer(${c.id})">Delete</button>
    <button class="btn-go" onclick="closeSheet()">Close</button></div>`);
};
let histSelMode=false, histSelDates=[];
window.histFileTap=(id,dk,ev)=>{
  if(histSelMode){ window.toggleHistSel(id,dk); return; }
  const gk=String(dk).replace(/[^0-9]/g,'')||'x';
  const g=document.getElementById('hg-'+id+'-'+gk); if(!g) return;
  g.classList.toggle('hidden');
  const ar=ev.currentTarget.querySelector('.xarw'); if(ar)ar.textContent=g.classList.contains('hidden')?'\u25BC':'\u25B2';
};
window.toggleHistSel=(id,dk)=>{
  const i=histSelDates.indexOf(dk);
  if(i>=0)histSelDates.splice(i,1); else histSelDates.push(dk);
  paintHistSel(id);
};
function paintHistSel(id){
  const allf=[...document.querySelectorAll('.hfile')];
  const files=allf.filter(f=>f.style.display!=='none');
  allf.forEach(f=>{ const on=histSelDates.includes(f.getAttribute('data-dk'));
    f.classList.toggle('hsel-on',on);
    const cb=f.querySelector('.hsel-cb'); if(cb)cb.textContent=on?'\u2611':'\u2610'; });
  const gb=document.getElementById('hist-gen-btn');
  if(gb){ gb.textContent='\ud83d\udcc4 PDF ('+histSelDates.length+')'; gb.disabled=!histSelDates.length; }
  const sa=document.getElementById('hist-sa-btn');
  if(sa)sa.textContent=(histSelDates.length&&files.length&&files.every(f=>histSelDates.includes(f.getAttribute('data-dk'))))?'Clear All':'Select All';
}
window.histSearchGo=q=>{
  const needle=String(q||'').toLowerCase().trim();
  document.querySelectorAll('.hfile').forEach(f=>{
    const hay=f.getAttribute('data-search')||'';
    f.style.display=(!needle||hay.includes(needle))?'':'none';
  });
  if(histSelMode)paintHistSel();
};
window.histSelectAll=id=>{
  const all=[...document.querySelectorAll('.hfile')].filter(f=>f.style.display!=='none').map(f=>f.getAttribute('data-dk'));
  histSelDates=(all.length&&histSelDates.length===all.length&&all.every(dk=>histSelDates.includes(dk)))?[]:all.slice();
  paintHistSel(id);
};
window.histSelModeToggle=(id,on)=>{ histSelMode=!!on; if(!histSelMode)histSelDates=[]; creditHistory(id); };
window.creditHistory=(id,fresh)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  if(fresh){ histSelMode=false; histSelDates=[]; }
  const log=c.log||[], groups={};
  log.forEach((e,ix)=>{ if(e.t==='Balance edit') return; const dk=String(e.d||'').split(' ')[0]||'??'; (groups[dk]=groups[dk]||[]).push({e,ix}); });
  histSelDates=histSelDates.filter(dk=>groups[dk]);
  const ghtml=Object.keys(groups).sort().reverse().map(dk=>{
    const g=groups[dk], gk=dk.replace(/[^0-9]/g,'')||'x';
    let cr=0, rv=0; const parts=[];
    g.forEach(({e})=>{ if(e.t==='Credit')cr+=e.a||0; if(e.t==='Received')rv+=e.a||0;
      if(e.items)String(e.items).split(', ').forEach(p=>{ if(p&&!parts.includes(p))parts.push(p); }); });
    const rows=g.slice().reverse().map(({e,ix})=>{
      const ic=e.t==='Received'?'\uD83D\uDCB5':(e.t==='Balance edit'?'\u270F\uFE0F':'\uD83D\uDCB0');
      const itemsNum=e.items?String(e.items).split(', ').map((p,ii)=>(ii+1)+'. '+p).join(' \u00b7 '):'';
      const det=[itemsNum,e.note].filter(Boolean).join(' \u00b7 ');
      const amt=e.t==='Balance edit'?`<b style="color:${(e.a||0)>=0?'var(--green)':'var(--red)'}">${(e.a||0)<0?'\u2212':'+'}${pkr(Math.abs(e.a||0))}</b>`:`<b>${pkr(e.a)}</b>`;
      const ret=e.t==='Balance edit'?`<button class="hist-del" onclick="event.stopPropagation();returnHistEdit(${id},${ix})" title="Return this edit">\u21A9\uFE0F</button>`:'';
      return `<div class="kv"><span>${ic} <b>${e.t}</b>${det?`<br><span class="sub">${esc(det)}</span>`:''}<br><span class="sub">\uD83D\uDD52 ${fmtDT(e.d)}</span></span><span style="display:flex;align-items:center;gap:10px">${amt}${ret}<button class="hist-del" onclick="event.stopPropagation();delHist(${id},${ix})" title="Delete entry">\uD83D\uDDD1\uFE0F</button></span></div>`;}).join('');
    const gid='hg-'+id+'-'+gk;
    const searchTxt=(dk+' '+(dk==='??'?'':fmtDate(dk))+' '+g.map(({e})=>{const pp=String(e.d||'').split(' ');return (pp[1]||'')+' '+fmtDT(e.d);}).join(' ')).toLowerCase();
    const sel=histSelDates.includes(dk);
    return `<div class="hfile${sel?' hsel-on':''}" data-dk="${dk}" data-search="${esc(searchTxt)}"><div class="hfile-top" onclick="histFileTap(${id},'${dk}',event)">${histSelMode?`<span class="hsel-cb">${sel?'\u2611':'\u2610'}</span>`:''}<div><b>\uD83D\uDCC5 ${dk==='??'?'??':fmtDate(dk)}</b><div class="sub">${g.length} entries${parts.length?' \u00b7 \uD83D\uDCC4 '+esc(parts.slice(0,4).join(', '))+(parts.length>4?' +'+(parts.length-4)+' more':''):''}</div></div><div style="text-align:right"><div style="font-weight:800">\uD83D\uDCB0 ${pkr(cr)}</div><div style="font-weight:800;color:var(--green)">\uD83D\uDCB5 ${pkr(rv)}</div><span class="xarw">\u25BC</span><div style="margin-top:6px"><button class="mini-pdf" onclick="event.stopPropagation();shareDateHistPDF(${id},'${dk}')">\uD83D\uDCC4 PDF</button></div></div></div><div id="${gid}" class="hidden">${rows}</div></div>`;
  }).join('');
  openSheet(`<h3>\uD83D\uDCCB History \u2014 ${esc(c.name)}</h3><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">${histSelMode?`<button class="btn-ghost" id="hist-sa-btn" onclick="histSelectAll(${id})">Select All</button><button class="btn-go" id="hist-gen-btn" onclick="genHistPDF(${id})" disabled>\ud83d\udcc4 PDF (0)</button><button class="btn-ghost" onclick="histSelModeToggle(${id},false)">\u2715</button>`:`<div class="sub">${log.length} entries \u00b7 tap a date file to open it</div><div style="display:flex;gap:6px"><button class="mini-pdf" onclick="histSelModeToggle(${id},true)">\ud83d\udcc4 PDF</button>${log.length?`<button class="hist-del" onclick="delAllHist(${id})">\ud83d\uddd1\ufe0f Delete All</button>`:''}</div>`}</div><div class="search-wrap" style="margin:2px 0 10px">🔍 <input id="hist-search" placeholder="Search date or time..." oninput="histSearchGo(this.value)"></div>${ghtml||'<p class="note">No history yet</p>'}<div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" onclick="creditDetail(${id})">Done</button></div>`);
  if(histSelMode)paintHistSel(id);
};
window.returnHistEdit=(id,ix,back,from)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c||!c.log||!c.log[ix]) return;
  const e=c.log[ix]; if(e.t!=='Balance edit') return;
  if(e.returned||e.rev){toast('Already returned');return;}
  const diff=e.a||0; if(Math.abs(diff)<0.005){toast('Nothing to return');return;}
  const oldB=Math.round(custBal(c)*100)/100, nb=Math.round((oldB-diff)*100)/100;
  const ds=(diff>0?'\u2212':'+')+pkr(Math.abs(diff));
  confirmDlg('Return balance edit?','\u270F\uFE0F Balance edit '+ds+' ('+fmtDT(e.d)+') will be reversed.<br><br>Balance: '+pkr(oldB)+' \u2192 '+pkr(nb)+'<br>Received stays '+pkr(c.received||0)+'.','RETURN',()=>{
    c.credit=Math.round(((c.credit||0)-diff)*100)/100;
    e.returned=true;
    c.log.push({t:'Balance edit',a:-diff,profit:-diff,rev:true,note:'Return: Balance '+pkr(oldB)+' \u2192 '+pkr(nb),d:dtstr()});
    save(); (back==='resend'?resendList(id,from||undefined):creditHistory(id)); renderCredit(); toast('\u21A9\uFE0F Balance edit returned');
  });
};
window.resendList=(id,from)=>{
  const backFn=from==='wusool'?'addWusool':'addCreditMore';
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  const edits=(c.log||[]).map((e,ix)=>({e,ix})).filter(({e})=>e.t==='Balance edit'||e.t==='Credit').reverse();
  const rows=edits.map(({e,ix})=>{
    const isB=e.t==='Balance edit', ic=isB?'\u270F\uFE0F':'\uD83D\uDCB0';
    const amt=`<b style="color:${(e.a||0)>=0?'var(--green)':'var(--red)'}">${(e.a||0)<0?'\u2212':'+'}${pkr(Math.abs(e.a||0))}</b>`;
    const det=[e.items,e.note].filter(Boolean).join(' \u00b7 ');
    const detH=det?`<br><span class="sub">${esc(det)}</span>`:'';
    const canRet=!e.returned&&!e.rev;
    const ret=!canRet?'<span class="sub" title="Returned" style="color:var(--green)">✓</span>':(isB?`<button class="hist-del" onclick="event.stopPropagation();returnHistEdit(${id},${ix},'resend','${from||''}')" title="Return this edit">\u21A9\uFE0F</button>`
      :(e.a>0?`<button class="hist-del" onclick="event.stopPropagation();returnCredit(${id},${ix})" title="Return this credit">\u21A9\uFE0F</button>`:''));
    return `<div class="kv"><span>${ic} <b>${e.t}</b>${detH}<br><span class="sub">\uD83D\uDD52 ${fmtDT(e.d)}</span></span><span style="display:flex;align-items:center;gap:10px">${amt}${ret}<button class="hist-del" onclick="event.stopPropagation();delHist(${id},${ix},'resend','${from||''}')" title="Delete entry">\uD83D\uDDD1\uFE0F</button></span></div>`;}).join('');
  openSheet(`<h3>\u21BB Resend — ${esc(c.name)}</h3><div class="sub" style="margin-bottom:8px">${edits.length} entries \u00b7 newest first</div>${rows||'<p class="note">No entries yet</p>'}<div class="mrow"><button class="btn-ghost" onclick="${backFn}(${id})">Back</button><button class="btn-go" onclick="${backFn}(${id})">Done</button></div>`);
};
function parseCreditItems(str){
  return String(str||'').split(',').map(x=>x.trim()).filter(Boolean).map(x=>{
    const m=x.match(/^(.*) \u00d7 (\d+)$/);
    return m?{name:m[1].trim(),qty:parseInt(m[2],10)||1}:{name:x,qty:1}; });
}
window.returnCredit=(id,ix)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c||!c.log||!c.log[ix]) return;
  const e=c.log[ix]; if(e.t!=='Credit') return;
  if(e.returned||e.rev){toast('Already returned');return;}
  const a=e.a||0; if(!(a>0)){toast('Nothing to return');return;}
  const pitems=(e.pitems&&e.pitems.length)?e.pitems.map(l=>({productId:l.productId,qty:l.qty})):parseCreditItems(e.items);
  const restore=pitems.map(l=>({l,p:l.productId!=null?DB.products.find(x=>x.id===l.productId):DB.products.find(x=>String(x.name||'').toLowerCase()===String(l.name||'').toLowerCase())}));
  const missing=restore.filter(r=>!r.p).map(r=>r.l.name||'');
  const rlist=restore.filter(r=>r.p).map(r=>r.p.name+' × '+r.l.qty).join(', ');
  confirmDlg('Return credit?','💰 Credit '+pkr(a)+' ('+fmtDT(e.d)+') will be reversed.'+(rlist?'<br>Stock back: '+esc(rlist):'')+(missing.length?'<br>⚠️ Not found in stock: '+esc(missing.join(', ')):'')+'<br><br>Credit: '+pkr(c.credit||0)+' → '+pkr((c.credit||0)-a)+'.','RETURN',()=>{
    restore.forEach(r=>{ if(r.p) r.p.qty=(r.p.qty||0)+r.l.qty; });
    pitems.forEach(l=>{ let need=l.qty;
      (c.items||[]).forEach(cl=>{ if(need<=0) return;
        const m=(l.productId!=null&&cl.productId===l.productId)||(l.name&&String(cl.name||'').toLowerCase()===String(l.name).toLowerCase());
        if(m&&cl.qty>0){ const take=Math.min(cl.qty,need); cl.qty-=take; need-=take; } }); });
    c.items=(c.items||[]).filter(l=>(l.qty||0)>0);
    c.product=(c.items||[]).map(l=>l.name).join(', ');
    c.credit=Math.round(((c.credit||0)-a)*100)/100;
    e.returned=true;
    c.log.push({t:'Credit',a:-a,note:'Return of credit ('+fmtDT(e.d)+')',d:dtstr(),profit:-(e.profit||0),rev:true});
    save(); resendList(id); renderCredit(); renderStock(); toast('↩️ Credit returned');
  });
};
window.delHist=(id,ix,back,from)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c||!c.log||!c.log[ix]) return;
  const e=c.log[ix];
  const stockNote=(e.t==='Credit'&&e.items)?'<br>⚠️ Stock will NOT be returned. To undo properly (stock back + credit reversed), use ↩️ Return in Resend instead.':'';
  confirmDlg('Delete history entry?','"'+e.t+' · '+pkr(e.a)+'" ('+fmtDT(e.d)+') will be removed from history. Balances stay unchanged.'+stockNote,'DELETE',()=>{
    c.log.splice(ix,1); save(); (back==='resend'?resendList(id,from||undefined):creditHistory(id)); renderCredit(); toast('🗑️ History entry deleted'); });
};
window.addWusool=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  const nReW=(c.log||[]).filter(e=>e.t==='Balance edit'||e.t==='Credit').length;
  openSheet(`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h3 style="margin:0">💵 Receive — ${esc(c.name)}</h3><button class="mini-pdf" onclick="resendList(${id},'wusool')">↻ Resend${nReW?' ('+nReW+')':''}</button></div><div class="sub">Balance due: ${pkr(custBal(c))}</div>
    <input id="w-amt" type="number" placeholder="Amount received" oninput="wusoolCheck(${id})">
    <div class="red-sub hidden" id="w-warn" style="margin:6px 0 0"></div>
    <div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" id="w-save" onclick="saveWusool(${id})">Save</button></div>`);
};
window.wusoolCheck=id=>{ const c=DB.customers.find(x=>x.id===id); if(!c) return false;
  const bal=custBal(c), a=parseFloat(($('w-amt')||{}).value)||0;
  const over=a>bal+0.005, w=$('w-warn'), sv=$('w-save');
  if(w){ w.classList.toggle('hidden',!over);
    if(over) w.textContent='\u26a0\ufe0f Only '+pkr(Math.max(0,bal))+' is due \u2014 cannot receive more!'; }
  if(sv) sv.classList.toggle('off',over);
  return !over; };
window.saveWusool=id=>{ const c=DB.customers.find(x=>x.id===id); if(!c) return;
  const a=Math.max(0,parseFloat($('w-amt').value)||0); if(!a){toast('Enter amount');return;}
  if(a>custBal(c)+0.005){ wusoolCheck(id); toast('\u26a0\ufe0f Cannot receive more than the due balance!'); return; }
  c.received+=a; c.log.push({t:'Received',a,d:dtstr()}); save(); syncAlarms(); creditDetail(id); renderCredit(); toast('✅ '+pkr(a)+' received'); };
/* ---- direct balance edit: sets Received so balance becomes the typed value ---- */
window.editBalance=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  const b=custBal(c);
  let oldB=null; const logs=c.log||[];
  for(let i=logs.length-1;i>=0;i--){ const e=logs[i];
    if(e.t==='Balance edit'&&e.note){ const m=String(e.note).match(/Balance[^0-9]*([\d,]+\.\d{2})/);
      if(m){ const v=parseFloat(m[1].replace(/,/g,'')); if(!isNaN(v)&&Math.abs(v-b)>0.005){ oldB=v; } break; } } }
  const ebItems=(c.items||[]).map(l=>{ const t=l.total!=null?l.total:(l.qty||0)*(l.rate||0); return `<div class="kv"><span>📄 ${esc(l.name||'Item')} × ${l.qty||0} @ ${pkr(l.rate||0)}</span><b>${pkr(t)}</b></div>`; }).join('');
  openSheet(`<h3>✏️ Edit balance — ${esc(c.name)}</h3>
    <div style="margin-bottom:8px">Current balance: <b style="font-size:20px">${pkr(b)}</b> <span class="sub">(Credit ${pkr(c.credit||0)} − Received ${pkr(c.received||0)})</span></div>
    ${ebItems?`<div class="sub" style="margin-bottom:4px">Rate ke hisab se:</div><div style="margin-bottom:8px">${ebItems}</div>`:''}
    <div class="fld"><span class="fld-lbl">New balance</span><div class="fld-in"><input id="eb-amt" type="number" inputmode="decimal" value="${b}"><span class="pkr" data-cur>PKR</span></div></div>
    <div class="sub">Naya balance likho — farq Credit me adjust hoga (Received same rahega).</div>
    <div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" onclick="saveBalance(${id})">Save</button></div>
    ${oldB!=null?`<button class="btn-ghost" style="width:100%;margin-top:8px" onclick="revertBalance(${id},${oldB})">↩ Return to old balance (${pkr(oldB)})</button>`:''}`);
};
window.revertBalance=(id,oldB)=>{ const eb=$('eb-amt'); if(eb) eb.value=oldB; saveBalance(id); };
window.saveBalance=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  const v=parseFloat($('eb-amt').value); if(isNaN(v)){toast('Enter amount');return;}
  const nb=Math.round(v*100)/100, oldB=Math.round(custBal(c)*100)/100;
  const diff=Math.round((nb-oldB)*100)/100;
  if(!diff){ creditDetail(id); return; }
  const ds=(diff>0?'+':'\u2212')+pkr(Math.abs(diff));
  confirmDlg('Edit balance?','Are you sure you want to add '+ds+' to Credit?<br><br>Balance: '+pkr(oldB)+' \u2192 '+pkr(nb)+'<br>Profit adjusts by '+ds+'.<br>Received stays '+pkr(c.received||0)+'.','YES',()=>{
    c.credit=Math.round(((c.credit||0)+diff)*100)/100;
    c.log=c.log||[]; c.log.push({t:'Balance edit',a:diff,profit:diff,note:'Balance '+pkr(oldB)+' \u2192 '+pkr(nb),d:dtstr()});
    save(); creditDetail(id); renderCredit(); toast('\u2705 Balance updated');
  });
};
let moreCart=[];
window.addCreditMore=id=>{
  const c=DB.customers.find(x=>x.id===id); moreCart=[];
  const nRe=(c.log||[]).filter(e=>e.t==='Balance edit'||e.t==='Credit').length;
  openSheet(`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h3 style="margin:0">➕ Add credit — ${esc(c.name)}</h3><button class="mini-pdf" onclick="resendList(${id})">\u21BB Resend${nRe?' ('+nRe+')':''}</button></div>
    <div class="search-wrap">🔍 <input id="m-psearch" placeholder="Type product name..."></div>
    <div id="m-pick-list"></div>
    <div id="m-more"></div>
    <div id="m-cart"></div>
    <input id="m-amt" type="number" placeholder="Credit amount">
    <input id="m-note" placeholder="Note (optional) — e.g. manual balance">
    <div class="sub">Tap a product to add it below — search clears for the next item.<br>No product? Just type the amount above and Save — manual balance will be added.</div>
    <div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" onclick="saveCreditMore(${id})">Save</button></div>`);
  $('m-psearch').oninput=e=>renderMorePick(e.target.value.toLowerCase().trim());
};
function renderMorePick(q){
  const box=$('m-pick-list'); if(!box) return;
  if(!q){ box.innerHTML=''; return; }
  const list=DB.products.filter(p=>pmatch(p,q)).slice(0,6);
  box.innerHTML=list.map(p=>`
    <div class="pick-item" onclick="pickMoreCred(${p.id})">
      ${pimg(p,'pick-img')}<div><b>${esc(p.name)}</b><div class="sub">Sell ${pkr(p.sell)} · ${stockLbl(p)}</div></div>
    </div>`).join('')||'<p class="note">No product found</p>';
}
window.pickMoreCred=id=>{ const p=DB.products.find(x=>x.id===id); if(!p) return;
  if(!(p.qty>0)){ toast('\u26A0\uFE0F \u201c'+p.name+'\u201d not available in stock!'); return; }
  const ex=moreCart.find(x=>x.productId===id);
  if(ex){ if(ex.qty+1>p.qty){ toast('Only '+p.qty+' "'+p.name+'" in stock!'); return; } ex.qty++; }
  else moreCart.push({productId:id,name:p.name,qty:1,rate:p.sell,cost:p.cost,unit:p.unit,sellRate:p.sell});
  $('m-psearch').value=''; renderMorePick(''); renderMoreCart();
  toast('✅ Added: '+p.name); };
function moreCartTotal(){ return moreCart.reduce((s,l)=>s+l.qty*l.rate,0); }
function renderMoreCart(){
  const box=$('m-cart'); if(!box) return;
  if(!moreCart.length){ box.innerHTML=''; const mw0=$('m-more'); if(mw0)mw0.innerHTML=''; return; }
  box.innerHTML='<div class="cart-box">'+moreCart.map((l,ix)=>{
    const p=findProd(l.productId), over=p&&l.qty>p.qty;
    return `<div class="cart-row"><div style="flex:1;min-width:0">
      <div class="cr-top"><b>${esc(l.name)}</b> <span class="stk">· ${p&&p.qty!=null?p.qty:0} in stock</span><button class="cart-x" onclick="moreRm(${ix})">✕</button></div>
      <div class="three-col cr-boxes">
        <div><label class="fl">RATE</label><input class="rate-in" type="number" min="0" value="${l.rate}" oninput="moreRate(${ix},this.value,this)"></div>
        <div><label class="fl">QTY</label><div class="cart-step"><button class="mini-btn" onclick="moreStep(${ix},-1)">−</button><b class="qty-num" onclick="qtyTap('more',${ix},this)" title="Tap to type quantity">${l.qty}</b><button class="mini-btn" onclick="moreStep(${ix},1)">+</button></div></div>
        <div><label class="fl">COST</label><input class="rate-in" type="number" min="0" style="font-size:13px;padding:6px 8px" placeholder="\u2014" value="${l.cost!=null?l.cost:''}" oninput="moreCost(${ix},this.value)"></div>
      </div>
      <div class="sub" style="margin-top:4px">Total = <span class="line-total">${pkr(l.qty*l.rate)}</span></div>
      ${over?`<div class="red-sub">Only ${p.qty} in stock!</div>`:''}${qtyWarnHtml('more',ix)}</div></div>`; }).join('')+
    `<div class="cart-total"><span>Items total</span><b id="m-items-total">${pkr(moreCartTotal())}</b></div></div>`;
  $('m-amt').value=moreCartTotal().toFixed(0);
  const mw=$('m-more'); if(mw) mw.innerHTML='<button class="btn-addmore" onclick="$(\'m-psearch\').focus()">+ Add more products</button>';
}
window.moreRate=(ix,v,el)=>{ const l=moreCart[ix]; if(!l) return; l.rate=Math.max(0,parseFloat(v)||0);
  const row=el&&el.closest?el.closest('.cart-row'):null;
  if(row){ const lt=row.querySelector('.line-total'); if(lt) lt.textContent=pkr(l.qty*l.rate); }
  const t=moreCartTotal();
  const it=document.querySelector('#m-items-total'); if(it) it.textContent=pkr(t);
  const ca=$('m-amt'); if(ca) ca.value=t.toFixed(0); };
window.moreStep=(ix,d)=>{ const l=moreCart[ix]; if(!l) return;
  if(d>0){ const p=DB.products.find(x=>x.id===l.productId);
    if(p&&l.qty+1>p.qty){ toast('Only '+p.qty+' "'+l.name+'" in stock!'); return; } }
  qtyReject=null; l.qty=Math.max(1,l.qty+d); renderMoreCart(); };
window.moreRm=ix=>{ qtyReject=null; moreCart.splice(ix,1); renderMoreCart(); };
window.moreCost=(ix,v)=>{ const l=moreCart[ix]; if(!l) return; l.cost=(v===''||v==null)?null:Math.max(0,parseFloat(v)||0); };
window.credCost=(ix,v)=>{ const l=credCart[ix]; if(!l) return; l.cost=(v===''||v==null)?null:Math.max(0,parseFloat(v)||0); };
window.editCost=(ix,v)=>{ const l=editItems[ix]; if(!l) return; l.cost=(v===''||v==null)?null:Math.max(0,parseFloat(v)||0); };

function belowCostAsk(items, retry){
  const below=(items||[]).filter(l=>l.cost!=null&&(l.rate||0)<l.cost);
  if(!below.length) return false;
  if(DB.profile.lossAsk===false) return false;
  if(window._bcOk){ window._bcOk=false; return false; }
  openDlg(`<div class="dlg"><h2>Below cost!</h2><p>\u26A0\uFE0F `+below.map(l=>'<b>'+esc(l.name)+'</b><br>Rate '+pkr(l.rate)+' < Cost '+pkr(l.cost)).join('<br><br>')+`<br><br>Are you sure you want to save at this rate?</p>
  <label class="dont-ask"><input type="checkbox" id="bc-noask"> Don't ask again</label>
  <div class="dlg-btns"><button class="dlg-cancel" onclick="closeSheet()">CANCEL</button>
  <button class="dlg-ok" id="dlg-ok">YES, SAVE</button></div></div>`);
  $('dlg-ok').onclick=()=>{ if($('bc-noask')&&$('bc-noask').checked){ DB.profile.lossAsk=false; save(); } closeSheet(); window._bcOk=true; retry(); };
  return true;
}
window.saveCreditMore=id=>{ const c=DB.customers.find(x=>x.id===id);
  if(!guardQtyEdit('more')) return;
  const a=Math.max(0,parseFloat($('m-amt').value)||0); if(!a){toast('Enter amount');return;}
  const items=moreCart.map(l=>({productId:l.productId,name:l.name,qty:l.qty,rate:l.rate,cost:l.cost,unit:l.unit,sellRate:l.sellRate,total:l.qty*l.rate}));
  for(const l of items){ const p=findProd(l.productId);
    if(!p||!(p.qty>=l.qty)){ toast('⚠️ Only '+(p&&p.qty!=null?p.qty:0)+' "'+l.name+'" in stock!'); return; } }
  if(belowCostAsk(items,()=>window.saveCreditMore(id))) return;
  for(const l of items){ const p=DB.products.find(x=>x.id===l.productId); if(p) p.qty-=l.qty; }
  c.credit+=a;
  if(items.length){ c.items=(c.items||[]).concat(items);
    const nm=items.map(l=>l.name).join(', '); c.product=c.product?c.product+', '+nm:nm; }
  const mnote=($('m-note')&&$('m-note').value||'').trim();
  c.log.push({t:'Credit',a,d:dtstr(),items:items.length?items.map(l=>l.name+(l.qty>1?' \u00d7 '+l.qty:'')).join(', '):'',note:mnote,profit:itemsProfit(items),pitems:items.map(l=>({productId:l.productId,qty:l.qty}))}); save(); renderStock(); creditDetail(id); renderCredit(); toast('✅ Credit added'); };
let editItems=[];
window.editCustomer=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  editCust=id;
  editItems=(c.items||[]).map(l=>({productId:l.productId,name:l.name,qty:l.qty,rate:l.rate,cost:l.cost,unit:l.unit,sellRate:l.sellRate}));
  openSheet(`<h3>✏️ Edit — ${esc(c.name)}</h3>
    <input id="e-name" placeholder="Customer name" value="${esc(c.name)}">
    <input id="e-phone" placeholder="Phone (03xx-xxxxxxx)" inputmode="tel" value="${esc(c.phone||'')}">
    <div class="fl" style="margin-top:6px">Items</div>
    <div id="e-items"></div>
    <div class="search-wrap">🔍 <input id="e-psearch" placeholder="Add product..."></div>
    <div id="e-pick-list"></div>
    <input id="e-credit" type="number" placeholder="Credit amount">
    <div class="two-col"><div><label class="fl" style="margin-top:4px">Promise date</label><input id="e-promise" type="date" value="${c.promiseDate||''}"></div>
    <div><label class="fl" style="margin-top:4px">Promise time</label><input id="e-ptime" type="time" value="${c.promiseTime||'10:00'}"></div></div>
    <div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" onclick="saveEditCustomer(${id})">Save</button></div>`);
  renderEditItems();
  $('e-psearch').oninput=e=>renderEditPick(e.target.value.toLowerCase().trim());
};
function editItemsTotal(){ return editItems.reduce((s,l)=>s+l.qty*l.rate,0); }
function renderEditItems(){
  const box=$('e-items'); if(!box) return;
  box.innerHTML=editItems.length?'<div class="cart-box">'+editItems.map((l,ix)=>{
    const mx=maxFor('edit',l), over=l.qty>mx;
    return `
    <div class="cart-row"><div style="flex:1;min-width:0">
      <div class="cr-top"><b>${esc(l.name)}</b> <span class="stk">· ${mx} in stock</span><button class="cart-x" onclick="editRm(${ix})">✕</button></div>
      <div class="three-col cr-boxes">
        <div><label class="fl">RATE</label><input class="rate-in" type="number" min="0" value="${l.rate}" oninput="editRate(${ix},this.value,this)"></div>
        <div><label class="fl">QTY</label><div class="cart-step"><button class="mini-btn" onclick="editStep(${ix},-1)">−</button><b class="qty-num" onclick="qtyTap('edit',${ix},this)" title="Tap to type quantity">${l.qty}</b><button class="mini-btn" onclick="editStep(${ix},1)">+</button></div></div>
        <div><label class="fl">COST</label><input class="rate-in" type="number" min="0" style="font-size:13px;padding:6px 8px" placeholder="\u2014" value="${l.cost!=null?l.cost:''}" oninput="editCost(${ix},this.value)"></div>
      </div>
      <div class="sub" style="margin-top:4px">Total = <span class="line-total">${pkr(l.qty*l.rate)}</span></div>
      ${over?`<div class="red-sub">Only ${mx} in stock!</div>`:''}${qtyWarnHtml('edit',ix)}</div></div>`; }).join('')+
    `<div class="cart-total"><span>Items total</span><b>${pkr(editItemsTotal())}</b></div></div>`
    :'<p class="note">No items — add products below or leave empty.</p>';
  const ca=$('e-credit'); if(ca&&editItems.length) ca.value=editItemsTotal().toFixed(0);
}
window.editStep=(ix,d)=>{ const l=editItems[ix]; if(!l) return;
  if(d>0){ const mx=maxFor('edit',l);
    if(l.qty+1>mx){ toast('Only '+mx+' "'+l.name+'" in stock!'); return; } }
  qtyReject=null; l.qty=Math.max(1,l.qty+d); renderEditItems(); };
window.editRate=(ix,v,el)=>{ const l=editItems[ix]; if(!l) return; l.rate=Math.max(0,parseFloat(v)||0);
  const row=el&&el.closest?el.closest('.cart-row'):null;
  if(row){ const lt=row.querySelector('.line-total'); if(lt) lt.textContent=pkr(l.qty*l.rate); }
  const t=$('e-items'); if(t){ const elb=t.querySelector('.cart-total b'); if(elb) elb.textContent=pkr(editItemsTotal()); }
  const ca=$('e-credit'); if(ca) ca.value=editItemsTotal().toFixed(0); };
window.editRm=ix=>{ editItems.splice(ix,1); renderEditItems(); };

function renderEditPick(q){
  const box=$('e-pick-list'); if(!box) return;
  if(!q){ box.innerHTML=''; return; }
  const list=DB.products.filter(p=>pmatch(p,q)).slice(0,6);
  box.innerHTML=list.map(p=>`
    <div class="pick-item" onclick="pickEditItem(${p.id})">
      ${pimg(p,'pick-img')}<div><b>${esc(p.name)}</b><div class="sub">Sell ${pkr(p.sell)} · ${stockLbl(p)}</div></div>
    </div>`).join('')||'<p class="note">No product found</p>';
}
window.pickEditItem=id=>{ const p=DB.products.find(x=>x.id===id); if(!p) return;
  if(editCust!=null){ const c0=DB.customers.find(x=>x.id===editCust);
    const back=c0?((c0.items||[]).filter(x=>String(x.productId)===String(id)).reduce((ss,x)=>ss+x.qty,0)):0;
    if(!((p.qty||0)+back>0)){ toast('\u26A0\uFE0F \u201c'+p.name+'\u201d not available in stock!'); return; } }
  const ex=editItems.find(x=>x.productId===id);
  if(ex){ const mx=maxFor('edit',ex); if(ex.qty+1>mx){ toast('Only '+mx+' "'+p.name+'" in stock!'); return; } ex.qty++; }
  else editItems.push({productId:id,name:p.name,qty:1,rate:p.sell,cost:p.cost,unit:p.unit,sellRate:p.sell});
  $('e-psearch').value=''; renderEditPick(''); renderEditItems();
  toast('✅ Added: '+p.name); };
window.saveEditCustomer=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  if(!guardQtyEdit('edit')) return;
  const name=$('e-name').value.trim(); if(!name){ toast('Enter customer name'); return; }
  // effective availability = current stock + old lines coming back
  const effAvail=pid=>{ const p=findProd(pid); if(!p||p.qty==null) return 0;
    return p.qty+(c.items||[]).filter(l=>String(l.productId)===String(pid)).reduce((s,l)=>s+l.qty,0); };
  for(const l of editItems){ const av=effAvail(l.productId);
    if(!(av>=l.qty)){ toast('⚠️ Only '+av+' "'+l.name+'" in stock!'); return; } }
  if(belowCostAsk(editItems,()=>window.saveEditCustomer(id))) return;
  const oldItems=c.items||[];
  for(const l of (c.items||[])){ const p=DB.products.find(x=>x.id===l.productId); if(p) p.qty+=l.qty; }
  for(const l of editItems){ const p=DB.products.find(x=>x.id===l.productId); if(p) p.qty-=l.qty; }
  const camt=Math.max(0,parseFloat($('e-credit').value)||0);
  c.name=name; c.phone=$('e-phone').value.trim();
  c.items=editItems.map(l=>({productId:l.productId,name:l.name,qty:l.qty,rate:l.rate,cost:l.cost,unit:l.unit,sellRate:l.sellRate,total:l.qty*l.rate}));
  const dProfit=Math.round((itemsProfit(c.items)-itemsProfit(oldItems))*100)/100;
  if(Math.abs(dProfit)>=0.005) c.log.push({t:'Credit',a:0,note:'Edit profit adj.',d:dtstr(),profit:dProfit});
  if(c.items.length) c.product=c.items.map(l=>l.name).join(', ');
  c.qty=c.items.reduce((s,l)=>s+l.qty,0);
  c.credit=camt; c.saleRate=0;
  c.promiseDate=$('e-promise').value||''; c.promiseTime=$('e-ptime').value||'';
  save(); renderStock(); creditDetail(id); renderCredit(); updateBellBadge(); toast('✅ Updated');
};
window.delCustomer=id=>{ const c=DB.customers.find(x=>x.id===id);
  if(!c) return;
  confirmDlg('Delete customer?','Are you sure you want to delete "'+c.name+'"?','DELETE',()=>{
    DB.customers=DB.customers.filter(x=>x.id!==id); save(); syncAlarms(); closeSheet(); renderCredit(); toast('Deleted'); }); };
/* WhatsApp / SMS with balance message (per sketch) */
window.sendMsg=(id,kind)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  if(!c.phone){ toast('No phone number saved'); return; }
  const b=custBal(c);
  const cdate=(c.log&&c.log[0]&&c.log[0].d)?fmtDate(c.log[0].d):'';
  const msg=`Hello ${c.name}!\nYour account at ${DB.profile.name}:\n`+
    `ID: ${c.custId}\n`+(c.product?`Item: ${c.product}\n`:'')+
    (cdate?`Date: ${cdate}\n`:'')+
    `Credit given: ${pkr(c.credit)}\nReceived: ${pkr(c.received)}\nBalance due: ${pkr(b)}`+
    (c.promiseDate?`\nPromise: ${fmtDate(c.promiseDate)}${c.promiseTime?' '+c.promiseTime:''}`:'');
  let num=c.phone.replace(/[^0-9]/g,'');
  if(num.startsWith('0')) num='92'+num.slice(1);
  if(kind==='wa') window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');
  else location.href='sms:'+num+'?body='+encodeURIComponent(msg);
};

/* ---------- Init ---------- */
load(); applyTheme(curTheme()); renderStoreName(); initAdd(); initAuth(); initGate(); applyTabOrder(true); showView('view-sales');
updateBellBadge(); updatePrintBadge(); checkReminders();

/* ================= BELL: reminders + bulk send ================= */
function promiseDue(c){
  if(!c.promiseDate || custBal(c)<=0) return false;
  const dt=new Date(c.promiseDate+'T'+(c.promiseTime||'23:59'));
  return dt<=new Date();
}
/* v202: hand the upcoming promise list to the Android shell so it can ring a
   real phone alarm at each promise time (no-op on older shells / browser). */
function syncAlarms(){
  try{
    if(!window.AndroidApp||!AndroidApp.syncAlarms) return;
    const sound=(DB.profile&&DB.profile.alarmSound)||'default';
    if(DB.profile&&DB.profile.phoneAlarm===false){ AndroidApp.syncAlarms(JSON.stringify({sound,list:[]})); return; }
    const now=Date.now();
    const t12=t=>{ if(!t) return ''; const p=String(t).split(':'); let h=parseInt(p[0])||0; const m=String(parseInt(p[1])||0).padStart(2,'0'); const ap=h>=12?'PM':'AM'; h=h%12||12; return h+':'+m+' '+ap; };
    /* v207: saari shops ke waaday aik sath — jo shop khuli nahi, us ke
       alarms bhi bajte hain (naam ke sath shop ka naam bhi jata hai). */
    const srcs=[{customers:DB.customers||[], tag:'', off:0}];
    try{ const em=curEmail(); const reg=em?readReg(em):null;
      if(em&&reg&&reg.shops.length>1){ reg.shops.forEach((s,ix)=>{ if(s.id===reg.active) return; try{ const d=JSON.parse(_lsGet(shopDataKey(em,s.id))||'null'); if(d&&d.customers) srcs.push({customers:d.customers, tag:' ('+s.name+')', off:(ix+1)*100000}); }catch(e){} }); }
    }catch(e){}
    const all=[];
    srcs.forEach(src=>{ src.customers.filter(c=>c.promiseDate&&custBal(c)>0.005).forEach(c=>{ all.push({ cid:(src.off||0)+c.id, name:(c.name||'Customer')+src.tag, amount:pkr(custBal(c)), time:(fmtDate(c.promiseDate)+' '+t12(c.promiseTime)).trim(), ts:new Date(c.promiseDate+'T'+(c.promiseTime||'10:00')).getTime() }); }); });
    const list=all.filter(a=>a.ts>now).sort((a,b)=>a.ts-b.ts).slice(0,40);
    AndroidApp.syncAlarms(JSON.stringify({sound,list}));
  }catch(e){}
}
const ALARM_SOUNDS=[
  {k:'default',n:'Default alarm',d:'Your phone\u2019s own alarm tone'},
  {k:'bell',n:'Bell',d:'Classic bell strikes'},
  {k:'beeps',n:'Beeps',d:'Loud repeating beeps'},
  {k:'chime',n:'Chime',d:'Soft rising chime'},
  {k:'digital',n:'Digital',d:'Sharp digital blips'},
  {k:'siren',n:'Siren',d:'Alternating siren tones'}];
function alarmSoundName(){ const s=ALARM_SOUNDS.find(x=>x.k===((DB.profile&&DB.profile.alarmSound)||'default')); return s?s.n:'Default alarm'; }
window.openAlarmSounds=()=>{
  const cur=(DB.profile&&DB.profile.alarmSound)||'default';
  openSheet(`<h3>🎵 Alarm sound</h3>
  <div class="sub" style="margin:2px 0 8px">Tap a sound to select it — it will play so you can hear it. This sound rings when a customer's promise time is over.</div>
  ${ALARM_SOUNDS.map(s=>`<div class="menu-row" onclick="setAlarmSound('${s.k}')"><span class="radio${s.k===cur?' on':''}"></span><div><div>${s.n}</div><div class="sub">${s.d}</div></div></div>`).join('')}
  <div class="mrow"><button class="btn-ghost" onclick="openSettings()">Back</button></div>`);
};
window.setAlarmSound=k=>{ DB.profile.alarmSound=k; save(); syncAlarms();
  try{ if(window.AndroidApp&&AndroidApp.previewAlarmSound) AndroidApp.previewAlarmSound(k); }catch(e){}
  openAlarmSounds(); };
function updateBellBadge(){
  const n=DB.customers.filter(promiseDue).length;
  const b=$('bell-badge');
  b.classList.toggle('hidden',!n); b.textContent=n;
  $('btn-bell').classList.toggle('bell-ringing', n>0 && DB.profile.bellAlert!==false);
  syncAlarms();
}
window.openBellSheet=(tab)=>{
  if('Notification' in window && Notification.permission==='default'){
    Notification.requestPermission().then(()=>{});
  }
  const due=DB.customers.filter(promiseDue);
  const withBal=DB.customers.filter(c=>custBal(c)>0);
  openSheet(`<h3>🔔 Notifications</h3>
    <div class="seg"><button class="seg-btn active" id="bell-t-rem">⏰ Reminders ${due.length?`(${due.length})`:''}</button>
    <button class="seg-btn" id="bell-t-send">💬 Bulk Send</button></div>
    <div id="bell-rem">
      <div class="search-wrap">🔍 <input id="rem-search" placeholder="Search ID or name..."></div>
      <div id="rem-list"></div>
      <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Close</button></div>
    </div>
    <div id="bell-send" class="hidden">
      <p class="note">Select customers, then tap Send — WhatsApp will open one by one (message will be ready).</p>
      <div class="search-wrap">🔍 <input id="bulk-search" placeholder="Search ID or name..."></div>
      <label class="check-row"><input type="checkbox" id="bulk-all" onchange="bulkToggleAll(this.checked)"> <b>Select all</b></label>
      <div id="bulk-list"></div>
      <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Cancel</button>
      <button class="btn-go" onclick="bulkSend()">💬 Send Selected</button></div>
    </div>`);
  const renderRemList=q=>{
    const list=due.filter(c=>(c.name||'').toLowerCase().includes(q)||String(c.custId).includes(q));
    $('rem-list').innerHTML=list.length?list.map(c=>`<div class="remind-card"><b>${esc(c.name)}</b> <span class="sub">ID ${c.custId}</span>
      <div style="margin:6px 0">⏰ Promise: ${fmtDate(c.promiseDate)}${c.promiseTime?' · '+c.promiseTime:''}</div>
      <div style="font-weight:800;color:var(--red)">${pkr(custBal(c))} pending</div>
      <div class="mrow"><button class="btn-go" onclick="sendMsg(${c.id},'wa')">💬 Remind on WhatsApp</button><button class="btn-ghost" onclick="editPromise(${c.id},'rem')">✏️ Edit date/time</button></div></div>`).join('')
      :'<p class="note">No reminders. Overdue promises will appear here.</p>';
  };
  renderRemList('');
  $('rem-search').oninput=e=>renderRemList(e.target.value.toLowerCase());
  const renderBulkList=q=>{
    const list=withBal.filter(c=>(c.name||'').toLowerCase().includes(q)||String(c.custId).includes(q));
    $('bulk-list').innerHTML=list.map(c=>`
      <label class="check-row"><input type="checkbox" class="bulk-cb" value="${c.id}">
      <span style="flex:1;min-width:0"><b>${esc(c.name)}</b> <span class="sub">ID ${c.custId}</span><br><span style="color:var(--red);font-weight:700">${pkr(custBal(c))}</span>${c.promiseDate?`<br><span class="sub">⏰ ${fmtDate(c.promiseDate)}${c.promiseTime?' · '+c.promiseTime:''}</span>`:''}</span>
      <span class="mini-edit" onclick="event.preventDefault();event.stopPropagation();editPromise(${c.id},'send')" title="Edit date/time">✏️</span></label>`).join('')||'<p class="note">No pending dues</p>';
  };
  renderBulkList('');
  $('bulk-search').oninput=e=>renderBulkList(e.target.value.toLowerCase());
  const showTab=t=>{ const rem=t!=='send';
    $('bell-t-rem').classList.toggle('active',rem); $('bell-t-send').classList.toggle('active',!rem);
    $('bell-rem').classList.toggle('hidden',!rem); $('bell-send').classList.toggle('hidden',rem); };
  $('bell-t-rem').onclick=()=>showTab('rem');
  $('bell-t-send').onclick=()=>showTab('send');
  showTab(tab==='send'?'send':'rem');
};
$('btn-bell').onclick=()=>openBellSheet('rem');
/* Edit promise date/time (reminder + bulk send) — updates the credit record directly */
window.editPromise=(id,backTab)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  openDlg(`<div class="dlg"><h2>⏰ Promise date/time</h2>
    <p><b>${esc(c.name)}</b> <span class="sub">ID ${c.custId}</span></p>
    <div class="two-col"><div><label class="fl">Date</label><input id="ep-date" type="date" value="${c.promiseDate||''}"></div>
    <div><label class="fl">Time</label><input id="ep-time" type="time" value="${c.promiseTime||''}"></div></div>
    <div class="dlg-btns"><button class="dlg-cancel" onclick="openBellSheet('${backTab==='send'?'send':'rem'}')">Back</button>
    <button class="dlg-ok" onclick="savePromise(${id},'${backTab==='send'?'send':'rem'}')">Save</button></div></div>`);
};
window.savePromise=(id,backTab)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  c.promiseDate=$('ep-date').value||''; c.promiseTime=$('ep-time').value||'';
  save(); updateBellBadge(); openBellSheet(backTab); toast('✅ Promise date/time updated');
};
window.bulkToggleAll=on=>{ document.querySelectorAll('.bulk-cb').forEach(cb=>cb.checked=on); };
let bulkQueue=[], bulkActive=false;
window.bulkSend=()=>{
  bulkQueue=[...document.querySelectorAll('.bulk-cb:checked')].map(cb=>parseInt(cb.value));
  if(!bulkQueue.length){ toast('Select a customer first'); return; }
  bulkActive=true; closeSheet(); toast('Opening WhatsApp... ('+bulkQueue.length+')');
  setTimeout(bulkNext,600);
};
function bulkNext(){
  if(!bulkQueue.length){ bulkActive=false; toast('✅ Sent to all!'); return; }
  const id=bulkQueue.shift();
  const c=DB.customers.find(x=>x.id===id);
  if(c&&c.phone){ openWA(c); } else bulkNext();
}
function openWA(c){
  const b=custBal(c);
  const cdate=(c.log&&c.log[0]&&c.log[0].d)?fmtDate(c.log[0].d):'';
  const msg=`Hello ${c.name}!\nYour account at ${DB.profile.name}:\nID: ${c.custId}\n`+
    (c.product?`Item: ${c.product}\n`:'')+(cdate?`Date: ${cdate}\n`:'')+
    `Credit: ${pkr(c.credit)}\nReceived: ${pkr(c.received)}\nBalance due: ${pkr(b)}`+
    (c.promiseDate?`\nPromise: ${fmtDate(c.promiseDate)}${c.promiseTime?' '+c.promiseTime:''}`:'');
  let num=c.phone.replace(/[^0-9]/g,''); if(num.startsWith('0')) num='92'+num.slice(1);
  window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&bulkActive&&bulkQueue.length) setTimeout(bulkNext,900);
});
/* Promise scheduler: checks every minute + on load */
function checkReminders(){
  const now=new Date();
  DB.customers.forEach(c=>{
    if(custBal(c)>0&&c.promiseDate){
      const dt=new Date(c.promiseDate+'T'+(c.promiseTime||'09:00'));
      const last=c.lastRemind?new Date(c.lastRemind):null;
      const sameDay=last&&last.toDateString()===now.toDateString();
      if(dt<=now&&!sameDay){
        c.lastRemind=now.toISOString();
        const msg=`⏰ Collect ${pkr(custBal(c))} from ${c.name}! (Promise: ${fmtDate(c.promiseDate)}${c.promiseTime?' '+c.promiseTime:''})`;
        if('Notification' in window&&Notification.permission==='granted'){ try{ new Notification('Paper Stock ⏰',{body:msg}); }catch(e){} }
        toast(msg);
      }
    }
  });
  save(); updateBellBadge();
}
setInterval(checkReminders,60000);

/* ================= PRINTER: receipts + queue ================= */
function updatePrintBadge(){
  const n=DB.printQueue.filter(q=>!q.done).length;
  const b=$('print-badge'); b.classList.toggle('hidden',!n); b.textContent=n;
}
function billPrintHtml(s){
  const pdDisc=(s.discount||0), pdCorr=(s.correctTotal!=null?s.correctTotal:s.total);
  const pdPct=(pdDisc>0.005&&pdCorr>0)?(pdDisc/pdCorr*100).toFixed(1).replace(/\.0$/,'')+'%':'';
  const pdDiscRows=pdDisc>0.005?`<tr><td colspan="3"></td><td class="r">Total</td><td class="r">${rsFmt(pdCorr)}</td></tr><tr><td colspan="3"></td><td class="r">Discount${pdPct?' - '+pdPct:''}</td><td class="r">${rsFmt(-pdDisc)}</td></tr>`:'';  const bc=billTheme(); const prof=DB.profile;
  const d=new Date(s.ts||Date.now());
  const ds=d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  const rows=s.items.map((it,i)=>`<tr><td>${i+1}.</td><td>${esc(it.name||'')}</td><td class="r">${it.qty}</td><td class="r">${rsFmt(it.price)}</td><td class="r">${rsFmt(it.qty*it.price)}</td></tr>`).join('');
  const tq=s.items.reduce((a,i)=>a+(i.qty||0),0);
  const cl=[prof.phone?('Phone: '+esc(prof.phone)):'',prof.email?('Email: '+esc(prof.email)):''].filter(Boolean).join(' | ');
  return `<div class="billprint">
  <div class="bp-banner" style="background:linear-gradient(135deg,${bc[0]},${bc[1]})">
    <div class="bp-name">${esc(String(prof.name||'ReamBook').toUpperCase())}</div>
    ${prof.address?`<div class="bp-sub">${esc(prof.address)}</div>`:''}
    ${cl?`<div class="bp-sub">${cl}</div>`:''}
    <div class="bp-tag">${s.kind==='wholesale'?'WHOLESALE':'SHOP SALE'}</div>
  </div>
  <div class="bp-meta"><span><b>Name:</b> ${esc(s.customer||'-')}</span><span><b>Bill No. ${s.id}</b></span></div>
  <div class="bp-meta"><span><b>Contact:</b> ${esc(s.phone||'—')}</span><span><b>Date:</b> ${ds}</span></div>
  <table class="bp-table"><tr style="background:${bc[2]}"><th>S.N</th><th>Name of Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr>
  ${rows}
  ${pdDiscRows}
  <tr><td colspan="3"></td><td class="r" style="font-weight:800">Total</td><td class="r" style="font-size:19px;font-weight:800">${rsFmt(s.total)}</td></tr>
  ${s.unpaid
    ? `<tr><td colspan="3"></td><td class="r" style="font-weight:800;color:#dc2626">Not Received</td><td class="r" style="font-size:17px;font-weight:800;color:#dc2626">${rsFmt(s.total)}</td></tr>`
    : `<tr><td colspan="3"></td><td class="r" style="font-weight:800;color:#16a34a">Received</td><td class="r" style="font-size:17px;font-weight:800;color:#16a34a">${rsFmt(s.total)}</td></tr>`}
  <tr><td colspan="5" class="words">In Word: ${numToWords(s.total)}</td></tr></table>
  <div class="bp-terms" style="text-align:center"><b style="font-size:17px">Thanks For Shopping — ${esc(String(prof.name||'ReamBook'))}</b></div>
  <div class="bp-foot">Generated by ReamBook</div></div>`;
}
function doPrint(html){ $('print-area').innerHTML=html; setTimeout(()=>window.print(),300); }
window.printSale=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s) return;
  doPrint(billPrintHtml(s));
  const q=DB.printQueue.find(q=>q.saleId===id&&!q.done); if(q) q.done=true;
  save(); updatePrintBadge(); toast('🖨️ Printing...');
};
$('btn-printer').onclick=()=>{
  const pend=DB.printQueue.filter(q=>!q.done).reverse();
  const rows=pend.map(q=>{ const s=DB.sales.find(x=>x.id===q.saleId);
    if(!s) return '';
    return `<label class="check-row"><input type="checkbox" class="pq-cb" value="${q.qid}">
    <span><b>#${s.id} ${esc(s.name)} × ${s.qty}</b><br><span class="sub">${fmtDate(s.date)} · ${pkr(s.total)}</span></span></label>`; }).join('');
  openSheet(`<h3>🖨️ Pending Prints (${pend.length})</h3>
    ${rows||'<p class="note">No pending prints!</p>'}
    <div class="mrow"><button class="btn-ghost" onclick="pqSelectAll(true)">Select all</button>
    <button class="btn-ghost" onclick="pqSelectAll(false)">Clear</button></div>
    <div class="mrow"><button class="btn-go" onclick="pqPrintSel()">🖨️ Print Selected</button>
    <button class="btn-ghost danger-t" onclick="pqDelSel()">Delete</button></div>
    <div class="mrow"><button class="btn-ghost danger-t" onclick="pqDelAll()">${TRASH} Delete All</button>
    <button class="btn-ghost" onclick="closeSheet()">Close</button></div>`);
};
window.pqSelectAll=on=>{ document.querySelectorAll('.pq-cb').forEach(cb=>cb.checked=on); };
window.pqPrintSel=()=>{
  const ids=[...document.querySelectorAll('.pq-cb:checked')].map(cb=>parseFloat(cb.value));
  if(!ids.length){ toast('Select prints first'); return; }
  const html=ids.map(qid=>{ const q=DB.printQueue.find(x=>x.qid===qid); const s=q&&DB.sales.find(x=>x.id===q.saleId);
    if(q) q.done=true; return s?billPrintHtml(s):''; }).join('<div style="page-break-after:always"></div>');
  save(); updatePrintBadge(); closeSheet(); doPrint(html); toast('🖨️ Printing '+ids.length+'...');
};
window.pqDelSel=()=>{ const ids=[...document.querySelectorAll('.pq-cb:checked')].map(cb=>parseFloat(cb.value));
  DB.printQueue=DB.printQueue.filter(q=>!ids.includes(q.qid)); save(); updatePrintBadge(); $('btn-printer').click(); };
window.pqDelAll=()=>{ confirmDlg('Delete all pending prints?','Done prints will be kept. Continue?','DELETE',()=>{
    DB.printQueue=DB.printQueue.filter(q=>q.done); save(); updatePrintBadge(); closeSheet(); }); };

/* ================= PDF BILL + WHATSAPP SHARE (v27) ================= */
function numToWords(n){
  n=Math.round(Math.abs(n||0)); if(!n) return 'Zero';
  const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const two=d=>d<20?ones[d]:tens[Math.floor(d/10)]+(d%10?' '+ones[d%10]:'');
  const three=d=>{const h=Math.floor(d/100),r=d%100;return (h?ones[h]+' Hundred'+(r?' ':''):'')+(r?two(r):'');};
  let o=''; const cr=Math.floor(n/1e7); n%=1e7; const lk=Math.floor(n/1e5); n%=1e5; const th=Math.floor(n/1e3); n%=1e3;
  if(cr)o+=three(cr)+' Crore '; if(lk)o+=two(lk)+' Lakh '; if(th)o+=two(th)+' Thousand '; if(n)o+=three(n);
  return o.trim();
}
function rsFmt(v){ const c=curCode(); return (c==='PKR'?'Rs':c+' ')+Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function billTheme(){
  const BT={ocean:['#102c6b','#4a86f5','#1e40af'],emerald:['#0f6b49','#16c475','#0b5e3f'],purple:['#471c7d','#875ff0','#5b21b6'],orange:['#8a3a1c','#e5862c','#9a3412'],midnight:['#131c2e','#8a6d1b','#8a6d1b'],red:['#521010','#e03232','#991b1b'],pink:['#5c1630','#e03283','#9d174d'],brown:['#362115','#976637','#5b3a24'],olive:['#223a08','#70b012','#3f6212'],wine:['#360b14','#c42544','#7f1d2d'],sunset:['#7933e0','#f7a716','#9d174d'],grey:['#1a2332','#78828f','#374151'],cyan:['#0d3d52','#2fd8f2','#0e7490'],classic:['#1268b1','#14b2d6','#095f86']};
  return BT[curTheme()]||BT.ocean;
}
// Style 6 FINAL: big bold capital banner, theme gradient, fits one page
function billPDF(s){
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,M=14,bw=W-2*M;
  const prof=DB.profile, bc=billTheme();
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const A=hx(bc[0]),B=hx(bc[1]),TC=hx(bc[2]);
  const d=new Date(s.ts||Date.now());
  const ds=d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  // fit whole bill on ONE page: shrink factor for long bills
  const nIt=Math.max(s.items.length,1);
  let f=Math.min(1,270/(169+9*nIt)); f=Math.max(f,0.55);
  const BH=46+10*f, GN=48;
  for(let i=0;i<GN;i++){const k=i/(GN-1);doc.setFillColor(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k);doc.rect(W*i/GN,0,W/GN+0.3,BH,'F');}
  const txt=(t,x,yy,sz,bold,align,col)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(sz);const c=col||[0,0,0];doc.setTextColor(c[0],c[1],c[2]);doc.text(String(t),x,yy,{align:align||'left'});doc.setTextColor(0,0,0);};
  const WH=[255,255,255];
  txt(String(prof.name||'ReamBook').toUpperCase(),W/2,11+6*f,24*f,true,'center',WH);
  const cl=[prof.address,prof.phone?('Phone: '+prof.phone):'',prof.email||''].filter(Boolean).join(' \u00b7 ');
  if(cl)txt(cl,W/2,19+6*f,10*f,false,'center',WH);
  txt(s.kind==='wholesale'?'WHOLESALE':'SHOP SALE',W-M,28+6*f,15*f,true,'right',WH);
  let y=BH+10*f;
  // info — no boxes, big bold (like preview)
  const info=(ll,lv,rl,rv)=>{doc.setFontSize(12*f);
    doc.setFont('helvetica','bold');doc.text(ll,M,y);const w1=doc.getTextWidth(ll);
    doc.setFont('helvetica','normal');doc.text(String(lv),M+w1,y);
    doc.setFont('helvetica','bold');const wR=doc.getTextWidth(rl+String(rv));
    doc.text(rl,W-M-wR,y);const w2=doc.getTextWidth(rl);
    doc.setFont('helvetica','normal');doc.text(String(rv),W-M-wR+w2,y);y+=7.5*f;};
  info('Name: ',s.customer||'-','Bill No. ',s.id);
  info('Contact: ',s.phone||'—','Date: ',ds);
  y+=3*f;
  // table
  const cols=[['S.N',13],['Name of Item',bw-13-20-30-38],['Qty',20],['Rate',30],['Amount',38]];
  const rh=Math.max(6.5,9*f);
  const head=yy=>{let x=M;doc.setFillColor(TC[0],TC[1],TC[2]);
    cols.forEach(c=>{doc.rect(x,yy,c[1],rh,'FD');x+=c[1];});x=M;
    doc.setFont('helvetica','bold');doc.setFontSize(12*f);doc.setTextColor(255,255,255);
    cols.forEach(c=>{doc.text(c[0],x+c[1]/2,yy+rh/2+1.6,{align:'center'});x+=c[1];});doc.setTextColor(0,0,0);};
  const drow=(yy,vals,hh,bold,fill)=>{let x=M;if(fill)doc.setFillColor(235,238,243);
    cols.forEach(c=>{doc.rect(x,yy,c[1],hh,fill?'FD':'D');x+=c[1];});x=M;
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(11*f);
    vals.forEach((v,i)=>{const w=cols[i][1];
      if(i===1){const ls=doc.splitTextToSize(String(v||''),w-3).slice(0,4);doc.text(ls,x+2,yy+rh/2+1.2);}
      else doc.text(String(v),x+(i>=2?w-2:2),yy+rh/2+1.6,{align:i>=2?'right':'left'});
      x+=w;});};
  head(y);y+=rh;
  let sn=1,tq=0;
  s.items.forEach(it=>{
    const nl=doc.splitTextToSize(String(it.name||''),cols[1][1]-3).length;
    const hh=Math.max(rh,Math.min(nl,4)*(5*f+1));
    const amt=it.qty*it.price;tq+=it.qty;
    drow(y,[sn+'. ',it.name||'',it.qty,rsFmt(it.price),rsFmt(amt)],hh);sn++;y+=hh;});
  const sDisc=(s.discount||0), sCorr=(s.correctTotal!=null?s.correctTotal:s.total);
  if(sDisc>0.005){ const sPct=sCorr>0?(sDisc/sCorr*100).toFixed(1).replace(/\.0$/,'')+'%':'';
    drow(y,['','','','Total',rsFmt(sCorr)],rh);y+=rh; drow(y,['','','','Discount'+(sPct?' - '+sPct:''),rsFmt(-sDisc)],rh);y+=rh; }
  let x=M;doc.rect(x,y,bw-38,rh);doc.rect(x+bw-38,y,38,rh);
  doc.setFont('helvetica','bold');doc.setFontSize(12*f);
  doc.text('Total',x+bw-38-2,y+rh/2+1.6,{align:'right'});
  doc.setFont('helvetica','bold');doc.setFontSize(15*f);doc.text(rsFmt(s.total),x+bw-2,y+rh/2+1.6,{align:'right'});y+=rh;
  const rc=s.unpaid?[220,38,38]:[22,163,74];
  doc.rect(x,y,bw-38,rh);doc.rect(x+bw-38,y,38,rh);
  doc.setFont('helvetica','bold');doc.setFontSize(12*f);doc.setTextColor(rc[0],rc[1],rc[2]);
  doc.text(s.unpaid?'Not Received':'Received',x+bw-38-2,y+rh/2+1.6,{align:'right'});
  doc.setFont('helvetica','bold');doc.setFontSize(13*f);doc.text(rsFmt(s.total),x+bw-2,y+rh/2+1.6,{align:'right'});
  doc.setTextColor(0,0,0);y+=rh;
  doc.rect(M,y,bw,rh);doc.setFont('helvetica','bold');doc.setFontSize(11*f);
  doc.text('In Word: '+numToWords(s.total),M+2,y+rh/2+1.6);y+=rh+4*f;
  const th2=15*f+6;
  doc.rect(M,y,bw,th2);doc.setFont('helvetica','bold');doc.setFontSize(13.5*f);
  doc.text('Thanks For Shopping — '+String(prof.name||'ReamBook'),W/2,y+th2/2+1.8*f,{align:'center'});
  y+=th2+6*f;
  doc.setFont('helvetica','normal');doc.setFontSize(8.5*f);doc.setTextColor(140,140,140);
  doc.text('Generated by ReamBook',W/2,y,{align:'center'});doc.setTextColor(0,0,0);
  return doc.output('blob');
}
function creditPDF(c){
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,M=14,bw=W-2*M;
  const prof=DB.profile, bc=billTheme();
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const A=hx(bc[0]),B=hx(bc[1]),TC=hx(bc[2]);
  const items=(c.items&&c.items.length)?c.items:[];
  const nIt=Math.max(items.length,1);
  let f=Math.min(1,270/(205+9*nIt)); f=Math.max(f,0.55);
  const BH=46+10*f, GN=48;
  for(let i=0;i<GN;i++){const k=i/(GN-1);doc.setFillColor(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k);doc.rect(W*i/GN,0,W/GN+0.3,BH,'F');}
  const txt=(t,x,yy,sz,bold,align,col)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(sz);const cc=col||[0,0,0];doc.setTextColor(cc[0],cc[1],cc[2]);doc.text(String(t),x,yy,{align:align||'left'});doc.setTextColor(0,0,0);};
  const WH=[255,255,255],GREEN=[22,163,74],RED=[220,38,38];
  txt(String(prof.name||'ReamBook').toUpperCase(),W/2,11+6*f,24*f,true,'center',WH);
  const cl=[prof.address,prof.phone?('Phone: '+prof.phone):'',prof.email||''].filter(Boolean).join(' \u00b7 ');
  if(cl)txt(cl,W/2,19+6*f,10*f,false,'center',WH);
  txt('CREDIT STATEMENT',M,28+6*f,15*f,true,'left',WH);
  let y=BH+10*f;
  const cds=(c.log&&c.log[0]&&c.log[0].d)||dstr();
  const info=(ll,lv,rl,rv)=>{doc.setFontSize(12*f);
    doc.setFont('helvetica','bold');doc.text(ll,M,y);const w1=doc.getTextWidth(ll);
    doc.setFont('helvetica','normal');doc.text(String(lv),M+w1,y);
    doc.setFont('helvetica','bold');const wR=doc.getTextWidth(rl+String(rv));
    doc.text(rl,W-M-wR,y);const w2=doc.getTextWidth(rl);
    doc.setFont('helvetica','normal');doc.text(String(rv),W-M-wR+w2,y);y+=7.5*f;};
  info('Name: ',c.name||'-','Customer ID: ',c.custId||c.id);
  info('Contact: ',c.phone||'—','Date: ',cds);
  if(c.promiseDate) info('Promise: ',fmtDate(c.promiseDate)+(c.promiseTime?' · '+c.promiseTime:''),'','');
  y+=3*f;
  const cols=[['S.N',13],['Name of Item',bw-13-20-30-38],['Qty',20],['Rate',30],['Amount',38]];
  const rh=Math.max(6.5,9*f);
  const head=yy=>{let x=M;doc.setFillColor(TC[0],TC[1],TC[2]);
    cols.forEach(cc=>{doc.rect(x,yy,cc[1],rh,'FD');x+=cc[1];});x=M;
    doc.setFont('helvetica','bold');doc.setFontSize(12*f);doc.setTextColor(255,255,255);
    cols.forEach(cc=>{doc.text(cc[0],x+cc[1]/2,yy+rh/2+1.6,{align:'center'});x+=cc[1];});doc.setTextColor(0,0,0);};
  const drow=(yy,vals,hh,bold,fill)=>{let x=M;if(fill)doc.setFillColor(235,238,243);
    cols.forEach(cc=>{doc.rect(x,yy,cc[1],hh,fill?'FD':'D');x+=cc[1];});x=M;
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(11*f);
    vals.forEach((v,i)=>{const w=cols[i][1];
      if(i===1){const ls=doc.splitTextToSize(String(v||''),w-3).slice(0,4);doc.text(ls,x+2,yy+rh/2+1.2);}
      else doc.text(String(v),x+(i>=2?w-2:2),yy+rh/2+1.6,{align:i>=2?'right':'left'});
      x+=w;});};
  head(y);y+=rh;
  let sn=1,tq=0;
  items.forEach(it=>{
    const nl=doc.splitTextToSize(String(it.name||''),cols[1][1]-3).length;
    const hh=Math.max(rh,Math.min(nl,4)*(5*f+1));
    const amt=(it.total!=null?it.total:it.qty*(it.rate||0));tq+=it.qty;
    drow(y,[sn+'. ',it.name||'',it.qty,rsFmt(it.rate||0),rsFmt(amt)],hh);sn++;y+=hh;});
  const total=c.credit||0, recv=c.received||0, due=Math.max(0,total-recv);
  const cdisc=custDisc(c), ccorr=Math.round((total+cdisc)*100)/100;
  const srow=(label,val,col)=>{
    let x=M;doc.rect(x,y,bw-38,rh);doc.rect(x+bw-38,y,38,rh);
    doc.setFont('helvetica','normal');doc.setFontSize(11*f);
    doc.text(label,x+bw-38-2,y+rh/2+1.6,{align:'right'});
    const cc=col||[0,0,0];doc.setTextColor(cc[0],cc[1],cc[2]);
    doc.setFont('helvetica','bold');doc.text(rsFmt(val),x+bw-2,y+rh/2+1.6,{align:'right'});
    doc.setTextColor(0,0,0);y+=rh;};
  if(cdisc>0.005){ srow('Correct Balance',ccorr,null); srow('Discount',-cdisc,GREEN); }
  srow('Total Qty: '+tq+'   Total',total,null);
  srow('Received',recv,GREEN);
  srow('Total Due',due,RED);
  doc.rect(M,y,bw,rh);doc.setFont('helvetica','bold');doc.setFontSize(11*f);
  doc.setTextColor(RED[0],RED[1],RED[2]);
  doc.text('In Word: '+numToWords(due),M+2,y+rh/2+1.6);doc.setTextColor(0,0,0);y+=rh+4*f;
  const hlog=(c.log&&c.log.length)?c.log.slice().reverse():[];
  if(hlog.length){
    if(y>235){doc.addPage();y=14;}
    y+=4*f;doc.setFont('helvetica','bold');doc.setFontSize(12*f);
    doc.setTextColor(TC[0],TC[1],TC[2]);doc.text('TRANSACTION HISTORY',M,y);doc.setTextColor(0,0,0);y+=7*f;
    const hc=[['Date / Time',52],['Details',bw-52-38],['Amount',38]];
    let hx0=M;doc.setFillColor(TC[0],TC[1],TC[2]);hc.forEach(cc=>{doc.rect(hx0,y,cc[1],rh,'FD');hx0+=cc[1];});hx0=M;
    doc.setFont('helvetica','bold');doc.setFontSize(11*f);doc.setTextColor(255,255,255);
    hc.forEach(cc=>{doc.text(cc[0],hx0+cc[1]/2,y+rh/2+1.6,{align:'center'});hx0+=cc[1];});doc.setTextColor(0,0,0);y+=rh;
    hlog.forEach(e=>{
      const det=e.t+((e.items||e.note)?' - '+[e.items,e.note].filter(Boolean).join(' - '):'');
      const nl=doc.splitTextToSize(String(det),hc[1][1]-3).length;
      const hh=Math.max(rh,Math.min(nl,3)*(5*f+1));
      if(y+hh>282){doc.addPage();y=14;}
      let x2=M;hc.forEach(cc=>{doc.rect(x2,y,cc[1],hh,'D');x2+=cc[1];});
      doc.setFont('helvetica','normal');doc.setFontSize(10*f);
      doc.text(fmtDT(e.d),M+2,y+rh/2+1.2);
      const ls=doc.splitTextToSize(String(det),hc[1][1]-3).slice(0,3);doc.text(ls,M+52+2,y+rh/2+1.2);
      const hcol=e.t==='Received'?GREEN:(e.t==='Credit'?[0,0,0]:[180,83,9]);
      doc.setFont('helvetica','bold');doc.setTextColor(hcol[0],hcol[1],hcol[2]);
      doc.text(rsFmt(e.a),M+bw-2,y+rh/2+1.6,{align:'right'});doc.setTextColor(0,0,0);
      y+=hh;});
    y+=4*f;
  }
  const th2=15*f+6;
  doc.rect(M,y,bw,th2);doc.setFont('helvetica','bold');doc.setFontSize(13.5*f);
  doc.text('Thanks For Shopping — '+String(prof.name||'ReamBook'),W/2,y+th2/2+1.8*f,{align:'center'});
  y+=th2+6*f;
  doc.setFont('helvetica','normal');doc.setFontSize(8.5*f);doc.setTextColor(140,140,140);
  doc.text('Generated by ReamBook',W/2,y,{align:'center'});doc.setTextColor(0,0,0);
  return doc.output('blob');
}
window.shareCreditPDF=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c){toast('Credit not found');return;}
  if(!window.jspdf){toast('PDF engine loading...');return;}
  try{
    const blob=creditPDF(c);
    const fn='CREDIT_'+(c.custId||c.id)+'.pdf';
    const file=new File([blob],fn,{type:'application/pdf'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:'Credit #'+(c.custId||c.id)}).catch(()=>{});
    }else{
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fn;a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast('⬇️ PDF downloaded');
    }
  }catch(e){toast('PDF failed');}
};
function dateHistPDF(c,dk,entries){
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,M=14,bw=W-2*M, prof=DB.profile, bc=billTheme();
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const A=hx(bc[0]),B=hx(bc[1]),TC=hx(bc[2]),RED=[220,38,38],GREEN=[22,163,74];
  const BH=46,GN=48;
  for(let i=0;i<GN;i++){const k=i/(GN-1);doc.setFillColor(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k);doc.rect(W*i/GN,0,W/GN+0.3,BH,'F');}
  const txt=(t,x,yy,sz,bold,align,col)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(sz);const cc=col||[0,0,0];doc.setTextColor(cc[0],cc[1],cc[2]);doc.text(String(t),x,yy,{align:align||'left'});doc.setTextColor(0,0,0);};
  const WH=[255,255,255];
  txt(String(prof.name||'ReamBook').toUpperCase(),W/2,11,20,true,'center',WH);
  const cl=[prof.address,prof.phone?('Phone: '+prof.phone):'',prof.email||''].filter(Boolean).join(' \u00b7 ');
  if(cl)txt(cl,W/2,19,9.5,false,'center',WH);
  txt('CREDIT HISTORY',M,28,14,true,'left',WH);
  txt('Customer: '+String(c.name||'')+'   (ID '+String(c.custId||c.id)+')',W/2,35,10.5,false,'center',WH);
  txt('Date: '+fmtDate(dk),W/2,40.5,11,true,'center',WH);
  let y=BH+10, rh=8;
  const cols=[['S.N',12],['Date/Time',40],['Details',bw-12-40-38],['Amount',38]];
  let x=M;doc.setFillColor(TC[0],TC[1],TC[2]);cols.forEach(cc=>{doc.rect(x,y,cc[1],rh,'FD');x+=cc[1];});x=M;
  doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(255,255,255);
  cols.forEach(cc=>{doc.text(cc[0],x+cc[1]/2,y+rh/2+1.6,{align:'center'});x+=cc[1];});doc.setTextColor(0,0,0);y+=rh;
  let tcr=0,trv=0;
  entries.forEach((e,si)=>{
    const det=e.t+((e.items||e.note)?' - '+[e.items,e.note].filter(Boolean).join(' - '):'');
    if(e.t==='Credit')tcr+=e.a||0; if(e.t==='Received')trv+=e.a||0;
    const tm=String(e.d||'').split(' ')[1]||'';
    const nl=doc.splitTextToSize(String(det),cols[2][1]-3).length;
    const hh=Math.max(rh,Math.min(nl,3)*6);
    if(y+hh>282){doc.addPage();y=14;}
    let x2=M;cols.forEach(cc=>{doc.rect(x2,y,cc[1],hh,'D');x2+=cc[1];});
    doc.setFont('helvetica','normal');doc.setFontSize(10);
    doc.text(String(si+1),M+2,y+rh/2+1.2);
    doc.text(fmtDTs(e.d),M+12+2,y+rh/2+1.2);
    const ls=doc.splitTextToSize(String(det),cols[2][1]-3).slice(0,3);doc.text(ls,M+12+40+2,y+rh/2+1.2);
    const hcol=e.t==='Received'?GREEN:(e.t==='Credit'?[0,0,0]:[180,83,9]);
    doc.setFont('helvetica','bold');doc.setTextColor(hcol[0],hcol[1],hcol[2]);
    doc.text(rsFmt(e.a),M+bw-2,y+rh/2+1.6,{align:'right'});doc.setTextColor(0,0,0);
    y+=hh;});
  const srow=(label,val,col)=>{let x3=M;doc.rect(x3,y,bw-38,rh);doc.rect(x3+bw-38,y,38,rh);
    doc.setFont('helvetica','normal');doc.setFontSize(11);
    doc.text(label,x3+bw-38-2,y+rh/2+1.6,{align:'right'});
    doc.setTextColor(col[0],col[1],col[2]);doc.setFont('helvetica','bold');
    doc.text(rsFmt(val),x3+bw-2,y+rh/2+1.6,{align:'right'});doc.setTextColor(0,0,0);y+=rh;};
  srow('Total Credit',tcr,[0,0,0]); srow('Total Received',trv,GREEN);
  const due1=tcr-trv; srow('Total Due',due1,Math.abs(due1)<0.005?GREEN:RED);
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(140,140,140);
  doc.text('Generated by ReamBook',W/2,y+8,{align:'center'});doc.setTextColor(0,0,0);
  return doc.output('blob');
}
window.shareDateHistPDF=(id,dk)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c){toast('Credit not found');return;}
  if(!window.jspdf){toast('PDF engine loading...');return;}
  const entries=(c.log||[]).filter(e=>String(e.d||'').split(' ')[0]===dk);
  if(!entries.length){toast('No entries for this date');return;}
  try{
    const blob=dateHistPDF(c,dk,entries);
    const fn='HISTORY_'+(c.custId||c.id)+'_'+dk+'.pdf';
    const file=new File([blob],fn,{type:'application/pdf'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:'History '+dk}).catch(()=>{});
    }else{
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fn;a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast('PDF downloaded');
    }
  }catch(e){toast('PDF failed');}
};
window.delAllHist=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c||!c.log||!c.log.length){toast('No history to delete');return;}
  confirmDlg('Delete ALL history?','All '+c.log.length+' history entries for '+c.name+' will be removed. Balances stay unchanged.','DELETE ALL',()=>{
    c.log=[]; save(); creditHistory(id); renderCredit(); toast('All history deleted'); });
};
function selectedHistPDF(c,dates){
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,M=14,bw=W-2*M, prof=DB.profile, bc=billTheme();
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const A=hx(bc[0]),B=hx(bc[1]),TC=hx(bc[2]),RED=[220,38,38],GREEN=[22,163,74];
  const WH=[255,255,255], BH=46, GN=48;
  const txt=(t,x,yy,sz,bold,align,col)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(sz);const cc=col||[0,0,0];doc.setTextColor(cc[0],cc[1],cc[2]);doc.text(String(t),x,yy,{align:align||'left'});doc.setTextColor(0,0,0);};
  const head=(l1,l2,l3)=>{ for(let i=0;i<GN;i++){const k=i/(GN-1);doc.setFillColor(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k);doc.rect(W*i/GN,0,W/GN+0.3,BH,'F');}
    txt(String(prof.name||'ReamBook').toUpperCase(),W/2,11,20,true,'center',WH);
    const cl=[prof.address,prof.phone?('Phone: '+prof.phone):'',prof.email||''].filter(Boolean).join(' \u00b7 ');
  if(cl)txt(cl,W/2,19,9.5,false,'center',WH);
    txt(l1,M,28,14,true,'left',WH);
    let by=35;
    if(l2){txt(l2,W/2,by,10.5,false,'center',WH);by+=5.5;}
    if(l3){txt(l3,W/2,by,11,true,'center',WH);}
    return BH+10; };
  const cols=[['S.N',12],['Date/Time',40],['Details',bw-12-40-38],['Amount',38]];
  const tableHead=y=>{ const rh=8; let x=M; doc.setFillColor(TC[0],TC[1],TC[2]);
    cols.forEach(cc=>{doc.rect(x,y,cc[1],rh,'FD');x+=cc[1];}); x=M;
    doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(255,255,255);
    cols.forEach(cc=>{doc.text(cc[0],x+cc[1]/2,y+rh/2+1.6,{align:'center'});x+=cc[1];});
    doc.setTextColor(0,0,0); return y+rh; };
  const srow=(y,label,val,col)=>{ const rh=8; let x3=M;
    doc.rect(x3,y,bw-38,rh);doc.rect(x3+bw-38,y,38,rh);
    doc.setFont('helvetica','normal');doc.setFontSize(11);
    doc.text(label,x3+bw-38-2,y+rh/2+1.6,{align:'right'});
    doc.setTextColor(col[0],col[1],col[2]);doc.setFont('helvetica','bold');
    doc.text(rsFmt(val),x3+bw-2,y+rh/2+1.6,{align:'right'});doc.setTextColor(0,0,0);
    return y+rh; };
  const balCol=b=>Math.abs(b)<0.005?GREEN:RED;
  const log=c.log||[];
  let gCr=0,gRv=0; const dayT={};
  dates.forEach((dk,di)=>{
    if(di>0)doc.addPage();
    let y=head('CREDIT HISTORY','Customer: '+String(c.name||'')+'   (ID '+String(c.custId||c.id)+')','Date: '+fmtDate(dk));
    y=tableHead(y);
    const entries=log.filter(e=>String(e.d||'').split(' ')[0]===dk);
    let dCr=0,dRv=0; const rh=8;
    entries.forEach((e,si)=>{
      const det=e.t+((e.items||e.note)?' - '+[e.items,e.note].filter(Boolean).join(' - '):'');
      if(e.t==='Credit')dCr+=e.a||0; if(e.t==='Received')dRv+=e.a||0;
      const tm=String(e.d||'').split(' ')[1]||'';
      const nl=doc.splitTextToSize(String(det),cols[2][1]-3).length;
      const hh=Math.max(rh,Math.min(nl,3)*6);
      if(y+hh>282){doc.addPage();y=14;}
      let x2=M;cols.forEach(cc=>{doc.rect(x2,y,cc[1],hh,'D');x2+=cc[1];});
      doc.setFont('helvetica','normal');doc.setFontSize(10);
      doc.text(String(si+1),M+2,y+rh/2+1.2);
      doc.text(fmtDTs(e.d),M+12+2,y+rh/2+1.2);
      const ls=doc.splitTextToSize(String(det),cols[2][1]-3).slice(0,3);doc.text(ls,M+12+40+2,y+rh/2+1.2);
      const hcol=e.t==='Received'?GREEN:(e.t==='Credit'?[0,0,0]:[180,83,9]);
      doc.setFont('helvetica','bold');doc.setTextColor(hcol[0],hcol[1],hcol[2]);
      doc.text(rsFmt(e.a),M+bw-2,y+rh/2+1.6,{align:'right'});doc.setTextColor(0,0,0);
      y+=hh;});
    const dBal=dCr-dRv; dayT[dk]={cr:dCr,rv:dRv};
    y=srow(y,'Total Credit',dCr,[0,0,0]);
    y=srow(y,'Total Received',dRv,GREEN);
    y=srow(y,'Total Due',dBal,balCol(dBal));
    gCr+=dCr; gRv+=dRv;
  });
  doc.addPage();
  let y=head('GRAND TOTAL','Customer: '+String(c.name||'')+'   (ID '+String(c.custId||c.id)+')',
    'Dates: '+fmtDate(dates[0])+(dates.length>1?' to '+fmtDate(dates[dates.length-1]):'')+'  ('+dates.length+' date'+(dates.length>1?'s':'')+')');
  y+=6;
  const gc=[['Date',42],['Credit',40],['Received',40],['Pending',bw-42-40-40]];
  let gx=M;doc.setFillColor(TC[0],TC[1],TC[2]);
  gc.forEach(cc=>{doc.rect(gx,y,cc[1],8,'FD');gx+=cc[1];});gx=M;
  doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(255,255,255);
  gc.forEach(cc=>{doc.text(cc[0],gx+cc[1]/2,y+8/2+1.6,{align:'center'});gx+=cc[1];});doc.setTextColor(0,0,0);y+=8;
  dates.forEach(dk=>{
    const dt=dayT[dk]||{cr:0,rv:0}, dB=dt.cr-dt.rv;
    if(y+8>282){doc.addPage();y=14;}
    let x2=M;gc.forEach(cc=>{doc.rect(x2,y,cc[1],8,'D');x2+=cc[1];});
    doc.setFont('helvetica','normal');doc.setFontSize(10);
    doc.text(fmtDate(dk),M+2,y+8/2+1.2);
    doc.text(rsFmt(dt.cr),M+42+40-2,y+8/2+1.6,{align:'right'});
    doc.setTextColor(GREEN[0],GREEN[1],GREEN[2]);
    doc.text(rsFmt(dt.rv),M+42+40+40-2,y+8/2+1.6,{align:'right'});
    doc.setTextColor(0,0,0);
    const pc=balCol(dB);doc.setFont('helvetica','bold');
    doc.setTextColor(pc[0],pc[1],pc[2]);
    doc.text(rsFmt(dB),M+bw-2,y+8/2+1.6,{align:'right'});
    doc.setTextColor(0,0,0);y+=8;});
  y+=6;
  const gBal=gCr-gRv;
  y=srow(y,'Total Credit',gCr,[0,0,0]);
  y=srow(y,'Total Received',gRv,GREEN);
  doc.setFont('helvetica','bold');doc.setFontSize(14);
  doc.setTextColor(RED[0],RED[1],RED[2]);
  y=srow(y,'MASTER TOTAL BALANCE',gBal,balCol(gBal));
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(140,140,140);
  doc.text('Generated by ReamBook',W/2,y+10,{align:'center'});doc.setTextColor(0,0,0);
  return doc.output('blob');
}
window.genHistPDF=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c)return;
  if(!window.jspdf){toast('PDF engine loading...');return;}
  const dates=histSelDates.slice().sort();
  if(!dates.length){toast('Select at least one date');return;}
  try{
    const blob=selectedHistPDF(c,dates);
    const fn='HISTORY_'+(c.custId||c.id)+'_'+dates.length+'dates.pdf';
    const file=new File([blob],fn,{type:'application/pdf'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:'History '+dates.length+' dates'}).catch(()=>{});
    }else{
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fn;a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast('PDF downloaded');
    }
  }catch(e){toast('PDF failed');}
};
window.shareBillPDF=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s){toast('Sale not found');return;}
  if(!window.jspdf){toast('PDF engine loading...');return;}
  try{
    const blob=billPDF(s);
    const file=new File([blob],'BILL_'+s.id+'.pdf',{type:'application/pdf'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:'Bill #'+s.id}).catch(()=>{});
    }else{
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='BILL_'+s.id+'.pdf';a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast('⬇️ PDF downloaded');
    }
  }catch(e){toast('PDF failed');}
};

/* ================= BILL / CREDIT IMAGE SHARE (v201) ================= */
function _wrapCv(ctx,text,maxW){
  const words=String(text==null?'':text).split(/\s+/).filter(Boolean);
  if(!words.length) return [''];
  const lines=[]; let cur='';
  for(const w of words){ const t=cur?cur+' '+w:w;
    if(ctx.measureText(t).width>maxW&&cur){ lines.push(cur); cur=w; } else cur=t; }
  if(cur) lines.push(cur);
  return lines;
}
function _fitFont(ctx,text,maxW,start){
  let sz=start; ctx.font='800 '+sz+'px system-ui, Roboto, sans-serif';
  while(sz>16&&ctx.measureText(text).width>maxW){ sz-=2; ctx.font='800 '+sz+'px system-ui, Roboto, sans-serif'; }
}
function _shareCanvasImage(cv,fname,title){
  if(window.AndroidApp&&AndroidApp.shareImage){ try{ AndroidApp.shareImage(cv.toDataURL('image/png'),fname); return; }catch(e){} }
  cv.toBlob(b=>{
    if(!b){ toast('Image failed'); return; }
    const file=new File([b],fname,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){ navigator.share({files:[file],title:title}).catch(()=>{}); }
    else{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=fname; a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),5000); toast('⬇️ Image saved'); }
  },'image/png');
}
function _billCanvas(s){
  const bc=billTheme(), prof=DB.profile;
  const W=920,P=40,iw=W-2*P;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=3600;
  const x=cv.getContext('2d');
  const F=(sz,b)=>(b?'800 ':'600 ')+sz+'px system-ui, Roboto, sans-serif';
  x.fillStyle='#ffffff'; x.fillRect(0,0,W,3600);
  const g=x.createLinearGradient(0,0,W,0); g.addColorStop(0,bc[0]); g.addColorStop(1,bc[1]);
  x.fillStyle=g; x.fillRect(0,0,W,172);
  x.fillStyle='#fff'; x.textAlign='center';
  const nm=String(prof.name||'ReamBook').toUpperCase();
  _fitFont(x,nm,iw,46); x.fillText(nm,W/2,66);
  const cl=[prof.address,prof.phone?('Phone: '+prof.phone):'',prof.email||''].filter(Boolean).join('  ·  ');
  x.font=F(23,false); if(cl) x.fillText(cl,W/2,108);
  x.font=F(26,true); x.fillText(s.kind==='wholesale'?'WHOLESALE':'SHOP SALE',W/2,150);
  x.textAlign='left'; x.fillStyle='#14213d';
  const d=new Date(s.ts||Date.now());
  const ds=d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  let y=172+54;
  const meta=(l1,v1,l2,v2)=>{
    x.font=F(25,true); x.fillText(l1,P,y);
    const w1=x.measureText(l1).width; x.font=F(25,false); x.fillText(String(v1),P+w1+8,y);
    x.font=F(25,false); const rv=String(v2),wv=x.measureText(rv).width;
    x.font=F(25,true); const wl=x.measureText(l2).width;
    x.fillText(l2,W-P-wv-wl-8,y); x.font=F(25,false); x.fillText(rv,W-P-wv,y);
    y+=46;
  };
  meta('Name:',s.customer||'-','Bill No.',s.id);
  meta('Contact:',s.phone||'—','Date:',ds);
  y+=10;
  const cols=[['S.N',0.08],['Name of Item',0.44],['Qty',0.10],['Rate',0.16],['Amount',0.22]];
  const cx=[]; { let ax=P; for(const c of cols){ cx.push(ax); ax+=c[1]*iw; } }
  const rowH=48;
  const hline=()=>{ x.strokeStyle='#d9dee6'; x.lineWidth=1.5; x.beginPath(); x.moveTo(P,y); x.lineTo(W-P,y); x.stroke(); };
  x.fillStyle=bc[2]; x.fillRect(P,y,iw,rowH);
  x.fillStyle='#fff'; x.font=F(24,true);
  cols.forEach((c,i)=>{ const w=c[1]*iw;
    if(i<2){ x.textAlign='left'; x.fillText(c[0],cx[i]+(i?10:6),y+33); }
    else{ x.textAlign='right'; x.fillText(c[0],cx[i]+w-8,y+33); } });
  x.textAlign='left'; y+=rowH; hline();
  x.fillStyle='#14213d';
  (s.items||[]).forEach((it,i)=>{
    x.font=F(24,false);
    const lines=_wrapCv(x,it.name||'',cols[1][1]*iw-16).slice(0,3);
    const hh=Math.max(rowH,lines.length*30+16);
    x.fillText(String(i+1)+'.',cx[0]+6,y+33);
    lines.forEach((ln,li)=>x.fillText(ln,cx[1]+10,y+33+li*30));
    x.textAlign='right';
    x.fillText(String(it.qty),cx[2]+cols[2][1]*iw-8,y+33);
    x.fillText(rsFmt(it.price),cx[3]+cols[3][1]*iw-8,y+33);
    x.font=F(24,true); x.fillText(rsFmt((it.qty||0)*(it.price||0)),cx[4]+cols[4][1]*iw-8,y+33);
    x.textAlign='left'; x.font=F(24,false); y+=hh; hline();
  });
  const totRow=(label,val,big,col)=>{
    x.fillStyle=col||'#14213d'; x.textAlign='right';
    x.font=F(big?29:24,true); x.fillText(val,W-P-8,y+36);
    x.font=F(24,true); x.fillText(label,cx[4]-16,y+36);
    x.textAlign='left'; y+=rowH; hline();
  };
  const disc=(s.discount||0), corr=(s.correctTotal!=null?s.correctTotal:s.total);
  if(disc>0.005){ const pct=corr>0?(disc/corr*100).toFixed(1).replace(/\.0$/,'')+'%':'';
    totRow('Total',rsFmt(corr)); totRow('Discount'+(pct?' - '+pct:''),rsFmt(-disc)); }
  totRow('Total',rsFmt(s.total),true);
  totRow(s.unpaid?'Not Received':'Received',rsFmt(s.total),true,s.unpaid?'#dc2626':'#16a34a');
  y+=16; x.fillStyle='#14213d'; x.font=F(22,false);
  _wrapCv(x,'In Word: '+numToWords(s.total),iw).forEach(ln=>{ x.fillText(ln,P,y); y+=30; });
  y+=12;
  const th=76;
  x.strokeStyle='#d9dee6'; x.lineWidth=1.5; x.strokeRect(P,y,iw,th);
  x.fillStyle='#14213d'; x.font=F(27,true); x.textAlign='center';
  x.fillText('Thanks For Shopping — '+String(prof.name||'ReamBook'),W/2,y+48);
  x.textAlign='left';
  y+=th+36;
  x.fillStyle='#8a94a3'; x.font=F(20,false); x.textAlign='center';
  x.fillText('Generated by ReamBook',W/2,y); x.textAlign='left';
  const out=document.createElement('canvas'); out.width=W; out.height=y+34;
  const ox=out.getContext('2d'); ox.fillStyle='#fff'; ox.fillRect(0,0,W,out.height);
  ox.drawImage(cv,0,0,W,out.height,0,0,W,out.height);
  return out;
}
window.shareBillImage=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s){ toast('Sale not found'); return; }
  try{ _shareCanvasImage(_billCanvas(s),'BILL_'+s.id+'.png','Bill #'+s.id); }
  catch(e){ toast('Image failed'); }
};
function _creditCanvas(c){
  const bc=billTheme(), prof=DB.profile, b=custBal(c), dsc=custDisc(c);
  const W=920,P=40,iw=W-2*P;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=3600;
  const x=cv.getContext('2d');
  const F=(sz,bb)=>(bb?'800 ':'600 ')+sz+'px system-ui, Roboto, sans-serif';
  x.fillStyle='#ffffff'; x.fillRect(0,0,W,3600);
  const g=x.createLinearGradient(0,0,W,0); g.addColorStop(0,bc[0]); g.addColorStop(1,bc[1]);
  x.fillStyle=g; x.fillRect(0,0,W,172);
  x.fillStyle='#fff'; x.textAlign='center';
  const nm=String(prof.name||'ReamBook').toUpperCase();
  _fitFont(x,nm,iw,46); x.fillText(nm,W/2,66);
  const cl=[prof.address,prof.phone?('Phone: '+prof.phone):'',prof.email||''].filter(Boolean).join('  ·  ');
  x.font=F(23,false); if(cl) x.fillText(cl,W/2,108);
  x.font=F(26,true); x.fillText('CREDIT STATEMENT',W/2,150);
  x.textAlign='left'; x.fillStyle='#14213d';
  let y=172+54;
  const meta=(l1,v1,l2,v2)=>{
    x.font=F(25,true); x.fillText(l1,P,y);
    const w1=x.measureText(l1).width; x.font=F(25,false); x.fillText(String(v1),P+w1+8,y);
    if(l2){ x.font=F(25,false); const rv=String(v2),wv=x.measureText(rv).width;
      x.font=F(25,true); const wl=x.measureText(l2).width;
      x.fillText(l2,W-P-wv-wl-8,y); x.font=F(25,false); x.fillText(rv,W-P-wv,y); }
    y+=46;
  };
  meta('Customer:',c.name||'-','ID',c.custId||c.id);
  meta('Contact:',c.phone||'—','Date:',new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}));
  y+=8;
  const hline=()=>{ x.strokeStyle='#d9dee6'; x.lineWidth=1.5; x.beginPath(); x.moveTo(P,y); x.lineTo(W-P,y); x.stroke(); };
  const kvRow=(label,val,big,col)=>{
    x.fillStyle=col||'#14213d'; x.textAlign='left';
    x.font=F(big?27:24,big); x.fillText(label,P,y+34);
    x.textAlign='right'; x.font=F(big?29:24,true); x.fillText(val,W-P-4,y+34);
    x.textAlign='left'; y+=50; hline();
  };
  if(c.items&&c.items.length){
    x.font=F(24,true); x.fillText('Items:',P,y+30); y+=48; hline();
    c.items.forEach(l=>{
      const amt=(l.total!=null?l.total:(l.qty||0)*(l.rate||0));
      kvRow(String(l.name||'')+' × '+(l.qty||0),pkr(amt));
    });
  } else if(c.product){ kvRow('Item',String(c.product)); }
  y+=8;
  kvRow('💰 Credit given',pkr(c.credit));
  kvRow('💵 Received',pkr(c.received),false,'#16a34a');
  if(dsc>0.005) kvRow('🏷️ Discount','−'+pkr(dsc),false,'#16a34a');
  kvRow('📌 Total Balance',pkr(b),true,Math.abs(b)<0.005?'#16a34a':'#dc2626');
  if(c.promiseDate){ y+=10; x.font=F(23,false); x.fillStyle='#14213d';
    x.fillText('⏰ Promise: '+fmtDate(c.promiseDate)+(c.promiseTime?' · '+c.promiseTime:''),P,y+30); y+=44; }
  y+=30; x.fillStyle='#8a94a3'; x.font=F(20,false); x.textAlign='center';
  x.fillText('Generated by ReamBook',W/2,y); x.textAlign='left';
  const out=document.createElement('canvas'); out.width=W; out.height=y+34;
  const ox=out.getContext('2d'); ox.fillStyle='#fff'; ox.fillRect(0,0,W,out.height);
  ox.drawImage(cv,0,0,W,out.height,0,0,W,out.height);
  return out;
}
window.shareCreditImage=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c){ toast('Credit not found'); return; }
  try{ _shareCanvasImage(_creditCanvas(c),'CREDIT_'+(c.custId||c.id)+'.png','Credit statement'); }
  catch(e){ toast('Image failed'); }
};
