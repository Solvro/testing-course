// Kod łamiący regułę
for (let i = 0; i < 10; i++) {
  console.log("Current date:", new Date());
  break;
}
// Kod, który jest zgodny z regułą
for (let i = 0; i < 10; i++) {
  if (new Date().getSeconds() % 10 === i) {
    console.log("Current second ends with", i);
    break;
  }
}
