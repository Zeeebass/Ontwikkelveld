---
name: Ontwikkelveld
description: Een geannoteerd coachwedstrijdvel voor persoonlijke voetbalontwikkeling.
colors:
  ink: "#101a15"
  ink-raised: "#18271f"
  ink-soft: "#24382d"
  pitch: "#165f38"
  green: "#35d179"
  green-dark: "#087942"
  chalk: "#f4f0e4"
  paper: "#fbf9f1"
  paper-deep: "#ebe6d7"
  line: "#d8d2c1"
  muted: "#625f54"
  field-white: "#ffffff"
  signal-yellow: "#f1c84b"
  danger-red: "#c94a45"
  danger-red-soft: "#f9e8e4"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2.6rem, 5vw, 4.9rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.45rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Source Sans 3 Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Source Sans 3 Variable, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.08em"
  score:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.1rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.025em"
rounded:
  compact: "7px"
  field: "9px"
  control: "10px"
  surface: "14px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "6px"
  sm: "10px"
  md: "18px"
  lg: "26px"
  xl: "36px"
  section: "68px"
components:
  button-primary:
    backgroundColor: "{colors.green-dark}"
    textColor: "{colors.field-white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 17px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#056237"
    textColor: "{colors.field-white}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 17px"
    height: "44px"
  input:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    height: "46px"
  nav-active:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "48px"
  status-current:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 9px"
  growth-value:
    backgroundColor: "transparent"
    textColor: "{colors.green-dark}"
    typography: "{typography.score}"
  annotated-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "26px"
---

# Design System: Ontwikkelveld

## Overview

**Creative North Star: "The Analyst's Annotated Match Sheet"**

Ontwikkelveld voelt als het wedstrijdvel waarop een trainer patronen aanwijst, groei noteert en de volgende actie klaarzet. Donker inktgroen geeft richting en autoriteit; warm krijtpapier houdt de werkomgeving menselijk; dunne regels, veldgeometrie en compacte scoretypografie maken de interface tactisch zonder decoratief voetbaltheater.

De density is bewust geaard (grounded index 6): royaal rond het ene belangrijke periode- of groeisignaal, compact waar een coach lijsten scant of corrigeert. Het systeem weigert een generiek SaaS-dashboard, competitie-esthetiek en glanzende gamification; Groeiwaarde blijft een persoonlijk ontwikkelsignaal, nooit een ranglijst.

**Key Characteristics:**

- Een donkere coachrail naast een ruim, warm papieren speelvlak.
- Condensed scoretypografie voor koppen, bedragen en periodegetallen.
- Haarlijndunne tactische regels en veldcirkels in plaats van decoratieve kaartenstapels.
- Veldgroen voor voortgang en acties; geel alleen voor betekenisvolle status en focus.
- Eén duidelijke volgende ontwikkelactie per werkcontext.

## Colors

De palette combineert bijna-zwarte groene inkt, echt veldgroen en kalkachtig papier; statuskleuren blijven zeldzaam en betekenisdragend.

### Primary

- **Coach Ink** (#101a15): bepaalt de zijrail, scoreboards, sterke headers en structurele contrastvlakken.
- **Action Green** (#35d179): markeert actieve navigatie, groei op donkere vlakken en belangrijke progressiesignalen.
- **Deep Action Green** (#087942): draagt primaire acties, links, focus in velden en Groeiwaarde op lichte grond.

### Secondary

- **Pitch Green** (#165f38): ondersteunt veldassociaties in illustratieve of tactische grondvlakken; het concurreert niet met primaire acties.

### Tertiary

- **Signal Yellow** (#f1c84b): verschijnt alleen wanneer de interface toestand moet communiceren: huidige periode, toetsenbordfocus, selectie of een kleine beheerindicator.
- **Correction Red** (#c94a45): is uitsluitend voor fouten, destructieve acties en inactieve toestand.
- **Soft Correction Red** (#f9e8e4): maakt fout- en inactiefsignalen leesbaar zonder alarmistische vlakken.

### Neutral

- **Warm Chalk** (#f4f0e4): vormt de iets duidelijkere werksheet en lichte tekst op inktvlakken.
- **Match Paper** (#fbf9f1): is het warme hoofdcanvas van elke applicatiepagina.
- **Deep Match Paper** (#ebe6d7): scheidt formulieren en rustige subvlakken zonder kaartenschaduw.
- **Tactical Rule** (#d8d2c1): tekent rijverdelingen en secundaire haarlijnen.
- **Pencil Note** (#625f54): draagt uitleg, metadata en secundaire labels.
- **Raised Ink** (#18271f): levert een subtiel donker niveau boven Coach Ink.
- **Soft Ink** (#24382d): vult avatars en kleine secundaire vlakken binnen de inktwereld.
- **Field White** (#ffffff): blijft beperkt tot invoervelden en wit-op-groen actietekst.

**The Yellow Means State Rule.** Geel is nooit een algemene accentkleur; elk geel element moet een concrete status, selectie of focusbetekenis hebben.

**The Paper Is the Canvas Rule.** Laat het warme papier zichtbaar tussen onderdelen; vul het scherm niet met losse witte kaarten.

## Typography

**Display Font:** Barlow Condensed (with sans-serif fallback)

**Body Font:** Source Sans 3 Variable (with sans-serif fallback)

**Label/Mono Font:** Source Sans 3 Variable (with sans-serif fallback)

De systeem-monospace stack verschijnt alleen voor login- en credentialwaarden.

**Character:** De smalle Barlow-vormen geven cijfers en koppen de directheid van een scorebord of analysetabel. Source Sans 3 houdt coachingtekst, formulieren en uitleg rustig en helder naast die compactheid.

### Hierarchy

- **Display** (600, vloeiend van 2.6rem tot 4.9rem, regelhoogte 0.98): paginatitels en de grote loginboodschap; paginatitels staan in kapitalen.
- **Headline** (600, vloeiend van 1.7rem tot 2.45rem, regelhoogte 0.98): sectiekoppen en statusmodules.
- **Title** (600, 1.35rem, regelhoogte 0.98): kaart- en rijtitels; lijsten gebruiken waar nodig een lokale verhoging tot 1.55rem.
- **Body** (400, 1rem, regelhoogte 1.5): uitleg, coachingtekst en formulieren; lange antwoorden blijven ongeveer 65–74ch breed.
- **Label** (700, 0.78rem, letterafstand 0.08em): tabelkoppen en tactische metadata, meestal in kapitalen.
- **Score** (700, vloeiend van 2rem tot 3.1rem, regelhoogte 0.9): Groeiwaarde; de grote variant loopt door tot 5.8rem en gebruikt tabulaire cijfers.

**The Scoreboard Contrast Rule.** Gebruik condensed type voor grote signalen en namen, niet voor lopende uitleg; de spanning met de open bodyfont is onderdeel van de identiteit.

**The Numbers Stay Still Rule.** Groeiwaarde, ordenummers en credentials gebruiken tabulaire of monospace cijfers zodat correcties niet visueel verspringen.

## Layout

Op desktop staat een vaste rail van 246px links van een papierachtig werkvlak. Pagina's blijven gecentreerd tot 1220px en gebruiken een ruime rand van 52px boven, 46px horizontaal en 92px onder; een subtiele horizontale regel om de 48px geeft het vlak het ritme van een analysesheet. Headers sluiten af met één donkere haarlijn en zetten de primaire actie rechts.

De content volgt een ritme van ongeveer 18–36px binnen componenten en 68–78px tussen hoofdsecties. Tabellen en beheerlijsten gebruiken kolommen en rijregels in plaats van een verzameling losstaande kaarten. De eerste viewport reserveert de meeste ruimte voor één groot periode- of groeisignaal en de actie die daarop volgt.

Onder 900px verdwijnt de zijrail en nemen een vaste bovenbalk en ondernavigatie het over. Onder 700px stapelen scoreboards, formulieren, media en beheerpanelen naar één kolom; onder 430px worden secundaire rijacties en niet-essentiële kolommen verder teruggenomen. Het systeem blijft bruikbaar vanaf 320px en houdt acties minimaal 44px hoog.

**The One Playing Surface Rule.** Een pagina is één doorlopend speelvlak met regels en secties; alleen informatie met een eigen toestand of interactie krijgt een omkaderde container.

## Elevation & Depth

Het systeem is vlak en structureel. Diepte ontstaat door donker-op-licht tonale lagen, dunne inktregels, licht verschillende papierwaarden en incidentele cirkelgeometrie. Er zijn geen algemene kaartschaduwen; de enige donkere slagschaduw ondersteunt kleine veldmarkeringen, terwijl focus een gekleurde ring gebruikt. Pagina- en editortransities zijn kort en richtinggevend, en worden vrijwel uitgeschakeld bij `prefers-reduced-motion`.

### Shadow Vocabulary

- **Field Marker** (`0 8px 24px rgba(0,0,0,.32)`): uitsluitend onder de kleine tactische spelersmarkeringen op het loginveld.
- **Field Focus** (`0 0 0 3px rgba(8,121,66,.16)`): rondom een actief invoerveld, samen met een donkergroene rand.

**The Flat-by-Default Rule.** Voeg geen ambient kaartschaduwen toe; hiërarchie komt uit veldkleur, regels, schaal en tussenruimte.

## Shapes

De vormtaal is precies maar niet hard: grote werkvlakken gebruiken 14px hoeken, gewone controls 10px en velden 9px. Compacte media-controls mogen 7px gebruiken. Volledig ronde vormen zijn gereserveerd voor avatars, icon-only acties, statuspunten en echte veldgeometrie; statuslabels zijn capsules.

Randen zijn doorgaans één inkt- of linenkleurige pixel. Stippellijnen horen bij lege toestanden of tactische looplijnen, niet bij gewone containers. Grote decoratieve cirkels worden afgesneden door een vlak en blijven dun, zodat ze als veldannotatie lezen.

**The Tactical Geometry Rule.** Iedere cirkel, lijn of capsule moet een veld-, status- of interactiefunctie dragen; gebruik geometrie niet als willekeurig ornament.

## Components

### Buttons

Buttons voelen direct en coachend: stevig gewicht, bescheiden hoeken en geen glans.

- **Shape:** zacht rechthoekig (10px), minimaal 44px hoog, met 10px × 17px interne ruimte.
- **Primary:** Deep Action Green met witte tekst; hover wordt donkerder en tilt 1px op.
- **Hover / Focus:** kleur en rand reageren in 200ms; toetsenbordfocus gebruikt de globale gele 3px outline met 3px offset.
- **Secondary:** transparant met een warme grijze rand; hover gebruikt Paper Deep en een inktrand.
- **Text / Icon:** tekstacties zijn donkergroen en onderstreept; icon-only acties zijn 42px rond. Rood is alleen voor destructieve varianten.

### Chips

Statuscapsules zijn klein, feitelijk en nooit decoratief. De huidige periode gebruikt Signal Yellow; actieve en inactieve accounts gebruiken respectievelijk een zacht groen of zacht rood vlak met een statuspunt.

### Cards / Containers

Containers gedragen zich als delen van een match sheet: 14px hoeken, één inktrand en geen rustschaduw. Growth boards hebben een donkere labelkop en doorlopende rijregels. Editorpanelen gebruiken Chalk of Paper Deep, terwijl scoreboards en credentials naar Coach Ink schakelen. Interne ruimte ligt meestal tussen 23px en 36px.

### Inputs / Fields

Velden zijn wit op het warme papier, minimaal 46px hoog, met een 9px hoek en een rustige grijsbruine rand. Focus wisselt de rand naar Deep Action Green en voegt de Field Focus-ring toe. Fouten gebruiken Correction Red; labels blijven donker, duidelijk en boven het veld.

### Navigation

Desktopnavigatie leeft in de vaste donkere rail. Inactieve items zijn gedempt groen-grijs; hover maakt het vlak net lichter; het actieve item krijgt een vol Action Green vlak met Coach Ink tekst. Op mobiel wordt hetzelfde vocabulaire in een vaste onderbalk herhaald, met iconen boven compacte labels.

### Growth Value & Personal Scoreboard

Groeiwaarde is het signature signal: groot condensed type, tabulaire cijfers en Deep Action Green op papier of Action Green op Coach Ink. Het persoonlijke scoreboard combineert één groot bedrag met één periodevak, een dunne scheidingslijn en een afgesneden veldcirkel; nooit voegen als ranglijst of ratingbadge vormgeven.

### States & Annotated Content

Lege toestanden gebruiken een gestippelde omranding op transparant Chalk; fouten schakelen naar Correction Red; laden blijft visueel stil op de huidige ondergrond. Leeritems zijn door regels gescheiden en tonen hun toelichting direct, zonder verborgen antwoordinteractie. Media combineert een donker tactisch videovlak met een rustig tekstdeel en behoudt de 14px match-sheet contour.

## Do's and Don'ts

### Do:

- **Do** laat één groot periode- of groeisignaal de eerste viewport domineren.
- **Do** gebruik haarlijnen, rijstructuur en tussenruimte om verwante informatie te organiseren.
- **Do** zet de primaire, groene actie naast de titel of het leeritem waarop die actie werkt.
- **Do** behoud zichtbare focus, 44px aanraakdoelen, 320px ondersteuning en reduced-motion gedrag.
- **Do** schrijf Groeiwaarde altijd als persoonlijk progressiesignaal en ondersteun dat visueel zonder competitiehiërarchie.

### Don't:

- **Don't** verander Ontwikkelveld in een generiek SaaS-dashboard met zwevende witte kaarten, blauwe accenten of KPI-tegels.
- **Don't** gebruik geel als decoratie, merkaccent of gewone CTA-kleur.
- **Don't** voeg decoratieve kleurgradients, glans, zware schaduwen of nagebootste papiertextuur toe; subtiele lijn- en veldgrids blijven functioneel.
- **Don't** maak Groeiwaarde tot een badge, sterrenscore, podium of visuele ranglijst.
- **Don't** publiceer QA-screenshots of andere rasterbeelden als onderdeel van de interface; de productie-uitstraling is code-, type- en SVG-gedreven.
