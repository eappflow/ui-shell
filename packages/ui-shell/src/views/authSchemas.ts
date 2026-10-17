import { z } from "zod";
import type { ScopedT } from "../composables/createScopedI18n";

// The messages are functions, so they follow a language change

export const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export const createRestorePasswordSchema = (t: ScopedT) =>
  z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      error: () =>
        t(
          "invalid_email",
          "Enter a valid email address.",
          "Podaj poprawny adres e-mail.",
        ),
    }),
  });

export const recoverPasswordSchema = z.object({
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

export const createChangePasswordSchema = (t: ScopedT) =>
  z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6, {
        error: () =>
          t(
            "password_too_short",
            "Password must be at least 6 characters",
            "Hasło musi mieć co najmniej 6 znaków",
          ),
      }),
      confirmPassword: z.string().min(1),
    })
    .refine((form) => form.newPassword === form.confirmPassword, {
      error: () =>
        t(
          "passwords_mismatch",
          "Passwords do not match",
          "Hasła nie są takie same",
        ),
      path: ["confirmPassword"],
    })
    .refine((form) => form.currentPassword !== form.newPassword, {
      error: () =>
        t(
          "password_unchanged",
          "New password must be different from current password",
          "Nowe hasło musi się różnić od obecnego",
        ),
      path: ["newPassword"],
    });
