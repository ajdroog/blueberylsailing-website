<?php
// Boekingsformulier Blue Beryl Sailing: stuurt een lezingaanvraag naar info@blueberylsailing.com.
// Wordt aangeroepen door het formulier op de homepage (index.html, #boek).
// TransIP verstuurt de mail; het afzenderadres moet op het eigen domein staan.

$ONTVANGER = 'info@blueberylsailing.com';
$AFZENDER  = 'info@blueberylsailing.com';
$TERUG     = '/';
date_default_timezone_set('Europe/Amsterdam');

header('X-Content-Type-Options: nosniff');
$wilJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function antwoord($ok, $melding, $code = 200) {
  global $wilJson, $TERUG;
  if ($wilJson) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => $ok, 'melding' => $melding]);
  } else {
    header('Location: ' . $TERUG . ($ok ? '?verzonden=1' : '?fout=1') . '#boek', true, 303);
  }
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: ' . $TERUG . '#boek', true, 303);
  exit;
}

function veld($naam, $max = 200) {
  $w = isset($_POST[$naam]) ? trim((string)$_POST[$naam]) : '';
  $w = str_replace(["\r", "\0"], '', $w);
  return mb_substr($w, 0, $max, 'UTF-8');
}
function regel($w) { return str_replace("\n", ' ', $w); }

// Spamfilters: verborgen veld moet leeg blijven en het formulier moet minstens 3 seconden open staan.
if (veld('website') !== '') antwoord(true, 'Bedankt.');
$start = (int)veld('t', 20);
if ($start > 0 && (time() - $start) < 3) antwoord(false, 'Dat ging wel erg snel. Probeer het nog een keer.', 400);

$naam        = regel(veld('naam', 120));
$organisatie = regel(veld('organisatie', 160));
$email       = regel(veld('email', 160));
$telefoon    = regel(veld('telefoon', 40));
$soort       = regel(veld('soort', 60));
$datum       = regel(veld('datum', 20));
$bericht     = veld('bericht', 4000);

if ($naam === '' || $email === '') antwoord(false, 'Vul je naam en e-mailadres in.', 400);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) antwoord(false, 'Dit e-mailadres klopt niet. Kijk het even na.', 400);

$onderwerp = 'Aanvraag lezing' . ($organisatie !== '' ? ' - ' . $organisatie : ' - ' . $naam);
$tekst = "Nieuwe aanvraag via blueberylsailing.com\n\n"
       . "Naam:           $naam\n"
       . "Organisatie:    $organisatie\n"
       . "E-mail:         $email\n"
       . "Telefoon:       $telefoon\n"
       . "Soort event:    $soort\n"
       . "Gewenste datum: $datum\n\n"
       . "Over het publiek en de wensen:\n$bericht\n\n"
       . "--\nVerstuurd op " . date('d-m-Y H:i') . " vanaf IP " . ($_SERVER['REMOTE_ADDR'] ?? 'onbekend') . "\n"
       . "Beantwoorden gaat rechtstreeks naar de aanvrager.\n";

$headers  = 'From: "Website Blue Beryl Sailing" <' . $AFZENDER . ">\r\n";
$headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$ok = mail($ONTVANGER, '=?UTF-8?B?' . base64_encode($onderwerp) . '?=', $tekst, $headers, '-f' . $AFZENDER);

if ($ok) antwoord(true, 'Bedankt! Je aanvraag is binnen. We nemen zo snel mogelijk contact met je op.');
antwoord(false, 'Versturen lukte niet. Mail ons direct op info@blueberylsailing.com.', 500);
