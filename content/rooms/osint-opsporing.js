/* Room: OSINT — opsporen met open bronnen */
CS.registerRoom({
  id: 'osint-opsporing',
  path: 'forensie',
  order: 8,
  title: 'OSINT: opsporen met open bronnen',
  icon: '🔦',
  difficulty: 'Gemiddeld',
  minutes: 65,
  summary: 'Word digitaal rechercheur met openbare bronnen: Google dorking, EXIF-metadata, geolocatie, reverse image search en bronkritiek — netjes binnen de regels.',
  objectives: [
    'Uitleggen wat OSINT is en waar de juridische en ethische grenzen liggen (AVG, onderzoeksaccounts)',
    'De vijf stappen van de OSINT-cyclus benoemen en toepassen',
    'Met Google dorking (site:, filetype:, intitle:, exacte zinnen, uitsluiten) gericht zoeken',
    'EXIF-metadata uit een foto halen en een locatie herleiden met hexviewer en exiftool',
    'Een foto geolokaliseren met herkenningspunten, reverse image search en kaartmateriaal',
    'Bronnen kritisch verifiëren via meerdere onafhankelijke aanwijzingen en deepfakes herkennen',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is OSINT (en waar ligt de grens)?',
      content: `
        <p><strong>OSINT</strong> staat voor <em>Open Source Intelligence</em>: onderzoek dat je doet met bronnen die <strong>openbaar en legaal toegankelijk</strong> zijn. Denk aan sociale media, bedrijvenregisters, nieuwsberichten, kaarten, foto's, publieke databases en zelfs de metadata in een bestand. Je hoeft nergens voor in te breken — alle puzzelstukjes liggen al op straat, je moet ze alleen vinden en aan elkaar knopen.</p>

        <p>Een handige analogie: OSINT is als rechercheren met een vergrootglas in een openbare bibliotheek. Alle boeken staan er voor iedereen, maar een goede rechercheur weet wélk boek hij moet pakken en hoe hij losse zinnen tot één verhaal maakt. Inbreken is iets heel anders: dan forceer je een slot om bij informatie te komen die niet van jou is.</p>

        <h3>OSINT is openbaar — maar niet grenzeloos</h3>
        <p>Omdat je alleen openbare bronnen gebruikt, is OSINT in de basis legaal. Toch zijn er stevige grenzen, zeker als je bij de <strong>Politie</strong> of een <strong>Team Cybercrime</strong> werkt:</p>
        <ul>
          <li><strong>Privacy en de AVG.</strong> Persoonsgegevens verzamelen en bewaren mag niet zomaar. Er moet een doel en een grondslag zijn, en je mag niet meer verzamelen dan nodig (dataminimalisatie). De Autoriteit Persoonsgegevens houdt hier toezicht op.</li>
          <li><strong>Geen inbreken, geen misleiding op bestelling.</strong> Een wachtwoord raden, een "besloten" groep binnendringen of inloggen op andermans account is géén OSINT meer, maar computervredebreuk (art. 138ab Sr).</li>
          <li><strong>Onderzoeksaccounts (sockpuppets) zijn gereguleerd.</strong> Undercover gaan of met een nep-account iemand benaderen (uitlokken, infiltreren) mag in Nederland alleen onder strikte voorwaarden en bevoegdheden. Een gewone leerling of burger doet dat dus níét op eigen houtje.</li>
        </ul>

        <div class="callout warn"><strong>Let op:</strong> dat iets technisch kán (je ziet iemands vakantiefoto's), betekent niet dat je het mag opslaan of delen. Vraag jezelf steeds af: is deze bron echt openbaar, heb ik een legitiem doel, en blijf ik proportioneel?</div>

        <p>In deze room leer je de technieken van een digitaal rechercheur op <strong>fictieve</strong> zaken. Alle personen, accounts en domeinen hier zijn verzonnen. De vaardigheid die telt is niet "zoveel mogelijk vinden", maar "het juiste vinden en kunnen bewijzen dat het klopt".</p>
      `,
      questions: [
        { q: 'Waar staat de afkorting OSINT voor?', answer: ['open source intelligence', 'open-source intelligence'], hint: 'Drie Engelse woorden; het gaat om openbare bronnen.', explain: 'OSINT = Open Source Intelligence: inlichtingen uit openbaar toegankelijke bronnen.' },
        { q: 'Wat is het belangrijkste verschil tussen OSINT en inbreken?', options: ['OSINT is sneller', 'OSINT gebruikt alleen openbaar toegankelijke bronnen, inbreken forceert toegang tot afgeschermde informatie', 'OSINT mag alleen de politie doen', 'Er is geen verschil'], answer: 1, explain: 'OSINT blijft bij wat openbaar is. Zodra je een slot forceert of inlogt waar je niet mag, is het computervredebreuk.' },
        { q: 'Ik begrijp dat OSINT openbaar is, maar dat de AVG en de regels rond onderzoeksaccounts wél grenzen stellen.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — De OSINT-cyclus',
      content: `
        <p>Een rechercheur werkt niet lukraak. Goed OSINT-onderzoek volgt een vaste lus, de <strong>OSINT-cyclus</strong>. Die zorgt dat je gericht blijft en je bevindingen later kloppen en navolgbaar zijn.</p>

        <figure class="diagram">
          <svg viewBox="0 0 560 130" role="img" aria-label="De vijf stappen van de OSINT-cyclus">
            <rect x="6" y="48" width="92" height="40" rx="6" stroke="var(--accent)" fill="none" />
            <text x="52" y="72" fill="currentColor" font-size="13" text-anchor="middle">Richten</text>
            <rect x="120" y="48" width="100" height="40" rx="6" stroke="currentColor" fill="none" />
            <text x="170" y="72" fill="currentColor" font-size="13" text-anchor="middle">Verzamelen</text>
            <rect x="242" y="48" width="100" height="40" rx="6" stroke="currentColor" fill="none" />
            <text x="292" y="72" fill="currentColor" font-size="13" text-anchor="middle">Verwerken</text>
            <rect x="364" y="48" width="100" height="40" rx="6" stroke="currentColor" fill="none" />
            <text x="414" y="72" fill="currentColor" font-size="13" text-anchor="middle">Analyseren</text>
            <rect x="486" y="48" width="100" height="40" rx="6" stroke="var(--good)" fill="none" />
            <text x="536" y="72" fill="currentColor" font-size="13" text-anchor="middle">Rapporteren</text>
            <line x1="98" y1="68" x2="120" y2="68" stroke="currentColor" />
            <line x1="220" y1="68" x2="242" y2="68" stroke="currentColor" />
            <line x1="342" y1="68" x2="364" y2="68" stroke="currentColor" />
            <line x1="464" y1="68" x2="486" y2="68" stroke="currentColor" />
          </svg>
          <figcaption>Na rapporteren roept het antwoord vaak nieuwe vragen op, en begin je bovenaan opnieuw — vandaar "cyclus".</figcaption>
        </figure>

        <h3>De vijf stappen</h3>
        <ol>
          <li><strong>Richten.</strong> Wat wil je precies weten? Formuleer een scherpe onderzoeksvraag. "Alles over Jan" is geen vraag; "Op welke locatie is deze foto gemaakt, en wanneer?" wel. Dit bepaalt ook meteen je grens: verzamel niet meer dan voor die vraag nodig is (AVG, dataminimalisatie).</li>
          <li><strong>Verzamelen.</strong> Zoek de ruwe bronnen bij elkaar: posts, foto's, documenten, kaarten. Bewaar steeds <em>waar</em> je iets vond (de link) en <em>wanneer</em>, zodat je het later kunt terugvinden en aantonen.</li>
          <li><strong>Verwerken.</strong> Maak de ruwe data bruikbaar: vertaal, zet tijdstippen om naar dezelfde tijdzone, haal metadata eruit, sorteer op datum.</li>
          <li><strong>Analyseren.</strong> Leg verbanden. Klopt het verhaal? Wijzen meerdere bronnen dezelfde kant op? Hier ontstaat de conclusie.</li>
          <li><strong>Rapporteren.</strong> Schrijf helder op wat je vond, hoe je eraan kwam en hoe zeker je bent. Een conclusie zonder bronvermelding is in een onderzoek waardeloos.</li>
        </ol>

        <div class="callout tip"><strong>Tip:</strong> leg álles vast terwijl je werkt — schermafbeeldingen, links, tijdstippen. Online verdwijnt informatie snel (een post wordt verwijderd). Je bevinding is pas bruikbaar als iemand anders je stappen kan nalopen.</div>
      `,
      questions: [
        { q: 'Met welke stap begint de OSINT-cyclus?', answer: ['richten'], hint: 'Eerst bepaal je je onderzoeksvraag.', explain: 'Richten: je formuleert eerst een scherpe onderzoeksvraag, dat stuurt al het andere.' },
        { q: 'Waarom leg je tijdens het verzamelen meteen je bronnen (links, tijdstippen) vast?', options: ['Dat is verplicht van Google', 'Omdat informatie online kan verdwijnen en je bevinding navolgbaar en aantoonbaar moet blijven', 'Om sneller te typen', 'Dat hoeft niet'], answer: 1, explain: 'Zonder vastgelegde bron is je conclusie niet te controleren, en online materiaal verdwijnt vaak.' },
        { q: 'Welke stap gaat over het leggen van verbanden en het trekken van een conclusie?', answer: ['analyseren', 'analyse'], hint: 'Komt ná verwerken en vóór rapporteren.', explain: 'Analyseren: je combineert de verwerkte data tot een onderbouwde conclusie.' },
      ],
    },

    {
      title: 'Taak 3 — Google dorking: gericht zoeken',
      content: `
        <p>Iedereen kan googelen, maar een rechercheur zoekt <strong>chirurgisch</strong>. Met speciale zoekoperatoren (in de volksmond <strong>Google dorking</strong> of "Google hacking") dwing je de zoekmachine precies te geven wat je wilt. Je breekt nergens in; je stelt alleen een slimmere vraag.</p>

        <h3>De belangrijkste operatoren</h3>
        <table>
          <thead><tr><th>Operator</th><th>Wat het doet</th><th>Voorbeeld</th></tr></thead>
          <tbody>
            <tr><td><code>site:</code></td><td>Zoek alleen binnen één domein</td><td><code>site:voorbeeld.lab</code></td></tr>
            <tr><td><code>filetype:</code></td><td>Zoek een bepaald bestandstype</td><td><code>filetype:pdf begroting</code></td></tr>
            <tr><td><code>intitle:</code></td><td>Woord moet in de paginatitel staan</td><td><code>intitle:index of</code></td></tr>
            <tr><td><code>"..."</code></td><td>Zoek een exacte zin of term</td><td><code>"Jan de Vries" verhuisd</code></td></tr>
            <tr><td><code>-</code></td><td>Sluit een woord uit</td><td><code>koffie -recept</code></td></tr>
          </tbody>
        </table>

        <p>Het mooie is dat je ze <strong>combineert</strong>. Stel: je zoekt een gelekt begrotingsdocument op het (fictieve) domein <code>gemeente-voorbeeld.lab</code>. Dan tik je:</p>
        <pre><code>site:gemeente-voorbeeld.lab filetype:pdf "begroting 2026" -concept</code></pre>
        <p>Dit zegt: zoek alleen op dat domein, alleen PDF's, met exact de zin "begroting 2026", maar laat voorlopige concepten weg. In één regel heb je het internet gereduceerd van miljarden pagina's tot een handjevol relevante.</p>

        <div class="callout info"><strong>Waarom dit werkt voor onderzoek:</strong> organisaties zetten per ongeluk documenten online die niet afgeschermd zijn. Met <code>filetype:</code> en <code>intitle:index of</code> vind je die open mappen. Dat is nog steeds OSINT: de bestanden stáán openbaar op het web. Download alleen wat je voor je onderzoeksvraag nodig hebt, en blijf binnen de AVG.</div>

        <p>Zoekmachines verschillen trouwens. <strong>Google</strong> is sterk, maar <strong>Bing</strong> en de privacyvriendelijke <strong>DuckDuckGo</strong> geven soms andere resultaten. Een goede rechercheur probeert er meerdere — dezelfde dork, andere motor.</p>
      `,
      questions: [
        { q: 'Welke operator beperkt je zoekopdracht tot één enkel domein?', answer: ['site:', 'site'], hint: 'Je typt hem met een dubbele punt, gevolgd door het domein.', explain: 'Met site:voorbeeld.lab krijg je alleen resultaten van dat domein.' },
        { q: 'Je wilt alleen PDF-bestanden vinden over "jaarverslag" op één domein, zonder de concepten. Welke dork past het best?', options: ['jaarverslag pdf', 'site:voorbeeld.lab filetype:pdf "jaarverslag" -concept', 'intitle:jaarverslag', 'jaarverslag -site:voorbeeld.lab'], answer: 1, explain: 'site: beperkt het domein, filetype:pdf het type, de aanhalingstekens maken het exact, en -concept sluit concepten uit.' },
        { q: 'Wat doet een minteken (-) vóór een woord in een zoekopdracht?', answer: ['uitsluiten', 'sluit uit', 'sluit het woord uit', 'uitsluiting'], hint: 'Het haalt resultaten met dat woord juist weg.', explain: 'Een - vóór een woord sluit pagina\'s met dat woord uit de resultaten.' },
      ],
    },

    {
      title: 'Taak 4 — Metadata in foto\'s: EXIF lezen',
      content: `
        <p>Een foto is veel meer dan een plaatje. In het bestand zit vaak een pakket <strong>metadata</strong> verstopt: gegevens óver de foto. Bij JPEG-foto's heet dat <strong>EXIF</strong> (Exchangeable Image File Format). Daar kan in staan:</p>
        <ul>
          <li><strong>GPS-coördinaten</strong> — de exacte plek waar de foto genomen is;</li>
          <li><strong>tijdstip</strong> — datum en tijd van de opname;</li>
          <li><strong>cameramodel</strong> en instellingen — welk toestel, welke lens, welke software.</li>
        </ul>
        <p>Voor een rechercheur is dat goud. Eén vakantiefoto kan zo de woonplaats, het vakantieadres of het tijdstip van een gebeurtenis verraden.</p>

        <div class="callout warn"><strong>Belangrijk:</strong> veel sociale media <em>strippen</em> de EXIF-data als je een foto uploadt (om privacyredenen). Een foto van een platform heeft dus vaak geen GPS meer. Een foto die rechtstreeks per e-mail of chat is doorgestuurd, of van een open server komt, heeft de metadata juist vaak nog wél.</div>

        <h3>Herken het bestand aan de eerste bytes</h3>
        <p>Elk bestandstype begint met een vaste reeks bytes, de <strong>magic bytes</strong> (bestandssignatuur). Je herkent een bestand dus ook zonder naar de extensie te kijken. Een paar bekende:</p>
        <table>
          <thead><tr><th>Bestandstype</th><th>Eerste bytes (hex)</th></tr></thead>
          <tbody>
            <tr><td>JPEG (gewoon)</td><td><code>FF D8 FF E0</code></td></tr>
            <tr><td>JPEG met EXIF</td><td><code>FF D8 FF E1</code></td></tr>
            <tr><td>PNG</td><td><code>89 50 4E 47</code></td></tr>
            <tr><td>PDF</td><td><code>25 50 44 46</code> ("%PDF")</td></tr>
          </tbody>
        </table>

        <h3>Open de hexviewer</h3>
        <p>Hieronder zie je de rauwe bytes van een bestand <code>vondst.jpg</code> uit een fictieve zaak. Links staan de bytes in hex, rechts de leesbare ASCII-tekens. Je opdracht:</p>
        <ol>
          <li>Kijk naar de <strong>eerste vier bytes</strong>. Welk type bestand is dit, en zie je dat er EXIF in zit?</li>
          <li>Lees de <strong>ASCII-kolom</strong> (rechts). Ergens staat leesbare EXIF-achtige tekst met een cameramodel, een tijdstip, GPS-coördinaten en een plaatsnaam. Waar is de foto gemaakt?</li>
          <li>Helemaal onderaan die tekst staat in een <code>UserComment</code> een <strong>vlag</strong>. Noteer hem.</li>
        </ol>
      `,
      lab: {
        type: 'hexviewer',
        filename: 'vondst.jpg',
        hex: `FF D8 FF E1 01 2C 45 78 69 66 00 00 4D 4D 00 2A
00 00 00 08 20 20 4D 61 6B 65 3D 4B 69 65 6B 4C
65 6E 73 20 20 4D 6F 64 65 6C 3D 50 69 78 61 43
61 6D 20 58 32 30 20 20 53 6F 66 74 77 61 72 65
3D 4B 69 65 6B 46 6F 74 6F 20 33 2E 32 0A 44 61
74 65 54 69 6D 65 4F 72 69 67 69 6E 61 6C 3D 32
30 32 36 3A 30 37 3A 31 34 20 31 35 3A 34 32 3A
31 30 0A 47 50 53 4C 61 74 69 74 75 64 65 3D 35
32 2E 30 38 39 34 20 4E 20 20 47 50 53 4C 6F 6E
67 69 74 75 64 65 3D 35 2E 31 31 30 30 20 45 0A
47 50 53 41 72 65 61 49 6E 66 6F 72 6D 61 74 69
6F 6E 3D 44 6F 6D 70 6C 65 69 6E 2C 20 55 74 72
65 63 68 74 2C 20 4E 4C 0A 55 73 65 72 43 6F 6D
6D 65 6E 74 3D 4A 56 54 7B 65 78 69 66 5F 76 65
72 72 61 61 64 74 5F 6C 6F 63 61 74 69 65 7D 0A
FF D9`,
      },
      questions: [
        { q: 'Welke eerste vier bytes (hex) staan er, en welk bestandstype hoort daarbij?', options: ['89 50 4E 47 — een PNG', 'FF D8 FF E1 — een JPEG met EXIF', '25 50 44 46 — een PDF', 'FF D8 FF E0 — een JPEG zonder EXIF'], answer: 1, explain: 'FF D8 FF E1 is de signatuur van een JPEG met een EXIF-segment (APP1). Dus: hier zit metadata in.' },
        { q: 'In welke plaats is de foto volgens de EXIF-tekst gemaakt?', answer: ['utrecht'], hint: 'Lees de ASCII-kolom rechts bij GPSAreaInformation.', explain: 'De EXIF-tekst noemt Domplein, Utrecht, NL als locatie — bevestigd door de GPS-coördinaten (52.0894 N, 5.1100 E).' },
        { q: 'Welke vlag staat in de UserComment van het bestand?', answer: ['JVT{exif_verraadt_locatie}'], encoded: true, hint: 'Lees de leesbare ASCII onderaan; de vlag staat na UserComment=.', explain: 'In de ASCII-kolom staat UserComment=JVT{exif_verraadt_locatie}. De bytes verbergen dus gewoon leesbare tekst.' },
      ],
    },

    {
      title: 'Taak 5 — exiftool: metadata uit de terminal',
      content: `
        <p>Met de hand bytes lezen is leerzaam, maar in de praktijk gebruik je een gereedschap dat alle metadata netjes uitleest. Het bekendste is <strong>exiftool</strong>. Je geeft het een bestand, en het spuugt alle velden overzichtelijk uit.</p>

        <p>In de terminal hieronder staat de foto <code>foto.jpg</code> klaar. Voer exact dit commando uit:</p>
        <pre><code>exiftool foto.jpg</code></pre>

        <p>Bekijk de uitvoer goed. Let vooral op deze velden:</p>
        <ul>
          <li><strong>Camera Model Name</strong> — met welk toestel is de foto gemaakt?</li>
          <li><strong>Create Date</strong> — wanneer is de foto genomen?</li>
          <li><strong>GPS Position</strong> — de coördinaten; die kun je zo in een kaart plakken.</li>
          <li><strong>User Comment</strong> — hier liet de maker (per ongeluk) iets achter.</li>
        </ul>

        <div class="callout tip"><strong>Tip:</strong> de GPS Position-regel geeft breedte- en lengtegraad. Plak die in een kaartdienst en je staat virtueel op de plek. In de volgende taak leer je wat je doet als er géén GPS in de foto zit.</div>

        <p>Zo werkt het in het echt bij een digitaal onderzoek: je draait een foto door exiftool, noteert camera, tijdstip en coördinaten, en legt dat vast in je rapport met vermelding van het bronbestand.</p>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'rechercheur', host: 'jvt-lab',
        home: '/home/rechercheur', cwd: '/home/rechercheur',
        motd: 'OSINT-werkplek. Lees de metadata uit met: exiftool foto.jpg',
        fs: {
          '/home/rechercheur/foto.jpg': '(binaire JPEG-data — gebruik exiftool om de metadata te lezen)\n',
          '/home/rechercheur/opdracht.txt': 'Lees de metadata van foto.jpg uit met exiftool en noteer camera, tijdstip, GPS en de vlag.\n',
        },
        commands: {
          'exiftool foto.jpg': `ExifTool Version Number         : 12.76
File Name                       : foto.jpg
File Size                       : 1824 kB
File Type                       : JPEG
MIME Type                       : image/jpeg
Make                            : KiekLens
Camera Model Name               : PixaCam X20
Software                        : KiekFoto 3.2
Create Date                     : 2026:07:14 15:42:10
Modify Date                     : 2026:07:14 15:42:10
GPS Latitude                    : 52 deg 5' 21.84" N
GPS Longitude                   : 5 deg 6' 36.00" E
GPS Position                    : 52.0894 N, 5.1100 E
User Comment                    : JVT{metadata_is_bewijs}
Image Size                      : 4032x3024`,
          'exiftool -gps:all foto.jpg': `GPS Latitude                    : 52 deg 5' 21.84" N
GPS Longitude                   : 5 deg 6' 36.00" E
GPS Position                    : 52.0894 N, 5.1100 E`,
        },
      },
      questions: [
        { q: 'Draai exiftool foto.jpg. Welk cameramodel (Camera Model Name) staat erin?', answer: ['PixaCam X20', 'pixacam x20'], hint: 'Kijk in de regel Camera Model Name.', explain: 'Het veld Camera Model Name toont PixaCam X20 — handig om foto\'s van hetzelfde toestel te koppelen.' },
        { q: 'Welke vlag staat in het veld User Comment?', answer: ['JVT{metadata_is_bewijs}'], hint: 'Onderaan de uitvoer van exiftool, bij User Comment.', explain: 'exiftool toont User Comment : JVT{metadata_is_bewijs}. De maker liet dat per ongeluk in de metadata staan.' },
        { q: 'Waarom heeft een foto die rechtstreeks van een sociaal-mediaprofiel komt vaak géén GPS-data meer?', options: ['GPS werkt niet binnen', 'Veel platforms strippen de EXIF-metadata bij het uploaden om privacyredenen', 'exiftool kan het niet lezen', 'De camera slaat het nooit op'], answer: 1, explain: 'De meeste grote platforms verwijderen EXIF bij upload. Rechtstreeks doorgestuurde of originele bestanden hebben de metadata vaak nog wel.' },
      ],
    },

    {
      title: 'Taak 6 — Geolocatie en reverse image search',
      content: `
        <p>Lang niet elke foto heeft GPS in de metadata. Toch kun je vaak nog steeds bepalen wáár iets is vastgelegd. Dat heet <strong>geolocatie</strong>: puzzelen met wat je op het beeld ziet. Onderzoekscollectief <strong>Bellingcat</strong> is hier wereldberoemd mee geworden — zij verifiëren beeldmateriaal van conflicten en incidenten puur met open bronnen.</p>

        <h3>Aanwijzingen op de foto zelf</h3>
        <ul>
          <li><strong>Herkenningspunten.</strong> Een kerktoren, een opvallend gebouw, een brug — vergelijk met bekende plekken.</li>
          <li><strong>Tekst en borden.</strong> Straatnaamborden, kentekens, reclame of een taal verraden het land of zelfs de straat.</li>
          <li><strong>Natuur en omgeving.</strong> Type bomen, bergen aan de horizon, het soort stopcontact aan de muur.</li>
          <li><strong>Schaduwen.</strong> De richting en lengte van schaduwen verraden het tijdstip en de windrichting (schaduwanalyse). Zo controleer je of een geclaimd tijdstip kán kloppen.</li>
        </ul>

        <h3>Gereedschap om het te bevestigen</h3>
        <ul>
          <li><strong>OpenStreetMap</strong> — open kaartmateriaal waarin je gebouwen, straten en namen kunt opzoeken en vergelijken.</li>
          <li><strong>Google Street View en Google Earth</strong> — "sta" virtueel op straat, en bekijk met de tijdlijn ook <em>historische</em> beelden. Zo zie je of een gebouw er op het moment van de foto al stond.</li>
        </ul>

        <h3>Reverse image search</h3>
        <p>Weet je niet waar een foto vandaan komt? Doe een <strong>reverse image search</strong> (zoeken-op-afbeelding): je geeft de foto als invoer en de zoekmachine zoekt waar diezelfde (of een lijkende) afbeelding eerder is verschenen. Handige diensten:</p>
        <ul>
          <li><strong>Google Afbeeldingen</strong> — breed en groot.</li>
          <li><strong>Yandex</strong> — vaak verrassend sterk in gezichten en gebouwen.</li>
          <li><strong>TinEye</strong> — goed om de <em>oudste</em> verschijning van een afbeelding te vinden (handig tegen hergebruikte of nep-foto's).</li>
        </ul>

        <div class="callout tip"><strong>Combineer altijd:</strong> vind je met reverse search een kandidaat-locatie, bevestig die dan met Street View of OpenStreetMap. Eén tref is een hypothese; pas met een tweede, onafhankelijke aanwijzing wordt het een conclusie.</div>
      `,
      questions: [
        { q: 'Hoe heet de techniek waarbij je de locatie van een foto bepaalt uit wat je op het beeld ziet (zonder GPS-data)?', answer: ['geolocatie', 'geolocalisatie'], hint: 'Het woord bevat "geo" (aarde/plaats).', explain: 'Geolocatie: je herleidt de plek uit herkenningspunten, borden, schaduwen en kaartmateriaal.' },
        { q: 'Welke dienst wordt vaak gebruikt om de óudste verschijning van een afbeelding op internet te vinden?', options: ['OpenStreetMap', 'TinEye', 'Street View', 'exiftool'], answer: 1, explain: 'TinEye is sterk in het vinden van de eerste/oudste verschijning, handig om hergebruikte of nep-foto\'s te ontmaskeren.' },
        { q: 'Wat kun je afleiden uit de richting en lengte van schaduwen op een foto?', options: ['De naam van de fotograaf', 'Een indicatie van het tijdstip en de windrichting, om een geclaimd tijdstip te toetsen', 'Het cameramodel', 'De bestandsgrootte'], answer: 1, explain: 'Schaduwanalyse geeft het tijdstip/de oriëntatie; Bellingcat gebruikt dit om te controleren of een geclaimd moment klopt.' },
      ],
    },

    {
      title: 'Taak 7 — Gebruikersnamen, sockpuppets en bronkritiek',
      content: `
        <p>Mensen zijn gewoontedieren. Ze hergebruiken dezelfde <strong>gebruikersnaam</strong> op tien verschillende platforms, en koppelen hun accounts aan hetzelfde <strong>e-mailadres</strong>. Voor een rechercheur is dat een rode draad: vind je op één forum de naam <code>nachtuil_xyz</code> (fictief), dan kun je zoeken of diezelfde naam elders opduikt. Zo ontstaat langzaam een profiel — uit louter openbare stukjes.</p>

        <h3>Je eigen sporen afschermen: OPSEC</h3>
        <p>Terwijl jij anderen onderzoekt, laat jij óók sporen na. Een profiel bekijken kan een melding geven; je IP-adres is zichtbaar voor een server. <strong>OPSEC</strong> (Operational Security) is het afschermen van je eigen onderzoek:</p>
        <ul>
          <li>gebruik een aparte onderzoeksomgeving, niet je persoonlijke account;</li>
          <li>klik niet zomaar op links die terug naar jou kunnen wijzen;</li>
          <li>leg vast wat je doet, maar bewaar dat veilig.</li>
        </ul>
        <p>Een <strong>sockpuppet</strong> is een apart onderzoeksaccount (een "pop") dat losstaat van je echte identiteit. <strong>Let op:</strong> een nep-account gebruiken om mensen te benaderen, uit te lokken of een besloten groep binnen te dringen, is in Nederland aan strikte regels en bevoegdheden gebonden. Voor jou als leerling geldt: observeren wat openbaar is, ja; actief misleiden of infiltreren, nee.</p>

        <h3>Verificatie en bronkritiek</h3>
        <p>De belangrijkste vaardigheid komt als laatste: <strong>kritisch kijken naar je bronnen</strong>. Regels van de digitaal rechercheur:</p>
        <ul>
          <li><strong>Vertrouw nooit één bron.</strong> Verificatie betekent: iets bevestigen via meerdere <em>onafhankelijke</em> aanwijzingen. Eén foto bewijst niets; een foto plus een los straatnaambord plus een onafhankelijk nieuwsbericht samen wél.</li>
          <li><strong>Pas op voor deepfakes en AI-beelden.</strong> Nepvideo's en door AI gegenereerde foto's worden steeds overtuigender. Let op rare handen, onlogische schaduwen, en controleer altijd of het beeld elders onafhankelijk opduikt.</li>
          <li><strong>Scheid feit van interpretatie.</strong> "De foto toont een rode auto" is een feit; "dus hij was daar" is een conclusie die je apart moet onderbouwen.</li>
        </ul>

        <div class="callout info"><strong>Bellingcat als voorbeeld:</strong> hun werkwijze draait volledig om verificatie — een claim telt pas als meerdere, van elkaar losstaande open bronnen in dezelfde richting wijzen. Dat is precies de houding die jou tot een betrouwbare digitaal rechercheur maakt.</div>
      `,
      questions: [
        { q: 'Waarom is een hergebruikte gebruikersnaam waardevol voor een OSINT-onderzoek?', options: ['Hij is altijd het wachtwoord', 'Dezelfde naam op meerdere platforms laat je accounts van één persoon aan elkaar koppelen', 'Hij verraadt het IP-adres', 'Dat is hij niet'], answer: 1, explain: 'Mensen hergebruiken namen en e-mailadressen; daarmee leg je verbanden tussen losse accounts.' },
        { q: 'Wat betekent verificatie in OSINT?', options: ['Eén betrouwbare bron vinden en die geloven', 'Iets bevestigen via meerdere onafhankelijke aanwijzingen', 'Een account verifiëren met een blauw vinkje', 'De bron verwijderen'], answer: 1, explain: 'Verificatie = bevestigen via meerdere onafhankelijke bronnen; nooit op één bron leunen.' },
        { q: 'Wat is OPSEC in de context van een onderzoeker?', answer: ['operational security', 'operationele veiligheid'], hint: 'Het gaat om het afschermen van je éígen sporen tijdens het onderzoek.', explain: 'OPSEC (Operational Security): maatregelen om je eigen identiteit en onderzoek af te schermen.' },
        { q: 'Ik begrijp dat ik wel openbaar materiaal mag observeren, maar niet op eigen houtje met nep-accounts mensen mag misleiden of infiltreren.', noAnswer: true },
      ],
    },
  ],

  terms: [
    { term: 'OSINT', def: 'Open Source Intelligence: onderzoek met openbaar en legaal toegankelijke bronnen (sociale media, registers, foto\'s, metadata).' },
    { term: 'OSINT-cyclus', def: 'De vaste lus van onderzoek: richten, verzamelen, verwerken, analyseren en rapporteren.' },
    { term: 'Google dorking', def: 'Gericht zoeken met operatoren zoals site:, filetype:, intitle:, exacte zinnen ("...") en uitsluiten (-).' },
    { term: 'Reverse image search', def: 'Zoeken-op-afbeelding: je geeft een foto als invoer om te vinden waar die eerder verscheen (Google, Yandex, TinEye).' },
    { term: 'EXIF', def: 'Metadataformaat in JPEG-foto\'s met o.a. GPS-coördinaten, tijdstip en cameramodel.' },
    { term: 'Metadata', def: 'Gegevens óver een bestand (wie, wanneer, waar, waarmee), los van de zichtbare inhoud.' },
    { term: 'Magic bytes', def: 'Vaste beginbytes die een bestandstype verraden, bijv. FF D8 FF E1 voor een JPEG met EXIF.' },
    { term: 'Geolocatie', def: 'De plek van een foto herleiden uit herkenningspunten, borden, schaduwen en kaartmateriaal.' },
    { term: 'Schaduwanalyse', def: 'Uit de richting en lengte van schaduwen het tijdstip en de oriëntatie van een foto afleiden.' },
    { term: 'Sockpuppet', def: 'Een apart onderzoeksaccount, losgekoppeld van je echte identiteit; actief misleiden ermee is in NL gereguleerd.' },
    { term: 'OPSEC', def: 'Operational Security: maatregelen om je eigen sporen en identiteit tijdens een onderzoek af te schermen.' },
    { term: 'Verificatie', def: 'Een bevinding bevestigen via meerdere onafhankelijke aanwijzingen; nooit op één bron vertrouwen.' },
    { term: 'Deepfake', def: 'Met AI gemaakte nep-video of -foto die echt lijkt; reden om beeld altijd kritisch te verifiëren.' },
  ],

  resources: [
    { title: 'Bellingcat — onderzoeks- en verificatiemethoden', url: 'https://www.bellingcat.com/' },
    { title: 'OSINT Framework — overzicht van open-bronnen-tools', url: 'https://osintframework.com/' },
    { title: 'Nationaal Cyber Security Centrum (NCSC)', url: 'https://www.ncsc.nl/' },
    { title: 'Politie — aangifte en cybercrime', url: 'https://www.politie.nl/' },
  ],
});
