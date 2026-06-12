import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[55vh] w-full flex-col items-center justify-center text-center sm:py-10">
      <h1 className="text-3xl font-semibold text-black sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="mt-3 text-sm text-zinc-600 sm:text-base">
        O caminho que você tentou acessar não existe.
      </p>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Voltar para o início
        </Link>
      </div>
    </section>
  );
}
