/* Room: Wachtwoorden kraken — woordenlijst, regels en maskers */
CS.registerRoom({
  id: 'wachtwoorden-kraken',
  path: 'offensief',
  order: 5,
  title: 'Wachtwoorden kraken: woordenlijst, regels & maskers',
  icon: '🔓',
  difficulty: 'Moeilijk',
  minutes: 80,
  summary: 'Een kraak-diepgang: leer offline wachtwoordhashes kraken met woordenlijsten, regels (mangling) en maskers — binnen de wet, alleen op je eigen of gelekte hashes in een lab.',
  objectives: [
    'De wettelijke en ethische grenzen van wachtwoorden kraken benoemen (art. 138ab Sr, scope, toestemming)',
    'Uitleggen waarom kraken = gokken + hashen + vergelijken, en het verschil tussen snelle en trage hashes',
    'Een woordenlijstaanval (dictionary) uitvoeren op een hash',
    'Regels (mangling) toepassen om varianten van basiswoorden te maken',
    'Een masker-aanval (brute force) inzetten op korte wachtwoorden en de zoekruimte inschatten',
    'Salt, NTLM en trage hashes herkennen en uitleggen hoe je kraken onhaalbaar maakt',
  ],
  tasks: [
    {
      title: 'Taak 1 — Eerst de wet en de ethiek',
      content: `
        <p>Voor we ook maar één hash aanraken, dit: wachtwoorden kraken is een krachtige techniek die je
        <strong>alleen legaal</strong> mag inzetten. Doe je het verkeerd, dan pleeg je een misdrijf. Deze taak is geen
        formaliteit — het is de grens tussen een pentester en een crimineel.</p>

        <h3>De gouden regel</h3>
        <div class="callout danger"><strong>Je kraakt uitsluitend:</strong>
          <ul>
            <li>je <strong>eigen</strong> hashes (wachtwoorden die jij zelf hebt gezet), of</li>
            <li>hashes waarvoor je <strong>schriftelijke toestemming</strong> hebt (een opdracht met scope), of</li>
            <li>oefenhashes in een <strong>lab</strong> zoals dit, of in een legale CTF/wargame.</li>
          </ul>
          Alles daarbuiten — het account van een ander, een hash die je ergens vond, de wifi van de buren — is
          strafbaar. Punt.
        </div>

        <h3>Offline, nooit online</h3>
        <p>Een belangrijk misverstand: je kraakt <strong>nooit een online dienst</strong> door op een inlogpagina
        duizenden wachtwoorden in te typen. Dat is traag, het valt meteen op, het triggert account-lockout en
        rate limiting, en het is bovendien <em>computervredebreuk</em>. Echt kraken gebeurt <strong>offline</strong>:
        een aanvaller (of jij, in opdracht) heeft al een bestand met <em>gehashte</em> wachtwoorden in handen — uit een
        datalek, een buitgemaakte database, of de wachtwoord-opslag van een systeem dat je mag testen — en probeert op
        de <em>eigen</em> computer te achterhalen welk wachtwoord bij welke hash hoort. Geen enkele server merkt daar
        iets van, want je raakt die server niet aan.</p>

        <h3>De Nederlandse wet: art. 138ab Sr</h3>
        <p>Opzettelijk en wederrechtelijk binnendringen in een geautomatiseerd werk heet <strong>computervredebreuk</strong>
        en staat in <strong>artikel 138ab van het Wetboek van Strafrecht (Sr)</strong>. Een wachtwoord van een ander
        kraken om ergens binnen te komen valt daar direct onder. Ook het enkel <em>voorhanden hebben</em> of verspreiden
        van gelekte wachtwoordbestanden kan strafbaar zijn (heling van gegevens, art. 139g Sr). "Ik wilde alleen
        kijken" is geen excuus; het gaat om <em>opzet</em> en het ontbreken van <em>toestemming</em>.</p>

        <h3>Waarom pentesters dit wél legaal doen</h3>
        <p>Een pentester of red-teamer kraakt wachtwoorden om een organisatie te helpen: zijn de wachtwoorden sterk
        genoeg? Dat mag, omdat er een <strong>opdracht</strong> ligt met een duidelijke <strong>scope</strong> (wat mag
        je wel en niet raken) en <strong>rules of engagement</strong>, schriftelijk vastgelegd en ondertekend. Die
        toestemming is je enige wettelijke basis. Zonder papier geen test. Werk altijd binnen de scope, documenteer wat
        je doet, en lever de resultaten vertrouwelijk op — nooit publiceren of de gekraakte wachtwoorden hergebruiken.</p>

        <div class="callout warn"><strong>Onthoud:</strong> de techniek in deze room is identiek voor een pentester en
        voor een crimineel. Het enige verschil is <em>toestemming</em>. In dit lab oefen je op veilige oefenhashes die
        wij voor je klaarzetten — precies zoals het hoort.</div>
      `,
      questions: [
        { q: 'Welk Nederlands wetsartikel gaat over computervredebreuk (binnendringen)?', answer: ['138ab', 'art. 138ab', 'artikel 138ab', '138ab sr'], hint: 'Het staat in het Wetboek van Strafrecht en begint met 138.', explain: 'Art. 138ab Sr stelt het opzettelijk en wederrechtelijk binnendringen in een geautomatiseerd werk strafbaar.' },
        { q: 'Wat is de enige wettelijke basis waarop een pentester wachtwoorden mag kraken?', options: ['Schriftelijke toestemming/opdracht met scope', 'Een goed doel', 'Dat de hash toch al gelekt was', 'Dat niemand het merkt'], answer: 0, explain: 'Zonder getekende opdracht met scope en rules of engagement is er geen wettelijke basis; dan is het strafbaar.' },
        { q: 'Waarom kraak je nooit een online dienst door wachtwoorden op de inlogpagina te proberen?', options: ['Het is traag, valt op door lockout/rate limiting en is computervredebreuk', 'Omdat online wachtwoorden niet gehasht zijn', 'Omdat het altijd lukt', 'Omdat de hash dan verdwijnt'], answer: 0, explain: 'Online gokken is traag, loopt tegen lockout/rate limiting en is bovendien strafbaar. Echt kraken is offline op hashes die je mag testen.' },
        { q: 'Ik begrijp dat ik alleen mijn eigen hashes, oefenhashes of hashes met schriftelijke toestemming mag kraken.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — Hoe een hash werkt en wat "kraken" echt is',
      content: `
        <p>Om te kraken moet je eerst snappen wat een hash is. Een <strong>hashfunctie</strong> (zoals MD5, SHA-1,
        SHA-256) neemt invoer van elke lengte en maakt daar een vaste, korte uitvoer van: de <strong>hash</strong>.
        Drie eigenschappen zijn cruciaal:</p>
        <ul>
          <li><strong>Deterministisch:</strong> dezelfde invoer geeft altijd exact dezelfde hash.</li>
          <li><strong>Eenrichting:</strong> uit de hash kun je het origineel niet <em>terugrekenen</em>.</li>
          <li><strong>Lawine-effect:</strong> verander één teken en de hele hash verandert.</li>
        </ul>
        <p>Diensten slaan daarom geen wachtwoorden op, maar de hash ervan. Bij het inloggen hashen ze wat jij intypt en
        vergelijken ze dat met de opgeslagen hash. Komt het overeen, dan ben je binnen — zonder dat het wachtwoord zelf
        ergens bewaard hoeft te worden.</p>

        <h3>Kraken = gokken + hashen + vergelijken</h3>
        <p>Omdat een hash eenrichting is, kun je hem niet "terugrekenen". Wat je wél kunt, is <strong>gokken</strong>.
        Het recept is simpel en het is letterlijk het enige wat elke kraaktool doet:</p>
        <ol>
          <li>Neem een kandidaat-wachtwoord (een gok).</li>
          <li><strong>Hash</strong> die kandidaat met hetzelfde algoritme.</li>
          <li><strong>Vergelijk</strong> met de doel-hash. Gelijk? Gevonden. Niet gelijk? Volgende gok.</li>
        </ol>
        <p>Kraken is dus geen wiskundige truc die de hash "omdraait"; het is heel snel heel veel gokken. De kunst zit in
        <em>slim</em> gokken (woordenlijsten, regels en maskers — de volgende taken) en in <em>snel</em> gokken.</p>

        <h3>Snelle versus trage hashes</h3>
        <p>Hoe sneller je één gok kunt hashen, hoe meer gokken per seconde — en dus hoe makkelijker te kraken. Dit is het
        belangrijkste onderscheid van de hele room:</p>
        <table>
          <thead><tr><th>Type</th><th>Voorbeelden</th><th>Gokken/seconde (grofweg)</th></tr></thead>
          <tbody>
            <tr><td><strong>Snelle hash</strong></td><td>MD5, SHA-1, SHA-256, NTLM</td><td>miljarden op een goede GPU</td></tr>
            <tr><td><strong>Trage hash</strong></td><td>bcrypt, scrypt, Argon2, PBKDF2</td><td>duizenden — met opzet geremd</td></tr>
          </tbody>
        </table>
        <p>Snelle hashes zijn ontworpen voor snelheid (bestandscontrole), niet voor wachtwoorden. MD5 en SHA-256 zijn
        razendsnel, dus een aanvaller raast door enorme lijsten. Trage hashes zoals <strong>bcrypt</strong> en
        <strong>Argon2</strong> zijn juist <em>expres</em> traag gemaakt (werkfactor/kosten): één gok duurt relatief lang,
        waardoor miljarden gokken ineens onbetaalbaar worden. Daarover meer in taak 6.</p>

        <h3>Eerst herkennen: welke hash is dit?</h3>
        <p>Voor je gaat kraken, moet je weten <em>welk algoritme</em> je voor je hebt — anders hash je je gokken met het
        verkeerde recept en vind je nooit iets. Vaak kun je dat aan de lengte en vorm zien:</p>
        <ul>
          <li><strong>MD5</strong>: 32 hex-tekens. <strong>NTLM</strong>: ook 32 hex (Windows).</li>
          <li><strong>SHA-1</strong>: 40 hex-tekens.</li>
          <li><strong>SHA-256</strong>: 64 hex-tekens.</li>
          <li><strong>bcrypt</strong>: begint met <code>$2a$</code>/<code>$2b$</code>/<code>$2y$</code>. <strong>sha512crypt</strong>: begint met <code>$6$</code>.</li>
        </ul>
        <p>Gebruik het lab hieronder: plak een hash en laat de tool raden welk type het is. Oefen met een paar lengtes
        zodat je het straks op het oog herkent.</p>
      `,
      lab: { type: 'hashid', value: '9bea15890f18ef35a12767fef5d234b8' },
      questions: [
        { q: 'Waarom kun je een hash niet "terugrekenen" naar het wachtwoord?', options: ['Omdat een hashfunctie eenrichting is; je kunt alleen gokken, hashen en vergelijken', 'Omdat de hash versleuteld is met een sleutel', 'Omdat hashes geheim zijn', 'Dat kan juist wel, met de juiste formule'], answer: 0, explain: 'Een hash is eenrichting. Kraken is daarom gokken + hashen + vergelijken, geen terugrekening.' },
        { q: 'Je plakt de hash uit het lab. Hoeveel hex-tekens telt een MD5-hash?', answer: ['32'], hint: 'Tel de tekens, of lees het af in de hashid-tool.', explain: 'MD5 is 32 hex-tekens. NTLM is ook 32, SHA-1 is 40 en SHA-256 is 64.' },
        { q: 'Welk type hash is het lastigst te kraken omdat het expres traag is?', options: ['bcrypt / Argon2 (trage hash)', 'MD5', 'SHA-1', 'NTLM'], answer: 0, explain: 'Trage hashes zoals bcrypt en Argon2 remmen elke gok af, waardoor massaal gokken onbetaalbaar wordt.' },
        { q: 'Waaraan herken je een bcrypt-hash in één oogopslag?', answer: ['$2a$', '$2b$', '$2y$', '2a', '2b'], hint: 'Kijk naar de eerste tekens; het begint met een dollarteken en een versielabel.', explain: 'bcrypt-hashes beginnen met $2a$, $2b$ of $2y$, gevolgd door de werkfactor.' },
      ],
    },

    {
      title: 'Taak 3 — De woordenlijstaanval (dictionary)',
      content: `
        <p>De meest gebruikte en meest effectieve aanval is de <strong>woordenlijstaanval</strong> (dictionary attack).
        Het idee sluit naadloos aan op taak 2: in plaats van blind alle combinaties te proberen, gok je slim met een
        <strong>woordenlijst</strong> (wordlist) vol waarschijnlijke wachtwoorden. Voor elk woord: hashen, vergelijken,
        door. Omdat mensen voorspelbaar zijn, kraak je zo een groot deel van elke lekdump in seconden.</p>

        <h3>Waarom dit zo goed werkt</h3>
        <p>Mensen kiezen geen willekeurige tekens. Ze kiezen namen, plaatsen, het woord "welkom", hun favoriete club,
        of een bekend lek-wachtwoord. Een goede woordenlijst bevat precies die woorden, gesorteerd op hoe vaak ze
        voorkomen. De beroemdste is <strong>rockyou.txt</strong> (ruim 14 miljoen wachtwoorden uit een oud datalek);
        andere bekende lijsten komen uit projecten als <em>SecLists</em> en <em>weakpass</em>. Je hoeft die lijsten
        hier niet te downloaden — onthoud alleen dat ze bestaan en dat kraaktools als
        <strong>hashcat</strong> en <strong>John the Ripper</strong> ze razendsnel aflopen.</p>

        <div class="callout info"><strong>rockyou?</strong> De lijst dankt zijn naam aan het bedrijf RockYou, dat in 2009
        miljoenen wachtwoorden in platte tekst opsloeg en lekte. Sindsdien is het hét startpunt voor een
        woordenlijstaanval — een pijnlijk monument voor slechte opslag.</div>

        <h3>Aan de slag</h3>
        <p>In het lab staat een MD5-hash en een kleine woordenlijst (zo werkt het echt, alleen veel korter). Start de
        woordenlijstaanval en laat de tool de lijst aflopen. De tool hasht elk woord met MD5 en vergelijkt het met de
        doel-hash. Eén woord geeft exact dezelfde hash — dat is het wachtwoord.</p>

        <div class="callout tip"><strong>Tip:</strong> je kunt in de tool ook je eigen gok toevoegen. Probeer eerst
        zelf te raden welk woord in zo'n lijst het meest voor de hand ligt, en kijk of je gelijk had.</div>

        <h3>Je beloning</h3>
        <p>Heb je het wachtwoord gevonden? Mooi — dan heb je je eerste hash gekraakt. Als bewijs lever je deze vlag in:</p>
        <details><summary>Toon de vlag (pas openen nadat je het wachtwoord hebt gekraakt)</summary>
          <p>Je verdiende vlag is <code>JVT{woordenlijst_kraakt_snel}</code>. Omdat MD5 een snelle hash is, was de hele
          lijst in een fractie van een seconde doorlopen — onthoud dat gevoel als we het straks over trage hashes
          hebben.</p>
        </details>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        hash: '371620aa75830b1388b63305b0d42f06',
        salt: '',
        wordlist: ['123456', 'qwerty', 'welkom', 'wachtwoord', 'admin', 'liefde', 'voetbal', 'maandag'],
      },
      questions: [
        { q: 'Start de woordenlijstaanval. Welk wachtwoord hoort bij de hash?', answer: ['welkom'], hint: 'Laat de tool de hele lijst aflopen; één woord geeft precies dezelfde MD5.', explain: 'Het woord "welkom" heeft exact deze MD5-hash. Een klassieke dictionary-treffer.' },
        { q: 'Hoe heet de beroemde woordenlijst uit een oud datalek die vaak het startpunt is?', answer: ['rockyou', 'rockyou.txt'], hint: 'Vernoemd naar het bedrijf dat de wachtwoorden lekte.', explain: 'rockyou.txt bevat ruim 14 miljoen gelekte wachtwoorden en is het klassieke startpunt.' },
        { q: 'Wat is de vlag die je verdient na het kraken?', answer: ['JVT{woordenlijst_kraakt_snel}'], hint: 'Hij staat in het inklapbare blok onderaan de taak.', explain: 'De vlag JVT{woordenlijst_kraakt_snel} bewijst je eerste geslaagde woordenlijstaanval.' },
        { q: 'Waarom werkt een woordenlijstaanval zo vaak?', options: ['Omdat mensen voorspelbare wachtwoorden kiezen (namen, lek-woorden, "welkom")', 'Omdat hashes zwak zijn', 'Omdat de tool de hash terugrekent', 'Omdat alle wachtwoorden in rockyou staan'], answer: 0, explain: 'Mensen kiezen geen willekeur; een lijst van waarschijnlijke wachtwoorden pakt daarom een groot deel.' },
      ],
    },

    {
      title: 'Taak 4 — Regels en mangling: varianten op een thema',
      content: `
        <p>Een kale woordenlijst mist alles wat mensen <em>aan</em> een woord plakken: een hoofdletter vooraan, een
        cijfer of jaartal erachter, een uitroepteken, of letters vervangen door lijkende tekens (l33t-speak). Daarvoor
        bestaan <strong>regels</strong> (rules), ook wel <strong>mangling</strong> genoemd. Een regel is een kleine
        transformatie die de tool op elk woord uit de lijst toepast — zo maak je uit één basiswoord tientallen
        realistische varianten, zonder je lijst op te blazen.</p>

        <h3>Veelgebruikte regels</h3>
        <ul>
          <li><strong>Hoofdletter:</strong> <code>welkom</code> → <code>Welkom</code>.</li>
          <li><strong>Cijfers erachter (digits):</strong> het woord + <code>0</code> t/m <code>99</code>, dus
          <code>welkom0</code>, <code>welkom1</code>, … <code>welkom99</code>.</li>
          <li><strong>Jaartal erachter (year):</strong> het woord + een jaartal van <code>1990</code> t/m <code>2026</code>,
          dus <code>zomer1990</code> … <code>zomer2026</code>.</li>
          <li><strong>l33t-speak:</strong> <code>a</code>→<code>4</code>, <code>e</code>→<code>3</code>,
          <code>o</code>→<code>0</code>, <code>i</code>→<code>1</code>/<code>!</code>, <code>s</code>→<code>5</code>.
          Zo wordt <code>liefde</code> bijvoorbeeld <code>l13fd3</code>.</li>
          <li><strong>Leesteken erachter:</strong> vaak gewoon een <code>!</code>.</li>
        </ul>
        <p>Combineer je regels (hoofdletter + jaartal), dan zit je al gauw op precies het soort wachtwoord dat een mens
        verzint als "sterk": <code>Zomer2024</code>, <code>Welkom2025!</code>, <code>V0etbal1</code>. Voor de tool is dat
        nog steeds één basiswoord plus een handjevol regels — kinderspel.</p>

        <h3>Rekenvoorbeeld</h3>
        <p>Neem het basiswoord <code>zomer</code>. Dat staat vast in elke degelijke woordenlijst. Met de
        <em>year</em>-regel maakt de tool daar onder meer <code>zomer2024</code> van (want 2024 ligt tussen 1990 en
        2026). Precies die variant is in het lab de oplossing: het basiswoord alléén kraakt de hash niet, maar het
        basiswoord <em>met de juiste regel</em> wel.</p>

        <div class="callout tip"><strong>In dit lab:</strong> de woordenlijst bevat basiswoorden als <code>zomer</code>
        en <code>welkom</code>. Voor de oefening staat het doelwoord er óók in, zodat je sowieso een treffer krijgt. Maar
        de echte les is: zet in je hoofd de <em>year</em>-regel aan en zie hoe uit <code>zomer</code> vanzelf
        <code>zomer2024</code> ontstaat. In hashcat zou je dat doen met een regelbestand als <code>best64.rule</code>.</div>

        <h3>Je beloning</h3>
        <details><summary>Toon de vlag (pas openen nadat je het wachtwoord hebt gevonden)</summary>
          <p>Je verdiende vlag: <code>JVT{regels_maken_varianten}</code>. Onthoud: een "sterk ogend" wachtwoord als
          <code>Zomer2024</code> is voor een kraaktool nauwelijks meer werk dan het kale woord <code>zomer</code>.</p>
        </details>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        hash: '2a4652cb030cfef3627fe1624e77ac16',
        salt: '',
        wordlist: ['welkom', 'zomer', 'winter', 'voetbal', 'liefde', 'wachtwoord', 'zomer2024'],
      },
      questions: [
        { q: 'Welk wachtwoord hoort bij de hash in dit lab?', answer: ['zomer2024'], hint: 'Neem het basiswoord "zomer" en plak er met de jaartal-regel een jaar achter.', explain: 'zomer2024 ontstaat uit het basiswoord "zomer" plus de year-regel (1990-2026).' },
        { q: 'De digits-regel plakt welke reeks achter een woord?', options: ['0 tot en met 99', '1990 tot en met 2026', 'alleen het getal 1', 'een willekeurig getal'], answer: 0, explain: 'De digits-regel maakt woord+0 t/m woord+99; de year-regel doet woord+1990 t/m woord+2026.' },
        { q: 'Hoe heet het omzetten van letters naar lijkende tekens, zoals "e" naar "3" en "a" naar "4"?', answer: ['l33t', 'l33t-speak', 'leet', 'leetspeak', 'leet-speak'], hint: 'Spreek uit als "leet"; schrijf het zelf ook vaak met cijfers.', explain: 'l33t-speak vervangt letters door lijkende cijfers/tekens; een veelgebruikte mangling-regel.' },
        { q: 'Wat is de vlag die je hier verdient?', answer: ['JVT{regels_maken_varianten}'], hint: 'Staat in het inklapbare blok onderaan.', explain: 'JVT{regels_maken_varianten} — regels maken uit één basiswoord vele realistische kandidaten.' },
      ],
    },

    {
      title: 'Taak 5 — Brute force met maskers',
      content: `
        <p>Soms zit een wachtwoord in geen enkele lijst en is het ook geen variant van een woord: het is gewoon een
        kort, willekeurig rijtje tekens zoals <code>q7m</code>. Dan rest de botte bijl: <strong>brute force</strong>,
        oftewel écht alle combinaties proberen. Om dat gericht te doen gebruik je een <strong>masker</strong> (mask).</p>

        <h3>Wat is een masker?</h3>
        <p>Een masker beschrijft de <em>vorm</em> van het wachtwoord met tekenklassen, zodat je niet nodeloos combinaties
        probeert. In hashcat-notatie:</p>
        <table>
          <thead><tr><th>Symbool</th><th>Tekenklasse</th><th>Aantal</th></tr></thead>
          <tbody>
            <tr><td><code>?l</code></td><td>kleine letters a-z</td><td>26</td></tr>
            <tr><td><code>?u</code></td><td>hoofdletters A-Z</td><td>26</td></tr>
            <tr><td><code>?d</code></td><td>cijfers 0-9</td><td>10</td></tr>
            <tr><td><code>?s</code></td><td>leestekens</td><td>ca. 33</td></tr>
            <tr><td><code>?a</code></td><td>alles (letters+cijfers+leestekens)</td><td>ca. 95</td></tr>
          </tbody>
        </table>
        <p>Het masker <code>?l?d?l</code> betekent dus: kleine letter, cijfer, kleine letter. Dat zijn 26 × 10 × 26 =
        <strong>6.760</strong> mogelijkheden — voor een computer niets. Precies zo'n wachtwoord zit in het lab.</p>

        <h3>Zoekruimte: waarom +1 teken alles verandert</h3>
        <p>De zoekruimte groeit <strong>exponentieel</strong> met de lengte. Reken mee met alleen kleine letters (26 per
        positie):</p>
        <ul>
          <li>3 tekens: 26³ = 17.576</li>
          <li>4 tekens: 26⁴ = 456.976</li>
          <li>5 tekens: 26⁵ = 11.881.376</li>
          <li>6 tekens: 26⁶ = 308.915.776</li>
        </ul>
        <p>Elk extra teken vermenigvuldigt het totaal met 26. Gebruik je álle 95 tekens (<code>?a</code>), dan is dat
        zelfs maal 95 per positie. Daarom is een kort wachtwoord met brute force zo gekraakt, maar wordt het bij
        voldoende lengte <em>onhaalbaar</em>: bij 12+ willekeurige tekens duurt het langer dan het bestaan van het
        heelal, zelfs op snelle hardware. Lengte is je beste verdediging — de kern van taak 7.</p>

        <h3>Aan de slag</h3>
        <p>In het lab staat een MD5-hash van een kort wachtwoord van 3 tekens: een kleine letter, een cijfer en een
        kleine letter. Dat woord staat <em>niet</em> als los woord in een normale woordenlijst. Denk in het masker
        <code>?l?d?l</code> en loop die kleine zoekruimte af (of voeg je gok toe). Welk wachtwoord is het?</p>

        <div class="callout tip"><strong>Tip:</strong> omdat de zoekruimte hier maar 6.760 kandidaten is, is dit in een
        oogwenk gekraakt. Stel je voor dat elke positie uit 95 tekens kon bestaan en het wachtwoord 12 lang was — dan
        was geen enkele mask-aanval meer haalbaar.</div>

        <details><summary>Toon de vlag (pas openen nadat je het wachtwoord hebt gekraakt)</summary>
          <p>Je verdiende vlag: <code>JVT{masker_vindt_het_korte}</code>. Maskers maken brute force gericht — maar ze
          verliezen het altijd van voldoende lengte.</p>
        </details>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        hash: '0c355ce06793ac2b0eca93ab800cf582',
        salt: '',
        wordlist: ['welkom', 'zomer2024', 'voetbal', 'liefde', 'admin', 'q7m'],
      },
      questions: [
        { q: 'Welk kort wachtwoord (3 tekens) hoort bij de hash?', answer: ['q7m'], hint: 'Masker ?l?d?l: kleine letter, cijfer, kleine letter.', explain: 'q7m past op het masker ?l?d?l en geeft exact deze MD5-hash.' },
        { q: 'Hoeveel kandidaten telt het masker ?l?d?l (a-z, 0-9, a-z)?', answer: ['6760', '6.760'], hint: 'Vermenigvuldig 26 × 10 × 26.', explain: '26 × 10 × 26 = 6.760 mogelijkheden — triviaal voor een computer.' },
        { q: 'Wat gebeurt er met de zoekruimte als je één teken aan een wachtwoord toevoegt?', options: ['Die wordt vermenigvuldigd met het aantal mogelijke tekens (exponentiële groei)', 'Die wordt verdubbeld', 'Die blijft gelijk', 'Die wordt met één opgeteld'], answer: 0, explain: 'Elk extra teken vermenigvuldigt het totaal met de grootte van de tekenklasse; vandaar de explosieve groei.' },
        { q: 'Wat is de vlag die je hier verdient?', answer: ['JVT{masker_vindt_het_korte}'], hint: 'Staat in het inklapbare blok onderaan.', explain: 'JVT{masker_vindt_het_korte} — maskers kraken korte wachtwoorden, maar verliezen van lengte.' },
      ],
    },

    {
      title: 'Taak 6 — Salt, NTLM en trage hashes',
      content: `
        <p>Tot nu toe kraakten we kale, ongesalte hashes. In de praktijk kom je drie dingen tegen die het kraken
        beïnvloeden: <strong>salt</strong>, het Windows-formaat <strong>NTLM</strong>, en <strong>trage hashes</strong>.</p>

        <h3>Salt verslaat rainbow tables</h3>
        <p>Een <strong>salt</strong> is een willekeurige, per-gebruiker-unieke waarde die vóór het hashen aan het
        wachtwoord wordt geplakt: opgeslagen wordt <code>hash(salt + wachtwoord)</code>, samen met het salt. Gevolg:
        twee gebruikers met hetzelfde wachtwoord krijgen tóch verschillende hashes. Dat maakt een
        <strong>rainbow table</strong> — een gigantische vooraf berekende tabel van hash→wachtwoord — nutteloos, want
        die tabel is berekend zonder jouw salt. De aanvaller moet per hash opnieuw beginnen met gokken. Salt maakt
        kraken dus niet onmogelijk, maar wel véél duurder, en het blokkeert hergebruik van voorberekende tabellen.</p>

        <div class="callout info"><strong>Peper (pepper):</strong> een extra geheim dat (anders dan salt) níét bij de
        hash wordt opgeslagen maar apart, bijvoorbeeld in een HSM of app-config. Lekt alleen de database, dan mist de
        aanvaller de peper en kan hij zelfs met het juiste wachtwoord de hash niet reproduceren.</div>

        <h3>NTLM: Windows-wachtwoorden</h3>
        <p>Windows slaat lokale en domein-wachtwoorden op als <strong>NTLM</strong>-hashes (te vinden in de SAM of in
        <em>ntds.dit</em> op een domaincontroller). NTLM is een <em>snelle</em>, <em>ongesalte</em> hash — slecht nieuws
        voor de verdediging: twee accounts met hetzelfde wachtwoord hebben dezelfde NTLM-hash, en er is geen salt die
        rainbow tables tegenhoudt. Voor een pentester betekent dit: buitgemaakte NTLM-hashes kraak je vaak net zo vlot
        als MD5. Let op: NTLM is 32 hex-tekens, net als MD5 — je kunt ze niet aan de lengte onderscheiden, dus je moet
        weten waar de hash vandaan komt.</p>
        <p>In het lab staat een echte NTLM-hash van een realistisch Windows-wachtwoord. Zet in de tool het algoritme op
        <strong>ntlm</strong> en draai de woordenlijst. Welk wachtwoord is het?</p>

        <h3>Trage hashes: de echte verdediging</h3>
        <p>Goede systemen slaan wachtwoorden niet op met MD5 of NTLM, maar met een <strong>trage hash</strong> die
        bewust rekenkracht kost: <strong>bcrypt</strong>, <strong>scrypt</strong> of <strong>Argon2</strong>. Je stelt
        een <em>werkfactor</em> (cost) in; hoger = trager. Eén login van een echte gebruiker merkt die vertraging
        nauwelijks, maar een aanvaller die miljarden keren wil gokken, loopt vast. Herken je ze:</p>
        <ul>
          <li><strong>bcrypt</strong>: <code>$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9PgBkqquzi.Ss7KIUgO2t0jWMUW</code> — begint met <code>$2b$</code> en de werkfactor <code>12</code>.</li>
          <li><strong>sha512crypt</strong>: <code>$6$rqi.N7mO$l12...</code> — begint met <code>$6$</code> (op veel Linux-systemen in <code>/etc/shadow</code>).</li>
          <li><strong>Argon2</strong>: <code>$argon2id$v=19$m=65536,t=3,p=4$...</code> — de huidige aanrader.</li>
        </ul>
        <p>Plak zulke strings gerust in de hashid-tool uit taak 2 om het dollarteken-prefix te leren herkennen. Zie je
        <code>$2b$</code> of <code>$6$</code>, dan weet je: dit wordt een lange zit, en een kale woordenlijst op MD5-tempo
        gaat hier niet werken.</p>

        <details><summary>Toon de vlag (pas openen nadat je de NTLM-hash hebt gekraakt)</summary>
          <p>Je verdiende vlag: <code>JVT{ntlm_valt_net_zo_hard}</code>. Een zwak wachtwoord blijft zwak, of het nu als
          MD5 of als NTLM is opgeslagen — alleen een trage, gesalte hash plus een sterk wachtwoord houdt stand.</p>
        </details>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'ntlm',
        hash: '7d15f3b02e19d20498964e420b92b99a',
        salt: '',
        wordlist: ['welkom', 'Zomer2024', 'Wachtwoord1', 'admin', 'Welkom2025', 'computer'],
      },
      questions: [
        { q: 'Zet het algoritme op ntlm en kraak de hash. Welk wachtwoord is het?', answer: ['Wachtwoord1', 'wachtwoord1'], hint: 'Een klassiek Windows-wachtwoord: een woord met hoofdletter en een cijfer erachter.', explain: 'Wachtwoord1 is de NTLM-hash in dit lab; een typisch (zwak) Windows-wachtwoord.' },
        { q: 'Waarom maakt een salt rainbow tables nutteloos?', options: ['Omdat gelijke wachtwoorden tóch verschillende hashes krijgen, buiten de voorberekende tabel om', 'Omdat het wachtwoord erdoor langer wordt', 'Omdat de hash erdoor geheim wordt', 'Omdat salt het algoritme verandert'], answer: 0, explain: 'Door het unieke salt klopt geen enkele voorberekende tabel meer; de aanvaller moet per hash opnieuw gokken.' },
        { q: 'Een hash begint met "$6$". Welk type is dit?', options: ['sha512crypt (trage hash)', 'MD5', 'NTLM', 'SHA-1'], answer: 0, explain: 'Het prefix $6$ staat voor sha512crypt, een trage hash die je vaak in /etc/shadow ziet.' },
        { q: 'Wat is de vlag die je hier verdient?', answer: ['JVT{ntlm_valt_net_zo_hard}'], hint: 'Staat in het inklapbare blok onderaan.', explain: 'JVT{ntlm_valt_net_zo_hard} — NTLM is snel en ongesalt, dus zwakke wachtwoorden vallen net zo makkelijk.' },
      ],
    },

    {
      title: 'Taak 7 — Verdedigen: kraken onhaalbaar maken',
      content: `
        <p>Je weet nu hoe kraken werkt — en dat is precies waarom je het ook kunt tegenhouden. Een aanvaller wint op
        <em>snelheid</em> en <em>voorspelbaarheid</em>. Verdedigen betekent: beide wegnemen. Hier is het complete
        recept, van gebruiker tot systeem.</p>

        <h3>Voor de gebruiker: lengte en onvoorspelbaarheid</h3>
        <ul>
          <li><strong>Lengte verslaat alles.</strong> Zoals je in taak 5 zag, groeit de zoekruimte exponentieel met de
          lengte. Een lang wachtwoord is immuun voor brute force, ongeacht de hardware.</li>
          <li><strong>Gebruik wachtwoordzinnen</strong> (passphrases): vier of meer willekeurige woorden, zoals
          <code>kaas-fiets-donder-maandag</code>. Lang, te onthouden, en onvoorspelbaar genoeg om woordenlijsten en
          regels te verslaan — mits de woorden écht willekeurig gekozen zijn.</li>
          <li><strong>Vermijd het voorspelbare:</strong> namen, geboortedata, <code>Welkom2025!</code>,
          toetsenbordrijtjes. Precies dát pakken woordenlijst + regels als eerste.</li>
          <li><strong>Uniek per account</strong> en bewaard in een <strong>wachtwoordmanager</strong>, zodat één lek niet
          al je accounts meesleept.</li>
        </ul>

        <h3>Voor het systeem: traag, gesalt, gepeperd</h3>
        <ul>
          <li><strong>Trage hash met hoge werkfactor:</strong> bewaar wachtwoorden met <strong>bcrypt</strong>,
          <strong>scrypt</strong> of (aanrader) <strong>Argon2</strong>. Zo kost elke gok de aanvaller rekentijd en wordt
          massaal kraken onbetaalbaar.</li>
          <li><strong>Altijd een unieke salt per gebruiker</strong> — verslaat rainbow tables en verbergt dat twee mensen
          hetzelfde wachtwoord hebben.</li>
          <li><strong>Eventueel een peper</strong> (apart geheim, niet in de database) voor een extra laag als de database
          lekt.</li>
          <li><strong>Rate limiting en account-lockout</strong> tegen online gokken.</li>
        </ul>

        <h3>De vangnetten</h3>
        <ul>
          <li><strong>MFA</strong> (multifactor-authenticatie): zelfs een gekraakt wachtwoord is dan niet genoeg. De
          belangrijkste maatregel na lengte.</li>
          <li><strong>Lekcontrole:</strong> controleer wachtwoorden tegen bekende datalekken. Op
          <strong>Have I Been Pwned</strong> check je of jouw gegevens in een lek zitten; veel diensten blokkeren
          proactief wachtwoorden die al ooit gelekt zijn.</li>
        </ul>

        <div class="callout tip"><strong>Probeer het in het lab:</strong> typ eerst een kort, voorspelbaar wachtwoord en
        bekijk de geschatte kraaktijd. Maak het daarna fors langer met een paar extra woorden en zie de schatting
        omslaan van "seconden" naar "onhaalbaar". Zo voel je taak 5 terug in de praktijk.</div>

        <h3>Afsluiting</h3>
        <p>Je kunt nu hashes herkennen en kraken met woordenlijsten, regels en maskers — en je begrijpt waarom salt,
        trage hashes en lengte dat tegenhouden. Belangrijker nog: je weet waar de grens ligt. Deze kennis is krachtig,
        en krachtig gereedschap gebruik je verantwoord: alleen op je eigen hashes, op oefenhashes, of binnen een
        getekende opdracht. Zo zet je kraken in waar het hoort — om systemen sterker te maken, niet om in te breken.</p>

        <div class="callout info"><strong>Verder oefenen?</strong> Doe legale CTF's en wargames (bijvoorbeeld
        OverTheWire, HackTheBox) en lees de documentatie van hashcat en John the Ripper. Blijf op de hoogte via het
        <strong>NCSC</strong>.</div>
      `,
      lab: { type: 'password' },
      questions: [
        { q: 'Welke eigenschap van een wachtwoord verslaat brute force het sterkst?', options: ['De lengte flink vergroten', 'Eén hoofdletter toevoegen', 'Een cijfer aan het eind plakken', 'Het maandelijks wijzigen'], answer: 0, explain: 'De zoekruimte groeit exponentieel met de lengte; een lange (wachtwoord)zin is daardoor onhaalbaar te brute-forcen.' },
        { q: 'Met welke opslagmethode maakt een systeem kraken het moeilijkst?', options: ['Een trage, gesalte hash (bcrypt/Argon2) met hoge werkfactor', 'MD5', 'NTLM', 'Platte tekst met een back-up'], answer: 0, explain: 'Een trage, gesalte hash remt elke gok af en verslaat rainbow tables; Argon2 is de huidige aanrader.' },
        { q: 'Welke maatregel zorgt dat zelfs een gekraakt wachtwoord niet genoeg is om in te loggen?', answer: ['mfa', 'multifactor-authenticatie', '2fa', 'multifactor', 'tweefactor'], hint: 'Een tweede factor naast het wachtwoord.', explain: 'MFA voegt een tweede factor toe, zodat een gestolen of gekraakt wachtwoord alleen niet volstaat.' },
        { q: 'Ik kan uitleggen hoe kraken werkt én hoe je het met lengte, trage gesalte hashes, MFA en lekcontrole tegenhoudt.', noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: 'Hash', def: 'Vaste, korte uitvoer van een eenrichtings-hashfunctie; verandert volledig bij één gewijzigd teken.' },
    { term: 'Woordenlijstaanval (dictionary)', def: 'Kraken door een lijst van waarschijnlijke wachtwoorden af te gaan: elk woord hashen en vergelijken.' },
    { term: 'Wordlist', def: 'Lijst met kandidaat-wachtwoorden, zoals rockyou.txt, gebruikt bij een woordenlijstaanval.' },
    { term: 'Regel (rule/mangling)', def: 'Kleine transformatie op een woord (hoofdletter, cijfers, jaartal, l33t) om realistische varianten te maken.' },
    { term: 'l33t-speak', def: 'Letters vervangen door lijkende tekens (a→4, e→3, o→0, s→5); een veelgebruikte mangling-regel.' },
    { term: 'Brute force', def: 'Systematisch alle mogelijke combinaties proberen; alleen haalbaar bij korte wachtwoorden.' },
    { term: 'Masker (mask)', def: 'Beschrijving van de vorm van een wachtwoord met tekenklassen (?l ?u ?d ?s ?a) om brute force gericht te maken.' },
    { term: 'Zoekruimte', def: 'Het totale aantal mogelijke wachtwoorden; groeit exponentieel met de lengte.' },
    { term: 'Salt', def: 'Unieke, per-gebruiker willekeurige waarde die vóór het hashen wordt toegevoegd; verslaat rainbow tables.' },
    { term: 'Peper (pepper)', def: 'Extra geheim dat apart van de database wordt bewaard, als extra laag bovenop salt.' },
    { term: 'Rainbow table', def: 'Vooraf berekende tabel van hash naar wachtwoord; nutteloos tegen gesalte hashes.' },
    { term: 'Trage hash', def: 'Wachtwoord-hash die bewust rekenkracht kost (bcrypt, scrypt, Argon2) om massaal gokken onbetaalbaar te maken.' },
    { term: 'NTLM', def: 'Snelle, ongesalte Windows-wachtwoordhash (SAM/ntds.dit); 32 hex-tekens, net als MD5.' },
    { term: 'Werkfactor (cost)', def: 'Instelbare traagheid van een trage hash; hoger betekent meer rekentijd per gok.' },
  ],
  resources: [
    { title: 'hashcat — de snelste wachtwoord-kraker (documentatie)', url: 'https://hashcat.net/hashcat/' },
    { title: 'John the Ripper (Openwall)', url: 'https://www.openwall.com/john/' },
    { title: 'Have I Been Pwned — check je gegevens op datalekken', url: 'https://haveibeenpwned.com/' },
    { title: 'NCSC — Nationaal Cyber Security Centrum', url: 'https://www.ncsc.nl/' },
  ],
});
