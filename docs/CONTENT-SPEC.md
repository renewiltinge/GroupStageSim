# Content-specificatie: zo schrijf je een room

Elke room is één JavaScript-bestand in `content/rooms/<room-id>.js` en staat in de lijst in `content/manifest.js`.
Het bestand roept precies één keer `CS.registerRoom({...})` aan. Er is geen buildstap nodig: het portaal
laadt de bestanden als gewone `<script>`-tags, zodat het ook werkt door `index.html` te openen (`file://`).

## Structuur van een room

```js
/* Room: Netwerken — de basis */
CS.registerRoom({
  id: 'netwerken-basis',            // gelijk aan de bestandsnaam, kebab-case
  path: 'fundamenten',              // 'fundamenten' | 'security-kern' | 'offensief' | 'defensief' | 'eindopdracht'
  order: 2,                         // volgorde binnen het leerpad
  title: 'Netwerken: de basis',
  icon: '🌐',                       // één emoji
  difficulty: 'Makkelijk',          // 'Makkelijk' | 'Gemiddeld' | 'Moeilijk'
  minutes: 60,                      // geschatte tijd
  summary: 'Eén of twee zinnen die op de roomkaart staan.',
  objectives: [                     // 3-6 leerdoelen ("Na deze room kun je ...")
    'Uitleggen wat een IP-adres en een MAC-adres zijn',
  ],
  tasks: [ /* zie hieronder, 4-7 taken */ ],
  terms: [                          // 5-12 begrippen voor de begrippenlijst
    { term: 'IP-adres', def: 'Logisch adres van een apparaat in een netwerk ...' },
  ],
  resources: [                      // 1-4 betrouwbare externe bronnen om verder te leren
    { title: 'OverTheWire: Bandit', url: 'https://overthewire.org/wargames/bandit/' },
  ],
});
```

## Taken (tasks)

```js
{
  title: 'Taak 2 — TCP en UDP',
  content: `
    <p>Uitleg in HTML ...</p>
  `,
  lab: { type: 'terminal', ... },   // optioneel, maximaal één lab per taak
  questions: [ /* zie hieronder */ ],
}
```

### Toegestane HTML in `content`

- Gewone tekst: `<p>`, `<h3>`, `<h4>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<code>`, `<kbd>`, `<a href target="_blank" rel="noopener">`.
- Codeblokken: `<pre><code>...</code></pre>` (escape `<` en `>` als `&lt;` en `&gt;`).
- Tabellen: `<table><thead>...</thead><tbody>...</tbody></table>`.
- Inklapbaar: `<details><summary>Titel</summary>...</details>`.
- Callouts: `<div class="callout tip">`, `<div class="callout info">`, `<div class="callout warn">`, `<div class="callout danger">`.
  Begin een callout met `<strong>Tip:</strong>` of iets vergelijkbaars.
- Diagrammen: inline `<svg>` in `<figure class="diagram">` met `<figcaption>`. Gebruik geen vaste kleuren maar
  `stroke="currentColor"`, `fill="none"`, of de CSS-variabelen `var(--accent)`, `var(--accent-soft)`,
  `var(--muted)`, `var(--surface-2)`, `var(--good)`, `var(--bad)`. Zet `viewBox` en laat de breedte weg.
  Tekst in SVG: `fill="currentColor"` en `font-size="13"`.

Template literals: een backtick in je tekst schrijf je als `&#96;` en `${` als `$\{`.

### Vragen

Drie soorten:

```js
// 1. Open antwoord (zoals TryHackMe). Hoofdletters en spaties aan begin/eind tellen niet mee.
{ q: 'Welke poort gebruikt HTTPS standaard?', answer: '443', hint: 'Kijk in de tabel met poorten.', explain: 'HTTPS = HTTP over TLS op TCP-poort 443.' }
{ q: 'Wat is de vlag in notes.txt?', answer: ['JVT{eerste_stap}'], hint: 'Gebruik cat.' }

// 2. Meerkeuze. answer = index (vanaf 0) van het juiste antwoord.
{ q: 'Welk protocol is verbindingsloos?', options: ['TCP', 'UDP', 'HTTP'], answer: 1, explain: 'UDP stuurt zonder handshake.' }

// 3. Geen antwoord nodig (lezen/bevestigen).
{ q: 'Ik heb de uitleg over de CIA-triade gelezen.', noAnswer: true }
```

Velden:
- `answer` (string of array met geldige varianten). Het eerste element bepaalt het getoonde antwoordformaat (`***.***`).
- `hint` (optioneel): wordt pas getoond als de leerling op "Hint" klikt.
- `explain` (optioneel, aanbevolen): verschijnt na een goed antwoord.
- `xp` (optioneel): standaard 10 voor open, 5 voor meerkeuze, 2 voor noAnswer.
- `encoded: true` (optioneel): de vlag staat gecodeerd in de room (bijv. Base64 of ROT13), zodat de validator hem niet letterlijk vindt.

Controleer je room met `node tools/validate.js content/rooms/<room-id>.js`.

Regels voor goede vragen:
- Elk antwoord moet te vinden of af te leiden zijn uit de tekst van de taak of uit het lab.
- Open antwoorden zijn kort en eenduidig: een getal, een woord, een commando, een vlag. Geef varianten mee
  (bijv. `['ls -a', 'ls -la', 'ls -al']`).
- Vlaggen hebben altijd het formaat `JVT{kleine_letters_met_underscores}`.

## Labs

Er is maximaal één lab per taak. De beschikbare types staan hieronder.

### `terminal`: Linux-terminal (of PowerShell) in de browser

```js
lab: {
  type: 'terminal',
  shell: 'bash',                 // 'bash' (standaard) of 'powershell'
  user: 'student', host: 'jvt-lab',
  home: '/home/student', cwd: '/home/student',
  motd: 'Welkom! Typ help voor de commando\'s.',
  fs: {                          // platte map: absoluut pad -> inhoud. Mappen worden afgeleid.
    '/home/student/notes.txt': 'Hallo!\nJVT{eerste_stap}\n',
    '/home/student/.verborgen/flag.txt': 'JVT{verborgen_bestand}\n',
    '/home/student/leeg/': null,  // lege map: pad eindigt op '/' met waarde null
  },
  denied: ['/root', '/etc/shadow'],          // lezen/openen geeft "Permission denied"
  modes: { '/usr/bin/find': '-rwsr-xr-x' },  // optioneel, voor ls -l (standaard -rw-r--r-- / drwxr-xr-x)
  owners: { '/root': 'root' },               // optioneel, voor ls -l (standaard user)
  commands: {                    // vaste uitvoer voor exacte commando's (spaties genormaliseerd)
    'ip a': '1: lo: ...',
    'nmap -sV 10.10.20.5': 'Starting Nmap ...',
  },
}
```

Ingebouwde bash-commando's: `help, ls [-a] [-l], cd, pwd, cat, head [-n N], tail [-n N], grep [-i] [-n] [-r] [-v] [-c] patroon [pad],
find [pad] [-name patroon] [-type f|d], echo, whoami, id, hostname, uname [-a], history, clear, wc [-l],
file, sort [-r] [-n], uniq [-c], cut -d X -f N, base64 [-d], sha256sum, md5sum, touch, mkdir, rm, strings`.
Pipes (`|`) werken: `cat auth.log | grep Failed | wc -l`.
`commands` gaat altijd vóór de ingebouwde commando's.
Bij `shell: 'powershell'` zijn er alleen `help`, `clear`/`cls`, `history` en de `commands` (hoofdletterongevoelig).
Zet de commando's die de leerling moet typen in de taaktekst, want `commands` werkt alleen op een exacte match.

### `cyberchef`: coderen, decoderen, hashen

```js
lab: { type: 'cyberchef', input: 'SlZUe2Jhc2U2NF9pc19nZWVuX2VuY3J5cHRpZX0=' }
```
Bewerkingen: Base64 en Hex (coderen/decoderen), Binair (coderen/decoderen), ROT13, Caesar (verschuiving n),
URL (coderen/decoderen), Omkeren, XOR (sleutel), MD5, SHA-1 en SHA-256. Ze kunnen achter elkaar worden toegepast.

### `hashcrack`: wachtwoord-hash kraken (woordenlijst, regels & brute-force)

```js
lab: {
  type: 'hashcrack',
  algo: 'md5',          // 'md5' | 'sha1' | 'sha256' | 'ntlm' (Windows, = MD4 van UTF-16LE) | 'md4'
  hash: '<hex-hash>',
  salt: '',             // optioneel
  saltPos: 'prefix',    // 'prefix' => hash(salt+woord) (standaard) | 'suffix' => hash(woord+salt)
  wordlist: ['welkom', 'zomer2024', ...],
}
```
De leerling kiest een **modus**:
- **Woordenlijst**: de lijst aflopen, met eigen gokken erbij. Daarbovenop zijn er **regels (mangling)** aan te zetten:
  eerste letter hoofdletter, l33t (a→@ e→3 o→0 s→$ i→1), `+ cijfer 0–99`, `+ jaar 1990–2026`, `+ leesteken`.
- **Brute-force (masker)**: kies een tekenset (a–z/A–Z/0–9/symbolen) en een lengte (1–4). De zoekruimte is afgekapt op
  ~800.000 pogingen, juist om te laten voelen waarom lengte explodeert. Het lab toont live pogingen en hashes/seconde.

**Belangrijk voor de validator:** er moet minstens één woord in `wordlist` staan dat de hash echt kraakt (met de juiste
`algo`/`salt`/`saltPos`), anders volgt een waarschuwing. Voor een taak die via regels of masker bedoeld is: zet het
doelwachtwoord tóch in de wordlist (de validator is tevreden) en beschrijf in de tekst dat de leerling het via de
regels/het masker vindt. **Bereken en controleer hashes met de validator** (die ondersteunt ook `ntlm`/`md4` en `saltPos`)
of met Node (`require('crypto')` voor md5/sha1/sha256).

### `hashid`: het hashtype herkennen

```js
lab: { type: 'hashid', value: '<hash>' }   // value optioneel (startwaarde)
```
Herkent op lengte en vorm o.a. MD5, NTLM/MD4 (beide 32 hex — dubbelzinnig, context beslist), SHA-1/224/256/384/512,
bcrypt (`$2a/$2b/$2y$`), md5crypt (`$1$`), sha256/512crypt (`$5$`/`$6$`), Argon2, LDAP `{SSHA}`/`{SHA}`, en herkent
Base64-codering of een `hash:salt`-formaat. Markeert trage/gesalte typen als "moeilijk te kraken". Ideaal vóór een
`hashcrack`-taak: eerst herkennen, dan de juiste aanval kiezen.

### `cipher`: klassieke cijfers kraken (Caesar/XOR/Vigenère/Atbash)

```js
lab: { type: 'cipher', text: '<versleutelde tekst of hex>' }
```
Methodes: **Caesar/ROT** (toont alle 26 verschuivingen plus een automatische "beste gok" via frequentiescore),
**XOR (1 byte)** (brute-forcet alle 256 sleutels, top-kandidaten gesorteerd; leest hex-invoer automatisch),
**Vigenère** (ontsleutelt met een ingevulde sleutel), **Atbash** en **Omkeren**. De automatische gok scoort op
Nederlandse/Engelse letterfrequentie en veelvoorkomende woorden (incl. `jvt{`). **Reken je ciphertext zelf na**: een
vlag die pas ná ontsleutelen verschijnt, zet je met `encoded: true` op de vraag.

### `password`: sterkte en kraaktijd van een wachtwoord

```js
lab: { type: 'password' }
```

### `phishing`: rode vlaggen zoeken in e-mails

```js
lab: {
  type: 'phishing',
  emails: [
    {
      phishing: true,
      fromName: 'NederBank Veiligheid', from: 'security@nederbank-verificatie.info',
      to: 'rene@voorbeeld.nl', subject: 'URGENT: uw rekening wordt geblokkeerd', date: 'ma 6 okt 2026 07:12',
      flags: { from: 'Het domein is niet nederbank.nl ...', subject: 'Haast en dreiging ...' },  // rode vlaggen in de kop (optioneel)
      body: [
        [ { text: 'Geachte klant,', flag: 'Onpersoonlijke aanhef ...' } ],
        [ { text: 'Wij hebben verdachte activiteit gezien. ' }, { text: 'Binnen 24 uur', flag: 'Tijdsdruk ...' } ],
        [ { text: 'Verifieer nu', link: 'http://nederbank.verify-login.ru/nl', flag: 'Link naar een vreemd domein ...' } ],
      ],
    },
  ],
}
```
De leerling klikt op verdachte onderdelen en kiest daarna "phishing" of "legitiem". Gebruik **altijd fictieve
organisaties** (NederBank, PakketPost, Belastingdienst-achtige namen zoals "Rijksbelastingen"); geen echte merken.

### `logs`: logbestanden doorzoeken

```js
lab: { type: 'logs', title: '/var/log/auth.log', lines: `regel 1\nregel 2\n...` }
```
Een viewer met filter (tekst, of `/regex/`), regelnummers en een teller. Geschikt voor auth.log, Apache-access-logs,
firewalllogs, Windows-events en Sysmon. Maak realistische regels (20-80 stuks) met een duidelijk spoor dat
de leerling moet vinden.

### `http`: HTTP-verzoeken naar een nepserver sturen

```js
lab: {
  type: 'http',
  host: 'shop.jvt.lab',
  start: { method: 'GET', path: '/', headers: { 'Cookie': 'session=8f2a; role=user' }, body: '' },
  routes: [   // eerste match wint
    { method: 'GET', path: '/robots.txt', status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'User-agent: *\nDisallow: /beheer' },
    { method: 'GET', path: '/beheer', when: [{ header: 'Cookie', contains: 'role=admin' }], status: 200, body: 'JVT{...}' },
    { method: 'GET', path: '/beheer', status: 403, body: 'Geen toegang' },
    { method: 'POST', path: '/login', when: [{ body: 'contains', value: 'user=admin' }], status: 302, headers: { 'Location': '/' } },
  ],
}
```
`path` wordt exact vergeleken met het pad plus de querystring (bijv. `/product?id=2`). Voorwaarden in `when` zijn
`{ header: 'Naam', contains: 'tekst' }` of `{ body: 'contains', value: 'tekst' }`, en ze moeten allemaal kloppen.
Zonder match volgt `404 Not Found`.

### `sqli`: SQL-injectie op een nep-loginformulier

```js
lab: { type: 'sqli', flag: 'JVT{...}' }
```
Een loginformulier dat de SQL-query live laat zien en die echt evalueert op een kleine tabel `users`
(id, username, password, role) met de gebruikers admin, jan en fatima. Wie als admin inlogt, krijgt de vlag.
Met een schakelaar zet je prepared statements aan, en dan werkt de injectie niet meer.

### `subnet`: subnetting oefenen

```js
lab: { type: 'subnet' }
```
Een calculator en een generator die willekeurige oefenvragen maakt (netwerkadres, broadcast, aantal hosts).

### `hexviewer`: rauwe bytes lezen (magic bytes, file carving)

```js
lab: {
  type: 'hexviewer',
  filename: 'onbekend.bin',           // optioneel, voor de kop
  hex: '89 50 4E 47 0D 0A 1A 0A ...', // OF base64: '...' OF text: 'ASCII...'
}
```
Toont een klassieke hex-dump (offset · hex · ASCII) plus een inklapbare spiekbrief met veelvoorkomende
bestandssignaturen (PNG, JPEG, PDF, ZIP, ELF, MZ, …). Geef de bytes via `hex` (hex-paren, spaties/enters
mogen), `base64` of `text`. Ideaal om de leerling een bestandstype te laten herkennen aan de eerste bytes,
of een verstopte string/vlag in de ASCII-kolom te laten vinden (zet `encoded: true` op zo'n vlag-vraag).

### `pcap`: netwerkverkeer lezen (Wireshark-light)

```js
lab: {
  type: 'pcap',
  title: 'zaak-042.pcap',
  packets: [
    { no: 1, time: '0.001', src: '10.0.0.5', dst: '93.184.216.34', proto: 'TCP',  len: 74,  info: '51000 → 80 [SYN]' },
    { no: 2, time: '0.052', src: '10.0.0.5', dst: '93.184.216.34', proto: 'HTTP', len: 412, info: 'POST /upload',
      stream: 'POST /upload HTTP/1.1\nHost: evil.jvt.lab\n\nsecret=JVT{...}' },  // stream optioneel
  ],
}
```
Een pakketlijst (nr · tijd · bron · bestemming · protocol · info) met een filter (tekst of `/regex/`). Klik een
pakket aan voor details; geef je `stream` mee, dan verschijnt die als "Follow stream" (ideaal om een vlag in een
HTTP-POST of gereconstrueerde conversatie te verstoppen — zet `encoded: true` op die vraag). Maak 15-40
realistische pakketten met een duidelijk spoor (exfiltratie, C2-verbinding, DNS-tunnel, verdachte download).

### `jwt`: JSON Web Tokens inspecteren

```js
lab: { type: 'jwt', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqYW4ifQ.<handtekening>' }
```
Toont header en payload gedecodeerd (met `exp`/`iat`/`nbf` als leesbare datum en of het token verlopen is),
waarschuwingen voor zwakke configuraties (bijv. `alg: none`, ontbrekende `exp`) en een controle van een
HS256-handtekening met een opgegeven sleutel. Bedoeld om tokens te begrijpen en te beoordelen.

### `regex`: reguliere expressies testen

```js
lab: { type: 'regex', text: 'regel 1\nregel 2 ...', pattern: 'Failed password for (\\w+)', flags: 'gi' }
```
Live markering van alle treffers, een teller en een tabel met capture-groepen. `pattern` en `flags` zijn
optioneel (startwaarde). Inclusief spiekbrief (`\d`, `\w`, `\s`, `[...]`, `+`, `*`, `?`, `{n,m}`, `^$`, groepen).
Let op het dubbel escapen van backslashes in JavaScript-strings (`'\\d+'`).

### `cvss`: CVSS v3.1-basisscore berekenen

```js
lab: { type: 'cvss', vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' }   // vector optioneel
```
Knoppen voor alle acht basismetrieken (AV, AC, PR, UI, S, C, I, A), met live de officiële basisscore (0.0-10.0),
de ernst (None/Low/Medium/High/Critical) en de vectorstring. De leerling kan ook een vector plakken.
Voorbeeldscores ter controle: `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` = 9.8, `AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H` = 10.0,
`AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N` = 6.1, `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` = 7.8, `AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N` = 5.9.

### `timestamp`: tijdstempels omrekenen (forensie)

```js
lab: { type: 'timestamp', value: '133720000000000000' }   // value optioneel
```
Rekent een getal of datum om naar alle gangbare formaten: Unix-tijd (seconden en milliseconden),
Windows FILETIME (100-ns-intervallen sinds 1601-01-01, o.a. NTFS/registry), Chrome/WebKit-tijd
(microseconden sinds 1601-01-01), Apple/Cocoa-tijd (seconden sinds 2001-01-01), ISO 8601 in UTC en
Nederlandse tijd (Europe/Amsterdam). Bij een getal laat het zien welke interpretaties een plausibele datum
opleveren. **Reken voorbeeldwaarden zelf na met Node.**

### `ioc`: indicatoren (IOC's) uit tekst halen

```js
lab: { type: 'ioc', text: 'Rapport ... 185.220.101[.]4 ... hxxps://evil[.]jvt[.]lab/x ... 44d88612fea8a8f36de82e1278abb02f ...' }
```
Haalt IPv4-adressen, domeinen, URL's, e-mailadressen, MD5/SHA-1/SHA-256-hashes en CVE-nummers uit vrije
tekst — ook als ze "defanged" zijn (`hxxp`, `[.]`, `(.)`, `[at]`). Telt per soort, en kan de lijst
defangen (veilig delen) of refangen. Fictieve domeinen eindigen bij voorkeur op `.jvt.lab` of `.example`.

### `url`: URL's ontleden (phishing-analyse)

```js
lab: { type: 'url', urls: ['https://nederbank.nl.login-check.jvt.lab/inloggen?id=1', 'http://192.0.2.7/pakket'] }
```
Splitst elke URL in schema, gebruikersdeel (de `@`-truc), host, subdomein, geregistreerd domein, poort, pad en
queryparameters, en toont rode vlaggen: IP-adres als host, `@` in de URL, punycode (`xn--`), http i.p.v. https,
veel subdomeinen, een bekende merknaam als subdomein, URL-verkorters, ongebruikelijke poort, zeer lange URL.
De leerling kan zelf URL's toevoegen.

### `yara`: YARA-regels schrijven en testen

```js
lab: {
  type: 'yara',
  rule: `rule Verdacht_Script {
  meta:
    auteur = "JVT"
  strings:
    $a = "powershell" nocase
    $b = "-enc" nocase
    $mz = { 4D 5A }
    $re = /https?:\\/\\/[a-z0-9.]+\\.jvt\\.lab/
  condition:
    ($a and $b) or ($mz at 0 and $re)
}`,
  files: [
    { name: 'factuur.docm', text: '... powershell -enc SQBFAFgA ...' },
    { name: 'kladblok.exe', hex: '4D 5A 90 00 ...' },
  ],
}
```
De leerling past de regel aan en scant de bestanden; per bestand zie je welke regels raken en welke strings
waar gevonden zijn. Ondersteunde subset van YARA:
- Meerdere `rule naam { ... }`-blokken (optioneel met tags `rule naam : tag1 tag2`); `meta:` wordt getoond maar niet gebruikt.
- Strings: tekst `"..."` met modifiers `nocase`, `wide`, `ascii`, `fullword`; hex `{ 4D 5A ?? 00 }` (met `??` als joker);
  regex `/.../` met optioneel `i` of `s` erachter.
- Condition: `$a`, `#a` (aantal treffers), `@a` niet; `$a at 0`, `$a in (0..100)`, `any of them`, `all of them`,
  `N of them`, `any|all|N of ($a, $b)`, `any of ($s*)`, `filesize` (met `KB`/`MB`), `uint8(n)`, `uint16(n)`,
  `uint32(n)` (little-endian), vergelijkingen `== != < > <= >=`, `and`, `or`, `not`, haakjes, `true`, `false`.
  Getallen decimaal of `0x..`.
Geef bestanden via `text` (UTF-8) of `hex`. Bedenk 3-6 bestanden waarvan sommige wel en andere niet moeten raken
(goed/fout-positieven), zodat de leerling de regel moet aanscherpen.

### `timeline`: super-timeline van een onderzoek

```js
lab: {
  type: 'timeline',
  title: 'Zaak 2026-117 — WS-FIN-03',
  events: [
    { t: '2026-10-01 08:12:03', src: 'Security', host: 'WS-FIN-03', user: 'j.devries', desc: '4624 aanmelding type 10 (RDP) vanaf 203.0.113.50' },
    { t: '2026-10-01 08:13:40', src: 'Prefetch', host: 'WS-FIN-03', desc: 'RCLONE.EXE-1A2B3C4D.pf — eerste uitvoering' },
  ],
}
```
Alle gebeurtenissen uit verschillende bronnen (eventlog, prefetch, MFT, browser, firewall, proxy, …) worden op tijd
gesorteerd (`t` in UTC, `JJJJ-MM-DD UU:MM:SS`). Met tekst-/regexfilter, chips per bron, een van/tot-tijdvenster,
de tijd sinds de vorige gebeurtenis (Δ) en de mogelijkheid om gebeurtenissen te markeren ⭐. Maak 25-60 events
met ruis én een duidelijk aanvalsverhaal.

### `chmod` en `numconv`: kleine rekenhulpen

```js
lab: { type: 'chmod', mode: '755' }   // Linux-rechten: vinkjes ↔ octaal ↔ rwxr-xr-x (incl. setuid/setgid/sticky)
lab: { type: 'numconv', value: '0x4D5A' }  // getal omzetten: decimaal, hex, binair, octaal, ASCII-tekens
```

## Schrijfstijl

- Nederlands, informeel ("je"), helder en concreet. Leg vaktermen uit en gebruik de Engelse term tussen haakjes waar dat gangbaar is.
- Gebruik analogieën uit het dagelijks leven, daarna de techniek.
- Gebruik Nederlandse context waar het past: NCSC, Politie, Autoriteit Persoonsgegevens, Cyberbeveiligingswet (NIS2), art. 138ab Sr.
- Benadruk ethiek: aanvalstechnieken oefen je alleen in je eigen lab of met schriftelijke toestemming.
- Een taak telt zo'n 250-700 woorden, met minstens één concreet voorbeeld en 2-4 vragen.

### `crackme`: reverse-engineering puzzel (crackme/keygenme)

```js
lab: {
  type: 'crackme',
  title: 'Sleutelcontrole v1',
  intro: 'Een programma vraagt om een sleutel. Lees de controle en leid de juiste sleutel af.',
  source: `function check(key) {\n  return key.split('').reverse().join('') === '62oziuj';\n}`, // wat de leerling leest
  check: (key) => key.split('').reverse().join('') === '62oziuj',                               // de ECHTE controle (functie!)
  flag: 'JVT{...}',          // getoond bij succes (optioneel)
  reveal: 'Mooi — ...',       // extra tekst bij succes (optioneel)
  hint: 'Draai de doelstring om.', // getoond na 3 pogingen (optioneel)
}
```
De leerling leest `source`, typt een sleutel; het lab draait de echte `check(key)` en meldt toegang + `flag` bij succes.
**`check` is een JS-functie in het roombestand** (rooms zijn JS) — maak hem deterministisch en zorg dat het door jou als
antwoord opgegeven wachtwoord écht slaagt (controleer met Node). Gebruikersinvoer wordt alleen als argument doorgegeven
(geen eval). Houd `source` leesbaar maar laat de leerling nog iets te puzzelen over.

### `multidecode`: automatische multi-decoder (CyberChef "Magic"-light)

```js
lab: { type: 'multidecode', input: '536c5a55653231316248527058327868655756795832397266513d3d' }
```
Herkent en pelt lagen codering af: Base64, Base32, hex, binair, URL, ROT13, Atbash, decimaal (code points), Morse en
omkeren. Toont een automatisch gevonden "ketting" (bijv. Hex → Base64 → tekst) én per laag alle kandidaten (klikbaar om
verder te ontleden). Scoort op leesbaarheid en herkent `JVT{...}`. **Bereken je gelaagde invoer met Node** en controleer
dat de ketting op de bedoelde tekst uitkomt; zet `encoded: true` op een vlag-vraag waarvan de vlag pas na decoderen verschijnt.

### `rainbow`: rainbow table (precomputatie) vs. salt

```js
lab: {
  type: 'rainbow', algo: 'md5',
  wordlist: ['welkom', 'zomer2024', ...],   // de voorberekende tabel
  target: '<een md5 om op te zoeken>',       // optioneel (startwaarde)
  saltExample: { word: 'welkom', salt: 'Xy7' }, // toont plain-hash vs gesalte hash (optioneel)
}
```
Toont een voorberekende tabel (hash → woord) en een opzoekveld: een onvergezouten hash wordt direct gevonden, een gesalte
hash niet — zo zie je waarom salt precomputatie breekt. Hashes worden met de echte lab-hashfunctie berekend.
