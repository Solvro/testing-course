# Testowanie E2E

Wow, jesteśmy już na finiszu - to jest przedostatnie zadanie, które dostaniecie w tym kursie. Polega ono na przetestowaniu tej samej aplikacji co ostatnio, ale przy użyciu Playwrighta.

## Części kursu

Niestety kurs nie zawierał części dotyczącej E2E, dlatego podlinkowuje materiał, który IMO jest nawet niezły i powinien wystarczyć do wykonania tego zadania:

- <https://www.youtube.com/watch?v=3NW0Mz943_E>

Bonusowe materiały dla dociekliwych:

- Dokumencik przygotowany przeze mnie i pare LLM'ów z najważniejszymi informacjami: [How-to-test-e2e.md](./How-to-test-e2e.md)
- Też dobry artykul, który porusza wszystko co ważne: <https://jonasclaes.be/from-zero-to-hero-playwright-web-automation/#pro-tips-and-best-practices>

## Zadania końcowe

1. Zainstalujcie i zsetupujcie Playwrighta w tej aplikacji, bez Github Actions - polecam filmik wyżej i [dokumentację Playwrighta](https://playwright.dev/docs/intro)
1. Przetestujcie najważniejsze funkcjonalności aplikacji przy użyciu Playwrighta, co najmniej logowanie

   Trzymam kciuki, że poradzicie sobie z dostaniem się do kodu OTP, może być trochę zabawy:3 - w razie problemów piszcie na Discord.

Wymagane do zaliczenia zadania jest:

- stworzenie minimum jednego testu, który zaloguje się do aplikacji
- przechodzące testy na Github Actions

Instrukcja jak uruchomić aplikację jest na końcu tego pliku.

Dodatkowo pamiętaj o zrobienu review PR'ki partnera z poprzedniego zadania - jest to wymagane do zaliczenia zadania.

### Oddanie zadania

Aby oddać zadanie, należy wykonać pull requesta do tego repozytorium, po czym oznaczacie przypisaną wam osobę do review. Format PR'a powinien być następujący:

- branch: `imie-nazwisko/7-e2e-testing`, np. `bartosz-gotowski/7-e2e-testing`
- tytuł: `Imię Nazwisko - Etap 7, E2E Testing`, np. `Bartosz Gotowski - Etap 7, E2E Testing`

PR powinien zawierać jedynie obecnie oddawane zadanie!!! Uważajcie, żeby przypadkiem przypadkiem nie dodać poprzednich zadań. Zacznijcie brancha na świeżo z `main`a, żeby nie było problemów.

### Jak odpalić aplikacje?

1. Sklonuj repozytorium.

   ```sh
   git clone git@github.com:Solvro/testing-course.git
   ```

1. Przejdź do katalogu z zadaniami.

   ```sh
   cd testing-course/3.\ E2E\ testing
   ```

1. Zainstaluj zależności

   ```sh
   npm install
   ```

1. Uruchom aplikację

   ```sh
   npm run dev
   ```

1. Otwórz przeglądarkę i przejdź do adresu `http://localhost:5173/`.
