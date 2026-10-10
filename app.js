/* ================= Paper Stock v1 ================= */
const DB_KEY = 'paperstock_v1';
let DB = null;
const $ = id => document.getElementById(id);
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pkr = n => curCode() + ' ' + Number(n||0).toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2});
const dstr = d => { d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
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
function defDB(){ return { profile:{name:'Paper Store',email:'',logo:''}, products:[], sales:[], expenses:[], customers:[], printQueue:[], seq:{p:1,s:1,e:1,c:1,item:1} }; }
function load(){ try{ DB=JSON.parse(localStorage.getItem(DB_KEY))||defDB(); }catch(e){ DB=defDB(); } if(!DB.seq)DB.seq={p:1,s:1,e:1,c:1,item:1}; if(!DB.printQueue)DB.printQueue=[]; if(!DB.profile)DB.profile=defDB().profile; if(!DB.profile.currency)DB.profile.currency=detectCurrency(); }
function save(){ localStorage.setItem(DB_KEY,JSON.stringify(DB)); }

/* ---------- Cloud sync (Gmail login) ---------- */
let syncCtl=null, applyingRemote=false, syncedAt=0;
try{ syncedAt=+(localStorage.getItem('ps_synced_at')||0); }catch(e){}
const _saveLocal=save;
save=function(){ _saveLocal(); if(syncCtl&&!applyingRemote){ syncCtl.schedulePush(); setSyncPill('backing'); } };
function setSyncPill(mode){
  const p=$('sync-pill'); if(!p) return;
  if(mode==='off'||!window.PaperAuth||!PaperAuth.getToken()){ p.classList.add('hidden'); return; }
  p.classList.remove('hidden');
  p.innerHTML = mode==='backing' ? '<span class="spin">↻</span> Backing up...' : '✓ Synced';
}
function applyRemote(data,updatedAt){
  if(!data||!updatedAt||updatedAt<=syncedAt) return;
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
    return `<button class="btn-go" style="width:100%;margin-bottom:4px" onclick="PaperAuth.login()">🔐 Login with Gmail</button>
    <div class="sub" style="text-align:center;margin-bottom:10px">Ek login — 5 devices par apna data sync</div>`;
  let u=null; try{ u=JSON.parse(localStorage.getItem('ps_user')||'null'); }catch(e){}
  const nm=u?(u.name||u.email):'...', em=u?(u.email||''):'' ;
  const av=u&&u.picture?`<img src="${u.picture}">`:esc((nm||'G').charAt(0).toUpperCase());
  return `<div class="mrow" style="align-items:center;margin-bottom:10px">
    <div class="pavatar" style="width:44px;height:44px;font-size:18px;flex-shrink:0">${av}</div>
    <div style="flex:1;min-width:0"><b style="font-size:15px">${esc(nm)}</b><div class="sub">${esc(em)}</div></div>
    <button class="btn-ghost" style="flex-shrink:0" onclick="doLogout()">Logout</button></div>`;
}
window.doLogout=()=>{ if(!window.PaperAuth) return;
  PaperAuth.logout().then(()=>{ try{ localStorage.removeItem('ps_user'); localStorage.removeItem('ps_synced_at'); }catch(e){} location.reload(); });
};
function initAuth(){
  if(!window.PaperAuth) return;
  const fresh=PaperAuth.handleAuthRedirect();
  if(!PaperAuth.isConfigured()||!PaperAuth.getToken()) return;
  if(fresh||!localStorage.getItem('ps_user'))
    PaperAuth.api('/api/me').then(me=>{ try{ localStorage.setItem('ps_user',JSON.stringify(me)); }catch(e){} }).catch(()=>{});
  syncCtl=PaperAuth.startAutoSync(()=>DB, applyRemote, ts=>{ syncedAt=ts||Date.now(); try{ localStorage.setItem('ps_synced_at',syncedAt); }catch(e){} setSyncPill('synced'); });
    setSyncPill('synced');
}

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
$('sheet').onclick=e=>{ if(e.target.id==='sheet') closeSheet(); };
/* Clean trash icon used for every delete option */
const TRASH='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

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
function renderStoreName(){ $('store-name').textContent = DB.profile.name||'Paper Store';
  $('btn-profile').innerHTML = DB.profile.logo?`<img class="tb-logo" src="${DB.profile.logo}">`:'👤'; }
window.setStoreLogo=input=>{ readImg(input.files[0],url=>{ if(!url) return;
  DB.profile.logo=url; save(); renderStoreName(); $('btn-profile').click(); toast('✅ Store photo updated'); }); };
/* ================= APP THEMES ================= */
const THEMES=[
 {id:'ocean',name:'Ocean Blue',g:'linear-gradient(135deg,#102c6b,#4a86f5)'},
 {id:'emerald',name:'Emerald Green',g:'linear-gradient(135deg,#0f6b49,#16c475)'},
 {id:'purple',name:'Royal Purple',g:'linear-gradient(135deg,#471c7d,#875ff0)'},
 {id:'orange',name:'Sunset Orange',g:'linear-gradient(135deg,#8a3a1c,#e5862c)'},
 {id:'midnight',name:'Midnight Gold',g:'linear-gradient(135deg,#131c2e,#3e4c60)'},
 {id:'red',name:'Cherry Red',g:'linear-gradient(135deg,#521010,#e03232)'},
 {id:'pink',name:'Rose Pink',g:'linear-gradient(135deg,#5c1630,#e03283)'},
 {id:'brown',name:'Coffee Brown',g:'linear-gradient(135deg,#362115,#976637)'},
 {id:'olive',name:'Olive Green',g:'linear-gradient(135deg,#223a08,#70b012)'},
 {id:'wine',name:'Wine Burgundy',g:'linear-gradient(135deg,#360b14,#c42544)'},
 {id:'sunset',name:'Sunset Glow',g:'linear-gradient(135deg,#7933e0,#f7a716)'},
 {id:'grey',name:'Slate Grey',g:'linear-gradient(135deg,#1a2332,#78828f)'},
 {id:'cyan',name:'Aqua Cyan',g:'linear-gradient(135deg,#0d3d52,#2fd8f2)'},
 {id:'classic',name:'Classic Blue',g:'linear-gradient(135deg,#1268b1,#14b2d6)'},
];
function curTheme(){ const id=DB&&DB.profile&&DB.profile.theme; return THEMES.some(x=>x.id===id)?id:'ocean'; }
function applyTheme(id){ document.body.dataset.theme=id; }
function themeName(id){ const x=THEMES.find(y=>y.id===id); return x?x.name:'Ocean Blue'; }
function themeDot(id){ const x=THEMES.find(y=>y.id===id)||THEMES[0]; return `<span class="theme-dot sm" style="background:${x.g}"></span>`; }
window.setTheme=id=>{ if(!THEMES.some(x=>x.id===id)) return; DB.profile.theme=id; save(); applyTheme(id); openThemePicker(); };
window.openThemePicker=()=>{
  const c=curTheme();
  openSheet(`<h3>🎨 Colors Theme</h3><div class="sub" style="margin-bottom:8px">Pick a theme — it stays until you change it.</div>`+
   THEMES.map(x=>`<div class="menu-row" onclick="setTheme('${x.id}')"><span class="ic"><span class="theme-dot sm" style="background:${x.g}"></span></span><span>${x.name}</span>${x.id===c?'<span class="arw" style="color:var(--teal)">✓</span>':'<span class="arw">›</span>'}</div>`).join('')+
   `<div class="mrow"><button class="btn-ghost" onclick="$('btn-profile').click()">Back</button></div>`);
};
$('btn-profile').onclick=()=>{
  const p=DB.profile, init=(p.name||'P').slice(0,1).toUpperCase();
  const av=p.logo?`<img src="${p.logo}">`:esc(init);
  openSheet(`${authSection()}<div class="profile-top"><div class="pav-wrap"><div class="pavatar">${av}</div>
    <button class="pav-cam" onclick="$('logo-file').click()" title="Store photo">📷</button></div>
    <div><b style="font-size:19px">${esc(p.name||'Paper Store')}</b><button class="pname-edit" onclick="editProfile()" title="Rename">✏️</button><div class="sub">${esc(p.email||'')}</div></div></div>
    <input type="file" id="logo-file" accept="image/*" class="hidden" onchange="setStoreLogo(this)">
    <div class="lbl" style="margin:10px 0">YOUR DATA</div>
    <div class="mrow" style="margin-bottom:6px">
      <button class="btn-ghost" onclick="cloudBackup()">☁️⬆️<br><b>Back up</b><br><small>Download file</small></button>
      <button class="btn-ghost" onclick="$('import-file').click()">⬇️<br><b>Restore</b><br><small>From file</small></button>
    </div>
    <input type="file" id="import-file" accept=".json" class="hidden" onchange="importBackup(this)">
    <div class="menu-row" onclick="openThemePicker()"><span class="ic">${themeDot(curTheme())}</span> Colors Theme <span class="sub">${themeName(curTheme())}</span><span class="arw">›</span></div>
    <div class="menu-row" onclick="exportCSV('sales')"><span class="ic">⬇️</span> Export data <span class="sub">Sales / inventory CSV</span><span class="arw">›</span></div>
    <div class="menu-row" onclick="editProfile()"><span class="ic">✏️</span> Edit business name<span class="arw">›</span></div>
    <div class="menu-row danger-t" onclick="resetAll()"><span class="ic">${TRASH}</span> Delete all data<span class="arw">›</span></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Close</button></div>`);
};
$('btn-backup').onclick=()=>{ cloudBackup(); };
window.cloudBackup=()=>{
  const blob=new Blob([JSON.stringify(DB,null,1)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='paper-stock-backup-'+dstr()+'.json'; a.click(); URL.revokeObjectURL(a.href);
  toast('✅ Backup downloaded!');
};
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
window.saveProfile=()=>{ DB.profile.name=$('pf-name').value.trim()||'Paper Store'; DB.profile.phone=$('pf-phone').value.trim(); DB.profile.address=$('pf-addr').value.trim(); DB.profile.email=$('pf-email').value.trim(); save(); renderStoreName(); closeSheet(); toast('✅ Saved'); };
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
function grossProfit(){ return DB.sales.reduce((s,x)=>s+x.items.reduce((a,i)=>a+i.qty*((i.price||0)-(i.cost||0)),0),0); }
function renderSales(){
  const tot=DB.sales.reduce((s,x)=>s+x.total,0);
  const exp=DB.expenses.reduce((s,x)=>s+x.amount,0);
  $('s-total').textContent=pkr(tot); $('s-exp').textContent=pkr(exp); paintCur();
  $('s-profit').textContent=pkr(grossProfit()-exp); // expense minus from profit
  $('sale-date-txt').textContent=fmtDate(saleDate);
  if(!$('exp-date').value) $('exp-date').value=dstr();
  $('sale-dd').classList.add('hidden'); renderSaleCart(); renderDaySales();
}
function fmtDate(ds){ const d=new Date(ds+'T12:00'); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
$('seg-sale').onclick=()=>{ saleMode='sale'; $('seg-sale').classList.add('active'); $('seg-exp').classList.remove('active'); $('sale-form').classList.remove('hidden'); $('exp-form').classList.add('hidden'); };
$('seg-exp').onclick=()=>{ saleMode='exp'; $('seg-exp').classList.add('active'); $('seg-sale').classList.remove('active'); $('exp-form').classList.remove('hidden'); $('sale-form').classList.add('hidden'); };
$('sale-date-pill').onclick=()=>$('sale-date').click();
$('sale-date').onchange=e=>{ if(e.target.value){ saleDate=e.target.value; $('sale-date-txt').textContent=fmtDate(saleDate); } };
/* ---- NADIR-style search dropdown + multi-item cart ---- */
let saleCart=[];
$('sale-psearch').oninput=e=>{ salePickId=null; renderSaleDD(e.target.value.toLowerCase().trim()); };
document.addEventListener('click',e=>{ if(!e.target.closest('.dd-wrap')) $('sale-dd').classList.add('hidden'); });
function renderSaleDD(q){
  const dd=$('sale-dd');
  if(!q){ dd.classList.add('hidden'); dd.innerHTML=''; return; }
  const list=DB.products.filter(p=>p.qty>0&&(p.name.toLowerCase().includes(q)||String(p.itemId).includes(q))).slice(0,8);
  dd.innerHTML=list.map(p=>`
    <div class="dd-item" onclick="pickSaleDD(${p.id})">${pimg(p,'dd-img')}
      <div style="flex:1;min-width:0"><div class="nm">${esc(p.name)}</div>
      <div class="sp">Sell Price <span class="dots">:</span> <b class="r">${pkr(p.sell)}</b></div>
      <div class="sub">left: ${p.qty} ${esc(p.unit)}</div></div>
    </div>`).join('')||'<p class="note">No product found</p>';
  dd.classList.remove('hidden');
}
window.pickSaleDD=id=>{
  const p=DB.products.find(x=>x.id===id); if(!p) return;
  salePickId=id;
  $('sale-psearch').value=p.name;
  $('sale-dd').classList.add('hidden');
  $('sale-cost').value=p.cost.toFixed(2);
  $('sale-total-in').value=(cartGrand()+p.sell*($('sale-qty').value||1)).toFixed(0); // running bill total
};
$('sale-qty').oninput=()=>{ const p=DB.products.find(x=>x.id===salePickId);
  if(p) $('sale-total-in').value=(cartGrand()+p.sell*($('sale-qty').value||1)).toFixed(0); };
function cartGrand(){ return saleCart.reduce((s,i)=>s+i.total,0); }
function renderSaleCart(){
  const box=$('sale-cart');
  if(!saleCart.length){ box.innerHTML=''; return; }
  box.innerHTML='<div class="cart-box">'+saleCart.map((i,ix)=>`
    <div class="cart-row"><div><b>${esc(i.name)}</b><div class="sub">${i.qty} × ${pkr(i.unit)} = ${pkr(i.total)}</div></div>
    <button class="cart-x" onclick="rmCartItem(${ix})">✕</button></div>`).join('')+
    `<div class="cart-total"><span>Items total</span><b>${pkr(cartGrand())}</b></div></div>`;
}
window.rmCartItem=ix=>{ saleCart.splice(ix,1); renderSaleCart(); };
/* Staged product -> a sale line. Line total = bill field minus cart sum (item's share of the bill). */
function stageLine(){
  const p=DB.products.find(x=>x.id===salePickId);
  if(!p||!$('sale-psearch').value.trim()) return null;
  const q=Math.max(1,parseInt($('sale-qty').value)||1);
  if(q>p.qty){ toast('Only '+p.qty+' in stock!'); return 'err'; }
  const bill=parseFloat($('sale-total-in').value)||0;
  let lineTotal=bill-cartGrand();
  if(!(lineTotal>0)) lineTotal=q*p.sell;
  return {productId:p.id,name:p.name,qty:q,unit:p.sell,total:lineTotal,cost:p.cost};
}
function clearStaging(){ salePickId=null; $('sale-psearch').value=''; $('sale-cost').value=''; $('sale-qty').value=1;
  $('sale-total-in').value=cartGrand().toFixed(0); }
$('btn-add-item').onclick=()=>{
  const it=stageLine();
  if(it==='err') return;
  if(!it){ toast('Search and select a product first'); return; }
  saleCart.push(it); clearStaging();
  renderSaleCart(); toast('✅ Added: '+it.name);
};
$('sale-add-cust').onclick=()=>{ $('sale-cust').classList.remove('hidden'); $('sale-cust-phone').classList.remove('hidden'); $('sale-add-cust').classList.add('hidden'); $('sale-cust').focus(); };
$('btn-sold').onclick=()=>{
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
  const base=rateSum>0?rateSum:1;
  let acc=0;
  const items=lines.map((l,ix)=>{
    const pr=DB.products.find(x=>x.id===l.productId); pr.qty-=l.qty;
    let share;
    if(ix<lines.length-1){ share=Math.round(bill*(l.qty*l.unit/base)*100)/100; acc+=share; }
    else share=Math.round((bill-acc)*100)/100; // last line absorbs rounding
    return {productId:l.productId,name:l.name,qty:l.qty,price:share/l.qty,cost:pr.cost};
  });
  const firstBrand=lines.length===1?((DB.products.find(x=>x.id===lines[0].productId)||{}).brand||''):'';
  const sale={id:DB.seq.s++, productId:lines.length===1?lines[0].productId:null,
    name:lines.length===1?lines[0].name:(lines.length+' items'), brand:firstBrand,
    qty:lines.reduce((s,l)=>s+l.qty,0), total:bill,
    customer:$('sale-cust').value.trim(), phone:$('sale-cust-phone').value.trim(), date:saleDate, ts:new Date(saleDate+'T12:00').getTime(), items};
  DB.sales.push(sale);
  DB.printQueue.push({qid:Date.now(), saleId:sale.id, done:false, ts:Date.now()}); // pending print
  save(); saleCart=[]; renderSaleCart(); clearStaging(); $('sale-cust').value=''; $('sale-cust-phone').value='';
  renderSales(); updatePrintBadge(); toast('✅ Sold! '+pkr(bill));
};
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
  window.retStep=d=>{ R.n=Math.min(maxQ,Math.max(1,R.n+d)); paint(); };
  window.retSet=v=>{ R.n=Math.min(maxQ,Math.max(1,parseInt(v)||1)); paint(); };
  window.retGo=unpaid=>{ if(unpaid) markSaleUnpaid(saleId); else doReturn(saleId,ix,R.n); };
  const stepHtml=maxQ>1?`<div class="ret-card col"><div class="lbl-c">HOW MANY TO RETURN</div>
    <div class="ret-step"><button id="ret-minus" class="step-btn" onclick="retStep(-1)">−</button>
    <input id="ret-n-in" type="number" min="1" max="${maxQ}" value="${R.n}" oninput="retSet(this.value)">
    <button id="ret-plus" class="step-btn" onclick="retStep(1)">+</button></div>
    <div class="sub-c">of ${maxQ} sold</div>
    <div class="ret-quick"><button class="chip-btn" onclick="retSet(1)">Return 1</button><button class="chip-btn" onclick="retSet(${maxQ})">Return all ${maxQ}</button></div></div>`:'';
  openSheet(`<h3>Return item <button class="link-btn" style="float:right" onclick="closeSheet()">Cancel</button></h3>
  <div class="ret-card"><div><b>${esc(it.name||s.name)}</b><div class="sub">${tstr} · Qty ${maxQ}</div></div><b>${pkr(unit*maxQ)}</b></div>
  ${stepHtml}
  <div class="ret-refund"><span>Refund</span><b id="ret-refund"></b></div>
  <p class="note">Returned quantity goes back into stock.</p>
  <button class="btn-unpaid" onclick="retGo(true)">Mark as unpaid</button>
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

/* ---- Return from bundle: checkbox select sheet (reference style) ---- */
window.returnSale=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s) return;
  const its=saleItems(s); if(!its.length) return;
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
  const setQ=(i,v)=>{ rq[i]=Math.min(Math.max(1,parseInt(v)||1),its[i].qty||1); paint(); };
  window.bunMinus=i=>setQ(i,rq[i]-1);
  window.bunPlus=i=>setQ(i,rq[i]+1);
  window.bunSet=(i,v)=>setQ(i,v);
  window.bunOne=i=>setQ(i,1);
  window.bunAll=i=>setQ(i,its[i].qty||1);
  window.bunGo=()=>{ const list=[...sel].map(i=>({ix:i,n:rq[i]})).filter(x=>x.n>0); if(!list.length) return; doReturnBundle(id,list); };
  window.bunUnpaid=()=>markSaleUnpaid(id);
  openSheet(`<h3>Return from bundle <button class="link-btn" style="float:right" onclick="closeSheet()">Cancel</button></h3>
  <div class="bun-head"><div style="display:flex;align-items:center;gap:10px"><span class="bun-ico">\uD83D\uDCE6</span><span>Bundle \u00B7 ${its.length} items</span></div><b>${pkr(s.total)}</b></div>
  <div class="bun-selrow"><span id="bun-count"></span><button class="link-btn" id="bun-toggle" onclick="bunTogAll()"></button></div>
  <div class="ret-card col bun-list">${its.map((it,i)=>`
    <div class="bun-item" onclick="bunTog(${i})"><span class="bun-check sel" id="bun-chk-${i}">\u2713</span>
    <div class="bun-nm">${esc(it.name||s.name)}<div class="sub">Qty ${it.qty}</div>
    ${(it.qty||0)>1?`<div class="bun-ret" id="bun-ret-${i}" onclick="event.stopPropagation()">
      <span class="lbl">Returning</span>
      <button class="mini-btn" onclick="event.stopPropagation();bunMinus(${i})">\u2212</button>
      <input class="bun-qty-in" id="bun-q-${i}" type="number" min="1" max="${it.qty}" value="${it.qty}" oninput="bunSet(${i},this.value)" onclick="event.stopPropagation()">
      <button class="mini-btn" onclick="event.stopPropagation();bunPlus(${i})">+</button></div>
    <div class="ret-quick" id="bun-chips-${i}" style="justify-content:flex-start" onclick="event.stopPropagation()">
      <button class="chip-btn" onclick="bunOne(${i})">Return 1</button>
      <button class="chip-btn fill" onclick="bunAll(${i})">Return all ${it.qty}</button></div>`:''}
    </div><b>${pkr(Math.round(it.qty*(it.price||0)*100)/100)}</b></div>`).join('')}</div>
  <div class="ret-refund"><span id="bun-rlabel">Whole bundle</span><b id="bun-refund"></b></div>
  <p class="note" id="bun-note"></p>
  <button class="btn-unpaid" onclick="bunUnpaid()">Mark bundle as unpaid</button>
  <button class="btn-return" id="bun-go" onclick="bunGo()"></button>`);
  paint();
};
function doReturnBundle(saleId,list){
  const s=DB.sales.find(x=>x.id===saleId); if(!s){ closeSheet(); return; }
  const its=saleItems(s);
  let refund=0;
  [...list].sort((a,b)=>b.ix-a.ix).forEach(o=>{
    const it=its[o.ix]; if(!it) return;
    const n=Math.min(Math.max(1,o.n||1),it.qty||1);
    refund=Math.round((refund+n*(it.price||0))*100)/100;
    const pr=DB.products.find(x=>x.id===it.productId); if(pr) pr.qty+=n;
    if(s.items&&s.items.length){ it.qty-=n; if(it.qty<=0) s.items.splice(o.ix,1); }
    else { s.qty=Math.max(0,(s.qty||0)-n); }
  });
  if(s.items&&s.items.length){
    const left=saleItems(s);
    s.qty=left.reduce((tt,it)=>tt+it.qty,0);
    s.total=Math.round((s.total-refund)*100)/100;
    s.name=left.length===1?left[0].name:(left.length+' items');
    if(!left.length){ DB.sales=DB.sales.filter(x=>x.id!==saleId); DB.printQueue=DB.printQueue.filter(q=>q.saleId!==saleId); }
  } else {
    s.total=Math.round((s.total-refund)*100)/100;
    if((s.qty||0)<=0){ DB.sales=DB.sales.filter(x=>x.id!==saleId); DB.printQueue=DB.printQueue.filter(q=>q.saleId!==saleId); }
  }
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
let expSaleId=null;
window.toggleSaleExp=id=>{ expSaleId=(expSaleId===id?null:id); renderDaySales(); };
function hhmm(ts){ try{ return new Date(ts).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); }catch(e){ return ''; } }
function saleItems(s){ return (s.items&&s.items.length)?s.items:[{qty:s.qty||0,price:(s.total||0)/Math.max(1,s.qty||1),name:s.name,productId:s.productId}]; }
function renderDaySales(){
  const list=DB.sales.filter(s=>s.date===saleDay).sort((a,b)=>b.id-a.id);
  const exps=DB.expenses.filter(e=>e.date===saleDay).sort((a,b)=>b.id-a.id);
  const dlbl=saleDay===dstr()?'Today':fmtDate(saleDay);
  $('sales-day-title').textContent=dlbl+' · '+list.length+' sales';
  const saleRows=list.map(s=>{
    const its=saleItems(s), open=expSaleId===s.id;
    const sub=its.length>1?its.length+' items':'× '+s.qty;
    const det=open?`<div class="sale-det">`+its.map((it,ix)=>`
      <div class="sdet-row"><div><b>${esc(it.name||s.name)}</b><div class="sub">${it.qty} × ${pkr(it.price)}</div></div>
      <div class="sdet-r"><b>${pkr(it.qty*it.price)}</b>
      <button class="ret-one" onclick="event.stopPropagation();returnItem(${s.id},${ix})" title="Return item">⤺</button></div></div>`).join('')+
      `<button class="return-bundle" onclick="event.stopPropagation();returnSale(${s.id})">Return Bundle</button>
       <div class="bill-btns"><button class="bill-btn bill-print" onclick="event.stopPropagation();printSale(${s.id})"><span class="bi">🖨️</span><span>Print</span></button><button class="bill-btn bill-pdf" onclick="event.stopPropagation();shareBillPDF(${s.id})"><span class="bi">📄</span><span>PDF bill</span></button></div></div>`:'';
    return `<div class="sale-card${open?' open':''}"><div class="sale-top" onclick="toggleSaleExp(${s.id})">
      <div style="flex:1;min-width:0"><div class="d">${esc(s.name)}${s.unpaid?`<span class="unpaid-pill" onclick="event.stopPropagation();unmarkPaid(${s.id})">Unpaid</span>`:''}<span class="t">${hhmm(s.ts)}</span></div>
      <div class="sub">${sub}${s.customer?' · '+esc(s.customer):''}</div></div>
      <div class="a">${pkr(s.total)}</div><div class="xarw">${open?'▲':'▼'}</div></div>${det}</div>`;
  }).join('');
  const expRows=exps.map(e=>`
    <div class="hist-row exp-row"><div><div class="d">📋 ${esc(e.title)}</div><div class="sub" style="color:var(--red)">Expense</div></div>
    <div class="a">− ${pkr(e.amount)}</div></div>`).join('');
  $('sales-day-list').innerHTML=(saleRows+expRows)||'<p class="note" style="color:#fff">No records this day</p>';
}

/* ================= STOCK ================= */
let stockF='all', stockQ='';
document.querySelectorAll('#stock-chips .chip').forEach(c=>c.onclick=()=>{
  document.querySelectorAll('#stock-chips .chip').forEach(x=>x.classList.remove('active'));
  c.classList.add('active'); stockF=c.dataset.f; renderStock();
});
$('stock-search').oninput=e=>{ stockQ=e.target.value.toLowerCase(); renderStock(); };
function stockBadge(p){ if(p.qty<=0) return '<span class="badge out">OUT</span>'; if(p.qty<=5) return '<span class="badge low">Low</span>'; return ''; }
let stockSort=0;
const SORT_LBL=['Default order','Name A–Z','Qty: high to low','Cost: high to low'];
window.cycleStockSort=()=>{ stockSort=(stockSort+1)%4; renderStock(); toast('\u21C5 '+SORT_LBL[stockSort]); };
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
  if(stockSort===1) list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
  if(stockSort===2) list=[...list].sort((a,b)=>b.qty-a.qty);
  if(stockSort===3) list=[...list].sort((a,b)=>b.cost-a.cost);
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
let repY=new Date().getFullYear(), repM=new Date().getMonth(), chartMode='sales', repShowAll=false;
const MNAME=['January','February','March','April','May','June','July','August','September','October','November','December'];
function renderReport(){
  $('period-txt').textContent=MNAME[repM].slice(0,3)+' '+repY;
  const sales=DB.sales.filter(s=>{ const d=new Date(s.ts); return d.getFullYear()===repY&&d.getMonth()===repM; });
  const prev=DB.sales.filter(s=>{ const d=new Date(s.ts); let pm=repM-1,py=repY; if(pm<0){pm=11;py--;} return d.getFullYear()===py&&d.getMonth()===pm; });
  const st=sales.reduce((a,s)=>a+s.total,0), pt=prev.reduce((a,s)=>a+s.total,0);
  const gross=sales.reduce((a,s)=>a+s.items.reduce((x,i)=>x+i.qty*((i.price||0)-(i.cost||0)),0),0);
  const pexp=DB.expenses.filter(e=>{ const d=new Date(e.ts); return d.getFullYear()===repY&&d.getMonth()===repM; }).reduce((a,e)=>a+e.amount,0);
  const profit=gross-pexp;
  $('r-sales').textContent=st.toLocaleString('en-PK',{minimumFractionDigits:2});
  $('r-profit').textContent=profit.toLocaleString('en-PK',{minimumFractionDigits:2});
  $('r-margin').textContent=st>0?Math.round(profit/st*100)+'% margin':'';
  $('r-vs').textContent=pt>0?Math.round((st-pt)/pt*100)+'% vs '+MNAME[(repM+11)%12].slice(0,3):'';
  $('r-avg').textContent='Avg / day: PKR '+Math.round(st/30).toLocaleString()+' · '+new Set(sales.map(s=>s.date)).size+' working days';
  // chart
  $('chart-month').textContent=MNAME[repM]+' '+repY;
  const dim=new Date(repY,repM+1,0).getDate();
  const byDay={}; sales.forEach(s=>{ const d=new Date(s.ts).getDate(); byDay[d]=byDay[d]||{s:0,p:0}; byDay[d].s+=s.total; byDay[d].p+=s.items.reduce((x,i)=>x+i.qty*((i.price||0)-(i.cost||0)),0); });
  const max=Math.max(1,...Object.values(byDay).map(v=>chartMode==='sales'?v.s:v.p));
  let bars=''; for(let d=1;d<=Math.min(dim,31);d++){ const v=byDay[d]; const h=v?Math.max(4,Math.round((chartMode==='sales'?v.s:v.p)/max*110)):4;
    bars+=`<div class="bar" style="height:${h}px"><span>${d}</span></div>`; }
  $('bar-chart').innerHTML=bars;
  // history by day
  const days={}; sales.forEach(s=>{ days[s.date]=days[s.date]||{total:0,profit:0}; days[s.date].total+=s.total; days[s.date].profit+=s.items.reduce((x,i)=>x+i.qty*((i.price||0)-(i.cost||0)),0); });
  const arr=Object.keys(days).sort().reverse();
  const show=repShowAll?arr:arr.slice(0,8);
  $('rep-history').innerHTML=show.map(ds=>{ const d=new Date(ds+'T12:00');
    const lbl=ds===dstr()?'Today · ':'';
    return `<div class="hist-row" onclick="dayDetail('${ds}')"><div><div class="d">${lbl}${d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</div>
    <div class="p">+ ${pkr(days[ds].profit)} profit</div></div><div class="a">${pkr(days[ds].total)}</div></div>`; }).join('')||'<p class="note" style="color:#fff">No sales this period</p>';
}
$('ch-sales').onclick=()=>{ chartMode='sales'; $('ch-sales').classList.add('active'); $('ch-profit').classList.remove('active'); renderReport(); };
$('ch-profit').onclick=()=>{ chartMode='profit'; $('ch-profit').classList.add('active'); $('ch-sales').classList.remove('active'); renderReport(); };
$('rep-show-all').onclick=()=>{ repShowAll=!repShowAll; $('rep-show-all').textContent=repShowAll?'Show less':'Show all'; renderReport(); };
$('btn-period').onclick=()=>{
  const months=MNAME.map((m,i)=>`<option value="${i}" ${i===repM?'selected':''}>${m}</option>`).join('');
  let years=''; for(let y=repY-3;y<=repY+1;y++) years+=`<option ${y===repY?'selected':''}>${y}</option>`;
  openSheet(`<h3 style="text-align:center">Select Period</h3>
    <div style="display:flex;gap:10px"><select id="pp-m">${months}</select><select id="pp-y">${years}</select></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">CANCEL</button><button class="btn-go" onclick="applyPeriod()">APPLY</button></div>`);
};
window.applyPeriod=()=>{ repM=parseInt($('pp-m').value); repY=parseInt($('pp-y').value); repShowAll=false; $('rep-show-all').textContent='Show all'; closeSheet(); renderReport(); };
window.dayDetail=ds=>{
  const list=DB.sales.filter(s=>s.date===ds).reverse();
  openSheet(`<h3>${fmtDate(ds)} — ${list.length} sales</h3>`+list.map(s=>`
    <div class="kv"><span>${esc(s.name)} × ${s.qty}${s.customer?' · '+esc(s.customer):''}</span><b>${pkr(s.total)}</b></div>`).join('')+
    `<div class="mrow"><button class="btn-go" onclick="closeSheet()">Close</button></div>`);
};
function downloadCSV(name,rows){
  const csv=rows.map(r=>r.map(c=>'"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=name; a.click();
}
window.exportCSV=kind=>{
  if(kind==='sales') downloadCSV('sales-'+dstr()+'.csv',[['Date','Item','Qty','Total','Customer'],...DB.sales.map(s=>[s.date,s.name,s.qty,s.total,s.customer||''])]);
  else downloadCSV('inventory-'+dstr()+'.csv',[['ID','Brand','Item','Qty','Unit','Cost','Sell'],...DB.products.map(p=>[p.itemId,p.brand,p.name,p.qty,p.unit,p.cost,p.sell])]);
  toast('⬇ Exported!');
};
$('btn-export-csv').onclick=()=>exportCSV('sales');

/* ================= CREDIT ================= */
let creditQ='';
$('credit-search').oninput=e=>{ creditQ=e.target.value.toLowerCase(); renderCredit(); };
const custBal=c=>(c.credit||0)-(c.received||0);
function renderCredit(){
  const tot=DB.customers.reduce((s,c)=>s+custBal(c),0);
  $('c-total').textContent=pkr(tot); $('c-count').textContent=DB.customers.length+' customers';
  const list=DB.customers.filter(c=>(c.name||'').toLowerCase().includes(creditQ)||String(c.custId).includes(creditQ)).reverse();
  $('credit-list').innerHTML=list.map(c=>{ const b=custBal(c);
    return `<div class="cust-card" onclick="creditDetail(${c.id})">
      <div class="nm">${esc(c.name)} <span class="sub">ID ${c.custId}</span></div>
      <div class="meta">📞 ${esc(c.phone||'—')}${c.product?' · 📄 '+esc(c.product):''}</div>
      <div class="bal">Balance: ${pkr(b)}</div>
      ${c.promiseDate?`<div class="pd">⏰ Promise: ${fmtDate(c.promiseDate)}</div>`:''}
    </div>`; }).join('')||'<p class="note" style="color:#fff">No credit customers yet</p>';
}
let credPickId=null, credPickQ='';
$('btn-add-credit').onclick=()=>{
  const cid=DB.seq.c; credPickId=null; credPickQ='';
  openSheet(`<h3>New Credit</h3>
    <div class="id-row"><input id="cc-id" value="${cid}"><button class="link-btn" onclick="$('cc-id').value=${DB.seq.c}">AUTO</button></div>
    <input id="cc-name" placeholder="Customer name">
    <input id="cc-phone" placeholder="Phone (03xx-xxxxxxx)" inputmode="tel">
    <div class="search-wrap">🔍 <input id="cc-psearch" placeholder="Type product name..."></div>
    <div id="cc-pick-list"></div>
    <input id="cc-product" placeholder="Product name (e.g. A4 Rim)">
    <div class="two-col"><div><input id="cc-rate" type="number" placeholder="Sale rate"></div>
    <div><input id="cc-disc" type="number" placeholder="Discount rate"></div></div>
    <div class="two-col"><div><input id="cc-qty" type="number" value="1" min="1" placeholder="Qty"></div>
    <div><input id="cc-credit" type="number" placeholder="Credit amount PKR"></div></div>
    <div class="red-sub hidden" id="cc-stock-warn"></div>
    <div class="sub" id="cc-cost-note"></div>
    <div class="two-col"><div><label class="fl" style="margin-top:4px">Promise date</label><input id="cc-promise" type="date"></div>
    <div><label class="fl" style="margin-top:4px">Promise time</label><input id="cc-ptime" type="time" value="10:00"></div></div>
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Cancel</button><button class="btn-go" onclick="saveCredit()">Save</button></div>`);
  $('cc-psearch').oninput=e=>{ credPickQ=e.target.value.toLowerCase(); renderCredPick(); };
  renderCredPick();
  const stockWarn=()=>{ const w=$('cc-stock-warn'); if(!w) return;
    const p=DB.products.find(x=>x.id===credPickId), q=parseFloat($('cc-qty').value)||1;
    if(p&&q>p.qty){ w.textContent='⚠️ Only '+p.qty+' in stock!'; w.classList.remove('hidden'); }
    else { w.textContent=''; w.classList.add('hidden'); } };
  const calc=()=>{ const r=parseFloat($('cc-rate').value)||0, d=parseFloat($('cc-disc').value)||0, q=parseFloat($('cc-qty').value)||1;
    $('cc-credit').value=Math.max(0,(r-d)*q).toFixed(0); stockWarn(); };
  $('cc-rate').oninput=calc; $('cc-disc').oninput=calc; $('cc-qty').oninput=calc;
};
function renderCredPick(){
  const q=(credPickQ||'').trim();
  let list=[];
  if(q) list=DB.products.filter(p=>p.name.toLowerCase().includes(q)||String(p.itemId).includes(q)).slice(0,6);
  else if(credPickId){ const sp=DB.products.find(p=>p.id===credPickId); if(sp) list=[sp]; }
  $('cc-pick-list').innerHTML=list.map(p=>`
    <div class="pick-item ${credPickId===p.id?'sel':''}" onclick="pickCred(${p.id})">
      ${pimg(p,'pick-img')}<div><b>${esc(p.name)}</b><div class="sub">Sell ${pkr(p.sell)} · Cost ${pkr(p.cost)} · left ${p.qty}</div></div>
    </div>`).join('')||(q?'<p class="note">No product found</p>':'');
}
window.pickCred=id=>{ const p=DB.products.find(x=>x.id===id); if(!p) return;
  credPickId=id; $('cc-product').value=p.name; $('cc-rate').value=p.sell;
  $('cc-cost-note').textContent='Buy cost: '+pkr(p.cost)+' / '+p.unit+' · Profit: '+pkr(p.sell-p.cost);
  const q=parseFloat($('cc-qty').value)||1, d=parseFloat($('cc-disc').value)||0;
  $('cc-credit').value=Math.max(0,(p.sell-d)*q).toFixed(0);
  stockWarn(); renderCredPick(); };
window.saveCredit=()=>{
  const name=$('cc-name').value.trim(); if(!name){ toast('Enter customer name'); return; }
  const cid=parseInt($('cc-id').value)||DB.seq.c;
  const camt=Math.max(0,parseFloat($('cc-credit').value)||0);
  const qty=parseFloat($('cc-qty').value)||1;
  const p=DB.products.find(x=>x.id===credPickId); // stock link: picked product
  if(p){ if(qty>p.qty){ toast('⚠️ Only '+p.qty+' "'+p.name+'" in stock!'); return; } p.qty-=qty; }
  DB.customers.push({ id:DB.seq.c++, custId:cid, name, phone:$('cc-phone').value.trim(),
    product:$('cc-product').value.trim(), saleRate:parseFloat($('cc-rate').value)||0, discount:parseFloat($('cc-disc').value)||0,
    qty,
    credit:camt, received:0,
    promiseDate:$('cc-promise').value||'', promiseTime:$('cc-ptime').value||'',
    log:[{t:'Credit',a:camt,d:dstr()}] });
  if(cid>=DB.seq.c) DB.seq.c=cid+1;
  save(); closeSheet(); renderCredit(); renderStock(); updateBellBadge(); toast('✅ Credit saved');
};
window.creditDetail=id=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  const b=custBal(c);
  openSheet(`<h3>${esc(c.name)} <span class="sub">ID ${c.custId}</span></h3>
    <div class="kv"><span>📞 Number</span><b>${esc(c.phone||'—')}</b></div>
    ${c.product?`<div class="kv"><span>📄 Item</span><b>${esc(c.product)}</b></div>`:''}
    ${c.saleRate?`<div class="kv"><span>Sale rate</span><b>${pkr(c.saleRate)}</b></div>`:''}
    ${c.discount?`<div class="kv"><span>Discount rate</span><b>${pkr(c.discount)}</b></div>`:''}
    <div class="kv"><span>💰 Credit given</span><b>${pkr(c.credit)}</b></div>
    <div class="kv"><span>💵 Received</span><b>${pkr(c.received)}</b></div>
    <div class="kv"><span>📌 Balance due</span><b style="color:var(--red)">${pkr(b)}</b></div>
    ${c.promiseDate?`<div class="kv"><span>⏰ Promise</span><b>${fmtDate(c.promiseDate)}${c.promiseTime?' · '+c.promiseTime:''}</b></div>`:''}
    <div class="mrow">
      <button class="btn-ghost" onclick="addWusool(${c.id})">💵 Receive</button>
      <button class="btn-ghost" onclick="addCreditMore(${c.id})">➕ Add credit</button>
    </div>
    <div class="msg-btns">
      <button class="msg-btn wa" onclick="sendMsg(${c.id},'wa')">💬 WhatsApp</button>
      <button class="msg-btn sms" onclick="sendMsg(${c.id},'sms')">✉️ SMS</button>
    </div>
    <div class="mrow"><button class="btn-ghost danger-t" onclick="delCustomer(${c.id})">Delete</button>
    <button class="btn-go" onclick="closeSheet()">Close</button></div>`);
};
window.addWusool=id=>{
  const c=DB.customers.find(x=>x.id===id);
  openSheet(`<h3>💵 Receive — ${esc(c.name)}</h3><div class="sub">Balance due: ${pkr(custBal(c))}</div>
    <input id="w-amt" type="number" placeholder="Amount received">
    <div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" onclick="saveWusool(${id})">Save</button></div>`);
};
window.saveWusool=id=>{ const c=DB.customers.find(x=>x.id===id);
  const a=Math.max(0,parseFloat($('w-amt').value)||0); if(!a){toast('Enter amount');return;}
  c.received+=a; c.log.push({t:'Received',a,d:dstr()}); save(); creditDetail(id); renderCredit(); toast('✅ '+pkr(a)+' received'); };
window.addCreditMore=id=>{
  const c=DB.customers.find(x=>x.id===id);
  openSheet(`<h3>➕ Add credit — ${esc(c.name)}</h3>
    <input id="m-amt" type="number" placeholder="Credit amount">
    <input id="m-prod" placeholder="Product (optional)" value="${esc(c.product||'')}">
    <div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" onclick="saveCreditMore(${id})">Save</button></div>`);
};
window.saveCreditMore=id=>{ const c=DB.customers.find(x=>x.id===id);
  const a=Math.max(0,parseFloat($('m-amt').value)||0); if(!a){toast('Enter amount');return;}
  c.credit+=a; if($('m-prod').value.trim()) c.product=$('m-prod').value.trim();
  c.log.push({t:'Credit',a,d:dstr()}); save(); creditDetail(id); renderCredit(); toast('✅ Credit added'); };
window.delCustomer=id=>{ const c=DB.customers.find(x=>x.id===id);
  if(!c) return;
  confirmDlg('Delete customer?','Are you sure you want to delete "'+c.name+'"?','DELETE',()=>{
    DB.customers=DB.customers.filter(x=>x.id!==id); save(); closeSheet(); renderCredit(); toast('Deleted'); }); };
/* WhatsApp / SMS with balance message (per sketch) */
window.sendMsg=(id,kind)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  if(!c.phone){ toast('No phone number saved'); return; }
  const b=custBal(c);
  const cdate=(c.log&&c.log[0]&&c.log[0].d)?fmtDate(c.log[0].d):'';
  const msg=`Assalam-o-Alaikum ${c.name}!\n${DB.profile.name} se apka khata:\n`+
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
load(); applyTheme(curTheme()); renderStoreName(); initAdd(); initAuth(); showView('view-sales');
updateBellBadge(); updatePrintBadge(); checkReminders();

/* ================= BELL: reminders + bulk send ================= */
function promiseDue(c){
  if(!c.promiseDate || custBal(c)<=0) return false;
  const dt=new Date(c.promiseDate+'T'+(c.promiseTime||'23:59'));
  return dt<=new Date();
}
function updateBellBadge(){
  const n=DB.customers.filter(promiseDue).length;
  const b=$('bell-badge');
  b.classList.toggle('hidden',!n); b.textContent=n;
}
$('btn-bell').onclick=()=>{
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
      <div style="font-weight:800;color:var(--red)">${pkr(custBal(c))} lena hai</div>
      <div class="mrow"><button class="btn-go" onclick="sendMsg(${c.id},'wa')">💬 Remind on WhatsApp</button></div></div>`).join('')
      :'<p class="note">No reminders. Overdue promises will appear here.</p>';
  };
  renderRemList('');
  $('rem-search').oninput=e=>renderRemList(e.target.value.toLowerCase());
  const renderBulkList=q=>{
    const list=withBal.filter(c=>(c.name||'').toLowerCase().includes(q)||String(c.custId).includes(q));
    $('bulk-list').innerHTML=list.map(c=>`
      <label class="check-row"><input type="checkbox" class="bulk-cb" value="${c.id}">
      <span><b>${esc(c.name)}</b> <span class="sub">ID ${c.custId}</span><br><span style="color:var(--red);font-weight:700">${pkr(custBal(c))}</span></span></label>`).join('')||'<p class="note">No pending dues</p>';
  };
  renderBulkList('');
  $('bulk-search').oninput=e=>renderBulkList(e.target.value.toLowerCase());
  $('bell-t-rem').onclick=()=>{ $('bell-t-rem').classList.add('active'); $('bell-t-send').classList.remove('active'); $('bell-rem').classList.remove('hidden'); $('bell-send').classList.add('hidden'); };
  $('bell-t-send').onclick=()=>{ $('bell-t-send').classList.add('active'); $('bell-t-rem').classList.remove('active'); $('bell-send').classList.remove('hidden'); $('bell-rem').classList.add('hidden'); };
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
  const msg=`Assalam-o-Alaikum ${c.name}!\n${DB.profile.name} se apka khata:\nID: ${c.custId}\n`+
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
  const bc=billTheme(); const prof=DB.profile;
  const d=new Date(s.ts||Date.now());
  const ds=d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  const rows=s.items.map((it,i)=>`<tr><td>${i+1}.</td><td>${esc(it.name||'')}</td><td class="r">${it.qty}</td><td class="r">${rsFmt(it.price)}</td><td class="r">${rsFmt(it.qty*it.price)}</td></tr>`).join('');
  const tq=s.items.reduce((a,i)=>a+(i.qty||0),0);
  const cl=[prof.phone?('Phone: '+esc(prof.phone)):'',prof.email?('Email: '+esc(prof.email)):''].filter(Boolean).join(' | ');
  return `<div class="billprint">
  <div class="bp-banner" style="background:linear-gradient(135deg,${bc[0]},${bc[1]})">
    <div class="bp-name">${esc(String(prof.name||'Paper Store').toUpperCase())}</div>
    ${prof.address?`<div class="bp-sub">${esc(prof.address)}</div>`:''}
    ${cl?`<div class="bp-sub">${cl}</div>`:''}
  </div>
  <div class="bp-meta"><span><b>Name:</b> ${esc(s.customer||'-')}</span><span><b>Bill No. ${s.id}</b></span></div>
  <div class="bp-meta"><span><b>Contact:</b> ${esc(s.phone||'—')}</span><span><b>Date:</b> ${ds}</span></div>
  <table class="bp-table"><tr style="background:${bc[2]}"><th>S.N</th><th>Name of Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr>
  ${rows}
  <tr class="tot"><td></td><td></td><td class="r">${tq}</td><td></td><td class="r">${rsFmt(s.total)}</td></tr>
  <tr><td colspan="3"></td><td class="r">Received</td><td class="r">${rsFmt(s.total)}</td></tr>
  <tr><td colspan="5" class="words">In Word: ${numToWords(s.total)}</td></tr></table>
  <div class="bp-terms"><b>Terms & Conditions:</b><br>&bull; Goods once sold will not be taken back.<br>&bull; Our responsibility ceases when goods leave our shop.</div>
  <div class="bp-foot">Generated by PaperPilot</div></div>`;
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
  let f=Math.min(1,270/(157+9*nIt)); f=Math.max(f,0.55);
  const BH=30+14*f, GN=48;
  for(let i=0;i<GN;i++){const k=i/(GN-1);doc.setFillColor(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k);doc.rect(W*i/GN,0,W/GN+0.3,BH,'F');}
  const txt=(t,x,yy,sz,bold,align,col)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(sz);const c=col||[0,0,0];doc.setTextColor(c[0],c[1],c[2]);doc.text(String(t),x,yy,{align:align||'left'});doc.setTextColor(0,0,0);};
  const WH=[255,255,255];
  txt(String(prof.name||'Paper Store').toUpperCase(),W/2,BH*0.42,24*f,true,'center',WH);
  let by=BH*0.66;
  if(prof.address){txt(prof.address,W/2,by,11*f,false,'center',WH);by+=5.2*f;}
  const cl=[prof.phone?('Phone: '+prof.phone):'',prof.email?('Email: '+prof.email):''].filter(Boolean).join(' | ');
  if(cl)txt(cl,W/2,by,11*f,false,'center',WH);
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
  drow(y,['','',tq,'',rsFmt(s.total)],rh,true,true);y+=rh;
  let x=M;doc.rect(x,y,bw-38,rh);doc.rect(x+bw-38,y,38,rh);
  doc.setFont('helvetica','normal');doc.setFontSize(11*f);
  doc.text('Received',x+bw-38-2,y+rh/2+1.6,{align:'right'});
  doc.setFont('helvetica','bold');doc.text(rsFmt(s.total),x+bw-2,y+rh/2+1.6,{align:'right'});y+=rh;
  doc.rect(M,y,bw,rh);doc.setFont('helvetica','bold');doc.setFontSize(11*f);
  doc.text('In Word: '+numToWords(s.total),M+2,y+rh/2+1.6);y+=rh+4*f;
  const th2=26*f+8;
  doc.rect(M,y,bw,th2);doc.setFont('helvetica','bold');doc.setFontSize(11*f);doc.text('Terms & Conditions:',M+3,y+7*f);
  doc.setFont('helvetica','normal');doc.setFontSize(9.5*f);
  doc.text('• Goods once sold will not be taken back.',M+5,y+13*f);
  doc.text('• Our responsibility ceases when goods leave our shop.',M+5,y+18.5*f);
  y+=th2+6*f;
  doc.setFont('helvetica','normal');doc.setFontSize(8.5*f);doc.setTextColor(140,140,140);
  doc.text('Generated by PaperPilot',W/2,y,{align:'center'});doc.setTextColor(0,0,0);
  return doc.output('blob');
}
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
