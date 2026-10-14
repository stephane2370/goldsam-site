(function(){
var $=function(i){return document.getElementById(i)};
var mails=[
 {id:1,d:'12/10/2026',from:'Direction générale des Finances publiques',obj:'Avis relatif à votre dossier',st:'new'},
 {id:2,d:'09/10/2026',from:'URSSAF',obj:'Courrier de la caisse',st:'new'},
 {id:3,d:'02/10/2026',from:'Banque',obj:'Relevé de compte',st:'done',res:'Numérisé'},
 {id:4,d:'24/09/2026',from:'Greffe du tribunal de commerce',obj:'Accusé de réception',st:'done',res:'Réexpédié'}
];
var docs=[['Contrat de domiciliation','PDF · 01/09/2026'],['Attestation de domiciliation','PDF · 01/09/2026'],['Facture T3 2026','PDF · 30/09/2026'],['Conditions générales','PDF · 01/09/2026']];
var thr=[{me:1,h:'Vous · 08/10/2026',s:'Courrier',t:'Pouvez-vous réexpédier le prochain courrier recommandé à notre adresse de gestion ?'},{me:0,h:'GOLDSAM · 09/10/2026',s:'Réponse',t:'Bien noté. Le courrier recommandé sera signalé dans votre espace dès son arrivée, avec les options de réexpédition.'}];
var filter='all',tt;
function toast(m){var t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('on')},2600)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pill(m){return m.st==='new'?'<span class="pill new">À traiter</span>':'<span class="pill ok">'+esc(m.res||'Traité')+'</span>'}
function row(m,full){
 var a=full?(m.st==='new'?'<button class="sm" data-a="scan" data-id="'+m.id+'">Demander le scan</button><button class="sm" data-a="fwd" data-id="'+m.id+'">Réexpédier</button><button class="sm" data-a="pick" data-id="'+m.id+'">Retrait sur place</button>':'<button class="sm" data-a="view" data-id="'+m.id+'">Voir</button>'):'';
 return '<div class="row"><span class="d">'+m.d+'</span><div class="m"><b>'+esc(m.from)+'</b><small>'+esc(m.obj)+'</small></div><div class="a">'+pill(m)+a+'</div></div>'}
function count(){var n=mails.filter(function(m){return m.st==='new'}).length;$('nbNew').textContent=n;$('nbNew').style.display=n?'':'none';$('k1').textContent=n}
function render(){
 $('lastMail').innerHTML=mails.slice(0,3).map(function(m){return row(m,false)}).join('');
 $('mailList').innerHTML=mails.filter(function(m){return filter==='all'||m.st===filter}).map(function(m){return row(m,true)}).join('')||'<p class="sub" style="padding:18px 0">Aucun courrier dans cette liste.</p>';
 $('docList').innerHTML=docs.map(function(d,i){return '<div class="row"><span class="d">PDF</span><div class="m"><b>'+esc(d[0])+'</b><small>'+esc(d[1])+'</small></div><div class="a"><button class="sm" data-a="dl" data-id="'+i+'">Télécharger</button></div></div>'}).join('');
 $('thr').innerHTML=thr.map(function(t){return '<div class="thread'+(t.me?' me':'')+'"><div class="h"><b>'+esc(t.h)+'</b><span class="pill">'+esc(t.s)+'</span></div><p>'+esc(t.t)+'</p></div>'}).join('');
 $('k3').textContent=thr.filter(function(t){return t.me}).length;
 count()}
function show(v){
 document.querySelectorAll('.view').forEach(function(e){e.classList.toggle('on',e.id==='v-'+v)});
 document.querySelectorAll('.side .t').forEach(function(b){b.classList.toggle('on',b.dataset.v===v)});window.scrollTo(0,0)}
function modal(t,h){$('mt1').textContent=t;$('mb').innerHTML=h;$('modal').classList.add('on');$('mc').focus()}
function enter(){$('login').style.display='none';$('app').classList.add('on');render();show('accueil')}
$('demo').addEventListener('click',enter);
$('lf').addEventListener('submit',function(e){e.preventDefault();$('lmsg').textContent='La connexion réelle n’est pas encore ouverte. Utilisez l’aperçu avec des données d’exemple pour découvrir l’espace client.'});
$('out').addEventListener('click',function(){$('app').classList.remove('on');$('login').style.display=''});
document.querySelectorAll('.side .t').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.v)})});
document.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.go)})});
$('flt').addEventListener('click',function(e){var f=e.target.dataset.f;if(!f)return;filter=f;document.querySelectorAll('#flt button').forEach(function(b){b.classList.toggle('on',b===e.target)});render()});
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-a]');if(!b)return;var id=+b.dataset.id,m=mails.filter(function(x){return x.id===id})[0],a=b.dataset.a;
 if(a==='dl'){toast('Téléchargement disponible dans la version connectée.');return}
 if(a==='view'){modal(m.from,'<p class="sub" style="margin:0">'+esc(m.obj)+' · reçu le '+m.d+'</p><div class="scan">Aperçu du scan<br>(exemple)</div>');return}
 if(a==='scan'){modal('Demande de scan','<p class="sub" style="margin:0 0 6px">Le courrier de <b>'+esc(m.from)+'</b> sera numérisé et ajouté à votre espace.</p><button class="sm p" id="ok1">Confirmer la demande</button>');$('ok1').onclick=function(){m.st='done';m.res='Scan demandé';$('modal').classList.remove('on');render();toast('Demande de scan enregistrée (exemple).')};return}
 if(a==='fwd'){modal('Réexpédition','<p class="sub" style="margin:0 0 6px">Le courrier de <b>'+esc(m.from)+'</b> sera réexpédié à votre adresse de gestion, selon le tarif du contrat.</p><button class="sm p" id="ok2">Confirmer la réexpédition</button>');$('ok2').onclick=function(){m.st='done';m.res='Réexpédition demandée';$('modal').classList.remove('on');render();toast('Réexpédition enregistrée (exemple).')};return}
 if(a==='pick'){m.st='done';m.res='Retrait annoncé';render();toast('Retrait sur place annoncé (exemple).')}
});
$('mc').addEventListener('click',function(){$('modal').classList.remove('on')});
$('modal').addEventListener('click',function(e){if(e.target===$('modal'))$('modal').classList.remove('on')});
document.addEventListener('keydown',function(e){if(e.key==='Escape')$('modal').classList.remove('on')});
$('mf').addEventListener('submit',function(e){e.preventDefault();var t=$('mt').value.trim();if(!t)return;thr.unshift({me:1,h:'Vous · aujourd’hui',s:$('ms').value,t:t});$('mt').value='';render();toast('Demande envoyée (exemple).')});
render();
})();
