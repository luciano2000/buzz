/**
 * BrasilBuzz — main.js
 * Target: < 4KB minified | Zero deps | defer loaded
 * Técnicas: IntersectionObserver, requestAnimationFrame
 */
(function () {
  'use strict';

  /* === DATA ATUAL NO HEADER === */
  var dateEl = document.getElementById('current-date');
  if (dateEl) {
    var opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('pt-BR', opts);
  }

  /* === CONTADOR DE VIEWS (animação de número) ===
     Aumenta o social proof — vai de 0 até o valor em ~1.2s           */
  var viewEl = document.getElementById('view-count');
  if (viewEl) {
    var target = 47284;
    var duration = 1200; // ms
    var start = null;
    function animateCount(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      viewEl.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(animateCount);
    }
    // Só anima quando o elemento entra na viewport
    var countObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(animateCount);
        countObs.disconnect();
      }
    }, { threshold: 0.5 });
    countObs.observe(viewEl);
  }

  /* === SCROLL REVEAL (signal-cards) ===
     Usa IntersectionObserver — zero scroll listeners, zero jank       */
  var revealEls = document.querySelectorAll('.signal-card, .protocol-step');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    // Fallback: mostra tudo sem animação (prefers-reduced-motion / browsers antigos)
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* === RESPEITA prefers-reduced-motion ===
     Se o user pediu menos movimento, mostra tudo imediatamente        */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.signal-card').forEach(function (el) {
      el.style.transition = 'none';
      el.classList.add('is-visible');
    });
  }

  /* === STICKY HEADER: adiciona sombra ao rolar ===
     Usa scroll event com flag para evitar reflow desnecessário         */
  var header = document.querySelector('.site-header');
  if (header) {
    var isScrolled = false;
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) {
        isScrolled = scrolled;
        header.style.boxShadow = isScrolled
          ? '0 2px 12px rgba(0,0,0,0.12)'
          : 'none';
      }
    }, { passive: true }); // passive: não bloqueia o thread principal
  }

  /* === PROTOCOL STEPS REVEAL ===
     Cards do protocolo também fazem reveal com pequeno delay           */
  var steps = document.querySelectorAll('.protocol-step');
  if (steps.length && 'IntersectionObserver' in window) {
    var stepsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 80);
          stepsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    steps.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      stepsObs.observe(el);
    });
  }


  /* === ANCHOR AD — fechar e remover padding ===
     Política Google: anchor deve ser dismissível pelo usuário            */
  var anchorAd = document.getElementById('anchor-ad');
  var anchorClose = document.getElementById('anchor-close');
  if (anchorAd && anchorClose) {
    document.body.classList.add('has-anchor');
    anchorClose.addEventListener('click', function () {
      anchorAd.style.display = 'none';
      document.body.classList.remove('has-anchor');
    }, { once: true });
  }

})();
