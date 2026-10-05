/* Room: Netwerken — de basis */
CS.registerRoom({
  id: 'netwerken-basis',
  path: 'fundamenten',
  order: 2,
  title: 'Netwerken: de basis',
  icon: '🌐',
  difficulty: 'Makkelijk',
  minutes: 70,
  summary: 'Hoe apparaten met elkaar praten: LAN en WAN, MAC- en IP-adressen, het OSI- en TCP/IP-model, TCP vs UDP, poorten, en protocollen als DHCP, ARP en NAT.',
  objectives: [
    'Uitleggen wat een netwerk is en het verschil tussen LAN, WAN en internet',
    'Het verschil tussen een MAC-adres en een IP-adres (IPv4 en IPv6) beschrijven',
    'De zeven lagen van het OSI-model benoemen en koppelen aan het TCP/IP-model',
    'Het verschil tussen TCP en UDP en de three-way handshake uitleggen',
    'Veelgebruikte poorten herkennen en de rol van DHCP, ARP en NAT beschrijven',
    'Netwerkcommando\'s lezen en informatie uit de uitvoer halen',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is een netwerk?',
      content: `
        <p>Een <strong>netwerk</strong> is niets anders dan twee of meer apparaten die met elkaar kunnen praten om
        gegevens uit te wisselen. Je telefoon die muziek streamt, je laptop die een bestand naar de printer stuurt, een
        server die een webpagina terugstuurt: allemaal netwerkverkeer. Je kunt een netwerk vergelijken met het
        wegennet: apparaten zijn adressen, kabels en wifi zijn de wegen, en de regels van het verkeer heten protocollen.</p>

        <p>Netwerken verschillen in grootte:</p>
        <ul>
          <li><strong>LAN (Local Area Network)</strong>: een netwerk op één locatie, bijvoorbeeld bij jou thuis of op
            kantoor. Snel, en volledig onder eigen beheer.</li>
          <li><strong>WAN (Wide Area Network)</strong>: een netwerk over grote afstanden dat meerdere locaties verbindt.
            Het <strong>internet</strong> is het grootste WAN ter wereld: een netwerk van miljoenen netwerken die met
            elkaar verbonden zijn.</li>
        </ul>

        <p>De belangrijkste apparaten die een netwerk opbouwen:</p>
        <ul>
          <li><strong>Switch</strong>: verbindt apparaten <em>binnen</em> hetzelfde netwerk (LAN) en stuurt verkeer
            gericht naar het juiste apparaat op basis van MAC-adressen.</li>
          <li><strong>Router</strong>: verbindt <em>verschillende</em> netwerken met elkaar, bijvoorbeeld je
            thuisnetwerk met het internet. Een router kiest de route tussen netwerken op basis van IP-adressen.</li>
          <li><strong>Access point (AP)</strong>: zet een bedraad netwerk om naar draadloos (wifi), zodat apparaten
            zonder kabel kunnen verbinden.</li>
          <li><strong>Firewall</strong>: een poortwachter die verkeer toestaat of blokkeert op basis van regels. De
            eerste en belangrijkste beveiligingslaag van een netwerk.</li>
        </ul>

        <p>Bij jou thuis zitten switch, router, access point en firewall vaak in één kastje (het "modem" van je
        provider). In een bedrijf zijn dit meestal aparte, krachtigere apparaten. Het mooie is: de principes blijven
        hetzelfde, of je nu één thuisnetwerk hebt of een datacenter beheert.</p>

        <div class="callout tip">
          <p><strong>Onthoud het verschil:</strong> een <em>switch</em> werkt binnen één netwerk (met MAC-adressen),
          een <em>router</em> werkt tussen netwerken (met IP-adressen). Die twee haal je straks nooit meer door elkaar.</p>
        </div>
      `,
      questions: [
        {
          q: 'Welk apparaat verbindt twee verschillende netwerken met elkaar, bijvoorbeeld je thuisnetwerk met het internet?',
          options: ['Switch', 'Router', 'Access point'],
          answer: 1,
          explain: 'Een router verbindt verschillende netwerken en kiest de route op basis van IP-adressen.',
        },
        {
          q: 'Ik begrijp het verschil tussen een LAN (lokaal netwerk) en een WAN zoals het internet.',
          noAnswer: true,
        },
      ],
    },

    {
      title: 'Taak 2 — MAC- en IP-adressen (IPv4 en IPv6)',
      content: `
        <p>Om een pakketje bij het juiste apparaat te krijgen, heb je adressen nodig. Er zijn er twee soorten, en ze
        doen iets anders.</p>

        <p>Een <strong>MAC-adres</strong> (Media Access Control) is het <em>fysieke</em> adres dat de fabrikant in de
        netwerkkaart heeft "ingebakken". Het verandert normaal niet en is uniek per netwerkkaart. Het bestaat uit 48
        bits, meestal geschreven als zes paren hexadecimale tekens, bijvoorbeeld <code>52:54:00:a3:1f:6b</code>. De
        eerste helft verraadt vaak de fabrikant. MAC-adressen worden gebruikt <em>binnen</em> één netwerk (door de
        switch).</p>

        <p>Een <strong>IP-adres</strong> (Internet Protocol) is het <em>logische</em> adres dat een apparaat krijgt
        <em>in</em> een netwerk. Het kan veranderen: thuis krijg je er meestal eentje van je router. IP-adressen
        worden gebruikt om verkeer <em>tussen</em> netwerken te routeren. Vergelijk: je MAC-adres is als het
        serienummer van je huis dat nooit verandert; je IP-adres is als je straatnaam en huisnummer, die anders zijn
        als je verhuist.</p>

        <p>Er bestaan twee versies van IP:</p>
        <ul>
          <li><strong>IPv4</strong>: <strong>32 bits</strong>, geschreven als vier getallen van 0&ndash;255 (octetten),
            bijvoorbeeld <code>192.168.1.42</code>. Dat geeft ongeveer 4,3 miljard adressen &mdash; te weinig voor alle
            apparaten ter wereld, vandaar trucs als NAT (zie verderop).</li>
          <li><strong>IPv6</strong>: <strong>128 bits</strong>, geschreven als acht groepen hexadecimale tekens,
            bijvoorbeeld <code>2001:0db8:0000:0000:0000:ff00:0042:8329</code>. Dat zijn astronomisch veel adressen, meer
            dan genoeg voor elk apparaat. IPv6-notatie kun je verkorten; dat leer je in de subnetting-room.</li>
        </ul>

        <table>
          <thead>
            <tr><th></th><th>MAC-adres</th><th>IP-adres</th></tr>
          </thead>
          <tbody>
            <tr><td>Type</td><td>Fysiek (hardware)</td><td>Logisch (software)</td></tr>
            <tr><td>Verandert?</td><td>Nee (vast)</td><td>Ja (kan wisselen)</td></tr>
            <tr><td>Werkt</td><td>Binnen één netwerk (switch)</td><td>Tussen netwerken (router)</td></tr>
            <tr><td>Grootte</td><td>48 bits</td><td>32 bits (IPv4) / 128 bits (IPv6)</td></tr>
          </tbody>
        </table>
      `,
      questions: [
        {
          q: 'Uit hoeveel bits bestaat een IPv4-adres?',
          answer: ['32', '32 bits'],
          hint: 'Vier octetten van 8 bits.',
          explain: 'Een IPv4-adres is 32 bits (vier octetten van 8 bits). IPv6 is 128 bits.',
        },
        {
          q: 'Welk adres is vast in de netwerkkaart "ingebakken" en verandert normaal gesproken niet?',
          options: ['Het IP-adres', 'Het MAC-adres', 'De poort'],
          answer: 1,
          explain: 'Het MAC-adres is het fysieke, vaste adres van de netwerkkaart.',
        },
      ],
    },

    {
      title: 'Taak 3 — Het OSI-model, het TCP/IP-model en encapsulatie',
      content: `
        <p>Netwerken zijn ingewikkeld, dus we delen ze op in lagen. Elke laag doet één ding en praat alleen met de laag
        erboven en eronder. Het bekendste model is het <strong>OSI-model</strong> met zeven lagen.</p>

        <figure class="diagram">
          <svg viewBox="0 0 560 300" role="img" aria-label="De zeven lagen van het OSI-model">
            <rect x="12" y="12" width="250" height="34" rx="4" fill="var(--surface-2)" stroke="currentColor" />
            <text x="24" y="33" fill="currentColor" font-size="13">7 · Applicatie</text>
            <text x="280" y="33" fill="currentColor" font-size="13">HTTP, DNS, SMTP</text>
            <rect x="12" y="50" width="250" height="34" rx="4" fill="var(--surface-2)" stroke="currentColor" />
            <text x="24" y="71" fill="currentColor" font-size="13">6 · Presentatie</text>
            <text x="280" y="71" fill="currentColor" font-size="13">TLS, JPEG, ASCII</text>
            <rect x="12" y="88" width="250" height="34" rx="4" fill="var(--surface-2)" stroke="currentColor" />
            <text x="24" y="109" fill="currentColor" font-size="13">5 · Sessie</text>
            <text x="280" y="109" fill="currentColor" font-size="13">sessies op- en afbouwen</text>
            <rect x="12" y="126" width="250" height="34" rx="4" fill="var(--accent-soft)" stroke="currentColor" />
            <text x="24" y="147" fill="currentColor" font-size="13">4 · Transport</text>
            <text x="280" y="147" fill="currentColor" font-size="13">TCP, UDP — segment</text>
            <rect x="12" y="164" width="250" height="34" rx="4" fill="var(--accent-soft)" stroke="currentColor" />
            <text x="24" y="185" fill="currentColor" font-size="13">3 · Netwerk</text>
            <text x="280" y="185" fill="currentColor" font-size="13">IP, ICMP — pakket (router)</text>
            <rect x="12" y="202" width="250" height="34" rx="4" fill="var(--surface-2)" stroke="currentColor" />
            <text x="24" y="223" fill="currentColor" font-size="13">2 · Datalink</text>
            <text x="280" y="223" fill="currentColor" font-size="13">Ethernet, MAC — frame (switch)</text>
            <rect x="12" y="240" width="250" height="34" rx="4" fill="var(--surface-2)" stroke="currentColor" />
            <text x="24" y="261" fill="currentColor" font-size="13">1 · Fysiek</text>
            <text x="280" y="261" fill="currentColor" font-size="13">kabel, radio — bits</text>
          </svg>
          <figcaption>Het OSI-model van boven (7) naar beneden (1), met per laag een voorbeeld.</figcaption>
        </figure>

        <p>Van onder naar boven:</p>
        <ol>
          <li><strong>Fysieke laag</strong>: de kabels, de wifi-signalen, de enen en nullen (bits). Voorbeeld: een
            UTP-kabel.</li>
          <li><strong>Datalinklaag</strong>: verkeer binnen één netwerk met MAC-adressen. Voorbeeld: Ethernet, de switch.</li>
          <li><strong>Netwerklaag</strong>: routeren tussen netwerken met IP-adressen. Voorbeeld: IP, de router.</li>
          <li><strong>Transportlaag</strong>: betrouwbaar of snel leveren met poorten. Voorbeeld: TCP en UDP.</li>
          <li><strong>Sessielaag</strong>: een gesprek (sessie) op- en afbouwen en beheren.</li>
          <li><strong>Presentatielaag</strong>: vertalen, versleutelen en comprimeren. Voorbeeld: TLS, JPEG.</li>
          <li><strong>Applicatielaag</strong>: wat de gebruiker ziet en gebruikt. Voorbeeld: HTTP, DNS, e-mail.</li>
        </ol>

        <div class="callout tip">
          <p><strong>Ezelsbruggetje (laag 1 &rarr; 7):</strong> "Please Do Not Throw Sausage Pizza Away" &mdash;
          Physical, Data link, Network, Transport, Session, Presentation, Application. Een Nederlandse variant:
          "Fijne Dieren Nemen Toch Soms Prachtige Avonturen" (Fysiek, Datalink, Netwerk, Transport, Sessie,
          Presentatie, Applicatie).</p>
        </div>

        <p>In de praktijk gebruiken we vaak het eenvoudigere <strong>TCP/IP-model</strong> met vier lagen: Applicatie
        (OSI 5&ndash;7), Transport (OSI 4), Internet (OSI 3) en Netwerktoegang (OSI 1&ndash;2). Het OSI-model is ideaal
        om over te praten en te leren; TCP/IP beschrijft hoe het internet echt werkt.</p>

        <p>Als je data verstuurt, voegt elke laag zijn eigen informatie toe. Dat heet <strong>encapsulatie</strong>: het
        verpakt de data laag voor laag, zoals een brief in een envelop in een postzak in een vrachtwagen. De data
        krijgt onderweg andere namen:</p>
        <ul>
          <li>Op de <strong>transportlaag</strong> heet het een <strong>segment</strong> (TCP) of datagram (UDP).</li>
          <li>Op de <strong>netwerklaag</strong> heet het een <strong>pakket</strong> (packet).</li>
          <li>Op de <strong>datalinklaag</strong> heet het een <strong>frame</strong>.</li>
          <li>Op de <strong>fysieke laag</strong> zijn het gewoon <strong>bits</strong>.</li>
        </ul>
      `,
      questions: [
        {
          q: 'Op welke laag van het OSI-model werkt een router? Geef het laagnummer.',
          answer: ['3', 'laag 3', 'netwerklaag'],
          hint: 'De router werkt met IP-adressen.',
          explain: 'Een router werkt op de netwerklaag (laag 3), waar met IP-adressen wordt gerouteerd.',
        },
        {
          q: 'Welke OSI-laag gebruikt MAC-adressen?',
          options: ['Fysieke laag (1)', 'Datalinklaag (2)', 'Netwerklaag (3)'],
          answer: 1,
          explain: 'De datalinklaag (laag 2) gebruikt MAC-adressen; daar werkt ook de switch.',
        },
      ],
    },

    {
      title: 'Taak 4 — TCP en UDP en de three-way handshake',
      content: `
        <p>Op de transportlaag kies je hoe je data verstuurt. Er zijn twee hoofdrolspelers: TCP en UDP.</p>

        <p><strong>TCP (Transmission Control Protocol)</strong> is <em>verbindingsgericht</em> en betrouwbaar. Voordat
        er data gaat, bouwen zender en ontvanger eerst een verbinding op. TCP controleert of alles aankomt, in de
        juiste volgorde, en vraagt opnieuw om wat verloren ging. Je gebruikt TCP waar het klopt moet zijn: webpagina\'s
        (HTTP/HTTPS), e-mail, bestandsoverdracht, SSH.</p>

        <p><strong>UDP (User Datagram Protocol)</strong> is <em>verbindingsloos</em>: het schiet de pakketjes gewoon weg,
        zonder handshake en zonder garantie dat ze aankomen. Daardoor is het sneller en lichter. Je gebruikt UDP waar
        snelheid belangrijker is dan een enkel verloren pakketje: videobellen, livestreams, online games, en DNS.</p>

        <table>
          <thead><tr><th></th><th>TCP</th><th>UDP</th></tr></thead>
          <tbody>
            <tr><td>Verbinding</td><td>Ja (handshake vooraf)</td><td>Nee (verbindingsloos)</td></tr>
            <tr><td>Betrouwbaar?</td><td>Ja, met bevestiging</td><td>Nee, geen garantie</td></tr>
            <tr><td>Snelheid</td><td>Iets trager (meer overhead)</td><td>Snel, weinig overhead</td></tr>
            <tr><td>Gebruik</td><td>Web, e-mail, SSH, bestanden</td><td>DNS, streaming, games, VoIP</td></tr>
          </tbody>
        </table>

        <p>TCP bouwt een verbinding op met de beroemde <strong>three-way handshake</strong> (driewegsgroet):</p>

        <figure class="diagram">
          <svg viewBox="0 0 460 250" role="img" aria-label="TCP three-way handshake">
            <defs>
              <marker id="hsArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="currentColor" />
              </marker>
            </defs>
            <text x="100" y="26" text-anchor="middle" fill="currentColor" font-size="13">Client</text>
            <text x="360" y="26" text-anchor="middle" fill="currentColor" font-size="13">Server</text>
            <line x1="100" y1="36" x2="100" y2="220" stroke="currentColor" stroke-dasharray="4 4" />
            <line x1="360" y1="36" x2="360" y2="220" stroke="currentColor" stroke-dasharray="4 4" />
            <line x1="100" y1="70" x2="356" y2="100" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#hsArrow)" />
            <text x="230" y="78" text-anchor="middle" fill="currentColor" font-size="13">1. SYN</text>
            <line x1="360" y1="130" x2="104" y2="160" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#hsArrow)" />
            <text x="230" y="138" text-anchor="middle" fill="currentColor" font-size="13">2. SYN-ACK</text>
            <line x1="100" y1="190" x2="356" y2="210" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#hsArrow)" />
            <text x="230" y="198" text-anchor="middle" fill="currentColor" font-size="13">3. ACK</text>
          </svg>
          <figcaption>De verbinding staat na stap 3; daarna kan de echte data stromen.</figcaption>
        </figure>

        <ol>
          <li><strong>SYN</strong>: de client vraagt een verbinding aan ("mag ik met je praten?").</li>
          <li><strong>SYN-ACK</strong>: de server bevestigt en vraagt zelf ook ("ja, en jij met mij?").</li>
          <li><strong>ACK</strong>: de client bevestigt. De verbinding staat (established).</li>
        </ol>

        <p>Afsluiten gaat netjes met <strong>FIN</strong>-berichten (elke kant zegt "ik ben klaar" met een FIN, de
        ander bevestigt met ACK). Gaat er iets mis of weigert een poort de verbinding abrupt, dan zie je een
        <strong>RST</strong> (reset): de verbinding wordt hard dichtgegooid.</p>
      `,
      questions: [
        {
          q: 'Welk protocol is verbindingsloos en stuurt data zonder handshake vooraf?',
          options: ['TCP', 'UDP'],
          answer: 1,
          explain: 'UDP is verbindingsloos: het verstuurt zonder handshake en zonder garantie, maar wel snel.',
        },
        {
          q: 'Welk bericht stuurt de client als allereerste in de three-way handshake?',
          answer: ['SYN'],
          hint: 'Het eerste van de drie stappen in het diagram.',
          explain: 'De handshake begint met SYN (van de client), gevolgd door SYN-ACK (server) en ACK (client).',
        },
      ],
    },

    {
      title: 'Taak 5 — Poorten en veelgebruikte poortnummers',
      content: `
        <p>Een IP-adres brengt je bij het juiste apparaat, maar op dat apparaat draaien vaak meerdere diensten tegelijk:
        een webserver, een mailserver, een database. Hoe weet een pakketje bij welke dienst het moet zijn? Via een
        <strong>poort</strong> (port). Een poort is een nummer tussen 0 en 65535. Vergelijk: het IP-adres is het
        gebouw, de poort is het kamernummer.</p>

        <p>Diensten luisteren op vaste, afgesproken poorten. Die onder de 1024 heten <em>well-known ports</em>. Deze
        moet je uit je hoofd leren, want je komt ze overal tegen &mdash; ook bij een poortscan tijdens een pentest:</p>

        <table>
          <thead><tr><th>Poort</th><th>Protocol</th><th>Waarvoor</th></tr></thead>
          <tbody>
            <tr><td>21</td><td>FTP</td><td>Bestandsoverdracht (onversleuteld)</td></tr>
            <tr><td>22</td><td>SSH</td><td>Veilig op afstand inloggen / bestanden (SCP, SFTP)</td></tr>
            <tr><td>23</td><td>Telnet</td><td>Op afstand inloggen (onversleuteld, verouderd)</td></tr>
            <tr><td>25</td><td>SMTP</td><td>E-mail versturen</td></tr>
            <tr><td>53</td><td>DNS</td><td>Namen naar IP-adressen vertalen (UDP en TCP)</td></tr>
            <tr><td>80</td><td>HTTP</td><td>Webverkeer (onversleuteld)</td></tr>
            <tr><td>110</td><td>POP3</td><td>E-mail ophalen (oudere manier)</td></tr>
            <tr><td>143</td><td>IMAP</td><td>E-mail ophalen (met mappen op de server)</td></tr>
            <tr><td>443</td><td>HTTPS</td><td>Webverkeer, versleuteld met TLS</td></tr>
            <tr><td>445</td><td>SMB</td><td>Windows-bestandsdeling</td></tr>
            <tr><td>3389</td><td>RDP</td><td>Windows Remote Desktop</td></tr>
            <tr><td>3306</td><td>MySQL</td><td>MySQL-database</td></tr>
          </tbody>
        </table>

        <div class="callout info">
          <p><strong>Beveiligingstip:</strong> onversleutelde protocollen zoals Telnet (23), FTP (21) en HTTP (80)
          sturen wachtwoorden en data leesbaar over het netwerk. Gebruik hun veilige broertjes: SSH (22) in plaats van
          Telnet, SFTP in plaats van FTP, en HTTPS (443) in plaats van HTTP. Poorten als 445 (SMB) en 3389 (RDP) wil je
          nooit zomaar open naar het internet hebben staan; die worden volop aangevallen.</p>
        </div>

        <p>Een dienst "luistert" op een poort (hij staat open en wacht op verbindingen). Een <em>poortscan</em>
        (bijvoorbeeld met Nmap) kijkt welke poorten openstaan en verraadt zo welke diensten er draaien. Dat is vaak de
        eerste stap van een aanvaller &mdash; en dus ook van een verdediger die wil weten wat er blootstaat.</p>
      `,
      questions: [
        {
          q: 'Welke TCP-poort gebruikt HTTPS standaard?',
          answer: ['443'],
          hint: 'Kijk in de tabel; het is de versleutelde versie van HTTP.',
          explain: 'HTTPS is HTTP over TLS en gebruikt standaard poort 443.',
        },
        {
          q: 'Welke poort hoort standaard bij RDP (Windows Remote Desktop)?',
          options: ['3306', '3389', '445'],
          answer: 1,
          explain: 'RDP gebruikt poort 3389. 3306 is MySQL en 445 is SMB.',
        },
      ],
    },

    {
      title: 'Taak 6 — DHCP, ARP en NAT',
      content: `
        <p>Drie protocollen die onzichtbaar hun werk doen, maar die je thuisnetwerk laten functioneren. Je komt ze
        gegarandeerd tegen.</p>

        <h3>DHCP: automatisch een IP-adres krijgen</h3>
        <p>Als je een apparaat op een netwerk aansluit, krijgt het meestal vanzelf een IP-adres. Dat regelt
        <strong>DHCP (Dynamic Host Configuration Protocol)</strong>. Het verloopt in vier stappen, te onthouden als
        <strong>DORA</strong>:</p>
        <ol>
          <li><strong>Discover</strong>: de client roept over het netwerk "is hier een DHCP-server?"</li>
          <li><strong>Offer</strong>: een server biedt een vrij IP-adres aan.</li>
          <li><strong>Request</strong>: de client zegt "dat adres wil ik graag".</li>
          <li><strong>Acknowledge</strong>: de server bevestigt en geeft het adres (met looptijd, de lease).</li>
        </ol>
        <p>DHCP gebruikt UDP: de server luistert op poort 67, de client op poort 68.</p>

        <h3>ARP: van IP-adres naar MAC-adres</h3>
        <p>Binnen een netwerk praten apparaten met MAC-adressen, maar je kent vaak alleen het IP-adres. <strong>ARP
        (Address Resolution Protocol)</strong> overbrugt dat. Wil je naar <code>192.168.1.1</code>, dan stuurt je
        apparaat een ARP-verzoek rond: "wie heeft 192.168.1.1?" Het apparaat met dat IP-adres antwoordt met zijn
        MAC-adres. Dat koppelt het logische adres (IP) aan het fysieke adres (MAC). Let op: ARP is van zichzelf
        onbeveiligd, waardoor <em>ARP-spoofing</em> (je voordoen als een ander) een bekende aanval is.</p>

        <h3>NAT: veel apparaten, één publiek adres</h3>
        <p>Er zijn te weinig IPv4-adressen voor alle apparaten. De oplossing is <strong>NAT (Network Address
        Translation)</strong>. Je router geeft elk apparaat een privé-IP-adres (zoals <code>192.168.1.x</code>) en
        vertaalt dat naar één gedeeld publiek adres zodra verkeer naar het internet gaat. De router onthoudt welk
        intern apparaat bij welke verbinding hoort, zodat antwoorden bij de juiste terugkomen. Zo delen al je apparaten
        thuis één publiek IP-adres. NAT geeft ook een beetje afscherming: van buitenaf zie je de interne apparaten niet
        direct.</p>

        <div class="callout tip">
          <p><strong>Snelle samenvatting:</strong> DHCP <em>geeft</em> je een IP-adres, ARP <em>vertaalt</em> een
          IP-adres naar een MAC-adres, en NAT <em>verbergt</em> je privé-adressen achter één publiek adres.</p>
        </div>
      `,
      questions: [
        {
          q: 'Welk protocol vertaalt binnen een netwerk een IP-adres naar het bijbehorende MAC-adres?',
          options: ['DNS', 'ARP', 'DHCP'],
          answer: 1,
          explain: 'ARP (Address Resolution Protocol) koppelt een IP-adres aan een MAC-adres binnen het netwerk.',
        },
        {
          q: 'Welke techniek laat veel apparaten met een privé-IP-adres via één gedeeld publiek IP-adres het internet op?',
          answer: ['NAT', 'network address translation'],
          hint: 'Afkorting van drie letters: Network Address ...',
          explain: 'NAT (Network Address Translation) vertaalt privé-adressen naar één publiek adres.',
        },
      ],
    },

    {
      title: 'Taak 7 — Lab: verken je netwerk',
      content: `
        <p>Tijd om de theorie te zien in echte commando\'s. Hieronder staat een Linux-terminal. Typ de volgende
        commando\'s precies zoals hier staat (elk gevolgd door Enter) en lees de uitvoer aandachtig &mdash; de
        antwoorden op de vragen staan er letterlijk in.</p>

        <ol>
          <li><code>ip a</code> &mdash; toont de netwerkkaarten met hun IP- en MAC-adres. Zoek bij <code>eth0</code>
            naar de regel die begint met <code>inet</code> (dat is het IPv4-adres) en <code>link/ether</code> (dat is
            het MAC-adres).</li>
          <li><code>ping -c 4 jvt.lab</code> &mdash; stuurt vier testpakketjes naar een server en meet de reactietijd.</li>
          <li><code>arp -a</code> &mdash; toont de ARP-tabel: welk IP-adres hoort bij welk MAC-adres in je netwerk,
            inclusief je <em>gateway</em> (de router).</li>
          <li><code>ss -tuln</code> &mdash; toont welke poorten op deze machine <em>luisteren</em> (openstaan).</li>
          <li><code>traceroute jvt.lab</code> &mdash; toont de route (de "hops") die je pakketjes afleggen naar de
            server. Lees elke hop; ergens onderweg is een vlag verstopt in een hostnaam.</li>
        </ol>

        <div class="callout tip">
          <p><strong>Tip:</strong> in <code>ss -tuln</code> staat per regel het lokale adres met de poort erachter
          (bijvoorbeeld <code>0.0.0.0:22</code>). Het nummer na de dubbele punt is de poort. Vergelijk dat met de
          poortentabel uit de vorige taak.</p>
        </div>

        <p>Zie je niet meteen wat je zoekt? Scroll rustig door de uitvoer. In een lab kun je zo vaak typen als je wilt.</p>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'student',
        host: 'jvt-lab',
        home: '/home/student',
        cwd: '/home/student',
        motd: 'Netwerk-lab. Typ: ip a | ping -c 4 jvt.lab | arp -a | ss -tuln | traceroute jvt.lab',
        commands: {
          'ip a': `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:a3:1f:6b brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.42/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86309sec preferred_lft 86309sec
    inet6 fe80::5054:ff:fea3:1f6b/64 scope link
       valid_lft forever preferred_lft forever`,
          'ping -c 4 jvt.lab': `PING jvt.lab (10.10.20.1) 56(84) bytes of data.
64 bytes from 10.10.20.1: icmp_seq=1 ttl=63 time=11.8 ms
64 bytes from 10.10.20.1: icmp_seq=2 ttl=63 time=12.1 ms
64 bytes from 10.10.20.1: icmp_seq=3 ttl=63 time=11.9 ms
64 bytes from 10.10.20.1: icmp_seq=4 ttl=63 time=12.0 ms

--- jvt.lab ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3005ms
rtt min/avg/max/mdev = 11.802/11.950/12.100/0.112 ms`,
          'arp -a': `gateway (192.168.1.1) at aa:bb:cc:11:22:33 [ether] on eth0
printer.jvt.lab (192.168.1.50) at de:ad:be:ef:00:21 [ether] on eth0
nas.jvt.lab (192.168.1.60) at de:ad:be:ef:00:3c [ether] on eth0`,
          'ss -tuln': `Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process
udp    UNCONN  0       0            0.0.0.0:68           0.0.0.0:*
udp    UNCONN  0       0      127.0.0.53%lo:53           0.0.0.0:*
tcp    LISTEN  0       128          0.0.0.0:22           0.0.0.0:*
tcp    LISTEN  0       128        127.0.0.1:631          0.0.0.0:*
tcp    LISTEN  0       511          0.0.0.0:80           0.0.0.0:*`,
          'traceroute jvt.lab': `traceroute to jvt.lab (10.10.20.1), 30 hops max, 60 byte packets
 1  gateway (192.168.1.1)  0.482 ms  0.451 ms  0.603 ms
 2  10.0.0.1 (10.0.0.1)  4.112 ms  4.087 ms  4.201 ms
 3  core-rtr.jvt.lab (10.10.0.1)  8.774 ms  8.690 ms  8.812 ms
 4  JVT{netwerk_verkend}.hop.jvt.lab (10.10.20.254)  11.902 ms  11.880 ms  12.004 ms
 5  jvt.lab (10.10.20.1)  12.110 ms  12.201 ms  12.088 ms`,
        },
      },
      questions: [
        {
          q: 'Welk IPv4-adres heeft deze machine op eth0? (zie ip a)',
          answer: ['192.168.1.42'],
          hint: 'Kijk bij eth0 naar de regel die met inet begint.',
          explain: 'Bij eth0 staat inet 192.168.1.42/24; dat is het IPv4-adres van deze machine.',
        },
        {
          q: 'Wat is het MAC-adres van de gateway (de router)? (zie arp -a)',
          answer: ['aa:bb:cc:11:22:33'],
          hint: 'De gateway staat als eerste in de ARP-tabel, achter "at".',
          explain: 'In arp -a staat: gateway (192.168.1.1) at aa:bb:cc:11:22:33.',
        },
        {
          q: 'Op welke TCP-poort luistert de SSH-server volgens ss -tuln?',
          answer: ['22'],
          hint: 'Zoek de tcp LISTEN-regel met de poort die bij SSH hoort.',
          explain: 'De regel tcp LISTEN 0.0.0.0:22 laat zien dat SSH op poort 22 luistert.',
        },
        {
          q: 'Welke vlag is verstopt in de uitvoer van traceroute jvt.lab?',
          answer: ['JVT{netwerk_verkend}'],
          hint: 'Kijk goed naar de hostnaam bij hop 4.',
          explain: 'Bij hop 4 staat de hostnaam JVT{netwerk_verkend}.hop.jvt.lab; dat is de vlag.',
        },
      ],
    },
  ],
  terms: [
    { term: 'LAN', def: 'Local Area Network: een netwerk op één locatie, zoals thuis of op kantoor.' },
    { term: 'WAN', def: 'Wide Area Network: een netwerk over grote afstanden; het internet is het grootste WAN.' },
    { term: 'Switch', def: 'Apparaat dat apparaten binnen één netwerk verbindt en verkeer stuurt op basis van MAC-adressen.' },
    { term: 'Router', def: 'Apparaat dat verschillende netwerken verbindt en verkeer routeert op basis van IP-adressen.' },
    { term: 'MAC-adres', def: 'Fysiek, vast adres (48 bits) van een netwerkkaart, gebruikt binnen één netwerk.' },
    { term: 'IP-adres', def: 'Logisch adres van een apparaat in een netwerk. IPv4 is 32 bits, IPv6 is 128 bits.' },
    { term: 'OSI-model', def: 'Model met zeven lagen (fysiek, datalink, netwerk, transport, sessie, presentatie, applicatie) om netwerken te beschrijven.' },
    { term: 'Encapsulatie', def: 'Het laag voor laag inpakken van data; het heet dan segment (L4), pakket (L3), frame (L2) en bits (L1).' },
    { term: 'TCP', def: 'Verbindingsgericht, betrouwbaar transportprotocol dat een three-way handshake gebruikt.' },
    { term: 'UDP', def: 'Verbindingsloos, snel transportprotocol zonder handshake of leveringsgarantie.' },
    { term: 'Poort', def: 'Nummer (0-65535) dat aangeeft bij welke dienst op een apparaat het verkeer hoort.' },
    { term: 'DHCP', def: 'Protocol dat apparaten automatisch een IP-adres geeft, in vier stappen: Discover, Offer, Request, Acknowledge (DORA).' },
    { term: 'ARP', def: 'Address Resolution Protocol: vertaalt binnen een netwerk een IP-adres naar een MAC-adres.' },
    { term: 'NAT', def: 'Network Address Translation: vertaalt privé-IP-adressen naar één gedeeld publiek IP-adres.' },
  ],
  resources: [
    { title: 'Cloudflare Learning Center', url: 'https://www.cloudflare.com/learning/' },
    { title: 'TryHackMe', url: 'https://tryhackme.com/' },
    { title: 'NCSC (Nationaal Cyber Security Centrum)', url: 'https://www.ncsc.nl/' },
  ],
});
