import { zodResolver } from "@hookform/resolvers/zod";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import SolvroLogoColor from "@/assets/logo_solvro_color.png";
import SolvroLogoMono from "@/assets/logo_solvro_mono.png";
import BgImage from "@/assets/planer_bg.png";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate } from "react-router";
import { Loader } from "lucide-react";

const BASE_URL = "https://planer-mock-api.deno.dev";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [step, setStep] = React.useState<"email" | "otp" | "onboard">("email");

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <img
        src={BgImage}
        alt="bg img"
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
          {step !== "onboard" && (
            <>
              <h1 className="mt-5 text-3xl font-bold">
                Zaloguj się do planera
              </h1>
              <p className="text-balance text-center text-sm text-muted-foreground">
                Podaj swój email z domeny Politechniki Wrocławskiej, na który
                wyślemy jednorazowy kod
              </p>
            </>
          )}

          {step === "email" && (
            <EmailStep setStep={setStep} setEmail={setEmail} />
          )}
          {step === "otp" && <OtpStep email={email} />}
        </div>
      </div>
    </div>
  );
}

const loginOtpEmailSchema = z.object({
  email: z
    .string()
    .email("Podaj poprawny adres email")
    .endsWith("@student.pwr.edu.pl", {
      message: "Adres email musi kończyć się na @student.pwr.edu.pl",
    }),
});

function EmailStep({
  setStep,
  setEmail,
}: {
  setStep: (value: "email" | "otp") => void;
  setEmail: (value: string) => void;
}) {
  const form = useForm<z.infer<typeof loginOtpEmailSchema>>({
    resolver: zodResolver(loginOtpEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof loginOtpEmailSchema>) {
    const result = await fetch(`${BASE_URL}/user/otp/get`, {
      method: "POST",
      body: JSON.stringify(values),
    });
    if (!result.ok) {
      toast.error("Wystąpił błąd podczas wysyłania kodu");
      return;
    }
    setEmail(values.email);
    const res = await result.json();

    if (res.success) {
      toast(`Pss... Kod to ${res.otp}`, {
        invert: true,
      });
    }
    setStep("otp");
  }
  return (
    <div className="mt-5 flex w-full max-w-xs flex-col gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adres e-mail</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123456@student.pwr.edu.pl"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="sm"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="size-4 animate-spin" /> : null}
            Wyślij kod
          </Button>
        </form>
      </Form>
    </div>
  );
}

const otpPinSchema = z.object({
  otp: z
    .string()
    .length(6, "Kod OTP musi mieć 6 znaków")
    .regex(/^\d+$/, "Kod OTP może zawierać tylko cyfry"),
});

function OtpStep({ email }: { email: string }) {
  const navigate = useNavigate();

  const formOtp = useForm<z.infer<typeof otpPinSchema>>({
    resolver: zodResolver(otpPinSchema),
    defaultValues: {
      otp: "",
    },
  });

  const isLoading = formOtp.formState.isSubmitting;

  async function onSubmitOtp(data: z.infer<typeof otpPinSchema>) {
    const result = await fetch(`${BASE_URL}/user/otp/verify`, {
      method: "POST",
      body: JSON.stringify({ email, ...data }),
    });
    if (!result.ok) {
      try {
        const response = (await result.json()) as { message: string };
        toast.error(response.message);
      } catch {
        toast.error("Wystąpił nieoczekiwany błąd");
      }
      return;
    }

    const res = await result.json();

    if (res.success) {
      toast.success("Zalogowano pomyślnie");
      navigate("/plans");
    } else {
      toast.error("Nieprawidłowy kod");
    }
  }
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Form {...formOtp}>
        <form
          onSubmit={formOtp.handleSubmit(onSubmitOtp)}
          className="mt-5 max-w-xs space-y-6"
        >
          <FormField
            control={formOtp.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Hasło jednorazowe</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Wpisz kod, który wylądował właśnie na Twoim adresie email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="sm"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="size-4 animate-spin" /> : null}
            Zaloguj się
          </Button>
        </form>
      </Form>
    </div>
  );
}
