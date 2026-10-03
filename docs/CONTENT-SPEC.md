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

### `hashcrack`: woordenlijstaanval nabootsen

```js
lab: { type: 'hashcrack', algo: 'md5', hash: '<hex-hash>', salt: '', wordlist: ['welkom', 'wachtwoord123', ...] }
```
De leerling start een woordenlijstaanval en kan eigen gokken toevoegen. Algoritmen: `md5`, `sha1`, `sha256`.
Met een `salt` wordt `hash(salt + woord)` berekend. **Bereken de hash zelf met Node** (`require('crypto')`) en controleer die.

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

## Schrijfstijl

- Nederlands, informeel ("je"), helder en concreet. Leg vaktermen uit en gebruik de Engelse term tussen haakjes waar dat gangbaar is.
- Gebruik analogieën uit het dagelijks leven, daarna de techniek.
- Gebruik Nederlandse context waar het past: NCSC, Politie, Autoriteit Persoonsgegevens, Cyberbeveiligingswet (NIS2), art. 138ab Sr.
- Benadruk ethiek: aanvalstechnieken oefen je alleen in je eigen lab of met schriftelijke toestemming.
- Een taak telt zo'n 250-700 woorden, met minstens één concreet voorbeeld en 2-4 vragen.
