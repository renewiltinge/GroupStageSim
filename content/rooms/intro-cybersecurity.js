/* Room: Welkom in cybersecurity */
CS.registerRoom({
  id: 'intro-cybersecurity',
  path: 'fundamenten',
  order: 1,
  title: 'Welkom in cybersecurity',
  icon: '🛡️',
  difficulty: 'Makkelijk',
  minutes: 55,
  summary: 'Wat cybersecurity is, waarom het ertoe doet, de kernbegrippen (CIA, AAA, risico), wie de aanvallers zijn, welke rollen er bestaan en hoe je hier veilig en legaal leert.',
  objectives: [
    'Uitleggen wat cybersecurity is en waarom het voor organisaties en jezelf belangrijk is',
    'De CIA-triade, authenticiteit en onweerlegbaarheid benoemen en met voorbeelden uitleggen',
    'Het verschil tussen dreiging, kwetsbaarheid en risico beschrijven',
    'De belangrijkste soorten dreigingsactoren en hun motieven herkennen',
    'Veelvoorkomende rollen en loopbanen in security benoemen',
    'De ethische en wettelijke regels in Nederland toepassen (toestemming, 138ab Sr, CVD)',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is cybersecurity en waarom het ertoe doet',
      content: `
        <p><strong>Cybersecurity</strong> (informatiebeveiliging) is alles wat je doet om computers, netwerken,
        apparaten en gegevens te beschermen tegen misbruik, diefstal en uitval. Denk aan het beveiligen van een huis:
        je zet sloten op de deuren (toegangscontrole), hangt camera's op (monitoring), sluit een verzekering af
        (back-ups) en je oefent wat je doet bij inbraak (incident response). Digitaal is het precies zo, alleen zijn
        de "deuren" netwerkpoorten, inlogschermen en software.</p>

        <p>Waarom is dit belangrijk? Vrijwel alles draait tegenwoordig op software: je bank, het ziekenhuis, de
        waterzuivering, je werkgever. Als zo'n systeem plat ligt of gegevens uitlekken, kost dat geld, vertrouwen en
        soms mensenlevens. Een paar <em>echte</em>, gedocumenteerde voorbeelden:</p>
        <ul>
          <li><strong>Universiteit Maastricht (december 2019)</strong>: een ransomware-aanval legde de hele
            universiteit lam vlak voor de kerst. De universiteit betaalde losgeld (enkele tientallen bitcoins) om weer
            toegang tot de eigen bestanden te krijgen.</li>
          <li><strong>DigiNotar (2011)</strong>: bij dit Nederlandse bedrijf dat digitale certificaten uitgaf werd
            ingebroken, waarna valse certificaten werden gemaakt. Het vertrouwen was weg en het bedrijf ging failliet.</li>
          <li><strong>WannaCry (2017)</strong>: een ransomware-worm verspreidde zich wereldwijd en raakte onder meer
            ziekenhuizen in het Verenigd Koninkrijk.</li>
          <li><strong>Log4Shell (2021)</strong>: een kwetsbaarheid in de veelgebruikte softwarebibliotheek Log4j
            waardoor aanvallers op talloze servers code konden uitvoeren.</li>
        </ul>

        <div class="callout info">
          <p><strong>Let op:</strong> dit zijn bestaande, publiek beschreven incidenten. In deze cursus verzinnen we
          nooit "nepnieuws" en presenteren we geen fictieve aanval als echt gebeurd. Oefenverhalen zijn altijd duidelijk
          als oefening herkenbaar (fictieve bedrijven zoals "NederBank").</p>
        </div>

        <p>Cybersecurity gaat niet alleen over hackers die inbreken. Het gaat net zo goed over een stagiair die per
        ongeluk een verkeerd bestand deelt, een harde schijf die stuk gaat, of een leverancier die zijn beveiliging
        niet op orde heeft. Goede beveiliging is dus techniek <em>en</em> mensen <em>en</em> processen samen.</p>

        <p>In Nederland speelt het <strong>NCSC</strong> (Nationaal Cyber Security Centrum) een centrale rol: het
        waarschuwt organisaties, deelt kennis en coördineert bij grote incidenten. Sinds de invoering van Europese
        regels (NIS2, in Nederland de Cyberbeveiligingswet) moeten steeds meer organisaties hun beveiliging aantoonbaar
        op orde hebben en incidenten melden.</p>
      `,
      questions: [
        {
          q: 'Welke omschrijving past het best bij cybersecurity?',
          options: [
            'Alleen het installeren van antivirussoftware op laptops',
            'Het beschermen van systemen, netwerken en gegevens tegen misbruik, diefstal en uitval, met techniek, mensen en processen',
            'Het bouwen van zo snel mogelijke websites',
          ],
          answer: 1,
          explain: 'Cybersecurity is breder dan techniek alleen: het combineert techniek, mensen en processen om vertrouwelijkheid, integriteit en beschikbaarheid te waarborgen.',
        },
        {
          q: 'Ik begrijp waarom cybersecurity voor een organisatie belangrijk is.',
          noAnswer: true,
        },
      ],
    },

    {
      title: 'Taak 2 — De bouwstenen: CIA-triade, authenticiteit, onweerlegbaarheid en AAA',
      content: `
        <p>Om over beveiliging te praten hebben we een kompas nodig. Het bekendste model is de <strong>CIA-triade</strong>.
        Die heeft niets met de geheime dienst te maken; het staat voor drie eigenschappen die je van informatie wilt
        beschermen:</p>
        <ul>
          <li><strong>Vertrouwelijkheid (Confidentiality)</strong>: alleen wie het mag zien, ziet de gegevens.
            Voorbeeld: je medisch dossier is niet in te zien voor je buurman. Technieken: versleuteling, toegangsrechten,
            wachtwoorden.</li>
          <li><strong>Integriteit (Integrity)</strong>: de gegevens kloppen en zijn niet ongemerkt gewijzigd.
            Voorbeeld: het bedrag op je bankoverschrijving is niet onderweg veranderd. Technieken: hashes,
            digitale handtekeningen, versiebeheer.</li>
          <li><strong>Beschikbaarheid (Availability)</strong>: het systeem werkt wanneer je het nodig hebt.
            Voorbeeld: de webshop ligt niet plat tijdens een uitverkoop. Technieken: back-ups, redundantie,
            bescherming tegen DDoS.</li>
        </ul>

        <figure class="diagram">
          <svg viewBox="0 0 320 210" role="img" aria-label="CIA-triade">
            <polygon points="160,20 290,185 30,185" fill="var(--surface-2)" stroke="currentColor" stroke-width="1.5" />
            <text x="160" y="14" text-anchor="middle" fill="currentColor" font-size="13">Vertrouwelijkheid</text>
            <text x="26" y="200" text-anchor="start" fill="currentColor" font-size="13">Integriteit</text>
            <text x="294" y="200" text-anchor="end" fill="currentColor" font-size="13">Beschikbaarheid</text>
            <text x="160" y="120" text-anchor="middle" fill="currentColor" font-size="13">CIA</text>
          </svg>
          <figcaption>De drie pijlers die je samen in balans wilt houden.</figcaption>
        </figure>

        <p>De triade is een goed begin, maar in de praktijk voegen we er vaak twee eigenschappen aan toe:</p>
        <ul>
          <li><strong>Authenticiteit (Authenticity)</strong>: is iemand of iets echt wie/wat het beweert te zijn?
            Een inlog met je wachtwoord plus een code uit een app bewijst beter dat jij het echt bent.</li>
          <li><strong>Onweerlegbaarheid (non-repudiation)</strong>: achteraf kan iemand niet ontkennen dat hij een
            actie heeft uitgevoerd. Een digitale handtekening op een contract zorgt daarvoor, net als een goed logbestand.</li>
        </ul>

        <p>Een tweede handig model gaat over toegang: <strong>AAA</strong>.</p>
        <ul>
          <li><strong>Authentication (authenticatie)</strong>: bewijzen wie je bent (bijvoorbeeld inloggen).</li>
          <li><strong>Authorization (autorisatie)</strong>: bepalen wat je mag (mag je alleen lezen, of ook verwijderen?).</li>
          <li><strong>Accounting (vastlegging)</strong>: bijhouden wat er is gebeurd (logboeken: wie deed wat, wanneer?).</li>
        </ul>

        <div class="callout tip">
          <p><strong>Ezelsbruggetje:</strong> authenticatie = "wie ben jij?", autorisatie = "wat mag jij?",
          accounting = "wat heb je gedaan?".</p>
        </div>
      `,
      questions: [
        {
          q: 'Welke eigenschap van de CIA-triade gaat over het geheimhouden van gegevens voor onbevoegden?',
          answer: ['vertrouwelijkheid', 'confidentiality'],
          hint: 'De C in CIA.',
          explain: 'Vertrouwelijkheid (Confidentiality) zorgt dat alleen bevoegden de gegevens kunnen zien.',
        },
        {
          q: 'Een aanvaller verandert stiekem het rekeningnummer in een factuur. Welke eigenschap is hier geschonden?',
          options: ['Vertrouwelijkheid', 'Integriteit', 'Beschikbaarheid'],
          answer: 1,
          explain: 'De gegevens zijn ongemerkt gewijzigd, dus de integriteit is aangetast.',
        },
        {
          q: 'Welke A van AAA houdt bij wat een gebruiker precies heeft gedaan (logging)?',
          answer: ['accounting', 'vastlegging'],
          hint: 'Denk aan boekhouding en logboeken.',
          explain: 'Accounting legt vast wie wat wanneer deed. Dat is belangrijk voor onderzoek na een incident.',
        },
        {
          q: 'Welk begrip zorgt dat iemand achteraf niet kan ontkennen dat hij een bericht of actie heeft uitgevoerd?',
          answer: ['onweerlegbaarheid', 'non-repudiation', 'non repudiation'],
          hint: 'Denk aan een digitale handtekening.',
          explain: 'Onweerlegbaarheid (non-repudiation) maakt een actie onloochenbaar, bijvoorbeeld via een digitale handtekening.',
        },
      ],
    },

    {
      title: 'Taak 3 — Dreiging, kwetsbaarheid en risico',
      content: `
        <p>Drie woorden die vaak door elkaar worden gebruikt, maar die iets heel verschillends betekenen. Snap je het
        verschil, dan snap je het hart van security.</p>
        <ul>
          <li><strong>Dreiging (threat)</strong>: iets of iemand dat schade <em>kan</em> veroorzaken. Bijvoorbeeld een
            ransomwaregroep, een boze oud-medewerker, of een brand in het serverhok.</li>
          <li><strong>Kwetsbaarheid (vulnerability)</strong>: een zwakke plek die misbruikt kan worden. Bijvoorbeeld
            een niet-gepatchte server, een zwak wachtwoord, of een deur die niet op slot kan.</li>
          <li><strong>Risico (risk)</strong>: de kans dat een dreiging een kwetsbaarheid misbruikt, maal de impact die
            dat heeft. Kort gezegd: <strong>risico &asymp; kans &times; impact</strong>.</li>
        </ul>

        <p>Een analogie: een dief in de buurt is de <em>dreiging</em>. Een raam dat niet op slot kan is de
        <em>kwetsbaarheid</em>. Het <em>risico</em> is hoe waarschijnlijk het is dat die dief via dat raam binnenkomt,
        en hoeveel schade dat dan oplevert. Woon je op de tiende verdieping, dan is de kans (en dus het risico) laag,
        ook al bestaan de dreiging en de kwetsbaarheid allebei.</p>

        <p>Hierdoor kun je verstandig kiezen. Je kunt nooit alles tegelijk oplossen, dus je pakt eerst de risico's met
        de grootste kans <em>en</em> de grootste impact aan. Dit heet <strong>risicomanagement</strong>. Je kunt een
        risico:</p>
        <ul>
          <li><strong>verkleinen</strong> (patchen, wachtwoord sterker maken) &mdash; een <em>maatregel</em> (control);</li>
          <li><strong>overdragen</strong> (een verzekering afsluiten);</li>
          <li><strong>accepteren</strong> (bewust besluiten ermee te leven als kans en impact klein zijn);</li>
          <li><strong>vermijden</strong> (de riskante activiteit helemaal niet doen).</li>
        </ul>

        <div class="callout info">
          <p><strong>Voorbeeld:</strong> een webserver draait een oude versie met een bekende kwetsbaarheid
          (<em>vulnerability</em>). Er zijn actieve aanvallers die daar scripts voor hebben (<em>threat</em>). De kans
          dat de server wordt overgenomen is hoog en de impact (klantgegevens lekken) is groot, dus het
          <em>risico</em> is hoog. De maatregel: direct updaten.</p>
        </div>
      `,
      questions: [
        {
          q: 'Vul de vuistregel aan: risico is ongeveer kans maal ...',
          answer: ['impact', 'gevolg'],
          hint: 'Hoe erg is het als het misgaat?',
          explain: 'Risico weeg je af als kans maal impact. Hoge kans en hoge impact = hoog risico.',
        },
        {
          q: 'Een server die al maanden niet is bijgewerkt en een bekende beveiligingsfout bevat, is vooral een voorbeeld van een ...',
          options: ['dreiging', 'kwetsbaarheid', 'maatregel'],
          answer: 1,
          explain: 'Een zwakke plek die misbruikt kan worden is een kwetsbaarheid (vulnerability).',
        },
      ],
    },

    {
      title: 'Taak 4 — Wie zijn de aanvallers? Dreigingsactoren en motieven',
      content: `
        <p>"Hackers" is een te breed woord. Om je te verdedigen helpt het om te weten <em>wie</em> je mogelijk aanvalt
        en <em>waarom</em>. Dat noemen we <strong>dreigingsactoren</strong> (threat actors). De belangrijkste soorten:</p>

        <table>
          <thead>
            <tr><th>Actor</th><th>Motief</th><th>Typisch gedrag</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Cybercriminelen</strong></td><td>Geld</td><td>Ransomware, bankfraude, phishing, verkoop van gestolen data</td></tr>
            <tr><td><strong>Statelijke actoren</strong><br>(nation-state / APT)</td><td>Spionage, sabotage, geopolitiek</td><td>Geduldig, goed gefinancierd, langdurig verborgen (Advanced Persistent Threat)</td></tr>
            <tr><td><strong>Hacktivisten</strong></td><td>Een ideaal of protest</td><td>Websites platleggen (DDoS), defacement, datalekken uit protest</td></tr>
            <tr><td><strong>Insiders</strong></td><td>Wraak, geld, of per ongeluk</td><td>Misbruik van eigen toegang; soms gewoon een fout</td></tr>
            <tr><td><strong>Script kiddies</strong></td><td>Status, nieuwsgierigheid, verveling</td><td>Gebruiken kant-en-klare tools zonder de techniek echt te begrijpen</td></tr>
          </tbody>
        </table>

        <p>Een paar nuances die in de praktijk belangrijk zijn:</p>
        <ul>
          <li><strong>Insiders</strong> worden vaak onderschat. Lang niet elke insider is kwaadwillend: iemand die op
            een phishinglink klikt of een usb-stick van de parkeerplaats insteekt, veroorzaakt ook schade. Daarom zijn
            bewustwording (awareness) en minimale rechten (least privilege) zo belangrijk.</li>
          <li><strong>Statelijke actoren</strong> (ook APT genoemd) hebben veel tijd en geld. Ze vallen niet lukraak
            aan, maar richten zich op specifieke doelen zoals overheden, defensie of kennisinstellingen.</li>
          <li><strong>Script kiddies</strong> zijn technisch zwak, maar niet ongevaarlijk: de tools die ze downloaden
            zijn soms krachtig genoeg om een slecht beveiligd systeem over te nemen.</li>
        </ul>

        <p>Het begrip <strong>hacker</strong> zelf is niet per definitie slecht. We onderscheiden vaak
        <em>black hat</em> (kwaadwillend), <em>white hat</em> (ethisch, met toestemming) en <em>grey hat</em>
        (ertussenin, zoekt soms zonder toestemming maar zonder kwade bedoeling). In deze cursus leer je de white-hat
        aanpak.</p>
      `,
      questions: [
        {
          q: 'Welke dreigingsactor wordt vooral gedreven door financieel gewin?',
          options: ['Hacktivisten', 'Cybercriminelen', 'Statelijke actoren'],
          answer: 1,
          explain: 'Cybercriminelen zijn uit op geld, bijvoorbeeld via ransomware of fraude.',
        },
        {
          q: 'Hoe noem je een onervaren aanvaller die kant-en-klare tools gebruikt zonder de techniek erachter te begrijpen?',
          answer: ['script kiddie', 'script kiddies', 'scriptkiddie', 'script-kiddie'],
          hint: 'Twee woorden, de tweede verwijst naar een kind.',
          explain: 'Een script kiddie gebruikt bestaande scripts/tools zonder diepgaande kennis.',
        },
      ],
    },

    {
      title: 'Taak 5 — Rollen en loopbanen in cybersecurity',
      content: `
        <p>Security is een vak met heel veel richtingen. Of je nu graag aanvalt, verdedigt, onderzoekt of beleid maakt:
        er is een plek voor je. De grote tweedeling is <strong>offensief</strong> (red) versus <strong>defensief</strong>
        (blue).</p>

        <ul>
          <li><strong>Red team</strong>: speelt de aanvaller. Zoekt zwakke plekken door een echte aanval na te bootsen,
            zodat de organisatie leert waar het misgaat. Een <strong>pentester</strong> (penetratietester) doet
            afgebakende, afgesproken tests op systemen of applicaties.</li>
          <li><strong>Blue team</strong>: verdedigt. Houdt systemen in de gaten, zet verdediging op en reageert op
            aanvallen. Hieronder vallen de <strong>SOC-analist</strong> (bewaakt meldingen in een Security Operations
            Center), de <strong>incident responder</strong> (onderzoekt en bestrijdt actieve incidenten) en de
            <strong>security engineer</strong> (bouwt en beheert de beveiligingstechniek, zoals firewalls en logging).</li>
          <li><strong>Purple team</strong>: geen apart team maar een <em>samenwerking</em> tussen red en blue. Rood valt
            aan en deelt direct wat werkte; blauw verbetert meteen de detectie en verdediging. Zo leer je het snelst.</li>
        </ul>

        <p>Daarnaast zijn er rollen die minder met de techniek en meer met organisatie en beleid te maken hebben:</p>
        <ul>
          <li><strong>GRC / security officer</strong>: Governance, Risk &amp; Compliance. Zorgt dat de organisatie zich
            aan wetten, normen (zoals ISO 27001) en eigen beleid houdt, en dat risico's bewust worden beheerd.</li>
          <li><strong>Security engineer / architect</strong>: ontwerpt en bouwt veilige systemen en infrastructuur.</li>
        </ul>

        <div class="callout tip">
          <p><strong>Tip:</strong> je hoeft niet te kiezen op dag één. Veel mensen beginnen als SOC-analist of in de IT
          (zoals jij) en groeien van daaruit door naar red of blue, of naar GRC. De basis die je hier leert &mdash;
          netwerken, systemen, denken als aanvaller &eacute;n verdediger &mdash; heb je overal nodig.</p>
        </div>
      `,
      questions: [
        {
          q: 'Welk team speelt de aanvaller om de verdediging te testen?',
          options: ['Blue team', 'Red team', 'Purple team'],
          answer: 1,
          explain: 'Het red team bootst een aanval na. Het blue team verdedigt; purple is de samenwerking tussen beide.',
        },
        {
          q: 'Hoe heet de analist die in een Security Operations Center de binnenkomende meldingen bewaakt?',
          answer: ['soc-analist', 'soc analist', 'socanalist', 'soc-analyst'],
          hint: 'De afkorting staat voor Security Operations Center.',
          explain: 'Een SOC-analist monitort meldingen en alarmeert wanneer er iets verdachts gebeurt.',
        },
      ],
    },

    {
      title: 'Taak 6 — Ethiek en de wet in Nederland',
      content: `
        <p>Dit is misschien wel de belangrijkste taak van de hele cursus. De technieken die je gaat leren, zijn krachtig.
        Ze op de verkeerde plek gebruiken is <strong>strafbaar</strong>, ook als je "alleen even wilde kijken" en niets
        kapotmaakt.</p>

        <div class="callout danger">
          <p><strong>Belangrijk:</strong> inbreken in een computer of netwerk dat niet van jou is, zonder toestemming,
          heet <strong>computervredebreuk</strong> en is strafbaar onder <strong>artikel 138ab van het Wetboek van
          Strafrecht (Sr)</strong>. Je hoeft geen schade aan te richten; alleen al binnendringen is genoeg.</p>
        </div>

        <p>De gouden regel: <strong>je hackt alleen je eigen systemen, of systemen waarvoor je vooraf schriftelijke
        toestemming hebt</strong>. Bij een professionele pentest wordt dit vastgelegd in een opdracht met een duidelijke
        <em>scope</em> (wat mag wel en niet) en een periode. Geen toestemming op papier betekent: niet doen.</p>

        <p>Wat als je per ongeluk een kwetsbaarheid vindt in een systeem van iemand anders, bijvoorbeeld in een website?
        Dan is er een nette weg: <strong>Coordinated Vulnerability Disclosure (CVD)</strong>, in Nederland
        gecoördineerd via het <strong>NCSC</strong>. Je meldt de kwetsbaarheid vertrouwelijk bij de eigenaar (of bij het
        NCSC), geeft ze tijd om het op te lossen en maakt het niet meteen wereldkundig. Je gaat ook niet verder graven
        dan nodig om het probleem aan te tonen. Veel organisaties hebben hiervoor een <em>responsible disclosure</em>- of
        CVD-beleid op hun website staan.</p>

        <p>Nog een paar belangrijke spelers en regels in Nederland:</p>
        <ul>
          <li><strong>Autoriteit Persoonsgegevens (AP)</strong>: houdt toezicht op de bescherming van persoonsgegevens
            (AVG/GDPR). Een datalek met persoonsgegevens moet je vaak melden.</li>
          <li><strong>Politie</strong>: het Team High Tech Crime pakt zware cybercriminaliteit aan.</li>
          <li><strong>Cyberbeveiligingswet (NIS2)</strong>: verplicht veel organisaties om hun beveiliging op orde te
            hebben en incidenten te melden.</li>
        </ul>

        <p>Kortom: wees nieuwsgierig, oefen volop &mdash; maar doe dat in je eigen lab (zoals dit portaal) of met
        expliciete toestemming. Ethiek is niet het saaie deel; het is wat een hacker onderscheidt van een crimineel.</p>
      `,
      questions: [
        {
          q: 'Welk artikel uit het Wetboek van Strafrecht maakt computervredebreuk (binnendringen zonder toestemming) strafbaar? Geef het artikelnummer.',
          answer: ['138ab', '138ab sr', 'art. 138ab sr', 'artikel 138ab sr', 'art 138ab'],
          hint: 'Het staat in rood in de tekst.',
          explain: 'Artikel 138ab Sr stelt computervredebreuk strafbaar; alleen binnendringen is al genoeg.',
        },
        {
          q: 'Je ontdekt per ongeluk een kwetsbaarheid in de website van een ander bedrijf. Wat is de juiste eerste stap?',
          options: [
            'De kwetsbaarheid meteen misbruiken om te kijken hoe ver je komt',
            'Het vertrouwelijk melden via Coordinated Vulnerability Disclosure (eigenaar of NCSC)',
            'Direct online publiceren met een kant-en-klare exploit',
          ],
          answer: 1,
          explain: 'Via CVD meld je het vertrouwelijk en geef je de eigenaar tijd om het op te lossen. Verder graven of publiceren mag niet.',
        },
      ],
    },

    {
      title: 'Taak 7 — Hoe dit portaal werkt: jouw eerste vlag',
      content: `
        <p>Tijd om te oefenen. Dit portaal werkt net als bekende oefenplatforms: je leest, je doet, en je bewijst dat je
        iets kunt vinden door een <strong>vlag</strong> (flag) in te leveren. Zo werkt het:</p>
        <ul>
          <li><strong>Vlaggen</strong> hebben altijd het formaat <code>JVT{iets_met_kleine_letters}</code>. Vind je zo'n
            tekst, dan plak je die in het antwoordveld. Hoofdletters en spaties aan het begin of eind maken niet uit.</li>
          <li><strong>Labs</strong> zijn kleine, veilige oefenomgevingen in je browser: een terminal, een loginformulier,
            een logviewer, enzovoort. Alles is nagebootst; je breekt dus nergens echt in.</li>
          <li><strong>XP</strong> (ervaringspunten) verdien je met elke goede beantwoorde vraag. Zo zie je je voortgang.</li>
        </ul>

        <p>Hieronder staat een echte terminal (bash). De belangrijkste vaardigheid in security is: <em>rondkijken</em>.
        Doe het volgende, precies in deze volgorde. Typ elk commando en druk op Enter:</p>
        <ol>
          <li>Typ <code>ls</code> om te zien welke bestanden er in je map staan.</li>
          <li>Je ziet onder andere <code>welkom.txt</code>. Typ <code>cat welkom.txt</code> om de inhoud te lezen.</li>
          <li>In dat bestand staat jouw eerste vlag. Kopieer die (de hele tekst vanaf <code>JVT{</code> tot en met de
            <code>}</code>) naar het antwoordveld.</li>
        </ol>

        <div class="callout tip">
          <p><strong>Handig:</strong> <code>ls</code> = "list", toont bestanden en mappen. <code>cat</code> = "concatenate",
          toont de inhoud van een bestand. Met <code>cat README.txt</code> lees je ook meteen de uitleg in de map.</p>
        </div>

        <p>Lukt het niet meteen? Typ <code>help</code> voor een overzicht van de beschikbare commando's. Rustig
        rondkijken mag altijd: in een lab kun je niets stukmaken.</p>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student',
        host: 'jvt-lab',
        home: '/home/student',
        cwd: '/home/student',
        motd: 'Welkom in je eerste lab! Typ "ls" en daarna "cat welkom.txt". Typ help voor alle commando\'s.',
        fs: {
          '/home/student/welkom.txt': 'Gefeliciteerd, je hebt je eerste bestand geopend!\n\nJouw eerste vlag is:\nJVT{jouw_eerste_vlag}\n\nPlak deze hierboven in het antwoordveld.\n',
          '/home/student/README.txt': 'Welkom op het JVT-leerportaal.\n\n- "ls" toont de bestanden in deze map.\n- "cat <bestand>" toont de inhoud van een bestand.\n- Vlaggen zien er zo uit: JVT{...}\n- Typ "help" voor alle commando\'s.\n\nVeel plezier en blijf ethisch!\n',
        },
      },
      questions: [
        {
          q: 'Wat is de vlag in welkom.txt?',
          answer: ['JVT{jouw_eerste_vlag}'],
          hint: 'Typ eerst ls, daarna cat welkom.txt.',
          explain: 'Met cat welkom.txt lees je het bestand en vind je JVT{jouw_eerste_vlag}. Zo werkt "zoek de vlag".',
        },
        {
          q: 'Welk commando gebruik je om de inhoud van een tekstbestand te tonen?',
          answer: ['cat'],
          hint: 'Drie letters, komt van "concatenate".',
          explain: 'cat toont de inhoud van een bestand in de terminal.',
        },
      ],
    },
  ],
  terms: [
    { term: 'Cybersecurity', def: 'Het beschermen van computers, netwerken, apparaten en gegevens tegen misbruik, diefstal en uitval, met techniek, mensen en processen.' },
    { term: 'CIA-triade', def: 'Drie kerneigenschappen van informatiebeveiliging: vertrouwelijkheid (Confidentiality), integriteit (Integrity) en beschikbaarheid (Availability).' },
    { term: 'Authenticiteit', def: 'De zekerheid dat iemand of iets echt is wie of wat het beweert te zijn.' },
    { term: 'Onweerlegbaarheid', def: 'Non-repudiation: achteraf kan iemand niet ontkennen dat hij een actie heeft uitgevoerd, bijvoorbeeld via een digitale handtekening.' },
    { term: 'AAA', def: 'Authentication (wie ben je?), Authorization (wat mag je?) en Accounting (wat heb je gedaan?).' },
    { term: 'Dreiging', def: 'Een threat: iets of iemand dat schade kan veroorzaken.' },
    { term: 'Kwetsbaarheid', def: 'Een vulnerability: een zwakke plek die misbruikt kan worden.' },
    { term: 'Risico', def: 'De kans dat een dreiging een kwetsbaarheid misbruikt, maal de impact. Vuistregel: risico is ongeveer kans maal impact.' },
    { term: 'Dreigingsactor', def: 'Een threat actor: een partij die een aanval uitvoert, zoals een cybercrimineel, statelijke actor, hacktivist, insider of script kiddie.' },
    { term: 'Pentester', def: 'Een penetratietester die met toestemming en binnen een afgesproken scope systemen op zwakke plekken test.' },
    { term: 'Computervredebreuk', def: 'Het zonder toestemming binnendringen in een computer of netwerk; in Nederland strafbaar onder artikel 138ab Sr.' },
    { term: 'CVD', def: 'Coordinated Vulnerability Disclosure: een kwetsbaarheid vertrouwelijk melden (in Nederland via het NCSC) en de eigenaar tijd geven om het op te lossen.' },
  ],
  resources: [
    { title: 'NCSC (Nationaal Cyber Security Centrum)', url: 'https://www.ncsc.nl/' },
    { title: 'TryHackMe', url: 'https://tryhackme.com/' },
    { title: 'Cloudflare Learning Center', url: 'https://www.cloudflare.com/learning/' },
  ],
});
