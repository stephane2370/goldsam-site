(function(){
var G=window.GS,$=G.$,esc=G.esc,sb=G.sb;
var me=null,cl=null,D={mails:[],docs:[],tasks:[],thr:[],dl:[]},filter='all';
function show(v){document.querySelectorAll('.view').forEach(function(e){e.classList.toggle('on',e.id==='v-'+v)});
 document.querySelectorAll('.side .t').forEach(function(b){b.classList.toggle('on',b.dataset.v===v)});window.scrollTo(0,0)}
function modal(t,h){$('mt1').textContent=t;$('mb').innerHTML=h;$('modal').classList.add('on');$('mc').focus()}
function closeModal(){$('modal').classList.remove('on')}
function pill(m){var k=m.status==='new'?'new':(/_requested$/.test(m.status)?'':'ok');return '<span class="pill '+k+'">'+esc(G.MAIL[m.status]||m.status)+'</span>'}
function mrow(m,full){
 var a='';
 if(full){
  if(m.file_path)a+='<button class="sm p" data-a="open" data-p="'+esc(m.file_path)+'">Voir le scan</button>';
  if(m.status==='new')a+='<button class="sm" data-a="scan" data-id="'+m.id+'">Demander le scan</button><button class="sm" data-a="forward" data-id="'+m.id+'">Réexpédier</button><button class="sm" data-a="pickup" data-id="'+m.id+'">Retrait sur place</button>'}
 return '<div class="row"><span class="d">'+G.fd(m.received_on)+'</span><div class="m"><b>'+esc(m.sender)+'</b><small>'+esc(m.subject||'')+(m.note?' · '+esc(m.note):'')+'</small></div><div class="a">'+pill(m)+a+'</div></div>'}
function drow(d){return '<div class="row"><span class="d">'+esc(G.CAT[d.category]||'Doc')+'</span><div class="m"><b>'+esc(d.title)+'</b><small>Ajouté le '+G.fd(d.created_at)+'</small></div><div class="a"><button class="sm" data-a="open" data-p="'+esc(d.file_path)+'">Télécharger</button></div></div>'}
function empty(t){return '<p class="sub" style="padding:18px 0;margin:0">'+t+'</p>'}
function render(){
 var nw=D.mails.filter(function(m){return m.status==='new'}).length;
 $('nbNew').textContent=nw;$('nbNew').style.display=nw?'':'none';$('k1').textContent=nw;
 var docs=D.docs.filter(function(d){return d.category!=='secretariat'}),sdocs=D.docs.filter(function(d){return d.category==='secretariat'});
 $('k2').textContent=docs.length;$('k3').textContent=D.thr.length;
 $('lastMail').innerHTML=D.mails.slice(0,3).map(function(m){return mrow(m,false)}).join('')||empty('Aucun courrier reçu pour le moment.');
 var list=D.mails.filter(function(m){return filter==='all'||(filter==='new'?m.status==='new':m.status!=='new')});
 $('mailList').innerHTML=list.map(function(m){return mrow(m,true)}).join('')||empty('Aucun courrier dans cette liste.');
 $('docList').innerHTML=docs.map(drow).join('')||empty('Aucun document pour le moment.');
 $('taskList').innerHTML=D.tasks.map(function(t){return '<div class="row"><span class="d">'+(t.due_on?G.fd(t.due_on):'')+'</span><div class="m"><b>'+esc(t.title)+'</b><small>'+esc(t.detail||'')+'</small></div><div class="a"><span class="pill '+(t.status==='termine'?'ok':t.status==='en_cours'?'new':'')+'">'+esc(G.TASK[t.status])+'</span></div></div>'}).join('')||empty('Aucune tâche en cours.');
 $('secDocs').innerHTML=sdocs.map(drow).join('')||empty('Aucun document pour le moment.');
 $('thr').innerHTML=D.thr.map(function(t){return '<div class="thread'+(t.author_role==='client'?' me':'')+'"><div class="h"><b>'+(t.author_role==='client'?'Vous':'GOLDSAM')+' · '+G.fdt(t.created_at)+'</b><span class="pill">'+esc(t.subject||'Message')+'</span></div><p>'+esc(t.body)+'</p></div>'}).join('')||empty('Aucun échange pour le moment.');
 $('dl').innerHTML=D.dl.map(function(d){return '<div class="row"><span class="d">'+G.fd(d.due_on)+'</span><div class="m"><b>'+esc(d.title)+'</b><small>'+esc(d.detail||'')+'</small></div><span class="pill">À venir</span></div>'}).join('')||empty('Aucune échéance enregistrée.')}
function load(){
 var cid=cl.id;
 return Promise.all([
  sb.from('mails').select('*').eq('client_id',cid).order('received_on',{ascending:false}),
  sb.from('documents').select('*').eq('client_id',cid).order('created_at',{ascending:false}),
  sb.from('secretariat_tasks').select('*').eq('client_id',cid).order('created_at',{ascending:false}),
  sb.from('requests').select('*').eq('client_id',cid).order('created_at',{ascending:false}),
  sb.from('deadlines').select('*').eq('client_id',cid).gte('due_on',new Date().toISOString().slice(0,10)).order('due_on')
 ]).then(function(r){D.mails=r[0].data||[];D.docs=r[1].data||[];D.tasks=r[2].data||[];D.thr=r[3].data||[];D.dl=r[4].data||[];render()})}
function start(p){
 me=p;
 if(p.role==='admin'){location.replace('admin/index.html');return}
 if(!p.client_id){$('lmsg').textContent='Votre compte n’est pas encore rattaché à un dossier. Écrivez à contact@goldsam.fr.';sb.auth.signOut();return}
 sb.from('clients').select('*').eq('id',p.client_id).single().then(function(r){
  cl=r.data;if(!cl){$('lmsg').textContent='Dossier introuvable. Écrivez à contact@goldsam.fr.';return}
  $('cn').textContent=cl.name;$('cu').textContent=p.email||'';$('hello').textContent='Bonjour, '+cl.name;
  var sec=(cl.services||[]).indexOf('secretariat')>-1;$('tabSec').hidden=!sec;
  $('dg').innerHTML='<div><small>Dénomination</small>'+esc(cl.name)+'</div><div><small>Formule</small>'+esc(cl.formule||'')+'</div><div><small>Adresse de domiciliation</small>'+esc(cl.address)+'</div><div><small>Début du contrat</small>'+G.fd(cl.contract_start)+'</div><div><small>Prestations</small>'+(cl.services||[]).map(function(s){return s==='secretariat'?'Secrétariat':'Domiciliation'}).join(' · ')+'</div>';
  $('login').style.display='none';$('app').classList.add('on');show('accueil');load()})}
function boot(){G.profile().then(function(p){if(p)start(p)})}
$('lf').addEventListener('submit',function(e){e.preventDefault();var b=$('lb');b.disabled=true;$('lmsg').textContent='Connexion…';
 sb.auth.signInWithPassword({email:$('le').value.trim(),password:$('lp').value}).then(function(r){b.disabled=false;
  if(r.error){$('lmsg').textContent='Adresse e-mail ou mot de passe incorrect.';return}
  $('lp').value='';G.profile().then(function(p){if(p)start(p)})})});
$('out').addEventListener('click',function(){sb.auth.signOut().then(function(){location.reload()})});
document.querySelectorAll('.side .t').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.v)})});
document.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.go)})});
$('flt').addEventListener('click',function(e){var f=e.target.dataset.f;if(!f)return;filter=f;document.querySelectorAll('#flt button').forEach(function(b){b.classList.toggle('on',b===e.target)});render()});
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a;
 if(a==='open'){G.openFile(b.dataset.p);return}
 var id=b.dataset.id,m=D.mails.filter(function(x){return x.id===id})[0];if(!m)return;
 var T={scan:['Demande de scan','sera numérisé et ajouté à votre espace.'],forward:['Réexpédition','sera réexpédié à l’adresse convenue, selon les conditions de votre contrat.'],pickup:['Retrait sur place','sera tenu à votre disposition à l’adresse de domiciliation.']}[a];
 modal(T[0],'<p class="sub" style="margin:0 0 10px">Le courrier de <b>'+esc(m.sender)+'</b> '+T[1]+'</p><button class="sm p" id="okA">Confirmer la demande</button>');
 $('okA').onclick=function(){$('okA').disabled=true;sb.rpc('request_mail_action',{p_mail:id,p_action:a}).then(function(r){closeModal();if(r.error){G.toast('Demande impossible : '+r.error.message);return}G.toast('Demande enregistrée.');load()})}});
$('mc').addEventListener('click',closeModal);
$('modal').addEventListener('click',function(e){if(e.target===$('modal'))closeModal()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});
$('mf').addEventListener('submit',function(e){e.preventDefault();var t=$('mt').value.trim();if(!t)return;
 sb.from('requests').insert({client_id:cl.id,author_id:me.id,author_role:'client',subject:$('ms').value,body:t}).then(function(r){
  if(r.error){G.toast('Envoi impossible.');return}$('mt').value='';G.toast('Demande envoyée.');load()})});
$('pf').addEventListener('submit',function(e){e.preventDefault();var p=$('np').value;if(p.length<8)return;
 sb.auth.updateUser({password:p}).then(function(r){if(r.error){G.toast('Mot de passe refusé : '+r.error.message);return}$('np').value='';G.toast('Mot de passe modifié.')})});
boot();
})();
