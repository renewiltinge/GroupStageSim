/* Room: Incident response (NIST CSF 2.0) */

const EDR_LOG = `2026-10-03 01:58:12  JVT-FS01  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\explorer.exe  User=JVT\\mkoster
2026-10-03 02:03:44  JVT-FS01  Sysmon  EventID=1  ProcessCreate  Image=C:\\Users\\mkoster\\Downloads\\factuur_oktober.pdf.exe  User=JVT\\mkoster  CommandLine="factuur_oktober.pdf.exe"
2026-10-03 02:03:46  JVT-FS01  Sysmon  EventID=3  NetworkConnect  Image=factuur_oktober.pdf.exe  DestinationIp=203.0.113.66  DestinationPort=443
2026-10-03 02:04:01  JVT-FS01  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\vssadmin.exe  CommandLine="vssadmin.exe delete shadows /all /quiet"  User=JVT\\mkoster
2026-10-03 02:04:02  JVT-FS01  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\wbadmin.exe  CommandLine="wbadmin delete catalog -quiet"  User=JVT\\mkoster
2026-10-03 02:04:03  JVT-FS01  Sysmon  EventID=1  ProcessCreate  Image=C:\\Windows\\System32\\bcdedit.exe  CommandLine="bcdedit /set {default} recoveryenabled No"  User=JVT\\mkoster
2026-10-03 02:04:30  JVT-FS01  EDR  ALERT  Severity=HIGH  Detection=Ransom.Generic.Locker  Process=factuur_oktober.pdf.exe  incident-tag=JVT{schaduwkopieen_gewist}
2026-10-03 02:04:41  JVT-FS01  FileAudit  FileRename  C:\\Shares\\Financien\\begroting_2026.xlsx -> begroting_2026.xlsx.jvtlock
2026-10-03 02:04:41  JVT-FS01  FileAudit  FileRename  C:\\Shares\\Financien\\jaarrekening.docx -> jaarrekening.docx.jvtlock
2026-10-03 02:04:42  JVT-FS01  FileAudit  FileRename  C:\\Shares\\Financien\\salarissen.xlsx -> salarissen.xlsx.jvtlock
2026-10-03 02:04:42  JVT-FS01  FileAudit  FileRename  C:\\Shares\\HR\\contracten.docx -> contracten.docx.jvtlock
2026-10-03 02:04:43  JVT-FS01  FileAudit  FileRename  C:\\Shares\\HR\\verzuim.xlsx -> verzuim.xlsx.jvtlock
2026-10-03 02:04:43  JVT-FS01  FileAudit  FileRename  C:\\Shares\\Projecten\\offerte.pdf -> offerte.pdf.jvtlock
2026-10-03 02:04:44  JVT-FS01  FileAudit  FileRename  C:\\Shares\\Projecten\\planning.xlsx -> planning.xlsx.jvtlock
2026-10-03 02:04:58  JVT-FS01  FileAudit  FileCreate  C:\\Shares\\Financien\\LEES_DIT_HERSTEL.txt
2026-10-03 02:05:10  JVT-FS01  FileAudit  FileCreate  C:\\Shares\\HR\\LEES_DIT_HERSTEL.txt
2026-10-03 02:05:22  JVT-FS01  Sysmon  EventID=3  NetworkConnect  Image=factuur_oktober.pdf.exe  DestinationIp=203.0.113.66  DestinationPort=443
2026-10-03 02:06:00  JVT-FS01  EDR  ALERT  Severity=HIGH  Detection=Behavior.MassFileEncrypt  Process=factuur_oktober.pdf.exe  Files=1284
2026-10-03 02:06:05  JVT-FS01  EDR  ACTION  Host-Isolation=ENABLED  Reason=automatic-containment
`;

CS.registerRoom({
  id: 'incident-response',
  path: 'defensief',
  order: 2,
  title: 'Incident response volgens NIST',
  icon: '🚨',
  difficulty: 'Gemiddeld',
  minutes: 60,
  summary: 'Hoe je een cyberincident gestructureerd aanpakt met het NIST Cybersecurity Framework 2.0 en de zes functies, van detectie en containment tot herstel, lessons learned en de meldplichten (AVG en NIS2).',
  objectives: [
    'Uitleggen wat een security-incident is en waarom voorbereiding het halve werk is',
    'De zes functies van het NIST Cybersecurity Framework 2.0 benoemen (Govern, Identify, Protect, Detect, Respond, Recover)',
    'De praktische incident-levenscyclus doorlopen: detectie en analyse, containment, eradication, recovery en lessons learned',
    'In een EDR-tijdlijn een ransomware-aanval herkennen',
    'De verschillen tussen containment, eradication en recovery uitleggen',
    'De meldplichten bij de Autoriteit Persoonsgegevens (AVG) en onder NIS2 (Cyberbeveiligingswet) benoemen',
  ],
  tasks: [
    {
      title: "Taak 1 — Wat is een incident, en waarom voorbereiding telt",
      content: `
        <p>Een <strong>event</strong> (gebeurtenis) is alles wat er op een systeem gebeurt: een login, een update, een
        geblokkeerde verbinding. De meeste events zijn volkomen normaal. Een <strong>security-incident</strong> is iets
        anders: een gebeurtenis die de vertrouwelijkheid, integriteit of beschikbaarheid van je informatie
        daadwerkelijk schaadt of bedreigt. Een gelukte inbraak, een datalek, een ransomware-besmetting: dat zijn
        incidenten.</p>

        <h3>De analogie van de brandweer</h3>
        <p>Incident response (incidentrespons) is de brandweer van cybersecurity. En net als bij de brandweer geldt:
        je oefent en bereidt je voor <em>voordat</em> het brandt. Als het pand in de fik staat, is het te laat om nog
        te bedenken waar de brandslang hangt en wie de leiding heeft. Dezelfde logica geldt hier: het meeste werk zit
        in de voorbereiding.</p>

        <h3>Waarom een plan?</h3>
        <p>Tijdens een echt incident is het chaos: de telefoon gaat, de directie wil antwoorden, systemen liggen plat
        en iedereen kijkt naar elkaar. Een vooraf afgesproken <strong>incident-responsplan</strong> neemt die paniek
        weg. Het beantwoordt vragen die je niet in het heetst van de strijd wilt bedenken:</p>
        <ul>
          <li>Wie heeft de leiding (de <em>incident lead</em>)? Wie mag besluiten een systeem van het net te halen?</li>
          <li>Wie bel je: intern (IT, directie, communicatie, juridisch) en extern (NCSC, leverancier, Politie)?</li>
          <li>Waar staan de back-ups, en wanneer zijn ze voor het laatst getest?</li>
          <li>Hoe stellen we bewijs veilig zonder sporen te vernietigen?</li>
        </ul>

        <div class="callout tip">
          <strong>Tip:</strong> een plan dat in een la ligt helpt niet. Goede teams houden een <em>oefening</em>
          (een <em>tabletop exercise</em>): je speelt een incident op papier door en ontdekt zo waar het plan rammelt
          — rustig, zonder dat er echt iets op het spel staat.
        </div>

        <p>In deze room gebruiken we een modern, gestructureerd kader om incidenten aan te pakken: het NIST
        Cybersecurity Framework. Dat behandelen we in de volgende taak.</p>
      `,
      questions: [
        { q: "Wat is het verschil tussen een event en een security-incident?", options: ["Een incident schaadt of bedreigt echt de vertrouwelijkheid, integriteit of beschikbaarheid; een event is elke gebeurtenis", "Een event is altijd erger dan een incident", "Er is geen verschil", "Een incident gebeurt alleen op Windows"], answer: 0, explain: "Elk incident is een event, maar niet elk event is een incident. Een incident richt schade aan of dreigt dat te doen." },
        { q: "Waarom is voorbereiding de belangrijkste fase van incident response?", options: ["Omdat je tijdens de chaos van een echt incident geen rollen, contacten en back-ups meer wilt uitzoeken", "Omdat voorbereiding het goedkoopst is", "Omdat je dan geen plan meer nodig hebt", "Dat is het niet; alleen de reactie telt"], answer: 0, explain: "Zoals de brandweer oefent vóór de brand, regel je rollen, contacten en back-ups vóór het incident." },
        { q: "Hoe heet een oefening waarin je een incident op papier doorspeelt om je plan te testen?", answer: ["tabletop exercise", "tabletop", "tabletop-oefening"], hint: "Engelse term; je doet het aan tafel, niet in productie.", explain: "Een tabletop exercise onthult zwakke plekken in je plan zonder echte schade." },
      ],
    },

    {
      title: "Taak 2 — Het NIST Cybersecurity Framework 2.0: zes functies",
      content: `
        <p>Het <strong>NIST Cybersecurity Framework</strong> (CSF) is een wereldwijd veelgebruikt kader, opgesteld door
        het Amerikaanse NIST (National Institute of Standards and Technology). Het helpt organisaties hun
        cyberweerbaarheid te ordenen. In versie <strong>2.0</strong> (2024) bestaat het uit <strong>zes functies</strong>.
        De eerste, GOVERN, is in 2.0 nieuw en omvat de andere vijf.</p>

        <table>
          <thead><tr><th>Functie</th><th>Nederlands</th><th>Waar het over gaat</th></tr></thead>
          <tbody>
            <tr><td><strong>GOVERN</strong></td><td>Besturen</td><td>Strategie, rollen, beleid en risicomanagement: wie is waarvoor verantwoordelijk?</td></tr>
            <tr><td><strong>IDENTIFY</strong></td><td>Identificeren</td><td>Weten wat je hebt en wat de risico's zijn: systemen, data, kwetsbaarheden.</td></tr>
            <tr><td><strong>PROTECT</strong></td><td>Beschermen</td><td>Maatregelen om aanvallen te voorkomen: toegangsbeheer, updates, back-ups, training.</td></tr>
            <tr><td><strong>DETECT</strong></td><td>Detecteren</td><td>Aanvallen en anomalieen op tijd opmerken: monitoring, logs, SIEM, IDS.</td></tr>
            <tr><td><strong>RESPOND</strong></td><td>Reageren</td><td>Handelen tijdens een incident: inperken, communiceren, onderzoeken.</td></tr>
            <tr><td><strong>RECOVER</strong></td><td>Herstellen</td><td>Terug naar normaal: systemen en data herstellen, en leren van wat gebeurde.</td></tr>
          </tbody>
        </table>

        <h3>Van vier fasen naar zes functies</h3>
        <p>Jarenlang leerde iedereen incidentrespons via de klassieke <strong>vier-fasen-cyclus</strong> uit de oude
        NIST-gids SP 800-61: <em>voorbereiding, detectie en analyse, inperking/uitroeiing/herstel, en activiteit na het
        incident</em>. In <strong>SP 800-61 Revisie 3</strong> (2025) heeft NIST de incidentrespons opnieuw opgehangen:
        niet meer als losstaande cyclus, maar <strong>rond de zes CSF 2.0-functies</strong>. De gedachte: incidentrespons
        is geen apart eilandje, maar verweven met je hele beveiligingsaanpak. Je bereidt je voor (Govern, Identify,
        Protect), je merkt het incident op (Detect), je handelt (Respond) en je herstelt (Recover).</p>

        <div class="callout info">
          <strong>Waarom dit handig is:</strong> de zes functies geven je een gemeenschappelijke taal. Of je nu met de
          directie praat (vooral Govern en Identify) of met de SOC-analist (vooral Detect en Respond), iedereen plaatst
          zijn werk in hetzelfde plaatje. Het is geen strak stappenplan maar een kapstok om je maatregelen aan op te
          hangen.
        </div>

        <h3>De analogie van het ziekenhuis</h3>
        <p>Denk aan gezondheid. GOVERN is het ziekenhuisbestuur dat beleid maakt. IDENTIFY is je medisch dossier: weten
        wat je hebt. PROTECT is gezond leven en vaccineren. DETECT is de controle die een probleem vroeg opspoort.
        RESPOND is de behandeling. RECOVER is de revalidatie én de evaluatie zodat het de volgende keer beter gaat.</p>
      `,
      questions: [
        { q: "Hoeveel functies heeft het NIST Cybersecurity Framework 2.0?", options: ["Vier", "Vijf", "Zes", "Zeven"], answer: 2, explain: "CSF 2.0 heeft zes functies: Govern, Identify, Protect, Detect, Respond en Recover." },
        { q: "Welke functie is nieuw in CSF 2.0 en omvat de andere vijf (strategie, rollen, beleid)?", answer: ["Govern", "govern", "Besturen", "GOVERN"], hint: "Engels voor 'besturen'.", explain: "GOVERN (besturen) is in 2.0 toegevoegd en zet de overkoepelende strategie en verantwoordelijkheden neer." },
        { q: "Rond welk kader organiseert NIST SP 800-61 Revisie 3 (2025) de incidentrespons, in plaats van de oude vier-fasen-cyclus?", options: ["De zes functies van CSF 2.0", "De drie wetten van robotica", "De OSI-lagen", "De CIA-triade alleen"], answer: 0, explain: "SP 800-61r3 hangt incidentrespons op aan de zes CSF 2.0-functies in plaats van aan een losstaande 4-fasen-cyclus." },
        { q: "Onder welke functie valt het opmerken van een aanval via monitoring, logs en een SIEM?", answer: ["Detect", "detect", "Detecteren", "DETECT"], hint: "Engels voor 'detecteren'.", explain: "DETECT gaat over op tijd opmerken dat er iets mis is: monitoring, logs, SIEM en IDS." },
      ],
    },

    {
      title: "Taak 3 — De incident-levenscyclus in de praktijk",
      content: `
        <p>Het framework is de kapstok; nu de kleren. In de praktijk doorloop je bij elk incident een aantal
        herkenbare stappen. We gebruiken de klassieke, praktische benamingen (die prima naast de CSF-functies passen).</p>

        <h3>De stappen</h3>
        <ol>
          <li><strong>Voorbereiding</strong> (Govern, Identify, Protect) — plan, rollen, contacten, back-ups en
          tooling op orde. Zie taak 1.</li>
          <li><strong>Detectie en analyse</strong> (Detect) — opmerken dat er iets mis is en uitzoeken wat, hoe erg,
          en welke systemen geraakt zijn. Hier lees je logs en bouw je een tijdlijn (volgende taak).</li>
          <li><strong>Inperking / containment</strong> (Respond) — de bloeding stelpen. Je isoleert het getroffen
          systeem zodat de aanval zich niet verder verspreidt, bijvoorbeeld door het van het netwerk te halen.</li>
          <li><strong>Uitroeiing / eradication</strong> (Respond) — de oorzaak weghalen: malware verwijderen, het
          misbruikte account blokkeren, het gat (de kwetsbaarheid) dichten.</li>
          <li><strong>Herstel / recovery</strong> (Recover) — systemen en data schoon en veilig terugbrengen,
          bijvoorbeeld vanaf een betrouwbare back-up, en extra in de gaten houden of het echt weg is.</li>
          <li><strong>Geleerde lessen / lessons learned</strong> (Recover, Govern) — kort na afloop: wat ging goed, wat
          kon beter, welke maatregel voorkomt herhaling? Dit sluit de cirkel en voedt weer de voorbereiding.</li>
        </ol>

        <div class="callout warn">
          <strong>Volgorde telt:</strong> eerst <em>containment</em> (verspreiding stoppen), dan pas
          <em>eradication</em> (oorzaak weghalen) en <em>recovery</em> (terugbrengen). Herstel je te vroeg vanaf een
          back-up terwijl de aanvaller nog binnen is of het gat nog openstaat, dan ben je zo weer besmet. Eerst de
          deur dicht, dan de boel opruimen.
        </div>

        <h3>De analogie van de lekkage</h3>
        <p>Je huis staat blank. <strong>Containment</strong>: draai de hoofdkraan dicht zodat er geen water meer bij
        komt. <strong>Eradication</strong>: repareer de gesprongen leiding (de oorzaak). <strong>Recovery</strong>:
        pomp het water weg, droog de boel en trek weer in. <strong>Lessons learned</strong>: plaats een lekdetector,
        zodat je het de volgende keer eerder ziet. Dweilen met de kraan open — meteen herstellen zonder eerst de
        oorzaak weg te nemen — is precies wat je niet wilt.</p>
      `,
      questions: [
        { q: "Wat is de juiste volgorde van deze drie stappen?", options: ["Containment, eradication, recovery", "Recovery, containment, eradication", "Eradication, recovery, containment", "Recovery, eradication, containment"], answer: 0, explain: "Eerst de verspreiding stoppen (containment), dan de oorzaak weghalen (eradication), dan herstellen (recovery)." },
        { q: "Een getroffen laptop van het netwerk halen zodat ransomware zich niet verder verspreidt, is een voorbeeld van...", answer: ["containment", "inperking"], hint: "De 'bloeding stelpen'; Engelse term begint met c.", explain: "Het isoleren om verspreiding te stoppen is containment (inperking)." },
        { q: "Waarom mag je niet te vroeg herstellen vanaf een back-up?", options: ["Als de aanvaller nog binnen is of het gat nog openstaat, ben je zo weer besmet", "Back-ups zijn altijd kapot", "Herstellen kost te veel tijd", "Dat mag juist wel altijd meteen"], answer: 0, explain: "Zonder eerst containment en eradication herstel je in een onveilige situatie en loop je opnieuw besmetting op." },
        { q: "Welke stap sluit de cirkel door te kijken wat beter kan en herhaling te voorkomen?", answer: ["lessons learned", "geleerde lessen", "evaluatie"], hint: "Letterlijk: geleerde lessen.", explain: "Lessons learned (geleerde lessen) voedt de voorbereiding voor een volgende keer." },
      ],
    },

    {
      title: "Taak 4 — Detectie en analyse: een ransomware-aanval lezen",
      content: `
        <p>Tijd voor de praktijk van de DETECT-functie. Hieronder zie je een tijdlijn uit de <strong>EDR</strong>
        (Endpoint Detection and Response: beveiligingssoftware op een werkplek/server die processen en
        bestandsacties bewaakt) van bestandsserver <code>JVT-FS01</code>. Er is iets grondig mis. Gebruik het filter
        van de viewer om het verhaal te reconstrueren.</p>

        <h3>Het patroon van ransomware</h3>
        <p><strong>Ransomware</strong> is gijzelsoftware: ze versleutelt je bestanden en eist losgeld. Een typisch
        aanvalsverloop zie je hier terug:</p>
        <ol>
          <li><strong>Binnenkomst.</strong> Een gebruiker opent een bijlage die zich voordoet als een PDF maar in
          werkelijkheid een programma is (let op de dubbele extensie <code>.pdf.exe</code>). Daarna legt het programma
          verbinding met een server van de aanvaller (<em>command and control</em>).</li>
          <li><strong>Back-ups saboteren.</strong> Slimme ransomware wist eerst je lokale herstelmogelijkheden, zodat
          je niet zomaar kunt terugdraaien. Filter op <code>vssadmin</code>: dat commando verwijdert de
          <em>volume shadow copies</em> (schaduwkopieen) van Windows. Ook <code>wbadmin</code> en <code>bcdedit</code>
          worden misbruikt om herstel onmogelijk te maken.</li>
          <li><strong>Versleutelen.</strong> Daarna hernoemt en versleutelt ze massaal bestanden. Filter op
          <code>jvtlock</code>: alle bestanden krijgen die extensie. Er verschijnt ook overal een losgeldbrief
          (filter op <code>LEES_DIT_HERSTEL</code>).</li>
          <li><strong>Detectie en containment.</strong> De EDR herkent het gedrag, slaat alarm en isoleert
          automatisch de host.</li>
        </ol>

        <div class="callout tip">
          <strong>Filtertip:</strong> filter op <code>ALERT</code> om meteen naar de twee EDR-meldingen te springen.
          De eerste alert (<code>Detection=Ransom.Generic.Locker</code>) heeft een <code>incident-tag</code>: daarin
          staat de vlag. Filter daarna eens op <code>vssadmin</code> en op <code>.jvtlock</code> om te zien wat er
          gebeurde.
        </div>

        <p>Zie je dat de back-ups (schaduwkopieen) zijn gewist, dan weet je meteen dat lokaal herstellen niet gaat
        lukken — en dat een goede, <em>offline</em> back-up (zie de volgende room) letterlijk je redding is.</p>
      `,
      lab: {
        type: "logs",
        title: "EDR-tijdlijn — JVT-FS01 (bestandsserver)",
        lines: EDR_LOG,
      },
      questions: [
        { q: "Welk verdacht bestand werd uitgevoerd dat zich voordeed als een PDF?", answer: ["factuur_oktober.pdf.exe", "factuur_oktober.pdf.exe"], hint: "Let op de dubbele extensie; het eindigt niet op .pdf maar op .exe.", explain: "factuur_oktober.pdf.exe is een programma vermomd als PDF: de dubbele extensie is een klassieke truc." },
        { q: "Welk commando wiste de schaduwkopieen (volume shadow copies) om herstel te saboteren?", answer: ["vssadmin delete shadows /all /quiet", "vssadmin", "vssadmin.exe delete shadows /all /quiet"], hint: "Filter op vssadmin.", explain: "'vssadmin.exe delete shadows /all /quiet' verwijdert de Windows-schaduwkopieen, zodat lokaal terugdraaien niet meer kan." },
        { q: "Welke extensie kregen de versleutelde bestanden?", answer: [".jvtlock", "jvtlock"], hint: "Filter op jvtlock.", explain: "Alle bestanden werden hernoemd naar ...jvtlock: het kenmerk van deze ransomware." },
        { q: "Wat is de vlag in de incident-tag van de eerste EDR-alert?", answer: ["JVT{schaduwkopieen_gewist}"], hint: "Filter op ALERT en lees de incident-tag bij Ransom.Generic.Locker.", explain: "De EDR tagde het incident: JVT{schaduwkopieen_gewist}." },
      ],
    },

    {
      title: "Taak 5 — Containment, eradication en recovery",
      content: `
        <p>Je hebt de ransomware op <code>JVT-FS01</code> gedetecteerd en geanalyseerd. Nu het echte werk van de
        RESPOND- en RECOVER-functies. We lopen de stappen langs met concrete do's en don'ts.</p>

        <h3>1. Containment — stop de verspreiding</h3>
        <ul>
          <li><strong>Doe:</strong> isoleer de getroffen machine (netwerkkabel eruit of poort blokkeren). De EDR deed
          dit hier al automatisch. Blokkeer het misbruikte account en de verbinding naar het command-and-control-IP
          (<code>203.0.113.66</code>).</li>
          <li><strong>Doe niet:</strong> de machine meteen uitzetten. In het werkgeheugen (RAM) kan waardevol bewijs
          staan (sleutels, processen) dat verdwijnt bij uitschakelen. Isoleren mag, uitzetten alleen weloverwogen.</li>
        </ul>

        <div class="callout danger">
          <strong>Bewijs veiligstellen (forensics):</strong> maak zo mogelijk eerst een kopie (image) van het systeem
          en bewaar de logs. Noteer wie wat wanneer deed: de <em>chain of custody</em> (bewijsketen). Dat is belangrijk
          voor onderzoek, verzekering en een eventuele aangifte bij de Politie.
        </div>

        <h3>2. Eradication — haal de oorzaak weg</h3>
        <ul>
          <li>Verwijder de malware en alle sporen (zoals een via de aanvaller aangemaakt account of een geplande taak).</li>
          <li>Dicht het gat waardoor het binnenkwam: hier bijvoorbeeld e-mailfilters aanscherpen en uitvoerbare
          bijlagen blokkeren, plus de betrokken gebruiker voorlichten.</li>
          <li>Reset wachtwoorden van betrokken accounts; ga ervan uit dat ze gecompromitteerd zijn.</li>
        </ul>

        <h3>3. Recovery — breng veilig terug naar normaal</h3>
        <ul>
          <li>Herstel data vanaf een <strong>schone, offline back-up</strong>. Omdat de schaduwkopieen gewist zijn, is
          dat hier de enige veilige route. Herbouw de server zo nodig helemaal opnieuw.</li>
          <li>Herstel gefaseerd en houd de systemen daarna extra in de gaten (verscherpte monitoring) om zeker te
          weten dat de aanvaller echt weg is.</li>
        </ul>

        <div class="callout warn">
          <strong>Betaal geen losgeld.</strong> Het advies van onder meer het NCSC en de Politie is: betaal niet. Je
          hebt geen garantie dat je je data terugkrijgt, je financiert criminelen, en je maakt jezelf een aantrekkelijk
          doelwit. Een geteste back-up maakt betalen bovendien overbodig.
        </div>
      `,
      questions: [
        { q: "Waarom isoleer je een besmette machine liever van het netwerk dan dat je hem meteen uitzet?", options: ["Uitzetten wist het werkgeheugen (RAM), waar waardevol bewijs kan staan", "Uitzetten gaat te langzaam", "Een machine mag nooit uit", "Isoleren is hetzelfde als uitzetten"], answer: 0, explain: "Isoleren stopt de verspreiding terwijl je bewijs in het RAM behoudt; uitzetten kan dat bewijs vernietigen." },
        { q: "Hoe heet het nauwkeurig vastleggen wie wanneer welk bewijs behandelde?", answer: ["chain of custody", "bewijsketen"], hint: "Engelse term; letterlijk 'bewakingsketen' van bewijs.", explain: "De chain of custody (bewijsketen) maakt bewijs bruikbaar voor onderzoek en rechtszaak." },
        { q: "Wat is het advies van NCSC en Politie over het betalen van losgeld bij ransomware?", options: ["Niet betalen: geen garantie, je financiert criminelen en wordt een doelwit", "Altijd meteen betalen", "Onderhandelen tot de helft", "Alleen betalen bij kleine bedragen"], answer: 0, explain: "Betalen geeft geen garantie en houdt het verdienmodel in stand; een geteste back-up maakt het overbodig." },
        { q: "Vanaf wat herstel je de data in dit geval, nu de schaduwkopieen gewist zijn?", answer: ["een schone offline back-up", "offline back-up", "back-up", "een back-up"], hint: "Lokale herstelpunten zijn weg; je hebt een externe, losgekoppelde kopie nodig.", explain: "Een schone, offline back-up is de enige veilige herstelroute als de schaduwkopieen zijn gewist." },
      ],
    },

    {
      title: "Taak 6 — Melden: AVG en NIS2 (Cyberbeveiligingswet)",
      content: `
        <p>Een incident afhandelen is niet alleen techniek. Er gelden in Nederland en de EU ook <strong>wettelijke
        meldplichten</strong>. Wie te laat of niet meldt, riskeert flinke boetes. Twee sporen zijn voor jou belangrijk.</p>

        <h3>1. Datalek? Melden bij de Autoriteit Persoonsgegevens</h3>
        <p>Zijn er <strong>persoonsgegevens</strong> gelekt, vernietigd of ingezien (zoals de HR- en
        salarisbestanden op <code>JVT-FS01</code>), dan is er sprake van een <strong>datalek</strong>. Onder de
        <strong>AVG</strong> (Algemene verordening gegevensbescherming; Engels: GDPR) moet je zo'n datalek in beginsel
        <strong>binnen 72 uur</strong> melden bij de <strong>Autoriteit Persoonsgegevens</strong> (AP), tenzij het
        waarschijnlijk geen risico voor de betrokkenen oplevert. Is het risico voor de betrokkenen hoog, dan moet je
        ook <em>hen</em> informeren.</p>

        <div class="callout info">
          <strong>Onthoud de 72 uur:</strong> de klok begint te lopen zodra je van het datalek op de hoogte bent. Je
          hoeft nog niet alles te weten; je mag melden en later aanvullen. Beter op tijd en onvolledig dan te laat.
        </div>

        <h3>2. Essentiele of belangrijke organisatie? NIS2 / Cyberbeveiligingswet</h3>
        <p>De EU heeft met de <strong>NIS2-richtlijn</strong> strengere cybersecurity-eisen ingevoerd voor sectoren die
        de samenleving draaiende houden: energie, water, zorg, transport, digitale infrastructuur, overheid en meer.
        Nederland zet NIS2 om in de <strong>Cyberbeveiligingswet</strong>, die naar verwachting <strong>per 15 augustus
        2026</strong> in werking treedt. Valt jouw organisatie eronder als <em>essentiele</em> of <em>belangrijke</em>
        entiteit, dan gelden onder andere:</p>
        <ul>
          <li>Een <strong>zorgplicht</strong>: passende technische en organisatorische maatregelen nemen.</li>
          <li>Een <strong>meldplicht</strong> bij significante incidenten: een eerste melding al <strong>binnen 24
          uur</strong> (een vroege waarschuwing), gevolgd door uitgebreidere meldingen daarna.</li>
          <li>Verantwoordelijkheid bij de <strong>bestuurders</strong> zelf (dit raakt de GOVERN-functie uit taak 2).</li>
        </ul>
        <p>Het <strong>NCSC</strong> is in Nederland een centraal punt voor hulp en informatie bij incidenten. Meldingen
        onder de Cyberbeveiligingswet lopen via de aangewezen toezichthouder en het CSIRT voor jouw sector.</p>

        <div class="callout warn">
          <strong>Twee sporen tegelijk:</strong> een ransomware-aanval met gelekte persoonsgegevens bij een
          ziekenhuis raakt <em>beide</em> meldplichten: datalek bij de AP (AVG) en incident onder de
          Cyberbeveiligingswet (NIS2). Ze staan los van elkaar; vink ze allebei af.
        </div>
      `,
      questions: [
        { q: "Binnen hoeveel uur moet een datalek met persoonsgegevens in beginsel bij de Autoriteit Persoonsgegevens gemeld worden?", answer: ["72", "72 uur"], hint: "Drie etmalen onder de AVG.", explain: "De AVG schrijft een melding binnen 72 uur voor nadat je van het datalek op de hoogte bent." },
        { q: "Hoe heet de Nederlandse wet die de EU-richtlijn NIS2 omzet, met ingang naar verwachting per 15 augustus 2026?", answer: ["Cyberbeveiligingswet", "cyberbeveiligingswet", "de Cyberbeveiligingswet"], hint: "De wet die zorgplicht en meldplicht regelt voor essentiele en belangrijke organisaties.", explain: "Nederland implementeert NIS2 via de Cyberbeveiligingswet (verwachte inwerkingtreding 15 augustus 2026)." },
        { q: "Voor wie gelden de verplichtingen van NIS2 / de Cyberbeveiligingswet vooral?", options: ["Essentiele en belangrijke organisaties in vitale sectoren", "Alleen voor particulieren thuis", "Alleen voor bedrijven buiten de EU", "Voor niemand, het is vrijwillig"], answer: 0, explain: "NIS2 richt zich op essentiele en belangrijke entiteiten in sectoren zoals energie, zorg, water en transport." },
        { q: "Een ransomware-aanval bij een ziekenhuis lekt patientgegevens. Welke meldplichten spelen er?", options: ["Beide: datalek bij de AP (AVG) en incident onder de Cyberbeveiligingswet (NIS2)", "Alleen de AVG", "Alleen NIS2", "Geen enkele"], answer: 0, explain: "De sporen staan los: een datalek meld je bij de AP, en als essentiele organisatie meld je het incident ook onder NIS2." },
      ],
    },

    {
      title: "Taak 7 — Lessons learned en het playbook",
      content: `
        <p>Het vuur is uit, de systemen draaien weer. De verleiding is groot om opgelucht door te gaan met de orde van
        de dag. Maar de belangrijkste winst zit in de laatste stap: <strong>leren</strong>.</p>

        <h3>De evaluatie (post-incident review)</h3>
        <p>Kort na afloop (als het nog vers is) zet je de betrokkenen bij elkaar voor een eerlijke terugblik. Geen
        schuldigen aanwijzen, wel het proces verbeteren. Drie kernvragen:</p>
        <ul>
          <li><strong>Wat ging goed?</strong> Welke maatregelen en afspraken werkten en moeten we behouden?</li>
          <li><strong>Wat ging mis of traag?</strong> Waar liepen we vast — ontbrekende contacten, onduidelijke rollen,
          een back-up die niet bleek te werken?</li>
          <li><strong>Wat veranderen we?</strong> Concrete, toegewezen acties met een eigenaar en een datum. Een
          lesson learned zonder actiehouder is een vrome wens.</li>
        </ul>

        <div class="callout tip">
          <strong>Tip:</strong> zet veelvoorkomende incidenten vast in een <strong>playbook</strong> (ook wel
          <em>runbook</em>): een kant-en-klaar stappenplan voor bijvoorbeeld "ransomware" of "gephishte gebruiker". Zo
          hoeft het team het wiel niet opnieuw uit te vinden onder druk, en starten ook minder ervaren collega's goed.
        </div>

        <h3>De cirkel is rond</h3>
        <p>Merk op hoe lessons learned terugvoedt naar de <strong>voorbereiding</strong> (en naar GOVERN en PROTECT):
        je plan wordt beter, je maatregelen scherper, je team geoefender. Zo is incidentrespons geen eenmalige brand
        maar een doorlopende verbetercyclus. Elk incident maakt je volgende reactie beter.</p>

        <h3>Samenvatting van de room</h3>
        <ul>
          <li>Een incident schaadt echt je informatie; voorbereiding is de belangrijkste fase.</li>
          <li>CSF 2.0 ordent alles in zes functies: Govern, Identify, Protect, Detect, Respond, Recover. SP 800-61r3
          (2025) hangt incidentrespons daaraan op.</li>
          <li>In de praktijk: detectie en analyse, dan containment, eradication en recovery, en tot slot lessons
          learned.</li>
          <li>Vergeet de meldplichten niet: datalek bij de AP (AVG, 72 uur) en incidenten onder de Cyberbeveiligingswet
          (NIS2).</li>
        </ul>
      `,
      questions: [
        { q: "Wat is het belangrijkste doel van een post-incident review (lessons learned)?", options: ["Het proces verbeteren en herhaling voorkomen, niet schuldigen aanwijzen", "Een schuldige vinden en straffen", "Zo snel mogelijk vergeten wat er gebeurde", "Alleen de kosten berekenen"], answer: 0, explain: "Een eerlijke, blame-vrije evaluatie levert concrete verbeteracties op." },
        { q: "Hoe heet een kant-en-klaar stappenplan voor een specifiek type incident, zoals ransomware?", answer: ["playbook", "runbook", "een playbook"], hint: "Engels; ook wel runbook genoemd.", explain: "Een playbook (runbook) geeft het team een beproefd stappenplan onder druk." },
        { q: "Naar welke fase voedt 'lessons learned' terug, zodat incidentrespons een verbetercyclus wordt?", answer: ["voorbereiding", "de voorbereiding"], hint: "De eerste fase van de levenscyclus.", explain: "Lessons learned verbetert de voorbereiding (en Govern/Protect): de cirkel is rond." },
        { q: "Ik kan de zes functies van NIST CSF 2.0 benoemen en de praktische incidentstappen op volgorde zetten.", noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: "Security-incident", def: "Gebeurtenis die de vertrouwelijkheid, integriteit of beschikbaarheid van informatie echt schaadt of bedreigt." },
    { term: "Incident response", def: "De gestructureerde aanpak om een cyberincident te detecteren, in te perken, op te lossen en ervan te leren." },
    { term: "NIST CSF 2.0", def: "Cybersecurity Framework van NIST met zes functies: Govern, Identify, Protect, Detect, Respond en Recover." },
    { term: "Govern", def: "CSF-functie 'besturen': strategie, rollen, beleid en risicomanagement; nieuw en overkoepelend in versie 2.0." },
    { term: "Containment", def: "Inperking: de verspreiding van een aanval stoppen, bijvoorbeeld door een systeem te isoleren." },
    { term: "Eradication", def: "Uitroeiing: de oorzaak weghalen, zoals malware verwijderen en de misbruikte kwetsbaarheid dichten." },
    { term: "Recovery", def: "Herstel: systemen en data veilig terugbrengen naar normaal, bij voorkeur vanaf een schone back-up." },
    { term: "Lessons learned", def: "Geleerde lessen: evaluatie na een incident om het proces te verbeteren en herhaling te voorkomen." },
    { term: "EDR", def: "Endpoint Detection and Response: software op werkplekken/servers die processen en bestandsacties bewaakt en kan ingrijpen." },
    { term: "Ransomware", def: "Gijzelsoftware die bestanden versleutelt en losgeld eist; wist vaak eerst back-ups en schaduwkopieen." },
    { term: "Datalek", def: "Inbreuk waarbij persoonsgegevens worden gelekt, vernietigd of ingezien; onder de AVG vaak binnen 72 uur te melden bij de AP." },
    { term: "NIS2 / Cyberbeveiligingswet", def: "EU-richtlijn en de Nederlandse wet (verwacht per 15-8-2026) met zorg- en meldplicht voor essentiele en belangrijke organisaties." },
    { term: "Chain of custody", def: "Bewijsketen: het nauwkeurig vastleggen wie wanneer welk bewijs behandelde, zodat het bruikbaar blijft." },
    { term: "Playbook", def: "Kant-en-klaar stappenplan (runbook) voor een specifiek type incident, zoals ransomware of een gephishte gebruiker." },
  ],
  resources: [
    { title: "NIST — Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" },
    { title: "NIST CSRC — SP 800-61 (Computer Security Incident Handling)", url: "https://csrc.nist.gov/" },
    { title: "NCSC — hulp en informatie bij incidenten", url: "https://www.ncsc.nl/" },
    { title: "Autoriteit Persoonsgegevens — datalek melden", url: "https://www.autoriteitpersoonsgegevens.nl/" },
  ],
});
