/* ======================================================================
   Vigortrix landing page — page logic (vanilla JS)
   - formata data no header vermelho
   - countdown 19:59 persistido em sessionStorage
   - gate: esconde seções .gated até vídeo atingir 3606s (ou flag localStorage)
   - back-button hijack redireciona para vigortrix.com
   ====================================================================== */

(function () {
  'use strict';

  /* ---------------- data no header ---------------- */
  function fillDate() {
    var el = document.getElementById('data-hoje');
    if (!el) return;
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    el.textContent = mm + '/' + dd + '/' + d.getFullYear();
  }

  /* ---------------- countdown 19:59 ---------------- */
  function runCountdown() {
    var el = document.getElementById('countdown');
    if (!el) return;
    var KEY = 'vigortrix_countdown_start';
    var TOTAL = 19 * 60 + 59; // 19:59 in seconds
    var start = Number(sessionStorage.getItem(KEY));
    if (!start || isNaN(start)) {
      start = Date.now();
      sessionStorage.setItem(KEY, String(start));
    }
    function tick() {
      var elapsed = Math.floor((Date.now() - start) / 1000);
      var remaining = Math.max(0, TOTAL - elapsed);
      var m = String(Math.floor(remaining / 60)).padStart(2, '0');
      var s = String(remaining % 60).padStart(2, '0');
      el.textContent = m + ':' + s;
      if (remaining > 0) setTimeout(tick, 1000);
    }
    tick();
  }

  /* ---------------- gate de revelação ---------------- */
  function setupGate() {
    var SECONDS_TO_DISPLAY = 2014; // delay de 2014 segundos
    var STORAGE_KEY = 'vigortrix_revealed_' + SECONDS_TO_DISPLAY;
    var revealed = false;

    function reveal() {
      if (revealed) return;
      revealed = true;
      var gated = document.querySelectorAll('.gated');
      for (var i = 0; i < gated.length; i++) gated[i].classList.remove('gated');
      try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (e) {}
      var oferta = document.getElementById('Oferta');
      if (oferta) oferta.scrollIntoView({ behavior: 'smooth' });
    }
    window.__vigortrixReveal = reveal; // util p/ teste manual no console

    // se já assistiu antes, revela imediato
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        setTimeout(reveal, 100);
        return;
      }
    } catch (e) {}

    // monitora progresso do vídeo; smartplayer é exposto globalmente pelo player.js v3
    var retries = 0;
    var hooked = false;
    function watchPlayer() {
      var sp = window.smartplayer;
      var instance = sp && sp.instances && sp.instances.length ? sp.instances[0] : null;
      if (!instance) {
        if (retries++ < 20) setTimeout(watchPlayer, 1000);
        return;
      }
      if (typeof instance.on === 'function' && !hooked) {
        hooked = true;
        instance.on('timeupdate', function () {
          if (instance.video && instance.video.currentTime >= SECONDS_TO_DISPLAY) {
            reveal();
          }
        });
      }
    }
    watchPlayer();
  }

  /* ---------------- back-button hijack ---------------- */
  function setupBackRedirect() {
    try {
      history.pushState({}, '', location.href);
      history.pushState({}, '', location.href);
    } catch (e) { return; }
    window.addEventListener('popstate', function (e) {
      if (!e.state) return;
      setTimeout(function () {
        location.href = 'https://www.vigortrix.com/bk1-tb1/?sid5=bk1_tb4' + location.search;
      }, 1);
    });
  }

  /* ---------------- bootstrap ---------------- */
  // main.js é carregado com defer: roda após DOM parse
  fillDate();
  runCountdown();
  setupGate();
  setupBackRedirect();

})();
