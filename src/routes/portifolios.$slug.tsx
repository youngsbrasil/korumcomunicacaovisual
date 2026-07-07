import { Link, createFileRoute, notFound, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Store,
  Briefcase,
  CalendarDays,
  Eye,
  Fuel,
  ShoppingCart,
  Smartphone,
  Headset,
  Plus,
  MapPin,
  Ruler,
  Boxes,
  Layers,
  Cpu,
  Monitor,
  Radio,
  Tag,
  Package,
  Trash2,
  Droplet,
  Wrench,
  CalendarClock,
  Link2,
  Megaphone,
  LayoutGrid,
  Palette,
  Sparkles,
  Sticker,
  Signpost,
  FileDown,
  Mail,
  MessageCircle,
  Phone,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { EyebrowTag } from "@/components/brand/EyebrowTag";
import { FloatingWhatsApp } from "@/components/brand/FloatingWhatsApp";
import { KorumLogo } from "@/components/brand/KorumLogo";
import { LedTexture } from "@/components/brand/LedTexture";

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

const CHIP_ICON_RULES: Array<{ re: RegExp; icon: LucideIcon }> = [
  { re: /fachada/i, icon: Building2 },
  { re: /vitrine|loja/i, icon: Store },
  { re: /corporativ|escritóri/i, icon: Briefcase },
  { re: /evento|feira/i, icon: CalendarDays },
  { re: /tráfego|publicidade/i, icon: Eye },
  { re: /posto|combust/i, icon: Fuel },
  { re: /supermercad|hortifrut|adega/i, icon: ShoppingCart },
  { re: /app|web|celular|monitor/i, icon: Smartphone },
  { re: /suporte|atendimento/i, icon: Headset },
  { re: /nacional|mapa/i, icon: MapPin },
  { re: /cruz/i, icon: Plus },
  { re: /p2|p3|p4|p5|pixel|mm/i, icon: Ruler },
  { re: /3d/i, icon: Layers },
  { re: /poster|display/i, icon: Monitor },
  { re: /coluna/i, icon: Boxes },
  { re: /totem/i, icon: Signpost },
  { re: /painel|telão|led/i, icon: Radio },
  { re: /precificad|preço|anp/i, icon: Tag },
  { re: /kit|trilho|mobiliári/i, icon: Package },
  { re: /lixeira/i, icon: Trash2 },
  { re: /óleo|calibrad/i, icon: Droplet },
  { re: /caixa/i, icon: LayoutGrid },
  { re: /campanha|agendamento|integração|crm/i, icon: CalendarClock },
  { re: /controle/i, icon: Cpu },
  { re: /acm/i, icon: Layers },
  { re: /letra caixa/i, icon: Sparkles },
  { re: /adesiv/i, icon: Sticker },
  { re: /setor|gôndola|categoria|balcão|farmac|oferta|promocional/i, icon: Megaphone },
  { re: /projeto|engenharia|acabamento|garantia|instala/i, icon: Wrench },
  { re: /identidade|padroniz|estética/i, icon: Palette },
  { re: /integração/i, icon: Link2 },
];

function iconForChip(chip: string): LucideIcon | null {
  for (const rule of CHIP_ICON_RULES) if (rule.re.test(chip)) return rule.icon;
  return null;
}

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
        className="max-h-full max-w-full h-auto w-auto object-contain"
        style={{ display: "block", margin: "auto" }}
        loading="lazy"
      />
    );
  }
  if (item.kind === "video") {
    return (
      <video
        src={item.signedUrl}
        controls
        playsInline
        className="max-h-full max-w-full h-auto w-auto object-contain"
        style={{ display: "block", margin: "auto" }}
      />
    );
  }
  const yt = youtubeId(item.url);
  if (yt) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${yt}`}
        title={item.caption ?? "Vídeo"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
        style={{ aspectRatio: "16 / 9" }}
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

/** Slide frame: fixed 9:16, centered, snap target. Dark theme. */
function Slide({
  bg = "navy",
  role,
  children,
}: {
  bg?: "navy" | "navy-deep";
  role?: string;
  children: React.ReactNode;
}) {
  const bgColor = bg === "navy-deep" ? "#0f1626" : "#182338";
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center snap-start py-4">
      <div
        data-slide
        data-slide-bg={bgColor}
        data-slide-role={role}
        className="slide relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          width: "min(calc(100vw - 24px), calc((100dvh - 32px) * 9 / 16))",
          aspectRatio: "9 / 16",
          backgroundColor: bgColor,
          color: "#EFF1F3",
        }}
      >
        {children}
      </div>
    </div>
  );
}


/** Slim brand block bar (Korum identity). */
function BrandBlocks() {
  return (
    <div className="flex h-1.5 w-full shrink-0" aria-hidden>
      <div className="flex-1" style={{ backgroundColor: "#A6C939" }} />
      <div className="w-1/3" style={{ backgroundColor: "#0f1626" }} />
      <div className="w-6" style={{ backgroundColor: "#A6C939" }} />
    </div>
  );
}

/** Small footer signature: little Korum mark + wordmark. */
function SlideFooter({ page }: { page?: string }) {
  return (
    <div
      className="flex shrink-0 items-center justify-between px-5 py-2.5"
      style={{ borderTop: "1px solid rgba(198,206,219,0.10)" }}
    >
      <div className="flex items-center gap-2">
        <KorumLogo className="h-4 w-auto opacity-90" />
      </div>
      {page && (
        <span
          className="text-[10px] tracking-widest"
          style={{ fontFamily: "Space Mono, monospace", color: "rgba(198,206,219,0.55)" }}
        >
          {page}
        </span>
      )}
    </div>
  );
}

function PortfolioModelPage() {
  const { model } = Route.useLoaderData();
  const search = useSearch({ from: "/portifolios/$slug" });
  const sub = parseSubtitle(model.heroSubtitle);
  const waMessage = `Olá! Vi o portfólio de ${model.name} e quero um orçamento.`;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
  const waCommercialMessage = `Olá! Vi o portfólio de ${model.name} e quero falar com o comercial.`;
  const waCommercialUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waCommercialMessage)}`;
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

  // Chunk a section into slides: 1 text slide + N media slides.
  // 1 media = full-bleed hero image; 2 medias = stacked full-bleed.
  const sectionSlides = (section: PortfolioSection, index: number) => {
    const items = mediaBySection(section.id);
    const number = String(index + 1).padStart(2, "0");
    const mediaChunks: MediaItem[][] = [];
    for (let i = 0; i < items.length; i += 2) mediaChunks.push(items.slice(i, i + 2));
    const totalParts = 1 + mediaChunks.length;
    const parts: React.ReactNode[] = [];

    parts.push(
      <Slide key={`${section.id}-text`}>
        <div className="flex h-full w-full flex-col">
          <BrandBlocks />
          <div className="flex flex-1 flex-col justify-center px-6 py-8">
            <EyebrowTag>
              {number} · {section.eyebrow}
              {totalParts > 1 ? ` · 1/${totalParts}` : ""}
            </EyebrowTag>
            <h2
              className="font-brand-heavy mt-3 leading-tight tracking-normal"
              style={{ fontSize: "clamp(1.6rem, 6vw, 2.4rem)", color: "#EFF1F3" }}
            >
              {section.title}
            </h2>
            <div
              className="mt-4 space-y-3 text-sm leading-relaxed md:text-base"
              style={{ color: "#C6CEDB" }}
            >
              {section.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {section.chips.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {section.chips.map((chip, ci) => (
                  <span
                    key={chip}
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium"
                    style={
                      ci === 0
                        ? { backgroundColor: "#A6C939", color: "#182338" }
                        : {
                            backgroundColor: "#0f1626",
                            border: "1px solid #33455F",
                            color: "#C6CEDB",
                          }
                    }
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
            {items.length === 0 && (
              <div
                className="mt-6 flex flex-1 items-center justify-center rounded-2xl px-4 py-8 text-center"
                style={{ border: "2px dashed rgba(198,206,219,0.25)", color: "rgba(198,206,219,0.55)" }}
              >
                <span className="font-mono text-xs">Fotos e vídeos entram pelo painel</span>
              </div>
            )}
          </div>
          <SlideFooter page={`${number} / ${section.eyebrow}`} />
        </div>
      </Slide>,
    );

    mediaChunks.forEach((chunk, ci) => {
      const singleImage = chunk.length === 1;
      parts.push(
        <Slide key={`${section.id}-media-${ci}`}>
          <div className="flex h-full w-full flex-col">
            <BrandBlocks />
            <div className="px-6 pt-6 pb-3">
              <EyebrowTag>
                {number} · {section.eyebrow} · {ci + 2}/{totalParts}
              </EyebrowTag>
              <h3
                className="font-brand-heavy mt-2 leading-tight tracking-normal"
                style={{ fontSize: "clamp(1.05rem, 3.8vw, 1.35rem)", color: "#EFF1F3" }}
              >
                {section.title}
              </h3>
            </div>
            <div
              className={`flex flex-1 flex-col ${singleImage ? "" : "gap-1"}`}
              style={{ minHeight: 0 }}
            >
              {chunk.map((item) => (
                <figure key={item.id} className="flex min-h-0 flex-1 flex-col" style={{ backgroundColor: "#182338" }}>
                  <div className="flex flex-1 min-h-0 items-center justify-center overflow-hidden">
                    <MediaRenderer item={item} />
                  </div>
                  {item.caption && (
                    <figcaption
                      className="px-5 py-1.5 text-[11px]"
                      style={{
                        fontFamily: "Space Mono, monospace",
                        color: "#C6CEDB",
                        backgroundColor: "#0f1626",
                      }}
                    >
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
            <SlideFooter page={`${number} / ${section.eyebrow}`} />
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
      const deckEl = document.querySelector<HTMLElement>(".deck");
      const siteSlides = Array.from(
        deckEl?.querySelectorAll<HTMLElement>("[data-slide]") ?? [],
      );
      if (siteSlides.length === 0) throw new Error("no slides");

      const pdfActionsSlide = document.querySelector<HTMLElement>(
        "[data-pdf-actions] [data-slide]",
      );

      const floating = document.querySelector<HTMLElement>("[data-floating-whatsapp]");
      const prevDisplay = floating?.style.display ?? "";
      if (floating) floating.style.display = "none";

      const captureSlides: HTMLElement[] = siteSlides.map((slide) =>
        slide.dataset.slideRole === "actions" && pdfActionsSlide ? pdfActionsSlide : slide,
      );

      // Wait for images inside all slides we'll capture
      const imgs = captureSlides.flatMap((s) => Array.from(s.querySelectorAll("img")));
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

      for (let i = 0; i < captureSlides.length; i++) {
        const slide = captureSlides[i];
        const bg = slide.getAttribute("data-slide-bg") || "#182338";
        const rect = slide.getBoundingClientRect();
        const targetW = 540;
        const scale = targetW / rect.width;

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

        // Add clickable link over the CTA button in the PDF-only actions slide
        if (slide.dataset.slideRole === "actions-pdf") {
          const cta = slide.querySelector<HTMLElement>("[data-pdf-cta]");
          if (cta) {
            const slideRect = slide.getBoundingClientRect();
            const btnRect = cta.getBoundingClientRect();
            const xMM = ((btnRect.left - slideRect.left) / slideRect.width) * pdfWidthMM;
            const yMM = ((btnRect.top - slideRect.top) / slideRect.height) * pdfHeightMM;
            const wMM = (btnRect.width / slideRect.width) * pdfWidthMM;
            const hMM = (btnRect.height / slideRect.height) * pdfHeightMM;
            pdf.link(xMM, yMM, wMM, hMM, { url: waCommercialUrl });
          }
        }
      }

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
      <Slide>
        <div className="flex h-full w-full flex-col">
          <BrandBlocks />
          <div className="flex items-center justify-between px-5 py-3">
            <Link to="/portifolios">
              <KorumLogo className="h-7 w-auto" />
            </Link>
            <span
              className="text-[10px] tracking-widest uppercase"
              style={{ fontFamily: "Space Mono, monospace", color: "rgba(198,206,219,0.55)" }}
            >
              portfólio · {model.eyebrow}
            </span>
          </div>

          {/* Full-bleed hero image with accent glow */}
          <div
            className="relative flex w-full items-center justify-center overflow-hidden"
            style={{
              aspectRatio: "4 / 5",
              backgroundColor: "#182338",
              borderTop: `3px solid ${model.accent}`,
              borderBottom: `3px solid ${model.accent}`,
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.04)`,
            }}
          >
            {hero ? (
              <MediaRenderer item={hero} />
            ) : (
              <>
                <LedTexture className="absolute inset-0 opacity-70" color={model.accent} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="font-brand-heavy select-none"
                    style={{
                      fontSize: "clamp(3rem, 18vw, 6rem)",
                      color: "#EFF1F3",
                      textShadow: `0 0 40px ${model.accent}`,
                    }}
                  >
                    {model.name.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3 px-5 py-5">
            <div className="font-mono text-xs" style={{ color: "rgba(239,241,243,0.9)" }}>
              <div>{sub.first}</div>
              <div style={{ color: "#A6C939" }}>{sub.second}</div>
            </div>
            <h1
              className="font-brand-heavy leading-none tracking-normal"
              style={{ fontSize: "clamp(1.6rem, 7vw, 2.6rem)", color: "#EFF1F3" }}
            >
              {model.heroTitle}{" "}
              <span style={{ color: "#A6C939" }}>{model.heroTitleEm}</span>
            </h1>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#A6C939", color: "#182338" }}
              >
                <MessageCircle className="h-4 w-4" /> Pedir orçamento
              </a>
              <a
                href={`#${model.sections[0]?.id ?? ""}`}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors"
                style={{
                  border: "2px solid rgba(239,241,243,0.4)",
                  color: "#EFF1F3",
                }}
              >
                Ver soluções
              </a>
            </div>
          </div>
          <LedTexture className="h-6 w-full opacity-60" color={model.accent} />
        </div>
      </Slide>


      {/* Section slides */}
      {model.sections.flatMap((section: PortfolioSection, index: number) => sectionSlides(section, index))}

      {/* Actions slide */}
      <Slide role="actions">
        <div className="flex h-full w-full flex-col">
          <BrandBlocks />
          <div className="flex flex-1 flex-col justify-center px-6 py-8">
            <EyebrowTag>ações</EyebrowTag>
            <h2
              className="font-brand-heavy mt-3 leading-tight tracking-normal"
              style={{ fontSize: "clamp(1.8rem, 7vw, 2.6rem)", color: "#EFF1F3" }}
            >
              Gostou? <span style={{ color: "#A6C939" }}>Leve com você</span>
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={pdfLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: "#A6C939", color: "#182338" }}
              >
                <FileDown className="h-4 w-4" /> {pdfLoading ? "Gerando PDF…" : "Salvar em PDF"}
              </button>
              <a
                href={mailtoUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm transition-colors"
                style={{ backgroundColor: "rgba(239,241,243,0.08)", color: "#EFF1F3" }}
              >
                <Mail className="h-4 w-4" /> Enviar por e-mail
              </a>
              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm transition-colors"
                style={{ backgroundColor: "rgba(239,241,243,0.08)", color: "#EFF1F3" }}
              >
                <Share2 className="h-4 w-4" /> Compartilhar no WhatsApp
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#A6C939", color: "#182338" }}
              >
                <Phone className="h-4 w-4" /> Entrar em contato agora
              </a>
            </div>
          </div>
          <SlideFooter />
        </div>
      </Slide>

      {/* Contact slide */}
      <Slide bg="navy-deep">
        <div className="flex h-full w-full flex-col">
          <BrandBlocks />
          <div className="flex flex-1 flex-col justify-between px-6 py-10">
            <div>
              <EyebrowTag>contato</EyebrowTag>
              <h3
                className="font-brand-heavy mt-4 leading-tight tracking-normal"
                style={{ fontSize: "clamp(1.8rem, 7vw, 2.6rem)", color: "#EFF1F3" }}
              >
                Prepare-se para o <span style={{ color: "#A6C939" }}>futuro</span>
              </h3>
              <div
                className="mt-6 flex flex-col gap-3 font-mono text-sm"
                style={{ color: "rgba(239,241,243,0.8)" }}
              >
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}
                </a>
                <a href={`mailto:${EMAIL}`} className="break-all">
                  {EMAIL}
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <KorumLogo className="h-16 w-auto" />
              <LedTexture className="h-6 w-full opacity-60" color="#A6C939" />
            </div>
          </div>
        </div>
      </Slide>


      <FloatingWhatsApp message={waMessage} />

      {/* PDF-only actions slide: rendered off-screen, captured during PDF export */}
      <div
        data-pdf-actions
        aria-hidden
        style={{
          position: "fixed",
          left: "-100000px",
          top: 0,
          pointerEvents: "none",
          width: "540px",
        }}
      >
        <div
          data-slide
          data-slide-bg="#182338"
          data-slide-role="actions-pdf"
          className="slide relative overflow-hidden rounded-2xl"
          style={{ width: "540px", height: "960px", backgroundColor: "#182338", color: "#EFF1F3" }}
        >
          <div className="flex h-full w-full flex-col">
            <BrandBlocks />
            <div className="flex flex-1 flex-col justify-center px-8 py-10">
              <EyebrowTag>{"<"}fale com a gente{">"}</EyebrowTag>
              <h2
                className="font-brand-heavy mt-4 leading-tight tracking-normal"
                style={{ fontSize: "2.4rem", color: "#EFF1F3" }}
              >
                Vamos tirar seu projeto <span style={{ color: "#A6C939" }}>do papel?</span>
              </h2>
              <p className="mt-4 text-base" style={{ color: "#C6CEDB" }}>
                Toque no botão abaixo para falar direto com o nosso time comercial no WhatsApp.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4">
                <div
                  data-pdf-cta
                  className="flex w-full items-center justify-center rounded-2xl px-6 py-6 text-center font-bold"
                  style={{
                    backgroundColor: "#A6C939",
                    color: "#182338",
                    fontSize: "1.35rem",
                    boxShadow: "0 12px 30px rgba(166,201,57,0.35)",
                  }}
                >
                  Falar com o comercial agora
                </div>
                <div
                  className="text-center"
                  style={{ fontFamily: "Space Mono, monospace", color: "rgba(198,206,219,0.85)", fontSize: "0.95rem" }}
                >
                  ou ligue: (11) 9 1774-8504
                </div>
              </div>
            </div>
            <SlideFooter />
          </div>
        </div>
      </div>
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
