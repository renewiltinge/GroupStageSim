/* Room: Geheugenforensie — wat het RAM verraadt */
CS.registerRoom({
  id: 'memory-forensie',
  path: 'forensie',
  order: 4,
  title: 'Geheugenforensie: wat het RAM verraadt',
  icon: '🧠',
  difficulty: 'Moeilijk',
  minutes: 70,
  summary: 'Werkgeheugen (RAM) is vluchtig maar goud waard: draaiende processen, open verbindingen, ontsleutelde data en malware die alleen in het geheugen leeft. Je leert RAM veiligstellen en met Volatility 3 een besmet systeem ontleden.',
  objectives: [
    'Uitleggen waarom RAM waardevol bewijs is en wat de order of volatility betekent',
    'Een geheugendump (memory dump) veilig maken en de chain of custody bewaken',
    'Volatility 3 inzetten met de kern-plugins (info, pslist, pstree, psscan, netscan, malfind, cmdline)',
    'Een verdacht proces herkennen aan een vreemde parent, naam of pad',
    'Verborgen processen vinden door psscan met pslist te vergelijken (rootkit-detectie)',
    'Een C2-verbinding en geïnjecteerde code opsporen in een geheugendump',
  ],
  tasks: [
    {
      title: 'Taak 1 — Waarom RAM goud is (en snel verdwijnt)',
      content: `
        <p>Als digitaal rechercheur denk je bij bewijs misschien eerst aan de harde schijf: bestanden, foto's, logs. Maar
        het <strong>werkgeheugen</strong> (RAM, Random Access Memory) is minstens zo waardevol — en veel kwetsbaarder.
        In het RAM staat namelijk alles wat een computer <em>op dit moment</em> doet, en een groot deel daarvan komt
        <strong>nooit op de schijf</strong> terecht.</p>

        <h3>De analogie van het whiteboard</h3>
        <p>Stel je een team voor dat op een whiteboard aan een plan werkt. De schijf is het archief: nette, opgeslagen
        documenten. Het RAM is het whiteboard: de ruwe, actuele gedachten. Zet je de computer uit, dan wordt het
        whiteboard uitgeveegd. Daarom is geheugen <em>vluchtig</em> (Engels: <em>volatile</em>): trek je de stekker
        eruit, dan is het bewijs weg.</p>

        <h3>Wat je alléén in het RAM vindt</h3>
        <ul>
          <li><strong>Draaiende processen</strong> — ook kwaadaardige die net gestart zijn.</li>
          <li><strong>Open netwerkverbindingen</strong> — bijvoorbeeld een stiekeme lijn naar de server van een
          aanvaller (command-and-control, afgekort C2).</li>
          <li><strong>Ontsleutelde data</strong> — wachtwoorden, sleutels en inhoud die op de schijf versleuteld staan,
          staan in het geheugen juist leesbaar.</li>
          <li><strong>Fileless malware</strong> — kwaadaardige code die alleen in het geheugen leeft en nooit als
          bestand op de schijf verschijnt. Op de schijf vind je er niets van terug; in het RAM wel.</li>
        </ul>

        <h3>Order of volatility: pak het vluchtigste eerst</h3>
        <p>Bij een onderzoek geldt een vaste volgorde: verzamel het bewijs dat het snelst verdwijnt als eerste. Dat heet
        de <strong>order of volatility</strong> (volgorde van vluchtigheid). Van vluchtig naar duurzaam:</p>
        <ol>
          <li>CPU-registers en cache (verdwijnen in microseconden)</li>
          <li><strong>RAM</strong> en de inhoud van draaiende processen</li>
          <li>Netwerkstatus en open verbindingen</li>
          <li>Tijdelijke bestanden en swap</li>
          <li>De harde schijf</li>
          <li>Back-ups en archieven (het minst vluchtig)</li>
        </ol>
        <p>De les: <strong>RAM eerst</strong>. Wie meteen de computer uitzet om "de schijf veilig te stellen", vernietigt
        daarmee het geheugenbewijs. Bij het Nederlandse <strong>NFI</strong> (Nederlands Forensisch Instituut) en
        het <strong>Team Cybercrime</strong> van de politie is dit een vast onderdeel van het protocol.</p>

        <div class="callout danger">
          <strong>Ethiek en bevoegdheid:</strong> een geheugendump maak je alleen op je eigen systeem, in je eigen lab,
          of met een geldige <strong>machtiging</strong> (bij de politie bijvoorbeeld op last van de officier van
          justitie). RAM bevat zeer privacygevoelige gegevens; onbevoegd uitlezen is strafbaar (computervredebreuk,
          art. 138ab Sr). In deze room werk je op een gesimuleerde dump in een afgeschermd lab.
        </div>
      `,
      questions: [
        { q: 'Wat betekent het dat RAM "vluchtig" (volatile) is?', options: ['De inhoud verdwijnt zodra de stroom wegvalt', 'Het is versleuteld', 'Het staat op de harde schijf', 'Het kan niet uitgelezen worden'], answer: 0, explain: 'Vluchtig geheugen verliest zijn inhoud zodra de stroom wegvalt; daarom stel je het als eerste veilig.' },
        { q: 'Volgens de order of volatility: welk bewijs stel je als EERSTE veilig?', options: ['De back-ups', 'De harde schijf', 'Het RAM / de draaiende processen', 'Het archief'], answer: 2, explain: 'Het vluchtigste bewijs eerst: registers en RAM, vóór de schijf en back-ups.' },
        { q: 'Hoe heet malware die alleen in het geheugen leeft en nooit als bestand op de schijf staat?', answer: ['fileless malware', 'fileless', 'fileless-malware'], hint: 'Engelse term: "zonder bestand".', explain: 'Fileless malware draait puur in het RAM, dus schijfonderzoek mist het — geheugenforensie vindt het wel.' },
        { q: 'Ik begrijp dat ik alleen met toestemming of machtiging een geheugendump mag maken.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — RAM veiligstellen: de geheugendump',
      content: `
        <p>Voordat je iets kunt analyseren, moet je het geheugen eerst <strong>veiligstellen</strong>. Je maakt een
        exacte kopie van al het RAM naar een bestand: een <strong>geheugendump</strong> (memory dump). Dat bestand
        (bijvoorbeeld <code>geheugen.raw</code>) analyseer je daarna op een ander systeem, zodat je het bewijs zelf niet
        verandert.</p>

        <h3>Waarmee maak je een dump?</h3>
        <ul>
          <li><strong>WinPmem</strong> — een gratis, veelgebruikte tool om op Windows het volledige RAM naar een bestand
          te schrijven.</li>
          <li><strong>FTK Imager</strong> — een bekende forensische tool die naast schijfkopieën ook een
          <em>"Capture Memory"</em>-functie heeft.</li>
          <li>Op Linux bestaan er varianten zoals <strong>LiME</strong> en <strong>AVML</strong>.</li>
        </ul>

        <h3>Het dilemma van de observer effect</h3>
        <p>Er zit een addertje onder het gras: om een dump te maken, moet je software <em>op het verdachte systeem
        draaien</em>. Die software gebruikt zelf ook een beetje geheugen en verandert het systeem dus minimaal. Dat heet
        het <strong>observer effect</strong> (het meten verandert het gemetene). Je kunt het niet helemaal vermijden,
        maar je houdt het zo klein mogelijk en je <em>documenteert</em> precies wat je deed. Een rechter wil kunnen
        nagaan dat jouw handelen het bewijs niet heeft vervuild.</p>

        <h3>Chain of custody: de bewijsketen</h3>
        <p>Bewijs is alleen bruikbaar als je kunt aantonen dat er niet mee is geknoeid. Daarvoor houd je een
        <strong>chain of custody</strong> (bewijsketen) bij: wie heeft het bewijs wanneer gemaakt, aangeraakt, verplaatst
        en opgeslagen? Twee gereedschappen horen daar standaard bij:</p>
        <ul>
          <li><strong>Hashing</strong> — direct na het maken bereken je een <code>SHA-256</code> van de dump. Elke latere
          wijziging (zelfs één bit) verandert de hash. Zo bewijs je dat je kopie onaangeroerd is.</li>
          <li><strong>Documentatie</strong> — tijdstip, tooling, versie, de naam van de onderzoeker en de machtiging.</li>
        </ul>

        <div class="callout tip">
          <strong>Tip:</strong> werk nooit direct op het origineel. Maak een kopie, bereken de hash van origineel én
          kopie, controleer dat ze gelijk zijn, en analyseer daarna alléén de kopie. Dit is precies hoe het NFI met
          bewijs omgaat.
        </div>
      `,
      questions: [
        { q: 'Met welke (gratis) tool kun je op Windows het volledige RAM naar een bestand schrijven?', answer: ['WinPmem', 'winpmem'], hint: 'De naam begint met "Win" en eindigt op "Pmem".', explain: 'WinPmem schrijft het volledige fysieke geheugen naar een dumpbestand.' },
        { q: 'Waarom bereken je direct na het maken van de dump een SHA-256-hash?', options: ['Om later te bewijzen dat er niets aan de dump is gewijzigd', 'Om de dump kleiner te maken', 'Om de dump te versleutelen', 'Om het RAM sneller te maken'], answer: 0, explain: 'De hash is een vingerafdruk: verandert er één bit, dan verandert de hash. Zo bewaak je de integriteit.' },
        { q: 'Hoe heet het principe dat "meten het gemetene verandert" — je dump-tool gebruikt zelf ook geheugen?', answer: ['observer effect', 'observer-effect', 'het observer effect'], hint: 'Engelse term met "observer".', explain: 'Het observer effect: het maken van de dump verandert het systeem minimaal. Houd het klein en documenteer het.' },
        { q: 'Hoe heet het nauwkeurig bijhouden wie het bewijs wanneer maakte, aanraakte en opsloeg?', answer: ['chain of custody', 'chain-of-custody', 'bewijsketen'], hint: 'Engelse term, of de Nederlandse vertaling "bewijsketen".', explain: 'De chain of custody maakt bewijs juridisch bruikbaar: elke stap is herleidbaar.' },
      ],
    },

    {
      title: 'Taak 3 — Volatility 3: je gereedschapskist',
      content: `
        <p>Een dump is een reusachtig, rauw bestand vol bytes. Om er iets zinnigs uit te halen heb je gereedschap nodig
        dat de structuur van het geheugen begrijpt. De standaardtool daarvoor is <strong>Volatility 3</strong>: een
        gratis, open-source framework dat een geheugendump ontleedt in processen, verbindingen, geïnjecteerde code en
        veel meer.</p>

        <h3>Hoe je Volatility aanroept</h3>
        <p>Je roept Volatility aan met het dumpbestand (<code>-f</code>) en een <strong>plugin</strong>: een module die
        één specifiek ding uit het geheugen haalt. De vorm is altijd hetzelfde:</p>
        <pre><code>python3 vol.py -f &lt;dumpbestand&gt; &lt;plugin&gt;</code></pre>
        <p>Voor Windows-dumps beginnen de plugins met <code>windows.</code>. De allereerste stap is altijd uitvinden
        <em>welk</em> systeem je voor je hebt. Dat doet <code>windows.info</code>: het leest het OS, de bouw en de
        architectuur uit. Voer in de terminal hieronder uit:</p>
        <pre><code>python3 vol.py -f geheugen.raw windows.info</code></pre>
        <div class="callout info">
          <strong>Volatility 3 versus 2:</strong> de oude Volatility 2 had nog een los "profile" nodig dat je met de
          hand koos. Volatility 3 bepaalt dat automatisch via symbooltabellen. Je hoeft dus geen profiel meer te raden —
          <code>windows.info</code> vertelt je gewoon wat het systeem is.
        </div>
      `,
      lab: {
        type: 'terminal',
        user: 'analist', host: 'nfi-lab',
        home: '/home/analist', cwd: '/home/analist',
        motd: 'NFI geheugenlab — gesimuleerde Volatility 3. Typ de commando\'s uit de opdracht precies over.',
        commands: {
          'python3 vol.py -f geheugen.raw windows.info': `Volatility 3 Framework 2.7.0
Progress:  100.00    PDB scanning finished

Variable           Value

Kernel Base        0xf80267600000
DTB                0x1aa000
Symbols            file:///symbols/windows/ntkrnlmp.pdb/...
Is64Bit            True
IsPAE              False
primary            0 WindowsIntel32e
memory_layer       1 FileLayer
KdVersionBlock     0xf802686...
Major/Minor        15.19041
NtSystemRoot       C:\\Windows
NtProductType      NtProductWinNt
NtMajorVersion     10
NtMinorVersion     0
SystemTime         2026-10-01 09:12:03
NtBuildLab         19041.1.amd64fre.vb_release
Werkstation        WS-FINANCE-07  (10.10.80.5)`,
          'python3 vol.py -f geheugen.raw': `Volatility 3 Framework 2.7.0
Gebruik: python3 vol.py -f <dumpbestand> <plugin>
Veelgebruikte plugins: windows.info, windows.pslist, windows.pstree,
windows.psscan, windows.netscan, windows.malfind, windows.cmdline, windows.dumpfiles`,
        },
      },
      questions: [
        { q: 'Welke Volatility-plugin gebruik je als eerste om OS, bouw en architectuur van de dump te bepalen?', answer: ['windows.info', 'info'], hint: 'Het is de plugin die je "informatie" over het systeem geeft.', explain: 'windows.info leest o.a. de Windows-versie en of het 64-bit is — je startpunt.' },
        { q: 'Welk werkstation (en IP) hoort bij deze dump?', answer: ['WS-FINANCE-07', 'ws-finance-07'], hint: 'Lees de laatste regel van de windows.info-uitvoer.', explain: 'De dump komt van WS-FINANCE-07 (10.10.80.5), een financiële werkplek.' },
        { q: 'Waarom hoef je in Volatility 3 geen "profile" meer handmatig te kiezen (zoals in versie 2)?', options: ['Volatility 3 bepaalt het systeem automatisch via symbooltabellen', 'Profiles bestaan niet meer in de forensiek', 'Het is altijd Windows 10', 'Je moet het toch handmatig doen'], answer: 0, explain: 'Volatility 3 vindt de juiste symbolen zelf; het raden van een profiel is verleden tijd.' },
      ],
    },

    {
      title: 'Taak 4 — Processen in kaart: pslist en pstree',
      content: `
        <p>Nu de kern van het werk: welke programma's draaiden er, en hoort daar iets tussen dat er niet thuishoort? Twee
        plugins horen bij elkaar.</p>
        <ul>
          <li><strong><code>windows.pslist</code></strong> loopt de officiële lijst van processen af (de
          <code>EPROCESS</code>-structuren die Windows zelf bijhoudt) en toont voor elk proces onder andere het
          <strong>PID</strong> (proces-ID), het <strong>PPID</strong> (parent process ID — het ID van het proces dat
          het startte), de naam en de starttijd.</li>
          <li><strong><code>windows.pstree</code></strong> toont dezelfde processen, maar als <strong>boom</strong>: wie
          is het kind van wie. Dat is enorm handig, want veel malware verraadt zich door een <em>verkeerde ouder</em>.</li>
        </ul>

        <h3>Wat is normaal?</h3>
        <p>Op Windows gelden vaste familierelaties. Bijvoorbeeld: <code>services.exe</code> is de ouder van de echte
        <code>svchost.exe</code>-processen. Een <code>svchost.exe</code> die ineens een kind is van
        <code>explorer.exe</code> (de bureaubladschil) klopt dus niet — dat ziet eruit alsof een gebruiker het zelf
        heeft aangeklikt. Let ook op:</p>
        <ul>
          <li><strong>Vreemde namen</strong> die op bekende lijken, zoals <code>svch0st.exe</code> (met een nul in
          plaats van een o) — een klassieke typosquat-truc.</li>
          <li><strong>Verkeerde ouder</strong> — een systeemproces met een onlogische parent.</li>
          <li><strong>Vreemd pad</strong> — een "systeemproces" dat uit een gebruikersmap draait (dat zie je zo met
          <code>windows.cmdline</code>).</li>
        </ul>

        <p>Draai beide plugins en vergelijk. Voer precies uit:</p>
        <pre><code>python3 vol.py -f geheugen.raw windows.pslist
python3 vol.py -f geheugen.raw windows.pstree</code></pre>
      `,
      lab: {
        type: 'terminal',
        user: 'analist', host: 'nfi-lab',
        home: '/home/analist', cwd: '/home/analist',
        motd: 'NFI geheugenlab — windows.pslist en windows.pstree. Vergelijk de ouders.',
        commands: {
          'python3 vol.py -f geheugen.raw windows.pslist': `Volatility 3 Framework 2.7.0

PID    PPID   ImageFileName   Threads  SessionId  Wow64  CreateTime
4      0      System          142      N/A        False  2026-10-01 07:58:12 UTC
88     4      Registry        4        N/A        False  2026-10-01 07:58:10 UTC
324    4      smss.exe        2        N/A        False  2026-10-01 07:58:12 UTC
440    432    csrss.exe       11       0          False  2026-10-01 07:58:13 UTC
516    508    wininit.exe     1        0          False  2026-10-01 07:58:13 UTC
524    516    services.exe    6        0          False  2026-10-01 07:58:13 UTC
636    524    svchost.exe     18       0          False  2026-10-01 07:58:14 UTC
720    524    svchost.exe     12       0          False  2026-10-01 07:58:14 UTC
1180   1092   explorer.exe    58       1          False  2026-10-01 08:02:41 UTC
2456   1180   chrome.exe      31       1          False  2026-10-01 08:05:02 UTC
3012   1180   OUTLOOK.EXE     24       1          False  2026-10-01 08:06:19 UTC
4123   1180   svch0st.exe     5        1          False  2026-10-01 08:41:55 UTC`,
          'python3 vol.py -f geheugen.raw windows.pstree': `Volatility 3 Framework 2.7.0

PID    PPID   ImageFileName
4      0      System
* 88   4      Registry
* 324  4      smss.exe
440    432    csrss.exe
516    508    wininit.exe
* 524  516    services.exe
** 636 524    svchost.exe
** 720 524    svchost.exe
1180   1092   explorer.exe
* 2456 1180   chrome.exe
* 3012 1180   OUTLOOK.EXE
* 4123 1180   svch0st.exe   <-- let op: svch0st (met een NUL) als kind van explorer.exe`,
        },
      },
      questions: [
        { q: 'Welk proces is verdacht? Geef de exacte procesnaam (de "vlag" van deze taak).', answer: ['svch0st.exe', 'svch0st'], hint: 'Kijk goed naar de spelling van de bekende systeemprocessen — één bevat een cijfer.', explain: 'svch0st.exe (met een nul) imiteert het echte svchost.exe: een typosquat.' },
        { q: 'Waarom is dit proces verdacht? (kies de beste reden)', options: ['De naam imiteert svchost.exe én het is een kind van explorer.exe in plaats van services.exe', 'Het heeft te weinig threads', 'Het begint met een hoofdletter', 'Het draait in sessie 1'], answer: 0, explain: 'Een echte svchost.exe is kind van services.exe. Een svch0st.exe onder explorer.exe (dus door de gebruiker gestart) klopt niet.' },
        { q: 'Wat is het PID van het verdachte proces?', answer: ['4123'], hint: 'Lees de PID-kolom op de regel van svch0st.exe.', explain: 'svch0st.exe draait met PID 4123, kind van explorer.exe (PPID 1180).' },
        { q: 'Welk legitiem proces is normaal gesproken de ouder van svchost.exe?', answer: ['services.exe', 'services'], hint: 'Kijk bij de echte svchost.exe-regels naar de PPID 524.', explain: 'services.exe (PID 524) is de echte ouder van svchost.exe. Dat is de baseline.' },
      ],
    },

    {
      title: 'Taak 5 — Verborgen processen: psscan tegenover pslist',
      content: `
        <p>Slimme malware probeert zich te verbergen. Een <strong>rootkit</strong> kan een proces uit de officiële lijst
        halen door de koppeling ertussenuit te knippen (process unlinking), zodat <code>pslist</code> het niet meer
        laat zien. Maar het proces draait nog wél. Hoe vind je het dan?</p>

        <h3>Twee manieren om te tellen</h3>
        <ul>
          <li><strong><code>windows.pslist</code></strong> volgt de officiële, gekoppelde lijst. Snel, maar een rootkit
          kan deze manipuleren.</li>
          <li><strong><code>windows.psscan</code></strong> werkt anders: het <em>scant</em> het hele geheugen op de
          kenmerkende handtekening van een <code>EPROCESS</code>-structuur. Zo vindt het óók processen die uit de lijst
          zijn gehaald — en zelfs processen die al beëindigd zijn (hun sporen staan nog in het RAM).</li>
        </ul>

        <div class="callout warn">
          <strong>De gouden regel:</strong> staat een PID wél in <code>psscan</code> maar níét in <code>pslist</code>,
          dan is dat hoogst verdacht — een sterke aanwijzing voor een <strong>rootkit</strong> die het proces verbergt.
          Vergelijk de twee lijsten dus altijd.
        </div>

        <p>Draai psscan en leg de uitvoer naast de pslist van de vorige taak:</p>
        <pre><code>python3 vol.py -f geheugen.raw windows.psscan</code></pre>
      `,
      lab: {
        type: 'terminal',
        user: 'analist', host: 'nfi-lab',
        home: '/home/analist', cwd: '/home/analist',
        motd: 'NFI geheugenlab — windows.psscan. Welke PID zit hier wel, maar niet in pslist?',
        commands: {
          'python3 vol.py -f geheugen.raw windows.psscan': `Volatility 3 Framework 2.7.0

PID    PPID   ImageFileName   Offset(V)         CreateTime               ExitTime
4      0      System          0xaf8e07a040      2026-10-01 07:58:12 UTC
88     4      Registry        0xaf8e0a1080      2026-10-01 07:58:10 UTC
324    4      smss.exe        0xaf8e1c3140      2026-10-01 07:58:12 UTC
440    432    csrss.exe       0xaf8e1f0200      2026-10-01 07:58:13 UTC
516    508    wininit.exe     0xaf8e221300      2026-10-01 07:58:13 UTC
524    516    services.exe    0xaf8e240400      2026-10-01 07:58:13 UTC
636    524    svchost.exe     0xaf8e261500      2026-10-01 07:58:14 UTC
720    524    svchost.exe     0xaf8e282600      2026-10-01 07:58:14 UTC
1180   1092   explorer.exe    0xaf8e3a1700      2026-10-01 08:02:41 UTC
2456   1180   chrome.exe      0xaf8e4b2800      2026-10-01 08:05:02 UTC
3012   1180   OUTLOOK.EXE     0xaf8e4c3900      2026-10-01 08:06:19 UTC
4123   1180   svch0st.exe     0xaf8e5d4a00      2026-10-01 08:41:55 UTC
4666   4123   rk_svc.exe      0xaf8e6e5b00      2026-10-01 08:42:03 UTC   <-- NIET zichtbaar in pslist!`,
        },
      },
      questions: [
        { q: 'Welke PID verschijnt wél in psscan maar niet in pslist (het verborgen proces)?', answer: ['4666'], hint: 'Vergelijk de twee lijsten; één regel is nieuw.', explain: 'PID 4666 (rk_svc.exe) is uit de officiële lijst gehaald en alleen via psscan te zien — klassiek rootkit-gedrag.' },
        { q: 'Hoe heet het verborgen proces?', answer: ['rk_svc.exe', 'rk_svc'], hint: 'Lees de ImageFileName van de nieuwe regel.', explain: 'rk_svc.exe is het verborgen kindproces van svch0st.exe (PPID 4123).' },
        { q: 'Waarom vindt psscan processen die pslist mist?', options: ['psscan scant het hele geheugen op EPROCESS-handtekeningen i.p.v. de gekoppelde lijst te volgen', 'psscan draait sneller', 'psscan vraagt het aan de gebruiker', 'Dat doet het niet'], answer: 0, explain: 'Door op handtekeningen te scannen omzeilt psscan de lijst die een rootkit kan manipuleren.' },
        { q: 'Een PID in psscan maar niet in pslist wijst meestal op...?', options: ['Een rootkit die het proces verbergt (of een beëindigd proces)', 'Een normaal systeemproces', 'Een printopdracht', 'Een update'], answer: 0, explain: 'Het is een sterke aanwijzing voor verberging (rootkit) of een al afgesloten proces — altijd nader onderzoeken.' },
      ],
    },

    {
      title: 'Taak 6 — De smoking gun: netscan, malfind en cmdline',
      content: `
        <p>Je hebt een verdacht proces (<code>svch0st.exe</code>, PID 4123) en een verborgen kind (<code>rk_svc.exe</code>).
        Tijd om de onomstotelijke bewijzen te verzamelen: met wie praat het, wat zit er in het geheugen, en waarmee is
        het gestart?</p>

        <h3>netscan — de open verbindingen</h3>
        <p><code>windows.netscan</code> toont alle netwerkverbindingen die in het geheugen staan, inclusief het proces dat
        erbij hoort. Je zoekt naar een <strong>onbekende uitgaande verbinding</strong>: praat een "systeemproces" met een
        extern IP op een vreemde poort, dan is dat vaak een <strong>C2-kanaal</strong> (command-and-control: de lijn
        waarlangs een aanvaller het systeem bestuurt). Poort <code>4444</code> is een beruchte favoriet.</p>

        <h3>malfind — de geïnjecteerde code</h3>
        <p><code>windows.malfind</code> zoekt naar <strong>geïnjecteerde code</strong>: geheugengebieden die uitvoerbaar
        én beschrijfbaar zijn (<code>PAGE_EXECUTE_READWRITE</code>) en waar <em>geen bestand op schijf</em> bij hoort. Zie
        je daar de bytes <code>4D 5A</code> (de letters <code>MZ</code>, het begin van een Windows-programma) midden in
        het geheugen van een ander proces, dan is er code ingespoten — een sterk teken van fileless malware.</p>

        <h3>cmdline — waarmee is het gestart?</h3>
        <p><code>windows.cmdline</code> toont de volledige opdrachtregel van elk proces. Hier zie je het échte pad (vaak
        een gebruikersmap zoals <code>AppData</code>, niet <code>C:\\Windows\\System32</code>) en eventuele argumenten.</p>

        <p>Voer de drie plugins uit:</p>
        <pre><code>python3 vol.py -f geheugen.raw windows.netscan
python3 vol.py -f geheugen.raw windows.malfind
python3 vol.py -f geheugen.raw windows.cmdline</code></pre>
      `,
      lab: {
        type: 'terminal',
        user: 'analist', host: 'nfi-lab',
        home: '/home/analist', cwd: '/home/analist',
        motd: 'NFI geheugenlab — netscan, malfind, cmdline. Vind de C2 en de vlaggen.',
        commands: {
          'python3 vol.py -f geheugen.raw windows.netscan': `Volatility 3 Framework 2.7.0

Proto  LocalAddr     LocalPort  ForeignAddr    ForeignPort  State        PID    Owner
TCPv4  10.10.80.5    139        0.0.0.0        0            LISTENING    4      System
TCPv4  10.10.80.5    50122      10.10.1.1      443          ESTABLISHED  2456   chrome.exe
TCPv4  10.10.80.5    50140      10.10.1.1      443          ESTABLISHED  3012   OUTLOOK.EXE
TCPv4  10.10.80.5    49871      10.10.66.66    4444         ESTABLISHED  4123   svch0st.exe
UDPv4  10.10.80.5    53         *              *            *            720    svchost.exe

(!) Opvallend: svch0st.exe (PID 4123) heeft een uitgaande verbinding naar 10.10.66.66:4444 — mogelijk C2.`,
          'python3 vol.py -f geheugen.raw windows.malfind': `Volatility 3 Framework 2.7.0

PID    Process       Start VPN       Protection             Tag   Hexdump
4123   svch0st.exe   0x1f0000        PAGE_EXECUTE_READWRITE  VadS
    0x1f0000  4d 5a 90 00 03 00 00 00  MZ......
    0x1f0008  04 00 00 00 ff ff 00 00  ........
    0x1f0010  b8 00 00 00 00 00 00 00  ........
Bevinding: uitvoerbaar+beschrijfbaar geheugen met MZ-header, geen bestand op schijf = code-injectie.
Forensische tag voor dit lab: JVT{code_injectie}`,
          'python3 vol.py -f geheugen.raw windows.cmdline': `Volatility 3 Framework 2.7.0

PID    Process        Args
636    svchost.exe    C:\\Windows\\System32\\svchost.exe -k RPCSS -p
2456   chrome.exe     "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
3012   OUTLOOK.EXE    "C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"
4123   svch0st.exe    C:\\Users\\jdekker\\AppData\\Roaming\\svch0st.exe -k JVT{geheugen_liegt_niet}
4666   rk_svc.exe     C:\\Users\\jdekker\\AppData\\Roaming\\rk_svc.exe --hidden`,
        },
      },
      questions: [
        { q: 'Naar welk IP-adres (de vermoedelijke C2-server) praat het verdachte proces?', answer: ['10.10.66.66'], hint: 'Kijk bij netscan naar de ForeignAddr op de svch0st.exe-regel.', explain: 'svch0st.exe (PID 4123) heeft een ESTABLISHED-verbinding naar 10.10.66.66 op poort 4444 — een klassiek C2-kanaal.' },
        { q: 'Welke poort gebruikt die verdachte uitgaande verbinding?', answer: ['4444'], hint: 'Lees de ForeignPort-kolom bij svch0st.exe.', explain: 'Poort 4444 is een beruchte standaardpoort voor reverse shells en C2.' },
        { q: 'Wat is de vlag uit de opdrachtregel (windows.cmdline) van het verdachte proces?', answer: ['JVT{geheugen_liegt_niet}'], hint: 'Lees de Args-kolom bij svch0st.exe (PID 4123).', explain: 'De argumenten van svch0st.exe bevatten JVT{geheugen_liegt_niet}; het echte pad wijst naar AppData.' },
        { q: 'Welke vlag staat in de malfind-bevinding (de geïnjecteerde code)?', answer: ['JVT{code_injectie}'], hint: 'Lees de forensische tag onderaan de windows.malfind-uitvoer.', explain: 'Het MZ-startblok in uitvoerbaar+beschrijfbaar geheugen zonder bestand op schijf is code-injectie: JVT{code_injectie}.' },
      ],
    },

    {
      title: 'Taak 7 — De triage-workflow en je rapport',
      content: `
        <p>Je hebt nu een compleet verhaal uit het geheugen gevist. Laten we de werkwijze vastleggen, want als
        rechercheur doe je dit gestructureerd en reproduceerbaar.</p>

        <h3>De standaard triage-workflow</h3>
        <p>Een vaste volgorde helpt je snel overzicht krijgen zonder iets te missen:</p>
        <ol>
          <li><code>windows.info</code> — welk systeem is dit?</li>
          <li><code>windows.pslist</code> + <code>windows.pstree</code> — welke processen draaien, en kloppen de
          familierelaties?</li>
          <li><code>windows.psscan</code> — zijn er verborgen of beëindigde processen (vergelijk met pslist)?</li>
          <li><code>windows.netscan</code> — zijn er verdachte uitgaande verbindingen (C2)?</li>
          <li><code>windows.malfind</code> — is er code geïnjecteerd in draaiende processen?</li>
          <li><code>windows.cmdline</code> en <code>windows.dumpfiles</code> — waarmee is het gestart, en kun je het
          kwaadaardige bestand uit het geheugen terughalen voor nader onderzoek?</li>
        </ol>

        <div class="callout info">
          <strong>Onthoud:</strong> info → pslist → pstree → netscan → malfind. Begin breed (wat draait er?), zoom dan in
          op het verdachte proces en verzamel het bewijs eromheen.
        </div>

        <h3>Van bevinding naar rapport</h3>
        <p>Een onderzoek is pas af als je het kunt uitleggen aan iemand die er niet bij was — een collega, een officier
        van justitie, een rechter. In je rapport scheid je altijd <strong>feiten</strong> ("de dump bevat een proces
        svch0st.exe met PID 4123, verbonden met 10.10.66.66:4444") van <strong>interpretatie</strong> ("dit duidt
        vermoedelijk op een C2-kanaal"). En je werk is <strong>reproduceerbaar</strong>: iemand anders die dezelfde dump
        en dezelfde commando's gebruikt, moet tot dezelfde conclusie komen. Noteer daarom exact welke tool, versie en
        commando's je gebruikte, plus de hash van de dump.</p>

        <div class="callout tip">
          <strong>Tip voor je carrière:</strong> wil je verder in de geheugenforensie, oefen dan met echte (veilige)
          dumps op platforms als CyberDefenders. En lees de documentatie van de Volatility Foundation — de plugins
          hebben veel meer te bieden dan deze triage.
        </div>
      `,
      questions: [
        { q: 'Wat is een logische triage-volgorde na windows.info?', options: ['pslist/pstree, dan netscan, dan malfind', 'malfind, dan info, dan niets', 'meteen de schijf wissen', 'alleen cmdline'], answer: 0, explain: 'Begin breed (processen), zoom in op verbindingen en injectie: info → pslist → pstree → netscan → malfind.' },
        { q: 'Welke plugin gebruik je om een kwaadaardig bestand uit het geheugen terug te halen voor nader onderzoek?', answer: ['windows.dumpfiles', 'dumpfiles'], hint: 'De naam zegt het: "dump" van "files".', explain: 'windows.dumpfiles haalt bestanden/afbeeldingen uit het geheugen terug naar de schijf.' },
        { q: 'Wat hoort in een forensisch rapport strikt gescheiden te blijven?', options: ['Feiten en interpretatie', 'Namen en datums', 'Tekst en plaatjes', 'Nederlands en Engels'], answer: 0, explain: 'Feiten (wat je zag) scheid je van interpretatie (wat je denkt dat het betekent); zo blijft je rapport controleerbaar.' },
        { q: 'Ik kan de triage-workflow benoemen en weet hoe ik mijn bevindingen reproduceerbaar rapporteer.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'RAM (werkgeheugen)', def: 'Vluchtig geheugen met alles wat de computer nu doet; verdwijnt zodra de stroom wegvalt.' },
    { term: 'Vluchtig (volatile)', def: 'Eigenschap van data die verdwijnt bij stroomverlies, zoals de inhoud van het RAM.' },
    { term: 'Order of volatility', def: 'Volgorde waarin je bewijs veiligstelt: het vluchtigste (registers, RAM) eerst, de duurzame opslag (schijf, back-up) als laatste.' },
    { term: 'Geheugendump (memory dump)', def: 'Een exacte kopie van al het RAM naar een bestand, voor latere analyse.' },
    { term: 'WinPmem / FTK Imager', def: 'Veelgebruikte tools om op Windows een geheugendump te maken (RAM naar bestand).' },
    { term: 'Fileless malware', def: 'Kwaadaardige code die alleen in het geheugen leeft en nooit als bestand op de schijf staat.' },
    { term: 'Volatility 3', def: 'Open-source framework dat een geheugendump ontleedt in processen, verbindingen, geïnjecteerde code en meer.' },
    { term: 'Plugin', def: 'Module in Volatility die één specifiek ding uit het geheugen haalt, bijv. windows.pslist.' },
    { term: 'PID / PPID', def: 'Process ID en Parent Process ID: het nummer van een proces en van het proces dat het startte.' },
    { term: 'EPROCESS', def: 'De datastructuur waarmee Windows elk proces bijhoudt; pslist volgt de lijst, psscan scant op hun handtekening.' },
    { term: 'Rootkit', def: 'Malware die zichzelf verbergt, bijvoorbeeld door een proces uit de officiële lijst te halen (process unlinking).' },
    { term: 'C2 (command-and-control)', def: 'De verbinding waarlangs een aanvaller een besmet systeem op afstand bestuurt; zichtbaar als vreemde uitgaande verbinding.' },
    { term: 'Code-injectie', def: 'Het inspuiten van kwaadaardige code in het geheugen van een ander proces; zichtbaar met windows.malfind.' },
    { term: 'Chain of custody', def: 'De bewijsketen: nauwkeurig bijhouden wie het bewijs wanneer maakte, aanraakte en opsloeg.' },
  ],
  resources: [
    { title: 'Volatility Foundation — de tool en documentatie', url: 'https://www.volatilityfoundation.org/' },
    { title: 'Forensic Focus — artikelen over geheugenforensie', url: 'https://www.forensicfocus.com/' },
    { title: 'CyberDefenders — oefen met echte (veilige) dumps', url: 'https://cyberdefenders.org/' },
    { title: 'NCSC — Nationaal Cyber Security Centrum', url: 'https://www.ncsc.nl/' },
  ],
});
