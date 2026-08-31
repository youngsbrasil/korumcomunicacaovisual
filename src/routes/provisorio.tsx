import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Layers,
  Monitor,
  Signpost,
  Sparkles,
  Building2,
  Ruler,
  Factory,
  HardHat,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Star,
  ChevronDown,
  Plane,
  ArrowUpDown,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useReveal } from "@/hooks/useReveal";
import { useCounter } from "@/hooks/useCounter";
import { KorumLogo } from "@/components/brand/KorumLogo";
import { SiteSignature } from "@/components/brand/SiteSignature";
import segmentSupermarket from "@/assets/segment-supermarket.jpg";
import segmentRestaurant from "@/assets/segment-restaurant.jpg";
import segmentStore from "@/assets/segment-store.jpg";
import segmentEvents from "@/assets/segment-events.jpg";
import portfolioFachadaAlt1 from "@/assets/portfolio-fachada-alternativa-1.jpeg";
import portfolioFachadaAlt2 from "@/assets/portfolio-fachada-alternativa-2.jpeg";
import portfolioFachadaAlt3 from "@/assets/portfolio-fachada-alternativa-3.jpeg";
import portfolioFachadaBK from "@/assets/portfolio-fachada-burger-king.jpg";

const WHATSAPP =
  "https://wa.me/5511917748504?text=Ol%C3%A1!%20Quero%20um%20or%C3%A7amento%20de%20comunica%C3%A7%C3%A3o%20visual.";

/* ─── Hero ─── */
const HERO_SEGMENTS: { text: string; highlight?: "green" }[] = [
  { text: "Da Fachada ao Interior: criamos lojas e " },
  { text: "negócios", highlight: "green" },
  { text: " que " },
  { text: "aparecem mais", highlight: "green" },
  { text: " e " },
  { text: "vendem mais", highlight: "green" },
  { text: "." },
];

const HERO_HIGHLIGHT_CLASS: Record<string, string> = {
  green: "text-korum-green",
};

function renderHeroText(typedText: string) {
  let remaining = typedText.length;
  return HERO_SEGMENTS.map((seg, idx) => {
    if (remaining <= 0) return null;
    const chunk = seg.text.slice(0, remaining);
    remaining -= chunk.length;
    if (!chunk) return null;
    return (
      <span key={idx} className={seg.highlight ? HERO_HIGHLIGHT_CLASS[seg.highlight] : undefined}>
        {chunk}
      </span>
    );
  });
}

function Hero() {
  const ref = useReveal<HTMLDivElement>();
  const [typedText, setTypedText] = useState("");
  const fullText = HERO_SEGMENTS.map((s) => s.text).join("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-korum-green/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-korum-cyan/10 blur-3xl" />

      <div ref={ref} className="relative z-10 mx-auto max-w-5xl px-4 pt-24 text-center">
        <div className="reveal mb-8 flex justify-center">
          <KorumLogo className="h-12 w-auto" />
        </div>
        <p
          className="reveal mb-8 text-xs uppercase tracking-[0.3em] text-korum-paper/50 sm:text-sm"
          style={{ transitionDelay: "0.1s", fontFamily: "Space Mono, monospace" }}
        >
          Comunicação Visual de Alta Performance
        </p>
        <h1 className="mb-8 min-h-[1.1em] text-4xl font-extrabold leading-[1.1] tracking-tight text-korum-paper sm:text-5xl md:text-6xl lg:text-7xl">
          {renderHeroText(typedText)}
          <span className="ml-1 inline-block h-[0.8em] w-[3px] animate-pulse bg-korum-green" />
        </h1>
        <p
          className="reveal mx-auto mb-10 max-w-2xl text-base text-korum-paper/60 sm:text-lg"
          style={{ transitionDelay: "0.5s" }}
        >
          Projetos completos em comunicação visual para todos os tipos de negócios — do
          conceito à instalação.
        </p>
        <div
          className="reveal flex flex-col justify-center gap-4 sm:flex-row"
          style={{ transitionDelay: "0.7s" }}
        >
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="group w-full bg-korum-green px-10 py-6 text-sm font-bold uppercase tracking-wider text-korum-navy shadow-lg hover:bg-korum-green-dark sm:w-auto"
            >
              Solicite um Orçamento
              <ArrowRight
                className="ml-2 transition-transform group-hover:translate-x-1"
                size={18}
              />
            </Button>
          </a>
          <Link to="/portifolios">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-korum-green bg-transparent px-10 py-6 text-sm font-bold uppercase tracking-wider text-korum-green hover:bg-korum-green hover:text-korum-navy sm:w-auto"
            >
              Conheça Nossos Projetos
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 animate-bounce">
        <ChevronDown size={24} className="text-korum-paper/40" />
      </div>
    </section>
  );
}

/* ─── Trust Strip ─── */
function TrustStrip() {
  const items = [
    { icon: Plane, label: "Atendemos todo o Brasil" },
    { icon: ArrowUpDown, label: "Parcelas facilitadas" },
    { icon: CreditCard, label: "Pague com crédito BNDES" },
  ];
  return (
    <section className="bg-korum-navy-deep py-5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-4 sm:flex-row sm:gap-16 sm:px-6 lg:px-8">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <it.icon size={26} className="text-korum-green" />
            <span className="text-sm font-semibold tracking-wide text-korum-paper">
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Solutions Nav Strip ─── */
const solutionLinks = [
  "Comunicação Visual Interna",
  "Fachadas (CVE)",
  "Painéis de LED",
  "Totens e sinalizações",
  "Estruturas Metálicas",
];

function SolutionsNav() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden border-y border-korum-navy/10 bg-korum-paper">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-korum-green via-korum-cyan to-korum-green" />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="hidden items-center md:flex">
          <div className="shrink-0 border-r border-korum-navy/10 py-4 pr-4">
            <h3 className="whitespace-nowrap text-sm font-bold leading-tight text-korum-navy lg:text-base">
              Nossas soluções
            </h3>
          </div>
          <div
            className="flex min-w-0 flex-1 items-center overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {solutionLinks.map((label, i) => (
              <button
                key={label}
                type="button"
                className="relative shrink-0 whitespace-nowrap px-3 py-5 text-[11px] font-medium text-korum-navy/70 transition-all duration-300 hover:text-korum-navy lg:px-4 lg:text-xs xl:px-5 xl:text-sm"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="relative z-10">{label}</span>
                <span
                  className={`absolute inset-0 bg-korum-navy/5 transition-all duration-300 ${
                    hovered === i ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-korum-green transition-all duration-300 ${
                    hovered === i ? "w-3/4 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="shrink-0 pl-3">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <Button className="whitespace-nowrap bg-korum-navy px-4 text-xs font-semibold text-korum-paper shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-korum-navy-deep hover:shadow-lg lg:px-6 lg:text-sm">
                Solicite um orçamento
              </Button>
            </a>
          </div>
        </div>

        <div className="space-y-2 py-3 md:hidden">
          <h3 className="text-center text-sm font-bold text-korum-navy">Nossas soluções</h3>
          <div
            className="flex items-center gap-1 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {solutionLinks.map((label) => (
              <span
                key={label}
                className="shrink-0 whitespace-nowrap rounded-full border border-korum-navy/15 px-3 py-2 text-[11px] font-medium text-korum-navy/70"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Solutions ─── */
const solutions = [
  {
    icon: Layers,
    title: "Fachadas",
    desc: "Revestimentos em ACM e alumínio composto com acabamento premium e durabilidade superior.",
  },
  {
    icon: Monitor,
    title: "Painéis de LED",
    desc: "Tecnologia P2.5 e P3.9 para comunicação dinâmica de alto impacto visual.",
  },
  {
    icon: Signpost,
    title: "Totens e Sinalizações",
    desc: "Sistemas de wayfinding e sinalização corporativa com design integrado.",
  },
  {
    icon: Sparkles,
    title: "Comunicação Interna",
    desc: "Ambientação e comunicação visual interna que fortalece a identidade da marca.",
  },
  {
    icon: Building2,
    title: "Estruturas Metálicas",
    desc: "Estruturas robustas e personalizadas para suportar projetos de grande porte.",
  },
];

function Solutions() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative bg-korum-paper py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-korum-green-dark">
            Nossas Soluções
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-korum-navy sm:text-4xl md:text-5xl">
            Engenharia aplicada à comunicação visual
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-korum-navy/60">
            Soluções completas do conceito à instalação, com qualidade e inovação.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => (
            <div
              key={s.title}
              className="reveal group relative h-full cursor-pointer rounded-xl border border-korum-navy/10 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-korum-green/60 hover:shadow-xl"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-korum-navy/10 bg-korum-navy/5 transition-colors group-hover:border-korum-green/30 group-hover:bg-korum-green/10">
                  <s.icon
                    size={24}
                    className="text-korum-navy transition-colors group-hover:text-korum-green-dark"
                  />
                </div>
                <h3 className="mb-3 text-xl font-bold text-korum-navy">{s.title}</h3>
                <p className="text-sm leading-relaxed text-korum-navy/60">{s.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-korum-green-dark opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Saiba mais <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Business Segments ─── */
const segments = [
  { title: "Supermercados e Varejos", img: segmentSupermarket },
  { title: "Restaurantes e Cafés", img: segmentRestaurant },
  { title: "Lojas e Conveniências", img: segmentStore },
  { title: "Feiras e Eventos", img: segmentEvents },
];

function BusinessSegments() {
  const ref = useReveal<HTMLDivElement>();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="bg-korum-navy py-20 sm:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="reveal mb-12 text-center text-2xl font-extrabold italic text-korum-paper sm:text-3xl lg:text-4xl">
          Soluções para cada tipo de negócio
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {segments.map((seg, i) => (
            <div
              key={seg.title}
              className="reveal group relative cursor-pointer"
              style={{ transitionDelay: `${i * 0.08}s` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`relative aspect-square overflow-hidden rounded-2xl transition-all duration-500 ${
                  hovered === i ? "scale-[1.03] shadow-2xl" : "shadow-md"
                }`}
              >
                <img
                  src={seg.img}
                  alt={seg.title}
                  loading="lazy"
                  width={768}
                  height={768}
                  className={`h-full w-full object-cover transition-transform duration-700 ${
                    hovered === i ? "scale-110" : "scale-100"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-korum-navy-deep/90 via-korum-navy/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p
                    className={`text-center text-sm font-semibold transition-all duration-300 sm:text-base ${
                      hovered === i ? "text-korum-green" : "text-korum-paper"
                    }`}
                  >
                    {seg.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="rounded-full border-korum-green bg-transparent px-8 py-3 font-semibold text-korum-green transition-all duration-300 hover:bg-korum-green hover:text-korum-navy hover:shadow-lg"
            >
              Quero um projeto para o meu negócio
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Differentials ─── */
const differentials = [
  "Processo verticalizado: projeto, produção e instalação",
  "Parque fabril próprio com CNC e corte a laser",
  "Equipe técnica certificada e especializada",
  "Atendimento em todo o território nacional",
  "Garantia e manutenção em todos os projetos",
  "Projetos 3D para visualização antecipada",
];

function Differentials() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-korum-paper py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="reveal">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-korum-green-dark">
              Diferenciais
            </p>
            <h2 className="mb-6 text-3xl font-bold text-korum-navy sm:text-4xl">
              Por que escolher a Korum?
            </h2>
            <p className="mb-8 text-korum-navy/60">
              Somos referência em comunicação visual de alta performance, combinando
              tecnologia, qualidade e agilidade em cada projeto.
            </p>
            <div className="space-y-4">
              {differentials.map((d) => (
                <div key={d} className="flex items-start gap-3">
                  <CheckCircle size={20} className="mt-0.5 shrink-0 text-korum-green-dark" />
                  <span className="text-sm text-korum-navy/80">{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal" style={{ transitionDelay: "0.2s" }}>
            <div className="relative overflow-hidden rounded-2xl bg-korum-navy p-8">
              <div className="absolute inset-0 bg-grid-pattern opacity-30" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-korum-green/20">
                    <Factory size={28} className="text-korum-green" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-korum-paper">Produção Própria</h3>
                    <p className="text-sm text-korum-paper/60">Controle total da qualidade</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-korum-paper/70">
                  Com nosso parque fabril completo, garantimos que cada etapa do processo
                  produtivo atenda aos mais altos padrões de qualidade e precisão.
                </p>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="mt-2 border-korum-paper/20 bg-transparent text-korum-paper hover:bg-korum-paper/10"
                  >
                    Conheça Nossa Infraestrutura <ArrowRight className="ml-2" size={16} />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Method ─── */
const steps = [
  {
    icon: Ruler,
    num: "01",
    title: "Projeto 3D Estratégico",
    desc: "Modelagem tridimensional que antecipa cada detalhe antes da produção. Visualize o resultado final com precisão absoluta.",
  },
  {
    icon: Factory,
    num: "02",
    title: "Produção Própria",
    desc: "Parque fabril com CNC e corte a laser. Controle total da qualidade em cada etapa do processo produtivo.",
  },
  {
    icon: HardHat,
    num: "03",
    title: "Instalação Técnica",
    desc: "Equipe especializada e certificada para instalações que exigem excelência e conformidade normativa.",
  },
];

function Method() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative overflow-hidden bg-korum-paper-muted/10 py-24 sm:py-32">
      <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-korum-green/5 blur-3xl" />
      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-korum-green-dark">
            Método Korum
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-korum-navy sm:text-4xl md:text-5xl">
            Processo verticalizado
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-korum-navy/60">
            Do conceito à instalação, cada etapa sob nosso controle.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="reveal rounded-xl border border-korum-navy/10 bg-white p-8 transition-all duration-300 hover:shadow-lg"
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-korum-green/15">
                  <s.icon size={24} className="text-korum-green-dark" />
                </div>
                <span className="select-none text-5xl font-black text-korum-navy/10">
                  {s.num}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-korum-navy">{s.title}</h3>
              <p className="text-sm leading-relaxed text-korum-navy/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Portfolio Preview ─── */
const portfolioItems = [
  {
    title: "Fachada Alternativa e Locação",
    category: "Fachada Comercial",
    span: "col-span-2 row-span-2",
    img: portfolioFachadaAlt1,
  },
  {
    title: "Fachada Alternativa e Locação",
    category: "Fachada Comercial",
    span: "col-span-1 row-span-1",
    img: portfolioFachadaAlt2,
  },
  {
    title: "Fachada Burger King",
    category: "Fachada Fast Food",
    span: "col-span-1 row-span-1",
    img: portfolioFachadaBK,
  },
  {
    title: "Fachada Alternativa e Locação",
    category: "Fachada Comercial",
    span: "col-span-2 row-span-1",
    img: portfolioFachadaAlt3,
  },
];

function PortfolioPreview() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative bg-korum-paper py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-korum-green-dark">
            Portfólio
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-korum-navy sm:text-4xl md:text-5xl">
            Projetos que falam por si
          </h2>
        </div>
        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 md:auto-rows-[240px] md:grid-cols-4">
          {portfolioItems.map((item, i) => (
            <div
              key={item.title + i}
              className={`reveal group relative cursor-pointer overflow-hidden rounded-xl bg-korum-navy ${item.span}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <img
                src={item.img}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-korum-navy-deep/95 via-korum-navy/50 to-transparent" />
              <div className="absolute bottom-0 left-0 z-20 p-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-korum-green">
                  {item.category}
                </span>
                <h3 className="mt-1 text-sm font-bold text-korum-paper sm:text-base">
                  {item.title}
                </h3>
              </div>
              <div className="absolute right-4 top-4 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ExternalLink size={16} className="text-korum-green" />
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-12 text-center">
          <Link to="/portifolios">
            <Button
              size="lg"
              className="bg-korum-navy px-8 font-semibold text-korum-paper hover:bg-korum-navy-deep"
            >
              Ver Portfólio Completo <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Numbers ─── */
function Numbers() {
  const ref = useReveal<HTMLDivElement>();
  const projects = useCounter(847);
  const sqm = useCounter(23500);
  const clients = useCounter(320);

  return (
    <section className="relative overflow-hidden bg-korum-navy py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-korum-green/10 blur-3xl" />
      <div ref={ref} className="relative mx-auto max-w-5xl px-4 text-center">
        <div className="reveal mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-korum-green">
            Números
          </p>
          <h2 className="text-3xl font-bold text-korum-paper sm:text-4xl">
            Resultados que comprovam
          </h2>
        </div>
        <div className="reveal grid grid-cols-1 gap-12 sm:grid-cols-3">
          <div ref={projects.ref} className="text-center">
            <span className="text-5xl font-black text-korum-green sm:text-7xl">
              {projects.count}+
            </span>
            <p className="mt-3 text-sm uppercase tracking-wider text-korum-paper/50">
              Projetos Entregues
            </p>
          </div>
          <div ref={sqm.ref} className="text-center">
            <span className="text-5xl font-black text-korum-green sm:text-7xl">
              {sqm.count.toLocaleString("pt-BR")}
            </span>
            <p className="mt-3 text-sm uppercase tracking-wider text-korum-paper/50">
              m² de Fachadas
            </p>
          </div>
          <div ref={clients.ref} className="text-center">
            <span className="text-5xl font-black text-korum-green sm:text-7xl">
              {clients.count}+
            </span>
            <p className="mt-3 text-sm uppercase tracking-wider text-korum-paper/50">
              Clientes Satisfeitos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: "Ricardo Almeida",
    role: "Diretor — Grupo Alfa",
    text: "A Korum entregou um projeto impecável. A qualidade da fachada superou todas as expectativas.",
  },
  {
    name: "Patrícia Santos",
    role: "Gerente — Hospital Central",
    text: "A sinalização ficou perfeita. Profissionalismo e atenção aos detalhes em cada etapa.",
  },
  {
    name: "Carlos Mendes",
    role: "CEO — Autotech",
    text: "O showroom ficou incrível. A equipe da Korum é extremamente competente e comprometida.",
  },
];

function Testimonials() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative bg-korum-paper py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-korum-green-dark">
            Depoimentos
          </p>
          <h2 className="text-3xl font-bold text-korum-navy sm:text-4xl">
            O que nossos clientes dizem
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="reveal rounded-xl border border-korum-navy/10 bg-white p-8"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="mb-4 flex gap-1">
                {[0, 1, 2, 3, 4].map((j) => (
                  <Star key={j} size={16} className="fill-korum-green text-korum-green" />
                ))}
              </div>
              <p className="mb-6 text-sm italic leading-relaxed text-korum-navy/70">
                “{t.text}”
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-korum-navy/10">
                  <span className="text-sm font-bold text-korum-navy">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-korum-navy">{t.name}</p>
                  <p className="text-xs text-korum-navy/50">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
const faqs = [
  {
    q: "Qual o prazo médio de entrega de um projeto?",
    a: "O prazo varia conforme a complexidade. Projetos de fachadas geralmente levam de 30 a 90 dias, enquanto sinalizações internas podem ser entregues em 15 a 30 dias.",
  },
  {
    q: "Vocês atendem todo o Brasil?",
    a: "Sim! Temos equipes de instalação em todo o território nacional, garantindo a mesma qualidade e padrão em qualquer localidade.",
  },
  {
    q: "Como funciona o processo de orçamento?",
    a: "Após o contato inicial, realizamos uma visita técnica para levantamento das necessidades. Em até 5 dias úteis, apresentamos o projeto 3D e o orçamento detalhado.",
  },
  {
    q: "Quais materiais são utilizados nas fachadas?",
    a: "Trabalhamos com ACM (Alumínio Composto), aço galvanizado, inox, vidro e outros materiais de alta qualidade, sempre com garantia de durabilidade e resistência.",
  },
  {
    q: "A Korum oferece manutenção?",
    a: "Sim, oferecemos planos de manutenção preventiva e corretiva para todos os nossos projetos, garantindo a longevidade e perfeito funcionamento.",
  },
];

function FAQ() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-korum-paper py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-korum-green-dark">
            Dúvidas Frequentes
          </p>
          <h2 className="text-3xl font-bold text-korum-navy sm:text-4xl">
            Perguntas e Respostas
          </h2>
        </div>
        <Accordion type="single" collapsible className="reveal space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.q}
              value={`faq-${i}`}
              className="overflow-hidden rounded-xl border border-korum-navy/10 bg-white px-6"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-korum-navy hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-korum-navy/70">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ─── Page ─── */
function ProvisorioPage() {
  return (
    <div className="min-h-screen bg-korum-paper">
      <div className="bg-korum-green px-4 py-2 text-center text-xs font-semibold uppercase tracking-widest text-korum-navy">
        Versão provisória — em construção
      </div>
      <Hero />
      <TrustStrip />
      <SolutionsNav />
      <Solutions />
      <BusinessSegments />
      <Differentials />
      <Method />
      <PortfolioPreview />
      <Numbers />
      <Testimonials />
      <FAQ />
      <footer className="bg-korum-navy-deep py-10">
        <SiteSignature />
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/provisorio")({
  head: () => ({
    meta: [
      { title: "Korum Comunicação Visual — Fachadas, LED e Sinalização" },
      {
        name: "description",
        content:
          "Projetos completos de comunicação visual: fachadas em ACM, painéis de LED, totens e sinalização. Do projeto 3D à instalação, em todo o Brasil.",
      },
      { property: "og:title", content: "Korum Comunicação Visual — Alta Performance" },
      {
        property: "og:description",
        content:
          "Fachadas, painéis de LED, totens e comunicação interna. Produção própria e instalação técnica em todo o Brasil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProvisorioPage,
});
