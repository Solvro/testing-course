import React from "react";
import { Navigate } from "react-router";

import SolvroLogoColor from "@/assets/logo_solvro_color.png";
import SolvroLogoMono from "@/assets/logo_solvro_mono.png";
import BgImage from "@/assets/planer_bg.png";
import { EmailStep } from "@/components/email-step";
import { OtpStep } from "@/components/otp-step";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = React.useState("");
  const [step, setStep] = React.useState<"email" | "otp">("email");

  // Redirect to plans if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/plans" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <img
        src={BgImage}
        alt=""
        className="absolute inset-0 left-0 top-0 -z-10 h-full w-full opacity-30"
      />
      <div className="flex w-full max-w-md flex-col">
        <div className="flex w-full flex-col items-center gap-2 rounded-lg bg-background p-5 py-9">
          <img
            src={SolvroLogoColor}
            alt="Solvro Logo"
            width={100}
            height={100}
            className="block dark:hidden"
          />
          <img
            src={SolvroLogoMono}
            alt="Solvro Logo"
            width={100}
            height={100}
            className="hidden dark:block"
          />

          <>
            <h1 className="mt-5 text-3xl font-bold">Zaloguj się do planera</h1>
            <p className="text-balance text-center text-sm text-muted-foreground">
              Podaj swój email z domeny Politechniki Wrocławskiej, na który
              wyślemy jednorazowy kod - a bardziej
              <b> wyświetlimy Ci go w konsoli</b>
              😭
            </p>
          </>

          {step === "email" && (
            <EmailStep setStep={setStep} setEmail={setEmail} />
          )}
          {step === "otp" && <OtpStep email={email} />}
        </div>
      </div>
    </div>
  );
}
