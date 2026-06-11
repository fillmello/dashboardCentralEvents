"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth.service";
import { Alert, FieldError } from "@/app/components/Alert";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filledRequired, setFilledRequired] = useState({ email: false, password: false });

  const updateFilledRequired = (field: "email" | "password", value: string) => {
    setFilledRequired(prev => ({ ...prev, [field]: value.trim().length > 0 }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || email.trim() === "") { setErrors({ email: "E-mail é obrigatório" }); return; }
    if (!validateEmail(email)) { setErrors({ email: "E-mail inválido" }); return; }
    if (!password || password.trim() === "") { setErrors({ password: "Senha é obrigatória" }); return; }

    setErrors({});
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      router.replace("/");
    } catch (messages: any) {
      setErrors({ general: messages[0] ?? "Erro ao fazer login" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {errors.general && <Alert message={errors.general} />}

      <div className="space-y-2.5">
        <label htmlFor="email" className="pl-1 text-sm font-medium text-zinc-300">
          E-mail{!filledRequired.email && <span className="text-white">*</span>}
        </label>
        <input id="email" name="email" type="text" placeholder="E-mail" maxLength={128}
          onChange={e => updateFilledRequired("email", e.target.value)}
          className={`w-full rounded-md border ${errors.email ? "border-red-500" : "border-zinc-700"} bg-zinc-800 px-3 py-2.5 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none`}
        />
        {errors.email && <FieldError message={errors.email} />}
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="pl-1 text-sm font-medium text-zinc-300">
            Senha{!filledRequired.password && <span className="text-white">*</span>}
          </label>
          <a href="#" className="relative -top-[0.2rem] text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-200">
            Esqueci a senha
          </a>
        </div>
        <div className="relative">
          <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Senha" maxLength={150}
            onChange={e => updateFilledRequired("password", e.target.value)}
            className={`w-full rounded-md border ${errors.password ? "border-red-500" : "border-zinc-700"} bg-zinc-800 px-3 py-2.5 pr-20 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none`}
          />
          <button type="button" onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-200">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <FieldError message={errors.password} />}
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full rounded-md bg-white px-4 py-3 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
