/* Room: Veilig thuis en op het werk */
CS.registerRoom({
  id: 'veilig-thuis-werk',
  path: 'defensief',
  order: 3,
  title: 'Veilig thuis en op het werk',
  icon: '🏠',
  difficulty: 'Makkelijk',
  minutes: 45,
  summary: 'Praktische digitale weerbaarheid die je vandaag nog kunt toepassen: updaten, back-ups (3-2-1), MFA en een wachtwoordmanager, veilig wifi, USB en publieke netwerken, privacy, en wat te doen als het tóch misgaat.',
  objectives: [
    'Uitleggen waarom updaten en patchen je belangrijkste basismaatregel is',
    'De 3-2-1-regel voor back-ups toepassen en het belang van geteste back-ups uitleggen',
    'MFA en een wachtwoordmanager instellen als standaard voor al je accounts',
    'Je thuisnetwerk en gebruik onderweg veiliger maken (WPA3, gastnetwerk, publieke wifi en VPN)',
    'Veilig omgaan met USB-sticks, randapparatuur en de AVG-basis van privacy',
    'Weten wat je moet doen en bij wie je meldt als een account of apparaat gehackt is',
  ],
  tasks: [
    {
      title: "Taak 1 — Updaten en patchen",
      content: `
        <p>Als je maar één gewoonte overneemt uit deze room, laat het dan deze zijn: <strong>houd alles bij</strong>.
        Updaten (bijwerken) is saai, maar het is de meest effectieve en goedkoopste beveiligingsmaatregel die er
        bestaat.</p>

        <h3>Waarom updates zo belangrijk zijn</h3>
        <p>Software bevat fouten, en sommige fouten zijn beveiligingsgaten (<strong>kwetsbaarheden</strong>, Engels:
        <em>vulnerabilities</em>). Een <strong>patch</strong> is een reparatie die zo'n gat dicht. Zodra een patch
        uitkomt, is meteen openbaar <em>welk</em> gat hij dicht — en gaan aanvallers massaal op zoek naar systemen die
        nog niet zijn bijgewerkt. Een niet-geupdatet apparaat is als een huis waarvan iedereen weet dat het
        achterraam openstaat.</p>

        <div class="callout tip">
          <strong>Tip:</strong> zet <strong>automatische updates</strong> aan waar het kan — voor je telefoon, je
          computer, je browser en je apps. Dan gebeurt het vanzelf en vergeet je het niet. Herstart je apparaat ook
          echt als erom gevraagd wordt; veel updates worden pas na een herstart actief.
        </div>

        <h3>Vergeet deze niet</h3>
        <ul>
          <li><strong>Je router.</strong> Dat kastje van je internet staat dag en nacht aan het internet en wordt vaak
          vergeten. Controleer of hij automatisch updatet.</li>
          <li><strong>Slimme apparaten (IoT).</strong> Camera's, slimme lampen, een slimme deurbel: ook dat is software
          die bijgewerkt moet worden.</li>
          <li><strong>Oude software (end-of-life).</strong> Als een fabrikant stopt met updates (zoals bij een heel oud
          besturingssysteem), komen er geen patches meer. Zulke software blijft voorgoed lek; vervang of vervang hem.</li>
        </ul>

        <h3>De analogie van het lek in de band</h3>
        <p>Een kwetsbaarheid is een lek in je fietsband. Een patch is het plakkertje. Rij je door met een bekend lek,
        dan sta je vroeg of laat stil — en bij software staat er iemand klaar om je dan onderuit te halen.</p>
      `,
      questions: [
        { q: "Wat is een 'patch'?", options: ["Een reparatie die een beveiligingsgat (kwetsbaarheid) in software dicht", "Een nieuw wachtwoord", "Een soort virus", "Een back-up"], answer: 0, explain: "Een patch dicht een bekend gat. Daarom is snel installeren belangrijk." },
        { q: "Waarom is het riskant om een update uit te stellen?", options: ["Zodra een patch uitkomt is het gat openbaar en zoeken aanvallers naar wie nog niet bijwerkte", "Updates maken je apparaat langzamer", "Er verandert toch nooit iets", "Uitstellen is juist veiliger"], answer: 0, explain: "De bekendmaking van een patch is voor aanvallers het startschot om niet-bijgewerkte systemen te zoeken." },
        { q: "Wat betekent het als software 'end-of-life' is?", answer: ["geen updates meer", "er komen geen updates meer", "einde ondersteuning"], hint: "De fabrikant stopt met ondersteunen; er komen geen patches meer.", explain: "End-of-life software krijgt geen beveiligingsupdates meer en blijft voorgoed lek — vervangen dus." },
      ],
    },

    {
      title: "Taak 2 — Back-ups en de 3-2-1-regel",
      content: `
        <p>Updaten voorkomt veel ellende, maar niet alles. Gaat er een schijf stuk, verlies je je telefoon of slaat
        ransomware toe, dan is er maar één ding dat je redt: een goede <strong>back-up</strong> (reservekopie). Zonder
        back-up zijn je foto's, documenten en administratie in één klap weg.</p>

        <h3>De 3-2-1-regel</h3>
        <p>Een simpele, beproefde vuistregel voor back-ups:</p>
        <ul>
          <li><strong>3</strong> kopieen van je belangrijke data (het origineel plus twee back-ups).</li>
          <li><strong>2</strong> verschillende media/plekken (bijvoorbeeld een externe schijf én de cloud).</li>
          <li><strong>1</strong> kopie <strong>offsite</strong> en bij voorkeur <strong>offline</strong>: op een andere
          locatie en losgekoppeld van je netwerk.</li>
        </ul>

        <div class="callout info">
          <strong>Waarom die ene offline kopie cruciaal is:</strong> moderne ransomware zoekt juist naar aangesloten
          schijven en netwerkmappen en versleutelt die mee. Een back-up die altijd aan staat, gaat dan óók verloren.
          Een kopie die losgekoppeld of onveranderbaar (immutable) is, kan de ransomware niet raken. Dat is je
          vangnet.
        </div>

        <h3>Een back-up die je nooit getest hebt, is geen back-up</h3>
        <p>De klassieke fout: trouw back-uppen, maar nooit controleren of je ook echt kunt <em>terugzetten</em>. Dan
        ontdek je op het slechtste moment dat de back-up leeg, corrupt of onvolledig was. <strong>Test je herstel</strong>
        regelmatig: zet een paar bestanden terug en kijk of het werkt. Pas dan weet je zeker dat je vangnet er is.</p>

        <h3>De analogie van de reservesleutel</h3>
        <p>Een back-up is je reservesleutel. Je legt hem bij iemand anders (offsite), niet onder dezelfde deurmat als
        waar de inbreker kijkt (offline). En af en toe check je of de reservesleutel echt op het slot past (testen).</p>
      `,
      questions: [
        { q: "Waar staat de 3-2-1-regel voor?", options: ["3 kopieen, op 2 verschillende media, waarvan 1 offsite/offline", "3 wachtwoorden, 2 gebruikers, 1 computer", "3 updates per 2 weken op 1 apparaat", "3 firewalls, 2 routers, 1 modem"], answer: 0, explain: "3 kopieen, 2 soorten media, 1 kopie offsite en bij voorkeur offline." },
        { q: "Waarom is minstens één offline (losgekoppelde) back-up belangrijk tegen ransomware?", options: ["Ransomware kan aangesloten schijven meeversleutelen; een losgekoppelde kopie blijft buiten bereik", "Offline back-ups zijn sneller", "Het is wettelijk verplicht", "Dat maakt niet uit, elke back-up is gelijk"], answer: 0, explain: "Alles wat verbonden is, kan meeversleuteld worden; een offline/immutable kopie overleeft de aanval." },
        { q: "Wat moet je regelmatig doen om zeker te weten dat je back-up werkt?", answer: ["testen", "herstel testen", "terugzetten testen", "een restore testen"], hint: "Probeer eens iets terug te zetten.", explain: "Test je herstel: een nooit-geteste back-up blijkt te vaak leeg of corrupt op het slechtste moment." },
      ],
    },

    {
      title: "Taak 3 — Sterke login: wachtwoordmanager en MFA",
      content: `
        <p>Je accounts zijn de sleutels tot je digitale leven. Twee maatregelen maken ze in één klap veel veiliger:
        een <strong>wachtwoordmanager</strong> en <strong>MFA</strong>. Samen zijn ze misschien wel de grootste
        beveiligingswinst per minuut moeite.</p>

        <h3>Gebruik een wachtwoordmanager</h3>
        <p>Niemand kan tientallen lange, unieke wachtwoorden onthouden. Een <strong>wachtwoordmanager</strong> doet dat
        voor je: hij genereert en bewaart voor elk account een lang, willekeurig, uniek wachtwoord, versleuteld achter
        één sterk <em>hoofdwachtwoord</em>. Zo voorkom je de grootste fout — <strong>hergebruik</strong>. Wordt één
        dienst gehackt, dan opent dat ene gelekte wachtwoord niet meteen al je andere accounts.</p>
        <p>Maak voor je hoofdwachtwoord een <strong>wachtwoordzin</strong> (passphrase): een reeks willekeurige woorden,
        lang en toch te onthouden. Probeer in het lab hieronder hoe veel een paar extra woorden uitmaken voor de
        geschatte kraaktijd.</p>

        <div class="callout tip">
          <strong>Tip:</strong> zet op je belangrijkste accounts — zeker je <strong>e-mail</strong> — altijd MFA aan.
          Je e-mail is de hoofdsleutel: via "wachtwoord vergeten" kan iemand anders daarmee je andere accounts
          overnemen.
        </div>

        <h3>Zet MFA overal aan</h3>
        <p><strong>MFA</strong> (multifactor-authenticatie) voegt een tweede slot toe: naast je wachtwoord (iets wat je
        weet) heb je een tweede bewijs nodig, zoals een code uit een app of een hardwaresleutel (iets wat je hebt). Een
        gestolen wachtwoord alleen is dan niet genoeg. Gebruik bij voorkeur een <strong>authenticator-app</strong> of
        een <strong>passkey</strong> boven SMS. (Meer hierover in de room over wachtwoorden en authenticatie.)</p>

        <h3>En phishing dan?</h3>
        <p>Veel accountovernames beginnen met <strong>phishing</strong>: een nep-bericht dat je verleidt je wachtwoord
        in te typen op een valse pagina. Vuistregel: klik niet zomaar op links in onverwachte berichten, controleer het
        afzenderadres, en vertrouw op haast en dreiging als alarmbel. Een wachtwoordmanager helpt bovendien: hij vult
        alleen in op het échte domein. <em>Phishing herkennen oefen je in de aparte phishing-room in dit portaal.</em></p>
      `,
      lab: { type: "password" },
      questions: [
        { q: "Wat is het grootste voordeel van een wachtwoordmanager?", options: ["Elk account krijgt een lang, uniek wachtwoord, zodat één lek niet al je accounts opent", "Je hoeft helemaal geen wachtwoorden meer te hebben", "Je wachtwoorden worden korter", "Hij deelt je wachtwoorden met vrienden"], answer: 0, explain: "Unieke wachtwoorden per account stoppen credential stuffing: één lek sleept de rest niet mee." },
        { q: "Op welk account zet je MFA als allereerste aan, omdat het via 'wachtwoord vergeten' veel andere accounts kan openen?", answer: ["e-mail", "email", "mijn e-mail", "e-mailaccount"], hint: "Daar komen je herstelmails binnen.", explain: "Je e-mail is de hoofdsleutel tot herstel van andere accounts; beveilig die het best." },
        { q: "Welke tweede factor is sterker dan een SMS-code?", options: ["Een authenticator-app of passkey", "Een langere SMS-code", "Je geboortedatum", "Een tweede wachtwoord"], answer: 0, explain: "Een authenticator-app of passkey is minder makkelijk te onderscheppen dan SMS." },
        { q: "Open het lab en test twee wachtwoorden. Ik heb gezien dat extra lengte (meer woorden) de geschatte kraaktijd fors verhoogt.", noAnswer: true },
      ],
    },

    {
      title: "Taak 4 — Veilig wifi, thuis en onderweg",
      content: `
        <p>Je netwerk is de weg naar al je apparaten. Een paar instellingen maken thuis en onderweg een groot verschil.</p>

        <h3>Je thuisnetwerk</h3>
        <ul>
          <li><strong>Gebruik WPA3 (of minstens WPA2).</strong> Dit is de versleuteling van je wifi.
          <strong>WPA3</strong> is de nieuwste en veiligste; kan je router het aan, zet het aan. Vermijd het oude,
          gebroken WEP volledig.</li>
          <li><strong>Verander het standaard beheerderswachtwoord van je router.</strong> Routers komen vaak met een
          bekend standaardwachtwoord dat op internet te vinden is. Stel een eigen, sterk wachtwoord in — en kies ook
          een sterke wifi-sleutel.</li>
          <li><strong>Zet een gastnetwerk op.</strong> Een <strong>gastnetwerk</strong> is een apart wifi-netwerk voor
          bezoekers en voor je slimme apparaten (IoT). Zo staan die los van je laptop en telefoon: raakt een onveilige
          slimme lamp besmet, dan kan die niet zomaar bij je belangrijke apparaten.</li>
        </ul>

        <div class="callout info">
          <strong>WPA3 in het kort:</strong> WPA staat voor Wi-Fi Protected Access. Het cijfer is de generatie: hoe
          hoger, hoe beter de versleuteling. WEP (de oudste) is al jaren onveilig en mag je nooit meer gebruiken.
        </div>

        <h3>Onderweg: publieke wifi</h3>
        <p>Gratis wifi in de trein, een café of het vliegveld is handig, maar je deelt het netwerk met vreemden, en je
        weet niet wie het beheert. Behandel het als een openbare ruimte waar iemand kan meeluisteren.</p>
        <ul>
          <li>Doe geen gevoelige dingen (bankieren, inloggen op werk) op onvertrouwde publieke wifi, tenzij via een
          beveiligde verbinding.</li>
          <li>Gebruik een <strong>VPN</strong> (Virtual Private Network): dat maakt een versleutelde tunnel, zodat
          anderen op hetzelfde netwerk je verkeer niet kunnen meelezen. Je werkgever biedt hiervoor vaak een VPN aan.</li>
          <li>Let op: veel verkeer is dankzij <strong>HTTPS</strong> (het slotje) al versleuteld. Dat helpt, maar een
          VPN beschermt al je verkeer en verbergt bovendien naar welke diensten je verbindt.</li>
        </ul>

        <h3>De analogie van de ansichtkaart</h3>
        <p>Onversleuteld verkeer op publieke wifi is als een ansichtkaart: iedereen die hem onderweg vastheeft, kan
        meelezen. HTTPS en een VPN stoppen je bericht in een dichte envelop.</p>
      `,
      questions: [
        { q: "Welke wifi-versleuteling is het veiligst van deze drie?", options: ["WPA3", "WPA2", "WEP"], answer: 0, explain: "WPA3 is de nieuwste en veiligste; WEP is al jaren gebroken en moet je nooit gebruiken." },
        { q: "Waarvoor is een gastnetwerk handig?", options: ["Bezoekers en slimme apparaten (IoT) scheiden van je belangrijke apparaten", "Sneller internet voor jezelf", "Je wachtwoord onthouden", "Reclame blokkeren"], answer: 0, explain: "Een gastnetwerk houdt onveilige of onbekende apparaten weg van je laptop en telefoon." },
        { q: "Wat doet een VPN op publieke wifi voor je?", options: ["Het maakt een versleutelde tunnel zodat anderen op het netwerk je verkeer niet kunnen meelezen", "Het maakt je internet sneller", "Het vervangt je wachtwoord", "Het maakt automatisch back-ups"], answer: 0, explain: "Een VPN versleutelt je verkeer in een tunnel, zodat meeluisteren op hetzelfde netwerk niet lukt." },
        { q: "Wat moet je als eerste veranderen aan een nieuwe router?", answer: ["het standaard beheerderswachtwoord", "standaardwachtwoord", "het standaardwachtwoord", "beheerderswachtwoord"], hint: "Dat standaardwachtwoord is vaak online te vinden.", explain: "Vervang het standaard beheerderswachtwoord (en de wifi-sleutel) meteen door een eigen, sterke." },
      ],
    },

    {
      title: "Taak 5 — USB's, randapparatuur en privacy",
      content: `
        <p>Niet elke aanval komt via het internet. Soms ligt het gevaar letterlijk op straat, of zit het in hoe je met
        gegevens omgaat.</p>

        <h3>De gevonden USB-stick</h3>
        <p>Een klassieke truc: een aanvaller laat een USB-stick 'rondslingeren' op een parkeerplaats of in de
        bedrijfskantine. Nieuwsgierig steek je hem in je computer om te kijken van wie hij is — en precies dat wil de
        aanvaller. Zo'n stick kan automatisch malware uitvoeren of zich voordoen als een toetsenbord dat razendsnel
        commando's typt.</p>
        <div class="callout danger">
          <strong>Gouden regel:</strong> steek <strong>nooit</strong> een gevonden of onbekende USB-stick in je
          apparaat. Lever hem in bij de receptie of de IT-afdeling. Je weet niet waar hij geweest is of wat erop staat.
        </div>

        <h3>Fysieke veiligheid op de werkplek</h3>
        <ul>
          <li><strong>Vergrendel je scherm</strong> als je wegloopt (Windows-toets + L). Een onbeheerde, ontgrendelde
          computer is een open deur.</li>
          <li><strong>Clean desk:</strong> laat geen wachtwoorden op briefjes of gevoelige documenten open rondslingeren.</li>
          <li>Let op <strong>meekijken</strong> (shoulder surfing) in de trein of een café als je gevoelige dingen doet.</li>
        </ul>

        <h3>Privacy en de AVG-basis</h3>
        <p>De <strong>AVG</strong> (Algemene verordening gegevensbescherming) beschermt persoonsgegevens: alles wat te
        herleiden is tot een persoon, zoals een naam, e-mailadres of BSN. Twee principes die je op je werk direct kunt
        toepassen:</p>
        <ul>
          <li><strong>Dataminimalisatie:</strong> verzamel en bewaar alleen de gegevens die je echt nodig hebt, en niet
          langer dan nodig. Wat je niet hebt, kan ook niet lekken.</li>
          <li><strong>Doelbinding:</strong> gebruik gegevens alleen voor het doel waarvoor ze zijn verzameld.</li>
        </ul>
        <p>Als persoon heb je rechten: je mag bijvoorbeeld inzage vragen in de gegevens die een organisatie over je
        heeft, en vragen die te corrigeren of te verwijderen. De <strong>Autoriteit Persoonsgegevens</strong> houdt in
        Nederland toezicht op de AVG.</p>
      `,
      questions: [
        { q: "Je vindt een onbekende USB-stick op de parkeerplaats. Wat doe je?", options: ["Niet insteken; inleveren bij receptie of IT", "Insteken om te zien van wie hij is", "Insteken op een werkcomputer, die is beter beveiligd", "Mee naar huis nemen en daar insteken"], answer: 0, explain: "Een gevonden stick kan malware uitvoeren of een toetsenbord nabootsen. Nooit insteken; inleveren." },
        { q: "Wat betekent dataminimalisatie onder de AVG?", options: ["Alleen de gegevens verzamelen en bewaren die je echt nodig hebt, niet langer dan nodig", "Zoveel mogelijk gegevens verzamelen voor later", "Gegevens zo klein mogelijk comprimeren", "Alle data versleutelen"], answer: 0, explain: "Wat je niet verzamelt, kan niet lekken. Minimaliseer gegevens en bewaartermijnen." },
        { q: "Wat doe je als je even bij je computer wegloopt op kantoor?", answer: ["scherm vergrendelen", "vergrendelen", "scherm op slot", "lock"], hint: "Windows-toets + L.", explain: "Vergrendel je scherm; een onbeheerde, ontgrendelde computer is een open deur." },
        { q: "Welke organisatie houdt in Nederland toezicht op de AVG?", answer: ["Autoriteit Persoonsgegevens", "autoriteit persoonsgegevens", "AP"], hint: "De privacytoezichthouder.", explain: "De Autoriteit Persoonsgegevens (AP) is de Nederlandse privacytoezichthouder." },
      ],
    },

    {
      title: "Taak 6 — Als het tóch misgaat",
      content: `
        <p>Zelfs met alle maatregelen kan het misgaan. Dan telt vooral dat je <strong>snel en kalm</strong> handelt. Hoe
        eerder je ingrijpt, hoe kleiner de schade. Hier is je noodplan.</p>

        <h3>Vermoed je dat een account gehackt is?</h3>
        <ol>
          <li><strong>Wijzig meteen het wachtwoord</strong> van dat account (vanaf een apparaat dat je vertrouwt), en
          van elk ander account waar je hetzelfde wachtwoord gebruikte.</li>
          <li><strong>Zet MFA aan</strong> als dat er nog niet op zat.</li>
          <li><strong>Log alle actieve sessies uit</strong> ("afmelden op alle apparaten") en controleer de
          beveiligingsinstellingen: ingestelde herstel-e-mail, telefoonnummers en doorstuurregels in je mail
          (aanvallers zetten die vaak stiekem aan).</li>
          <li><strong>Waarschuw je contacten</strong> als er vanuit jouw account rare berichten zijn verstuurd.</li>
        </ol>

        <h3>Vermoed je dat een apparaat besmet is?</h3>
        <ul>
          <li>Haal het <strong>van het netwerk</strong> (wifi uit / kabel eruit) om verspreiding te stoppen.</li>
          <li>Op je werk: <strong>bel direct de IT- of securityafdeling</strong>. Ga niet zelf aanmodderen; zij stellen
          bewijs veilig en pakken het goed aan (zie de incidentrespons-room).</li>
          <li>Thuis: scan met bijgewerkte beveiligingssoftware, of zet het apparaat in het ergste geval helemaal
          opnieuw op en herstel je data vanaf een schone back-up.</li>
        </ul>

        <h3>Waar je terecht kunt (Nederland)</h3>
        <ul>
          <li><strong>Politie</strong> — doe aangifte bij fraude, oplichting of een hack. Bewaar bewijs (schermafbeeldingen, berichten).</li>
          <li><strong>Fraudehelpdesk</strong> — voor melden van en hulp bij oplichting en phishing.</li>
          <li><strong>Autoriteit Persoonsgegevens</strong> — als er persoonsgegevens zijn gelekt (voor organisaties geldt de meldplicht).</li>
          <li><strong>NCSC en Veilig Internetten</strong> — voor betrouwbare uitleg en actueel advies.</li>
        </ul>

        <div class="callout tip">
          <strong>Onthoud:</strong> je hoeft je niet te schamen als je ergens intrapt — dat overkomt iedereen weleens.
          Melden en snel handelen is wat telt, niet verzwijgen. Hoe eerder je het zegt, hoe meer er nog te redden is.
        </div>

        <p>Daarmee heb je een complete basis voor digitale weerbaarheid thuis en op het werk: updaten, back-uppen,
        sterk inloggen, veilig netwerken, slim omgaan met apparaten en gegevens, en weten wat te doen als het misgaat.
        Pas er vandaag nog eentje toe.</p>
      `,
      questions: [
        { q: "Wat is de eerste stap als je vermoedt dat een account gehackt is?", options: ["Meteen het wachtwoord wijzigen (en overal waar je het hergebruikte) en MFA aanzetten", "Niets doen en afwachten", "Je account verwijderen", "Je contacten blokkeren"], answer: 0, explain: "Verander meteen het wachtwoord, zet MFA aan en log actieve sessies uit." },
        { q: "Wat doe je als eerste bij een vermoedelijk besmet apparaat?", answer: ["van het netwerk halen", "wifi uit", "netwerk eruit", "offline halen"], hint: "Stop de verspreiding.", explain: "Haal het apparaat van het netwerk om verspreiding te stoppen; op het werk bel je daarna direct IT/security." },
        { q: "Bij welke instantie kun je terecht om oplichting en phishing te melden en hulp te krijgen?", options: ["Fraudehelpdesk", "De Belastingdienst", "Je internetprovider", "De gemeente"], answer: 0, explain: "De Fraudehelpdesk helpt bij en registreert oplichting en phishing. Bij strafbare feiten doe je ook aangifte bij de Politie." },
        { q: "Ik weet nu welke basismaatregelen ik thuis en op het werk kan toepassen, en bij wie ik meld als het misgaat.", noAnswer: true },
      ],
    },
  ],
  terms: [
    { term: "Patch", def: "Reparatie die een beveiligingsgat (kwetsbaarheid) in software dicht; snel installeren is belangrijk." },
    { term: "Kwetsbaarheid", def: "Beveiligingsfout in software die een aanvaller kan misbruiken (Engels: vulnerability)." },
    { term: "End-of-life", def: "Software die geen updates meer krijgt van de fabrikant en dus voorgoed lek blijft." },
    { term: "Back-up", def: "Reservekopie van je data, zodat je bij verlies, schade of ransomware kunt herstellen." },
    { term: "3-2-1-regel", def: "Vuistregel voor back-ups: 3 kopieen, op 2 verschillende media, waarvan 1 offsite en bij voorkeur offline." },
    { term: "Wachtwoordmanager", def: "Programma dat lange, unieke wachtwoorden genereert en versleuteld bewaart achter één hoofdwachtwoord." },
    { term: "MFA", def: "Multifactor-authenticatie: naast je wachtwoord een tweede bewijs, zoals een code uit een app of een passkey." },
    { term: "WPA3", def: "Nieuwste en veiligste versleuteling voor wifi; gebruik dit (of minstens WPA2), nooit het gebroken WEP." },
    { term: "Gastnetwerk", def: "Apart wifi-netwerk voor bezoekers en slimme apparaten, gescheiden van je belangrijke apparaten." },
    { term: "VPN", def: "Virtual Private Network: versleutelde tunnel die je verkeer beschermt, handig op publieke wifi." },
    { term: "AVG", def: "Algemene verordening gegevensbescherming: EU-privacywet die persoonsgegevens beschermt (Engels: GDPR)." },
    { term: "Dataminimalisatie", def: "AVG-principe: verzamel en bewaar alleen de gegevens die je echt nodig hebt, niet langer dan nodig." },
  ],
  resources: [
    { title: "Veilig internetten — praktische tips", url: "https://veiliginternetten.nl/" },
    { title: "NCSC — advies en actueel nieuws", url: "https://www.ncsc.nl/" },
    { title: "Autoriteit Persoonsgegevens — privacy en datalekken", url: "https://www.autoriteitpersoonsgegevens.nl/" },
    { title: "Fraudehelpdesk — oplichting en phishing melden", url: "https://www.fraudehelpdesk.nl/" },
  ],
});
