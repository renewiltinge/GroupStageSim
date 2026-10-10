/* Room: Reverse engineering — crackmes kraken */

// Hex-dump voor het hexviewer-lab (taak 2): een ELF-binary (magic 7F 45 4C 46) met
// leesbare strings in de ASCII-kolom: een hardcoded sleutel (OpenSesam2026) en de
// verstopte vlag JVT{hex_in_ascii}. Gegenereerd en gecontroleerd met Node.
const CRACKME_HEX =
  '7F 45 4C 46 02 01 01 00 00 00 00 00 00 00 00 00 20 20 56 6F 65 72 20 64 65 20 73 6C ' +
  '65 75 74 65 6C 20 69 6E 3A 20 20 20 73 6C 65 75 74 65 6C 3D 4F 70 65 6E 53 65 73 61 ' +
  '6D 32 30 32 36 20 20 20 20 54 6F 65 67 61 6E 67 20 67 65 77 65 69 67 65 72 64 20 20 ' +
  '20 20 76 6C 61 67 3D 4A 56 54 7B 68 65 78 5F 69 6E 5F 61 73 63 69 69 7D 20 20 00 00';

CS.registerRoom({
  id: 'reverse-engineering',
  path: 'offensief',
  order: 7,
  title: 'Reverse engineering: crackmes kraken',
  icon: '🔃',
  difficulty: 'Moeilijk',
  minutes: 70,
  summary: 'Leer een programma van binnen begrijpen zonder de broncode: lees controlefuncties, zoek sleutels in strings en hex, en kraak vier crackmes van oplopende moeilijkheid — met de wet en de ethiek stevig vooraan.',
  objectives: [
    'Uitleggen wat reverse engineering is en wanneer het wél en niet mag (eigen binaries, CTF, toestemming; art. 138ab Sr; auteursrecht en licenties)',
    'Statische en dynamische analyse onderscheiden en de juiste tool kiezen',
    'Leesbare strings en bytes (hex) gebruiken om hardcoded sleutels en vlaggen te vinden',
    'Een controlefunctie lezen en er de juiste invoer uit afleiden',
    'Crackmes kraken via omkeren, tekenrekenkunde, XOR en gecombineerde segmentcontroles',
    'Het verschil tussen een keygen en een patch benoemen en verantwoord met je kennis omgaan',
  ],
  tasks: [
    {
      title: 'Taak 1 — Wat is reverse engineering (en mag het eigenlijk)?',
      content: `
        <p><strong>Reverse engineering</strong> (letterlijk "omgekeerd ontwerpen") is het ontleden van een afgewerkt product om te begrijpen hoe het van binnen werkt — zonder dat je het oorspronkelijke ontwerp of de broncode hebt. Een automonteur die een onbekende motor uit elkaar haalt om te snappen hoe hij draait, doet aan reverse engineering. In security doen wij hetzelfde met software: we bestuderen een <em>binary</em> (een gecompileerd programma) om te zien welke beslissingen hij neemt.</p>

        <h3>Waarom dit een topvaardigheid is</h3>
        <ul>
          <li><strong>Malware begrijpen:</strong> aanvallers leveren geen broncode mee. Wil je weten wat een virus doet, dan moet je de machinecode lezen (zie de room over malware-analyse).</li>
          <li><strong>Kwetsbaarheden vinden:</strong> door een programma te ontleden ontdek je fouten die van buitenaf onzichtbaar zijn.</li>
          <li><strong>Protocollen en bestandsformaten snappen</strong> als er geen documentatie bestaat.</li>
        </ul>

        <h3>Een crackme: oefenstof met opzet</h3>
        <p>In deze room oefen je met <strong>crackmes</strong>: kleine programmaatjes die met opzet zijn gemaakt om gekraakt te worden. Een crackme vraagt om een sleutel of wachtwoord en laat je alleen door als je de juiste invoer vindt. Jij leest de <em>controle</em> (de functie die "ja" of "nee" zegt) en leidt daaruit de juiste sleutel af. Een <strong>keygenme</strong> gaat een stap verder: daar schrijf je zelf een programmaatje (een <em>keygen</em>) dat geldige sleutels maakt.</p>

        <div class="callout danger"><strong>De wet — lees dit goed:</strong>
          <ul>
            <li><strong>Computervredebreuk (art. 138ab Sr):</strong> binnendringen in een systeem dat niet van jou is, is strafbaar. Een licentiecontrole omzeilen op software van een ander, op een systeem van een ander, kan daar onder vallen.</li>
            <li><strong>Auteursrecht en licenties:</strong> software is auteursrechtelijk beschermd. De licentievoorwaarden (de EULA) verbieden vaak uitdrukkelijk reverse engineering. Het <em>decompileren</em> of kraken van andermans software kan dus verboden zijn, ook al staat het bestand "gewoon" op jouw schijf. De wet staat reverse engineering slechts in enge uitzonderingen toe (bijvoorbeeld om twee programma's te laten samenwerken — interoperabiliteit — onder strikte voorwaarden).</li>
            <li><strong>Kopieerbeveiliging kraken</strong> om software illegaal te verspreiden is apart strafbaar en heeft niets met leren te maken.</li>
          </ul>
        </div>

        <div class="callout tip"><strong>Waar het wél mag:</strong> op je <strong>eigen</strong> binaries en code, op speciaal daarvoor gemaakte <strong>crackme's en CTF-opdrachten</strong> (zoals de labs in deze room en platforms als crackmes.one en microcorruption), en met <strong>uitdrukkelijke, schriftelijke toestemming</strong> van de eigenaar. Dat is precies de ethische lijn die door de hele Dojo loopt: aanvalstechnieken oefen je alleen in je eigen lab of met toestemming.</div>

        <p>De techniek is neutraal; de context bepaalt of het mag. Houd die vraag — "mag ik dit bestand hiervoor gebruiken?" — altijd vooraan.</p>
      `,
      questions: [
        { q: 'Wat is reverse engineering?', options: ['Software sneller maken', 'Een afgewerkt programma ontleden om te begrijpen hoe het werkt, zonder de broncode', 'Een back-up terugzetten', 'Een programma vertalen naar het Nederlands'], answer: 1, explain: 'Reverse engineering is het van binnenuit begrijpen van een product (hier: een binary) zonder het oorspronkelijke ontwerp.' },
        { q: 'Welk wetsartikel gaat over computervredebreuk (binnendringen in andermans systeem)?', answer: ['art. 138ab sr', '138ab', 'artikel 138ab sr', 'art 138ab sr', '138ab sr'], hint: 'Hetzelfde artikel dat in de web- en malware-rooms terugkomt.', explain: 'Art. 138ab Sr stelt computervredebreuk strafbaar; het omzeilen van beveiliging op andermans systeem kan eronder vallen.' },
        { q: 'Op welk materiaal mag je reverse engineering vrij oefenen?', options: ['Elke app op je telefoon', 'Betaalde software van je werkgever', 'Je eigen binaries, crackme\'s/CTF-opdrachten en software met uitdrukkelijke toestemming', 'Alles wat op je eigen schijf staat'], answer: 2, explain: 'Eigen code, speciaal gemaakte crackme\'s/CTF en materiaal met schriftelijke toestemming — dat is de veilige, legale oefenruimte.' },
        { q: 'Waarom kan het reverse-engineeren van andermans software verboden zijn, ook al staat het op jouw schijf?', options: ['Omdat het te veel stroom kost', 'Vanwege auteursrecht en licentievoorwaarden (de EULA) die het vaak verbieden', 'Dat is nooit verboden', 'Omdat de schijf kapot kan gaan'], answer: 1, explain: 'Software is auteursrechtelijk beschermd en de licentie verbiedt reverse engineering vaak; de wet staat het maar in enge uitzonderingen toe.' },
      ],
    },

    {
      title: 'Taak 2 — Statisch vs. dynamisch, en je eerste tool: strings & hex',
      content: `
        <p>Net als bij malware-analyse zijn er twee grote benaderingen om een binary te onderzoeken. Je gebruikt ze allebei.</p>

        <h3>Statische analyse — kijken zonder draaien</h3>
        <p>Bij <strong>statische analyse</strong> bestudeer je het bestand <em>zonder het uit te voeren</em>. Je bekijkt de bytes, de leesbare tekst en — met een <strong>disassembler</strong> (zoals in radare2 of Ghidra) — de machine-instructies, of met een <strong>decompiler</strong> een ruwe benadering van de broncode. Veilig, want er draait niets.</p>

        <h3>Dynamische analyse — draaien en meekijken</h3>
        <p>Bij <strong>dynamische analyse</strong> voer je het programma uit met een <strong>debugger</strong> en kijk je stap voor stap wat het doet: welke waarden het vergelijkt, welke tak het kiest. Dit onthult gedrag dat statisch lastig te zien is, maar is riskanter bij echt kwaadaardige code — doe dat alleen geïsoleerd (zie de room <em>Malware-analyse: de basis</em> voor de veiligheidsregels: wegwerp-VM, snapshot, geen netwerk).</p>

        <div class="callout info"><strong>Vuistregel:</strong> begin statisch (snel en veilig een beeld), ga daarna dynamisch als je het precieze gedrag wilt zien. Voor de crackmes in deze room is statisch lezen genoeg — je krijgt de controlefunctie gewoon te lezen.</div>

        <h3>De simpelste statische tool: <code>strings</code></h3>
        <p>Programma's bevatten vaak <strong>leesbare tekst</strong>: foutmeldingen, menu's, en soms — tot vreugde van de analist — een <em>hardcoded</em> wachtwoord of een vlag die de programmeur er per ongeluk in liet staan. Het hulpmiddel <code>strings</code> trekt alle leesbare reeksen uit een binary. Zie je daar meteen de sleutel, dan hoef je niets te kraken.</p>

        <h3>Nog een niveau dieper: de rauwe bytes (hex)</h3>
        <p>Met een <strong>hex-editor</strong> lees je de ruwe bytes. De eerste bytes verraden het bestandstype (de "magic bytes"): een ELF-binary voor Linux begint met <code>7F 45 4C 46</code> (als tekst: <code>.ELF</code>), een Windows-executable met <code>4D 5A</code> (<code>MZ</code>). De ASCII-kolom rechts toont dezelfde bytes als tekst — daar spring je zo op leesbare strings.</p>

        <p>Hieronder zie je de hex-dump van <code>crackme0.bin</code>. Doe twee dingen: (1) bepaal aan de eerste bytes wat voor bestand dit is, en (2) lees de ASCII-kolom rechts — er staat een hardcoded sleutel én een verstopte vlag in.</p>
      `,
      lab: {
        type: 'hexviewer',
        filename: 'crackme0.bin',
        hex: CRACKME_HEX,
      },
      questions: [
        { q: 'Wat voor bestand is crackme0.bin, gezien de eerste bytes 7F 45 4C 46?', options: ['Een Windows-executable (MZ)', 'Een ELF-binary (Linux-executable)', 'Een PNG-afbeelding', 'Een ZIP-archief'], answer: 1, explain: '7F 45 4C 46 is ".ELF", de magic bytes van een Linux-executable (ELF-formaat).' },
        { q: 'Welke hardcoded sleutel staat leesbaar in de ASCII-kolom (na "sleutel=")?', answer: ['OpenSesam2026', 'opensesam2026'], hint: 'Lees de rechterkolom; de programmeur liet de sleutel letterlijk in de binary staan.', explain: 'In de ASCII-weergave is sleutel=OpenSesam2026 leesbaar — een klassieke beginnersfout.' },
        { q: 'Welke vlag staat verstopt in de ASCII-kolom (na "vlag=")?', answer: ['JVT{hex_in_ascii}'], encoded: true, hint: 'De vlag staat als losse bytes in het bestand, maar is in de ASCII-kolom gewoon te lezen.', explain: 'De bytes vormen in de ASCII-kolom de leesbare tekst JVT{hex_in_ascii}.' },
      ],
    },

    {
      title: 'Taak 3 — Een controlefunctie lezen + crackme 1 (omkeren)',
      content: `
        <p>Vaak staat de sleutel niet kant-en-klaar in de binary. Dan moet je de <strong>controlefunctie</strong> lezen: het stukje code dat bepaalt of jouw invoer goed of fout is. Kraken betekent hier niet "brute-force", maar <em>begrijpen</em>: je leest wat de functie met je invoer doet en rekent terug naar de invoer die "waar" oplevert.</p>

        <h3>Hoe je een controle leest</h3>
        <p>Een controle vergelijkt jouw invoer (na een paar bewerkingen) met een doelwaarde. Een piepklein voorbeeld:</p>
        <pre><code>function check(invoer) {
  return invoer + 1 === 5;
}</code></pre>
        <p>De functie is waar als <code>invoer + 1</code> gelijk is aan 5. Jij rekent terug: <code>invoer = 5 - 1 = 4</code>. Dat terugrekenen — de bewerking <em>omdraaien</em> — is de kern van elke crackme. Veelvoorkomende bewerkingen en hun omgekeerde:</p>
        <table>
          <thead><tr><th>Bewerking in de controle</th><th>Jij draait om met</th></tr></thead>
          <tbody>
            <tr><td>Tekst omkeren (reverse)</td><td>Nog een keer omkeren</td></tr>
            <tr><td>Optellen / aftrekken bij tekencodes</td><td>Aftrekken / optellen</td></tr>
            <tr><td>XOR met een constante</td><td>Nog een keer XOR met dezelfde constante</td></tr>
            <tr><td>Opsplitsen in segmenten</td><td>Elk segment apart oplossen</td></tr>
          </tbody>
        </table>

        <h3>Crackme 1 — de omgekeerde sleutel</h3>
        <p>Je eerste echte crackme. In het lab hieronder lees je de functie <code>check</code>. Ze draait jouw sleutel om (letter voor letter achterstevoren) en vergelijkt het resultaat met een vaste doelstring. Lees de doelstring en draai hem in je hoofd (of op papier) terug: wat je intypt, moet <em>omgekeerd</em> de doelstring zijn. Typ de juiste sleutel; bij succes verschijnt de vlag.</p>

        <div class="callout tip"><strong>Tip:</strong> omkeren is zijn eigen omgekeerde. Draai je de doelstring om, dan heb je meteen de sleutel.</div>
      `,
      lab: {
        type: 'crackme',
        title: 'Crackme 1 — Omkeren',
        intro: 'Lees de controle. Je sleutel wordt omgekeerd en vergeleken met een doelstring. Welke sleutel geeft toegang?',
        source: `function check(sleutel) {
  // De sleutel omgekeerd (letter voor letter achterstevoren)
  // moet exact gelijk zijn aan deze doelstring:
  return sleutel.split('').reverse().join('') === '6202ojod';
}`,
        check: (sleutel) => sleutel.split('').reverse().join('') === '6202ojod',
        flag: 'JVT{omgekeerd_is_niet_veilig}',
        reveal: 'Toegang verleend! Je draaide de doelstring om en vond de sleutel. Omkeren is nooit een echte beveiliging.',
        hint: 'Draai de doelstring 6202ojod zelf om: lees hem van achter naar voren.',
      },
      questions: [
        { q: 'Wat is de algemene truc om een crackme te kraken?', options: ['Heel snel typen', 'De bewerkingen in de controle omkeren en zo terugrekenen naar de juiste invoer', 'Het programma verwijderen', 'De computer opnieuw opstarten'], answer: 1, explain: 'Je leest wat de controle met je invoer doet en draait die bewerkingen om naar de invoer die "waar" oplevert.' },
        { q: 'Kraak crackme 1. Welke sleutel geeft toegang?', answer: ['dojo2026'], hint: 'De doelstring is 6202ojod. Draai hem om.', explain: 'Omgekeerd is 6202ojod gelijk aan dojo2026 — dus dat is de sleutel.' },
        { q: 'Welke vlag krijg je bij het kraken van crackme 1?', answer: ['JVT{omgekeerd_is_niet_veilig}'], hint: 'De vlag verschijnt in het lab zodra de juiste sleutel klopt.', explain: 'Bij succes toont het lab JVT{omgekeerd_is_niet_veilig}.' },
      ],
    },

    {
      title: 'Taak 4 — Crackme 2: tekenrekenkunde en een checksom',
      content: `
        <p>Een stap lastiger. Deze controle rekent niet met de tekst zelf, maar met de <strong>tekencodes</strong>. Elk teken heeft een getal: in de ASCII-tabel is <code>A</code> = 65, <code>a</code> = 97, <code>0</code> = 48, enzovoort. Met <code>charCodeAt</code> leest een programma die getallen uit, en daar kun je mee rekenen — bijvoorbeeld alle codes bij elkaar optellen tot een <strong>checksom</strong>.</p>

        <h3>Het probleem van een checksom: niet uniek</h3>
        <p>Een checksom alleen is een zwakke controle: heel veel verschillende teksten tellen op tot hetzelfde getal (<code>AB</code> en <code>BA</code> geven dezelfde som). Een slimme controle voegt daarom <strong>extra eisen</strong> toe, zodat er uiteindelijk nog maar één logische sleutel overblijft. Precies dat zie je in crackme 2. De controle eist:</p>
        <ol>
          <li>de sleutel is <strong>precies 9 tekens</strong> lang;</li>
          <li>de sleutel <strong>begint met het woord</strong> <code>sleutel</code> (dat zijn de eerste 7 tekens);</li>
          <li>de <strong>laatste twee tekens zijn gelijk</strong> aan elkaar;</li>
          <li>de <strong>som van alle tekencodes</strong> is <code>876</code>.</li>
        </ol>

        <h3>Zo reken je het uit</h3>
        <p>Omdat de eerste 7 tekens vastliggen (<code>sleutel</code>), kun je hun codes optellen: s=115, l=108, e=101, u=117, t=116, e=101, l=108, samen <strong>766</strong>. Dan blijft er voor de laatste twee tekens samen <code>876 − 766 = 110</code> over. Die twee tekens zijn gelijk, dus elk teken heeft code <code>110 / 2 = 55</code>. En tekencode 55 is... het cijfer <code>7</code>. De sleutel is dus <code>sleutel</code> gevolgd door <code>77</code>.</p>

        <div class="callout tip"><strong>Tip:</strong> gebruik desnoods het CyberChef-lab of een ASCII-tabel om tekencodes op te zoeken. De redenering is: "wat ligt vast?" aftrekken van het doel, en de rest verdelen over wat nog vrij is.</div>

        <p>Lees de functie in het lab na en typ de sleutel die aan álle vier de eisen voldoet.</p>
      `,
      lab: {
        type: 'crackme',
        title: 'Crackme 2 — Checksom met eisen',
        intro: 'De controle rekent met tekencodes (charCodeAt). Vier eisen samen leiden naar precies één sleutel.',
        source: `function check(sleutel) {
  // 1) precies 9 tekens
  if (sleutel.length !== 9) return false;
  // 2) begint met het woord "sleutel"
  if (!sleutel.startsWith('sleutel')) return false;
  // 3) de laatste twee tekens zijn gelijk aan elkaar
  if (sleutel.charCodeAt(7) !== sleutel.charCodeAt(8)) return false;
  // 4) de som van alle tekencodes is 876
  var som = 0;
  for (var i = 0; i < sleutel.length; i++) som += sleutel.charCodeAt(i);
  return som === 876;
}`,
        check: (sleutel) => {
          if (sleutel.length !== 9) return false;
          if (!sleutel.startsWith('sleutel')) return false;
          if (sleutel.charCodeAt(7) !== sleutel.charCodeAt(8)) return false;
          let som = 0;
          for (let i = 0; i < sleutel.length; i++) som += sleutel.charCodeAt(i);
          return som === 876;
        },
        flag: 'JVT{tekensom_gekraakt}',
        reveal: 'Knap! Je rekende de twee ontbrekende tekens terug uit de checksom. Een som alleen is nooit genoeg beveiliging.',
        hint: 'De eerste 7 tekens "sleutel" zijn samen 766. Er blijft 110 over voor twee gelijke tekens: elk code 55.',
      },
      questions: [
        { q: 'Waarom is een checksom (som van tekencodes) op zichzelf een zwakke controle?', options: ['Omdat sommen altijd 0 zijn', 'Omdat veel verschillende teksten dezelfde som kunnen geven (niet uniek)', 'Omdat optellen te traag is', 'Omdat het alleen met cijfers werkt'], answer: 1, explain: 'Verschillende teksten delen vaak dezelfde som; daarom zijn extra eisen nodig om de sleutel uniek te maken.' },
        { q: 'Kraak crackme 2. Welke sleutel voldoet aan alle vier de eisen?', answer: ['sleutel77'], hint: 'Begin met "sleutel", twee gelijke eindtekens, totaalsom 876. De eerste 7 tekens zijn samen 766.', explain: 'Er blijft 110 over voor twee gelijke tekens (elk code 55 = "7"), dus sleutel77.' },
        { q: 'Welke vlag hoort bij crackme 2?', answer: ['JVT{tekensom_gekraakt}'], hint: 'Die verschijnt in het lab na de juiste sleutel.', explain: 'Bij succes toont het lab JVT{tekensom_gekraakt}.' },
      ],
    },

    {
      title: 'Taak 5 — Crackme 3: XOR met een constante',
      content: `
        <p>XOR (exclusieve of) is de lievelingsbewerking van elke crackme-maker, omdat hij een mooie eigenschap heeft: <strong>XOR is zijn eigen omgekeerde</strong>. Versleutel je een byte met XOR en een sleutelbyte, dan krijg je het origineel terug door nog een keer te XOR'en met diezelfde sleutelbyte. In formules: <code>(x XOR k) XOR k = x</code>.</p>

        <h3>Hoe XOR hier werkt</h3>
        <p>De controle in crackme 3 neemt elk teken van jouw sleutel, pakt de tekencode (<code>charCodeAt</code>) en XOR't die met de constante <code>0x2a</code> (dat is hexadecimaal voor 42). De resulterende getallen worden met komma's aan elkaar geplakt en vergeleken met een vaste reeks bytes. Jij ziet dus de <em>versleutelde</em> bytes en moet terug naar de leesbare sleutel.</p>

        <h3>Terugrekenen</h3>
        <p>Omdat XOR zijn eigen omgekeerde is, doe je simpelweg hetzelfde terug: XOR elke doelbyte opnieuw met <code>0x2a</code> (42) en zet het resultaat om naar een teken. De doelbytes zijn:</p>
        <pre><code>77, 79, 66, 79, 67, 71, 30, 24</code></pre>
        <p>Neem de eerste: <code>77 XOR 42 = 103</code>, en tekencode 103 is <code>g</code>. Doe dat voor alle acht bytes en je leest de sleutel. Dit kun je met de hand doen, maar het <strong>XOR-onderdeel van het CyberChef-lab</strong> (of de <code>cipher</code>-tool) doet het ook voor je als je de constante 0x2a invult.</p>

        <div class="callout info"><strong>Waarom gebruiken makers XOR?</strong> Het is supersnel en verbergt de sleutel voor een simpele <code>strings</code>-zoektocht: in de binary staan alleen de versleutelde bytes, niet de leesbare tekst. Maar voor wie de constante kent, is het zo weer terug te draaien — echte beveiliging is het niet.</div>

        <p>Lees de functie in het lab, draai de XOR terug en typ de sleutel.</p>
      `,
      lab: {
        type: 'crackme',
        title: 'Crackme 3 — XOR met 0x2a',
        intro: 'Elke tekencode wordt ge-XOR\'d met 0x2a (42). Draai het terug: XOR nog eens met 42 en lees de sleutel.',
        source: `function check(sleutel) {
  // Elk teken wordt met 0x2a (42) ge-XOR'd; de reeks bytes
  // moet daarna exact gelijk zijn aan deze doelreeks:
  var doel = '77,79,66,79,67,71,30,24';
  return [...sleutel].map(function (c) {
    return c.charCodeAt(0) ^ 0x2a;
  }).join(',') === doel;
}`,
        check: (sleutel) => [...sleutel].map((c) => c.charCodeAt(0) ^ 0x2a).join(',') === '77,79,66,79,67,71,30,24',
        flag: 'JVT{xor_terug_gedraaid}',
        reveal: 'Top! Je XOR\'de de bytes terug met 42. Omdat XOR zijn eigen omgekeerde is, was de "versleuteling" zo weer open.',
        hint: 'XOR elke doelbyte opnieuw met 42: 77^42=103 ("g"), 79^42=101 ("e"), ... Zet elke uitkomst om naar een teken.',
      },
      questions: [
        { q: 'Welke bijzondere eigenschap van XOR maakt het terugdraaien makkelijk?', options: ['XOR verdubbelt de waarde', 'XOR is zijn eigen omgekeerde: nog eens XOR met dezelfde sleutel geeft het origineel', 'XOR werkt alleen op nullen', 'XOR versleutelt onbreekbaar'], answer: 1, explain: '(x XOR k) XOR k = x, dus met dezelfde constante draai je XOR meteen terug.' },
        { q: 'Kraak crackme 3. Welke sleutel geeft toegang?', answer: ['geheim42'], hint: 'XOR elke doelbyte met 42 en zet om naar tekens: 77->g, 79->e, 66->h, ...', explain: 'De doelbytes ge-XOR\'d met 42 vormen de tekst geheim42.' },
        { q: 'Welke vlag hoort bij crackme 3?', answer: ['JVT{xor_terug_gedraaid}'], hint: 'Die verschijnt na de juiste sleutel in het lab.', explain: 'Bij succes toont het lab JVT{xor_terug_gedraaid}.' },
      ],
    },

    {
      title: 'Taak 6 — Crackme 4: een echte licentiesleutel (meerdere segmenten)',
      content: `
        <p>De eindbaas. Echte licentiesleutels hebben vaak de vorm <code>XXXX-XXXX-XXXX</code>: meerdere blokken, met per blok een eigen controle. Crackme 4 werkt net zo. De controle splitst jouw sleutel op de koppeltekens (<code>-</code>) in drie segmenten van elk 4 tekens, en toetst elk segment met een <em>andere</em> techniek die je in deze room al hebt geleerd. Alle drie moeten kloppen.</p>

        <h3>De drie controles</h3>
        <ul>
          <li><strong>Segment A — omkeren:</strong> omgekeerd moet segment A gelijk zijn aan <code>1TVJ</code>. (Je kent de truc uit crackme 1: draai <code>1TVJ</code> om.)</li>
          <li><strong>Segment B — tekenrekenkunde:</strong> elk teken plus 1 (volgende tekencode) moet samen <code>s4w4</code> geven. Draai het om: trek bij elk teken van <code>s4w4</code> er 1 af.</li>
          <li><strong>Segment C — XOR:</strong> elk teken ge-XOR'd met <code>0x10</code> (16) moet de bytereeks <code>124, 113, 99, 100</code> geven. Draai het om: XOR elke byte opnieuw met 16 en lees het teken.</li>
        </ul>

        <h3>Aanpak: verdeel en heers</h3>
        <p>Een gecombineerde controle ziet er intimiderend uit, maar valt uiteen in <strong>losse, bekende puzzels</strong>. Los elk segment apart op en plak ze met koppeltekens aan elkaar:</p>
        <ol>
          <li>Segment A: <code>1TVJ</code> omgekeerd.</li>
          <li>Segment B: elk teken van <code>s4w4</code> één tekencode terug. Bijvoorbeeld <code>s</code> (115) wordt <code>r</code> (114); <code>4</code> (52) wordt <code>3</code> (51).</li>
          <li>Segment C: XOR <code>124, 113, 99, 100</code> elk met 16. Bijvoorbeeld <code>124 XOR 16 = 108</code> = <code>l</code>.</li>
        </ol>

        <div class="callout tip"><strong>Tip:</strong> dit is precies wat profs doen bij een grote binary: een enge controle opknippen in deelproblemen die je stuk voor stuk oplost. Werk netjes per segment en controleer tussendoor.</div>

        <p>Lees de functie in het lab, los de drie segmenten op en voer de volledige sleutel <code>A-B-C</code> in.</p>
      `,
      lab: {
        type: 'crackme',
        title: 'Crackme 4 — Licentiesleutel A-B-C',
        intro: 'Drie segmenten van 4 tekens, gescheiden door -. Elk segment heeft een eigen controle (omkeren, +1, XOR 0x10). Alle drie moeten kloppen.',
        source: `function check(sleutel) {
  var delen = sleutel.split('-');
  if (delen.length !== 3) return false;
  var a = delen[0], b = delen[1], c = delen[2];
  if (a.length !== 4 || b.length !== 4 || c.length !== 4) return false;
  // Segment A: omgekeerd moet '1TVJ' zijn
  if (a.split('').reverse().join('') !== '1TVJ') return false;
  // Segment B: elk teken +1 (volgende tekencode) moet 's4w4' zijn
  if (b.split('').map(function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) + 1);
  }).join('') !== 's4w4') return false;
  // Segment C: elk teken ge-XOR'd met 0x10 moet deze bytes geven
  if ([...c].map(function (ch) {
    return ch.charCodeAt(0) ^ 0x10;
  }).join(',') !== '124,113,99,100') return false;
  return true;
}`,
        check: (sleutel) => {
          const delen = sleutel.split('-');
          if (delen.length !== 3) return false;
          const a = delen[0], b = delen[1], c = delen[2];
          if (a.length !== 4 || b.length !== 4 || c.length !== 4) return false;
          if (a.split('').reverse().join('') !== '1TVJ') return false;
          if (b.split('').map((ch) => String.fromCharCode(ch.charCodeAt(0) + 1)).join('') !== 's4w4') return false;
          if ([...c].map((ch) => ch.charCodeAt(0) ^ 0x10).join(',') !== '124,113,99,100') return false;
          return true;
        },
        flag: 'JVT{meerdere_segmenten}',
        reveal: 'Meesterlijk! Je knipte een enge, gecombineerde controle op in drie losse puzzels en loste ze stuk voor stuk op.',
        hint: 'A = 1TVJ omgekeerd. B = elk teken van s4w4 min 1. C = 124,113,99,100 elk XOR 16. Plak met koppeltekens: A-B-C.',
      },
      questions: [
        { q: 'Wat is de slimme aanpak bij een controle met meerdere segmenten?', options: ['Willekeurig gokken tot het lukt', 'Elk segment als een losse, bekende puzzel apart oplossen (verdeel en heers)', 'Alleen het eerste segment oplossen', 'De koppeltekens weglaten'], answer: 1, explain: 'Een gecombineerde controle valt uiteen in losse deelproblemen; los ze stuk voor stuk op en voeg ze samen.' },
        { q: 'Kraak crackme 4. Welke volledige sleutel (A-B-C) geeft toegang?', answer: ['JVT1-r3v3-last'], hint: 'A = 1TVJ omgekeerd = JVT1. B = s4w4 elk teken -1 = r3v3. C = 124,113,99,100 elk XOR 16 = last.', explain: 'De segmenten JVT1, r3v3 en last voldoen elk aan hun eigen controle; samen: JVT1-r3v3-last.' },
        { q: 'Welke vlag hoort bij crackme 4?', answer: ['JVT{meerdere_segmenten}'], hint: 'Die verschijnt na de juiste sleutel in het lab.', explain: 'Bij succes toont het lab JVT{meerdere_segmenten}.' },
      ],
    },

    {
      title: 'Taak 7 — Keygen vs. patch, en verantwoord met je kennis omgaan',
      content: `
        <p>Je hebt vier crackmes gekraakt door de controle te <em>begrijpen</em>. In het echt zijn er grofweg twee manieren om een licentie- of sleutelcontrole te omzeilen — en het verschil ertussen zegt veel over hoe goed je het programma snapt.</p>

        <h3>De keygen — de "nette" manier</h3>
        <p>Een <strong>keygen</strong> (key generator) is een programmaatje dat <em>geldige</em> sleutels maakt. Je hebt dan de controle zó goed begrepen dat je zelf sleutels kunt produceren die slagen — zonder het programma zelf aan te raken. In crackme 2 deed je dit eigenlijk al met de hand: je <em>berekende</em> een geldige sleutel uit de regels. Een keygen is dat, geautomatiseerd. Het is de koningsdiscipline van reverse engineering: het bewijst dat je het algoritme volledig doorhebt.</p>

        <h3>Patchen — het slot eruit zagen</h3>
        <p><strong>Patchen</strong> betekent dat je de binary zelf aanpast: je verandert de machinecode zodat de controle altijd "goed" zegt (bijvoorbeeld een sprong-instructie omdraaien, of de hele controle vervangen door "return true"). Je omzeilt het slot in plaats van de sleutel te vinden. Dat is vaak sneller, maar grover: je verspreidt dan een <em>gewijzigde</em> versie van andermans programma.</p>

        <table>
          <thead><tr><th></th><th>Keygen</th><th>Patch</th></tr></thead>
          <tbody>
            <tr><td>Wat je aanpast</td><td>Niets aan de binary — je maakt sleutels</td><td>De binary zelf (de code)</td></tr>
            <tr><td>Wat het bewijst</td><td>Je snapt het hele algoritme</td><td>Je vond één plek om te omzeilen</td></tr>
            <tr><td>Resultaat</td><td>Geldige sleutels</td><td>Een gewijzigd programma</td></tr>
          </tbody>
        </table>

        <div class="callout danger"><strong>De ethische grens — nog één keer scherp:</strong> keygens en patches maken voor <strong>commerciële software van een ander</strong> om die gratis te gebruiken of te verspreiden is <strong>illegaal</strong> (auteursrecht, en soms het omzeilen van kopieerbeveiliging en art. 138ab Sr). De techniek die je hier leerde, oefen je uitsluitend op <strong>je eigen binaries, crackme's/CTF-opdrachten en materiaal met uitdrukkelijke toestemming</strong>. Vind je bij geautoriseerd onderzoek een echt lek, dan meld je dat verantwoord (Coordinated Vulnerability Disclosure), je buit het niet uit.</div>

        <h3>Hoe je verder groeit</h3>
        <ul>
          <li>Oefen op <strong>crackmes.one</strong> (duizenden legale crackme's van makkelijk tot gemeen) en <strong>microcorruption</strong> (een verslavende embedded-RE-CTF in de browser).</li>
          <li>Leer een echte disassembler/decompiler: <strong>radare2</strong> (open source) of <strong>Ghidra</strong>.</li>
          <li>Herken dat elke crackme hier een echte techniek uit grote binaries in het klein was: strings lezen, controles terugrekenen, segmenten opdelen.</li>
        </ul>

        <div class="callout tip"><strong>Laatste woord:</strong> reverse engineering is pure nieuwsgierigheid — "hoe werkt dit?" — gecombineerd met discipline over waar je die nieuwsgierigheid loslaat. Houd beide vast, dan wordt dit een van je krachtigste vaardigheden.</div>
      `,
      questions: [
        { q: 'Wat is het verschil tussen een keygen en een patch?', options: ['Een keygen maakt geldige sleutels; een patch wijzigt de binary zelf om de controle te omzeilen', 'Een keygen is illegaal, een patch nooit', 'Er is geen verschil', 'Een patch maakt sleutels, een keygen verwijdert het programma'], answer: 0, explain: 'Een keygen genereert geldige sleutels (algoritme volledig begrepen); patchen verandert de code zodat de controle altijd slaagt.' },
        { q: 'Wat bewijst het maken van een werkende keygen over je begrip van het programma?', options: ['Niets bijzonders', 'Dat je het volledige controle-algoritme begrijpt', 'Dat je snel kunt typen', 'Dat het programma kapot is'], answer: 1, explain: 'Een keygen kan alleen wie het hele algoritme doorgrondt; het is de koningsdiscipline van RE.' },
        { q: 'Op welk materiaal pas je deze kraaktechnieken toe?', answer: ['eigen binaries', 'crackmes', 'met toestemming', 'eigen code', 'ctf'], hint: 'Eigen code, speciaal gemaakte oefenstof, of met uitdrukkelijke toestemming.', explain: 'Alleen op je eigen binaries, crackme\'s/CTF en materiaal met uitdrukkelijke toestemming — nooit op andermans software om die te misbruiken.' },
        { q: 'Ik begrijp dat keygens/patches voor andermans commerciële software illegaal zijn en dat ik deze kennis alleen ethisch en legaal gebruik.', noAnswer: true },
      ],
    },
  ],

  terms: [
    { term: 'Reverse engineering', def: 'Een afgewerkt product (hier: een binary) ontleden om te begrijpen hoe het werkt, zonder de broncode.' },
    { term: 'Binary', def: 'Een gecompileerd, uitvoerbaar programma in machinecode (bijv. een .exe of een ELF-bestand).' },
    { term: 'Crackme', def: 'Een klein programma dat met opzet is gemaakt om legaal te oefenen met het kraken van een sleutel- of licentiecontrole.' },
    { term: 'Keygenme', def: 'Een crackme-variant waarbij je zelf een keygen moet schrijven die geldige sleutels genereert.' },
    { term: 'Controlefunctie', def: 'Het stukje code dat bepaalt of de ingevoerde sleutel goed of fout is; die lees en keer je om.' },
    { term: 'Statische analyse', def: 'Een binary onderzoeken zonder hem uit te voeren: bytes, strings en (gedisassembleerde) code lezen.' },
    { term: 'Dynamische analyse', def: 'Een binary uitvoeren met een debugger en stap voor stap het gedrag observeren.' },
    { term: 'Disassembler', def: 'Tool die machinecode omzet naar leesbare assembly-instructies (bijv. radare2, Ghidra).' },
    { term: 'Decompiler', def: 'Tool die machinecode omzet naar een ruwe benadering van hogere-taal-broncode (bijv. C).' },
    { term: 'strings', def: 'Hulpmiddel dat alle leesbare tekstreeksen uit een binary trekt; verraadt soms hardcoded sleutels.' },
    { term: 'XOR', def: 'Exclusieve-of-bewerking; zijn eigen omgekeerde: (x XOR k) XOR k = x. Populair in zwakke "versleuteling".' },
    { term: 'Keygen', def: 'Programma dat geldige sleutels maakt op basis van het begrepen controle-algoritme, zonder de binary te wijzigen.' },
    { term: 'Patchen', def: 'De binary zelf aanpassen zodat de controle altijd slaagt (het slot omzeilen in plaats van de sleutel vinden).' },
  ],

  resources: [
    { title: 'crackmes.one — legale crackme\'s om op te oefenen', url: 'https://crackmes.one/' },
    { title: 'Microcorruption — embedded reverse-engineering CTF in de browser', url: 'https://microcorruption.com/' },
    { title: 'radare2 — open-source reverse-engineering framework', url: 'https://github.com/radareorg/radare2' },
    { title: 'Ghidra — open-source disassembler/decompiler (NSA)', url: 'https://github.com/NationalSecurityAgency/ghidra' },
  ],
});
