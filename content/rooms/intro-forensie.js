/* Room: Introductie digitale forensie & opsporing */
CS.registerRoom({
  id: 'intro-forensie',
  path: 'forensie',
  order: 1,
  title: 'Digitaal rechercheur worden',
  icon: '🕵️',
  difficulty: 'Makkelijk',
  minutes: 55,
  summary: 'Wat digitale forensie is, wat een digitaal rechercheur doet, hoe het onderzoeksproces werkt en welke regels (en ethiek) in Nederland gelden. De start van je weg naar de opsporing.',
  objectives: [
    'Uitleggen wat digitale forensie (DFIR) is en waar het wordt gebruikt',
    'Het forensische proces benoemen: veiligstellen, onderzoeken, analyseren, rapporteren',
    'Het principe van Locard vertalen naar digitale sporen',
    'De belangrijkste soorten digitaal bewijs herkennen',
    'De rol van de digitaal rechercheur in Nederland schetsen (Politie, NFI, OM)',
    'De kernregels en ethiek van bewijs begrijpen: integriteit, objectiviteit, toestemming',
  ],
  terms: [
    { term: 'Digitale forensie', def: 'Het wetenschappelijk veiligstellen, onderzoeken en interpreteren van digitaal bewijs, zodat het in een rechtszaak standhoudt.' },
    { term: 'DFIR', def: 'Digital Forensics & Incident Response: forensisch onderzoek gecombineerd met het reageren op incidenten.' },
    { term: 'Digitaal rechercheur', def: 'Opsporingsambtenaar die digitale sporen vindt, veiligstelt, leesbaar maakt en analyseert ten behoeve van een strafzaak.' },
    { term: 'Principe van Locard', def: 'Bij elk contact blijft een spoor achter ("every contact leaves a trace"). Digitaal: elke handeling laat log-, bestands- of geheugensporen na.' },
    { term: 'Digitaal bewijs', def: 'Elke informatie met bewijswaarde die op een digitaal apparaat is opgeslagen of verzonden.' },
    { term: 'Chain of custody', def: 'De bewijsketen: een sluitende administratie van wie het bewijs wanneer heeft vastgelegd, verplaatst en onderzocht.' },
    { term: 'Integriteit (van bewijs)', def: 'De garantie dat het bewijs niet is gewijzigd sinds het veiligstellen — bewezen met hashwaarden.' },
    { term: 'NFI', def: 'Nederlands Forensisch Instituut: voert (ook digitaal) forensisch onderzoek uit voor politie en justitie.' },
    { term: 'OM', def: 'Openbaar Ministerie: de officier van justitie leidt het opsporingsonderzoek en geeft bevelen/machtigingen.' },
    { term: 'Rechter-commissaris (RC)', def: 'Rechter die vooraf toetst of ingrijpende opsporingsbevoegdheden (zoals een doorzoeking) zijn toegestaan.' },
    { term: 'Reproduceerbaarheid', def: 'Een andere deskundige moet met dezelfde methode op hetzelfde bewijs tot dezelfde conclusie komen.' },
  ],
  resources: [
    { title: 'Politie — digitaal politiewerk & vacatures', url: 'https://kombijde.politie.nl/' },
    { title: 'Politieacademie — opleidingen', url: 'https://www.politieacademie.nl/' },
    { title: 'Nederlands Forensisch Instituut (NFI)', url: 'https://www.forensischinstituut.nl/' },
    { title: 'Forensic Focus — nieuws, artikelen & oefenmateriaal', url: 'https://www.forensicfocus.com/' },
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is digitale forensie?',
      content: `
        <p><strong>Digitale forensie</strong> is het vak van digitale sporen: ze vinden, veiligstellen, leesbaar maken, analyseren en zó documenteren dat ze bewijs kunnen zijn in een onderzoek of rechtszaak. Waar een klassieke rechercheur vingerafdrukken en vezels onderzoekt, onderzoek jij schijven, telefoons, geheugendumps, netwerkverkeer en logbestanden.</p>
        <p>Het komt overal voor: een telefoon in een drugszaak, een gehackt bedrijf dat wil weten wat er is buitgemaakt, fraude met valse facturen, of het reconstrueren van wie wanneer welk bestand opende. Vaak hoor je de combinatie <strong>DFIR</strong>: <em>Digital Forensics &amp; Incident Response</em> — forensisch onderzoek plus het reageren op en opruimen van incidenten.</p>
        <div class="callout info"><strong>Het verschil met "gewoon" IT-werk:</strong> een systeembeheerder wil een probleem zo snel mogelijk oplossen. Een forensisch onderzoeker wil juist <em>niets veranderen</em> en alles kunnen bewijzen. Zorgvuldigheid en documentatie gaan vóór snelheid.</div>
        <h3>Het principe van Locard, digitaal</h3>
        <p>De forensische grondregel komt van Edmond Locard: <em>"bij elk contact blijft een spoor achter."</em> Een inbreker neemt iets mee en laat iets achter. Digitaal geldt precies hetzelfde: wie een bestand opent, een USB-stick insteekt, inlogt of een programma draait, laat sporen na — in logs, in de registry, in het bestandssysteem, in het geheugen. Jouw werk is die sporen vinden en hun betekenis aantonen.</p>
        <p>En net als bij fysiek bewijs geldt: hoe langer je wacht of hoe onzorgvuldiger je werkt, hoe meer sporen vervagen of vervuild raken. Een uitgezet apparaat verliest zijn geheugen; een draaiend systeem overschrijft verwijderde data. Timing en zorgvuldigheid zijn alles.</p>
      `,
      questions: [
        { q: 'Waar staat DFIR voor?', answer: ['digital forensics & incident response', 'digital forensics and incident response', 'digital forensics en incident response'], hint: 'Forensisch onderzoek + reageren op incidenten.', explain: 'DFIR = Digital Forensics & Incident Response.' },
        { q: 'Het principe van Locard zegt, vertaald naar digitaal onderzoek, dat...', options: ['bewijs altijd versleuteld is', 'elke digitale handeling sporen achterlaat', 'je nooit iets kunt bewijzen', 'alleen hackers sporen achterlaten'], answer: 1, explain: 'Elk contact laat een spoor na — digitaal zijn dat logs, bestands-, registry- en geheugensporen.' },
        { q: 'Wat is het grootste verschil tussen een beheerder en een forensisch onderzoeker bij een incident?', options: ['De beheerder wil snel herstellen, de onderzoeker wil niets veranderen en alles kunnen bewijzen', 'Er is geen verschil', 'De onderzoeker werkt sneller', 'De beheerder gebruikt betere tools'], answer: 0, explain: 'Forensiek draait om onveranderlijkheid en bewijsbaarheid, niet om snel herstellen.' },
      ],
    },
    {
      title: 'Taak 2 — Het forensische proces',
      content: `
        <p>Forensisch onderzoek is geen "rondklikken tot je iets vindt", maar een gestructureerd proces. De Amerikaanse standaard <strong>NIST SP 800-86</strong> beschrijft vier kernfasen die wereldwijd worden gebruikt:</p>
        <table>
          <thead><tr><th>Fase</th><th>Wat je doet</th></tr></thead>
          <tbody>
            <tr><td><strong>1. Verzamelen</strong> (Collection)</td><td>Bewijs identificeren, labelen, vastleggen en veiligstellen — met behoud van integriteit (hashen!).</td></tr>
            <tr><td><strong>2. Onderzoeken</strong> (Examination)</td><td>Met forensische tools de relevante data uit de berg bits halen, zonder het origineel te wijzigen.</td></tr>
            <tr><td><strong>3. Analyseren</strong> (Analysis)</td><td>De bevindingen interpreteren: wat betekenen ze, wie deed wat, wanneer? Een tijdlijn bouwen.</td></tr>
            <tr><td><strong>4. Rapporteren</strong> (Reporting)</td><td>Je methode en conclusies vastleggen in een helder rapport dat een ander kan controleren.</td></tr>
          </tbody>
        </table>
        <p>Rondom die fasen staan nog twee cruciale begrippen die in de volgende room centraal staan: <strong>identificeren &amp; veiligstellen</strong> (wat is relevant en hoe leg ik het onveranderd vast) en de <strong>chain of custody</strong> (de bewijsketen).</p>
        <div class="callout tip"><strong>Onthoud het verschil feit vs. interpretatie.</strong> "Op 3 oktober om 22:14 is bestand X geopend" is een <em>feit</em>. "De verdachte heeft X geopend" is een <em>interpretatie</em> — misschien stond de pc open, of deed een ander het. Een goed onderzoeker houdt die twee streng gescheiden, ook in het rapport.</div>
        <h3>Drie kwaliteitseisen</h3>
        <p>Bewijs dat standhoudt voldoet aan drie eisen (uit o.a. de norm ISO/IEC 27037): het is <strong>controleerbaar</strong> (elke stap is te volgen), <strong>herhaalbaar</strong> (zelfde methode, zelfde data, zelfde resultaat) en <strong>reproduceerbaar</strong> (een ándere onderzoeker komt tot dezelfde uitkomst). Vandaar dat je álles documenteert.</p>
      `,
      questions: [
        { q: 'Noem de vier fasen van NIST SP 800-86 (het werkwoord is genoeg). De eerste fase is...', answer: ['verzamelen', 'collection', 'veiligstellen'], hint: 'Je begint met het bewijs vastleggen en de integriteit bewaren.', explain: 'De vier fasen zijn Verzamelen, Onderzoeken, Analyseren, Rapporteren.' },
        { q: '"Bestand X is om 22:14 geopend" is een feit. "De verdachte opende X" is een...', answer: ['interpretatie', 'conclusie', 'aanname'], hint: 'Het gaat verder dan wat de data letterlijk zegt.', explain: 'Dat is interpretatie — scheid feiten streng van interpretaties.' },
        { q: 'Een collega moet met dezelfde methode op hetzelfde bewijs tot dezelfde conclusie komen. Deze eis heet:', options: ['snelheid', 'reproduceerbaarheid', 'vertrouwelijkheid', 'automatisering'], answer: 1, explain: 'Reproduceerbaarheid — een kernpijler van forensisch bewijs.' },
        { q: 'Ik snap dat documentatie en onveranderlijkheid belangrijker zijn dan snelheid.', noAnswer: true },
      ],
    },
    {
      title: 'Taak 3 — Soorten digitaal bewijs',
      content: `
        <p>Als digitaal rechercheur werk je met heel verschillende bronnen. Elk vraagt zijn eigen techniek (die je in de volgende rooms leert):</p>
        <ul>
          <li><strong>Schijf / opslag</strong> — harde schijven, SSD's, USB-sticks, geheugenkaarten. Bestanden, verwijderde bestanden, metadata. (Room: schijf- &amp; bestandssysteemforensie.)</li>
          <li><strong>Werkgeheugen (RAM)</strong> — draaiende processen, wachtwoorden, versleutelde data die even "open" staat, malware die alleen in geheugen leeft. Verdwijnt bij uitschakelen! (Room: geheugenforensie.)</li>
          <li><strong>Netwerk</strong> — verkeer (pcap), wie praatte met wie, data-exfiltratie, verbindingen met kwaadaardige servers. (Room: netwerkforensie.)</li>
          <li><strong>Mobiel &amp; cloud</strong> — telefoons (berichten, locatie, apps) en data bij providers. (Room: mobiel- &amp; cloud-forensie.)</li>
          <li><strong>Logs &amp; artefacten</strong> — systeemlogs, Windows-registry, prefetch, browsergeschiedenis. (Rooms: logs &amp; detectie, Windows-artefacten.)</li>
          <li><strong>Open bronnen (OSINT)</strong> — alles wat openbaar te vinden is over een persoon, account of locatie. (Room: OSINT &amp; opsporing.)</li>
        </ul>
        <div class="callout warn"><strong>Volgorde telt:</strong> sommig bewijs is vluchtig (RAM, netwerkverbindingen) en verdwijnt zodra je een stekker eruit trekt; ander bewijs (een schijf) blijft stabiel. Je stelt het <em>vluchtigste</em> altijd eerst veilig. Dit heet de <em>order of volatility</em> — meer daarover in de volgende room.</div>
      `,
      questions: [
        { q: 'Welk type bewijs verdwijnt zodra je het apparaat uitzet?', options: ['De harde schijf', 'Het werkgeheugen (RAM)', 'Een USB-stick', 'Een logbestand op schijf'], answer: 1, explain: 'RAM is vluchtig: inhoud gaat verloren bij uitschakelen. Daarom eerst veiligstellen.' },
        { q: 'Een bestand met netwerkverkeer dat je kunt analyseren heet een ... -bestand.', answer: ['pcap', 'pcap-bestand', '.pcap'], hint: 'Packet capture.', explain: 'Een pcap (packet capture) legt netwerkverkeer vast.' },
        { q: 'Onderzoek met uitsluitend openbaar beschikbare bronnen heet:', answer: ['osint', 'open source intelligence'], hint: 'Open bronnen.', explain: 'OSINT = Open Source Intelligence.' },
      ],
    },
    {
      title: 'Taak 4 — De digitaal rechercheur in Nederland',
      content: `
        <p>Jouw doel: digitaal rechercheur. Hoe ziet dat er in Nederland uit? Je werkt digitale sporen op computers, telefoons, camera's of navigatieapparatuur om bewijs te verzamelen of een dader te traceren. Je verzamelt, stelt veilig, maakt leesbaar en analyseert digitale data — en je vertaalt je bevindingen naar een proces-verbaal dat in de rechtszaal standhoudt.</p>
        <h3>Waar werk je?</h3>
        <ul>
          <li><strong>Politie — Team Cybercrime / digitale opsporing.</strong> Rechercheurs en specialisten die digitaal bewijs veiligstellen en onderzoeken. Er bestaan functies van <em>junior digitaal rechercheur</em> tot senior/tactisch.</li>
          <li><strong>Nederlands Forensisch Instituut (NFI).</strong> Voert het zwaardere, specialistische forensische onderzoek uit voor politie en justitie — ook op gekraakte telefoons en complexe datasets.</li>
          <li><strong>Openbaar Ministerie (OM).</strong> De officier van justitie leidt het opsporingsonderzoek en geeft bevelen; bij ingrijpende bevoegdheden toetst de <strong>rechter-commissaris</strong> vooraf.</li>
          <li>Daarnaast: bedrijfsleven (incident response, e-discovery), defensie en inlichtingendiensten.</li>
        </ul>
        <h3>Hoe word je het?</h3>
        <p>Bij de politie volg je een interne opleiding via de <strong>Politieacademie</strong>: eerst de algemene opsporings- en politiebekwaamheid (je krijgt dan opsporingsbevoegdheid), daarna de specialisatie forensisch/digitaal opsporen. Wat je nú in dit portaal leert — netwerken, Linux, Windows, logs, forensische technieken — is precies de technische basis waarop zulke opleidingen voortbouwen. "Leren door te doen" is hier geen cliché maar de kortste weg.</p>
        <div class="callout tip"><strong>Tip voor je pad:</strong> bouw een thuislab (een paar virtuele machines), speel gratis forensische CTF's (zie de bronnen-room), en houd write-ups bij van wat je oplost. Dat portfolio laat zien dat je het echt kúnt.</div>
      `,
      questions: [
        { q: 'Welk instituut doet in Nederland het specialistische forensische onderzoek voor politie en justitie?', answer: ['nfi', 'nederlands forensisch instituut', 'het nfi'], hint: 'Afkorting van drie letters.', explain: 'Het NFI (Nederlands Forensisch Instituut).' },
        { q: 'Wie leidt in Nederland het opsporingsonderzoek en geeft bevelen?', options: ['De systeembeheerder', 'De officier van justitie (OM)', 'De journalist', 'De verdachte'], answer: 1, explain: 'De officier van justitie (OM) leidt het onderzoek; de rechter-commissaris toetst zware bevoegdheden vooraf.' },
        { q: 'Via welke instelling loopt de politie-opleiding tot (digitaal) rechercheur?', answer: ['politieacademie', 'de politieacademie'], hint: 'Eén woord.', explain: 'De Politieacademie verzorgt de opleidingen.' },
      ],
    },
    {
      title: 'Taak 5 — Recht en ethiek: de grenzen van je werk',
      content: `
        <p>Een digitaal rechercheur heeft krachtige middelen. Juist daarom is de wet streng. Een paar hoofdlijnen voor Nederland (dit is een vereenvoudigde schets — de exacte regels staan in het Wetboek van Strafvordering en veranderen; raadpleeg altijd de actuele bron en je opleiding):</p>
        <ul>
          <li><strong>Bevoegdheid en bevel.</strong> Opsporingshandelingen mogen alleen door daartoe bevoegde ambtenaren, binnen de grenzen van een bevel of machtiging. Gegevensdragers kunnen in beslag worden genomen; onderzoek aan bijvoorbeeld een smartphone kan een machtiging vereisen.</li>
          <li><strong>Proportionaliteit &amp; subsidiariteit.</strong> Het middel moet in verhouding staan tot het doel (proportioneel), en als het met een lichter middel kan, gebruik je dat (subsidiair).</li>
          <li><strong>Zware bevoegdheden worden getoetst.</strong> Ingrijpende handelingen (zoals het binnendringen in een geautomatiseerd werk — de "hackbevoegdheid" uit de Wet Computercriminaliteit III) gelden alleen bij ernstige misdrijven en met voorafgaande toetsing door de rechter-commissaris.</li>
          <li><strong>Privacy &amp; AVG.</strong> Je raakt persoonsgegevens; dataminimalisatie en doelbinding gelden ook hier.</li>
        </ul>
        <div class="callout danger"><strong>Ethiek is geen bijzaak.</strong> Je zoekt de waarheid, niet een veroordeling. Dat betekent: ook ontlastend bewijs melden, objectief blijven, geen bewijs "mooier maken", en nooit buiten je bevoegdheid gaan. Eén onzorgvuldige of onbevoegde stap kan bewijs onbruikbaar maken — en een zaak laten klappen.</div>
        <p>En voor je oefeningen geldt wat je al kent: technieken oefen je alleen in je eigen lab of met uitdrukkelijke toestemming. Ongeautoriseerd binnendringen blijft strafbaar (computervredebreuk, art. 138ab Sr), ook met goede bedoelingen.</p>
      `,
      questions: [
        { q: 'Een onderzoeksmiddel moet in verhouding staan tot het doel. Dit beginsel heet:', answer: ['proportionaliteit', 'proportionaliteitsbeginsel'], hint: 'Pro-...', explain: 'Proportionaliteit: zwaarte van het middel in verhouding tot het doel. Subsidiariteit: kies het lichtste middel dat werkt.' },
        { q: 'Je vindt bewijs dat de verdachte juist ONTLAST. Wat doe je?', options: ['Negeren, want je zoekt een veroordeling', 'Melden — je zoekt de waarheid, niet alleen belastend bewijs', 'Verwijderen', 'Alleen aan de verdediging geven buiten het dossier om'], answer: 1, explain: 'Objectiviteit: ook ontlastend bewijs hoort in het onderzoek. Je zoekt de waarheid.' },
        { q: 'Oefenen met aanvals-/onderzoekstechnieken op systemen van anderen mag...', options: ['altijd, als je het netjes doet', 'alleen in je eigen lab of met uitdrukkelijke toestemming', 'nooit', 'als je maar niets kapotmaakt'], answer: 1, explain: 'Alleen in je eigen lab of met toestemming — anders is het computervredebreuk (art. 138ab Sr).' },
      ],
    },
    {
      title: 'Taak 6 — Je eerste zaak: de bewijstafel',
      content: `
        <p>Genoeg theorie — tijd om te kijken. Je hebt een map met veiliggesteld bewijs gekregen van een fictieve zaak. In de terminal hieronder sta je in <code>/home/rechercheur</code>. Verken de bewijsmap en open de aanwijzingen.</p>
        <p>Probeer deze commando's (uit de Linux-room):</p>
        <ul>
          <li><code>ls</code> en <code>ls -a</code> — bekijk de bestanden (ook verborgen).</li>
          <li><code>cd zaak-2026-0042</code> en <code>ls -l</code> — ga de zaaksmap in.</li>
          <li><code>cat opdracht.txt</code> — lees de onderzoeksopdracht.</li>
          <li><code>cat zaaknotitie.txt</code> — de eerste aanwijzing bevat je eerste vlag.</li>
          <li><code>sha256sum bewijs.dd</code> — bereken de hash van het schijf-image (integriteit).</li>
        </ul>
        <div class="callout info"><strong>Waarom die hash?</strong> Door direct na het veiligstellen een hash te berekenen, kun je later altijd bewijzen dat het bewijs niet is veranderd. Dezelfde data geeft altijd dezelfde hash; één gewijzigde bit geeft een totaal andere. Dit is de kern van integriteit — de volgende room gaat er diep op in.</div>
      `,
      lab: {
        type: 'terminal',
        user: 'rechercheur', host: 'forensics-ws',
        home: '/home/rechercheur', cwd: '/home/rechercheur',
        motd: 'Forensisch werkstation — alleen veiliggestelde kopieën. Typ de commando\'s uit de opdracht.',
        fs: {
          '/home/rechercheur/zaak-2026-0042/opdracht.txt': 'ONDERZOEKSOPDRACHT zaak 2026-0042\n--------------------------------\nStel vast welke bestanden van de in beslag genomen laptop zijn gekopieerd naar een USB-stick,\nen op welk tijdstip. Werk uitsluitend op de kopie (bewijs.dd). Documenteer elke stap.\n',
          '/home/rechercheur/zaak-2026-0042/zaaknotitie.txt': 'Notitie rechercheur:\nImage veiliggesteld met write-blocker. Integriteit vastgelegd.\nEerste bevinding gelogd onder: JVT{eerste_zaak_geopend}\n',
          '/home/rechercheur/zaak-2026-0042/bewijs.dd': 'DIT IS EEN FICTIEF SCHIJF-IMAGE VOOR DE OEFENING. (in het echt zijn dit vele gigabytes rauwe data)\n',
          '/home/rechercheur/zaak-2026-0042/.verborgen-logboek.txt': 'Chain of custody:\n2026-10-03 09:12 veiliggesteld door rech. De Vries\n2026-10-03 10:40 gehasht en opgeborgen in kluis K-7\n',
          '/home/rechercheur/README.txt': 'Welkom, rechercheur. Je zaken staan in de mappen hieronder.\n',
        },
        denied: ['/root', '/etc/shadow'],
        commands: {
          'sha256sum bewijs.dd': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  bewijs.dd',
          'sha256sum zaak-2026-0042/bewijs.dd': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  zaak-2026-0042/bewijs.dd',
        },
      },
      questions: [
        { q: 'Welke vlag staat in zaaknotitie.txt?', answer: 'JVT{eerste_zaak_geopend}', hint: 'cd zaak-2026-0042 en cat zaaknotitie.txt', explain: 'Je eerste bevinding — netjes gevonden via ls en cat.' },
        { q: 'Hoe heet het bestand met de onderzoeksopdracht in de zaaksmap?', answer: ['opdracht.txt', 'opdracht'], hint: 'ls -l in zaak-2026-0042', explain: 'opdracht.txt beschrijft wat je moet uitzoeken.' },
        { q: 'Waarom bereken je meteen een hash (sha256sum) van het image?', options: ['Om het kleiner te maken', 'Om later te kunnen bewijzen dat het bewijs niet is gewijzigd', 'Om het te versleutelen', 'Dat is niet nodig'], answer: 1, explain: 'De hash legt de integriteit vast: je kunt later aantonen dat er niets is veranderd.' },
        { q: 'Ik heb mijn eerste zaak geopend en begrijp waarom integriteit en documentatie centraal staan.', noAnswer: true },
      ],
    },
  ],
});
