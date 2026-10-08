/* Room: Crack the Hash — de uitdaging (offensief, oefen-CTF rond hashes kraken) */
CS.registerRoom({
  id: 'crack-the-hash',
  path: 'offensief',
  order: 6,
  title: 'Crack the Hash — de uitdaging',
  icon: '🧩',
  difficulty: 'Moeilijk',
  minutes: 60,
  summary: 'Een CTF-achtige oefen-room die oploopt in moeilijkheid. In zes levels kraak je steeds een wachtwoordhash — van simpel MD5 tot NTLM, brute-force en gesalte hashes — en verzamel je onderweg drie vlaggen.',
  objectives: [
    'Een hash-algoritme herkennen aan lengte en context (MD5, SHA-1, SHA-256, NTLM)',
    'Een woordenlijstaanval (dictionary attack) uitvoeren tegen een hash',
    'Een kort wachtwoord met brute-force (masker-modus) terugvinden',
    'Uitleggen waarom snelle, ongesalte hashes zo kwetsbaar zijn',
    'Begrijpen hoe een salt rainbow tables onbruikbaar maakt',
  ],
  terms: [
    { term: 'Hash', def: 'Een eenrichtingsvingerafdruk van data. Je kunt hem niet "terugrekenen"; kraken betekent gokken tot de hash klopt.' },
    { term: 'MD5', def: 'Verouderd, 128-bits hash-algoritme (32 hex-tekens). Razendsnel en ongesalt: zeer makkelijk te kraken.' },
    { term: 'SHA-1', def: '160-bits hash (40 hex-tekens). Gebroken (botsingen bekend) en zonder salt snel te kraken.' },
    { term: 'SHA-256', def: 'Lid van de SHA-2-familie, 256 bits (64 hex-tekens). Sterk als hash, maar zonder salt per gok nog steeds snel.' },
    { term: 'NTLM', def: 'Windows-wachtwoordhash (MD4 van het wachtwoord in UTF-16LE). 32 hex-tekens, net als MD5, en net zo snel.' },
    { term: 'Woordenlijstaanval (dictionary attack)', def: 'Je hasht elk woord uit een lijst waarschijnlijke wachtwoorden en vergelijkt met de doel-hash.' },
    { term: 'Brute-force (masker)', def: 'Je probeert systematisch alle combinaties binnen een tekenset en lengte. Werkt alleen bij korte wachtwoorden.' },
    { term: 'Salt', def: 'Een unieke, willekeurige toevoeging per wachtwoord vóór het hashen. Maakt vooraf berekende tabellen (rainbow tables) nutteloos.' },
    { term: 'Rainbow table', def: 'Een vooraf berekende tabel van hash naar wachtwoord. Snel, maar waardeloos zodra elke hash een eigen salt heeft.' },
  ],
  resources: [
    { title: 'CrackStation — gratis hash-opzoeker en uitleg over wachtwoordhashing', url: 'https://crackstation.net/' },
    { title: 'Hashcat — de bekendste hash-kraker (modi, maskers, regels)', url: 'https://hashcat.net/' },
    { title: 'John the Ripper (Openwall) — klassieke wachtwoordkraker', url: 'https://www.openwall.com/john/' },
  ],
  tasks: [
    {
      title: 'Level 1 — MD5: de opwarmer',
      content: `
        <p>Welkom bij <strong>Crack the Hash</strong>. Dit is een oefen-CTF: zes levels, oplopend in moeilijkheid. In elk
        level krijg je een wachtwoordhash en kraak je die. Het <strong>gekraakte wachtwoord is telkens het antwoord</strong>
        op de hoofdvraag. Onderweg verdien je drie vlaggen (<code>JVT{...}</code>).</p>

        <div class="callout danger">
          <strong>Ethiek eerst:</strong> hashes kraken oefen je alleen op je eigen materiaal of in een lab als dit. Andermans
          wachtwoorden kraken zonder toestemming is strafbaar (computervredebreuk, art. 138ab Sr).
        </div>

        <p>We beginnen makkelijk. Dit is een <strong>MD5</strong>-hash: 128 bits, weergegeven als <strong>32 hex-tekens</strong>.
        MD5 is oud en razendsnel te berekenen — precies daarom is het waardeloos voor wachtwoorden: een aanvaller kan er
        miljarden per seconde proberen.</p>

        <pre><code>371620aa75830b1388b63305b0d42f06</code></pre>

        <p>Gebruik de hash-kraker hieronder. Hij staat op <strong>Woordenlijst</strong>: klik op <strong>Start kraken</strong>
        en de tool hasht elk woord uit de lijst en vergelijkt het met de doel-hash. Het bijbehorende wachtwoord is een heel
        gewoon Nederlands woord dat helaas nog steeds veel voorkomt. Lees het gekraakte wachtwoord af — dat is je antwoord.</p>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        hash: '371620aa75830b1388b63305b0d42f06',
        wordlist: ['123456', 'wachtwoord', 'welkom', 'voetbal', 'admin', 'zomer2024', 'qwerty', 'geheim', 'liefde'],
      },
      questions: [
        { q: 'Wat is het gekraakte wachtwoord?', answer: ['welkom'], hint: 'Start de woordenlijstaanval; de tool toont "Gekraakt! Wachtwoord: ...".', explain: 'De MD5-hash 371620aa... is de hash van "welkom", een klassiek zwak wachtwoord.' },
        { q: 'Hoeveel hex-tekens telt een MD5-hash?', answer: ['32'], hint: 'Tel de tekens van de hash hierboven.', explain: 'MD5 is 128 bits = 16 bytes = 32 hex-tekens.' },
        { q: 'Waarom is MD5 ongeschikt om wachtwoorden op te slaan?', options: ['Omdat het te lang is', 'Omdat het razendsnel te berekenen is en geen salt heeft', 'Omdat het geheim is', 'Omdat het alleen op Linux werkt'], answer: 1, explain: 'MD5 is snel en ongesalt, dus een aanvaller probeert enorme aantallen gokken per seconde.' },
      ],
    },

    {
      title: 'Level 2 — SHA-1: iets langer',
      content: `
        <p>Level omhoog. Deze hash is langer: <strong>40 hex-tekens</strong>. Dat is het kenmerk van <strong>SHA-1</strong>
        (160 bits). SHA-1 geldt als <em>gebroken</em> — er zijn botsingen bekend — en zonder salt is hij nog steeds snel te
        kraken met een woordenlijst.</p>

        <pre><code>fda48d6a63f351dc46d411336de4ba33f77b66f5</code></pre>

        <p>De hash-kraker hieronder staat al op <strong>algoritme SHA-1</strong> (je ziet "Doel-hash (SHA1)" bovenaan).
        Start de woordenlijstaanval. Lukt het niet meteen? Je mag <strong>eigen gokken toevoegen</strong> met het invoerveld,
        en je kunt de <strong>regels (mangling)</strong> aanzetten om varianten te maken (hoofdletter vooraan, een cijfer of
        jaartal erachter) — precies zoals Hashcat en John the Ripper dat doen.</p>

        <p>Het wachtwoord hier is een populair hobby-woord. Kraak het en noteer het als je antwoord.</p>

        <div class="callout tip">
          <strong>Tip:</strong> de lengte van een hash geeft een sterke hint over het type. 32 tekens → MD5 (of NTLM),
          40 → SHA-1, 64 → SHA-256. Lengte alleen is geen bewijs, maar het is je eerste houvast.
        </div>

        <div class="callout info">
          <strong>Vlag verdiend (levels 1-2):</strong> je hebt je eerste twee hashes met een woordenlijst gekraakt.
          Noteer de vlag <code>JVT{eerste_hashes_gekraakt}</code>.
        </div>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'sha1',
        hash: 'fda48d6a63f351dc46d411336de4ba33f77b66f5',
        wordlist: ['hockey', 'voetbal', 'tennis', 'ajax', 'feyenoord', 'sport', 'oranje', 'welkom'],
      },
      questions: [
        { q: 'Wat is het gekraakte wachtwoord?', answer: ['voetbal'], hint: 'Start de aanval met algoritme SHA-1; het is een populaire sport.', explain: 'De SHA-1-hash fda48d6a... hoort bij het wachtwoord "voetbal".' },
        { q: 'Hoeveel hex-tekens telt een SHA-1-hash?', answer: ['40'], hint: 'Tel de tekens van de hash in deze taak.', explain: 'SHA-1 is 160 bits = 20 bytes = 40 hex-tekens.' },
        { q: 'Je hebt de eerste twee hashes gekraakt. Welke vlag hoort bij deze mijlpaal? (JVT{eerste_hashes_gekraakt})', answer: ['JVT{eerste_hashes_gekraakt}'], hint: 'De vlag staat letterlijk in de vraag en hieronder bij de uitleg.', explain: 'Goed bezig: JVT{eerste_hashes_gekraakt}. Je hebt MD5 en SHA-1 met een woordenlijst gekraakt.' },
      ],
    },

    {
      title: 'Level 3 — Eerst herkennen, dan kraken (SHA-256)',
      content: `
        <p>Een echte kraker begint met één vraag: <strong>wat voor hash is dit eigenlijk?</strong> Je moet het juiste
        algoritme kiezen, anders klopt geen enkele gok. Bekijk deze hash:</p>

        <pre><code>a61a19d1f7b2c1e7f5387ab67f59d798060128c43338d9504a6fd51e3de1a0bb</code></pre>

        <p>Tel de tekens: het zijn er <strong>64</strong>. Dat wijst op <strong>SHA-256</strong> (SHA-2-familie, 256 bits).
        Dit is precies wat een tool als <em>hash-id</em> doet: aan de lengte en de vorm het waarschijnlijke type bepalen.
        SHA-256 is een sterk hash-algoritme, maar <strong>zonder salt</strong> blijft elke losse gok snel te berekenen —
        dus een woordenlijstaanval werkt nog steeds.</p>

        <p>De hash-kraker hieronder staat al op <strong>SHA-256</strong>. Start de woordenlijstaanval. Het wachtwoord is een
        dag van de week. Kraak het en noteer het als je antwoord.</p>

        <div class="callout info">
          <strong>Waarom eerst herkennen?</strong> Zou je deze 64-teken-hash als MD5 proberen te kraken, dan vergelijk je
          32-teken-MD5's met een 64-teken-doel — dat matcht nooit. Het juiste type kiezen is stap één.
        </div>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'sha256',
        hash: 'a61a19d1f7b2c1e7f5387ab67f59d798060128c43338d9504a6fd51e3de1a0bb',
        wordlist: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'weekend', 'vakantie'],
      },
      questions: [
        { q: 'Welk hash-algoritme is dit, gezien de 64 hex-tekens?', options: ['MD5', 'SHA-1', 'SHA-256', 'NTLM'], answer: 2, explain: '64 hex-tekens = 256 bits = SHA-256 (SHA-2-familie).' },
        { q: 'Wat is het gekraakte wachtwoord?', answer: ['maandag'], hint: 'Kies SHA-256 en start de aanval; het is een dag van de week.', explain: 'De SHA-256-hash a61a19d1... hoort bij het wachtwoord "maandag".' },
        { q: 'Waarom helpt het type herkennen vóór je begint?', options: ['Omdat je anders het verkeerde algoritme vergelijkt en nooit een match krijgt', 'Omdat het sneller typt', 'Omdat SHA-256 geheim is', 'Dat helpt niet'], answer: 0, explain: 'Alleen met het juiste algoritme kunnen jouw gok-hashes gelijk zijn aan de doel-hash.' },
      ],
    },

    {
      title: 'Level 4 — NTLM: context beslist',
      content: `
        <p>Nu wordt herkennen écht belangrijk. Bekijk deze hash:</p>

        <pre><code>2b2ac2d1c7c8fda6cea80b5fad7563aa</code></pre>

        <p>Het zijn <strong>32 hex-tekens</strong>. Een hash-id-tool zal nu <strong>twee</strong> opties noemen: dit kan
        <strong>MD5</strong> zijn, maar ook <strong>NTLM</strong> — beide zijn 128 bits en dus 32 hex-tekens. De lengte
        alleen kan het verschil niet maken. Wat beslist, is de <strong>context</strong>.</p>

        <p>Deze hash komt uit de <strong>SAM-database van een Windows-machine</strong>. Windows slaat lokale wachtwoorden op
        als NTLM (dat is MD4 van het wachtwoord in UTF-16LE). Zie je dus een 32-teken-hash uit een Windows-bron, dan kies je
        <strong>NTLM</strong>, niet MD5. NTLM is net zo snel en ongesalt als MD5, dus ook hier werkt een woordenlijst prima.</p>

        <p>De hash-kraker hieronder staat op <strong>algoritme NTLM</strong> (zie "Doel-hash (NTLM)" bovenaan). Start de
        woordenlijstaanval. Het wachtwoord is een alledaags apparaat. Kraak het en noteer het.</p>

        <div class="callout warn">
          <strong>Onthoud:</strong> MD5 en NTLM zijn aan de hash niet te onderscheiden. De herkomst (een <code>/etc/shadow</code>,
          een database-dump, een Windows-SAM) vertelt je welke je moet kiezen.
        </div>

        <div class="callout info">
          <strong>Vlag verdiend (levels 3-4):</strong> je herkent nu het type én gebruikt de context om de juiste keuze te maken.
          Noteer de vlag <code>JVT{types_herkend}</code>.
        </div>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'ntlm',
        hash: '2b2ac2d1c7c8fda6cea80b5fad7563aa',
        wordlist: ['laptop', 'computer', 'windows', 'server', 'netwerk', 'toetsenbord', 'printer', 'welkom'],
      },
      questions: [
        { q: 'Een 32 hex-teken-hash uit een Windows-SAM: welk type kies je?', options: ['SHA-256', 'NTLM', 'SHA-1', 'bcrypt'], answer: 1, explain: 'Windows slaat lokale wachtwoorden op als NTLM. Bij 32 hex uit Windows kies je NTLM, niet MD5.' },
        { q: 'Wat is het gekraakte wachtwoord?', answer: ['computer'], hint: 'Kies NTLM en start de aanval; het is een alledaags apparaat.', explain: 'De NTLM-hash 2b2ac2d1... hoort bij het wachtwoord "computer".' },
        { q: 'Je hebt nu ook SHA-256 en NTLM aangepakt. Welke vlag hoort bij dit level-paar? (JVT{types_herkend})', answer: ['JVT{types_herkend}'], hint: 'De vlag staat letterlijk in de vraag.', explain: 'Netjes: JVT{types_herkend}. Je herkent nu het type én gebruikt de context om de juiste keuze te maken.' },
      ],
    },

    {
      title: 'Level 5 — Brute-force: als geen woordenlijst werkt',
      content: `
        <p>Soms staat een wachtwoord in <strong>geen enkele</strong> woordenlijst, omdat het geen woord is maar een
        willekeurige korte reeks. Dan helpt alleen <strong>brute-force</strong>: systematisch alle combinaties proberen
        binnen een tekenset en lengte (de <strong>masker-modus</strong>). Dat werkt alleen bij <em>korte</em> wachtwoorden —
        en dat is precies de les.</p>

        <p>De MD5-hash van deze uitdaging is:</p>

        <pre><code>64aa5d2db669b3d98196fb2d1f1a2c6f</code></pre>

        <p>Het wachtwoord is <strong>3 tekens lang</strong> en bestaat uit <strong>kleine letters en cijfers</strong>
        (a–z en 0–9). Zo'n random combinatie vind je niet via een woordenlijst. Doe daarom dit in de hash-kraker hieronder:</p>
        <ol>
          <li>Klik bovenaan op <strong>Brute-force (masker)</strong>.</li>
          <li>Zet de tekenset op <strong>a–z</strong> én <strong>0–9</strong>.</li>
          <li>Zet de maximale lengte op <strong>3 tekens</strong>.</li>
          <li>Klik op <strong>Start kraken</strong> en lees het gevonden wachtwoord af.</li>
        </ol>

        <div class="callout tip">
          <strong>Let op:</strong> het doelwoord staat voor de volledigheid óók in de woordenlijst, zodat de tool altijd
          sluit. Maar in het echt zou zo'n willekeurige reeks dáár niet in staan — daarom oefen je hier bewust met de
          <strong>masker-modus</strong>. Merk op hoe de "zoekruimte" explodeert zodra je de lengte verhoogt: dat laat zien
          waarom lengte je beste bescherming is.
        </div>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        hash: '64aa5d2db669b3d98196fb2d1f1a2c6f',
        wordlist: ['welkom', 'qwerty', 'admin', 'q4z', 'geheim', 'letmein'],
      },
      questions: [
        { q: 'Wat is het gekraakte wachtwoord (3 tekens, a-z en 0-9)?', answer: ['q4z'], hint: 'Zet de masker-modus aan: tekenset a-z + 0-9, lengte 3, en start.', explain: 'Brute-force over a-z0-9 met lengte 3 vindt "q4z" (MD5 64aa5d2d...).' },
        { q: 'Wanneer is brute-force (masker) de aangewezen methode?', options: ['Als het wachtwoord kort is en niet in een woordenlijst staat', 'Altijd, het is het snelst', 'Alleen bij SHA-256', 'Nooit'], answer: 0, explain: 'Brute-force werkt alleen praktisch bij korte wachtwoorden; bij lange explodeert de zoekruimte.' },
        { q: 'Wat maakt een wachtwoord het best bestand tegen brute-force?', options: ['Een hoofdletter vooraan', 'Lengte (meer tekens)', 'Het op MD5 opslaan', 'Een korte reeks cijfers'], answer: 1, explain: 'Elke extra tekenpositie vermenigvuldigt de zoekruimte; lengte is veruit de sterkste factor.' },
      ],
    },

    {
      title: 'Level 6 — Salt: het einde van de rainbow table',
      content: `
        <p>Finale. Tot nu toe waren alle hashes <strong>ongesalt</strong>: hetzelfde wachtwoord geeft altijd dezelfde hash.
        Daardoor werken <strong>rainbow tables</strong> — enorme vooraf berekende tabellen van hash naar wachtwoord. Je zoekt
        de hash gewoon op. Een <strong>salt</strong> maakt daar een einde aan.</p>

        <p>Een salt is een unieke, willekeurige toevoeging per wachtwoord, die vóór het hashen wordt gezet. Hier is de salt
        <code>Xy7</code> en wordt <strong>vooraan</strong> geplakt, dus de server bewaart <code>md5(salt + wachtwoord)</code>:</p>

        <pre><code>md5("Xy7" + wachtwoord) = 329f3abf574738de33a01f7c630b1fb7</code></pre>

        <p>Omdat de salt mee-gehasht is, komt deze hash in geen enkele rainbow table voor: die tabellen zijn gemaakt voor
        <em>kale</em> wachtwoorden. De hash-kraker hieronder weet de salt al (je ziet "salt=Xy7" bovenaan) en zet hem vóór elk
        woord. Start de woordenlijstaanval. Het wachtwoord is hetzelfde zwakke woord uit level 1 — de salt verbergt dat je
        dat aan de hash niet meer ziet. Kraak het en noteer het.</p>

        <div class="callout info">
          <strong>Belangrijk:</strong> een salt stopt rainbow tables en zorgt dat twee mensen met hetzelfde wachtwoord
          tóch verschillende hashes krijgen. Maar een salt maakt het hashen niet trager. Echte bescherming komt van een
          <strong>traag, gesalt</strong> algoritme zoals bcrypt, scrypt of Argon2.
        </div>

        <div class="callout tip">
          <strong>Slotvlag verdiend (levels 5-6):</strong> van MD5 tot NTLM, brute-force en gesalte hashes — je hebt ze
          alle zes gekraakt. Noteer de slotvlag <code>JVT{hash_meester}</code>.
        </div>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        salt: 'Xy7',
        saltPos: 'prefix',
        hash: '329f3abf574738de33a01f7c630b1fb7',
        wordlist: ['welkom', 'admin', 'dojo', 'zomer2024', 'voetbal', 'geheim', 'liefde'],
      },
      questions: [
        { q: 'Wat is het gekraakte wachtwoord?', answer: ['welkom'], hint: 'De tool zet de salt Xy7 al vooraan; start de woordenlijstaanval. Het is hetzelfde woord als in level 1.', explain: 'md5("Xy7" + "welkom") = 329f3abf... — het wachtwoord is "welkom".' },
        { q: 'Waarom breekt een salt rainbow tables?', options: ['Omdat de hash dan langer wordt', 'Omdat de tabellen voor kale wachtwoorden zijn gemaakt en de salt per wachtwoord uniek is', 'Omdat MD5 dan trager wordt', 'Dat doet het niet'], answer: 1, explain: 'Rainbow tables bevatten hashes van wachtwoorden zonder salt; met een unieke salt komt geen enkele hash in zo\'n tabel voor.' },
        { q: 'Je hebt alle zes de hashes gekraakt. Welke slotvlag verdien je? (JVT{hash_meester})', answer: ['JVT{hash_meester}'], hint: 'De vlag staat letterlijk in de vraag.', explain: 'Gefeliciteerd: JVT{hash_meester}. Van MD5 tot NTLM, brute-force en gesalte hashes — je hebt ze alle zes gekraakt.' },
      ],
    },
  ],
});
