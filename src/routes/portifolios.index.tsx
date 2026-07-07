import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { EyebrowTag } from "@/components/brand/EyebrowTag";
import { FloatingWhatsApp } from "@/components/brand/FloatingWhatsApp";
import { KorumLogo } from "@/components/brand/KorumLogo";
import { SiteSignature } from "@/components/brand/SiteSignature";
import { TopBlocks } from "@/components/brand/TopBlocks";
import { EMAIL, WHATSAPP_DISPLAY, WHATSAPP_NUMBER, models } from "@/data/models";
import { getPublishedCovers } from "@/lib/portfolio-media.functions";
import coverLed from "@/assets/cover-led.jpg";
import coverPostos from "@/assets/cover-postos.jpg";
import coverFarmacias from "@/assets/cover-farmacias.jpg";
import coverSupermercados from "@/assets/cover-supermercados.jpg";

const fallbackCovers: Record<string, string> = {
  led: coverLed,
  postos: coverPostos,
  farmacias: coverFarmacias,
  supermercados: coverSupermercados,
};

export const Route = createFileRoute("/portifolios/")({
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

type Cover = { slug: string; kind: string; url: string; signedUrl: string };

function PortfolioIndex() {
  const fetchCovers = useServerFn(getPublishedCovers);
  const { data: covers = [] } = useQuery({
    queryKey: ["portfolio-covers"],
    queryFn: () => fetchCovers({ data: {} }) as Promise<Cover[]>,
    staleTime: 60_000,
  });
  const coverBySlug = new Map(covers.map((c) => [c.slug, c]));

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
          {models.map((model) => {
            const cover = coverBySlug.get(model.slug);
            return (
              <Link key={model.slug} to="/portifolios/$slug" params={{ slug: model.slug }} className="group relative flex flex-col overflow-hidden rounded-2xl border border-korum-paper/10 bg-korum-paper/5 transition-colors hover:bg-korum-paper/10">
                <div className="absolute left-0 top-0 z-10 h-1 w-full" style={{ background: model.accent }} aria-hidden />
                <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-korum-navy-deep">
                  {cover && cover.kind === "image" && cover.signedUrl ? (
                    <img
                      src={cover.signedUrl}
                      alt={model.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : cover && cover.kind === "video" && cover.signedUrl ? (
                    <video src={cover.signedUrl} className="h-full w-full object-cover" muted playsInline loop autoPlay />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-xs text-korum-paper/40">
                      sem capa publicada
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8">
                  <EyebrowTag>{model.eyebrow}</EyebrowTag>
                  <h2 className="font-brand-heavy mt-3 text-2xl leading-tight tracking-normal text-korum-paper md:text-3xl">{model.name}</h2>
                  <p className="mt-3 text-sm text-korum-paper/70 md:text-base">{shortDesc[model.slug]}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-mono" style={{ color: model.accent }}>
                    Ver portfólio →
                  </span>
                </div>
              </Link>
            );
          })}
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
        <div className="mx-auto mt-6 max-w-6xl border-t border-korum-paper/10 pt-4">
          <SiteSignature />
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}