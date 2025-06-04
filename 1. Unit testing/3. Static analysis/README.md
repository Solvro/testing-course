# Stwórz swój @solvro/config

**OPCJONALNA** część kursu, która wprowadza w temat statycznej analizy kodu. Dowiesz się jak skonfigurować ESLint i Prettier, żeby poprawić jakość swojego kodu.

Nie musisz jej robić, ale zachęcam zainteresowanych, sam też będę zerkał na pr'ki z tym zadankiem, żeby coś podpowiedzieć.

## Części kursu

- [Statyczna analiza kodu](https://drive.google.com/drive/folders/1PBNYXeO3DjcfDJdLjJNCDuriwcPSpStH?usp=drive_link)

### WAŻNE

Niestety kurs nie jest do końca aktualny i przedstawia stary sposób konfiguracji eslinta. Obecny nazywa się "flat config" i opiera się na pliku `eslint.config.js` (a nie jak w kursie `.eslintrc.json`). Żeby zdobyć wiedzę jak obecnie wygląda konfiguracja, zerknijcie na [dokumentację ESLint](https://eslint.org/docs/latest/use/getting-started).

## Zadanie końcowe

Te zadanie jest trochę inne od innych, twoim celem jest tutaj:

- Stworzenie własnego configu prettiera - minimum 1 customowa reguła, np. semi, line-width, tab-width, etc.
  - Zformatuj wszystkie pliki, tak żeby było widać, że reguła działa
- Stworzenie własnego configu eslint - minimum 1 własna reguła (np. no-console, @typescript-eslint/strict-boolean-expressions, etc.)
  - zacznij od `npm init @eslint/config@latest`
  - dodaj swoją regułę do pliku `eslint.config.js` - tutaj jest lista dostępnych reguł: [Lista reguł ESLint](https://eslint.org/docs/latest/rules/), [Lista reguł TypeScript ESLint](https://typescript-eslint.io/rules/)
  - podaj przykładowy kod, który łamie tę regułę i poprawiony kod, który jest zgodny z tą regułą w pliku [./test.ts](./test.ts)

Dla ambitnych:

- Dodaj formatowania przy commicie
- Dodaj test lintu przy pushu

Dla bardzo ambitnych:

- Dodaj formatowanie i lintowanie do Github Actions

### Oddanie zadania

Aby oddać zadanie, należy wykonać pull requesta do tego repozytorium, po czym oznaczacie przypisaną wam osobę do review. Format PR'a powinien być następujący:

- branch: `imie-nazwisko/3-static-analysis`, np. `bartosz-gotowski/3-static-analysis`
- tytuł: `Imię Nazwisko - Etap 3, Statyczna analiza kodu, zadanie nr X`, np. `Bartosz Gotowski - Etap 3, Statyczna analiza kodu, zadanie nr 1`

PR powinien zawierać jedynie obecnie oddawane zadanie!!! Uważajcie, żeby przypadkiem przypadkiem nie dodać poprzednich zadań. Zacznijcie brancha na świeżo z `main`a, żeby nie było problemów.
