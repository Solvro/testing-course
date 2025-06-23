# Mockowanie przy użyciu MSW

W tym rozdziale kursu nauczysz się, jak używać Mock Service Worker (MSW) do mockowania zapytań HTTP w aplikacjach React. MSW pozwala na symulowanie odpowiedzi serwera, co jest przydatne podczas testowania komponentów, które wykonują zapytania do API.

Do wykonania jest 1 część kursu, która została podlinkowana poniżej.

Po wykonaniu wszystkich części należy wykonać zadanie końcowe.

## Części kursu

1. [Mockowanie API](https://drive.google.com/drive/folders/1zcRfqxDEg5w3W-yO4aO4jwyV9EyFf4uQ?usp=drive_link)

## Zadania końcowe

1. Zsetupuj Mock Service Worker (MSW) w tym w projekcie.
2. Przetestuj komponent `SolvroProjectsComboboxApi` z `2a. React/2. Mocking/src/components/solvro-projects-combobox-api.tsx`. Testy napisz wedle uznania - musi być minimalnie 1 test, który renderuje ten komponent i używa ZAMOCKOWANEGO zapytania do API, żeby zaliczyć zadanie. Testy napisz w pliku `2a. React/2. Mocking/src/components/solvro-projects-combobox-api.test.tsx`. Zalecam uruchomić aplikację i poklikać samemu jak to działa - API zwraca błąd w 30% przypadków, żebyście zobaczyli error handling.

Instrukcja jak uruchomić aplikację jest na końcu tego pliku.

Dodatkowo pamiętaj o zrobienu review PR'ki partnera z poprzedniego zadania - jest to wymagane do zaliczenia zadania.

### Oddanie zadania

Aby oddać zadanie, należy wykonać pull requesta do tego repozytorium, po czym oznaczacie przypisaną wam osobę do review. Format PR'a powinien być następujący:

- branch: `imie-nazwisko/5-react-mocks`, np. `bartosz-gotowski/5-react-mocks`
- tytuł: `Imię Nazwisko - Etap 5, React Mocking`, np. `Bartosz Gotowski - Etap 5, React Mocking`

PR powinien zawierać jedynie obecnie oddawane zadanie!!! Uważajcie, żeby przypadkiem przypadkiem nie dodać poprzednich zadań. Zacznijcie brancha na świeżo z `main`a, żeby nie było problemów.

### Jak odpalić aplikacje?

1. Sklonuj repozytorium.

   ```sh
   git clone git@github.com:Solvro/testing-course.git
   ```

1. Przejdź do katalogu z zadaniami.

   ```sh
   cd testing-course/2a.\ React/2.\ Mocking
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
