import { Hono } from "https://deno.land/x/hono@v4.0.10/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.0.10/middleware.ts";

const app = new Hono();

const kv = await Deno.openKv();

// Definiujemy czas ważności OTP (np. 5 minut)
const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minut w milisekundach

/**
 * Generuje losowy 6-cyfrowy kod OTP.
 */
function generateOtp(): string {
  // Generuje losową liczbę z zakresu [100000, 999999]
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Middleware ---

// CORS Middleware
app.use(
  "*",
  cors({
    origin: "*", // Pozwala na żądania z dowolnego źródła dla celów deweloperskich
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Symulacja opóźnień i błędów
app.use("*", async (c, next) => {
  // Symuluje opóźnienie sieci (0 do 500ms)
  await new Promise((resolve) => setTimeout(resolve, 500 * Math.random()));

  return next();
});

// --- Główne endpointy API ---

app.get("/", (c) => {
  return c.json({
    message: "Solvro Mock API for OTP Login",
    version: "1.0.0",
    endpoints: {
      otp: {
        send: {
          post: "/user/otp/get",
          description:
            "Symuluje wysłanie kodu OTP na email. Dla testów zwraca wygenerowany OTP.",
          request: "{ email: string }",
          response:
            "{ success: true, message: 'OTP sent successfully', otp: '123456' }",
        },
        verify: {
          post: "/user/otp/verify",
          description: "Weryfikuje podany OTP dla danego emaila.",
          request: "{ email: string, otp: string }",
          response:
            "{ success: true, message: 'Login successful' } | { success: false, message: 'Invalid OTP' | 'No OTP requested for this email or OTP expired' }",
        },
      },
    },
  });
});

// --- Endpointy OTP ---

/**
 * POST /user/otp/get
 * Symuluje wysyłanie OTP na podany adres email.
 * Dla celów testowych zwraca wygenerowany OTP w odpowiedzi.
 * Przechowuje OTP w Deno KV z timestampem.
 */
app.post("/user/otp/get", async (c) => {
  const { email } = await c.req.json();

  if (!email || typeof email !== "string") {
    return c.json({ success: false, message: "Valid email is required" }, 400);
  }

  const otp = generateOtp();
  // Zapisujemy OTP i aktualny timestamp w Deno KV
  // Klucz to tablica: ["otps", "adres_email"]
  // Wartość to obiekt z otp i timestampem
  await kv.set(["otps", email], { otp, timestamp: Date.now() });

  // WAŻNE: W prawdziwej aplikacji nigdy nie zwracałbyś OTP w odpowiedzi.
  // Jest to tutaj tylko dla celów testowych i deweloperskich.
  console.log(
    `Generated OTP for ${email}: ${otp}. Provide this to the client for testing.`
  );

  return c.json({ success: true, message: "OTP sent successfully", otp: otp });
});

/**
 * POST /user/otp/verify
 * Weryfikuje podany OTP dla danego emaila.
 * Po udanej weryfikacji lub wygaśnięciu, usuwa OTP z pamięci.
 */
app.post("/user/otp/verify", async (c) => {
  const { email, otp } = await c.req.json();

  if (!email || typeof email !== "string" || !otp || typeof otp !== "string") {
    return c.json(
      { success: false, message: "Email and OTP are required" },
      400
    );
  }

  // Pobieramy przechowywane dane OTP z Deno KV
  const storedOtpEntry = await kv.get<{ otp: string; timestamp: number }>([
    "otps",
    email,
  ]);

  if (!storedOtpEntry || storedOtpEntry.value === null) {
    // Brak OTP dla tego emaila lub już wygasło/zostało usunięte
    return c.json(
      {
        success: false,
        message: "No OTP requested for this email or OTP expired",
      },
      400
    );
  }

  const { otp: storedOtp, timestamp } = storedOtpEntry.value;

  // Sprawdzamy, czy OTP wygasło
  if (Date.now() - timestamp > OTP_EXPIRATION_MS) {
    await kv.delete(["otps", email]); // Usuwamy wygasły OTP
    return c.json(
      { success: false, message: "OTP expired, please request a new one" },
      400
    );
  }

  // Sprawdzamy, czy podany OTP pasuje do przechowywanego
  if (storedOtp === otp) {
    await kv.delete(["otps", email]); // OTP zostało pomyślnie użyte, usuwamy je, aby zapobiec ponownemu użyciu
    return c.json({ success: true, message: "Login successful", email });
  } else {
    // Jeśli OTP nie pasuje, nie usuwamy go od razu, aby umożliwić ponowne próby
    // (w ramach czasu ważności).
    return c.json(
      { success: false, message: `Invalid OTP - please use ${storedOtp}` },
      400
    );
  }
});

// --- Uruchomienie serwera ---
const port = 8000;
console.log(
  `🚀 Solvro Mock OTP API server running on http://localhost:${port}`
);
console.log(`To run this server: deno run --allow-net --unstable-kv main.ts`);

Deno.serve({ port }, app.fetch);
