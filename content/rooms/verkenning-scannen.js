/* Room: Verkenning en scannen */
CS.registerRoom({
  id: 'verkenning-scannen',
  path: 'offensief',
  order: 2,
  title: 'Verkenning en scannen',
  icon: '🔭',
  difficulty: 'Gemiddeld',
  minutes: 60,
  summary: 'Leer hoe een pentester een doelwit in kaart brengt: passieve en actieve verkenning, OSINT, footprinting en poortscannen met nmap — en waarom dit alleen mag met schriftelijke toestemming.',
  objectives: [
    'De fasen van een pentest benoemen: verkenning, scannen, exploitatie en rapportage',
    'Het verschil uitleggen tussen passieve en actieve verkenning en voorbeelden van OSINT geven',
    'Met whois en DNS-verkenning (dig) informatie over een doelwit verzamelen',
    'Met nmap open poorten en services detecteren en de uitvoer interpreteren',
    'Uitleggen waarom ongeautoriseerd scannen in Nederland strafbaar is (art. 138ab Sr) en hoe responsible disclosure via het NCSC werkt',
  ],
  tasks: [
    {
      title: 'Taak 1 — De fasen van een pentest',
      content: `
        <p>Een <strong>pentest</strong> (penetratietest) is een gecontroleerde, toegestane aanval op een systeem om
        zwakke plekken te vinden voordat echte aanvallers dat doen. Zo\'n test verloopt niet chaotisch, maar in
        vaste fasen. Je kunt het vergelijken met een inbreker die een gebouw bestudeert — maar dan met een
        ondertekend contract dat zegt dat het mag.</p>

        <h3>De vier hoofdfasen</h3>
        <ol>
          <li><strong>Verkenning (reconnaissance):</strong> informatie verzamelen over het doelwit. Welke systemen,
          domeinen en mensen zijn er? Dit is de fase waar deze room vooral over gaat.</li>
          <li><strong>Scannen:</strong> actief onderzoeken welke apparaten leven, welke poorten open staan en welke
          diensten (services) erop draaien. Hier komt <code>nmap</code> om de hoek.</li>
          <li><strong>Exploitatie:</strong> een gevonden kwetsbaarheid daadwerkelijk gebruiken om toegang te krijgen.
          Dit behandelen we in de webhacking-room, uiteraard alleen in het lab.</li>
          <li><strong>Rapportage:</strong> alles netjes opschrijven — wat je vond, hoe erg het is en hoe de klant
          het oplost. Dit is voor de opdrachtgever het belangrijkste deel: zonder duidelijk rapport heeft een test
          weinig waarde.</li>
        </ol>

        <div class="callout info">
          <strong>Onthoud de volgorde:</strong> verkenning komt eerst en rapportage laatst. Hoe beter je verkent,
          hoe gerichter (en minder luidruchtig) je kunt scannen en testen. Verkenning is echt het fundament.
        </div>

        <p>In deze room blijven we bij de eerste twee fasen: verkenning en scannen. Maar eerst het allerbelangrijkste
        onderwerp van allemaal — de ethiek en de wet.</p>
      `,
      questions: [
        { q: 'Wat is de juiste volgorde van de fasen van een pentest?', options: ['Verkenning → scannen → exploitatie → rapportage', 'Exploitatie → verkenning → rapportage → scannen', 'Rapportage → scannen → verkenning → exploitatie'], answer: 0, explain: 'Je verkent eerst, scant dan, buit daarna eventueel uit en rapporteert tot slot.' },
        { q: 'Wat is het Engelse woord voor de verkenningsfase?', answer: ['reconnaissance', 'recon'], hint: 'Het wordt vaak afgekort tot "recon".', explain: 'Reconnaissance (recon) is het verzamelen van informatie over het doelwit.' },
        { q: 'Welke fase is voor de opdrachtgever meestal het belangrijkste eindproduct?', options: ['De rapportage', 'De exploitatie', 'De verkenning'], answer: 0, explain: 'Zonder een duidelijk rapport met bevindingen en oplossingen heeft een pentest weinig waarde voor de klant.' },
      ],
    },

    {
      title: 'Taak 2 — Ethiek en de wet (lees dit goed!)',
      content: `
        <div class="callout danger">
          <strong>De gouden regel:</strong> je scant, verkent of test <em>uitsluitend</em> systemen die van jou zijn,
          of waarvoor je <strong>uitdrukkelijke, schriftelijke toestemming</strong> hebt. Geen toestemming betekent:
          niet doen. Punt.
        </div>

        <p>Verkennen en scannen voelt onschuldig — je "kijkt alleen maar". Maar juridisch ligt dat anders. Alleen
        al het actief scannen van een systeem van een ander kan strafbaar zijn, en binnendringen is dat zeker.</p>

        <h3>De wet in Nederland</h3>
        <p>In Nederland is <strong>computervredebreuk</strong> strafbaar gesteld in <strong>artikel 138ab van het
        Wetboek van Strafrecht (Sr)</strong>. Kort gezegd: opzettelijk en wederrechtelijk (zonder recht) binnendringen
        in een geautomatiseerd werk is een misdrijf. "Binnendringen" wordt ruim uitgelegd — bijvoorbeeld door een
        beveiliging te doorbreken of door een valse sleutel/identiteit te gebruiken. Ongeautoriseerd scannen is het
        voorportaal daarvan en kan je al flink in de problemen brengen. Onwetendheid ("ik wist niet dat het niet
        mocht") is geen excuus.</p>

        <h3>Scope en toestemming</h3>
        <p>Bij een echte pentest leg je vooraf de <strong>scope</strong> vast: welke IP-adressen, domeinen en
        systemen je mag testen, wanneer, en met welke technieken. Alles buiten die scope is verboden terrein. Die
        afspraken staan zwart-op-wit in een opdracht of contract, ondertekend door iemand die daar daadwerkelijk
        over gaat.</p>

        <h3>Wat als je per ongeluk iets vindt?</h3>
        <p>Stel, je struikelt buiten een opdracht over een echt lek. Dan buit je het <em>niet</em> uit en je maakt
        het <em>niet</em> openbaar. Je meldt het verantwoord via <strong>Coordinated Vulnerability Disclosure</strong>
        (CVD, voorheen "responsible disclosure"). In Nederland kun je terecht bij de organisatie zelf (veel bedrijven
        hebben een CVD-beleid met een security.txt) of bij het <strong>NCSC</strong> (Nationaal Cyber Security
        Centrum). Je geeft de eigenaar redelijk de tijd om het te repareren voordat er iets naar buiten komt.</p>

        <div class="callout tip">
          <strong>Tip:</strong> gebruik voor oefenen altijd legale omgevingen: dit JVT-lab, of platforms als
          TryHackMe en Hack The Box, of je eigen virtuele machines thuis. Daar mag je alles, want het is van jou
          of expliciet daarvoor bedoeld.
        </div>
      `,
      questions: [
        { q: 'Welk wetsartikel stelt computervredebreuk in Nederland strafbaar?', answer: ['138ab', 'art. 138ab Sr', 'artikel 138ab'], hint: 'Het staat in het Wetboek van Strafrecht en begint met 138.', explain: 'Artikel 138ab Sr stelt het opzettelijk en wederrechtelijk binnendringen in een geautomatiseerd werk strafbaar.' },
        { q: 'Je mag een systeem scannen of testen wanneer...', options: ['Je uitdrukkelijke, schriftelijke toestemming hebt (of het je eigen systeem is)', 'Je denkt dat het wel goed komt', 'Het systeem toch al slecht beveiligd lijkt'], answer: 0, explain: 'Alleen met toestemming of op je eigen systemen. Anders niet, ook al lijkt het "onschuldig".' },
        { q: 'Je vindt buiten een opdracht per ongeluk een echt lek. Wat is de juiste stap?', options: ['Verantwoord melden (CVD) bij de eigenaar of het NCSC, zonder het te misbruiken of openbaar te maken', 'Het lek uitbuiten om te laten zien dat het werkt', 'Het meteen op social media zetten'], answer: 0, explain: 'Coordinated Vulnerability Disclosure: meld het netjes, geef tijd om te repareren en misbruik het niet.' },
        { q: 'Ik begrijp dat ik alleen scan en test op eigen systemen of met schriftelijke toestemming, en dat ongeautoriseerd scannen strafbaar kan zijn.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 3 — Passief versus actief, en OSINT',
      content: `
        <p>Verkenning verdeel je grofweg in twee soorten, afhankelijk van of je het doelwit "aanraakt".</p>

        <h3>Passieve verkenning</h3>
        <p>Bij <strong>passieve verkenning</strong> verzamel je informatie <em>zonder</em> rechtstreeks met de
        systemen van het doelwit te praten. Je gebruikt openbare bronnen. Het doelwit merkt er niets van, want je
        klopt nergens aan. Voorbeelden: de website en social media van een bedrijf lezen, zoekmachines gebruiken,
        openbare registers raadplegen, of kijken wat er in eerdere datalekken is verschenen.</p>

        <h3>Actieve verkenning</h3>
        <p>Bij <strong>actieve verkenning</strong> stuur je wél verzoeken naar de systemen van het doelwit, zoals
        een poortscan met nmap. Dat levert veel preciezere informatie op, maar het laat sporen na in hun logs en
        kan opvallen. En — belangrijk — hiervoor heb je toestemming nodig, want je raakt hun systemen aan.</p>

        <table>
          <thead><tr><th></th><th>Passief</th><th>Actief</th></tr></thead>
          <tbody>
            <tr><td>Raak je het doelwit aan?</td><td>Nee</td><td>Ja</td></tr>
            <tr><td>Merkbaar / sporen?</td><td>Nauwelijks</td><td>Ja, in logs</td></tr>
            <tr><td>Voorbeeld</td><td>Google, social media, whois-data lezen</td><td>Poortscan, servicedetectie</td></tr>
          </tbody>
        </table>

        <h3>OSINT en footprinting</h3>
        <p><strong>OSINT</strong> staat voor <em>Open Source Intelligence</em>: het verzamelen van informatie uit
        openbare, legaal toegankelijke bronnen. Dat is meestal passief. Denk aan werknemers op LinkedIn (handig voor
        gokken op gebruikersnamen of phishing), documenten met verborgen metadata, of subdomeinen die ergens zijn
        genoemd. Het geheel van informatie dat je zo over een organisatie opbouwt — domeinen, IP-reeksen, gebruikte
        technologie, e-mailadressen — heet de <strong>footprint</strong>, en het in kaart brengen daarvan heet
        <strong>footprinting</strong>.</p>

        <div class="callout warn">
          <strong>Let op:</strong> passief betekent niet automatisch "altijd legaal". Het verzamelen mag doorgaans,
          maar wat je ermee dóet, valt onder gewone regels (privacy, AVG, auteursrecht). En zodra je overgaat op
          actief scannen, heb je sowieso toestemming nodig.
        </div>
      `,
      questions: [
        { q: 'Wat is het verschil tussen passieve en actieve verkenning?', options: ['Bij passief raak je het doelwit niet aan; bij actief stuur je verzoeken naar hun systemen', 'Passief is illegaal, actief is legaal', 'Er is geen verschil'], answer: 0, explain: 'Passief gebruikt openbare bronnen zonder contact; actief (zoals scannen) raakt de systemen aan en laat sporen na.' },
        { q: 'Waar staat OSINT voor?', options: ['Open Source Intelligence', 'Online Security Intrusion Test', 'Operating System Internal Network Trace'], answer: 0, explain: 'OSINT is het verzamelen van informatie uit openbare, legaal toegankelijke bronnen.' },
        { q: 'Hoe heet het in kaart brengen van alle openbare informatie (domeinen, IP-reeksen, technologie) van een organisatie?', answer: ['footprinting'], hint: 'Je bouwt een "voetafdruk" van de organisatie op.', explain: 'Footprinting is het verzamelen en samenbrengen van de footprint van een doelwit.' },
      ],
    },

    {
      title: 'Taak 4 — Verkenning met whois en DNS (dig)',
      content: `
        <p>Tijd om zelf te verkennen — passief, met openbare registers. Je fictieve opdracht gaat over het domein
        <code>nederbank.jvt.lab</code> van NederBank N.V. (een verzonnen bank; alles in dit lab is fictief). De
        toegestane scope staat in het bestand <code>opdracht.txt</code> in je thuismap; lees dat eerst met
        <code>cat opdracht.txt</code>.</p>

        <h3>whois: wie staat er achter een domein?</h3>
        <p>Met <strong>whois</strong> vraag je registratiegegevens van een domein op: wie het registreerde, bij welke
        registrar, de aanmaakdatum en de naamservers. Typ in het lab:</p>
        <pre><code>whois nederbank.jvt.lab</code></pre>

        <h3>dig: het DNS ondervragen</h3>
        <p><strong>DNS</strong> (Domain Name System) is het "telefoonboek" van internet: het vertaalt namen naar
        IP-adressen. Met het commando <strong>dig</strong> stel je het DNS gerichte vragen. Een paar nuttige:</p>
        <ul>
          <li><code>dig nederbank.jvt.lab</code> — de volledige uitvoer, inclusief de ANSWER-sectie met het A-record.</li>
          <li><code>dig +short nederbank.jvt.lab</code> — alleen het IP-adres, korter.</li>
          <li><code>dig TXT nederbank.jvt.lab +short</code> — de <strong>TXT-records</strong> van het domein.</li>
        </ul>
        <p>TXT-records worden vaak gebruikt voor instellingen (zoals SPF tegen e-mailvervalsing), maar organisaties
        zetten er soms per ongeluk gevoelige of interne informatie in. Juist daarom zijn ze een leuke OSINT-bron.
        Vraag de TXT-records op en kijk goed wat erin staat.</p>

        <div class="callout tip">
          <strong>Tip:</strong> het A-record dat je vindt, is het IP-adres waarop de server draait. Onthoud dat
          adres goed — in de volgende taak ga je het (met toestemming, binnen scope) actief scannen met nmap.
        </div>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student', host: 'recon-lab',
        home: '/home/student', cwd: '/home/student',
        motd: 'Verkennings-lab. Alles is fictief. Blijf binnen de scope in opdracht.txt.',
        fs: {
          '/home/student/opdracht.txt': 'PENTEST-OPDRACHT (FICTIEF)\nOpdrachtgever: NederBank N.V.\nContract/CVD: JVT-2026-014 (schriftelijk akkoord)\nScope: nederbank.jvt.lab en 10.10.50.0/24\nBuiten scope: ALLES anders. Niet aanraken.\nToegestane fasen: verkenning + scannen.\n',
        },
        commands: {
          'whois nederbank.jvt.lab': 'Domain Name: NEDERBANK.JVT.LAB\nRegistrar: JVT-LAB Registrar BV\nRegistrant Organization: NederBank N.V. (fictief)\nRegistrant Country: NL\nCreation Date: 2019-03-11T09:14:22Z\nUpdated Date: 2026-01-08T11:02:50Z\nRegistry Expiry Date: 2027-03-11T09:14:22Z\nName Server: NS1.JVT.LAB\nName Server: NS2.JVT.LAB\nAdmin Email: hostmaster@nederbank.jvt.lab\n>>> Fictief lab-domein, uitsluitend voor oefendoeleinden. <<<',
          'dig nederbank.jvt.lab': '; <<>> DiG 9.18 <<>> nederbank.jvt.lab\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42411\n;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\n\n;; QUESTION SECTION:\n;nederbank.jvt.lab.\t\tIN\tA\n\n;; ANSWER SECTION:\nnederbank.jvt.lab.\t300\tIN\tA\t10.10.50.10\n\n;; Query time: 6 msec\n;; SERVER: 10.10.50.2#53(10.10.50.2)\n;; MSG SIZE  rcvd: 62',
          'dig +short nederbank.jvt.lab': '10.10.50.10',
          'dig TXT nederbank.jvt.lab +short': '"v=spf1 include:_spf.jvt.lab ~all"\n"intern-notitie: migratie-portaal staat op poort 80"\n"JVT{dns_txt_lekt_info}"',
          'cat opdracht.txt': 'PENTEST-OPDRACHT (FICTIEF)\nOpdrachtgever: NederBank N.V.\nContract/CVD: JVT-2026-014 (schriftelijk akkoord)\nScope: nederbank.jvt.lab en 10.10.50.0/24\nBuiten scope: ALLES anders. Niet aanraken.\nToegestane fasen: verkenning + scannen.',
        },
      },
      questions: [
        { q: 'Welk IP-adres (A-record) hoort bij nederbank.jvt.lab?', answer: ['10.10.50.10'], hint: 'Gebruik dig +short nederbank.jvt.lab of kijk in de ANSWER SECTION.', explain: 'Het A-record wijst nederbank.jvt.lab aan 10.10.50.10 toe; dat wordt straks je scan-doelwit.' },
        { q: 'Vraag de TXT-records op met dig TXT nederbank.jvt.lab +short. Welke vlag staat erin?', answer: ['JVT{dns_txt_lekt_info}'], hint: 'TXT-records kunnen per ongeluk interne info lekken. Lees alle regels van de uitvoer.', explain: 'In een TXT-record is een interne notitie met een vlag blijven staan: een klassiek OSINT-lek.' },
        { q: 'Is het opvragen van whois- en DNS-gegevens passieve of actieve verkenning?', options: ['Passief: je raadpleegt openbare registers, niet het doelsysteem zelf', 'Actief: je valt de server direct aan', 'Geen van beide'], answer: 0, explain: 'whois en DNS raadpleeg je bij registers/naamservers, niet bij het doelsysteem; dat is passief.' },
      ],
    },

    {
      title: 'Taak 5 — Poortscannen en servicedetectie met nmap',
      content: `
        <p>Nu de actieve fase — netjes binnen de scope uit <code>opdracht.txt</code>, op het IP dat je net vond:
        <code>10.10.50.10</code>. Het bekendste gereedschap hiervoor is <strong>nmap</strong> (Network Mapper).</p>

        <h3>Wat zijn poorten?</h3>
        <p>Een server draait vaak meerdere diensten tegelijk. Elke dienst "luistert" op een eigen genummerde
        <strong>poort</strong> (port). Analogie: één gebouw (het IP-adres) met veel genummerde deuren (de poorten).
        Achter deur 22 zit meestal SSH, achter deur 80 een webserver (HTTP), achter deur 3306 een MySQL-database.
        Een poortscan controleert welke deuren open staan.</p>

        <h3>Een paar nmap-scans</h3>
        <ul>
          <li><code>nmap -sn 10.10.50.0/24</code> — <em>host discovery</em>: welke apparaten in dit netwerk leven
          er (zonder poorten te scannen)?</li>
          <li><code>nmap 10.10.50.10</code> — een standaard poortscan op de meest gebruikte poorten.</li>
          <li><code>nmap -sV 10.10.50.10</code> — <strong>servicedetectie</strong>: nmap probeert niet alleen te
          zien of een poort open is, maar ook wélke dienst en wélke versie erachter zit (de "banner").</li>
        </ul>

        <p>Typ deze commando\'s één voor één in het lab. Begin met de host discovery, scan dan het doelwit, en voer
        tot slot <code>nmap -sV 10.10.50.10</code> uit. Lees de uitvoer van de servicedetectie heel goed: in de
        banner van de webserver (de <code>http-server-header</code>) is per ongeluk een vlag blijven staan. Dat laat
        meteen zien waarom je servers niet te spraakzaam moet laten zijn over hun versie en interne details.</p>

        <div class="callout info">
          <strong>Waarom servicedetectie zo nuttig is:</strong> weten dát poort 80 open is, is leuk, maar weten
          dat er een specifieke versie van een webserver draait, vertelt een aanvaller (of verdediger) meteen naar
          welke bekende kwetsbaarheden hij moet kijken. Daarom lekken versiebanners zo gevaarlijk veel.
        </div>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student', host: 'recon-lab',
        home: '/home/student', cwd: '/home/student',
        motd: 'Scan-lab. Doelwit binnen scope: 10.10.50.10 (nederbank.jvt.lab).',
        fs: {
          '/home/student/scope.txt': 'Toegestaan scan-doelwit: 10.10.50.0/24\nHoofddoelwit: 10.10.50.10 (nederbank.jvt.lab)\n',
        },
        commands: {
          'nmap -sn 10.10.50.0/24': 'Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-03 14:01 CET\nNmap scan report for 10.10.50.2\nHost is up (0.0021s latency).\nNmap scan report for 10.10.50.10\nHost is up (0.0119s latency).\nNmap done: 256 IP addresses (2 hosts up) scanned in 2.84 seconds',
          'nmap 10.10.50.10': 'Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-03 14:02 CET\nNmap scan report for nederbank.jvt.lab (10.10.50.10)\nHost is up (0.012s latency).\nNot shown: 997 closed tcp ports (reset)\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n3306/tcp open  mysql\n\nNmap done: 1 IP address scanned in 1.90 seconds',
          'nmap -sV 10.10.50.10': 'Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-03 14:03 CET\nNmap scan report for nederbank.jvt.lab (10.10.50.10)\nHost is up (0.012s latency).\nNot shown: 997 closed tcp ports (reset)\nPORT     STATE SERVICE VERSION\n22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)\n80/tcp   open  http    Apache httpd 2.4.52 ((Ubuntu))\n|_http-server-header: Apache/2.4.52 (Ubuntu) X-Intern: JVT{open_poort_80_apache}\n|_http-title: NederBank Intern Migratie-portaal\n3306/tcp open  mysql   MySQL 8.0.36-0ubuntu0.22.04.1\nService Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel\n\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .\nNmap done: 1 IP address scanned in 7.21 seconds',
        },
      },
      questions: [
        { q: 'Voer nmap -sV 10.10.50.10 uit. Welke vlag staat in de http-server-header (de banner van de webserver)?', answer: ['JVT{open_poort_80_apache}'], hint: 'Kijk bij de regel van poort 80/tcp, onder |_http-server-header.', explain: 'De webserver lekt in zijn banner een interne header met een vlag; daarom wil je banners zo karig mogelijk houden.' },
        { q: 'Welke drie poorten staan open op 10.10.50.10 (volgens de scan)?', options: ['22 (ssh), 80 (http), 3306 (mysql)', '21 (ftp), 25 (smtp), 110 (pop3)', '53 (dns), 443 (https), 8080 (http-alt)'], answer: 0, explain: 'De scan toont 22/ssh, 80/http en 3306/mysql als open.' },
        { q: 'Wat doet de optie -sV bij nmap?', options: ['Servicedetectie: probeert dienst én versie achter een open poort te bepalen', 'Alleen controleren of een host online is', 'De scan sneller maken zonder extra info'], answer: 0, explain: '-sV ("service/version detection") leest de banners uit en bepaalt welke software en versie draait.' },
        { q: 'Welk nmap-commando gebruik je voor host discovery (kijken welke apparaten leven) zonder poorten te scannen?', answer: ['nmap -sn 10.10.50.0/24', 'nmap -sn'], hint: 'De optie heet -sn ( "no port scan").', explain: 'Met nmap -sn doe je alleen host discovery: je ziet welke hosts up zijn, zonder poortscan.' },
      ],
    },

    {
      title: 'Taak 6 — De nmap-uitvoer interpreteren',
      content: `
        <p>Een scan uitvoeren is één ding, maar de uitkomst goed <em>lezen</em> is minstens zo belangrijk. Laten we
        de resultaten van <code>10.10.50.10</code> ontleden.</p>

        <h3>Poortstatussen</h3>
        <p>nmap zegt per poort of hij <strong>open</strong>, <strong>closed</strong> of <strong>filtered</strong> is:</p>
        <table>
          <thead><tr><th>Status</th><th>Betekenis</th></tr></thead>
          <tbody>
            <tr><td><strong>open</strong></td><td>Er luistert een dienst; je kunt verbinding maken.</td></tr>
            <tr><td><strong>closed</strong></td><td>De poort reageert, maar er luistert niets.</td></tr>
            <tr><td><strong>filtered</strong></td><td>Iets (meestal een firewall) blokkeert; nmap krijgt geen duidelijk antwoord.</td></tr>
          </tbody>
        </table>

        <h3>Wat vertellen deze services?</h3>
        <ul>
          <li><strong>22/ssh</strong> — beheer op afstand. Interessant: draait er een oude, kwetsbare versie? Mag
          inloggen met wachtwoord of alleen met sleutels?</li>
          <li><strong>80/http</strong> — een webserver. Hier zou je in de volgende fase naar webkwetsbaarheden kijken
          (zie de webhacking-room). De banner verraadt hier bovendien versie-info.</li>
          <li><strong>3306/mysql</strong> — een database die rechtstreeks vanaf het netwerk bereikbaar is. Dat is
          vaak onbedoeld en risicovol: databases horen meestal niet open op het netwerk te staan.</li>
        </ul>

        <div class="callout warn">
          <strong>Van scannen naar denken:</strong> de scan geeft je een lijst, maar jij trekt de conclusies. Open
          poort 3306 roept meteen de vraag op: waarom staat de database open, en met welke toegang? Een goede
          verkenner maakt van ruwe output bruikbare bevindingen voor het rapport.
        </div>

        <h3>Wees niet luidruchtiger dan nodig</h3>
        <p>Een volledige, agressieve scan (alle 65.535 poorten, agressieve timing) is luid en valt op in de logs
        van het doelwit. Bij een echte opdracht stem je de scansnelheid en -diepte af op de afspraken. Verkennen is
        ook een beetje beleefd zijn: niet harder aan de deur rammelen dan nodig.</p>
      `,
      questions: [
        { q: 'Een poort is "filtered". Wat betekent dat meestal?', options: ['Iets (vaak een firewall) blokkeert, dus nmap krijgt geen duidelijk antwoord', 'Er luistert zeker een dienst', 'De poort bestaat niet'], answer: 0, explain: 'Filtered betekent dat er iets tussen zit (meestal een firewall) dat het antwoord tegenhoudt.' },
        { q: 'Waarom is een open 3306/mysql-poort op een server die vanaf het netwerk bereikbaar is een opvallende bevinding?', options: ['Databases horen meestal niet open op het netwerk te staan; dat is vaak onbedoeld en risicovol', 'MySQL is altijd veilig, dus het maakt niet uit', 'Poort 3306 is voor e-mail'], answer: 0, explain: 'Een direct bereikbare database is een geliefd doelwit; meestal hoort die afgeschermd te zijn.' },
        { q: 'Waarom kies je bij een echte opdracht niet standaard voor de meest agressieve, volledige scan?', options: ['Die is luidruchtig, valt op in logs en moet passen binnen de gemaakte afspraken', 'Omdat agressieve scans altijd illegaal zijn', 'Omdat nmap dan crasht'], answer: 0, explain: 'Je stemt diepte en snelheid af op de scope en afspraken; onnodig luid scannen is niet netjes en valt op.' },
      ],
    },

    {
      title: 'Taak 7 — Van verkenning naar rapportage',
      content: `
        <p>Je hebt verkend (whois, DNS) en gescand (nmap). De laatste — en voor de klant belangrijkste — stap is
        alles helder <strong>rapporteren</strong>. Een pentest zonder goed rapport is als een dokter die een
        diagnose stelt maar die nooit opschrijft.</p>

        <h3>Wat hoort er in een goed rapport?</h3>
        <ul>
          <li><strong>Managementsamenvatting:</strong> in begrijpelijke taal wat je vond en hoe erg het is.</li>
          <li><strong>Scope en methode:</strong> wat mocht je testen, wanneer en hoe (zodat het herhaalbaar is).</li>
          <li><strong>Bevindingen:</strong> per probleem een beschrijving, het risico (impact en waarschijnlijkheid)
          en bewijs (bijvoorbeeld de scan-output).</li>
          <li><strong>Aanbevelingen:</strong> concreet hoe de klant het oplost — dit is waar je echt waarde toevoegt.</li>
        </ul>
        <p>Voor ons voorbeeld zou je bijvoorbeeld rapporteren: "De webserver op 10.10.50.10 lekt in zijn HTTP-banner
        versie- en interne informatie (zie <code>-sV</code>-output). Advies: verberg versiebanners en verwijder
        interne headers." En: "Een TXT-record van nederbank.jvt.lab bevat een interne notitie. Advies: verwijder
        gevoelige info uit publieke DNS-records."</p>

        <h3>Verantwoord melden buiten een opdracht</h3>
        <p>Vind je iets terwijl je géén opdracht hebt (bijvoorbeeld bij toevallig surfen)? Dan geldt opnieuw:
        verantwoord melden via <strong>CVD</strong>. Veel organisaties publiceren hun beleid in een
        <code>security.txt</code>-bestand. Kom je er niet uit, dan kun je in Nederland terecht bij het
        <strong>NCSC</strong>. Nooit uitbuiten, nooit zomaar openbaar maken.</p>

        <div class="callout danger">
          <strong>Nog één keer, want het is cruciaal:</strong> alles wat je in deze room leerde, pas je uitsluitend
          toe op je eigen systemen of met uitdrukkelijke, schriftelijke toestemming. Verkennen en scannen zonder
          toestemming kan strafbaar zijn (art. 138ab Sr). Gebruik je kennis om te beschermen.
        </div>
      `,
      questions: [
        { q: 'Welk onderdeel van een pentestrapport voegt voor de klant de meeste waarde toe?', options: ['Concrete aanbevelingen om de problemen op te lossen', 'Een zo lang mogelijke lijst met ruwe scan-output', 'De naam van het gebruikte gereedschap'], answer: 0, explain: 'De klant wil vooral weten hoe hij het oplost; duidelijke aanbevelingen maken het rapport waardevol.' },
        { q: 'Via welke Nederlandse instantie kun je een lek verantwoord melden als je er met de organisatie zelf niet uitkomt?', answer: ['NCSC', 'ncsc', 'Nationaal Cyber Security Centrum'], hint: 'Nationaal Cyber Security Centrum.', explain: 'Het NCSC is in Nederland een centraal punt voor Coordinated Vulnerability Disclosure.' },
        { q: 'In welk bestand publiceren organisaties vaak hun beleid voor het melden van kwetsbaarheden?', answer: ['security.txt'], hint: 'Een tekstbestand met "security" in de naam, meestal onder /.well-known/.', explain: 'Een security.txt vertelt hoe en waar je een kwetsbaarheid verantwoord kunt melden.' },
        { q: 'Ik kan de fasen van een pentest benoemen en weet dat ik verkennen en scannen alleen ethisch en legaal toepas.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'Pentest', def: 'Penetratietest: een gecontroleerde, toegestane aanval op een systeem om kwetsbaarheden te vinden voordat echte aanvallers dat doen.' },
    { term: 'Verkenning (reconnaissance)', def: 'De eerste fase: informatie verzamelen over het doelwit (domeinen, IP-adressen, mensen, technologie).' },
    { term: 'Passieve verkenning', def: 'Informatie verzamelen zonder het doelsysteem aan te raken, via openbare bronnen; nauwelijks merkbaar.' },
    { term: 'Actieve verkenning', def: 'Informatie verzamelen door verzoeken naar het doelsysteem te sturen (zoals scannen); laat sporen na en vereist toestemming.' },
    { term: 'OSINT', def: 'Open Source Intelligence: informatie verzamelen uit openbare, legaal toegankelijke bronnen.' },
    { term: 'Footprinting', def: 'Het in kaart brengen van alle (openbare) informatie over een organisatie: de footprint.' },
    { term: 'whois', def: 'Commando/dienst om registratiegegevens van een domein op te vragen (registrar, datums, naamservers).' },
    { term: 'DNS', def: 'Domain Name System: het telefoonboek van internet dat namen naar IP-adressen vertaalt.' },
    { term: 'dig', def: 'Gereedschap om het DNS gerichte vragen te stellen, bijvoorbeeld naar A-records of TXT-records.' },
    { term: 'nmap', def: 'Network Mapper: het bekendste gereedschap om hosts, open poorten en services te scannen.' },
    { term: 'Poort (port)', def: 'Genummerd "deurtje" waarop een dienst luistert; bijv. 22 (SSH), 80 (HTTP), 3306 (MySQL).' },
    { term: 'Servicedetectie', def: 'Bepalen welke dienst en versie achter een open poort draait (nmap -sV), via de banner.' },
    { term: 'Art. 138ab Sr', def: 'Wetsartikel dat computervredebreuk strafbaar stelt: opzettelijk en wederrechtelijk binnendringen in een geautomatiseerd werk.' },
    { term: 'Coordinated Vulnerability Disclosure (CVD)', def: 'Verantwoord melden van een kwetsbaarheid bij de eigenaar of het NCSC, zonder misbruik en met tijd om te repareren.' },
  ],
  resources: [
    { title: 'Nmap Network Scanning (officieel boek)', url: 'https://nmap.org/book/' },
    { title: 'NCSC (Nederland)', url: 'https://www.ncsc.nl/' },
    { title: 'TryHackMe (oefenplatform)', url: 'https://tryhackme.com/' },
    { title: 'OWASP (algemeen)', url: 'https://owasp.org/' },
  ],
});
