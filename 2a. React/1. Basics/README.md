# Testowanie komponentów React

W ramach tego rozdziału kursu przejdziemy przez podstawowe zagadnienia związane z testowaniem komponentów React. Omówimy jak renderować komponenty oraz jak testować ich interakcje.

Do wykonania jest 1 część kursu, która została podlinkowana poniżej.

Po wykonaniu wszystkich części należy wykonać zadanie końcowe.

## Części kursu

1. [Wstęp do kursu](https://drive.google.com/drive/folders/1JyEjuLNl9i2VFkXc0YsnZyOI0EKkspLs?usp=drive_link)
1. [Podstawy testowania komponentów React](https://drive.google.com/drive/folders/1vvu2F3Bx2RWB8f5gXYklB0Idcc5BLZWU?usp=drive_link)

## Zadania końcowe

1. Zsetupuj środowisko do testowania komponentów React. Skrypty w package.json są już przygotowane.
2. Przetestuj komponent `SolvroProjectsCombobox` z `2a. React/src/components/solvro-projects-combobox.tsx`. Testy napisz wedle uznania - musi być minimalnie 1 test, który renderuje ten komponent, żeby zaliczyć zadanie. Testy napisz w pliku `2a. React/1. Basics/solvro-projects-combobox.test.ts`.

Instrukcja jak uruchomić aplikację jest na końcu tego pliku.

Dodatkowo pamiętaj o zrobienu review PR'ki partnera z poprzedniego zadania - jest to wymagane do zaliczenia zadania.

### Oddanie zadania

Aby oddać zadanie, należy wykonać pull requesta do tego repozytorium, po czym oznaczacie przypisaną wam osobę do review. Format PR'a powinien być następujący:

- branch: `imie-nazwisko/4-react-basics`, np. `bartosz-gotowski/4-react-basics`
- tytuł: `Imię Nazwisko - Etap 4, React Basics`, np. `Bartosz Gotowski - Etap 4, React Basics`

PR powinien zawierać jedynie obecnie oddawane zadanie!!! Uważajcie, żeby przypadkiem przypadkiem nie dodać poprzednich zadań. Zacznijcie brancha na świeżo z `main`a, żeby nie było problemów.

### Jak odpalić aplikacje?

1. Sklonuj repozytorium.

   ```sh
   git clone git@github.com:Solvro/testing-course.git
   ```

1. Przejdź do katalogu z zadaniami.

   ```sh
   cd testing-course/2a.\ React/
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
