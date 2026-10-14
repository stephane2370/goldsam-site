(function(){
var C=window.GS_CFG,sb=window.supabase.createClient(C.url,C.key,{auth:{persistSession:true,autoRefreshToken:true}});
var tt;
var GS={sb:sb,
 $:function(i){return document.getElementById(i)},
 esc:function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})},
 fd:function(d){if(!d)return '';var p=String(d).slice(0,10).split('-');return p[2]+'/'+p[1]+'/'+p[0]},
 fdt:function(d){var x=new Date(d);return x.toLocaleDateString('fr-FR')+' '+x.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})},
 toast:function(m){var t=GS.$('toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('on')},3200)},
 MAIL:{new:'Reçu',scan_requested:'Scan demandé',forward_requested:'Réexpédition demandée',pickup_requested:'Retrait annoncé',scanned:'Numérisé',forwarded:'Réexpédié',picked_up:'Retiré',archived:'Archivé'},
 TASK:{a_faire:'À faire',en_cours:'En cours',termine:'Terminé'},
 CAT:{contrat:'Contrat',attestation:'Attestation',facture:'Facture',secretariat:'Secrétariat',autre:'Autre'},
 openFile:function(path){
  var w=window.open('','_blank');
  sb.storage.from('documents').createSignedUrl(path,300).then(function(r){
   if(r.error||!r.data){if(w)w.close();GS.toast('Fichier indisponible.');return}
   if(w)w.location.href=r.data.signedUrl;else location.href=r.data.signedUrl})},
 safeName:function(n){return n.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-80)},
 upload:function(clientId,file){
  var path=clientId+'/'+crypto.randomUUID()+'-'+GS.safeName(file.name);
  return sb.storage.from('documents').upload(path,file,{contentType:file.type||'application/pdf'}).then(function(r){if(r.error)throw r.error;return path})},
 profile:function(){return sb.auth.getSession().then(function(r){var s=r.data.session;if(!s)return null;
  return sb.from('profiles').select('id,email,full_name,role,client_id').eq('id',s.user.id).single().then(function(p){return p.data})})}
};
window.GS=GS;
})();
