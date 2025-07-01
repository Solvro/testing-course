import { BASE_URL } from "@/api/base-url";
import { Button } from "@/components/ui/button";
import {
  FormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

const otpPinSchema = z.object({
  otp: z
    .string()
    .length(6, "Kod OTP musi mieć 6 znaków")
    .regex(/^\d+$/, "Kod OTP może zawierać tylko cyfry"),
});

export function OtpStep({ email }: { email: string }) {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      body: JSON.stringify({
        email,
        otp: data.otp,
      }),
    });

    if (result.ok) {
      const { email } = await result.json();
      toast.success("Zalogowano pomyślnie");
      login(email);
      navigate("/plans");
    } else if (result.status === 400) {
      const { message } = await result.json();
      toast.error(message || "Błąd podczas logowania");
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
