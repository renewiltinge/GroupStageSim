/* Room: Webhacking — SQL-injectie en meer */
CS.registerRoom({
  id: 'webhacking-sqli',
  path: 'offensief',
  order: 3,
  title: 'Webhacking: SQL-injectie en meer',
  icon: '💉',
  difficulty: 'Moeilijk',
  minutes: 75,
  summary: 'Duik in webhacking met SQL-injectie als hoofdgerecht: begrijp hoe het werkt, log in een lab als admin, en zie hoe prepared statements het stoppen. Plus een korte intro in XSS en het manipuleren van cookies.',
  objectives: [
    'Uitleggen hoe SQL-injectie werkt, waarom \' OR \'1\'=\'1 werkt en wat de impact kan zijn',
    'In een veilig lab via SQL-injectie als admin inloggen en de vlag bemachtigen',
    'Laten zien dat prepared statements (geparametriseerde queries) de injectie onschadelijk maken',
    'Op hoofdlijnen uitleggen wat XSS is en hoe je het voorkomt',
    'Een HTTP-verzoek en cookies manipuleren om een afgeschermd endpoint te bereiken, en begrijpen waarom dat kan',
  ],
  tasks: [
    {
      title: 'Taak 1 — Webhacking en hoe een HTTP-verzoek eruitziet',
      content: `
        <p>Het web werkt met <strong>HTTP</strong>-verzoeken: je browser vraagt iets aan een server, en die stuurt
        een antwoord terug. Bij <strong>webhacking</strong> draait alles om het slim manipuleren van die verzoeken.
        De server vertrouwt namelijk vaak te veel op wat de browser meestuurt — en juist dat kun je aanpassen.</p>

        <h3>De onderdelen van een verzoek</h3>
        <ul>
          <li><strong>Methode:</strong> meestal <code>GET</code> (iets ophalen) of <code>POST</code> (iets versturen,
          zoals een inlogformulier).</li>
          <li><strong>Pad en parameters:</strong> bijvoorbeeld <code>/product?id=5</code>. Alles achter het vraagteken
          zijn parameters die jij kunt wijzigen.</li>
          <li><strong>Headers:</strong> extra informatie, zoals je browsertype en je <strong>cookies</strong>.</li>
          <li><strong>Body:</strong> de verstuurde gegevens bij een POST, zoals gebruikersnaam en wachtwoord.</li>
        </ul>

        <h3>Cookies: jouw pasje</h3>
        <p>Een <strong>cookie</strong> is een klein stukje tekst dat de server bij je browser opslaat en dat je bij
        elk volgend verzoek automatisch meestuurt. Het werkt als een pasje: de server herkent je eraan. Maar let op:
        dat pasje zit in <em>jouw</em> browser, dus jij kunt het lezen en wijzigen. Als een server blind vertrouwt op
        iets dat in een cookie staat (zoals <code>role=user</code>), kun je dat proberen aan te passen.</p>

        <div class="callout info">
          <strong>Kernprincipe van webhacking:</strong> alles wat van de client (jouw browser) komt — parameters,
          cookies, headers, formuliervelden — kan door de gebruiker gewijzigd zijn. Een veilige server
          <em>vertrouwt invoer nooit</em> en controleert alles zelf opnieuw.
        </div>

        <div class="callout warn">
          <strong>Ethiek vooraf:</strong> alle technieken hieronder oefen je uitsluitend in dit lab of op systemen
          met uitdrukkelijke, schriftelijke toestemming. Ongeautoriseerd inbreken of manipuleren is strafbaar
          (computervredebreuk, art. 138ab Sr).
        </div>
      `,
      questions: [
        { q: 'Welke HTTP-methode gebruikt een inlogformulier meestal om gegevens te versturen?', options: ['POST', 'GET', 'HEAD'], answer: 0, explain: 'POST verstuurt gegevens in de body van het verzoek, geschikt voor formulieren zoals een login.' },
        { q: 'Waarom kun je een cookie als gebruiker aanpassen?', options: ['Omdat het in jouw eigen browser is opgeslagen en jij het meestuurt', 'Omdat cookies op de server staan', 'Dat kan niet, cookies zijn versleuteld'], answer: 0, explain: 'Cookies leven in jouw browser; daarom kan de gebruiker ze lezen en wijzigen. De server moet dat nooit blind vertrouwen.' },
        { q: 'Wat is het kernprincipe van een veilige webserver ten opzichte van invoer?', options: ['Invoer van de client nooit vertrouwen en alles zelf opnieuw controleren', 'Ervan uitgaan dat de browser altijd eerlijk is', 'Alleen GET-verzoeken controleren'], answer: 0, explain: 'Alles wat van de client komt, kan gewijzigd zijn; de server moet het zelf valideren en controleren.' },
      ],
    },

    {
      title: 'Taak 2 — Wat is SQL-injectie?',
      content: `
        <p>Veel websites bewaren hun gegevens in een <strong>database</strong>. De applicatie praat daarmee via
        <strong>SQL</strong> (Structured Query Language), een soort vraagtaal. Een inlogcontrole bouwt bijvoorbeeld
        deze query op:</p>
        <pre><code>SELECT * FROM users WHERE username = 'jan' AND password = 'geheim';</code></pre>
        <p>Het probleem ontstaat als de app jouw ingetypte tekst <em>rechtstreeks</em> in die query plakt. Dan kun jij
        de betekenis van de query veranderen. Dat heet <strong>SQL-injectie</strong> (SQLi): je "injecteert" je eigen
        stukje SQL via een invoerveld.</p>

        <h3>De klassieker: altijd waar maken</h3>
        <p>Stel, je typt als gebruikersnaam dit in:</p>
        <pre><code>' OR '1'='1</code></pre>
        <p>Dan wordt de query:</p>
        <pre><code>SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...';</code></pre>
        <p>De toegevoegde voorwaarde <code>'1'='1'</code> is <em>altijd waar</em>. Daarmee verandert de hele
        voorwaarde en krijg je mogelijk de eerste gebruiker uit de tabel terug — vaak de admin — zonder het
        wachtwoord te kennen. Een andere veelgebruikte truc is het wachtwoorddeel "wegcommentariëren" met
        <code>--</code> (in SQL begint daarmee commentaar), bijvoorbeeld met de invoer <code>admin' --</code>.</p>

        <h3>UNION: data uit andere tabellen trekken</h3>
        <p>Een krachtigere vorm gebruikt het sleutelwoord <strong>UNION</strong>. Daarmee plak je de resultaten van
        een <em>tweede</em> query achter de eerste. Een aanvaller kan zo data uit heel andere tabellen (zoals
        wachtwoord-hashes of klantgegevens) naar boven halen. We gaan er hier niet diep op in, maar onthoud: met
        UNION-gebaseerde injectie kun je soms de hele database uitlezen.</p>

        <h3>Waarom is dit zo erg?</h3>
        <ul>
          <li><strong>Inloggen zonder wachtwoord</strong> (authenticatie omzeilen).</li>
          <li><strong>Alle data uitlezen:</strong> klantgegevens, e-mailadressen, wachtwoord-hashes.</li>
          <li><strong>Data wijzigen of wissen:</strong> met de juiste rechten zelfs hele tabellen verwijderen.</li>
        </ul>
        <p>SQL-injectie valt onder <strong>Injection</strong> in de OWASP Top 10 en staat al decennia bij de gevaarlijkste
        webkwetsbaarheden. In de volgende taak voer je het zelf uit — in het lab.</p>
      `,
      questions: [
        { q: 'Waardoor ontstaat SQL-injectie?', options: ['Doordat gebruikersinvoer rechtstreeks in een SQL-query wordt geplakt', 'Doordat de database te groot is', 'Doordat HTTPS ontbreekt'], answer: 0, explain: 'Als invoer als onderdeel van de query wordt uitgevoerd, kan een aanvaller de betekenis ervan veranderen.' },
        { q: "Waarom werkt de invoer ' OR '1'='1 ?", options: ["Omdat '1'='1' altijd waar is, waardoor de hele WHERE-voorwaarde waar wordt", 'Omdat het wachtwoord zo wordt gereset', 'Omdat het de database herstart'], answer: 0, explain: "De toegevoegde voorwaarde is altijd waar, dus de query geeft resultaten terug zonder geldig wachtwoord." },
        { q: 'Welk SQL-sleutelwoord gebruikt een aanvaller om data uit andere tabellen achter de resultaten te plakken?', answer: ['UNION', 'union'], hint: 'Het "verenigt" de resultaten van twee queries.', explain: 'Met UNION voeg je de resultaten van een tweede SELECT toe en kun je soms de hele database uitlezen.' },
        { q: 'Onder welke OWASP Top 10-categorie valt SQL-injectie?', options: ['Injection', 'Cryptographic Failures', 'Security Misconfiguration'], answer: 0, explain: 'SQL-injectie is het klassieke voorbeeld van de categorie Injection.' },
      ],
    },

    {
      title: 'Taak 3 — SQL-injectie in de praktijk (lab)',
      content: `
        <p>Tijd om het zelf te doen. Hieronder staat een nep-loginformulier van <code>portaal.jvt.lab</code>. Het lab
        laat de SQL-query die achter de schermen wordt opgebouwd <strong>live</strong> zien en voert hem echt uit op
        een kleine tabel <code>users</code> met de gebruikers <code>admin</code>, <code>jan</code> en
        <code>fatima</code>. Wie als <strong>admin</strong> binnenkomt, krijgt de vlag.</p>

        <h3>Stap 1 — Log in als admin via injectie</h3>
        <p>Je kent het wachtwoord van admin niet, maar dat hoeft ook niet. Probeer in het
        <strong>gebruikersnaamveld</strong> een van deze invoeren (laat het wachtwoord gerust leeg of vul iets willekeurigs in):</p>
        <ul>
          <li><code>admin' --</code> &nbsp;(logt in als admin en commentarieert de wachtwoordcontrole weg)</li>
          <li><code>' OR '1'='1' --</code> &nbsp;(maakt de voorwaarde altijd waar)</li>
        </ul>
        <p>Kijk terwijl je typt naar de query bovenin het lab: je ziet jouw invoer de betekenis van de SQL veranderen.
        Als het lukt en je als admin binnen bent, verschijnt de vlag.</p>

        <h3>Stap 2 — Zet prepared statements aan</h3>
        <p>In het lab zit een <strong>schakelaar voor prepared statements</strong> (geparametriseerde queries). Zet die
        aan en probeer exact dezelfde injectie opnieuw. Je zult zien dat het nu <em>faalt</em>: je invoer wordt niet
        meer als SQL uitgevoerd, maar als een letterlijke gebruikersnaam behandeld (er bestaat geen gebruiker die
        letterlijk <code>admin' --</code> heet). Precies dát is de oplossing, en die werken we in de volgende taak uit.</p>

        <div class="callout tip">
          <strong>Let op het verschil:</strong> met prepared statements <em>uit</em> breekt je invoer de query open.
          Met prepared statements <em>aan</em> is je invoer gewoon tekst. Zelfde invoer, totaal ander resultaat —
          dat is de hele kern van de verdediging.
        </div>
      `,
      lab: { type: 'sqli', flag: 'JVT{sql_injectie_als_admin}' },
      questions: [
        { q: 'Log met SQL-injectie in als admin. Welke vlag krijg je te zien?', answer: ['JVT{sql_injectie_als_admin}'], hint: "Typ in het gebruikersnaamveld admin' --  of  ' OR '1'='1' --", explain: 'Je injectie verandert de query zo dat je als admin binnenkomt zonder het wachtwoord te kennen.' },
        { q: 'Wat gebeurt er met je injectie als je prepared statements aanzet?', options: ['Ze faalt: je invoer wordt als letterlijke tekst behandeld, niet als SQL', 'Ze werkt nog beter', 'De database crasht'], answer: 0, explain: 'Met prepared statements is invoer altijd data; er bestaat geen gebruiker die letterlijk admin\' -- heet.' },
        { q: "Wat doet het toevoegen van -- aan het einde van je injectie?", options: ['Het maakt de rest van de query (zoals de wachtwoordcontrole) tot commentaar', 'Het versleutelt de query', 'Het verwijdert de tabel'], answer: 0, explain: 'In SQL begint met -- een commentaar; zo schakel je de controle op het wachtwoord uit.' },
      ],
    },

    {
      title: 'Taak 4 — SQL-injectie voorkomen',
      content: `
        <p>Je hebt gezien hoe makkelijk injectie kan zijn. Gelukkig is de verdediging goed te doen. Er zijn drie
        lagen, waarvan de eerste veruit het belangrijkst is.</p>

        <h3>1. Prepared statements (geparametriseerde queries) — de echte oplossing</h3>
        <p>Dit is de belangrijkste maatregel. In plaats van invoer in de querytekst te plakken, zet je op de plek van
        de waarde een <strong>placeholder</strong> (een "plaatshouder", vaak een vraagteken of een benoemde parameter)
        en geef je de waarde apart mee. De database weet dan: dit is een <em>waarde</em>, geen stukje code. Schematisch:</p>
        <pre><code>SELECT * FROM users WHERE username = ? AND password = ?;
-- waarden los meegeven: ["admin' --", "..."]</code></pre>
        <p>Nu wordt <code>admin' --</code> gewoon gezien als een (niet-bestaande) gebruikersnaam. De invoer kan de
        structuur van de query niet meer veranderen. <strong>Data en code zijn gescheiden</strong> — precies wat
        injectie onmogelijk maakt.</p>

        <h3>2. Invoervalidatie</h3>
        <p>Controleer dat invoer voldoet aan wat je verwacht (een e-mailadres ziet eruit als een e-mailadres, een
        id is een getal). Dit is een nuttige extra laag, maar <em>geen</em> vervanging voor prepared statements —
        slimme aanvallers omzeilen zwakke filters. Zie validatie als een extra slot, niet als de deur zelf.</p>

        <h3>3. Least privilege voor de database-gebruiker</h3>
        <p>Geef het account waarmee de applicatie met de database praat <strong>zo min mogelijk rechten</strong>
        (least privilege). Een webshop die alleen hoeft te lezen en bestellingen toe te voegen, heeft geen recht nodig
        om tabellen te verwijderen. Gaat er dan toch iets mis, dan is de schade beperkt: lukt een injectie, dan kan de
        aanvaller niet meteen de hele database droppen.</p>

        <div class="callout info">
          <strong>Samengevat:</strong> gebruik <strong>altijd</strong> prepared statements, valideer invoer als extra
          laag, en draai de database-gebruiker met minimale rechten. Dan is SQL-injectie in de praktijk van tafel.
        </div>
        <div class="callout danger">
          <strong>Niet doen:</strong> zelf proberen invoer te "ontschadelijken" door quotes te vervangen of op
          verdachte woorden te filteren als enige verdediging. Dat soort zelfbouw-filters wordt keer op keer omzeild.
          Laat de database het werk doen met geparametriseerde queries.
        </div>
      `,
      questions: [
        { q: 'Wat is de belangrijkste maatregel tegen SQL-injectie?', answer: ['prepared statements', 'geparametriseerde queries', 'prepared statement'], hint: 'Je gebruikt placeholders en geeft de waarden apart mee.', explain: 'Prepared statements scheiden data en code, zodat invoer de querystructuur niet meer kan veranderen.' },
        { q: 'Waarom is invoervalidatie alleen niet genoeg?', options: ['Zwakke filters zijn te omzeilen; het is een extra laag, geen vervanging voor prepared statements', 'Omdat validatie de database vertraagt', 'Omdat validatie illegaal is'], answer: 0, explain: 'Validatie helpt, maar slimme aanvallers omzeilen filters; de echte oplossing blijft geparametriseerde queries.' },
        { q: 'Wat betekent "least privilege" voor het database-account van een applicatie?', options: ['Het account krijgt zo min mogelijk rechten, passend bij wat de app echt nodig heeft', 'Het account krijgt juist alle rechten voor het gemak', 'Het account heeft geen wachtwoord'], answer: 0, explain: 'Minimale rechten beperken de schade als er tóch een injectie lukt: bijvoorbeeld geen rechten om tabellen te verwijderen.' },
        { q: 'Met prepared statements wordt de invoer admin\' -- behandeld als...', options: ['Een letterlijke (niet-bestaande) gebruikersnaam, dus gewone data', 'Uitvoerbare SQL-code', 'Een systeemcommando'], answer: 0, explain: 'De invoer is dan puur data; er bestaat geen gebruiker die letterlijk zo heet, dus de login faalt netjes.' },
      ],
    },

    {
      title: 'Taak 5 — Kort: Cross-Site Scripting (XSS)',
      content: `
        <p>SQL-injectie misbruikt het vertrouwen tussen de app en de <em>database</em>. <strong>XSS</strong>
        (Cross-Site Scripting) misbruikt het vertrouwen tussen de app en de <em>browser van andere bezoekers</em>.
        Bij XSS zorgt een aanvaller ervoor dat een website kwaadaardige <strong>JavaScript</strong> uitvoert in de
        browser van een slachtoffer. De browser denkt dat die code van de vertrouwde site komt en voert hem gewoon uit.</p>

        <h3>Hoe werkt het?</h3>
        <p>Als een site invoer van gebruikers zonder opschoning terugtoont, kun je in plaats van gewone tekst een
        stukje script invoeren. Denk aan een reactieveld of een zoekfunctie die jouw tekst letterlijk in de pagina zet.
        Typ je daar script in, dan draait dat bij iedereen die de pagina bekijkt.</p>
        <p>Twee veelvoorkomende soorten:</p>
        <ul>
          <li><strong>Reflected XSS:</strong> het script zit in een link/URL en wordt direct "teruggekaatst" in de
          pagina. Het slachtoffer moet op een geprepareerde link klikken.</li>
          <li><strong>Stored XSS:</strong> het script wordt opgeslagen op de server (bijvoorbeeld in een reactie) en
          draait bij <em>iedere</em> bezoeker van die pagina. Dat is gevaarlijker, want het werkt vanzelf.</li>
        </ul>

        <h3>Wat kan een aanvaller ermee?</h3>
        <p>Cookies (en dus sessies) stelen, toetsaanslagen meelezen, de pagina veranderen of het slachtoffer
        ongemerkt acties laten uitvoeren. Kortom: alles wat JavaScript in die browser kan.</p>

        <h3>Hoe voorkom je XSS?</h3>
        <ul>
          <li><strong>Output encoding (uitvoer coderen):</strong> toon gebruikersinvoer altijd als onschadelijke
          tekst, zodat tekens als <code>&lt;</code> en <code>&gt;</code> niet als HTML/script worden uitgevoerd.
          Dit is de belangrijkste maatregel.</li>
          <li><strong>Invoervalidatie</strong> als extra laag.</li>
          <li><strong>Content Security Policy (CSP):</strong> een instelling die de browser vertelt welke scripts
          wel en niet mogen draaien, als vangnet.</li>
          <li>Markeer sessiecookies als <code>HttpOnly</code>, zodat JavaScript ze niet kan uitlezen.</li>
        </ul>

        <div class="callout info">
          <strong>Rode draad:</strong> net als bij SQL-injectie draait het om het scheiden van <em>data</em> en
          <em>code</em>. Bij SQLi houd je invoer weg uit je queries; bij XSS houd je invoer weg uit je HTML/JavaScript.
        </div>
      `,
      questions: [
        { q: 'Wat gebeurt er bij een XSS-aanval?', options: ['Kwaadaardige JavaScript wordt uitgevoerd in de browser van (andere) bezoekers', 'De database wordt rechtstreeks uitgelezen', 'Het netwerk wordt gescand'], answer: 0, explain: 'XSS laat een vertrouwde site script uitvoeren in de browser van het slachtoffer.' },
        { q: 'Wat is het verschil tussen reflected en stored XSS?', options: ['Reflected zit in een link en kaatst direct terug; stored wordt opgeslagen en draait bij elke bezoeker', 'Reflected is legaal, stored niet', 'Er is geen verschil'], answer: 0, explain: 'Stored XSS is gevaarlijker omdat het opgeslagen is en automatisch bij iedere bezoeker draait.' },
        { q: 'Wat is de belangrijkste maatregel tegen XSS?', answer: ['output encoding', 'uitvoer coderen', 'output-encoding'], hint: 'Je toont invoer als onschadelijke tekst in plaats van als HTML/script.', explain: 'Met output encoding worden tekens als < en > niet meer als code uitgevoerd, maar als gewone tekst getoond.' },
        { q: 'Welke cookie-instelling zorgt dat JavaScript een sessiecookie niet kan uitlezen?', options: ['HttpOnly', 'Autoplay', 'Base64'], answer: 0, explain: 'Een HttpOnly-cookie is onbereikbaar voor JavaScript, wat het stelen via XSS tegengaat.' },
      ],
    },

    {
      title: 'Taak 6 — HTTP-verzoeken en cookies manipuleren (lab)',
      content: `
        <p>Niet elke webtruc heeft een database nodig. Soms vertrouwt een server simpelweg te veel op wat jij meestuurt.
        In dit lab zie je een intern portaal van <code>portaal.jvt.lab</code>. Je bent ingelogd als gewone gebruiker,
        en je cookie bevat onder andere <code>role=user</code>.</p>

        <h3>Stap 1 — Vind het verborgen endpoint</h3>
        <p>Begin met het opvragen van <code>/robots.txt</code>. Dat bestand vertelt zoekmachines welke paden ze niet
        moeten indexeren — maar het verraadt daarmee vaak juist interessante, "verborgen" paden aan een nieuwsgierige
        bezoeker. Kijk welk beheerpad erin genoemd wordt.</p>

        <h3>Stap 2 — Probeer het beheerpad</h3>
        <p>Vraag dat beheerpad (<code>/beheer</code>) op met je huidige cookie. Je krijgt <code>403 Forbidden</code>:
        geen toegang, want je rol is <code>user</code>. De server kijkt namelijk naar de <code>role</code> in je cookie.</p>

        <h3>Stap 3 — Manipuleer je cookie</h3>
        <p>En daar zit de fout: die rol staat gewoon in <em>jouw</em> cookie, dus die kun je zelf aanpassen. Verander
        in het verzoek het cookie-deel <code>role=user</code> in <code>role=admin</code> en vraag <code>/beheer</code>
        opnieuw op. Nu denkt de server dat je beheerder bent en krijg je toegang — inclusief de vlag. Dit heet
        <strong>privilege escalation</strong> (je rechten ophogen): een vorm van Broken Access Control, want de server
        had je rol nooit uit een door jou beheersbaar cookie mogen afleiden.</p>

        <div class="callout warn">
          <strong>De les voor verdedigers:</strong> bepaal rechten op basis van een veilige sessie aan de serverkant,
          nooit op basis van een waarde die de client zelf kan zetten. Vertrouw geen rol die in een cookie staat.
        </div>
      `,
      lab: {
        type: 'http',
        host: 'portaal.jvt.lab',
        start: { method: 'GET', path: '/', headers: { 'Cookie': 'session=4c1a9e; role=user' }, body: '' },
        routes: [
          { method: 'GET', path: '/', status: 200, headers: { 'Content-Type': 'text/html' }, body: 'Welkom op het interne portaal van portaal.jvt.lab.\nJe bent ingelogd als rol: user.\nHet beheergedeelte is alleen voor beheerders.\nTip: kijk eens in /robots.txt' },
          { method: 'GET', path: '/robots.txt', status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'User-agent: *\nDisallow: /beheer\nDisallow: /export' },
          { method: 'GET', path: '/beheer', when: [{ header: 'Cookie', contains: 'role=admin' }], status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'Beheerpaneel - toegang verleend (rol: admin)\nWelkom, beheerder.\nGeheime beheernotitie: JVT{cookie_rol_omhoog_admin}' },
          { method: 'GET', path: '/beheer', status: 403, headers: { 'Content-Type': 'text/plain' }, body: '403 Forbidden\nGeen toegang: je rol is user. Alleen role=admin mag hier komen.' },
          { method: 'GET', path: '/export', when: [{ header: 'Cookie', contains: 'role=admin' }], status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'Export van klantgegevens (alleen admin). Deze functie is in het lab uitgeschakeld.' },
          { method: 'GET', path: '/export', status: 403, headers: { 'Content-Type': 'text/plain' }, body: '403 Forbidden\nGeen toegang.' },
        ],
      },
      questions: [
        { q: 'Welk verborgen beheerpad wordt genoemd in /robots.txt?', answer: ['/beheer', 'beheer'], hint: 'Kijk bij de Disallow-regels; het eerste pad is het beheergedeelte.', explain: 'robots.txt verraadt met Disallow: /beheer juist het pad dat "verborgen" zou moeten zijn.' },
        { q: 'Verander role=user in role=admin in je cookie en vraag /beheer op. Welke vlag krijg je?', answer: ['JVT{cookie_rol_omhoog_admin}'], hint: 'Pas het Cookie-veld aan naar role=admin en verstuur GET /beheer opnieuw.', explain: 'De server leidt je rol af uit een cookie dat jij beheert; door role=admin te zetten krijg je ten onrechte toegang.' },
        { q: 'Hoe heet het verkrijgen van meer rechten dan je hoort te hebben, zoals van user naar admin?', answer: ['privilege escalation', 'privilege-escalation', 'rechtenescalatie'], hint: 'Engelse term: "privilege ..."', explain: 'Privilege escalation is het ophogen van je rechten; hier een vorm van Broken Access Control.' },
        { q: 'Wat is de juiste verdediging tegen deze cookie-manipulatie?', options: ['Rechten bepalen aan de serverkant op basis van een veilige sessie, niet uit een door de client beheersbaar cookie', 'Het cookie langer maken', 'De gebruiker vragen eerlijk te zijn'], answer: 0, explain: 'De server mag een rol nooit uit een door de client te wijzigen cookie afleiden; gebruik serverside sessiestate.' },
      ],
    },

    {
      title: 'Taak 7 — Ethiek, verantwoord melden en samenvatting',
      content: `
        <p>Je hebt in deze room echte aanvalstechnieken geleerd: SQL-injectie, de basis van XSS en het manipuleren van
        HTTP-verzoeken en cookies. Met die kennis komt verantwoordelijkheid.</p>

        <div class="callout danger">
          <strong>De grens is glashelder:</strong> deze technieken pas je uitsluitend toe in dit lab, op je eigen
          systemen, of met uitdrukkelijke, schriftelijke toestemming. Een echte website zonder toestemming aanvallen
          is in Nederland strafbaar als computervredebreuk (art. 138ab Sr) — ook als je "alleen even wilde kijken" of
          geen schade bedoelde.
        </div>

        <h3>Vind je een echt lek?</h3>
        <p>Buit het niet uit en maak het niet openbaar. Meld het verantwoord via <strong>Coordinated Vulnerability
        Disclosure</strong> (CVD): bij de organisatie zelf (check hun <code>security.txt</code> of CVD-beleid) of,
        als je er niet uitkomt, bij het <strong>NCSC</strong>. Geef de eigenaar redelijk de tijd om het te repareren.</p>

        <h3>Samenvatting — de rode draad</h3>
        <ul>
          <li><strong>Vertrouw nooit invoer van de client:</strong> parameters, formuliervelden, headers en cookies
          kunnen allemaal gewijzigd zijn.</li>
          <li><strong>Scheid data en code:</strong> prepared statements tegen SQLi, output encoding tegen XSS.</li>
          <li><strong>Controleer rechten aan de serverkant:</strong> leid rollen nooit af uit iets dat de client zelf
          kan zetten.</li>
          <li><strong>Least privilege en veilige defaults</strong> beperken de schade als er tóch iets misgaat.</li>
        </ul>
        <p>Met deze mindset kijk je straks naar elke webapplicatie met de ogen van zowel een aanvaller als een
        verdediger — en dat is precies wat je nodig hebt om veilige software te bouwen én te testen.</p>
      `,
      questions: [
        { q: 'Mag je de technieken uit deze room op een willekeurige website van een ander uitproberen?', options: ['Nee, alleen in dit lab, op eigen systemen of met schriftelijke toestemming', 'Ja, zolang je geen schade aanricht', 'Ja, als de site slecht beveiligd is'], answer: 0, explain: 'Ongeautoriseerd aanvallen is strafbaar (art. 138ab Sr), ook zonder schade of met goede bedoelingen.' },
        { q: 'Je vindt per ongeluk een echte SQL-injectie op een website. Wat doe je?', options: ['Verantwoord melden via CVD (organisatie of NCSC), niet uitbuiten of openbaar maken', 'De hele database downloaden als bewijs', 'Het lek op een forum plaatsen'], answer: 0, explain: 'Responsible disclosure / CVD: meld het netjes, misbruik het niet en geef tijd om te repareren.' },
        { q: 'Wat is de gemeenschappelijke rode draad achter SQL-injectie én XSS?', options: ['Data en code lopen door elkaar; de oplossing is ze strikt scheiden', 'Beide hebben met zwakke wachtwoorden te maken', 'Beide zijn alleen mogelijk zonder HTTPS'], answer: 0, explain: 'Bij SQLi houd je invoer uit je queries, bij XSS uit je HTML/JS; steeds gaat het om data en code scheiden.' },
        { q: 'Ik begrijp dat ik deze aanvalstechnieken alleen ethisch en legaal toepas en lekken verantwoord meld.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'HTTP-verzoek', def: 'Een vraag van de browser aan een server, met een methode (GET/POST), pad, parameters, headers en soms een body.' },
    { term: 'Cookie', def: 'Klein stukje tekst dat de server bij je browser opslaat en dat je automatisch meestuurt; werkt als een pasje, maar is door de client aanpasbaar.' },
    { term: 'SQL', def: 'Structured Query Language: de taal waarmee applicaties met een database praten (bijv. SELECT, INSERT).' },
    { term: 'SQL-injectie (SQLi)', def: 'Kwetsbaarheid waarbij gebruikersinvoer in een SQL-query wordt geplakt, zodat een aanvaller eigen SQL kan injecteren.' },
    { term: "' OR '1'='1", def: 'Klassieke SQL-injectie die een WHERE-voorwaarde altijd waar maakt, zodat je zonder geldig wachtwoord resultaten terugkrijgt.' },
    { term: 'UNION-injectie', def: 'SQL-injectie die met UNION de resultaten van een tweede query toevoegt om data uit andere tabellen uit te lezen.' },
    { term: 'Prepared statement', def: 'Geparametriseerde query met placeholders; invoer wordt als data behandeld, nooit als code. De beste verdediging tegen SQLi.' },
    { term: 'Least privilege', def: 'Elk account/onderdeel krijgt zo min mogelijk rechten, zodat de schade bij misbruik beperkt blijft.' },
    { term: 'XSS (Cross-Site Scripting)', def: 'Kwetsbaarheid waarbij kwaadaardige JavaScript in de browser van bezoekers wordt uitgevoerd via een vertrouwde site.' },
    { term: 'Reflected XSS', def: 'XSS waarbij het script via een link/URL direct wordt teruggekaatst in de pagina; het slachtoffer moet op de link klikken.' },
    { term: 'Stored XSS', def: 'XSS waarbij het script op de server is opgeslagen en bij elke bezoeker van de pagina automatisch draait.' },
    { term: 'Output encoding', def: 'Gebruikersinvoer als onschadelijke tekst tonen (bijv. < en > escapen), de belangrijkste maatregel tegen XSS.' },
    { term: 'Privilege escalation', def: 'Het verkrijgen van meer rechten dan je hoort te hebben, bijvoorbeeld van user naar admin.' },
    { term: 'Coordinated Vulnerability Disclosure (CVD)', def: 'Verantwoord melden van een kwetsbaarheid bij de eigenaar of het NCSC, zonder misbruik en met tijd om te repareren.' },
  ],
  resources: [
    { title: 'PortSwigger Web Security Academy — SQL injection', url: 'https://portswigger.net/web-security/sql-injection' },
    { title: 'PortSwigger Web Security Academy — Cross-site scripting', url: 'https://portswigger.net/web-security/cross-site-scripting' },
    { title: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/' },
    { title: 'NCSC (Nederland)', url: 'https://www.ncsc.nl/' },
  ],
});
