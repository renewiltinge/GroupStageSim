# 🥷 JVT Cyber Dojo

Een **doelgericht, Nederlandstalig leerportaal voor cybersecurity** — in de stijl van TryHackMe, maar helemaal van jou. Korte uitleg, veel oefenen in **echte interactieve browser-labs**, en oefenvragen met **vlaggen** (flags) om te vinden. Van de absolute basis tot je eerste hacks én verdedigingen.

> **Geen installatie nodig.** Het is één statische website (HTML + CSS + JavaScript, zonder build-stap of server). Je opent `index.html` in je browser, of je zet het online via GitHub Pages.

---

## 🚀 Snel starten

**Optie A — lokaal openen**
Dubbelklik `index.html`. Klaar. Alles werkt direct, ook je voortgang (die wordt lokaal in je browser bewaard).

**Optie B — online via GitHub Pages**
1. Ga in deze repo naar **Settings → Pages**.
2. Kies bij *Source*: **Deploy from a branch**, branch **main** (of de branch waar dit op staat), map **/ (root)**.
3. Na een minuutje staat je Dojo op `https://<jouw-gebruikersnaam>.github.io/<repo-naam>/`.

**Optie C — lokale webserver** (handig tijdens het ontwikkelen)
```bash
python3 -m http.server 8000
# open daarna http://localhost:8000
```

**Optie D — één bestand** 
In [`dist/jvt-cyber-dojo.html`](dist/jvt-cyber-dojo.html) staat het hele portaal (alle lessen, labs en opmaak) in één bestand. Handig om te mailen, op een USB-stick te zetten of offline te openen. Opnieuw genereren na een wijziging: `node tools/build-artifact.js`.

---

## 🎓 Wat ga je leren?

Het portaal is opgebouwd uit **leerpaden**. Volg ze van boven naar beneden; elke room bouwt voort op de vorige.

### 🧱 Fundamenten
De basis die alles draagt.
1. **Welkom in cybersecurity** — CIA-triade, soorten aanvallers, ethiek en de wet (art. 138ab Sr).
2. **Netwerken: de basis** — IP/MAC, OSI-model, TCP/UDP, poorten.
3. **IP-adressen en subnetting** — subnetten rekenen, met een interactieve calculator.
4. **Hoe het web werkt** — DNS, HTTP(S), cookies.
5. **Linux: de basis** — de terminal, bestanden, rechten.
6. **Windows en Active Directory: de basis** — PowerShell, accounts, logs.

### 🔐 Security-kern
De bouwstenen van beveiliging.
1. **Cryptografie** — coderen vs. versleutelen vs. hashen (met CyberChef).
2. **Wachtwoorden en authenticatie** — sterke wachtwoorden, hashes kraken, MFA & passkeys.
3. **Social engineering & phishing** — de menselijke factor, met een phishing-inbox om te oefenen.
4. **Kwetsbaarheden & CVSS** — van CVE tot patch, met een interactieve CVSS-calculator, EPSS en de KEV-catalogus.

### ⚔️ Offensief (red team)
Denken als een aanvaller — altijd in een veilig lab.
1. **OWASP Top 10** — de tien grootste webrisico's (editie 2025).
2. **Verkenning & scannen** — reconnaissance en nmap.
3. **Webhacking: SQL-injectie** — kwetsbaarheden zelf uitbuiten.

### 🛡️ Defensief (blue team)
Denken als een verdediger.
1. **Logs & detectie** — aanvallen terugvinden in logbestanden.
2. **Incident response** — reageren volgens het NIST-framework (CSF 2.0).
3. **Veilig thuis & op het werk** — updates, back-ups, hardening.
4. **Threat intelligence & MITRE ATT&CK** — IOC's, de Pyramid of Pain, TLP en het ATT&CK-model.
5. **Detectie-engineering** — detectieregels bouwen met regex, Sigma en YARA.

### 🕵️ Digitale forensie & opsporing
De weg naar digitaal rechercheur — sporen vinden, veiligstellen en duiden.
1. **Digitaal rechercheur worden** — wat forensie is, de rollen en de wet.
2. **Bewijs veiligstellen** — chain of custody, imaging en hashing.
3. **Schijf- en bestandssysteemforensie** — verwijderde bestanden, file carving.
4. **Geheugenforensie** — wat het RAM verraadt.
5. **Netwerkforensie** — het verhaal in het verkeer (met pcap-lab).
6. **Forensische Windows-artefacten** — prefetch, registry, event logs.
7. **Mobiele en cloud-forensie** — telefoons en clouddiensten.
8. **OSINT: opsporen met open bronnen** — veilig en gestructureerd zoeken.
9. **Malware-analyse: de basis** — statisch en dynamisch, altijd in een lab.
10. **Tijdlijnanalyse** — van tijdstempel tot super-timeline.
11. **Forensie-CTF: Zaak Zilverlab** — een volledig onderzoek als oefening.
12. **Verder leren** — boeken, tools en platforms.

### 🏁 Eindopdracht
1. **Mini-CTF: Operatie KoffieKlap** — breng alles samen in een afsluitende Capture The Flag met zes vlaggen.

---

## 🧪 De interactieve labs

Alle labs draaien **volledig in je browser** — veilig, offline, zonder dat er echt iets wordt aangevallen:

| Lab | Wat je ermee oefent |
|-----|---------------------|
| 🖥️ **Terminal** | Een nagebootste Linux-shell (en PowerShell) met een echt bestandssysteem, `ls/cat/grep/find/base64/...` en pipes. |
| 🧪 **CyberChef** | Coderen, decoderen en hashen (Base64, hex, ROT13, XOR, MD5/SHA-…), met een recept dat je zelf opbouwt. |
| 🔓 **Hash-kraker** | Een woordenlijstaanval nabootsen op een echte hash. |
| 🔑 **Wachtwoord-analyse** | Live de sterkte en kraaktijd van een wachtwoord zien. |
| 🎣 **Phishing-inbox** | Rode vlaggen zoeken in nep-e-mails. |
| 📊 **Logviewer** | Logbestanden filteren (tekst én regex) om een aanval te vinden. |
| 🌐 **HTTP-client** | Verzoeken sturen naar een nepserver en kwetsbaarheden vinden. |
| 💉 **SQL-injectie** | Een kwetsbaar loginformulier echt uitbuiten — en de fix zien werken. |
| 🧮 **Subnet-calculator** | Subnetten uitrekenen en oefenvragen genereren. |
| 🔢 **Hex-viewer** | Rauwe bytes lezen: magic bytes herkennen en verstopte strings vinden. |
| 📡 **Pakketanalyse** | Netwerkverkeer lezen (Wireshark-light) en een spoor volgen in de stream. |
| 🎫 **JWT-inspecteur** | JSON Web Tokens decoderen, de claims lezen en een HS256-handtekening controleren. |
| 🔤 **Regex-tester** | Reguliere expressies live testen met markering en capture-groepen. |
| 🩹 **CVSS-calculator** | De basisscore (v3.1) van een kwetsbaarheid uitrekenen uit de vector. |
| 🕰️ **Tijdstempel-omrekenaar** | Unix, FILETIME, WebKit en Cocoa-tijd omzetten naar een leesbare datum. |
| 🧾 **IOC-extractor** | Indicatoren (IP's, domeinen, hashes, CVE's) uit vrije tekst halen en defangen. |
| 🔗 **URL-ontleder** | Een link ontleden en phishing-rode-vlaggen zichtbaar maken. |
| 🧬 **YARA-lab** | Detectieregels schrijven en op voorbeeldbestanden testen. |
| ⏳ **Super-timeline** | Gebeurtenissen uit vele bronnen op één tijdlijn filteren en markeren. |
| 🔐 **chmod & getallen** | Linux-rechten en getalstelsels (hex/binair/octaal) omrekenen. |

Alle tools zijn ook los te gebruiken via de **🧰 Gereedschapskist** (knop op de startpagina, of `#/tools`) — handig voor je eigen, ethische oefeningen.

Je verdient **XP** en **badges**, en je voortgang wordt per vraag bewaard (lokaal, in `localStorage`).

---

## ⚖️ Ethiek — lees dit

Dit portaal leert aanvalstechnieken **uitsluitend** om je te leren verdedigen en om legaal, bevoegd beveiligingswerk te doen.

> **Oefen aanvalstechnieken alleen op je eigen systemen of met schriftelijke toestemming.** In Nederland is ongeautoriseerd binnendringen strafbaar (computervredebreuk, art. 138ab Sr). Vind je een kwetsbaarheid in andermans systeem? Meld het netjes (coordinated vulnerability disclosure), bijvoorbeeld via het [NCSC](https://www.ncsc.nl/).

Alle scenario's, bedrijven en IP-adressen in dit portaal zijn **fictief**.

---

## 🛠️ Zelf content toevoegen of aanpassen

Elke room is één bestand in [`content/rooms/`](content/rooms/). De volledige handleiding staat in **[`docs/CONTENT-SPEC.md`](docs/CONTENT-SPEC.md)**: hoe je een room schrijft, welke vraagtypes er zijn, en hoe je elk labtype configureert.

Werkwijze:
1. Maak `content/rooms/<mijn-room>.js` (kopieer een bestaande room als voorbeeld).
2. Controleer het: `node tools/validate.js content/rooms/<mijn-room>.js`
3. Werk de scriptlijst in `index.html` bij: `node tools/build.js`
4. (Optioneel) test in een echte browser: `node tools/smoke.js` en `node tools/labtest.js`

### Hulpscripts
| Script | Doel |
|--------|------|
| `node tools/validate.js [bestand…]` | Controleert rooms op structuur, vragen, vlaggen en labs. Rekent hashes na. |
| `node tools/build.js` | Zet alle rooms (gesorteerd op leerpad + volgorde) in `index.html`. |
| `node tools/build-artifact.js` | Bouwt de losse versie `dist/jvt-cyber-dojo.html` (alles in één bestand). |
| `node tools/smoke.js` | Laadt het portaal in een headless browser en controleert dat alles rendert. |
| `node tools/labtest.js` + `labtest-extra.js` | Bedienen de labs echt en controleren de uitkomsten. |

*(De testscripts gebruiken Node + Playwright; de validator en build werken met alleen Node.)*

---

## 📁 Structuur

```
index.html              # het portaal (start hier)
assets/
  css/style.css         # thema (licht/donker) en opmaak
  js/app.js             # engine: routering, voortgang, XP, badges, zoeken
  js/labs.js            # alle interactieve labs + crypto-helpers
content/
  rooms/*.js            # de lesinhoud (één bestand per room)
docs/CONTENT-SPEC.md    # handleiding om content te schrijven
tools/                  # validate / build / smoke / labtest
```

---

*Veel plezier, en blijf nieuwsgierig — op de goede manier. 🥷*
