/* Room: Wachtwoorden en authenticatie */
CS.registerRoom({
  id: 'wachtwoorden-authenticatie',
  path: 'security-kern',
  order: 2,
  title: 'Wachtwoorden en authenticatie',
  icon: '🔑',
  difficulty: 'Makkelijk',
  minutes: 55,
  summary: 'Van identificatie, authenticatie en autorisatie tot sterke wachtwoordzinnen, wachtwoordmanagers, MFA en passkeys.',
  objectives: [
    'Het verschil uitleggen tussen identificatie, authenticatie en autorisatie',
    'De drie authenticatiefactoren benoemen en voorbeelden geven',
    'Beschrijven wat een wachtwoord sterk maakt en waarom een wachtwoordmanager helpt',
    'Herkennen hoe aanvallers wachtwoorden kraken (brute force, woordenlijst, credential stuffing, spraying)',
    'Uitleggen waarom multifactor-authenticatie en passkeys de beveiliging sterk verbeteren',
  ],
  tasks: [
    {
      title: 'Taak 1 — Identificatie, authenticatie en autorisatie',
      content: `
        <p>Drie woorden die op elkaar lijken maar echt iets anders betekenen. Als je ze uit elkaar houdt, snap je
        meteen hoe inloggen en toegang overal werken — van je laptop tot een bedrijfsnetwerk.</p>

        <h3>De analogie van het vliegveld</h3>
        <ul>
          <li><strong>Identificatie</strong> — je zegt wie je bent. Je laat je paspoort zien en claimt een identiteit.
          In IT is dit je gebruikersnaam of e-mailadres. Een claim, meer niet.</li>
          <li><strong>Authenticatie</strong> — je <em>bewijst</em> dat je het echt bent. De douanier controleert of de
          foto en de gegevens kloppen. In IT doe je dit met een wachtwoord, een code of je vingerafdruk.</li>
          <li><strong>Autorisatie</strong> — nadat je bewezen bent wie je bent, wordt bepaald wat je <em>mag</em>.
          Met je ticket mag je het vliegtuig in, maar niet de cockpit. In IT: je rol en rechten (lezen, schrijven,
          beheren).</li>
        </ul>
        <div class="callout info">
          <strong>Onthoud de volgorde:</strong> eerst zeg je wie je bent (identificatie), dan bewijs je het
          (authenticatie), en pas daarna wordt bepaald wat je mag (autorisatie). Zonder bewezen identiteit kun je
          niets autoriseren.
        </div>

        <h3>AAA</h3>
        <p>In netwerk- en systeembeheer kom je vaak de afkorting <strong>AAA</strong> tegen: Authentication,
        Authorization en <strong>Accounting</strong>. Dat laatste, <em>accounting</em> (ook wel <em>auditing</em>),
        is het vastleggen van wat er gebeurt: wie logde wanneer in, wie wijzigde wat. Die logs zijn goud waard als er
        iets misgaat en je wilt uitzoeken wat er gebeurde.</p>

        <h3>Waarom dit onderscheid telt</h3>
        <p>Veel beveiligingsfouten zitten in de verwarring tussen deze drie. Een systeem dat iedereen die is
        ingelogd meteen álles laat doen, verwart authenticatie met autorisatie. Het principe
        <strong>least privilege</strong> (zo min mogelijk rechten) zegt: geef een gebruiker of proces alleen de
        rechten die strikt nodig zijn. Een goede authenticatie zonder nette autorisatie is als een streng gecontroleerde
        voordeur in een gebouw waar daarna alle binnendeuren openstaan.</p>
      `,
      questions: [
        { q: 'Je typt je gebruikersnaam in. Welke stap is dat?', options: ['Identificatie', 'Authenticatie', 'Autorisatie'], answer: 0, explain: 'Je claimt een identiteit; je hebt nog niets bewezen.' },
        { q: 'Je typt daarna je wachtwoord en het klopt. Welke stap is dat?', options: ['Identificatie', 'Authenticatie', 'Autorisatie'], answer: 1, explain: 'Je bewijst met iets wat je weet dat je echt die gebruiker bent.' },
        { q: 'Waar staat de derde A in AAA voor, naast Authentication en Authorization?', answer: ['Accounting', 'accounting'], hint: 'Het gaat over het vastleggen/loggen van wat er gebeurt.', explain: 'Accounting (of auditing) legt vast wie wat wanneer deed — onmisbaar bij onderzoek.' },
        { q: 'Hoe heet het principe "geef alleen de rechten die strikt nodig zijn"?', answer: ['least privilege'], hint: 'In het Engels: least ...', explain: 'Least privilege beperkt de schade als een account wordt misbruikt.' },
      ],
    },

    {
      title: 'Taak 2 — De drie authenticatiefactoren',
      content: `
        <p>Authenticeren kan op drie fundamenteel verschillende manieren. We noemen ze de drie
        <strong>factoren</strong>. Ken je ze, dan begrijp je ook meteen waarom het combineren ervan zo krachtig is.</p>

        <table>
          <thead><tr><th>Factor</th><th>Betekenis</th><th>Voorbeelden</th></tr></thead>
          <tbody>
            <tr><td><strong>Iets wat je weet</strong></td><td>Kennis</td><td>Wachtwoord, pincode, wachtwoordzin</td></tr>
            <tr><td><strong>Iets wat je hebt</strong></td><td>Bezit</td><td>Telefoon met authenticator-app, hardwaresleutel, bankpas</td></tr>
            <tr><td><strong>Iets wat je bent</strong></td><td>Eigenschap (biometrie)</td><td>Vingerafdruk, gezichtsscan, iris</td></tr>
          </tbody>
        </table>

        <h3>Sterktes en zwaktes</h3>
        <ul>
          <li><strong>Iets wat je weet</strong> is goedkoop en flexibel, maar te raden, af te kijken, te phishen en
          te hergebruiken. Het zwakste van de drie als het alleen staat.</li>
          <li><strong>Iets wat je hebt</strong> moet een aanvaller fysiek bezitten of overnemen. Veel sterker, al kan
          een telefoon gestolen of (bij SMS) omgeleid worden.</li>
          <li><strong>Iets wat je bent</strong> is handig en moeilijk te vergeten, maar je kunt je vingerafdruk niet
          veranderen als die ooit lekt. Biometrie werkt het best als lokale ontgrendeling, niet als los wachtwoord
          dat over het netwerk gaat.</li>
        </ul>

        <div class="callout tip">
          <strong>Tip:</strong> het gaat om <em>verschillende</em> factoren. Twee wachtwoorden achter elkaar zijn
          nog steeds één factor ("iets wat je weet") en dus geen echte multifactor. Een wachtwoord plus een code uit
          een app zijn twee factoren: kennis én bezit.
        </div>

        <h3>Context als extra signaal</h3>
        <p>Moderne systemen kijken ook naar <em>context</em>: vanaf welk apparaat, welke locatie, welk tijdstip log
        je in? Dat heet <strong>risicogebaseerde</strong> of adaptieve authenticatie. Log je plots vanuit een ander
        land in op een onbekend apparaat, dan vraagt het systeem om een extra bewijs. Context is geen volwaardige
        vierde factor, maar wel een slim hulpmiddel.</p>
      `,
      questions: [
        { q: 'Een code uit een authenticator-app op je telefoon valt onder welke factor?', options: ['Iets wat je weet', 'Iets wat je hebt', 'Iets wat je bent'], answer: 1, explain: 'De app zit op een apparaat dat je bezit: "iets wat je hebt".' },
        { q: 'Je logt in met een wachtwoord en daarna een pincode. Is dat echte multifactor-authenticatie?', options: ['Nee, het zijn twee keer "iets wat je weet"', 'Ja, want het zijn twee stappen', 'Ja, de pincode telt als bezit'], answer: 0, explain: 'Beide zijn kennis; echte MFA combineert verschillende factoren.' },
        { q: 'Welke factor is het lastigst te veranderen als hij ooit lekt?', options: ['Iets wat je bent (biometrie)', 'Iets wat je weet', 'Iets wat je hebt'], answer: 0, explain: 'Je kunt een wachtwoord of token vervangen, maar je vingerafdruk niet.' },
        { q: 'Hoe heet authenticatie die ook naar locatie, apparaat en tijdstip kijkt?', answer: ['risicogebaseerd', 'risicogebaseerde authenticatie', 'adaptief', 'adaptieve authenticatie'], hint: 'Het past de eisen aan op basis van het risico van de situatie.', explain: 'Risicogebaseerde (adaptieve) authenticatie vraagt extra bewijs bij verdachte context.' },
      ],
    },

    {
      title: 'Taak 3 — Sterke wachtwoorden en wachtwoordmanagers',
      content: `
        <p>Wachtwoorden verdwijnen voorlopig niet, dus laten we ze goed doen. Het oude advies ("minstens 8 tekens,
        een hoofdletter, een cijfer en een vreemd teken, en elke maand wijzigen") is achterhaald. Het leverde vooral
        wachtwoorden op die moeilijk te onthouden zijn voor mensen, maar makkelijk te raden voor computers
        (<code>Welkom01!</code>, iemand?).</p>

        <h3>Lengte verslaat complexiteit</h3>
        <p>Het aantal mogelijke wachtwoorden groeit explosief met de <strong>lengte</strong>, veel sneller dan met
        het toevoegen van vreemde tekens. Daarom raadt onder andere het NCSC <strong>wachtwoordzinnen</strong>
        (passphrases) aan: een reeks willekeurige woorden zoals <code>paarse-kraan-fietst-maandag</code>. Lang,
        goed te onthouden, en voor een computer enorm veel werk om te raden. Vermijd voorspelbare dingen: namen,
        geboortedata, <code>123456</code>, de bedrijfsnaam en toetsenbordrijtjes als <code>qwerty</code>.</p>

        <h3>Uniek per account</h3>
        <p>De belangrijkste regel: <strong>gebruik overal een ander wachtwoord</strong>. Waarom? Als één dienst
        gehackt wordt en jouw wachtwoord uitlekt, proberen aanvallers datzelfde wachtwoord automatisch bij tientallen
        andere diensten (dat heet <em>credential stuffing</em>, meer daarover in de volgende taak). Eén lek mag nooit
        al je accounts meesleuren.</p>

        <h3>De wachtwoordmanager</h3>
        <p>Niemand kan tientallen lange, unieke wachtwoorden onthouden — en dat hoeft ook niet. Een
        <strong>wachtwoordmanager</strong> genereert en bewaart ze versleuteld. Jij onthoudt nog maar één sterk
        <em>hoofdwachtwoord</em> (beveilig dat met MFA). Voordelen:</p>
        <ul>
          <li>Elk account krijgt automatisch een lang, willekeurig, uniek wachtwoord.</li>
          <li>Hij vult alleen in op het juiste domein — dat beschermt je tegen phishingsites met een lijkend adres.</li>
          <li>Veel managers waarschuwen als een wachtwoord in een bekend datalek voorkomt.</li>
        </ul>

        <p>Open het lab en voel het verschil. Typ eerst een kort, voor de hand liggend wachtwoord en bekijk de
        geschatte kraaktijd. Maak het daarna fors langer met een paar extra woorden en kijk hoe de schatting
        verandert.</p>
      `,
      lab: { type: 'password' },
      questions: [
        { q: 'Wat verhoogt de weerstand van een wachtwoord het sterkst?', options: ['De lengte flink vergroten', 'Eén hoofdletter toevoegen', 'Een cijfer aan het eind plakken'], answer: 0, explain: 'De mogelijkheden groeien exponentieel met de lengte; een lange wachtwoordzin wint.' },
        { q: 'Wat is de belangrijkste reden om overal een ander wachtwoord te gebruiken?', options: ['Eén lek sleept dan niet al je andere accounts mee', 'Het staat netter', 'Het is sneller intypen'], answer: 0, explain: 'Hergebruik maakt credential stuffing mogelijk: één lek opent vele deuren.' },
        { q: 'Welk type wachtwoord raadt het NCSC aan omdat het lang én te onthouden is?', answer: ['wachtwoordzin', 'wachtwoordzinnen', 'passphrase', 'wachtwoordzin (passphrase)'], hint: 'Een reeks van meerdere woorden.', explain: 'Een wachtwoordzin (passphrase) combineert lengte met onthoudbaarheid.' },
        { q: 'Noem een voordeel van een wachtwoordmanager naast het bewaren van wachtwoorden.', options: ['Hij vult alleen in op het juiste domein en beschermt zo tegen phishing', 'Hij maakt je wachtwoorden korter', 'Hij deelt je wachtwoorden met andere sites'], answer: 0, explain: 'Omdat hij op domein controleert, trapt hij niet in een lijkend phishingadres.' },
      ],
    },

    {
      title: 'Taak 4 — Hoe wachtwoorden worden gekraakt',
      content: `
        <p>Om je wachtwoorden goed te beschermen, moet je weten hoe ze vallen. Vrijwel nooit "raadt" iemand jouw
        wachtwoord door het in te typen op het inlogscherm — daar zit meestal een limiet op pogingen op. Het echte
        werk gebeurt <em>offline</em>, nadat een aanvaller een database met gehashte wachtwoorden heeft buitgemaakt.</p>

        <h3>De belangrijkste aanvallen</h3>
        <ul>
          <li><strong>Brute force:</strong> systematisch alle combinaties proberen. Werkt alleen tegen korte
          wachtwoorden; bij voldoende lengte duurt het onhaalbaar lang.</li>
          <li><strong>Woordenlijstaanval (dictionary):</strong> een lijst van waarschijnlijke wachtwoorden afgaan —
          lekken uit het verleden, veelgebruikte woorden, namen. Veel sneller dan pure brute force omdat mensen
          voorspelbaar zijn.</li>
          <li><strong>Credential stuffing:</strong> gelekte combinaties van e-mail + wachtwoord uit de ene dienst
          automatisch uitproberen op tientallen andere. Pakt iedereen die wachtwoorden hergebruikt.</li>
          <li><strong>Password spraying:</strong> andersom — één veelvoorkomend wachtwoord (zoals
          <code>Welkom2025</code>) proberen op heel veel accounts. Zo ontwijk je de blokkade na een paar foute
          pogingen per account.</li>
          <li><strong>Phishing:</strong> het wachtwoord gewoon aan je vragen via een neppe inlogpagina. Technisch
          de minste moeite, vaak het meest succesvol.</li>
        </ul>

        <div class="callout info">
          <strong>Have I Been Pwned:</strong> op de dienst haveibeenpwned.com check je of jouw e-mailadres in een
          bekend datalek voorkomt. Zo ja: wijzig dat wachtwoord overal waar je het (her)gebruikte.
        </div>

        <h3>Verdediging</h3>
        <p>Aan de kant van de dienst helpen: wachtwoorden <strong>gesalt en langzaam gehasht</strong> opslaan (zie de
        cryptografie-room), <strong>rate limiting</strong> en account-lockout tegen online gokken, controle tegen
        bekende gelekte wachtwoorden, en vooral <strong>MFA</strong> (volgende taak). Aan jouw kant: lange, unieke
        wachtwoorden uit een manager.</p>

        <p>In het lab bootsen we een woordenlijstaanval na op een MD5-hash. Start de aanval en laat de tool de lijst
        aflopen. Welk wachtwoord hoort bij de hash?</p>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'md5',
        hash: '2a4652cb030cfef3627fe1624e77ac16',
        salt: '',
        wordlist: ['123456', 'welkom', 'wachtwoord', 'qwerty', 'zomer2024', 'admin', 'liefde', 'voetbal'],
      },
      questions: [
        { q: 'Start de woordenlijstaanval in het lab. Welk wachtwoord hoort bij de hash?', answer: ['zomer2024'], hint: 'Laat de tool de hele lijst afgaan; één woord geeft precies dezelfde MD5.', explain: 'MD5 is snel, dus zo\'n lijst is in een oogwenk doorlopen — reden te meer voor langzame, gesalte hashes.' },
        { q: 'Een aanvaller probeert één populair wachtwoord op heel veel accounts. Hoe heet dat?', options: ['Password spraying', 'Brute force', 'Credential stuffing'], answer: 0, explain: 'Spraying mijdt de lockout per account door juist breed en ondiep te proberen.' },
        { q: 'Gelekte e-mail/wachtwoord-combinaties automatisch op andere diensten uitproberen heet...', answer: ['credential stuffing'], hint: 'Het "volstoppen" van loginformulieren met gelekte credentials.', explain: 'Credential stuffing werkt juist omdat mensen wachtwoorden hergebruiken.' },
        { q: 'Welke verdediging stopt online gokken door na een paar foute pogingen te vertragen of blokkeren?', answer: ['rate limiting', 'account lockout', 'rate-limiting'], hint: 'Je beperkt het aantal pogingen per tijdseenheid.', explain: 'Rate limiting en account-lockout maken online brute force onbruikbaar traag.' },
      ],
    },

    {
      title: 'Taak 5 — Multifactor-authenticatie en passkeys',
      content: `
        <p>Zelfs het beste wachtwoord kan uitlekken of worden gephisht. De oplossing is een tweede slot op de deur:
        <strong>multifactor-authenticatie</strong> (MFA, ook wel 2FA voor twee factoren). Je combineert twee
        verschillende factoren, zodat een gestolen wachtwoord alleen niet genoeg is.</p>

        <h3>Vormen van MFA, van zwak naar sterk</h3>
        <ul>
          <li><strong>SMS-code:</strong> beter dan niets, maar het zwakst. SMS is te onderscheppen en kwetsbaar voor
          <em>SIM-swapping</em> (een aanvaller laat jouw nummer naar zijn simkaart overzetten).</li>
          <li><strong>Authenticator-app (TOTP):</strong> je app genereert elke 30 seconden een code op basis van een
          gedeeld geheim en de tijd. Veel sterker dan SMS en gratis. Nadeel: je kunt een TOTP-code nog steeds op een
          phishingsite intypen.</li>
          <li><strong>Hardwaresleutel / passkey (FIDO2):</strong> de sterkste optie. Een fysieke sleutel of een in je
          apparaat ingebouwde beveiligingschip doet aan cryptografische uitdaging-antwoord en is gebonden aan het
          echte domein.</li>
        </ul>

        <h3>Passkeys: inloggen zonder wachtwoord</h3>
        <p>Een <strong>passkey</strong> (gebaseerd op de FIDO2/WebAuthn-standaard) vervangt het wachtwoord helemaal.
        Onder de motorkap is het gewoon asymmetrische cryptografie uit de vorige room: bij het aanmaken genereert je
        apparaat een <strong>sleutelpaar</strong>. De <em>publieke</em> sleutel gaat naar de dienst; de
        <em>private</em> sleutel verlaat je apparaat nooit en ontgrendel je lokaal met je vingerafdruk, gezicht of
        pincode. Inloggen gaat dan zo: de dienst stuurt een uitdaging, jouw apparaat ondertekent die met de private
        sleutel, de dienst controleert met de publieke sleutel.</p>
        <div class="callout tip">
          <strong>Waarom passkeys phishing-bestendig zijn:</strong> de passkey is vastgeklonken aan het echte domein
          en er wordt nooit een geheim verstuurd dat je per ongeluk op een nepsite kunt intypen. Een gekloonde
          inlogpagina krijgt simpelweg geen geldige handtekening los.
        </div>

        <h3>Nog even dit</h3>
        <p>Zet MFA in elk geval aan op je belangrijkste accounts: e-mail (want via "wachtwoord vergeten" opent dat
        vaak al je andere accounts), je wachtwoordmanager, bankieren en werkaccounts. En let op
        <strong>MFA-moeheid</strong>: aanvallers die je wachtwoord al hebben, sturen soms een stroom push-meldingen
        in de hoop dat je per ongeluk op "goedkeuren" tikt. Keur nooit een melding goed die je niet zelf hebt
        gestart.</p>
      `,
      questions: [
        { q: 'Welke MFA-vorm is het sterkst en phishing-bestendig?', options: ['Passkey / hardwaresleutel (FIDO2)', 'SMS-code', 'E-mailcode'], answer: 0, explain: 'FIDO2-passkeys zijn aan het domein gebonden en versturen geen geheim dat je kunt afstaan.' },
        { q: 'Waarom geldt SMS als de zwakste tweede factor?', options: ['Het is te onderscheppen en kwetsbaar voor SIM-swapping', 'Het is te duur', 'Codes zijn te lang'], answer: 0, explain: 'SIM-swapping en onderschepping ondermijnen SMS als factor.' },
        { q: 'Welke sleutel van een passkey verlaat je apparaat nooit?', options: ['De private sleutel', 'De publieke sleutel', 'Allebei'], answer: 0, explain: 'Alleen de publieke sleutel gaat naar de dienst; de private blijft lokaal.' },
        { q: 'Je krijgt onverwacht push-meldingen om een login goed te keuren terwijl je zelf niets doet. Wat doe je?', options: ['Afwijzen; iemand probeert via MFA-moeheid binnen te komen', 'Goedkeuren, dan houdt het op', 'Negeren en je wachtwoord laten staan'], answer: 0, explain: 'Keur nooit een melding goed die je niet zelf startte; wijzig daarna je wachtwoord.' },
        { q: 'Op welk account zet je MFA als eerste aan omdat het via "wachtwoord vergeten" veel andere accounts kan openen?', answer: ['e-mail', 'email', 'e-mailaccount', 'mail'], hint: 'Het is het account waar herstel-mails binnenkomen.', explain: 'Je e-mail is de hoofdsleutel tot herstel van veel andere accounts; beveilig die het best.' },
      ],
    },
  ],
  terms: [
    { term: 'Identificatie', def: 'Claimen wie je bent, bijvoorbeeld met een gebruikersnaam of e-mailadres; nog zonder bewijs.' },
    { term: 'Authenticatie', def: 'Bewijzen dat je echt bent wie je claimt, met een wachtwoord, code of biometrie.' },
    { term: 'Autorisatie', def: 'Bepalen wat een bewezen gebruiker mag doen: zijn rechten en rol.' },
    { term: 'AAA', def: 'Authentication, Authorization en Accounting: authenticeren, rechten toekennen en vastleggen wat er gebeurt.' },
    { term: 'Authenticatiefactor', def: 'Een soort bewijs: iets wat je weet, iets wat je hebt, of iets wat je bent.' },
    { term: 'Multifactor-authenticatie (MFA)', def: 'Twee of meer verschillende factoren combineren, zodat een gestolen wachtwoord alleen niet volstaat.' },
    { term: 'TOTP', def: 'Time-based One-Time Password: code die een authenticator-app elke 30 seconden genereert uit een gedeeld geheim en de tijd.' },
    { term: 'Passkey (FIDO2/WebAuthn)', def: 'Wachtwoordloze login met een sleutelpaar; de private sleutel blijft op je apparaat en is gebonden aan het echte domein.' },
    { term: 'Wachtwoordmanager', def: 'Programma dat lange, unieke wachtwoorden genereert en versleuteld bewaart achter één hoofdwachtwoord.' },
    { term: 'Wachtwoordzin (passphrase)', def: 'Een lang wachtwoord van meerdere woorden; goed te onthouden en lastig te kraken door de lengte.' },
    { term: 'Brute force', def: 'Systematisch alle mogelijke wachtwoorden proberen; alleen haalbaar tegen korte wachtwoorden.' },
    { term: 'Woordenlijstaanval', def: 'Een lijst van waarschijnlijke wachtwoorden afgaan in plaats van alle combinaties; sneller omdat mensen voorspelbaar zijn.' },
    { term: 'Credential stuffing', def: 'Gelekte e-mail/wachtwoord-combinaties automatisch op andere diensten uitproberen; werkt door hergebruik.' },
    { term: 'Password spraying', def: 'Eén veelvoorkomend wachtwoord op veel accounts proberen om lockout per account te ontwijken.' },
  ],
  resources: [
    { title: 'NCSC — Advies sterke wachtwoorden', url: 'https://www.ncsc.nl/onderwerpen/weerbaarheid/wachtwoorden' },
    { title: 'Have I Been Pwned — check je e-mail op datalekken', url: 'https://haveibeenpwned.com/' },
    { title: 'OWASP — Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' },
    { title: 'FIDO Alliance — uitleg over passkeys', url: 'https://fidoalliance.org/passkeys/' },
  ],
});
