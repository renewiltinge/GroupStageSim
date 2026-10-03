/* Room: Windows en Active Directory: de basis */
const WIN_SECLOG = "03-10-2026 08:59:11  Security  4634  Een account is afgemeld.  Account: student\n03-10-2026 09:02:40  Security  4624  Account is aangemeld.  Account: student  Logon Type: 2 (Interactive)  Source Network Address: 127.0.0.1\n03-10-2026 09:05:22  Security  4672  Speciale bevoegdheden toegewezen aan nieuwe aanmelding.  Account: student\n03-10-2026 09:13:02  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:13:11  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:13:20  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:13:29  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:13:38  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:14:02  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:14:11  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:14:20  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:14:29  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:14:38  Security  4625  Een account kon zich niet aanmelden.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66  Fout: 0xC000006A (verkeerd wachtwoord)\n03-10-2026 09:14:55  Security  4624  Account is aangemeld.  Account: administrator  Logon Type: 3 (Network)  Source Network Address: 10.10.20.66\n03-10-2026 09:14:56  Security  4672  Speciale bevoegdheden toegewezen aan nieuwe aanmelding.  Account: administrator\n03-10-2026 09:16:10  Security  4720  Er is een gebruikersaccount gemaakt.  Nieuw account: svc_backup  Door: administrator\n03-10-2026 09:16:12  Security  4732  Lid toegevoegd aan beveiligingsgroep (lokaal).  Groep: Administrators  Lid: svc_backup\n03-10-2026 09:17:40  Security  4688  Nieuw proces gemaakt.  Procesnaam: C:\\Windows\\System32\\cmd.exe  Account: svc_backup\n03-10-2026 09:18:03  Security  4688  Nieuw proces gemaakt.  Procesnaam: C:\\Users\\svc_backup\\AppData\\Roaming\\updater.exe  Account: svc_backup\n03-10-2026 09:20:31  Security  4634  Een account is afgemeld.  Account: student\n";

CS.registerRoom({
  id: 'windows-basis',
  path: 'fundamenten',
  order: 6,
  title: 'Windows en Active Directory: de basis',
  icon: '🪟',
  difficulty: 'Makkelijk',
  minutes: 85,
  summary: 'Accounts, NTFS, het register, services, Event Viewer, PowerShell en Active Directory: de Windows-basis die je nodig hebt om aanvallen te zien en te stoppen.',
  objectives: [
    'De rol van accounts, lokale admin en UAC in Windows uitleggen',
    'Het register en Run-keys herkennen als plek voor persistentie',
    'Met PowerShell een systeem onderzoeken (gebruikers, processen, services, register)',
    'Belangrijke Security-event-ID\'s herkennen, waaronder 4624, 4625, 4688, 4720 en 1102',
    'De bouwstenen van Active Directory benoemen en uitleggen waarom het een doelwit is',
  ],
  tasks: [
    {
      title: 'Taak 1 — Windows, accounts en UAC',
      content: `
        <p>Op kantoor draait het leeuwendeel van de werkplekken op Windows, en in bedrijfsnetwerken is Windows samen met Active Directory de standaard. Juist daarom is het een geliefd doelwit: wie Windows begrijpt, begrijpt waar het grootste deel van de aanvallen landt.</p>

        <h3>Versies en rollen</h3>
        <p>Je komt grofweg twee smaken tegen: <strong>Windows-clients</strong> (Windows 10 en 11) op de werkplekken van medewerkers, en <strong>Windows Server</strong> (bijv. Server 2019/2022) voor centrale diensten zoals bestandsdeling, e-mail en de domeincontroller. Ze lijken op elkaar, maar servers beheren vaak het hele netwerk.</p>

        <h3>Gebruikersaccounts</h3>
        <p>Er zijn twee soorten accounts:</p>
        <ul>
          <li><strong>Standaardgebruiker</strong> — mag gewoon werken, maar niets systeembreed wijzigen.</li>
          <li><strong>Administrator (lokale admin)</strong> — mag alles op die computer: software installeren, instellingen wijzigen, andere accounts beheren.</li>
        </ul>
        <p>Een gouden regel in security: werk dagelijks met een standaardaccount, niet als admin. Zo kan malware die jij per ongeluk start, veel minder aanrichten. Dit heet het <em>principe van minimale rechten</em> (least privilege).</p>

        <h3>UAC: User Account Control</h3>
        <p>Je kent de pop-up wel: "Wilt u toestaan dat deze app wijzigingen aanbrengt?" Dat is <strong>UAC</strong>. Zelfs als je een adminaccount gebruikt, draai je programma's normaal met beperkte rechten. Pas als er echt beheerrechten nodig zijn, vraagt UAC om bevestiging (of om een wachtwoord). Het dwingt je bewust ja te zeggen tegen een verhoging van rechten (<em>elevation</em>).</p>

        <div class="callout info"><strong>Waarom dit telt:</strong> veel aanvallen proberen UAC te omzeilen of jou te verleiden op "Ja" te klikken. Snap je wat UAC doet, dan snap je ook waarom een onverwachte UAC-prompt een rood vlaggetje is.</div>
      `,
      questions: [
        { q: 'Wat is het hoofddoel van UAC (User Account Control)?', options: ['Het versnelt de computer', 'Het vraagt bevestiging voordat een actie met beheerrechten draait', 'Het versleutelt de harde schijf', 'Het blokkeert internet'], answer: 1, explain: 'UAC laat je bewust toestemming geven (elevation) voordat een programma met beheerrechten draait, ook als je al admin bent.' },
        { q: 'Ik begrijp waarom je dagelijks beter met een standaardaccount werkt dan als administrator.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — NTFS, mappen en het register',
      content: `
        <p>Om later verdachte dingen te herkennen, moet je weten waar Windows zijn spullen bewaart.</p>

        <h3>NTFS en rechten</h3>
        <p>Windows gebruikt het bestandssysteem <strong>NTFS</strong>. Net als Linux kent het rechten, maar dan via <strong>ACL's</strong> (Access Control Lists): per bestand of map staat er een lijst van wie wat mag (lezen, schrijven, uitvoeren, volledig beheer). Je stelt ze in via het tabblad "Beveiliging" in de bestandseigenschappen.</p>

        <h3>Belangrijke mappen</h3>
        <table>
          <thead><tr><th>Map</th><th>Wat erin staat</th></tr></thead>
          <tbody>
            <tr><td><code>C:\\Windows\\System32</code></td><td>De kern van het besturingssysteem: systeemprogramma's en DLL's</td></tr>
            <tr><td><code>C:\\Users</code></td><td>De profielen van alle gebruikers, elk met een eigen map</td></tr>
            <tr><td><code>C:\\Users\\&lt;naam&gt;\\AppData</code></td><td>Verborgen map met app-gegevens; geliefd bij malware</td></tr>
            <tr><td><code>C:\\Program Files</code></td><td>Geïnstalleerde programma's</td></tr>
          </tbody>
        </table>

        <h3>Het register</h3>
        <p>Het <strong>register</strong> (Registry) is de centrale instellingendatabase van Windows: een grote boom van sleutels en waarden. De twee belangrijkste takken (hives):</p>
        <ul>
          <li><strong>HKLM</strong> (HKEY_LOCAL_MACHINE) — instellingen voor de hele computer, voor alle gebruikers.</li>
          <li><strong>HKCU</strong> (HKEY_CURRENT_USER) — instellingen voor de gebruiker die nu is ingelogd.</li>
        </ul>

        <div class="callout warn"><strong>Run-keys = persistentie:</strong> onder <code>...\\CurrentVersion\\Run</code> (zowel in HKLM als HKCU) staan programma's die automatisch starten bij het inloggen. Dat is handig voor OneDrive, maar ook dé klassieke plek waar malware zichzelf neerzet om telkens opnieuw te starten. Dit heet <em>persistentie</em>: ervoor zorgen dat je toegang houdt, ook na een herstart. Een onbekend programma in een Run-key is een sterk signaal van besmetting.</div>

        <p>In de volgende taak kijk je zelf in zo'n Run-key met PowerShell en spoor je een verdachte invoer op.</p>
      `,
      questions: [
        { q: 'Welke register-hive bevat de instellingen van de gebruiker die nu is ingelogd?', answer: ['HKCU', 'HKEY_CURRENT_USER', 'hkcu'], hint: 'CU staat voor Current User.', explain: 'HKCU (HKEY_CURRENT_USER) geldt voor de huidige gebruiker; HKLM geldt voor de hele machine.' },
        { q: 'Waarom kijken onderzoekers naar programma\'s in een Run-key?', options: ['Omdat ze de computer sneller maken', 'Omdat malware daar vaak persistentie regelt (automatisch opstarten)', 'Omdat het back-ups zijn', 'Omdat het stuurprogramma\'s zijn'], answer: 1, explain: 'Run-keys starten programma\'s bij het inloggen; malware gebruikt ze om na elke herstart terug te komen.' },
      ],
    },

    {
      title: 'Taak 3 — PowerShell: het systeem onderzoeken',
      content: `
        <p><strong>PowerShell</strong> is de krachtige shell van Windows. Commando's heten <strong>cmdlets</strong> en volgen altijd het patroon <strong>Werkwoord-Zelfstandignaamwoord</strong> (Verb-Noun), bijvoorbeeld <code>Get-Process</code>, <code>Get-Service</code>, <code>Get-LocalUser</code>. Daardoor kun je ze bijna raden. Hulp vraag je met <code>Get-Help</code>.</p>
        <p>Het mooie: cmdlets geven geen platte tekst terug maar objecten, die je via de <strong>pipeline</strong> (<code>|</code>) aan elkaar koppelt, net als in bash. Een paar om te kennen:</p>
        <ul>
          <li><code>Get-ChildItem</code> — toont de inhoud van een map (zoals <code>ls</code>/<code>dir</code>).</li>
          <li><code>Get-Content</code> — toont de inhoud van een bestand (zoals <code>cat</code>).</li>
          <li><code>Get-Process</code> / <code>Get-Service</code> — toont processen / services.</li>
          <li><code>Get-LocalUser</code> — toont de lokale gebruikersaccounts.</li>
          <li><code>Get-ItemProperty</code> — leest een registersleutel uit.</li>
          <li><code>whoami</code> en <code>whoami /groups</code> — wie ben je, en in welke groepen zit je.</li>
        </ul>

        <h3>Je opdracht</h3>
        <p>Open de PowerShell-terminal hieronder en typ de commando's precies over (hoofdletters maken niet uit). Op dit systeem is iets niet in de haak; jij gaat de sporen vinden.</p>
        <ol>
          <li>Begin met <code>whoami</code> en <code>whoami /groups</code> om te zien wie je bent.</li>
          <li><code>Get-LocalUser</code> — er staat een account tussen dat er niet hoort. Lees de beschrijving; daarin staat een vlag.</li>
          <li><code>Get-ChildItem C:\\Users\\student\\Desktop</code> — kijk wat er op het bureaublad staat, en lees het notitiebestand met <code>Get-Content C:\\Users\\student\\Desktop\\notitie.txt</code>. Daar staat een vlag.</li>
          <li><code>Get-ItemProperty HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run</code> — tussen de normale opstartitems zit een verdachte regel die naar <code>AppData\\Roaming</code> wijst. Daar staat de derde vlag.</li>
        </ol>
        <p>Kijk ook even naar <code>Get-Process</code> en <code>Get-Service</code> om een gevoel te krijgen voor wat er draait; ze helpen je in latere rooms.</p>
      `,
      lab: {
        type: 'terminal',
        shell: 'powershell',
        user: 'student', host: 'JVT-PC01',
        motd: 'Windows PowerShell. Typ de cmdlets precies over (hoofdletters maken niet uit). Begin met: whoami',
        commands: {
          'whoami': 'jvt-corp\\student',
          'whoami /groups': 'GROEPSINFORMATIE\n-----------------\n\nGroepsnaam                                 Type             SID\n========================================== ================ ============\nEveryone                                   Bekende groep    S-1-1-0\nBUILTIN\\Users                              Alias            S-1-5-32-545\nBUILTIN\\Remote Desktop Users               Alias            S-1-5-32-555\nNT AUTHORITY\\Authenticated Users           Bekende groep    S-1-5-11\nJVT-CORP\\Domain Users                      Groep            S-1-5-21-...-513',
          'Get-LocalUser': 'Name           Enabled Description\n----           ------- -----------\nAdministrator  True    Ingebouwd account voor het beheer van de computer\nDefaultAccount False   Een gebruikersaccount dat door het systeem wordt beheerd.\nGuest          False   Ingebouwd account voor gasttoegang tot de computer\nstudent        True    Standaardmedewerker\nsvc_backup     True    JVT{vreemd_lokaal_account} - recent aangemaakt, hoort hier niet',
          'Get-Process': 'Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName\n-------  ------    -----      -----     ------     --  -- -----------\n    312      18     4820      12044       1.23    980   1 explorer\n    145       9     2100       8800       0.45   1340   1 powershell\n    501      32    18840      45120       6.77   2210   1 chrome\n     88       6     1420       4960       0.08   3344   1 updater\n    210      14     3980      10220       0.90    744   1 svchost',
          'Get-Service': 'Status   Name               DisplayName\n------   ----               -----------\nRunning  Dnscache           DNS Client\nRunning  Spooler            Print Spooler\nRunning  LanmanServer       Server\nStopped  WinDefend          Microsoft Defender Antivirus Service\nRunning  wuauserv           Windows Update\nRunning  Themes             Themes',
          'Get-ChildItem C:\\Users\\student\\Desktop': '    Directory: C:\\Users\\student\\Desktop\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3-10-2026     09:41            182 notitie.txt\n-a----         3-10-2026     08:12         245760 jaarverslag.pdf\n-a----         2-10-2026     17:55             96 wachtwoorden.xlsx',
          'Get-Content C:\\Users\\student\\Desktop\\notitie.txt': 'Herinnering: zet GEEN wachtwoorden op het bureaublad!\nVPN-code vernieuwen voor vrijdag.\nJVT{notitie_op_bureaublad}',
          'Get-ItemProperty HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run': 'OneDrive       : "C:\\Users\\student\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe" /background\nSecurityHealth : C:\\Windows\\System32\\SecurityHealthSystray.exe\nUpdater        : C:\\Users\\student\\AppData\\Roaming\\JVT{run_key_is_persistentie}.exe\nPSPath         : Microsoft.PowerShell.Core\\Registry::HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\nPSChildName    : Run\nPSProvider     : Microsoft.PowerShell.Core\\Registry',
        },
      },
      questions: [
        { q: 'Welk werkwoord-zelfstandignaamwoord-patroon volgen alle PowerShell-cmdlets? Geef de cmdlet om processen te tonen.', answer: ['Get-Process', 'get-process'], hint: 'Werkwoord "Get" + zelfstandignaamwoord "Process".', explain: 'Cmdlets volgen Verb-Noun; Get-Process toont de lopende processen.' },
        { q: 'Draai Get-LocalUser. Welke vlag staat in de beschrijving van het verdachte account?', answer: ['JVT{vreemd_lokaal_account}'], hint: 'Eén account is "recent aangemaakt en hoort hier niet".', explain: 'Het account svc_backup hoort er niet; zo\'n onbekend account kan door een aanvaller zijn aangemaakt.' },
        { q: 'Lees notitie.txt op het bureaublad. Wat is de vlag?', answer: ['JVT{notitie_op_bureaublad}'], hint: 'Get-Content C:\\Users\\student\\Desktop\\notitie.txt', explain: 'Get-Content toont de inhoud van het bestand, inclusief de vlag.' },
        { q: 'Bekijk de Run-key met Get-ItemProperty. Wat is de vlag in de verdachte opstartregel?', answer: ['JVT{run_key_is_persistentie}'], hint: 'Zoek de regel die naar AppData\\Roaming wijst, niet OneDrive of SecurityHealth.', explain: 'De "Updater" in AppData\\Roaming is een klassieke persistentietruc via een Run-key.' },
      ],
    },

    {
      title: 'Taak 4 — Services, processen en Event Viewer',
      content: `
        <p>Een werkplek draait tientallen achtergrondprogramma's. Twee begrippen horen bij elkaar:</p>
        <ul>
          <li><strong>Proces</strong> — een draaiend programma met een eigen proces-ID (PID). Bekijk ze in <strong>Taakbeheer</strong> (Task Manager) of met <code>Get-Process</code>.</li>
          <li><strong>Service</strong> — een programma dat op de achtergrond draait, vaak al voordat iemand inlogt (bijv. de printspooler of Windows Update). Beheer je via <code>services.msc</code> of met <code>Get-Service</code>.</li>
        </ul>
        <p>In de vorige taak zag je bij <code>Get-Service</code> dat <strong>WinDefend</strong> (Microsoft Defender) op <code>Stopped</code> stond. Een uitgeschakelde virusscanner is een rood vlaggetje; aanvallers zetten Defender graag uit.</p>

        <h3>Microsoft Defender</h3>
        <p><strong>Microsoft Defender</strong> is de ingebouwde virusscanner en bescherming van Windows. Hij scant bestanden, blokkeert bekende malware en houdt verdacht gedrag in de gaten. Dat Defender draait (en blijft draaien) is een basiscontrole bij elk onderzoek.</p>

        <h3>Event Viewer en event-ID's</h3>
        <p>Windows logt vrijwel alles in de <strong>Event Viewer</strong> (Logboeken). Voor security is het <em>Security</em>-logboek het belangrijkst. Elke gebeurtenis heeft een <strong>event-ID</strong>. Deze moet je kennen:</p>
        <table>
          <thead><tr><th>Event-ID</th><th>Betekenis</th></tr></thead>
          <tbody>
            <tr><td><code>4624</code></td><td>Geslaagde aanmelding (logon)</td></tr>
            <tr><td><code>4625</code></td><td>Mislukte aanmelding (veel achter elkaar = brute force)</td></tr>
            <tr><td><code>4672</code></td><td>Speciale bevoegdheden toegewezen (vaak bij een admin-logon)</td></tr>
            <tr><td><code>4688</code></td><td>Een nieuw proces is gestart</td></tr>
            <tr><td><code>4720</code></td><td>Er is een gebruikersaccount aangemaakt</td></tr>
            <tr><td><code>1102</code></td><td>Het auditlogboek is gewist (verdacht: iemand wil sporen wissen)</td></tr>
          </tbody>
        </table>

        <div class="callout tip"><strong>Denk als verdediger:</strong> één 4625 is een typefout. Twintig 4625's binnen een minuut, gevolgd door een 4624 en daarna een 4720, is een verhaal: een geslaagde brute force gevolgd door het aanmaken van een nieuw account. Dat patroon ga je in de volgende taak zelf herkennen.</div>
      `,
      questions: [
        { q: 'Welk event-ID hoort bij een GESLAAGDE aanmelding?', answer: ['4624'], hint: 'De mislukte variant is 4625.', explain: '4624 = geslaagde logon, 4625 = mislukte logon. Ze liggen één cijfer uit elkaar.' },
        { q: 'Je ziet event-ID 1102 in het Security-logboek. Wat betekent dat?', options: ['Een geslaagde login', 'Een nieuw account', 'Het auditlogboek is gewist', 'Een systeemupdate'], answer: 2, explain: '1102 betekent dat het auditlogboek is gewist, een klassieke poging om sporen uit te wissen.' },
      ],
    },

    {
      title: 'Taak 5 — Een aanval lezen in het Security-logboek',
      content: `
        <p>Nu brengen we het samen. Hieronder zie je een stuk uit het <strong>Security</strong>-logboek van een werkplek. Ergens zit een complete aanval verstopt. Gebruik het filter van de viewer (typ bijvoorbeeld <code>4625</code> om alleen de mislukte aanmeldingen te zien) en lees het verhaal.</p>

        <h3>Wat je zoekt</h3>
        <ol>
          <li><strong>De brute force.</strong> Filter op <code>4625</code>. Tel hoeveel mislukte aanmeldingen er zijn en let op dat ze allemaal van hetzelfde IP-adres komen en op hetzelfde account mikken.</li>
          <li><strong>Het moment van inbraak.</strong> Direct na de mislukte pogingen staat een <code>4624</code> (geslaagde aanmelding) vanaf datzelfde IP-adres: de aanvaller is binnen.</li>
          <li><strong>De persistentie.</strong> Kort daarna volgt een <code>4720</code>: er wordt een nieuw account aangemaakt zodat de aanvaller later terug kan. Noteer de accountnaam.</li>
        </ol>

        <div class="callout tip"><strong>Filtertip:</strong> typ <code>4625</code> in het filter voor de mislukte pogingen, en <code>4720</code> voor het aangemaakte account. Met <code>10.10.20.66</code> zie je alles wat met de aanvaller te maken heeft. De teller onderaan helpt je bij het tellen.</div>

        <p>Dit is precies het werk van een SOC-analist: uit een berg saaie regels het ene spoor vissen dat er echt toe doet. Doe je dit op een echt systeem, dan leg je hiermee de basis voor een incidentmelding (en, bij een datalek, een melding aan de Autoriteit Persoonsgegevens).</p>
      `,
      lab: {
        type: 'logs',
        title: 'Event Viewer — Security (JVT-PC01)',
        lines: WIN_SECLOG,
      },
      questions: [
        { q: 'Hoeveel mislukte aanmeldingen (event 4625) staan er in het logboek?', answer: ['10'], hint: 'Filter op 4625 en kijk naar de teller onderaan.', explain: 'Er staan 10 keer een 4625: een duidelijke brute-force-poging.' },
        { q: 'Vanaf welk IP-adres kwam de aanval?', answer: ['10.10.20.66'], hint: 'Alle 4625-regels en de geslaagde 4624 delen hetzelfde Source Network Address.', explain: 'Alle mislukte pogingen en de uiteindelijke geslaagde login kwamen van 10.10.20.66.' },
        { q: 'Welke accountnaam werd aangemaakt (event 4720) ná de geslaagde inbraak?', answer: ['svc_backup', 'svc backup'], hint: 'Filter op 4720.', explain: 'Het nieuwe account svc_backup is de persistentie: zo kan de aanvaller later gewoon weer inloggen.' },
      ],
    },

    {
      title: 'Taak 6 — Active Directory',
      content: `
        <p>In een bedrijf wil je niet op elke computer losse accounts beheren. Daarvoor bestaat <strong>Active Directory (AD)</strong>: de centrale gebruikers- en rechtenadministratie van een Windows-netwerk.</p>

        <h3>De bouwstenen</h3>
        <ul>
          <li><strong>Domein</strong> — een groep computers en gebruikers die samen worden beheerd, bijv. <code>jvt-corp.local</code>.</li>
          <li><strong>Domaincontroller (DC)</strong> — de server die het domein draait: hij bewaart alle accounts en controleert aanmeldingen. Wie de DC beheerst, beheerst het netwerk.</li>
          <li><strong>Gebruikers, groepen en OU's</strong> — accounts worden in groepen gezet (bijv. "Verkoop") en geordend in <strong>Organizational Units</strong> (OU's), mappen om beleid op toe te passen.</li>
          <li><strong>Group Policy (GPO)</strong> — centrale instellingen die automatisch naar computers en gebruikers worden geduwd: wachtwoordregels, achtergronden, software, noem maar op.</li>
        </ul>

        <h3>Aanmelden: Kerberos en NTLM</h3>
        <p>Als je inlogt op een domein, bewijs je je identiteit via een authenticatieprotocol. <strong>Kerberos</strong> is het moderne protocol: je krijgt na het inloggen "tickets" waarmee je toegang tot diensten krijgt zonder telkens je wachtwoord te sturen. <strong>NTLM</strong> is het oudere, zwakkere protocol dat nog vaak aanstaat voor compatibiliteit. Beide zijn een doelwit: aanvallers proberen tickets of wachtwoord-hashes te stelen en hergebruiken (technieken met namen als pass-the-hash en Kerberoasting).</p>

        <div class="callout danger"><strong>Waarom AD zo'n geliefd doelwit is:</strong> AD koppelt alles aan elkaar. Lukt het een aanvaller om een domeinbeheerdersaccount of de domaincontroller over te nemen, dan heeft hij in één klap toegang tot vrijwel elk systeem en elk account in het bedrijf. Daarom draait een groot deel van bedrijfsaanvallen (en pentests) om het veroveren van Active Directory.</div>

        <p>Hiermee heb je de Windows-basis te pakken: van losse accounts en het register tot de centrale macht van Active Directory. In de volgende leerpaden gebruik je deze kennis om aanvallen te herkennen en te stoppen. Onthoud: oefenen met deze technieken doe je uitsluitend in je eigen lab of met schriftelijke toestemming.</p>
      `,
      questions: [
        { q: 'Waarom is de domaincontroller zo\'n belangrijk doelwit?', options: ['Hij host de website', 'Hij beheert alle accounts en aanmeldingen van het domein', 'Hij maakt back-ups', 'Hij is de snelste computer'], answer: 1, explain: 'De DC bewaart alle accounts en controleert aanmeldingen; wie hem overneemt, beheerst het hele netwerk.' },
        { q: 'Ik begrijp waarom een aanvaller die Active Directory overneemt vrijwel het hele bedrijf in handen heeft.', noAnswer: true },
      ],
    },
  ],

  terms: [
    { term: 'Lokale administrator', def: 'Account met volledige rechten op één computer: software installeren, instellingen en accounts beheren.' },
    { term: 'UAC', def: 'User Account Control: vraagt bevestiging voordat een actie met beheerrechten draait (elevation).' },
    { term: 'NTFS', def: 'Het bestandssysteem van Windows, met rechten via ACL\'s (Access Control Lists) per bestand of map.' },
    { term: 'Register', def: 'Centrale instellingendatabase van Windows, opgebouwd uit hives zoals HKLM (machine) en HKCU (gebruiker).' },
    { term: 'Run-key', def: 'Registersleutel onder CurrentVersion\\Run die programma\'s automatisch start bij inloggen; geliefde plek voor persistentie.' },
    { term: 'Persistentie', def: 'Technieken waarmee een aanvaller toegang houdt, ook na een herstart (bijv. via een Run-key of nieuw account).' },
    { term: 'PowerShell / cmdlet', def: 'De shell van Windows; commando\'s (cmdlets) volgen het patroon Werkwoord-Zelfstandignaamwoord, zoals Get-Process.' },
    { term: 'Event-ID', def: 'Nummer van een gebeurtenis in de Event Viewer, bijv. 4624 (geslaagde logon) of 4625 (mislukte logon).' },
    { term: 'Microsoft Defender', def: 'De ingebouwde virusscanner en bescherming van Windows; staat hij uit, dan is dat een rood vlaggetje.' },
    { term: 'Active Directory', def: 'Centrale gebruikers- en rechtenadministratie van een Windows-netwerk, beheerd door domaincontrollers.' },
    { term: 'Domaincontroller (DC)', def: 'Server die een AD-domein draait, alle accounts bewaart en aanmeldingen controleert; het kroonjuweel van het netwerk.' },
    { term: 'Kerberos / NTLM', def: 'Authenticatieprotocollen in Windows-domeinen; Kerberos is modern (tickets), NTLM ouder en zwakker.' },
  ],

  resources: [
    { title: 'Microsoft Learn', url: 'https://learn.microsoft.com/' },
    { title: 'Microsoft Learn: Windows Security-event-ID\'s', url: 'https://learn.microsoft.com/en-us/windows/security/' },
    { title: 'TryHackMe', url: 'https://tryhackme.com/' },
  ],
});
