# Podstawy mockowania

W ramach tego rozdziału kursu przejdziemy przez podstawowe zagadnienia związane z mockowaniem w testach jednostkowych. Omówimy, dlaczego mocki są ważne, jakie są ich rodzaje oraz jak pisać dobre mocki.

Do wykonania jest 1 część kursu, która została podlinkowana poniżej.

Po wykonaniu wszystkich części należy napisać test do wybranych funkcji (minimum 1) z przypisanego zadania końcowego.

## Części kursu

1. [Mockowanie](https://drive.google.com/drive/folders/1-C_pF9MM_6uknDpgSnPNFbwXppMEt2Vw?usp=drive_link)

## Zadania końcowe

Napisz test do wybranych funkcji (minimum 1) z przypisanego zadania końcowego. Plz nie używajcie AI 😭 - to proste zadanko, zajmie wam chwilę.

1. [Zadanie 1](./Task%2001%20-%20Course%20registration/) - rejestracja na kurs
2. [Zadanie 2](./Task%2002%20-%20Exam%20conflicts/) - konflikty egzaminów
3. [Zadanie 3](./Task%2003%20-%20Supervisor%20Manager/) - menedżer promotorów

### Oddanie zadania

Aby oddać zadanie, należy wykonać pull requesta do tego repozytorium, po czym oznaczacie przypisaną wam osobę do review. Format PR'a powinien być następujący:

- branch: `imie-nazwisko/2-mocks`, np. `bartosz-gotowski/2-mocks`
- tytuł: `Imię Nazwisko - Etap 2, Mocki, zadanie nr X`, np. `Bartosz Gotowski - Etap 2, Mocki, zadanie nr 1`

PR powinien zawierać jedynie obecnie oddawane zadanie!!! Uważajcie, żeby przypadkiem przypadkiem nie dodać poprzednich zadań. Zacznijcie brancha na świeżo z `main`a, żeby nie było problemów.

### Jak odpalić testy?

1. Sklonuj repozytorium.

   ```sh
   git clone git@github.com:Solvro/testing-course.git
   ```

1. Przejdź do katalogu z zadaniami.

   ```sh
   cd testing-course/1.\ Unit\ testing/
   ```

1. Zainstaluj zależności

   ```sh
   npm install
   ```

1. Uruchom testy

   ```sh
   npm test
   ```
