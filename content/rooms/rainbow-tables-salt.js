/* Room: Rainbow tables & waarom salt wint */
CS.registerRoom({
  id: 'rainbow-tables-salt',
  path: 'security-kern',
  order: 6,
  title: 'Rainbow tables & waarom salt wint',
  icon: '🌈',
  difficulty: 'Gemiddeld',
  minutes: 55,
  summary: 'Begrijp de precomputatie-aanval (tijd-geheugen-afweging), zie met een rainbow table waarom onvergezouten hashes direct op te zoeken zijn, en leer hoe salt, peper en trage hashes dat breken.',
  objectives: [
    'Uitleggen wat een precomputatie-aanval is en welke tijd-geheugen-afweging eraan ten grondslag ligt',
    'Het verschil benoemen tussen een simpele opzoektabel en een echte rainbow table (reductiefuncties en ketens)',
    'Met een rainbow table een onvergezouten MD5-hash direct opzoeken',
    'Uitleggen waarom een per-gebruiker unieke, willekeurige salt precomputatie onbruikbaar maakt',
    'Peper, trage hashes (bcrypt/scrypt/Argon2) en de werkfactor herkennen en uitleggen',
    'Beschrijven hoe moderne wachtwoordopslag (Argon2id + salt + peper) en wachtwoordbeleid samen verdedigen',
  ],
  tasks: [
    {
      title: 'Taak 1 — De precomputatie-aanval: tijd ruilen voor geheugen',
      content: `
        <p>Je weet uit eerdere rooms dat een hash <strong>eenrichting</strong> is: je kunt hem niet terugrekenen, alleen
        gokken, hashen en vergelijken. Een gewone woordenlijst- of brute-force-aanval doet dat telkens opnieuw. Stel je
        buit duizend hashes uit een datalek: dan hash je je hele woordenlijst duizend keer, één keer per hash. Dat voelt
        als dubbel werk — en dat is het ook.</p>

        <p>De <strong>precomputatie-aanval</strong> draait dat om. Het idee: doe het dure rekenwerk <em>één keer vooraf</em>
        en bewaar het resultaat. Je hasht een gigantische verzameling kandidaat-wachtwoorden op voorhand en slaat de
        paren <em>hash → wachtwoord</em> op. Krijg je later een hash in handen, dan hoef je niet meer te kraken: je
        <strong>zoekt hem gewoon op</strong>. Opzoeken is bijna onmiddellijk.</p>

        <h3>De tijd-geheugen-afweging</h3>
        <p>Dit is een klassieke <strong>tijd-geheugen-afweging</strong> (time-memory tradeoff). Je investeert vooraf veel
        rekentijd én veel opslag, en krijgt daarvoor in de plaats dat elke latere aanval razendsnel is. Je ruilt dus
        <em>tijd</em> (tijdens de aanval) in tegen <em>geheugen</em> (opslag van de tabel). De simpele variant hiervan is
        een platte <strong>opzoektabel</strong>: letterlijk een enorm bestand met voor elk bedacht wachtwoord zijn hash.
        Eerlijk is eerlijk — die opzoektabel is juist het probleem: alle onvergezouten MD5's van alle wachtwoorden tot
        acht tekens opslaan kost al snel vele terabytes. Puur opzoeken is dan onbetaalbaar qua opslag.</p>

        <h3>Wat een echte rainbow table slimmer doet: ketens</h3>
        <p>Een <strong>rainbow table</strong> (bedacht door Philippe Oechslin in 2003, voortbouwend op het werk van
        Hellman) lost dat opslagprobleem op met <strong>ketens</strong>. In plaats van elk paar los te bewaren, bouw je
        een keten op door af te wisselen:</p>
        <ol>
          <li>Begin met een wachtwoord en <strong>hash</strong> het.</li>
          <li>Pas op die hash een <strong>reductiefunctie</strong> toe: die zet de hash om in een nieuw, geldig
          kandidaat-wachtwoord.</li>
          <li>Hash dat weer, reduceer weer, honderden of duizenden keren.</li>
          <li>Bewaar van de hele keten <strong>alleen het beginwoord en het eindresultaat</strong>.</li>
        </ol>

        <figure class="diagram">
          <svg viewBox="0 0 700 140" role="img" aria-label="Keten: afwisselend hashen en reduceren; alleen begin en eind worden bewaard">
            <rect x="8" y="46" width="96" height="34" rx="6" fill="var(--accent-soft)" stroke="currentColor" />
            <text x="56" y="67" fill="currentColor" font-size="13" text-anchor="middle">welkom</text>
            <line x1="104" y1="63" x2="168" y2="63" stroke="currentColor" />
            <text x="136" y="40" fill="currentColor" font-size="11" text-anchor="middle">hash</text>
            <rect x="168" y="46" width="150" height="34" rx="6" fill="none" stroke="var(--muted)" />
            <text x="243" y="67" fill="currentColor" font-size="12" text-anchor="middle">a1b2c3d4…</text>
            <line x1="318" y1="63" x2="382" y2="63" stroke="currentColor" />
            <text x="350" y="40" fill="currentColor" font-size="11" text-anchor="middle">reduce</text>
            <rect x="382" y="46" width="96" height="34" rx="6" fill="var(--accent-soft)" stroke="currentColor" />
            <text x="430" y="67" fill="currentColor" font-size="13" text-anchor="middle">tafel12</text>
            <line x1="478" y1="63" x2="542" y2="63" stroke="currentColor" />
            <text x="510" y="38" fill="currentColor" font-size="11" text-anchor="middle">hash → reduce …</text>
            <rect x="542" y="46" width="150" height="34" rx="6" fill="none" stroke="var(--good)" />
            <text x="617" y="67" fill="currentColor" font-size="12" text-anchor="middle">eind-woord</text>
            <text x="8" y="116" fill="currentColor" font-size="12">Opgeslagen: alleen (welkom, eind-woord). De tussenstappen reken je bij het opzoeken opnieuw uit.</text>
          </svg>
          <figcaption>Eén keten: afwisselend hashen en reduceren. Alleen begin en eind gaan de opslag in — dat is de
          tijd-geheugen-afweging in actie.</figcaption>
        </figure>

        <p>Zoek je later een onbekende hash op, dan pas je er zelf de reductie- en hashstappen op toe tot je een
        opgeslagen eindwoord raakt; daarna reken je díe keten vanaf het begin opnieuw uit om het wachtwoord te vinden.
        Zo bewaar je maar twee woorden per keten in plaats van duizenden — veel minder opslag, tegen wat extra rekenwerk
        bij het opzoeken. Dat is de afweging, nu de andere kant op bijgesteld.</p>

        <div class="callout info"><strong>Waarom "rainbow"?</strong> Een naïeve keten gebruikt steeds dezelfde
        reductiefunctie, waardoor ketens in elkaar overlopen (botsen) en veel wachtwoorden missen. Oechslin gebruikt per
        positie een <em>andere</em> reductiefunctie — in diagrammen met verschillende kleuren getekend, vandaar
        "regenboog". Let op: een reductiefunctie is géén inverse van de hash (die bestaat niet). Het is gewoon een functie
        die een hash afbeeldt op íéts in de verzameling mogelijke wachtwoorden.</div>

        <div class="callout warn"><strong>Eerlijk blijven:</strong> het lab in de volgende taak gebruikt de simpele
        opzoektabel-variant (hash → woord, direct opzoeken). Dat is het makkelijkst te laten zien. Een echte rainbow table
        is de gecomprimeerde, kettingvariant hierboven. Het eindresultaat is hetzelfde: zonder salt is kraken vervangen
        door opzoeken.</div>
      `,
      questions: [
        { q: 'Wat ruil je bij een precomputatie-aanval tegen elkaar in?', options: ['Rekentijd tijdens de aanval tegen opslag (geheugen) vooraf', 'Geld tegen snelheid', 'Nauwkeurigheid tegen snelheid', 'CPU tegen netwerkbandbreedte'], answer: 0, explain: 'Je investeert vooraf in rekentijd en opslag; daardoor is elke latere aanval bijna gratis qua tijd. Dat is de tijd-geheugen-afweging.' },
        { q: 'Hoe heet de functie die een hash afbeeldt op een nieuw kandidaat-wachtwoord (en die dus GEEN inverse van de hash is)?', answer: ['reductiefunctie', 'reductie', 'reduction function', 'reductie-functie'], hint: 'Ze "reduceert" een hash terug naar iets in de verzameling wachtwoorden.', explain: 'De reductiefunctie zet een hash om in een geldig kandidaat-wachtwoord. Ze draait de hash niet om — dat kan niet — maar maakt de keten mogelijk.' },
        { q: 'Wat bewaart een echte rainbow table per keten?', options: ['Alleen het beginwoord en het eindresultaat', 'Elke hash en elk woord in de keten', 'Alleen de hashes, niet de woorden', 'De reductiefunctie zelf'], answer: 0, explain: 'Alleen begin en eind worden opgeslagen; de tussenstappen reken je bij het opzoeken opnieuw uit. Zo bespaar je enorm veel opslag.' },
        { q: 'Ik begrijp dat een echte rainbow table ketens met reductiefuncties gebruikt, en dat een platte opzoektabel de simpele, opslag-zware variant is.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — Het rainbow-lab: zoek een onvergezouten hash op',
      content: `
        <p>Tijd om het te voelen. In het lab hieronder staat een kleine, vooraf berekende tabel: links de MD5-hash,
        rechts het wachtwoord. Dit is precies de simpele opzoektabel-variant uit taak 1 — alleen veel korter, zodat je
        hem in één oogopslag overziet. In het echt zou zo'n tabel miljarden rijen tellen.</p>

        <h3>Opzoeken, niet kraken</h3>
        <p>Neem de hash <code>371620aa75830b1388b63305b0d42f06</code>. Dat is de onvergezouten MD5 van een heel gewoon
        wachtwoord. Plak hem in het opzoekveld en klik op <strong>Opzoeken</strong>. Er wordt niets gegokt of gekraakt:
        de tool kijkt simpelweg of de hash in de tabel staat en geeft meteen het bijbehorende wachtwoord terug. Dat is de
        hele kracht (en het hele gevaar) van precomputatie: voor onvergezouten hashes is kraken teruggebracht tot een
        opzoekactie van een fractie van een seconde.</p>

        <p>Onder het opzoekveld zie je een blauw kader dat alvast vooruitwijst naar de volgende taak. Daar staat dezelfde
        tekst, maar dan één keer <em>zonder</em> salt en één keer <em>met</em> salt. Let op hoe compleet anders de twee
        hashes zijn — precies dát is waarom salt de hele tabel waardeloos maakt. We gaan er in taak 3 dieper op in.</p>

        <div class="callout tip"><strong>Tip:</strong> probeer ook eens een hash die níét in de tabel staat (verzin er een,
        of plak de gesalte hash <code>329f3abf574738de33a01f7c630b1fb7</code>). Je ziet dan "niet in de tabel" — want
        opzoeken werkt alleen als de hash er echt in voorkomt. Geen tabel, geen cadeau.</div>

        <h3>Je beloning</h3>
        <details><summary>Toon de vlag (pas openen nadat je het wachtwoord hebt opgezocht)</summary>
          <p>Je verdiende vlag: <code>JVT{rainbow_zoekt_direct}</code>. Onthoud het gevoel: voor een onvergezouten,
          snelle hash hoef je niet te kraken — je zoekt gewoon op.</p>
        </details>
      `,
      lab: {
        type: 'rainbow',
        algo: 'md5',
        wordlist: ['welkom', 'zomer2024', 'admin', 'voetbal', 'liefde', 'qwerty', 'computer', 'maandag'],
        target: '371620aa75830b1388b63305b0d42f06',
        saltExample: { word: 'welkom', salt: 'Xy7' },
      },
      questions: [
        { q: 'Zoek de hash 371620aa75830b1388b63305b0d42f06 op. Welk wachtwoord hoort erbij?', answer: ['welkom'], hint: 'Plak de hash in het opzoekveld en klik op Opzoeken; de tabel geeft het meteen.', explain: 'De onvergezouten MD5 van "welkom" is 371620aa75830b1388b63305b0d42f06 — direct terug te vinden in de tabel.' },
        { q: 'Waarom is het opzoeken "direct" en voelt het niet als kraken?', options: ['Omdat het rekenwerk al vooraf is gedaan en als hash → woord is opgeslagen', 'Omdat MD5 omkeerbaar is', 'Omdat de hash wordt ontsleuteld met een sleutel', 'Omdat de tabel het wachtwoord raadt'], answer: 0, explain: 'Alle hashes zijn vooraf berekend en opgeslagen. Opzoeken is daardoor een simpele lookup, geen gokwerk.' },
        { q: 'Plak de gesalte hash 329f3abf574738de33a01f7c630b1fb7. Wordt die in de tabel gevonden?', answer: ['nee', 'niet', 'niet gevonden', 'niet in de tabel'], hint: 'Deze hash is berekend met een salt; de tabel is dat niet.', explain: 'Nee — de gesalte hash staat niet in de voorberekende tabel, dus opzoeken faalt. Dat is de brug naar taak 3.' },
        { q: 'Wat is de vlag die je hier verdient?', answer: ['JVT{rainbow_zoekt_direct}'], hint: 'Staat in het inklapbare blok onderaan de taak.', explain: 'JVT{rainbow_zoekt_direct} bevestigt dat je een onvergezouten hash rechtstreeks hebt opgezocht.' },
      ],
    },

    {
      title: 'Taak 3 — Salt: per gebruiker, uniek en willekeurig',
      content: `
        <p>Je zag het in taak 2: een onvergezouten hash is zo opgezocht. De tegenmaatregel is verrassend simpel en heet
        <strong>salt</strong>. Een salt is een stukje willekeurige data dat je vóór het hashen aan het wachtwoord plakt.
        In plaats van <code>hash(wachtwoord)</code> bewaar je <code>hash(salt + wachtwoord)</code>, samen met het salt
        zelf. Bij het inloggen plak je hetzelfde salt er weer voor, hasht, en vergelijkt.</p>

        <h3>Drie eisen aan een goede salt</h3>
        <ul>
          <li><strong>Per gebruiker uniek:</strong> elke gebruiker (of elke wachtwoord-invoer) krijgt zijn eigen salt. Zo
          krijgen twee mensen met hetzelfde wachtwoord tóch twee totaal verschillende hashes. Een aanvaller ziet dus niet
          meer wie hetzelfde wachtwoord deelt, en kan één treffer niet hergebruiken.</li>
          <li><strong>Willekeurig (random):</strong> gegenereerd met een veilige toevalsbron, niet afgeleid van de
          gebruikersnaam of een teller. Voorspelbare salts kun je alsnog voorberekenen.</li>
          <li><strong>Lang genoeg:</strong> meestal 16 bytes of meer, zodat geen twee gebruikers per ongeluk hetzelfde
          salt krijgen.</li>
        </ul>

        <h3>Waarom dit precomputatie breekt</h3>
        <p>Een rainbow table (of opzoektabel) is berekend <em>zonder</em> jouw salt. Door het unieke salt verschuift elke
        hash naar een plek die in geen enkele kant-en-klare tabel voorkomt. De aanvaller kan niet één tabel tegen al je
        gebruikers tegelijk inzetten; hij zou voor <em>elk</em> salt een compleet nieuwe tabel moeten bouwen. Daarmee is
        de hele tijd-geheugen-afweging onderuitgehaald: precomputatie loont niet meer. Salt maakt kraken niet onmogelijk
        (een enkel zwak wachtwoord blijft kraakbaar), maar het dwingt de aanvaller terug naar traag, per-hash gokken.</p>

        <h3>Zie het in het lab</h3>
        <p>In het lab staat de hash <code>21232f297a57a5a743894a0e4a801fc3</code> alvast ingevuld: de onvergezouten MD5
        van <code>admin</code>. Die wordt direct gevonden. Plak daarna de gesalte variant
        <code>633c923b634754ecb6ef73b3308c3418</code> — dat is <code>md5("s4lt" + "admin")</code>. Zelfde wachtwoord,
        maar hij staat <em>niet</em> in de tabel. Het blauwe kader onderin laat de twee hashes naast elkaar zien.</p>

        <div class="callout info"><strong>Veelgestelde vraag: moet een salt geheim zijn?</strong> Nee. Een salt mag gerust
        openbaar naast de hash in de database staan. Zijn kracht zit niet in geheimhouding, maar in <em>uniciteit</em>:
        het verbreekt hergebruik van voorberekende tabellen. (Een geheim dat je wél apart houdt, heet peper — dat is taak
        4.)</div>

        <h3>Je beloning</h3>
        <details><summary>Toon de vlag (pas openen nadat je beide hashes hebt opgezocht)</summary>
          <p>Je verdiende vlag: <code>JVT{salt_breekt_de_tabel}</code>. Eén uniek salt per gebruiker en de hele
          precomputatie-aanval valt in duigen.</p>
        </details>
      `,
      lab: {
        type: 'rainbow',
        algo: 'md5',
        wordlist: ['admin', 'welkom', 'zomer2024', 'voetbal', 'liefde', 'qwerty', 'computer', 'dojo'],
        target: '21232f297a57a5a743894a0e4a801fc3',
        saltExample: { word: 'admin', salt: 's4lt' },
      },
      questions: [
        { q: 'Wat maakt een goede salt? Kies de beste omschrijving.', options: ['Per gebruiker uniek en willekeurig gegenereerd', 'Voor iedereen hetzelfde, zolang hij maar lang is', 'Afgeleid van de gebruikersnaam', 'Geheim gehouden en nooit opgeslagen'], answer: 0, explain: 'Uniek per gebruiker en willekeurig: dat is wat voorberekende tabellen waardeloos maakt.' },
        { q: 'Twee gebruikers kiezen hetzelfde wachtwoord. Wat doet een unieke salt met hun opgeslagen hashes?', options: ['Die worden toch verschillend', 'Die worden identiek', 'Die worden korter', 'Dat maakt geen verschil'], answer: 0, explain: 'Door het verschillende salt leveren identieke wachtwoorden verschillende hashes op — hergebruik en vergelijken wordt zinloos.' },
        { q: 'Moet een salt geheim zijn?', options: ['Nee, een salt mag openbaar naast de hash staan; zijn kracht is uniciteit', 'Ja, anders is hij waardeloos', 'Alleen op Windows', 'Ja, en hij mag nooit worden opgeslagen'], answer: 0, explain: 'Een salt hoeft niet geheim te zijn. Hij breekt precomputatie door uniek te zijn, niet door geheim te zijn.' },
        { q: 'Wat is de vlag die je hier verdient?', answer: ['JVT{salt_breekt_de_tabel}'], hint: 'Staat in het inklapbare blok onderaan de taak.', explain: 'JVT{salt_breekt_de_tabel} — een unieke salt per gebruiker haalt de precomputatie-aanval onderuit.' },
      ],
    },

    {
      title: 'Taak 4 — Peper en trage hashes: de werkfactor',
      content: `
        <p>Salt verslaat precomputatie, maar een aanvaller kan nog steeds per hash blijven gokken — en als de hash snel is
        (MD5, SHA-1, NTLM), gaat dat alsnog miljarden keren per seconde. Tegen dát probleem helpen twee extra lagen:
        <strong>peper</strong> en <strong>trage hashes</strong>.</p>

        <h3>Peper: een geheim dat níét in de database staat</h3>
        <p>Een <strong>peper</strong> (pepper) lijkt op een salt — je plakt hem ook aan het wachtwoord — maar met één
        cruciaal verschil: de peper wordt <strong>niet</strong> in de database bewaard. Je houdt hem apart, bijvoorbeeld
        in de applicatieconfiguratie, een omgevingsvariabele of een <strong>HSM</strong> (hardware security module). Het
        gevolg: als alleen de database lekt (het meest voorkomende scenario), mist de aanvaller de peper en kan hij zelfs
        met het juiste wachtwoord de hash niet reproduceren. Een peper is dus een server-side geheim dat bovenop salt een
        extra drempel legt. Belangrijk verschil om te onthouden:</p>
        <table>
          <thead><tr><th></th><th>Salt</th><th>Peper</th></tr></thead>
          <tbody>
            <tr><td><strong>Doel</strong></td><td>Precomputatie breken</td><td>Extra laag als de database lekt</td></tr>
            <tr><td><strong>Uniek?</strong></td><td>Per gebruiker uniek</td><td>Vaak één geheim voor alle gebruikers</td></tr>
            <tr><td><strong>Waar opgeslagen?</strong></td><td>Naast de hash in de database</td><td>Apart, buiten de database</td></tr>
            <tr><td><strong>Geheim?</strong></td><td>Nee</td><td>Ja</td></tr>
          </tbody>
        </table>

        <h3>Trage hashes en de werkfactor</h3>
        <p>De belangrijkste verdediging is een <strong>trage hash</strong>. MD5 en SHA-256 zijn ontworpen om snel te zijn —
        prima voor bestandscontrole, ramp voor wachtwoorden. Trage hashes zijn juist <em>expres</em> traag gemaakt met een
        instelbare <strong>werkfactor</strong> (cost). Hoger betekent meer rekenwerk per gok. Eén echte login merkt die
        vertraging nauwelijks (een fractie van een seconde), maar een aanvaller die miljarden keren wil gokken loopt
        volledig vast. De drie die je moet kennen:</p>
        <ul>
          <li><strong>bcrypt:</strong> begint met <code>$2a$</code>, <code>$2b$</code> of <code>$2y$</code>, gevolgd door
          de werkfactor, bijvoorbeeld <code>$2b$12$...</code> (de 12 is de cost). Beproefd en wijdverbreid.</li>
          <li><strong>scrypt:</strong> niet alleen traag, maar ook bewust <em>geheugen-intensief</em>, zodat speciale
          kraak-hardware (GPU's, ASIC's) minder voordeel heeft.</li>
          <li><strong>Argon2:</strong> winnaar van de Password Hashing Competition (2015) en de huidige aanrader. Je stelt
          geheugen (<code>m</code>), iteraties (<code>t</code>) en parallelisme (<code>p</code>) in, bijvoorbeeld
          <code>$argon2id$v=19$m=65536,t=3,p=4$...</code>. De variant <strong>Argon2id</strong> combineert bescherming
          tegen zowel GPU- als side-channel-aanvallen.</li>
        </ul>

        <h3>Eerst herkennen</h3>
        <p>Voor je iets probeert te kraken, moet je weten wát je voor je hebt. Trage, gesalte hashes dragen hun type vaak
        in een <code>$</code>-prefix. In het lab staat een bcrypt-hash. Laat de tool het type herkennen en let op dat ze
        hem als "moeilijk te kraken" markeert — dat is precies de bedoeling van een trage hash.</p>
        <div class="callout tip"><strong>Tip:</strong> plak ter vergelijking ook eens
        <code>$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$aBcDeFgHiJ</code> of een <code>$6$</code>-string (sha512crypt uit
        <code>/etc/shadow</code>). Leer de prefixen herkennen: zie je een dollarteken met een versielabel, dan weet je dat
        een kale woordenlijst op MD5-tempo hier niet gaat werken.</div>
      `,
      lab: { type: 'hashid', value: '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9PgBkqquzi.Ss7KIUgO2t0jWMUW' },
      questions: [
        { q: 'Wat is het belangrijkste verschil tussen salt en peper?', options: ['Een peper wordt apart bewaard (niet in de database); een salt staat naast de hash', 'Een peper is per gebruiker uniek en een salt niet', 'Een peper maakt het wachtwoord korter', 'Er is geen verschil'], answer: 0, explain: 'Salt staat (openbaar) naast de hash en is per gebruiker uniek; peper is een geheim dat je buiten de database houdt.' },
        { q: 'Aan welk prefix herken je een bcrypt-hash?', answer: ['$2b$', '$2a$', '$2y$', '2b', '2a'], hint: 'Een dollarteken, een versielabel en daarna de werkfactor.', explain: 'bcrypt begint met $2a$, $2b$ of $2y$, gevolgd door de cost (bijv. $2b$12$).' },
        { q: 'Wat doet een hogere werkfactor (cost) bij een trage hash?', options: ['Elke gok kost meer rekentijd, waardoor massaal kraken onbetaalbaar wordt', 'De hash wordt korter', 'Het wachtwoord wordt automatisch sterker', 'Inloggen wordt onmogelijk'], answer: 0, explain: 'Een hogere werkfactor vertraagt elke hashberekening. Voor één login verwaarloosbaar, voor miljarden gokken dodelijk.' },
        { q: 'Welke trage hash won de Password Hashing Competition en is de huidige aanrader?', answer: ['argon2', 'argon2id', 'argon'], hint: 'De id-variant beschermt tegen GPU- én side-channel-aanvallen.', explain: 'Argon2 (en specifiek Argon2id) is sinds 2015 de aanbevolen keuze voor nieuwe systemen.' },
      ],
    },

    {
      title: 'Taak 5 — Zonder salt werkt een woordenlijst meteen',
      content: `
        <p>We hebben gezien waarom salt en trage hashes verdedigen. Laten we nu voelen wat er misgaat <em>zonder</em> die
        verdediging. Stel een dienst slaat wachtwoorden op als kale, onvergezouten MD5 — en die database lekt. Dan is niet
        alleen precomputatie mogelijk; zelfs een gewone <strong>woordenlijstaanval</strong> rolt er in een oogwenk
        doorheen.</p>

        <h3>Het dubbele probleem van "geen salt"</h3>
        <p>Zonder salt gebeuren er twee nare dingen tegelijk:</p>
        <ul>
          <li>Een aanvaller kan één voorberekende tabel tegen <em>alle</em> hashes tegelijk inzetten (taak 1-3).</li>
          <li>En omdat elke gebruiker met hetzelfde wachtwoord dezelfde hash heeft, hoeft hij een populair wachtwoord maar
          één keer te hashen om het bij <em>iedereen</em> te herkennen die het gebruikt. Hij hasht zijn woordenlijst dus
          maar één keer en vergelijkt met de hele database in één klap.</li>
        </ul>
        <p>Met een per-gebruiker unieke salt verdwijnen beide voordelen: de aanvaller moet zijn woordenlijst opnieuw hashen
        voor <em>elk</em> salt apart. Precies dat extra werk, vermenigvuldigd met een trage hash, is wat verdediging zo
        effectief maakt.</p>

        <h3>Aan de slag</h3>
        <p>In het lab staat een onvergezouten MD5-hash en een korte woordenlijst — net als bij een echte dump, alleen
        veel korter. Start de woordenlijstaanval en laat de tool de lijst aflopen. De hash is zo gekraakt, want hij is
        onvergezouten én van een alledaags wachtwoord. Denk er bij elke treffer aan: was deze hash met een unieke salt én
        een trage hash opgeslagen, dan had deze aanval geen schijn van kans gehad.</p>

        <div class="callout danger"><strong>De les:</strong> "we hashen de wachtwoorden toch?" is geen verdediging als het
        om een kale, snelle, onvergezouten hash gaat. MD5 zonder salt is in de praktijk nauwelijks beter dan platte tekst.</div>

        <h3>Je beloning</h3>
        <details><summary>Toon de vlag (pas openen nadat je het wachtwoord hebt gekraakt)</summary>
          <p>Je verdiende vlag: <code>JVT{zonder_salt_valt_het}</code>. Geen salt plus een snelle hash is een open deur —
          voor opzoeken én voor een woordenlijst.</p>
        </details>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        hash: 'd9898c6cad232125606d4ceea5a35e41',
        salt: '',
        wordlist: ['123456', 'welkom', 'qwerty', 'liefde', 'voetbal', 'admin', 'maandag', 'computer'],
      },
      questions: [
        { q: 'Start de woordenlijstaanval. Welk wachtwoord hoort bij de hash?', answer: ['voetbal'], hint: 'Laat de tool de hele lijst aflopen; één woord geeft precies dezelfde MD5.', explain: 'De onvergezouten MD5 van "voetbal" is d9898c6cad232125606d4ceea5a35e41 — een klassieke woordenlijst-treffer.' },
        { q: 'Waarom helpt een per-gebruiker unieke salt juist hier als verdediging?', options: ['De aanvaller kan één woordenlijst niet meer tegen alle hashes tegelijk gebruiken; hij moet per salt opnieuw hashen', 'De salt maakt het wachtwoord geheim', 'De salt versleutelt de database', 'De salt maakt MD5 trager'], answer: 0, explain: 'Door de unieke salt levert hetzelfde wachtwoord bij iedereen een andere hash op, dus de aanvaller moet per hash opnieuw rekenen.' },
        { q: 'Waarom is een kale, onvergezouten MD5 nauwelijks beter dan platte tekst?', options: ['MD5 is snel en zonder salt werken opzoeken én woordenlijsten direct', 'MD5 is omkeerbaar met een sleutel', 'Omdat MD5 te kort is om op te slaan', 'Dat klopt niet, MD5 is juist veilig'], answer: 0, explain: 'Een snelle, onvergezouten hash valt zowel voor precomputatie als voor een simpele woordenlijstaanval — een open deur.' },
        { q: 'Wat is de vlag die je hier verdient?', answer: ['JVT{zonder_salt_valt_het}'], hint: 'Staat in het inklapbare blok onderaan de taak.', explain: 'JVT{zonder_salt_valt_het} — zonder salt en met een snelle hash valt het wachtwoord meteen.' },
      ],
    },

    {
      title: 'Taak 6 — Moderne opslag en wachtwoordbeleid',
      content: `
        <p>Je kent nu alle bouwstenen. Tijd om ze samen te voegen tot het recept dat een modern systeem gebruikt — en tot
        het beleid dat je gebruikers helpt sterke wachtwoorden te kiezen. Verdedigen betekent twee dingen tegelijk
        wegnemen waar de aanvaller op leunt: <em>snelheid</em> en <em>voorspelbaarheid</em>.</p>

        <h3>Het recept voor het systeem</h3>
        <ul>
          <li><strong>Trage hash met hoge werkfactor:</strong> gebruik <strong>Argon2id</strong> (aanrader), of anders
          <strong>bcrypt</strong>/<strong>scrypt</strong>. Stel de parameters zo hoog als je hardware en gewenste
          responstijd toelaten, en verhoog ze mee met snellere hardware.</li>
          <li><strong>Per-gebruiker unieke, willekeurige salt:</strong> bij bcrypt en Argon2 zit dit standaard ingebouwd
          en wordt het salt in de hashstring opgenomen. Zo breek je precomputatie.</li>
          <li><strong>Eventueel een peper:</strong> een server-side geheim buiten de database, als extra laag voor het
          geval alleen de database lekt.</li>
          <li><strong>Beperk online gokken:</strong> rate limiting en account-lockout tegen het inlogscherm, los van hoe
          je opslaat.</li>
        </ul>
        <p>Kort samengevat: <strong>Argon2id + unieke salt + (optioneel) peper</strong>. Dat is waar je naartoe wilt.</p>

        <h3>Het beleid voor de gebruiker</h3>
        <ul>
          <li><strong>Lengte verslaat alles.</strong> De zoekruimte groeit exponentieel met de lengte; een lange
          wachtwoordzin (passphrase) van vier of meer willekeurige woorden is zowel te onthouden als ondoenlijk te
          brute-forcen.</li>
          <li><strong>Uniek per account</strong>, bewaard in een <strong>wachtwoordmanager</strong>, zodat één lek niet al
          je accounts meesleept.</li>
          <li><strong>MFA aan</strong> op je belangrijkste accounts: zelfs een gekraakt wachtwoord is dan niet genoeg.</li>
          <li><strong>Lekcontrole:</strong> blokkeer wachtwoorden die in bekende datalekken voorkomen (bijvoorbeeld via
          Have I Been Pwned).</li>
          <li><strong>Géén verplichte periodieke wijziging.</strong> Het oude advies om elke maand te wijzigen is
          achterhaald: het leidt tot zwakkere, voorspelbare varianten. NCSC en NIST raden aan alleen te wijzigen bij een
          (vermoeden van een) lek.</li>
        </ul>

        <div class="callout tip"><strong>Probeer het in het lab:</strong> typ eerst een kort, voorspelbaar wachtwoord en
        bekijk de geschatte kraaktijd. Maak het daarna fors langer met een paar extra woorden en zie de schatting omslaan
        van "seconden" naar "onhaalbaar". Zo voel je terug waarom lengte, salt en trage hashes elkaar versterken.</div>

        <h3>Afsluiting</h3>
        <p>Je kunt nu uitleggen wat een precomputatie-aanval is, waarom een platte opzoektabel en een echte rainbow table
        met ketens hetzelfde doel dienen, en vooral: waarom salt wint. Een unieke salt breekt precomputatie, een peper
        legt daar een geheim bovenop, en een trage hash met hoge werkfactor maakt elke gok duur. Combineer dat met lengte,
        uniciteit, MFA en lekcontrole, en je hebt wachtwoordopslag die stand houdt. Gebruik deze kennis verantwoord:
        kraken oefen je alleen op je eigen hashes, op oefenhashes, of binnen een getekende opdracht.</p>
        <div class="callout info"><strong>Verder lezen?</strong> De OWASP Password Storage Cheat Sheet geeft concrete
        parameters voor Argon2, bcrypt en scrypt, en het NCSC heeft praktisch wachtwoordadvies.</div>
      `,
      lab: { type: 'password' },
      questions: [
        { q: 'Wat is de aanbevolen moderne opslagmethode voor wachtwoorden?', options: ['Argon2id met een unieke salt (en eventueel een peper)', 'MD5 met een salt', 'SHA-256 zonder salt', 'Platte tekst met een back-up'], answer: 0, explain: 'Argon2id met per-gebruiker salt (en optioneel peper) combineert traagheid, salting en moderne bescherming.' },
        { q: 'Welke eigenschap van een wachtwoord verslaat precomputatie en brute force het sterkst?', answer: ['lengte', 'de lengte', 'langer'], hint: 'De zoekruimte groeit exponentieel met dit kenmerk.', explain: 'Lengte: elk extra teken vermenigvuldigt de zoekruimte, waardoor zelfs vooraf berekenen onbetaalbaar wordt.' },
        { q: 'Welk ouderwets wachtwoordadvies raden NCSC en NIST tegenwoordig af?', options: ['Wachtwoorden verplicht elke maand wijzigen', 'Wachtwoorden uniek per account maken', 'Een wachtwoordmanager gebruiken', 'MFA aanzetten'], answer: 0, explain: 'Verplichte periodieke wijziging leidt tot zwakkere, voorspelbare varianten. Wijzig alleen bij een (vermoeden van een) lek.' },
        { q: 'Ik kan uitleggen waarom een unieke salt, een peper, een trage hash én voldoende lengte samen een rainbow table en brute force verslaan.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'Precomputatie-aanval', def: 'Hashes van veel kandidaat-wachtwoorden vooraf berekenen en opslaan, zodat kraken later een simpele opzoekactie wordt.' },
    { term: 'Tijd-geheugen-afweging', def: 'Vooraf rekentijd en opslag investeren om tijdens de aanval tijd te besparen; de kern van rainbow tables.' },
    { term: 'Opzoektabel', def: 'De simpele variant van precomputatie: een platte lijst van hash naar wachtwoord; snel maar enorm in opslag.' },
    { term: 'Rainbow table', def: 'Gecomprimeerde precomputatie-tabel die met ketens en reductiefuncties veel opslag bespaart; nutteloos tegen gesalte hashes.' },
    { term: 'Reductiefunctie', def: 'Functie die een hash afbeeldt op een nieuw kandidaat-wachtwoord; geen inverse van de hash, maar maakt ketens mogelijk.' },
    { term: 'Keten (chain)', def: 'Afwisselend hashen en reduceren in een rainbow table, waarvan alleen begin en eind worden opgeslagen.' },
    { term: 'Salt', def: 'Per-gebruiker unieke, willekeurige waarde die vóór het hashen wordt toegevoegd; mag openbaar zijn en breekt precomputatie.' },
    { term: 'Peper (pepper)', def: 'Server-side geheim dat apart van de database wordt bewaard, als extra laag bovenop salt.' },
    { term: 'Trage hash', def: 'Wachtwoord-hash die bewust rekenkracht kost (bcrypt, scrypt, Argon2) om massaal gokken onbetaalbaar te maken.' },
    { term: 'Werkfactor (cost)', def: 'Instelbare traagheid van een trage hash; hoger betekent meer rekentijd per gok.' },
    { term: 'bcrypt', def: 'Beproefde trage hash met instelbare werkfactor; te herkennen aan het prefix $2a$/$2b$/$2y$.' },
    { term: 'Argon2id', def: 'Winnaar van de Password Hashing Competition (2015) en huidige aanrader; instelbaar op geheugen, iteraties en parallelisme.' },
  ],
  resources: [
    { title: 'Wikipedia — Rainbow table (precomputatie en ketens)', url: 'https://en.wikipedia.org/wiki/Rainbow_table' },
    { title: 'OWASP — Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' },
    { title: 'Wikipedia — Argon2', url: 'https://en.wikipedia.org/wiki/Argon2' },
    { title: 'NCSC — Nationaal Cyber Security Centrum', url: 'https://www.ncsc.nl/' },
  ],
});
