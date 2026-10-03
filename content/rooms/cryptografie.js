/* Room: Cryptografie — coderen, versleutelen, hashen */
CS.registerRoom({
  id: 'cryptografie',
  path: 'security-kern',
  order: 1,
  title: 'Cryptografie: coderen, versleutelen, hashen',
  icon: '🔐',
  difficulty: 'Gemiddeld',
  minutes: 90,
  summary: 'Leer het verschil tussen encoding, encryptie en hashing, en hoe AES, RSA, TLS en veilige wachtwoordopslag echt werken.',
  objectives: [
    'Encoding, encryptie en hashing uit elkaar houden en uitleggen waarom Base64 geen beveiliging is',
    'Het verschil tussen symmetrische (AES) en asymmetrische (RSA, ECC) encryptie beschrijven',
    'Uitleggen hoe sleuteluitwisseling, digitale handtekeningen, certificaten en TLS samenwerken',
    'Benoemen welke eigenschappen een goede hashfunctie heeft en waarom MD5 en SHA-1 niet meer veilig zijn',
    'Een gecodeerde vlag decoderen en een SHA-256 berekenen met CyberChef',
    'Wachtwoorden veilig opslaan met een salt en een langzame hash (bcrypt, scrypt, Argon2)',
  ],
  tasks: [
    {
      title: 'Taak 1 — Encoding, encryptie en hashing: drie verschillende dingen',
      content: `
        <p>Drie begrippen worden voortdurend door elkaar gehaald. Toch doen ze iets totaal anders.
        Als je ze uit elkaar kunt houden, begrijp je meteen waarom veel "beveiliging" die je online ziet
        helemaal geen beveiliging is.</p>

        <h3>1. Encoding (coderen)</h3>
        <p>Encoding zet gegevens om in een ander formaat zodat ze veilig door een systeem kunnen reizen —
        niet om ze geheim te maken. Denk aan <strong>Base64</strong>, <strong>hex</strong> (hexadecimaal) en
        <strong>URL-encoding</strong> (<code>%20</code> voor een spatie). Er is <em>geen sleutel</em> nodig:
        iedereen die het schema kent, draait het zo weer terug. Een analogie: je tekst in morse omzetten.
        Leuk, maar niet geheim — iedereen met een morsetabel leest mee.</p>
        <div class="callout warn">
          <strong>Veelgemaakte fout:</strong> "Base64 is versleuteling." Nee. Base64 is <em>codering</em>.
          Er zit geen sleutel in. Vind je ergens een Base64-string, dan is de inhoud één klik verwijderd van leesbaar.
          Behandel Base64-tekst nooit als "veilig opgeslagen".
        </div>

        <h3>2. Encryptie (versleutelen)</h3>
        <p>Encryptie maakt gegevens <strong>vertrouwelijk</strong>. Zonder de juiste <strong>sleutel</strong>
        is de uitvoer (de <em>ciphertext</em>) onleesbaar. Met de sleutel draai je het terug naar de
        oorspronkelijke tekst (<em>plaintext</em>). Dit is wél geheim, mits de sleutel geheim blijft.</p>

        <h3>3. Hashing</h3>
        <p>Een hashfunctie zet een invoer om in een vaste, korte "vingerafdruk". Dit is
        <strong>eenrichtingsverkeer</strong>: uit de hash krijg je de oorspronkelijke tekst niet terug.
        Je gebruikt het om te controleren of iets ongewijzigd is of om wachtwoorden op te slaan — nooit
        om iets later weer "uit te pakken".</p>

        <table>
          <thead><tr><th></th><th>Omkeerbaar?</th><th>Sleutel nodig?</th><th>Doel</th></tr></thead>
          <tbody>
            <tr><td>Encoding</td><td>Ja, door iedereen</td><td>Nee</td><td>Transport / formaat</td></tr>
            <tr><td>Encryptie</td><td>Ja, met sleutel</td><td>Ja</td><td>Vertrouwelijkheid</td></tr>
            <tr><td>Hashing</td><td>Nee</td><td>Nee</td><td>Integriteit / opslag</td></tr>
          </tbody>
        </table>

        <p>Open het CyberChef-lab hieronder. Links kies je bewerkingen zoals <code>Van Base64</code> of
        <code>Van Hex</code>; je plakt een string in het invoervak en ziet direct het resultaat. De vlag in
        het lab staat als Base64. Vind hem. Plak daarna de hex-string uit de vraag erin en kies
        <code>Van Hex</code>.</p>
      `,
      lab: { type: 'cyberchef', input: 'SlZUe2Jhc2U2NF9pc19zbGVjaHRzX2NvZGVyaW5nfQ==' },
      questions: [
        { q: 'Is Base64 een vorm van versleuteling?', options: ['Ja, het maakt tekst geheim', 'Nee, het is codering zonder sleutel', 'Alleen met een wachtwoord'], answer: 1, explain: 'Base64 heeft geen sleutel. Iedereen kan het terugdraaien, dus het beschermt niets.' },
        { q: 'Decodeer de Base64-string in het lab. Wat is de vlag?', answer: ['JVT{base64_is_slechts_codering}'], encoded: true, hint: 'Kies in CyberChef de bewerking "Van Base64".', explain: 'Base64 is zo terug te draaien — precies waarom het geen beveiliging is.' },
        { q: 'Plak 4a56547b6865785f69735f6f6f6b5f6d6161725f636f646572696e677d in CyberChef en kies "Van Hex". Wat is de vlag?', answer: ['JVT{hex_is_ook_maar_codering}'], encoded: true, hint: 'Hex gebruikt de tekens 0-9 en a-f; elke twee tekens zijn één byte.', explain: 'Hex is net als Base64 alleen een andere schrijfwijze van dezelfde bytes.' },
        { q: 'Welke bewerking is NIET omkeerbaar?', options: ['Base64', 'AES-encryptie', 'Hashing (SHA-256)'], answer: 2, explain: 'Een hash is eenrichtingsverkeer; je krijgt de invoer er niet uit terug.' },
      ],
    },

    {
      title: 'Taak 2 — Klassieke cijfers: Caesar en ROT13',
      content: `
        <p>Voordat computers bestonden, versleutelden mensen al berichten. Die klassieke cijfers zijn
        tegenwoordig waardeloos als beveiliging, maar perfect om het idee te snappen: je neemt plaintext,
        past een regel toe, en krijgt ciphertext.</p>

        <h3>Het Caesarcijfer</h3>
        <p>Vernoemd naar Julius Caesar: je schuift elke letter een vast aantal plaatsen op in het alfabet.
        Bij een verschuiving van 3 wordt <code>a</code> een <code>d</code>, <code>b</code> een <code>e</code>,
        enzovoort. Het woord <code>geheim</code> wordt dan <code>jhkhlp</code>. De "sleutel" is het getal waarmee
        je schuift — en daar zit meteen het probleem: er zijn maar 25 zinvolle verschuivingen. Een aanvaller
        probeert ze gewoon allemaal (dat heet <em>brute force</em>) en is binnen een seconde klaar.</p>

        <h3>ROT13</h3>
        <p>ROT13 is een Caesarcijfer met een vaste verschuiving van 13. Omdat het alfabet 26 letters heeft,
        is ROT13 <strong>zijn eigen omkering</strong>: tweemaal ROT13 toepassen geeft de oorspronkelijke tekst.
        Je ziet het vroeger op forums om spoilers te verbergen — níet om iets echt geheim te houden.</p>
        <div class="callout info">
          <strong>Let op:</strong> ROT13 en Caesar raken alleen letters. Cijfers, de accolades
          <code>{ }</code> en underscores in een vlag blijven staan. Een versleutelde vlag ziet er daarom
          nog steeds "een beetje als een vlag" uit.
        </div>

        <h3>Waarom zijn ze zwak?</h3>
        <ul>
          <li><strong>Te kleine sleutelruimte:</strong> 25 mogelijkheden bij Caesar — triviaal om allemaal te proberen.</li>
          <li><strong>Geen echt sleutelgeheim:</strong> het algoritme <em>is</em> de sleutel; ken je ROT13, dan ben je binnen.</li>
          <li><strong>Frequentieanalyse:</strong> in het Nederlands komt de <code>e</code> het vaakst voor. Tel de letters
          in de ciphertext en je raadt de verschuiving zonder alles te proberen.</li>
        </ul>
        <p>De les: echte versleuteling leunt niet op een geheim algoritme, maar op een geheime sleutel die groot
        genoeg is (het <em>principe van Kerckhoffs</em>). Dat werken we in de volgende taken uit met AES en RSA.</p>

        <p>In het lab staat een met ROT13 versleutelde vlag. Kies de bewerking <code>ROT13</code> om hem te lezen.
        Daarna volgt een <strong>meerstaps</strong>-uitdaging: een vlag is eerst met ROT13 versleuteld en dáárna
        als Base64 gecodeerd. Je draait dat terug door eerst <code>Van Base64</code> en dan <code>ROT13</code> toe
        te passen.</p>
      `,
      lab: { type: 'cyberchef', input: 'WIG{xynffvrxr_pvwsref_mvwa_mjnx}' },
      questions: [
        { q: 'Decodeer jhkhlp met een Caesarcijfer (verschuiving 3 terug). Welk Nederlandse woord krijg je?', answer: ['geheim'], hint: 'Schuif elke letter drie plaatsen terug: j -> g, h -> e ...', explain: 'jhkhlp met drie terug is "geheim". Zo makkelijk is Caesar te kraken.' },
        { q: 'Pas ROT13 toe op de string in het lab. Wat is de vlag?', answer: ['JVT{klassieke_cijfers_zijn_zwak}'], encoded: true, hint: 'ROT13 is zijn eigen omkering; één keer toepassen is genoeg.', explain: 'ROT13 verbergt niets; het is binnen één klik leesbaar.' },
        { q: 'Meerstaps: neem V0lHe2dqcnJfbWpueHhyX3ludHJhfQ==, kies eerst "Van Base64" en daarna "ROT13". Wat is de vlag?', answer: ['JVT{twee_zwakke_lagen}'], encoded: true, hint: 'Twee zwakke lagen stapelen maakt het niet sterk. Eerst Base64 eraf, dan ROT13.', explain: 'Twee omkeerbare bewerkingen stapelen levert nog steeds geen echte beveiliging op.' },
        { q: 'Hoeveel zinvolle sleutels (verschuivingen) heeft een Caesarcijfer op het Latijnse alfabet?', answer: ['25'], hint: 'Een verschuiving van 0 verandert niets; alle andere letters van het alfabet min die ene.', explain: 'Met 25 mogelijkheden is brute-forcen een fluitje van een cent.' },
      ],
    },

    {
      title: 'Taak 3 — Symmetrische encryptie: één sleutel (AES)',
      content: `
        <p>Bij <strong>symmetrische encryptie</strong> gebruik je <em>dezelfde</em> sleutel om te versleutelen
        én te ontsleutelen. Analogie: een kluis met één sleutel. Wie de sleutel heeft, kan erin én eruit.</p>

        <h3>AES</h3>
        <p>De standaard van vandaag is <strong>AES</strong> (Advanced Encryption Standard), met sleutels van
        128, 192 of 256 bits. AES is een <em>blokcijfer</em>: het versleutelt gegevens in blokken van 16 bytes.
        Het is snel (moderne processors hebben er speciale instructies voor) en wordt wereldwijd vertrouwd —
        van je versleutelde harde schijf (BitLocker, FileVault) tot wifi (WPA2/WPA3) en de inhoud van een
        TLS-verbinding.</p>
        <p>Waarom is AES-256 veilig terwijl Caesar dat niet is? De sleutelruimte. 256 bits betekent ongeveer
        10<sup>77</sup> mogelijke sleutels. Alle computers op aarde samen zouden het heelal meerdere keren
        moeten overleven om ze allemaal te proberen. Brute force is dan geen optie.</p>

        <div class="callout tip">
          <strong>Tip:</strong> hoe je AES gebruikt is net zo belangrijk als dát je het gebruikt. Een blokcijfer
          heeft een <em>mode</em> nodig. Gebruik een moderne mode zoals <strong>GCM</strong> (die ook integriteit
          controleert) en nooit het ouderwetse <strong>ECB</strong>: dat laat patronen in je data gewoon zichtbaar.
          Gebruik ook per bericht een unieke <em>IV/nonce</em>.
        </div>

        <h3>Het sleutelbeheerprobleem</h3>
        <p>Hier wringt het bij symmetrische encryptie. Jij en ik moeten allebei dezelfde geheime sleutel hebben.
        Maar hoe krijg ik die sleutel bij jou zónder dat een afluisteraar hem onderschept? Hem meesturen in een
        mailtje kan niet — dan kan die afluisteraar alles lezen. Dit heet het
        <strong>sleutelbeheer- of sleuteldistributieprobleem</strong>.</p>
        <p>Nog een probleem: het aantal sleutels. Als tien mensen onderling veilig willen praten en iedereen een
        aparte sleutel per paar nodig heeft, zijn dat al 45 sleutels. Bij honderd mensen bijna 5000. Dat schaalt
        niet. De oplossing — asymmetrische encryptie en slimme sleuteluitwisseling — is het onderwerp van de
        volgende taak.</p>
      `,
      questions: [
        { q: 'Welke eigenschap is kenmerkend voor symmetrische encryptie?', options: ['Twee verschillende sleutels, een publieke en een private', 'Dezelfde sleutel versleutelt en ontsleutelt', 'Er is helemaal geen sleutel nodig'], answer: 1, explain: 'Symmetrisch = één gedeelde sleutel voor beide richtingen.' },
        { q: 'Welke moderne, breed vertrouwde symmetrische standaard wordt vandaag het meest gebruikt?', answer: ['AES'], hint: 'Advanced Encryption Standard.', explain: 'AES is snel en veilig en zit overal: schijfversleuteling, wifi, TLS.' },
        { q: 'Hoe heet het kernprobleem dat symmetrische encryptie alleen niet oplost?', options: ['Het sleutelbeheer-/sleuteldistributieprobleem', 'Dat AES te langzaam is', 'Dat de ciphertext te lang wordt'], answer: 0, explain: 'Je moet de gedeelde sleutel veilig bij de ander krijgen zonder dat die onderschept wordt.' },
        { q: 'Welke blokmode kun je beter vermijden omdat hij patronen in de data zichtbaar laat?', answer: ['ECB'], hint: 'De beruchte mode uit het "ECB-pinguïn"-plaatje.', explain: 'ECB versleutelt elk blok los en lekt zo patronen; gebruik GCM met een unieke nonce.' },
      ],
    },

    {
      title: 'Taak 4 — Asymmetrische encryptie: twee sleutels',
      content: `
        <p><strong>Asymmetrische encryptie</strong> (ook wel <em>public-key cryptografie</em>) lost het
        sleutelprobleem op met een geniale truc: iedereen krijgt een <strong>sleutelpaar</strong> — een
        <strong>publieke sleutel</strong> die je gerust mag rondstrooien, en een <strong>private sleutel</strong>
        die je nooit deelt. Wat je met de ene versleutelt, open je alleen met de andere.</p>

        <figure class="diagram">
          <svg viewBox="0 0 520 150">
            <rect x="10" y="50" width="110" height="50" rx="8" fill="var(--surface-2)" stroke="currentColor" />
            <text x="65" y="80" text-anchor="middle" fill="currentColor" font-size="13">Afzender</text>
            <rect x="400" y="50" width="110" height="50" rx="8" fill="var(--surface-2)" stroke="currentColor" />
            <text x="455" y="80" text-anchor="middle" fill="currentColor" font-size="13">Ontvanger</text>
            <line x1="120" y1="75" x2="400" y2="75" stroke="var(--accent)" />
            <text x="260" y="40" text-anchor="middle" fill="currentColor" font-size="13">versleutel met PUBLIEKE sleutel ontvanger</text>
            <text x="260" y="100" text-anchor="middle" fill="currentColor" font-size="13">ontsleutel met PRIVATE sleutel ontvanger</text>
          </svg>
          <figcaption>Vertrouwelijkheid: versleutel met de publieke sleutel van de ontvanger; alleen die kan het met zijn private sleutel openen.</figcaption>
        </figure>

        <h3>RSA en ECC</h3>
        <p><strong>RSA</strong> is het klassieke algoritme; de veiligheid leunt op het feit dat het ontbinden van
        een heel groot getal in priemfactoren extreem traag is. RSA-sleutels zijn daarom groot (2048 of 4096 bits).
        <strong>ECC</strong> (Elliptic Curve Cryptography) bereikt dezelfde sterkte met veel kleinere sleutels
        (een 256-bits ECC-sleutel is ruwweg zo sterk als RSA-3072), wat sneller is en zuiniger — ideaal voor
        telefoons en kleine apparaten.</p>
        <div class="callout info">
          <strong>Waarom niet alles asymmetrisch?</strong> Asymmetrische encryptie is traag en voor grote
          hoeveelheden data onpraktisch. In de praktijk combineer je: je gebruikt asymmetrische encryptie alléén
          om een verse <em>symmetrische</em> sleutel veilig uit te wisselen, en versleutelt daarna de echte data
          snel met AES. Dat heet een <em>hybride</em> systeem — precies wat TLS doet.
        </div>

        <h3>Sleuteluitwisseling: Diffie-Hellman</h3>
        <p>Met <strong>Diffie-Hellman</strong> kunnen twee partijen samen een gedeelde geheime sleutel
        afspreken terwijl ze alleen openbare berichten uitwisselen. De analogie met verf: jullie beginnen allebei
        met dezelfde publieke basiskleur, mengen daar ieder in het geheim een eigen kleur door, en wisselen de
        mengsels uit. Vervolgens mengt ieder zijn eigen geheime kleur door het ontvangen mengsel. Beiden komen op
        exact dezelfde eindkleur uit, terwijl een afluisteraar die de mengsels onderschept de geheime kleuren niet
        kan terugrekenen. De moderne variant <strong>ECDH</strong> doet dit op elliptische krommen. Doe je dit met
        telkens verse, tijdelijke sleutels (<em>ephemeral</em>), dan krijg je <strong>forward secrecy</strong>:
        zelfs als later een private sleutel uitlekt, blijven oude gesprekken onleesbaar.</p>

        <h3>Digitale handtekeningen</h3>
        <p>Je kunt het sleutelpaar ook andersom gebruiken, voor <strong>authenticiteit</strong> en
        <strong>onweerlegbaarheid</strong>. De afzender maakt een hash van het bericht en versleutelt die hash met
        zijn <em>private</em> sleutel: dat is de handtekening. Iedereen kan met de bijbehorende <em>publieke</em>
        sleutel controleren dat de handtekening klopt. Lukt dat, dan weet je zeker dat het bericht van de houder
        van de private sleutel komt én onderweg niet is gewijzigd.</p>
      `,
      questions: [
        { q: 'Je wilt een vertrouwelijk bericht aan Fatima sturen. Met welke sleutel versleutel je het?', options: ['Fatima\'s publieke sleutel', 'Fatima\'s private sleutel', 'Je eigen private sleutel'], answer: 0, explain: 'Alleen Fatima kan het dan openen, want alleen zij heeft de bijbehorende private sleutel.' },
        { q: 'Welk algoritme bereikt vergelijkbare sterkte als RSA met veel kleinere sleutels?', answer: ['ECC'], hint: 'Elliptic Curve Cryptography.', explain: 'ECC-256 is ruwweg zo sterk als RSA-3072, maar sneller en zuiniger.' },
        { q: 'Waarvoor wordt Diffie-Hellman gebruikt?', options: ['Het veilig afspreken van een gedeelde sleutel over een open kanaal', 'Het permanent opslaan van wachtwoorden', 'Het comprimeren van bestanden'], answer: 0, explain: 'DH laat twee partijen een gedeelde geheime sleutel afleiden zonder die ooit te versturen.' },
        { q: 'Met welke sleutel plaatst een afzender een digitale handtekening?', options: ['Zijn eigen private sleutel', 'De publieke sleutel van de ontvanger', 'Een gedeelde AES-sleutel'], answer: 0, explain: 'Hij tekent met zijn private sleutel; iedereen verifieert met zijn publieke sleutel.' },
        { q: 'Hoe heet de eigenschap dat oude gesprekken onleesbaar blijven, zelfs als later een private sleutel uitlekt?', answer: ['forward secrecy', 'perfect forward secrecy'], hint: 'Het ontstaat door per sessie verse, tijdelijke (ephemeral) sleutels te gebruiken.', explain: 'Forward secrecy bereik je met ephemeral Diffie-Hellman (DHE/ECDHE).' },
      ],
    },

    {
      title: 'Taak 5 — Certificaten, PKI en hoe TLS alles combineert',
      content: `
        <p>Asymmetrische encryptie heeft één zwakke plek: hoe weet je zeker dat een publieke sleutel écht van
        wie je denkt is? Als een aanvaller je zijn eigen publieke sleutel aansmeert als die van je bank, versleutel
        je netjes... naar de aanvaller. Dit noemen we een <strong>man-in-the-middle</strong>-aanval. De oplossing
        is een vertrouwensstructuur: certificaten en PKI.</p>

        <h3>Certificaten</h3>
        <p>Een <strong>digitaal certificaat</strong> koppelt een identiteit (bijvoorbeeld het domein
        <code>www.voorbeeld.nl</code>) aan een publieke sleutel. Een <strong>Certificate Authority</strong> (CA) —
        een partij die iedereen vertrouwt — controleert die identiteit en <em>ondertekent</em> het certificaat
        met háár private sleutel. Een certificaat is dus eigenlijk "een publieke sleutel plus een naam, digitaal
        ondertekend door een CA".</p>

        <h3>PKI en de vertrouwensketen</h3>
        <p><strong>PKI</strong> (Public Key Infrastructure) is het hele systeem van CA's, certificaten en regels
        eromheen. Je besturingssysteem en browser hebben een lijst met vertrouwde <strong>root-CA's</strong>. Een
        website-certificaat is meestal niet direct door een root ondertekend, maar door een <em>tussenliggende</em>
        CA, die weer door de root is ondertekend. Zo ontstaat een <strong>certificaatketen</strong> die eindigt
        bij een root die jouw apparaat al vertrouwt.</p>

        <figure class="diagram">
          <svg viewBox="0 0 520 90">
            <rect x="10" y="30" width="120" height="40" rx="8" fill="var(--surface-2)" stroke="currentColor" />
            <text x="70" y="55" text-anchor="middle" fill="currentColor" font-size="13">Root-CA</text>
            <line x1="130" y1="50" x2="200" y2="50" stroke="var(--accent)" />
            <rect x="200" y="30" width="120" height="40" rx="8" fill="var(--surface-2)" stroke="currentColor" />
            <text x="260" y="55" text-anchor="middle" fill="currentColor" font-size="13">Tussen-CA</text>
            <line x1="320" y1="50" x2="390" y2="50" stroke="var(--accent)" />
            <rect x="390" y="30" width="120" height="40" rx="8" fill="var(--surface-2)" stroke="currentColor" />
            <text x="450" y="55" text-anchor="middle" fill="currentColor" font-size="13">Website</text>
          </svg>
          <figcaption>De vertrouwensketen: de root ondertekent de tussen-CA, die ondertekent het certificaat van de website.</figcaption>
        </figure>

        <h3>Hoe TLS alles samenbrengt</h3>
        <p><strong>TLS</strong> (de "s" van HTTP<strong>S</strong>) combineert alles uit deze room in één handdruk:</p>
        <ol>
          <li>De server stuurt zijn <strong>certificaat</strong>. Je browser controleert de handtekeningketen tot
          een vertrouwde root, checkt of het certificaat bij het domein hoort, nog geldig is en niet is ingetrokken.</li>
          <li>Via <strong>(EC)DH</strong> spreken client en server een verse, gedeelde <strong>symmetrische</strong>
          sleutel af. De server bewijst met zijn <strong>private</strong> sleutel dat hij echt de houder van het
          certificaat is (<em>authenticatie</em> via een handtekening).</li>
          <li>De rest van het verkeer gaat snel en vertrouwelijk met <strong>AES</strong> (symmetrisch), met
          integriteitscontrole erbij.</li>
        </ol>
        <div class="callout tip">
          <strong>Tip:</strong> het hangslotje in de adresbalk betekent alleen dat de <em>verbinding</em> versleuteld
          is, niet dat de site te vertrouwen is. Ook phishingsites hebben tegenwoordig een gratis certificaat. Kijk
          dus altijd ook naar het <em>domein</em> zelf.
        </div>
      `,
      questions: [
        { q: 'Wat koppelt een digitaal certificaat aan elkaar?', options: ['Een identiteit (zoals een domein) en een publieke sleutel', 'Twee symmetrische sleutels', 'Een wachtwoord en een gebruikersnaam'], answer: 0, explain: 'Een certificaat zegt: "deze publieke sleutel hoort bij deze naam", ondertekend door een CA.' },
        { q: 'Wie ondertekent een certificaat zodat je het kunt vertrouwen?', answer: ['Certificate Authority', 'CA', 'certificaatautoriteit'], hint: 'De afkorting is CA.', explain: 'Een CA controleert de identiteit en tekent het certificaat met haar private sleutel.' },
        { q: 'Waarom gebruikt TLS zowel asymmetrische als symmetrische encryptie?', options: ['Asymmetrisch om veilig een symmetrische sleutel af te spreken, symmetrisch (AES) voor de snelle data erna', 'Puur toeval, het had ook met alleen RSA gekund', 'Om de verbinding langzamer en dus veiliger te maken'], answer: 0, explain: 'Hybride: asymmetrisch lost de sleuteluitwisseling op, symmetrisch doet het snelle werk.' },
        { q: 'Betekent een geldig hangslotje dat een website te vertrouwen is?', options: ['Nee, het zegt alleen dat de verbinding versleuteld is', 'Ja, dan is de site gegarandeerd echt', 'Alleen bij banken'], answer: 0, explain: 'Ook phishingsites hebben een certificaat; controleer altijd het domein zelf.' },
      ],
    },

    {
      title: 'Taak 6 — Hashfuncties en integriteit',
      content: `
        <p>Een <strong>cryptografische hashfunctie</strong> neemt een invoer van elke lengte en geeft een vaste,
        korte uitvoer: de <strong>hash</strong> of <em>digest</em>. SHA-256 geeft bijvoorbeeld altijd 256 bits
        (64 hextekens), of je er nu één letter of een hele film in stopt.</p>

        <h3>Eigenschappen van een goede hashfunctie</h3>
        <ul>
          <li><strong>Deterministisch:</strong> dezelfde invoer geeft altijd dezelfde hash.</li>
          <li><strong>Eenrichting (preimage-bestendig):</strong> uit de hash de invoer terugrekenen is onmogelijk.</li>
          <li><strong>Lawine-effect:</strong> één bitje veranderen in de invoer verandert de hele hash volledig.</li>
          <li><strong>Botsingsbestendig (collision resistant):</strong> het is onhaalbaar om twee verschillende
          invoeren te vinden met dezelfde hash.</li>
        </ul>

        <h3>Integriteitscontrole</h3>
        <p>Omdat de hash als een vingerafdruk werkt, gebruik je hashes om te controleren of een bestand onderweg
        niet is veranderd. Downloadsites publiceren vaak de SHA-256 van een installatiebestand. Download je het,
        dan bereken je zelf de hash en vergelijk je die. Komt er ook maar één teken niet overeen, dan is het
        bestand beschadigd of gemanipuleerd — niet installeren dus.</p>
        <div class="callout info">
          <strong>Integriteit vs. authenticiteit:</strong> een kale hash bewijst alleen dat de data niet
          <em>per ongeluk</em> veranderde. Een aanvaller die het bestand én de gepubliceerde hash kan aanpassen,
          komt ermee weg. Voor echte authenticiteit combineer je een hash met een geheim (een <strong>HMAC</strong>)
          of met een digitale handtekening.
        </div>

        <h3>Waarom MD5 en SHA-1 gebroken zijn</h3>
        <p><strong>MD5</strong> en <strong>SHA-1</strong> waren vroeger populair, maar onderzoekers hebben echte
        <em>botsingen</em> gevonden: twee verschillende invoeren met dezelfde hash. Dat ondermijnt precies de
        garantie die een hash moet geven. MD5-botsingen bereken je inmiddels in seconden; voor SHA-1 is in 2017
        de eerste praktische botsing gedemonstreerd ("SHAttered"). Gebruik ze daarom <strong>niet meer</strong>
        voor beveiliging — alleen nog hooguit als simpele checksum tegen toevallige fouten. De moderne keuze is de
        <strong>SHA-2-familie</strong> (zoals SHA-256) of <strong>SHA-3</strong>.</p>

        <p>Gebruik het CyberChef-lab om zelf een SHA-256 te berekenen. Typ in het invoervak het woord
        <code>integriteit</code> (alleen dat woord, kleine letters, geen spaties) en kies de bewerking
        <code>SHA2 256</code>. Lees de eerste 8 tekens van de hash af.</p>
      `,
      lab: { type: 'cyberchef', input: 'integriteit' },
      questions: [
        { q: 'Bereken de SHA-256 van het woord "integriteit" in het lab. Wat zijn de eerste 8 tekens van de hash?', answer: ['cb168abe'], hint: 'Kies SHA2 256 en lees de eerste acht tekens van links af.', explain: 'De volledige hash begint met cb168abe...; dezelfde invoer geeft altijd dezelfde hash (deterministisch).' },
        { q: 'Hoe heet de eigenschap dat één veranderd bitje in de invoer de hele hash verandert?', answer: ['lawine-effect', 'lawine', 'avalanche'], hint: 'In het Engels: avalanche effect.', explain: 'Het lawine-effect zorgt dat de hash onvoorspelbaar verandert bij de kleinste wijziging.' },
        { q: 'Waarom gelden MD5 en SHA-1 als onveilig voor beveiliging?', options: ['Er zijn praktische botsingen gevonden', 'Ze zijn te langzaam geworden', 'Ze geven een te lange hash'], answer: 0, explain: 'Gevonden botsingen breken de botsingsbestendigheid, de kern van een veilige hash.' },
        { q: 'Je downloadt een bestand en de SHA-256 komt niet overeen met de gepubliceerde waarde. Wat doe je?', options: ['Niet installeren; het bestand is beschadigd of gemanipuleerd', 'Toch installeren, een paar tekens verschil mag', 'De hash negeren, die is onbelangrijk'], answer: 0, explain: 'Elke afwijking betekent gewijzigde bytes; vertrouw het bestand niet.' },
      ],
    },

    {
      title: 'Taak 7 — Wachtwoorden veilig opslaan',
      content: `
        <p>Een dienst mag jouw wachtwoord nooit als leesbare tekst opslaan. Lekt de database, dan liggen meteen
        alle wachtwoorden op straat — en omdat mensen wachtwoorden hergebruiken, ook hun accounts elders. De
        oplossing is hashing, maar met een paar belangrijke aanvullingen.</p>

        <h3>Stap 1: hash het wachtwoord</h3>
        <p>Sla niet het wachtwoord op, maar de hash ervan. Bij het inloggen hash je het ingetypte wachtwoord
        opnieuw en vergelijk je de hashes. Maar een gewone snelle hash (zoals SHA-256) is hier juist een probleem:
        aanvallers kunnen er miljarden per seconde proberen.</p>

        <h3>Stap 2: voeg een salt toe</h3>
        <p>Een <strong>salt</strong> is een willekeurige, unieke waarde per wachtwoord die je er vóór het hashen
        bij plakt. Je slaat de salt gewoon naast de hash op (die hoeft niet geheim te zijn). Een salt doet twee
        dingen:</p>
        <ul>
          <li>Twee gebruikers met hetzelfde wachtwoord krijgen tóch verschillende hashes.</li>
          <li>Voorberekende tabellen (<strong>rainbow tables</strong>) worden waardeloos, want de aanvaller zou
          voor elke mogelijke salt een aparte tabel moeten bouwen.</li>
        </ul>

        <h3>Stap 3: gebruik een langzame hash</h3>
        <p>Snel is hier slecht. Je wilt een functie die juist <em>expres traag</em> en geheugenintensief is, zodat
        een aanvaller er maar weinig per seconde kan proberen terwijl jij bij het inloggen nauwelijks vertraging
        merkt. Daarvoor zijn speciale <strong>wachtwoordhashes</strong> ontworpen:</p>
        <table>
          <thead><tr><th>Functie</th><th>Kenmerk</th></tr></thead>
          <tbody>
            <tr><td><strong>bcrypt</strong></td><td>Beproefd, instelbare werkfactor (cost).</td></tr>
            <tr><td><strong>scrypt</strong></td><td>Ook geheugenintensief, lastiger met speciale hardware te versnellen.</td></tr>
            <tr><td><strong>Argon2</strong></td><td>De moderne aanrader (won de Password Hashing Competition), regelt tijd én geheugen.</td></tr>
          </tbody>
        </table>
        <div class="callout danger">
          <strong>Niet doen:</strong> wachtwoorden opslaan als platte tekst, als Base64 (dat is geen beveiliging!),
          of als kale MD5/SHA-1/SHA-256 zonder salt en zonder werkfactor. Dat is in de praktijk zo gekraakt.
        </div>
        <div class="callout info">
          <strong>Pepper:</strong> sommige systemen voegen naast de salt nog een geheime, serverbrede waarde toe
          (een <em>pepper</em>) die níet in de database staat maar in een sleutelkluis. Lekt alleen de database,
          dan mist de aanvaller de pepper.
        </div>
        <p>In de volgende room over wachtwoorden en authenticatie zie je in een lab zelf hoe snel een zwak,
        slecht gehasht wachtwoord valt tegen een woordenlijst.</p>
      `,
      questions: [
        { q: 'Wat is de belangrijkste reden om een salt toe te voegen aan een wachtwoord-hash?', options: ['Zodat gelijke wachtwoorden verschillende hashes krijgen en rainbow tables nutteloos worden', 'Om het wachtwoord korter te maken', 'Om het wachtwoord later weer te kunnen uitlezen'], answer: 0, explain: 'De salt is uniek per wachtwoord, dus voorberekende tabellen werken niet meer.' },
        { q: 'Moet een salt geheim worden gehouden?', options: ['Nee, de salt mag gewoon naast de hash worden opgeslagen', 'Ja, net zo geheim als het wachtwoord', 'Ja, anders werkt de encryptie niet'], answer: 0, explain: 'Een salt hoeft niet geheim te zijn; zijn kracht zit in uniciteit, niet in geheimhouding.' },
        { q: 'Noem een moderne, aanbevolen wachtwoordhashfunctie die de Password Hashing Competition won.', answer: ['Argon2', 'argon2'], hint: 'De naam begint met Argon.', explain: 'Argon2 is de huidige aanrader; bcrypt en scrypt zijn ook prima keuzes.' },
        { q: 'Waarom wil je bij wachtwoordopslag een LANGZAME hash in plaats van een snelle zoals SHA-256?', options: ['Een trage, geheugenintensieve hash beperkt hoeveel gokken een aanvaller per seconde kan doen', 'Omdat trage hashes veiliger versleutelen', 'Omdat SHA-256 niet bestaat voor wachtwoorden'], answer: 0, explain: 'De traagheid raakt de aanvaller met miljarden pogingen veel harder dan jou met één login.' },
        { q: 'Ik begrijp waarom je wachtwoorden nooit als platte tekst of als kale MD5 opslaat.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'Encoding', def: 'Omzetten van data naar een ander formaat (Base64, hex, URL) zonder sleutel; omkeerbaar door iedereen en dus geen beveiliging.' },
    { term: 'Encryptie', def: 'Data vertrouwelijk maken met een sleutel; zonder de juiste sleutel is de ciphertext onleesbaar.' },
    { term: 'Hashing', def: 'Eenrichtingsfunctie die van elke invoer een vaste, korte vingerafdruk maakt; niet terug te rekenen.' },
    { term: 'Symmetrische encryptie', def: 'Encryptie met één gedeelde sleutel voor versleutelen én ontsleutelen, bijvoorbeeld AES.' },
    { term: 'Asymmetrische encryptie', def: 'Encryptie met een sleutelpaar: een publieke sleutel om te delen en een private sleutel om geheim te houden (RSA, ECC).' },
    { term: 'Diffie-Hellman', def: 'Methode om over een open kanaal samen een gedeelde geheime sleutel af te spreken zonder die te versturen.' },
    { term: 'Forward secrecy', def: 'Eigenschap waarbij oude sessies onleesbaar blijven, zelfs als later een private sleutel uitlekt (door ephemeral sleutels).' },
    { term: 'Digitale handtekening', def: 'Een met de private sleutel versleutelde hash van een bericht; bewijst herkomst en integriteit, te verifiëren met de publieke sleutel.' },
    { term: 'Certificaat', def: 'Document dat een identiteit aan een publieke sleutel koppelt, ondertekend door een Certificate Authority.' },
    { term: 'PKI', def: 'Public Key Infrastructure: het geheel van CA\'s, certificaten en vertrouwensketens dat publieke sleutels betrouwbaar maakt.' },
    { term: 'TLS', def: 'Protocol achter HTTPS dat asymmetrische sleuteluitwisseling, authenticatie via certificaten en symmetrische AES-encryptie combineert.' },
    { term: 'Salt', def: 'Unieke, willekeurige waarde die vóór het hashen aan een wachtwoord wordt toegevoegd om rainbow tables en gelijke hashes te voorkomen.' },
    { term: 'Argon2', def: 'Moderne, langzame en geheugenintensieve wachtwoordhashfunctie; winnaar van de Password Hashing Competition.' },
    { term: 'Botsing (collision)', def: 'Twee verschillende invoeren met dezelfde hash; het bestaan ervan breekt een hashfunctie (MD5, SHA-1).' },
  ],
  resources: [
    { title: 'CyberChef (officiële versie)', url: 'https://gchq.github.io/CyberChef/' },
    { title: 'NCSC — ICT-beveiligingsrichtlijnen voor TLS', url: 'https://www.ncsc.nl/documenten/publicaties/2021/januari/19/ict-beveiligingsrichtlijnen-voor-transport-layer-security-2.1' },
    { title: 'OWASP — Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' },
    { title: 'Computerphile — uitlegvideo\'s over cryptografie', url: 'https://www.youtube.com/user/Computerphile' },
  ],
});
