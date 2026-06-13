"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/app/components/Alert";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";

type AuthMode = "login" | "register";

function tabClass(active: boolean): string {
  return `flex justify-center px-3 py-2.5 text-sm font-semibold transition-colors ${
    active
      ? "border-b-2 border-black text-black"
      : "text-[#6a6a6a] hover:text-black"
  }`;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const authType: AuthMode =
    searchParams.get("mode") === "register" ? "register" : "login";
  const justRegistered = searchParams.get("registered") === "1";
  const redirect = searchParams.get("redirect");

  return (
    <section className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-white px-6 py-10 text-black">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="display text-2xl leading-tight sm:text-3xl">
            Central de Posts
          </h1>
          <p className="mono mt-1.5 tracking-wide text-[#6a6a6a]">
            FESTA DE MULTIPLICAÇÃO
          </p>
        </div>
        <div className="border border-black bg-white px-6 py-7 sm:px-8 sm:py-8">
          <div className="mb-7 grid grid-cols-2 border-b border-black">
            <Link
              href="/login?mode=login"
              className={tabClass(authType === "login")}
            >
              Entrar
            </Link>
            <Link
              href="/login?mode=register"
              className={tabClass(authType === "register")}
            >
              Cadastrar
            </Link>
          </div>

          {justRegistered && authType === "login" && (
            <div className="mb-6">
              <Alert
                variant="success"
                message="Conta criada com sucesso! Faça login para continuar."
              />
            </div>
          )}

          {authType === "login" ? (
            <LoginForm redirectTo={redirect} />
          ) : (
            <RegisterForm redirectTo={redirect} />
          )}

          <p className="pt-6 text-center text-sm text-[#6a6a6a]">
            {authType === "login"
              ? "Não tem uma conta? "
              : "Já tem uma conta? "}
            <Link
              href={
                authType === "login"
                  ? "/login?mode=register"
                  : "/login?mode=login"
              }
              className="font-medium text-black underline underline-offset-2"
            >
              {authType === "login" ? "Cadastrar-se" : "Entrar"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
