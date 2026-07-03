import { Link, createFileRoute, notFound, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Mail, MessageCircle, Phone, Share2 } from "lucide-react";

import { EyebrowTag } from "@/components/brand/EyebrowTag";
import { FloatingWhatsApp } from "@/components/brand/FloatingWhatsApp";
import { KorumLogo } from "@/components/brand/KorumLogo";
import { LedTexture } from "@/components/brand/LedTexture";
import { TopBlocks } from "@/components/brand/TopBlocks";
import { EMAIL, WHATSAPP_DISPLAY, WHATSAPP_NUMBER, findModel } from "@/data/models";
import type { PortfolioSection } from "@/data/models";
import { getMediaForView } from "@/lib/portfolio-media.functions";

export const Route = createFileRoute("/portifolios/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview: search.preview === "1" || search.preview === 1 || search.preview === true,
    t: typeof search.t === "string" ? search.t : undefined,
  }),
  loader: ({ params }) => {
    const model = findModel(params.slug);
    if (!model) throw notFound();
    return { model };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.model.seo.title ?? "Portfólio não encontrado — Korum" },
      { name: "description", content: loaderData?.model.seo.description ?? "Portfólio Korum indisponível." },
      { property: "og:title", content: loaderData?.model.seo.title ?? "Portfólio não encontrado — Korum" },
      { property: "og:description", content: loaderData?.model.seo.description ?? "Portfólio Korum indisponível." },
      ...(!loaderData ? [{ name: "robots", content: "noindex" }] : []),
    ],
  }),
  notFoundComponent: PortfolioNotFound,
  errorComponent: PortfolioError,
  component: PortfolioModelPage,
});

type MediaItem = {
  id: string;
  section_id: string;
  kind: string;
  url: string;
  caption: string | null;
  signedUrl: string;
};

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

function MediaRenderer({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    return (
      <img
        src={item.signedUrl}
        alt={item.caption ?? ""}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }
  if (item.kind === "video") {
    return (
      <video src={item.signedUrl} controls playsInline className="w-full h-full object-cover" />
    );
  }
  // videolink
  const yt = youtubeId(item.url);
  if (yt) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${yt}`}
        title={item.caption ?? "Vídeo"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    );
  }
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full w-full items-center justify-center bg-korum-navy text-korum-paper font-bold"
    >
      ▶ Assista ao vídeo
    </a>
  );
}

function Gallery({ items }: { items: MediaItem[] }) {
  if (items.length === 0) return null;
  const cols = items.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  return (
    <div className={`mt-8 grid ${cols} gap-4`}>
      {items.map((item) => (
        <figure key={item.id} className="overflow-hidden rounded-2xl bg-black">
          <div className="aspect-video">
            <MediaRenderer item={item} />
          </div>
          {item.caption && (
            <figcaption
              className="px-4 py-2 text-sm text-korum-navy/70"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              {item.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function parseSubtitle(text: string) {
  const matches = text.match(/<([^>]+)>\s*<([^>]+)>/);
  if (!matches) return { first: text, second: "" };
  return { first: matches[1], second: matches[2] };
}

function PortfolioModelPage() {
  const { model } = Route.useLoaderData();
  const search = useSearch({ from: "/portifolios/$slug" });
  const sub = parseSubtitle(model.heroSubtitle);
  const waMessage = `Olá! Vi o portfólio de ${model.name} e quero um orçamento.`;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  const fetchMedia = useServerFn(getMediaForView);
  const { data: media = [] } = useQuery({
    queryKey: ["portfolio-media", model.slug, search.preview, search.t ?? ""],
    queryFn: () =>
      fetchMedia({
        data: { slug: model.slug, preview: search.preview, token: search.t },
      }) as Promise<MediaItem[]>,
    staleTime: 30_000,
  });

  const hero = media.find((m) => m.section_id === "__hero");
  const mediaBySection = (id: string) =>
    media.filter((m) => m.section_id === id).sort((a, b) => 0); // already ordered by server

  return (
    <div className="flex min-h-screen flex-col text-korum-navy">
      <TopBlocks />

      <section className="relative overflow-hidden bg-korum-navy text-korum-paper">
        <div className="flex items-center justify-between px-6 py-6 md:px-12">
          <Link to="/portifolios">
            <KorumLogo className="h-10 w-auto md:h-12" />
          </Link>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 text-sm text-korum-paper/80 hover:text-korum-paper md:inline-flex">
            <MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}
          </a>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 md:gap-14 md:px-12 md:py-16 lg:grid-cols-2">
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border-4" style={{ borderColor: model.accent, aspectRatio: "4 / 3" }}>
              {hero ? (
                <MediaRenderer item={hero} />
              ) : (
                <>
                  <LedTexture className="absolute inset-0 opacity-70" color={model.accent} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-brand-heavy select-none text-korum-paper" style={{ fontSize: "clamp(4rem, 14vw, 10rem)", textShadow: `0 0 40px ${model.accent}` }}>
                      {model.name.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="font-mono text-sm text-korum-paper/90 md:text-base">
              <div>{sub.first}</div>
              <div className="text-korum-green">{sub.second}</div>
            </div>
            <h1 className="font-brand-heavy mt-5 leading-none tracking-normal text-korum-paper" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              {model.heroTitle} <span className="text-korum-green">{model.heroTitleEm}</span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-korum-green px-6 py-3 font-bold text-korum-paper transition-opacity hover:opacity-90">
                <MessageCircle className="h-5 w-5" /> Pedir orçamento
              </a>
              <a href={`#${model.sections[0]?.id ?? ""}`} className="inline-flex items-center gap-2 rounded-lg border-2 border-korum-paper/40 px-6 py-3 font-bold text-korum-paper transition-colors hover:border-korum-paper">
                Ver soluções
              </a>
            </div>
          </div>
        </div>

        <LedTexture className="h-2 w-full opacity-70 md:h-3" color={model.accent} />
      </section>

      <section className="flex-1 bg-korum-paper text-korum-navy">
        <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-14 md:gap-24 md:px-12 md:py-24">
          {model.sections.map((section: PortfolioSection, index: number) => {
            const number = String(index + 1).padStart(2, "0");
            const sectionItems = mediaBySection(section.id);
            return (
              <article key={section.id} id={section.id} className="scroll-mt-24">
                <EyebrowTag>{number} · {section.eyebrow}</EyebrowTag>
                <h2 className="font-brand-heavy mt-3 leading-tight tracking-normal text-korum-navy" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>{section.title}</h2>
                <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-korum-paper-muted md:text-lg">
                  {section.body.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}
                </div>

                {sectionItems.length > 0 ? (
                  <Gallery items={sectionItems} />
                ) : (
                  <div className="mt-8 flex items-center justify-center rounded-2xl border-2 border-dashed border-korum-navy/30 px-4 py-16 text-center text-korum-navy/55 md:py-24">
                    <span className="font-mono text-sm md:text-base">Fotos e vídeos entram pelo painel</span>
                  </div>
                )}

                {section.chips.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2 md:gap-3">
                    {section.chips.map((chip: string, chipIndex: number) => (
                      <span key={chip} className={chipIndex === 0 ? "inline-flex items-center rounded-full bg-korum-navy px-4 py-2 text-sm font-medium text-korum-paper" : "inline-flex items-center rounded-full border border-korum-navy/30 px-4 py-2 text-sm font-medium text-korum-navy"}>
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-korum-navy text-korum-paper">
        <div className="mx-auto max-w-5xl px-6 py-14 md:px-12 md:py-20">
          <EyebrowTag>ações</EyebrowTag>
          <h2 className="font-brand-heavy mt-3 leading-tight tracking-normal" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>Gostou? Leve com você</h2>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            <button type="button" disabled className="inline-flex items-center justify-center gap-2 rounded-xl bg-korum-paper/10 px-5 py-4 text-korum-paper/90 transition-colors disabled:opacity-70">
              <FileDown className="h-5 w-5" /> Salvar em PDF
            </button>
            <button type="button" disabled className="inline-flex items-center justify-center gap-2 rounded-xl bg-korum-paper/10 px-5 py-4 text-korum-paper/90 transition-colors disabled:opacity-70">
              <Mail className="h-5 w-5" /> Enviar por e-mail
            </button>
            <button type="button" disabled className="inline-flex items-center justify-center gap-2 rounded-xl bg-korum-paper/10 px-5 py-4 text-korum-paper/90 transition-colors disabled:opacity-70">
              <Share2 className="h-5 w-5" /> Compartilhar link no WhatsApp
            </button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-korum-green px-5 py-4 font-bold text-korum-paper transition-opacity hover:opacity-90">
              <Phone className="h-5 w-5" /> Entrar em contato agora
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-korum-paper/10 bg-korum-navy-deep px-6 py-10 text-korum-paper md:px-12 md:py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="font-brand-heavy leading-tight tracking-normal" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>Prepare-se para o futuro</h3>
            <div className="mt-3 flex flex-col gap-2 font-mono text-sm text-korum-paper/75 sm:flex-row sm:gap-5">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-korum-paper">
                <MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}
              </a>
              <a href={`mailto:${EMAIL}`} className="hover:text-korum-paper">{EMAIL}</a>
            </div>
          </div>
          <KorumLogo className="h-12 w-auto" />
        </div>
      </footer>

      <FloatingWhatsApp message={waMessage} />
    </div>
  );
}

function PortfolioNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-korum-navy px-4 text-center text-korum-paper">
      <div>
        <h1 className="font-brand-heavy text-4xl tracking-normal">Portfólio não encontrado</h1>
        <p className="mt-3 text-korum-paper/70">Escolha outro segmento para continuar.</p>
        <Link to="/portifolios" className="mt-6 inline-flex rounded-lg bg-korum-green px-5 py-3 font-bold text-korum-paper">Ver portfólios</Link>
      </div>
    </main>
  );
}

function PortfolioError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-korum-navy px-4 text-center text-korum-paper">
      <div>
        <h1 className="font-brand-heavy text-4xl tracking-normal">Não foi possível carregar</h1>
        <p className="mt-3 text-korum-paper/70">Volte para a lista de portfólios e tente novamente.</p>
        <Link to="/portifolios" className="mt-6 inline-flex rounded-lg bg-korum-green px-5 py-3 font-bold text-korum-paper">Voltar</Link>
      </div>
    </main>
  );
}