/* Room: Linux: de basis */
const LINUX_SYSLOG = "Oct  3 10:11:09 jvt-lab systemd[1]: Started Daily apt download activities.\nOct  3 10:11:16 jvt-lab CRON[2041]: Reached target Timers.\nOct  3 10:11:23 jvt-lab sshd[1337]: Starting Clean php session files...\nOct  3 10:11:30 jvt-lab kernel: pam_unix(cron:session): session opened for user student by (uid=0)\nOct  3 10:11:37 jvt-lab NetworkManager[812]: pam_unix(cron:session): session closed for user student\nOct  3 10:11:44 jvt-lab dbus-daemon[640]: [UFW BLOCK] IN=eth0 OUT= SRC=10.10.20.9 DST=10.10.20.15 PROTO=TCP DPT=22\nOct  3 10:11:51 jvt-lab snapd[903]: Accepted password for student from 10.10.20.9 port 50122 ssh2\nOct  3 10:11:58 jvt-lab systemd-resolved[701]: wlan0: link is not ready\nOct  3 10:12:05 jvt-lab systemd[1]: Finished Rotate log files.\nOct  3 10:12:12 jvt-lab CRON[2041]: Starting Daily man-db regeneration...\nOct  3 10:12:19 jvt-lab sshd[1337]: Time has been changed\nOct  3 10:12:26 jvt-lab kernel: Mounted /boot.\nOct  3 10:12:33 jvt-lab NetworkManager[812]: Reached target Network is Online.\nOct  3 10:12:40 jvt-lab dbus-daemon[640]: Starting Message of the Day...\nOct  3 10:12:47 jvt-lab snapd[903]: apt-daily.service: Succeeded.\nOct  3 10:12:54 jvt-lab systemd-resolved[701]: Finished Message of the Day.\nOct  3 10:13:01 jvt-lab systemd[1]: Starting Cleanup of Temporary Directories...\nOct  3 10:13:08 jvt-lab CRON[2041]: DHCPACK of 10.10.20.15 from 10.10.20.2\nOct  3 10:13:15 jvt-lab sshd[1337]: Starting Refresh fwupd metadata and update motd...\nOct  3 10:13:22 jvt-lab kernel: logrotate.service: Succeeded.\nOct  3 10:13:29 jvt-lab NetworkManager[812]: Started Daily apt download activities.\nOct  3 10:17:38 jvt-lab CRON[2041]: (student) CMD (/usr/bin/printf JVT{grep_vindt_alles} > /tmp/.cache)\nOct  3 10:13:36 jvt-lab dbus-daemon[640]: Reached target Timers.\nOct  3 10:13:43 jvt-lab snapd[903]: Starting Clean php session files...\nOct  3 10:13:50 jvt-lab systemd-resolved[701]: pam_unix(cron:session): session opened for user student by (uid=0)\nOct  3 10:13:57 jvt-lab systemd[1]: pam_unix(cron:session): session closed for user student\nOct  3 10:14:04 jvt-lab CRON[2041]: [UFW BLOCK] IN=eth0 OUT= SRC=10.10.20.9 DST=10.10.20.15 PROTO=TCP DPT=22\nOct  3 10:14:11 jvt-lab sshd[1337]: Accepted password for student from 10.10.20.9 port 50122 ssh2\nOct  3 10:14:18 jvt-lab kernel: wlan0: link is not ready\nOct  3 10:14:25 jvt-lab NetworkManager[812]: Finished Rotate log files.\nOct  3 10:14:32 jvt-lab dbus-daemon[640]: Starting Daily man-db regeneration...\nOct  3 10:14:39 jvt-lab snapd[903]: Time has been changed\nOct  3 10:14:46 jvt-lab systemd-resolved[701]: Mounted /boot.\nOct  3 10:14:53 jvt-lab systemd[1]: Reached target Network is Online.\nOct  3 10:15:00 jvt-lab CRON[2041]: Starting Message of the Day...\n";

const LINUX_PASSWD = 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nwebapp:x:1001:1001::/var/www:/usr/sbin/nologin\nstudent:x:1000:1000:Student,,,:/home/student:/bin/bash\n';

const LINUX_BASE_FS = {
  '/home/student/welkom.txt': 'Welkom bij de Linux-werkplek!\nHier oefen je met navigeren, lezen en zoeken.\nJe eerste vlag staat hieronder:\nJVT{welkom_bij_linux}\n',
  '/home/student/.geheim/vlag.txt': 'Goed gevonden! Bestanden die met een punt beginnen zijn standaard verborgen.\nJVT{punt_voor_verborgen}\n',
  '/home/student/documenten/notities.txt': 'Boodschappenlijst:\n- koffie\n- toetsenbord\nNiets spannends hier.\n',
  '/home/student/documenten/project/README.md': '# Project\nEen gewoon projectbestand, geen geheimen.\n',
  '/home/student/leeg/': null,
  '/etc/passwd': LINUX_PASSWD,
  '/etc/hostname': 'jvt-lab\n',
};

CS.registerRoom({
  id: 'linux-basis',
  path: 'fundamenten',
  order: 5,
  title: 'Linux: de basis',
  icon: '🐧',
  difficulty: 'Makkelijk',
  minutes: 80,
  summary: 'De shell, het bestandssysteem, navigeren, zoeken met find en grep, pipes, rechten, gebruikers en processen: de Linux-basis voor security.',
  objectives: [
    'Door het Linux-bestandssysteem navigeren en bestanden lezen',
    'Bestanden en tekst vinden met find en grep',
    'Pipes en redirection gebruiken om uitvoer te koppelen en op te slaan',
    'Rechten (rwx, octaal, chmod/chown) lezen en uitleggen',
    'Uitleggen waar gebruikers, groepen en processen in Linux leven',
  ],
  tasks: [
    {
      title: 'Taak 1 — Waarom Linux, de shell en de mappenstructuur',
      content: `
        <p>Het grootste deel van het internet draait op Linux: webservers, databases, firewalls, routers en vrijwel alle securitytools. Als IT'er ken je Windows waarschijnlijk goed, maar in security is Linux je dagelijkse werkpaard. Veel aanvallen en verdedigingen spelen zich af op de <strong>command line</strong>, dus daar beginnen we.</p>

        <h3>De shell en de prompt</h3>
        <p>De shell is het programma dat jouw getypte commando's leest en uitvoert; de bekendste is <strong>bash</strong>. Wat je ziet heet de <strong>prompt</strong>:</p>
        <pre><code>student@jvt-lab:~$</code></pre>
        <p>Die regel vertelt je veel: <code>student</code> is de gebruiker, <code>jvt-lab</code> de computernaam (host), <code>~</code> de huidige map (de tilde betekent je thuismap <code>/home/student</code>), en het teken aan het eind geeft je rol aan: <code>$</code> voor een gewone gebruiker en <code>#</code> voor <strong>root</strong> (de beheerder, alle rechten). Dat laatste teken is in security belangrijk: zie je een <code>#</code>, dan draai je als root.</p>

        <h3>De bestandssysteemhiërarchie</h3>
        <p>In Linux is er geen <code>C:</code>-schijf. Alles hangt onder één wortel: <code>/</code> (de root van het bestandssysteem, niet te verwarren met de gebruiker root). De belangrijkste mappen:</p>
        <table>
          <thead><tr><th>Map</th><th>Wat erin staat</th></tr></thead>
          <tbody>
            <tr><td><code>/</code></td><td>De wortel; alles hangt hieronder</td></tr>
            <tr><td><code>/home</code></td><td>De thuismappen van gewone gebruikers, bijv. <code>/home/student</code></td></tr>
            <tr><td><code>/root</code></td><td>De thuismap van de beheerder root (afgeschermd)</td></tr>
            <tr><td><code>/etc</code></td><td>Configuratiebestanden, bijv. <code>/etc/passwd</code></td></tr>
            <tr><td><code>/var/log</code></td><td>Logbestanden, bijv. <code>syslog</code> en <code>auth.log</code></td></tr>
            <tr><td><code>/tmp</code></td><td>Tijdelijke bestanden; iedereen mag hier schrijven</td></tr>
            <tr><td><code>/bin</code>, <code>/usr/bin</code></td><td>Programma's en commando's zoals <code>ls</code> en <code>cat</code></td></tr>
          </tbody>
        </table>

        <div class="callout info"><strong>Voor security relevant:</strong> <code>/etc</code> bevat de instellingen van het systeem, <code>/var/log</code> het bewijsmateriaal (wie logde wanneer in), en <code>/tmp</code> is een geliefde plek voor aanvallers om tijdelijk bestanden neer te zetten. Onthoud deze drie.</div>

        <p>In de volgende taken duik je zelf de terminal in. Je krijgt een veilige oefenomgeving; alles wat je typt blijft in dit lab.</p>
      `,
      questions: [
        { q: 'In welke map staan standaard de logbestanden?', options: ['/tmp', '/var/log', '/etc', '/home'], answer: 1, explain: '/var/log bevat logs zoals syslog en auth.log; daar vind je het bewijsmateriaal van wat er gebeurd is.' },
        { q: 'Ik snap waarom Linux-kennis belangrijk is voor security.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — Navigeren en bestanden lezen',
      content: `
        <p>Nu gaan we bewegen door het bestandssysteem en bestanden openen. Open de terminal onderaan deze taak en werk de commando's door.</p>

        <h3>Waar ben ik, en wat staat hier?</h3>
        <ul>
          <li><code>pwd</code> — toont je huidige map ("print working directory").</li>
          <li><code>ls</code> — toont de inhoud van de map. Met <code>ls -l</code> zie je details (rechten, eigenaar, grootte), met <code>ls -a</code> ook de <strong>verborgen bestanden</strong>. Combineren mag: <code>ls -la</code>.</li>
          <li><code>cd map</code> — ga een map in. <code>cd ..</code> gaat één map omhoog, <code>cd</code> zonder meer brengt je naar je thuismap.</li>
        </ul>

        <h3>Absolute en relatieve paden</h3>
        <p>Een <strong>absoluut pad</strong> begint bij de wortel: <code>/home/student/documenten</code>. Een <strong>relatief pad</strong> begint vanaf waar je nu bent: als je in <code>/home/student</code> staat, is <code>documenten</code> hetzelfde. Twee handige tekens: <code>.</code> is "de huidige map" en <code>..</code> is "de map erboven".</p>

        <h3>Bestanden lezen</h3>
        <ul>
          <li><code>cat bestand</code> — print de hele inhoud.</li>
          <li><code>head -n 5 bestand</code> / <code>tail -n 5 bestand</code> — de eerste of laatste regels.</li>
          <li><code>less bestand</code> — blader rustig door een lang bestand.</li>
        </ul>

        <h3>Verborgen bestanden</h3>
        <p>Bestanden en mappen waarvan de naam met een punt begint (zoals <code>.geheim</code> of <code>.bashrc</code>) zijn verborgen: een gewone <code>ls</code> laat ze niet zien. Aanvallers verstoppen hier graag dingen, en gevoelige instellingen staan er ook vaak. Gebruik <code>ls -a</code> om ze zichtbaar te maken.</p>

        <div class="callout tip"><strong>Opdracht:</strong> lees eerst <code>welkom.txt</code> met <code>cat welkom.txt</code>. Maak daarna met <code>ls -a</code> de verborgen map <code>.geheim</code> zichtbaar en lees het bestand erin (<code>cat .geheim/vlag.txt</code>). In beide bestanden staat een vlag.</div>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student', host: 'jvt-lab',
        home: '/home/student', cwd: '/home/student',
        motd: 'Oefenterminal. Typ help voor de lijst commando\'s. Begin met: ls -a',
        fs: { ...LINUX_BASE_FS },
        denied: ['/root', '/etc/shadow'],
        owners: { '/root': 'root' },
      },
      questions: [
        { q: 'Welk commando toont ook de verborgen bestanden (die met een punt beginnen)?', answer: ['ls -a', 'ls -la', 'ls -al', 'ls -lah', 'ls - a'], hint: 'De optie -a staat voor "all".', explain: 'ls -a toont alle bestanden, inclusief die met een punt. ls -la voegt ook de details toe.' },
        { q: 'Lees welkom.txt. Wat is de vlag?', answer: ['JVT{welkom_bij_linux}'], hint: 'cat welkom.txt', explain: 'cat print de hele inhoud van een bestand, inclusief de vlag.' },
        { q: 'Open de verborgen map en lees het bestand. Wat is de vlag?', answer: ['JVT{punt_voor_verborgen}'], hint: 'ls -a toont .geheim; lees daarna .geheim/vlag.txt.', explain: 'Verborgen mappen vind je met ls -a. Daarin stond de tweede vlag.' },
      ],
    },

    {
      title: 'Taak 3 — Zoeken met find en grep',
      content: `
        <p>Een echt systeem heeft duizenden bestanden. Handmatig klikken is geen optie; je zoekt met twee krachtige tools.</p>

        <h3>find: zoek bestanden op naam of type</h3>
        <p><code>find</code> loopt een map en alles eronder af. De vorm is <code>find [waar] [voorwaarden]</code>:</p>
        <pre><code>find / -name config.bak          # zoek overal naar een bestand met die naam
find /var -name "*.bak"          # alle .bak-bestanden onder /var
find /home -type d               # alleen mappen (directories)
find /home -type f               # alleen gewone bestanden</code></pre>
        <p>Het sterretje (<code>*</code>) is een jokerteken: <code>*.bak</code> betekent "eindigt op .bak".</p>

        <h3>grep: zoek tekst in bestanden</h3>
        <p><code>grep patroon bestand</code> toont elke regel waarin het patroon voorkomt. Heel handig in grote logbestanden:</p>
        <pre><code>grep Failed /var/log/auth.log    # regels met "Failed"
grep -i error logbestand         # -i negeert hoofd/kleine letters
grep -n JVT bestand              # -n toont regelnummers
grep -r JVT /var/log             # -r zoekt recursief in alle bestanden eronder
grep -c Accepted auth.log        # -c telt het aantal treffers</code></pre>

        <div class="callout tip"><strong>Opdracht:</strong> ergens diep onder <code>/var/www</code> staat een back-upbestand met de naam <code>config.bak</code>. Vind het met <code>find</code> en lees het met <code>cat</code>; er staat een vlag in. Zoek daarna in het grote logbestand <code>/var/log/syslog</code> naar regels met <code>JVT</code> (gebruik <code>grep JVT /var/log/syslog</code>). Ook daar is een vlag verstopt.</div>

        <p>Dit is precies wat je in echt onderzoek doet: je weet dat ergens een gevoelig gegeven staat (een wachtwoord, een API-sleutel, een spoor van een aanvaller) en je gebruikt <code>find</code> om bestanden te vinden en <code>grep</code> om de inhoud te doorzoeken.</p>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student', host: 'jvt-lab',
        home: '/home/student', cwd: '/home/student',
        motd: 'Zoekoefening. Probeer: find / -name config.bak   en   grep JVT /var/log/syslog',
        fs: {
          ...LINUX_BASE_FS,
          '/var/www/html/uploads/2019/backup/oud/config.bak': '# oude databaseconfiguratie (NIET in productie gebruiken)\ndb_host=localhost\ndb_user=webapp\ndb_pass=zomer2019\nflag=JVT{find_graaft_diep}\n',
          '/var/log/syslog': LINUX_SYSLOG,
        },
        denied: ['/root', '/etc/shadow'],
        owners: { '/root': 'root' },
      },
      questions: [
        { q: 'Vind config.bak met find en lees het. Wat is de vlag?', answer: ['JVT{find_graaft_diep}'], hint: 'find / -name config.bak toont het pad; lees het daarna met cat.', explain: 'find vond het diep weggestopte back-upbestand; daarin stond een wachtwoord en de vlag.' },
        { q: 'Doorzoek /var/log/syslog met grep. Wat is de vlag?', answer: ['JVT{grep_vindt_alles}'], hint: 'grep JVT /var/log/syslog filtert de ene interessante regel uit tientallen.', explain: 'grep filtert in een groot logbestand razendsnel de regel met JVT eruit.' },
      ],
    },

    {
      title: 'Taak 4 — Pipes, redirection en Base64',
      content: `
        <p>De echte kracht van de shell is dat je kleine commando's aan elkaar koppelt. Twee technieken maken dat mogelijk.</p>

        <h3>Pipes: koppel commando's</h3>
        <p>De pipe <code>|</code> stuurt de uitvoer van het ene commando als invoer naar het volgende. Zo bouw je een keten:</p>
        <pre><code>cat /var/log/auth.log | grep Failed | wc -l</code></pre>
        <p>Dit leest het logbestand, houdt alleen de regels met "Failed" over, en telt ze met <code>wc -l</code> (word count, <code>-l</code> telt regels). In één regel weet je hoeveel mislukte logins er waren.</p>

        <h3>Redirection: bewaar de uitvoer</h3>
        <ul>
          <li><code>commando &gt; bestand</code> — schrijf de uitvoer naar een bestand (overschrijft wat er stond!).</li>
          <li><code>commando &gt;&gt; bestand</code> — voeg de uitvoer toe aan het eind van een bestand (overschrijft niet).</li>
        </ul>
        <pre><code>grep JVT /var/log/syslog &gt; treffers.txt    # schrijf resultaat weg
echo "notitie" &gt;&gt; logboek.txt             # voeg een regel toe</code></pre>

        <h3>Base64: codering is geen encryptie</h3>
        <p>Je komt vaak tekst tegen die er versleuteld uitziet maar dat niet is, zoals <code>SlZUe2Jhc2U2NF9pc19nZWVuX2VuY3J5cHRpZX0=</code>. Dat is <strong>Base64</strong>: een manier om data als nette tekst weer te geven. Iedereen kan het terugdraaien, dus het beschermt niets; het is <em>codering</em>, geen encryptie.</p>
        <p>Decoderen doe je met <code>base64 -d</code>:</p>
        <pre><code>cat geheim.b64 | base64 -d</code></pre>

        <div class="callout tip"><strong>Opdracht:</strong> in je thuismap staat <code>geheim.b64</code>. Decodeer het met <code>cat geheim.b64 | base64 -d</code>. De uitkomst is een vlag. (Deze vlag staat dus gecodeerd in het lab, niet leesbaar.)</div>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student', host: 'jvt-lab',
        home: '/home/student', cwd: '/home/student',
        motd: 'Pipes en redirection. Probeer: cat geheim.b64 | base64 -d',
        fs: {
          ...LINUX_BASE_FS,
          '/home/student/geheim.b64': 'SlZUe2Jhc2U2NF9pc19nZWVuX2VuY3J5cHRpZX0=\n',
          '/var/log/syslog': LINUX_SYSLOG,
        },
        denied: ['/root', '/etc/shadow'],
        owners: { '/root': 'root' },
      },
      questions: [
        { q: 'Decodeer geheim.b64. Wat is de vlag?', answer: ['JVT{base64_is_geen_encryptie}'], encoded: true, hint: 'cat geheim.b64 | base64 -d', explain: 'Base64 is terug te draaien door iedereen; het is codering, geen beveiliging.' },
        { q: 'Welke operator voegt uitvoer TOE aan het eind van een bestand zonder het te overschrijven?', answer: ['>>'], hint: 'Eén > overschrijft; twee tekens voegt toe.', explain: '>> appendt (voegt toe), terwijl een enkele > het bestand overschrijft.' },
      ],
    },

    {
      title: 'Taak 5 — Rechten: wie mag wat',
      content: `
        <p>In Linux heeft elk bestand en elke map rechten die bepalen wie het mag lezen, wijzigen of uitvoeren. Dit is misschien wel het belangrijkste security-onderwerp van deze room.</p>

        <h3>De drie rechten en de drie groepen</h3>
        <p>Er zijn drie soorten rechten: <strong>r</strong> (read, lezen), <strong>w</strong> (write, wijzigen) en <strong>x</strong> (execute, uitvoeren). Die gelden voor drie groepen: de <strong>eigenaar</strong> (user), de <strong>groep</strong> en <strong>alle anderen</strong> (others). In <code>ls -l</code> zie je dit als tien tekens:</p>
        <pre><code>-rwxr-xr--  1 student student  512 okt  3 10:00 script.sh</code></pre>
        <p>Lees het als: eerste teken = type (<code>-</code> bestand, <code>d</code> map). Dan drie blokjes van drie: <code>rwx</code> voor de eigenaar (lezen/schrijven/uitvoeren), <code>r-x</code> voor de groep (lezen/uitvoeren), <code>r--</code> voor anderen (alleen lezen).</p>

        <h3>Octale notatie</h3>
        <p>Rechten schrijf je ook als cijfers: r=4, w=2, x=1, bij elkaar opgeteld per groep.</p>
        <table>
          <thead><tr><th>Letters</th><th>Som</th><th>Octaal</th></tr></thead>
          <tbody>
            <tr><td><code>rwx</code></td><td>4+2+1</td><td>7</td></tr>
            <tr><td><code>r-x</code></td><td>4+0+1</td><td>5</td></tr>
            <tr><td><code>r--</code></td><td>4+0+0</td><td>4</td></tr>
            <tr><td><code>rw-</code></td><td>4+2+0</td><td>6</td></tr>
          </tbody>
        </table>
        <p>Dus <code>rwxr-xr-x</code> is <strong>755</strong> (een typisch script of programma) en <code>rw-r--r--</code> is <strong>644</strong> (een gewoon bestand dat iedereen mag lezen maar alleen de eigenaar mag wijzigen).</p>

        <h3>Rechten aanpassen</h3>
        <ul>
          <li><code>chmod 755 script.sh</code> — zet de rechten (change mode).</li>
          <li><code>chmod +x script.sh</code> — maak uitvoerbaar.</li>
          <li><code>chown student:student bestand</code> — verander de eigenaar en groep (change owner).</li>
        </ul>

        <div class="callout danger"><strong>SUID — let op in security:</strong> scommando's als <code>chmod</code> en <code>chown</code> vragen vaak rootrechten. Een bestand kan een speciale <strong>SUID</strong>-bit hebben (zichtbaar als een <code>s</code> in plaats van <code>x</code>: <code>-rwsr-xr-x</code>). Zo'n programma draait met de rechten van de <em>eigenaar</em> (vaak root), ongeacht wie het start. Verkeerd ingestelde SUID-bestanden zijn een klassieke manier om van gewone gebruiker naar root te klimmen (privilege escalation).</div>

        <p><strong>Probeer zelf:</strong> gebruik de terminal uit taak 2 en probeer <code>cat /root/geheim.txt</code> of <code>ls /root</code>. Je krijgt "Permission denied": als gewone gebruiker kom je niet in de thuismap van root. Precies zo horen rechten je tegen te houden.</p>
      `,
      questions: [
        { q: 'Wat is de octale notatie voor rwxr-xr-x?', answer: ['755'], hint: 'rwx=7, r-x=5, r-x=5.', explain: 'rwx(7) r-x(5) r-x(5) = 755, de standaard voor uitvoerbare bestanden.' },
        { q: 'Wat betekent chmod 644 voor een bestand?', options: ['Iedereen mag alles', 'Eigenaar lezen+schrijven, groep en anderen alleen lezen', 'Alleen de eigenaar mag lezen', 'Niemand mag iets'], answer: 1, explain: '6=rw- voor de eigenaar, 4=r-- voor groep en anderen: lezen voor iedereen, wijzigen alleen door de eigenaar.' },
        { q: 'Ik heb geprobeerd /root te openen en kreeg "Permission denied".', noAnswer: true },
      ],
    },

    {
      title: 'Taak 6 — Gebruikers, processen en hulp',
      content: `
        <p>Tot slot: wie leven er op het systeem, wat draait er, en hoe vind je zelf de weg.</p>

        <h3>Gebruikers en groepen</h3>
        <p>Alle accounts staan in <code>/etc/passwd</code>, één gebruiker per regel. Een regel ziet er zo uit:</p>
        <pre><code>student:x:1000:1000:Student,,,:/home/student:/bin/bash</code></pre>
        <p>Van links naar rechts: gebruikersnaam, een <code>x</code> (de wachtwoord-hash staat elders), het gebruikers-ID (UID), het groeps-ID (GID), een omschrijving, de thuismap en de shell. <strong>root</strong> heeft altijd UID 0: dat is de almachtige beheerder.</p>
        <p>De versleutelde wachtwoorden staan NIET in <code>/etc/passwd</code> (dat mag iedereen lezen) maar in <code>/etc/shadow</code>, dat alleen root mag inzien. Vandaar dat je in het lab "Permission denied" krijgt op <code>/etc/shadow</code>.</p>
        <p>Een gewone gebruiker voert beheertaken uit met <code>sudo</code> ervoor: <code>sudo apt update</code> draait dat commando tijdelijk als root, mits je daar toestemming voor hebt. Zo hoeft niemand permanent als root in te loggen.</p>

        <h3>Processen</h3>
        <p>Elk draaiend programma is een <strong>proces</strong> met een uniek proces-ID (PID).</p>
        <ul>
          <li><code>ps</code> — een momentopname van je processen (<code>ps aux</code> toont alle).</li>
          <li><code>top</code> — een live overzicht dat zichzelf ververst, met CPU- en geheugengebruik.</li>
          <li><code>kill PID</code> — stuur een signaal om een proces te stoppen.</li>
        </ul>
        <p>In security kijk je naar processen om verdachte programma's te vinden: een onbekend proces dat veel CPU gebruikt of vanaf een rare plek draait, kan malware zijn.</p>

        <h3>Hulp vinden</h3>
        <p>Niemand kent alle opties uit het hoofd. Twee reddingsboeien:</p>
        <ul>
          <li><code>man commando</code> — de volledige handleiding (manual), bijv. <code>man grep</code>.</li>
          <li><code>commando --help</code> — een korte samenvatting van de opties, bijv. <code>ls --help</code>.</li>
        </ul>

        <div class="callout tip"><strong>Tip:</strong> leren betekent niet alles onthouden, maar weten waar je het snel opzoekt. <code>man</code> en <code>--help</code> zijn je beste vrienden.</div>
      `,
      questions: [
        { q: 'In welk bestand staan de gebruikersaccounts (zonder de wachtwoord-hashes)?', answer: ['/etc/passwd'], hint: 'Niet /etc/shadow; dat bevat juist wel de hashes.', explain: '/etc/passwd is leesbaar voor iedereen en bevat de accounts; de hashes staan in het afgeschermde /etc/shadow.' },
        { q: 'Welk commando toont de lopende processen als momentopname?', options: ['ps', 'cd', 'grep', 'chmod'], answer: 0, explain: 'ps toont een momentopname van processen; top is de live variant.' },
      ],
    },
  ],

  terms: [
    { term: 'Shell', def: 'Programma dat je getypte commando\'s leest en uitvoert; bash is de meest voorkomende.' },
    { term: 'Prompt', def: 'De regel in de terminal die aangeeft wie je bent en waar je bent; eindigt op $ (gebruiker) of # (root).' },
    { term: 'root', def: 'De almachtige beheerder op Linux, met UID 0 en alle rechten.' },
    { term: 'Absoluut pad', def: 'Pad dat bij de wortel / begint, bijv. /home/student/welkom.txt.' },
    { term: 'Relatief pad', def: 'Pad vanaf de huidige map; . is de huidige map, .. de map erboven.' },
    { term: 'Verborgen bestand', def: 'Bestand of map waarvan de naam met een punt begint; zichtbaar met ls -a.' },
    { term: 'find', def: 'Commando om bestanden te zoeken op naam (-name) of type (-type) in een map en alles eronder.' },
    { term: 'grep', def: 'Commando om regels met een patroon te vinden in bestanden; -i, -n, -r en -c zijn veelgebruikte opties.' },
    { term: 'Pipe', def: 'Het teken | dat de uitvoer van het ene commando doorgeeft als invoer aan het volgende.' },
    { term: 'Redirection', def: 'Uitvoer naar een bestand sturen: > overschrijft, >> voegt toe.' },
    { term: 'Rechten (rwx)', def: 'Lees-, schrijf- en uitvoerrechten voor eigenaar, groep en anderen; octaal r=4, w=2, x=1.' },
    { term: 'SUID', def: 'Speciale rechtenbit (s) waardoor een programma draait met de rechten van de eigenaar, vaak root; een bron van privilege escalation.' },
  ],

  resources: [
    { title: 'OverTheWire: Bandit', url: 'https://overthewire.org/wargames/bandit/' },
    { title: 'Linux Journey', url: 'https://linuxjourney.com/' },
    { title: 'TryHackMe', url: 'https://tryhackme.com/' },
  ],
});
