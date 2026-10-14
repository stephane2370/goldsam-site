(function(){
var b=document.getElementById('burger'),n=document.getElementById('nav');
b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.classList.remove('open');b.setAttribute('aria-expanded',false)}});
var f=document.getElementById('cf');if(!f)return;
var st=document.getElementById('status'),fb=document.getElementById('fallback'),cp=document.getElementById('copy');
f.addEventListener('submit',function(e){
 e.preventDefault();
 if(!f.checkValidity()){f.reportValidity();st.textContent='Merci de renseigner les champs obligatoires.';return}
 var d=new FormData(f),to='contact@goldsam.fr';
 var sub='Demande via goldsam : '+d.get('besoin');
 var body='Nom : '+d.get('nom')+'\nSociété : '+(d.get('societe')||'-')+'\nEmail : '+d.get('email')+'\nTéléphone : '+(d.get('tel')||'-')+'\nBesoin : '+d.get('besoin')+'\n\n'+d.get('message');
 cp.value='À : '+to+'\nObjet : '+sub+'\n\n'+body;fb.style.display='block';
 st.textContent='Votre messagerie va s’ouvrir avec le message prêt à envoyer.';
 location.href='mailto:'+to+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body);
});
})();
