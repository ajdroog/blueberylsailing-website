/* ==========================================================================
   STATISTIEKEN · Blue Beryl Sailing
   Meet hoe de site het doet met Umami: zonder cookies, dus zonder cookiebanner.
   Wordt geladen door js/site.js (homepage en logboek-pers) en door 404.html.

   EENMALIG INVULLEN (stap 2 in STATISTIEKEN.txt)
   Umami geeft je bij je website een trackingcode die er zo uitziet:
     <script defer src="https://cloud.umami.is/script.js" data-website-id="1a2b3c4d-..."></script>
   Zet de waarde van src bij UMAMI_SCRIPT en de waarde van data-website-id bij UMAMI_ID.
   Zolang UMAMI_ID leeg is, meet de site niets. Er gaat dan ook niets mis.
   ========================================================================== */
(function () {
  var UMAMI_SCRIPT = 'https://cloud.umami.is/script.js';
  var UMAMI_ID = '';

  // Alleen de echte site telt mee. De testversie op je eigen computer (localhost) niet.
  var DOMEINEN = ['blueberylsailing.com', 'www.blueberylsailing.com'];

  /* ------------------------------------------------------------------------
     Wat er gemeten wordt (namen zoals ze in Umami onder Events verschijnen)
       lezing-aangevraagd    boekformulier verstuurd en goed aangekomen (+ soort event)
       formulier-begonnen    iemand begon het boekformulier in te vullen
       formulier-mislukt     versturen lukte niet
       gezien-lezing / gezien-video / gezien-boekformulier
                             die sectie kwam echt in beeld (iemand scrolde ernaartoe)
       video-aangeklikt      iemand klikte op de video
       klik-boek-knop        een knop of link naar 'Boek een lezing' (+ waar op de pagina)
       klik-mail / klik-bellen
       klik-instagram / klik-facebook / klik-youtube / klik-polarsteps / klik-linkedin
       klik-pers             krantenartikel of pdf geopend (+ welk artikel)
       klik-sponsor          sponsorlogo aangeklikt (+ welke sponsor)
       klik-extern           andere link naar een andere website (+ welke)
       schip-details         knop 'alle details van het schip' geopend
       pagina-niet-gevonden  iemand kwam op een adres dat niet (meer) bestaat (+ welk adres)
     Zelf iets meten vanuit andere code: window.bbStatistieken.meet('naam', { sleutel: 'waarde' })
     ------------------------------------------------------------------------ */

  var zoek = location.search;
  var TEST = /[?&]test-statistieken\b/.test(zoek); // toont metingen in de browserconsole, verstuurt niets

  // Eigen bezoeken niet meetellen: open op elk apparaat één keer
  //   https://blueberylsailing.com/?niet-tellen   (en ?wel-tellen om het terug te draaien)
  try {
    if (/[?&]niet-tellen\b/.test(zoek)) {
      localStorage.setItem('umami.disabled', '1');
      toonMelding('Gelukt: op dit apparaat tellen jouw bezoeken niet meer mee in de statistieken.');
      schoonAdres();
    } else if (/[?&]wel-tellen\b/.test(zoek)) {
      localStorage.removeItem('umami.disabled');
      toonMelding('Gelukt: op dit apparaat tellen jouw bezoeken weer mee in de statistieken.');
      schoonAdres();
    }
  } catch (x) {}

  var uitgezet = false;
  try { uitgezet = localStorage.getItem('umami.disabled') !== null; } catch (x) {}
  var actief = !!UMAMI_ID && DOMEINEN.indexOf(location.hostname) > -1 && !uitgezet && !TEST;
  if (!actief && !TEST) return;

  var wachtrij = [];
  function meet(naam, data) {
    if (TEST && window.console) console.info('[statistieken]', naam, data || '');
    if (!actief) return;
    if (window.umami && typeof window.umami.track === 'function') {
      try { window.umami.track(naam, data); } catch (x) {}
    } else {
      wachtrij.push([naam, data]);
    }
  }
  window.bbStatistieken = { meet: meet };

  if (actief) {
    var s = document.createElement('script');
    s.src = UMAMI_SCRIPT;
    s.defer = true;
    s.setAttribute('data-website-id', UMAMI_ID);
    s.setAttribute('data-domains', DOMEINEN.join(','));
    s.setAttribute('data-exclude-hash', 'true'); // /#lezing en /#boek tellen als de homepage
    s.onload = function () {
      var item;
      while ((item = wachtrij.shift())) meet(item[0], item[1]);
    };
    document.head.appendChild(s);
  }

  /* ---------- Pagina niet gevonden (404.html) ---------- */
  if (/^Pagina niet gevonden/.test(document.title)) {
    meet('pagina-niet-gevonden', { adres: (location.pathname + location.search).slice(0, 200) });
  }

  /* ---------- Boekformulier ---------- */
  var form = document.getElementById('boekaanvraag');
  var melding = document.getElementById('boekmelding');
  if (form) {
    var begonnen = false, wachtOpAntwoord = false, soort = '';
    form.addEventListener('input', function () {
      if (!begonnen) { begonnen = true; meet('formulier-begonnen'); }
    });
    form.addEventListener('submit', function () {
      wachtOpAntwoord = true;
      soort = (form.elements.soort && form.elements.soort.value) || '';
    });
    // Het formulier toont na versturen een melding; die vertelt of het gelukt is.
    if (melding && window.MutationObserver) {
      new MutationObserver(function () {
        var tekst = (melding.textContent || '').replace(/^\s+/, '');
        if (!wachtOpAntwoord || melding.hidden || !tekst) return;
        wachtOpAntwoord = false;
        if (/^Bedankt/i.test(tekst)) meet('lezing-aangevraagd', { soort: soort || 'onbekend' });
        else meet('formulier-mislukt', { melding: tekst.slice(0, 120) });
      }).observe(melding, { attributes: true, childList: true, characterData: true, subtree: true });
    }
  }
  // Zonder JavaScript stuurt boek.php de bezoeker terug met ?verzonden=1 of ?fout=1
  if (/[?&]verzonden=1\b/.test(zoek)) meet('lezing-aangevraagd', { soort: 'onbekend' });
  if (/[?&]fout=1\b/.test(zoek)) meet('formulier-mislukt', { melding: 'teruggestuurd door boek.php' });

  /* ---------- Welke secties komen echt in beeld ---------- */
  var secties = { lezing: 'gezien-lezing', video: 'gezien-video', boek: 'gezien-boekformulier' };
  if (window.IntersectionObserver) {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (!item.isIntersecting) return;
        meet(secties[item.target.id]);
        kijker.unobserve(item.target);
      });
    }, { rootMargin: '0px 0px -40% 0px' });
    Object.keys(secties).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) kijker.observe(el);
    });
  }

  /* ---------- Video (YouTube in de pagina) ---------- */
  // Een klik in de video zelf is niet direct te zien; wel dat de video de focus krijgt.
  var videoGemeten = false;
  window.addEventListener('blur', function () {
    setTimeout(function () {
      var el = document.activeElement;
      if (!videoGemeten && el && el.tagName === 'IFRAME' && /youtube/.test(el.src || '')) {
        videoGemeten = true;
        meet('video-aangeklikt');
      }
    }, 0);
  });

  /* ---------- Kliks op links en knoppen ---------- */
  var SOCIAL = {
    'instagram.com': 'klik-instagram',
    'facebook.com': 'klik-facebook',
    'youtube.com': 'klik-youtube',
    'youtu.be': 'klik-youtube',
    'polarsteps.com': 'klik-polarsteps',
    'linkedin.com': 'klik-linkedin'
  };

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, [data-open]') : null;
    if (!el) return;

    if (el.tagName !== 'A') {
      if (el.getAttribute('data-open') === 'schip-details') meet('schip-details');
      return;
    }

    var href = el.getAttribute('href') || '';
    if (/^mailto:/i.test(href)) return meet('klik-mail', { plek: plek(el) });
    if (/^tel:/i.test(href)) return meet('klik-bellen', { plek: plek(el) });
    if (/^(\/)?#boek$/.test(href)) return meet('klik-boek-knop', { plek: plek(el), tekst: tekstVan(el) });

    var url;
    try { url = new URL(el.href, location.href); } catch (x) { return; }
    if (!/^https?:$/.test(url.protocol)) return;

    if (/\.pdf$/i.test(url.pathname)) {
      return meetEnGa(e, el, 'klik-pers', { artikel: url.pathname.split('/').pop() });
    }
    if (url.hostname === location.hostname) return; // gewone link binnen de eigen site

    var host = url.hostname.replace(/^www\./, '');
    if (SOCIAL[host]) return meetEnGa(e, el, SOCIAL[host], { plek: plek(el) });
    if (el.closest('[aria-label="Sponsoren"]')) return meetEnGa(e, el, 'klik-sponsor', { sponsor: host });
    if (/^\/logboek-pers\//.test(location.pathname)) return meetEnGa(e, el, 'klik-pers', { artikel: host });
    meetEnGa(e, el, 'klik-extern', { naar: host });
  }, true);

  // Bij een link die de site in hetzelfde tabblad verlaat: eerst meten, dan pas weg (max 0,4 s).
  function meetEnGa(e, a, naam, data) {
    var nieuwTabblad = a.target === '_blank' || e.ctrlKey || e.shiftKey || e.metaKey || e.altKey || e.button !== 0;
    if (!actief || nieuwTabblad || e.defaultPrevented || !window.umami) { meet(naam, data); return; }
    e.preventDefault();
    var weg = false;
    function ga() { if (!weg) { weg = true; location.href = a.href; } }
    try {
      var p = window.umami.track(naam, data);
      if (p && typeof p.then === 'function') p.then(ga, ga);
    } catch (x) {}
    setTimeout(ga, 400);
  }

  function plek(el) {
    if (el.closest('header')) return 'menu';
    if (el.closest('footer')) return 'voettekst';
    var sectie = el.closest('section[id]');
    return sectie ? sectie.id : 'pagina';
  }

  function tekstVan(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  }

  /* ---------- Hulpjes ---------- */
  function schoonAdres() {
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (x) {}
  }

  function toonMelding(tekst) {
    function plaats() {
      var d = document.createElement('div');
      d.setAttribute('role', 'status');
      d.textContent = tekst;
      d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:520px;margin:0 auto;' +
        'padding:14px 18px;background:#0A1620;color:#F3EFE8;border-left:4px solid #F26A2E;' +
        'font:500 16px/1.5 Barlow,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35)';
      document.body.appendChild(d);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 7000);
    }
    if (document.body) plaats(); else document.addEventListener('DOMContentLoaded', plaats);
  }
})();
