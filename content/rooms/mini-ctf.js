/* Room: Eindopdracht — Mini-CTF "Operatie KoffieKlap" */
CS.registerRoom({
  id: 'mini-ctf',
  path: 'eindopdracht',
  order: 1,
  title: 'Mini-CTF: Operatie KoffieKlap',
  icon: '🏁',
  difficulty: 'Moeilijk',
  minutes: 90,
  summary: 'De eindproef. Je bent ingehuurd als junior security-analist bij het (fictieve) KoffieKlap B.V. Zes uitdagingen, zes vlaggen — breng alles samen wat je geleerd hebt.',
  objectives: [
    'Verkenning uitvoeren en open diensten in kaart brengen',
    'Een webkwetsbaarheid (SQL-injectie) uitbuiten in een veilig lab',
    'Een versleutelde/gecodeerde boodschap ontrafelen met CyberChef',
    'Een wachtwoordhash kraken met een woordenlijst',
    'Een aanval reconstrueren uit logbestanden',
    'De Linux-terminal gebruiken om een verborgen vlag te vinden',
  ],
  terms: [
    { term: 'CTF', def: 'Capture The Flag: een spel waarin je beveiligingsuitdagingen oplost en "vlaggen" (geheime codes) verzamelt.' },
    { term: 'Vlag (flag)', def: 'Een unieke code die bewijst dat je een uitdaging hebt opgelost, hier in het formaat JVT{...}.' },
    { term: 'Enumeratie', def: 'Systematisch in kaart brengen wat er draait: poorten, diensten, gebruikers, bestanden.' },
    { term: 'Exploit', def: 'Een techniek of stukje code dat een kwetsbaarheid daadwerkelijk misbruikt.' },
    { term: 'Pivot', def: 'Van het ene gekraakte systeem verder springen naar het volgende.' },
    { term: 'Write-up', def: 'Verslag waarin je uitlegt hoe je een uitdaging hebt opgelost — goud waard om van te leren.' },
  ],
  resources: [
    { title: 'TryHackMe — oefen verder met echte rooms', url: 'https://tryhackme.com/' },
    { title: 'OverTheWire: Bandit — terminal-CTF voor beginners', url: 'https://overthewire.org/wargames/bandit/' },
    { title: 'picoCTF — gratis CTF-oefeningen', url: 'https://picoctf.org/' },
  ],
  tasks: [
    {
      title: 'Taak 1 — De opdracht',
      content: `
        <p>Welkom bij je eindproef. <strong>KoffieKlap B.V.</strong> (volledig fictief) heeft je ingehuurd omdat ze vermoeden dat hun systemen niet op orde zijn. Je hebt <em>schriftelijke toestemming</em> om hun testomgeving <code>10.10.60.0/24</code> te onderzoeken — en dat is cruciaal: zonder die toestemming zou alles wat je hierna doet strafbaar zijn (art. 138ab Sr, computervredebreuk).</p>
        <div class="callout danger"><strong>Ethiek, nog één keer:</strong> alle technieken in deze CTF oefen je in dit afgeschermde lab of op systemen waarvoor je uitdrukkelijk toestemming hebt. Nooit daarbuiten.</div>
        <p>Je verzamelt in de komende taken <strong>zes vlaggen</strong>. Elke vlag heeft het formaat <code>JVT{...}</code>. Je gebruikt alles uit de eerdere rooms: verkenning, webhacking, cryptografie, wachtwoorden kraken, logs lezen en de Linux-terminal.</p>
        <p>Een goede analist houdt een <strong>write-up</strong> bij: noteer per stap wat je deed en wat je vond. Dat is precies hoe je in het echt rapporteert aan een klant. Pak er desnoods kladpapier bij.</p>
        <div class="callout tip"><strong>Tip:</strong> lees bij elke taak eerst rustig wat er gevraagd wordt, en gebruik de hints als je vastloopt. Vastlopen hoort erbij — doorzetten is de belangrijkste hackersvaardigheid.</div>
      `,
      questions: [
        { q: 'Wat maakt het verschil tussen deze oefening en een strafbaar feit?', options: ['Niets, hacken is altijd legaal', 'De schriftelijke toestemming om dit systeem te testen', 'Dat het een klein bedrijf is', 'Dat ik een analist ben'], answer: 1, explain: 'Toestemming (of je eigen lab) is de grens tussen security testing en computervredebreuk.' },
        { q: 'Ik heb toestemming om 10.10.60.0/24 te testen en ga zes vlaggen verzamelen.', noAnswer: true },
      ],
    },
    {
      title: 'Taak 2 — Vlag 1: Verkenning',
      content: `
        <p>Eerst in kaart brengen wát er draait. Je richt je op de server <code>10.10.60.42</code>. Draai een servicescan met nmap om open poorten en versies te vinden.</p>
        <p>Typ in de terminal exact:</p>
        <pre><code>nmap -sV 10.10.60.42</code></pre>
        <p>Bekijk de uitvoer goed. Welke poorten staan open, welke diensten draaien erop, en zie je ergens iets opvallends staan? Soms laat een webserver in zijn titel al iets los.</p>
        <div class="callout info"><strong>Herinnering:</strong> <code>-sV</code> vraagt nmap om de <em>versies</em> van de diensten te detecteren. Dat is waardevol: een oude versie kan een bekende kwetsbaarheid hebben.</div>
      `,
      lab: {
        type: 'terminal',
        user: 'analist', host: 'kali',
        home: '/home/analist', cwd: '/home/analist',
        motd: 'KoffieKlap pentest-omgeving — toestemming aanwezig. Typ de commando\'s uit de opdracht.',
        commands: {
          'nmap -sV 10.10.60.42': `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.60.42
Host is up (0.012s latency).
Not shown: 997 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu
80/tcp   open  http    Apache httpd 2.4.41
8080/tcp open  http    Apache Tomcat 9.0.30
|_http-title: KoffieKlap beheer - JVT{poorten_in_kaart}

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 7.21 seconds`,
          'nmap 10.10.60.42': `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.60.42
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
8080/tcp open  http
Tip: gebruik -sV voor versies en titels.`,
        },
      },
      questions: [
        { q: 'Welke vlag staat in de http-title van de dienst op poort 8080?', answer: 'JVT{poorten_in_kaart}', hint: 'Draai "nmap -sV 10.10.60.42" en lees de |_http-title regel.', explain: 'De -sV-scan toont de titel van de Tomcat-webapp, met de vlag erin.' },
        { q: 'Welke dienst (met versie) draait er op poort 8080?', answer: ['apache tomcat 9.0.30', 'tomcat 9.0.30', 'apache tomcat', 'tomcat'], hint: 'Kijk in de VERSION-kolom bij 8080/tcp.', explain: 'Apache Tomcat 9.0.30 — een Java-webserver.' },
      ],
    },
    {
      title: 'Taak 3 — Vlag 2: Breek in op het beheerpaneel',
      content: `
        <p>Op het beheerpaneel staat een loginformulier. Het lijkt zelfgebouwd en controleert de inlog met een onveilige SQL-query — precies het soort fout dat je in de webhacking-room zag.</p>
        <p>Je kent geen geldig wachtwoord. Gebruik <strong>SQL-injectie</strong> om de controle te omzeilen en als <code>admin</code> binnen te komen. Denk aan een invoer die de <code>WHERE</code>-voorwaarde altijd waar maakt, of die de wachtwoordcheck "wegcommentarieert".</p>
        <div class="callout tip"><strong>Hints:</strong> probeer bij gebruikersnaam <code>admin' --</code> (let op de spatie na <code>--</code>), of een klassieke <code>' OR '1'='1</code>. Kijk in het query-venster wat je invoer met de query doet.</div>
        <p>Zet daarna de schakelaar <em>"prepared statements"</em> aan en probeer het opnieuw. Zie je waarom de injectie dan niet meer werkt? Dat is precies de fix die je als analist zou aanbevelen.</p>
      `,
      lab: {
        type: 'sqli',
        flag: 'JVT{sql_injectie_werkt}',
      },
      questions: [
        { q: 'Welke vlag krijg je als je als admin bent ingelogd?', answer: 'JVT{sql_injectie_werkt}', hint: 'Log met injectie in als admin; de vlag verschijnt bij adminrechten.', explain: 'Met bijvoorbeeld admin\' -- omzeil je de wachtwoordcontrole en krijg je adminrechten + de vlag.' },
        { q: 'Welke invoer bij gebruikersnaam logt je in als admin (zonder wachtwoord te weten)?', answer: ["admin' --", "admin'--", "admin' -- ", "' or '1'='1", "' or '1'='1' --"], hint: 'Of je commentarieert de rest weg (--), of je maakt de voorwaarde altijd waar (OR 1=1).', explain: 'admin\' -- sluit de gebruikersnaam-string en commentarieert de wachtwoordcheck weg. De query vindt dan simpelweg de admin-rij.' },
        { q: 'Wat is de juiste structurele fix tegen SQL-injectie?', options: ['Langere wachtwoorden eisen', 'Prepared statements / geparametriseerde queries', 'De foutmeldingen verbergen', 'HTTPS gebruiken'], answer: 1, explain: 'Prepared statements scheiden code van data, zodat invoer nooit als SQL wordt uitgevoerd.' },
      ],
    },
    {
      title: 'Taak 4 — Vlag 3: De gecodeerde notitie',
      content: `
        <p>In het beheerpaneel vind je een "beveiligde" notitie. De beheerder dacht slim te zijn en heeft hem "versleuteld" — maar in werkelijkheid is het alleen maar <em>gecodeerd</em>. Jij weet inmiddels dat codering geen bescherming is.</p>
        <p>De notitie luidt:</p>
        <pre><code>V0lHe3Bsb3JlcHVyc194bnpjdmJyYX0=</code></pre>
        <p>Dat eindigt op een <code>=</code> — een sterke aanwijzing voor <strong>Base64</strong>. Maar als je het decodeert, krijg je nog geen leesbare vlag: er is een tweede laag. De letters zijn ook nog verschoven (denk aan ROT13 uit de cryptografie-room).</p>
        <p>Gebruik CyberChef hieronder: bouw een recept dat <strong>eerst Base64 decodeert en daarna ROT13</strong> toepast. De invoer staat er al in.</p>
        <div class="callout tip"><strong>Aanpak:</strong> klik op "Base64 decoderen", dan op "ROT13". Zie je de vlag verschijnen in de uitvoer?</div>
      `,
      lab: {
        type: 'cyberchef',
        input: 'V0lHe3Bsb3JlcHVyc194bnpjdmJyYX0=',
      },
      questions: [
        { q: 'Wat is de vlag na Base64-decoderen + ROT13?', answer: 'JVT{cyberchef_kampioen}', encoded: true, hint: 'Recept: eerst "Base64 decoderen", dan "ROT13".', explain: 'Base64 was de eerste laag, ROT13 de tweede. Twee lagen codering zijn nog steeds geen encryptie.' },
        { q: 'Waarom is dit géén echte versleuteling?', options: ['Omdat er geen geheime sleutel nodig is om het terug te draaien', 'Omdat het te kort is', 'Omdat Base64 verboden is', 'Dat is het wel'], answer: 0, explain: 'Codering (Base64, ROT13) is omkeerbaar zonder sleutel. Echte encryptie vereist een geheime sleutel.' },
      ],
    },
    {
      title: 'Taak 5 — Vlag 4: Kraak het wachtwoord',
      content: `
        <p>Uit de gehackte database haal je de wachtwoord-hash van de beheerder. Het bedrijf gebruikt (helaas) het verouderde <strong>MD5</strong> zonder salt. Jij weet dat zwakke wachtwoorden met een woordenlijst zo gekraakt zijn.</p>
        <p>De hash is:</p>
        <pre><code>313613ba99fdc8f2920fbd70572704a9</code></pre>
        <p>Start hieronder een woordenlijstaanval. Staat het wachtwoord er niet bij? Voeg eigen gokken toe — denk aan de bedrijfsnaam, het jaartal en een leesteken (bedrijven doen dat vaak: <code>Bedrijf!2026</code>).</p>
        <div class="callout warn"><strong>Waarom dit kan:</strong> MD5 is razendsnel te berekenen, dus een aanvaller probeert miljarden woorden per seconde. Daarom hoor je wachtwoorden op te slaan met een traag, gesalt algoritme als bcrypt, scrypt of Argon2 — zoals je in de wachtwoorden-room leerde.</div>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        hash: '313613ba99fdc8f2920fbd70572704a9',
        wordlist: ['wachtwoord', 'welkom', 'admin', 'koffie', 'koffie2026', 'KoffieKlap', 'koffieklap1', 'zomer2026', 'koffie!2026', 'geheim'],
      },
      questions: [
        { q: 'Wat is het gekraakte wachtwoord van de beheerder?', answer: ['koffie!2026'], hint: 'Start de aanval; het staat in de woordenlijst (bedrijfsnaam-stijl: woord + jaar + leesteken).', explain: 'De hash 313613ba... is de MD5 van "koffie!2026".' },
        { q: 'Met welk type aanval kraak je zo\'n onbekende hash via een lijst waarschijnlijke wachtwoorden?', answer: ['woordenlijstaanval', 'dictionary attack', 'woordenlijst', 'dictionary'], hint: 'Je probeert woorden uit een lijst.', explain: 'Een woordenlijstaanval (dictionary attack) probeert bekende/waarschijnlijke wachtwoorden.' },
        { q: 'Wat had dit kraken veel moeilijker gemaakt?', options: ['Een langere gebruikersnaam', 'Opslag met bcrypt/Argon2 + een unieke salt', 'MD5 twee keer toepassen', 'De hash geheim houden'], answer: 1, explain: 'Een traag, gesalt algoritme (bcrypt/scrypt/Argon2) maakt massaal kraken onbetaalbaar traag.' },
      ],
    },
    {
      title: 'Taak 6 — Vlag 5: Reconstrueer de aanval',
      content: `
        <p>Nu de blue-team-kant. KoffieKlap vermoedt dat er al eerder iemand heeft ingebroken via SSH. Je krijgt het <code>auth.log</code> van de server. Ergens zit een <strong>geslaagde brute-force-aanval</strong>: heel veel mislukte inlogpogingen vanaf één IP-adres, gevolgd door een geslaagde login.</p>
        <p>Gebruik de filter in de logviewer. Filter bijvoorbeeld op <code>Failed password</code> om de pogingen te zien, en op <code>Accepted</code> om de geslaagde login te vinden. Welk IP hoort erbij?</p>
        <div class="callout tip"><strong>Tip:</strong> je kunt ook een regex gebruiken, bv. <code>/Failed|Accepted/</code>, om alles in één keer te zien. Let op het tijdstip en het IP-adres.</div>
      `,
      lab: {
        type: 'logs',
        title: '/var/log/auth.log',
        lines: `Oct  2 03:11:02 koffieklap sshd[2041]: Failed password for root from 198.51.100.7 port 51002 ssh2
Oct  2 03:11:04 koffieklap sshd[2041]: Failed password for root from 198.51.100.7 port 51006 ssh2
Oct  2 03:11:07 koffieklap sshd[2043]: Failed password for admin from 198.51.100.7 port 51010 ssh2
Oct  2 03:11:09 koffieklap sshd[2043]: Failed password for admin from 198.51.100.7 port 51014 ssh2
Oct  2 03:11:12 koffieklap sshd[2045]: Failed password for beheer from 198.51.100.7 port 51020 ssh2
Oct  2 03:11:15 koffieklap sshd[2045]: Failed password for beheer from 198.51.100.7 port 51024 ssh2
Oct  2 03:11:18 koffieklap sshd[2047]: Failed password for koffie from 198.51.100.7 port 51030 ssh2
Oct  2 03:11:21 koffieklap sshd[2047]: Failed password for koffie from 198.51.100.7 port 51034 ssh2
Oct  2 03:11:24 koffieklap sshd[2049]: Failed password for koffie from 198.51.100.7 port 51040 ssh2
Oct  2 03:11:27 koffieklap sshd[2049]: Failed password for koffie from 198.51.100.7 port 51044 ssh2
Oct  2 03:11:30 koffieklap sshd[2051]: Failed password for koffie from 198.51.100.7 port 51050 ssh2
Oct  2 03:11:33 koffieklap sshd[2051]: Accepted password for koffie from 198.51.100.7 port 51055 ssh2
Oct  2 03:11:33 koffieklap sshd[2051]: pam_unix(sshd:session): session opened for user koffie
Oct  2 03:12:01 koffieklap sshd[2051]: koffie : TTY=pts/0 ; PWD=/home/koffie ; USER=root ; COMMAND=/bin/bash
Oct  2 03:12:40 koffieklap CRON[2088]: pam_unix(cron:session): session opened for user root
Oct  2 03:14:02 koffieklap sshd[2051]: # notitie van de aanvaller: JVT{brute_force_in_de_logs}
Oct  2 07:45:10 koffieklap sshd[3301]: Accepted password for jan from 10.10.60.9 port 44122 ssh2
Oct  2 08:02:55 koffieklap sshd[3340]: Accepted publickey for fatima from 10.10.60.12 port 44580 ssh2
Oct  2 09:15:19 koffieklap sudo:   jan : TTY=pts/1 ; PWD=/home/jan ; USER=root ; COMMAND=/usr/bin/apt update`,
      },
      questions: [
        { q: 'Vanaf welk IP-adres kwam de brute-force-aanval (en de geslaagde login)?', answer: '198.51.100.7', hint: 'Filter op "Failed password" — één IP herhaalt zich tientallen keren, en komt ook terug bij "Accepted".', explain: 'Alle mislukte pogingen én de geslaagde login op gebruiker "koffie" komen van 198.51.100.7.' },
        { q: 'Welk account werd uiteindelijk succesvol gekraakt?', answer: 'koffie', hint: 'Zoek op "Accepted password" vanaf het aanvaller-IP.', explain: 'Na vele pogingen lukte "Accepted password for koffie". Daarna werd zelfs root benaderd.' },
        { q: 'Welke vlag liet de aanvaller achter in het logbestand?', answer: 'JVT{brute_force_in_de_logs}', hint: 'Filter op "JVT" of lees de regel rond 03:14.', explain: 'In een commentaarregel kort na de inbraak staat de vlag.' },
      ],
    },
    {
      title: 'Taak 7 — Vlag 6: De laatste stap in de terminal',
      content: `
        <p>Je hebt toegang als <code>koffie</code> en wilt de laatste buit vinden. De aanvaller heeft iets achtergelaten, maar netjes verstopt: in een <em>verborgen</em> bestand, en bovendien Base64-gecodeerd zodat het niet meteen leesbaar is.</p>
        <p>Werk systematisch:</p>
        <ol>
          <li>Kijk welke bestanden er staan, <strong>ook de verborgen</strong>: <code>ls -a</code></li>
          <li>Zoek door de hele thuismap naar iets verdachts, bv.: <code>grep -r JVT /home/koffie</code></li>
          <li>Vind je een <code>.b64</code>-bestand? Decodeer het: <code>cat /home/koffie/.verborgen/buit.b64 | base64 -d</code></li>
        </ol>
        <div class="callout tip"><strong>Onthoud:</strong> <code>-a</code> toont verborgen bestanden (die met een punt beginnen), <code>grep -r</code> zoekt recursief in alle bestanden, en <code>base64 -d</code> decodeert. Precies de gereedschappen uit de Linux-room.</div>
      `,
      lab: {
        type: 'terminal',
        user: 'koffie', host: 'koffieklap',
        home: '/home/koffie', cwd: '/home/koffie',
        motd: 'Ingelogd als koffie@koffieklap. Vind de laatste vlag.',
        fs: {
          '/home/koffie/welkom.txt': 'Welkom op de KoffieKlap-server.\nNiets bijzonders hier te zien... of toch?\n',
          '/home/koffie/.bash_history': 'ls\ncd .verborgen\ncat buit.b64\nbase64 -d buit.b64\nclear\n',
          '/home/koffie/.verborgen/buit.b64': 'SlZUe2Rvam9fdm9sdG9vaWR9\n',
          '/home/koffie/.verborgen/leesmij.txt': 'Als je dit leest, ben je verder gekomen dan de meesten.\nDe echte buit staat in buit.b64 — decodeer hem.\n',
          '/home/koffie/documenten/factuur.txt': 'Factuur 2026-0442 — 3 zakken koffiebonen.\n',
        },
        denied: ['/root', '/etc/shadow'],
      },
      questions: [
        { q: 'Wat is de laatste vlag (na base64-decoderen van het verborgen bestand)?', answer: 'JVT{dojo_voltooid}', encoded: true, hint: 'ls -a → cd .verborgen → cat buit.b64 | base64 -d (of base64 -d /home/koffie/.verborgen/buit.b64).', explain: 'SlZUe2Rvam9fdm9sdG9vaWR9 is Base64 voor JVT{dojo_voltooid}. Je hebt alle zes vlaggen!' },
        { q: 'Welk commando toont ook verborgen bestanden (die met een punt beginnen)?', answer: ['ls -a', 'ls -la', 'ls -al', 'ls --all'], hint: 'Een vlag bij ls.', explain: 'ls -a toont alle bestanden, inclusief de verborgen (dotfiles).' },
        { q: 'Ik heb alle zes vlaggen gevonden en de Mini-CTF voltooid. 🏆', noAnswer: true },
      ],
    },
    {
      title: 'Taak 8 — Nabespreking & hoe nu verder',
      content: `
        <p>Gefeliciteerd, analist. 🎉 Je hebt zes vlaggen veroverd en daarmee de hele keten doorlopen: <strong>verkennen → inbreken → ontcijferen → kraken → detecteren → buitmaken</strong>. Dat is in het klein precies wat echte security-mensen doen.</p>
        <h3>Wat je nu kunt</h3>
        <ul>
          <li>De basis van netwerken, het web, Linux en Windows</li>
          <li>Cryptografie onderscheiden van codering, en wachtwoorden veilig (laten) opslaan</li>
          <li>Social engineering en phishing herkennen</li>
          <li>Denken als een aanvaller (OWASP, verkenning, SQL-injectie)</li>
          <li>Denken als een verdediger (logs, incident response, hardening)</li>
        </ul>
        <h3>Hoe je verder groeit</h3>
        <ul>
          <li><strong>Blijf oefenen met je handen.</strong> Platforms als TryHackMe, OverTheWire (Bandit) en picoCTF geven eindeloos veilige oefenstof — zie de bronnen hieronder.</li>
          <li><strong>Bouw een thuislab.</strong> Een virtuele machine met Kali Linux en een kwetsbare oefenmachine (bv. een "boot2root") leert je enorm veel.</li>
          <li><strong>Schrijf write-ups.</strong> Leg uit hoe je iets oploste; uitleggen maakt het kennis.</li>
          <li><strong>Kies een richting.</strong> Red team (aanval), blue team (verdediging), of certificeringen zoals CompTIA Security+ als brede basis.</li>
          <li><strong>Blijf ethisch.</strong> Je vaardigheden zijn krachtig. Gebruik ze alleen op eigen systemen of met toestemming, en meld kwetsbaarheden netjes (coordinated vulnerability disclosure, bv. via het NCSC).</li>
        </ul>
        <div class="callout tip"><strong>Laatste woord:</strong> security is geen eindbestemming maar een gewoonte van nieuwsgierig en kritisch blijven. Je bent nu begonnen — blijf hacken (op de goede manier). 🥷</div>
      `,
      questions: [
        { q: 'Wat is de belangrijkste ethische regel die je meeneemt?', options: ['Alleen hacken met toestemming of op je eigen lab', 'Nooit iets melden', 'Zo snel mogelijk beroemd worden', 'Alle technieken overal uitproberen'], answer: 0, explain: 'Toestemming of je eigen lab — en kwetsbaarheden netjes melden. Dat scheidt een security-professional van een crimineel.' },
        { q: 'Welke brede beginstappcertificering noemden we als goede basis?', answer: ['comptia security+', 'security+', 'comptia security plus'], hint: 'Een bekende leverancier-neutrale certificering.', explain: 'CompTIA Security+ is een veelgebruikte, brede basiscertificering.' },
        { q: 'Ik weet hoe ik verder kan leren en blijf dat ethisch doen.', noAnswer: true },
      ],
    },
  ],
});
