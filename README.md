# Indkøbsliste – Obligatorisk opgave 1 (INNT)

Simpel React Native (Expo) indkøbsapp, bygget med teknikker fra CBS-INNT-26 kursusrepos (komponenter, navigation, lister og styling).

## Sådan kører du appen

```bash
cd indkobsliste
npm install
npx expo start
```

Scan QR-koden med Expo Go (telefon), eller tryk `i` for iOS Simulator / `a` for Android.

## Demovideo

[Link til demovideo](https://youtube.com/shorts/LXZMMAtkUMk?feature=share)

## Funktioner

- **Liste:** Startskærm med kategoriseret indkøbsliste
- **Tilføj:** Tilføj vare med antal og kategori
- **Ofte købt:** Genbrug varer du ofte markerer som købt

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
├── screens/               # Liste, Tilføj, Ofte købt
└── styles/GlobalStyle.js
```

## Kursusreferencer

Appen følger mønstre fra:

- [01_komponenter_code_26](https://github.com/CBS-INNT-26/01_komponenter_code_26)
- [02_navigation_code_26](https://github.com/CBS-INNT-26/02_navigation_code_26)
- [03_lister_code_26](https://github.com/CBS-INNT-26/03_lister_code_26)
- [04_Styling_code](https://github.com/CBS-INNT-26/04_Styling_code)
