import { BASE_URL } from "@/api/base-url";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const loginOtpEmailSchema = z.object({
  email: z
    .string()
    .email("Podaj poprawny adres email")
    .endsWith("@student.pwr.edu.pl", {
      message: "Adres email musi kończyć się na @student.pwr.edu.pl",
    }),
});

export function EmailStep({
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
      console.info(`Kod OTP to ${res.otp} 😍`);
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
