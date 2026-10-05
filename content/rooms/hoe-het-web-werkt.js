/* Room: Hoe het web werkt */
CS.registerRoom({
  id: 'hoe-het-web-werkt',
  path: 'fundamenten',
  order: 4,
  title: 'Hoe het web werkt',
  icon: '🌐',
  difficulty: 'Makkelijk',
  minutes: 75,
  summary: 'Van URL tot webpagina: DNS, HTTP, cookies, HTTPS en wat er onder de motorkap gebeurt als je op Enter drukt.',
  objectives: [
    'Stap voor stap uitleggen wat er gebeurt als je een URL intypt',
    'De onderdelen van een URL en de rol van DNS benoemen',
    'Een HTTP-request en -response lezen, inclusief methodes, statuscodes en headers',
    'Uitleggen hoe cookies en sessies werken en waarom HTTPS belangrijk is',
    'Met robots.txt, headers en cookies zelf een webserver onderzoeken',
  ],
  tasks: [
    {
      title: 'Taak 1 — Van URL naar webpagina',
      content: `
        <p>Je typt <code>https://shop.jvt.lab/producten?id=42#reviews</code> in je browser en drukt op Enter. In minder dan een seconde verschijnt er een pagina. Maar daartussen gebeurt verrassend veel. We lopen het stap voor stap door, want als je weet hoe het web werkt, snap je later ook veel beter waar aanvallers inhaken.</p>

        <h3>Wat er gebeurt als je op Enter drukt</h3>
        <ol>
          <li><strong>URL ontleden.</strong> De browser splitst de URL in onderdelen (zie hieronder).</li>
          <li><strong>DNS-opzoeking.</strong> De browser vraagt: welk IP-adres hoort bij <code>shop.jvt.lab</code>? Dat doet DNS (volgende taak).</li>
          <li><strong>Verbinding opzetten.</strong> De browser bouwt een TCP-verbinding op naar dat IP-adres, standaard op poort 443 voor HTTPS.</li>
          <li><strong>TLS-handshake.</strong> Bij HTTPS wordt een versleutelde tunnel opgezet en het certificaat van de server gecontroleerd.</li>
          <li><strong>HTTP-request.</strong> De browser stuurt een verzoek: <code>GET /producten?id=42</code> met wat headers.</li>
          <li><strong>Server verwerkt.</strong> De backend zoekt product 42 op in de database en bouwt een pagina (HTML).</li>
          <li><strong>HTTP-response.</strong> De server stuurt een statuscode, headers en de HTML terug.</li>
          <li><strong>Renderen.</strong> De browser tekent de pagina, haalt nog CSS, JavaScript en afbeeldingen op en voert JavaScript uit.</li>
        </ol>

        <h3>De opbouw van een URL</h3>
        <p>Een URL (Uniform Resource Locator) is het adres van een bron op het web. Neem het voorbeeld uiteen:</p>
        <table>
          <thead><tr><th>Onderdeel</th><th>Waarde</th><th>Betekenis</th></tr></thead>
          <tbody>
            <tr><td>Schema</td><td><code>https</code></td><td>Welk protocol: <code>http</code>, <code>https</code>, <code>ftp</code> ...</td></tr>
            <tr><td>Host</td><td><code>shop.jvt.lab</code></td><td>De domeinnaam (of een IP-adres) van de server</td></tr>
            <tr><td>Poort</td><td><code>(443)</code></td><td>Welke deur op de server; staat er vaak niet, dan standaard 80 (http) of 443 (https)</td></tr>
            <tr><td>Pad</td><td><code>/producten</code></td><td>Welke bron op de server je wilt</td></tr>
            <tr><td>Query</td><td><code>?id=42</code></td><td>Extra parameters, als <code>sleutel=waarde</code>, gescheiden door <code>&amp;</code></td></tr>
            <tr><td>Fragment</td><td><code>#reviews</code></td><td>Een plek op de pagina; wordt niet naar de server gestuurd</td></tr>
          </tbody>
        </table>

        <div class="callout tip"><strong>Tip:</strong> het fragment (alles na <code>#</code>) blijft in de browser. De server ziet het nooit. Handig om te onthouden als je later verkeer bekijkt en je je afvraagt waarom een <code>#</code>-deel niet in de logs staat.</div>

        <p>De poort schrijf je voluit als <code>shop.jvt.lab:8080</code>. Een webserver kan op elke poort draaien, maar 80 en 443 zijn de afspraken voor onversleuteld en versleuteld web.</p>
      `,
      questions: [
        { q: 'Welke poort gebruikt HTTPS standaard?', answer: '443', hint: 'Kijk in de tabel met URL-onderdelen.', explain: 'HTTPS is HTTP over TLS en draait standaard op TCP-poort 443. Onversleuteld HTTP gebruikt poort 80.' },
        { q: 'Welk deel van een URL wordt NIET naar de server gestuurd?', options: ['Het pad', 'De query', 'Het fragment', 'De host'], answer: 2, explain: 'Alles na de # (het fragment) verwerkt de browser zelf; het verlaat je computer niet.' },
        { q: 'Ik heb de stappen van URL tot webpagina gelezen.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — DNS: het telefoonboek van internet',
      content: `
        <p>Computers praten met elkaar via IP-adressen zoals <code>10.10.20.15</code>, maar die onthoud je niet. DNS (Domain Name System) vertaalt namen naar adressen, net als een telefoonboek een naam naar een nummer vertaalt.</p>

        <h3>De hiërarchie</h3>
        <p>DNS is een boom die van rechts naar links wordt gelezen. Voor <code>shop.jvt.lab</code>:</p>
        <ul>
          <li><strong>Recursieve resolver</strong> — meestal die van je provider of je bedrijf. Jij stelt hier je vraag; hij zoekt het voor je uit en onthoudt (cachet) het antwoord.</li>
          <li><strong>Root-servers</strong> — weten waar de TLD-servers staan.</li>
          <li><strong>TLD-server</strong> — de server voor de topleveldomeinen zoals <code>.lab</code>, <code>.nl</code> of <code>.com</code>. Weet welke servers verantwoordelijk zijn voor <code>jvt.lab</code>.</li>
          <li><strong>Authoritative nameserver</strong> — de baas over <code>jvt.lab</code>. Geeft het definitieve antwoord: <code>shop.jvt.lab = 10.10.20.15</code>.</li>
        </ul>

        <figure class="diagram">
          <svg viewBox="0 0 520 120" role="img" aria-label="DNS-opzoeking van resolver naar authoritative server">
            <rect x="8" y="45" width="90" height="34" rx="6" stroke="currentColor" fill="none" />
            <text x="53" y="66" fill="currentColor" font-size="13" text-anchor="middle">Resolver</text>
            <rect x="140" y="45" width="80" height="34" rx="6" stroke="currentColor" fill="none" />
            <text x="180" y="66" fill="currentColor" font-size="13" text-anchor="middle">Root</text>
            <rect x="262" y="45" width="80" height="34" rx="6" stroke="currentColor" fill="none" />
            <text x="302" y="66" fill="currentColor" font-size="13" text-anchor="middle">TLD .lab</text>
            <rect x="384" y="38" width="128" height="48" rx="6" stroke="var(--accent)" fill="none" />
            <text x="448" y="59" fill="currentColor" font-size="13" text-anchor="middle">Authoritative</text>
            <text x="448" y="76" fill="currentColor" font-size="13" text-anchor="middle">jvt.lab</text>
            <line x1="98" y1="62" x2="140" y2="62" stroke="currentColor" />
            <line x1="220" y1="62" x2="262" y2="62" stroke="currentColor" />
            <line x1="342" y1="62" x2="384" y2="62" stroke="currentColor" />
          </svg>
          <figcaption>De resolver loopt de keten langs tot hij het definitieve antwoord krijgt, en onthoudt dat daarna.</figcaption>
        </figure>

        <h3>Recordtypes</h3>
        <table>
          <thead><tr><th>Type</th><th>Doel</th></tr></thead>
          <tbody>
            <tr><td><code>A</code></td><td>Naam &rarr; IPv4-adres (bijv. 10.10.20.15)</td></tr>
            <tr><td><code>AAAA</code></td><td>Naam &rarr; IPv6-adres</td></tr>
            <tr><td><code>CNAME</code></td><td>Alias: deze naam verwijst naar een andere naam</td></tr>
            <tr><td><code>MX</code></td><td>Welke mailserver verwerkt e-mail voor dit domein</td></tr>
            <tr><td><code>TXT</code></td><td>Vrije tekst, vaak voor verificatie (SPF, DKIM) of eigenaarschap</td></tr>
            <tr><td><code>NS</code></td><td>Welke nameservers zijn verantwoordelijk voor dit domein</td></tr>
          </tbody>
        </table>
        <p>Elk antwoord heeft een <strong>TTL</strong> (Time To Live) in seconden: zo lang mag de resolver het antwoord bewaren (cachen) voordat hij opnieuw moet vragen. Een lage TTL betekent snelle wijzigingen maar meer verkeer; een hoge TTL is efficiënter maar trager aan te passen.</p>

        <h3>Zelf opzoeken</h3>
        <p>In de terminal hieronder onderzoek je <code>jvt.lab</code>. Typ <code>dig jvt.lab</code> voor het A-record, <code>dig jvt.lab MX</code> voor de mailserver en <code>dig jvt.lab TXT</code> voor de TXT-records. Probeer ook <code>nslookup jvt.lab</code> en <code>curl -I https://jvt.lab</code>, dat laatste toont alleen de response-headers. In een van de TXT-records is een vlag achtergelaten.</p>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student', host: 'jvt-lab',
        home: '/home/student', cwd: '/home/student',
        motd: 'DNS-werkplek. Probeer: dig jvt.lab | dig jvt.lab MX | dig jvt.lab TXT | nslookup jvt.lab | curl -I https://jvt.lab',
        fs: {
          '/home/student/opdracht.txt': 'Onderzoek het domein jvt.lab met dig, nslookup en curl.\n',
        },
        commands: {
          'dig jvt.lab': '; <<>> DiG 9.18.24 <<>> jvt.lab\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42317\n;; flags: qr rd ra; QUERY: 1, ANSWER: 1\n\n;; QUESTION SECTION:\n;jvt.lab.\t\t\tIN\tA\n\n;; ANSWER SECTION:\njvt.lab.\t\t3600\tIN\tA\t10.10.20.15\n\n;; Query time: 12 msec\n;; SERVER: 10.10.20.2#53(10.10.20.2) (UDP)\n;; MSG SIZE  rcvd: 56',
          'dig jvt.lab MX': '; <<>> DiG 9.18.24 <<>> jvt.lab MX\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 11902\n\n;; ANSWER SECTION:\njvt.lab.\t\t3600\tIN\tMX\t10 mail.jvt.lab.\n\n;; MSG SIZE  rcvd: 61',
          'dig jvt.lab TXT': '; <<>> DiG 9.18.24 <<>> jvt.lab TXT\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 30744\n\n;; ANSWER SECTION:\njvt.lab.\t\t3600\tIN\tTXT\t"v=spf1 include:_spf.jvt.lab ~all"\njvt.lab.\t\t3600\tIN\tTXT\t"JVT{txt_record_gevonden}"\n\n;; MSG SIZE  rcvd: 98',
          'nslookup jvt.lab': 'Server:\t\t10.10.20.2\nAddress:\t10.10.20.2#53\n\nNon-authoritative answer:\nName:\tjvt.lab\nAddress: 10.10.20.15',
          'curl -I https://jvt.lab': 'HTTP/2 200 \nserver: nginx/1.24.0\ndate: Sat, 03 Oct 2026 10:12:44 GMT\ncontent-type: text/html; charset=UTF-8\ncontent-length: 5120\nstrict-transport-security: max-age=31536000',
        },
      },
      questions: [
        { q: 'Welk recordtype koppelt een domeinnaam aan een IPv4-adres?', answer: ['A', 'A-record'], hint: 'Niet AAAA, dat is voor IPv6.', explain: 'Een A-record wijst een naam naar een IPv4-adres. AAAA doet hetzelfde voor IPv6.' },
        { q: 'Draai dig jvt.lab MX. Wat is de hostnaam van de mailserver?', answer: ['mail.jvt.lab', 'mail.jvt.lab.'], hint: 'Kijk in de ANSWER SECTION; het getal 10 is de prioriteit, niet de naam.', explain: 'Het MX-record wijst naar mail.jvt.lab met prioriteit 10.' },
        { q: 'Draai dig jvt.lab TXT en vind de vlag.', answer: ['JVT{txt_record_gevonden}'], hint: 'Er staan twee TXT-records; een ervan is geen echte SPF-regel.', explain: 'Beheerders zetten soms verificatiewaarden in TXT-records; hier stond een vlag verstopt.' },
      ],
    },

    {
      title: 'Taak 3 — HTTP: vraag en antwoord',
      content: `
        <p>HTTP (HyperText Transfer Protocol) is de taal waarin browser en server praten. Het is een simpel vraag-en-antwoordspel: de client stuurt een <strong>request</strong>, de server stuurt een <strong>response</strong>. Beide bestaan uit een startregel, headers en een optioneel bericht (body).</p>

        <figure class="diagram">
          <svg viewBox="0 0 480 110" role="img" aria-label="HTTP request en response tussen browser en server">
            <rect x="10" y="30" width="110" height="50" rx="6" stroke="currentColor" fill="none" />
            <text x="65" y="60" fill="currentColor" font-size="13" text-anchor="middle">Browser</text>
            <rect x="360" y="30" width="110" height="50" rx="6" stroke="currentColor" fill="none" />
            <text x="415" y="60" fill="currentColor" font-size="13" text-anchor="middle">Server</text>
            <line x1="120" y1="45" x2="360" y2="45" stroke="var(--accent)" />
            <text x="240" y="40" fill="currentColor" font-size="13" text-anchor="middle">GET /producten  (request)</text>
            <line x1="360" y1="70" x2="120" y2="70" stroke="var(--good)" />
            <text x="240" y="90" fill="currentColor" font-size="13" text-anchor="middle">200 OK + HTML  (response)</text>
          </svg>
          <figcaption>Een request gaat heen, een response komt terug.</figcaption>
        </figure>

        <h3>Methodes</h3>
        <table>
          <thead><tr><th>Methode</th><th>Betekenis</th></tr></thead>
          <tbody>
            <tr><td><code>GET</code></td><td>Haal iets op (mag geen wijzigingen maken)</td></tr>
            <tr><td><code>POST</code></td><td>Stuur gegevens in, bijv. een formulier of login</td></tr>
            <tr><td><code>PUT</code></td><td>Maak of vervang een bron</td></tr>
            <tr><td><code>DELETE</code></td><td>Verwijder een bron</td></tr>
            <tr><td><code>HEAD</code></td><td>Als GET, maar alleen de headers, geen body</td></tr>
            <tr><td><code>OPTIONS</code></td><td>Vraag welke methodes zijn toegestaan</td></tr>
          </tbody>
        </table>

        <h3>Statuscodes</h3>
        <p>De response begint met een statuscode van drie cijfers. Het eerste cijfer bepaalt de klasse:</p>
        <ul>
          <li><strong>1xx</strong> — informatief (zelden zichtbaar).</li>
          <li><strong>2xx</strong> — gelukt. <code>200 OK</code> is de klassieker.</li>
          <li><strong>3xx</strong> — omleiding. <code>301</code> (permanent verplaatst) en <code>302</code> (tijdelijk) sturen je naar een andere URL via de <code>Location</code>-header.</li>
          <li><strong>4xx</strong> — fout van de client. <code>400</code> (verkeerd verzoek), <code>401</code> (niet ingelogd), <code>403</code> (verboden, wel bekend maar geen toegang), <code>404</code> (niet gevonden).</li>
          <li><strong>5xx</strong> — fout van de server. <code>500</code> (interne fout), <code>502</code> (bad gateway), <code>503</code> (tijdelijk niet beschikbaar).</li>
        </ul>

        <div class="callout info"><strong>Onthoud het verschil:</strong> <code>401</code> betekent "ik weet niet wie je bent, log in", terwijl <code>403</code> betekent "ik weet wie je bent, maar je mag hier niet komen".</div>

        <h3>Headers</h3>
        <p>Headers zijn extra regels met informatie. Een paar belangrijke:</p>
        <ul>
          <li><code>Host</code> — welk domein je wilt (meerdere sites kunnen op één IP staan).</li>
          <li><code>User-Agent</code> — welke browser/programma je gebruikt.</li>
          <li><code>Cookie</code> / <code>Set-Cookie</code> — de client stuurt cookies mee met <code>Cookie</code>; de server zet ze met <code>Set-Cookie</code>.</li>
          <li><code>Content-Type</code> — het formaat van de body, bijv. <code>text/html</code> of <code>application/json</code>.</li>
          <li><code>Location</code> — waarheen je wordt omgeleid bij een 3xx.</li>
          <li><code>Server</code> — welke serversoftware draait, bijv. <code>nginx/1.24.0</code>.</li>
        </ul>
      `,
      questions: [
        { q: 'Welke statuscode krijg je als de pagina niet bestaat?', answer: ['404'], hint: 'De beroemdste foutcode op het web.', explain: '404 Not Found: de server kent de opgevraagde bron niet.' },
        { q: 'Je bent ingelogd maar mag een pagina niet bekijken. Welke statuscode past?', options: ['200', '301', '403', '500'], answer: 2, explain: '403 Forbidden: je identiteit is bekend, maar je hebt geen recht op deze bron. (401 zou "nog niet ingelogd" betekenen.)' },
      ],
    },

    {
      title: 'Taak 4 — Cookies, sessies en HTTPS',
      content: `
        <p>HTTP is <em>stateless</em>: elke request staat op zichzelf en de server "herinnert" zich je niet. Toch blijf je ingelogd als je door een webshop klikt. Dat komt door cookies en sessies.</p>

        <h3>Cookies</h3>
        <p>Een cookie is een klein stukje tekst dat de server via <code>Set-Cookie</code> bij jou neerlegt. Je browser bewaart het en stuurt het bij elke volgende request terug in de <code>Cookie</code>-header. Zo weet de server dat jij dezelfde bezoeker bent als net.</p>
        <pre><code>Response van de server:
Set-Cookie: session=8f2a3c; HttpOnly; Secure

Volgende request van jouw browser:
Cookie: session=8f2a3c</code></pre>
        <p>Belangrijke eigenschappen van een cookie:</p>
        <ul>
          <li><code>HttpOnly</code> — JavaScript op de pagina kan de cookie niet lezen (beschermt tegen diefstal via XSS).</li>
          <li><code>Secure</code> — de cookie wordt alleen over HTTPS verstuurd.</li>
          <li><code>Expires</code> / <code>Max-Age</code> — hoelang de cookie geldig blijft.</li>
        </ul>

        <h3>Sessies</h3>
        <p>Vaak bevat de cookie alleen een willekeurig <strong>sessie-ID</strong> (zoals <code>8f2a3c</code>). De echte gegevens (wie ben jij, ben je admin) staan veilig op de server, gekoppeld aan dat ID. Wie andermans sessie-ID steelt, kan zich voordoen als die persoon: dat heet <em>session hijacking</em>. Daarom zijn <code>HttpOnly</code> en <code>Secure</code> zo belangrijk.</p>

        <div class="callout warn"><strong>Let op:</strong> omdat de server een cookie simpelweg vertrouwt, is het soms mogelijk om een cookie zelf aan te passen (bijv. <code>role=user</code> veranderen in <code>role=admin</code>). Een goed gebouwde server laat dat niet toe; een slecht gebouwde wel. In de volgende taak probeer je dat uit in een veilig oefen-lab.</div>

        <h3>HTTPS en TLS</h3>
        <p>Gewoon HTTP stuurt alles als leesbare tekst over de lijn. Iedereen die het verkeer kan onderscheppen (bijv. op openbare wifi) leest je wachtwoord mee. HTTPS lost dat op door HTTP door een versleutelde tunnel te sturen met <strong>TLS</strong> (Transport Layer Security).</p>
        <p>TLS doet twee dingen:</p>
        <ol>
          <li><strong>Identiteit controleren.</strong> De server toont een <strong>certificaat</strong> dat is ondertekend door een vertrouwde instantie (Certificate Authority). Zo weet je browser dat je echt met <code>shop.jvt.lab</code> praat en niet met een nepsite.</li>
          <li><strong>Versleutelen.</strong> Client en server spreken via een handshake een gedeelde sleutel af. Daarna is al het verkeer onleesbaar voor meelezers.</li>
        </ol>
        <p>Het hangslotje in je browser betekent: de verbinding is versleuteld en het certificaat is geldig. Het zegt niets over of de site zelf te vertrouwen is; ook phishingsites gebruiken tegenwoordig HTTPS.</p>
      `,
      questions: [
        { q: 'Waarvoor dient het certificaat bij HTTPS?', options: ['Het versnelt de verbinding', 'Het bewijst de identiteit van de server', 'Het blokkeert cookies', 'Het bepaalt de poort'], answer: 1, explain: 'Een door een CA ondertekend certificaat laat de browser controleren dat hij echt met de juiste server praat.' },
        { q: 'Betekent een geldig hangslotje dat een website te vertrouwen is?', options: ['Ja, altijd', 'Nee, het betekent alleen dat de verbinding versleuteld is'], answer: 1, explain: 'HTTPS beschermt de verbinding, niet de bedoelingen van de site. Ook phishingsites kunnen een geldig certificaat hebben.' },
      ],
    },

    {
      title: 'Taak 5 — Zelf verzoeken sturen',
      content: `
        <p>Tijd om het echt te doen. Hieronder staat een nep-webwinkel op <code>shop.jvt.lab</code>. Je kunt zelf requests sturen: kies een methode, een pad en pas desgewenst de headers aan. De server antwoordt met een statuscode, headers en een body, precies zoals een echte server.</p>

        <h3>Je opdracht</h3>
        <ol>
          <li>Stuur eerst <code>GET /</code> om de homepage te zien.</li>
          <li>Vraag <code>GET /robots.txt</code> op. Dit bestand vertelt zoekmachines welke paden ze moeten overslaan, maar het verklapt tegelijk waar interessante pagina's staan. Lees welk pad op <code>Disallow</code> staat.</li>
          <li>Bezoek dat verborgen pad. Je krijgt waarschijnlijk <code>403 Forbidden</code>: je mag er wel heen, maar je huidige rol (<code>role=klant</code>) is niet genoeg.</li>
          <li>Pas je <code>Cookie</code>-header aan: verander <code>role=klant</code> in <code>role=admin</code> en stuur de request opnieuw. Nu krijg je de vlag.</li>
        </ol>

        <div class="callout tip"><strong>Tip:</strong> probeer ook een niet-bestaand pad zoals <code>/winkelwagen</code> om een <code>404</code> te zien, en <code>GET /oud-beheer</code> om een <code>301</code>-omleiding (via de <code>Location</code>-header) te ervaren. Zo zie je de statuscodes uit taak 3 in het echt.</div>

        <p>Dit is precies hoe een pentester een site aftast: begin bij <code>robots.txt</code>, let op statuscodes (een 403 verraadt dat er iets is) en kijk of de server te veel vertrouwt op waarden die de client zelf meestuurt, zoals een cookie. Doe dit alleen op systemen waarvoor je toestemming hebt; dit lab is van jou.</p>
      `,
      lab: {
        type: 'http',
        host: 'shop.jvt.lab',
        start: { method: 'GET', path: '/', headers: { 'Host': 'shop.jvt.lab', 'User-Agent': 'jvt-browser/1.0', 'Cookie': 'session=7fa91c; role=klant' }, body: '' },
        routes: [
          { method: 'GET', path: '/robots.txt', status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'User-agent: *\nDisallow: /intern-beheer\nDisallow: /oud-beheer\n' },
          { method: 'GET', path: '/', status: 200, headers: { 'Content-Type': 'text/html', 'Server': 'nginx/1.24.0' }, body: '<h1>JVT Webwinkel</h1><p>Welkom! Bekijk onze producten op /producten.</p>' },
          { method: 'GET', path: '/producten', status: 200, headers: { 'Content-Type': 'text/html' }, body: '<h1>Producten</h1><ul><li>USB-stick</li><li>Toetsenbord</li></ul>' },
          { method: 'GET', path: '/oud-beheer', status: 301, headers: { 'Location': '/intern-beheer' }, body: 'Deze pagina is permanent verplaatst naar /intern-beheer' },
          { method: 'GET', path: '/intern-beheer', when: [{ header: 'Cookie', contains: 'role=admin' }], status: 200, headers: { 'Content-Type': 'text/html', 'Server': 'nginx/1.24.0' }, body: '<h1>Beheerpaneel</h1><p>Welkom, admin. Je vlag: JVT{cookie_admin_toegang}</p>' },
          { method: 'GET', path: '/intern-beheer', status: 403, headers: { 'Content-Type': 'text/html' }, body: '<h1>403 Forbidden</h1><p>Je rol (klant) heeft geen toegang tot deze pagina.</p>' },
        ],
      },
      questions: [
        { q: 'Welk pad staat als eerste op Disallow in robots.txt?', answer: ['/intern-beheer', 'intern-beheer'], hint: 'Vraag GET /robots.txt op.', explain: 'robots.txt verbiedt zoekmachines /intern-beheer, maar wijst nieuwsgierige onderzoekers juist de weg.' },
        { q: 'Pas je Cookie aan naar role=admin en bezoek /intern-beheer. Wat is de vlag?', answer: ['JVT{cookie_admin_toegang}'], hint: 'De server vertrouwt blind op de role-waarde in je cookie.', explain: 'De server controleerde alleen de cookie, die de client zelf kan aanpassen: een klassieke toegangsfout.' },
        { q: 'Welke statuscode hoort bij de permanente omleiding van /oud-beheer?', options: ['200', '301', '403', '404'], answer: 1, explain: 'Een 301 is een permanente omleiding; de Location-header wijst naar de nieuwe URL.' },
      ],
    },

    {
      title: 'Taak 6 — Frontend, backend en robots.txt',
      content: `
        <p>Als afsluiter zetten we twee begrippen op hun plek en vatten we robots.txt samen, zodat je het hele plaatje scherp hebt.</p>

        <h3>Frontend versus backend</h3>
        <p>Een moderne website bestaat uit twee kanten:</p>
        <ul>
          <li><strong>Frontend</strong> — alles wat in jouw browser draait: HTML (structuur), CSS (opmaak) en JavaScript (interactie). Dit kun je altijd bekijken met "paginabron weergeven" of de ontwikkelaarstools (F12). Controles die alleen in de frontend zitten, kan een aanvaller omzeilen, want hij heeft de code in handen.</li>
          <li><strong>Backend</strong> — de serverkant die je niet ziet: de applicatiecode, de database en de bestanden op de server. Hier horen de echte beveiligingscontroles thuis (mag deze gebruiker dit wel?). De vuistregel: <em>vertrouw nooit invoer van de client</em>, want die kan alles aanpassen, zoals je in taak 5 met de cookie deed.</li>
        </ul>

        <div class="callout info"><strong>Waarom dit telt voor security:</strong> veel kwetsbaarheden ontstaan doordat een backend blind vertrouwt op iets wat de frontend meestuurt: een cookie, een verborgen formulierveld of een prijs die in JavaScript staat. Als onderzoeker kijk je altijd of de server zelf nog eens controleert.</div>

        <h3>robots.txt</h3>
        <p><code>robots.txt</code> staat in de hoofdmap van een site (<code>https://site/robots.txt</code>) en geeft zoekmachines beleefd advies: welke paden wel en niet te indexeren. Een voorbeeld:</p>
        <pre><code>User-agent: *
Disallow: /intern-beheer
Disallow: /backups
Allow: /</code></pre>
        <p>Twee dingen om te onthouden:</p>
        <ol>
          <li>Het is <strong>geen beveiliging</strong>. Het vraagt alleen vriendelijk; iedereen kan de genoemde paden gewoon bezoeken. Kwaadwillenden lezen robots.txt juist als een schatkaart.</li>
          <li>Voor een onderzoeker (met toestemming) is het een gratis tip: de <code>Disallow</code>-regels verklappen vaak beheerpagina's, back-ups of testomgevingen die beter verborgen hadden gemoeten.</li>
        </ol>

        <p>Daarmee heb je de hele reis gezien: van URL, via DNS en HTTP, door cookies en TLS, tot aan de vraag wie er nu eigenlijk mag beslissen (de backend, niet de client). In de volgende rooms duiken we dieper in Linux en Windows, de systemen waar al deze servers op draaien.</p>
      `,
      questions: [
        { q: 'Waar horen de echte beveiligingscontroles thuis?', options: ['In de frontend (browser)', 'In de backend (server)', 'In robots.txt', 'In de URL'], answer: 1, explain: 'De client kan alles aanpassen; alleen de server kan een controle afdwingen die een aanvaller niet omzeilt.' },
        { q: 'Ik begrijp dat je invoer van de client (zoals cookies) nooit blind mag vertrouwen.', noAnswer: true },
      ],
    },
  ],

  terms: [
    { term: 'URL', def: 'Uniform Resource Locator: het volledige adres van een bron op het web, opgebouwd uit schema, host, poort, pad, query en fragment.' },
    { term: 'DNS', def: 'Domain Name System: vertaalt domeinnamen (shop.jvt.lab) naar IP-adressen (10.10.20.15).' },
    { term: 'Resolver', def: 'De DNS-server (vaak van je provider of bedrijf) die namens jou een naam opzoekt en het antwoord cachet.' },
    { term: 'TTL', def: 'Time To Live: hoelang (in seconden) een DNS-antwoord gecachet mag worden voordat opnieuw gevraagd moet worden.' },
    { term: 'A-record', def: 'DNS-record dat een domeinnaam koppelt aan een IPv4-adres (AAAA doet dat voor IPv6).' },
    { term: 'HTTP', def: 'HyperText Transfer Protocol: het vraag-en-antwoordprotocol tussen browser (request) en server (response).' },
    { term: 'Statuscode', def: 'Driecijferige code in een HTTP-response; de klasse 1xx-5xx geeft aan of het gelukt is (2xx), omgeleid (3xx) of fout (4xx/5xx).' },
    { term: 'Header', def: 'Extra regel met metadata in een HTTP-bericht, zoals Host, User-Agent, Cookie, Content-Type of Location.' },
    { term: 'Cookie', def: 'Klein stukje tekst dat de server via Set-Cookie bij de client neerlegt en dat de browser bij elke request terugstuurt.' },
    { term: 'Sessie', def: 'Server-side opgeslagen gegevens over een bezoeker, gekoppeld aan een sessie-ID dat meestal in een cookie staat.' },
    { term: 'HTTPS / TLS', def: 'HTTP door een met TLS versleutelde tunnel; controleert via een certificaat de identiteit van de server en versleutelt het verkeer.' },
    { term: 'robots.txt', def: 'Bestand in de hoofdmap van een site dat zoekmachines adviseert welke paden ze mogen indexeren; geen beveiliging.' },
  ],

  resources: [
    { title: 'MDN Web Docs: HTTP', url: 'https://developer.mozilla.org/' },
    { title: 'Cloudflare Learning: DNS', url: 'https://www.cloudflare.com/learning/' },
    { title: 'TryHackMe', url: 'https://tryhackme.com/' },
  ],
});
