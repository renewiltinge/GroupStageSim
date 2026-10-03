/* Room: Forensische Windows-artefacten */

// Security/System-eventlog voor het logs-lab (brute force -> login -> nieuw account -> nieuwe service).
// De vlag JVT{sporen_in_de_eventlog} zit in het pad van een 4688-proces.
const WINLOG = `2026-10-01 22:14:03  Security  EventID=4624  Geslaagde aanmelding   Account=rene      Bron-IP=10.10.60.21  LogonType=2   (console)
2026-10-01 23:02:55  Security  EventID=4634  Afmelding              Account=rene      LogonType=2
2026-10-02 02:57:58  Security  EventID=4625  MISLUKTE aanmelding    Account=Administrator  Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:00  Security  EventID=4625  MISLUKTE aanmelding    Account=Administrator  Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:02  Security  EventID=4625  MISLUKTE aanmelding    Account=Administrator  Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:05  Security  EventID=4625  MISLUKTE aanmelding    Account=administrator  Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:07  Security  EventID=4625  MISLUKTE aanmelding    Account=beheerder      Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:10  Security  EventID=4625  MISLUKTE aanmelding    Account=beheerder      Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:12  Security  EventID=4625  MISLUKTE aanmelding    Account=beheerder      Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:15  Security  EventID=4625  MISLUKTE aanmelding    Account=beheerder      Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:18  Security  EventID=4625  MISLUKTE aanmelding    Account=beheerder      Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:21  Security  EventID=4625  MISLUKTE aanmelding    Account=beheerder      Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 02:58:24  Security  EventID=4625  MISLUKTE aanmelding    Account=beheerder      Bron-IP=10.10.66.66  LogonType=3   Status=0xC000006A
2026-10-02 03:01:42  Security  EventID=4624  Geslaagde aanmelding   Account=beheerder      Bron-IP=10.10.66.66  LogonType=3   (netwerk)
2026-10-02 03:01:44  Security  EventID=4672  Speciale rechten toegekend  Account=beheerder   Rechten=SeDebugPrivilege,SeBackupPrivilege
2026-10-02 03:02:07  Security  EventID=4720  Gebruikersaccount AANGEMAAKT  NieuwAccount=hulpje  Door=beheerder
2026-10-02 03:02:09  Security  EventID=4732  Lid toegevoegd aan groep  Groep=Administrators  Account=hulpje  Door=beheerder
2026-10-02 03:03:20  Security  EventID=4688  Nieuw proces aangemaakt   Proces=C:\\Users\\Public\\svc\\JVT{sporen_in_de_eventlog}.exe  Account=hulpje
2026-10-02 03:03:55  System    EventID=7045  Nieuwe SERVICE geïnstalleerd  Service=SvcUpdater  Pad=C:\\Users\\Public\\svc\\updater.exe  Type=own process  Start=auto
2026-10-02 03:04:10  Security  EventID=4688  Nieuw proces aangemaakt   Proces=C:\\Windows\\System32\\cmd.exe  Account=hulpje
2026-10-02 03:05:33  Security  EventID=1102  Beveiligingslogboek GEWIST  Door=hulpje
2026-10-02 07:45:10  Security  EventID=4624  Geslaagde aanmelding   Account=rene      Bron-IP=10.10.60.21  LogonType=2   (console)
2026-10-02 08:12:40  Security  EventID=4624  Geslaagde aanmelding   Account=fatima    Bron-IP=10.10.60.24  LogonType=2   (console)
2026-10-02 09:03:18  Security  EventID=4634  Afmelding              Account=fatima    LogonType=2
2026-10-02 09:20:01  Security  EventID=4688  Nieuw proces aangemaakt   Proces=C:\\Program Files\\Firefox\\firefox.exe  Account=rene`;

CS.registerRoom({
  id: 'windows-artefacten',
  path: 'forensie',
  order: 6,
  title: 'Forensische Windows-artefacten',
  icon: '🪟',
  difficulty: 'Moeilijk',
  minutes: 75,
  summary: 'Windows laat overal sporen na: in de registry, Prefetch, Amcache, LNK-bestanden, USB-geschiedenis en event logs. Leer waar ze staan, wat ze bewijzen, en wat uitvoering écht aantoont.',
  objectives: [
    'De belangrijkste Windows-artefacten benoemen met hun locatie en wat ze bewijzen',
    'De registry-hives (SAM, SYSTEM, SOFTWARE, NTUSER.DAT) en sleutels als ShellBags, UserAssist en Run herkennen',
    'Uitvoeringsbewijs lezen uit Prefetch, Amcache en ShimCache, en hun betrouwbaarheid wegen',
    'De "execution evidence hierarchy" toepassen: wat bewijst uitvoering en wat alleen aanwezigheid',
    'Sporen van accounts, services en inbraak lezen uit de Windows Event Logs (event-ID\'s)',
    'De standaard Eric Zimmerman-tools koppelen aan het juiste artefact',
  ],
  tasks: [
    {
      title: 'Taak 1 — Windows is een dagboek dat zichzelf bijhoudt',
      content: `
        <p>Een gebruiker denkt dat hij een programma heeft gedraaid en weer verwijderd, een USB-stick heeft ingestoken en eruit gehaald, een map heeft bekeken en gesloten. Maar Windows noteert dat allemaal — vaak zonder dat iemand dat weet, en soms op plekken die een wis-actie niet raakt. Als <strong>digitaal rechercheur</strong> leer je dat dagboek lezen.</p>

        <div class="callout tip"><strong>Analogie:</strong> Windows is als een huis met overal stille camera's. Zelfs als iemand de gastenlijst verscheurt (een bestand wist), staat op tien andere beelden nog dat hij binnen was, hoe vaak, en wat hij aanraakte. Een artefact is zo'n camerabeeld.</div>

        <h3>Wat is een artefact?</h3>
        <p>Een <strong>forensisch artefact</strong> is een spoor dat het systeem automatisch achterlaat bij normaal gebruik. Niet bedoeld als bewijs, maar wél bruikbaar als bewijs. In deze room lopen we de belangrijkste categorieën langs:</p>
        <table>
          <thead><tr><th>Categorie</th><th>Vertelt je vooral iets over</th></tr></thead>
          <tbody>
            <tr><td>Registry (ShellBags, UserAssist, Run)</td><td>Mapnavigatie, gestarte GUI-programma's, persistentie</td></tr>
            <tr><td>Prefetch</td><td>Welke programma's zijn uitgevoerd, hoe vaak en wanneer</td></tr>
            <tr><td>Amcache &amp; ShimCache</td><td>Aanwezige/uitgevoerde programma's, met hashes</td></tr>
            <tr><td>LNK &amp; Jump Lists</td><td>Welke bestanden zijn geopend (ook van USB/netwerk)</td></tr>
            <tr><td>Event Logs (.evtx)</td><td>Aanmeldingen, nieuwe accounts, services, gewiste logs</td></tr>
            <tr><td>USB-geschiedenis</td><td>Welke externe apparaten zijn aangesloten</td></tr>
          </tbody>
        </table>

        <h3>Het gereedschap: de Eric Zimmerman-tools</h3>
        <p>In de hele forensische wereld zijn de gratis tools van <strong>Eric Zimmerman</strong> de standaard voor het uitlezen van Windows-artefacten. Je ziet ze in deze room steeds terugkomen:</p>
        <ul>
          <li><strong>PECmd</strong> — leest <em>Prefetch</em>-bestanden.</li>
          <li><strong>AmcacheParser</strong> — leest de <em>Amcache</em> (met SHA-1-hashes).</li>
          <li><strong>SBECmd</strong> — leest <em>ShellBags</em>.</li>
          <li><strong>LECmd</strong> — leest <em>LNK</em>-bestanden.</li>
          <li><strong>MFTECmd</strong> — leest de <em>$MFT</em> en andere NTFS-metadata.</li>
        </ul>

        <div class="callout info"><strong>Nederlandse context:</strong> net als bij schijfforensie werk je op een forensische kopie (image), met een sluitende <strong>chain of custody</strong> en de juiste <strong>machtiging</strong>. Complexe zaken lopen via het <strong>Team Cybercrime</strong> van de Politie en het <strong>NFI</strong>. Een artefact is pas bewijs als je kunt uitleggen waar het vandaan komt en wat het wél en níét aantoont.</div>
      `,
      questions: [
        { q: 'Wat is een forensisch artefact?', options: ['Een virus dat Windows installeert', 'Een spoor dat het systeem automatisch achterlaat bij normaal gebruik en als bewijs bruikbaar is', 'Een back-up die de gebruiker maakt', 'Een versleuteld bestand'], answer: 1, explain: 'Artefacten ontstaan vanzelf bij gebruik; ze zijn niet als bewijs bedoeld maar wel bruikbaar als bewijs.' },
        { q: 'Welke verzameling tools is de de-facto standaard voor het uitlezen van Windows-artefacten?', answer: ['eric zimmerman', 'zimmerman', 'eric zimmerman tools', 'ez tools'], hint: 'Vernoemd naar de maker; PECmd en AmcacheParser horen erbij.', explain: 'De Eric Zimmerman-tools (PECmd, AmcacheParser, SBECmd, LECmd, MFTECmd) zijn de standaard.' },
        { q: 'Ik snap dat Windows veel sporen achterlaat die een wis-actie vaak niet raakt.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — De registry: SAM, SYSTEM, SOFTWARE en NTUSER.DAT',
      content: `
        <p>De <strong>Windows-registry</strong> is een gigantische centrale database met instellingen van het systeem én van elke gebruiker. Voor forensie is het een schatkist: veel gedrag van gebruikers belandt hier automatisch.</p>

        <h3>De hives: waar de registry fysiek staat</h3>
        <p>De registry is opgedeeld in bestanden die <strong>hives</strong> heten. De belangrijkste:</p>
        <table>
          <thead><tr><th>Hive</th><th>Bevat</th></tr></thead>
          <tbody>
            <tr><td><strong>SAM</strong></td><td>Lokale gebruikersaccounts en hun (gehashte) wachtwoorden</td></tr>
            <tr><td><strong>SYSTEM</strong></td><td>Systeeminstellingen, services en de USB-geschiedenis</td></tr>
            <tr><td><strong>SOFTWARE</strong></td><td>Geïnstalleerde software en systeembrede instellingen</td></tr>
            <tr><td><strong>NTUSER.DAT</strong></td><td>De instellingen en het gedrag van één specifieke gebruiker</td></tr>
          </tbody>
        </table>
        <p>SAM, SYSTEM en SOFTWARE staan in <code>C:\\Windows\\System32\\config\\</code>. Elke gebruiker heeft een eigen <code>NTUSER.DAT</code> in zijn profielmap (<code>C:\\Users\\&lt;naam&gt;\\</code>). In de "live" registry heten de takken <code>HKLM</code> (de machine) en <code>HKCU</code> (de huidige gebruiker).</p>

        <h3>Vier sleutels die een rechercheur blij maken</h3>
        <ul>
          <li><strong>ShellBags</strong> — <code>HKCU\\...\\Shell\\BagMRU</code>. Windows onthoudt hier hoe je mappen in Verkenner bekeek (grootte, positie, weergave). Het gevolg: er blijft bewijs dat een gebruiker een bepaalde map <em>heeft geopend</em> — zelfs van mappen die inmiddels <strong>verwijderd</strong> zijn of op een losgekoppelde USB-stick stonden. Uit te lezen met <strong>SBECmd</strong>.</li>
          <li><strong>UserAssist</strong> — <code>HKCU\\...\\Explorer\\UserAssist</code>. Houdt bij welke <em>GUI-programma's</em> een gebruiker via de grafische schil heeft gestart, met een teller en een laatste-uitvoeringstijd. (De waarden staan ROT13-gecodeerd, puur als obfuscatie.)</li>
          <li><strong>Run-keys</strong> — <code>HKCU\\...\\CurrentVersion\\Run</code> en de HKLM-variant. Alles wat hier staat, start automatisch mee bij het opstarten/inloggen. Een klassieke plek voor <strong>persistentie</strong>: malware zet zichzelf hier neer om elke keer terug te komen.</li>
          <li><strong>SAM</strong> — bevat de lokale accounts; handig om te zien wélke gebruikers er zijn en wanneer ze voor het laatst inlogden.</li>
        </ul>

        <div class="callout warn"><strong>Let op het verschil:</strong> ShellBags en UserAssist bewijzen dat een gebruiker iets <em>bekeek of startte via de GUI</em>, maar een Run-key bewijst alleen dat iets <em>ingesteld staat om te starten</em>, niet dat het ook echt heeft gedraaid. In taak 3 scherpen we dat onderscheid verder aan.</div>
      `,
      questions: [
        { q: 'In welke registry-hive staan de lokale gebruikersaccounts en hun gehashte wachtwoorden?', options: ['SOFTWARE', 'SAM', 'NTUSER.DAT', 'SYSTEM'], answer: 1, explain: 'De SAM-hive bevat de lokale accounts en hun wachtwoord-hashes.' },
        { q: 'Welke registry-sleutel bewijst dat een gebruiker mappen in Verkenner heeft bekeken, ook verwijderde?', answer: ['shellbags', 'shellbag', 'bagmru'], hint: 'HKCU\\...\\Shell\\BagMRU; uit te lezen met SBECmd.', explain: 'ShellBags (BagMRU) bewaren mapnavigatie, ook van verwijderde of losgekoppelde locaties.' },
        { q: 'Waarvoor misbruiken aanvallers de Run-keys?', options: ['Om bestanden te versleutelen', 'Voor persistentie: automatisch meestarten bij het opstarten/inloggen', 'Om de klok te verzetten', 'Om logs te wissen'], answer: 1, explain: 'Alles in een Run-key start automatisch mee; ideaal voor persistentie van malware.' },
        { q: 'Welke Zimmerman-tool leest ShellBags uit?', answer: ['sbecmd', 'sbecmd.exe'], hint: 'SB = ShellBags.', explain: 'SBECmd is de tool voor ShellBags; let op de SB in de naam.' },
      ],
    },

    {
      title: 'Taak 3 — Uitvoeringsbewijs: Prefetch, Amcache en ShimCache',
      content: `
        <p>De vraag die een rechercheur het vaakst moet beantwoorden is: <em>"Is dit programma echt uitgevoerd op deze computer, en wanneer?"</em> Windows heeft daar meerdere artefacten voor, maar ze zijn niet allemaal even bewijzend. Dit is de kern van de room.</p>

        <h3>Prefetch — bewijs van uitvoering</h3>
        <p><strong>Prefetch</strong> is een snelheidstruc van Windows: bij het starten van een programma legt het in <code>C:\\Windows\\Prefetch\\</code> een <code>.pf</code>-bestand aan met wat het programma nodig had, zodat het de volgende keer sneller start. Forensisch goud, want een <code>.pf</code>-bestand bewijst: dit programma <strong>is uitgevoerd</strong>, <strong>hoe vaak</strong> (een run count) en de <strong>laatste (tot 8) uitvoeringstijden</strong>. Uit te lezen met <strong>PECmd</strong>.</p>

        <h3>Amcache — uitvoering + hash, zelfs na verwijdering</h3>
        <p><strong>Amcache</strong> (<code>Amcache.hve</code>) houdt gegevens bij over programma's op het systeem, inclusief de <strong>SHA-1-hash</strong> van het uitvoerbare bestand. Het sterke punt: die informatie blijft vaak staan <em>nadat het programma is verwijderd</em>. Met de hash kun je het programma koppelen aan een bekende malware-sample (bijvoorbeeld via een IOC-lijst). Uit te lezen met <strong>AmcacheParser</strong>.</p>

        <h3>ShimCache / AppCompatCache — aanwezigheid, niet per se uitvoering</h3>
        <p><strong>ShimCache</strong> (ook wel <strong>AppCompatCache</strong>, in de SYSTEM-hive) legt vast welke uitvoerbare bestanden Windows is <em>tegengekomen</em>, vooral voor compatibiliteitsredenen. Belangrijk: een vermelding in ShimCache betekent dat het bestand <strong>bestond</strong> op die plek — niet per se dat het ook echt is uitgevoerd. Dat maakt het zwakker bewijs dan Prefetch of Amcache.</p>

        <div class="callout danger"><strong>De execution evidence hierarchy — onthoud dit goed:</strong>
          <ul>
            <li><strong>Amcache</strong> en <strong>Prefetch</strong> → bewijzen <em>uitvoering</em> (het programma heeft echt gedraaid).</li>
            <li><strong>ShimCache</strong>, <strong>ShellBags</strong> en <strong>UserAssist</strong> → bewijzen <em>niet per se uitvoering</em> (aanwezigheid, navigatie of GUI-interactie, maar geen harde run).</li>
          </ul>
          Een rechercheur die zegt "het programma is uitgevoerd" leunt op Prefetch of Amcache, niet op ShimCache alleen.
        </div>

        <p>Waarom dit zo belangrijk is: in een zaak maakt het verschil of je kunt bewijzen dat een verdachte een tool <em>daadwerkelijk heeft gedraaid</em>, of alleen dat die tool ergens op de schijf <em>stond</em>. Het eerste is veel sterker bewijs dan het tweede.</p>
      `,
      questions: [
        { q: 'Welke twee artefacten bewijzen dat een programma écht is uitgevoerd?', answer: ['amcache en prefetch', 'prefetch en amcache', 'amcache, prefetch', 'prefetch, amcache'], hint: 'De bovenste laag van de execution evidence hierarchy.', explain: 'Amcache en Prefetch bewijzen uitvoering; ShimCache/ShellBags/UserAssist doen dat niet per se.' },
        { q: 'Wat kun je uit een Prefetch (.pf)-bestand aflezen?', options: ['Alleen de bestandsgrootte', 'Dat een programma is uitgevoerd, hoe vaak en de laatste uitvoeringstijden', 'Het wachtwoord van de gebruiker', 'De inhoud van het programma'], answer: 1, explain: 'Prefetch bewijst uitvoering, met een run count en de laatste uitvoeringstijden.' },
        { q: 'Waarom is een vermelding in ShimCache (AppCompatCache) zwakker bewijs dan Prefetch?', options: ['ShimCache is versleuteld', 'Het bewijst dat het bestand bestond, niet per se dat het is uitgevoerd', 'ShimCache bestaat niet op moderne Windows', 'Het bevat geen tijden'], answer: 1, explain: 'ShimCache toont aanwezigheid/compatibiliteitscontacten, geen harde uitvoering.' },
        { q: 'Welk artefact bewaart de SHA-1-hash van een programma, vaak ook na verwijdering?', answer: ['amcache', 'amcache.hve'], hint: 'Uit te lezen met AmcacheParser.', explain: 'Amcache bewaart o.a. de SHA-1 van executables, zodat je ze aan bekende malware kunt koppelen.' },
      ],
    },

    {
      title: 'Taak 4 — LNK-bestanden, Jump Lists, Recent en USB-geschiedenis',
      content: `
        <p>Deze artefacten beantwoorden vooral de vraag: <em>"Welke bestanden en apparaten heeft deze gebruiker gebruikt?"</em> — ook als die bestanden op een USB-stick of netwerkschijf stonden die er nu niet meer is.</p>

        <h3>LNK-bestanden: snelkoppelingen die meer verraden dan je denkt</h3>
        <p>Als je een bestand opent, maakt Windows vaak automatisch een <strong>LNK-bestand</strong> aan (een snelkoppeling). Dat LNK onthoudt het <strong>volledige pad</strong> van het geopende bestand, de grootte, tijdstempels en zelfs het <strong>volume-serienummer</strong> van de schijf waar het op stond. Gevolg: je kunt bewijzen dat iemand <code>geheim.docx</code> opende <em>vanaf een USB-stick</em>, ook al is die stick allang weg. Uit te lezen met <strong>LECmd</strong>.</p>

        <h3>Jump Lists en Recent</h3>
        <p><strong>Jump Lists</strong> zijn de lijstjes met "recente bestanden" die je ziet als je rechtsklikt op een programma in de taakbalk. Ze bewaren per programma welke bestanden recent zijn geopend. De map <strong>Recent</strong> (<code>C:\\Users\\&lt;naam&gt;\\AppData\\Roaming\\Microsoft\\Windows\\Recent</code>) verzamelt de LNK-snelkoppelingen van recent geopende bestanden. Samen geven ze een mooi beeld van wat iemand de laatste tijd heeft bekeken.</p>

        <h3>USB-geschiedenis</h3>
        <p>Elke USB-opslag die ooit is aangesloten, laat een spoor na in de registry onder <code>SYSTEM\\...\\USBSTOR</code>: merk, model en serienummer van het apparaat, plus tijdstippen. Zo kun je een specifieke USB-stick koppelen aan een computer — en met de volume-serienummers uit LNK-bestanden zelfs aan specifieke geopende bestanden.</p>

        <div class="callout info"><strong>Voorbeeld uit de praktijk:</strong> een medewerker wordt verdacht van het meenemen van bedrijfsgeheimen. Via USBSTOR zie je dat op 2 oktober om 17:58 een onbekende USB-stick (serienummer <code>JVTUSB-00FA</code>) is aangesloten. Een LNK-bestand toont dat kort daarna <code>klantenlijst.xlsx</code> werd geopend vanaf een volume met hetzelfde serienummer. De twee artefacten versterken elkaar — en samen vormen ze een sterk verhaal.</div>

        <h3>Browser-artefacten</h3>
        <p>Vergeet de browser niet: <strong>geschiedenis</strong> (bezochte sites met tijdstip), <strong>cache</strong> (lokaal opgeslagen pagina-onderdelen) en <strong>downloads</strong> (wat en wanneer gedownload, van welke URL). Deze staan in de profielmap van de browser en zijn vaak cruciaal om online gedrag te reconstrueren.</p>
      `,
      questions: [
        { q: 'Wat kan een LNK-bestand bewijzen, zelfs als de USB-stick allang weg is?', options: ['Het wachtwoord van de gebruiker', 'Dat een bestand vanaf die stick is geopend, met pad en volume-serienummer', 'Welke website is bezocht', 'Hoeveel RAM de computer heeft'], answer: 1, explain: 'Een LNK onthoudt het volledige pad, tijden en het volume-serienummer, dus ook een geopend bestand van een verdwenen stick.' },
        { q: 'Onder welke registry-locatie vind je de geschiedenis van aangesloten USB-opslag?', answer: ['usbstor', 'system\\usbstor', 'usbstor registry'], hint: 'Een sleutel in de SYSTEM-hive; de naam begint met USB.', explain: 'USBSTOR in de SYSTEM-hive bewaart merk, model en serienummer van aangesloten USB-opslag.' },
        { q: 'Welke Zimmerman-tool leest LNK-bestanden uit?', answer: ['lecmd', 'lecmd.exe'], hint: 'LE = LNK/snelkoppelingen.', explain: 'LECmd is de tool voor LNK-bestanden.' },
        { q: 'Welke browser-artefacten helpen online gedrag te reconstrueren?', options: ['Alleen de bladwijzers', 'Geschiedenis, cache en downloads', 'Alleen cookies', 'De browserversie'], answer: 1, explain: 'Geschiedenis, cache en downloads samen tonen bezochte sites, opgeslagen onderdelen en gedownloade bestanden.' },
      ],
    },

    {
      title: 'Taak 5 — Windows Event Logs lezen',
      content: `
        <p>De <strong>Windows Event Logs</strong> zijn de officiële logboeken van het systeem, opgeslagen als <code>.evtx</code>-bestanden in <code>C:\\Windows\\System32\\winevt\\Logs\\</code>. Voor een rechercheur is het <strong>Security</strong>-logboek het belangrijkst: daar staan aanmeldingen, nieuwe accounts en rechtenwijzigingen in. Elk type gebeurtenis heeft een vast <strong>event-ID</strong>.</p>

        <h3>De event-ID's die je uit je hoofd wilt kennen</h3>
        <table>
          <thead><tr><th>Event-ID</th><th>Betekenis</th></tr></thead>
          <tbody>
            <tr><td><strong>4624</strong></td><td>Geslaagde aanmelding (logon)</td></tr>
            <tr><td><strong>4625</strong></td><td>Mislukte aanmelding — veel op rij = brute force</td></tr>
            <tr><td><strong>4720</strong></td><td>Een gebruikersaccount is aangemaakt</td></tr>
            <tr><td><strong>4688</strong></td><td>Een nieuw proces is gestart</td></tr>
            <tr><td><strong>7045</strong></td><td>Een nieuwe service is geïnstalleerd (System-logboek)</td></tr>
          </tbody>
        </table>
        <p>Bonus om te herkennen: <strong>4672</strong> (speciale/admin-rechten toegekend) en <strong>1102</strong> (het beveiligingslogboek is gewist — op zichzelf al een rode vlag).</p>

        <h3>Een inbraak lezen als een verhaal</h3>
        <p>De kracht zit in de volgorde. Een klassiek aanvalsverhaal in de logs ziet er zo uit:</p>
        <ol>
          <li>Een stortvloed aan <strong>4625</strong> (mislukte aanmeldingen) vanaf één IP → een brute-force-aanval.</li>
          <li>Plotseling een <strong>4624</strong> (geslaagde aanmelding) vanaf datzelfde IP → de aanval is gelukt.</li>
          <li>Een <strong>4720</strong> (nieuw account aangemaakt) → de aanvaller maakt een eigen toegang.</li>
          <li>Een <strong>7045</strong> (nieuwe service) → persistentie, zodat hij terug kan komen.</li>
        </ol>

        <h3>Lees nu zelf de logs</h3>
        <p>Hieronder staat een stuk Security/System-logboek (geëxporteerd). Gebruik de filter (typ bijvoorbeeld <code>4625</code>, <code>4720</code>, of <code>/4624|4720|7045/</code> als regex). Reconstrueer het aanvalsverhaal en let op: in een <strong>4688</strong>-regel heeft de aanvaller een proces gestart waarvan de bestandsnaam een vlag bevat.</p>
      `,
      lab: {
        type: 'logs',
        title: 'Security.evtx (geëxporteerd)',
        lines: WINLOG,
      },
      questions: [
        { q: 'Vanaf welk IP-adres kwam de brute-force-aanval (veel 4625 gevolgd door een 4624)?', answer: ['10.10.66.66'], hint: 'Filter op 4625; één IP herhaalt zich en komt ook bij de geslaagde 4624 terug.', explain: 'Alle mislukte aanmeldingen en de uiteindelijke geslaagde login komen van 10.10.66.66.' },
        { q: 'Welk account maakte de aanvaller aan (event 4720)?', answer: ['hulpje'], hint: 'Filter op 4720.', explain: 'Na de geslaagde login verschijnt event 4720: het nieuwe account "hulpje", meteen toegevoegd aan Administrators.' },
        { q: 'Welke vlag staat in de bestandsnaam van het proces in de 4688-regel?', answer: ['JVT{sporen_in_de_eventlog}'], hint: 'Filter op 4688 of op JVT; lees het pad van het gestarte proces.', explain: 'Het proces C:\\Users\\Public\\svc\\JVT{sporen_in_de_eventlog}.exe verraadt de vlag in de 4688-gebeurtenis.' },
        { q: 'Welk event-ID betekent dat het beveiligingslogboek is gewist?', answer: ['1102'], hint: 'Staat onderaan het aanvalsblok; op zichzelf al verdacht.', explain: 'Event 1102 = security log cleared; aanvallers doen dit om sporen te wissen.' },
      ],
    },

    {
      title: 'Taak 6 — Artefacten uitlezen met parsers (PowerShell)',
      content: `
        <p>Tijd om de tools uit taak 1 in actie te zien. Je zit op een forensisch werkstation met een PowerShell-venster en de Eric Zimmerman-tools geïnstalleerd. Je gaat twee vragen beantwoorden: <em>is dit programma uitgevoerd?</em> en <em>heeft de aanvaller persistentie neergezet?</em></p>

        <h3>Stap 1 — Bewijs van uitvoering met PECmd</h3>
        <p>Je vond een verdacht Prefetch-bestand van <code>evil.exe</code>. Laat <strong>PECmd</strong> het ontleden. Typ exact:</p>
        <pre><code>PECmd.exe -f evil.exe.pf</code></pre>
        <p>Let op de <strong>run count</strong> en de <strong>laatste uitvoeringstijd</strong>: dat is hard bewijs dat <code>evil.exe</code> echt heeft gedraaid (Prefetch staat bovenin de execution evidence hierarchy).</p>

        <h3>Stap 2 — Zoek persistentie in de Run-key</h3>
        <p>Controleer of er iets automatisch meestart bij het inloggen. Bevraag de Run-key van de gebruiker. Typ exact:</p>
        <pre><code>reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"</code></pre>
        <p>Bekijk de waarden. Er staat een verdachte vermelding tussen; in het pad van die vermelding is een vlag verwerkt.</p>

        <div class="callout tip"><strong>Extra:</strong> wil je de hash van een uitgevoerd programma koppelen aan een IOC-lijst? Dan draai je <code>AmcacheParser.exe -f Amcache.hve --csv .</code> en vergelijk je de SHA-1 met je lijst. Probeer dat commando ook.</div>
      `,
      lab: {
        type: 'terminal',
        shell: 'powershell',
        user: 'rechercheur', host: 'FORENSIE-WS01',
        home: 'C:\\Cases\\2026-0442', cwd: 'C:\\Cases\\2026-0442',
        motd: 'Forensisch werkstation (PowerShell). EZ-tools staan in het pad. Start met: PECmd.exe -f evil.exe.pf',
        commands: {
          'PECmd.exe -f evil.exe.pf': `PECmd version 1.5 — Eric Zimmerman
Processing evil.exe.pf

Executable name: EVIL.EXE
Run count: 7
Last run: 2026-10-02 03:03:20
Other run times: 2026-10-02 03:02:55, 2026-10-02 03:01:10, 2026-10-01 23:40:02
Volume: \\VOLUME{01d9...}  Serial: A4C1-9F02
Referenced files: 14  (o.a. C:\\Users\\Public\\svc\\updater.exe)

Conclusie: evil.exe is 7x uitgevoerd — HARD bewijs van uitvoering (Prefetch).`,
          'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"': `
HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run
    OneDrive          REG_SZ    C:\\Users\\rene\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe /background
    SvcUpdater        REG_SZ    C:\\Users\\Public\\svc\\JVT{run_key_persistentie}.exe

Einde van zoekresultaten.`,
          'AmcacheParser.exe -f Amcache.hve --csv .': `AmcacheParser version 1.5 — Eric Zimmerman
Processing Amcache.hve

Name          : evil.exe
Path          : C:\\Users\\Public\\svc\\updater.exe
SHA-1         : 3a7ba6da29ca3e787a17dc968950b3a4aaa95a5f
Compiled      : 2026-09-28 20:11:44

1 bestand verwerkt. Tip: vergelijk de SHA-1 met je IOC-lijst.`,
        },
      },
      questions: [
        { q: 'Hoe vaak is evil.exe uitgevoerd volgens PECmd (de run count)?', answer: ['7', 'zeven'], hint: 'Lees de regel "Run count" in de PECmd-uitvoer.', explain: 'PECmd toont een run count van 7 — hard bewijs dat evil.exe meerdere keren is uitgevoerd.' },
        { q: 'Welke vlag zit verwerkt in de verdachte Run-key-vermelding?', answer: ['JVT{run_key_persistentie}'], hint: 'Draai de reg query en lees het pad van de SvcUpdater-waarde.', explain: 'De SvcUpdater-waarde wijst naar C:\\Users\\Public\\svc\\JVT{run_key_persistentie}.exe — persistentie, met de vlag erin.' },
        { q: 'Waarom is de PECmd-uitkomst sterker bewijs van uitvoering dan een ShimCache-vermelding?', options: ['Omdat PowerShell betrouwbaarder is', 'Omdat Prefetch uitvoering bewijst (met run count en tijden), terwijl ShimCache alleen aanwezigheid toont', 'Omdat ShimCache versleuteld is', 'Dat is het niet'], answer: 1, explain: 'Prefetch (via PECmd) bewijst echte uitvoering; ShimCache toont slechts dat het bestand aanwezig was.' },
      ],
    },

    {
      title: 'Taak 7 — Alles samen: de aanpak van een artefact-onderzoek',
      content: `
        <p>Je hebt nu de belangrijkste Windows-artefacten gezien. Tot slot brengen we ze samen tot een werkwijze, en herhalen we de belangrijkste denkregel.</p>

        <h3>Een logische volgorde van onderzoek</h3>
        <ol>
          <li><strong>Tijdlijn</strong> — bouw een tijdlijn uit de $MFT (MFTECmd) en de Event Logs. Wanneer gebeurde wat?</li>
          <li><strong>Uitvoering</strong> — wat heeft echt gedraaid? Prefetch (PECmd) en Amcache (AmcacheParser).</li>
          <li><strong>Gebruikersgedrag</strong> — welke mappen/bestanden/apparaten? ShellBags (SBECmd), LNK/Jump Lists (LECmd), USBSTOR.</li>
          <li><strong>Toegang &amp; persistentie</strong> — accounts en services uit de Event Logs (4624/4625/4720/7045) en de Run-keys.</li>
          <li><strong>Koppelen</strong> — leg verbanden: dezelfde hash in Amcache en een IOC-lijst, hetzelfde volume-serienummer in USBSTOR en een LNK.</li>
        </ol>

        <h3>De gouden denkregel</h3>
        <div class="callout danger"><strong>Scheid "aanwezig" van "uitgevoerd".</strong> Als je in een rapport schrijft dat een programma is <em>uitgevoerd</em>, onderbouw dat dan met <strong>Amcache of Prefetch</strong>. ShimCache, ShellBags en UserAssist zijn waardevol, maar bewijzen dat niet hard. Een goede rechercheur formuleert precies wat een artefact wél en níét aantoont — anders sneuvelt de conclusie bij de eerste kritische vraag.</div>

        <h3>Ethiek en zorgvuldigheid</h3>
        <p>Alles wat je hier leert, pas je toe binnen de grenzen van je <strong>machtiging</strong> en met een sluitende <strong>chain of custody</strong>. Je werkt op een forensische kopie, je legt je hash-waarden vast, en je documenteert elke stap zodat een collega (of de rechter) je werk kan controleren. Zonder die zorgvuldigheid is zelfs het beste technische bewijs waardeloos.</p>

        <div class="callout tip"><strong>Tip voor verder leren:</strong> oefen met echte images op CyberDefenders en Forensic Focus (zie de bronnen). Download de Eric Zimmerman-tools en lees per tool welk artefact hij ontsluit; dan gaat de theorie uit deze room pas echt leven.</div>
      `,
      questions: [
        { q: 'Welke bron gebruik je om hard te onderbouwen dat een programma is uitgevoerd?', options: ['ShimCache of ShellBags', 'Amcache of Prefetch', 'Alleen de bestandsnaam', 'De browsergeschiedenis'], answer: 1, explain: 'Amcache en Prefetch bewijzen uitvoering; de andere artefacten tonen aanwezigheid of interactie.' },
        { q: 'Welke tool gebruik je om een tijdlijn uit de $MFT te bouwen?', answer: ['mftecmd', 'mftecmd.exe'], hint: 'MFT staat in de naam.', explain: 'MFTECmd leest de $MFT en andere NTFS-metadata, ideaal voor een tijdlijn.' },
        { q: 'Waarom moet je in een rapport precies formuleren wat een artefact wél en níét aantoont?', options: ['Dat hoeft niet', 'Omdat een te sterke conclusie bij een kritische vraag onderuitgaat en het bewijs verzwakt', 'Om het rapport langer te maken', 'Omdat de software dat eist'], answer: 1, explain: 'Precisie houdt je conclusie overeind; "aanwezig" verwarren met "uitgevoerd" ondermijnt de hele zaak.' },
        { q: 'Ik kan de execution evidence hierarchy uitleggen en artefacten aan de juiste Zimmerman-tool koppelen.', noAnswer: true },
      ],
    },
  ],

  terms: [
    { term: 'Artefact', def: 'Spoor dat Windows automatisch achterlaat bij normaal gebruik en dat als bewijs bruikbaar is.' },
    { term: 'Registry-hive', def: 'Bestand waarin een deel van de registry staat: SAM, SYSTEM, SOFTWARE of (per gebruiker) NTUSER.DAT.' },
    { term: 'ShellBags', def: 'Registry-sporen (BagMRU) van mapnavigatie in Verkenner, ook van verwijderde of losgekoppelde locaties; lezen met SBECmd.' },
    { term: 'UserAssist', def: 'Registry-teller van via de GUI gestarte programma\'s, met aantal en laatste uitvoeringstijd (ROT13-gecodeerd).' },
    { term: 'Run-key', def: 'Registry-sleutel waarvan alles automatisch meestart bij inloggen; klassieke plek voor persistentie.' },
    { term: 'Prefetch', def: 'Snelheidsbestanden (.pf) in C:\\Windows\\Prefetch die uitvoering bewijzen, met run count en laatste uitvoeringstijden; lezen met PECmd.' },
    { term: 'Amcache', def: 'Artefact (Amcache.hve) met gegevens over programma\'s inclusief SHA-1, vaak ook na verwijdering; lezen met AmcacheParser.' },
    { term: 'ShimCache', def: 'AppCompatCache in de SYSTEM-hive; bewijst dat een bestand aanwezig was, niet per se dat het is uitgevoerd.' },
    { term: 'Execution evidence hierarchy', def: 'Rangorde van bewijs: Amcache/Prefetch bewijzen uitvoering; ShimCache/ShellBags/UserAssist niet per se.' },
    { term: 'LNK-bestand', def: 'Snelkoppeling die pad, tijden en volume-serienummer van een geopend bestand bewaart; lezen met LECmd.' },
    { term: 'Jump List', def: 'Lijst met recent geopende bestanden per programma, zichtbaar via de taakbalk.' },
    { term: 'USBSTOR', def: 'Registry-locatie in de SYSTEM-hive met merk, model en serienummer van aangesloten USB-opslag.' },
    { term: 'Event-ID', def: 'Vast nummer per soort gebeurtenis in de Windows Event Logs, bijv. 4624 (login), 4625 (mislukt), 4720 (nieuw account), 4688 (proces), 7045 (service).' },
    { term: 'Eric Zimmerman-tools', def: 'Standaard gratis forensische tools: PECmd, AmcacheParser, SBECmd, LECmd, MFTECmd.' },
  ],

  resources: [
    { title: 'Eric Zimmerman — forensische tools (PECmd, AmcacheParser, SBECmd, LECmd, MFTECmd)', url: 'https://ericzimmerman.github.io/' },
    { title: 'SANS — Digital Forensics & Incident Response', url: 'https://www.sans.org/' },
    { title: 'Forensic Focus — artikelen over Windows-forensie', url: 'https://www.forensicfocus.com/' },
    { title: 'NCSC — Nationaal Cyber Security Centrum', url: 'https://www.ncsc.nl/' },
  ],
});
