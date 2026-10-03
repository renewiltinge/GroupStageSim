/* Room: OWASP Top 10 (editie 2025) */
CS.registerRoom({
  id: 'owasp-top-10',
  path: 'offensief',
  order: 1,
  title: 'OWASP Top 10 (2025)',
  icon: '🕸️',
  difficulty: 'Gemiddeld',
  minutes: 70,
  summary: 'Leer de tien grootste risico\'s voor webapplicaties kennen uit de OWASP Top 10 van 2025, met per categorie een concreet voorbeeld, een maatregel en een IDOR-lab.',
  objectives: [
    'Uitleggen wat OWASP is en waarom de Top 10 een bewustwordingsdocument is en geen afvinklijst',
    'De tien categorieën van de OWASP Top 10 (2025) herkennen met per categorie een voorbeeld en een maatregel',
    'Een IDOR-kwetsbaarheid (onderdeel van Broken Access Control) uitbuiten in een veilige labomgeving',
    'Benoemen wat er in de editie 2025 is veranderd: Supply Chain Failures en Mishandling of Exceptional Conditions zijn nieuw/verschoven en SSRF valt nu onder Broken Access Control',
    'Beschrijven welke basismaatregelen de meeste webrisico\'s tegelijk beperken (least privilege, invoer valideren, veilige standaardinstellingen)',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is OWASP en wat is de Top 10?',
      content: `
        <p><strong>OWASP</strong> staat voor <em>Open Worldwide Application Security Project</em>: een wereldwijde,
        non-profit gemeenschap die gratis kennis, tools en documentatie over softwarebeveiliging maakt. Iedereen
        mag meehelpen, en alles is open en gratis te gebruiken. Je kunt OWASP zien als een soort open encyclopedie
        voor veilige software, geschreven door de mensen die er dagelijks mee werken.</p>

        <p>Het bekendste product van OWASP is de <strong>OWASP Top 10</strong>: een lijst met de tien belangrijkste
        beveiligingsrisico\'s voor webapplicaties. De lijst wordt elke paar jaar opnieuw samengesteld op basis van
        echte data (tienduizenden geteste applicaties) plus een enquête onder beveiligingsexperts. De editie die
        we hier behandelen is die van <strong>2025</strong>.</p>

        <div class="callout info">
          <strong>Belangrijk:</strong> de Top 10 is een <em>bewustwordingsdocument</em>, geen volledige checklist.
          Als je alle tien punten afvinkt, ben je niet automatisch "veilig". Zie het als de tien meest voorkomende
          valkuilen waar je in elk geval van op de hoogte moet zijn — niet als het complete recept voor veilige
          software. Voor een echte checklist bestaat de uitgebreidere <strong>OWASP ASVS</strong>
          (Application Security Verification Standard).
        </div>

        <h3>Hoe lees je zo\'n lijst?</h3>
        <p>Elke categorie heeft een code (A01 tot en met A10). A01 staat bovenaan omdat het het grootste en meest
        voorkomende risico is. De categorieën zijn vrij breed: binnen één categorie vallen vaak meerdere concrete
        kwetsbaarheden. In de volgende taken lopen we ze allemaal langs met een concreet voorbeeld en een maatregel.</p>

        <div class="callout warn">
          <strong>Ethiek vooraf:</strong> in deze room leer je hoe webkwetsbaarheden werken. Je oefent <em>alleen</em>
          in het lab van dit portaal of op systemen waarvoor je schriftelijke toestemming hebt. Een echte website
          zonder toestemming testen is in Nederland strafbaar (computervredebreuk, art. 138ab Sr). Kennis gebruik
          je om te beschermen, niet om schade te doen.
        </div>
      `,
      questions: [
        { q: 'Waar staat de afkorting OWASP voor?', options: ['Open Worldwide Application Security Project', 'Official Web Application Safety Program', 'Online Web Attack Simulation Platform'], answer: 0, explain: 'OWASP is een open, non-profit gemeenschap die gratis kennis over softwarebeveiliging deelt.' },
        { q: 'Is de OWASP Top 10 een volledige checklist voor veilige software?', options: ['Nee, het is vooral een bewustwordingsdocument', 'Ja, als je alles afvinkt ben je veilig', 'Ja, het vervangt alle andere standaarden'], answer: 0, explain: 'De Top 10 maakt je bewust van de grootste risico\'s. Voor een echte checklist bestaat OWASP ASVS.' },
        { q: 'Ik begrijp dat ik aanvalstechnieken alleen in dit lab of met schriftelijke toestemming oefen.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — A01 Broken Access Control (met IDOR-lab)',
      content: `
        <p><strong>A01 Broken Access Control</strong> staat op nummer 1 en is al jaren het grootste webrisico.
        "Access control" (toegangscontrole) bepaalt <em>wie wat mag</em>. Is die controle kapot of afwezig, dan
        kan een gebruiker dingen zien of doen die niet voor hem bedoeld zijn: data van anderen inzien, acties van
        een beheerder uitvoeren, of beveiligde pagina\'s openen.</p>

        <h3>IDOR: het klassieke voorbeeld</h3>
        <p>Een veelvoorkomende vorm is <strong>IDOR</strong> (<em>Insecure Direct Object Reference</em>, oftewel
        een onveilige directe verwijzing naar een object). De app gebruikt een id in de URL om iets op te halen,
        bijvoorbeeld <code>/bestelling?id=1001</code>, maar controleert niet of die bestelling wel van jóu is.
        Verander je het id in <code>1002</code>, dan krijg je de bestelling van een andere klant te zien. Analogie:
        een garderobe die je jas geeft zodra je een nummer noemt, zonder te controleren of dat bonnetje van jou is.</p>

        <h3>SSRF hoort hier nu ook bij</h3>
        <p>In de editie 2025 valt <strong>SSRF</strong> (<em>Server-Side Request Forgery</em>) onder Broken Access
        Control. Bij SSRF laat je de server namens jou een verzoek doen naar een adres dat jij normaal niet mag
        bereiken, bijvoorbeeld een interne dienst. Ook dat is in de kern een toegangscontroleprobleem: de server
        omzeilt een grens die er zou moeten zijn.</p>

        <h3>Maatregelen</h3>
        <ul>
          <li><strong>Controleer bij elke actie</strong> of de ingelogde gebruiker dit specifieke object mag zien
          (eigenaarschapscontrole op de server, niet alleen in de interface).</li>
          <li><strong>Standaard weigeren</strong> (deny by default): alleen expliciet toegestane dingen mogen.</li>
          <li><strong>Gebruik moeilijk te raden verwijzingen</strong> waar nuttig, maar leun daar niet op als enige
          verdediging — de echte oplossing is de controle op de server.</li>
        </ul>

        <div class="callout tip">
          <strong>Lab:</strong> hieronder staat de nep-webwinkel <code>shop.jvt.lab</code>. Je bent ingelogd als
          klant 1001. Het verzoek begint op <code>/bestelling?id=1001</code> — dat is je eigen bestelling. Verander
          nu het id in het pad naar <code>/bestelling?id=1002</code> en verstuur het verzoek. Je ziet dan de
          bestelling van een andere klant, inclusief een interne notitie met een vlag. De winkel controleert nergens
          of de bestelling wel van jou is: dat is de IDOR-fout.
        </div>
      `,
      lab: {
        type: 'http',
        host: 'shop.jvt.lab',
        start: { method: 'GET', path: '/bestelling?id=1001', headers: { 'Cookie': 'session=7b2f9c; klant=1001; role=user' }, body: '' },
        routes: [
          { method: 'GET', path: '/', status: 200, headers: { 'Content-Type': 'text/html' }, body: 'Welkom bij shop.jvt.lab\n\nJe bestellingen staan onder /bestelling?id=<nummer>\nProbeer: /bestelling?id=1001' },
          { method: 'GET', path: '/bestelling?id=1001', status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'Bestelling 1001\nKlant: Jan Jansen (klant 1001 - dit ben jij)\nArtikel: USB-stick 64GB\nTotaal: EUR 12,95\nStatus: verzonden' },
          { method: 'GET', path: '/bestelling?id=1002', status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'Bestelling 1002\nKlant: Fatima El Amrani (klant 1002)\nArtikel: Mechanisch toetsenbord\nTotaal: EUR 89,00\nStatus: in behandeling\nInterne notitie: JVT{idor_andermans_bestelling}' },
          { method: 'GET', path: '/bestelling?id=1003', status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'Bestelling 1003\nKlant: Pieter de Vries (klant 1003)\nArtikel: Webcam 1080p\nTotaal: EUR 34,50\nStatus: geannuleerd' },
          { method: 'GET', path: '/robots.txt', status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'User-agent: *\nDisallow: /beheer' },
        ],
      },
      questions: [
        { q: 'Verander het id in het pad naar 1002. Welke vlag staat in de interne notitie van die bestelling?', answer: ['JVT{idor_andermans_bestelling}'], hint: 'Zet in het padveld /bestelling?id=1002 en verstuur het verzoek.', explain: 'De winkel controleert niet of de bestelling van jou is. Zo kun je andermans gegevens inzien: dat is IDOR.' },
        { q: 'Waar staat IDOR voor?', options: ['Insecure Direct Object Reference', 'Internal Data Output Request', 'Identity Defense Over Roles'], answer: 0, explain: 'Een onveilige directe verwijzing naar een object: je verwijst rechtstreeks naar data zonder dat de server je rechten controleert.' },
        { q: 'Onder welke OWASP-categorie valt SSRF in de editie 2025?', options: ['Broken Access Control', 'Cryptographic Failures', 'Injection'], answer: 0, explain: 'SSRF (Server-Side Request Forgery) is in 2025 ondergebracht bij A01 Broken Access Control.' },
        { q: 'Wat is de belangrijkste maatregel tegen IDOR?', options: ['Op de server controleren of de gebruiker dit specifieke object mag zien', 'De id onzichtbaar maken in de interface', 'De id langer maken'], answer: 0, explain: 'De echte oplossing is een eigenaarschapscontrole op de server bij elke actie, niet alleen iets verbergen.' },
      ],
    },

    {
      title: 'Taak 3 — A02 Security Misconfiguration & A03 Software Supply Chain Failures',
      content: `
        <h3>A02 Security Misconfiguration</h3>
        <p>Dit gaat over onveilige <strong>instellingen</strong>. De software zelf is misschien prima, maar hij
        staat verkeerd ingesteld: standaardwachtwoorden die nooit zijn gewijzigd, uitgebreide foutmeldingen die
        interne details lekken, een beheerpaneel dat open op internet staat, onnodige functies die aan staan, of
        mappen die per ongeluk toegankelijk zijn (bijvoorbeeld een zichtbare <code>.git</code>-map of een
        backupbestand). Analogie: een gloednieuw, stevig slot op je voordeur, maar de sleutel ligt onder de mat.</p>
        <p><strong>Voorbeeld:</strong> een testserver van <code>shop.jvt.lab</code> gaat live met de ingebouwde
        beheerder <code>admin/admin</code> en met gedetailleerde foutmeldingen aan. Een aanvaller logt in met het
        standaardwachtwoord en leest in een foutmelding zo de databasestructuur af.</p>
        <p><strong>Maatregel:</strong> werk met veilige standaardinstellingen (secure defaults), verwijder wat je
        niet gebruikt, zet uitgebreide foutmeldingen uit in productie, en leg je configuratie vast zodat elke
        omgeving hetzelfde en gecontroleerd wordt opgezet (hardening).</p>

        <h3>A03 Software Supply Chain Failures (nieuw/verschoven)</h3>
        <p>Dit is een <strong>nieuwe, bredere categorie</strong> in 2025 (voortgekomen uit het eerdere
        "Vulnerable and Outdated Components"). Moderne software bouw je niet helemaal zelf: je gebruikt tientallen
        tot honderden externe bibliotheken, frameworks en bouwtools. Je <em>toeleveringsketen</em> (supply chain)
        is alles wat je code binnenkomt van buiten. Zit daar ergens een lek of een kwaadaardige update in, dan erft
        jouw applicatie dat probleem — ook al heb jij geen fout gemaakt.</p>
        <p><strong>Voorbeeld:</strong> je app gebruikt een populaire logging-bibliotheek. Er wordt een ernstig lek
        in gevonden, maar jij draait nog een oude versie. Of: een onderhouder van een klein pakketje wordt gehackt
        en er wordt stiekem schadelijke code in een update gestopt, die jij automatisch binnenhaalt.</p>
        <p><strong>Maatregel:</strong> houd een <strong>SBOM</strong> bij (Software Bill of Materials — een
        complete inventaris van alles wat je gebruikt), scan je afhankelijkheden automatisch op bekende
        kwetsbaarheden (CVE\'s), werk tijdig bij, en haal pakketten alleen uit vertrouwde bronnen met vastgezette
        versies.</p>

        <div class="callout info">
          <strong>Waarom nieuw?</strong> Grote incidenten (zoals aanvallen via gecompromitteerde updates en lekken
          in veelgebruikte bibliotheken) lieten zien dat de keten zélf een hoofddoelwit is geworden. Daarom kreeg
          dit onderwerp in 2025 een eigen, hogere plek in de lijst.
        </div>
      `,
      questions: [
        { q: 'Welke van deze voorbeelden is een Security Misconfiguration?', options: ['Een beheerpaneel dat met standaardwachtwoord admin/admin op internet staat', 'Een gebruiker met een sterk, uniek wachtwoord', 'Een correct ingesteld TLS-certificaat'], answer: 0, explain: 'Niet-gewijzigde standaardinstellingen en open beheerpanelen zijn klassieke misconfiguraties.' },
        { q: 'Wat is een SBOM?', options: ['Een Software Bill of Materials: een inventaris van alle gebruikte componenten', 'Een soort firewall', 'Een wachtwoordkluis'], answer: 0, explain: 'Een SBOM lijst al je afhankelijkheden op, zodat je weet waar je moet bijwerken als er een lek bekend wordt.' },
        { q: 'Waarom is Software Supply Chain Failures in 2025 een belangrijker, apart risico geworden?', options: ['Omdat aanvallers steeds vaker de externe componenten en updates zelf aanvallen', 'Omdat software minder bibliotheken gebruikt dan vroeger', 'Omdat het niets met beveiliging te maken heeft'], answer: 0, explain: 'De keten (bibliotheken, build-tools, updates) is zelf een geliefd doelwit geworden.' },
        { q: 'Noem de maatregel waarmee je snel weet welke bibliotheken je gebruikt, zodat je gericht kunt bijwerken.', answer: ['SBOM', 'sbom', 'software bill of materials'], hint: 'Het is een inventarislijst van al je componenten.', explain: 'Met een actuele SBOM zie je meteen of je een kwetsbare versie van een component draait.' },
      ],
    },

    {
      title: 'Taak 4 — A04 Cryptographic Failures & A05 Injection',
      content: `
        <h3>A04 Cryptographic Failures</h3>
        <p>Dit gaat over fouten rond versleuteling en gevoelige gegevens. Niet alleen "verkeerde wiskunde", maar
        vooral de praktische fouten: gevoelige data (wachtwoorden, burgerservicenummers, betaalgegevens) die
        onversleuteld wordt opgeslagen of verstuurd, verouderde algoritmen (zoals MD5 of SHA-1 voor wachtwoorden),
        of verkeerd omgaan met sleutels.</p>
        <p><strong>Voorbeeld:</strong> een webshop verstuurt een inlogformulier over gewoon <code>http</code> in
        plaats van <code>https</code>. Iemand op hetzelfde wifi-netwerk leest de wachtwoorden rechtstreeks mee.</p>
        <p><strong>Maatregel:</strong> gebruik overal TLS (HTTPS), versleutel gevoelige data ook in opslag, en hash
        wachtwoorden met een moderne, langzame functie (bcrypt, scrypt of Argon2) met een unieke salt per gebruiker.</p>

        <h3>A05 Injection</h3>
        <p><strong>Injection</strong> (injectie) is misschien wel de beroemdste klasse webkwetsbaarheden. Het gebeurt
        wanneer invoer van een gebruiker wordt vermengd met een commando of query, zodat de aanvaller stiekem
        extra instructies "injecteert". De bekendste vorm is <strong>SQL-injectie</strong> (waar een hele aparte
        room over gaat), maar ook commando-injectie en — in 2025 nog steeds hier ondergebracht — veel vormen van
        <strong>XSS</strong> (cross-site scripting) horen in deze familie.</p>
        <p><strong>Voorbeeld:</strong> een zoekveld plakt jouw tekst rechtstreeks in een databasequery. Typ je
        <code>' OR '1'='1</code>, dan verander je de betekenis van de query en krijg je resultaten te zien die niet
        voor jou bedoeld zijn.</p>
        <p><strong>Maatregel:</strong> meng invoer nooit rechtstreeks met code. Gebruik <strong>geparametriseerde
        queries</strong> (prepared statements), zodat invoer altijd als dom gegeven wordt behandeld en nooit als
        instructie. Valideer en saneer invoer, en beperk wat de app mag doen (least privilege).</p>

        <div class="callout warn">
          <strong>Onthoud het principe:</strong> bijna alle injectie ontstaat doordat <em>data</em> en
          <em>code</em> door elkaar lopen. Houd je die strikt gescheiden, dan verdwijnt het probleem grotendeels.
        </div>
      `,
      questions: [
        { q: 'Een inlogformulier wordt over http in plaats van https verstuurd. Onder welke categorie valt dit?', options: ['Cryptographic Failures', 'Injection', 'Security Logging & Alerting Failures'], answer: 0, explain: 'Gevoelige data onversleuteld versturen is een klassiek voorbeeld van Cryptographic Failures.' },
        { q: 'Wat is de kern van elke injectie-kwetsbaarheid?', options: ['Invoer (data) loopt door elkaar met code/instructies', 'Het wachtwoord is te kort', 'De server staat in een ander land'], answer: 0, explain: 'Als data als instructie wordt uitgevoerd, kan een aanvaller de betekenis van een commando veranderen.' },
        { q: 'Met welke techniek voorkom je SQL-injectie het beste?', answer: ['prepared statements', 'geparametriseerde queries', 'prepared statement'], hint: 'Invoer wordt dan altijd als data behandeld, nooit als code.', explain: 'Geparametriseerde queries (prepared statements) scheiden data en code strikt.' },
        { q: 'Welke klassieke injectie-invoer verandert de betekenis van een query?', options: ["' OR '1'='1", 'HTTPS://', 'admin@admin'], answer: 0, explain: "Met ' OR '1'='1 maak je de voorwaarde altijd waar, een klassieke SQL-injectie." },
      ],
    },

    {
      title: 'Taak 5 — A06 Insecure Design & A07 Authentication Failures',
      content: `
        <h3>A06 Insecure Design</h3>
        <p>Niet elke kwetsbaarheid is een <em>bug</em> in de code. Soms is het <strong>ontwerp</strong> zelf fout:
        er is nooit nagedacht over wat er mis kan gaan. Je kunt zo\'n ontwerpfout niet "wegpatchen", want de code
        doet precies wat bedoeld was — alleen was het idee onveilig. Analogie: een bank die geld uitbetaalt zonder
        ooit het saldo te controleren. Dat is geen typefout, dat is een verkeerd plan.</p>
        <p><strong>Voorbeeld:</strong> een "wachtwoord vergeten"-functie die alleen om je geboortedatum vraagt om
        je account te resetten. De code werkt foutloos, maar het ontwerp is onveilig: geboortedata zijn makkelijk
        te vinden.</p>
        <p><strong>Maatregel:</strong> denk al tijdens het ontwerp na over misbruik (<em>threat modeling</em>:
        "hoe zou een aanvaller dit misbruiken?"), bouw veilige standaardpatronen in, en gebruik beproefde ontwerpen
        in plaats van zelf iets te verzinnen.</p>

        <h3>A07 Authentication Failures</h3>
        <p>Dit gaat over fouten in het <strong>vaststellen wie iemand is</strong> (authenticatie). Denk aan: zwakke
        wachtwoorden toestaan, onbeperkt mogen blijven proberen (geen bescherming tegen brute force), sessietokens
        die niet verlopen of te raden zijn, of geen meervoudige verificatie (MFA) bieden.</p>
        <p><strong>Voorbeeld:</strong> een inlogpagina laat onbeperkt pogingen toe. Een aanvaller probeert
        automatisch duizenden veelgebruikte wachtwoorden tot er een past (een <em>brute-force</em>- of
        <em>credential-stuffing</em>-aanval met gelekte wachtwoorden).</p>
        <p><strong>Maatregel:</strong> dwing sterke wachtwoorden af, bied <strong>MFA</strong> aan, beperk en
        vertraag mislukte pogingen (rate limiting), beheer sessies veilig (korte levensduur, netjes uitloggen) en
        controleer wachtwoorden tegen lijsten met bekende gelekte wachtwoorden.</p>

        <div class="callout tip">
          <strong>Tip:</strong> het verschil tussen A06 en A07 is handig om te onthouden. A06 (Insecure Design)
          gaat over een fout <em>plan</em>; A07 (Authentication Failures) gaat specifiek over fouten in het
          <em>inlogproces</em>.
        </div>
      `,
      questions: [
        { q: 'Een accountherstel vraagt alleen om je geboortedatum. De code werkt perfect, maar het is onveilig. Welke categorie?', options: ['Insecure Design', 'Cryptographic Failures', 'Security Misconfiguration'], answer: 0, explain: 'Het ontwerp zelf is onveilig bedacht; dat is geen bug maar een ontwerpfout (A06).' },
        { q: 'Hoe heet het nadenken over misbruik tijdens het ontwerp ("hoe zou een aanvaller dit misbruiken?")?', answer: ['threat modeling', 'threatmodeling', 'dreigingsmodellering'], hint: 'In het Engels: "threat ..."', explain: 'Met threat modeling bedenk je vooraf hoe iets misbruikt kan worden en ontwerp je daartegen.' },
        { q: 'Een inlogpagina staat onbeperkt veel pogingen toe. Welke categorie en welke maatregel passen?', options: ['Authentication Failures; rate limiting en MFA', 'Injection; prepared statements', 'Cryptographic Failures; TLS'], answer: 0, explain: 'Onbeperkt proberen hoort bij A07; beperk pogingen (rate limiting) en bied MFA aan.' },
        { q: 'Waar staat de afkorting MFA voor?', options: ['Multi-Factor Authentication (meervoudige verificatie)', 'Main Firewall Access', 'Managed File Archive'], answer: 0, explain: 'MFA voegt een extra factor toe naast het wachtwoord, zoals een code of een app.' },
      ],
    },

    {
      title: 'Taak 6 — A08 Integrity Failures, A09 Logging & Alerting Failures, A10 Mishandling of Exceptional Conditions',
      content: `
        <h3>A08 Software or Data Integrity Failures</h3>
        <p><strong>Integriteit</strong> betekent dat gegevens of software niet ongemerkt zijn gewijzigd. Deze
        categorie gaat over het <em>blind vertrouwen</em> op code, updates of data zonder te controleren of ze
        echt onveranderd en van de juiste bron zijn.</p>
        <p><strong>Voorbeeld:</strong> een app haalt automatisch een update op van een server zonder de digitale
        handtekening te controleren. Een aanvaller zet er een valse update neer, en de app installeert die klakkeloos.</p>
        <p><strong>Maatregel:</strong> controleer digitale handtekeningen en hashes van updates en componenten,
        haal code alleen uit vertrouwde bronnen, en bescherm je build- en deploystraat (CI/CD).</p>

        <h3>A09 Security Logging & Alerting Failures</h3>
        <p>Als je niet <strong>logt</strong> wat er gebeurt en niet <strong>alarmeert</strong> bij iets verdachts,
        merk je een aanval veel te laat of helemaal niet. Onderzoek wijst keer op keer uit dat inbraken vaak pas na
        weken of maanden worden ontdekt — meestal door een buitenstaander.</p>
        <p><strong>Voorbeeld:</strong> honderden mislukte inlogpogingen op het beheerdersaccount worden nergens
        vastgelegd en niemand krijgt een melding. De aanvaller heeft alle tijd van de wereld.</p>
        <p><strong>Maatregel:</strong> log beveiligingsrelevante gebeurtenissen (inloggen, mislukte pogingen,
        rechtenwijzigingen), bescherm die logs tegen manipulatie, en stel <strong>alerts</strong> in zodat iemand
        echt gewaarschuwd wordt. Log nooit gevoelige data zoals wachtwoorden in platte tekst.</p>

        <h3>A10 Mishandling of Exceptional Conditions (nieuw)</h3>
        <p>Dit is een <strong>nieuwe categorie</strong> in 2025. Het gaat over hoe een applicatie reageert op
        <em>uitzonderlijke situaties</em>: fouten, onverwachte invoer, time-outs en crashes. Verkeerd omgaan met
        zulke momenten leidt tot beveiligingsproblemen — denk aan een foutmelding die interne details prijsgeeft,
        of een systeem dat bij een fout per ongeluk toegang <em>toestaat</em> in plaats van weigert (een fout die
        de verkeerde kant op "faalt").</p>
        <p><strong>Voorbeeld:</strong> de controle of iemand mag inloggen gooit een onverwachte fout, en de code
        behandelt die fout als "ga maar door" (fail-open). De gebruiker is zo per ongeluk ingelogd.</p>
        <p><strong>Maatregel:</strong> vang fouten netjes af, kies altijd voor <strong>fail-safe / fail-closed</strong>
        (bij twijfel weigeren), en toon de gebruiker nette foutmeldingen zonder interne details terwijl je de
        details wél naar je (beschermde) logs schrijft.</p>

        <div class="callout info">
          <strong>Wat veranderde er in 2025?</strong> Supply Chain Failures (A03) en Mishandling of Exceptional
          Conditions (A10) zijn de grote nieuwkomers/verschuivingen, en SSRF is verhuisd naar Broken Access Control.
          De lijst volgt zo de echte dreigingen van dit moment.
        </div>
      `,
      questions: [
        { q: 'Een app installeert automatische updates zonder de digitale handtekening te controleren. Welke categorie?', options: ['Software or Data Integrity Failures', 'Authentication Failures', 'Injection'], answer: 0, explain: 'Blind vertrouwen op ongecontroleerde code/updates valt onder A08 Integrity Failures.' },
        { q: 'Honderden mislukte inlogpogingen worden nergens vastgelegd en niemand krijgt een melding. Welke categorie?', options: ['Security Logging & Alerting Failures', 'Cryptographic Failures', 'Insecure Design'], answer: 0, explain: 'Zonder logging en alerting ontdek je aanvallen veel te laat (A09).' },
        { q: 'Een foutafhandeling laat bij een onverwachte fout de gebruiker tóch binnen (fail-open). Welke nieuwe 2025-categorie is dit?', options: ['Mishandling of Exceptional Conditions', 'Broken Access Control', 'Security Misconfiguration'], answer: 0, explain: 'A10 gaat over verkeerd omgaan met fouten en uitzonderingen; fail-open is hier een klassiek voorbeeld.' },
        { q: 'Wat is bij foutafhandeling de veilige keuze als je twijfelt?', options: ['Fail-closed: bij twijfel toegang weigeren', 'Fail-open: bij twijfel toegang toestaan', 'De fout negeren'], answer: 0, explain: 'Fail-safe / fail-closed weigert bij twijfel, zodat een fout niet per ongeluk toegang geeft.' },
      ],
    },

    {
      title: 'Taak 7 — Samenvatting, rode draad en ethiek',
      content: `
        <p>Je hebt nu alle tien categorieën van de OWASP Top 10 (2025) gezien. Even het complete overzicht op een rij:</p>
        <table>
          <thead><tr><th>Code</th><th>Categorie</th></tr></thead>
          <tbody>
            <tr><td>A01</td><td>Broken Access Control (nu inclusief SSRF)</td></tr>
            <tr><td>A02</td><td>Security Misconfiguration</td></tr>
            <tr><td>A03</td><td>Software Supply Chain Failures (nieuw/verschoven)</td></tr>
            <tr><td>A04</td><td>Cryptographic Failures</td></tr>
            <tr><td>A05</td><td>Injection</td></tr>
            <tr><td>A06</td><td>Insecure Design</td></tr>
            <tr><td>A07</td><td>Authentication Failures</td></tr>
            <tr><td>A08</td><td>Software or Data Integrity Failures</td></tr>
            <tr><td>A09</td><td>Security Logging &amp; Alerting Failures</td></tr>
            <tr><td>A10</td><td>Mishandling of Exceptional Conditions (nieuw)</td></tr>
          </tbody>
        </table>

        <h3>De rode draad</h3>
        <p>Als je goed kijkt, komen een paar principes telkens terug. Beheers je deze, dan dek je een groot deel
        van de Top 10 tegelijk af:</p>
        <ul>
          <li><strong>Vertrouw nooit invoer</strong> en houd data en code strikt gescheiden (tegen injectie).</li>
          <li><strong>Controleer rechten op de server</strong> bij elke actie (tegen broken access control).</li>
          <li><strong>Standaard weigeren en veilig falen</strong> (deny by default, fail-closed).</li>
          <li><strong>Least privilege:</strong> geef elk onderdeel zo min mogelijk rechten.</li>
          <li><strong>Houd je spullen bij:</strong> ken je componenten (SBOM), werk bij en controleer herkomst.</li>
          <li><strong>Log en alarmeer</strong> zodat je aanvallen op tijd ziet.</li>
        </ul>

        <div class="callout danger">
          <strong>Ethiek en recht:</strong> alle technieken uit deze room oefen je uitsluitend in dit lab of op
          systemen waarvoor je uitdrukkelijke, schriftelijke toestemming hebt. Ongeautoriseerd binnendringen of
          testen is in Nederland strafbaar als computervredebreuk (art. 138ab Sr). Vind je per ongeluk een echt lek?
          Meld het verantwoord via <em>Coordinated Vulnerability Disclosure</em> (CVD) bij de eigenaar of het NCSC,
          en misbruik het niet. Zo blijf je aan de goede kant van de streep en help je het internet veiliger maken.
        </div>
      `,
      questions: [
        { q: 'Welke categorie staat op nummer 1 (A01) van de OWASP Top 10 2025?', answer: ['Broken Access Control', 'broken access control'], hint: 'Het gaat over wie wat mag; IDOR en SSRF vallen eronder.', explain: 'Broken Access Control is al jaren het grootste webrisico en staat op A01.' },
        { q: 'Welk principe dekt het grootste deel van injectie-problemen af?', options: ['Data en code strikt gescheiden houden', 'Langere wachtwoorden', 'Meer servers gebruiken'], answer: 0, explain: 'Als invoer nooit als instructie wordt uitgevoerd, verdwijnt het grootste deel van de injectierisico\'s.' },
        { q: 'Wat doe je als je per ongeluk een echt lek in een website van een ander vindt?', options: ['Verantwoord melden via CVD bij de eigenaar of het NCSC, en niet misbruiken', 'Het lek zelf uitbuiten om te bewijzen dat het werkt', 'Het online zetten voor iedereen'], answer: 0, explain: 'Responsible disclosure / CVD: meld het netjes en misbruik het niet. Ongeautoriseerd misbruik is strafbaar.' },
        { q: 'Ik kan de tien categorieën van de OWASP Top 10 2025 benoemen en weet dat ik technieken alleen ethisch en legaal toepas.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'OWASP', def: 'Open Worldwide Application Security Project: een open, non-profit gemeenschap die gratis kennis en tools over softwarebeveiliging deelt.' },
    { term: 'OWASP Top 10', def: 'Bewustwordingsdocument met de tien belangrijkste beveiligingsrisico\'s voor webapplicaties; geen volledige checklist.' },
    { term: 'Broken Access Control', def: 'A01: toegangscontrole is kapot of afwezig, waardoor gebruikers dingen kunnen zien of doen die niet voor hen bedoeld zijn.' },
    { term: 'IDOR', def: 'Insecure Direct Object Reference: rechtstreeks verwijzen naar een object (bijv. een id in de URL) zonder dat de server je rechten controleert.' },
    { term: 'SSRF', def: 'Server-Side Request Forgery: de server namens jou een verzoek laten doen naar een adres dat je zelf niet mag bereiken; in 2025 onder Broken Access Control.' },
    { term: 'Security Misconfiguration', def: 'A02: onveilige instellingen zoals standaardwachtwoorden, open beheerpanelen of te uitgebreide foutmeldingen.' },
    { term: 'Software Supply Chain Failures', def: 'A03 (nieuw/verschoven): risico\'s door externe bibliotheken, componenten en updates die je code binnenkomen.' },
    { term: 'SBOM', def: 'Software Bill of Materials: een inventaris van alle componenten en bibliotheken die je software gebruikt.' },
    { term: 'Cryptographic Failures', def: 'A04: fouten rond versleuteling en gevoelige data, zoals onversleuteld versturen of verouderde algoritmen gebruiken.' },
    { term: 'Injection', def: 'A05: invoer die wordt vermengd met code/commando\'s, zodat een aanvaller extra instructies injecteert (bijv. SQL-injectie, XSS).' },
    { term: 'Insecure Design', def: 'A06: het ontwerp zelf is onveilig bedacht; geen bug in de code maar een fout plan. Tegengif: threat modeling.' },
    { term: 'Authentication Failures', def: 'A07: fouten in het inlogproces, zoals zwakke wachtwoorden toestaan, geen rate limiting of geen MFA.' },
    { term: 'Integrity Failures', def: 'A08: blind vertrouwen op code, updates of data zonder te controleren of ze onveranderd en van de juiste bron zijn.' },
    { term: 'Mishandling of Exceptional Conditions', def: 'A10 (nieuw): verkeerd omgaan met fouten en uitzonderingen, zoals fail-open of foutmeldingen die details lekken.' },
  ],
  resources: [
    { title: 'OWASP Top Ten (officiële projectpagina)', url: 'https://owasp.org/www-project-top-ten/' },
    { title: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/' },
    { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security' },
    { title: 'NCSC (Nederland)', url: 'https://www.ncsc.nl/' },
  ],
});
