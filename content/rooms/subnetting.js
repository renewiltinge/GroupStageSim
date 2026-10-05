/* Room: IP-adressen en subnetting */
CS.registerRoom({
  id: 'subnetting',
  path: 'fundamenten',
  order: 3,
  title: 'IP-adressen en subnetting',
  icon: '🧮',
  difficulty: 'Gemiddeld',
  minutes: 65,
  summary: 'Reken met IP-adressen: binair en decimaal, subnetmaskers en CIDR, netwerk- en broadcastadres, het aantal hosts, de speciale adresblokken en het verkorten van IPv6.',
  objectives: [
    'Decimale getallen omrekenen naar binair en terug',
    'Een subnetmasker en de CIDR-notatie lezen en omrekenen',
    'Het netwerkadres, broadcastadres en aantal bruikbare hosts van een subnet berekenen',
    'De private ranges, loopback en APIPA herkennen',
    'Uitleggen waarom subnetten (segmentatie) ook een beveiligingsmaatregel is',
    'Een IPv6-adres correct verkorten',
  ],
  tasks: [
    {
      title: 'Taak 1 — Binair en decimaal',
      content: `
        <p>Computers kennen maar twee toestanden: aan (1) en uit (0). Dat is het <strong>binaire</strong> talstelsel.
        Een enkele 0 of 1 heet een <strong>bit</strong>. Acht bits samen heten een <strong>byte</strong> of, als het om
        een deel van een IP-adres gaat, een <strong>octet</strong>. Een IPv4-adres bestaat uit vier van die octetten,
        dus uit 4 &times; 8 = 32 bits.</p>

        <p>Om binair te lezen hoef je maar één tabel te kennen: de plaatswaarden binnen een octet. Van links naar rechts
        verdubbelt elke plaats:</p>

        <table>
          <thead>
            <tr><th>Plaats</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Waarde</strong></td><td>128</td><td>64</td><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td><td>1</td></tr>
          </tbody>
        </table>

        <p><strong>Van binair naar decimaal:</strong> tel de waarden op waar een 1 staat. Voorbeeld:
        <code>11000000</code>. Er staat een 1 op plaats 1 (128) en plaats 2 (64), de rest is 0. Dus 128 + 64 = <strong>192</strong>.</p>

        <p><strong>Nog een voorbeeld:</strong> <code>10101000</code> = 128 + 32 + 8 = <strong>168</strong>. En
        <code>00000001</code> = <strong>1</strong>. Zo is <code>192.168.1.10</code> binair:
        <code>11000000.10101000.00000001.00001010</code>.</p>

        <p><strong>Van decimaal naar binair:</strong> werk van links (128) naar rechts. Past de plaatswaarde in je
        getal, zet dan een 1 en trek hem af; past hij niet, zet een 0. Voorbeeld 200:</p>
        <ul>
          <li>128 past in 200 &rarr; 1, rest 72</li>
          <li>64 past in 72 &rarr; 1, rest 8</li>
          <li>32 past niet in 8 &rarr; 0; 16 past niet &rarr; 0; 8 past in 8 &rarr; 1, rest 0</li>
          <li>4 &rarr; 0; 2 &rarr; 0; 1 &rarr; 0</li>
        </ul>
        <p>Resultaat: 200 = <code>11001000</code>. Elk octet loopt zo van 0 (<code>00000000</code>) tot en met 255
        (<code>11111111</code>).</p>

        <div class="callout tip">
          <p><strong>Tip:</strong> leer alleen de rij 128-64-32-16-8-4-2-1 uit je hoofd. Daarmee reken je elk octet in
          enkele seconden om, en de rest van subnetting wordt veel makkelijker.</p>
        </div>
      `,
      questions: [
        {
          q: 'Hoeveel bits zitten er in één octet?',
          answer: ['8', '8 bits'],
          hint: 'Een IPv4-adres heeft vier octetten en is in totaal 32 bits.',
          explain: 'Eén octet is 8 bits; vier octetten vormen samen de 32 bits van een IPv4-adres.',
        },
        {
          q: 'Welke decimale waarde hoort bij het binaire getal 11000000?',
          options: ['160', '192', '224'],
          answer: 1,
          explain: '128 (plaats 1) + 64 (plaats 2) = 192.',
        },
      ],
    },

    {
      title: 'Taak 2 — Het subnetmasker en de CIDR-notatie',
      content: `
        <p>Een IP-adres heeft twee delen: een <strong>netwerkdeel</strong> (welk netwerk) en een <strong>hostdeel</strong>
        (welk apparaat binnen dat netwerk). Het <strong>subnetmasker</strong> vertelt waar de grens ligt. Op de plekken
        waar het masker een 1 heeft, hoort het bij het netwerkdeel; waar het een 0 heeft, bij het hostdeel.</p>

        <p>Het klassieke masker <code>255.255.255.0</code> is binair:</p>
        <p><code>11111111.11111111.11111111.00000000</code></p>
        <p>Dat zijn 24 enen gevolgd door 8 nullen. De eerste 24 bits zijn dus het netwerkdeel, de laatste 8 het
        hostdeel.</p>

        <p>Omdat zo'n masker lang is, gebruiken we de <strong>CIDR-notatie</strong> (Classless Inter-Domain Routing):
        je telt simpelweg het aantal enen (netwerkbits) en zet dat achter het adres met een schuine streep. Dus
        <code>255.255.255.0</code> = <strong>/24</strong>. Het adres schrijf je dan als <code>192.168.1.0/24</code>.</p>

        <p>De belangrijkste maskers om te herkennen:</p>
        <table>
          <thead><tr><th>CIDR</th><th>Subnetmasker</th><th>Netwerkbits</th><th>Hostbits</th></tr></thead>
          <tbody>
            <tr><td>/8</td><td>255.0.0.0</td><td>8</td><td>24</td></tr>
            <tr><td>/16</td><td>255.255.0.0</td><td>16</td><td>16</td></tr>
            <tr><td>/24</td><td>255.255.255.0</td><td>24</td><td>8</td></tr>
            <tr><td>/25</td><td>255.255.255.128</td><td>25</td><td>7</td></tr>
            <tr><td>/26</td><td>255.255.255.192</td><td>26</td><td>6</td></tr>
            <tr><td>/27</td><td>255.255.255.224</td><td>27</td><td>5</td></tr>
            <tr><td>/28</td><td>255.255.255.240</td><td>28</td><td>4</td></tr>
            <tr><td>/30</td><td>255.255.255.252</td><td>30</td><td>2</td></tr>
          </tbody>
        </table>

        <p>Zie je het laatste octet terug? 128, 192, 224, 240, 252: dat is telkens een bit erbij (128; 128+64; enzovoort).
        Hoe hoger de CIDR, hoe meer netwerkbits en hoe <em>minder</em> hosts per netwerk.</p>

        <div class="callout info">
          <p><strong>Voorbeeld:</strong> <code>255.255.255.192</code> is binair
          <code>11111111.11111111.11111111.11000000</code>. Tel de enen: 8 + 8 + 8 + 2 = 26. Dus dit masker is /26.</p>
        </div>
      `,
      questions: [
        {
          q: 'Welke CIDR-notatie hoort bij het subnetmasker 255.255.255.0?',
          answer: ['/24', '24'],
          hint: 'Tel het aantal enen: 8 + 8 + 8 + 0.',
          explain: '255.255.255.0 heeft 24 netwerkbits, dus /24.',
        },
        {
          q: 'Hoeveel bits staan "aan" (op 1) in het subnetmasker 255.255.255.192?',
          options: ['24', '25', '26'],
          answer: 2,
          explain: '255 = acht enen (3x), en 192 = 11000000 = twee enen. 8+8+8+2 = 26, dus /26.',
        },
      ],
    },

    {
      title: 'Taak 3 — Netwerkadres, broadcast en bruikbare hosts',
      content: `
        <p>Binnen elk subnet zijn twee adressen gereserveerd en mag je de rest aan apparaten geven:</p>
        <ul>
          <li>Het <strong>netwerkadres</strong>: alle hostbits op 0. Dit is de "naam" van het netwerk; je geeft het niet
            aan een apparaat.</li>
          <li>Het <strong>broadcastadres</strong>: alle hostbits op 1. Hiermee bereik je alle apparaten in het subnet
            tegelijk; ook dit geef je niet aan een apparaat.</li>
          <li>Alle adressen daartussen zijn de <strong>bruikbare hosts</strong>.</li>
        </ul>

        <p>Omdat je er twee kwijt bent (netwerk en broadcast), geldt de formule:</p>
        <p><strong>bruikbare hosts = 2^(hostbits) &minus; 2</strong></p>
        <p>Bij /24 zijn er 8 hostbits: 2^8 &minus; 2 = 256 &minus; 2 = <strong>254</strong> hosts. Bij /26 zijn er 6
        hostbits: 2^6 &minus; 2 = 64 &minus; 2 = <strong>62</strong> hosts.</p>

        <h3>Stap voor stap: wat is het broadcastadres van 192.168.10.64/26?</h3>
        <ol>
          <li><strong>Masker en hostbits.</strong> /26 betekent masker 255.255.255.192 en 32 &minus; 26 = 6 hostbits.</li>
          <li><strong>Blokgrootte.</strong> Het interessante octet is het laatste (192). De blokgrootte is
            256 &minus; 192 = <strong>64</strong>. De subnetten in het laatste octet beginnen dus bij 0, 64, 128, 192.</li>
          <li><strong>Netwerkadres.</strong> Het adres .64 valt precies op een grens, dus het netwerkadres is
            <code>192.168.10.64</code>.</li>
          <li><strong>Broadcastadres.</strong> Het volgende blok begint bij .128, dus dit blok loopt tot en met .127.
            Het broadcastadres is <code>192.168.10.127</code>.</li>
          <li><strong>Bruikbare hosts.</strong> Van .65 tot en met .126, dat zijn er 62 (klopt met 2^6 &minus; 2).</li>
        </ol>

        <h3>Nog een voorbeeld: 172.16.34.200/20</h3>
        <p>/20 = masker 255.255.240.0. Het interessante octet is nu het derde (240). Blokgrootte = 256 &minus; 240 = 16,
        dus blokken beginnen bij 0, 16, 32, 48, ... in het derde octet. 34 valt tussen 32 en 48, dus het netwerkadres is
        <code>172.16.32.0</code> en het broadcastadres <code>172.16.47.255</code>. Dat zijn 2^12 &minus; 2 = 4094
        bruikbare hosts.</p>

        <div class="callout tip">
          <p><strong>Oefen in het lab hieronder.</strong> Gebruik de calculator om je antwoorden te controleren en de
          generator om willekeurige oefenvragen te maken. Reken ze eerst zelf uit met de stappen hierboven, en kijk daarna
          pas of het klopt.</p>
        </div>
      `,
      lab: { type: 'subnet' },
      questions: [
        {
          q: 'Wat is het broadcastadres van 192.168.10.64/26?',
          answer: ['192.168.10.127'],
          hint: 'Blokgrootte is 64; het blok .64 loopt tot aan het volgende blok op .128.',
          explain: 'Het blok loopt van .64 tot en met .127, dus het broadcastadres is 192.168.10.127.',
        },
        {
          q: 'Hoeveel bruikbare hosts heeft een /26-netwerk?',
          answer: ['62'],
          hint: 'Gebruik 2^(hostbits) min 2, met 6 hostbits.',
          explain: '/26 heeft 6 hostbits: 2^6 min 2 = 64 min 2 = 62 bruikbare hosts.',
        },
        {
          q: 'Wat is het netwerkadres van 172.16.34.200/20?',
          answer: ['172.16.32.0'],
          hint: 'Blokgrootte in het derde octet is 256 min 240 = 16; tussen welke veelvouden van 16 valt 34?',
          explain: '34 valt tussen 32 en 48, dus het netwerkadres is 172.16.32.0 (broadcast 172.16.47.255).',
        },
      ],
    },

    {
      title: 'Taak 4 — Speciale adresblokken en waarom je subnet',
      content: `
        <p>Niet elk IP-adres mag zomaar op het internet. Een aantal blokken is voor speciaal gebruik gereserveerd. Deze
        moet je kunnen herkennen.</p>

        <p><strong>Private ranges (RFC 1918).</strong> Deze adressen gebruik je binnen een eigen netwerk; ze zijn niet
        routeerbaar op het internet (daar komt NAT om de hoek kijken):</p>
        <table>
          <thead><tr><th>Blok</th><th>Bereik</th></tr></thead>
          <tbody>
            <tr><td><code>10.0.0.0/8</code></td><td>10.0.0.0 t/m 10.255.255.255</td></tr>
            <tr><td><code>172.16.0.0/12</code></td><td>172.16.0.0 t/m 172.31.255.255</td></tr>
            <tr><td><code>192.168.0.0/16</code></td><td>192.168.0.0 t/m 192.168.255.255</td></tr>
          </tbody>
        </table>
        <p>Let op bij de 172-range: alleen 172.<strong>16</strong> t/m 172.<strong>31</strong> is privé. Een adres als
        172.32.0.1 valt er net buiten en is dus publiek.</p>

        <p><strong>Loopback: <code>127.0.0.0/8</code>.</strong> Het bekendste adres is <code>127.0.0.1</code>
        ("localhost"): verkeer naar jezelf, dat je netwerkkaart nooit verlaat. Handig om te testen of een dienst lokaal
        draait.</p>

        <p><strong>APIPA: <code>169.254.0.0/16</code>.</strong> Krijgt een apparaat geen adres van een DHCP-server, dan
        geeft het zichzelf automatisch een adres in dit bereik. Zie je een 169.254-adres, dan weet je bijna zeker: de
        DHCP-server is onbereikbaar.</p>

        <h3>Waarom zou je een netwerk opdelen?</h3>
        <p>Subnetten (segmenteren) doe je om drie redenen:</p>
        <ul>
          <li><strong>Overzicht en beheer</strong>: aparte subnetten voor servers, werkplekken, gasten en printers.</li>
          <li><strong>Prestaties</strong>: kleinere netwerken betekenen minder broadcastverkeer dat iedereen stoort.</li>
          <li><strong>Beveiliging</strong>: dit is cruciaal. Door netwerken te scheiden en er een firewall tussen te
            zetten, beperk je hoe ver een aanvaller kan komen. Breekt iemand in op het gastennetwerk, dan kan hij niet
            zomaar bij de servers. Dat heet het beperken van <em>laterale beweging</em> (lateral movement). Segmentatie
            is daarmee een echte beveiligingsmaatregel.</li>
        </ul>

        <div class="callout info">
          <p><strong>Voorbeeld:</strong> een ziekenhuis zet medische apparatuur in een apart, streng afgeschermd
          subnet. Raakt een gewone werkplek besmet met malware, dan kan die niet zomaar bij de apparatuur die aan
          patiënten vastzit. Segmentatie redt hier in het ergste geval levens.</p>
        </div>
      `,
      questions: [
        {
          q: 'Welk van deze adressen valt binnen een private range (RFC 1918)?',
          options: ['8.8.8.8', '10.5.3.1', '172.32.0.1'],
          answer: 1,
          explain: '10.5.3.1 valt in 10.0.0.0/8. 8.8.8.8 is publiek en 172.32.0.1 valt net buiten de 172.16-172.31-range.',
        },
        {
          q: 'Welk bereik gebruikt een apparaat zelf (APIPA) als het geen DHCP-adres krijgt? Geef de eerste twee octetten.',
          answer: ['169.254'],
          hint: 'Het APIPA-blok is 169.254.0.0/16.',
          explain: 'Zonder DHCP geeft een apparaat zichzelf een adres in 169.254.0.0/16.',
        },
        {
          q: 'Ik begrijp waarom netwerksegmentatie (subnetten met een firewall ertussen) ook een beveiligingsmaatregel is.',
          noAnswer: true,
        },
      ],
    },

    {
      title: 'Taak 5 — IPv6-notatie verkorten',
      content: `
        <p>Een IPv6-adres is 128 bits lang en wordt geschreven als acht groepen van vier hexadecimale tekens, gescheiden
        door dubbele punten. Voluit ziet dat er lang en onhandig uit, bijvoorbeeld:</p>
        <p><code>2001:0db8:0000:0000:0000:ff00:0042:8329</code></p>

        <p>Gelukkig mag je het verkorten met twee regels:</p>
        <ol>
          <li><strong>Voorloopnullen weglaten.</strong> In elke groep mag je nullen aan het begin schrappen. Zo wordt
            <code>0db8</code> &rarr; <code>db8</code>, <code>0000</code> &rarr; <code>0</code>, <code>0042</code> &rarr;
            <code>42</code>. Na deze stap: <code>2001:db8:0:0:0:ff00:42:8329</code>.</li>
          <li><strong>Eén reeks nulgroepen vervangen door <code>::</code>.</strong> De langste aaneengesloten reeks
            groepen die helemaal 0 zijn, mag je in zijn geheel vervangen door een dubbele dubbele punt. Dat mag maar
            <em>één keer</em> per adres (anders is het dubbelzinnig). Hier worden de drie nulgroepen in het midden
            <code>::</code>.</li>
        </ol>

        <p>Het eindresultaat is: <code>2001:db8::ff00:42:8329</code>. Reken maar na dat je er met het aantal groepen
        altijd weer op acht uitkomt als je <code>::</code> weer uitvouwt.</p>

        <p>Nog twee adressen die je vaak tegenkomt:</p>
        <ul>
          <li><code>::1</code> is de IPv6-loopback (de tegenhanger van 127.0.0.1).</li>
          <li><code>fe80::/10</code> zijn link-local adressen: alleen geldig binnen het eigen netwerksegment. Je zag er
            al eentje in de netwerken-room (<code>fe80::5054:ff:fea3:1f6b</code>).</li>
        </ul>

        <div class="callout warn">
          <p><strong>Let op:</strong> je mag <code>::</code> maar één keer gebruiken. <code>2001:db8::1::1</code> is
          ongeldig, want dan weet je niet meer hoeveel nulgroepen aan welke kant horen.</p>
        </div>
      `,
      questions: [
        {
          q: 'Verkort het IPv6-adres 2001:0db8:0000:0000:0000:ff00:0042:8329 zo kort mogelijk.',
          answer: ['2001:db8::ff00:42:8329'],
          hint: 'Schrap eerst de voorloopnullen, vervang daarna de reeks nulgroepen door ::',
          explain: 'Na voorloopnullen schrappen en de middelste nulgroepen vervangen door :: krijg je 2001:db8::ff00:42:8329.',
        },
        {
          q: 'Ik kan een IPv6-adres verkorten met de twee regels (voorloopnullen weg, één reeks nulgroepen als ::).',
          noAnswer: true,
        },
      ],
    },
  ],
  terms: [
    { term: 'Bit', def: 'De kleinste eenheid: een 0 of een 1.' },
    { term: 'Octet', def: 'Acht bits samen; een IPv4-adres bestaat uit vier octetten (32 bits).' },
    { term: 'Subnetmasker', def: 'Geeft met enen en nullen aan welk deel van een IP-adres het netwerkdeel is en welk deel het hostdeel.' },
    { term: 'CIDR', def: 'Notatie die het aantal netwerkbits achter een schuine streep zet, bijvoorbeeld /24 voor 255.255.255.0.' },
    { term: 'Netwerkadres', def: 'Het adres met alle hostbits op 0; de naam van het subnet, niet voor een apparaat.' },
    { term: 'Broadcastadres', def: 'Het adres met alle hostbits op 1; bereikt alle apparaten in het subnet tegelijk.' },
    { term: 'Bruikbare hosts', def: 'Het aantal adressen voor apparaten in een subnet: 2^(hostbits) min 2.' },
    { term: 'Private range', def: 'Adresblokken (RFC 1918) voor eigen netwerken: 10.0.0.0/8, 172.16.0.0/12 en 192.168.0.0/16; niet routeerbaar op internet.' },
    { term: 'Loopback', def: 'Het blok 127.0.0.0/8 (meestal 127.0.0.1), verkeer naar jezelf dat de netwerkkaart niet verlaat.' },
    { term: 'APIPA', def: 'Het blok 169.254.0.0/16 dat een apparaat zichzelf geeft als er geen DHCP-server bereikbaar is.' },
    { term: 'Segmentatie', def: 'Een netwerk opdelen in subnetten, onder meer om de bewegingsvrijheid van een aanvaller te beperken.' },
    { term: 'IPv6', def: '128-bits adres, geschreven als acht hexadecimale groepen, te verkorten met voorloopnullen weglaten en één :: voor een reeks nulgroepen.' },
  ],
  resources: [
    { title: 'Cloudflare Learning Center', url: 'https://www.cloudflare.com/learning/' },
    { title: 'OverTheWire: Bandit', url: 'https://overthewire.org/wargames/bandit/' },
    { title: 'TryHackMe', url: 'https://tryhackme.com/' },
  ],
});
