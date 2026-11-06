// Menu op de telefoon
(function () {
  var knop = document.querySelector('.menu-knop');
  var kop = document.querySelector('header');
  if (knop && kop) {
    knop.addEventListener('click', function () {
      var open = kop.classList.toggle('open');
      knop.setAttribute('aria-expanded', open ? 'true' : 'false');
      knop.textContent = open ? 'Sluiten' : 'Menu';
    });
    kop.querySelectorAll('nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        kop.classList.remove('open');
        knop.setAttribute('aria-expanded', 'false');
        knop.textContent = 'Menu';
      });
    });
  }

  // Alle details van het schip
  var dialoog = document.getElementById('schip-details');
  var opener = document.querySelector('[data-open="schip-details"]');
  function sluit() { dialoog.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  if (dialoog && opener) {
    opener.addEventListener('click', function () {
      dialoog.hidden = false; document.body.style.overflow = 'hidden';
      var x = dialoog.querySelector('[data-sluit]'); if (x) x.focus();
    });
    dialoog.addEventListener('click', function (e) { if (e.target === dialoog || e.target.closest('[data-sluit]')) sluit(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dialoog.hidden) sluit(); });
  }

  // Boekformulier: opent het mailprogramma met de aanvraag
  var form = document.getElementById('boekformulier');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var regels = [
        'Naam: ' + f.naam.value,
        'Organisatie: ' + f.organisatie.value,
        'E-mail: ' + f.email.value,
        'Telefoon: ' + f.telefoon.value,
        'Soort event: ' + f.soort.value,
        'Gewenste datum: ' + f.datum.value,
        '',
        f.bericht.value
      ];
      var onderwerp = 'Aanvraag lezing' + (f.organisatie.value ? ' - ' + f.organisatie.value : '');
      window.location.href = 'mailto:' + form.getAttribute('data-mailto') +
        '?subject=' + encodeURIComponent(onderwerp) + '&body=' + encodeURIComponent(regels.join('\n'));
    });
  }
})();
