/* Room: Schijf- en bestandssysteemforensie */

// Hex-dump van verdacht.bin: een PNG-signature met een verstopte vlag in de ASCII (tEXt-chunk).
// De vlag JVT{png_magic_bytes} staat als leesbare tekst tussen de bytes.
const PNG_HEX =
  '89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52 00 00 00 40 00 00 00 40 ' +
  '08 06 00 00 00 00 00 00 2C 74 45 58 74 43 6F 6D 6D 65 6E 74 00 76 65 72 ' +
  '62 6F 72 67 65 6E 20 76 6C 61 67 3A 20 4A 56 54 7B 70 6E 67 5F 6D 61 67 ' +
  '69 63 5F 62 79 74 65 73 7D 00 00 00 00 49 45 4E 44 AE 42 60 82';

// Bestandssysteem voor het onderzoekslab in de laatste taak.
const FORENSIE_FS = {
  '/cases/zaak-2026-0442/verdacht.bin':
    '\x89PNG\r\n\x1a\n...(binaire beeldgegevens)...\nComment: verborgen vlag: JVT{png_magic_bytes}\n',
  '/cases/zaak-2026-0442/bewijs.dd': '...(forensische schijfkopie, 8 GB, afgekort)...\n',
  '/cases/zaak-2026-0442/chain-of-custody.txt':
    'Zaak 2026-0442 — Team Cybercrime\nInbeslagname: 02-10-2026 09:14\nWrite-blocker: Tableau T8u (SN 44102)\nImager: dd / dcfldd\nControle: sha256sum voor en na kopie\n',
};

CS.registerRoom({
  id: 'schijf-bestandssysteem-forensie',
  path: 'forensie',
  order: 3,
  title: 'Schijf- en bestandssysteemforensie',
  icon: '💽',
  difficulty: 'Gemiddeld',
  minutes: 70,
  summary: 'Hoe een schijf data opslaat, wat er echt gebeurt als je een bestand "verwijdert", en hoe je met magic bytes, slack space en file carving verborgen bewijs terugvindt.',
  objectives: [
    'Uitleggen hoe opslag werkt (sectoren, clusters) en wat FAT, exFAT, NTFS en ext4 onderscheidt',
    'Beschrijven wat er met een bestand gebeurt als je het verwijdert, en waarom recovery vaak mogelijk is',
    'Slack space en unallocated space herkennen en uitleggen waar verborgen data zit',
    'Een bestandstype herkennen aan de magic bytes (bestandssignatuur), ook zonder extensie',
    'File carving uitleggen: bestanden terugvinden op basis van signaturen zonder bestandssysteem',
    'De integriteit van bewijs aantonen met hashing, en MAC-tijden kritisch lezen',
  ],
  tasks: [
    {
      title: 'Taak 1 — De digitale plaats delict: schijfforensie',
      content: `
        <p>Stel je voor: de Politie neemt bij een inval een laptop in beslag. Op die schijf kan het bewijs staan dat een zaak maakt of breekt: een verwijderd document, een foto, een chatgeschiedenis. Als <strong>digitaal rechercheur</strong> is jouw taak om die schijf te onderzoeken zonder er ook maar één byte aan te veranderen, en om daarna te kunnen uitleggen — desnoods voor de rechter — hoe je aan je bewijs komt. Dat vakgebied heet <strong>schijfforensie</strong> (disk forensics).</p>

        <h3>Vergelijk het met een echte plaats delict</h3>
        <p>Een rechercheur die een woning onderzoekt, trekt handschoenen aan, fotografeert alles vóór hij iets aanraakt, en noteert precies wie wat wanneer deed. Digitaal doe je exact hetzelfde. Drie begrippen die je overal zult tegenkomen:</p>
        <ul>
          <li><strong>Machtiging</strong> — je hebt toestemming nodig (van de officier van justitie, de rechter-commissaris, of bij een bedrijf schriftelijke opdracht) om een gegevensdrager te onderzoeken. Zonder grondslag is je onderzoek onrechtmatig en je bewijs waardeloos.</li>
          <li><strong>Chain of custody</strong> (bewijsketen) — een sluitend logboek van wie het bewijs wanneer in handen had. Elke overdracht wordt vastgelegd. Zit er een gat in de keten, dan kan de verdediging het bewijs onderuithalen.</li>
          <li><strong>Forensische kopie</strong> (image) — je werkt nooit op het origineel. Je maakt een exacte, bit-voor-bit kopie (vaak een <code>.dd</code>- of E01-bestand) via een <strong>write-blocker</strong>: een apparaat dat schrijfacties naar de schijf fysiek onmogelijk maakt.</li>
        </ul>

        <div class="callout info"><strong>Nederlandse context:</strong> grote en complexe digitale onderzoeken lopen vaak via het <strong>NFI</strong> (Nederlands Forensisch Instituut) en het <strong>Team Cybercrime</strong> van de Politie. Zij hanteren strikte procedures juist omdat digitaal bewijs zo makkelijk (per ongeluk) te veranderen is.</div>

        <h3>Waarom bit-voor-bit?</h3>
        <p>Als je een bestand gewoon kopieert (met Verkenner of <code>cp</code>), krijg je alleen de <em>zichtbare</em> bestanden. Een forensische kopie pakt de <strong>hele schijf</strong>, inclusief lege ruimte, restjes van verwijderde bestanden en verborgen hoeken. Juist dáár zit vaak het interessantste bewijs. In deze room leer je waar die restjes vandaan komen en hoe je ze terugvindt.</p>
      `,
      questions: [
        { q: 'Wat is de belangrijkste reden om op een forensische kopie te werken in plaats van op de originele schijf?', options: ['Een kopie is sneller te doorzoeken', 'Zo verander je het originele bewijs niet en blijft het bruikbaar in een zaak', 'Een kopie is kleiner', 'Het origineel is versleuteld'], answer: 1, explain: 'Je werkt op een exacte kopie zodat het origineel onaangetast blijft en als betrouwbaar bewijs overeind blijft.' },
        { q: 'Hoe heet het logboek dat bijhoudt wie het bewijs wanneer in handen had?', answer: ['chain of custody', 'bewijsketen', 'chain-of-custody'], hint: 'Engelse term met "chain"; het Nederlandse woord is "bewijsketen".', explain: 'De chain of custody (bewijsketen) legt elke overdracht vast; een gat erin maakt bewijs aanvechtbaar.' },
        { q: 'Welk apparaat voorkomt fysiek dat je per ongeluk naar de in beslag genomen schijf schrijft?', answer: ['write-blocker', 'writeblocker', 'write blocker'], hint: 'Engelse term; het "blokkeert" een bepaalde actie.', explain: 'Een write-blocker laat alleen lezen toe, zodat de bron gegarandeerd ongewijzigd blijft.' },
      ],
    },

    {
      title: 'Taak 2 — Hoe een schijf data opslaat: sectoren en clusters',
      content: `
        <p>Voordat je verborgen data kunt terugvinden, moet je snappen hoe een schijf data <em>bewaart</em>. Onder de motorkap is het verrassend simpel.</p>

        <h3>Sectoren: de kleinste blokjes</h3>
        <p>Een schijf is opgedeeld in gelijke blokjes die <strong>sectoren</strong> heten. Traditioneel is een sector <strong>512 bytes</strong> (nieuwere schijven gebruiken 4096 bytes, "Advanced Format"). De schijf zelf weet niets van bestanden; hij kent alleen genummerde sectoren.</p>

        <h3>Clusters: de blokjes van het bestandssysteem</h3>
        <p>Het <strong>bestandssysteem</strong> (file system) is de administratie die bijhoudt welke sectoren bij welk bestand horen. Het werkt niet per sector, maar bundelt sectoren tot <strong>clusters</strong> (ook wel "allocation units"). Een cluster is bijvoorbeeld 8 sectoren = 4096 bytes (4 KB). Een cluster is de <strong>kleinste eenheid</strong> die het bestandssysteem aan één bestand kan toewijzen.</p>

        <div class="callout tip"><strong>Analogie:</strong> zie een sector als één postvakje en een cluster als een rij van acht postvakjes die altijd samen worden verhuurd. Zelfs als je maar één briefje te bewaren hebt, huur je de hele rij. De lege postvakjes in die rij blijven voor jou gereserveerd — onthoud dat, want daar komt straks "slack space" vandaan.</div>

        <figure class="diagram">
          <svg viewBox="0 0 440 120" role="img" aria-label="Sectoren gebundeld tot een cluster">
            <text x="0" y="16" fill="currentColor" font-size="13">1 cluster = 8 sectoren (hier 4096 bytes)</text>
            <rect x="0" y="30" width="48" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <rect x="48" y="30" width="48" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <rect x="96" y="30" width="48" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <rect x="144" y="30" width="48" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <rect x="192" y="30" width="48" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <rect x="240" y="30" width="48" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <rect x="288" y="30" width="48" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <rect x="336" y="30" width="48" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <text x="12" y="55" fill="currentColor" font-size="13">512</text>
            <text x="0" y="92" fill="currentColor" font-size="13">elk blokje = 1 sector (512 bytes)</text>
          </svg>
          <figcaption>Het bestandssysteem wijst ruimte toe per cluster, niet per losse sector.</figcaption>
        </figure>

        <h3>HDD en SSD</h3>
        <p>Een <strong>HDD</strong> (harde schijf) heeft draaiende magnetische schijven en een leeskop — vergelijk het met een platenspeler. Een <strong>SSD</strong> gebruikt flashgeheugen zonder bewegende delen: veel sneller, maar forensisch lastiger. SSD's gebruiken namelijk <strong>TRIM</strong>, dat verwijderde blokken op de achtergrond écht leegmaakt. Op een HDD blijft verwijderde data meestal veel langer staan dan op een SSD.</p>
      `,
      questions: [
        { q: 'Wat is de kleinste eenheid die een bestandssysteem aan één bestand toewijst?', options: ['Een byte', 'Een sector', 'Een cluster', 'Een partitie'], answer: 2, explain: 'Het bestandssysteem werkt per cluster (een bundel sectoren); dat is de kleinste toewijsbare eenheid.' },
        { q: 'Hoeveel bytes is een klassieke sector?', answer: ['512'], hint: 'Een macht van twee; nieuwere schijven gebruiken 4096.', explain: 'De klassieke sectorgrootte is 512 bytes; Advanced Format-schijven gebruiken 4096.' },
        { q: 'Waarom is verwijderde data op een SSD vaak sneller écht weg dan op een HDD?', options: ['SSD\'s zijn kleiner', 'Door TRIM worden verwijderde blokken op de achtergrond leeggemaakt', 'SSD\'s versleutelen alles', 'HDD\'s hebben geen clusters'], answer: 1, explain: 'TRIM maakt vrijgegeven flashblokken actief leeg, waardoor recovery op SSD vaak niet meer lukt.' },
      ],
    },

    {
      title: 'Taak 3 — Bestandssystemen en de MFT',
      content: `
        <p>Er zijn meerdere bestandssystemen, elk met een eigen manier van administratie voeren. Als rechercheur herken je ze en weet je welk systeem de rijkste sporen achterlaat.</p>

        <table>
          <thead><tr><th>Bestandssysteem</th><th>Waar je het vindt</th><th>Kenmerk</th></tr></thead>
          <tbody>
            <tr><td><strong>FAT32</strong></td><td>Oude USB-sticks, SD-kaartjes, camera's</td><td>Simpel, maximaal 4 GB per bestand, weinig metadata</td></tr>
            <tr><td><strong>exFAT</strong></td><td>Grote USB-sticks en SD-kaarten</td><td>Als FAT, maar zonder de 4 GB-limiet</td></tr>
            <tr><td><strong>NTFS</strong></td><td>Windows-systeemschijven</td><td>Rijk aan metadata, rechten, logging — een goudmijn voor forensie</td></tr>
            <tr><td><strong>ext4</strong></td><td>De meeste Linux-systemen</td><td>Modern Linux-bestandssysteem met journaling</td></tr>
          </tbody>
        </table>

        <h3>De MFT: de inhoudsopgave van NTFS</h3>
        <p>Het hart van NTFS is de <strong>Master File Table</strong>, kortweg de <strong>$MFT</strong>. Zie het als de complete inhoudsopgave van de schijf: voor <em>elk</em> bestand en elke map staat er een regel in met de naam, de grootte, de tijdstempels en een verwijzing naar de clusters waar de data staat.</p>

        <div class="callout tip"><strong>Analogie:</strong> de $MFT is de kaartenbak van een oude bibliotheek. Gooi je een boek weg, dan haal je meestal alleen het kaartje door; het boek staat nog even in het magazijn. Zo blijft in de $MFT vaak nog een spoor van een "verwijderd" bestand staan.</div>

        <p>Een slim detail: heel kleine bestanden (minder dan ongeveer 700–900 bytes) worden volledig <em>in</em> de $MFT zelf opgeslagen — "MFT-resident". Je hoeft dan niet eens naar de dataclusters te zoeken; het bestand staat letterlijk in de inhoudsopgave. De $MFT is daarom vaak het eerste wat een onderzoeker uitleest.</p>

        <details>
          <summary>Extra: wat zijn alternate data streams (ADS)?</summary>
          <p>NTFS kan aan één bestand meerdere "streams" hangen. Naast de gewone inhoud kun je in een verborgen stream data meesmokkelen, bijvoorbeeld <code>rapport.txt:geheim.exe</code>. In Verkenner zie je alleen <code>rapport.txt</code>. Aanvallers gebruiken ADS om dingen te verstoppen; een forensisch onderzoeker weet ernaar te kijken.</p>
        </details>
      `,
      questions: [
        { q: 'Welk bestandssysteem bevat de $MFT en is het rijkst aan forensische metadata?', options: ['FAT32', 'exFAT', 'NTFS', 'ext4'], answer: 2, explain: 'NTFS (Windows) houdt in de $MFT uitgebreide metadata bij; dat maakt het een rijke bron.' },
        { q: 'Hoe heet de centrale "inhoudsopgave" van een NTFS-schijf?', answer: ['$MFT', 'MFT', 'master file table'], hint: 'Een tabel; de afkorting begint met een dollarteken in NTFS.', explain: 'De Master File Table ($MFT) bevat voor elk bestand een record met naam, tijden en clusterverwijzingen.' },
        { q: 'Op welk bestandssysteem loop je tegen een limiet van 4 GB per bestand aan?', options: ['NTFS', 'ext4', 'FAT32', 'exFAT'], answer: 2, explain: 'FAT32 kan geen enkel bestand groter dan 4 GB opslaan; exFAT loste dat op.' },
      ],
    },

    {
      title: 'Taak 4 — "Verwijderd" is niet weg: recovery, slack en unallocated space',
      content: `
        <p>Dit is misschien wel de belangrijkste les van de hele room, en meteen de reden dat schijfforensie zo krachtig is.</p>

        <h3>Wat gebeurt er echt bij "verwijderen"?</h3>
        <p>Als je een bestand naar de prullenbak sleept en die leegt, denk je dat het weg is. Maar het bestandssysteem doet iets veel luiers: het haalt alleen het <strong>kaartje uit de kaartenbak</strong>. De ruimte wordt gemarkeerd als "vrij" (beschikbaar om te hergebruiken), maar de <strong>eigenlijke data blijft op de schijf staan</strong> — totdat er iets anders overheen wordt geschreven.</p>
        <p>Zolang die clusters niet zijn overschreven, kun je het bestand vaak gewoon terughalen. Dat heet <strong>recovery</strong>. Pas als nieuwe data over die sectoren heen wordt geschreven, is het oude bestand echt verloren.</p>

        <div class="callout info"><strong>Gevolg voor onderzoek:</strong> een verdachte die "alles heeft gewist" heeft vaak niets gewist — alleen de verwijzingen weggehaald. Daarom kun je met forensische tools verwijderde foto's, documenten en berichten regelmatig reconstrueren.</div>

        <h3>Slack space: het restje in het laatste cluster</h3>
        <p>Weet je nog dat ruimte per cluster wordt toegewezen? Stel: een cluster is 4096 bytes en je bestand is maar 100 bytes. Dan "verhuurt" het bestandssysteem toch het hele cluster. De overige 3996 bytes heten <strong>slack space</strong>. En hier zit de clou: in die ruimte kunnen nog <em>oude, verwijderde</em> gegevens staan van een vorig bestand dat daar ooit stond. Forensisch onderzoekers vissen uit slack space soms stukjes van eerder gewiste bestanden op.</p>

        <figure class="diagram">
          <svg viewBox="0 0 400 90" role="img" aria-label="Een cluster deels gevuld met een bestand, de rest is slack space">
            <rect x="0" y="25" width="140" height="40" fill="var(--accent-soft)" stroke="currentColor" />
            <rect x="140" y="25" width="260" height="40" fill="var(--surface-2)" stroke="currentColor" />
            <text x="18" y="50" fill="currentColor" font-size="13">bestand (100 B)</text>
            <text x="180" y="50" fill="currentColor" font-size="13">slack space (oude data?)</text>
            <text x="0" y="82" fill="currentColor" font-size="13">1 cluster (4096 B)</text>
          </svg>
          <figcaption>Een bestand vult zelden een cluster precies; de rest is slack space.</figcaption>
        </figure>

        <h3>Unallocated space: de grote vrije ruimte</h3>
        <p><strong>Unallocated space</strong> (niet-toegewezen ruimte) is alle ruimte die op dit moment niet aan een bestand is toegewezen. Veel daarvan is "vrij", maar bevat de data van eerder verwijderde bestanden waar nog niets overheen kwam. Dit is het jachtgebied voor de techniek uit de volgende taak: file carving.</p>
      `,
      questions: [
        { q: 'Wat gebeurt er technisch gezien meestal als je een bestand "verwijdert" en de prullenbak leegt?', options: ['De data wordt direct met nullen overschreven', 'Alleen de verwijzing wordt weggehaald; de data blijft tot overschrijven', 'De schijf wordt opnieuw geformatteerd', 'Het bestand wordt versleuteld'], answer: 1, explain: 'Het bestandssysteem markeert de ruimte als vrij maar laat de data staan tot er iets overheen wordt geschreven — vandaar dat recovery kan.' },
        { q: 'Hoe heet de ongebruikte ruimte tussen het einde van een bestand en het einde van het laatste cluster?', answer: ['slack space', 'slack', 'file slack'], hint: 'Engelse term; "speling" of "restruimte".', explain: 'Slack space is de rest van het laatste cluster; daar kunnen resten van eerdere bestanden in zitten.' },
        { q: 'Wat is unallocated space?', options: ['Ruimte die kapot is', 'Ruimte die nu niet aan een bestand is toegewezen (vaak met resten van verwijderde bestanden)', 'Ruimte die het BIOS gebruikt', 'Versleutelde ruimte'], answer: 1, explain: 'Unallocated space is niet-toegewezen ruimte; veel ervan bevat nog data van verwijderde bestanden.' },
      ],
    },

    {
      title: 'Taak 5 — Magic bytes: een bestandstype herkennen aan zijn bytes',
      content: `
        <p>Een bestandsnaam liegt makkelijk. Iemand noemt een programma <code>vakantiefoto.jpg</code> of een database-dump <code>verdacht.bin</code> — de extensie zegt niets over wat er écht in zit. Gelukkig verraadt bijna elk bestandsformaat zichzelf aan de <strong>eerste paar bytes</strong>. Die herkenningsbytes heten de <strong>magic bytes</strong> of de <strong>bestandssignatuur</strong> (file signature).</p>

        <div class="callout tip"><strong>Analogie:</strong> magic bytes zijn als de eerste maten van een liedje. Ook zonder de titel herken je het nummer meteen aan de intro. Zo herken je een PNG, een PDF of een ZIP aan de eerste bytes, ongeacht hoe het bestand heet.</div>

        <h3>De signaturen die je uit je hoofd wilt kennen</h3>
        <table>
          <thead><tr><th>Type</th><th>Magic bytes (hex)</th><th>Als tekst</th></tr></thead>
          <tbody>
            <tr><td>PNG-afbeelding</td><td><code>89 50 4E 47</code></td><td><code>.PNG</code></td></tr>
            <tr><td>JPEG-afbeelding</td><td><code>FF D8 FF</code></td><td>—</td></tr>
            <tr><td>PDF-document</td><td><code>25 50 44 46</code></td><td><code>%PDF</code></td></tr>
            <tr><td>ZIP / DOCX / XLSX</td><td><code>50 4B 03 04</code></td><td><code>PK..</code></td></tr>
            <tr><td>ELF (Linux-programma)</td><td><code>7F 45 4C 46</code></td><td><code>.ELF</code></td></tr>
            <tr><td>EXE (Windows-programma)</td><td><code>4D 5A</code></td><td><code>MZ</code></td></tr>
          </tbody>
        </table>
        <p>Twee leuke weetjes: een <strong>DOCX</strong> begint met <code>PK</code> omdat het eigenlijk een ingepakt ZIP-bestand is. En de <code>MZ</code> van een EXE verwijst naar Mark Zbikowski, een van de architecten van MS-DOS.</p>

        <h3>Lees nu zelf de bytes</h3>
        <p>Hieronder zie je de hex-dump van het bestand <code>verdacht.bin</code>. Links staan de bytes (hexadecimaal), rechts de ASCII-weergave. Doe twee dingen:</p>
        <ol>
          <li>Kijk naar de <strong>eerste bytes</strong> en bepaal welk bestandstype dit werkelijk is (de extensie <code>.bin</code> zegt niets).</li>
          <li>Lees de <strong>ASCII-kolom</strong> rechts goed door; ergens staat een leesbare vlag verstopt tussen de bytes.</li>
        </ol>
        <div class="callout info"><strong>Les:</strong> dit is precies hoe <code>file</code> (uit de volgende taak) werkt. Het negeert de extensie en kijkt alleen naar de magic bytes.</div>
      `,
      lab: {
        type: 'hexviewer',
        filename: 'verdacht.bin',
        hex: PNG_HEX,
      },
      questions: [
        { q: 'Welk bestandstype is verdacht.bin werkelijk, gezien de eerste bytes 89 50 4E 47?', options: ['Een PDF-document', 'Een PNG-afbeelding', 'Een Windows-EXE', 'Een ZIP-archief'], answer: 1, explain: '89 50 4E 47 (".PNG") is de signatuur van een PNG-afbeelding; de .bin-extensie was misleidend.' },
        { q: 'Welke vlag staat verstopt in de ASCII-kolom van de hex-dump?', answer: ['JVT{png_magic_bytes}'], encoded: true, hint: 'Lees de rechterkolom; de vlag staat na "verborgen vlag:".', explain: 'In de ASCII-weergave is de tekst JVT{png_magic_bytes} leesbaar, ook al staat hij als losse bytes op de schijf.' },
        { q: 'Welke magic bytes horen bij een PDF-document?', options: ['FF D8 FF', '50 4B 03 04', '25 50 44 46', '7F 45 4C 46'], answer: 2, explain: '25 50 44 46 is ASCII voor "%PDF", het begin van elk PDF-bestand.' },
      ],
    },

    {
      title: 'Taak 6 — File carving, metadata en MAC-tijden',
      content: `
        <p>Nu combineren we de vorige twee taken. Je weet dat verwijderde data in unallocated space blijft staan (taak 4) en dat elk bestandstype herkenbare magic bytes heeft (taak 5). Samen leveren ze een krachtige techniek op.</p>

        <h3>File carving: bestanden redden zonder bestandssysteem</h3>
        <p>Soms is de "kaartenbak" (de $MFT of de FAT) beschadigd of gewist, of je kijkt naar rauwe unallocated space zonder administratie. Dan weet je niet meer wélke bytes bij welk bestand horen. <strong>File carving</strong> lost dat op: de tool scant de rauwe bytes op zoek naar bekende <strong>magic bytes</strong> (het begin van een bestand) en vaak ook naar het <strong>einde</strong> (bijvoorbeeld <code>FF D9</code> voor JPEG). Alles ertussen "snijdt" het eruit als een hersteld bestand.</p>

        <div class="callout tip"><strong>Analogie:</strong> stel je hebt een grote bak met versnipperd papier. Je kent de koptekst van elk document ("FACTUUR", "RECEPT"). Je zoekt alle koppen, en knipt vanaf elke kop tot de volgende het hele document eruit — ook al is de inhoudsopgave weg. Dat is carving. Bekende tools zijn <em>PhotoRec</em> en <em>Scalpel</em>.</div>
        <p>De grens van carving: raakt een bestand <strong>gefragmenteerd</strong> (in losse stukken over de schijf verspreid), dan plakt carving soms de verkeerde stukken aan elkaar. Daarom blijft de $MFT, als die er nog is, de betrouwbaarste bron.</p>

        <h3>Metadata en de MAC-tijden</h3>
        <p>Naast de inhoud bewaart een bestandssysteem <strong>metadata</strong>: gegevens óver het bestand. De bekendste zijn de <strong>MAC-tijden</strong>:</p>
        <ul>
          <li><strong>M — Modified</strong>: wanneer de inhoud voor het laatst is gewijzigd.</li>
          <li><strong>A — Accessed</strong>: wanneer het bestand voor het laatst is geopend/gelezen.</li>
          <li><strong>C — Created</strong>: wanneer het bestand is aangemaakt op deze schijf.</li>
        </ul>
        <p>Met MAC-tijden bouw je een <strong>tijdlijn</strong> van wat er wanneer gebeurde — onmisbaar in een onderzoek. Maar wees kritisch, om twee redenen:</p>
        <div class="callout warn"><strong>Let op tijdzones:</strong> tijdstempels worden soms in UTC bewaard en soms in lokale tijd. Reken altijd om naar één referentie (bijvoorbeeld Nederlandse tijd), anders trek je verkeerde conclusies over "wie was wanneer actief".</div>
        <div class="callout danger"><strong>Let op manipulatie:</strong> tijdstempels zijn te vervalsen (timestomping). Een aanvaller kan de MAC-tijden van zijn malware op een oude datum zetten om onder de radar te blijven. Vergelijk daarom meerdere bronnen (bijvoorbeeld de twee tijdensets die NTFS per bestand bewaart) in plaats van blind op één tijd te vertrouwen.</div>

        <h3>Hashing: bewijs dat niets is veranderd</h3>
        <p>Hoe toon je aan dat jouw kopie identiek is aan het origineel én dat je er niets aan hebt veranderd? Met een <strong>hash</strong> (bijvoorbeeld SHA-256): een vaste "vingerafdruk" van de data. Verandert er ook maar één bit, dan verandert de hash volledig. Je berekent de hash vóór het kopiëren en erna; zijn ze gelijk, dan is de kopie bewijsbaar intact. Die hashes leg je vast in je rapport en in de chain of custody.</p>
      `,
      questions: [
        { q: 'Wat doet file carving?', options: ['Het versleutelt bestanden', 'Het herstelt bestanden op basis van magic bytes, zonder de administratie van het bestandssysteem', 'Het wist bestanden veilig', 'Het verkleint bestanden'], answer: 1, explain: 'Carving zoekt in rauwe data naar bekende begin- (en eind)signaturen en snijdt daartussen de bestanden eruit.' },
        { q: 'Waar staan de M, A en C in de MAC-tijden voor?', answer: ['modified accessed created', 'modified, accessed, created', 'gewijzigd geopend aangemaakt'], hint: 'Modified, Accessed, Created.', explain: 'Modified (gewijzigd), Accessed (geopend) en Created (aangemaakt) vormen samen de tijdlijn van een bestand.' },
        { q: 'Waarom vertrouw je niet blind op een enkele tijdstempel?', options: ['Omdat tijdstempels niet bestaan in NTFS', 'Omdat ze vervalst (getimestompt) kunnen zijn en in verschillende tijdzones staan', 'Omdat ze altijd in UTC staan', 'Omdat ze te groot zijn'], answer: 1, explain: 'Tijdstempels kunnen gemanipuleerd zijn en in UTC of lokale tijd staan; vergelijk daarom meerdere bronnen.' },
        { q: 'Waarmee toon je aan dat je forensische kopie bit-voor-bit gelijk is aan het origineel?', answer: ['hash', 'hashing', 'sha256', 'sha-256', 'checksum'], hint: 'Een vaste "vingerafdruk" zoals SHA-256.', explain: 'Een hash (bv. SHA-256) over bron en kopie moet identiek zijn; dat bewijst dat er niets is veranderd.' },
      ],
    },

    {
      title: 'Taak 7 — Onderzoek in de terminal',
      content: `
        <p>Tijd om het echt te doen. Je werkt op de forensische kopie van zaak <strong>2026-0442</strong>, die netjes onder <code>/cases/zaak-2026-0442/</code> staat. Je gaat drie klassieke handelingen uitvoeren: een onbekend bestand identificeren, de leesbare tekst eruit halen, en de integriteit van de schijfkopie controleren.</p>

        <h3>Stap 1 — Identificeer het bestandstype</h3>
        <p>De extensie <code>.bin</code> zegt niets. Laat <code>file</code> naar de magic bytes kijken. Typ exact:</p>
        <pre><code>file verdacht.bin</code></pre>

        <h3>Stap 2 — Haal de leesbare strings eruit</h3>
        <p>Met <code>strings</code> trek je alle leesbare tekst uit een binair bestand — ideaal om verstopte URL's, namen of vlaggen te vinden. Je kunt ook de rauwe bytes bekijken met <code>xxd</code>. Typ:</p>
        <pre><code>strings verdacht.bin</code></pre>
        <p>En om de eerste bytes als hex te zien:</p>
        <pre><code>xxd verdacht.bin</code></pre>
        <p>Let goed op de uitvoer van <code>strings</code>: ergens staat een vlag.</p>

        <h3>Stap 3 — Controleer de integriteit van de schijfkopie</h3>
        <p>Bereken de SHA-256 van de forensische kopie, zodat je die kunt vergelijken met de hash die bij de inbeslagname is vastgelegd. Typ:</p>
        <pre><code>sha256sum bewijs.dd</code></pre>
        <div class="callout tip"><strong>In de praktijk:</strong> je noteert deze hash in je rapport en in de chain of custody. Komt hij overeen met de hash van vóór de kopie, dan staat vast dat je op een ongewijzigde kopie werkt.</div>
      `,
      lab: {
        type: 'terminal',
        shell: 'bash',
        user: 'rechercheur', host: 'nfi-lab',
        home: '/cases/zaak-2026-0442', cwd: '/cases/zaak-2026-0442',
        motd: 'Forensisch werkstation (read-only image). Start met: file verdacht.bin',
        fs: { ...FORENSIE_FS },
        denied: ['/root'],
        commands: {
          'file verdacht.bin': 'verdacht.bin: PNG image data, 64 x 64, 8-bit/color RGBA, non-interlaced',
          'file bewijs.dd': 'bewijs.dd: DOS/MBR boot sector; partition 1 : ID=0x7 (NTFS), start-CHS ...',
          'strings verdacht.bin': `PNG
IHDR
tEXtComment
verborgen vlag: JVT{strings_onthult_sporen}
Software: JVT CameraApp v2.1
Created with care op het NFI-oefenlab
IEND`,
          'xxd verdacht.bin': `00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452  .PNG........IHDR
00000010: 0000 0040 0000 0040 0806 0000 0000 0000  ...@...@........
00000020: 2c74 4558 7443 6f6d 6d65 6e74 0076 6572  ,tEXtComment.ver
00000030: 626f 7267 656e 2076 6c61 673a 204a 5654  borgen vlag: JVT`,
          'sha256sum bewijs.dd': 'ae3e49d8b680d40b2d626d96e037e4c72d30abde93ee581aa6c6544fe92fca11  bewijs.dd',
          'sha256sum verdacht.bin': '4fdbd68914075174b2282d75f6c47ae08d4b7b1627ea23b31537b0deb08e6669  verdacht.bin',
        },
      },
      questions: [
        { q: 'Wat meldt "file verdacht.bin" als werkelijk bestandstype?', answer: ['png', 'png image data', 'png image', 'een png'], hint: 'file kijkt naar de magic bytes, niet naar de extensie.', explain: 'file leest 89 50 4E 47 en rapporteert "PNG image data", ongeacht de .bin-extensie.' },
        { q: 'Welke vlag vind je in de uitvoer van "strings verdacht.bin"?', answer: ['JVT{strings_onthult_sporen}'], hint: 'strings haalt alle leesbare tekst uit het bestand; lees de regels.', explain: 'strings toont de verstopte tekstregel met de vlag JVT{strings_onthult_sporen}.' },
        { q: 'Welk commando bewijst dat de schijfkopie niet is veranderd sinds de inbeslagname?', answer: ['sha256sum bewijs.dd', 'sha256sum', 'sha256sum ./bewijs.dd'], hint: 'Een hash-commando over het .dd-bestand.', explain: 'sha256sum bewijs.dd berekent de vingerafdruk; die moet gelijk zijn aan de hash uit de chain of custody.' },
      ],
    },
  ],

  terms: [
    { term: 'Sector', def: 'Kleinste fysieke blokje op een schijf, klassiek 512 bytes (nieuwer 4096).' },
    { term: 'Cluster', def: 'Bundel sectoren die het bestandssysteem als één eenheid toewijst; de kleinste toewijsbare ruimte.' },
    { term: 'Bestandssysteem', def: 'De administratie die bijhoudt welke clusters bij welk bestand horen, bijv. FAT, exFAT, NTFS of ext4.' },
    { term: '$MFT', def: 'Master File Table: de centrale inhoudsopgave van NTFS met voor elk bestand naam, tijden en clusterverwijzingen.' },
    { term: 'Recovery', def: 'Een verwijderd bestand terughalen zolang de clusters nog niet zijn overschreven.' },
    { term: 'Slack space', def: 'Ongebruikte ruimte tussen het einde van een bestand en het einde van zijn laatste cluster; kan resten van oude bestanden bevatten.' },
    { term: 'Unallocated space', def: 'Niet aan een bestand toegewezen ruimte; bevat vaak nog data van verwijderde bestanden.' },
    { term: 'Magic bytes', def: 'De eerste herkenningsbytes van een bestand (bestandssignatuur), bijv. 89 50 4E 47 voor PNG.' },
    { term: 'File carving', def: 'Bestanden terugvinden in rauwe data op basis van magic bytes, zonder de administratie van het bestandssysteem.' },
    { term: 'Metadata', def: 'Gegevens over een bestand (naam, grootte, tijdstempels) in plaats van de inhoud zelf.' },
    { term: 'MAC-tijden', def: 'Modified, Accessed en Created: de tijdstempels waarmee je een tijdlijn van een bestand bouwt.' },
    { term: 'Timestomping', def: 'Het vervalsen van tijdstempels om sporen te verbergen.' },
    { term: 'Write-blocker', def: 'Apparaat dat schrijfacties naar een in beslag genomen schijf fysiek onmogelijk maakt, zodat het bewijs intact blijft.' },
    { term: 'Hash', def: 'Vaste "vingerafdruk" van data (bijv. SHA-256) om integriteit aan te tonen; verandert volledig bij elke wijziging.' },
  ],

  resources: [
    { title: 'Wikipedia — List of file signatures (magic bytes)', url: 'https://en.wikipedia.org/wiki/List_of_file_signatures' },
    { title: 'Forensic Focus — nieuws en artikelen over digitale forensie', url: 'https://www.forensicfocus.com/' },
    { title: 'SANS — Digital Forensics & Incident Response', url: 'https://www.sans.org/' },
    { title: 'CyberDefenders — gratis forensische oefenzaken', url: 'https://cyberdefenders.org/' },
  ],
});
