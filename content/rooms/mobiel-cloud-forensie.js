/* Room: Mobiele en cloud-forensie */
CS.registerRoom({
  id: 'mobiel-cloud-forensie',
  path: 'forensie',
  order: 7,
  title: 'Mobiele en cloud-forensie',
  icon: '📱',
  difficulty: 'Gemiddeld',
  minutes: 60,
  summary: 'Telefoons en de cloud zitten vol sporen. Leer hoe je data veiligstelt, waar berichten en locaties zitten, en wat er juridisch bij komt kijken.',
  objectives: [
    'Uitleggen waarom een telefoon een goudmijn aan digitaal bewijs is',
    'De acquisitiemethoden (logisch, bestandssysteem, fysiek) en de rol van back-ups onderscheiden',
    'Benoemen waar app-data zit: SQLite-databases, plists en shared preferences',
    'Een SQLite-database herkennen aan de magic bytes en er een bericht uit halen',
    'Cloud-login-logboeken doorzoeken en een verdachte login herkennen',
    'Het Nederlandse juridische kader schetsen: inbeslagname, machtiging, proportionaliteit en de rol van het NFI',
  ],
  tasks: [
    {
      title: 'Taak 1 — Waarom een telefoon een goudmijn is',
      content: `
        <p>Vraag een willekeurig persoon zijn telefoon een dag af te staan en je ziet pure paniek. Niet gek: een smartphone is een dagboek, fotoalbum, plattegrond en adresboek in één. Voor een digitaal rechercheur is een in beslag genomen telefoon dan ook vaak de rijkste bron in een zaak.</p>

        <h3>Wat zit er zoal op?</h3>
        <ul>
          <li><strong>Berichten</strong> — chats, sms, e-mail. Wie had contact met wie, en wanneer?</li>
          <li><strong>Locatie</strong> — opgeslagen routes, ingecheckte plekken, en de GPS-metadata in foto's (EXIF, uit de vorige room).</li>
          <li><strong>Foto's en video's</strong> — met tijdstip en soms coördinaten erin.</li>
          <li><strong>App-data</strong> — van bank-apps tot spelletjes; elke app bewaart gegevens.</li>
          <li><strong>Zoekgeschiedenis en browsergeschiedenis</strong> — wat zocht iemand op, en net voor welk moment?</li>
        </ul>

        <p>Een analogie: een huis doorzoeken levert vingerafdrukken en papieren op. Een telefoon doorzoeken levert een <em>tijdlijn</em> op — minuut voor minuut wie, waar en wat. Dat maakt mobiele forensie zo krachtig, én zo privacygevoelig.</p>

        <div class="callout warn"><strong>Daarom gelden er strenge regels:</strong> juist omdat een telefoon zó veel vertelt, mag je hem niet zomaar uitlezen. De AVG en het strafrecht stellen grenzen (machtiging, proportionaliteit). Daar komen we in de laatste taak op terug. Alle namen, apps en personen in deze room zijn fictief — we gebruiken bijvoorbeeld de verzonnen chat-app <strong>KletsApp</strong>.</div>
      `,
      questions: [
        { q: 'Waarom noemen we een telefoon een "goudmijn" voor onderzoek?', options: ['Omdat er goud in zit', 'Omdat één apparaat een gedetailleerde tijdlijn van berichten, locatie en activiteit kan bevatten', 'Omdat telefoons duur zijn', 'Omdat ze altijd versleuteld zijn'], answer: 1, explain: 'Een telefoon combineert berichten, locaties, foto\'s en app-data tot een rijke tijdlijn — vandaar "goudmijn".' },
        { q: 'Noem één soort gegevens die locatie-informatie kan bevatten, naast opgeslagen routes.', answer: ["foto's", 'fotos', 'foto', 'afbeeldingen', 'exif'], hint: 'Denk aan de EXIF-metadata uit de OSINT-room.', explain: 'Foto\'s kunnen via EXIF GPS-coördinaten bevatten, dus ook zij verraden locatie.' },
        { q: 'Ik begrijp dat een telefoon juist door zijn rijkdom aan data extra privacygevoelig is.', noAnswer: true },
      ],
    },

    {
      title: 'Taak 2 — Data veiligstellen: acquisitie',
      content: `
        <p>Voordat je iets onderzoekt, moet je de data <strong>veiligstellen</strong> zonder hem te veranderen. Dat heet <strong>acquisitie</strong>. De gouden regel van alle forensie: werk nooit op het origineel, maar op een kopie, en zorg dat je kunt aantonen dat die kopie niet is gewijzigd (de <strong>bewijsketen</strong> of <em>chain of custody</em>).</p>

        <h3>Drie niveaus van acquisitie</h3>
        <table>
          <thead><tr><th>Methode</th><th>Wat je krijgt</th><th>Diepte</th></tr></thead>
          <tbody>
            <tr><td><strong>Logisch</strong></td><td>Wat de telefoon normaal "uitleent": contacten, berichten, foto's via de officiële kanalen</td><td>Oppervlakkig, snel</td></tr>
            <tr><td><strong>Bestandssysteem</strong></td><td>De mappen en bestanden van apps, inclusief databases</td><td>Middel</td></tr>
            <tr><td><strong>Fysiek (image)</strong></td><td>Een bit-voor-bit-kopie van het hele geheugen, óók verwijderde data</td><td>Diepst, maar lastigst</td></tr>
          </tbody>
        </table>
        <p>Een <strong>fysieke image</strong> is het meest compleet: je maakt een exacte, bit-voor-bit-kopie van het geheugen, waardoor je zelfs (deels) gewiste bestanden nog kunt terughalen. Maar het is ook het moeilijkst, want moderne telefoons zijn zwaar beveiligd.</p>

        <h3>Back-ups als extra bron</h3>
        <p>Soms kom je niet op de telefoon zelf, maar bestaat er een <strong>back-up</strong> op een computer of in de cloud. Een iPhone-back-up via Finder (vroeger iTunes) of een Android-back-up kan een schat aan berichten en app-data bevatten — soms makkelijker te benaderen dan het toestel zelf.</p>

        <h3>De grote obstakels</h3>
        <ul>
          <li><strong>Encryptie en schermslot.</strong> Moderne telefoons versleutelen standaard hun opslag. Zonder de pincode of sleutel zie je alleen onleesbare brij.</li>
          <li><strong>Op afstand wissen.</strong> Een verdachte (of handlanger) kan de telefoon op afstand wissen zodra die online komt. Daarom stop je een in beslag genomen toestel direct in een <strong>Faraday-tas</strong> of zet je "vliegtuigmodus" aan: dan heeft het geen verbinding en kan niemand op afstand wissen.</li>
        </ul>

        <div class="callout tip"><strong>Onthoud de volgorde:</strong> eerst isoleren (Faraday-tas / vliegtuigmodus), dán pas nadenken over uitlezen. Een toestel dat tijdens je werk opeens online gaat, kan in één seconde leeg zijn.</div>
      `,
      questions: [
        { q: 'Welke acquisitiemethode geeft de meest complete kopie, inclusief (deels) verwijderde data?', options: ['Logische acquisitie', 'Bestandssysteem-acquisitie', 'Fysieke (bit-voor-bit) image', 'Een screenshot'], answer: 2, explain: 'Een fysieke image is een bit-voor-bit-kopie van het hele geheugen, waarin ook gewiste data nog kan zitten.' },
        { q: 'Waarmee voorkom je dat een in beslag genomen telefoon op afstand wordt gewist?', answer: ['faraday-tas', 'faraday tas', 'faradaytas', 'vliegtuigmodus', 'airplane mode', 'faraday'], hint: 'Je wilt het toestel van elke verbinding afsnijden.', explain: 'Een Faraday-tas (of vliegtuigmodus) snijdt alle draadloze verbindingen af, zodat op afstand wissen onmogelijk wordt.' },
        { q: 'Waarom werk je in forensie altijd op een kopie en niet op het originele toestel?', options: ['Dat gaat sneller', 'Om het origineel onveranderd te houden en de bewijsketen (chain of custody) te bewaken', 'Omdat kopieën mooier zijn', 'Dat hoeft niet'], answer: 1, explain: 'Werken op een kopie houdt het bewijs intact en navolgbaar; wijzig je het origineel, dan is het bewijs aantastbaar.' },
      ],
    },

    {
      title: 'Taak 3 — Waar zit de data? SQLite, plists en meer',
      content: `
        <p>Heb je eenmaal toegang tot het bestandssysteem, dan moet je weten <em>waar</em> apps hun gegevens bewaren. Gelukkig volgen besturingssystemen vaste patronen. Drie formaten kom je constant tegen:</p>

        <h3>1. SQLite-databases (overal)</h3>
        <p>Verreweg de meeste apps bewaren hun gegevens in een <strong>SQLite</strong>-database: een compleet databasesysteem in één bestand, meestal met de extensie <code>.db</code> of <code>.sqlite</code>. Een chat-app als het fictieve <strong>KletsApp</strong> bewaart je berichten, contacten en groepen gewoon in zo'n <code>.db</code>-bestand. Open je dat met een SQLite-viewer, dan rollen de berichten er in tabellen uit — inclusief tijdstempels.</p>

        <h3>2. Plists (iOS)</h3>
        <p>Op een iPhone (iOS) staan instellingen en kleine gegevens vaak in een <strong>plist</strong> (property list): een bestand met sleutel-waardeparen, bijvoorbeeld welke accounts zijn ingesteld of wanneer een app voor het laatst draaide.</p>

        <h3>3. Shared preferences (Android)</h3>
        <p>Op Android bewaren apps hun instellingen vaak in <strong>shared preferences</strong>: XML-bestanden met voorkeuren en kleine stukjes gegevens, zoals een ingelogd account of een laatste zoekterm.</p>

        <h3>En de media</h3>
        <p>Vergeet de <strong>mediabestanden</strong> niet: foto's en video's met hun metadata (zoals de EXIF-GPS uit de vorige room). Een enkele foto in een app-map kan al een locatie en tijdstip prijsgeven.</p>

        <div class="callout info"><strong>Waarom dit telt:</strong> als je weet dat KletsApp zijn chats in een <code>.db</code> zet, ga je gericht op zoek naar dat bestand in de image — in plaats van eindeloos door schermafbeeldingen te scrollen. In de volgende taak open je zo'n databasebestand op byte-niveau.</div>
      `,
      questions: [
        { q: 'In welk veelgebruikt databaseformaat (één bestand) bewaren de meeste apps, zoals chat-apps, hun gegevens?', answer: ['sqlite', 'sqlite-database', 'sqlite database'], hint: 'Een compleet databasesysteem in één enkel .db-bestand.', explain: 'SQLite: een zelfstandige database in één bestand (.db/.sqlite), waarin chat-apps hun berichten opslaan.' },
        { q: 'Waar bewaart een Android-app typisch zijn kleine instellingen (zoals een ingelogd account)?', options: ['In een plist', 'In shared preferences (XML)', 'In het BIOS', 'In de EXIF'], answer: 1, explain: 'Android gebruikt shared preferences: XML-bestanden met voorkeuren en kleine gegevens. Plists horen bij iOS.' },
        { q: 'Op welk besturingssysteem kom je plists (property lists) tegen?', answer: ['ios', 'iphone', 'apple'], hint: 'Het systeem van de iPhone.', explain: 'Plists horen bij iOS (Apple). Op Android zijn het shared preferences.' },
      ],
    },

    {
      title: 'Taak 4 — Lees de database op byte-niveau',
      content: `
        <p>Soms vind je in een image een bestand zonder nette extensie, of wil je bewijzen dat een bestand écht een database is. Dan kijk je naar de <strong>magic bytes</strong>: de vaste beginbytes die het bestandstype verraden (net als bij de JPEG in de OSINT-room).</p>

        <p>Een SQLite-database begint altijd met een herkenbare tekstkop. De eerste 16 bytes zijn letterlijk de tekst <code>SQLite format 3</code> gevolgd door een afsluitende nulbyte. Zie je die kop, dan weet je zeker: dit is een SQLite-database, ongeacht hoe het bestand heet.</p>

        <div class="callout info"><strong>Spiekregel:</strong> de ASCII-kolom rechts in een hexviewer laat leesbare tekst zien. Bij een SQLite-bestand lees je daar meteen "SQLite format 3" aan het begin. Bij een JPEG zag je FF D8 FF E1; elk type heeft zijn eigen signatuur.</div>

        <h3>Open de hexviewer</h3>
        <p>Hieronder staan de eerste bytes van een bestand <code>kletsapp.db</code>, veiliggesteld uit een fictieve zaak. Je opdracht:</p>
        <ol>
          <li>Lees de <strong>eerste 16 bytes</strong> in de ASCII-kolom. Welke tekstkop staat er, en welk bestandstype is dit dus?</li>
          <li>Verderop in de bytes staat een leesbaar <strong>chatbericht</strong> uit de app (van wie, naar wie, en wat). Lees het.</li>
          <li>Onderaan staat bij <code>flag=</code> een <strong>vlag</strong>. Noteer hem.</li>
        </ol>
      `,
      lab: {
        type: 'hexviewer',
        filename: 'kletsapp.db',
        hex: `53 51 4C 69 74 65 20 66 6F 72 6D 61 74 20 33 00
10 00 01 01 00 40 20 20 20 20 74 61 62 65 6C 3D
62 65 72 69 63 68 74 65 6E 20 20 61 70 70 3D 4B
6C 65 74 73 41 70 70 20 20 76 65 72 73 69 65 3D
37 0A 76 61 6E 3D 44 61 61 6E 20 20 6E 61 61 72
3D 4D 69 6C 61 20 20 74 69 6A 64 3D 32 30 32 36
2D 30 39 2D 30 33 20 32 33 3A 30 34 0A 62 65 72
69 63 68 74 3D 7A 69 65 20 6A 65 20 6F 6D 20 32
33 3A 30 30 20 62 69 6A 20 64 65 20 6F 75 64 65
20 6C 6F 6F 64 73 20 61 61 6E 20 64 65 20 4B 61
64 65 0A 66 6C 61 67 3D 4A 56 54 7B 73 71 6C 69
74 65 5F 62 65 77 61 61 72 74 5F 63 68 61 74 73
7D 0A`,
      },
      questions: [
        { q: 'Welke tekstkop staat in de eerste bytes, en welk bestandstype is dit dus?', options: ['%PDF — een PDF', 'SQLite format 3 — een SQLite-database', 'PK — een ZIP-bestand', 'MZ — een Windows-programma'], answer: 1, explain: 'De eerste 16 bytes luiden "SQLite format 3" plus een nulbyte: de vaste signatuur van een SQLite-database.' },
        { q: 'Van wie naar wie is het chatbericht in de database?', answer: ['van daan naar mila', 'daan naar mila', 'daan, mila', 'daan naar mila'], hint: 'Lees de ASCII-kolom: van=... naar=...', explain: 'De database bevat van=Daan en naar=Mila — afzender en ontvanger van het bericht.' },
        { q: 'Welke vlag staat achter flag= in de database?', answer: ['JVT{sqlite_bewaart_chats}'], encoded: true, hint: 'Lees de leesbare ASCII onderaan de hexdump.', explain: 'In de ASCII-kolom staat flag=JVT{sqlite_bewaart_chats}. Een SQLite-bestand bevat dus gewoon leesbare berichtinhoud.' },
      ],
    },

    {
      title: 'Taak 5 — iOS versus Android, en het account erachter',
      content: `
        <p>De twee grote platforms verschillen genoeg om je aanpak te bepalen. Je hoeft geen expert te zijn, maar de hoofdlijnen moet je kennen.</p>

        <h3>iOS (iPhone)</h3>
        <ul>
          <li>Een gesloten systeem van Apple. Standaard sterk versleuteld en lastig fysiek uit te lezen.</li>
          <li>Instellingen in <strong>plists</strong>, app-data vaak in SQLite-databases.</li>
          <li>Een <strong>Finder-/iTunes-back-up</strong> op een computer is soms een makkelijkere bron dan het toestel.</li>
        </ul>

        <h3>Android</h3>
        <ul>
          <li>Veel verschillende fabrikanten en versies — meer variatie, soms meer mogelijkheden.</li>
          <li>Instellingen in <strong>shared preferences</strong> (XML), app-data ook in SQLite.</li>
          <li>Afhankelijk van toestel en versie soms makkelijker een bestandssysteem- of fysieke acquisitie.</li>
        </ul>

        <h3>Het account is een bron op zich</h3>
        <p>Een telefoon hangt bijna altijd aan een online account: een <strong>iCloud</strong>-account (Apple) of een <strong>Google</strong>-account (Android). Daarin staat vaak een <em>kopie</em> van foto's, contacten, agenda en back-ups — in de cloud, los van het toestel. Zelfs als de telefoon versleuteld of gewist is, kan dat account nog gegevens bevatten.</p>

        <div class="callout tip"><strong>Denk in twee sporen:</strong> het toestel zelf én het account erachter. Soms is het toestel dicht, maar levert de cloud-back-up alsnog het bewijs. Dat account benaderen vraagt wél een eigen juridische route — daarover gaat de volgende taak.</div>
      `,
      questions: [
        { q: 'Welk online account hoort typisch bij een Android-telefoon als extra gegevensbron?', answer: ['google', 'google-account', 'google account'], hint: 'De maker van Android.', explain: 'Een Android-toestel hangt doorgaans aan een Google-account, met o.a. foto\'s, contacten en back-ups in de cloud.' },
        { q: 'Waarom kan een cloud-account bewijs opleveren terwijl de telefoon zelf versleuteld of gewist is?', options: ['De cloud ontsleutelt de telefoon', 'Het account bewaart vaak een eigen kopie van foto\'s, contacten en back-ups, los van het toestel', 'Dat kan niet', 'De cloud bewaart het schermslot'], answer: 1, explain: 'iCloud/Google bewaren een kopie van data in de cloud; die staat los van het (mogelijk ontoegankelijke) toestel.' },
        { q: 'Op welk platform vind je instellingen in plists?', options: ['Android', 'iOS', 'Windows Phone', 'Beide gelijk'], answer: 1, explain: 'Plists horen bij iOS; Android gebruikt shared preferences.' },
      ],
    },

    {
      title: 'Taak 6 — Cloud-forensie: sporen bij de provider',
      content: `
        <p>Steeds meer data staat niet op een apparaat, maar <strong>in de cloud</strong>: bij een provider op servers die overal ter wereld kunnen staan. Dat verandert het onderzoek flink. Je kunt niet even een kabeltje in een server prikken; je moet de data <em>opvragen</em> bij het bedrijf.</p>

        <h3>Wat cloud-forensie oplevert</h3>
        <ul>
          <li><strong>Logbestanden en loginhistorie</strong> — wie logde wanneer in, vanaf welk IP-adres en welk apparaat?</li>
          <li><strong>Gedeelde bestanden</strong> — wat is met wie gedeeld, en wanneer?</li>
          <li><strong>Back-ups en versies</strong> — oudere versies van bestanden of gewiste items.</li>
        </ul>

        <h3>De uitdagingen</h3>
        <ul>
          <li><strong>Jurisdictie.</strong> De server staat misschien in een ander land; dan heb je een rechtshulpverzoek nodig.</li>
          <li><strong>Encryptie.</strong> Goede providers versleutelen data; soms heeft zelfs de provider de sleutel niet.</li>
          <li><strong>Vluchtigheid en verlopende logs.</strong> Loginhistorie wordt vaak maar beperkte tijd bewaard. Wacht je te lang, dan is het spoor weg. Snelheid telt.</li>
        </ul>

        <h3>De loginhistorie in de praktijk</h3>
        <p>Hieronder zie je de login-historie van het (fictieve) KletsApp-account <code>mila@kletsapp.lab</code>, zoals je die bij de provider zou opvragen. Normaal logt Mila in vanuit Nederland, overdag, vanaf haar iPhone. Ergens zit echter een <strong>verdachte login</strong>: een vreemd IP-adres, een andere locatie en een afwijkend tijdstip — gevolgd door actie op het account. Gebruik het filter (tekst of <code>/regex/</code>).</p>
        <p>Je opdracht:</p>
        <ol>
          <li>Filter op <code>login</code> en zoek de login die níét uit Nederland komt en op een raar tijdstip valt. Noteer het IP-adres en de locatie.</li>
          <li>Kijk wat er direct ná die login gebeurde (filter bijvoorbeeld op het verdachte IP).</li>
          <li>In de notitieregel bij die actie staat de <strong>vlag</strong>.</li>
        </ol>
      `,
      lab: {
        type: 'logs',
        title: 'kletsapp-cloud · loginhistorie mila@kletsapp.lab',
        lines: `2026-09-01 08:14:02  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-01 12:41:55  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-02 07:58:19  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=198.51.100.33  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-02 18:22:40  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=198.51.100.33  locatie=Amersfoort, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-03 08:03:11  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-03 09:15:47  account=mila@kletsapp.lab  gebeurtenis=login  status=mislukt  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-03 09:16:02  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-10 13:30:05  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=198.51.100.33  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-12 22:11:38  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-14 03:47:51  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=203.0.113.88  locatie=Belgrado, RS  apparaat=onbekend (web)
2026-09-14 03:48:10  account=mila@kletsapp.lab  gebeurtenis=wachtwoord_gewijzigd  status=ok  ip=203.0.113.88  locatie=Belgrado, RS  apparaat=onbekend (web)
2026-09-14 03:49:27  account=mila@kletsapp.lab  gebeurtenis=export_chats  status=ok  ip=203.0.113.88  locatie=Belgrado, RS  notitie=JVT{verdachte_login_gevonden}
2026-09-14 03:52:03  account=mila@kletsapp.lab  gebeurtenis=nieuw_apparaat_gekoppeld  status=ok  ip=203.0.113.88  locatie=Belgrado, RS  apparaat=web-sessie
2026-09-14 08:05:12  account=mila@kletsapp.lab  gebeurtenis=login  status=mislukt  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-14 08:05:29  account=mila@kletsapp.lab  gebeurtenis=login  status=mislukt  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-14 08:09:44  account=mila@kletsapp.lab  gebeurtenis=wachtwoord_herstel_aangevraagd  status=ok  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)
2026-09-14 08:20:01  account=mila@kletsapp.lab  gebeurtenis=login  status=ok  ip=192.168.1.24  locatie=Utrecht, NL  apparaat=iPhone (KletsApp 7.2)`,
      },
      questions: [
        { q: 'Vanaf welk IP-adres kwam de verdachte login (vreemde locatie, raar tijdstip)?', answer: ['203.0.113.88'], hint: 'Filter op login en zoek de regel met locatie buiten NL rond 03:47.', explain: 'De login van 203.0.113.88 (Belgrado, RS) om 03:47 wijkt af van Mila\'s gewone patroon uit NL overdag.' },
        { q: 'Wat deed de aanvaller direct na de verdachte login? (noem één gebeurtenis)', answer: ['wachtwoord gewijzigd', 'wachtwoord_gewijzigd', 'wachtwoord wijzigen', 'export chats', 'export_chats', 'chats exporteren', 'nieuw apparaat gekoppeld'], hint: 'Filter op 203.0.113.88 en lees de regels eronder.', explain: 'Vanaf hetzelfde IP werd het wachtwoord gewijzigd, de chats geëxporteerd en een nieuw apparaat gekoppeld — klassieke accountovername.' },
        { q: 'Welke vlag staat in de notitieregel bij de verdachte actie?', answer: ['JVT{verdachte_login_gevonden}'], hint: 'Filter op JVT of op notitie.', explain: 'Bij de export_chats-regel van het verdachte IP staat notitie=JVT{verdachte_login_gevonden}.' },
      ],
    },

    {
      title: 'Taak 7 — Het juridische kader en het NFI',
      content: `
        <p>De techniek is maar de helft. Als digitaal rechercheur bij de <strong>Politie</strong> werk je binnen een strak juridisch kader. Bewijs dat je buiten de regels verzamelt, telt niet mee — of erger, de zaak klapt.</p>

        <h3>De kernbegrippen</h3>
        <ul>
          <li><strong>Inbeslagname.</strong> Een telefoon of laptop mag alleen in beslag worden genomen op de wettelijke gronden; er is een bevoegdheid voor nodig.</li>
          <li><strong>Machtiging.</strong> Voor het echt uitlezen van een telefoon — met al zijn privacygevoelige inhoud — is doorgaans een <strong>machtiging</strong> van een officier van justitie of rechter-commissaris nodig. Je mag niet zomaar alles doorzoeken.</li>
          <li><strong>Proportionaliteit en subsidiariteit.</strong> De inbreuk op iemands privacy moet in verhouding staan tot het onderzoeksbelang (proportionaliteit), en je kiest het minst ingrijpende middel dat werkt (subsidiariteit). Voor een kleine zaak mag je niet het complete digitale leven van iemand uitpluizen.</li>
          <li><strong>Rechtshulpverzoek.</strong> Staat de clouddata in het buitenland, dan heb je vaak de hulp van dat land nodig via een formeel verzoek.</li>
        </ul>

        <div class="callout info"><strong>De AVG blijft gelden:</strong> ook de politie moet doelbinding en dataminimalisatie respecteren. Je verzamelt wat nodig is voor de zaak, niet meer. De Autoriteit Persoonsgegevens houdt toezicht.</div>

        <h3>Samenwerken met het NFI</h3>
        <p>Voor complexe gevallen — een zwaar versleutelde telefoon, een beschadigde chip, een ingewikkelde fysieke image — schakelt de politie het <strong>NFI</strong> in, het <strong>Nederlands Forensisch Instituut</strong>. Daar zitten specialisten en apparatuur die veel verder gaan dan de standaardgereedschappen. Zie het als het forensisch laboratorium achter de rechercheur: jij levert de zaak en de vragen aan, zij halen er met geavanceerde technieken het bewijs uit.</p>

        <div class="callout tip"><strong>Samengevat:</strong> goede mobiele en cloud-forensie is techniek én zorgvuldigheid. Stel data veilig zonder te wijzigen, blijf binnen machtiging en proportionaliteit, documenteer alles, en roep de hulp van het NFI in als het te complex wordt. Zo wordt jouw vondst ook echt bruikbaar bewijs.</div>
      `,
      questions: [
        { q: 'Wat is doorgaans nodig om de privacygevoelige inhoud van een in beslag genomen telefoon echt uit te lezen?', options: ['Niets, dat mag altijd', 'Een machtiging van bijvoorbeeld een officier van justitie of rechter-commissaris', 'Toestemming van de fabrikant', 'Een Faraday-tas'], answer: 1, explain: 'Het uitlezen van een telefoon is een forse privacy-inbreuk; daarvoor is een machtiging vereist.' },
        { q: 'Waar staat de afkorting NFI voor?', answer: ['nederlands forensisch instituut'], hint: 'Het forensisch laboratorium van Nederland.', explain: 'NFI = Nederlands Forensisch Instituut, dat de politie bijstaat bij complexe forensische vragen.' },
        { q: 'Wat betekent proportionaliteit bij een digitaal onderzoek?', options: ['Zo veel mogelijk data verzamelen', 'De privacy-inbreuk moet in verhouding staan tot het onderzoeksbelang', 'Alles twee keer kopiëren', 'Alleen de nieuwste telefoons onderzoeken'], answer: 1, explain: 'Proportionaliteit: de inbreuk moet in verhouding staan tot het belang; samen met subsidiariteit kies je het minst ingrijpende middel.' },
        { q: 'Ik begrijp dat forensisch onderzoek alleen bruikbaar is als het binnen het juridische kader (machtiging, proportionaliteit, AVG) gebeurt.', noAnswer: true },
      ],
    },
  ],

  terms: [
    { term: 'Mobiele forensie', def: 'Het veiligstellen en onderzoeken van data op telefoons en tablets als digitaal bewijs.' },
    { term: 'Cloud-forensie', def: 'Onderzoek naar data die bij een provider in de cloud staat in plaats van op een apparaat.' },
    { term: 'Acquisitie', def: 'Het veiligstellen van data zonder het origineel te wijzigen, als kopie om op te onderzoeken.' },
    { term: 'Logische acquisitie', def: 'Oppervlakkige kopie via de officiële kanalen van het toestel (contacten, berichten, foto\'s).' },
    { term: 'Fysieke image', def: 'Een bit-voor-bit-kopie van het hele geheugen, waarin ook (deels) verwijderde data kan zitten.' },
    { term: 'SQLite', def: 'Databasesysteem in één bestand (.db/.sqlite) waarin veel apps hun gegevens bewaren; begint met "SQLite format 3".' },
    { term: 'Plist', def: 'Property list: iOS-bestand met sleutel-waardeparen voor instellingen en kleine gegevens.' },
    { term: 'Shared preferences', def: 'Android-XML-bestanden waarin apps hun instellingen en kleine gegevens opslaan.' },
    { term: 'Faraday-tas', def: 'Afschermende tas die alle draadloze signalen blokkeert, zodat een toestel niet op afstand gewist kan worden.' },
    { term: 'Back-up', def: 'Kopie van telefoongegevens op een computer (Finder/iTunes) of in de cloud; soms een makkelijkere bron dan het toestel.' },
    { term: 'Chain of custody', def: 'Bewijsketen: de aantoonbare, onafgebroken registratie dat bewijs niet is gewijzigd of verwisseld.' },
    { term: 'Rechtshulpverzoek', def: 'Formeel verzoek om hulp van een ander land, nodig als clouddata in het buitenland staat.' },
    { term: 'Machtiging', def: 'Wettelijke toestemming (bijv. van officier of rechter-commissaris) die nodig is om een telefoon uit te lezen.' },
    { term: 'NFI', def: 'Nederlands Forensisch Instituut: het forensisch laboratorium dat de politie bijstaat bij complexe zaken.' },
  ],

  resources: [
    { title: 'Forensic Focus — mobiele en digitale forensie', url: 'https://www.forensicfocus.com/' },
    { title: 'Nationaal Cyber Security Centrum (NCSC)', url: 'https://www.ncsc.nl/' },
    { title: 'Autoriteit Persoonsgegevens — privacy en AVG', url: 'https://www.autoriteitpersoonsgegevens.nl/' },
    { title: 'Politie — aangifte en cybercrime', url: 'https://www.politie.nl/' },
  ],
});
