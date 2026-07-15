"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const registerSchema = z.object({
  displayName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      await signUpWithEmail(values.email, values.password, values.displayName);
      router.push("/");
    } catch {
      setFormError("Could not create account. Email may already be in use.");
    }
  }

  async function handleGoogleSignUp() {
    setFormError(null);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch {
      setFormError("Google sign-up failed. Try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <Input
        label="Full name"
        {...register("displayName")}
        error={errors.displayName?.message}
      />
      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />
      {formError && <p className="text-sm text-pepper">{formError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
      <Button type="button" variant="secondary" onClick={handleGoogleSignUp}>
        Continue with Google
      </Button>
    </form>
  );
}
