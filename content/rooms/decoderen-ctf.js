/* Room: Decoderen & multi-decode (CTF) */
CS.registerRoom({
  id: 'decoderen-ctf',
  path: 'offensief',
  order: 8,
  title: 'Decoderen & multi-decode (CTF)',
  icon: '✨',
  difficulty: 'Gemiddeld',
  minutes: 55,
  summary: 'Herken en pel laag na laag codering af — Base64, Base32, hex, binair, ROT13 en Morse — en leer hoe je in een echte CTF een onbekende blob aanpakt met de multi-decoder en CyberChef.',
  objectives: [
    'Uitleggen waarom codering (encoding) geen versleuteling is en dus geen beveiliging biedt',
    'Base64, Base32, hex, binair en Morse herkennen aan hun vorm en tekenset',
    'Een gelaagde codering "afpellen" in de juiste volgorde met CyberChef en de multi-decoder',
    'Een met ROT13 verstopte vlag binnen een Base32-laag terugvinden',
    'Een systematische aanpak kiezen voor een onbekende blob: magic bytes, frequenties, de multi-decoder en CyberChef',
  ],
  tasks: [
    {
      title: 'Taak 1 — Codering is geen versleuteling (snelle herhaling)',
      content: `
        <p>Welkom bij de decodeer-room. In een CTF (Capture The Flag) kom je voortdurend data tegen die er op het
        eerste gezicht onleesbaar uitziet: een reeks letters en cijfers, een blok nullen en enen, of een rij punten en
        streepjes. Vaak is dat geen echte versleuteling, maar <strong>codering</strong> — en codering draai je zonder
        sleutel gewoon terug. Voor we gaan oefenen, halen we de drie begrippen die iedereen door elkaar haalt kort op.</p>

        <ul>
          <li><strong>Coderen (encoding):</strong> data in een ander formaat zetten, <em>zonder sleutel</em>. Denk aan
          Base64, hex, binair of Morse. Iedereen die het schema kent, draait het terug. Dit beschermt niets — het is
          bedoeld voor transport, niet voor geheimhouding.</li>
          <li><strong>Versleutelen (encryptie):</strong> data vertrouwelijk maken met een <em>sleutel</em>. Zonder de
          juiste sleutel blijft de ciphertext onleesbaar.</li>
          <li><strong>Hashen:</strong> een eenrichtings-vingerafdruk maken die je niet kunt terugrekenen. Voor
          integriteit en wachtwoordopslag, niet om later "uit te pakken".</li>
        </ul>

        <div class="callout warn">
          <strong>Veelgemaakte fout:</strong> "Deze tekst is Base64, dus veilig opgeslagen." Nee. Base64 is
          <em>codering</em>. Vind je ergens een Base64-string, dan is de inhoud letterlijk één klik verwijderd van
          leesbaar. Behandel gecodeerde data nooit als beschermd.
        </div>

        <p>In de rest van deze room leer je codering juist herkennen en terugdraaien. We gebruiken twee soorten
        gereedschap: de <strong>multi-decoder</strong> (die automatisch laag na laag probeert af te pellen, zoals de
        "Magic"-functie van CyberChef) en <strong>CyberChef</strong> zelf (waar je een <em>recept</em> van bewerkingen
        met de hand bouwt). In een echte CTF wissel je constant tussen die twee: eerst de automaat laten raden, en bij
        een hardnekkige blob zelf een recept bouwen.</p>

        <div class="callout danger">
          <strong>Ethiek:</strong> oefen deze technieken alleen op materiaal dat <em>voor jou bedoeld is</em> — de labs
          hieronder, CTF-uitdagingen of je eigen data. Andermans data ontcijferen zonder toestemming kan strafbaar zijn
          (computervredebreuk, art. 138ab Sr).
        </div>
      `,
      questions: [
        { q: 'Wat heb je nodig om een Base64-string terug te draaien naar de oorspronkelijke tekst?', options: ['Niets bijzonders — alleen kennis van het schema, er is geen sleutel', 'Een geheime sleutel die alleen de afzender heeft', 'Een certificaat van een CA'], answer: 0, explain: 'Codering heeft geen sleutel; iedereen die weet dat het Base64 is, draait het meteen terug.' },
        { q: 'Welke van deze drie is NIET omkeerbaar?', options: ['Base64-codering', 'AES-encryptie (met sleutel)', 'Hashing (SHA-256)'], answer: 2, explain: 'Een hash is eenrichtingsverkeer; uit de hash krijg je de invoer niet terug. Codering en encryptie zijn wel omkeerbaar.' },
        { q: 'Ik begrijp dat ik deze decodeer-technieken alleen oefen op materiaal dat voor mij bedoeld is (labs, CTF of eigen data).', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — Base64: de klassieker herkennen en afpellen',
      content: `
        <p><strong>Base64</strong> is veruit de codering die je het vaakst tegenkomt. Het zet willekeurige bytes om in
        een tekenset van 64 "veilige" tekens, zodat binaire data netjes door tekstkanalen (e-mail, URL's, JSON, tokens)
        kan reizen. Die tekenset is: de hoofdletters <code>A-Z</code>, de kleine letters <code>a-z</code>, de cijfers
        <code>0-9</code>, en de tekens <code>+</code> en <code>/</code>.</p>

        <h3>Hoe herken je Base64?</h3>
        <ul>
          <li><strong>De tekenset:</strong> alleen letters, cijfers en soms <code>+</code> en <code>/</code>. Geen
          spaties, geen leestekens als <code>!</code> of <code>?</code>.</li>
          <li><strong>De lengte:</strong> Base64 verwerkt 3 bytes tot 4 tekens. De string is daarom bijna altijd een
          veelvoud van 4 tekens lang.</li>
          <li><strong>Padding:</strong> als de lengte niet precies uitkomt, vult Base64 aan met het teken
          <code>=</code> (één of twee stuks) aan het eind. Zie je een string die eindigt op <code>=</code> of
          <code>==</code>, dan is Base64 je eerste gok.</li>
        </ul>

        <p>Een voorbeeld: het woord <code>Man</code> (3 bytes) wordt in Base64 <code>TWFu</code> (4 tekens). Het woord
        <code>Ma</code> (2 bytes) wordt <code>TWE=</code> — zie je de ene <code>=</code> als opvulling.</p>

        <h3>De multi-decoder</h3>
        <p>In plaats van handmatig gokken laat je de <strong>multi-decoder</strong> het werk doen. Die herkent de vorm,
        probeert Base64 (en allerlei andere coderingen) en toont een "ketting" met het leesbare resultaat. De tool
        herkent ook automatisch een vlag in het formaat <code>JVT{...}</code> en zet die bovenaan.</p>

        <h3>Aan de slag</h3>
        <p>In het lab staat een Base64-string. Laat de multi-decoder hem afpellen en lees de vlag. Let op dat de string
        eindigt op <code>=</code> — een klassiek Base64-signaal.</p>
      `,
      lab: { type: 'multidecode', input: 'SlZUe2Jhc2U2NF9iYXNpc30=' },
      questions: [
        { q: 'Laat de multi-decoder de Base64-string in het lab afpellen. Wat is de vlag?', answer: ['JVT{base64_basis}'], encoded: true, hint: 'De tool herkent Base64 vanzelf; klik de leesbare ketting aan.', explain: 'Base64 is in één stap terug te draaien — precies waarom het geen beveiliging is.' },
        { q: 'Welk teken gebruikt Base64 als opvulling (padding) aan het eind van een string?', answer: ['=', 'isgelijkteken', 'gelijkteken'], hint: 'Je ziet het soms één keer, soms twee keer, helemaal aan het eind.', explain: 'Het =-teken vult de laatste groep aan; het is een sterk herkenningspunt voor Base64.' },
        { q: 'Welke tekens horen NIET thuis in een standaard Base64-string?', options: ['Spaties en leestekens zoals ! en ?', 'De hoofdletters A-Z', 'De cijfers 0-9'], answer: 0, explain: 'Base64 gebruikt alleen A-Z, a-z, 0-9, + en /, plus = als padding.' },
      ],
    },

    {
      title: 'Taak 3 — Pel de ui: gelaagde codering met CyberChef',
      content: `
        <p>In een CTF is één laagje codering zelden het hele verhaal. Vaak is data eerst gecodeerd, en dáárna nóg een
        keer op een andere manier. Zoiets noemen we <strong>gelaagde codering</strong> — en het afpellen voelt als een
        ui pellen: laag voor laag, tot de leesbare kern tevoorschijn komt.</p>

        <h3>Volgorde is alles</h3>
        <p>De gouden regel: je pelt af in de <strong>omgekeerde volgorde</strong> van hoe het is opgebouwd. Werd de
        tekst eerst als Base64 gecodeerd en daarna als hex? Dan draai je eerst de hex terug en pas daarna de Base64.
        Laatste erop, eerste eraf — net als een stapel borden.</p>

        <p>De string in het lab is zo'n stapel. Het is <strong>hex</strong> (hexadecimaal: alleen de tekens
        <code>0-9</code> en <code>a-f</code>, in paren van twee die elk één byte vormen). Draai je de hex terug, dan
        krijg je... weer een Base64-string. En die Base64 bevat de vlag.</p>

        <h3>Een recept bouwen in CyberChef</h3>
        <p>Dit is het moment om <strong>CyberChef</strong> te gebruiken: daar bouw je zelf een <em>recept</em> door
        bewerkingen onder elkaar te slepen. Ze worden van boven naar beneden toegepast. Voor deze opgave bouw je:</p>
        <ol>
          <li><strong>Hex decoderen</strong> (From Hex) — bovenaan, want dat is de buitenste laag.</li>
          <li><strong>Base64 decoderen</strong> (From Base64) — eronder, voor de laag die daar tevoorschijn komt.</li>
        </ol>
        <div class="callout tip">
          <strong>Tip:</strong> twijfel je over de volgorde? Zet één bewerking neer en kijk naar het tussenresultaat.
          Ziet het er na "Hex decoderen" uit als nette Base64 (letters, cijfers, misschien een <code>=</code>), dan zit je
          goed en plak je er de volgende bewerking onder. Zo pel je stap voor stap, met controle na elke laag.
        </div>

        <h3>Aan de slag</h3>
        <p>Open het CyberChef-lab. De hex-string staat al in de invoer (de bytes staan met spaties uit elkaar, zodat
        je de paren goed ziet). Bouw het recept <code>Hex decoderen</code> gevolgd door <code>Base64 decoderen</code>
        en lees de vlag die eruit rolt.</p>
      `,
      lab: { type: 'cyberchef', input: '53 6c 5a 55 65 33 52 33 5a 57 56 66 62 47 46 6e 5a 57 35 39' },
      questions: [
        { q: 'Welke bewerking zet je in CyberChef bovenaan (pas je als eerste toe) op deze string?', answer: ['Hex decoderen', 'hex decoderen', 'hex', 'van hex', 'from hex'], hint: 'De string bestaat uit paren van 0-9 en a-f; dat is de buitenste laag.', explain: 'Je pelt in omgekeerde volgorde af: eerst de hex eraf, dan komt de Base64 tevoorschijn.' },
        { q: 'Bouw het recept Hex decoderen -> Base64 decoderen. Wat is de vlag?', answer: ['JVT{twee_lagen}'], encoded: true, hint: 'Na "Hex decoderen" zie je een Base64-string; zet daar "Base64 decoderen" onder.', explain: 'Twee omkeerbare lagen stapelen maakt data niet geheim — het is nog steeds alleen codering.' },
        { q: 'In welke volgorde pel je gelaagde codering af?', options: ['In omgekeerde volgorde van hoe het is opgebouwd — laatste erop, eerste eraf', 'Altijd eerst Base64, wat de volgorde ook was', 'De volgorde maakt niet uit, elk resultaat is goed'], answer: 0, explain: 'Coderen is een stapel: de laatst toegevoegde laag haal je als eerste weg.' },
      ],
    },

    {
      title: 'Taak 4 — Base32 + ROT13: een laag binnen een laag',
      content: `
        <p><strong>Base32</strong> is het minder bekende broertje van Base64. Het doet hetzelfde — bytes omzetten in
        leesbare tekens — maar met een kleinere tekenset: de <strong>hoofdletters</strong> <code>A-Z</code> en de
        cijfers <code>2-7</code>. Meer niet. Geen kleine letters, geen <code>0</code>, <code>1</code>, <code>8</code> of
        <code>9</code>.</p>

        <h3>Base32 of Base64?</h3>
        <ul>
          <li><strong>Base64:</strong> hoofdletters én kleine letters, alle cijfers, soms <code>+</code>/<code>/</code>.</li>
          <li><strong>Base32:</strong> alléén hoofdletters en de cijfers <code>2</code> tot en met <code>7</code>.
          Een string die volledig in hoofdletters staat zonder kleine letters en zonder een <code>0</code>, <code>1</code>,
          <code>8</code> of <code>9</code> is een sterke aanwijzing voor Base32.</li>
          <li>Base32 is ook iets langer voor dezelfde data (8 tekens per 5 bytes, tegen 4 per 3 bij Base64) en gebruikt
          <code>=</code> als padding.</li>
        </ul>

        <h3>En dan nog een laagje: ROT13</h3>
        <p>In deze opgave zit onder de Base32-laag niet meteen de vlag, maar nog een laag <strong>ROT13</strong>. ROT13
        is een Caesarcijfer dat elke letter 13 plaatsen opschuift; het is zijn eigen omkering, dus één keer toepassen
        draait het terug. Na het afpellen van Base32 zie je iets dat <em>bijna</em> op een vlag lijkt — maar de letters
        kloppen niet. Bijvoorbeeld een stukje als <code>WIG{...}</code> in plaats van <code>JVT{...}</code>. Dat is het
        signaal dat er nog een ROT13-laag overheen ligt.</p>

        <div class="callout info">
          <strong>Herkenningstruc:</strong> ziet een "vlag" er qua vorm goed uit (accolades, underscores) maar lijken de
          letters verhaspeld? Probeer dan ROT13 of een andere Caesar-verschuiving. De multi-decoder doet dit automatisch
          en toont per laag alle kandidaten, zodat je de leesbare ketting <code>Base32 -> ROT13 -> tekst</code> ziet
          ontstaan.
        </div>

        <h3>Aan de slag</h3>
        <p>In het lab staat een Base32-string (alles hoofdletters en cijfers 2-7). Laat de multi-decoder hem afpellen;
        onder de Base32 vind je de ROT13-laag en daaronder de vlag.</p>
      `,
      lab: { type: 'multidecode', input: 'K5EUO63FMJTV64LOMFPTGMT5' },
      questions: [
        { q: 'Laat de multi-decoder de ketting Base32 -> ROT13 afpellen. Wat is de vlag?', answer: ['JVT{rot_dan_32}'], encoded: true, hint: 'Na Base32 lijkt de vlag verhaspeld; dat is de ROT13-laag. Volg de kandidaat met JVT{...}.', explain: 'De multi-decoder stapelt decoderingen tot er leesbare tekst (en een herkende vlag) uitkomt.' },
        { q: 'Waaraan herken je Base32 in plaats van Base64?', options: ['Alleen hoofdletters A-Z en de cijfers 2-7, geen kleine letters', 'Het bevat juist veel kleine letters en het cijfer 0', 'Het bestaat uitsluitend uit nullen en enen'], answer: 0, explain: 'De beperkte tekenset (A-Z, 2-7) is het duidelijkste kenmerk van Base32.' },
        { q: 'Je pelt een laag af en krijgt WIG{...} in plaats van JVT{...}. Wat is je volgende stap?', options: ['ROT13 (of een andere Caesar-verschuiving) proberen; de vorm klopt maar de letters zijn verschoven', 'Concluderen dat er geen vlag is', 'De string nog een keer als Base64 decoderen'], answer: 0, explain: 'Een vlag met kloppende vorm maar verhaspelde letters wijst op een letterverschuiving zoals ROT13.' },
      ],
    },

    {
      title: 'Taak 5 — Binair en Morse: terug naar de bouwstenen',
      content: `
        <p>Soms is de codering een stuk "lager niveau": je krijgt de data in <strong>binair</strong> (nullen en enen) of
        zelfs in <strong>Morse</strong> (punten en streepjes). Allebei zijn ze prima met de multi-decoder of met de hand
        terug te lezen.</p>

        <h3>Binair: 8 bits per teken</h3>
        <p>Computers slaan tekst op als getallen volgens de <strong>ASCII</strong>-tabel. Elk teken is één byte, oftewel
        <strong>8 bits</strong>. De hoofdletter <code>J</code> is bijvoorbeeld decimaal 74, en dat is binair
        <code>01001010</code>. Zie je een blok van nullen en enen in groepjes van acht, dan is het bijna zeker binaire
        ASCII. Je leest het door elk groepje van 8 bits om te zetten naar het bijbehorende teken.</p>

        <div class="callout tip">
          <strong>Tip:</strong> tel de bits. Een nette binaire tekst is altijd een veelvoud van 8 bits lang (eventueel
          met spaties tussen de bytes). Klopt dat niet, dan mis je misschien een stukje of is het geen 8-bits ASCII.
        </div>

        <h3>Morse: punten, streepjes en een schuine streep</h3>
        <p>Morse codeert letters als korte (<code>.</code>) en lange (<code>-</code>) signalen. Tussen letters staat een
        spatie; tussen woorden vaak een schuine streep <code>/</code>. De beroemde SOS is <code>... --- ...</code>. De
        multi-decoder heeft een Morse-tabel aan boord en zet een reeks punten en streepjes meteen om naar tekst.</p>

        <h3>Aan de slag</h3>
        <p>Het lab staat ingesteld op een binaire string. Laat de multi-decoder hem omzetten naar tekst en lees de vlag.
        Plak daarna de volgende Morse-code in hetzelfde lab om te oefenen met een andere codering:</p>
        <pre><code>.... . .-.. .-.. --- / .-- . .-. . .-.. -..</code></pre>
        <p>Noteer de twee woorden die daaruit komen (hoofdletters, met een spatie ertussen).</p>
      `,
      lab: { type: 'multidecode', input: '01001010 01010110 01010100 01111011 01100010 01101001 01101110 01100001 01101001 01110010 01011111 01101100 01100101 01100101 01110011 01100010 01100001 01100001 01110010 01111101' },
      questions: [
        { q: 'Zet de binaire string in het lab om naar tekst. Wat is de vlag?', answer: ['JVT{binair_leesbaar}'], encoded: true, hint: 'Elk groepje van 8 bits is één teken; de multi-decoder doet dit vanzelf.', explain: 'Binaire ASCII is gewoon codering: 8 bits per teken, zonder sleutel terug te lezen.' },
        { q: 'Decodeer de Morse-code uit de taak. Welke twee woorden komen eruit?', answer: ['HELLO WERELD', 'hello wereld'], hint: '.... = H, . = E, .-.. = L ... en de / is een woordscheiding.', explain: 'De code luidt HELLO WERELD; de schuine streep scheidt de twee woorden.' },
        { q: 'Uit hoeveel bits bestaat één teken in standaard (ASCII) binaire codering?', answer: ['8', 'acht', '8 bits'], hint: 'Eén byte.', explain: 'Eén teken = één byte = 8 bits; daarom is nette binaire tekst een veelvoud van 8 bits lang.' },
      ],
    },

    {
      title: 'Taak 6 — Een onbekende blob aanpakken in een echte CTF',
      content: `
        <p>Tot nu toe wist je telkens ongeveer wat je kreeg. In een echte CTF staat er alleen: "hier is een bestand" of
        "decodeer dit". Dan heb je een <strong>systematische aanpak</strong> nodig. Hieronder een werkwijze die je bijna
        altijd verder helpt.</p>

        <h3>Stap 1 — Kijk naar de vorm en de tekenset</h3>
        <p>De tekenset verraadt vaak de codering:</p>
        <table>
          <thead><tr><th>Zie je...</th><th>Denk aan...</th></tr></thead>
          <tbody>
            <tr><td>Alleen <code>0</code> en <code>1</code>, in groepjes van 8</td><td>Binair (ASCII)</td></tr>
            <tr><td>Alleen <code>0-9</code> en <code>a-f</code>, in paren</td><td>Hex</td></tr>
            <tr><td>Letters, cijfers, misschien <code>=</code> aan het eind</td><td>Base64</td></tr>
            <tr><td>Alléén hoofdletters en <code>2-7</code></td><td>Base32</td></tr>
            <tr><td>Punten, streepjes en <code>/</code></td><td>Morse</td></tr>
            <tr><td>Verhaspelde letters, vorm van een vlag klopt wel</td><td>ROT13 / Caesar</td></tr>
          </tbody>
        </table>

        <h3>Stap 2 — Magic bytes bij een bestand</h3>
        <p>Krijg je een echt bestand of een stuk rauwe bytes, kijk dan naar de eerste bytes: de <strong>magic bytes</strong>
        (bestandssignatuur). Die vertellen je het bestandstype, ongeacht de extensie. Een paar om te onthouden:</p>
        <ul>
          <li><code>89 50 4E 47</code> — een PNG-afbeelding (de ASCII-tekens <code>.PNG</code>).</li>
          <li><code>FF D8 FF</code> — een JPEG-afbeelding.</li>
          <li><code>25 50 44 46</code> — een PDF (de tekens <code>%PDF</code>).</li>
          <li><code>50 4B 03 04</code> — een ZIP-archief (de tekens <code>PK</code>).</li>
        </ul>

        <h3>Stap 3 — Laat een multi-decoder raden</h3>
        <p>Heb je tekst die op codering lijkt, gooi hem dan in de <strong>multi-decoder</strong> (of CyberChef's
        "Magic"). Die probeert automatisch allerlei lagen en scoort de resultaten op leesbaarheid. Vaak rolt de vlag er
        in één klap uit, inclusief de gevonden ketting (bijvoorbeeld <code>Hex -> Base64 -> tekst</code>).</p>

        <h3>Stap 4 — Zelf een recept bouwen in CyberChef</h3>
        <p>Blijft de automaat steken, dan ga je met de hand aan de slag in <strong>CyberChef</strong>. Daar stapel je
        bewerkingen, kijk je na elke stap naar het tussenresultaat, en probeer je gericht dingen als een XOR met een
        sleutel of een Caesar-verschuiving. En vergeet de frequenties niet: als een cijfertekst nog steeds de
        letterverdeling van gewone taal heeft (veel <code>e</code>'s), dan is het waarschijnlijk een simpele substitutie.</p>

        <div class="callout tip">
          <strong>Vuistregel:</strong> automaat eerst, handwerk daarna. De multi-decoder bespaart je de meeste tijd;
          CyberChef geeft je de controle als het ingewikkeld wordt. Samen pakken ze bijna elke codeer-opgave.
        </div>
      `,
      questions: [
        { q: 'Je krijgt een blob die alleen uit nullen en enen bestaat, keurig in groepjes van acht. Wat is je eerste gok?', options: ['Binaire ASCII — elk groepje van 8 bits is één teken', 'Base32, want dat gebruikt ook cijfers', 'Een JPEG-afbeelding'], answer: 0, explain: 'Alleen 0 en 1 in groepjes van 8 is het handtekeningpatroon van binaire ASCII.' },
        { q: 'Hoe heet de eerste paar bytes van een bestand waarmee je het bestandstype herkent, los van de extensie?', answer: ['magic bytes', 'magicbytes', 'bestandssignatuur', 'magic number'], hint: 'Bijvoorbeeld 89 50 4E 47 voor een PNG.', explain: 'Magic bytes (de bestandssignatuur) verraden het echte type, ook als de extensie liegt.' },
        { q: 'Wat is in een CTF de slimste eerste zet bij een onbekende stuk gecodeerde tekst?', options: ['Een multi-decoder / CyberChef "Magic" laten raden, en pas daarna zelf een recept bouwen', 'Meteen beginnen met het brute-forcen van AES-sleutels', 'De tekst negeren omdat codering geen beveiliging is'], answer: 0, explain: 'De automaat pelt de meeste lagen gratis af; handmatig werk in CyberChef bewaar je voor de lastige gevallen.' },
      ],
    },
  ],
  terms: [
    { term: 'Codering (encoding)', def: 'Data omzetten naar een ander formaat zonder sleutel (Base64, hex, binair, Morse); omkeerbaar door iedereen en dus geen beveiliging.' },
    { term: 'Base64', def: 'Codering die bytes omzet in de tekenset A-Z, a-z, 0-9, + en /, met = als opvulling; verwerkt 3 bytes tot 4 tekens.' },
    { term: 'Base32', def: 'Codering met de kleinere tekenset A-Z en 2-7 (alleen hoofdletters); langer dan Base64 en te herkennen aan het ontbreken van kleine letters.' },
    { term: 'Hexadecimaal (hex)', def: 'Schrijfwijze van bytes met de tekens 0-9 en a-f; elke twee tekens vormen één byte.' },
    { term: 'Binair', def: 'Data als nullen en enen; in ASCII is elk teken 8 bits (één byte), dus nette binaire tekst is een veelvoud van 8 bits lang.' },
    { term: 'Morse', def: 'Codering van letters als korte (punt) en lange (streep) signalen, met een spatie tussen letters en vaak een / tussen woorden.' },
    { term: 'ROT13', def: 'Caesarcijfer met verschuiving 13; zijn eigen omkering. Verraadt zich doordat de vorm van een vlag klopt maar de letters verhaspeld zijn.' },
    { term: 'Gelaagde codering', def: 'Data die meerdere keren achter elkaar is gecodeerd; je pelt af in omgekeerde volgorde (laatste erop, eerste eraf).' },
    { term: 'Multi-decoder', def: 'Gereedschap dat automatisch lagen codering probeert af te pellen en de leesbare ketting toont, zoals de "Magic"-functie van CyberChef.' },
    { term: 'CyberChef', def: 'Webtool waarin je een recept van bewerkingen (decoderen, XOR, hashen) onder elkaar bouwt; ze worden van boven naar beneden toegepast.' },
    { term: 'Magic bytes', def: 'De eerste bytes van een bestand (bestandssignatuur) die het type verraden, ongeacht de extensie, zoals 89 50 4E 47 voor PNG.' },
    { term: 'Padding', def: 'Opvulling aan het eind van een Base64- of Base32-string met het teken =, om de laatste groep compleet te maken.' },
  ],
  resources: [
    { title: 'CyberChef (officiële versie)', url: 'https://gchq.github.io/CyberChef/' },
    { title: 'Wikipedia — Base64', url: 'https://en.wikipedia.org/wiki/Base64' },
    { title: 'Wikipedia — Base32', url: 'https://en.wikipedia.org/wiki/Base32' },
    { title: 'Wikipedia — List of file signatures (magic bytes)', url: 'https://en.wikipedia.org/wiki/List_of_file_signatures' },
  ],
});
