"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const authType: AuthMode = searchParams.get("mode") === "register" ? "register" : "login";

  return (
    <section className="w-full min-h-screen bg-black px-6 py-10 text-white sm:px-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-7 sm:px-8 sm:py-8">
          <div className="relative mb-7">
            <div className="relative z-10 grid w-full grid-cols-2 gap-1">
              <Link href="/login?mode=login"
                className={`flex justify-center px-3 py-2 text-base font-semibold ${authType === "login" ? "border-b-2 border-white text-white" : "text-zinc-500 transition-colors hover:text-zinc-300"}`}>
                Entrar
              </Link>
              <Link href="/login?mode=register"
                className={`flex justify-center px-3 py-2 text-base font-semibold ${authType === "register" ? "border-b-2 border-white text-white" : "text-zinc-500 transition-colors hover:text-zinc-300"}`}>
                Cadastrar
              </Link>
            </div>
            <div aria-hidden="true" className="absolute inset-x-0 bottom-[0.5px] h-px bg-zinc-700" />
          </div>

          {authType === "login" ? <LoginForm /> : <RegisterForm />}

          <p className="pt-6 text-center text-sm text-zinc-400">
            {authType === "login" ? "Não tem uma conta? " : "Já tem uma conta? "}
            <Link href={authType === "login" ? "/login?mode=register" : "/login?mode=login"}
              className="font-medium underline underline-offset-2 text-white">
              {authType === "login" ? "Cadastrar-se" : "Entrar"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
