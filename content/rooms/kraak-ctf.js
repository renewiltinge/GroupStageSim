/* Room: Eindopdracht — Grote kraak-CTF "Operatie Sleutelbos" (capstone) */

// --- Station 5: een buitgemaakt sessietoken (JWT, alg: none) ---
// header = {"alg":"none","typ":"JWT"} , payload bevat role=admin en een vlag.
const JWT_SLEUTELBOS =
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.' +
  'eyJzdWIiOiJtLmRla2tlciIsIm5hbWUiOiJNYXggRGVra2VyIiwicm9sZSI6ImFkbWluIiwiZGVwdCI6ImJlaGVlciIsImZsYWciOiJKVlR7dG9rZW5fZ2VsZXplbn0ifQ.';

CS.registerRoom({
  id: 'kraak-ctf',
  path: 'eindopdracht',
  order: 2,
  title: 'Grote kraak-CTF: Operatie Sleutelbos',
  icon: '🗝️',
  difficulty: 'Moeilijk',
  minutes: 75,
  summary: 'De afsluitende kraak-CTF. Als geautoriseerd red-teamer werk je je door een buitgemaakte, volledig fictieve dump van Sleutelbos B.V. Je herkent en kraakt hashes, ontcijfert een onderschept bericht, pelt een gelaagde blob af, reverse-engineert een licentiecontrole en inspecteert een toegangstoken — en verzamelt onderweg zeven vlaggen.',
  objectives: [
    'Een hashtype herkennen en daarna de juiste kraakstrategie kiezen',
    'Een klassiek cijfer (Caesar) en een gelaagde codering (hex + Base64) ontrafelen',
    'Een licentiecontrole lezen en de geldige sleutel afleiden (reverse engineering)',
    'Een JSON Web Token inspecteren: claims lezen en een zwakke configuratie benoemen',
    'Een Windows NTLM-hash kraken en begrijpen waarom context het hashtype bepaalt',
    'Alle stappen eerlijk en reproduceerbaar rapporteren binnen de grenzen van je opdracht',
  ],
  terms: [
    { term: 'CTF', def: 'Capture The Flag: een oefening waarin je uitdagingen oplost en geheime codes (vlaggen) verzamelt.' },
    { term: 'Vlag (flag)', def: 'Een unieke code die bewijst dat je een uitdaging oploste, hier in het formaat JVT{...}.' },
    { term: 'Hashtype herkennen (hash-ID)', def: 'Aan lengte en vorm bepalen welk algoritme een hash maakte (32 hex = MD5/NTLM, 40 = SHA-1, 64 = SHA-256).' },
    { term: 'Woordenlijstaanval (dictionary attack)', def: 'Elk woord uit een lijst waarschijnlijke wachtwoorden hashen en vergelijken met de doel-hash.' },
    { term: 'Salt', def: 'Een unieke, willekeurige toevoeging per wachtwoord vóór het hashen; maakt vooraf berekende tabellen (rainbow tables) nutteloos.' },
    { term: 'NTLM', def: 'Windows-wachtwoordhash (MD4 van het wachtwoord in UTF-16LE), 32 hex-tekens — net als MD5, dus de herkomst beslist welk type je kiest.' },
    { term: 'Caesarcijfer (ROT)', def: 'Een klassiek cijfer dat elke letter een vast aantal plaatsen opschuift; met 25 mogelijke verschuivingen triviaal te kraken.' },
    { term: 'Codering vs. encryptie', def: 'Codering (Base64, hex, ROT) is omkeerbaar zonder sleutel; encryptie vereist een geheime sleutel.' },
    { term: 'Reverse engineering (crackme)', def: 'Uit de controlecode van een programma afleiden welke invoer wordt geaccepteerd — hier een licentiesleutel.' },
    { term: 'JWT (JSON Web Token)', def: 'Een token van drie Base64-delen (header.payload.handtekening) dat een server gebruikt om een ingelogde gebruiker te herkennen.' },
    { term: 'Claim', def: 'Een gegeven in de payload van een JWT, bijvoorbeeld sub (gebruiker), role (rol) of exp (verloopdatum).' },
    { term: 'alg: none', def: 'Een JWT-header die zegt dat het token geen handtekening heeft; een ernstige zwakte, want dan kan iedereen de inhoud aanpassen.' },
  ],
  resources: [
    { title: 'TryHackMe — oefen verder met echte CTF-rooms', url: 'https://tryhackme.com/' },
    { title: 'Hashcat — de bekendste hash-kraker (modi, maskers, regels)', url: 'https://hashcat.net/' },
    { title: 'CyberChef — coderen, decoderen en analyseren', url: 'https://gchq.github.io/CyberChef/' },
    { title: 'jwt.io — JSON Web Tokens inspecteren en begrijpen', url: 'https://jwt.io/' },
  ],
  tasks: [
    {
      title: 'Taak 1 — De opdracht: Operatie Sleutelbos',
      content: `
        <p>Welkom bij je eindproef, red-teamer. <strong>Sleutelbos B.V.</strong> (volledig fictief) is een bedrijf dat
        digitale sloten en toegangssystemen maakt. Ze huurden je in voor een <strong>geautoriseerde pentest</strong> van hun
        testomgeving <code>10.10.70.0/24</code>, en je hebt die toegang netjes <em>op papier</em> gekregen. Dat papiertje is
        cruciaal: zonder uitdrukkelijke, schriftelijke toestemming zou alles wat je hierna doet strafbaar zijn
        (computervredebreuk, art. 138ab Sr).</p>

        <p>Tijdens de opdracht heb je een eerste voet aan de grond gekregen en een <strong>dump</strong> geëxporteerd: een
        mapje met buitgemaakte bestanden — wachtwoordhashes, een onderschept bericht, een configuratie-backup, een stukje
        licentiesoftware en een sessietoken. In deze CTF werk je je stap voor stap door die dump heen. Alles erin is
        <strong>verzonnen</strong> en staat in een afgeschermd lab.</p>

        <p>Je verzamelt <strong>zeven vlaggen</strong> (formaat <code>JVT{...}</code>), één per station. Je gebruikt alles uit
        de eerdere rooms: hashes herkennen en kraken, cijfers ontrafelen, codering afpellen, software reverse-engineeren en
        tokens inspecteren. Houd, net als in het echt, een korte <strong>write-up</strong> bij: noteer per station wat je deed
        en wat je vond. Dat is precies hoe je straks aan de klant rapporteert.</p>

        <div class="callout danger"><strong>Ethiek, eerst:</strong> deze technieken oefen je uitsluitend in dit lab of op
        systemen waarvoor je aantoonbaar toestemming hebt. Buiten je opdracht ben je geen pentester maar een inbreker.</div>
      `,
      questions: [
        { q: 'Wat maakt deze pentest legaal in plaats van strafbaar?', options: ['Dat het bedrijf fictief is', 'De schriftelijke toestemming om deze omgeving te testen', 'Dat je maar zeven vlaggen zoekt', 'Dat je het snel doet'], answer: 1, explain: 'Schriftelijke toestemming (of je eigen lab) is de grens tussen een pentest en computervredebreuk (art. 138ab Sr).' },
        { q: 'Hoeveel vlaggen ga je in deze CTF verzamelen?', answer: ['7', 'zeven'], hint: 'Eén per station; lees de opdracht.', explain: 'Zeven stations, zeven vlaggen — van de eerste gekraakte hash tot de eindvlag.' },
        { q: 'Ik heb toestemming om 10.10.70.0/24 te testen en ga de dump station voor station uitwerken.', noAnswer: true },
      ],
    },

    {
      title: 'Station 1 — Toegang (deel A): herken de buitgemaakte hash',
      content: `
        <p>Het eerste bestand in de dump is <code>gebruikers.txt</code> met daarin een wachtwoord-hash van een
        beheeraccount. Een goede kraker begint nooit met kraken, maar met één vraag: <strong>wat voor hash is dit
        eigenlijk?</strong> Kies je het verkeerde algoritme, dan kan geen enkele gok ooit kloppen.</p>

        <p>De hash luidt:</p>
        <pre><code>a25ad97ab6b81c581cf22b2e994e69a48cb8a80d12a9a51e2d12db239a3a287c</code></pre>

        <p>Gebruik de hash-identificatie hieronder (de hash staat er al in). Let op de twee aanwijzingen die een tool als
        <em>hash-id</em> gebruikt: de <strong>lengte</strong> en de <strong>vorm</strong>. Tel de tekens: het zijn er
        <strong>64</strong>. Dat is het kenmerk van <strong>SHA-256</strong> (256 bits = 32 bytes = 64 hex-tekens). Ter
        vergelijking: 32 hex-tekens wijzen op MD5 of NTLM, 40 op SHA-1.</p>

        <p>Merk ook op dat de tool meldt of het type <em>traag/gesalt</em> is. Deze hash is dat niet: het is een kale,
        ongesalte SHA-256. SHA-256 is op zich een sterk algoritme, maar <strong>zonder salt</strong> blijft elke losse gok
        razendsnel te berekenen — en dus werkt een woordenlijstaanval nog steeds. Dat buit je in deel B uit.</p>

        <div class="callout tip"><strong>Tip:</strong> eerst herkennen, dan de aanval kiezen. Zou je deze 64-teken-hash als
        MD5 proberen te kraken, dan vergelijk je 32-teken-MD5's met een 64-teken-doel — dat matcht per definitie nooit.</div>
      `,
      lab: { type: 'hashid', value: 'a25ad97ab6b81c581cf22b2e994e69a48cb8a80d12a9a51e2d12db239a3a287c' },
      questions: [
        { q: 'Welk hashtype is dit, gezien de 64 hex-tekens?', options: ['MD5', 'SHA-1', 'SHA-256', 'NTLM'], answer: 2, explain: '64 hex-tekens = 256 bits = SHA-256 (SHA-2-familie).' },
        { q: 'Waarom is deze (ongesalte) hash kwetsbaar voor een woordenlijstaanval?', options: ['Omdat SHA-256 geheim is', 'Omdat elke losse gok razendsnel te berekenen is en er geen salt per wachtwoord is', 'Omdat de hash te lang is', 'Dat is hij niet'], answer: 1, explain: 'Zonder salt en met een snel algoritme kan een aanvaller enorme aantallen gokken per seconde proberen.' },
      ],
    },

    {
      title: 'Station 1 — Toegang (deel B): kraak de toegangshash',
      content: `
        <p>Je weet nu dat het om <strong>SHA-256</strong> gaat. Tijd om te kraken. De hash-kraker hieronder staat al op het
        juiste algoritme (je ziet "Doel-hash (SHA256)" bovenaan) en bevat dezelfde hash als in deel A.</p>

        <pre><code>a25ad97ab6b81c581cf22b2e994e69a48cb8a80d12a9a51e2d12db239a3a287c</code></pre>

        <p>Start de <strong>woordenlijstaanval</strong>: de tool hasht elk woord uit de lijst en vergelijkt het met de
        doel-hash. Lukt het niet meteen? Je mag <strong>eigen gokken toevoegen</strong> en de <strong>regels (mangling)</strong>
        aanzetten om varianten te maken (hoofdletter vooraan, een cijfer of jaartal erachter) — precies zoals Hashcat en John
        the Ripper dat doen. Het wachtwoord hier is een populaire gamer-bijnaam met een paar cijfers erachter.</p>

        <p>Zodra je de hash kraakt, log je met dat wachtwoord in op het interne beheerportaal van Sleutelbos. Het dashboard
        verwelkomt je en toont de eerste vlag: <strong>JVT{toegang_verleend}</strong>. Noteer zowel het gekraakte wachtwoord
        als de vlag in je write-up.</p>

        <div class="callout warn"><strong>Les voor de klant:</strong> MD5 én SHA-256 zijn razendsnel te berekenen. Wachtwoorden
        hoor je op te slaan met een traag, gesalt algoritme zoals <strong>bcrypt</strong>, <strong>scrypt</strong> of
        <strong>Argon2</strong>. Dat zet je straks in je rapport als aanbeveling.</div>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'sha256',
        hash: 'a25ad97ab6b81c581cf22b2e994e69a48cb8a80d12a9a51e2d12db239a3a287c',
        wordlist: ['welkom', 'admin', 'ninja123', 'voetbal', 'zomer2024', 'qwerty', 'gamer', 'dojo'],
      },
      questions: [
        { q: 'Wat is het gekraakte wachtwoord van het beheeraccount?', answer: ['ninja123'], hint: 'Start de woordenlijstaanval op SHA-256; het is een gamer-bijnaam met cijfers.', explain: 'De SHA-256-hash a25ad97a... hoort bij het wachtwoord "ninja123".' },
        { q: 'Welke vlag toont het beheerportaal nadat je bent ingelogd?', answer: ['JVT{toegang_verleend}'], hint: 'Staat in de uitleg van deze taak, als beloning voor het kraken.', explain: 'Met het gekraakte wachtwoord krijg je toegang: JVT{toegang_verleend}.' },
      ],
    },

    {
      title: 'Station 2 — Het onderschepte bericht',
      content: `
        <p>In het portaal vind je een logje van een interne chat. Eén regel is "beveiligd" door de beheerder — maar in
        werkelijkheid is het alleen maar <em>verschoven</em>. Dat is een <strong>Caesarcijfer</strong> (ROT): elke letter is
        een vast aantal plaatsen opgeschoven. Het is een van de oudste cijfers die er bestaat, en met hooguit 25 mogelijke
        verschuivingen volstrekt onveilig.</p>

        <p>Het onderschepte bericht luidt:</p>
        <pre><code>Kl nlolptl cshn pz QCA{jhlzhy_pz_thrrlspqr}</code></pre>

        <p>Gebruik het cijfer-lab hieronder. Kies de methode <strong>Caesar/ROT</strong>: de tool toont alle 26 verschuivingen
        tegelijk én zet er een automatische <strong>"beste gok"</strong> bij op basis van letterfrequentie. Zoek de
        verschuiving waarbij er leesbaar Nederlands verschijnt. Je ziet dan een hele zin verschijnen, met daarin de vlag.</p>

        <p>De juiste verschuiving hier is <strong>7</strong> (ROT7). Dat de tekst pas ná ontcijferen leesbaar wordt, is precies
        waarom je bij de vlag-vraag <code>encoded</code> gebruikt: de vlag staat niet kant-en-klaar in de opdracht, je leidt
        hem zelf af.</p>

        <div class="callout info"><strong>Onthoud:</strong> een Caesarcijfer heeft geen echte sleutel die je moet raden — je
        probeert gewoon alle 25 verschuivingen. Codering en zwakke cijfers zijn geen vervanging voor echte encryptie.</div>
      `,
      lab: { type: 'cipher', text: 'Kl nlolptl cshn pz QCA{jhlzhy_pz_thrrlspqr}' },
      questions: [
        { q: 'Welke verschuiving (ROT-getal) maakt het bericht leesbaar?', answer: ['7', 'rot7', 'rot 7', '7 plaatsen'], hint: 'Kijk bij welke verschuiving er leesbaar Nederlands staat; de "beste gok" helpt je.', explain: 'Met ROT7 wordt het bericht leesbaar: "De geheime vlag is JVT{...}".' },
        { q: 'Wat is de vlag na het ontcijferen van het Caesar-bericht?', answer: ['JVT{caesar_is_makkelijk}'], encoded: true, hint: 'Pas ROT7 toe; de zin eindigt op de vlag.', explain: 'Ontcijferd staat er: "De geheime vlag is JVT{caesar_is_makkelijk}".' },
      ],
    },

    {
      title: 'Station 3 — De gelaagde configuratie-backup',
      content: `
        <p>De beheerder heeft ook een configuratie-backup "verstopt" door hem een paar keer door een encoder te halen. Dat is
        een klassieke beginnersfout: meerdere lagen <strong>codering</strong> stapelen voelt veilig, maar is het niet. Er is
        geen sleutel nodig om het terug te draaien — je hoeft alleen de lagen te herkennen en af te pellen.</p>

        <p>De blob uit de backup is:</p>
        <pre><code>536c5a55653352335a5756666247466e5a573539</code></pre>

        <p>Alleen cijfers en de letters a–f, en een even aantal tekens: dat ruikt naar <strong>hexadecimaal</strong>. Pel je
        die laag af, dan krijg je tekst die eruitziet als <strong>Base64</strong> (letters, cijfers, hoofd- en kleine letters).
        Pel ook die af en de vlag verschijnt. De volgorde is dus: <strong>hex → Base64 → tekst</strong>.</p>

        <p>Gebruik de multi-decoder hieronder. Die herkent automatisch het soort codering en toont een gevonden
        <strong>"ketting"</strong> (bijvoorbeeld Hex → Base64 → tekst), plus per laag de kandidaten die je verder kunt
        ontleden. Omdat de vlag pas na het decoderen zichtbaar is, zet je bij de vraag weer <code>encoded</code>.</p>

        <div class="callout tip"><strong>Vuistregel:</strong> even aantal tekens met alleen 0–9 en a–f → hex. Eindigt iets op
        <code>=</code> of ziet het eruit als willekeurige letters/cijfers → waarschijnlijk Base64. Twee lagen codering zijn nog
        steeds geen encryptie.</div>
      `,
      lab: { type: 'multidecode', input: '536c5a55653352335a5756666247466e5a573539' },
      questions: [
        { q: 'In welke volgorde moet je de blob afpellen?', options: ['Base64, daarna hex', 'Hex, daarna Base64', 'ROT13, daarna hex', 'Alleen Base64'], answer: 1, explain: 'Eerst hex decoderen, dan Base64 — de auto-ketting toont Hex → Base64 → tekst.' },
        { q: 'Wat is de vlag na het afpellen van beide lagen?', answer: ['JVT{twee_lagen}'], encoded: true, hint: 'Laat de multi-decoder de ketting Hex → Base64 vinden.', explain: 'Na hex en Base64 verschijnt JVT{twee_lagen}.' },
      ],
    },

    {
      title: 'Station 4 — De licentiecontrole (crackme)',
      content: `
        <p>In de dump zit ook een stukje software van Sleutelbos zelf: een <strong>licentiecontrole</strong>. Het programma
        vraagt om een geldige licentiesleutel en laat alleen de juiste door. Jij hebt de broncode van de controle — dus je
        hoeft niet te gokken, je kunt <strong>teruglezen</strong> welke sleutel wordt geaccepteerd. Dat heet reverse
        engineering.</p>

        <p>Bekijk de controlecode in het lab hieronder. Hij doet drie dingen: de sleutel moet beginnen met het voorvoegsel
        <code>SLB-</code>, het deel daarna moet precies 10 tekens lang zijn, en dat deel moet — <em>achterstevoren gelezen</em>
        — gelijk zijn aan een vaste doelstring. Draai je die doelstring in je hoofd om, dan heb je de code. Plak er het
        voorvoegsel voor en je hebt de volledige sleutel.</p>

        <p>Typ je sleutel in het lab. Het lab voert de <strong>echte</strong> controle uit op jouw invoer en meldt
        "Toegang verleend" als het klopt, met de vlag <strong>JVT{licentie_gekraakt}</strong>. Noteer zowel de sleutel als de
        vlag in je write-up.</p>

        <div class="callout info"><strong>Waarom dit werkt:</strong> zodra de controle lokaal op jouw apparaat draait, kun je
        hem lezen en omkeren. Echte licentiebescherming leunt daarom nooit alleen op een controle in de client — en al helemaal
        niet op "de string achterstevoren".</div>
      `,
      lab: {
        type: 'crackme',
        title: 'Sleutelbos licentiecontrole v3',
        intro: 'Lees de controle en leid de enige geldige licentiesleutel af. Formaat: SLB- gevolgd door 10 tekens.',
        source: `// Licentiecontrole van Sleutelbos B.V.
function check(sleutel) {
  // 1) de sleutel moet beginnen met het voorvoegsel SLB-
  if (!sleutel.startsWith('SLB-')) return false;
  // 2) het deel na SLB- is precies 10 tekens lang
  var code = sleutel.slice(4);
  if (code.length !== 10) return false;
  // 3) die code moet, achterstevoren gelezen, exact dit zijn:
  var doel = 'sobletuels';
  return code.split('').reverse().join('') === doel;
}`,
        check: (sleutel) => {
          if (typeof sleutel !== 'string') return false;
          if (!sleutel.startsWith('SLB-')) return false;
          const code = sleutel.slice(4);
          if (code.length !== 10) return false;
          return code.split('').reverse().join('') === 'sobletuels';
        },
        flag: 'JVT{licentie_gekraakt}',
        reveal: 'Toegang verleend. De doelstring "sobletuels" achterstevoren is "sleutelbos", dus de sleutel is SLB-sleutelbos.',
        hint: 'Draai de doelstring "sobletuels" om en plak er SLB- voor.',
      },
      questions: [
        { q: 'Welke volledige licentiesleutel accepteert de controle?', answer: ['SLB-sleutelbos'], hint: 'Voorvoegsel SLB-, daarna de doelstring "sobletuels" achterstevoren.', explain: '"sobletuels" omgedraaid is "sleutelbos"; met het voorvoegsel wordt dat SLB-sleutelbos.' },
        { q: 'Welke vlag toont het lab bij een geldige sleutel?', answer: ['JVT{licentie_gekraakt}'], hint: 'Verschijnt bij "Toegang verleend".', explain: 'Een geldige sleutel levert de vlag JVT{licentie_gekraakt} op.' },
        { q: 'Waarom kon je de sleutel afleiden zonder te gokken?', options: ['Omdat de controlecode zelf verklapt wat wordt geaccepteerd', 'Omdat de sleutel heel kort is', 'Omdat SLB- een geheim voorvoegsel is', 'Dat kon niet, je moest wel gokken'], answer: 0, explain: 'Een controle die lokaal draait en leesbaar is, kun je terugredeneren — dat is reverse engineering.' },
      ],
    },

    {
      title: 'Station 5 — Het buitgemaakte toegangstoken (JWT)',
      content: `
        <p>Bijna binnen als volwaardig beheerder. In de dump zit een <strong>sessietoken</strong>: een
        <strong>JSON Web Token (JWT)</strong>. Zo'n token gebruikt een webapp om een ingelogde gebruiker te herkennen, en
        bestaat uit drie delen, gescheiden door punten: <code>header.payload.handtekening</code>. De eerste twee delen zijn
        gewoon <strong>Base64</strong> — dus leesbaar voor iedereen die het token in handen krijgt.</p>

        <p>Het buitgemaakte token is:</p>
        <pre><code>eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJtLmRla2tlciIsIm5hbWUiOiJNYXggRGVra2VyIiwicm9sZSI6ImFkbWluIiwiZGVwdCI6ImJlaGVlciIsImZsYWciOiJKVlR7dG9rZW5fZ2VsZXplbn0ifQ.</code></pre>

        <p>Plak dit token in het JWT-lab hieronder. Het decodeert de header en de payload voor je. Lees de
        <strong>payload</strong>: welke <code>role</code>-claim staat erin? En kijk naar de <strong>header</strong>: welk
        algoritme (<code>alg</code>) gebruikt dit token? Het lab zet er waarschuwingen bij voor zwakke configuraties.</p>

        <p>Je ziet twee problemen. Ten eerste staat er <code>alg: none</code> in de header: het token heeft <strong>geen
        handtekening</strong>. Ten tweede ontbreekt een <code>exp</code> (verloopdatum), dus het token blijft eeuwig geldig.
        In de payload staat bovendien een vlag-claim — bewijs dat je de inhoud echt gelezen hebt. Omdat die vlag in Base64 in
        het token zit (en niet kant-en-klaar in de tekst), markeer je de vraag met <code>encoded</code>.</p>

        <div class="callout danger"><strong>Puur inspecteren:</strong> hier lees en beoordeel je het token — meer niet. Een
        token vervalsen en inzetten tegen een echt systeem waarvoor je geen toestemming hebt, is strafbaar. De les voor de
        klant: onderteken tokens met een sterk geheim (HS256/RS256), weiger <code>alg: none</code>, en zet altijd een
        <code>exp</code>.</div>
      `,
      lab: { type: 'jwt', token: JWT_SLEUTELBOS },
      questions: [
        { q: 'Welke rol (role-claim) staat in de payload van het token?', answer: ['admin'], hint: 'Lees het gedecodeerde payload-deel in het lab; zoek de sleutel "role".', explain: 'De payload bevat "role": "admin" — het token claimt beheerdersrechten.' },
        { q: 'Wat is de belangrijkste zwakte in de header van dit token?', options: ['Het gebruikt alg: none, dus er is geen handtekening', 'De header is te lang', 'Het gebruikt HS256', 'Er zit een geldige handtekening op'], answer: 0, explain: 'alg: none betekent geen handtekening; iedereen kan de inhoud dan aanpassen. Ook ontbreekt een exp (verloopdatum).' },
        { q: 'Welke vlag staat als claim in de payload?', answer: ['JVT{token_gelezen}'], encoded: true, hint: 'Decodeer de payload en zoek de claim "flag".', explain: 'De payload bevat "flag": "JVT{token_gelezen}" — leesbaar omdat JWT-payloads niet versleuteld zijn.' },
      ],
    },

    {
      title: 'Station 6 — De domeincontroller (NTLM)',
      content: `
        <p>Laatste station. Via het beheeraccount kon je doorstoten naar de <strong>domeincontroller</strong> van Sleutelbos
        en daar de wachtwoord-hashes uit de Windows <strong>SAM/NTDS</strong> dumpen. Eén daarvan hoort bij een
        domeinbeheerder. Kraak je die, dan heb je in feite het hele domein overgenomen — het hoogste doel van deze opdracht.</p>

        <p>De hash luidt:</p>
        <pre><code>9b86ae4b912e6eea59a695d12670990c</code></pre>

        <p>Het zijn <strong>32 hex-tekens</strong>. Een hash-id-tool zou nu twee opties noemen: dit kan <strong>MD5</strong>
        zijn, maar ook <strong>NTLM</strong> — beide zijn 128 bits. De lengte alleen beslist het niet; de
        <strong>context</strong> wel. Deze hash komt uit een <strong>Windows-domeincontroller</strong>, en Windows slaat
        lokale/domein-wachtwoorden op als NTLM (dat is MD4 van het wachtwoord in UTF-16LE). Kies dus <strong>NTLM</strong>,
        niet MD5.</p>

        <p>De hash-kraker hieronder staat al op <strong>NTLM</strong> (zie "Doel-hash (NTLM)" bovenaan). Start de
        woordenlijstaanval. Het wachtwoord is een bekende Nederlandse stad. Kraak het en je ontgrendelt de laatste
        stationsvlag: <strong>JVT{domein_overgenomen}</strong>.</p>

        <div class="callout warn"><strong>Onthoud:</strong> MD5 en NTLM zijn aan de hash niet te onderscheiden — beide 32 hex.
        De herkomst (een <code>/etc/shadow</code>, een database-dump of een Windows-SAM) vertelt je welke je moet kiezen.</div>
      `,
      lab: {
        type: 'hashcrack',
        algo: 'ntlm',
        hash: '9b86ae4b912e6eea59a695d12670990c',
        wordlist: ['rotterdam', 'utrecht', 'amsterdam', 'denhaag', 'eindhoven', 'welkom', 'admin', 'computer'],
      },
      questions: [
        { q: 'Welk hashtype kies je voor een 32 hex-teken-hash uit een Windows-domeincontroller?', options: ['SHA-256', 'bcrypt', 'NTLM', 'SHA-1'], answer: 2, explain: 'Windows slaat wachtwoorden op als NTLM. Bij 32 hex uit een Windows-bron kies je NTLM, niet MD5.' },
        { q: 'Wat is het gekraakte wachtwoord van de domeinbeheerder?', answer: ['amsterdam'], hint: 'Kies NTLM en start de aanval; het is een bekende Nederlandse stad.', explain: 'De NTLM-hash 9b86ae4b... hoort bij het wachtwoord "amsterdam".' },
        { q: 'Welke vlag verdien je met het overnemen van het domein?', answer: ['JVT{domein_overgenomen}'], hint: 'Staat in de uitleg van deze taak, als beloning.', explain: 'Het kraken van de domeinbeheerder levert JVT{domein_overgenomen} op.' },
      ],
    },

    {
      title: 'Slotstation — De buit opmaken en netjes afronden',
      content: `
        <p>Gefeliciteerd, red-teamer. 🗝️ Je hebt de hele sleutelbos verzameld: zeven vlaggen, van de eerste gekraakte hash tot
        de overname van het domein. Je doorliep in het klein een complete keten: <strong>herkennen → kraken → ontcijferen →
        afpellen → reverse-engineeren → inspecteren → doorstoten</strong>.</p>

        <h3>Wat je liet zien</h3>
        <ul>
          <li>Een hash eerst <strong>herkennen</strong> en dan pas de juiste aanval kiezen (SHA-256, NTLM).</li>
          <li>Codering onderscheiden van encryptie: een Caesarcijfer en een gelaagde hex/Base64-blob zijn zonder sleutel om te draaien.</li>
          <li>Software <strong>reverse-engineeren</strong>: uit de controle de enige geldige licentiesleutel afleiden.</li>
          <li>Een JWT lezen en de zwaktes benoemen: <code>alg: none</code>, geen <code>exp</code>, en gevoelige data leesbaar in de payload.</li>
        </ul>

        <h3>De eindvlag</h3>
        <p>Als bewijs dat je de hele operatie hebt afgerond, krijg je de eindvlag: <strong>JVT{operatie_sleutelbos_voltooid}</strong>.
        Zet die bovenaan je write-up.</p>

        <h3>Hoe je nu rapporteert — en verder groeit</h3>
        <ul>
          <li><strong>Scheid feiten van advies.</strong> Feit: "wachtwoorden stonden als ongesalte SHA-256/NTLM opgeslagen".
          Advies: "stap over op bcrypt/Argon2 met een unieke salt per wachtwoord".</li>
          <li><strong>Maak het reproduceerbaar.</strong> Noteer per station je stappen, zodat de klant je bevindingen kan nalopen.</li>
          <li><strong>Blijf oefenen</strong> op veilige platforms (zie de bronnen) en bouw een eigen thuislab.</li>
        </ul>

        <div class="callout danger"><strong>Ethische afsluiting:</strong> alles in deze CTF was fictief en geautoriseerd. Je
        vaardigheden zijn krachtig en dus gevoelig. Gebruik ze uitsluitend op je eigen systemen of met schriftelijke
        toestemming, meld kwetsbaarheden netjes (coordinated vulnerability disclosure, bijvoorbeeld via het NCSC), en blijf aan
        de goede kant van art. 138ab Sr. Daar word je een professional van — geen verdachte.</div>
      `,
      questions: [
        { q: 'Wat is de eindvlag van Operatie Sleutelbos?', answer: ['JVT{operatie_sleutelbos_voltooid}'], hint: 'Staat in deze slottaak, als beloning voor het afronden.', explain: 'De eindvlag is JVT{operatie_sleutelbos_voltooid} — alle zeven vlaggen binnen.' },
        { q: 'Wat is de belangrijkste aanbeveling tegen het kraken van de wachtwoordhashes die je vond?', options: ['Langere gebruikersnamen eisen', 'Opslag met een traag, gesalt algoritme (bcrypt/scrypt/Argon2)', 'De hashes dubbel MD5-en', 'De hashes geheimhouden'], answer: 1, explain: 'Een traag, gesalt algoritme maakt massaal kraken onbetaalbaar traag en breekt rainbow tables.' },
        { q: 'Ik heb alle zeven vlaggen verzameld en rond de opdracht ethisch en reproduceerbaar af. 🏆', noAnswer: true },
      ],
    },
  ],
});
