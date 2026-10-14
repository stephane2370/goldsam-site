(function(){
var G=window.GS,$=G.$,esc=G.esc,sb=G.sb;
var me=null,clients=[],cur=null,tab='fiche',view='home';
var TABS=[['fiche','Fiche'],['acces','Accès'],['courrier','Courrier'],['docs','Documents'],['sec','Secrétariat'],['ech','Échéances'],['msg','Messages']];
var REQ=['scan_requested','forward_requested','pickup_requested'];
function modal(t,h){$('mt1').textContent=t;$('mb').innerHTML=h;$('modal').classList.add('on')}
function closeModal(){$('modal').classList.remove('on')}
function err(r){if(r&&r.error){G.toast('Erreur : '+r.error.message);return true}return false}
function opts(o,sel){return Object.keys(o).map(function(k){return '<option value="'+k+'"'+(k===sel?' selected':'')+'>'+esc(o[k])+'</option>'}).join('')}
function cname(id){var c=clients.filter(function(x){return x.id===id})[0];return c?c.name:'—'}
function loadClients(){return sb.from('clients').select('*').order('name').then(function(r){clients=r.data||[]})}
function setView(v){view=v;document.querySelectorAll('.side .t').forEach(function(b){b.classList.toggle('on',b.dataset.v===v)});window.scrollTo(0,0);paint()}
function paint(){if(view==='home')home();else if(view==='clients')clientList();else clientDetail()}
/* ---- À traiter ---- */
function home(){
 $('main').innerHTML='<h1>À traiter</h1><p class="sub">Demandes de courrier et messages en attente, tous clients confondus.</p><div id="hp"></div>';
 Promise.all([sb.from('mails').select('*').in('status',REQ).order('received_on',{ascending:false}),sb.from('requests').select('*').order('created_at',{ascending:false}).limit(300)]).then(function(r){
  var ms=r[0].data||[],rq=r[1].data||[];$('nbTodo').textContent=ms.length;
  var last={};rq.forEach(function(x){if(!last[x.client_id])last[x.client_id]=x});
  var ans=Object.keys(last).filter(function(k){return last[k].author_role==='client'}).map(function(k){return last[k]});
  $('nbTodo').textContent=ms.length+ans.length;
  $('hp').innerHTML='<div class="panel"><h2>Courriers à traiter ('+ms.length+')</h2>'+(ms.map(function(m){return '<div class="row"><span class="d">'+G.fd(m.received_on)+'</span><div class="m"><b>'+esc(cname(m.client_id))+' · '+esc(m.sender)+'</b><small>'+esc(m.subject||'')+'</small></div><div class="a"><span class="pill new">'+esc(G.MAIL[m.status])+'</span><button class="sm" data-act="goClient" data-id="'+m.client_id+'" data-t="courrier">Ouvrir</button></div></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucune demande en attente.</p>')+'</div>'+
  '<div class="panel"><h2>Messages à répondre ('+ans.length+')</h2>'+(ans.map(function(m){return '<div class="row"><span class="d">'+G.fd(m.created_at)+'</span><div class="m"><b>'+esc(cname(m.client_id))+' · '+esc(m.subject||'Message')+'</b><small>'+esc(m.body.slice(0,140))+'</small></div><div class="a"><button class="sm" data-act="goClient" data-id="'+m.client_id+'" data-t="msg">Répondre</button></div></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucun message en attente.</p>')+'</div>'})}
/* ---- Clients ---- */
function clientList(){
 $('main').innerHTML='<h1>Clients</h1><p class="sub">Un dossier par client, avec ses accès, son courrier, ses documents et son secrétariat.</p>'+
 '<div class="panel"><h2>Nouveau client</h2><form class="cform" id="nc"><div class="two"><label>Dénomination<input id="nn" required></label><label>Formule<input id="nf" placeholder="Domiciliation avec gestion du courrier"></label></div><div class="two"><label>E-mail de contact<input id="ne" type="email"></label><label>Début du contrat<input id="nd" type="date"></label></div><div class="chk"><label><input type="checkbox" id="s1" checked> Domiciliation</label><label><input type="checkbox" id="s2"> Secrétariat</label></div><div><button class="sm p" type="submit">Créer le client</button></div></form></div>'+
 '<div class="panel"><h2>Dossiers ('+clients.length+')</h2>'+(clients.map(function(c){return '<div class="row"><span class="d">'+G.fd(c.contract_start)+'</span><div class="m"><b>'+esc(c.name)+'</b><small>'+esc(c.formule||'')+'</small></div><div class="a">'+(c.services||[]).map(function(s){return '<span class="pill">'+(s==='secretariat'?'Secrétariat':'Domiciliation')+'</span>'}).join('')+'<button class="sm p" data-act="goClient" data-id="'+c.id+'" data-t="fiche">Ouvrir</button></div></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucun client pour le moment.</p>')+'</div>'}
/* ---- Détail client ---- */
function clientDetail(){
 if(!cur){setView('clients');return}
 var c=clients.filter(function(x){return x.id===cur})[0];if(!c){setView('clients');return}
 $('main').innerHTML='<button class="sm" data-act="back">← Tous les clients</button><h1 style="margin-top:14px">'+esc(c.name)+'</h1><p class="sub">'+esc(c.formule||'')+'</p><div class="filters" id="tabs">'+TABS.map(function(t){return '<button data-tab="'+t[0]+'"'+(t[0]===tab?' class="on"':'')+'>'+t[1]+'</button>'}).join('')+'</div><div id="tb"></div>';
 TAB[tab](c)}
var TAB={
 fiche:function(c){
  var s=c.services||[];
  $('tb').innerHTML='<div class="panel"><h2>Fiche client</h2><form class="cform" id="ef"><div class="two"><label>Dénomination<input id="en" value="'+esc(c.name)+'" required></label><label>Formule<input id="eform" value="'+esc(c.formule||'')+'"></label></div><div class="two"><label>E-mail de contact<input id="ee" type="email" value="'+esc(c.contact_email||'')+'"></label><label>Début du contrat<input id="ed" type="date" value="'+esc(c.contract_start||'')+'"></label></div><label>Adresse de domiciliation<input id="ea" value="'+esc(c.address)+'"></label><label>Notes internes (non visibles du client)<textarea id="eno">'+esc(c.notes||'')+'</textarea></label><div class="chk"><label><input type="checkbox" id="es1"'+(s.indexOf('domiciliation')>-1?' checked':'')+'> Domiciliation</label><label><input type="checkbox" id="es2"'+(s.indexOf('secretariat')>-1?' checked':'')+'> Secrétariat</label></div><div><button class="sm p" type="submit">Enregistrer</button> <button class="sm" type="button" data-act="delClient">Supprimer le client</button></div></form></div>'},
 acces:function(c){
  sb.from('profiles').select('*').eq('client_id',c.id).then(function(r){var u=r.data||[];
   $('tb').innerHTML='<div class="panel"><h2>Créer un accès</h2><form class="cform" id="uf"><div class="two"><label>Nom de l’utilisateur<input id="un"></label><label>Adresse e-mail<input id="ue" type="email" required></label></div><label>Mot de passe initial (facultatif, 8 caractères minimum ; généré sinon)<input id="up" type="text" autocomplete="off"></label><div><button class="sm p" type="submit">Créer l’accès</button></div></form></div><div class="panel"><h2>Accès existants ('+u.length+')</h2>'+(u.map(function(p){return '<div class="row"><span class="d"></span><div class="m"><b>'+esc(p.full_name||p.email)+'</b><small>'+esc(p.email||'')+'</small></div><div class="a"><button class="sm" data-act="reset" data-id="'+p.id+'">Nouveau mot de passe</button><button class="sm" data-act="delUser" data-id="'+p.id+'">Supprimer</button></div></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucun accès pour ce client.</p>')+'</div>'})},
 courrier:function(c){
  sb.from('mails').select('*').eq('client_id',c.id).order('received_on',{ascending:false}).then(function(r){var m=r.data||[];
   $('tb').innerHTML='<div class="panel"><h2>Enregistrer un courrier reçu</h2><form class="cform" id="mfm"><div class="two"><label>Date de réception<input id="md" type="date" value="'+new Date().toISOString().slice(0,10)+'" required></label><label>Expéditeur<input id="msn" required></label></div><div class="two"><label>Objet<input id="mo"></label><label>Scan (PDF ou image, 20 Mo max)<input id="mfile" type="file" accept="application/pdf,image/*"></label></div><div><button class="sm p" type="submit">Ajouter le courrier</button></div></form></div><div class="panel"><h2>Courriers ('+m.length+')</h2>'+(m.map(function(x){return '<div class="row"><span class="d">'+G.fd(x.received_on)+'</span><div class="m"><b>'+esc(x.sender)+'</b><small>'+esc(x.subject||'')+'</small></div><div class="a">'+(x.file_path?'<button class="sm" data-act="open" data-p="'+esc(x.file_path)+'">Scan</button>':'<label class="sm" style="cursor:pointer">Ajouter le scan<input type="file" hidden data-act="scanfile" data-id="'+x.id+'" accept="application/pdf,image/*"></label>')+'<select class="sm" data-act="mstatus" data-id="'+x.id+'">'+opts(G.MAIL,x.status)+'</select><button class="sm" data-act="delMail" data-id="'+x.id+'" data-p="'+esc(x.file_path||'')+'">Supprimer</button></div></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucun courrier.</p>')+'</div>'})},
 docs:function(c){
  sb.from('documents').select('*').eq('client_id',c.id).order('created_at',{ascending:false}).then(function(r){var d=r.data||[];
   $('tb').innerHTML='<div class="panel"><h2>Déposer un document</h2><form class="cform" id="df"><div class="two"><label>Titre<input id="dt" required></label><label>Catégorie<select id="dc">'+opts(G.CAT,'autre')+'</select></label></div><label>Fichier (PDF ou image, 20 Mo max)<input id="dfile" type="file" accept="application/pdf,image/*" required></label><div><button class="sm p" type="submit">Déposer</button></div></form></div><div class="panel"><h2>Documents ('+d.length+')</h2>'+(d.map(function(x){return '<div class="row"><span class="d">'+esc(G.CAT[x.category])+'</span><div class="m"><b>'+esc(x.title)+'</b><small>Ajouté le '+G.fd(x.created_at)+'</small></div><div class="a"><button class="sm" data-act="open" data-p="'+esc(x.file_path)+'">Ouvrir</button><button class="sm" data-act="delDoc" data-id="'+x.id+'" data-p="'+esc(x.file_path)+'">Supprimer</button></div></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucun document.</p>')+'</div>'})},
 sec:function(c){
  var on=(c.services||[]).indexOf('secretariat')>-1;
  sb.from('secretariat_tasks').select('*').eq('client_id',c.id).order('created_at',{ascending:false}).then(function(r){var t=r.data||[];
   $('tb').innerHTML=(on?'':'<p class="demo-bar" style="border-radius:8px;margin-bottom:14px">La prestation Secrétariat n’est pas activée pour ce client : il ne voit pas cet onglet. Activez-la dans la fiche.</p>')+'<div class="panel"><h2>Nouvelle tâche</h2><form class="cform" id="tf"><div class="two"><label>Tâche<input id="tt" required></label><label>Échéance<input id="td" type="date"></label></div><label>Détail (visible du client)<input id="tdet"></label><div><button class="sm p" type="submit">Ajouter la tâche</button></div></form></div><div class="panel"><h2>Tâches ('+t.length+')</h2>'+(t.map(function(x){return '<div class="row"><span class="d">'+(x.due_on?G.fd(x.due_on):'')+'</span><div class="m"><b>'+esc(x.title)+'</b><small>'+esc(x.detail||'')+'</small></div><div class="a"><select class="sm" data-act="tstatus" data-id="'+x.id+'">'+opts(G.TASK,x.status)+'</select><button class="sm" data-act="delTask" data-id="'+x.id+'">Supprimer</button></div></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucune tâche.</p>')+'</div><p class="sub">Les documents du secrétariat se déposent dans l’onglet Documents, catégorie « Secrétariat ».</p>'})},
 ech:function(c){
  sb.from('deadlines').select('*').eq('client_id',c.id).order('due_on').then(function(r){var d=r.data||[];
   $('tb').innerHTML='<div class="panel"><h2>Nouvelle échéance</h2><form class="cform" id="lf2"><div class="two"><label>Date<input id="ld" type="date" required></label><label>Intitulé<input id="lt" required></label></div><label>Détail<input id="ldet"></label><div><button class="sm p" type="submit">Ajouter</button></div></form></div><div class="panel"><h2>Échéances ('+d.length+')</h2>'+(d.map(function(x){return '<div class="row"><span class="d">'+G.fd(x.due_on)+'</span><div class="m"><b>'+esc(x.title)+'</b><small>'+esc(x.detail||'')+'</small></div><div class="a"><button class="sm" data-act="delDl" data-id="'+x.id+'">Supprimer</button></div></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucune échéance.</p>')+'</div>'})},
 msg:function(c){
  sb.from('requests').select('*').eq('client_id',c.id).order('created_at',{ascending:false}).then(function(r){var t=r.data||[];
   $('tb').innerHTML='<div class="panel"><h2>Répondre au client</h2><form class="cform" id="rf"><label>Sujet<input id="rs" value="Réponse"></label><label>Message<textarea id="rb" required maxlength="5000"></textarea></label><div><button class="sm p" type="submit">Envoyer</button></div></form></div><div class="panel"><h2>Échanges ('+t.length+')</h2>'+(t.map(function(x){return '<div class="thread'+(x.author_role==='admin'?' me':'')+'"><div class="h"><b>'+(x.author_role==='admin'?'GOLDSAM':'Client')+' · '+G.fdt(x.created_at)+'</b><span class="pill">'+esc(x.subject||'Message')+'</span></div><p>'+esc(x.body)+'</p></div>'}).join('')||'<p class="sub" style="padding:14px 0;margin:0">Aucun échange.</p>')+'</div>'})}
};
function after(msg){G.toast(msg);TAB[tab](clients.filter(function(x){return x.id===cur})[0])}
function callFn(body){return sb.functions.invoke('admin-users',{body:body}).then(function(r){if(r.error){var m=r.error.message;try{if(r.error.context&&r.error.context.json)return r.error.context.json().then(function(j){throw new Error(j.error||m)})}catch(e){throw e}throw new Error(m)}return r.data})}
function showPwd(email,pwd,title){modal(title,'<p class="sub" style="margin:0 0 10px">Transmettez ces identifiants au client. Le mot de passe ne sera plus affiché.</p><div class="scan" style="aspect-ratio:auto;padding:16px;text-align:left;font-size:13px;color:#101e22"><b>Adresse :</b> '+esc(email)+'<br><b>Mot de passe :</b> <span id="pw" style="font-family:monospace">'+esc(pwd)+'</span></div><button class="sm p" id="cp">Copier</button>');
 $('cp').onclick=function(){try{navigator.clipboard.writeText($('pw').textContent).then(function(){G.toast('Mot de passe copié.')})}catch(e){}}}
document.addEventListener('click',function(e){
 var t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;clientDetail();return}
 var b=e.target.closest('[data-act]');if(!b||b.tagName==='SELECT'||b.tagName==='INPUT')return;
 var a=b.dataset.act,id=b.dataset.id;
 if(a==='goClient'){cur=id;tab=b.dataset.t||'fiche';setView('client');return}
 if(a==='back'){cur=null;setView('clients');return}
 if(a==='open'){G.openFile(b.dataset.p);return}
 var rm=function(path){return path?sb.storage.from('documents').remove([path]):Promise.resolve()};
 if(a==='delMail'){if(!confirm('Supprimer ce courrier ?'))return;rm(b.dataset.p).then(function(){return sb.from('mails').delete().eq('id',id)}).then(function(r){if(!err(r))after('Courrier supprimé.')});return}
 if(a==='delDoc'){if(!confirm('Supprimer ce document ?'))return;rm(b.dataset.p).then(function(){return sb.from('documents').delete().eq('id',id)}).then(function(r){if(!err(r))after('Document supprimé.')});return}
 if(a==='delTask'){sb.from('secretariat_tasks').delete().eq('id',id).then(function(r){if(!err(r))after('Tâche supprimée.')});return}
 if(a==='delDl'){sb.from('deadlines').delete().eq('id',id).then(function(r){if(!err(r))after('Échéance supprimée.')});return}
 if(a==='delClient'){if(!confirm('Supprimer ce client, ses accès, son courrier et ses documents ? Cette action est définitive.'))return;
  sb.from('profiles').select('id').eq('client_id',cur).then(function(r){return Promise.all((r.data||[]).map(function(p){return callFn({action:'delete',user_id:p.id}).catch(function(){})}))}).then(function(){
   return sb.storage.from('documents').list(cur,{limit:1000})}).then(function(l){var paths=((l&&l.data)||[]).map(function(f){return cur+'/'+f.name});return paths.length?sb.storage.from('documents').remove(paths):null}).then(function(){return sb.from('clients').delete().eq('id',cur)}).then(function(r){if(err(r))return;G.toast('Client supprimé.');cur=null;loadClients().then(function(){setView('clients')})});return}
 if(a==='reset'){if(!confirm('Générer un nouveau mot de passe pour cet accès ?'))return;
  sb.from('profiles').select('email').eq('id',id).single().then(function(p){return callFn({action:'reset_password',user_id:id}).then(function(d){showPwd(p.data.email,d.password,'Nouveau mot de passe')})}).catch(function(x){G.toast('Erreur : '+x.message)});return}
 if(a==='delUser'){if(!confirm('Supprimer cet accès ?'))return;callFn({action:'delete',user_id:id}).then(function(){after('Accès supprimé.')}).catch(function(x){G.toast('Erreur : '+x.message)});return}
});
document.addEventListener('change',function(e){
 var s=e.target,a=s.dataset&&s.dataset.act,id=s.dataset&&s.dataset.id;
 if(a==='mstatus'){sb.from('mails').update({status:s.value}).eq('id',id).then(function(r){if(!err(r)){G.toast('Statut mis à jour.');updTodo()}})}
 if(a==='tstatus'){sb.from('secretariat_tasks').update({status:s.value,updated_at:new Date().toISOString()}).eq('id',id).then(function(r){if(!err(r))G.toast('Statut mis à jour.')})}
 if(a==='scanfile'&&s.files[0]){G.toast('Envoi du scan…');G.upload(cur,s.files[0]).then(function(p){return sb.from('mails').update({file_path:p,status:'scanned'}).eq('id',id)}).then(function(r){if(!err(r))after('Scan ajouté.')}).catch(function(x){G.toast('Erreur : '+x.message)})}
});
document.addEventListener('submit',function(e){
 e.preventDefault();var f=e.target.id,v=function(i){return ($(i).value||'').trim()};
 if(f==='nc'){var sv=[];if($('s1').checked)sv.push('domiciliation');if($('s2').checked)sv.push('secretariat');
  sb.from('clients').insert({name:v('nn'),formule:v('nf')||null,contact_email:v('ne')||null,contract_start:v('nd')||null,services:sv.length?sv:['domiciliation']}).select().single().then(function(r){if(err(r))return;G.toast('Client créé.');loadClients().then(function(){cur=r.data.id;tab='acces';setView('client')})});return}
 if(f==='ef'){var s2=[];if($('es1').checked)s2.push('domiciliation');if($('es2').checked)s2.push('secretariat');
  sb.from('clients').update({name:v('en'),formule:v('eform')||null,contact_email:v('ee')||null,contract_start:v('ed')||null,address:v('ea'),notes:v('eno')||null,services:s2}).eq('id',cur).then(function(r){if(err(r))return;G.toast('Fiche enregistrée.');loadClients().then(clientDetail)});return}
 if(f==='uf'){callFn({action:'create',email:v('ue'),full_name:v('un'),client_id:cur,password:v('up')||undefined}).then(function(d){showPwd(d.email,d.password,'Accès créé');TAB.acces(clients.filter(function(x){return x.id===cur})[0])}).catch(function(x){G.toast('Erreur : '+x.message)});return}
 if(f==='mfm'){var file=$('mfile').files[0];(file?G.upload(cur,file):Promise.resolve(null)).then(function(p){return sb.from('mails').insert({client_id:cur,received_on:v('md'),sender:v('msn'),subject:v('mo')||null,file_path:p,status:p?'scanned':'new'})}).then(function(r){if(!err(r))after('Courrier ajouté.')}).catch(function(x){G.toast('Erreur : '+x.message)});return}
 if(f==='df'){var fl=$('dfile').files[0];if(!fl)return;G.upload(cur,fl).then(function(p){return sb.from('documents').insert({client_id:cur,title:v('dt'),category:$('dc').value,file_path:p})}).then(function(r){if(!err(r))after('Document déposé.')}).catch(function(x){G.toast('Erreur : '+x.message)});return}
 if(f==='tf'){sb.from('secretariat_tasks').insert({client_id:cur,title:v('tt'),detail:v('tdet')||null,due_on:v('td')||null}).then(function(r){if(!err(r))after('Tâche ajoutée.')});return}
 if(f==='lf2'){sb.from('deadlines').insert({client_id:cur,due_on:v('ld'),title:v('lt'),detail:v('ldet')||null}).then(function(r){if(!err(r))after('Échéance ajoutée.')});return}
 if(f==='rf'){sb.from('requests').insert({client_id:cur,author_id:me.id,author_role:'admin',subject:v('rs')||'Réponse',body:v('rb')}).then(function(r){if(!err(r))after('Message envoyé.')});return}
});
function updTodo(){Promise.all([sb.from('mails').select('id',{count:'exact',head:true}).in('status',REQ),sb.from('requests').select('client_id,author_role,created_at').order('created_at',{ascending:false}).limit(300)]).then(function(r){var last={};(r[1].data||[]).forEach(function(x){if(!last[x.client_id])last[x.client_id]=x});var n=Object.keys(last).filter(function(k){return last[k].author_role==='client'}).length;$('nbTodo').textContent=(r[0].count||0)+n})}
function start(p){
 if(p.role!=='admin'){$('lmsg').textContent='Accès réservé à l’équipe GOLDSAM.';sb.auth.signOut();return}
 me=p;$('cu').textContent=p.email||'';$('login').style.display='none';$('app').classList.add('on');
 loadClients().then(function(){setView('home')})}
$('lf').addEventListener('submit',function(e){e.preventDefault();var b=$('lb');b.disabled=true;$('lmsg').textContent='Connexion…';
 sb.auth.signInWithPassword({email:$('le').value.trim(),password:$('lp').value}).then(function(r){b.disabled=false;
  if(r.error){$('lmsg').textContent='Adresse e-mail ou mot de passe incorrect.';return}
  $('lp').value='';G.profile().then(function(p){if(p)start(p)})})});
$('out').addEventListener('click',function(){sb.auth.signOut().then(function(){location.reload()})});
document.querySelectorAll('.side .t').forEach(function(b){b.addEventListener('click',function(){if(b.dataset.v==='clients')cur=null;setView(b.dataset.v)})});
$('mc').addEventListener('click',closeModal);
$('modal').addEventListener('click',function(e){if(e.target===$('modal'))closeModal()});
G.profile().then(function(p){if(p)start(p)});
})();
