#!/usr/bin/env bash
# Maakt van www/ een dev-versie in build/ die veilig naast de echte site kan staan.
# - robots.txt blokkeert alle zoekmachines
# - .htaccess stuurt niet meer door naar de echte site en zet een noindex-header
# - boek.php mailt niet naar info@blueberylsailing.com maar naar DEV_MAIL_TO (of nergens)
# Gebruik: DEV_HOST=dev.blueberylsailing.com DEV_MAIL_TO=jij@voorbeeld.nl .github/scripts/dev-build.sh
set -euo pipefail

DEV_HOST="${DEV_HOST:-dev.blueberylsailing.com}"
DEV_MAIL_TO="${DEV_MAIL_TO:-}"

rm -rf build
cp -a www build

# 1. Zoekmachines buiten houden
printf 'User-agent: *\nDisallow: /\n' > build/robots.txt
rm -f build/sitemap.xml

# 2. .htaccess: eigen host in plaats van de echte site, plus noindex
if [ -f build/.htaccess ]; then
  sed -i "s#https://blueberylsailing\.com/\$1#https://${DEV_HOST}/\$1#" build/.htaccess
  cat >> build/.htaccess <<'EOF'

# DEV-VERSIE: nooit in zoekmachines
<IfModule mod_headers.c>
  Header set X-Robots-Tag "noindex, nofollow, noarchive"
</IfModule>
EOF
fi

# 3. Boekformulier: geen echte mail naar info@
if [ -f build/boek.php ]; then
  if [ -n "$DEV_MAIL_TO" ]; then
    SAFE_TO=$(printf '%s' "$DEV_MAIL_TO" | sed "s/[^A-Za-z0-9@._+-]//g")
    sed -i "s#^\\\$ONTVANGER = .*#\$ONTVANGER = '${SAFE_TO}';#" build/boek.php
  else
    sed -i "s#^\\\$ONTVANGER = .*#\$ONTVANGER = 'geen-mail@dev.invalid';#" build/boek.php
  fi
fi

# Controles: stoppen als de aanpassingen niet gelukt zijn
grep -q 'Disallow: /' build/robots.txt
if [ -f build/.htaccess ]; then
  grep -q 'X-Robots-Tag' build/.htaccess
  if grep -q 'https://blueberylsailing\.com/\$1' build/.htaccess; then
    echo "FOUT: .htaccess verwijst nog naar de echte site" >&2; exit 1
  fi
fi
if [ -f build/boek.php ] && grep -E '^\$ONTVANGER' build/boek.php | grep -q 'info@blueberylsailing.com'; then
  echo "FOUT: boek.php mailt nog naar het echte adres" >&2; exit 1
fi

echo "Dev-build klaar in build/ ($(find build -type f | wc -l) bestanden)"
