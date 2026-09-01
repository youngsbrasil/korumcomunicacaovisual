import {
  MessageCircle, Phone, Mail, MapPin, Ruler, CreditCard,
  Landmark, ShieldCheck, Instagram, Facebook, Linkedin, Youtube,
} from "lucide-react";
import { KorumLogo } from "@/components/brand/KorumLogo";
import { SiteSignature } from "@/components/brand/SiteSignature";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, EMAIL } from "@/data/models";

const WA = `https://wa.me/${WHATSAPP_NUMBER}`;

const NAV = [
  ["Início", "#topo"],
  ["Serviços", "#servicos"],
  ["Diferenciais", "#diferenciais"],
  ["Processo", "#processo"],
  ["Portfólio", "/portifolios"],
  ["Contato", "#contato"],
];

/** As 8 linhas de servico oficiais do manual de marca. */
const SERVICOS = [
  "Fachadas e revestimentos",
  "Letreiros e letras caixa",
  "Luminosos",
  "Totens",
  "Painéis de LED",
  "Sinalização interna",
  "Mobiliário comercial",
  "Identidade visual completa",
];

const SELOS = [
  [Ruler, "Visita técnica", "gratuita"],
  [CreditCard, "Parcelamento", "em até 12x"],
  [Landmark, "Pague com", "Cartão BNDES"],
  [ShieldCheck, "Garantia estendida", "em contrato"],
] as const;

const REDES = [
  [Instagram, "Instagram", "https://www.instagram.com/korumcomvisual"],
  [Facebook, "Facebook", "https://www.facebook.com/profile.php?id=61573295189033"],
  [Linkedin, "LinkedIn", "https://www.linkedin.com/company/korum-comunica%C3%A7%C3%A3o-visual/"],
  [Youtube, "YouTube", "https://www.youtube.com/@KorumComunica%C3%A7%C3%A3oVisual"],
] as const;

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-k-mono text-[11px] uppercase tracking-[0.22em] text-k-green">
      {children}
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-k-black">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Linha 1 — 4 colunas */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <KorumLogo className="h-10 w-auto" />
            <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-k-n300">
              Projeto, fabricação e instalação de comunicação visual para
              fachadas, interiores e sinalização.
            </p>
          </div>

          <nav>
            <ColTitle>Navegação</ColTitle>
            <ul className="mt-4 space-y-2.5">
              {NAV.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-k-n300 transition-colors hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <ColTitle>Serviços</ColTitle>
            <ul className="mt-4 space-y-2.5">
              {SERVICOS.map((s) => (
                <li key={s} className="text-sm text-k-n300">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-7">
            <div>
              <ColTitle>Fale com a gente</ColTitle>
              <ul className="mt-4 space-y-2.5 text-sm text-k-n300">
                <li>
                  <a
                    href={WA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-k-green" />
                    {WHATSAPP_DISPLAY}
                  </a>
                </li>
                <li className="inline-flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-k-green" />
                  (11) 4973-3953
                </li>
                <li>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex items-start gap-2.5 break-all transition-colors hover:text-white"
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-k-green" />
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <ColTitle>Visite nossa fábrica</ColTitle>
              <p className="mt-4 inline-flex items-start gap-2.5 text-sm leading-relaxed text-k-n300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-k-green" />
                <span>R. Vinte e Quatro de Maio, 351 - Vila América, Santo André - SP, 09110-150</span>
              </p>
            </div>

            <div>
              <ColTitle>CV Bahia</ColTitle>
              <p className="mt-4 inline-flex items-center gap-2.5 text-sm text-k-n300">
                <Phone className="h-4 w-4 shrink-0 text-k-green" />
                (77) 9814-3617
              </p>
            </div>
          </div>
        </div>

        {/* Linha 2 — selos + redes */}
        <div className="mt-14 flex flex-col gap-8 border-t border-white/10 pt-10 lg:flex-row lg:items-center lg:justify-between">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-10">
            {SELOS.map(([Icon, l1, l2]) => (
              <li key={l1} className="flex items-center gap-3">
                <Icon className="h-7 w-7 shrink-0 text-k-green" strokeWidth={1.5} />
                <span className="text-xs leading-snug text-k-n300">
                  {l1}
                  <br />
                  {l2}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <span className="font-k-mono hidden text-[11px] uppercase tracking-[0.18em] text-k-n300 xl:inline">
              Siga a Korum
            </span>
            {REDES.map(([Icon, nome, url]) => (
              <a
                key={nome}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={nome}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-k-n300 transition-colors hover:border-k-green hover:text-k-green"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Linha 3 — assinatura */}
        <div className="mt-12 border-t border-white/10 pt-7">
          <p className="font-k-display text-center text-sm uppercase tracking-[-0.01em] text-white">
            Sua marca vista de longe.
          </p>
          <p className="mt-3 text-center text-xs text-k-n300">
            Santo André · Grande ABC · Grande São Paulo · Bahia
          </p>
          <p className="mt-1.5 text-center text-xs text-k-n300">
            © {new Date().getFullYear()} Korum Comunicação Visual
          </p>
          <SiteSignature className="mt-3" />
        </div>
      </div>
    </footer>
  );
}
