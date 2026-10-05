/* Room: Bewijs veiligstellen & chain of custody */
CS.registerRoom({
  id: 'bewijs-veiligstellen',
  path: 'forensie',
  order: 2,
  title: 'Bewijs veiligstellen',
  icon: '🔗',
  difficulty: 'Gemiddeld',
  minutes: 65,
  summary: 'De belangrijkste stap van elk onderzoek: bewijs onveranderd vastleggen. Order of volatility, write blockers, forensische images, hashing en een sluitende chain of custody.',
  objectives: [
    'Uitleggen waarom je nooit op het origineel werkt, maar op een geverifieerde kopie',
    'De order of volatility toepassen: welk bewijs stel je eerst veilig?',
    'Beschrijven wat een write blocker en een forensisch image zijn',
    'Met hashing de integriteit van bewijs aantonen (vóór en ná)',
    'Een sluitende chain of custody bijhouden',
    'De normen ISO/IEC 27037 en RFC 3227 op hoofdlijnen herkennen',
  ],
  terms: [
    { term: 'Chain of custody', def: 'Bewijsketen: een onafgebroken administratie van wie het bewijs wanneer, waar en hoe heeft vastgelegd, verplaatst, bewaard en onderzocht.' },
    { term: 'Order of volatility', def: 'De volgorde waarin je bewijs veiligstelt, van meest vluchtig (RAM) naar minst vluchtig (archief). Vastgelegd in RFC 3227.' },
    { term: 'Write blocker', def: 'Hardware of software die alle schrijfacties naar een gegevensdrager blokkeert, zodat je het origineel niet wijzigt tijdens het kopiëren.' },
    { term: 'Forensisch image', def: 'Een exacte bit-voor-bit-kopie van een gegevensdrager, inclusief verwijderde en vrije ruimte.' },
    { term: 'dd', def: 'Linux-commando dat een rauwe bit-voor-bit-kopie maakt (raw/.dd-image).' },
    { term: 'E01 / EWF', def: 'Expert Witness Format: een forensisch imageformaat met compressie, metadata en ingebouwde hashcontrole.' },
    { term: 'Hashwaarde', def: 'Een unieke "digitale vingerafdruk" van data (bv. SHA-256). Zelfde data → zelfde hash; één bit anders → totaal andere hash.' },
    { term: 'Integriteit', def: 'Bewijs dat de data niet is gewijzigd sinds het veiligstellen — aangetoond doordat de hash later nog klopt.' },
    { term: 'Dead vs live acquisition', def: 'Uitgezet systeem veiligstellen (dead) versus een draaiend systeem waar je eerst vluchtige data pakt (live).' },
    { term: 'Faraday-tas', def: 'Afgeschermde zak die radiosignalen blokkeert, zodat een in beslag genomen telefoon niet op afstand gewist of gewijzigd kan worden.' },
    { term: 'ISO/IEC 27037', def: 'Internationale richtlijn voor het identificeren, verzamelen, verwerven en bewaren van digitaal bewijs.' },
    { term: 'RFC 3227', def: 'Richtlijn voor het verzamelen en bewaren van bewijs, met o.a. de order of volatility.' },
  ],
  resources: [
    { title: 'NIST — Computer Forensics / SP 800-86', url: 'https://csrc.nist.gov/' },
    { title: 'IETF RFC 3227 — Guidelines for Evidence Collection', url: 'https://www.ietf.org/rfc/rfc3227.txt' },
    { title: 'Forensic Focus — artikelen & tools', url: 'https://www.forensicfocus.com/' },
    { title: 'NFI — forensisch onderzoek', url: 'https://www.forensischinstituut.nl/' },
  ],
  tasks: [
    {
      title: 'Taak 1 — Werk nooit op het origineel',
      content: `
        <p>De gouden regel van forensiek: <strong>je raakt het origineel zo min mogelijk aan en je onderzoekt op een kopie.</strong> Waarom? Omdat zelfs het simpel aanzetten van een computer of openen van een bestand al dingen verandert — tijdstempels, logs, tijdelijke bestanden. Elke wijziging die jij veroorzaakt, kan de verdediging in de rechtszaal gebruiken om je bewijs onderuit te halen.</p>
        <div class="callout info"><strong>Vergelijk het met een plaats delict:</strong> een rechercheur loopt niet zomaar door een kamer vol sporen. Je legt alles eerst vast (foto's, meting), en pas daarna raak je — met handschoenen, gecontroleerd — iets aan. Digitaal werk je net zo gecontroleerd.</div>
        <p>Daarom maak je eerst een <strong>forensisch image</strong>: een exacte bit-voor-bit-kopie van de gegevensdrager. Niet alleen de zichtbare bestanden, maar álles — ook verwijderde bestanden, vrije ruimte en metadata. Daarna onderzoek je die kopie, terwijl het origineel veilig in de kluis ligt.</p>
        <p>Het verschil tussen een gewone kopie en een forensisch image: als je bestanden "kopieert en plakt", krijg je alleen de zichtbare, actieve bestanden — en verander je tijdstempels. Een forensisch image kopieert de schijf <em>sector voor sector</em>, precies zoals hij is, inclusief wat er tussen en achter de bestanden verstopt zit.</p>
      `,
      questions: [
        { q: 'Waarom onderzoek je een kopie en niet het originele bewijs?', options: ['Kopieën zijn sneller', 'Omdat werken op het origineel het wijzigt en bewijs onbruikbaar kan maken', 'Omdat het verplicht is van de fabrikant', 'Dat maakt niet uit'], answer: 1, explain: 'Elke wijziging aan het origineel kan je bewijs in de rechtszaal onderuithalen.' },
        { q: 'Een exacte bit-voor-bit-kopie van een hele schijf (inclusief verwijderde en vrije ruimte) heet een forensisch ...', answer: ['image', 'forensisch image', 'disk image'], hint: 'Engels woord voor afbeelding/afdruk van de schijf.', explain: 'Een forensisch image — bit voor bit, niet alleen de zichtbare bestanden.' },
        { q: 'Wat mis je als je bestanden gewoon "kopieert en plakt" in plaats van een image maakt?', options: ['Niets', 'Verwijderde bestanden, vrije ruimte en onveranderde tijdstempels', 'Alleen de bestandsnamen', 'De mappenstructuur'], answer: 1, explain: 'Een gewone kopie mist verwijderde data/slack en verandert metadata; een image behoudt alles.' },
      ],
    },
    {
      title: 'Taak 2 — Order of volatility: wat eerst?',
      content: `
        <p>Niet al het bewijs is even duurzaam. Sommige sporen verdwijnen binnen seconden, andere blijven jaren bestaan. De regel: <strong>stel het meest vluchtige bewijs het eerst veilig.</strong> Dit heet de <em>order of volatility</em> en staat beschreven in <strong>RFC 3227</strong>.</p>
        <p>Van meest naar minst vluchtig (vereenvoudigd):</p>
        <ol>
          <li><strong>Registers &amp; cache van de CPU</strong> — leven microseconden.</li>
          <li><strong>Werkgeheugen (RAM)</strong> — processen, netwerkverbindingen, sleutels; weg bij uitschakelen.</li>
          <li><strong>Netwerkstatus</strong> — actieve verbindingen, ARP-tabel, routering.</li>
          <li><strong>Draaiende processen</strong> — wat er op dat moment draait.</li>
          <li><strong>Tijdelijke bestanden</strong> — swap, temp.</li>
          <li><strong>Schijf</strong> — bestanden, verwijderde data; relatief stabiel.</li>
          <li><strong>Externe logging / back-ups</strong> — bij servers elders.</li>
          <li><strong>Fysieke configuratie &amp; archiefmedia</strong> — het minst vluchtig.</li>
        </ol>
        <div class="callout warn"><strong>De grote beslissing:</strong> tref je een <em>draaiende</em> computer aan, dan stel je eerst de vluchtige data veilig (<em>live acquisition</em>: RAM-dump, netwerkverbindingen) vóórdat je de stekker eruit trekt. Bij een uitgezet systeem doe je een <em>dead acquisition</em>: je haalt de schijf eruit (of gebruikt een write blocker) en maakt een image. Trek je bij een draaiend systeem meteen de stekker eruit, dan ben je het geheugen — en misschien je beste bewijs — kwijt.</div>
        <p>Bij telefoons speelt nog iets: een in beslag genomen toestel kan op afstand worden gewist. Daarom gaat het meteen in een <strong>Faraday-tas</strong> (of vliegtuigstand), zodat het geen signaal meer ontvangt.</p>
      `,
      questions: [
        { q: 'Volgens de order of volatility stel je dit als eerste veilig:', options: ['De harde schijf', 'Archief-back-ups', 'Vluchtige data zoals RAM', 'De fysieke configuratie'], answer: 2, explain: 'Meest vluchtig eerst: RAM (en CPU-registers/cache) vóór de stabiele schijf.' },
        { q: 'Je treft een DRAAIENDE computer aan met mogelijk bewijs in het geheugen. Wat doe je?', options: ['Direct de stekker eruit trekken', 'Eerst de vluchtige data veiligstellen (live acquisition), dan pas uitzetten', 'Niets, laat maar draaien', 'Meteen bestanden kopiëren met kopiëren-plakken'], answer: 1, explain: 'Eerst RAM/netwerkstatus veiligstellen; de stekker eruit wist het vluchtige bewijs.' },
        { q: 'Waarom gaat een in beslag genomen telefoon in een Faraday-tas?', answer: ['om op afstand wissen te voorkomen', 'tegen signaal', 'om signaal te blokkeren', 'zodat hij niet gewist kan worden'], hint: 'Denk aan signalen van buitenaf.', explain: 'De tas blokkeert radiosignaal, zodat het toestel niet op afstand gewist of gewijzigd wordt.' },
        { q: 'In welke richtlijn staat de order of volatility beschreven?', options: ['RFC 1918', 'RFC 3227', 'OWASP Top 10', 'ISO 9001'], answer: 1, explain: 'RFC 3227 — Guidelines for Evidence Collection and Archiving.' },
      ],
    },
    {
      title: 'Taak 3 — Write blockers & imaging',
      content: `
        <p>Om een schijf te kopiëren zónder hem te wijzigen gebruik je een <strong>write blocker</strong>: hardware (een kastje tussen de schijf en je werkstation) of software die álle schrijfacties naar het origineel tegenhoudt. Lezen mag, schrijven niet. Zo kun je veilig een image maken terwijl je zeker weet dat je niets aan het origineel verandert.</p>
        <p>Het image zelf maak je met forensische tools. Twee veelgebruikte vormen:</p>
        <ul>
          <li><strong>Raw / <code>dd</code></strong> — een kale bit-voor-bit-kopie. In Linux: <code>dd if=/dev/sdb of=bewijs.dd bs=4M</code> (<em>if</em> = input/bron, <em>of</em> = output/doel). Simpel en universeel.</li>
          <li><strong>E01 (Expert Witness Format)</strong> — een forensisch formaat met compressie, zaak-metadata én ingebouwde hashcontrole. Veel gebruikt door tools als FTK Imager en Guymager.</li>
        </ul>
        <div class="callout tip"><strong>Praktijk:</strong> je legt ook de "buitenkant" vast: foto's van het apparaat, serienummers, in welke staat je het aantrof, en wie erbij was. Al die documentatie hoort bij het bewijs. Een rechter wil kunnen volgen dat er niets geks is gebeurd tussen inbeslagname en onderzoek.</div>
        <p>Werk je op een draaiend Linux-systeem, dan kun je ook het geheugen dumpen; op Windows gebruiken onderzoekers tools als FTK Imager of WinPmem. Maar let op de order of volatility: eerst het vluchtige, dan het stabiele.</p>
      `,
      questions: [
        { q: 'Wat doet een write blocker?', options: ['Hij versleutelt de schijf', 'Hij blokkeert alle schrijfacties naar het origineel, lezen mag wel', 'Hij maakt de schijf sneller', 'Hij verwijdert bewijs'], answer: 1, explain: 'Een write blocker laat lezen toe maar blokkeert schrijven, zodat het origineel onveranderd blijft.' },
        { q: 'In het commando dd if=/dev/sdb of=bewijs.dd — wat is de BRON?', answer: ['/dev/sdb', 'dev/sdb', 'sdb'], hint: 'if = input file.', explain: 'if = input (bron) = /dev/sdb; of = output (doel) = bewijs.dd.' },
        { q: 'Welk imageformaat bevat compressie, zaak-metadata én ingebouwde hashcontrole?', options: ['raw/dd', 'E01 (Expert Witness Format)', '.zip', '.txt'], answer: 1, explain: 'E01/EWF is een forensisch formaat met metadata en hashverificatie.' },
      ],
    },
    {
      title: 'Taak 4 — Integriteit bewijzen met hashing',
      content: `
        <p>Hoe bewijs je dat je het bewijs niet hebt veranderd? Met een <strong>hash</strong> (die je al kent uit de cryptografie-room). Een hashfunctie als <strong>SHA-256</strong> maakt een unieke "vingerafdruk" van data. De eigenschappen die hem perfect maken voor forensiek:</p>
        <ul>
          <li>Dezelfde data geeft <strong>altijd</strong> dezelfde hash.</li>
          <li>Eén gewijzigde bit geeft een <strong>totaal andere</strong> hash.</li>
          <li>Je kunt uit de hash niet de data terugrekenen.</li>
        </ul>
        <p>De werkwijze:</p>
        <ol>
          <li>Direct na het imagen bereken je de hash van het origineel én van het image. Die moeten gelijk zijn → de kopie is exact.</li>
          <li>Je legt die hash vast in je documentatie (en in de chain of custody).</li>
          <li>Elke keer dat je later met het image werkt, kun je de hash opnieuw berekenen. Klopt hij nog? Dan is er niets veranderd en is de integriteit bewezen.</li>
        </ol>
        <div class="callout danger"><strong>Als de hashes NIET overeenkomen</strong>, is er iets misgegaan: een leesfout, een beschadigde kopie, of — erger — het bewijs is gewijzigd. Dan kun je het niet gebruiken. Vandaar dat hashen geen formaliteit is, maar je bewijslast.</div>
        <p>MD5 en SHA-1 zie je in oudere zaken nog, maar die zijn kraakbaar (botsingen mogelijk), dus <strong>SHA-256</strong> is tegenwoordig de norm. Vaak worden er twee hashes naast elkaar vastgelegd voor extra zekerheid.</p>
      `,
      questions: [
        { q: 'Je berekent de hash van het origineel en van het image; ze zijn gelijk. Wat betekent dat?', options: ['De kopie is een exacte, onveranderde kopie', 'Het image is versleuteld', 'Er is bewijs gewist', 'De schijf is kapot'], answer: 0, explain: 'Gelijke hashes = identieke data = een geldige, integere kopie.' },
        { q: 'Welk hashalgoritme is tegenwoordig de norm in forensiek (MD5 en SHA-1 zijn kraakbaar)?', answer: ['sha-256', 'sha256', 'sha 256'], hint: 'SHA met 256 bits.', explain: 'SHA-256 — MD5 en SHA-1 kennen botsingen en zijn niet meer vertrouwd.' },
        { q: 'De hash die je later berekent wijkt af van de vastgelegde hash. Conclusie?', options: ['Prima, dat hoort zo', 'De integriteit is geschonden: er is iets veranderd of beschadigd', 'De hash is gewoon verlopen', 'Je moet een andere tool gebruiken'], answer: 1, explain: 'Afwijkende hash = de data is veranderd/beschadigd; het bewijs is niet meer betrouwbaar.' },
        { q: 'Ik begrijp dat hashen de integriteit van bewijs aantoont, vóór én na onderzoek.', noAnswer: true },
      ],
    },
    {
      title: 'Taak 5 — De chain of custody',
      content: `
        <p>De <strong>chain of custody</strong> (bewijsketen) is de onafgebroken administratie van jouw bewijs. Ze beantwoordt op elk moment: <em>wie</em> had het bewijs, <em>wat</em> is ermee gebeurd, <em>wanneer</em>, <em>waar</em> en <em>waarom</em>. Eén gat in die keten — een uur waarin niemand weet waar het bewijs was — en de verdediging kan twijfel zaaien.</p>
        <p>Wat je vastlegt bij elke overdracht of handeling:</p>
        <ul>
          <li>Datum en tijd</li>
          <li>Wie het bewijs overdroeg en wie het ontving (met handtekening)</li>
          <li>Een unieke identificatie (zaaknummer, bewijsnummer, serienummer)</li>
          <li>Wat er is gedaan (geïmaged, gehasht, geanalyseerd, opgeborgen)</li>
          <li>Waar het bewaard wordt (verzegelde zak, kluis)</li>
        </ul>
        <p>De norm <strong>ISO/IEC 27037</strong> vat de kerntaken samen in vier processen — <em>identificeren, verzamelen, verwerven (acquisitie) en bewaren</em> — en drie principes: <strong>controleerbaar, herhaalbaar en reproduceerbaar</strong>. De persoon die dit uitvoert heet daar de DEFR (Digital Evidence First Responder).</p>
        <div class="callout tip"><strong>Vuistregel:</strong> schrijf op wat je doet, terwijl je het doet. "Ik weet nog wel wat ik deed" is in de rechtszaal niets waard; een gedateerd, ondertekend logboek wél. Documenteren is geen bureaucratie — het ís het bewijs dat je bewijs klopt.</div>
      `,
      questions: [
        { q: 'Wat beantwoordt een goede chain of custody op elk moment?', options: ['Alleen wie de eigenaar is', 'Wie het bewijs had, wat ermee gebeurde, wanneer, waar en waarom', 'Hoeveel het bewijs waard is', 'Welke tool het snelst is'], answer: 1, explain: 'De bewijsketen legt wie/wat/wanneer/waar/waarom vast — onafgebroken.' },
        { q: 'Een periode waarin niemand kan aantonen waar het bewijs was, noemen we een ... in de keten.', answer: ['gat', 'onderbreking', 'hiaat', 'breuk'], hint: 'Een onderbreking.', explain: 'Een gat/onderbreking in de chain of custody maakt het bewijs aanvechtbaar.' },
        { q: 'De norm ISO/IEC 27037 noemt drie principes. Welke rij klopt?', options: ['snel, goedkoop, mooi', 'controleerbaar, herhaalbaar, reproduceerbaar', 'geheim, versleuteld, gecomprimeerd', 'lokaal, online, offline'], answer: 1, explain: 'Controleerbaar (auditable), herhaalbaar (repeatable), reproduceerbaar (reproducible).' },
      ],
    },
    {
      title: 'Taak 6 — Oefening: image maken en verifiëren',
      content: `
        <p>Tijd om te doen. Je hebt een in beslag genomen USB-stick (<code>/dev/sdb</code>) achter een write blocker. Maak er een forensisch image van en bewijs de integriteit. In de terminal hieronder:</p>
        <ol>
          <li>Bekijk de werkmap: <code>ls -l</code></li>
          <li>Maak het image (gesimuleerd): <code>dd if=/dev/sdb of=bewijs.dd bs=4M</code></li>
          <li>Hash het origineel: <code>sha256sum /dev/sdb</code></li>
          <li>Hash het image: <code>sha256sum bewijs.dd</code></li>
          <li>Vergelijk de twee hashes. Gelijk? Dan is de kopie integer. Lees daarna de chain of custody: <code>cat chain-of-custody.txt</code></li>
        </ol>
        <div class="callout info"><strong>Let op de twee hashes in de uitvoer.</strong> Als ze teken voor teken gelijk zijn, heb je bewezen dat je image een exacte kopie is. Dát is wat je in je rapport zet.</div>
      `,
      lab: {
        type: 'terminal',
        user: 'rechercheur', host: 'forensics-ws',
        home: '/home/rechercheur/zaak-0042', cwd: '/home/rechercheur/zaak-0042',
        motd: 'Write blocker actief op /dev/sdb (alleen-lezen). Typ de commando\'s uit de opdracht.',
        fs: {
          '/home/rechercheur/zaak-0042/werkmap.txt': 'Werkmap voor het veiligstellen van USB-stick (bewijsnummer B-0042-01).\n',
          '/home/rechercheur/zaak-0042/chain-of-custody.txt': 'CHAIN OF CUSTODY — bewijs B-0042-01 (USB-stick)\n-----------------------------------------------\n2026-10-03 08:55  Inbeslaggenomen op locatie door agent Yilmaz\n2026-10-03 09:30  Overgedragen aan digitaal rechercheur De Vries (handtekening)\n2026-10-03 09:45  Achter write blocker geplaatst; image gemaakt (bewijs.dd)\n2026-10-03 09:52  Integriteit vastgelegd met SHA-256\n2026-10-03 10:05  Verzegeld opgeborgen in kluis K-7\nControlecode: JVT{keten_is_sluitend}\n',
        },
        denied: ['/root'],
        commands: {
          'dd if=/dev/sdb of=bewijs.dd bs=4M': '7640+0 records in\n7640+0 records out\n32032092160 bytes (32 GB, 30 GiB) copied, 214.7 s, 149 MB/s\n(gesimuleerd image bewijs.dd aangemaakt)',
          'sha256sum /dev/sdb': '9f2c4b7a1d3e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff  /dev/sdb',
          'sha256sum bewijs.dd': '9f2c4b7a1d3e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff  bewijs.dd',
        },
      },
      questions: [
        { q: 'Vergelijk de twee sha256sum-uitkomsten. Komen de hashes van /dev/sdb en bewijs.dd overeen?', options: ['Ja, ze zijn identiek — de kopie is integer', 'Nee, ze verschillen', 'Er is geen hash', 'Kan ik niet zien'], answer: 0, explain: 'Beide tonen 9f2c4b7a… — identiek, dus de kopie is een exacte, integere image.' },
        { q: 'Welke controlecode (vlag) staat in chain-of-custody.txt?', answer: 'JVT{keten_is_sluitend}', hint: 'cat chain-of-custody.txt', explain: 'De chain of custody is sluitend gedocumenteerd — inclusief je vlag.' },
        { q: 'Welk commando maakte het image?', answer: ['dd if=/dev/sdb of=bewijs.dd bs=4M', 'dd', 'dd if=/dev/sdb of=bewijs.dd'], hint: 'Begint met dd.', explain: 'dd maakt de rauwe bit-voor-bit-kopie.' },
        { q: 'Ik kan nu uitleggen hoe je bewijs onveranderd veiligstelt en de integriteit aantoont.', noAnswer: true },
      ],
    },
  ],
});
