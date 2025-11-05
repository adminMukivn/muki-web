/* ====== Demo data & state ====== */
const DEFAULT_PRODUCTS = [
  {id:1,title:'Acc PUBG Mobile | Rank: Conqueror | Skin hiếm',game:'pubg',price:350000,meta:'Level 120 - Skins: M416 Neon, Kar98 Royal'},
  {id:2,title:'Acc LMHT | Rank: Challenger | 150 Champions',game:'lol',price:1200000,meta:'Rank: Challenger - 150 tướng - 500+ skins'},
  {id:3,title:'Acc TFT | High ELO | Tướng & Aug đủ',game:'tft',price:220000,meta:'Elo: Top 10% - Full augs'},
  {id:4,title:'Acc PUBG | Rank: Ace | Giá rẻ',game:'pubg',price:180000,meta:'Level 60 - skins cơ bản'},
  {id:5,title:'Acc LMHT | Diamond | 50 Champions',game:'lol',price:450000,meta:'Rank: Diamond - Một số skin hiếm'},
  {id:6,title:'Acc Free Fire | Veteran | Bundle',game:'ff',price:200000,meta:'Bundle + pet'}
];

const STORAGE_KEYS = {
  PRODUCTS: 'muki_products_v2',
  CART: 'muki_cart_v2',
  USER: 'muki_user_v2',
  ORDERS: 'muki_orders_v2',
  THEME: 'muki_theme_v2',
  PROMO: 'muki_promo_v2'
};

let PRODUCTS = loadProducts();
let state = {
  cart: loadCart(),
  promo: null
};

function saveProductsToStorage(){ localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS)); }
function loadProducts(){ try{ const s=localStorage.getItem(STORAGE_KEYS.PRODUCTS); return s?JSON.parse(s):DEFAULT_PRODUCTS.slice(); }catch(e){return DEFAULT_PRODUCTS.slice();} }
function saveCart(){ localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cart)); }
function loadCart(){ try{ const s=localStorage.getItem(STORAGE_KEYS.CART); return s?JSON.parse(s):{} }catch(e){return {} } }
function loadUser(){ try{ const s=localStorage.getItem(STORAGE_KEYS.USER); return s?JSON.parse(s):null }catch(e){return null} }
function saveOrder(o){ const all = loadOrders(); all.unshift(o); localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all)); }
function loadOrders(){ try{ const s=localStorage.getItem(STORAGE_KEYS.ORDERS); return s?JSON.parse(s):[] }catch(e){return []} }
function showToast(text, timeout=2500){ const t = document.createElement('div'); t.className='toast'; t.textContent = text; document.getElementById('toastArea').appendChild(t); setTimeout(()=>t.remove(), timeout); }
function formatVND(n){ if(typeof n!=='number') n=Number(n); return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",") + ' VND' }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

(function initTheme(){
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  applyTheme(saved);
  document.getElementById('themeToggle').addEventListener('click', ()=>{
    const cur = document.body.classList.contains('light')? 'light' : 'dark';
    const next = cur==='light' ? 'dark' : 'light';
    applyTheme(next);
  });
})();
function applyTheme(name){
  if(name==='light'){ document.body.classList.add('light'); document.getElementById('themeToggle').textContent='Dark'; }
  else { document.body.classList.remove('light'); document.getElementById('themeToggle').textContent='Light'; }
  localStorage.setItem(STORAGE_KEYS.THEME, name);
}

const productsEl = document.getElementById('products');
const totalProducts = document.getElementById('totalProducts');
function renderProducts(list){
  productsEl.innerHTML = '';
  list.forEach(p=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:13px;color:var(--muted)">${p.game.toUpperCase()}</div>
        <div style="font-weight:800">${formatVND(p.price)}</div>
      </div>
      <div class="title">${p.title}</div>
      <div class="meta">${p.meta}</div>
      <div style="margin-top:10px;display:flex;gap:8px;justify-content:space-between;align-items:center">
        <button class="btn" data-add="${p.id}">Mua</button>
        <button class="btn ghost" data-view="${p.id}">Xem chi tiết</button>
      </div>
    `;
    productsEl.appendChild(div);
  });
  totalProducts.textContent = list.length;
}

document.getElementById('q').addEventListener('input', e=>{
  const q = e.target.value.trim().toLowerCase();
  const filtered = PRODUCTS.filter(p=> (p.title + p.meta + p.game).toLowerCase().includes(q));
  renderProducts(filtered);
});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click', e=>{
  const f = e.currentTarget.dataset.filter;
  if(f==='all') renderProducts(PRODUCTS);
  else renderProducts(PRODUCTS.filter(p=>p.game===f));
}));

productsEl.addEventListener('click', e=>{
  const add = e.target.closest('[data-add]');
  const view = e.target.closest('[data-view]');
  if(add){ addToCart(Number(add.dataset.add)); }
  if(view){ showModalProduct(Number(view.dataset.view)); }
});

function showModalProduct(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('modalContent').innerHTML = `
    <h3 style="margin:0">${p.title}</h3>
    <div class="meta" style="margin-top:6px">${p.meta} • Game: ${p.game}</div>
    <div style="margin-top:12px">Giá: <strong>${formatVND(p.price)}</strong></div>
    <hr style="opacity:0.06;margin:12px 0" />
    <div class="small">Mô tả giao dịch:</div>
    <div style="margin-top:8px;color:var(--muted);font-size:14px">Demo: thanh toán sẽ tạo đơn và lưu vào Lịch sử đơn. Thực tế cần server & xác minh.</div>
    <div style="margin-top:12px;display:flex;gap:8px"><button class="btn" id="buyNow">Thêm vào giỏ</button><button class="btn ghost" id="favBtn">Thêm yêu thích</button></div>
  `;
  showModal();
  document.getElementById('buyNow').onclick = ()=>{ addToCart(id); hideModal(); }
}

function showModal(){ const m=document.getElementById('modal'); m.style.display='flex'; m.setAttribute('aria-hidden','false'); }
function hideModal(){ const m=document.getElementById('modal'); m.style.display='none'; m.setAttribute('aria-hidden','true'); }
document.getElementById('closeModal').addEventListener('click', hideModal);

function addToCart(id, qty=1){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  if(!state.cart[id]) state.cart[id] = {...p, qty:0};
  state.cart[id].qty += qty;
  saveCart();
  renderCart();
  updateCartButton();
  showToast('Đã thêm vào giỏ');
}

function renderCart(){
  const list = document.getElementById('cartList'); list.innerHTML='';
  let sum = 0; let qty = 0;
  const values = Object.values(state.cart);
  if(values.length===0){ list.innerHTML = '<div class="small" style="color:var(--muted)">Giỏ trống</div>'; document.getElementById('sum').textContent = formatVND(0); return; }
  values.forEach(it=>{
    const div = document.createElement('div'); div.className='item';
    div.innerHTML = `<div style="max-width:70%">${it.title} <div class="meta" style="font-size:12px">${it.qty} x ${formatVND(it.price)}</div></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end">
        <div>${formatVND(it.qty * it.price)}</div>
        <div style="margin-top:6px">
          <button class="btn ghost smallBtn" data-dec="${it.id}">-</button>
          <button class="btn smallBtn" data-inc="${it.id}">+</button>
          <button class="btn ghost smallBtn" data-rem="${it.id}">x</button>
        </div>
      </div>`;
    list.appendChild(div);
    sum += it.qty * it.price; qty += it.qty;
  });
  document.getElementById('sum').textContent = formatVND(sum);
  document.getElementById('openCart').textContent = `Giỏ (${qty})`;
}

document.getElementById('cartList').addEventListener('click', e=>{
  const dec = e.target.closest('[data-dec]');
  const inc = e.target.closest('[data-inc]');
  const rem = e.target.closest('[data-rem]');
  if(dec){ const id = Number(dec.dataset.dec); if(state.cart[id]){ state.cart[id].qty = Math.max(0, state.cart[id].qty - 1); if(state.cart[id].qty===0) delete state.cart[id]; saveCart(); renderCart(); updateCartButton(); } }
  if(inc){ const id = Number(inc.dataset.inc); if(state.cart[id]){ state.cart[id].qty++; saveCart(); renderCart(); updateCartButton(); } }
  if(rem){ const id = Number(rem.dataset.rem); if(state.cart[id]){ delete state.cart[id]; saveCart(); renderCart(); updateCartButton(); } }
});

document.getElementById('clearCart').addEventListener('click', ()=>{ state.cart={}; saveCart(); renderCart(); updateCartButton(); showToast('Giỏ được xóa'); });

function updateCartButton(){ const qty = Object.values(state.cart).reduce((s,i)=>s + (i.qty||0), 0); document.getElementById('openCart').textContent = `Giỏ (${qty})`; }

document.getElementById('openCart').addEventListener('click', ()=>{
  const html = `<h3>Giỏ hàng</h3><div style='margin-top:8px'>${document.getElementById('cartList').innerHTML}</div>
    <div style='margin-top:12px' class='total'><div>Tổng</div><div id='modalSum'>${document.getElementById('sum').textContent}</div></div>
    <div style='margin-top:12px'><button id='modalCheckout' class='btn'>Thanh toán</button></div>`;
  document.getElementById('modalContent').innerHTML = html;
  showModal();
  document.getElementById('modalCheckout').onclick = ()=>{ checkoutFlow(); };
});

document.getElementById('applyPromo').addEventListener('click', ()=>{
  const code = (document.getElementById('promoCode').value||'').trim().toUpperCase();
  if(!code){ showToast('Nhập mã khuyến mãi'); return; }
  if(code==='MUKI10'){ state.promo = {code, type:'percent', value:10}; showToast('Áp dụng MUKI10: -10%'); }
  else if(code==='GIFT50'){ state.promo = {code, type:'fixed', value:50000}; showToast('Áp dụng GIFT50: -50,000 VND'); }
  else { showToast('Mã không hợp lệ (demo)'); return; }
  localStorage.setItem(STORAGE_KEYS.PROMO, JSON.stringify(state.promo));
});

function checkoutFlow(){
  const user = loadUser();
  if(!user){
    document.getElementById('modalContent').innerHTML = `
      <h3>Thanh toán — Đăng nhập hoặc tiếp tục</h3>
      <div style="margin-top:8px" class="small">Bạn cần đăng nhập để lưu lịch sử đơn hàng. (Demo: đăng nhập mock)</div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button id="btnLoginNow" class="btn">Đăng nhập</button>
        <button id="btnGuest" class="btn ghost">Tiếp tục với Guest</button>
      </div>`;
    showModal();
    document.getElementById('btnLoginNow').onclick = ()=>{ showLoginModal(()=>checkoutFlow()); };
    document.getElementById('btnGuest').onclick = ()=>{ proceedPayment(null); };
    return;
  }
  proceedPayment(user);
}

function proceedPayment(user){
  const sum = Object.values(state.cart).reduce((s,i)=>s + (i.qty * i.price), 0);
  if(sum<=0){ showToast('Giỏ trống'); return; }
  let discount = 0;
  const promo = state.promo || JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMO) || 'null');
  if(promo){
    if(promo.type==='percent') discount = Math.round(sum * promo.value / 100);
    else if(promo.type==='fixed') discount = promo.value;
  }
  const total = Math.max(0, sum - discount);
  document.getElementById('modalContent').innerHTML = `
    <h3>Thanh toán (Demo)</h3>
    <div class="small" style="margin-top:6px">Tổng tạm: ${formatVND(sum)} — Giảm: ${formatVND(discount)} — <strong>${formatVND(total)}</strong></div>
    <div style="margin-top:12px">
      <label class="small">Chọn cổng thanh toán (demo):</label>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn" id="payGate1">MockPay</button>
        <button class="btn ghost" id="payGate2">FakePay</button>
      </div>
    </div>
    <div style="margin-top:12px" class="small">Demo: nhấn 1 trong 2 để mô phỏng thanh toán — hệ thống sẽ tạo đơn và lưu lịch sử.</div>
  `;
  showModal();
  document.getElementById('payGate1').onclick = ()=>simulatePayment({gateway:'MockPay', success:true, amount:total, user});
  document.getElementById('payGate2').onclick = ()=>simulatePayment({gateway:'FakePay', success:true, amount:total, user});
}

function simulatePayment({gateway, success, amount, user}){
  document.getElementById('modalContent').innerHTML = `<h3>Đang xử lý ${gateway}...</h3><div class="small" style="margin-top:12px">Vui lòng chờ (demo)</div>`;
  setTimeout(()=>{
    if(success){
      const order = {
        id: uid(),
        user: user ? user : {name:'Guest'},
        items: Object.values(state.cart).map(i=>({id:i.id,title:i.title,qty:i.qty,price:i.price})),
        amount, promo: state.promo || null,
        createdAt: new Date().toISOString(),
        delivery: []
      };
      order.items.forEach((it, idx)=>{
        order.delivery.push({account:`user_demo_${it.id}_${Math.floor(Math.random()*9000+1000)}`, pass:`pw${Math.floor(Math.random()*9000+1000)}`});
      });
      saveOrder(order);
      state.cart = {}; saveCart();
      state.promo = null; localStorage.removeItem(STORAGE_KEYS.PROMO);
      renderCart(); updateCartButton();
      const lines = order.delivery.map((d,i)=>`Acc #${i+1}: ${d.account} | Pass: ${d.pass} — ${order.items[i].title}`).join('\n');
      document.getElementById('modalContent').innerHTML = `<h3>Thanh toán thành công (Demo)</h3>
        <div style="margin-top:8px" class="small">Đã tạo đơn: <strong>${order.id}</strong> — Tổng: ${formatVND(amount)}</div>
        <div style="margin-top:8px"><pre style="white-space:pre-wrap;background:rgba(0,0,0,0.22);padding:8px;border-radius:6px">${lines}</pre></div>
        <div style="margin-top:12px"><button id="doneOrder" class="btn">Hoàn tất</button></div>`;
      document.getElementById('doneOrder').onclick = ()=>{ hideModal(); showToast('Đơn đã lưu vào Lịch sử'); };
    } else {
      document.getElementById('modalContent').innerHTML = `<h3>Thanh toán thất bại (Demo)</h3><div style="margin-top:8px" class="small">Xin thử lại.</div><div style="margin-top:12px"><button class="btn" id="retry">Thử lại</button></div>`;
      document.getElementById('retry').onclick = ()=>checkoutFlow();
    }
  }, 1000 + Math.random()*900);
}

document.getElementById('adminPanelBtn').addEventListener('click', ()=> showAdminLogin());
document.getElementById('openAdmin').addEventListener('click', ()=> showAdminLogin());

function showAdminLogin(){
  const pass = prompt('Nhập mật khẩu admin (demo)');
  if(pass === 'admin123') openAdminPanel(); else alert('Mật khẩu sai (demo)');
}

function openAdminPanel(){
  const orders = loadOrders();
  let html = `<h3>Admin Dashboard (Demo)</h3>`;
  html += `<div style="margin-top:8px" class="small">Tổng đơn: ${orders.length}</div>`;
  html += `<div style="margin-top:10px"><button id="btnViewOrders" class="btn">Xem Đơn Hàng</button> <button id="btnReloadProd" class="btn ghost">Khôi phục stock mặc định</button></div>`;
  html += `<hr style="opacity:0.06;margin:12px 0" />`;
  html += `<div style="margin-top:8px" class="small">Sản phẩm hiện tại (${PRODUCTS.length}):</div>`;
  html += `<div style="margin-top:8px">`;
  html += PRODUCTS.map(p=>`<div style='padding:8px;border-bottom:1px dashed rgba(255,255,255,0.03)'><strong>${p.title}</strong><div class='meta'>${p.meta}</div><div style='margin-top:6px'>Giá: ${formatVND(p.price)} <button data-edit='${p.id}' class='btn ghost'>Sửa</button> <button data-del='${p.id}' class='btn ghost'>Xóa</button></div></div>`).join('');
  html += `</div><div style='margin-top:10px'><button id='addProd' class='btn'>Thêm sản phẩm</button></div>`;
  document.getElementById('modalContent').innerHTML = html;
  showModal();

  document.getElementById('addProd').onclick = ()=>{ addProductFlow(); };
  document.getElementById('btnViewOrders')?.addEventListener('click', ()=> viewOrdersFlow());
  document.getElementById('btnReloadProd')?.addEventListener('click', ()=>{ if(confirm('Khôi phục sản phẩm mặc định?')){ PRODUCTS = DEFAULT_PRODUCTS.slice(); saveProductsToStorage(); renderProducts(PRODUCTS); showToast('Đã khôi phục'); hideModal(); } });

  document.getElementById('modalContent').addEventListener('click', adminContentClick);
}

function adminContentClick(e){
  const del = e.target.closest('[data-del]');
  const edit = e.target.closest('[data-edit]');
  if(del){ const id = Number(del.dataset.del); PRODUCTS = PRODUCTS.filter(p=>p.id!==id); saveProductsToStorage(); renderProducts(PRODUCTS); hideModal(); showToast('Đã xóa sản phẩm'); }
  if(edit){ const id = Number(edit.dataset.edit); const p = PRODUCTS.find(x=>x.id===id); const title = prompt('Sửa tên', p.title); if(title) p.title=title; saveProductsToStorage(); renderProducts(PRODUCTS); hideModal(); showToast('Đã sửa sản phẩm'); }
}

function addProductFlow(){
  const title = prompt('Tên sản phẩm'); if(!title) return;
  const game = prompt('Game (ví dụ pubg, lol)') || 'other';
  const priceStr = prompt('Giá (VND)'); const price = Number(priceStr||0);
  const meta = prompt('Mô tả ngắn') || '';
  const id = (PRODUCTS.reduce((s,p)=>Math.max(s,p.id),0) + 1);
  PRODUCTS.push({id,title,game,price,meta});
  saveProductsToStorage(); renderProducts(PRODUCTS); showToast('Đã thêm sản phẩm');
  hideModal();
}

function viewOrdersFlow(){
  const orders = loadOrders();
  if(!orders.length){ alert('Chưa có đơn hàng'); return; }
  let html = `<h3>Danh sách Đơn hàng (mới nhất trước)</h3>`;
  html += orders.map(o=>`<div style="padding:8px;border-bottom:1px dashed rgba(255,255,255,0.03)"><strong>Order ${o.id}</strong> — ${new Date(o.createdAt).toLocaleString()} — ${formatVND(o.amount)}<div class="small">User: ${o.user?.name||'Guest'}</div><div style="margin-top:6px"><pre style="white-space:pre-wrap">${o.items.map((it,idx)=>`${it.qty}x ${it.title} — Acc: ${o.delivery[idx]?.account||'N/A'}`).join('\n')}</pre></div></div>`).join('');
  document.getElementById('modalContent').innerHTML = html;
}

document.getElementById('btnExportProducts').addEventListener('click', ()=>{
  const csv = PRODUCTS.map(p=>`${p.id},"${p.title.replace(/"/g,'""')}",${p.game},${p.price},"${p.meta.replace(/"/g,'""')}"`).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = 'products_muki.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('Xuất CSV xong');
});

document.getElementById('importProducts').addEventListener('change', (ev)=>{
  const f = ev.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = function(e){
    const text = e.target.result;
    try{
      const rows = parseCSV(text);
      const imported = rows.map(r=>({
        id: Number(r[0]) || (PRODUCTS.reduce((s,p)=>Math.max(s,p.id),0)+1),
        title: r[1] || 'Untitled',
        game: r[2] || 'other',
        price: Number(r[3]) || 0,
        meta: r[4] || ''
      }));
      PRODUCTS = PRODUCTS.concat(imported);
      saveProductsToStorage(); renderProducts(PRODUCTS); showToast('Import xong');
    }catch(err){ showToast('Import lỗi'); }
  };
  reader.readAsText(f,'utf-8');
});

function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
  const out = [];
  for(const line of lines){
    const row = [];
    let cur = ''; let inQuotes=false;
    for(let i=0;i<line.length;i++){
      const ch = line[i];
      if(ch === '"' ){ if(inQuotes && line[i+1]==='"'){ cur+='"'; i++; } else inQuotes = !inQuotes; }
      else if(ch===',' && !inQuotes){ row.push(cur); cur=''; }
      else cur += ch;
    }
    row.push(cur);
    out.push(row);
  }
  return out;
}

function showLoginModal(callback){
  const html = `<h3>Đăng nhập (Demo)</h3>
    <div style="margin-top:8px" class="small">Bạn có thể tạo tài khoản mock — không có xác thực thật.</div>
    <div style="margin-top:8px" class="form-row"><input id="loginName" type="text" placeholder="Tên hiển thị" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04)"/></div>
    <div style="margin-top:8px" class="form-row"><input id="loginPass" type="password" placeholder="Mật khẩu (bất kỳ)" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04)"/></div>
    <div style="margin-top:12px;display:flex;gap:8px"><button id="btnDoLogin" class="btn">Đăng nhập</button><button id="btnCloseLogin" class="btn ghost">Hủy</button></div>`;
  document.getElementById('modalContent').innerHTML = html; showModal();
  document.getElementById('btnDoLogin').onclick = ()=>{
    const name = (document.getElementById('loginName').value||'').trim();
    if(!name){ showToast('Nhập tên'); return; }
    const user = {name, createdAt: new Date().toISOString()};
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    updateUserArea();
    hideModal();
    showToast('Đăng nhập thành công (demo)');
    if(typeof callback === 'function') callback();
  };
  document.getElementById('btnCloseLogin').onclick = ()=>{ hideModal(); };
}
function logoutUser(){ localStorage.removeItem(STORAGE_KEYS.USER); updateUserArea(); showToast('Đã đăng xuất'); }
function updateUserArea(){
  const user = loadUser();
  const area = document.getElementById('userArea');
  if(user){ area.innerHTML = `<span style="margin-right:8px">Hi, ${user.name}</span><button id="btnLogout" class="btn ghost">Đăng xuất</button>`; document.getElementById('btnLogout').onclick = logoutUser; }
  else { area.innerHTML = `<button id="btnLogin" class="btn ghost">Đăng nhập</button>`; document.getElementById('btnLogin').onclick = ()=>showLoginModal(); }
}
updateUserArea();

renderProducts(PRODUCTS);
renderCart();
updateCartButton();
