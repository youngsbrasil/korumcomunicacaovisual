import { Link, createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { EyebrowTag } from "@/components/brand/EyebrowTag";
import { FloatingWhatsApp } from "@/components/brand/FloatingWhatsApp";
import { KorumLogo } from "@/components/brand/KorumLogo";
import { TopBlocks } from "@/components/brand/TopBlocks";
import { EMAIL, WHATSAPP_DISPLAY, WHATSAPP_NUMBER, models } from "@/data/models";

export const Route = createFileRoute("/portifolios")({
  head: () => ({
    meta: [
      { title: "Portfólios — Korum Comunicação Visual" },
      { name: "description", content: "Escolha um segmento e veja soluções de comunicação visual da Korum para LED, postos, farmácias e supermercados." },
      { property: "og:title", content: "Portfólios — Korum Comunicação Visual" },
      { property: "og:description", content: "Escolha um segmento e veja soluções de comunicação visual da Korum para LED, postos, farmácias e supermercados." },
    ],
  }),
  component: PortfolioIndex,
});

const shortDesc: Record<string, string> = {
  led: "Fachadas, totens e telas de LED que impactam 24h por dia.",
  postos: "Testeiras, totens, mobiliário e LED — do projeto à instalação.",
  farmacias: "Cruz de LED, ACM, letra caixa e sinalização de rede.",
  supermercados: "Painéis suspensos, faixas de gôndola e fachadas que vendem.",
};

function PortfolioIndex() {
  return (
    <div className="flex min-h-screen flex-col bg-korum-navy text-korum-paper">
      <TopBlocks />

      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Link to="/">
          <KorumLogo className="h-10 w-auto md:h-12" />
        </Link>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 text-sm text-korum-paper/80 hover:text-korum-paper md:inline-flex">
          <MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}
        </a>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 md:px-12 md:py-16">
        <EyebrowTag>portfólios · korum</EyebrowTag>
        <h1 className="font-brand-heavy mt-3 text-4xl leading-tight tracking-normal text-korum-paper md:text-6xl">
          Escolha um <span className="text-korum-green">segmento</span>
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-sm text-korum-paper/70 md:text-base">
          Projetos, produtos e cases divididos por setor. Cada portfólio traz o que a Korum entrega, de ponta a ponta.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
          {models.map((model) => (
            <Link key={model.slug} to="/portifolios/$slug" params={{ slug: model.slug }} className="group relative overflow-hidden rounded-2xl border border-korum-paper/10 bg-korum-paper/5 p-6 transition-colors hover:bg-korum-paper/10 md:p-8">
              <div className="absolute left-0 top-0 h-1 w-full" style={{ background: model.accent }} aria-hidden />
              <EyebrowTag>{model.eyebrow}</EyebrowTag>
              <h2 className="font-brand-heavy mt-3 text-2xl leading-tight tracking-normal text-korum-paper md:text-3xl">{model.name}</h2>
              <p className="mt-3 text-sm text-korum-paper/70 md:text-base">{shortDesc[model.slug]}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-mono" style={{ color: model.accent }}>
                Ver portfólio →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-korum-paper/10 bg-korum-navy-deep px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <KorumLogo className="h-10 w-auto" />
          <div className="flex flex-col gap-2 font-mono text-sm text-korum-paper/70 md:flex-row md:gap-6">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-korum-paper">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <a href={`mailto:${EMAIL}`} className="hover:text-korum-paper">{EMAIL}</a>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}