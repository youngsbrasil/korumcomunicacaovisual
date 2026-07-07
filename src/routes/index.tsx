import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { HardHat, MessageCircle, PanelsTopLeft, Wrench } from "lucide-react";

import { VoxelScene } from "@/components/VoxelScene";
import { SiteSignature } from "@/components/brand/SiteSignature";
import logoKorum from "@/assets/logo-korum-bco.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Korum Comunicação Visual — Site em Obras" },
      { name: "description", content: "Novo site da Korum Comunicação Visual em construção. Fale com a equipe ou veja portfólios por segmento." },
      { property: "og:title", content: "Korum Comunicação Visual — Site em Obras" },
      { property: "og:description", content: "Novo site da Korum Comunicação Visual em construção. Fale com a equipe ou veja portfólios por segmento." },
    ],
  }),
  component: Index,
});

const WHATSAPP_URL = "https://wa.me/551149733953?text=Ol%C3%A1%20gostaria%20de%20ajuda%20sobre%20projetos%20de%20comunica%C3%A7%C3%A3o%20visual";

function Index() {
  return (
    <main className="bg-gradient-hero bg-grid-pattern relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 text-korum-paper">
      <motion.div
        className="absolute left-10 top-10 text-korum-orange opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <Wrench size={48} />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-korum-cyan opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <HardHat size={56} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-4 md:mb-6">
        <img src={logoKorum.url} alt="Korum Comunicação Visual" className="h-12 w-auto md:h-16" />
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="mb-6 w-full max-w-2xl md:mb-8">
        <VoxelScene />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="mb-6 text-center md:mb-8">
        <h1 className="font-display mb-3 text-4xl font-black tracking-normal md:text-6xl lg:text-7xl">
          <span className="text-gradient-korum">ESTAMOS</span> <span>EM OBRAS!</span>
        </h1>
        <p className="mx-auto max-w-lg text-base leading-relaxed text-korum-paper/75 md:text-lg lg:text-xl">
          Já já um novo site para você conhecer tudo sobre a <span className="font-semibold text-korum-orange">Korum Comunicação Visual</span> e nossos Projetos Magníficos.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-korum-paper/70 md:text-base">Quer falar com a gente agora mesmo?</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pulse-glow font-display inline-flex items-center justify-center gap-3 rounded-xl bg-korum-green px-8 py-4 text-lg font-bold text-korum-paper transition-transform duration-200 hover:scale-105"
          >
            <MessageCircle className="h-6 w-6" />
            CHAME NO WHATSAPP AQUI
          </a>
          <Link
            to="/portifolios"
            className="font-display inline-flex items-center justify-center gap-3 rounded-xl border border-korum-paper/25 px-8 py-4 text-lg font-bold text-korum-paper transition-colors hover:bg-korum-paper/10"
          >
            <PanelsTopLeft className="h-6 w-6" />
            VER PORTFÓLIOS
          </Link>
        </div>
      </motion.div>

      <div className="mt-16 flex flex-col items-center gap-1 px-4 pb-4">
        <p className="text-xs text-korum-paper/60">© {new Date().getFullYear()} Korum Comunicação Visual. Todos os direitos reservados.</p>
        <SiteSignature />
      </div>
    </main>
  );
}
