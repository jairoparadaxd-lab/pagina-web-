const T = {
  es:{welcome:'Bienvenido',mode:'Modo Participante',logout:'Cerrar Sesión',tabOverview:'Mi Resumen',tabNotifs:'Notificaciones',
    readonly:'Solo lectura — sin permiso de edición — Configurado por el administrador',ads:'Anuncios Bloqueados',apps:'Apps Limitadas',sites:'Sitios Bloqueados',
    blockedApps:'Apps Bloqueadas',noApps:'Sin apps bloqueadas',blockedSites:'Sitios Bloqueados',siteAlert:'Esta página está bloqueada por el administrador del sistema.',blocked:'Bloqueado',
    reqTitle:'Enviar solicitud de desbloqueo',optApp:'App',optSite:'Sitio',phName:'Nombre de la app',phReason:'Motivo...',send:'Enviar',
    supTitle:'Abrir ticket de soporte',phSubject:'Asunto',phMessage:'Mensaje',low:'Baja',med:'Media',high:'Alta',
    fAll:'Todas',fReq:'Solicitudes',fAlert:'Alertas',fSup:'Soporte',unread:n=>`${n} sin leer`,from:'De',sent:'Enviado',help:'¿Necesitas ayuda? Abre un ticket de soporte.',bye:'Sesión cerrada',
    tWarning:'ALERTA',tRequest:'SOLICITUD',tSupport:'SOPORTE'},
  en:{welcome:'Welcome',mode:'Participant Mode',logout:'Logout',tabOverview:'My Overview',tabNotifs:'Notifications',
    readonly:'Read-only — no edit permission — Configured by administrator',ads:'Ads Blocked',apps:'Limited Apps',sites:'Blocked Sites',
    blockedApps:'Blocked Apps',noApps:'No blocked apps',blockedSites:'Blocked Sites',siteAlert:'This page is blocked by the system administrator.',blocked:'Blocked',
    reqTitle:'Send Unlock Request',optApp:'App',optSite:'Site',phName:'App name',phReason:'Reason...',send:'Send',
    supTitle:'Open Support Ticket',phSubject:'Subject',phMessage:'Message',low:'Low',med:'Medium',high:'High',
    fAll:'All',fReq:'Requests',fAlert:'Alerts',fSup:'Support',unread:n=>`${n} unread`,from:'From',sent:'Sent',help:'Need help? Open a support ticket.',bye:'Logged out',
    tWarning:'WARNING',tRequest:'REQUEST',tSupport:'SUPPORT'}
};
const SITES=['chatgpt.com','tiktok.com','reddit.com','twitch.tv','gemini.google.com'];
let lang='es', filter='all', tab='overview';
let items=[
 {id:1,type:'warning',title:'Intento de acceso a TikTok',body:'Carlos López intentó acceder a tiktok.com a las 14:35. Acceso bloqueado.',date:'15/01/2024 14:35',from:'Admin Principal',role:'Admin',mail:'admin@truelock.com',read:true},
 {id:2,type:'request',title:'Solicitud de desbloqueo',body:'Solicito acceso temporal a YouTube para tutoriales de matemáticas.',date:'15/01/2024 14:30',from:'Carlos López',role:'Participant',mail:'carlos@truelock.com',read:false},
 {id:3,type:'support',title:'Problema con Google Classroom',body:'El sitio de Google Classroom está bloqueado pero lo necesito para clases.',date:'15/01/2024 15:00',from:'María García',role:'Participant',mail:'maria@truelock.com',read:true},
 {id:4,type:'warning',title:'Límite de tiempo alcanzado',body:'María García ha alcanzado el límite diario de 4 horas de uso.',date:'15/01/2024 18:00',from:'Admin Principal',role:'Admin',mail:'admin@truelock.com',read:true}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200)}

function renderStatic(){
  const d=T[lang];
  document.documentElement.lang=lang;
  $$('[data-i18n]').forEach(e=>e.textContent=d[e.dataset.i18n]);
  $$('[data-i18n-ph]').forEach(e=>e.placeholder=d[e.dataset.i18nPh]);
  $('#langLabel').textContent=lang.toUpperCase();
  $('#siteCount').textContent=SITES.length;
  $('#siteList').innerHTML=SITES.map(s=>`<li>${s}<span>${d.blocked}</span></li>`).join('');
  updatePlaceholder();
}
function updatePlaceholder(){
  $('#reqName').placeholder = lang==='es' ? ($('#reqType').value==='app'?'Nombre de la app':'Dirección del sitio') : ($('#reqType').value==='app'?'App name':'Site address');
}
function render(){
  const d=T[lang], list=items.filter(i=>filter==='all'||i.type===filter);
  const tagIcon={warning:'⚠',request:'✉',support:'?'};
  const tagName={warning:d.tWarning,request:d.tRequest,support:d.tSupport};
  $('#list').innerHTML=list.map(i=>`<article class="n ${i.type} ${i.read?'':'unread'}" data-id="${i.id}">
    <div class="head"><span><span class="tag">${tagIcon[i.type]} ${tagName[i.type]}</span>${i.read?'':'<span class="dot"></span>'}</span><span class="date">${i.date}</span></div>
    <h3>${esc(i.title)}</h3><p>${esc(i.body)}</p>
    <footer>${d.from}: <b>${esc(i.from)}</b> · ${esc(i.role)} &nbsp; ✉ ${esc(i.mail)}</footer></article>`).join('');
  ['all','request','warning','support'].forEach(k=>$('#c-'+k).textContent=k==='all'?items.length:items.filter(i=>i.type===k).length);
  const u=items.filter(i=>!i.read).length;
  $('#unread').textContent=u?d.unread(u):'';
  const b=$('#badge');b.textContent=u;b.classList.toggle('hide',!u);
}
function stamp(){const n=new Date(),p=x=>String(x).padStart(2,'0');return `${p(n.getDate())}/${p(n.getMonth()+1)}/${n.getFullYear()} ${p(n.getHours())}:${p(n.getMinutes())}`}
function add(type,title,body){items.unshift({id:Date.now(),type,title,body,date:stamp(),from:'jj',role:'Participant',mail:'jj@truelock.com',read:true});render()}

$('#langBtn').onclick=()=>{lang=lang==='es'?'en':'es';renderStatic();render()};
$('#logoutBtn').onclick=()=>toast(T[lang].bye);
$('#help').onclick=()=>toast(T[lang].help);
$('#reqType').onchange=updatePlaceholder;
$$('.tab').forEach(b=>b.onclick=()=>{
  tab=b.dataset.tab;
  $$('.tab').forEach(x=>x.classList.toggle('active',x===b));
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===tab));
});
$('#filters').onclick=e=>{const b=e.target.closest('.pill');if(!b)return;filter=b.dataset.f;$$('.pill').forEach(x=>x.classList.toggle('active',x===b));render()};
$('#list').onclick=e=>{const a=e.target.closest('.n');if(!a)return;const it=items.find(i=>i.id==a.dataset.id);if(it&&!it.read){it.read=true;render()}};
$('#reqForm').onsubmit=e=>{e.preventDefault();
  const kind=$('#reqType').selectedOptions[0].textContent;
  add('request',(lang==='es'?'Solicitud de desbloqueo: ':'Unlock request: ')+$('#reqName').value.trim(),$('#reqReason').value.trim());
  e.target.reset();updatePlaceholder();toast(T[lang].sent)};
$('#supForm').onsubmit=e=>{e.preventDefault();
  add('support',$('#supSubject').value.trim(),$('#supMsg').value.trim());
  e.target.reset();toast(T[lang].sent)};

renderStatic();render();
