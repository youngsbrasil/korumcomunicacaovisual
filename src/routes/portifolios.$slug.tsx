import { Link, createFileRoute, notFound, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Mail, MessageCircle, Phone, Share2 } from "lucide-react";
import { useState } from "react";

import { EyebrowTag } from "@/components/brand/EyebrowTag";
import { FloatingWhatsApp } from "@/components/brand/FloatingWhatsApp";
import { KorumLogo } from "@/components/brand/KorumLogo";
import { LedTexture } from "@/components/brand/LedTexture";
import { TopBlocks } from "@/components/brand/TopBlocks";
import { EMAIL, WHATSAPP_DISPLAY, WHATSAPP_NUMBER, findModel } from "@/data/models";
import type { PortfolioSection } from "@/data/models";
import { getMediaForView } from "@/lib/portfolio-media.functions";

const SITE_URL = "https://korumcomunicacaovisual.com.br";

export const Route = createFileRoute("/portifolios/$slug")({
  validateSearch: (search: Record<string, unknown>) => {
    const preview = search.preview === "1" || search.preview === 1 || search.preview === true;
    const t = typeof search.t === "string" ? search.t : undefined;
    return {
      ...(preview ? { preview: true as const } : {}),
      ...(t ? { t } : {}),
    };
  },
  loader: ({ params }) => {
    const model = findModel(params.slug);
    if (!model) throw notFound();
    return { model };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Portfólio não encontrado — Korum" },
          { name: "description", content: "Portfólio Korum indisponível." },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { model } = loaderData;
    const pageUrl = `${SITE_URL}/portifolios/${params.slug}`;
    return {
      meta: [
        { title: model.seo.title },
        { name: "description", content: model.seo.description },
        { name: "theme-color", content: "#182338" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Korum Comunicação Visual" },
        { property: "og:title", content: model.seo.title },
        { property: "og:description", content: model.seo.description },
        { property: "og:url", content: pageUrl },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: model.seo.title },
        { name: "twitter:description", content: model.seo.description },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: model.name,
            description: model.seo.description,
            areaServed: "BR",
            url: pageUrl,
            provider: {
              "@type": "Organization",
              name: "Korum Comunicação Visual",
              telephone: "+5511917748504",
              email: "comercial2@korumcomunicacaovisual.com.br",
              url: SITE_URL,
            },
          }),
        },
      ],
    };
  },
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
        crossOrigin="anonymous"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }
  if (item.kind === "video") {
    return <video src={item.signedUrl} controls playsInline className="w-full h-full object-cover" />;
  }
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

function parseSubtitle(text: string) {
  const matches = text.match(/<([^>]+)>\s*<([^>]+)>/);
  if (!matches) return { first: text, second: "" };
  return { first: matches[1], second: matches[2] };
}

/** Slide frame: fixed 9:16, centered, snap target. */
function Slide({
  bg,
  children,
}: {
  bg: "navy" | "paper" | "navy-deep";
  children: React.ReactNode;
}) {
  const bgClass =
    bg === "navy"
      ? "bg-korum-navy text-korum-paper"
      : bg === "navy-deep"
      ? "bg-korum-navy-deep text-korum-paper"
      : "bg-korum-paper text-korum-navy";
  const bgColor = bg === "navy" ? "#182338" : bg === "navy-deep" ? "#0f1626" : "#f4efe6";
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center snap-start py-4">
      <div
        data-slide
        data-slide-bg={bgColor}
        className={`slide relative overflow-hidden rounded-2xl shadow-2xl ${bgClass}`}
        style={{
          width: "min(calc(100vw - 24px), calc((100dvh - 32px) * 9 / 16))",
          aspectRatio: "9 / 16",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PortfolioModelPage() {
  const { model } = Route.useLoaderData();
  const search = useSearch({ from: "/portifolios/$slug" });
  const sub = parseSubtitle(model.heroSubtitle);
  const waMessage = `Olá! Vi o portfólio de ${model.name} e quero um orçamento.`;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
  const pageUrl = `${SITE_URL}/portifolios/${model.slug}`;
  const shareText = `${model.seo.title} ${pageUrl}`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(model.seo.title)}&body=${encodeURIComponent(pageUrl)}`;

  const [pdfLoading, setPdfLoading] = useState(false);

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
  const mediaBySection = (id: string) => media.filter((m) => m.section_id === id);

  // Chunk a section into slides: 1 text slide + N media slides (2 per slide).
  const sectionSlides = (section: PortfolioSection, index: number) => {
    const items = mediaBySection(section.id);
    const number = String(index + 1).padStart(2, "0");
    const mediaChunks: MediaItem[][] = [];
    for (let i = 0; i < items.length; i += 2) mediaChunks.push(items.slice(i, i + 2));
    const totalParts = 1 + mediaChunks.length; // text + media pages
    const parts: React.ReactNode[] = [];

    parts.push(
      <Slide bg="paper" key={`${section.id}-text`}>
        <div className="flex h-full w-full flex-col justify-center px-6 py-8">
          <EyebrowTag>
            {number} · {section.eyebrow}
            {totalParts > 1 ? ` · 1/${totalParts}` : ""}
          </EyebrowTag>
          <h2
            className="font-brand-heavy mt-3 leading-tight tracking-normal text-korum-navy"
            style={{ fontSize: "clamp(1.6rem, 6vw, 2.4rem)" }}
          >
            {section.title}
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-korum-paper-muted md:text-base">
            {section.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {section.chips.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {section.chips.map((chip, ci) => (
                <span
                  key={chip}
                  className={
                    ci === 0
                      ? "inline-flex items-center rounded-full bg-korum-navy px-3 py-1.5 text-xs font-medium text-korum-paper"
                      : "inline-flex items-center rounded-full border border-korum-navy/30 px-3 py-1.5 text-xs font-medium text-korum-navy"
                  }
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
          {items.length === 0 && (
            <div className="mt-6 flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-korum-navy/30 px-4 py-8 text-center text-korum-navy/55">
              <span className="font-mono text-xs">Fotos e vídeos entram pelo painel</span>
            </div>
          )}
        </div>
      </Slide>,
    );

    mediaChunks.forEach((chunk, ci) => {
      parts.push(
        <Slide bg="paper" key={`${section.id}-media-${ci}`}>
          <div className="flex h-full w-full flex-col px-6 py-8">
            <EyebrowTag>
              {number} · {section.eyebrow} · {ci + 2}/{totalParts}
            </EyebrowTag>
            <h3
              className="font-brand-heavy mt-2 leading-tight tracking-normal text-korum-navy"
              style={{ fontSize: "clamp(1.1rem, 4vw, 1.4rem)" }}
            >
              {section.title}
            </h3>
            <div className="mt-4 grid flex-1 grid-cols-1 gap-3">
              {chunk.map((item) => (
                <figure key={item.id} className="overflow-hidden rounded-xl bg-black min-h-0">
                  <div className="h-full w-full">
                    <MediaRenderer item={item} />
                  </div>
                  {item.caption && (
                    <figcaption
                      className="px-3 py-1.5 text-xs text-korum-navy/70 bg-korum-paper"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </Slide>,
      );
    });

    return parts;
  };

  const handleGeneratePdf = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      console.log("[pdf] start");
      const slides = Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));
      console.log("[pdf] slides:", slides.length);
      if (slides.length === 0) throw new Error("no slides");

      const floating = document.querySelector<HTMLElement>("[data-floating-whatsapp]");
      const prevDisplay = floating?.style.display ?? "";
      if (floating) floating.style.display = "none";

      // Wait for images inside slides (with per-image timeout)
      const imgs = slides.flatMap((s) => Array.from(s.querySelectorAll("img")));
      console.log("[pdf] images:", imgs.length);
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) return resolve();
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
              setTimeout(done, 4000);
            }),
        ),
      );
      console.log("[pdf] images ready");

      const [{ toJpeg }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      // 9:16 page: 540px @ 96dpi → 142.9mm × 254.0mm
      const pdfWidthMM = (540 * 25.4) / 96;
      const pdfHeightMM = (pdfWidthMM * 16) / 9;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidthMM, pdfHeightMM],
      });

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const bg = slide.getAttribute("data-slide-bg") || "#ffffff";
        const rect = slide.getBoundingClientRect();
        const targetW = 540;
        const scale = targetW / rect.width;
        console.log("[pdf] rendering slide", i + 1, "/", slides.length);
        const imgData = await toJpeg(slide, {
          quality: 0.94,
          pixelRatio: 2,
          backgroundColor: bg,
          cacheBust: true,
          width: rect.width,
          height: rect.height,
          canvasWidth: targetW,
          canvasHeight: Math.round(rect.height * scale),
        });
        if (i > 0) pdf.addPage([pdfWidthMM, pdfHeightMM], "portrait");
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidthMM, pdfHeightMM, "", "NONE");
      }

      console.log("[pdf] saving");
      if (floating) floating.style.display = prevDisplay;
      pdf.save(`Korum-${model.slug}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Não foi possível gerar o PDF neste navegador. Tente pelo Google Chrome.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div
      className="deck min-h-[100dvh] w-full snap-y snap-mandatory overflow-y-auto bg-korum-navy-deep"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {/* Slide 1: Hero */}
      <Slide bg="navy">
        <div className="flex h-full w-full flex-col">
          <TopBlocks />
          <div className="flex items-center justify-between px-5 py-4">
            <Link to="/portifolios">
              <KorumLogo className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-4 px-5 pb-6">
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-2xl border-4"
                style={{ borderColor: model.accent, aspectRatio: "4 / 3" }}
              >
                {hero ? (
                  <MediaRenderer item={hero} />
                ) : (
                  <>
                    <LedTexture className="absolute inset-0 opacity-70" color={model.accent} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="font-brand-heavy select-none text-korum-paper"
                        style={{ fontSize: "clamp(3rem, 18vw, 6rem)", textShadow: `0 0 40px ${model.accent}` }}
                      >
                        {model.name.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="font-mono text-xs text-korum-paper/90">
              <div>{sub.first}</div>
              <div className="text-korum-green">{sub.second}</div>
            </div>
            <h1
              className="font-brand-heavy leading-none tracking-normal text-korum-paper"
              style={{ fontSize: "clamp(1.6rem, 7vw, 2.6rem)" }}
            >
              {model.heroTitle} <span className="text-korum-green">{model.heroTitleEm}</span>
            </h1>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-korum-green px-4 py-2.5 text-sm font-bold text-korum-paper transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Pedir orçamento
              </a>
              <a
                href={`#${model.sections[0]?.id ?? ""}`}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-korum-paper/40 px-4 py-2.5 text-sm font-bold text-korum-paper transition-colors hover:border-korum-paper"
              >
                Ver soluções
              </a>
            </div>
          </div>
        </div>
      </Slide>

      {/* Section slides */}
      {model.sections.flatMap((section: PortfolioSection, index: number) => sectionSlides(section, index))}

      {/* Actions slide */}
      <Slide bg="navy">
        <div className="flex h-full w-full flex-col justify-center px-6 py-8">
          <EyebrowTag>ações</EyebrowTag>
          <h2
            className="font-brand-heavy mt-3 leading-tight tracking-normal"
            style={{ fontSize: "clamp(1.8rem, 7vw, 2.6rem)" }}
          >
            Gostou? Leve com você
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={pdfLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-korum-green px-4 py-3.5 text-sm font-bold text-korum-paper transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              <FileDown className="h-4 w-4" /> {pdfLoading ? "Gerando PDF…" : "Salvar em PDF"}
            </button>
            <a
              href={mailtoUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-korum-paper/10 px-4 py-3.5 text-sm text-korum-paper transition-colors hover:bg-korum-paper/20"
            >
              <Mail className="h-4 w-4" /> Enviar por e-mail
            </a>
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-korum-paper/10 px-4 py-3.5 text-sm text-korum-paper transition-colors hover:bg-korum-paper/20"
            >
              <Share2 className="h-4 w-4" /> Compartilhar no WhatsApp
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-korum-green px-4 py-3.5 text-sm font-bold text-korum-paper transition-opacity hover:opacity-90"
            >
              <Phone className="h-4 w-4" /> Entrar em contato agora
            </a>
          </div>
        </div>
      </Slide>

      {/* Contact slide */}
      <Slide bg="navy-deep">
        <div className="flex h-full w-full flex-col justify-between px-6 py-10">
          <div>
            <EyebrowTag>contato</EyebrowTag>
            <h3
              className="font-brand-heavy mt-4 leading-tight tracking-normal text-korum-paper"
              style={{ fontSize: "clamp(1.8rem, 7vw, 2.6rem)" }}
            >
              Prepare-se para o futuro
            </h3>
            <div className="mt-6 flex flex-col gap-3 font-mono text-sm text-korum-paper/80">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-korum-paper"
              >
                <MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}
              </a>
              <a href={`mailto:${EMAIL}`} className="hover:text-korum-paper break-all">
                {EMAIL}
              </a>
            </div>
          </div>
          <KorumLogo className="h-12 w-auto" />
        </div>
      </Slide>

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
        <Link to="/portifolios" className="mt-6 inline-flex rounded-lg bg-korum-green px-5 py-3 font-bold text-korum-paper">
          Ver portfólios
        </Link>
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
        <Link to="/portifolios" className="mt-6 inline-flex rounded-lg bg-korum-green px-5 py-3 font-bold text-korum-paper">
          Voltar
        </Link>
      </div>
    </main>
  );
}
