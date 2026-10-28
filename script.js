  /* ================================================================
     CONFIGURAÇÃO DE CHECKOUT — edite apenas estas duas linhas.
     Cole a URL completa do checkout de cada plano (ex.: https://...).
     Enquanto estiverem vazias, os botões rolam até a seção de planos.
     ================================================================ */
  window.CONFIG = {
    CHECKOUT_BASICO:   "https://pay.wiapy.com/JIvXfLv6ySsA",
    CHECKOUT_COMPLETO: "https://pay.wiapy.com/PZElfwHoItYL"
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
  });

  function openZoom(box){
    var img = box && box.querySelector('img');
    if(!img) return;
    dlgImg.src = img.currentSrc || img.src;
    dlgImg.alt = img.alt || '';
    if(dlg.showModal) dlg.showModal();
  }
  /* Delegação: funciona também nas cópias criadas pelo carrossel */
  document.addEventListener('click', function(e){
    var box = e.target.closest && e.target.closest('.zoomable');
    if(box) openZoom(box);
  });
  document.addEventListener('keydown', function(e){
    var box = e.target.closest && e.target.closest('.zoomable[tabindex]');
    if(box && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); openZoom(box); }
  });
  dlg.querySelector('.lb-close').addEventListener('click', function(){ dlg.close(); });
  dlg.addEventListener('click', function(e){ if(e.target === dlg) dlg.close(); });

  /* ---- Carrossel infinito automático ---- */
  var SPEED = 40; /* pixels por segundo */
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hasIO = 'IntersectionObserver' in window;

  document.querySelectorAll('.carousel').forEach(function(root){
    var track = root.querySelector('.carousel-track');
    var originals = Array.prototype.slice.call(track.children);
    if(reduceMotion || !originals.length) return;
    var started = false;

    function build(){
      track.querySelectorAll('[data-clone]').forEach(function(n){ n.remove(); });
      var setWidth = originals.reduce(function(sum, el){
        return sum + el.getBoundingClientRect().width + parseFloat(getComputedStyle(el).marginRight || 0);
      }, 0);
      if(!setWidth) return;

      /* Repete o conjunto até cobrir a tela + uma volta, para o loop não ter buracos */
      var total = setWidth;
      while(total < root.clientWidth + setWidth){
        originals.forEach(function(el){
          var c = el.cloneNode(true);
          c.setAttribute('data-clone','');
          c.setAttribute('aria-hidden','true');
          c.removeAttribute('tabindex');
          c.removeAttribute('role');
          c.removeAttribute('aria-label');
          track.appendChild(c);
        });
        total += setWidth;
      }
      root.style.setProperty('--shift', setWidth + 'px');
      root.style.setProperty('--dur', (setWidth / SPEED) + 's');
      root.classList.add('is-running');
    }

    function start(){
      if(started) return;
      started = true;
      build();
      var lastW = window.innerWidth, t;
      window.addEventListener('resize', function(){
        if(window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        clearTimeout(t);
        t = setTimeout(build, 200);
      });
    }

    /* Só monta o carrossel quando ele chega perto da tela,
       e pausa a animação quando ele sai de vista (economiza processamento) */
    if(!hasIO){ start(); return; }
    new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting) start();
        root.classList.toggle('is-offscreen', !en.isIntersecting);
      });
    }, { rootMargin: '300px 0px' }).observe(root);
  });

  /* ---- Barra fixa: aparece depois que o card do Plano Básico sai da tela por cima ---- */
  var bar = document.querySelector('.sticky-offer');
  var trigger = document.querySelector('.plan--basic');
  if(bar && trigger){
    bar.hidden = false;
    function setBar(show){
      bar.classList.toggle('is-visible', show);
      document.body.classList.toggle('has-sticky', show);
    }
    if(hasIO){
      /* O navegador avisa quando o card entra/sai da tela — sem medir a cada rolagem */
      new IntersectionObserver(function(entries){
        var en = entries[0];
        setBar(!en.isIntersecting && en.boundingClientRect.bottom < 0);
      }).observe(trigger);
    }else{
      window.addEventListener('scroll', function(){
        setBar(trigger.getBoundingClientRect().bottom < 0);
      }, { passive: true });
    }
  }
})();
