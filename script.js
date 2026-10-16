  /* ================================================================
     CONFIGURAÇÃO DE CHECKOUT — edite apenas estas duas linhas.
     Cole a URL completa do checkout de cada plano (ex.: https://...).
     Enquanto estiverem vazias, os botões rolam até a seção de planos.
     ================================================================ */
  window.CONFIG = {
    CHECKOUT_BASICO:   "",
    CHECKOUT_COMPLETO: ""
  };

(function(){
  /* ---- Checkout: aplica a URL de cada plano e repassa UTMs da página ---- */
  var cfg = window.CONFIG || {};
  var map = { basico: cfg.CHECKOUT_BASICO, completo: cfg.CHECKOUT_COMPLETO };
  var params = new URLSearchParams(location.search);

  function buildUrl(base){
    try{
      var url = new URL(base);
      params.forEach(function(v,k){ if(!url.searchParams.has(k)) url.searchParams.set(k,v); });
      return url.toString();
    }catch(e){ return base; }
  }

  document.querySelectorAll('[data-checkout]').forEach(function(a){
    var base = map[a.getAttribute('data-checkout')];
    if(base && /^https?:\/\//i.test(base)) a.href = buildUrl(base);
  });

  /* ---- Ampliar imagens (somente quando houver <img>) ---- */
  var dlg = document.querySelector('dialog.lightbox');
  var dlgImg = dlg.querySelector('img');
  document.querySelectorAll('.zoomable').forEach(function(box){
    var img = box.querySelector('img');
    if(!img) return;
    box.setAttribute('role','button');
    box.setAttribute('tabindex','0');
    box.setAttribute('aria-label', img.alt ? 'Ampliar: ' + img.alt : 'Ampliar imagem');
    function open(){
      dlgImg.src = img.currentSrc || img.src;
      dlgImg.alt = img.alt || '';
      if(dlg.showModal) dlg.showModal();
    }
    box.addEventListener('click', open);
    box.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); }
    });
  });
  dlg.querySelector('.lb-close').addEventListener('click', function(){ dlg.close(); });
  dlg.addEventListener('click', function(e){ if(e.target === dlg) dlg.close(); });
})();
