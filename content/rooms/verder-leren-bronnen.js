/* Room: Verder leren — boeken, tools, oefenplatforms & bronnen */
CS.registerRoom({
  id: 'verder-leren-bronnen',
  path: 'forensie',
  order: 11,
  title: 'Verder leren: boeken, tools & platforms',
  icon: '📚',
  difficulty: 'Makkelijk',
  minutes: 40,
  summary: 'Een gecureerde gids om snel verder te groeien: hoe je het effectiefst leert, de beste gratis oefenplatforms, de tools die elke onderzoeker kent, en echte literatuur en standaarden.',
  objectives: [
    'Een effectieve leerstrategie kiezen (oefenen, herhalen, write-ups, thuislab)',
    'Gratis platforms vinden om forensie en security te oefenen',
    'De standaard forensische tools en waar ze voor dienen herkennen',
    'Betrouwbare boeken, standaarden en bronnen kennen om op terug te vallen',
    'Een eigen leerplan richting digitaal rechercheur opstellen',
  ],
  terms: [
    { term: 'CTF', def: 'Capture The Flag: oefenuitdagingen waarin je vlaggen verzamelt door problemen op te lossen.' },
    { term: 'Write-up', def: 'Een verslag waarin je uitlegt hoe je een uitdaging oploste — uitleggen verankert kennis en bouwt je portfolio.' },
    { term: 'Thuislab', def: 'Een veilige oefenomgeving met virtuele machines waarin je alles mag proberen.' },
    { term: 'Deliberate practice', def: 'Doelgericht oefenen op de rand van je kunnen, met feedback — de snelste manier om te groeien.' },
    { term: 'Spaced repetition', def: 'Herhalen met groeiende tussenpozen, zodat kennis beter beklijft (zoals de Begrippentrainer).' },
    { term: 'Autopsy', def: 'Gratis grafische forensische suite (bovenop The Sleuth Kit) voor schijfonderzoek.' },
    { term: 'Volatility', def: 'De standaard open-source tool voor geheugenforensie (RAM-analyse).' },
    { term: 'Wireshark', def: 'De standaard tool om netwerkverkeer (pcap) te analyseren.' },
  ],
  resources: [
    { title: 'CyberDefenders — gratis blue team & DFIR labs', url: 'https://cyberdefenders.org/' },
    { title: 'Forensic Focus — DFIR practice directory & nieuws', url: 'https://www.forensicfocus.com/' },
    { title: 'Eric Zimmerman — forensische tools (gratis)', url: 'https://ericzimmerman.github.io/' },
    { title: 'DFIR Diva — gratis & betaalbare trainingen', url: 'https://training.dfirdiva.com/' },
  ],
  tasks: [
    {
      title: 'Taak 1 — Hoe je het snelst leert',
      content: `
        <p>Je leert het beste door te doen — en dat is precies de goede instelling voor dit vak. Een paar principes die je leertempo echt versnellen:</p>
        <ul>
          <li><strong>Oefen gericht (deliberate practice).</strong> Zoek uitdagingen net boven je niveau, krijg feedback, herhaal. Niet passief video's kijken, maar zelf typen en vastlopen.</li>
          <li><strong>Herhaal met tussenpozen (spaced repetition).</strong> Kennis die je niet herhaalt, zakt weg. Gebruik in dit portaal de <strong>🎯 Oefenarena</strong> (willekeurige vragen uit alle lessen) en de <strong>🃏 Begrippentrainer</strong> (flashcards) — een paar minuten per dag doet wonderen.</li>
          <li><strong>Bouw een thuislab.</strong> Installeer VirtualBox of VMware, draai een Linux-VM (bv. een forensische distributie) en een kwetsbare oefenmachine. In je eigen lab mag alles.</li>
          <li><strong>Schrijf write-ups.</strong> Leg na elke opgeloste uitdaging uit hóe je het deed. Uitleggen dwingt je het echt te begrijpen — en bouwt een portfolio dat werkgevers (zoals de politie) overtuigt.</li>
          <li><strong>Leer de fundamenten grondig.</strong> Netwerken, Linux, Windows en logs (de eerste leerpaden) zijn de bodem onder alle forensie. Sla ze niet over.</li>
        </ul>
        <div class="callout tip"><strong>Ritme-tip:</strong> wissel af. Doe een nieuwe les, los daarna een CTF-uitdaging op over hetzelfde onderwerp, en sluit af met 5 minuten Oefenarena. Nieuw leren + toepassen + herhalen in één sessie laat kennis plakken.</div>
      `,
      questions: [
        { q: 'Welke combinatie laat kennis het best beklijven?', options: ['Alleen video\'s kijken', 'Nieuw leren + zelf toepassen + herhalen met tussenpozen', 'Eén keer alles doorlezen', 'Alleen de antwoorden uit je hoofd leren'], answer: 1, explain: 'Deliberate practice + spaced repetition: leren, toepassen, herhalen.' },
        { q: 'Waarom zijn write-ups zo waardevol?', options: ['Ze zijn verplicht', 'Uitleggen verankert kennis en bouwt een portfolio', 'Ze maken je sneller', 'Dat zijn ze niet'], answer: 1, explain: 'Door uit te leggen begrijp je het echt, en je laat zien wat je kunt.' },
        { q: 'Ik ga de Oefenarena en Begrippentrainer gebruiken om te herhalen.', noAnswer: true },
      ],
    },
    {
      title: 'Taak 2 — Gratis oefenplatforms & CTF\'s',
      content: `
        <p>Niets leert sneller dan echte zaken oplossen. Deze platforms bieden veilige, legale oefenstof — veel ervan gratis of met een gratis laag. (Links openen in een nieuw tabblad.)</p>
        <h3>Forensie & blue team (DFIR)</h3>
        <ul>
          <li><a href="https://cyberdefenders.org/" target="_blank" rel="noopener">CyberDefenders</a> — realistische DFIR-/SOC-uitdagingen met echte bewijsbestanden en tools; beginnersvriendelijk, met walkthroughs.</li>
          <li><a href="https://blueteamlabs.online/" target="_blank" rel="noopener">Blue Team Labs Online</a> — onderzoeks- en incidentscenario's voor verdedigers.</li>
          <li><a href="https://letsdefend.io/" target="_blank" rel="noopener">LetsDefend</a> — een nagebootst SOC waar je echte alerts onderzoekt.</li>
          <li><a href="https://www.hackthebox.com/" target="_blank" rel="noopener">Hack The Box</a> — zie de "Sherlocks" voor DFIR-onderzoeken.</li>
          <li><a href="https://dfirmadness.com/" target="_blank" rel="noopener">DFIR Madness</a> — een complete voorbeeldzaak met dataset om op te oefenen.</li>
          <li><a href="https://www.magnetforensics.com/" target="_blank" rel="noopener">Magnet Forensics</a> — organiseert terugkerende gratis forensische CTF's.</li>
        </ul>
        <h3>Breed (red + blue + fundamenten)</h3>
        <ul>
          <li><a href="https://tryhackme.com/" target="_blank" rel="noopener">TryHackMe</a> — begeleide leerpaden, ook een DFIR-module. Ideaal naast dit portaal.</li>
          <li><a href="https://overthewire.org/wargames/bandit/" target="_blank" rel="noopener">OverTheWire: Bandit</a> — de klassieke manier om de Linux-terminal in de vingers te krijgen.</li>
          <li><a href="https://picoctf.org/" target="_blank" rel="noopener">picoCTF</a> — gratis CTF met veel beginnersuitdagingen (ook forensie en crypto).</li>
        </ul>
        <div class="callout info"><strong>Overzicht:</strong> de <a href="https://www.forensicfocus.com/" target="_blank" rel="noopener">Forensic Focus</a> "DFIR practice directory" verzamelt datasets, labs en terugkerende CTF's. Een goudmijn om altijd nieuwe oefenstof te vinden.</div>
      `,
      questions: [
        { q: 'Welk platform draait om realistische DFIR-/SOC-onderzoeken met echte bewijsbestanden?', options: ['OverTheWire', 'CyberDefenders', 'Google', 'Wikipedia'], answer: 1, explain: 'CyberDefenders richt zich op blue team/DFIR met echte evidence en walkthroughs.' },
        { q: 'Waar oefen je het best je kale Linux-terminalvaardigheden?', answer: ['overthewire', 'bandit', 'overthewire bandit', 'over the wire'], hint: 'Een wargame die begint met "Bandit".', explain: 'OverTheWire: Bandit — dé klassieker voor terminalbasis.' },
        { q: 'Ik heb minstens één oefenplatform uitgekozen om te proberen.', noAnswer: true },
      ],
    },
    {
      title: 'Taak 3 — Tools die elke onderzoeker kent',
      content: `
        <p>Je hebt in dit portaal vereenvoudigde versies van deze tools gebruikt. Dit zijn de echte, die je in je thuislab kunt installeren (de meeste gratis/open-source):</p>
        <table>
          <thead><tr><th>Tool</th><th>Waarvoor</th></tr></thead>
          <tbody>
            <tr><td><a href="https://www.autopsy.com/" target="_blank" rel="noopener">Autopsy</a> / <a href="https://www.sleuthkit.org/" target="_blank" rel="noopener">The Sleuth Kit</a></td><td>Schijf- en bestandssysteemonderzoek (grafisch), file carving, tijdlijnen.</td></tr>
            <tr><td><a href="https://www.volatilityfoundation.org/" target="_blank" rel="noopener">Volatility 3</a></td><td>Geheugenforensie: processen, netwerkverbindingen, injectie in RAM.</td></tr>
            <tr><td><a href="https://www.wireshark.org/" target="_blank" rel="noopener">Wireshark</a></td><td>Netwerkforensie: pcap's lezen, streams volgen, bestanden uit verkeer halen.</td></tr>
            <tr><td><a href="https://ericzimmerman.github.io/" target="_blank" rel="noopener">Eric Zimmerman-tools</a></td><td>Windows-artefacten parsen (PECmd, AmcacheParser, SBECmd, MFTECmd, LECmd).</td></tr>
            <tr><td><a href="https://exiftool.org/" target="_blank" rel="noopener">ExifTool</a></td><td>Metadata (EXIF) uit foto's en documenten lezen — geweldig voor OSINT.</td></tr>
            <tr><td><a href="https://gchq.github.io/CyberChef/" target="_blank" rel="noopener">CyberChef</a></td><td>Coderen, decoderen, hashen — "the Cyber Swiss Army Knife".</td></tr>
            <tr><td><a href="https://virustotal.com/" target="_blank" rel="noopener">VirusTotal</a> / <a href="https://any.run/" target="_blank" rel="noopener">ANY.RUN</a></td><td>Verdachte bestanden/hashes opzoeken en in een sandbox draaien.</td></tr>
            <tr><td><a href="https://virustotal.github.io/yara/" target="_blank" rel="noopener">YARA</a></td><td>Patronen schrijven om malware/bestanden te herkennen.</td></tr>
          </tbody>
        </table>
        <div class="callout warn"><strong>Veilig oefenen:</strong> werk met échte malware alleen in een geïsoleerde VM met snapshots, nooit op je gewone computer. En bedenk: een verdacht bestand uploaden naar een online dienst kan de aanvaller waarschuwen — iets om in een echte zaak zorgvuldig af te wegen.</div>
      `,
      questions: [
        { q: 'Welke tool gebruik je voor geheugenforensie (RAM-analyse)?', options: ['Wireshark', 'Volatility', 'Autopsy', 'ExifTool'], answer: 1, explain: 'Volatility is de standaard voor RAM-analyse.' },
        { q: 'Met welke tool lees je metadata (EXIF, zoals GPS) uit een foto?', answer: ['exiftool', 'exif tool'], hint: 'De naam zegt het al.', explain: 'ExifTool leest en bewerkt metadata — top voor OSINT en fotoanalyse.' },
        { q: 'Welke tool is de standaard voor het analyseren van een pcap (netwerkverkeer)?', options: ['Volatility', 'Wireshark', 'YARA', 'Autopsy'], answer: 1, explain: 'Wireshark — netwerkverkeer lezen, streams volgen, objecten exporteren.' },
        { q: 'Waarom draai je echte malware alleen in een geïsoleerde VM?', options: ['Dat gaat sneller', 'Om je eigen systeem en netwerk niet te besmetten', 'Omdat het mooier oogt', 'Dat hoeft niet'], answer: 1, explain: 'Isolatie + snapshots voorkomen dat malware schade aanricht of ontsnapt.' },
      ],
    },
    {
      title: 'Taak 4 — Boeken & diepgaande literatuur',
      content: `
        <p>Wil je echt de diepte in, dan zijn dit gewaardeerde standaardwerken. (Zoek ze via je bibliotheek, de uitgever of een boekhandel — titels en auteurs staan hieronder.)</p>
        <ul>
          <li><strong>File System Forensic Analysis</strong> — Brian Carrier. Hét naslagwerk over hoe bestandssystemen (FAT, NTFS, ext) echt werken. Carrier is ook de maker van The Sleuth Kit/Autopsy.</li>
          <li><strong>The Art of Memory Forensics</strong> — Ligh, Case, Levy &amp; Walters. De bijbel van geheugenforensie, van de makers van Volatility.</li>
          <li><strong>Practical Forensic Imaging</strong> — Bruce Nikkel. Zorgvuldig bewijs veiligstellen met open-source tools.</li>
          <li><strong>Windows Forensic Analysis</strong> — Harlan Carvey. Diep in de Windows-artefacten die je in dit pad leerde.</li>
          <li><strong>Practical Mobile Forensics</strong> — Packt. iOS, Android en app-data onderzoeken.</li>
          <li><strong>Incident Response &amp; Computer Forensics</strong> — Luttgens, Pepe &amp; Mandia. Klassieker die forensie en incident response verbindt.</li>
          <li><strong>The Art of Digital Forensics</strong> — moderne, praktische workflows voor computer-, netwerk-, cloud- en IoT-onderzoek.</li>
        </ul>
        <div class="callout tip"><strong>Slim lezen:</strong> je hoeft zulke boeken niet van kaft tot kaft te verslinden. Gebruik ze als naslagwerk naast je oefeningen: loop je vast op NTFS of op een geheugenplugin, sla dan dát hoofdstuk op. Lezen + meteen toepassen beklijft het best.</div>
      `,
      questions: [
        { q: 'Welk boek is hét naslagwerk over bestandssystemen, van de maker van The Sleuth Kit?', answer: ['file system forensic analysis', 'file system forensic analysis - brian carrier', 'file system forensic analysis van brian carrier'], hint: 'Auteur: Brian Carrier.', explain: 'File System Forensic Analysis (Brian Carrier).' },
        { q: '"The Art of Memory Forensics" komt van de makers van welke tool?', options: ['Wireshark', 'Volatility', 'Autopsy', 'YARA'], answer: 1, explain: 'Het is geschreven door het Volatility-team — dé referentie voor geheugenforensie.' },
        { q: 'Ik heb minstens één boek genoteerd om later te raadplegen.', noAnswer: true },
      ],
    },
    {
      title: 'Taak 5 — Standaarden & betrouwbare bronnen',
      content: `
        <p>In een rechtszaak moet je werk aansluiten op erkende standaarden. Deze bronnen zijn gezaghebbend en gratis te raadplegen:</p>
        <ul>
          <li><a href="https://csrc.nist.gov/" target="_blank" rel="noopener">NIST (csrc.nist.gov)</a> — o.a. <strong>SP 800-86</strong> (forensische technieken in incident response) en <strong>SP 800-61</strong> (incident response). Het forensische proces dat je leerde.</li>
          <li><a href="https://www.iso.org/" target="_blank" rel="noopener">ISO/IEC 27037</a> — richtlijn voor het identificeren, verzamelen, verwerven en bewaren van digitaal bewijs.</li>
          <li><a href="https://www.ietf.org/rfc/rfc3227.txt" target="_blank" rel="noopener">RFC 3227</a> — guidelines voor evidence collection, met de order of volatility.</li>
          <li><a href="https://www.sans.org/" target="_blank" rel="noopener">SANS</a> — gratis DFIR-posters en cheat sheets (bv. Windows forensic analysis, hunt evil) zijn razendpopulair naslagmateriaal.</li>
          <li><a href="https://attack.mitre.org/" target="_blank" rel="noopener">MITRE ATT&CK</a> — kennisbank van aanvalstechnieken; helpt om sporen aan gedrag te koppelen.</li>
        </ul>
        <h3>Nederland</h3>
        <ul>
          <li><a href="https://www.forensischinstituut.nl/" target="_blank" rel="noopener">NFI</a> — het Nederlands Forensisch Instituut (ook publicaties en vakinformatie).</li>
          <li><a href="https://www.ncsc.nl/" target="_blank" rel="noopener">NCSC</a> — Nationaal Cyber Security Centrum: adviezen, dreigingsbeeld, meldingen.</li>
          <li><a href="https://kombijde.politie.nl/" target="_blank" rel="noopener">Politie</a> &amp; <a href="https://www.politieacademie.nl/" target="_blank" rel="noopener">Politieacademie</a> — vacatures en opleidingen richting digitaal rechercheur.</li>
          <li><a href="https://www.bellingcat.com/" target="_blank" rel="noopener">Bellingcat</a> &amp; <a href="https://osintframework.com/" target="_blank" rel="noopener">OSINT Framework</a> — voor open-bronnenonderzoek en verificatie.</li>
        </ul>
        <div class="callout info"><strong>Waarom standaarden kennen?</strong> Als je kunt zeggen "ik heb gewerkt volgens NIST SP 800-86 en ISO 27037", staat je methode niet ter discussie — alleen je bevindingen. Dat is precies wat je in een professioneel rapport wilt.</div>
      `,
      questions: [
        { q: 'Welke NIST-publicatie beschrijft het forensische proces (verzamelen, onderzoeken, analyseren, rapporteren)?', answer: ['sp 800-86', '800-86', 'nist sp 800-86', 'nist 800-86'], hint: 'SP 800-…', explain: 'NIST SP 800-86 — Guide to Integrating Forensic Techniques into Incident Response.' },
        { q: 'Welke kennisbank koppelt aanvalstechnieken aan gedrag en wordt veel gebruikt bij detectie?', options: ['MITRE ATT&CK', 'ISO 9001', 'RFC 1918', 'OWASP Top 10'], answer: 0, explain: 'MITRE ATT&CK — een naslagwerk van tactieken en technieken van aanvallers.' },
        { q: 'Waarom helpt het om volgens erkende standaarden te werken?', options: ['Het is sneller', 'Dan staat je methode niet ter discussie, alleen je bevindingen', 'Het is goedkoper', 'Dat helpt niet'], answer: 1, explain: 'Een erkende methode maakt je werk verdedigbaar in de rechtszaal.' },
      ],
    },
    {
      title: 'Taak 6 — Jouw leerplan richting digitaal rechercheur',
      content: `
        <p>Je hebt nu een complete basis plus een forensisch pad. Een realistische route van hier naar digitaal rechercheur:</p>
        <ol>
          <li><strong>Fundamenten stevig neerzetten.</strong> Netwerken, Linux, Windows, het web — herhaal ze tot ze zitten (Oefenarena!). Alles bouwt hierop.</li>
          <li><strong>Forensie oefenen met echte data.</strong> Werk de rooms in dit pad af en doe parallel CyberDefenders- en TryHackMe-DFIR-uitdagingen. Schrijf write-ups.</li>
          <li><strong>Thuislab uitbreiden.</strong> Installeer Autopsy, Volatility en Wireshark. Maak zelf een image van een oude USB-stick en onderzoek hem.</li>
          <li><strong>Specialiseren.</strong> Kies waar je energie van krijgt: schijf/Windows, geheugen, mobiel, netwerk of OSINT — en ga dáár de diepte in.</li>
          <li><strong>Richting het beroep.</strong> Volg vacatures bij <a href="https://kombijde.politie.nl/" target="_blank" rel="noopener">de politie</a> (ook "junior digitaal rechercheur"), kijk naar de opleidingen van de <a href="https://www.politieacademie.nl/" target="_blank" rel="noopener">Politieacademie</a>, en overweeg aanvullende certificering of een relevante opleiding.</li>
          <li><strong>Blijf ethisch en nieuwsgierig.</strong> Alleen oefenen in je eigen lab of met toestemming. Je vaardigheden zijn krachtig — gebruik ze om de waarheid te vinden.</li>
        </ol>
        <div class="callout tip"><strong>Volhouden wint.</strong> Niemand wordt in een maand digitaal rechercheur. Maar wie elke week een beetje doet — een les, een CTF, een write-up — komt er verrassend snel. Je bent al begonnen. 🕵️</div>
        <p>Veel succes op je weg naar de opsporing. Kom terug naar de <strong>Oefenarena</strong> en <strong>Begrippentrainer</strong> om alles scherp te houden, en pak elke nieuwe uitdaging aan als een echte zaak.</p>
      `,
      questions: [
        { q: 'Wat is de slimste eerste stap voordat je diep in forensie duikt?', options: ['Meteen de moeilijkste CTF doen', 'De fundamenten (netwerken, Linux, Windows, web) stevig neerzetten', 'Een boek uit je hoofd leren', 'Wachten tot je een baan hebt'], answer: 1, explain: 'Forensie bouwt op de fundamenten; zet die eerst stevig neer.' },
        { q: 'Waar vind je vacatures en opleidingen richting digitaal rechercheur in Nederland?', options: ['Alleen op social media', 'Bij de Politie (kombijde.politie.nl) en de Politieacademie', 'Nergens', 'Alleen in het buitenland'], answer: 1, explain: 'De politie en de Politieacademie zijn je directe route in Nederland.' },
        { q: 'Ik heb een eigen volgende stap gekozen en ga doorzetten. 🚀', noAnswer: true },
      ],
    },
  ],
});
