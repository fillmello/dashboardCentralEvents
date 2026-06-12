"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, FieldError } from "@/app/components/Alert";
import { getSafeRedirectPath } from "@/src/lib/auth-client";
import { authService } from "@/src/services/auth.service";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-md border ${hasError ? "border-red-500" : "border-black"} bg-white px-3 py-2.5 text-black placeholder:text-[#8a8a8a] focus:border-black focus:outline-none`;

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Mirror the backend @IsStrongPassword rules (min 8, 1 uppercase, 1 number, 1 symbol).
const validatePassword = (pw: string) =>
  pw.length >= 8 &&
  /[A-Z]/.test(pw) &&
  /[0-9]/.test(pw) &&
  /[^A-Za-z0-9]/.test(pw);
const PASSWORD_RULE =
  "A senha deve ter no mínimo 8 caracteres, incluindo ao menos 1 letra maiúscula, 1 número e 1 símbolo.";

export function RegisterForm({ redirectTo }: { redirectTo?: string | null }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("name") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

    const nextErrors: FormErrors = {};
    if (!fullName.trim()) nextErrors.name = "Nome completo é obrigatório";
    if (!email.trim()) nextErrors.email = "E-mail é obrigatório";
    else if (!validateEmail(email)) nextErrors.email = "E-mail inválido";
    if (!password.trim()) nextErrors.password = "Senha é obrigatória";
    else if (!validatePassword(password)) nextErrors.password = PASSWORD_RULE;
    if (!confirmPassword.trim())
      nextErrors.confirmPassword = "Confirmação de senha é obrigatória";
    else if (password !== confirmPassword)
      nextErrors.confirmPassword = "As senhas não coincidem";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await authService.register({ fullName, email, password });
      const safeRedirect = getSafeRedirectPath(redirectTo ?? null);
      router.replace(
        `/login?mode=login&registered=1${safeRedirect ? `&redirect=${encodeURIComponent(safeRedirect)}` : ""}`,
      );
    } catch (e: unknown) {
      const msgs = Array.isArray(e) ? e : [];
      setErrors({ general: msgs[0] ?? "Erro ao cadastrar" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {errors.general && <Alert message={errors.general} />}

      <div className="space-y-2.5">
        <label htmlFor="name" className="text-sm font-medium text-black">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Nome completo"
          maxLength={128}
          className={inputClass(!!errors.name)}
        />
        {errors.name && <FieldError message={errors.name} />}
      </div>

      <div className="space-y-2.5">
        <label htmlFor="email" className="text-sm font-medium text-black">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="text"
          placeholder="E-mail"
          maxLength={128}
          className={inputClass(!!errors.email)}
        />
        {errors.email && <FieldError message={errors.email} />}
      </div>

      <div className="space-y-2.5">
        <label htmlFor="password" className="text-sm font-medium text-black">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Senha"
          maxLength={150}
          className={inputClass(!!errors.password)}
        />
        {errors.password && <FieldError message={errors.password} />}
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-black"
        >
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirmar senha"
          maxLength={150}
          className={inputClass(!!errors.confirmPassword)}
        />
        {errors.confirmPassword && (
          <FieldError message={errors.confirmPassword} />
        )}
      </div>

      <p className="text-xs text-[#6a6a6a]">
        Novas contas entram no modo <strong>Individual</strong> e veem apenas as
        próprias tarefas. A Gestão pode ajustar seu acesso depois.
      </p>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-black px-4 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Cadastrando..." : "Cadastrar-se"}
      </button>
    </form>
  );
}
