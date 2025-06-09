// Kod łamiący regułę
// TUTAJ

// this code violates elsint rules. Uncomment it to check
// function greetIncorrect(
//   name,
// ) {
//   console.log(
//     "Hello, " +
//       name,
//   );
//   if (
//     name == "Admin"
//   )
//     return "Welcome Admin";

//   return "Hi";
// }

// const getUserIncorrect =
//   () => {
//     return {
//       id: 1,
//       name: "test",
//     };
//   };

// Kod, który jest zgodny z regułą
// TUTAJ

function greetCorrect(
  name: string,
): string {
  if (
    name === "Admin"
  ) {
    return "Welcome Admin";
  }
  return "Hi";
}

const getUserCorrect =
  (): {
    id: number;
    name: string;
  } => {
    return {
      id: 1,
      name: "Test",
    };
  };
