# Stwórz swój @solvro/config

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
