/* Room: Detectie-engineering — regex, Sigma & YARA */

// auth.log voor het regex-lab (taak 2): een SSH-brute force met veel "invalid user"-pogingen,
// zodat een naïef patroon in groep 1 het woord "invalid" vangt in plaats van de gebruikersnaam.
const DE_AUTH_LOG = `Oct  4 01:58:02 srv-api02 sshd[2201]: Accepted publickey for deploy from 192.0.2.10 port 50122 ssh2: ED25519 SHA256:k3Yq0wPz
Oct  4 01:58:02 srv-api02 sshd[2201]: pam_unix(sshd:session): session opened for user deploy(uid=1001) by (uid=0)
Oct  4 02:02:17 srv-api02 sshd[2240]: Failed password for root from 198.51.100.7 port 41822 ssh2
Oct  4 02:05:00 srv-api02 CRON[2251]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)
Oct  4 02:14:31 srv-api02 sshd[2302]: Invalid user admin from 203.0.113.61 port 60010
Oct  4 02:14:31 srv-api02 sshd[2302]: Failed password for invalid user admin from 203.0.113.61 port 60010 ssh2
Oct  4 02:14:34 srv-api02 sshd[2303]: Invalid user admin from 203.0.113.61 port 60012
Oct  4 02:14:34 srv-api02 sshd[2303]: Failed password for invalid user admin from 203.0.113.61 port 60012 ssh2
Oct  4 02:14:37 srv-api02 sshd[2304]: Invalid user test from 203.0.113.61 port 60015
Oct  4 02:14:37 srv-api02 sshd[2304]: Failed password for invalid user test from 203.0.113.61 port 60015 ssh2
Oct  4 02:14:40 srv-api02 sshd[2305]: Failed password for root from 203.0.113.61 port 60018 ssh2
Oct  4 02:14:43 srv-api02 sshd[2306]: Invalid user oracle from 203.0.113.61 port 60021
Oct  4 02:14:43 srv-api02 sshd[2306]: Failed password for invalid user oracle from 203.0.113.61 port 60021 ssh2
Oct  4 02:14:46 srv-api02 sshd[2307]: Invalid user admin from 203.0.113.61 port 60024
Oct  4 02:14:46 srv-api02 sshd[2307]: Failed password for invalid user admin from 203.0.113.61 port 60024 ssh2
Oct  4 02:14:49 srv-api02 sshd[2308]: Failed password for root from 203.0.113.61 port 60027 ssh2
Oct  4 02:14:52 srv-api02 sshd[2309]: Invalid user ubuntu from 203.0.113.61 port 60030
Oct  4 02:14:52 srv-api02 sshd[2309]: Failed password for invalid user ubuntu from 203.0.113.61 port 60030 ssh2
Oct  4 02:14:55 srv-api02 sshd[2310]: Invalid user admin from 203.0.113.61 port 60033
Oct  4 02:14:55 srv-api02 sshd[2310]: Failed password for invalid user admin from 203.0.113.61 port 60033 ssh2
Oct  4 02:14:56 srv-api02 sshd[2310]: Connection closed by invalid user admin 203.0.113.61 port 60033 [preauth]
Oct  4 02:15:02 srv-api02 sshd[2312]: Failed password for jbakker from 203.0.113.61 port 60036 ssh2
Oct  4 02:15:05 srv-api02 sshd[2313]: Failed password for jbakker from 203.0.113.61 port 60039 ssh2
Oct  4 02:15:08 srv-api02 sshd[2314]: Accepted password for jbakker from 203.0.113.61 port 60042 ssh2
Oct  4 02:15:08 srv-api02 sshd[2314]: pam_unix(sshd:session): session opened for user jbakker(uid=1012) by (uid=0)
Oct  4 02:16:21 srv-api02 sudo:  jbakker : TTY=pts/1 ; PWD=/home/jbakker ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow
Oct  4 02:20:00 srv-api02 CRON[2330]: pam_unix(cron:session): session closed for user root
Oct  4 02:31:40 srv-api02 sshd[2351]: Accepted publickey for deploy from 192.0.2.10 port 50388 ssh2: ED25519 SHA256:k3Yq0wPz`;

// Sysmon-procesgebeurtenissen (EventID 1) voor het logs-lab (taak 4): drie fout-positieven via SCCM (CcmExec)
// en één echte treffer: Word dat een verborgen PowerShell met -enc start. Base64 decodeert naar onschuldige tekst.
const DE_SYSMON_LOG = `2026-10-02T07:58:11Z WS-FIN-03 Sysmon EventID=1 User=JVT\\a.bakker ParentImage=C:\\Windows\\explorer.exe Image=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe CommandLine="chrome.exe"
2026-10-02T08:00:04Z WS-HR-02 Sysmon EventID=1 User=NT AUTHORITY\\SYSTEM ParentImage=C:\\Windows\\CCM\\CcmExec.exe Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell.exe -NoLogo -NonInteractive -ExecutionPolicy Bypass -EncodedCommand VwByAGkAdABlAC0ATwB1AHQAcAB1AHQAIAAnAFMAQwBDAE0AIABjAG8AbQBwAGwAaQBhAG4AYwBlACAAYwBoAGUAYwBrACcA"
2026-10-02T08:01:37Z WS-FIN-03 Sysmon EventID=1 User=JVT\\a.bakker ParentImage=C:\\Windows\\explorer.exe Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell.exe -NoProfile"
2026-10-02T08:03:12Z SRV-FS-01 Sysmon EventID=1 User=NT AUTHORITY\\SYSTEM ParentImage=C:\\Windows\\System32\\svchost.exe Image=C:\\Windows\\System32\\taskhostw.exe CommandLine="taskhostw.exe"
2026-10-02T08:04:40Z WS-FIN-07 Sysmon EventID=1 User=NT AUTHORITY\\SYSTEM ParentImage=C:\\Windows\\CCM\\CcmExec.exe Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell.exe -NoLogo -enc VwByAGkAdABlAC0ATwB1AHQAcAB1AHQAIAAnAFMAQwBDAE0AIABjAG8AbQBwAGwAaQBhAG4AYwBlACAAYwBoAGUAYwBrACcA"
2026-10-02T08:05:00Z SRV-FS-01 Sysmon EventID=1 User=NT AUTHORITY\\SYSTEM ParentImage=C:\\Windows\\System32\\svchost.exe Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell.exe -NoProfile -File C:\\Scripts\\backup_taak.ps1"
2026-10-02T08:09:26Z WS-ICT-01 Sysmon EventID=1 User=JVT\\s.elmasri ParentImage=C:\\Windows\\explorer.exe Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell.exe Get-Content C:\\Temp\\log.txt | Out-File -Encoding utf8 C:\\Temp\\kopie.txt"
2026-10-02T08:12:51Z WS-MKT-04 Sysmon EventID=1 User=JVT\\l.jansen ParentImage=C:\\Windows\\explorer.exe Image=C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE CommandLine="WINWORD.EXE /n C:\\Users\\l.jansen\\Downloads\\Factuur_2026-117.docm"
2026-10-02T08:12:58Z WS-MKT-04 Sysmon EventID=1 User=JVT\\l.jansen ParentImage=C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell.exe -nop -w hidden -enc VwByAGkAdABlAC0ATwB1AHQAcAB1AHQAIAAnAG8AZQBmAGUAbgBzAGEAbQBwAGwAZQAnAA==" soc_note=JVT{encoded_powershell_gevangen}
2026-10-02T08:13:04Z WS-MKT-04 Sysmon EventID=1 User=JVT\\l.jansen ParentImage=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe Image=C:\\Windows\\System32\\whoami.exe CommandLine="whoami.exe /all"
2026-10-02T08:13:09Z WS-MKT-04 Sysmon EventID=1 User=JVT\\l.jansen ParentImage=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe Image=C:\\Windows\\System32\\nslookup.exe CommandLine="nslookup update-check.jvt.lab"
2026-10-02T08:15:33Z WS-HR-02 Sysmon EventID=1 User=JVT\\m.visser ParentImage=C:\\Windows\\explorer.exe Image=C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE CommandLine="OUTLOOK.EXE"
2026-10-02T08:20:00Z WS-HR-11 Sysmon EventID=1 User=NT AUTHORITY\\SYSTEM ParentImage=C:\\Windows\\CCM\\CcmExec.exe Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell.exe -NonInteractive -EncodedCommand RwBlAHQALQBTAGUAcgB2AGkAYwBlACAAfAAgAE8AdQB0AC0ATgB1AGwAbAA="
2026-10-02T08:22:47Z WS-ICT-01 Sysmon EventID=1 User=JVT\\s.elmasri ParentImage=C:\\Windows\\explorer.exe Image=C:\\Windows\\System32\\cmd.exe CommandLine="cmd.exe /c ipconfig /all"
2026-10-02T08:25:10Z WS-FIN-03 Sysmon EventID=1 User=JVT\\a.bakker ParentImage=C:\\Windows\\explorer.exe Image=C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE CommandLine="EXCEL.EXE C:\\Users\\a.bakker\\Documents\\begroting.xlsx"
2026-10-02T08:30:02Z SRV-FS-01 Sysmon EventID=1 User=NT AUTHORITY\\SYSTEM ParentImage=C:\\Windows\\System32\\services.exe Image=C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\MsMpEng.exe CommandLine="MsMpEng.exe"
2026-10-02T08:34:18Z WS-FIN-07 Sysmon EventID=1 User=JVT\\r.dijkstra ParentImage=C:\\Windows\\explorer.exe Image=C:\\Windows\\System32\\notepad.exe CommandLine="notepad.exe C:\\Users\\r.dijkstra\\Desktop\\todo.txt"
2026-10-02T08:40:00Z WS-ICT-01 Sysmon EventID=1 User=JVT\\s.elmasri ParentImage=C:\\Windows\\explorer.exe Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell.exe Get-EventLog -LogName System -Newest 20"`;

// Webserverlog voor het regex-lab in de slottaak (taak 7): path-traversalpogingen, één geslaagde
// (een geautoriseerde purple-team-test die zijn verzoek markeert) en één variant die het patroon mist (%5c).
const DE_ACCESS_LOG = `192.0.2.51 - - [04/Oct/2026:10:02:11 +0200] "GET / HTTP/1.1" 200 2310 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0"
192.0.2.51 - - [04/Oct/2026:10:02:12 +0200] "GET /css/stijl.css HTTP/1.1" 200 1840 "https://portaal.jvt.lab/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0"
198.51.100.9 - - [04/Oct/2026:10:03:40 +0200] "GET /zoeken?q=a..z HTTP/1.1" 200 4120 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605.1"
192.0.2.77 - - [04/Oct/2026:10:04:40 +0200] "GET /blog/wat-is-nieuw... HTTP/1.1" 200 3880 "-" "Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0"
203.0.113.140 - - [04/Oct/2026:10:05:01 +0200] "GET /download?bestand=../../../../etc/passwd HTTP/1.1" 400 312 "-" "python-requests/2.32"
203.0.113.140 - - [04/Oct/2026:10:05:02 +0200] "GET /download?bestand=..%2f..%2f..%2fetc%2fpasswd HTTP/1.1" 403 289 "-" "python-requests/2.32"
203.0.113.140 - - [04/Oct/2026:10:05:03 +0200] "GET /static/%2e%2e/%2e%2e/%2e%2e/windows/win.ini HTTP/1.1" 404 512 "-" "python-requests/2.32"
203.0.113.140 - - [04/Oct/2026:10:05:04 +0200] "GET /download?bestand=....//....//etc/passwd HTTP/1.1" 404 512 "-" "python-requests/2.32"
203.0.113.140 - - [04/Oct/2026:10:05:05 +0200] "GET /img/..%5c..%5cboot.ini HTTP/1.1" 404 512 "-" "python-requests/2.32"
192.0.2.51 - - [04/Oct/2026:10:06:14 +0200] "GET /download?bestand=handleiding.pdf HTTP/1.1" 200 88412 "https://portaal.jvt.lab/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0"
198.51.100.9 - - [04/Oct/2026:10:07:02 +0200] "GET /contact HTTP/1.1" 200 1990 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605.1"
198.51.100.200 - - [04/Oct/2026:10:09:45 +0200] "GET /download?bestand=..%2F..%2Fconfig%2Fapp.ini HTTP/1.1" 200 742 "-" "Mozilla/5.0 (purple-team-test; JVT{detectie_als_code})"
192.0.2.77 - - [04/Oct/2026:10:10:20 +0200] "POST /contact HTTP/1.1" 200 640 "https://portaal.jvt.lab/contact" "Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0"
192.0.2.51 - - [04/Oct/2026:10:11:03 +0200] "GET /favicon.ico HTTP/1.1" 200 318 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0"
198.51.100.9 - - [04/Oct/2026:10:12:48 +0200] "GET /docs/release-notes HTTP/1.1" 200 2210 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605.1"`;

// Hex-dump van updater.exe voor het YARA-lab: MZ-header, DOS-stub, en "PowerShell -enc ..." als UTF-16LE (wide).
const DE_UPDATER_HEX =
  '4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00 54 68 69 73 20 70 72 6F ' +
  '67 72 61 6D 20 63 61 6E 6E 6F 74 20 62 65 20 72 75 6E 20 69 6E 20 44 4F ' +
  '53 20 6D 6F 64 65 2E 00 00 50 45 00 00 50 00 6F 00 77 00 65 00 72 00 53 ' +
  '00 68 00 65 00 6C 00 6C 00 20 00 2D 00 65 00 6E 00 63 00 20 00 56 00 77 ' +
  '00 42 00 79 00 41 00 47 00 6B 00 41 00 64 00 41 00 42 00 6C 00 41 00 41 ' +
  '00 3D 00 3D 00 20 00 00 00 75 70 64 61 74 65 2D 63 68 65 63 6B 2E 6A 76 ' +
  '74 2E 6C 61 62 00';

// Begin-YARA-regel: bewust te breed ("-enc" raakt ook "-Encoding").
const DE_YARA_START = `rule Verdachte_PowerShell_Loader {
  meta:
    auteur = "JVT Cyber Dojo"
    versie = "1 - startversie, nog niet getest"
  strings:
    $ps  = "powershell" nocase
    $enc = "-enc" nocase
  condition:
    all of them
}`;

CS.registerRoom({
  id: 'detectie-engineering',
  path: 'defensief',
  order: 5,
  title: 'Detectie-engineering: regex, Sigma & YARA',
  icon: '🎛️',
  difficulty: 'Moeilijk',
  minutes: 75,
  summary: 'Van losse zoekopdracht naar volwassen detectie: werken als detectie-engineer met reguliere expressies, Sigma-regels en YARA, en regels testen, tunen en hun ATT&CK-dekking meten.',
  objectives: [
    'Uitleggen wat detectie-engineering en detection-as-code zijn en de levenscyclus van een detectieregel doorlopen',
    'True/false positives en negatives onderscheiden en uitleggen waarom alertmoeheid gevaarlijk is',
    'Reguliere expressies met capture-groepen schrijven en testen op logregels',
    'Een Sigma-regel lezen en schrijven (logsource, selection, filter, condition) en uitleggen hoe die naar een SIEM-query wordt vertaald',
    'Een te brede YARA-regel herkennen aan fout-positieven en hem gericht aanscherpen',
    'Detectieregels testen en tunen en de dekking op MITRE ATT&CK meten',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is detectie-engineering?',
      content: `
        <p>In de room over logs heb je met de hand aanvallen uit logregels gevist. Dat werkt voor één incident, maar een
        SOC krijgt elke dag miljoenen regels binnen. Niemand kan die allemaal lezen. Daarom schrijf je <strong>regels</strong>
        die automatisch alarm slaan als een bepaald patroon voorbijkomt. Het vak dat zulke regels ontwerpt, test en
        onderhoudt heet <strong>detectie-engineering</strong> (<em>detection engineering</em>).</p>

        <h3>De analogie van de rookmelder</h3>
        <p>Een rookmelder die nooit afgaat, is waardeloos. Een rookmelder die afgaat bij elke tosti, is net zo waardeloos:
        na de derde keer haal je de batterij eruit. Een goede melder hangt op de juiste plek, is getest, en gaat af bij
        brand, niet bij het ontbijt. Detectieregels werken precies zo.</p>

        <h3>De levenscyclus van een regel</h3>
        <figure class="diagram">
          <svg viewBox="0 0 640 150" role="img" aria-label="Levenscyclus van een detectieregel">
            <rect x="10" y="40" width="100" height="44" rx="8" fill="var(--accent-soft)" stroke="currentColor"/>
            <text x="60" y="67" text-anchor="middle" fill="currentColor" font-size="13">Hypothese</text>
            <rect x="140" y="40" width="100" height="44" rx="8" fill="var(--surface-2)" stroke="currentColor"/>
            <text x="190" y="67" text-anchor="middle" fill="currentColor" font-size="13">Regel</text>
            <rect x="270" y="40" width="100" height="44" rx="8" fill="var(--surface-2)" stroke="currentColor"/>
            <text x="320" y="67" text-anchor="middle" fill="currentColor" font-size="13">Testen</text>
            <rect x="400" y="40" width="100" height="44" rx="8" fill="var(--surface-2)" stroke="currentColor"/>
            <text x="450" y="67" text-anchor="middle" fill="currentColor" font-size="13">Tunen</text>
            <rect x="530" y="40" width="100" height="44" rx="8" fill="var(--surface-2)" stroke="currentColor"/>
            <text x="580" y="67" text-anchor="middle" fill="currentColor" font-size="13">Onderhouden</text>
            <line x1="110" y1="62" x2="140" y2="62" stroke="currentColor"/>
            <line x1="240" y1="62" x2="270" y2="62" stroke="currentColor"/>
            <line x1="370" y1="62" x2="400" y2="62" stroke="currentColor"/>
            <line x1="500" y1="62" x2="530" y2="62" stroke="currentColor"/>
            <polyline points="580,84 580,125 60,125 60,84" fill="none" stroke="var(--accent)" stroke-dasharray="5 4"/>
            <text x="320" y="143" text-anchor="middle" fill="currentColor" font-size="13">nieuwe dreiging of te veel loos alarm: terug naar het begin</text>
          </svg>
          <figcaption>Een detectieregel is nooit "af": hij doorloopt steeds opnieuw dezelfde cyclus.</figcaption>
        </figure>
        <ol>
          <li><strong>Hypothese</strong>: wat wil je zien? Bijvoorbeeld: "Een aanvaller die via een macro PowerShell start,
          verstopt zijn commando vaak met <code>-EncodedCommand</code>."</li>
          <li><strong>Regel</strong>: vertaal de hypothese naar logica in een regex, Sigma-regel, YARA-regel of SIEM-query.</li>
          <li><strong>Testen</strong>: raakt de regel de aanval (in een lab nagebootst) en blijft hij stil op een normale week?</li>
          <li><strong>Tunen</strong>: haal het loze alarm eruit met gerichte uitzonderingen, zonder de echte aanval te missen.</li>
          <li><strong>Onderhouden</strong>: software en aanvallers veranderen, dus je regels ook.</li>
        </ol>

        <h3>Detection-as-code</h3>
        <p>Moderne teams behandelen regels als software: <strong>detection-as-code</strong>. De regels staan als tekstbestanden
        in een Git-repository, elke wijziging gaat via een review (vier-ogenprincipe), en een pijplijn (CI) test automatisch
        of de regel nog steeds de bekende aanvallen raakt voordat hij live gaat. Zo weet je altijd wie wat waarom
        veranderde, en kun je een slechte wijziging terugdraaien.</p>

        <h3>Goed, fout, gemist</h3>
        <table>
          <thead><tr><th></th><th>Echte aanval</th><th>Niets aan de hand</th></tr></thead>
          <tbody>
            <tr><td><strong>Regel raakt</strong></td><td>True positive (TP)</td><td>False positive (FP)</td></tr>
            <tr><td><strong>Regel stil</strong></td><td>False negative (FN)</td><td>True negative (TN)</td></tr>
          </tbody>
        </table>
        <p>Een handige maat is de <strong>precisie</strong>: welk deel van de alerts was terecht? Precisie = TP ÷ (TP + FP).
        Geeft een regel 50 alerts in een week en zijn er 5 echt, dan is de precisie 10% en is 90% loos alarm.</p>

        <div class="callout danger">
          <strong>Alertmoeheid is een beveiligingsrisico:</strong> een analist die de hele dag loze meldingen wegklikt,
          klikt uiteindelijk ook de echte weg. Bij meerdere grote inbraken bleek achteraf dat er wél een alert was, maar
          dat die verdronk tussen honderden andere. Een regel die vooral ruis maakt, is dus niet "extra veilig", maar gevaarlijk.
        </div>
      `,
      questions: [
        { q: 'Welke stap in de levenscyclus komt direct na het schrijven van de regel?', answer: ['testen', 'test', 'testing'], hint: 'Kijk naar het diagram: Hypothese, Regel, ...', explain: 'Na het schrijven test je de regel: raakt hij de aanval en blijft hij stil op normaal verkeer?' },
        { q: 'Een regel geeft 50 alerts in een week; 5 daarvan zijn echte aanvallen. Hoeveel procent van de alerts is false positive?', answer: ['90', '90%', '90 %'], hint: '50 - 5 loze alarmen, als deel van 50.', explain: '45 van de 50 alerts zijn loos: 90% false positives, een precisie van 10%.' },
        { q: 'Er vindt een echte aanval plaats, maar je regel blijft stil. Hoe heet dat?', options: ['True positive', 'False positive', 'False negative', 'True negative'], answer: 2, explain: 'Een gemiste aanval is een false negative: het gevaarlijkste soort fout, want je merkt hem niet.' },
        { q: 'Wat betekent detection-as-code?', options: ['Regels als code in versiebeheer, met review en automatische tests', 'Malware schrijven om je detectie te testen', 'Alle detectie in één groot script op de SIEM-server', 'Logs versleutelen met code'], answer: 0, explain: 'Detection-as-code: regels in Git, reviews en CI-tests, net als gewone software.' },
      ],
    },

    {
      title: 'Taak 2 — Reguliere expressies voor analisten',
      content: `
        <p>Een <strong>reguliere expressie</strong> (regex) is een zoekpatroon. Waar een gewone zoekopdracht één vaste tekst
        zoekt, beschrijft een regex een <em>vorm</em>: "het woord Failed, dan willekeurige tekst, dan een IP-adres". Regex
        zit overal in detectie: in grep, in SIEM-query's, in Sigma (<code>|re</code>) en in YARA. Vergelijk het met een
        zoekopdracht op Marktplaats met filters: niet "fiets", maar "fiets, tussen 50 en 150 euro, in Utrecht".</p>

        <h3>De spiekbrief</h3>
        <table>
          <thead><tr><th>Teken</th><th>Betekenis</th><th>Voorbeeld</th></tr></thead>
          <tbody>
            <tr><td><code>\\d</code> <code>\\w</code> <code>\\s</code></td><td>cijfer, woordteken (letter/cijfer/_), witruimte</td><td><code>\\d+</code> vangt <code>60010</code></td></tr>
            <tr><td><code>.</code></td><td>één willekeurig teken</td><td><code>a.c</code> vangt <code>abc</code></td></tr>
            <tr><td><code>*</code> <code>+</code> <code>?</code></td><td>0 of meer, 1 of meer, 0 of 1 keer</td><td><code>\\w+</code> vangt een heel woord</td></tr>
            <tr><td><code>{n,m}</code></td><td>tussen n en m keer</td><td><code>\\d{1,3}</code> vangt <code>203</code></td></tr>
            <tr><td><code>[...]</code></td><td>één teken uit een set</td><td><code>[0-9a-f]</code> is één hexcijfer</td></tr>
            <tr><td><code>(...)</code></td><td>capture-groep: dit stuk wil ik apart terugzien</td><td><code>for (\\w+)</code></td></tr>
            <tr><td><code>(?:...)</code></td><td>groep zonder vangen (alleen groeperen)</td><td><code>(?:invalid user )?</code></td></tr>
            <tr><td><code>a|b</code></td><td>a of b</td><td><code>password|publickey</code></td></tr>
            <tr><td><code>^</code> <code>$</code></td><td>begin en einde (van een regel met vlag <code>m</code>)</td><td><code>^Oct</code></td></tr>
            <tr><td><code>\\.</code></td><td>een echte punt (escapen)</td><td><code>203\\.0\\.113\\.61</code></td></tr>
          </tbody>
        </table>
        <p>Vlaggen: <code>g</code> = alle treffers (niet alleen de eerste), <code>i</code> = hoofdletterongevoelig,
        <code>m</code> = <code>^</code> en <code>$</code> per regel.</p>

        <h3>Opdracht: een brute force uitpluizen</h3>
        <p>Het lab bevat een <code>auth.log</code> van <code>srv-api02</code>. Het startpatroon is
        <code>Failed password for (\\w+)</code> met vlag <code>g</code>. Groep 1 zou de gebruikersnaam moeten zijn.</p>
        <ol>
          <li>Kijk naar de teller: hoeveel treffers geeft het startpatroon?</li>
          <li>Bekijk de tabel met capture-groepen. Welke waarde staat het vaakst in groep 1? Klopt dat wel?</li>
          <li>Verbeter het patroon tot
          <code>Failed password for (?:invalid user )?(\\w+) from (\\d{1,3}(?:\\.\\d{1,3}){3})</code>.
          Nu slaat de regex het stukje <code>invalid user </code> over als het er staat, en vangt groep 2 het IP-adres.</li>
        </ol>

        <div class="callout warn">
          <strong>Valkuil:</strong> een regex doet precies wat je schrijft, niet wat je bedoelt. Bij een gebruikersnaam die
          niet bestaat logt sshd <code>Failed password for invalid user admin</code>, en dan is het eerste "woord" na
          <code>for</code> niet de gebruiker. Test je patroon daarom altijd op echte logregels, met de randgevallen erin.
        </div>
        <div class="callout tip">
          <strong>Tip:</strong> een punt zonder backslash betekent "elk teken". Het patroon <code>203.0.113.61</code> raakt dus
          ook <code>203x0y113z61</code>. In een detectieregel is dat slordig; in een uitzondering (filter) kan het zelfs
          een gat zijn dat een aanvaller misbruikt.
        </div>
      `,
      lab: {
        type: 'regex',
        text: DE_AUTH_LOG,
        pattern: 'Failed password for (\\w+)',
        flags: 'g',
      },
      questions: [
        { q: 'Hoeveel treffers geeft het startpatroon Failed password for (\\w+) (vlag g)?', answer: ['12'], hint: 'Lees de teller in het lab af.', explain: 'Er staan 12 regels met "Failed password for": 3 op root, 2 op jbakker en 7 op niet-bestaande gebruikers.' },
        { q: 'Welke waarde staat met het startpatroon het vaakst in groep 1?', answer: ['invalid'], hint: 'Kijk naar de tabel met capture-groepen. Het is geen echte gebruikersnaam.', explain: 'Groep 1 vangt 7 keer "invalid", uit "Failed password for invalid user ...". Het patroon klopt dus niet voor dit randgeval.' },
        { q: 'Welke gebruikersnaam staat met het verbeterde patroon het vaakst in groep 1?', answer: ['admin'], hint: 'Vervang het patroon door de verbeterde versie uit stap 3 en tel opnieuw.', explain: 'Met (?:invalid user )? erin komt admin 4 keer voor, root 3 keer en jbakker 2 keer.' },
        { q: 'Waarom schrijf je in een regex 203\\.0\\.113\\.61 en niet 203.0.113.61?', options: ['Een losse punt betekent "elk teken", dus zonder backslash raakt het patroon ook andere tekst', 'Zonder backslash werkt de regex alleen met de vlag i', 'De backslash maakt de regex sneller, verder maakt het niet uit', 'IP-adressen mogen in een regex alleen tussen haakjes staan'], answer: 0, explain: 'In regex is . een joker voor elk teken. Met \\. zoek je een echte punt.' },
      ],
    },

    {
      title: 'Taak 3 — Sigma: één regel, elke SIEM',
      content: `
        <p>Elk SIEM heeft zijn eigen zoektaal: Splunk gebruikt SPL, Microsoft Sentinel KQL, Elastic heeft weer iets anders.
        Schrijf je een regel in één taal, dan zit je vast aan dat product. <strong>Sigma</strong> lost dat op: het is een
        open, leveranciersonafhankelijk formaat voor detectieregels in YAML. Je kunt het zien als een recept: het recept
        blijft hetzelfde, of je nu op gas of inductie kookt. Een vertaler zet het recept om naar de taal van jouw SIEM.
        In de openbare SigmaHQ-repository staan duizenden regels die de community deelt.</p>

        <h3>Voorbeeld: PowerShell met een gecodeerd commando</h3>
        <p>Aanvallers verstoppen PowerShell-commando's graag in Base64 met <code>-EncodedCommand</code> (afgekort
        <code>-enc</code> of <code>-ec</code>). Zo leest een snelle blik op de opdrachtregel niets verdachts. Een Sigma-regel:</p>
        <pre><code>title: PowerShell met gecodeerd commando
id: 7c1e2f9a-0d4b-4c55-9a61-2b8e0f3d1a77
status: experimental
description: PowerShell gestart met -EncodedCommand, vaak gebruikt om commando's te verbergen
author: JVT Cyber Dojo
date: 2026-10-01
tags:
  - attack.execution
  - attack.t1059.001
  - attack.defense-evasion
  - attack.t1027
logsource:
  product: windows
  category: process_creation
detection:
  selection_img:
    Image|endswith: '\\powershell.exe'
  selection_cli:
    CommandLine|contains:
      - ' -enc '
      - ' -EncodedCommand '
      - ' -ec '
  filter_sccm:
    ParentImage|endswith: '\\CcmExec.exe'
  condition: all of selection_* and not filter_sccm
falsepositives:
  - Beheersoftware (zoals SCCM) die scripts gecodeerd doorgeeft
level: high</code></pre>
        <ul>
          <li><strong>title, id, status, tags</strong>: wat de regel is, een unieke ID, hoe volwassen hij is, en de koppeling
          aan MITRE ATT&amp;CK (hier T1059.001 PowerShell en T1027 verhulling).</li>
          <li><strong>logsource</strong>: in welke logs je zoekt. Hier procesgebeurtenissen op Windows (Sysmon EventID 1 of
          Security 4688).</li>
          <li><strong>detection</strong>: benoemde blokken. Velden met modifiers zoals <code>|endswith</code>,
          <code>|contains</code>, <code>|startswith</code> of <code>|re</code>. Een lijst onder een veld betekent OF; meerdere
          velden in één blok betekenen EN. Sigma vergelijkt standaard hoofdletterongevoelig.</li>
          <li><strong>condition</strong>: hoe de blokken samen een alert worden. <code>not filter_sccm</code> haalt het
          bekende loze alarm eruit.</li>
          <li><strong>falsepositives</strong> en <strong>level</strong>: wat de analist moet weten, en hoe ernstig het is.</li>
        </ul>

        <h3>Van Sigma naar SIEM-query</h3>
        <p>Met <code>sigma-cli</code> (gebouwd op de bibliotheek pySigma) zet je de regel om, bijvoorbeeld:
        <code>sigma convert -t splunk -p sysmon regel.yml</code>. Dat geeft ongeveer:</p>
        <pre><code>Image="*\\powershell.exe" (CommandLine="* -enc *" OR CommandLine="* -EncodedCommand *" OR CommandLine="* -ec *") NOT ParentImage="*\\CcmExec.exe"</code></pre>
        <p>En dezelfde logica in KQL voor Microsoft Defender/Sentinel:</p>
        <pre><code>DeviceProcessEvents
| where FileName =~ "powershell.exe"
| where ProcessCommandLine has_any (" -enc ", " -EncodedCommand ", " -ec ")
| where InitiatingProcessFileName !~ "CcmExec.exe"</code></pre>

        <h3>Tellen over tijd: brute force met 4625</h3>
        <p>Eén mislukte Windows-aanmelding (event <code>4625</code>) is een typefout. Tien binnen vijf minuten vanaf één bron
        is verdacht. Daarvoor heeft Sigma <strong>correlatieregels</strong>:</p>
        <pre><code>title: Mislukte aanmelding
name: mislukte_aanmelding
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
  condition: selection
---
title: Mogelijke brute force vanaf één bron
correlation:
  type: event_count
  rules:
    - mislukte_aanmelding
  group-by:
    - IpAddress
  timespan: 5m
  condition:
    gte: 10
level: medium</code></pre>

        <div class="callout info">
          <strong>Let op:</strong> een vertaling is maar zo goed als de <em>pipeline</em> (de veldnamen-mapping). Heet het
          veld in jouw SIEM <code>process.command_line</code> in plaats van <code>CommandLine</code>, dan moet de vertaler dat
          weten. Test daarom ook de vertaalde query, niet alleen de YAML.
        </div>
      `,
      questions: [
        { q: 'Welk onderdeel van een Sigma-regel beschrijft in welke logs (product, categorie, service) je zoekt?', answer: ['logsource'], hint: 'Het staat tussen tags en detection.', explain: 'logsource vertelt de vertaler en de lezer welke logs de regel nodig heeft.' },
        { q: 'Een event raakt zowel selection_img, selection_cli als filter_sccm. Wat doet de condition "all of selection_* and not filter_sccm"?', options: ['Geen alert: het filter sluit het event uit', 'Wel een alert, want beide selecties raken', 'Twee alerts, één per selectie', 'De regel geeft een foutmelding'], answer: 0, explain: '"and not filter_sccm" maakt de uitkomst onwaar zodra het filter raakt: geen alert.' },
        { q: 'Welk Windows-event-ID hoort bij een mislukte aanmelding?', answer: ['4625'], hint: 'Staat in de correlatieregel.', explain: '4625 = An account failed to log on. 4624 is een geslaagde aanmelding.' },
        { q: 'Welk sigma-cli-subcommando zet een Sigma-regel om naar een SIEM-query?', answer: ['convert', 'sigma convert'], hint: 'sigma ... -t splunk -p sysmon regel.yml', explain: 'sigma convert -t <doel> -p <pipeline> vertaalt de YAML naar bijvoorbeeld SPL of KQL.' },
      ],
    },

    {
      title: 'Taak 4 — Een Sigma-regel toepassen op Sysmon-logs',
      content: `
        <p>Een Sigma-regel lezen is één ding, hem met de hand "draaien" op echte events laat je pas echt snappen wat hij doet.
        In het lab staan Sysmon-procesgebeurtenissen (EventID 1) van vier werkplekken en een fileserver van de fictieve
        organisatie JVT, een ochtend lang. Jij speelt de SIEM en past de regel uit taak 3 stap voor stap toe.</p>

        <h3>Stap 1 — de selectie</h3>
        <p>Alle regels in deze log komen uit de juiste <em>logsource</em> (process_creation). De selectie op de opdrachtregel
        zoek je met de regex <code>/ -(enc|encodedcommand|ec) /</code> in het filter van de logviewer (dat filter is altijd
        hoofdletterongevoelig, net als Sigma). Let op de spaties in het patroon: die zorgen dat
        <code>-Encoding utf8</code> níet raakt. Controleer bij elke treffer dat het <code>Image</code> echt
        <code>powershell.exe</code> is (<code>selection_img</code>).</p>

        <h3>Stap 2 — het filter</h3>
        <p>Typ daarna <code>CcmExec</code> om te zien welke treffers door de beheersoftware SCCM zijn gestart. Die vallen
        door <code>not filter_sccm</code> af. Wil je beide stappen in één keer, dan kan dat met een
        <em>negative lookahead</em>: <code>/^(?!.*CcmExec).* -(enc|encodedcommand|ec) /</code> betekent "regels waarin
        nergens CcmExec staat, maar wel de selectie".</p>

        <h3>Stap 3 — triage van wat overblijft</h3>
        <p>Wat na het filter overblijft, is je alert. Een analist kijkt dan naar de context: wie is de gebruiker, wat is het
        ouderproces (<code>ParentImage</code>), en wat gebeurde er direct daarna op dezelfde host? Filter op de hostnaam om
        het verhaal te zien. Een kantoorprogramma dat een verborgen PowerShell start, gevolgd door verkenningscommando's,
        is een klassiek patroon na een kwaadaardige macro (ATT&amp;CK T1566.001 gevolgd door T1059.001).</p>

        <div class="callout tip">
          <strong>Tip:</strong> de Base64 achter <code>-enc</code> kun je veilig decoderen met CyberChef (Base64, daarna
          "UTF-16LE"; PowerShell codeert in UTF-16LE). In dit lab staat er alleen onschuldige oefentekst in. In het echt doe
          je dit in een geïsoleerde analyse-omgeving en voer je het gedecodeerde script nooit uit.
        </div>
        <div class="callout warn">
          <strong>Denk na over het filter:</strong> <code>ParentImage|endswith: '\\CcmExec.exe'</code> vertrouwt alles wat
          een proces met die naam start. Kan een aanvaller zelf een bestand <code>CcmExec.exe</code> neerzetten? Dan glipt hij
          erdoor. Strakker is filteren op het volledige pad (<code>C:\\Windows\\CCM\\CcmExec.exe</code>), en idealiter ook op
          gebruiker <code>SYSTEM</code>.
        </div>
      `,
      lab: {
        type: 'logs',
        title: 'Sysmon EventID 1 — JVT-werkplekken, 2 okt 2026',
        lines: DE_SYSMON_LOG,
      },
      questions: [
        { q: 'Hoeveel regels raken de selectie / -(enc|encodedcommand|ec) /?', answer: ['4'], hint: 'Typ de regex inclusief schuine strepen in het filter en lees de teller af.', explain: 'Vier PowerShell-starts met een gecodeerd commando. De regel met -Encoding utf8 raakt niet dankzij de spaties.' },
        { q: 'Hoeveel van die treffers vallen weg door filter_sccm (ouderproces CcmExec.exe)?', answer: ['3'], hint: 'Filter op CcmExec en tel de regels met -enc of -EncodedCommand.', explain: 'Drie treffers op WS-HR-02, WS-FIN-07 en WS-HR-11 zijn gestart door SCCM: bekende false positives.' },
        { q: 'Op welke host staat de treffer die overblijft (de true positive)?', answer: ['WS-MKT-04', 'ws-mkt-04'], hint: 'Gebruik de lookahead-regex uit stap 2.', explain: 'Op WS-MKT-04 start WINWORD.EXE een verborgen PowerShell met -enc, gevolgd door whoami en nslookup.' },
        { q: 'Wat is de vlag in de soc_note van de true positive?', answer: ['JVT{encoded_powershell_gevangen}'], hint: 'Lees het einde van de overgebleven regel.', explain: 'De analist markeerde de echte treffer: JVT{encoded_powershell_gevangen}.' },
      ],
    },

    {
      title: 'Taak 5 — YARA: bestanden herkennen, en een te brede regel aanscherpen',
      content: `
        <p>Sigma kijkt naar <em>logs</em>, <strong>YARA</strong> kijkt naar <em>bestanden</em> (en geheugen). Een YARA-regel
        beschrijft kenmerken van een bestand: teksten, bytereeksen en voorwaarden. Malware-analisten gebruiken het om
        families te herkennen, mailgateways en EDR's om bijlagen te scannen. Zie het als een signalement: "lang, rode jas,
        tatoeage op de linkerhand". Te vaag ("draagt een jas") en je houdt half Nederland aan.</p>

        <h3>Bouwstenen</h3>
        <ul>
          <li><code>"tekst"</code> met modifiers: <code>nocase</code> (hoofdletterongevoelig), <code>wide</code> (UTF-16LE,
          zoals Windows-programma's tekst vaak opslaan: elke letter gevolgd door een <code>00</code>-byte), <code>ascii</code>
          (gewone tekst, standaard) en <code>fullword</code> (alleen als los woord, niet midden in een ander woord).</li>
          <li>Hex: <code>{ 4D 5A ?? 00 }</code>, met <code>??</code> als joker voor één willekeurige byte.</li>
          <li>Regex: <code>/https?:\\/\\/[a-z0-9.-]+\\.jvt\\.lab/</code>.</li>
          <li>Condition: <code>$a and $b</code>, <code>any of them</code>, <code>2 of them</code>, <code>$mz at 0</code>
          (precies aan het begin), <code>filesize &lt; 50KB</code>.</li>
        </ul>

        <h3>Opdracht</h3>
        <p>Een collega schreef na een phishingincident snel de startregel in het lab: elk bestand met
        <code>powershell</code> én <code>-enc</code>. Scan de vijf (fictieve, onschadelijke) bestanden.</p>
        <ol>
          <li>Hoeveel bestanden raakt de startregel? Bekijk per bestand welke strings waar gevonden zijn.</li>
          <li>Eén treffer is een fout-positief: een gewoon beheerscript. Waarom raakt <code>-enc</code> daar?</li>
          <li>Kijk ook naar <code>updater.exe</code> in de hex. Die bevat wel degelijk "PowerShell -enc", maar de regel
          ziet het niet. Waarom niet?</li>
          <li>Vervang de regel door de aangescherpte versie hieronder en scan opnieuw.</li>
        </ol>
        <pre><code>rule Verdachte_PowerShell_Loader_v2 {
  meta:
    auteur = "JVT Cyber Dojo"
    versie = "2 - fullword tegen -Encoding, wide voor exe-bestanden"
  strings:
    $ps   = "powershell" nocase
    $enc  = "-enc" nocase fullword
    $ps_w = "powershell" nocase wide
    $mz   = { 4D 5A ?? 00 }
  condition:
    ($ps and $enc) or ($mz at 0 and $ps_w and filesize &lt; 50KB)
}</code></pre>

        <div class="callout info">
          <strong>Wat er verandert:</strong> <code>fullword</code> eist dat <code>-enc</code> een los woord is, dus
          <code>-Encoding</code> telt niet meer. De tweede tak zoekt in Windows-programma's (MZ-header op positie 0) naar
          "powershell" in UTF-16LE. De <code>filesize</code>-grens houdt grote installatiebestanden buiten de regel.
        </div>
        <div class="callout warn">
          <strong>Ethiek en veiligheid:</strong> de bestanden in dit lab zijn beschrijvende oefenteksten, geen werkende
          malware. Test YARA-regels op echte samples alleen in een geïsoleerde analyse-omgeving (zie de room over
          malware-analyse).
        </div>
      `,
      lab: {
        type: 'yara',
        rule: DE_YARA_START,
        files: [
          { name: 'Factuur_2026-117.docm', text: '[Fictief oefensample - bevat geen werkende code]\nDocument: Factuur 2026-117 NederBouw B.V.\nMacro AutoOpen start: PowerShell -NoP -W Hidden -Enc VwByAGkAdABlAC0ATwB1AHQAcAB1AHQAIAAnAG8AZQBmAGUAbgBzAGEAbQBwAGwAZQAnAA==\nStage2-URL: http://cdn.factuur-update.jvt.lab/s2\nvlag: JVT{yara_raakt_de_loader}\n' },
          { name: 'backup_taak.ps1', text: '# Nachtelijke back-up - afdeling ICT\n# Gestart door Taakplanner: powershell.exe -NoProfile -File C:\\Scripts\\backup_taak.ps1\n$bron = "D:\\Data"\nGet-ChildItem $bron -Recurse | Measure-Object | Out-File -Encoding utf8 C:\\Logs\\backup.txt\n' },
          { name: 'notities_overleg.txt', text: 'Teamoverleg ICT 1 oktober\n- PowerShell-training op dinsdag\n- Nieuwe laptops uitrollen in week 42\n- Back-uptest plannen\n' },
          { name: 'vakantie_texel.jpg', hex: 'FF D8 FF E0 00 10 4A 46 49 46 00 01 01 01 00 48 00 48 00 00 FF DB 00 43 00 08 06 06 07 06 05 08 07 07 07 09 09 08 0A 0C 14 0D 0C 0B 0B 0C 19 12 13 0F FF D9' },
          { name: 'updater.exe', hex: DE_UPDATER_HEX },
        ],
      },
      questions: [
        { q: 'Hoeveel bestanden raakt de startregel?', answer: ['2'], hint: 'Klik op scannen en tel de bestanden met een treffer.', explain: 'Factuur_2026-117.docm (PowerShell + -Enc) en backup_taak.ps1 (powershell + -Encoding).' },
        { q: 'Welk bestand is de fout-positief van de startregel?', answer: ['backup_taak.ps1', 'backup_taak'], hint: 'Welk bestand is een gewoon beheerscript? Kijk waar $enc raakt.', explain: '"-enc" nocase raakt het begin van "-Encoding utf8": een onschuldig back-upscript.' },
        { q: 'Welke vlag staat in het kwaadaardige bestand dat de startregel terecht raakt?', answer: ['JVT{yara_raakt_de_loader}'], hint: 'Bekijk de inhoud van de .docm.', explain: 'De fictieve macrobijlage bevat JVT{yara_raakt_de_loader}.' },
        { q: 'Welk bestand raakt de aangescherpte v2-regel extra, dat de startregel miste (een false negative)?', answer: ['updater.exe', 'updater'], hint: 'Welk bestand slaat zijn tekst op in UTF-16LE?', explain: 'updater.exe begint met MZ en bevat "PowerShell -enc" als wide-string. Zonder de wide-modifier zag de startregel dat niet.' },
      ],
    },

    {
      title: 'Taak 6 — Testen, tunen en ATT&CK-dekking meten',
      content: `
        <p>Je hebt nu drie regels gezien die pas goed werden na testen. Dat is geen toeval: een ongeteste regel is een gok.
        In deze taak maak je testen en tunen systematisch, en meet je wat je met al je regels samen eigenlijk afdekt.</p>

        <h3>Testen: twee soorten testdata</h3>
        <ul>
          <li><strong>Bekend-kwaadaardig</strong> (de regel <em>moet</em> raken): aanvallen die je in een lab naspeelt,
          bijvoorbeeld met de open testbibliotheek Atomic Red Team, of opgenomen logs van eerdere incidenten. Bij
          detection-as-code staan die als testgevallen naast de regel in Git.</li>
          <li><strong>Bekend-goed</strong> (de regel <em>moet stil</em> blijven): een normale week aan productielogs, of een
          verzameling gewone bestanden (<em>goodware</em>) voor YARA.</li>
        </ul>
        <p>Laat je dit automatisch draaien bij elke wijziging, dan heb je <strong>regressietests</strong>: een collega die
        een filter toevoegt, ziet meteen of een oude aanval daardoor gemist wordt. Een gezamenlijke oefening waarin het red
        team aanvalt en het blue team live meekijkt of de regels afgaan, heet een <strong>purple-team-oefening</strong>.</p>

        <h3>Tunen: smal uitzonderen, niet breed</h3>
        <p>Een voorbeeld uit een testweek. De PowerShell-regel zonder filter gaf 120 alerts, waarvan 6 terecht (precisie 5%).
        Met het SCCM-filter op het volledige pad bleven er 8 over, nog steeds alle 6 terecht.</p>
        <ul>
          <li>Uitzonderen op een <em>combinatie</em> van kenmerken (volledig pad, gebruiker, ondertekenaar) is goed.</li>
          <li>Uitzonderen op alles onder <code>C:\\Users\\</code> is gevaarlijk: daar kan elke aanvaller zijn bestanden neerzetten.</li>
          <li>Drempels (aantal per tijdvak) en aggregatie per host of IP helpen tegen ruis bij tellende regels.</li>
          <li>Te veel tunen schuift je fouten van false positives naar false negatives. Meet daarom ook de <em>recall</em>:
          welk deel van je testaanvallen wordt gevangen?</li>
        </ul>

        <h3>Dekking meten met MITRE ATT&amp;CK</h3>
        <p>Door elke regel te taggen met ATT&amp;CK-technieken (zoals in de Sigma-<code>tags</code>) kun je tellen welke
        technieken je afdekt. Met de ATT&amp;CK Navigator kleur je dat als een heatmap. Begin met de technieken die voor
        jóúw organisatie het belangrijkst zijn (uit je dreigingsbeeld), niet met de hele matrix.</p>
        <table>
          <thead><tr><th>Regel</th><th>ATT&amp;CK-tags</th></tr></thead>
          <tbody>
            <tr><td>PowerShell met gecodeerd commando (Sigma)</td><td>T1059.001, T1027</td></tr>
            <tr><td>Brute force 4625 (Sigma-correlatie)</td><td>T1110</td></tr>
            <tr><td>SSH-brute force auth.log (regex in SIEM)</td><td>T1110</td></tr>
            <tr><td>Verdachte_PowerShell_Loader_v2 (YARA op mailbijlagen)</td><td>T1566.001</td></tr>
            <tr><td>Path traversal in access-log (regex)</td><td>T1190</td></tr>
          </tbody>
        </table>
        <p>De prioriteitenlijst van het team bevat tien technieken: T1566.001 (phishingbijlage), T1059.001 (PowerShell),
        T1027 (verhulling), T1110 (brute force), T1078 (geldige accounts), T1083 (bestanden verkennen), T1003 (wachtwoorden
        dumpen), T1021.001 (RDP), T1486 (versleutelen voor impact) en T1041 (exfiltratie via C2).</p>

        <div class="callout warn">
          <strong>Dekking is geen kwaliteit:</strong> "T1110 gedekt" zegt niets als die regel nooit getest is of door een
          filter alles mist. Twee regels op dezelfde techniek tellen bovendien maar één keer. Koppel dekking daarom altijd aan
          testresultaten.
        </div>
      `,
      questions: [
        { q: 'Wat is de precisie van de PowerShell-regel na het tunen (8 alerts, 6 terecht), in procent?', answer: ['75', '75%', '75 %'], hint: 'Precisie = TP ÷ (TP + FP).', explain: '6 ÷ 8 = 0,75: 75% van de alerts is terecht, tegen 5% vóór het tunen.' },
        { q: 'Hoeveel procent van de tien prioriteitstechnieken is gedekt door de vijf regels uit de tabel?', answer: ['40', '40%', '40 %'], hint: 'Tel unieke technieken die óók op de prioriteitenlijst staan. T1190 staat er niet op.', explain: 'T1059.001, T1027, T1110 en T1566.001: 4 van de 10 = 40%. T1110 telt één keer, T1190 staat niet op de lijst.' },
        { q: 'Welke uitzondering in een detectieregel is het gevaarlijkst?', options: ['Alles uitzonderen wat vanuit C:\\Users\\ draait', 'Het volledige pad C:\\Windows\\CCM\\CcmExec.exe als ouderproces, gestart als SYSTEM', 'Eén specifiek ondertekend beheerprogramma op één vast pad', 'Een drempel van 10 mislukte logins per 5 minuten'], answer: 0, explain: 'In gebruikersmappen kan elke aanvaller bestanden plaatsen: zo’n brede uitzondering maakt een blinde vlek.' },
        { q: 'Hoe heet een oefening waarin het red team aanvalt en het blue team live controleert of de detectie afgaat?', answer: ['purple-team-oefening', 'purple team', 'purple teaming', 'purple-team', 'purple team oefening'], hint: 'Rood + blauw = ...', explain: 'Bij een purple-team-oefening werken aanval en verdediging samen om detectie te testen en te verbeteren.' },
      ],
    },

    {
      title: 'Taak 7 — Slotopdracht: een detectie van begin tot eind',
      content: `
        <p>Tijd om de hele cyclus zelf te doorlopen. Het team van het fictieve <code>portaal.jvt.lab</code> heeft een
        geautoriseerde purple-team-test laten uitvoeren. De opdracht aan jou als detectie-engineer: kunnen we
        <strong>path traversal</strong> zien? Bij path traversal probeert een aanvaller met <code>../</code> uit de
        bedoelde map te "klimmen" om bestanden als <code>/etc/passwd</code> of een configuratiebestand te lezen.</p>

        <h3>1. Hypothese</h3>
        <p>"Een aanvaller stuurt verzoeken waarin <code>../</code> voorkomt, ook in URL-gecodeerde vorm
        (<code>%2e%2e</code> voor <code>..</code> en <code>%2f</code> voor <code>/</code>)." Dit hoort bij ATT&amp;CK T1190
        (misbruik van een publieke applicatie).</p>

        <h3>2. Regel</h3>
        <p>Het startpatroon in het lab is <code>GET \\S*(\\.\\.|%2e%2e)(\\/|%2f)\\S* HTTP</code> met de vlaggen <code>gi</code>.
        <code>\\S*</code> pakt het hele pad, zodat je één treffer per verzoek krijgt; de vlag <code>i</code> zorgt dat
        <code>%2F</code> en <code>%2f</code> allebei raken.</p>

        <h3>3. Testen</h3>
        <ul>
          <li>Tel de treffers. Controleer dat de legitieme regels (<code>/zoeken?q=a..z</code> en
          <code>/blog/wat-is-nieuw...</code>) <em>niet</em> raken: daar volgt op de puntjes geen schuine streep.</li>
          <li>Het aanvallende IP <code>203.0.113.140</code> deed vijf pogingen. Raakt het patroon ze allemaal? Kijk goed naar
          de variant die een andere scheiding gebruikt.</li>
        </ul>

        <h3>4. Tunen en prioriteren</h3>
        <p>Een mislukte poging (<code>400</code>, <code>403</code>, <code>404</code>) is interessant; een geslaagde
        (<code>200</code>) is een incident. Breid het patroon uit tot
        <code>GET \\S*(\\.\\.|%2e%2e)(\\/|%2f)\\S* HTTP\\/1\\.1" 200</code> om alleen de geslaagde te vinden. De purple-team-tester
        heeft zijn verzoek in de User-Agent gemarkeerd; daar staat de vlag.</p>

        <h3>5. Onderhouden</h3>
        <p>Schrijf op wat je mist (bijvoorbeeld de <code>%5c</code>-variant, een gecodeerde backslash die Windows-servers als
        scheidingsteken accepteren) en zet die als testgeval in je repository. Volgende versie: <code>(\\/|%2f|\\\\|%5c)</code>.</p>

        <div class="callout tip">
          <strong>Wat je meeneemt:</strong> een goede detectie begint bij een duidelijke hypothese, wordt getest op aanval én
          normaal verkeer, en is nooit af. Regex, Sigma en YARA zijn gereedschap; de discipline eromheen maakt je een
          detectie-engineer. Oefen aanvalstechnieken alleen in je eigen lab of met schriftelijke toestemming, zoals hier bij
          de geautoriseerde purple-team-test.
        </div>
      `,
      lab: {
        type: 'regex',
        text: DE_ACCESS_LOG,
        pattern: 'GET \\S*(\\.\\.|%2e%2e)(\\/|%2f)\\S* HTTP',
        flags: 'gi',
      },
      questions: [
        { q: 'Hoeveel treffers geeft het startpatroon (vlaggen gi)?', answer: ['5'], hint: 'Lees de teller in het lab af.', explain: 'Vijf verzoeken bevatten ../ of een gecodeerde variant met / of %2f. De legitieme regels met puntjes raken niet.' },
        { q: 'Welke traversal-poging van 203.0.113.140 mist het startpatroon?', options: ['/img/..%5c..%5cboot.ini', '/download?bestand=....//....//etc/passwd', '/static/%2e%2e/%2e%2e/%2e%2e/windows/win.ini', '/download?bestand=..%2f..%2f..%2fetc%2fpasswd'], answer: 0, explain: '%5c is een gecodeerde backslash; het patroon kent alleen / en %2f als scheidingsteken. Een false negative om als testgeval vast te leggen.' },
        { q: 'Wat is de vlag in het geslaagde (status 200) traversal-verzoek?', answer: ['JVT{detectie_als_code}'], hint: 'Breid het patroon uit met HTTP\\/1\\.1" 200 en lees de User-Agent van de treffer.', explain: 'Het verzoek van 198.51.100.200 naar ..%2F..%2Fconfig%2Fapp.ini gaf 200: JVT{detectie_als_code}.' },
        { q: 'Ik kan de levenscyclus hypothese, regel, testen, tunen en onderhouden zelf toepassen op een nieuwe detectie.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'Detectie-engineering', def: 'Het vak van het ontwerpen, testen, tunen en onderhouden van regels die aanvallen automatisch signaleren.' },
    { term: 'Detection-as-code', def: 'Detectieregels behandelen als software: in versiebeheer (Git), met review en automatische tests vóór ze live gaan.' },
    { term: 'True positive / false positive', def: 'Terecht alarm bij een echte aanval, tegenover loos alarm terwijl er niets aan de hand is.' },
    { term: 'False negative', def: 'Een echte aanval waarbij de regel stil blijft: een gemiste detectie.' },
    { term: 'Alertmoeheid', def: 'Afstomping van analisten door te veel loze meldingen, waardoor ook echte alerts worden genegeerd (alert fatigue).' },
    { term: 'Precisie', def: 'Het deel van de alerts dat terecht is: TP ÷ (TP + FP).' },
    { term: 'Reguliere expressie (regex)', def: 'Zoekpatroon dat een vorm van tekst beschrijft, met tekens als \\d, \\w, +, * en groepen.' },
    { term: 'Capture-groep', def: 'Deel van een regex tussen haakjes waarvan je de gevonden tekst apart terugkrijgt, bijvoorbeeld een gebruikersnaam of IP.' },
    { term: 'Sigma', def: 'Open, leveranciersonafhankelijk YAML-formaat voor detectieregels op logs, dat naar SIEM-query\'s (SPL, KQL, ...) wordt vertaald.' },
    { term: 'YARA', def: 'Regeltaal om bestanden (en geheugen) te herkennen aan teksten, bytereeksen en voorwaarden.' },
    { term: 'Fullword / wide', def: 'YARA-modifiers: fullword raakt alleen een los woord, wide zoekt de tekst in UTF-16LE (elke letter gevolgd door 00).' },
    { term: 'ATT&CK-dekking', def: 'Welke MITRE ATT&CK-technieken door je (geteste) detectieregels worden afgedekt, vaak als heatmap in de ATT&CK Navigator.' },
  ],
  resources: [
    { title: 'SigmaHQ — Sigma-regels en specificatie', url: 'https://github.com/SigmaHQ/sigma' },
    { title: 'YARA-documentatie', url: 'https://yara.readthedocs.io/' },
    { title: 'regex101 — reguliere expressies testen en uitleggen', url: 'https://regex101.com/' },
    { title: 'MITRE ATT&CK Navigator', url: 'https://mitre-attack.github.io/attack-navigator/' },
  ],
});
