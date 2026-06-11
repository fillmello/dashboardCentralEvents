import Link from "next/link";
import { Wordmark } from "./Wordmark";

type FooterColumn = { h: string; l: string[] };

const COLUMNS: FooterColumn[] = [
  { h: "LOJA", l: ["COLEÇÃO 03", "ARQUIVO", "GUIA DE TAMANHOS", "PRESENTES"] },
  { h: "ESTÚDIO", l: ["SOBRE", "DIÁRIO", "IMPRENSA", "CONTATO"] },
  { h: "SUPORTE", l: ["ENVIO", "TROCAS", "CUIDADOS", "PERGUNTAS FREQUENTES"] },
];

const SOCIALS = ["INSTAGRAM"];

export function Footer() {
  return (
    <footer
      className="bg-white text-black"
      style={{ padding: "64px 32px 28px" }}
    >
      <div
        className="grid border-b border-black"
        style={{
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 56,
          paddingBottom: 48,
        }}
      >
        <div>
          <Wordmark size={32} />
        </div>
        {COLUMNS.map((col) => (
          <div key={col.h}>
            <div
              className="micro"
              style={{ color: "#8a8a8a", marginBottom: 18 }}
            >
              {col.h}
            </div>
            <ul className="m-0 list-none p-0 flex flex-col gap-2.5">
              {col.l.map((x) => (
                <li key={x}>
                  <Link href="#" className="micro">
                    {x}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="flex items-center justify-between"
        style={{ paddingTop: 24 }}
      >
        <div className="mono" style={{ color: "#8a8a8a" }}>
          © 2026 BASTA FABRIC
        </div>
        <div className="flex gap-6">
          {SOCIALS.map((s) => (
            <Link key={s} href="#" className="micro">
              {s} ↗
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
