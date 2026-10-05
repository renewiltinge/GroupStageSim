/* Room: Threat intelligence & MITRE ATT&CK */

const KOFFIEKAT_RAPPORT = `DREIGINGSRAPPORT JVT-CTI-2026-031 (TLP:AMBER)
Onderwerp: campagne KOFFIEKAT tegen Nederlandse logistieke bedrijven
Datum: 2026-09-28  Opgesteld door: JVT Threat Intelligence Team
Rapportcode: JVT{koffiekat_iocs_verzameld}

SAMENVATTING
Sinds half september zien we phishingmails met een nepfactuur van "PakketPost Zakelijk".
De mails komen van facturen[at]pakketpost-zakelijk[.]jvt[.]lab en bevatten een bijlage factuur_sep.zip.
In het archief zit een snelkoppeling die een PowerShell-loader start (loader.dll via rundll32.exe).
Bij twee slachtoffers kwam de aanvaller eerst binnen via een ongepatchte NetScaler-gateway (CVE-2023-4966).

INFRASTRUCTUUR
Command-and-control (C2): update-koffie[.]jvt[.]lab
Beacon-URL: hxxps://update-koffie[.]jvt[.]lab/api/beacon
Payload-download: hxxps://cdn-koffiekat[.]jvt[.]lab/drop/stage2
C2-IP-adressen: 203.0.113[.]88 en 203.0.113[.]91
Scanverkeer vanaf: 198.51.100(.)7
Exfiltratie naar: 192.0.2[.]14
Let op: 203.0.113[.]88 werd ook gezien als afzender van de phishingmails.

BESTANDEN
factuur_sep.zip   MD5     3abad12a9579508025468c528c47a68c
loader.dll        SHA-1   804170c7cff2213dd6ddf2ebcd52e4c676eed2eb
loader.dll        SHA-256 376f44f25a6468576e2eaf0909bb9642cb4189aea3c281e6d024b6591a5c8a02
stage2            SHA-256 8c705855ce66b814b3d5f81aa6e296be7c407a8c55650ff8ce32d338f61c821f
versleutelaar     SHA-256 93c774331ca4611d7a21c9dc8c7bfafd8d6a10d9c2cef9338c0c85aba26e8328

GEDRAG (TTP's)
Initial Access via spearphishing-bijlage, uitvoering via PowerShell met -enc,
persistentie via een geplande taak, uitlezen van LSASS, laterale beweging via RDP
met gestolen accounts en tot slot versleuteling van fileshares.

ADVIES
Blokkeer de indicatoren, patch de gateway en zoek in je logs naar het gedrag hierboven.
`;

const KOFFIEKAT_LOG = `2026-09-29 07:58:02  WS-LOG-12  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\explorer.exe  User=JVT\\s.bakker
2026-09-29 08:14:31  MAIL-GW   Gateway  Delivered  From=facturen@pakketpost-zakelijk.jvt.lab  To=s.bakker@jvt.lab  Attachment=factuur_sep.zip  Verdict=clean
2026-09-29 08:16:05  WS-LOG-12  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe  ParentImage=C:\\Windows\\explorer.exe  CommandLine="powershell.exe -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA"  User=JVT\\s.bakker
2026-09-29 08:16:09  WS-LOG-12  Sysmon  EventID=3  NetworkConnect  Image=powershell.exe  DestinationHostname=cdn-koffiekat.jvt.lab  DestinationIp=203.0.113.91  DestinationPort=443
2026-09-29 08:16:14  WS-LOG-12  Sysmon  EventID=11  FileCreate  Image=powershell.exe  TargetFilename=C:\\Users\\s.bakker\\AppData\\Roaming\\loader.dll
2026-09-29 08:16:20  WS-LOG-12  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\rundll32.exe  CommandLine="rundll32.exe C:\\Users\\s.bakker\\AppData\\Roaming\\loader.dll,Start"
2026-09-29 08:17:02  WS-LOG-12  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\schtasks.exe  CommandLine="schtasks /create /tn KoffieUpdate /tr \\"rundll32.exe loader.dll,Start\\" /sc onlogon"
2026-09-29 08:20:44  WS-LOG-12  Sysmon  EventID=3  NetworkConnect  Image=rundll32.exe  DestinationHostname=update-koffie.jvt.lab  DestinationIp=203.0.113.88  DestinationPort=443
2026-09-29 08:25:10  WS-LOG-12  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\net.exe  CommandLine="net group \\"Domain Admins\\" /domain"
2026-09-29 08:25:31  WS-LOG-12  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\nltest.exe  CommandLine="nltest /dclist:jvt.lab"
2026-09-29 08:31:47  WS-LOG-12  Sysmon  EventID=10  ProcessAccess  SourceImage=rundll32.exe  TargetImage=C:\\Windows\\System32\\lsass.exe  GrantedAccess=0x1010
2026-09-29 08:32:00  WS-LOG-12  EDR     ALERT  Severity=HIGH  Detection=Credential.LsassAccess  Process=rundll32.exe  analyst-note=JVT{lsass_is_credential_access}
2026-09-29 08:40:12  SRV-FS02   Security  EventID=4624  LogonType=10  TargetUser=JVT\\adm.vermeer  SourceIp=10.20.1.12
2026-09-29 08:40:55  SRV-FS02   Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\cmd.exe  User=JVT\\adm.vermeer
2026-09-29 08:52:18  SRV-FS02   Sysmon  EventID=1  ProcessCreate  Image=C:\\Program Files\\7-Zip\\7z.exe  CommandLine="7z.exe a -pKoffie C:\\Temp\\archief.7z D:\\Shares\\Klanten"
2026-09-29 09:05:40  SRV-FS02   Sysmon  EventID=3  NetworkConnect  Image=rundll32.exe  DestinationIp=192.0.2.14  DestinationPort=443  BytesSent=2147483648
2026-09-29 09:30:01  SRV-FS02   Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\vssadmin.exe  CommandLine="vssadmin.exe delete shadows /all /quiet"
2026-09-29 09:30:20  SRV-FS02   FileAudit  FileRename  D:\\Shares\\Klanten\\contracten.xlsx -> contracten.xlsx.koffie
2026-09-29 09:30:21  SRV-FS02   FileAudit  FileRename  D:\\Shares\\Klanten\\tarieven.docx -> tarieven.docx.koffie
2026-09-29 09:30:21  SRV-FS02   FileAudit  FileRename  D:\\Shares\\Planning\\ritten_oktober.xlsx -> ritten_oktober.xlsx.koffie
2026-09-29 09:30:25  SRV-FS02   FileAudit  FileCreate  D:\\Shares\\Klanten\\KOFFIE_LEESMIJ.txt
2026-09-29 09:31:02  SRV-FS02   EDR     ALERT  Severity=HIGH  Detection=Behavior.MassFileEncrypt  Process=rundll32.exe  Files=2210
`;

CS.registerRoom({
  id: 'threat-intel-attack',
  path: 'defensief',
  order: 4,
  title: 'Threat intelligence & MITRE ATT&CK',
  icon: '🧭',
  difficulty: 'Gemiddeld',
  minutes: 65,
  summary: 'Leer denken als een threat-intelanalist: van IOC\'s en de Pyramid of Pain tot TLP, veilig delen en het koppelen van aanvalsgedrag aan MITRE ATT&CK, met een fictieve campagne als oefencasus.',
  objectives: [
    'Uitleggen wat threat intelligence is, de vier soorten (strategisch, tactisch, operationeel, technisch) en de intelligence-cyclus',
    'Met de Pyramid of Pain uitleggen waarom gedrag (TTP\'s) waardevoller is dan hashes en IP-adressen',
    'Indicatoren uit een dreigingsrapport halen, defangen en veilig delen volgens TLP 2.0',
    'Verdachte URL\'s uit een phishingcampagne ontleden en de echte host vinden',
    'De 14 tactieken van MITRE ATT&CK Enterprise benoemen en logregels aan tactieken en technieken koppelen',
    'Uitleggen hoe intel in Nederland gedeeld wordt via het NCSC, ISAC\'s en MISP',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is threat intelligence?',
      content: `
        <p>Een SOC krijgt elke dag duizenden meldingen. Welke zijn belangrijk? Welke aanvallers hebben het op jouw
        sector gemunt, en hoe werken ze? Om die vragen te beantwoorden heb je <strong>threat intelligence</strong>
        (dreigingsinformatie) nodig: kennis over aanvallers, hun doelen en hun werkwijze, verzameld en geanalyseerd
        zodat je er <em>betere beslissingen</em> mee neemt.</p>

        <h3>De analogie van het weerbericht</h3>
        <p>Een losse meting ("het is nu 14 graden in De Bilt") is data. Een weerbericht ("morgen storm uit het
        westen, zet je tuinmeubels binnen") is intelligence: data die geduid is en een handeling oplevert. Zo werkt het
        ook in security. Een lijst met IP-adressen is data; "deze groep valt deze maand logistieke bedrijven aan via
        nepfacturen, controleer je mailfilter" is intelligence.</p>

        <h3>Vier soorten intelligence</h3>
        <table>
          <thead><tr><th>Soort</th><th>Voor wie</th><th>Voorbeeld</th></tr></thead>
          <tbody>
            <tr><td><strong>Strategisch</strong></td><td>Directie, bestuur</td><td>"Ransomwaregroepen richten zich steeds vaker op de zorg. Investeer in back-ups en herstel."</td></tr>
            <tr><td><strong>Tactisch</strong></td><td>Securityarchitecten, SOC-leads</td><td>De werkwijze (TTP's) van aanvallers: "ze komen binnen via phishing en bewegen zijdelings met RDP."</td></tr>
            <tr><td><strong>Operationeel</strong></td><td>Incident responders, threat hunters</td><td>Informatie over een concrete, lopende campagne: wie, wanneer, tegen wie, met welk doel.</td></tr>
            <tr><td><strong>Technisch</strong></td><td>SOC-analisten, firewall- en SIEM-beheer</td><td>Concrete indicatoren: IP-adressen, domeinen, hashes die je direct kunt blokkeren of zoeken.</td></tr>
          </tbody>
        </table>
        <div class="callout info">
          <strong>Let op:</strong> niet elke bron deelt de soorten precies hetzelfde in. Sommige modellen voegen
          technisch en operationeel samen. Het idee blijft hetzelfde: hoe hoger in de organisatie, hoe minder detail en
          hoe langer de houdbaarheid.
        </div>

        <h3>De intelligence-cyclus</h3>
        <p>Goede intel ontstaat niet vanzelf. Analisten werken in een cyclus die steeds opnieuw rondgaat:</p>
        <ol>
          <li><strong>Richting (planning)</strong> — wat willen we weten? Bijvoorbeeld: "welke groepen vallen
          Nederlandse logistiek aan?" Deze vragen heten <em>intelligence requirements</em>.</li>
          <li><strong>Verzamelen</strong> (collection) — bronnen raadplegen: eigen logs, rapporten van leveranciers,
          het NCSC, open bronnen.</li>
          <li><strong>Verwerken</strong> (processing) — ruwe data ordenen, ontdubbelen, vertalen, in een vast formaat
          zetten.</li>
          <li><strong>Analyseren</strong> — duiden: wat betekent dit voor óns? Hoe betrouwbaar is de bron?</li>
          <li><strong>Verspreiden</strong> (dissemination) — het juiste product naar de juiste mensen: een
          IOC-lijst naar het SOC, een korte notitie naar de directie.</li>
          <li><strong>Feedback</strong> — was het bruikbaar? Wat missen we nog? Dat stuurt de volgende ronde.</li>
        </ol>
        <p>Een voorbeeld: het SOC vraagt "is die nieuwe phishinggolf ook bij ons binnengekomen?" Het intelteam
        verzamelt de indicatoren uit een rapport, zet ze om naar zoekopdrachten, analyseert de treffers en meldt:
        "drie medewerkers kregen de mail, één opende de bijlage." Het SOC geeft terug dat de lijst ook domeinen moet
        bevatten, en de cyclus begint opnieuw.</p>
      `,
      questions: [
        { q: 'Welke soort threat intelligence is bedoeld voor de directie en gaat over trends en risico\'s op lange termijn?', options: ['Strategisch', 'Tactisch', 'Operationeel', 'Technisch'], answer: 0, explain: 'Strategische intel is weinig technisch en helpt bestuurders bij keuzes over budget en risico.' },
        { q: 'Een lijst met kwaadaardige IP-adressen en hashes voor in de firewall en het SIEM: welke soort intel is dat?', options: ['Strategisch', 'Tactisch', 'Technisch', 'Juridisch'], answer: 2, explain: 'Concrete, direct bruikbare indicatoren zijn technische intelligence.' },
        { q: 'Wat is de laatste stap van de intelligence-cyclus, die de volgende ronde stuurt?', answer: ['feedback', 'terugkoppeling'], hint: 'Was het product bruikbaar? Wat missen we?', explain: 'Via feedback hoort het intelteam wat werkte en wat er nog nodig is.' },
      ],
    },

    {
      title: 'Taak 2 — IOC\'s versus gedrag: de Pyramid of Pain',
      content: `
        <p>Een <strong>Indicator of Compromise</strong> (IOC) is een technisch spoor van een aanval: een IP-adres, een
        domeinnaam, de hash van een malwarebestand. IOC's zijn handig, want je kunt ze direct blokkeren of in je logs
        zoeken. Maar ze hebben een groot nadeel: een aanvaller kan ze heel makkelijk veranderen.</p>

        <h3>De analogie van de inbreker</h3>
        <p>Stel dat de politie een inbreker zoekt. "Hij reed in een rode auto met kenteken X" is nuttig, tot hij een
        andere auto neemt. "Hij droeg een blauwe jas" helpt tot morgen. Maar "hij komt altijd 's nachts binnen via een
        kantelraam aan de achterkant en neemt alleen laptops mee" is gedrag. Dat verandert hij niet zomaar, want dat is
        zijn vak. Wie op gedrag let, vangt hem ook in een andere auto.</p>

        <h3>De Pyramid of Pain</h3>
        <p>Beveiligingsonderzoeker David Bianco zette dit idee in 2013 in een piramide: hoe hoger je een aanvaller
        detecteert, hoe meer <em>pijn</em> het hem kost om eromheen te werken.</p>
        <table>
          <thead><tr><th>Laag (van onder naar boven)</th><th>Voorbeeld</th><th>Pijn voor de aanvaller</th></tr></thead>
          <tbody>
            <tr><td>Hashwaarden</td><td><code>3abad12a…</code> (MD5 van een bestand)</td><td>Triviaal: één bit wijzigen geeft een nieuwe hash</td></tr>
            <tr><td>IP-adressen</td><td><code>203.0.113.88</code></td><td>Makkelijk: nieuwe server huren</td></tr>
            <tr><td>Domeinnamen</td><td><code>update-koffie.jvt.lab</code></td><td>Simpel: nieuw domein registreren</td></tr>
            <tr><td>Netwerk-/hostartefacten</td><td>Een vaste User-Agent, een geplande taak met een vaste naam</td><td>Vervelend: tooling aanpassen</td></tr>
            <tr><td>Tools</td><td>Een specifieke loader of tool voor het dumpen van wachtwoorden</td><td>Uitdagend: nieuwe tools bouwen of kopen</td></tr>
            <tr><td><strong>TTP's</strong></td><td>"Leest LSASS uit en beweegt zijdelings via RDP"</td><td><strong>Zwaar</strong>: hele werkwijze omgooien</td></tr>
          </tbody>
        </table>

        <figure class="diagram">
          <svg viewBox="0 0 420 230" role="img" aria-label="Pyramid of Pain">
            <polygon points="210,10 400,220 20,220" fill="var(--accent-soft)" stroke="currentColor"/>
            <line x1="183" y1="40" x2="237" y2="40" stroke="currentColor"/>
            <line x1="156" y1="75" x2="264" y2="75" stroke="currentColor"/>
            <line x1="128" y1="110" x2="292" y2="110" stroke="currentColor"/>
            <line x1="101" y1="145" x2="319" y2="145" stroke="currentColor"/>
            <line x1="74" y1="180" x2="346" y2="180" stroke="currentColor"/>
            <text x="210" y="34" text-anchor="middle" fill="currentColor" font-size="13">TTP's</text>
            <text x="210" y="64" text-anchor="middle" fill="currentColor" font-size="13">Tools</text>
            <text x="210" y="98" text-anchor="middle" fill="currentColor" font-size="13">Netwerk-/hostartefacten</text>
            <text x="210" y="133" text-anchor="middle" fill="currentColor" font-size="13">Domeinnamen</text>
            <text x="210" y="168" text-anchor="middle" fill="currentColor" font-size="13">IP-adressen</text>
            <text x="210" y="205" text-anchor="middle" fill="currentColor" font-size="13">Hashwaarden</text>
          </svg>
          <figcaption>De Pyramid of Pain: onderaan makkelijk te blokkeren maar ook makkelijk te omzeilen, bovenaan het
          gedrag waar een aanvaller het meest last van heeft als je het detecteert.</figcaption>
        </figure>

        <h3>TTP's</h3>
        <p><strong>TTP</strong> staat voor <em>Tactics, Techniques and Procedures</em>: het doel van een stap (tactiek,
        bijvoorbeeld "inloggegevens stelen"), de manier (techniek, bijvoorbeeld "LSASS-geheugen uitlezen") en de
        precieze uitvoering door een bepaalde groep (procedure). In taak 6 zie je hoe MITRE ATT&amp;CK die TTP's
        ordent.</p>

        <div class="callout tip">
          <strong>Tip:</strong> IOC's zijn niet waardeloos. Ze zijn snel en goedkoop in te zetten en vangen de
          luie aanvaller. Maar ze <em>verlopen</em>: een IP-adres van vorige maand kan nu van een onschuldige website
          zijn. Combineer daarom snelle IOC-blokkades met detectieregels op gedrag.
        </div>
      `,
      questions: [
        { q: 'Welke laag staat helemaal onderaan de Pyramid of Pain (het makkelijkst te omzeilen)?', options: ['Hashwaarden', 'Domeinnamen', 'Tools', 'TTP\'s'], answer: 0, explain: 'Eén bit aan een bestand wijzigen levert al een totaal andere hash op.' },
        { q: 'Waar staat de afkorting TTP voor? (Engels)', answer: ['Tactics, Techniques and Procedures', 'tactics techniques and procedures', 'tactics, techniques, and procedures', 'tactics techniques procedures'], hint: 'Tactieken, technieken en ...', explain: 'TTP\'s beschrijven het gedrag van een aanvaller: doel, manier en precieze uitvoering.' },
        { q: 'Waarom kost detectie op TTP\'s een aanvaller de meeste moeite?', options: ['Omdat hij dan zijn hele werkwijze moet veranderen in plaats van alleen een server of bestand', 'Omdat TTP\'s versleuteld zijn', 'Omdat TTP\'s alleen op Linux werken', 'Omdat TTP\'s geheim zijn'], answer: 0, explain: 'Een nieuw IP of domein is zo geregeld; een nieuwe werkwijze bedenken en oefenen niet.' },
      ],
    },

    {
      title: 'Taak 3 — Praktijk: IOC\'s uit een dreigingsrapport halen',
      content: `
        <p>Je werkt bij het SOC van een logistiek bedrijf. Het intelteam stuurt een rapport over de (fictieve)
        campagne <strong>KOFFIEKAT</strong>. Voordat je iets kunt blokkeren of zoeken, moet je de indicatoren eruit
        halen. Met de hand is dat foutgevoelig: één verkeerd overgetypt teken in een hash en je zoekt naar het
        verkeerde bestand. Daarom gebruik je een <strong>IOC-extractor</strong>.</p>

        <h3>Wat doet de extractor?</h3>
        <p>Het lab hieronder leest de vrije tekst van het rapport en haalt er automatisch IPv4-adressen, domeinen,
        URL's, e-mailadressen, hashes en CVE-nummers uit. Het herkent ook <em>gedefangde</em> notaties zoals
        <code>hxxps://</code> en <code>[.]</code> (daarover meer in taak 4). Per soort telt het de <strong>unieke</strong>
        waarden: staat een IP-adres twee keer in de tekst, dan telt het één keer.</p>

        <h3>Hashes herkennen aan hun lengte</h3>
        <table>
          <thead><tr><th>Algoritme</th><th>Lengte in hex-tekens</th></tr></thead>
          <tbody>
            <tr><td>MD5</td><td>32</td></tr>
            <tr><td>SHA-1</td><td>40</td></tr>
            <tr><td>SHA-256</td><td>64</td></tr>
          </tbody>
        </table>

        <h3>Wat is een CVE?</h3>
        <p>Een <strong>CVE</strong> (Common Vulnerabilities and Exposures) is het wereldwijde volgnummer van een
        bekende kwetsbaarheid, in de vorm <code>CVE-jaar-nummer</code>. Staat er een CVE in een rapport, dan is je
        eerste vraag: hebben wij dit product, en is het gepatcht? Dat maakt een CVE een van de meest
        <em>actiegerichte</em> regels in een rapport.</p>

        <h3>Opdracht</h3>
        <ol>
          <li>Bekijk het rapport in het lab en laat de indicatoren extraheren.</li>
          <li>Kijk naar de tellingen per soort. Klopt het met wat je zelf in de tekst ziet?</li>
          <li>Let op: één C2-IP-adres komt twee keer in het rapport voor. Hoeveel <em>unieke</em> IPv4-adressen zijn er?</li>
          <li>Lees ook de kop van het rapport goed: daar staat een rapportcode die je als vlag invult.</li>
        </ol>

        <div class="callout warn">
          <strong>Denk na voor je blokkeert:</strong> automatisch alles blokkeren wat een extractor vindt, gaat
          weleens mis. Een rapport kan ook legitieme domeinen noemen (bijvoorbeeld van een cloudprovider die de
          aanvaller misbruikt). Blokkeer je die, dan leg je je eigen bedrijf plat. Controleer daarom altijd de
          <em>context</em> van elke indicator: wat is hij in dit verhaal, en hoe lang is hij geldig?
        </div>

        <p>Een goede werkwijze is <strong>prioriteren</strong>: de CVE patchen (structureel), de C2-domeinen en -IP's
        blokkeren en in je proxy- en DNS-logs van de afgelopen weken zoeken (snel), en een detectieregel schrijven op
        het gedrag (blijvend). Zo gebruik je zowel de onderkant als de bovenkant van de Pyramid of Pain.</p>
      `,
      lab: { type: 'ioc', text: KOFFIEKAT_RAPPORT },
      questions: [
        { q: 'Hoeveel unieke IPv4-adressen staan er in het KOFFIEKAT-rapport?', answer: ['4', 'vier'], hint: 'Kijk naar de IPv4-telling in het lab, of tel zelf in de sectie INFRASTRUCTUUR. Een dubbel adres telt één keer.', explain: '203.0.113.88, 203.0.113.91, 198.51.100.7 en 192.0.2.14. Het adres 203.0.113.88 staat er twee keer in, maar telt als één unieke indicator.' },
        { q: 'Hoeveel SHA-256-hashes staan er in het rapport?', answer: ['3', 'drie'], hint: 'SHA-256 is 64 hex-tekens lang.', explain: 'loader.dll, stage2 en de versleutelaar hebben elk een SHA-256-hash.' },
        { q: 'Welk CVE-nummer noemt het rapport?', answer: ['CVE-2023-4966'], hint: 'Zoek naar CVE- in de tekst of de CVE-telling in het lab.', explain: 'De aanvaller kwam bij twee slachtoffers binnen via een ongepatchte NetScaler-gateway. Patchen heeft dus hoge prioriteit.' },
        { q: 'Wat is de rapportcode (vlag) in de kop van het rapport?', answer: ['JVT{koffiekat_iocs_verzameld}'], hint: 'Kijk in de eerste regels van de tekst in het lab.' },
      ],
    },

    {
      title: 'Taak 4 — Veilig delen: defangen, TLP 2.0 en de Nederlandse aanpak',
      content: `
        <p>Intel wordt pas echt waardevol als je hem deelt. Wat de ene organisatie vandaag ziet, kan de andere morgen
        tegenhouden. Maar delen moet <em>veilig</em> en met duidelijke afspraken.</p>

        <h3>Defangen: de tanden eruit</h3>
        <p>Plak je <code>https://update-koffie.jvt.lab/api/beacon</code> in een mail of chat, dan maakt het programma
        er vaak een klikbare link van, of haalt het automatisch een voorbeeld op. Dan heb je per ongeluk contact
        gemaakt met de server van de aanvaller. Daarom <strong>defang</strong> je indicatoren: je maakt ze onklikbaar,
        maar voor mensen nog leesbaar.</p>
        <table>
          <thead><tr><th>Origineel</th><th>Gedefanged</th></tr></thead>
          <tbody>
            <tr><td><code>https://</code></td><td><code>hxxps://</code></td></tr>
            <tr><td><code>update-koffie.jvt.lab</code></td><td><code>update-koffie[.]jvt[.]lab</code></td></tr>
            <tr><td><code>203.0.113.88</code></td><td><code>203.0.113[.]88</code></td></tr>
            <tr><td><code>naam@domein.jvt.lab</code></td><td><code>naam[at]domein[.]jvt[.]lab</code></td></tr>
          </tbody>
        </table>
        <p>Het omgekeerde, <strong>refangen</strong>, doe je pas vlak voordat je een indicator in je SIEM of firewall
        zet. Het IOC-lab uit taak 3 kan beide.</p>

        <h3>TLP 2.0: wie mag het zien?</h3>
        <p>Het <strong>Traffic Light Protocol</strong> (TLP) is een simpele afspraak, beheerd door FIRST, over hoe ver
        je informatie mag doorgeven. Sinds versie 2.0 (2022) zijn er vijf labels:</p>
        <table>
          <thead><tr><th>Label</th><th>Betekenis</th></tr></thead>
          <tbody>
            <tr><td><strong>TLP:RED</strong></td><td>Alleen voor de mensen die het direct ontvangen. Niet verder delen, ook niet binnen je eigen organisatie.</td></tr>
            <tr><td><strong>TLP:AMBER+STRICT</strong></td><td>Alleen binnen je eigen organisatie, op need-to-know-basis.</td></tr>
            <tr><td><strong>TLP:AMBER</strong></td><td>Binnen je eigen organisatie én met je klanten, op need-to-know-basis.</td></tr>
            <tr><td><strong>TLP:GREEN</strong></td><td>Binnen je community (bijvoorbeeld je sector), maar niet openbaar op internet.</td></tr>
            <tr><td><strong>TLP:CLEAR</strong></td><td>Geen beperking: mag openbaar. (Dit heette vroeger TLP:WHITE.)</td></tr>
          </tbody>
        </table>
        <div class="callout info">
          <strong>Voorbeeld:</strong> het KOFFIEKAT-rapport is TLP:AMBER. Je mag het dus delen met collega's die het
          nodig hebben en met klanten die je beschermt, maar niet in een openbare LinkedIn-post of op een forum zetten.
        </div>

        <h3>Delen in Nederland</h3>
        <ul>
          <li>Het <strong>NCSC</strong> (Nationaal Cyber Security Centrum) deelt dreigingsinformatie en
          beveiligingsadviezen, vooral met vitale aanbieders en overheden, en publiceert openbare adviezen.</li>
          <li><strong>ISAC's</strong> (Information Sharing and Analysis Centres) zijn overleggroepen per sector,
          bijvoorbeeld voor energie, financiële instellingen of havens. Organisaties uit dezelfde sector delen daar in
          vertrouwen wat ze zien, vaak onder TLP:AMBER of GREEN.</li>
          <li>Sectorale CERT's zoals Z-CERT (zorg) en het Digital Trust Center (voor bedrijven buiten de vitale
          sectoren) helpen ook bij het verspreiden van intel.</li>
          <li><strong>MISP</strong> is een open-source platform om indicatoren en dreigingsrapporten gestructureerd te
          delen. Organisaties koppelen hun MISP-servers aan elkaar, zodat nieuwe IOC's automatisch binnenkomen en
          zelfs direct naar het SIEM gaan.</li>
        </ul>
        <p>Voor automatische uitwisseling bestaan standaarden: <strong>STIX</strong> beschrijft dreigingsinformatie in
        een vast formaat, en <strong>TAXII</strong> is het protocol om die berichten uit te wisselen.</p>

        <div class="callout warn">
          <strong>Let op privacy:</strong> dreigingsinformatie kan persoonsgegevens bevatten, zoals het mailadres van
          een slachtoffer of een gebruikersnaam uit je logs. Haal die eruit voordat je deelt. De AVG geldt ook voor
          security-teams.
        </div>
      `,
      questions: [
        { q: 'Hoe schrijf je het IP-adres 192.0.2.14 gedefanged (laatste punt vervangen)?', answer: ['192.0.2[.]14', '192[.]0[.]2[.]14'], hint: 'Vervang de punt door [.]', explain: 'Met [.] is het adres onklikbaar, maar nog prima leesbaar voor een analist.' },
        { q: 'Welk TLP-label betekent: alleen binnen je eigen organisatie, niet naar klanten?', options: ['TLP:CLEAR', 'TLP:GREEN', 'TLP:AMBER', 'TLP:AMBER+STRICT'], answer: 3, explain: 'AMBER+STRICT beperkt delen tot je eigen organisatie; gewone AMBER staat ook klanten toe.' },
        { q: 'Welk TLP 2.0-label verving het oude TLP:WHITE?', answer: ['TLP:CLEAR', 'CLEAR', 'TLP CLEAR'], hint: 'Geen beperking, mag openbaar.', explain: 'In TLP 2.0 heet het openbare label CLEAR.' },
        { q: 'Hoe heet het open-source platform waarmee organisaties indicatoren en rapporten met elkaar delen?', answer: ['MISP'], hint: 'Vier letters.', explain: 'MISP-servers kunnen aan elkaar gekoppeld worden, zodat IOC\'s automatisch gedeeld worden.' },
      ],
    },

    {
      title: 'Taak 5 — Praktijk: phishing-URL\'s ontleden',
      content: `
        <p>De KOFFIEKAT-campagne gebruikt ook phishinglinks. Uit de mailgateway en meldingen van medewerkers heb je
        vijf URL's verzameld. Jouw taak: bepalen welke kwaadaardig zijn en waar ze écht naartoe gaan, zodat je de
        juiste hosts kunt blokkeren en in je proxylogs kunt zoeken wie erop geklikt heeft.</p>

        <h3>Hoe lees je een URL?</h3>
        <pre><code>https://gebruiker@host.voorbeeld.jvt.lab:8443/pad/pagina?id=12

schema          https
gebruikersdeel  gebruiker
host            host.voorbeeld.jvt.lab
poort           8443
pad             /pad/pagina
query           id=12</code></pre>
        <ul>
          <li>De <strong>host</strong> is waar je browser echt verbinding mee maakt. Alles vóór een <code>@</code> is
          een gebruikersdeel en wordt genegeerd. Bij <code>https://www.nederbank.nl@203.0.113.45/</code> ga je dus
          naar <code>203.0.113.45</code>, niet naar de bank. Dat heet de <strong>@-truc</strong>.</li>
          <li>Een hostnaam lees je <strong>van rechts naar links</strong>. Bij
          <code>pakketpost.nl.bezorging-status.jvt.lab</code> bepaalt het laatste stuk wie de eigenaar is. Het begin
          (<code>pakketpost.nl</code>) is maar een subdomein dat de aanvaller zelf heeft verzonnen.</li>
          <li><strong>Punycode</strong> (<code>xn--</code>) is de manier waarop internationale tekens in domeinnamen
          worden opgeslagen. Aanvallers gebruiken het voor lookalike-domeinen: een Cyrillische <code>е</code> ziet
          er hetzelfde uit als een Latijnse <code>e</code>. Dit heet een <em>homograafaanval</em>.</li>
          <li>Een kaal <strong>IP-adres</strong> als host, <code>http</code> zonder <code>s</code> of een vreemde
          <strong>poort</strong> zijn ook rode vlaggen. Legitieme bedrijven sturen je zelden naar een kaal IP-adres
          op poort 8081.</li>
        </ul>

        <h3>Opdracht</h3>
        <p>Het lab ontleedt elke URL en toont de rode vlaggen. Loop ze één voor één door en beantwoord de vragen.
        Bedenk bij elke URL: wat zou ik blokkeren, de hele host of alleen dit pad?</p>

        <div class="callout tip">
          <strong>Tip:</strong> klik nooit op een verdachte link om "even te kijken". Analyseer hem als tekst, zoals
          in dit lab, of open hem alleen in een afgeschermde sandbox. Voor het blokkeren kies je meestal de
          <em>host</em>: aanvallers wisselen paden en parameters net zo makkelijk als hashes.
        </div>

        <p>Een URL die geen enkele rode vlag geeft, is daarmee nog niet veilig. Een aanvaller kan ook een gehackte,
        legitieme website misbruiken. Het lab helpt je prioriteren, maar het oordeel blijft van jou.</p>
      `,
      lab: {
        type: 'url',
        urls: [
          'https://www.nederbank.nl@203.0.113.45/inloggen',
          'http://pakketpost.nl.bezorging-status.jvt.lab/track?code=NL8812',
          'https://xn--nderbank-c8g.jvt.lab/verificatie',
          'http://198.51.100.23:8081/pakket/volgen',
          'https://intranet.jvt.lab/rooster',
        ],
      },
      questions: [
        { q: 'Met welke host maakt de browser echt verbinding bij https://www.nederbank.nl@203.0.113.45/inloggen?', answer: ['203.0.113.45'], hint: 'Alles vóór de @ is het gebruikersdeel.', explain: 'Door de @-truc lijkt het een link naar de bank, maar de echte host is het IP-adres 203.0.113.45.' },
        { q: 'Welke poort gebruikt de URL met het IP-adres 198.51.100.23?', answer: ['8081'], hint: 'Kijk naar het getal na de dubbele punt.', explain: 'Een ongebruikelijke poort op een kaal IP-adres is een sterke rode vlag.' },
        { q: 'Welke URL gebruikt punycode om op een bekend domein te lijken?', options: ['https://xn--nderbank-c8g.jvt.lab/verificatie', 'https://intranet.jvt.lab/rooster', 'http://198.51.100.23:8081/pakket/volgen', 'https://www.nederbank.nl@203.0.113.45/inloggen'], answer: 0, explain: 'xn-- verraadt punycode: achter de schermen staat een Cyrillisch teken dat op een Latijnse letter lijkt.' },
        { q: 'Bij http://pakketpost.nl.bezorging-status.jvt.lab/track: wat is het echte probleem?', options: ['pakketpost.nl is slechts een subdomein van het domein van de aanvaller', 'De URL heeft een queryparameter', 'Het pad heet /track', 'Er is niets aan de hand, het is pakketpost.nl'], answer: 0, explain: 'Lees van rechts naar links: de host valt onder bezorging-status.jvt.lab. De merknaam vooraan is misleiding.' },
      ],
    },

    {
      title: 'Taak 6 — MITRE ATT&CK en de Cyber Kill Chain',
      content: `
        <p>Als iedereen gedrag op zijn eigen manier beschrijft, kun je intel moeilijk vergelijken. Daarom maakte de
        Amerikaanse non-profit MITRE <strong>ATT&amp;CK</strong> (Adversarial Tactics, Techniques and Common
        Knowledge): een openbare, gratis kennisbank van aanvalsgedrag, gebaseerd op echte, waargenomen aanvallen.
        Het is de gemeenschappelijke taal geworden van threat intel, detectie en red teaming.</p>

        <h3>Tactieken: het "waarom"</h3>
        <p>Een <strong>tactiek</strong> is het doel van de aanvaller in een bepaalde stap. De Enterprise-matrix telt
        <strong>14 tactieken</strong>:</p>
        <ol>
          <li><strong>Reconnaissance</strong> — informatie verzamelen over het doelwit</li>
          <li><strong>Resource Development</strong> — infrastructuur en middelen opbouwen (domeinen, servers, tools)</li>
          <li><strong>Initial Access</strong> — binnenkomen, bijvoorbeeld via phishing</li>
          <li><strong>Execution</strong> — kwaadaardige code uitvoeren</li>
          <li><strong>Persistence</strong> — blijven, ook na een herstart</li>
          <li><strong>Privilege Escalation</strong> — hogere rechten krijgen</li>
          <li><strong>Defense Evasion</strong> — detectie ontwijken</li>
          <li><strong>Credential Access</strong> — wachtwoorden en andere inloggegevens stelen</li>
          <li><strong>Discovery</strong> — de omgeving verkennen (accounts, servers, domeincontrollers)</li>
          <li><strong>Lateral Movement</strong> — zijdelings naar andere systemen bewegen</li>
          <li><strong>Collection</strong> — interessante data verzamelen</li>
          <li><strong>Command and Control</strong> — contact houden met de besmette systemen</li>
          <li><strong>Exfiltration</strong> — data naar buiten brengen</li>
          <li><strong>Impact</strong> — schade aanrichten: versleutelen, wissen, verstoren</li>
        </ol>

        <h3>Technieken: het "hoe"</h3>
        <p>Onder elke tactiek staan <strong>technieken</strong> met een vast ID, soms verder verdeeld in
        sub-technieken (met een punt erachter). Een paar die je vaak tegenkomt:</p>
        <table>
          <thead><tr><th>ID</th><th>Techniek</th><th>Tactiek(en)</th></tr></thead>
          <tbody>
            <tr><td><code>T1566</code></td><td>Phishing</td><td>Initial Access</td></tr>
            <tr><td><code>T1059</code></td><td>Command and Scripting Interpreter (<code>T1059.001</code> = PowerShell)</td><td>Execution</td></tr>
            <tr><td><code>T1053</code></td><td>Scheduled Task/Job</td><td>Execution, Persistence, Privilege Escalation</td></tr>
            <tr><td><code>T1078</code></td><td>Valid Accounts</td><td>o.a. Initial Access, Persistence, Defense Evasion</td></tr>
            <tr><td><code>T1003</code></td><td>OS Credential Dumping (<code>T1003.001</code> = LSASS Memory)</td><td>Credential Access</td></tr>
            <tr><td><code>T1021</code></td><td>Remote Services (<code>T1021.001</code> = Remote Desktop Protocol)</td><td>Lateral Movement</td></tr>
            <tr><td><code>T1490</code></td><td>Inhibit System Recovery</td><td>Impact</td></tr>
            <tr><td><code>T1486</code></td><td>Data Encrypted for Impact</td><td>Impact</td></tr>
          </tbody>
        </table>
        <p>Je ziet dat één techniek bij meerdere tactieken kan horen: een geplande taak kan dienen om code uit te
        voeren én om te blijven. Het doel in de context bepaalt de tactiek.</p>

        <h3>Hoe gebruik je ATT&amp;CK als verdediger?</h3>
        <ul>
          <li><strong>Detectie</strong>: per techniek staat beschreven welke databronnen je nodig hebt en hoe je hem
          kunt detecteren.</li>
          <li><strong>Gaten vinden</strong>: kleur in de matrix in welke technieken je al detecteert. De witte
          vakjes zijn je blinde vlekken.</li>
          <li><strong>Prioriteren</strong>: ATT&amp;CK beschrijft ook bekende groepen en welke technieken zij
          gebruiken. Vallen die groepen jouw sector aan, dan begin je bij hun technieken.</li>
        </ul>

        <h3>Ter vergelijking: de Cyber Kill Chain</h3>
        <p>Ouder en eenvoudiger is de <strong>Cyber Kill Chain</strong> van Lockheed Martin (2011), met zeven stappen:
        Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command &amp; Control en Actions on
        Objectives. Het idee: verbreek je één schakel, dan mislukt de aanval. De Kill Chain is fijn om een aanval in
        grote lijnen uit te leggen. ATT&amp;CK is veel gedetailleerder en beschrijft vooral wat er <em>na</em> het
        binnenkomen gebeurt. In de praktijk gebruik je ze naast elkaar.</p>

        <div class="callout info">
          <strong>Ethiek:</strong> ATT&amp;CK beschrijft aanvalstechnieken, maar is bedoeld om je te verdedigen. Wil
          je technieken naspelen (bijvoorbeeld om je detectie te testen), doe dat dan alleen in je eigen lab of met
          schriftelijke toestemming. Zonder toestemming is het computervredebreuk (art. 138ab Sr).
        </div>
      `,
      questions: [
        { q: 'Hoeveel tactieken telt de MITRE ATT&CK Enterprise-matrix?', answer: ['14', 'veertien'], hint: 'Van Reconnaissance tot Impact.', explain: 'Er zijn 14 Enterprise-tactieken, van Reconnaissance tot en met Impact.' },
        { q: 'Welk techniek-ID hoort bij Phishing?', answer: ['T1566'], hint: 'Kijk in de tabel met technieken.', explain: 'T1566 Phishing valt onder de tactiek Initial Access.' },
        { q: 'Wat is het verschil tussen een tactiek en een techniek in ATT&CK?', options: ['Een tactiek is het doel (waarom), een techniek de manier (hoe)', 'Een tactiek is altijd een stuk malware', 'Een techniek is het doel, een tactiek de tool', 'Er is geen verschil'], answer: 0, explain: 'Bijvoorbeeld: tactiek Credential Access (doel), techniek OS Credential Dumping (manier).' },
        { q: 'Welk model met zeven stappen, van Reconnaissance tot Actions on Objectives, komt van Lockheed Martin?', answer: ['Cyber Kill Chain', 'kill chain', 'de cyber kill chain'], hint: 'Een militaire term voor de keten van een aanval.', explain: 'De Cyber Kill Chain is een eenvoudiger model; ATT&CK is gedetailleerder.' },
      ],
    },

    {
      title: 'Taak 7 — Praktijk: een aanval koppelen aan ATT&CK',
      content: `
        <p>Een dag na het KOFFIEKAT-rapport slaat de EDR alarm bij jouw bedrijf. Je haalt het logfragment op van
        werkplek <code>WS-LOG-12</code> en fileserver <code>SRV-FS02</code>. Jouw taak als analist: het verhaal
        reconstrueren en elke stap aan een ATT&amp;CK-tactiek koppelen. Zo kun je straks precies zeggen waar je
        detectie werkte, waar niet, en welke technieken je extra moet afdekken.</p>

        <h3>Werkwijze</h3>
        <ol>
          <li>Lees het log van boven naar beneden: het is op tijd gesorteerd.</li>
          <li>Stel bij elke regel de vraag: <em>wat probeert de aanvaller hier te bereiken?</em> Dat is de tactiek.</li>
          <li>Gebruik het filter in het lab. Probeer bijvoorbeeld <code>ProcessCreate</code>, <code>NetworkConnect</code>,
          <code>lsass</code> of <code>/vssadmin|schtasks/</code>.</li>
          <li>Vergelijk de gevonden IP-adressen en domeinen met de IOC's uit taak 3. Kloppen ze? Dan weet je zeker
          dat dit KOFFIEKAT is.</li>
        </ol>

        <h3>Spiekbrief: veelvoorkomende sporen</h3>
        <table>
          <thead><tr><th>Spoor in de log</th><th>Waarschijnlijke tactiek</th></tr></thead>
          <tbody>
            <tr><td>Mail met bijlage afgeleverd, daarna een proces vanuit de gebruiker</td><td>Initial Access</td></tr>
            <tr><td><code>powershell.exe -enc ...</code></td><td>Execution (en Defense Evasion door het verhullen)</td></tr>
            <tr><td><code>schtasks /create ... /sc onlogon</code></td><td>Persistence</td></tr>
            <tr><td><code>net group</code>, <code>nltest /dclist</code></td><td>Discovery</td></tr>
            <tr><td>Toegang tot <code>lsass.exe</code></td><td>Credential Access</td></tr>
            <tr><td>Aanmelding type 10 (RDP) op een ander systeem</td><td>Lateral Movement</td></tr>
            <tr><td>Grote uitgaande verbinding na het inpakken van data</td><td>Collection en Exfiltration</td></tr>
            <tr><td><code>vssadmin delete shadows</code>, massaal hernoemen</td><td>Impact</td></tr>
          </tbody>
        </table>

        <div class="callout tip">
          <strong>Tip:</strong> let op de gebruiker in de RDP-aanmelding. Het is een geldig beheerdersaccount, maar
          inloggen vanaf een werkplek van een gewone medewerker is niet normaal. Gestolen, geldige accounts (T1078
          Valid Accounts) zijn lastig te detecteren, want technisch is de login "correct". Je herkent ze aan gedrag dat
          afwijkt van de baseline.
        </div>

        <p>In de log staat ook een notitie van een collega-analist bij een van de alerts. Die notitie is je vlag.
        Hoeveel tijd zit er tussen de eerste uitvoering van PowerShell en de versleuteling? Dat vertelt je hoe snel je
        had moeten reageren, en het is een belangrijke les voor de evaluatie (lessons learned).</p>
      `,
      lab: { type: 'logs', title: 'koffiekat-edr-export.log', lines: KOFFIEKAT_LOG },
      questions: [
        { q: 'De regel met schtasks /create ... /sc onlogon: welke tactiek is dat vooral?', options: ['Persistence', 'Exfiltration', 'Reconnaissance', 'Impact'], answer: 0, explain: 'Een geplande taak bij het aanmelden zorgt dat de loader na elke herstart terugkomt (T1053 Scheduled Task/Job).' },
        { q: 'rundll32.exe opent lsass.exe (Sysmon EventID 10). Welke tactiek hoort daarbij?', options: ['Discovery', 'Credential Access', 'Lateral Movement', 'Command and Control'], answer: 1, explain: 'LSASS bevat inloggegevens in het geheugen. Uitlezen is T1003 OS Credential Dumping, tactiek Credential Access.' },
        { q: 'Welke tactiek past bij vssadmin.exe delete shadows en het massaal hernoemen naar .koffie?', options: ['Impact', 'Initial Access', 'Execution', 'Collection'], answer: 0, explain: 'Schaduwkopieën wissen (T1490) en bestanden versleutelen (T1486) vallen onder Impact.' },
        { q: 'Wat is de analistennotitie (vlag) bij de EDR-alert in de log?', answer: ['JVT{lsass_is_credential_access}'], hint: 'Filter in het lab op ALERT of op analyst-note.' },
      ],
    },
  ],
  terms: [
    { term: 'Threat intelligence', def: 'Geanalyseerde kennis over aanvallers, hun doelen en werkwijze, waarmee je betere beveiligingsbeslissingen neemt.' },
    { term: 'Intelligence-cyclus', def: 'De terugkerende stappen richting, verzamelen, verwerken, analyseren, verspreiden en feedback.' },
    { term: 'Indicator of Compromise (IOC)', def: 'Technisch spoor van een aanval, zoals een IP-adres, domein, URL of bestandshash.' },
    { term: 'Pyramid of Pain', def: 'Model van David Bianco: hoe hoger in de piramide (van hashes tot TTP\'s) je detecteert, hoe meer moeite het de aanvaller kost.' },
    { term: 'TTP', def: 'Tactics, Techniques and Procedures: het gedrag van een aanvaller, van doel tot precieze uitvoering.' },
    { term: 'Defangen', def: 'Een indicator onklikbaar maken voor veilig delen, bijvoorbeeld hxxps:// en [.] in plaats van https:// en een punt.' },
    { term: 'TLP (Traffic Light Protocol)', def: 'Afspraak van FIRST over hoe ver je informatie mag delen: CLEAR, GREEN, AMBER, AMBER+STRICT of RED.' },
    { term: 'MITRE ATT&CK', def: 'Openbare kennisbank van aanvalsgedrag, geordend in tactieken (waarom) en technieken (hoe) met vaste ID\'s zoals T1566.' },
    { term: 'Cyber Kill Chain', def: 'Zevenstappenmodel van Lockheed Martin dat een aanval beschrijft van verkenning tot het bereiken van het doel.' },
    { term: 'ISAC', def: 'Information Sharing and Analysis Centre: sectorgroep waarin organisaties in vertrouwen dreigingsinformatie delen.' },
    { term: 'MISP', def: 'Open-source platform om indicatoren en dreigingsrapporten gestructureerd en automatisch te delen.' },
    { term: 'Homograafaanval', def: 'Lookalike-domein met tekens uit een ander schrift (bijvoorbeeld Cyrillisch), herkenbaar aan punycode (xn--).' },
  ],
  resources: [
    { title: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' },
    { title: 'FIRST — Traffic Light Protocol (TLP) 2.0', url: 'https://www.first.org/tlp/' },
    { title: 'MISP — Open Source Threat Intelligence Platform', url: 'https://www.misp-project.org/' },
    { title: 'NCSC — Nationaal Cyber Security Centrum', url: 'https://www.ncsc.nl/' },
  ],
});
