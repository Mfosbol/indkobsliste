# Indkøbsliste – Obligatorisk opgave 1 og 2 (INNT)

Simpel React Native (Expo) indkøbsapp, bygget med teknikker fra CBS-INNT-26 kursusrepos (komponenter, navigation, lister og styling).

## Sådan kører du appen

```bash
cd indkobsliste
npm install
npx expo start
```

Scan QR-koden med Expo Go (telefon), eller tryk `i` for iOS Simulator / `a` for Android.

## Demovideo

- Opgave 2: [Link til demovideo](https://www.youtube.com/shorts/Fth7B_X9eR4)
- Opgave 1: [Link til demovideo](https://youtube.com/shorts/LXZMMAtkUMk?feature=share)

Stregkodescanneren kræver en fysisk telefon med kamera (Expo Go). I simulatoren kan stregkoden skrives manuelt.

## Funktioner

- **Liste:** Startskærm med kategoriseret indkøbsliste
- **Tilføj:** Tilføj vare med antal og kategori
- **Ofte købt:** Genbrug varer du ofte markerer som købt
- **Scan (nyt i opgave 2):** Scan stregkoden på en vare med kameraet. Varen slås op i [Open Food Facts](https://world.openfoodfacts.org), kategorien foreslås automatisk, og varen lægges på listen med ét tryk. Ukendte stregkoder kan navngives én gang, og appen husker dem næste gang.

## Nyt i opgave 2

| Krav | Løsning |
|------|---------|
| 1 ny screen + navigation | `screens/ScannerScreen.js`, ny fane "Scan" i tab-navigationen |
| 1–2 nye knapper | "Giv adgang til kamera", "Tilføj og scan næste", "Tilføj og gå til listen", "Annuller og scan igen", "Slå op", lommelygte-knap til scanning i mørke |
| Ny funktionalitet | Stregkodescanning med kameraet (`expo-camera`) + opslag i et eksternt API (`services/openFoodFacts.js`) |
| Gemme/hente data | Online API (Open Food Facts) + AsyncStorage: indkøbslisten, "Ofte købt" og scannede stregkoder huskes efter appen lukkes (`context/ShoppingContext.js`) |
| Styling i separat fil | `styles/GlobalStyle.js` |

## Opgavekrav dækket

| Krav | Løsning |
|------|---------|
| Min. 3 views / 3 screens | Liste, Tilføj, Ofte købt |
| Min. 2 knapper (én med funktion) | Flere knapper – bl.a. navigation og “Ryd købte varer” |
| Min. 1 liste | `SectionList` / `FlatList` |
| Styling i separat fil | `styles/GlobalStyle.js` |
| README med demovideo | Dette dokument |

## Mappestruktur (inspireret af kursuskode)

```
indkobsliste/
├── App.js                 # Bottom tab navigation (Liste først)
├── components/
├── context/
├── data/
├── screens/               # Liste, Tilføj, Ofte købt, Scan
├── services/              # Opslag i Open Food Facts
└── styles/GlobalStyle.js
```

## Kursusreferencer

Appen følger mønstre fra:

- [01_komponenter_code_26](https://github.com/CBS-INNT-26/01_komponenter_code_26)
- [02_navigation_code_26](https://github.com/CBS-INNT-26/02_navigation_code_26)
- [03_lister_code_26](https://github.com/CBS-INNT-26/03_lister_code_26)
- [04_Styling_code](https://github.com/CBS-INNT-26/04_Styling_code)
