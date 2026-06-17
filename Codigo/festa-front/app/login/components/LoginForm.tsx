"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, FieldError } from "@/app/components/Alert";
import {
  getAuthState,
  getSafeRedirectPath,
  homePathForRole,
} from "@/src/lib/auth-client";
import { authService } from "@/src/services/auth.service";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-md border ${hasError ? "border-red-500" : "border-black"} bg-white px-3 py-2.5 text-black placeholder:text-[#8a8a8a] focus:border-black focus:outline-none`;

export function LoginForm({ redirectTo }: { redirectTo?: string | null }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filledRequired, setFilledRequired] = useState({
    email: false,
    password: false,
  });

  const updateFilledRequired = (field: "email" | "password", value: string) => {
    setFilledRequired((prev) => ({
      ...prev,
      [field]: value.trim().length > 0,
    }));
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";

    // Collect every field error in one pass so the user sees them together.
    const nextErrors: FormErrors = {};
    if (!email.trim()) nextErrors.email = "E-mail é obrigatório";
    else if (!validateEmail(email)) nextErrors.email = "E-mail inválido";
    if (!password.trim()) nextErrors.password = "Senha é obrigatória";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      const target =
        getSafeRedirectPath(redirectTo ?? null) ??
        homePathForRole(getAuthState().role);
      router.replace(target);
    } catch (e: unknown) {
      const msgs = Array.isArray(e) ? e : [];
      setErrors({ general: msgs[0] ?? "Erro ao fazer login" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {errors.general && <Alert message={errors.general} />}

      <div className="space-y-2.5">
        <label htmlFor="email" className="pl-1 text-sm font-medium text-black">
          E-mail
          {!filledRequired.email && <span className="text-red-500">*</span>}
        </label>
        <input
          id="email"
          name="email"
          type="text"
          placeholder="E-mail"
          maxLength={128}
          onChange={(e) => updateFilledRequired("email", e.target.value)}
          className={inputClass(!!errors.email)}
        />
        {errors.email && <FieldError message={errors.email} />}
      </div>

      <div className="space-y-0.5">
        <label
          htmlFor="password"
          className="pl-1 text-sm font-medium text-black"
        >
          Senha
          {!filledRequired.password && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            maxLength={150}
            onChange={(e) => updateFilledRequired("password", e.target.value)}
            className={`${inputClass(!!errors.password)} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a6a] transition-colors hover:text-black"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <FieldError message={errors.password} />}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-black px-4 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
