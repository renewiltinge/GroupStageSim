/* Room: Social engineering & phishing */
CS.registerRoom({
  id: 'social-engineering-phishing',
  path: 'security-kern',
  order: 3,
  title: 'Social engineering & phishing',
  icon: '🎣',
  difficulty: 'Makkelijk',
  minutes: 55,
  summary: 'De zwakste schakel is zelden de techniek — het is de mens. Leer hoe oplichters je manipuleren en hoe je phishing herkent voordat je klikt.',
  objectives: [
    'Uitleggen wat social engineering is en waarom het zo goed werkt',
    'De psychologische trucs (autoriteit, haast, angst, nieuwsgierigheid) herkennen',
    'De belangrijkste vormen onderscheiden: phishing, spear phishing, smishing, vishing, quishing en CEO-fraude',
    'De rode vlaggen van een phishingmail op afzender, taal en links herkennen',
    'Weten wat je doet (en niet doet) als je een verdacht bericht krijgt',
  ],
  terms: [
    { term: 'Social engineering', def: 'Mensen manipuleren om informatie prijs te geven of iets te doen (klikken, betalen, een deur openen), in plaats van techniek te hacken.' },
    { term: 'Phishing', def: 'Massaal verzonden nepberichten (meestal e-mail) die je naar een valse site lokken of malware laten openen.' },
    { term: 'Spear phishing', def: 'Gerichte phishing op één persoon of organisatie, met persoonlijke details om geloofwaardiger te lijken.' },
    { term: 'Whaling', def: 'Spear phishing gericht op "grote vissen": directeuren, bestuurders, financieel verantwoordelijken.' },
    { term: 'Smishing', def: 'Phishing via sms of chat-apps (SMS + phishing).' },
    { term: 'Vishing', def: 'Phishing via de telefoon (voice + phishing): een "medewerker" die je aan de lijn praat.' },
    { term: 'Quishing', def: 'Phishing via een QR-code die naar een valse site leidt.' },
    { term: 'CEO-fraude / BEC', def: 'Business Email Compromise: oplichter doet zich voor als baas of leverancier en vraagt om een spoedbetaling.' },
    { term: 'Pretexting', def: 'Een geloofwaardig verzonnen verhaal (pretext) opbouwen om je vertrouwen te winnen.' },
    { term: 'Baiting', def: 'Lokaas uitzetten, bv. een "gevonden" USB-stick waar malware op staat.' },
    { term: 'Tailgating', def: 'Fysiek achter iemand aan naar binnen glippen door een beveiligde deur.' },
    { term: 'Typosquatting', def: 'Domeinnamen die lijken op het echte (nederbonk.nl, micros0ft.com) om je te misleiden.' },
  ],
  resources: [
    { title: 'NCSC — veilig online & phishing', url: 'https://www.ncsc.nl/' },
    { title: 'Veilig internetten — phishing herkennen', url: 'https://veiliginternetten.nl/' },
    { title: 'Fraudehelpdesk', url: 'https://www.fraudehelpdesk.nl/' },
  ],
  tasks: [
    {
      title: 'Taak 1 — De mens als doelwit',
      content: `
        <p>Je kunt miljoenen uitgeven aan firewalls, antivirus en encryptie, en tóch gehackt worden doordat één medewerker op een linkje klikt. Dat is de kern van <strong>social engineering</strong>: niet de computer kraken, maar de <em>mens</em> manipuleren.</p>
        <p>Waarom werkt dat zo goed? Omdat het inspeelt op heel normale, menselijke reacties. We willen behulpzaam zijn, we luisteren naar autoriteit, we raken in paniek bij een dreiging, en we zijn nieuwsgierig. Een aanvaller hoeft geen genie te zijn — hij hoeft alleen te weten op welke knopjes hij moet drukken.</p>
        <div class="callout info"><strong>Analogie:</strong> een inbreker kan je slot forceren (techniek), of gewoon netjes aanbellen in een pakketbezorger-jas en vragen of hij even binnen mag om een pakket af te geven (social engineering). Het tweede is vaak makkelijker.</div>
        <p>Beroemde aanvallen begonnen bij een mens: een nepmail naar één medewerker, een telefoontje naar de helpdesk, een gevonden USB-stick op de parkeerplaats. De techniek erachter deed de rest.</p>
        <h3>De beïnvloedingsprincipes</h3>
        <p>Oplichters leunen op vaste psychologische hefbomen:</p>
        <ul>
          <li><strong>Autoriteit</strong> — "Dit is de directeur / de bank / de Belastingdienst." We gehoorzamen gezag.</li>
          <li><strong>Haast &amp; schaarste</strong> — "Doe dit binnen 2 uur, anders..." Tijdsdruk schakelt je nadenken uit.</li>
          <li><strong>Angst</strong> — "Je rekening wordt geblokkeerd / er is ingebroken op je account."</li>
          <li><strong>Nieuwsgierigheid &amp; hebzucht</strong> — "Bekijk deze foto's" / "Je hebt een prijs gewonnen."</li>
          <li><strong>Behulpzaamheid &amp; sympathie</strong> — "Kun je me even helpen, ik zit in de knel."</li>
        </ul>
      `,
      questions: [
        { q: 'Social engineering valt vooral de ... aan.', options: ['computer', 'mens', 'firewall', 'database'], answer: 1, explain: 'Het draait om het manipuleren van mensen, niet om het kraken van techniek.' },
        { q: 'Welk principe gebruikt een oplichter met de zin "Reageer binnen 2 uur of uw account wordt verwijderd"?', answer: ['haast', 'tijdsdruk', 'urgentie'], hint: 'Het zet je onder druk om snel te handelen.', explain: 'Tijdsdruk / haast zorgt dat je handelt vóór je nadenkt.' },
        { q: 'Ik begrijp dat de "zwakste schakel" meestal de mens is, niet de techniek.', noAnswer: true },
      ],
    },
    {
      title: 'Taak 2 — Smaken van phishing',
      content: `
        <p><strong>Phishing</strong> is de bekendste vorm: nepberichten die je naar een valse inlogpagina lokken of je een besmette bijlage laten openen. Maar er zijn meer varianten, en het loont om de namen te kennen:</p>
        <table>
          <thead><tr><th>Vorm</th><th>Kanaal</th><th>Kenmerk</th></tr></thead>
          <tbody>
            <tr><td>Phishing</td><td>E-mail (massaal)</td><td>Hagelschot: duizenden tegelijk, generiek</td></tr>
            <tr><td>Spear phishing</td><td>E-mail (gericht)</td><td>Gericht op jou, met echte details over jou of je werk</td></tr>
            <tr><td>Whaling</td><td>E-mail</td><td>Gericht op de "grote vissen": directie en bestuur</td></tr>
            <tr><td>Smishing</td><td>Sms / chat</td><td>"Uw pakket kon niet bezorgd worden, klik hier"</td></tr>
            <tr><td>Vishing</td><td>Telefoon</td><td>"Met de bank, er is verdachte activiteit op uw rekening"</td></tr>
            <tr><td>Quishing</td><td>QR-code</td><td>QR op een poster/parkeermeter die naar een valse site leidt</td></tr>
            <tr><td>CEO-fraude (BEC)</td><td>E-mail</td><td>"Ik zit in een vergadering, maak snel deze factuur over"</td></tr>
          </tbody>
        </table>
        <div class="callout warn"><strong>Let op:</strong> hoe gerichter de aanval (spear phishing, whaling), hoe geloofwaardiger. De aanvaller heeft je dan al "gegoogeld": je functie, je collega's, je recente vakantie op social media. Die details maken de nepmail overtuigend.</div>
        <p>Een echte bank, overheid of bedrijf zal je <strong>nooit</strong> via mail of telefoon om je volledige wachtwoord, pincode of een inlog-/betaalcode vragen. Dat is altijd een rode vlag.</p>
      `,
      questions: [
        { q: 'Hoe heet phishing via sms?', answer: 'smishing', explain: 'SMS + phishing = smishing.' },
        { q: 'Een oplichter belt je op en doet zich voor als je bank. Hoe heet dit?', answer: 'vishing', hint: 'Voice + phishing.', explain: 'Vishing = voice phishing, oftewel phishing via de telefoon.' },
        { q: 'Een gerichte phishingmail aan de financieel directeur, met echte bedrijfsdetails, noem je:', options: ['smishing', 'spear phishing / whaling', 'baiting', 'quishing'], answer: 1, explain: 'Gericht op een persoon = spear phishing; op een "grote vis" als de directie = whaling.' },
        { q: 'Een QR-code op een nep-parkeermeter die je naar een valse betaalsite stuurt, is een voorbeeld van:', answer: 'quishing', explain: 'QR + phishing = quishing.' },
      ],
    },
    {
      title: 'Taak 3 — De rode vlaggen',
      content: `
        <p>Bijna elke phishingmail verraadt zichzelf als je weet waar je op moet letten. De belangrijkste rode vlaggen:</p>
        <ol>
          <li><strong>Afzenderadres</strong> — de naam ("NederBank Service") kan van alles zijn, maar kijk naar het e-mailadres erachter. <code>service@nederbank-beveiliging.info</code> is níet <code>nederbank.nl</code>.</li>
          <li><strong>Links</strong> — beweeg je muis over een link (of houd ingedrukt op mobiel) en lees de échte bestemming. <code>nederbank.nl.verify-login.ru</code> is een <em>.ru</em>-domein, geen nederbank.</li>
          <li><strong>Haast en dreiging</strong> — "binnen 24 uur", "account geblokkeerd", "laatste waarschuwing".</li>
          <li><strong>Onpersoonlijke of vreemde aanhef</strong> — "Geachte klant" terwijl je bank je naam kent; of juist een té persoonlijke, net-niet-kloppende aanhef.</li>
          <li><strong>Taalfouten en vreemde opmaak</strong> — al worden phishingmails met AI steeds beter geschreven, dus taal alléén is geen betrouwbare test meer.</li>
          <li><strong>Verzoek om gegevens of geld</strong> — wachtwoord, code, betaling, cadeaukaarten.</li>
          <li><strong>Onverwachte bijlage</strong> — een factuur, zip of document dat je niet verwachtte.</li>
        </ol>
        <div class="callout tip"><strong>Gouden regel:</strong> bij twijfel niet klikken. Ga zélf naar de site (typ het adres, gebruik je bladwijzer) of bel de organisatie via een nummer dat je zelf opzoekt — nooit via de gegevens uit het verdachte bericht.</div>
        <h3>Oefening: beoordeel de inbox</h3>
        <p>Hieronder staat een geoefende inbox. <strong>Klik op alles wat jou verdacht lijkt</strong> (afzender, onderwerp, zinsdelen, links) en kies daarna of de mail phishing of legitiem is. Let vooral op het domein achter de knoppen en adressen.</p>
      `,
      lab: {
        type: 'phishing',
        emails: [
          {
            phishing: true,
            fromName: 'NederBank Beveiliging',
            from: 'security@nederbank-verificatie.info',
            to: 'jij@voorbeeld.nl',
            subject: 'URGENT: uw rekening wordt binnen 24 uur geblokkeerd',
            date: 'ma 6 okt 2026 07:12',
            flags: {
              from: 'Het domein is nederbank-verificatie.info, niet nederbank.nl. De echte bank mailt niet vanaf zo\'n adres.',
              subject: 'Haast ("URGENT", "binnen 24 uur") en dreiging ("geblokkeerd") zijn klassieke drukmiddelen.',
            },
            body: [
              [{ text: 'Geachte klant,', flag: 'Onpersoonlijke aanhef — je bank kent je naam.' }],
              [{ text: 'Wij hebben verdachte activiteit op uw rekening gezien. Om blokkade te voorkomen moet u ' }, { text: 'binnen 24 uur', flag: 'Tijdsdruk om je te laten handelen vóór je nadenkt.' }, { text: ' uw gegevens verifiëren.' }],
              [{ text: 'Verifieer nu uw rekening', link: 'http://nederbank.nl.verify-login.ru/nl/inloggen', flag: 'De échte bestemming is verify-login.ru — een Russisch domein, geen nederbank.nl. "nederbank.nl" staat hier alleen als subdomein om je te misleiden.' }],
              [{ text: 'Houd uw ' }, { text: 'inlogcode en pincode', flag: 'Een bank vraagt NOOIT om je volledige code of pincode.' }, { text: ' bij de hand.' }],
              [{ text: 'Met vriendelijke groet, Afdeling Beveiliging' }],
            ],
          },
          {
            phishing: false,
            fromName: 'PakketPost Track & Trace',
            from: 'noreply@pakketpost.nl',
            to: 'jij@voorbeeld.nl',
            subject: 'Je pakket PP-48213 is onderweg',
            date: 'ma 6 okt 2026 09:30',
            body: [
              [{ text: 'Hoi, je bestelling met trackingcode PP-48213 is vandaag onderweg en wordt tussen 14:00 en 16:00 bezorgd.' }],
              [{ text: 'Je hoeft niets te doen. Wil je de bezorging volgen? Open de PakketPost-app of ga zelf naar pakketpost.nl en vul je code in.' }],
              [{ text: 'Fijne dag!' }],
            ],
          },
          {
            phishing: true,
            fromName: 'Jeroen (directeur)',
            from: 'jeroen.directie@gmail.com',
            to: 'financien@jouwbedrijf.nl',
            subject: 'Kleine spoedklus — kun je dit regelen?',
            date: 'ma 6 okt 2026 11:02',
            flags: {
              from: 'De "directeur" mailt vanaf een gmail.com-adres in plaats van het bedrijfsdomein. Klassieke CEO-fraude.',
            },
            body: [
              [{ text: 'Hoi, ik zit in een vergadering en kan niet bellen. ' }, { text: 'Kun je snel', flag: 'Haast + "kan niet bellen" voorkomt dat je het even verifieert.' }, { text: ' een factuur van 8.750 euro overmaken naar een nieuwe leverancier?' }],
              [{ text: 'Rekeningnummer stuur ik zo. Hou het even ', flag: null }, { text: 'tussen ons', flag: 'Geheimhouding vragen is een grote rode vlag — zo voorkomt de oplichter dat je het bij een collega checkt.' }, { text: ', ik leg het later uit.' }],
              [{ text: 'Groeten, Jeroen' }],
            ],
          },
          {
            phishing: false,
            fromName: 'ICT-Helpdesk',
            from: 'helpdesk@jouwbedrijf.nl',
            to: 'jij@jouwbedrijf.nl',
            subject: 'Gepland onderhoud zaterdag 11 okt, 22:00–23:00',
            date: 'di 7 okt 2026 08:15',
            body: [
              [{ text: 'Beste collega, aanstaande zaterdag tussen 22:00 en 23:00 voeren we onderhoud uit. Mogelijk is de mail even niet bereikbaar.' }],
              [{ text: 'Je hoeft niets te doen en we vragen je nergens om in te loggen. Vragen? Reageer op deze mail of bel de helpdesk via het interne nummer op intranet.' }],
            ],
          },
        ],
      },
      questions: [
        { q: 'In de eerste mail ("NederBank Beveiliging"): wat is het échte domein waar de knop "Verifieer nu uw rekening" naartoe leidt? (het hoofddomein, dus de laatste twee delen)', answer: ['verify-login.ru', 'nederbank.nl.verify-login.ru'], hint: 'Lees de hele link; het echte domein zijn de laatste twee delen vóór het pad. "nederbank.nl" staat er alleen als subdomein.', explain: 'Het hoofddomein is verify-login.ru. Alles links daarvan (nederbank.nl.) is maar een subdomein dat je moet misleiden.' },
        { q: 'De "directeur" die vraagt om een spoedbetaling en geheimhouding, vanaf een gmail-adres — welke aanvalsvorm is dit?', answer: ['ceo-fraude', 'bec', 'ceo fraude', 'business email compromise'], hint: 'Oplichter doet zich voor als de baas.', explain: 'Dit is CEO-fraude (Business Email Compromise): nep-baas, spoed, geheimhouding, afwijkend afzenderadres.' },
        { q: 'Welke twee mails waren legitiem? (de afzenderdomeinen klopten en er werd niets geks gevraagd)', options: ['Beide bankmails', 'PakketPost en ICT-Helpdesk', 'NederBank en de directeur', 'Alleen de directeur'], answer: 1, explain: 'PakketPost (pakketpost.nl, geen actie nodig) en ICT-Helpdesk (bedrijfsdomein, vraagt nergens om in te loggen) waren legitiem.' },
      ],
    },
    {
      title: 'Taak 4 — Niet alleen e-mail: fysiek en telefonisch',
      content: `
        <p>Social engineering stopt niet bij je inbox. Een paar klassiekers die in het echt veel gebruikt worden:</p>
        <ul>
          <li><strong>Pretexting</strong> — de aanvaller verzint een geloofwaardig verhaal. "Ik bel namens de IT-leverancier, we zien een storing op jouw werkplek, kun je even dit programma installeren?"</li>
          <li><strong>Baiting</strong> — lokaas. Een USB-stick met "Salarissen 2026" op de parkeerplaats. Nieuwsgierigheid doet de rest: wie hem in zijn laptop stopt, installeert de malware zelf.</li>
          <li><strong>Tailgating / piggybacking</strong> — achter een medewerker aanlopen door een toegangsdeur, met de handen vol dozen zodat iemand "even" de deur openhoudt.</li>
          <li><strong>Shoulder surfing</strong> — meekijken terwijl je je pincode of wachtwoord intypt (in de trein, bij de pinautomaat).</li>
          <li><strong>Dumpster diving</strong> — in het afval graven naar papieren met gevoelige info.</li>
        </ul>
        <div class="callout danger"><strong>Vuistregel voor USB:</strong> stop nooit een gevonden USB-stick in je computer. Lever hem in bij de beveiliging of gooi hem weg. "Even kijken van wie hij is" is precies de valkuil.</div>
        <p>De verdediging is vaak simpel maar vergt discipline: identiteit verifiëren via een onafhankelijk kanaal, geen onbekenden "even" binnenlaten, schermen afschermen, en bij twijfel melden in plaats van zelf oplossen.</p>
      `,
      questions: [
        { q: 'Je vindt een USB-stick met "Salarissen 2026" op de parkeerplaats. Wat doe je?', options: ['In mijn laptop stoppen om te zien van wie hij is', 'Inleveren bij de beveiliging of weggooien', 'Naar een collega sturen', 'Thuis bekijken op mijn privélaptop'], answer: 1, explain: 'Dit is baiting. Nooit in een computer stoppen — inleveren of weggooien.' },
        { q: 'Hoe heet het achter iemand aan naar binnen glippen door een beveiligde deur?', answer: ['tailgating', 'piggybacking'], hint: 'Denk aan dicht achter iemand "aanrijden".', explain: 'Tailgating (of piggybacking): meeliften op de toegang van een ander.' },
        { q: 'Een beller zegt van de IT-leverancier te zijn en vraagt je software te installeren. Het verzonnen verhaal om je vertrouwen te winnen heet:', answer: 'pretexting', explain: 'Pretexting = een pretext (dekmantelverhaal) opbouwen.' },
      ],
    },
    {
      title: 'Taak 5 — Wat doe je bij een verdacht bericht?',
      content: `
        <p>Je hebt een rode vlag gezien. Nu komt het aan op de juiste reflex. Onthoud: <strong>stoppen, nadenken, verifiëren</strong>.</p>
        <h3>Wel doen</h3>
        <ul>
          <li><strong>Niet klikken, niet openen, niet antwoorden.</strong></li>
          <li><strong>Verifieer via een eigen kanaal.</strong> Twijfel je over een mail van je bank? Bel het nummer achter op je pas of gebruik de officiële app — nooit de contactgegevens uit het bericht.</li>
          <li><strong>Hover over links</strong> om de echte bestemming te zien. Ga anders zelf naar de site door het adres te typen.</li>
          <li><strong>Meld het.</strong> Op het werk: bij de IT-/securityafdeling (vaak met een "meld phishing"-knop). Privé: bij de organisatie die wordt nagedaan, en eventueel bij de <em>Fraudehelpdesk</em>. Je kunt phishing ook doorsturen naar valse-email@ adressen die veel organisaties aanbieden.</li>
          <li><strong>Al geklikt of gegevens ingevuld?</strong> Wijzig direct je wachtwoord(en), zet MFA aan, neem contact op met je bank als het om geld gaat, en meld het. Snelheid beperkt de schade.</li>
        </ul>
        <div class="callout info"><strong>Melden helpt iedereen.</strong> Als jij een phishinggolf meldt, kan de securityafdeling of de echte organisatie anderen waarschuwen en de valse site laten offline halen. Je bent dan geen "domme klikker" maar een sensor in het verdedigingsnetwerk.</div>
        <p>En wees mild voor jezelf en collega's: iedereen kan een keer klikken, zéker bij goede spear phishing. Een cultuur waarin je veilig durft te melden ("ik heb per ongeluk geklikt") is veiliger dan een cultuur van schaamte, waarin fouten verborgen blijven.</p>
      `,
      questions: [
        { q: 'Je twijfelt over een mail van je bank. Wat is de veiligste manier om te verifiëren?', options: ['Op de link in de mail klikken en inloggen', 'Het telefoonnummer uit de mail bellen', 'Zelf de officiële app openen of het nummer achter op je pas bellen', 'De mail beantwoorden met je vraag'], answer: 2, explain: 'Gebruik altijd een onafhankelijk kanaal dat je zelf opzoekt — nooit de gegevens uit het verdachte bericht.' },
        { q: 'Je hebt per ongeluk je wachtwoord op een phishingsite ingevuld. Wat is de eerste stap?', answer: ['wachtwoord wijzigen', 'wachtwoord veranderen', 'wachtwoord aanpassen'], hint: 'Zorg dat de gestolen gegevens waardeloos worden.', explain: 'Wijzig direct je wachtwoord (en van andere accounts met hetzelfde wachtwoord), zet MFA aan en meld het.' },
        { q: 'Phishing melden bij je IT-afdeling is nutteloos, want zij kunnen er toch niets mee.', options: ['Waar', 'Niet waar'], answer: 1, explain: 'Melden helpt juist enorm: de echte site kan offline gehaald worden en collega\'s worden gewaarschuwd.' },
        { q: 'Ik ken nu de reflex "stoppen, nadenken, verifiëren" en weet dat melden geen schande is.', noAnswer: true },
      ],
    },
  ],
});
