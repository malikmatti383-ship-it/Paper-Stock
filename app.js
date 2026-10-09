/* ================= Paper Stock v1 ================= */
const DB_KEY = 'paperstock_v1';
let DB = null;
const $ = id => document.getElementById(id);
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pkr = n => 'PKR ' + Number(n||0).toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2});
const dstr = d => { d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
function toast(m){ const t=$('toast'); t.textContent=m; t.classList.remove('hidden'); clearTimeout(t._tm); t._tm=setTimeout(()=>t.classList.add('hidden'),2400); }

/* ---------- Data ---------- */
function defDB(){ return { profile:{name:'Paper Store',email:'',logo:''}, products:[], sales:[], expenses:[], customers:[], printQueue:[], seq:{p:1,s:1,e:1,c:1,item:1} }; }
function load(){ try{ DB=JSON.parse(localStorage.getItem(DB_KEY))||defDB(); }catch(e){ DB=defDB(); } if(!DB.seq)DB.seq={p:1,s:1,e:1,c:1,item:1}; if(!DB.printQueue)DB.printQueue=[]; }
function save(){ localStorage.setItem(DB_KEY,JSON.stringify(DB)); }

/* ---------- Cloud sync (Gmail login) ---------- */
let syncCtl=null, applyingRemote=false, syncedAt=0;
try{ syncedAt=+(localStorage.getItem('ps_synced_at')||0); }catch(e){}
const _saveLocal=save;
save=function(){ _saveLocal(); if(syncCtl&&!applyingRemote) syncCtl.schedulePush(); };
function applyRemote(data,updatedAt){
  if(!data||!updatedAt||updatedAt<=syncedAt) return;
  applyingRemote=true;
  try{
    DB=data; if(!DB.seq)DB.seq={p:1,s:1,e:1,c:1,item:1}; if(!DB.printQueue)DB.printQueue=[];
    _saveLocal();
    syncedAt=updatedAt; try{ localStorage.setItem('ps_synced_at',syncedAt); }catch(e){}
    renderStoreName();
    const av=document.querySelector('.view.active'); if(av) showView(av.id);
  }finally{ applyingRemote=false; }
  toast('☁️ Cloud sync ho gaya');
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
  syncCtl=PaperAuth.startAutoSync(()=>DB, applyRemote, ts=>{ syncedAt=ts||Date.now(); try{ localStorage.setItem('ps_synced_at',syncedAt); }catch(e){} });
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
    <div class="menu-row" onclick="exportCSV('sales')"><span class="ic">⬇️</span> Export data <span class="sub">Sales / inventory CSV</span><span class="arw">›</span></div>
    <div class="menu-row" onclick="editProfile()"><span class="ic">✏️</span> Edit business name<span class="arw">›</span></div>
    <div class="menu-row danger-t" onclick="resetAll()"><span class="ic">🗑️</span> Delete all data<span class="arw">›</span></div>
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
    if(!confirm('Current data will be replaced. Continue?')) return;
    DB=d; save(); renderStoreName(); showView('view-add'); toast('✅ Backup restored!');
  }catch(e){ toast('❌ Invalid backup file'); } };
  r.readAsText(f); inp.value='';
};
window.editProfile=()=>{
  openSheet(`<h3>Business profile</h3>
    <input id="pf-name" value="${esc(DB.profile.name||'')}" placeholder="Store name">
    <input id="pf-email" value="${esc(DB.profile.email||'')}" placeholder="Email" inputmode="email">
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Cancel</button><button class="btn-go" onclick="saveProfile()">Save</button></div>`);
};
window.saveProfile=()=>{ DB.profile.name=$('pf-name').value.trim()||'Paper Store'; DB.profile.email=$('pf-email').value.trim(); save(); renderStoreName(); closeSheet(); toast('✅ Saved'); };
window.resetAll=()=>{ if(confirm('Delete ALL data?')&&confirm('Final warning — really delete everything?')){ DB=defDB(); save(); renderStoreName(); closeSheet(); showView('view-add'); toast('🗑️ Cleared'); } };

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
$('add-photo-pick').onclick=()=>$('add-photo').click();
$('add-photo').onchange=e=>readImg(e.target.files[0],d=>{ addImg=d; if(d) $('add-photo-pick').innerHTML=`<img src="${d}">`; e.target.value=''; });
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
  $('s-total').textContent=pkr(tot); $('s-exp').textContent=pkr(exp);
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
  if(!it){ toast('Search karke product select karo'); return; }
  saleCart.push(it); clearStaging();
  renderSaleCart(); toast('✅ Added: '+it.name);
};
$('sale-add-cust').onclick=()=>{ $('sale-cust').classList.remove('hidden'); $('sale-add-cust').classList.add('hidden'); $('sale-cust').focus(); };
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
    customer:$('sale-cust').value.trim(), date:saleDate, ts:new Date(saleDate+'T12:00').getTime(), items};
  DB.sales.push(sale);
  DB.printQueue.push({qid:Date.now(), saleId:sale.id, done:false, ts:Date.now()}); // pending print
  save(); saleCart=[]; renderSaleCart(); clearStaging(); $('sale-cust').value='';
  renderSales(); updatePrintBadge(); toast('✅ Sold! '+pkr(bill));
};
/* ---- Return: single item or whole bundle (NADIR style) ---- */
window.returnItem=(saleId,ix)=>{
  const s=DB.sales.find(x=>x.id===saleId); if(!s) return;
  const its=saleItems(s), it=its[ix]; if(!it) return;
  confirmDlg('Return Item?','This will return the item to your inventory stock.','RETURN',()=>{
    const p=DB.products.find(x=>x.id===it.productId); if(p) p.qty+=it.qty;
    s.total=Math.round((s.total-it.qty*it.price)*100)/100;
    s.qty-=it.qty;
    if(s.items&&s.items.length){ s.items.splice(ix,1); }
    if(!s.items||!s.items.length){
      DB.sales=DB.sales.filter(x=>x.id!==saleId);
      DB.printQueue=DB.printQueue.filter(q=>q.saleId!==saleId);
    } else {
      const left=saleItems(s);
      s.name=left.length===1?left[0].name:(left.length+' items');
    }
    save(); renderSales(); if(typeof renderReport==='function') renderReport(); updatePrintBadge();
    toast('↩️ Item returned to stock');
  });
};
window.returnSale=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s) return;
  confirmDlg('Return Bundle?','This will return all items to your inventory stock.','RETURN',()=>{
    saleItems(s).forEach(it=>{ const p=DB.products.find(x=>x.id===it.productId); if(p) p.qty+=it.qty; });
    DB.sales=DB.sales.filter(x=>x.id!==id);
    DB.printQueue=DB.printQueue.filter(q=>q.saleId!==id);
    save(); renderSales(); if(typeof renderReport==='function') renderReport(); updatePrintBadge();
    toast('↩️ Bundle returned — stock restored');
  });
};
$('btn-exp-add').onclick=()=>{
  const a=Math.max(0,parseFloat($('exp-amt').value)||0);
  if(!a){ toast('Enter amount'); return; }
  const ed=$('exp-date').value||dstr();
  DB.expenses.push({id:DB.seq.e++, title:$('exp-title').value.trim()||'Expense', amount:a, date:ed, ts:new Date(ed+'T12:00').getTime()});
  save(); $('exp-title').value=''; $('exp-amt').value=''; renderSales(); toast('✅ Expense added (-'+pkr(a)+')');
};
$('day-prev').onclick=()=>{ const d=new Date(saleDay+'T12:00'); d.setDate(d.getDate()-1); saleDay=dstr(d); renderDaySales(); };
$('day-next').onclick=()=>{ const d=new Date(saleDay+'T12:00'); d.setDate(d.getDate()+1); if(dstr(d)>dstr()){toast('Future nahi!');return;} saleDay=dstr(d); renderDaySales(); };
let expSaleId=null;
window.toggleSaleExp=id=>{ expSaleId=(expSaleId===id?null:id); renderDaySales(); };
function hhmm(ts){ try{ return new Date(ts).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); }catch(e){ return ''; } }
function saleItems(s){ return (s.items&&s.items.length)?s.items:[{qty:s.qty||0,price:(s.total||0)/Math.max(1,s.qty||1),name:s.name,productId:s.productId}]; }
function renderDaySales(){
  const list=DB.sales.filter(s=>s.date===saleDay).reverse();
  const exps=DB.expenses.filter(e=>e.date===saleDay).reverse();
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
       <button class="mini-act" onclick="event.stopPropagation();printSale(${s.id})">🖨️ Print receipt</button></div>`:'';
    return `<div class="sale-card${open?' open':''}"><div class="sale-top" onclick="toggleSaleExp(${s.id})">
      <div style="flex:1;min-width:0"><div class="d">${esc(s.name)}<span class="t">${hhmm(s.ts)}</span></div>
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
function renderStock(){
  const cost=DB.products.reduce((s,p)=>s+p.qty*p.cost,0);
  const units=DB.products.reduce((s,p)=>s+p.qty,0);
  $('st-cost').textContent=pkr(cost); $('st-count').textContent=units+' items';
  const cAll=DB.products.length, cIn=DB.products.filter(p=>p.qty>5).length, cLow=DB.products.filter(p=>p.qty>0&&p.qty<=5).length, cOut=DB.products.filter(p=>p.qty<=0).length;
  const chips=document.querySelectorAll('#stock-chips .chip');
  chips[0].textContent='All · '+cAll; chips[1].textContent='In stock · '+cIn; chips[2].textContent='Low stock · '+cLow; chips[3].textContent='Out · '+cOut;
  let list=DB.products.filter(p=>p.name.toLowerCase().includes(stockQ)||String(p.itemId).includes(stockQ)||(p.brand||'').toLowerCase().includes(stockQ));
  if(stockF==='in') list=list.filter(p=>p.qty>5);
  if(stockF==='low') list=list.filter(p=>p.qty>0&&p.qty<=5);
  if(stockF==='out') list=list.filter(p=>p.qty<=0);
  $('stock-list').innerHTML=list.map(p=>{
    const cls=p.qty<=0?'out':(p.qty<=5?'low':'');
    return `<div class="stock-card ${cls}">
      <div class="sc-top" onclick="stockDetail(${p.id})">${pimg(p)}
        <div class="sc-info"><span class="sc-brand">${esc(p.brand||'—')} · #${p.itemId}</span> ${stockBadge(p)}
          <div class="sc-name">${esc(p.name)}</div>
          <div class="sc-prices">Cost <b>${pkr(p.cost)}</b> · Sell <b>${pkr(p.sell)}</b> <span class="sub">/${esc(p.unit)}</span></div>
        </div></div>
      <div class="sc-right">
        <div class="stepper"><button onclick="event.stopPropagation();qstep(${p.id},-1)">−</button><span class="qv" style="${p.qty<=0?'color:var(--red)':''}">${p.qty}</span><button onclick="event.stopPropagation();qstep(${p.id},1)">+</button></div>
        <button class="mini-btn" onclick="event.stopPropagation();stockDetail(${p.id})">Details</button>
      </div></div>`; }).join('')||'<p class="note" style="color:#fff">No items</p>';
}
window.qstep=(id,d)=>{ const p=DB.products.find(x=>x.id===id); if(!p) return;
  if(p.qty+d<0){ toast('Out of stock!'); return; } p.qty+=d; save(); renderStock(); };
window.stockDetail=id=>{
  const p=DB.products.find(x=>x.id===id); if(!p) return;
  const cls=p.qty<=0?'out':(p.qty<=5?'low':'');
  openSheet(`<div class="sc-top">${pimg(p)}<div class="sc-info">
    <span class="sc-brand">${esc(p.brand||'—')} ${p.itemId}</span> ${stockBadge(p)}
    <div class="sc-name">${esc(p.name)}</div>
    <div class="sc-prices">Cost <b>${pkr(p.cost)}</b> · Sell <b>${pkr(p.sell)}</b> · Tax ${p.tax||0}%</div></div></div>
    <div class="kv"><span>In stock</span><b>${p.qty} ${esc(p.unit)}</b></div>
    <div class="kv"><span>Stock value (cost)</span><b>${pkr(p.qty*p.cost)}</b></div>
    <div class="mrow">
      <button class="btn-ghost" onclick="chQty(${p.id},-1)">− 1</button>
      <button class="btn-ghost" onclick="chQty(${p.id},1)">+ 1</button>
    </div>
    <div class="mrow">
      <button class="btn-ghost" onclick="editProduct(${p.id})">✏️ Edit</button>
      <button class="btn-ghost danger-t" onclick="delProduct(${p.id})">🗑️ Delete</button>
    </div>
    <div class="mrow"><button class="btn-go" onclick="closeSheet()">Close</button></div>`);
};
window.chQty=(id,d)=>{ const p=DB.products.find(x=>x.id===id); if(p.qty+d<0){toast('Out of stock!');return;} p.qty+=d; save(); stockDetail(id); renderStock(); };
window.editProduct=id=>{
  const p=DB.products.find(x=>x.id===id);
  openSheet(`<h3>Edit item</h3>
    <input id="ep-brand" value="${esc(p.brand||'')}" placeholder="Brand name">
    <input id="ep-name" value="${esc(p.name)}" placeholder="Item name">
    <input id="ep-qty" type="number" value="${p.qty}" placeholder="Quantity">
    <input id="ep-cost" type="number" value="${p.cost}" placeholder="Cost price">
    <input id="ep-sell" type="number" value="${p.sell}" placeholder="Selling price">
    <div class="mrow"><button class="btn-ghost" onclick="closeSheet()">Cancel</button><button class="btn-go" onclick="saveEditProduct(${p.id})">Save</button></div>`);
};
window.saveEditProduct=id=>{ const p=DB.products.find(x=>x.id===id);
  p.brand=$('ep-brand').value.trim(); p.name=$('ep-name').value.trim()||p.name;
  p.qty=Math.max(0,parseInt($('ep-qty').value)||0); p.cost=Math.max(0,parseFloat($('ep-cost').value)||0); p.sell=Math.max(0,parseFloat($('ep-sell').value)||0);
  save(); closeSheet(); renderStock(); toast('✅ Updated'); };
window.delProduct=id=>{ const p=DB.products.find(x=>x.id===id);
  if(confirm('Delete "'+p.name+'"?')){ DB.products=DB.products.filter(x=>x.id!==id); save(); closeSheet(); renderStock(); } };

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
      <div class="bal">Baqaya: ${pkr(b)}</div>
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
    <div class="kv"><span>💰 Credit (Udhaar)</span><b>${pkr(c.credit)}</b></div>
    <div class="kv"><span>💵 Received (Wusool)</span><b>${pkr(c.received)}</b></div>
    <div class="kv"><span>📌 Remaining (Baqaya)</span><b style="color:var(--red)">${pkr(b)}</b></div>
    ${c.promiseDate?`<div class="kv"><span>⏰ Promise</span><b>${fmtDate(c.promiseDate)}${c.promiseTime?' · '+c.promiseTime:''}</b></div>`:''}
    <div class="mrow">
      <button class="btn-ghost" onclick="addWusool(${c.id})">💵 Wusool</button>
      <button class="btn-ghost" onclick="addCreditMore(${c.id})">➕ Udhaar</button>
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
  openSheet(`<h3>💵 Wusool — ${esc(c.name)}</h3><div class="sub">Baqaya: ${pkr(custBal(c))}</div>
    <input id="w-amt" type="number" placeholder="Amount received">
    <div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" onclick="saveWusool(${id})">Save</button></div>`);
};
window.saveWusool=id=>{ const c=DB.customers.find(x=>x.id===id);
  const a=Math.max(0,parseFloat($('w-amt').value)||0); if(!a){toast('Enter amount');return;}
  c.received+=a; c.log.push({t:'Wusool',a,d:dstr()}); save(); creditDetail(id); renderCredit(); toast('✅ '+pkr(a)+' received'); };
window.addCreditMore=id=>{
  const c=DB.customers.find(x=>x.id===id);
  openSheet(`<h3>➕ More Udhaar — ${esc(c.name)}</h3>
    <input id="m-amt" type="number" placeholder="Credit amount">
    <input id="m-prod" placeholder="Product (optional)" value="${esc(c.product||'')}">
    <div class="mrow"><button class="btn-ghost" onclick="creditDetail(${id})">Back</button><button class="btn-go" onclick="saveCreditMore(${id})">Save</button></div>`);
};
window.saveCreditMore=id=>{ const c=DB.customers.find(x=>x.id===id);
  const a=Math.max(0,parseFloat($('m-amt').value)||0); if(!a){toast('Enter amount');return;}
  c.credit+=a; if($('m-prod').value.trim()) c.product=$('m-prod').value.trim();
  c.log.push({t:'Credit',a,d:dstr()}); save(); creditDetail(id); renderCredit(); toast('✅ Udhaar added'); };
window.delCustomer=id=>{ const c=DB.customers.find(x=>x.id===id);
  if(confirm('Delete "'+c.name+'"?')){ DB.customers=DB.customers.filter(x=>x.id!==id); save(); closeSheet(); renderCredit(); } };
/* WhatsApp / SMS with balance message (per sketch) */
window.sendMsg=(id,kind)=>{
  const c=DB.customers.find(x=>x.id===id); if(!c) return;
  if(!c.phone){ toast('No phone number saved'); return; }
  const b=custBal(c);
  const cdate=(c.log&&c.log[0]&&c.log[0].d)?fmtDate(c.log[0].d):'';
  const msg=`Assalam-o-Alaikum ${c.name}!\n${DB.profile.name} se apka khata:\n`+
    `ID: ${c.custId}\n`+(c.product?`Item: ${c.product}\n`:'')+
    (cdate?`Date: ${cdate}\n`:'')+
    `Diya (credit): ${pkr(c.credit)}\nWusool: ${pkr(c.received)}\nBaqaya balance: ${pkr(b)}`+
    (c.promiseDate?`\nPromise: ${fmtDate(c.promiseDate)}${c.promiseTime?' '+c.promiseTime:''}`:'');
  let num=c.phone.replace(/[^0-9]/g,'');
  if(num.startsWith('0')) num='92'+num.slice(1);
  if(kind==='wa') window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');
  else location.href='sms:'+num+'?body='+encodeURIComponent(msg);
};

/* ---------- Init ---------- */
load(); renderStoreName(); initAdd(); initAuth(); showView('view-sales');
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
      <p class="note">Select customers, phir Send dabao — WhatsApp ek-ek karke khulega (message ready hoga).</p>
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
      :'<p class="note">Koi reminder nahi hai. Promise time guzarne par yahan ayega.</p>';
  };
  renderRemList('');
  $('rem-search').oninput=e=>renderRemList(e.target.value.toLowerCase());
  const renderBulkList=q=>{
    const list=withBal.filter(c=>(c.name||'').toLowerCase().includes(q)||String(c.custId).includes(q));
    $('bulk-list').innerHTML=list.map(c=>`
      <label class="check-row"><input type="checkbox" class="bulk-cb" value="${c.id}">
      <span><b>${esc(c.name)}</b> <span class="sub">ID ${c.custId}</span><br><span style="color:var(--red);font-weight:700">${pkr(custBal(c))}</span></span></label>`).join('')||'<p class="note">Koi baqaya nahi</p>';
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
  if(!bulkQueue.length){ toast('Koi customer select nahi!'); return; }
  bulkActive=true; closeSheet(); toast('WhatsApp khul raha hai... ('+bulkQueue.length+')');
  setTimeout(bulkNext,600);
};
function bulkNext(){
  if(!bulkQueue.length){ bulkActive=false; toast('✅ Sab ko bhej diya!'); return; }
  const id=bulkQueue.shift();
  const c=DB.customers.find(x=>x.id===id);
  if(c&&c.phone){ openWA(c); } else bulkNext();
}
function openWA(c){
  const b=custBal(c);
  const cdate=(c.log&&c.log[0]&&c.log[0].d)?fmtDate(c.log[0].d):'';
  const msg=`Assalam-o-Alaikum ${c.name}!\n${DB.profile.name} se apka khata:\nID: ${c.custId}\n`+
    (c.product?`Item: ${c.product}\n`:'')+(cdate?`Date: ${cdate}\n`:'')+
    `Diya: ${pkr(c.credit)}\nWusool: ${pkr(c.received)}\nBaqaya: ${pkr(b)}`+
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
        const msg=`⏰ ${c.name} se ${pkr(custBal(c))} wusool karna hai! (Promise: ${fmtDate(c.promiseDate)}${c.promiseTime?' '+c.promiseTime:''})`;
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
function receiptHtml(s){
  const d=new Date(s.ts);
  return `<div class="receipt"><h2>${esc(DB.profile.name)}</h2><div class="c">SALE RECEIPT</div><hr>
  <table><tr><td>Date:</td><td class="r">${d.toLocaleString('en-GB')}</td></tr>
  <tr><td>Receipt #:</td><td class="r">${s.id}</td></tr>
  ${s.customer?`<tr><td>Customer:</td><td class="r">${esc(s.customer)}</td></tr>`:''}</table><hr>
  <table>${s.items.map(i=>`<tr><td>${esc(i.name||s.name)} × ${i.qty}</td><td class="r">${pkr(i.qty*i.price)}</td></tr>`).join('')}</table><hr>
  <table><tr><td class="tot">TOTAL</td><td class="r tot">${pkr(s.total)}</td></tr></table><hr>
  <div class="c">Thank you! Visit again 🙏</div></div>`;
}
function doPrint(html){ $('print-area').innerHTML=html; setTimeout(()=>window.print(),300); }
window.printSale=id=>{
  const s=DB.sales.find(x=>x.id===id); if(!s) return;
  doPrint(receiptHtml(s));
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
    ${rows||'<p class="note">Koi pending print nahi!</p>'}
    <div class="mrow"><button class="btn-ghost" onclick="pqSelectAll(true)">Select all</button>
    <button class="btn-ghost" onclick="pqSelectAll(false)">Clear</button></div>
    <div class="mrow"><button class="btn-go" onclick="pqPrintSel()">🖨️ Print Selected</button>
    <button class="btn-ghost danger-t" onclick="pqDelSel()">Delete</button></div>
    <div class="mrow"><button class="btn-ghost danger-t" onclick="pqDelAll()">🗑️ Delete All</button>
    <button class="btn-ghost" onclick="closeSheet()">Close</button></div>`);
};
window.pqSelectAll=on=>{ document.querySelectorAll('.pq-cb').forEach(cb=>cb.checked=on); };
window.pqPrintSel=()=>{
  const ids=[...document.querySelectorAll('.pq-cb:checked')].map(cb=>parseFloat(cb.value));
  if(!ids.length){ toast('Select prints first'); return; }
  const html=ids.map(qid=>{ const q=DB.printQueue.find(x=>x.qid===qid); const s=q&&DB.sales.find(x=>x.id===q.saleId);
    if(q) q.done=true; return s?receiptHtml(s):''; }).join('<div style="page-break-after:always"></div>');
  save(); updatePrintBadge(); closeSheet(); doPrint(html); toast('🖨️ Printing '+ids.length+'...');
};
window.pqDelSel=()=>{ const ids=[...document.querySelectorAll('.pq-cb:checked')].map(cb=>parseFloat(cb.value));
  DB.printQueue=DB.printQueue.filter(q=>!ids.includes(q.qid)); save(); updatePrintBadge(); $('btn-printer').click(); };
window.pqDelAll=()=>{ if(confirm('Delete all pending prints?')){ DB.printQueue=DB.printQueue.filter(q=>q.done); save(); updatePrintBadge(); closeSheet(); } };
