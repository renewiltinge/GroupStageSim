/* Room: Kwetsbaarheden & CVSS — van CVE tot patch */

// Bestandssysteem voor het praktijklab in taak 7: de fictieve webserver web01 van Brandpunt Koffie B.V.
// met KoffieCMS 4.2.1, een map met beveiligingsadviezen en een configuratiebestand.
// Vlaggen: JVT{advies_gelezen_versie_kwetsbaar} (advies) en JVT{workaround_eerst_dan_patchen} (configuratie).
const KWETS_FS = {
  '/home/student/LEESMIJ.txt': `OPDRACHT — web01 (Brandpunt Koffie B.V., fictief)
=================================================
Je bent de dienstdoende beheerder. Vanochtend kwam er een nieuw beveiligingsadvies binnen.
1. Zoek uit welke versie van KoffieCMS op deze server draait (/opt/koffiecms/VERSION).
2. Zoek in /home/student/advies het advies dat over KoffieCMS gaat en lees het.
3. Bepaal of deze server kwetsbaar is en wat de tijdelijke maatregel (workaround) is.
4. Controleer in /etc/koffiecms/koffiecms.conf de instelling die het advies noemt.
Tip: grep -r KoffieCMS advies
`,
  '/home/student/inventaris.txt': `ASSET-INVENTARIS (uittreksel)
host     | rol                    | software            | eigenaar   | kroonjuweel
---------+------------------------+---------------------+------------+------------
web01    | webshop + klantportaal | KoffieCMS (zie VERSION) | e-commerce | JA
mail01   | e-mail                 | BrouwMail 7.0.4     | IT         | nee
kassa02  | kassasysteem winkel    | BonenKassa 2.3      | retail     | JA
test03   | testomgeving           | KoffieCMS 4.3.0     | IT         | nee
Onderhoudsvenster web01: dinsdag 22:00-23:00
`,
  '/home/student/advies/JVT-SA-2026-009.txt': `JVT Security Advisory JVT-SA-2026-009 (FICTIEF)
Product   : BrouwMail
Getroffen : 6.0.0 t/m 6.9.9
Opgelost  : 7.0.0
Ernst     : Medium (CVSS 3.1: 6.1, AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)
Soort fout: CWE-79 (cross-site scripting) in de webmailinterface
Misbruik  : niet waargenomen
Advies    : upgrade naar 7.0.0 of hoger.
`,
  '/home/student/advies/JVT-SA-2026-014.txt': `JVT Security Advisory JVT-SA-2026-014 (FICTIEF)
=================================================
Product    : KoffieCMS
Getroffen  : 4.2.0 t/m 4.2.2
Opgelost in: 4.2.3
CVE-ID     : CVE-2026-XXXXX (fictief voorbeeld)
Soort fout : CWE-89 (SQL-injectie) in het endpoint /api/import
CVSS 3.1   : 9.8 Critical  CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
Misbruik   : JA — actief misbruik waargenomen sinds 2026-09-28

Beschrijving
Een aanvaller zonder account kan via het import-endpoint SQL-opdrachten
uitvoeren op de database en zo klantgegevens lezen en wijzigen.

Oplossing
Upgrade zo snel mogelijk naar KoffieCMS 4.2.3.

Workaround (als je niet direct kunt patchen)
Zet in /etc/koffiecms/koffiecms.conf de optie import_api op uit
en blokkeer /api/import in je webapplicatiefirewall (WAF).
Let op: dit is een tijdelijke maatregel, geen vervanging van de patch.

Controlecode voor wie dit advies volledig gelezen heeft: JVT{advies_gelezen_versie_kwetsbaar}
`,
  '/opt/koffiecms/VERSION': 'KoffieCMS 4.2.1\n',
  '/opt/koffiecms/CHANGELOG.txt': `4.2.1 - bugfix: bestelbevestiging toonde verkeerde datum
4.2.0 - nieuw: import-API voor productcatalogus (/api/import)
4.1.9 - beveiligingsupdate sessiebeheer
`,
  '/etc/koffiecms/koffiecms.conf': `# KoffieCMS configuratie — web01
site_naam = Brandpunt Koffie
database = mysql://koffiecms@localhost/koffie
debug = uit
import_api = aan
# import_api: zet op uit als noodmaatregel (zie JVT-SA-2026-014). Controlecode: JVT{workaround_eerst_dan_patchen}
max_upload_mb = 20
`,
  '/var/log/koffiecms/': null,
};

CS.registerRoom({
  id: 'kwetsbaarheden-cvss',
  path: 'security-kern',
  order: 4,
  title: 'Kwetsbaarheden & CVSS: van CVE tot patch',
  icon: '🩹',
  difficulty: 'Gemiddeld',
  minutes: 60,
  summary: 'Van kwetsbaarheid tot patch: leer CVE, CWE en het EUVD lezen, scoor zelf kwetsbaarheden met CVSS, combineer ernst met EPSS en de KEV-catalogus en prioriteer patches als een echte beheerder.',
  objectives: [
    'Uitleggen wat een kwetsbaarheid, een exploit en een zero-day zijn',
    'Een CVE-ID lezen en het verschil benoemen tussen CVE, CWE, de NVD en het EUVD van ENISA',
    'De acht basismetrieken van CVSS v3.1 uitleggen en zelf een basisscore en ernstklasse bepalen',
    'Benoemen wat er in CVSS v4.0 verandert en waarom EPSS en de CISA KEV-catalogus naast CVSS nodig zijn',
    'Patches prioriteren met een asset-inventaris en mitigaties kiezen als patchen (nog) niet kan',
    'Uitleggen hoe coordinated vulnerability disclosure in Nederland werkt (NCSC, security.txt, bug bounty)',
  ],
  tasks: [
    {
      title: 'Taak 1 — Kwetsbaarheid, exploit en zero-day',
      content: `
        <p>Stel je een kantoorpand voor met honderd ramen. Eén raam op de begane grond sluit niet goed: als je er
        hard genoeg tegen duwt, schuift het open. Dat slecht sluitende raam is een <strong>kwetsbaarheid</strong>
        (<em>vulnerability</em>): een zwakke plek waardoor iemand iets kan doen wat niet de bedoeling is. Iemand
        die precies weet hoe hard en waar je moet duwen, heeft een <strong>exploit</strong>: een concrete methode
        (vaak een stukje code) om die zwakke plek echt te misbruiken. En de reparatie door de glazenmaker is de
        <strong>patch</strong>.</p>

        <h3>De begrippen op een rij</h3>
        <ul>
          <li><strong>Kwetsbaarheid:</strong> een fout in software, hardware of configuratie die de
          vertrouwelijkheid, integriteit of beschikbaarheid (de CIA-triade) in gevaar kan brengen. Bijvoorbeeld een
          invoerveld dat SQL-opdrachten doorlaat, of een server die meer geheugen terugstuurt dan zou moeten.</li>
          <li><strong>Exploit:</strong> code of een stappenplan dat de kwetsbaarheid daadwerkelijk misbruikt. Een
          kwetsbaarheid zonder bekende exploit is nog steeds een risico, maar wel een kleiner risico op korte termijn.</li>
          <li><strong>Proof of concept (PoC):</strong> een "bewijs dat het kan" — een minimale exploit die laat zien
          dát de fout misbruikt kan worden, vaak zonder schadelijke lading.</li>
          <li><strong>Patch:</strong> een update van de leverancier die de fout oplost.</li>
          <li><strong>Zero-day:</strong> een kwetsbaarheid die al misbruikt wordt (of bekend is bij aanvallers)
          terwijl de leverancier er nog <em>nul dagen</em> de tijd voor heeft gehad: er is nog geen patch. Een
          <em>zero-day-exploit</em> is de bijbehorende aanvalscode.</li>
        </ul>

        <h3>Twee bekende voorbeelden uit de echte wereld</h3>
        <p><strong>Heartbleed</strong> (CVE-2014-0160, 2014) was een fout in de populaire cryptobibliotheek
        OpenSSL. Een aanvaller kon een server vragen om stukjes van zijn werkgeheugen terug te sturen. In dat
        geheugen konden wachtwoorden, sessiecookies en zelfs privésleutels van certificaten staan. Omdat OpenSSL op
        enorm veel webservers draaide, moesten wereldwijd beheerders tegelijk patchen én hun certificaten vervangen.</p>
        <p><strong>Log4Shell</strong> (CVE-2021-44228, december 2021) zat in Log4j 2, een veelgebruikte
        Java-bibliotheek om logregels weg te schrijven. Door een speciaal opgebouwde tekst te laten loggen
        (bijvoorbeeld in een gebruikersnaam of een HTTP-header) kon een aanvaller op afstand code laten uitvoeren op
        de server. Het lek kreeg de maximale CVSS-score van <strong>10.0</strong>. Het lastige: veel organisaties
        wisten niet eens dat Log4j ergens diep in hun software zat. Het NCSC hield destijds een openbare lijst bij
        van software waarin Log4j zat en wat de status was.</p>

        <div class="callout info">
          <strong>Kwetsbaarheid is niet hetzelfde als risico.</strong> Een kwetsbaarheid in software die je niet
          gebruikt, of die volledig afgeschermd staat, is voor jou een klein risico. Dezelfde kwetsbaarheid in je
          webshop die open op internet staat, is een groot risico. Risico hangt af van de kwetsbaarheid, de kans op
          misbruik én wat er voor jou op het spel staat. Daar komen we in taak 5 en 6 op terug.
        </div>

        <div class="callout warn">
          <strong>Ethiek:</strong> in deze room leer je kwetsbaarheden begrijpen, scoren en verhelpen. Je zoekt of
          test alleen op systemen waarvoor je schriftelijke toestemming hebt of in het lab van dit portaal.
          Zonder toestemming binnendringen in een systeem is in Nederland strafbaar (computervredebreuk, art. 138ab Sr).
        </div>
      `,
      questions: [
        { q: 'Hoe heet een concrete methode of stuk code waarmee je een kwetsbaarheid daadwerkelijk misbruikt?', answer: ['exploit', 'een exploit'], hint: 'In de analogie: weten hoe hard en waar je tegen het raam moet duwen.', explain: 'Een exploit misbruikt de kwetsbaarheid echt; de kwetsbaarheid zelf is alleen de zwakke plek.' },
        { q: 'Wat is een zero-day?', options: ['Een kwetsbaarheid die al bekend is bij aanvallers of misbruikt wordt terwijl er nog geen patch is', 'Een kwetsbaarheid die op dag nul na de release wordt gepatcht', 'Een kwetsbaarheid met een CVSS-score van 0.0'], answer: 0, explain: 'De leverancier heeft "nul dagen" gehad om het op te lossen: er is nog geen patch beschikbaar.' },
        { q: 'Welke CVSS-score kreeg Log4Shell (CVE-2021-44228)?', answer: ['10.0', '10', '10,0'], hint: 'De hoogst mogelijke score.', explain: 'Log4Shell kreeg 10.0: op afstand, zonder account en zonder hulp van een gebruiker code uitvoeren, met impact buiten de bibliotheek zelf.' },
        { q: 'In welke software zat Heartbleed (CVE-2014-0160)?', options: ['OpenSSL', 'Log4j', 'Windows Defender'], answer: 0, explain: 'Heartbleed zat in OpenSSL en liet servers stukjes werkgeheugen lekken.' },
      ],
    },

    {
      title: 'Taak 2 — CVE, CWE, NVD en het EUVD',
      content: `
        <p>Als duizenden organisaties over hetzelfde lek praten, heb je een gemeenschappelijke naam nodig. Anders
        noemt de ene leverancier het "het Log4j-probleem", de ander "LOG-2021-17" en de derde "dat Java-lek". Daarvoor
        bestaat <strong>CVE</strong>: <em>Common Vulnerabilities and Exposures</em>. Je kunt een CVE-ID vergelijken
        met een kenteken: één uniek nummer per kwetsbaarheid, zodat iedereen weet over welke het gaat.</p>

        <h3>De opbouw van een CVE-ID</h3>
        <pre><code>CVE-2021-44228
 │    │     └── volgnummer (minstens 4 cijfers, mag langer)
 │    └──────── jaar waarin het ID is toegekend of gereserveerd
 └───────────── voorvoegsel</code></pre>
        <p>Let op: het jaartal is het jaar van <em>toekenning</em>, niet per se het jaar waarin de fout ontstond of
        openbaar werd. En het volgnummer zegt niets over de ernst: CVE-2021-44228 is niet "erger" dan CVE-2021-1000.</p>

        <h3>Wie doet wat?</h3>
        <ul>
          <li><strong>MITRE</strong> beheert het CVE-programma (met financiering van de Amerikaanse overheid,
          CISA) en houdt de lijst met CVE-ID's bij.</li>
          <li><strong>CNA's</strong> (<em>CVE Numbering Authorities</em>) zijn organisaties die zelf CVE-ID's mogen
          uitdelen voor hun eigen producten of hun eigen terrein. Grote softwareleveranciers zijn vaak CNA, maar ook
          sommige CERT's en onderzoeksorganisaties. Zo hoeft niet alles via één loket.</li>
          <li><strong>NVD</strong> (<em>National Vulnerability Database</em>) van het Amerikaanse NIST verrijkt
          CVE's met extra informatie: een CVSS-score, het type fout (CWE) en welke productversies getroffen zijn.</li>
        </ul>

        <h3>CWE: het <em>soort</em> fout</h3>
        <p>Waar een CVE één specifieke kwetsbaarheid in één product aanduidt, beschrijft <strong>CWE</strong>
        (<em>Common Weakness Enumeration</em>) het <em>type</em> fout. Vergelijk het met een ziekte (CWE) en een
        individuele patiënt (CVE). Duizenden CVE's kunnen dezelfde CWE hebben. Bekende voorbeelden:</p>
        <table>
          <thead><tr><th>CWE</th><th>Soort fout</th></tr></thead>
          <tbody>
            <tr><td>CWE-79</td><td>Cross-site scripting (XSS): invoer komt ongefilterd als script in een webpagina</td></tr>
            <tr><td>CWE-89</td><td>SQL-injectie: invoer wordt onderdeel van een databasequery</td></tr>
            <tr><td>CWE-787</td><td>Out-of-bounds write: schrijven buiten het gereserveerde geheugen</td></tr>
            <tr><td>CWE-22</td><td>Path traversal: met <code>../</code> buiten de bedoelde map komen</td></tr>
          </tbody>
        </table>
        <p>CWE is vooral handig voor ontwikkelaars: zie je dat veel van je lekken CWE-89 zijn, dan weet je dat je team
        structureel prepared statements moet gaan gebruiken.</p>

        <h3>Europa: het EUVD van ENISA</h3>
        <p>Sinds 2025 heeft Europa een eigen databank: de <strong>European Vulnerability Database (EUVD)</strong>,
        beheerd door <strong>ENISA</strong>, het Europese agentschap voor cyberbeveiliging. De EUVD komt voort uit de
        NIS2-richtlijn (in Nederland uitgewerkt in de Cyberbeveiligingswet) en verzamelt informatie over
        kwetsbaarheden, inclusief verwijzingen naar CVE's, adviezen van Europese CSIRT's en of een lek actief
        misbruikt wordt. Zo is Europa minder afhankelijk van alleen Amerikaanse bronnen.</p>

        <div class="callout tip">
          <strong>Ezelsbruggetje:</strong> CVE = <em>welk</em> lek (het kenteken), CWE = <em>wat voor soort</em> fout
          (het merk auto), NVD en EUVD = de databanken waar je alles over dat kenteken opzoekt.
        </div>
      `,
      questions: [
        { q: 'Wat betekent "2021" in CVE-2021-44228?', options: ['Het jaar waarin het CVE-ID is toegekend of gereserveerd', 'Het aantal getroffen systemen', 'De ernst van de kwetsbaarheid'], answer: 0, explain: 'Het jaartal is het jaar van toekenning; het volgnummer zegt niets over de ernst.' },
        { q: 'Welk CWE-nummer hoort bij SQL-injectie?', answer: ['CWE-89', 'cwe 89', '89'], hint: 'Kijk in de tabel.', explain: 'CWE-89 is "Improper Neutralization of Special Elements used in an SQL Command", oftewel SQL-injectie.' },
        { q: 'Hoe heten organisaties die zelf CVE-ID\'s mogen uitdelen?', answer: ['CNA', "CNA's", 'cnas', 'cve numbering authority', 'cve numbering authorities'], hint: 'CVE Numbering ...', explain: 'CVE Numbering Authorities (CNA\'s) kennen ID\'s toe voor hun eigen producten of terrein.' },
        { q: 'Welke Europese organisatie beheert het EUVD?', answer: ['ENISA'], hint: 'Het Europese agentschap voor cyberbeveiliging.', explain: 'ENISA beheert de European Vulnerability Database, die voortkomt uit NIS2.' },
      ],
    },

    {
      title: 'Taak 3 — CVSS v3.1: de acht basismetrieken',
      content: `
        <p>Een CVE-ID zegt <em>welk</em> lek het is, maar niet hoe erg. Daarvoor is er <strong>CVSS</strong>, het
        <em>Common Vulnerability Scoring System</em>, beheerd door FIRST. CVSS geeft een kwetsbaarheid een score van
        <strong>0.0 tot 10.0</strong>. Je kunt het zien als de schaal van Richter voor kwetsbaarheden: één getal dat
        de technische ernst samenvat. We behandelen eerst versie 3.1, omdat die nog steeds het meest gebruikt wordt.</p>

        <p>De <strong>basisscore</strong> wordt berekend uit acht metrieken. De eerste vier beschrijven hoe makkelijk
        het lek te misbruiken is (<em>exploitability</em>), de laatste vier wat de gevolgen zijn (<em>impact</em>).</p>

        <h3>Hoe makkelijk is het?</h3>
        <ul>
          <li><strong>AV — Attack Vector</strong> (vanaf waar?): <code>N</code> Network (via internet),
          <code>A</code> Adjacent (vanaf hetzelfde lokale netwerk, bijv. dezelfde wifi), <code>L</code> Local (je
          moet al op het systeem zitten, bijv. met een account), <code>P</code> Physical (je moet het apparaat
          aanraken, bijv. via USB).</li>
          <li><strong>AC — Attack Complexity</strong>: <code>L</code> Low (werkt elke keer) of <code>H</code> High
          (de aanvaller moet omstandigheden afwachten of eerst informatie verzamelen, bijv. een race condition winnen).</li>
          <li><strong>PR — Privileges Required</strong>: welk account heeft de aanvaller vooraf nodig?
          <code>N</code> None, <code>L</code> Low (gewone gebruiker), <code>H</code> High (beheerder).</li>
          <li><strong>UI — User Interaction</strong>: moet een slachtoffer iets doen, zoals op een link klikken?
          <code>N</code> None of <code>R</code> Required.</li>
        </ul>

        <h3>Wat kan er gebeuren?</h3>
        <ul>
          <li><strong>S — Scope</strong>: blijft de schade binnen het kwetsbare onderdeel (<code>U</code> Unchanged),
          of raakt het ook andere onderdelen (<code>C</code> Changed)? Voorbeeld van Changed: een XSS-lek in een
          website waarmee je code draait in de <em>browser</em> van de bezoeker, of een lek waarmee je uit een
          virtuele machine breekt naar de host.</li>
          <li><strong>C — Confidentiality</strong>: kan de aanvaller gegevens lezen?</li>
          <li><strong>I — Integrity</strong>: kan de aanvaller gegevens wijzigen?</li>
          <li><strong>A — Availability</strong>: kan de aanvaller het systeem platleggen?</li>
        </ul>
        <p>C, I en A hebben elk de waarden <code>N</code> None, <code>L</code> Low (beperkt) of <code>H</code> High
        (volledig of zeer ernstig).</p>

        <h3>De vectorstring</h3>
        <p>Alle keuzes samen schrijf je als een <strong>vectorstring</strong>. Die van Log4Shell is:</p>
        <pre><code>CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H   →  10.0</code></pre>
        <p>Lees je die hardop, dan staat er: via het netwerk, eenvoudig, zonder account, zonder hulp van een
        gebruiker, met gevolgen buiten het kwetsbare onderdeel, en volledige impact op lezen, wijzigen en
        beschikbaarheid. Heartbleed had <code>AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N</code> = 7.5: makkelijk op afstand,
        maar "alleen" gegevens lezen.</p>

        <h3>Ernstklassen</h3>
        <table>
          <thead><tr><th>Score</th><th>Ernst</th></tr></thead>
          <tbody>
            <tr><td>0.0</td><td>None</td></tr>
            <tr><td>0.1 – 3.9</td><td>Low</td></tr>
            <tr><td>4.0 – 6.9</td><td>Medium</td></tr>
            <tr><td>7.0 – 8.9</td><td>High</td></tr>
            <tr><td>9.0 – 10.0</td><td>Critical</td></tr>
          </tbody>
        </table>

        <div class="callout info">
          <strong>Basisscore is generiek.</strong> De basisscore gaat over de kwetsbaarheid zelf, overal ter wereld
          hetzelfde. CVSS kent ook <em>temporal</em>-metrieken (is er een exploit, is er een patch?) en
          <em>environmental</em>-metrieken (hoe belangrijk is het systeem voor jóu?). Die worden in de praktijk veel
          minder ingevuld, terwijl ze juist het verschil maken.
        </div>
      `,
      questions: [
        { q: 'Welke waarde van Attack Vector (AV) kies je als de aanvaller het lek via internet kan misbruiken?', answer: ['N', 'network', 'AV:N'], hint: 'De afkorting van "Network".', explain: 'AV:N (Network) betekent op afstand via het netwerk, de ergste waarde voor deze metriek.' },
        { q: 'Een slachtoffer moet op een kwaadaardige link klikken. Welke metriek en waarde horen daarbij?', options: ['UI:R (User Interaction: Required)', 'PR:H (Privileges Required: High)', 'AC:H (Attack Complexity: High)'], answer: 0, explain: 'Als een gebruiker iets moet doen, is User Interaction Required.' },
        { q: 'In welke ernstklasse valt een score van 7.5?', options: ['Medium', 'High', 'Critical'], answer: 1, explain: '7.0 tot en met 8.9 is High.' },
        { q: 'Welke metriek zegt of de schade buiten het kwetsbare onderdeel terechtkomt (bijvoorbeeld uitbreken uit een VM)?', answer: ['Scope', 'S', 'scope (s)'], hint: 'Waarden Unchanged en Changed.', explain: 'Scope Changed (S:C) betekent dat ook andere onderdelen dan het kwetsbare onderdeel geraakt worden.' },
      ],
    },

    {
      title: 'Taak 4 — Zelf scoren met de CVSS-calculator',
      content: `
        <p>Tijd om zelf te rekenen. Hieronder staat een CVSS v3.1-calculator. Klik per metriek de juiste waarde aan;
        de calculator rekent live de officiële basisscore en ernst uit. Lees elke beschrijving rustig en vraag je bij
        elke metriek af: <em>wat moet de aanvaller hebben of doen, en wat kan hij daarna?</em></p>

        <div class="callout info">
          <strong>Let op:</strong> de producten en lekken hieronder zijn fictief, bedacht voor deze oefening.
        </div>

        <h3>Melding A — KoffieCMS 4.2.1</h3>
        <p>KoffieCMS is een contentmanagementsysteem voor webshops. Via het openbare endpoint
        <code>/api/import</code> kan iedereen op internet, <strong>zonder in te loggen</strong>, SQL-opdrachten
        uitvoeren. Dat werkt <strong>elke keer</strong> en er is <strong>geen gebruiker</strong> nodig die ergens op
        klikt. De aanvaller kan alle klantgegevens <strong>lezen</strong>, prijzen en bestellingen
        <strong>wijzigen</strong> en de database <strong>wissen</strong>. De schade blijft binnen KoffieCMS en zijn
        database.</p>

        <h3>Melding B — BrouwMail 6.4</h3>
        <p>In de webmail van BrouwMail zit een XSS-fout. Een aanvaller zonder account maakt een speciale link en moet
        het slachtoffer <strong>overhalen om erop te klikken</strong>. Daarna draait zijn script in de
        <strong>browser van het slachtoffer</strong> (dus buiten de mailserver zelf). Hij kan daarmee een beperkte
        hoeveelheid informatie uit de sessie lezen en beperkt iets namens het slachtoffer wijzigen. De
        beschikbaarheid wordt niet geraakt. Het werkt betrouwbaar en via internet.</p>

        <h3>Melding C — BonenKassa 2.3</h3>
        <p>Op het kassasysteem BonenKassa kan iemand die al met een <strong>gewoon gebruikersaccount</strong>
        <strong>lokaal</strong> is ingelogd, door een fout in een hulpprogramma volledige beheerdersrechten krijgen
        (<em>privilege escalation</em>). Er is geen andere gebruiker voor nodig, het werkt elke keer, en daarna kan
        hij alles lezen, wijzigen en stilleggen op die kassa. De schade blijft op het systeem zelf.</p>

        <details>
          <summary>Hulp: zo vertaal je de beschrijving naar metrieken</summary>
          <ul>
            <li>"Via internet" → AV:N. "Al ingelogd op het systeem" → AV:L.</li>
            <li>"Werkt elke keer" → AC:L.</li>
            <li>"Zonder inloggen" → PR:N. "Gewoon account" → PR:L.</li>
            <li>"Slachtoffer moet klikken" → UI:R. "Geen gebruiker nodig" → UI:N.</li>
            <li>"In de browser van het slachtoffer" → S:C. "Blijft binnen het systeem" → S:U.</li>
            <li>"Alles" → H. "Beperkt" → L. "Niet geraakt" → N.</li>
          </ul>
        </details>

        <div class="callout tip">
          <strong>Controle:</strong> je kunt ook een vectorstring in de calculator plakken. Melding A begint
          bijvoorbeeld met <code>CVSS:3.1/AV:N/AC:L/PR:N/UI:N/...</code>. Vul de rest zelf in.
        </div>

        <p>Valt je op hoe groot het verschil is tussen A en C? Allebei geven ze uiteindelijk "volledige controle",
        maar bij C moet de aanvaller al binnen zijn met een account. Die drempel drukt de score. Dat betekent niet
        dat C onbelangrijk is: aanvallers combineren vaak een lek om binnen te komen met een lek om hogere rechten te
        krijgen (<em>chaining</em>).</p>
      `,
      lab: { type: 'cvss' },
      questions: [
        { q: 'Wat is de CVSS v3.1-basisscore van melding A (KoffieCMS)?', answer: ['9.8', '9,8'], hint: 'AV:N/AC:L/PR:N/UI:N/S:U met overal High impact.', explain: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9.8 (Critical).' },
        { q: 'Wat is de basisscore van melding B (BrouwMail-XSS)?', answer: ['6.1', '6,1'], hint: 'UI:R, S:C, en C en I zijn Low, A is None.', explain: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N = 6.1 (Medium), een klassieke score voor reflected XSS.' },
        { q: 'Wat is de basisscore van melding C (BonenKassa)?', answer: ['7.8', '7,8'], hint: 'AV:L en PR:L, verder UI:N, S:U en overal High.', explain: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H = 7.8, een typische score voor lokale privilege escalation.' },
        { q: 'In welke ernstklasse valt melding C?', options: ['Medium', 'High', 'Critical'], answer: 1, explain: '7.8 ligt tussen 7.0 en 8.9, dus High.' },
      ],
    },

    {
      title: 'Taak 5 — CVSS v4.0, EPSS en de KEV-catalogus',
      content: `
        <h3>CVSS v4.0 in het kort</h3>
        <p>In november 2023 publiceerde FIRST <strong>CVSS v4.0</strong>. Het idee is hetzelfde (een score van 0 tot
        10), maar een aantal dingen is verfijnd:</p>
        <ul>
          <li><strong>AT — Attack Requirements</strong> is nieuw: zijn er speciale omstandigheden op het
          doelsysteem nodig (bijvoorbeeld een bepaalde configuratie)? Dit was in v3.1 deels in Attack Complexity
          verstopt.</li>
          <li><strong>User Interaction</strong> kent nu drie waarden: None, <em>Passive</em> (het slachtoffer
          bezoekt bijvoorbeeld alleen een pagina) en <em>Active</em> (het slachtoffer moet bewust iets doen, zoals een
          bestand openen en een waarschuwing wegklikken).</li>
          <li><strong>Scope is verdwenen.</strong> In plaats daarvan geef je de impact apart op voor het
          <em>kwetsbare systeem</em> (VC, VI, VA) en voor <em>volgende systemen</em> (SC, SI, SA).</li>
          <li>Er zijn namen voor welke metrieken je hebt meegenomen: <strong>CVSS-B</strong> (alleen basis),
          CVSS-BT (plus threat), CVSS-BE (plus environmental) en CVSS-BTE (alles).</li>
        </ul>
        <p>Toch kom je <strong>v3.1</strong> nog overal tegen: in de NVD, in adviezen van leveranciers en in
        scanners. In de praktijk moet je beide kunnen lezen. Kijk daarom altijd naar het voorvoegsel van de vector
        (<code>CVSS:3.1/</code> of <code>CVSS:4.0/</code>): een 9.3 in v4.0 is niet zomaar te vergelijken met een 9.3
        in v3.1.</p>

        <h3>Ernst is niet hetzelfde als kans</h3>
        <p>Elk jaar worden er tienduizenden CVE's gepubliceerd. Een groot deel scoort High of Critical. Als je alleen
        op CVSS sorteert, heb je al snel honderden "urgente" lekken — en dan patch je mogelijk eerst lekken die nooit
        misbruikt worden, terwijl een lek met een 7.5 waar criminelen al massaal op scannen blijft liggen. Daarom kijk
        je naast <em>ernst</em> ook naar de <em>kans op misbruik</em>.</p>

        <h3>EPSS: de weersverwachting</h3>
        <p>Het <strong>Exploit Prediction Scoring System (EPSS)</strong>, ook van FIRST, schat met een statistisch
        model de kans dat een CVE in de komende <strong>30 dagen</strong> in het wild misbruikt wordt. De uitkomst is
        een kans tussen 0 en 1 (bijvoorbeeld 0.02 = 2%, of 0.94 = 94%). Vergelijk het met een weersverwachting: CVSS
        zegt hoe zwaar de storm <em>zou</em> zijn, EPSS zegt hoe groot de kans is dat hij morgen ook echt komt.</p>

        <h3>KEV: het is al gebeurd</h3>
        <p>De <strong>Known Exploited Vulnerabilities (KEV)</strong>-catalogus van de Amerikaanse <strong>CISA</strong>
        is een lijst met kwetsbaarheden waarvan <em>bewezen</em> is dat ze echt misbruikt worden. Amerikaanse
        federale overheidsinstanties moeten lekken op die lijst binnen een vaste termijn verhelpen, maar organisaties
        wereldwijd gebruiken hem als "dit eerst"-lijst. Log4Shell staat er natuurlijk op. Ook het EUVD van ENISA geeft
        aan welke lekken actief misbruikt worden.</p>

        <table>
          <thead><tr><th>Bron</th><th>Vraag die het beantwoordt</th></tr></thead>
          <tbody>
            <tr><td>CVSS</td><td>Hoe erg is het technisch, als het misbruikt wordt?</td></tr>
            <tr><td>EPSS</td><td>Hoe groot is de kans op misbruik in de komende 30 dagen?</td></tr>
            <tr><td>KEV</td><td>Wordt het nu al aantoonbaar misbruikt?</td></tr>
          </tbody>
        </table>

        <div class="callout tip">
          <strong>Vuistregel:</strong> staat een lek in KEV en draait het op een systeem dat aan internet hangt, dan
          gaat het vóór vrijwel alles, ook vóór een hogere CVSS-score zonder bekend misbruik.
        </div>
      `,
      questions: [
        { q: 'Welke nieuwe basismetriek in CVSS v4.0 beschrijft of er speciale omstandigheden op het doelsysteem nodig zijn?', answer: ['AT', 'attack requirements', 'AT (attack requirements)'], hint: 'Twee letters, Attack ...', explain: 'Attack Requirements (AT) is nieuw in v4.0; het haalt een deel uit de oude Attack Complexity.' },
        { q: 'Wat voorspelt EPSS?', options: ['De kans dat een CVE in de komende 30 dagen misbruikt wordt', 'De technische ernst van een kwetsbaarheid', 'Hoeveel dagen een patch duurt'], answer: 0, explain: 'EPSS geeft een kans tussen 0 en 1 op misbruik in de komende 30 dagen.' },
        { q: 'Welke Amerikaanse organisatie beheert de Known Exploited Vulnerabilities-catalogus?', answer: ['CISA'], hint: 'Cybersecurity and Infrastructure Security Agency.', explain: 'CISA houdt de KEV-catalogus bij met kwetsbaarheden die aantoonbaar misbruikt worden.' },
        { q: 'Lek X: CVSS 9.1, EPSS 0.01, niet in KEV. Lek Y: CVSS 7.5, EPSS 0.92, wel in KEV. Beide op een internetserver. Welke patch je eerst?', options: ['Lek Y, omdat het al actief misbruikt wordt', 'Lek X, omdat de CVSS-score hoger is', 'Allebei pas bij de volgende kwartaalupdate'], answer: 0, explain: 'Bewezen misbruik (KEV) en een hoge EPSS wegen zwaarder dan een paar punten CVSS.' },
      ],
    },

    {
      title: 'Taak 6 — Patchmanagement, prioriteren en verantwoord melden',
      content: `
        <p>Weten dat er een lek is, is pas het begin. <strong>Patchmanagement</strong> is het proces waarmee je
        ervoor zorgt dat updates op tijd, gecontroleerd en zonder brokken worden doorgevoerd.</p>

        <h3>1. Weet wat je hebt: de asset-inventaris</h3>
        <p>Je kunt niet patchen wat je niet kent. Een <strong>asset-inventaris</strong> is een actuele lijst van
        alle systemen, met per systeem de software en versies, de eigenaar en hoe belangrijk het is. Voor software
        binnen applicaties gebruik je een SBOM (Software Bill of Materials). Tijdens Log4Shell hadden organisaties met
        een goede inventaris binnen uren overzicht; anderen waren weken aan het zoeken.</p>

        <h3>2. Ken je kroonjuwelen</h3>
        <p><strong>Kroonjuwelen</strong> zijn de systemen en gegevens die voor je organisatie het belangrijkst zijn:
        de webshop, het klantbestand, de kassa's, het patiëntendossier. Een lek met CVSS 7.8 op een kroonjuweel kan
        belangrijker zijn dan een 9.8 op een afgeschermde testserver. Dit is precies waar de environmental-metrieken
        van CVSS voor bedoeld zijn.</p>

        <h3>3. Prioriteer en plan</h3>
        <p>Een praktische volgorde: (1) in KEV of actief misbruikt én bereikbaar vanaf internet; (2) hoge EPSS of
        Critical op kroonjuwelen; (3) de rest volgens een vast ritme. Patches rol je bij voorkeur uit in een
        <strong>onderhoudsvenster</strong>: een afgesproken tijd waarin storing acceptabel is (bijvoorbeeld dinsdag
        22:00-23:00). Test eerst op een testomgeving, en zorg dat je terug kunt (back-up of snapshot). Bij actief
        misbruik wacht je niet op het reguliere venster, maar plan je een noodwijziging.</p>

        <h3>4. Als patchen (nog) niet kan: mitigaties</h3>
        <p>Soms is er nog geen patch (zero-day), of kan een systeem niet zomaar herstarten (een productielijn, een
        medisch apparaat). Dan neem je <strong>mitigaties</strong> of <strong>workarounds</strong>: maatregelen die het
        risico verkleinen zonder de fout zelf op te lossen.</p>
        <ul>
          <li>De kwetsbare functie uitzetten (bijvoorbeeld een import-API of een plug-in).</li>
          <li>De toegang beperken: firewallregels, alleen via VPN, of een WAF-regel die het aanvalspatroon blokkeert.</li>
          <li>Het systeem in een apart netwerksegment plaatsen.</li>
          <li>Extra monitoren op tekenen van misbruik.</li>
        </ul>
        <p>Een workaround is een pleister, geen genezing: noteer hem en plan alsnog de echte patch.</p>

        <h3>5. Coordinated vulnerability disclosure in Nederland</h3>
        <p>Wat als <em>jij</em> een lek vindt bij een ander? Nederland heeft een sterke traditie van
        <strong>coordinated vulnerability disclosure (CVD)</strong>, vroeger <em>responsible disclosure</em>
        genoemd. Het <strong>NCSC</strong> heeft een leidraad gepubliceerd: de melder meldt het lek vertrouwelijk bij
        de eigenaar, die krijgt redelijke tijd om het te verhelpen, en daarna mag het samen openbaar gemaakt worden.
        Organisaties beloven in hun CVD-beleid vaak geen aangifte te doen als je je aan de spelregels houdt (niet meer
        doen dan nodig, geen gegevens kopiëren, niets delen voordat het is opgelost). In Nederland helpt ook het
        vrijwilligersinstituut DIVD bij het melden van lekken op grote schaal.</p>
        <ul>
          <li><strong>security.txt</strong> (RFC 9116): een klein bestand op <code>/.well-known/security.txt</code>
          waarin een organisatie vertelt hoe en waar je een lek kunt melden.</li>
          <li><strong>Bug bounty:</strong> een programma waarin een organisatie onderzoekers uitnodigt om binnen
          duidelijke regels te zoeken, en een beloning geeft voor geldige meldingen.</li>
        </ul>

        <div class="callout warn">
          <strong>Grens:</strong> een CVD-beleid is geen vrijbrief. Ga je verder dan nodig (data downloaden, systemen
          verstoren, dreigen met publicatie), dan kan het alsnog strafbaar zijn onder art. 138ab Sr.
        </div>
      `,
      questions: [
        { q: 'Hoe heet een afgesproken tijdstip waarop patches mogen worden uitgerold omdat storing dan acceptabel is?', answer: ['onderhoudsvenster', 'maintenance window', 'onderhoudsvensters'], hint: 'In het voorbeeld: dinsdag 22:00-23:00.', explain: 'In een onderhoudsvenster is downtime afgesproken; bij actief misbruik plan je een noodwijziging.' },
        { q: 'Een medisch apparaat kan niet gepatcht worden. Wat is een goede mitigatie?', options: ['Het apparaat in een afgeschermd netwerksegment plaatsen en toegang beperken', 'Het lek negeren tot er een nieuw apparaat komt', 'Het apparaat rechtstreeks op internet zetten voor updates'], answer: 0, explain: 'Segmentatie en toegangsbeperking verkleinen het risico zolang patchen niet kan.' },
        { q: 'Op welk pad staat volgens RFC 9116 het security.txt-bestand?', answer: ['/.well-known/security.txt', '.well-known/security.txt'], hint: 'Het begint met /.well-known/', explain: 'security.txt staat op /.well-known/security.txt en vertelt waar je een lek kunt melden.' },
        { q: 'Wat hoort bij coordinated vulnerability disclosure?', options: ['Vertrouwelijk melden bij de eigenaar en die tijd geven om het op te lossen', 'Het lek direct op sociale media zetten', 'Zoveel mogelijk data downloaden als bewijs'], answer: 0, explain: 'Bij CVD meld je vertrouwelijk, doe je niet meer dan nodig en maak je het pas openbaar na herstel.' },
      ],
    },

    {
      title: 'Taak 7 — Praktijk: is onze server kwetsbaar?',
      content: `
        <p>Je bent dienstdoende beheerder bij het (fictieve) koffiebedrijf <strong>Brandpunt Koffie B.V.</strong>
        Vanochtend kwam er een stapel beveiligingsadviezen binnen. Jouw taak: uitzoeken of de webserver
        <code>web01</code> kwetsbaar is, en zo ja, wat je nu meteen kunt doen. Dit is precies de dagelijkse praktijk:
        <em>advies lezen → versie controleren → beslissen → handelen</em>.</p>

        <h3>Stap 1 — Oriënteren</h3>
        <p>Lees eerst de opdracht en de asset-inventaris. Let op welke systemen kroonjuwelen zijn.</p>
        <pre><code>cat LEESMIJ.txt
cat inventaris.txt</code></pre>

        <h3>Stap 2 — Welke versie draait er?</h3>
        <p>Veel software heeft een versiebestand of een changelog. Kijk ook even in de changelog: in welke versie
        kwam de import-API erbij?</p>
        <pre><code>cat /opt/koffiecms/VERSION
cat /opt/koffiecms/CHANGELOG.txt</code></pre>

        <h3>Stap 3 — Het juiste advies vinden</h3>
        <p>In de map <code>advies</code> staan meerdere adviezen. Met <code>grep -r</code> zoek je in één keer in
        alle bestanden in een map naar een woord:</p>
        <pre><code>ls advies
grep -r KoffieCMS advies</code></pre>
        <p>Open daarna het advies dat over KoffieCMS gaat met <code>cat</code> en lees het volledig: welke versies
        zijn getroffen, in welke versie is het opgelost, wat is de CVSS-score, wordt het al misbruikt, en wat is de
        workaround?</p>

        <h3>Stap 4 — De instelling controleren</h3>
        <p>Het advies noemt een instelling in het configuratiebestand. Zoek die op met <code>grep</code>:</p>
        <pre><code>grep import_api /etc/koffiecms/koffiecms.conf</code></pre>

        <div class="callout info">
          <strong>Denk als beheerder:</strong> de versie valt binnen het getroffen bereik, het lek staat als actief
          misbruikt gemeld, de CVSS is 9.8 en <code>web01</code> is een kroonjuweel aan internet. Wachten tot het
          onderhoudsvenster van dinsdag is dan geen goed idee. Je zet nu de workaround aan (import_api uit, WAF-regel),
          plant een noodwijziging om naar de gepatchte versie te gaan en controleert de logs op tekenen van eerder
          misbruik. Merk ook op dat <code>test03</code> al een nieuwere versie draait: daar kun je de update eerst testen.
        </div>

        <div class="callout tip">
          <strong>Tip:</strong> typ je een commando verkeerd, gebruik dan de pijltjestoets omhoog. Met <code>help</code>
          zie je welke commando's beschikbaar zijn.
        </div>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student', host: 'web01',
        home: '/home/student', cwd: '/home/student',
        motd: 'web01 — Brandpunt Koffie B.V. (fictieve labserver). Begin met: cat LEESMIJ.txt',
        fs: { ...KWETS_FS },
        denied: ['/root', '/etc/shadow'],
      },
      questions: [
        { q: 'Welke versie van KoffieCMS draait er op web01?', answer: ['4.2.1', 'koffiecms 4.2.1'], hint: 'cat /opt/koffiecms/VERSION', explain: 'web01 draait KoffieCMS 4.2.1, en dat valt binnen het getroffen bereik 4.2.0 t/m 4.2.2.' },
        { q: 'In welke versie is het lek uit JVT-SA-2026-014 opgelost?', answer: ['4.2.3', 'koffiecms 4.2.3'], hint: 'Zoek de regel "Opgelost in" in het advies.', explain: 'Het lek is opgelost in 4.2.3; tot die update gebruik je de workaround.' },
        { q: 'Welke controlecode (vlag) staat onderaan het advies over KoffieCMS?', answer: ['JVT{advies_gelezen_versie_kwetsbaar}'], hint: 'grep -r KoffieCMS advies, en dan cat op het juiste bestand.', explain: 'Je hebt het juiste advies gevonden en volledig gelezen.' },
        { q: 'Welke vlag staat bij de instelling import_api in het configuratiebestand?', answer: ['JVT{workaround_eerst_dan_patchen}'], hint: 'grep import_api /etc/koffiecms/koffiecms.conf', explain: 'De workaround (import_api uit) koopt tijd, maar de echte oplossing blijft de update naar 4.2.3.' },
      ],
    },
  ],

  terms: [
    { term: 'Kwetsbaarheid', def: 'Een fout in software, hardware of configuratie waardoor vertrouwelijkheid, integriteit of beschikbaarheid in gevaar kan komen.' },
    { term: 'Exploit', def: 'Code of een stappenplan waarmee een kwetsbaarheid daadwerkelijk misbruikt wordt.' },
    { term: 'Zero-day', def: 'Een kwetsbaarheid die al bekend is bij aanvallers of misbruikt wordt terwijl er nog geen patch is.' },
    { term: 'CVE', def: 'Common Vulnerabilities and Exposures: uniek ID per kwetsbaarheid (bijv. CVE-2021-44228), beheerd binnen het CVE-programma van MITRE.' },
    { term: 'CNA', def: 'CVE Numbering Authority: organisatie die zelf CVE-ID\'s mag toekennen voor haar eigen producten of terrein.' },
    { term: 'CWE', def: 'Common Weakness Enumeration: lijst met soorten fouten, zoals CWE-79 (XSS) en CWE-89 (SQL-injectie).' },
    { term: 'NVD', def: 'National Vulnerability Database van NIST: verrijkt CVE\'s met o.a. CVSS-scores, CWE en getroffen versies.' },
    { term: 'EUVD', def: 'European Vulnerability Database van ENISA, sinds 2025, voortkomend uit de NIS2-richtlijn.' },
    { term: 'CVSS', def: 'Common Vulnerability Scoring System van FIRST: score van 0.0 tot 10.0 voor de technische ernst van een kwetsbaarheid.' },
    { term: 'EPSS', def: 'Exploit Prediction Scoring System: kans (0 tot 1) dat een CVE in de komende 30 dagen misbruikt wordt.' },
    { term: 'KEV', def: 'Known Exploited Vulnerabilities: catalogus van CISA met kwetsbaarheden die aantoonbaar misbruikt worden.' },
    { term: 'CVD', def: 'Coordinated vulnerability disclosure: een lek vertrouwelijk melden bij de eigenaar en pas openbaar maken na herstel.' },
  ],

  resources: [
    { title: 'FIRST — CVSS v3.1-calculator', url: 'https://www.first.org/cvss/calculator/3.1' },
    { title: 'NIST — National Vulnerability Database', url: 'https://nvd.nist.gov/' },
    { title: 'CISA — Known Exploited Vulnerabilities Catalog', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' },
    { title: 'NCSC (Nederland) — kwetsbaarheden melden en adviezen', url: 'https://www.ncsc.nl/' },
  ],
});
