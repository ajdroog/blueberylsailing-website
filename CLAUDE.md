# Instructies voor Claude (of een andere AI) bij deze website

Dit is de website van Blue Beryl Sailing (www.blueberylsailing.com), van Sander Droog en Yvette Oeben.
Het is een statische site: gewone HTML, CSS en een beetje JavaScript. Geen WordPress, geen framework, geen build-stap.
Deze map staat in Google Drive ("Mijn Drive > Blue Beryl website") en wordt gesynchroniseerd naar Sanders computer.

## Mappen
- `www/` is PRECIES wat online staat bij TransIP (map `www` op de server). Pas de site alleen hier aan.
- `www/index.html` is de one-pager. Bovenaan het menu (verhaal, lezing, video, logboek & pers, over ons, contact), onderaan het boekingsformulier.
- `www/logboek-pers/index.html` is de pagina met logboek en pers.
- `www/en/` is de Engelse versie (`www/en/index.html` en `www/en/logboek-pers/index.html`). Zelfde opbouw als de Nederlandse pagina's, met taalkeuze NL | EN in het menu (`.taalkeuze`). Pas je een tekst of blok aan in de Nederlandse pagina, pas dan ook de Engelse aan. Het boekformulier op de Engelse pagina stuurt `taal=en` mee, zodat `boek.php` Engels antwoordt.
- `www/fotos/` bevat de foto's, `www/fotos/partners/` de sponsorlogo's. Bestandsnamen in kleine letters met streepjes.
- `www/pers/` bevat krantenartikelen als pdf.
- `www/.htaccess` regelt doorverwijzingen van oude WordPress-adressen. Niet weggooien.
- `upload-naar-transip.bat` (+ `upload.ps1`) zet de map `www/` online. Sander dubbelklikt er zelf op; hij typt dan zijn SFTP-wachtwoord.
- `transip-instellingen.txt` bevat host, gebruiker en poort (geen wachtwoord). Niet aanpassen tenzij Sander het vraagt.
- `start-testversie.bat` + `testserver.ps1` tonen `www/` lokaal op http://localhost:8080.

## Werkwijze bij een wijziging
1. Pas bestanden aan in `www/`.
2. Foto's: maximaal 1600 px breed, jpg kwaliteit ongeveer 80, beschrijvende alt-tekst.
3. Nieuwe pagina? Voeg de url toe aan `www/sitemap.xml`.
4. Laat Sander controleren met `start-testversie.bat` en daarna dubbelklikken op `upload-naar-transip.bat`.

## Huisstijl
- Taal: Nederlands, "wij"-vorm, gewone woorden, actieve zinnen. Professioneel en stoer.
- Kleuren: donker marineblauw #0A1620, oranje accent #F26A2E.
- Koppen: Barlow Condensed (hoofdletters). Lopende tekst: Barlow.
- Logo: witte zeilboot "Blue Beryl Sailing" (`www/fotos/logo.png`).

## Feiten (niet zelf aanvullen)
- Schip: Blue Beryl, Koopmans 44. Vertrek uit Amsterdam Marina op 23 augustus 2020, thuis in Groningen in 2025.
- Mast gebroken op 22 april 2022 om 06:00, tussen Galapagos en Frans-Polynesie, bij 17 knopen wind.
- 2.100 zeemijl zonder mast naar Hiva Oa (Marquesas). Land in zicht op 8 mei 2022.
- Dronefoto's van de aankomst: altijd vermelden "(c) Sailing Black Moon" (toestemming gekregen).
- Sponsors: De Vries Maritiem, Code 050, Arius, Gebo, Passage Guardian.
- Contact: info@blueberylsailing.com, +31 6 47 95 33 49.
Twijfel je over een feit, vraag het Sander in plaats van het te raden.
