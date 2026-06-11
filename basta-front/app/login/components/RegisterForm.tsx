"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth.service";
import { Alert, FieldError } from "@/app/components/Alert";

interface FormErrors {
  name?: string;
  cpf?: string;
  email?: string;
  telephone?: string;
  password?: string;
  confirmPassword?: string;
  privacyTerms?: string;
  general?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [privacyTermsChecked, setPrivacyTermsChecked] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [filledRequired, setFilledRequired] = useState({
    name: false, cpf: false, email: false, telephone: false, password: false, confirmPassword: false,
  });

  const updateFilledRequired = (field: keyof typeof filledRequired, value: string) => {
    setFilledRequired(prev => ({ ...prev, [field]: value.trim().length > 0 }));
  };

  const formatCPF = (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const formatTelephone = (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateCPF = (cpf: string) => cpf.replace(/\D/g, "").length === 11;
  const validateTelephone = (tel: string) => tel.replace(/\D/g, "").length === 11;

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    setErrors(prev => ({
      ...prev,
      confirmPassword: confirmPassword.trim() !== "" && password !== confirmPassword ? "As senhas não coincidem" : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("name") as string;
    const cpf = formData.get("cpf") as string;
    const email = formData.get("email") as string;
    const telephone = formData.get("telephone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!fullName?.trim()) { setErrors({ name: "Nome completo é obrigatório" }); return; }
    if (!cpf?.trim()) { setErrors({ cpf: "CPF é obrigatório" }); return; }
    if (!validateCPF(cpf)) { setErrors({ cpf: "CPF incompleto ou inválido" }); return; }
    if (!email?.trim()) { setErrors({ email: "E-mail é obrigatório" }); return; }
    if (!validateEmail(email)) { setErrors({ email: "E-mail inválido" }); return; }
    if (!telephone?.trim()) { setErrors({ telephone: "Telefone é obrigatório" }); return; }
    if (!validateTelephone(telephone)) { setErrors({ telephone: "Telefone incompleto" }); return; }
    if (!password?.trim()) { setErrors({ password: "Senha é obrigatória" }); return; }
    if (password.length < 8) { setErrors({ password: "Senha deve ter no mínimo 8 caracteres" }); return; }
    if (!confirmPassword?.trim()) { setErrors({ confirmPassword: "Confirmação de senha é obrigatória" }); return; }
    if (password !== confirmPassword) { setErrors({ confirmPassword: "As senhas não coincidem" }); return; }
    if (!privacyTermsChecked) { setErrors({ privacyTerms: "Você deve aceitar os Termos de Privacidade" }); return; }

    setErrors({});
    setIsLoading(true);

    try {
      await authService.register({ fullName, email, password, cpf: cpf.replace(/\D/g, ""), telephone: telephone.replace(/\D/g, "") });
      router.replace("/login?mode=login");
    } catch (messages: any) {
      setErrors({ general: messages[0] ?? "Erro ao cadastrar" });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md border ${hasError ? "border-red-500" : "border-zinc-700"} bg-zinc-800 px-3 py-2.5 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none`;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {errors.general && <Alert message={errors.general} />}

      <div className="space-y-2.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-300">
          Nome Completo {!filledRequired.name && <span className="text-white">*</span>}
        </label>
        <input id="name" name="name" type="text" placeholder="Nome Completo" maxLength={128}
          onChange={e => updateFilledRequired("name", e.target.value)}
          className={inputClass(!!errors.name)} />
        {errors.name && <FieldError message={errors.name} />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2.5">
          <label htmlFor="cpf" className="text-sm font-medium text-zinc-300">
            CPF {!filledRequired.cpf && <span className="text-white">*</span>}
          </label>
          <input id="cpf" name="cpf" type="text" placeholder="999.999.999-99" maxLength={14}
            onChange={e => { e.target.value = formatCPF(e.target.value); updateFilledRequired("cpf", e.target.value); }}
            onFocus={() => setErrors(prev => ({ ...prev, cpf: undefined }))}
            onBlur={e => { if (e.target.value && !validateCPF(e.target.value)) setErrors(prev => ({ ...prev, cpf: "CPF incompleto ou inválido" })); }}
            className={inputClass(!!errors.cpf)} />
          {errors.cpf && <FieldError message={errors.cpf} />}
        </div>

        <div className="space-y-2.5">
          <label htmlFor="telephone" className="text-sm font-medium text-zinc-300">
            Telefone {!filledRequired.telephone && <span className="text-white">*</span>}
          </label>
          <input id="telephone" name="telephone" type="text" placeholder="(99) 99999-9999" maxLength={15}
            onChange={e => { e.target.value = formatTelephone(e.target.value); updateFilledRequired("telephone", e.target.value); }}
            onFocus={() => setErrors(prev => ({ ...prev, telephone: undefined }))}
            onBlur={e => { if (e.target.value && !validateTelephone(e.target.value)) setErrors(prev => ({ ...prev, telephone: "Telefone incompleto" })); }}
            className={inputClass(!!errors.telephone)} />
          {errors.telephone && <FieldError message={errors.telephone} />}
        </div>
      </div>

      <div className="space-y-2.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          E-mail {!filledRequired.email && <span className="text-white">*</span>}
        </label>
        <input id="email" name="email" type="text" placeholder="E-mail" maxLength={128}
          onChange={e => updateFilledRequired("email", e.target.value)}
          className={inputClass(!!errors.email)} />
        {errors.email && <FieldError message={errors.email} />}
      </div>

      <div className="space-y-2.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-300">
          Senha {!filledRequired.password && <span className="text-white">*</span>}
        </label>
        <input id="password" name="password" type="password" placeholder="Senha" maxLength={150}
          onChange={e => { updateFilledRequired("password", e.target.value); setPasswordValue(e.target.value); }}
          onBlur={e => validatePasswordMatch(e.target.value, confirmPasswordValue)}
          className={inputClass(!!(errors.password || errors.confirmPassword))} />
        {errors.password && <FieldError message={errors.password} />}

        <div className="space-y-2.5 pt-0.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
            Confirmar Senha {!filledRequired.confirmPassword && <span className="text-white">*</span>}
          </label>
          <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirmar Senha" maxLength={150}
            onChange={e => { updateFilledRequired("confirmPassword", e.target.value); setConfirmPasswordValue(e.target.value); }}
            onBlur={e => validatePasswordMatch(passwordValue, e.target.value)}
            className={inputClass(!!errors.confirmPassword)} />
          {errors.confirmPassword && <FieldError message={errors.confirmPassword} />}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <input id="privacyTerms" name="privacyTerms" type="checkbox" checked={privacyTermsChecked}
            onChange={e => { setPrivacyTermsChecked(e.target.checked); if (e.target.checked) setErrors(prev => ({ ...prev, privacyTerms: undefined })); }}
            className={`h-4 w-4 shrink-0 rounded border-zinc-700 accent-white ${errors.privacyTerms ? "border-red-500" : ""}`}
          />
          <label htmlFor="privacyTerms" className="text-sm text-zinc-300">
            Li e concordo com os Termos de Uso e Politica de Privacidade.
            {!privacyTermsChecked && <span className="text-white">*</span>}
          </label>
        </div>
        {errors.privacyTerms && <FieldError message={errors.privacyTerms} />}
      </div>

      <button type="submit" disabled={Boolean(!privacyTermsChecked || isLoading)} suppressHydrationWarning
        className="w-full rounded-md bg-white px-4 py-3 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        {isLoading ? "Cadastrando..." : "Cadastrar-se"}
      </button>
    </form>
  );
}
