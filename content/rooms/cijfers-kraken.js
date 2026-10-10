/* Room: Klassieke cijfers kraken — Caesar, Vigenère & XOR */
CS.registerRoom({
  id: 'cijfers-kraken',
  path: 'security-kern',
  order: 5,
  title: 'Klassieke cijfers kraken: Caesar, Vigenère & XOR',
  icon: '🗝️',
  difficulty: 'Gemiddeld',
  minutes: 60,
  summary: 'Kraak zelf Caesar, Atbash, Vigenère en een XOR-cijfer, en begrijp waarom klassieke cijfers vallen terwijl een one-time pad en AES dat niet doen.',
  objectives: [
    'Coderen, versleutelen en hashen uit elkaar houden en uitleggen waarom klassieke cijfers kraakbaar zijn',
    'Het principe van Kerckhoffs toepassen op de sleutel versus het algoritme',
    'Een Caesar-/ROT-cijfer kraken met brute force en frequentieanalyse',
    'Atbash en een Vigenère-cijfer herkennen en ontsleutelen',
    'Een 1-byte-XOR-cijfer brute-forcen en uitleggen waarom een one-time pad onbreekbaar is',
    'Onderbouwen waarom we vandaag gepubliceerde algoritmes als AES gebruiken in plaats van "security through obscurity"',
  ],
  tasks: [
    {
      title: 'Taak 1 — Van coderen naar kraken: waarom klassieke cijfers vallen',
      content: `
        <p>In de vorige room zag je al drie begrippen die vaak door elkaar lopen. We halen ze kort op, want
        in deze room gaan we cijfers daadwerkelijk <strong>kraken</strong> en dan is het belangrijk om precies te
        weten waar je mee bezig bent.</p>

        <ul>
          <li><strong>Coderen (encoding):</strong> data in een ander formaat zetten, zonder sleutel. Denk aan
          Base64 of hex. Iedereen die het schema kent, draait het terug. Dit beschermt niets.</li>
          <li><strong>Versleutelen (encryptie):</strong> data vertrouwelijk maken met een <em>sleutel</em>. Zonder
          de juiste sleutel is de ciphertext onleesbaar. Dit is wat we in deze room aanvallen.</li>
          <li><strong>Hashen:</strong> een eenrichtings-vingerafdruk maken die je niet kunt terugrekenen. Je
          gebruikt het voor integriteit en wachtwoordopslag, niet om iets later "uit te pakken".</li>
        </ul>

        <h3>Wat maakt een cijfer kraakbaar?</h3>
        <p>Klassieke cijfers (van voor het computertijdperk) zijn vandaag speelgoed. Er zijn twee grote redenen
        waarom ze vallen:</p>
        <ul>
          <li><strong>Kleine sleutelruimte:</strong> het aantal mogelijke sleutels is zo klein dat je ze gewoon
          allemaal kunt proberen. Dat heet <em>brute force</em>. Een Caesarcijfer heeft maar 25 zinvolle sleutels;
          die probeer je sneller uit dan je koffie koud wordt.</li>
          <li><strong>Patronen in de taal:</strong> natuurlijke taal is niet willekeurig. In het Nederlands komt de
          letter <code>e</code> veruit het vaakst voor, gevolgd door <code>n</code> en <code>a</code>. Ook spaties,
          dubbele letters en korte woorden verraden structuur. Met <strong>frequentieanalyse</strong> raad je de
          sleutel zonder alles te proberen.</li>
        </ul>

        <h3>Het principe van Kerckhoffs</h3>
        <p>De Nederlandse taalkundige Auguste Kerckhoffs formuleerde in 1883 een regel die nog steeds de kern van
        de moderne cryptografie is: <strong>een systeem moet veilig blijven, zelfs als de aanvaller alles weet
        behalve de sleutel</strong>. Met andere woorden: de geheimhouding zit in de <em>sleutel</em>, niet in het
        algoritme. Klassieke cijfers overtreden dit juist: zodra je weet "dit is ROT13" of "dit is Atbash", lees je
        mee, want er is nauwelijks een echte sleutel. Moderne algoritmes zijn daarentegen openbaar gepubliceerd en
        jarenlang door de hele wereld aangevallen — en toch veilig, omdat alleen de sleutel geheim is.</p>

        <div class="callout danger">
          <strong>Ethiek:</strong> je leert hier cijfers kraken om te begrijpen waarom zwakke versleuteling faalt.
          Oefen dit alleen op materiaal dat <em>voor jou bedoeld is</em>: de labs in deze room, CTF-uitdagingen of
          je eigen data. Andermans versleutelde berichten ontcijferen zonder toestemming kan strafbaar zijn
          (computervredebreuk, art. 138ab Sr). Kennis is om te verdedigen.
        </div>
      `,
      questions: [
        { q: 'Wat beschermt volgens het principe van Kerckhoffs de vertrouwelijkheid van een bericht?', options: ['Het geheimhouden van het algoritme', 'Het geheimhouden van de sleutel', 'Dat niemand weet dat er een bericht is'], answer: 1, explain: 'Kerckhoffs: het systeem mag openbaar zijn; alleen de sleutel moet geheim blijven.' },
        { q: 'Noem de aanvalsmethode waarbij je simpelweg alle mogelijke sleutels één voor één probeert.', answer: ['brute force', 'bruteforce', 'brute-force'], hint: 'Het is Engels en betekent letterlijk "met brute kracht".', explain: 'Bij een kleine sleutelruimte, zoals bij Caesar, is brute force triviaal.' },
        { q: 'Welke letter komt in het Nederlands het vaakst voor en is daarom het startpunt van frequentieanalyse?', answer: ['e'], hint: 'Dezelfde letter domineert ook in het Engels en Duits.', explain: 'De e is veruit de meest voorkomende letter; die kennis verraadt de verschuiving.' },
        { q: 'Ik begrijp dat ik deze kraaktechnieken alleen oefen op materiaal dat voor mij bedoeld is (labs, CTF of eigen data).', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — Caesar en ROT: brute force en frequentieanalyse',
      content: `
        <p>Het <strong>Caesarcijfer</strong> is het bekendste klassieke cijfer, vernoemd naar Julius Caesar. Je
        schuift elke letter een vast aantal plaatsen op in het alfabet. Bij een verschuiving van 3 wordt
        <code>a</code> een <code>d</code> en <code>b</code> een <code>e</code>. Het woord <code>geheim</code> wordt
        dan <code>jhkhlp</code>. De "sleutel" is simpelweg dat getal.</p>

        <p><strong>ROT13</strong> is een Caesarcijfer met een vaste verschuiving van 13. Omdat het alfabet 26
        letters heeft, is ROT13 zijn eigen omkering: tweemaal toepassen geeft de oorspronkelijke tekst. Je zag het
        vroeger op forums om spoilers af te schermen — nooit om iets echt geheim te houden.</p>

        <h3>Aanval 1: brute force</h3>
        <p>Een Caesarcijfer heeft maar <strong>25 zinvolle verschuivingen</strong> (0 verandert niets). Dus je
        probeert ze gewoon allemaal en kijkt welke regel leesbaar Nederlands oplevert. Dat is precies wat het lab
        hieronder doet: het toont alle 26 mogelijkheden onder elkaar en zet er een "beste gok" bij.</p>

        <h3>Aanval 2: frequentieanalyse</h3>
        <p>Wil je het slim aanpakken, dan tel je de letters. Komt in de ciphertext bijvoorbeeld de <code>l</code>
        het vaakst voor, dan is de kans groot dat die overeenkomt met de Nederlandse <code>e</code>. Het verschil
        tussen <code>l</code> en <code>e</code> is dan je verschuiving. Zo kraak je zelfs lange teksten zonder alle
        sleutels te proberen — en dit is dezelfde techniek die later ook complexere substitutiecijfers onderuithaalt.</p>

        <div class="callout info">
          <strong>Let op:</strong> Caesar en ROT raken alleen letters. Cijfers, de accolades <code>{ }</code> en
          underscores in een vlag blijven staan. Een versleutelde vlag ziet er daarom nog steeds "een beetje als
          een vlag" uit — handig als herkenningspunt bij het kraken.
        </div>

        <h3>Aan de slag</h3>
        <p>In het lab staat een versleuteld bericht. Laat de tool alle verschuivingen tonen en vind de regel die
        leesbaar Nederlands oplevert. Daarin staat een vlag in het formaat <code>JVT{...}</code>. Noteer ook welke
        verschuiving (ROT-getal) het bericht gebruikt.</p>
      `,
      lab: { type: 'cipher', text: 'Kl nlolptl cshn pz QCA{jhlzhy_pz_thrrlspqr}' },
      questions: [
        { q: 'Welke verschuiving (ROT-getal) gebruikt het bericht in het lab?', answer: ['7', 'rot7', '7 plaatsen'], hint: 'Kijk bij welke verschuiving de regel leesbaar Nederlands wordt; het lab zet er een "beste gok" bij.', explain: 'De juiste verschuiving is 7 (ROT7); dan wordt het bericht leesbaar.' },
        { q: 'Wat is de vlag in het ontsleutelde bericht?', answer: ['JVT{caesar_is_makkelijk}'], encoded: true, hint: 'Ontsleutel met ROT7 en lees de vlag tussen de accolades.', explain: 'Met 25 mogelijke sleutels is een Caesarcijfer binnen een seconde gekraakt.' },
        { q: 'Waarom is frequentieanalyse zo effectief tegen een Caesarcijfer?', options: ['Omdat de letterverdeling van de taal bewaard blijft; je herkent de e en leidt de verschuiving af', 'Omdat het cijfer de spaties weggooit', 'Omdat het cijfer een heel grote sleutelruimte heeft'], answer: 0, explain: 'Caesar verschuift alle letters gelijk, dus de frequentiepatronen van de taal blijven intact.' },
      ],
    },

    {
      title: 'Taak 3 — Atbash en omkeren: eenvoudige substituties',
      content: `
        <p>Het Caesarcijfer is een <strong>substitutiecijfer</strong>: elke letter wordt vervangen door een andere
        volgens een vaste regel. <strong>Atbash</strong> is nog zo'n substitutie, maar dan zonder getal als sleutel:
        je spiegelt het alfabet. De eerste letter wordt de laatste en omgekeerd — <code>a</code> wordt
        <code>z</code>, <code>b</code> wordt <code>y</code>, <code>c</code> wordt <code>x</code>, enzovoort.</p>

        <table>
          <thead><tr><th>Klaar</th><th>a</th><th>b</th><th>c</th><th>...</th><th>x</th><th>y</th><th>z</th></tr></thead>
          <tbody>
            <tr><td><strong>Cipher</strong></td><td>z</td><td>y</td><td>x</td><td>...</td><td>c</td><td>b</td><td>a</td></tr>
          </tbody>
        </table>

        <p>Atbash is net als ROT13 <strong>zijn eigen omkering</strong>: je past dezelfde bewerking nog een keer toe
        om het bericht terug te krijgen. Er is geen sleutel die je hoeft te raden; weet je dat het Atbash is, dan ben
        je meteen binnen. Dat maakt het als beveiliging waardeloos, maar het is een mooi voorbeeld van een vaste
        substitutie.</p>

        <h3>Omkeren is géén versleuteling</h3>
        <p>Nog eenvoudiger is het simpelweg <strong>omkeren</strong> van een tekst (<code>geheim</code> wordt
        <code>miehig</code>). Dit lijkt op versleuteling, maar er is geen sleutel en geen substitutie — het is puur
        een volgorde-truc, net als coderen. Verwar het niet met echte encryptie: wie de truc kent, leest direct mee.</p>

        <div class="callout tip">
          <strong>Tip bij het herkennen:</strong> ziet een cijfertekst er uit als onzin-letters maar met nog steeds
          herkenbare woordlengtes en accolades? Probeer dan eerst de "gratis" cijfers: ROT13, Atbash en omkeren.
          Veel CTF-opgaven beginnen met zo'n laagje.
        </div>

        <h3>Aan de slag</h3>
        <p>In het lab staat een met Atbash versleutelde vlag. Kies in de tool de Atbash-bewerking (of pas de
        alfabet-spiegeling toe) en lees de vlag.</p>
      `,
      lab: { type: 'cipher', text: 'QEG{zgyzhs_lntvwizzrw}' },
      questions: [
        { q: 'Wat is de vlag na het toepassen van Atbash op het bericht in het lab?', answer: ['JVT{atbash_omgedraaid}'], encoded: true, hint: 'Atbash spiegelt het alfabet: a<->z, b<->y, ... en is zijn eigen omkering.', explain: 'Atbash heeft geen te raden sleutel; ken je de methode, dan is het direct leesbaar.' },
        { q: 'Wat hebben Atbash en ROT13 gemeen?', options: ['Ze hebben een enorme sleutelruimte', 'Ze zijn hun eigen omkering: nog een keer toepassen geeft de originele tekst', 'Ze gebruiken allebei een lange, geheime sleutel'], answer: 1, explain: 'Bij beide draai je het bericht terug door dezelfde bewerking opnieuw toe te passen.' },
        { q: 'Is het omkeren van een tekst een vorm van versleuteling?', options: ['Nee, er is geen sleutel; het is een volgorde-truc zoals coderen', 'Ja, het is net zo sterk als AES', 'Alleen als de tekst langer is dan 20 tekens'], answer: 0, explain: 'Zonder sleutel is het geen encryptie; iedereen die de truc kent leest mee.' },
      ],
    },

    {
      title: 'Taak 4 — Vigenère: polyalfabetisch en sleutellengte',
      content: `
        <p>Lang gold het <strong>Vigenère-cijfer</strong> als "onbreekbaar" (le chiffre indéchiffrable). Het is een
        slimme uitbreiding op Caesar: in plaats van elke letter met <em>dezelfde</em> verschuiving op te schuiven,
        gebruik je een <strong>sleutelwoord</strong> waarbij elke letter van dat woord een eigen verschuiving
        aangeeft. Daarom heet het <strong>polyalfabetisch</strong>: er zijn meerdere "alfabetten" tegelijk in gebruik.</p>

        <p>Stel het sleutelwoord is <code>dojo</code>. Dan geldt: <code>d</code> = schuif 3, <code>o</code> = schuif
        14, <code>j</code> = schuif 9, <code>o</code> = schuif 14, en daarna begint het sleutelwoord weer van voren.
        Zo krijgt de eerste letter van je tekst verschuiving 3, de tweede 14, de derde 9, de vierde 14, de vijfde
        weer 3, enzovoort.</p>

        <h3>Waarom is Vigenère sterker dan Caesar?</h3>
        <p>Omdat dezelfde klaartekstletter nu verschillende cijferletters kan opleveren (afhankelijk van de positie),
        wordt simpele frequentieanalyse verstoord: het "e-is-het-vaakst"-patroon wordt uitgesmeerd. Brute force op
        het hele sleutelwoord is ook lastig, want de sleutelruimte groeit snel met de lengte van de sleutel.</p>

        <h3>De zwakke plek: sleutellengte</h3>
        <p>Toch valt Vigenère. De truc is om eerst de <strong>sleutellengte</strong> te achterhalen. Daarvoor bestaat
        het <strong>Kasiski-onderzoek</strong>: komt in de ciphertext een stukje van bijvoorbeeld drie letters
        meerdere keren voor, dan is de afstand tussen die herhalingen waarschijnlijk een veelvoud van de
        sleutellengte. Vind je zulke afstanden (bijvoorbeeld 8 en 12), dan is de grootste gemene deler (hier 4) een
        goede gok voor de sleutellengte. Ken je de lengte eenmaal, dan knip je de tekst in kolommen die élk met
        dezelfde verschuiving zijn versleuteld — en op elke kolom werkt gewone frequentieanalyse wéér gewoon. Zo is
        "le chiffre indéchiffrable" alsnog te kraken.</p>

        <div class="callout info">
          <strong>In dit lab</strong> krijg je de sleutel cadeau: het sleutelwoord is <code>dojo</code>. In een echte
          aanval zou je die eerst via Kasiski en frequentieanalyse moeten reconstrueren. Vul de sleutel in de tool in
          en lees het ontsleutelde bericht.
        </div>

        <h3>Aan de slag</h3>
        <p>Open het lab, vul het sleutelwoord <code>dojo</code> in bij de Vigenère-bewerking en ontsleutel het
        bericht. Er staat een vlag in.</p>
      `,
      lab: { type: 'cipher', text: 'Gs bzhicso wb rrxx sq rn joop zxwmh MJC{jlunbhfn_uhyaodyc}' },
      questions: [
        { q: 'Welk sleutelwoord gebruik je om het Vigenère-bericht in het lab te ontsleutelen?', answer: ['dojo'], hint: 'Het staat in de uitleg van deze taak genoemd.', explain: 'Met het sleutelwoord "dojo" wordt het bericht leesbaar.' },
        { q: 'Wat is de vlag in het ontsleutelde Vigenère-bericht?', answer: ['JVT{vigenere_gekraakt}'], encoded: true, hint: 'Vul de sleutel dojo in en lees de vlag tussen de accolades.', explain: 'Ken je (of raad je) de sleutel, dan valt ook een polyalfabetisch cijfer.' },
        { q: 'Waar dient het Kasiski-onderzoek voor bij het kraken van Vigenère?', options: ['Het schat de lengte van het sleutelwoord uit afstanden tussen herhalingen', 'Het berekent direct de vlag', 'Het maakt de sleutel langer zodat hij veiliger wordt'], answer: 0, explain: 'Met de sleutellengte kun je de tekst in kolommen splitsen en per kolom frequentieanalyse doen.' },
      ],
    },

    {
      title: 'Taak 5 — XOR: de brug naar modern (en het onbreekbare one-time pad)',
      content: `
        <p>Tijd voor het cijfer dat de brug slaat naar moderne cryptografie: <strong>XOR</strong> (exclusieve of).
        XOR is een bit-bewerking: <code>0 XOR 0 = 0</code>, <code>1 XOR 1 = 0</code>, maar
        <code>0 XOR 1 = 1</code> en <code>1 XOR 0 = 1</code>. De bit wordt dus 1 als de twee bits verschillen.
        Het mooie: XOR is zijn eigen omkering. Doe je <code>klaartekst XOR sleutel = ciphertext</code>, dan geldt
        ook <code>ciphertext XOR sleutel = klaartekst</code>. Dezelfde bewerking versleutelt én ontsleutelt.</p>

        <figure class="diagram">
          <svg viewBox="0 0 520 110">
            <rect x="10" y="40" width="130" height="40" rx="8" fill="var(--surface-2)" stroke="currentColor" />
            <text x="75" y="65" text-anchor="middle" fill="currentColor" font-size="13">klaartekst</text>
            <text x="165" y="65" text-anchor="middle" fill="var(--accent)" font-size="20">⊕</text>
            <rect x="190" y="40" width="130" height="40" rx="8" fill="var(--surface-2)" stroke="currentColor" />
            <text x="255" y="65" text-anchor="middle" fill="currentColor" font-size="13">sleutel (byte)</text>
            <text x="345" y="65" text-anchor="middle" fill="currentColor" font-size="18">=</text>
            <rect x="370" y="40" width="140" height="40" rx="8" fill="var(--surface-2)" stroke="currentColor" />
            <text x="440" y="65" text-anchor="middle" fill="currentColor" font-size="13">ciphertext</text>
          </svg>
          <figcaption>XOR versleutelt per byte; dezelfde bewerking met dezelfde sleutel draait het weer terug.</figcaption>
        </figure>

        <h3>1-byte-XOR: triviaal te brute-forcen</h3>
        <p>Als je een korte, herhaalde sleutel gebruikt, is XOR zwak. Het extreemste geval is een sleutel van één
        byte: dezelfde waarde wordt met élke byte van de tekst ge-XOR'd. Een byte heeft maar 256 mogelijke waarden
        (0 tot en met 255), dus een aanvaller probeert ze simpelweg allemaal en kijkt welke sleutel leesbare tekst
        oplevert. Dat is precies wat het lab doet: het brute-forcet alle 256 sleutels.</p>

        <h3>Waarom een herhaalde sleutel lekt</h3>
        <p>Bij een korte, herhaalde sleutel komt hetzelfde stukje sleutel steeds terug. Daardoor ontstaan weer
        patronen in de ciphertext, en patronen zijn precies wat frequentieanalyse en statistiek uitbuiten. Hoe korter
        en vaker herhaald de sleutel, hoe makkelijker te kraken.</p>

        <h3>Het one-time pad: wél onbreekbaar</h3>
        <p>XOR zelf is niet het probleem — de <em>sleutel</em> is het. Gebruik je een sleutel die (1) <strong>echt
        willekeurig</strong> is, (2) <strong>minstens even lang</strong> als het bericht, en (3) <strong>maar één
        keer</strong> gebruikt wordt, dan heb je een <strong>one-time pad</strong>. Dat is bewijsbaar onbreekbaar:
        elke mogelijke klaartekst van dezelfde lengte is even waarschijnlijk, dus de ciphertext verraadt letterlijk
        niets. De catch: zo'n sleutel is onpraktisch — hij is even lang als al je data en je moet hem veilig delen.
        Breek je één van de drie regels (hergebruik, te kort, niet willekeurig), dan stort de garantie meteen in.
        Moderne cijfers als AES benaderen dit praktisch met korte sleutels en slimme wiskunde.</p>

        <h3>Aan de slag</h3>
        <p>In het lab staat een XOR-ciphertext als hex. Laat de tool alle 256 sleutels proberen en vind de byte-sleutel
        die een leesbare vlag oplevert.</p>
      `,
      lab: { type: 'cipher', text: '60 7c 7e 51 52 45 58 75 4f 4f 44 75 48 53 5e 4f 57' },
      questions: [
        { q: 'Wat is de vlag na het brute-forcen van de 1-byte-XOR in het lab?', answer: ['JVT{xor_een_byte}'], encoded: true, hint: 'Een byte-sleutel heeft maar 256 mogelijkheden; laat het lab ze allemaal proberen.', explain: 'Met slechts 256 sleutels is een 1-byte-XOR net zo triviaal te kraken als Caesar.' },
        { q: 'Hoeveel mogelijke sleutels moet je proberen om een 1-byte-XOR-cijfer te brute-forcen?', answer: ['256'], hint: 'Een byte is 8 bits.', explain: 'Een byte heeft 2^8 = 256 mogelijke waarden, dus maximaal 256 pogingen.' },
        { q: 'Welke drie eigenschappen maken een XOR-sleutel tot een onbreekbaar one-time pad?', options: ['Echt willekeurig, minstens even lang als het bericht, en maar één keer gebruikt', 'Kort, makkelijk te onthouden en vaak hergebruikt', 'Precies 8 tekens lang en alleen cijfers'], answer: 0, explain: 'Alle drie zijn nodig; breek er één en de garantie van onbreekbaarheid vervalt.' },
        { q: 'Waarom is XOR met een korte, herhaalde sleutel zwak?', options: ['Omdat de herhaling patronen in de ciphertext achterlaat die statistiek en frequentieanalyse uitbuiten', 'Omdat XOR niet omkeerbaar is', 'Omdat XOR alleen op letters werkt, niet op bytes'], answer: 0, explain: 'Een herhaalde sleutel brengt structuur terug; precies wat een aanvaller nodig heeft.' },
      ],
    },

    {
      title: 'Taak 6 — Van klassiek naar modern: waarom we AES en openheid vertrouwen',
      content: `
        <p>Je hebt nu vier cijfers eigenhandig gekraakt. Ze faalden telkens om dezelfde redenen: een te kleine
        sleutelruimte, bewaarde taalpatronen, of een sleutel die hergebruikt of te kort was. Tijd om te kijken
        waarom moderne cryptografie die valkuilen vermijdt.</p>

        <h3>Grote sleutelruimte</h3>
        <p><strong>AES</strong> (Advanced Encryption Standard) gebruikt sleutels van 128, 192 of 256 bits. Een
        256-bits sleutel betekent ongeveer 10^77 mogelijkheden — meer dan er atomen in het waarneembare heelal zijn.
        Brute force is dan geen optie meer: alle computers op aarde samen zouden astronomisch veel langer dan de
        leeftijd van het heelal nodig hebben. Vergelijk dat met de 25 sleutels van Caesar of de 256 van 1-byte-XOR.</p>

        <h3>Geen patronen</h3>
        <p>Een goed modern cijfer zorgt dat de ciphertext er statistisch uitziet als ruis: elke bytewaarde komt
        ongeveer even vaak voor en herhalingen verdwijnen. Daarvoor combineer je AES met een goede <em>mode</em>
        (zoals GCM) en een unieke <em>IV/nonce</em> per bericht. Zo is er niets voor frequentieanalyse om op aan te
        grijpen — precies waar Caesar en Vigenère op vielen.</p>

        <h3>Security through obscurity faalt</h3>
        <p>Klassieke cijfers leunden op geheimhouding van de <em>methode</em>: zolang niemand wist dat het Atbash of
        ROT13 was, leek het veilig. Zodra de methode bekend werd, was het voorbij. Dat heet
        <strong>security through obscurity</strong>, en het is een klassieke denkfout. Methodes lekken altijd: via
        reverse engineering, een ex-medewerker, of simpelweg door te gokken. Daarom volgt de moderne praktijk het
        principe van Kerckhoffs tot in het extreme: algoritmes als AES zijn <strong>openbaar gepubliceerd</strong> en
        worden al decennia door duizenden onderzoekers wereldwijd aangevallen. Dat ze dat overleven, is juist het
        bewijs van hun sterkte. Een cijfer dat zijn veiligheid dankt aan "niemand weet hoe het werkt" is per definitie
        verdacht.</p>

        <div class="callout tip">
          <strong>Vuistregel:</strong> gebruik nooit zelfgebouwde of geheime encryptie voor iets dat ertoe doet.
          Kies een gepubliceerd, goed onderzocht algoritme (AES, ChaCha20) via een beproefde bibliotheek, en richt al
          je energie op het veilig beheren van de <em>sleutel</em>.
        </div>

        <div class="callout danger">
          <strong>Ethiek, tot slot:</strong> de technieken uit deze room zijn dual-use. Je kunt er een CTF mee winnen
          of een eigen zwakke configuratie mee ontdekken — of je kunt grenzen overschrijden. Blijf binnen je eigen lab
          of werk met expliciete, schriftelijke toestemming. Vind je echte zwakke versleuteling bij een organisatie,
          meld het dan verantwoord (responsible disclosure, bijvoorbeeld via het NCSC of een coordinated vulnerability
          disclosure-traject). Zo maak je het internet veiliger in plaats van onveiliger.
        </div>
      `,
      questions: [
        { q: 'Waarom is "security through obscurity" (veiligheid door geheimhouding van de methode) een denkfout?', options: ['Omdat methodes altijd lekken; echte veiligheid moet in de geheime sleutel zitten, niet in een geheim algoritme', 'Omdat geheime algoritmes te snel zijn', 'Omdat het alleen bij korte berichten werkt'], answer: 0, explain: 'Zodra de methode bekend wordt, valt het systeem. Kerckhoffs: alleen de sleutel hoort geheim te zijn.' },
        { q: 'Noem de moderne, openbaar gepubliceerde symmetrische standaard die we vandaag vertrouwen vanwege zijn enorme sleutelruimte.', answer: ['AES'], hint: 'Advanced Encryption Standard.', explain: 'AES is openbaar, jarenlang aangevallen en nog steeds veilig; alleen de sleutel is geheim.' },
        { q: 'Wat is de belangrijkste reden dat AES-256 niet te brute-forcen is terwijl Caesar dat wel is?', options: ['De gigantische sleutelruimte (ongeveer 10^77 sleutels) maakt alle sleutels proberen onmogelijk', 'AES verbergt het bericht beter voor het oog', 'AES gebruikt helemaal geen sleutel'], answer: 0, explain: 'Met 2^256 sleutels is uitputtend zoeken fysiek onhaalbaar; Caesar heeft er maar 25.' },
        { q: 'Ik begrijp dat ik zwakke versleuteling alleen onderzoek binnen mijn eigen lab of met toestemming, en vondsten verantwoord meld.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'Substitutiecijfer', def: 'Cijfer waarbij elke letter volgens een vaste regel door een andere wordt vervangen, zoals Caesar en Atbash.' },
    { term: 'Caesarcijfer', def: 'Substitutiecijfer dat elke letter een vast aantal plaatsen opschuift; heeft maar 25 zinvolle sleutels.' },
    { term: 'ROT13', def: 'Caesarcijfer met verschuiving 13; is zijn eigen omkering en biedt geen echte beveiliging.' },
    { term: 'Atbash', def: 'Substitutiecijfer dat het alfabet spiegelt (a<->z, b<->y, ...); is zijn eigen omkering en heeft geen te raden sleutel.' },
    { term: 'Frequentieanalyse', def: 'Kraakmethode die de letterverdeling van de taal gebruikt (in het Nederlands is de e het vaakst) om de sleutel af te leiden.' },
    { term: 'Vigenère-cijfer', def: 'Polyalfabetisch cijfer dat met een sleutelwoord per positie een andere verschuiving toepast.' },
    { term: 'Polyalfabetisch', def: 'Eigenschap dat dezelfde klaartekstletter verschillende cijferletters kan opleveren, afhankelijk van de positie.' },
    { term: 'Kasiski-onderzoek', def: 'Techniek om de sleutellengte van Vigenère te schatten uit de afstanden tussen herhaalde stukjes ciphertext.' },
    { term: 'Sleutelruimte', def: 'Het totale aantal mogelijke sleutels; hoe kleiner, hoe makkelijker brute force werkt.' },
    { term: 'XOR', def: 'Bit-bewerking die 1 geeft als de bits verschillen; zijn eigen omkering en de basis van veel moderne cijfers.' },
    { term: 'One-time pad', def: 'XOR met een echt willekeurige sleutel die minstens even lang is als het bericht en maar één keer wordt gebruikt; bewijsbaar onbreekbaar.' },
    { term: "Kerckhoffs' principe", def: 'Een cryptosysteem moet veilig blijven als de aanvaller alles weet behalve de sleutel; geheimhouding zit in de sleutel, niet in het algoritme.' },
    { term: 'Security through obscurity', def: 'De denkfout dat iets veilig is zolang de methode geheim blijft; faalt zodra de methode uitlekt.' },
  ],
  resources: [
    { title: 'CyberChef (officiële versie)', url: 'https://gchq.github.io/CyberChef/' },
    { title: 'Wikipedia — Frequency analysis', url: 'https://en.wikipedia.org/wiki/Frequency_analysis' },
    { title: 'CryptoHack — leer cryptografie door uitdagingen', url: 'https://cryptohack.org/' },
  ],
});
