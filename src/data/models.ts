export type PortfolioSection = {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
  chips: string[];
};

export type PortfolioModel = {
  slug: string;
  name: string;
  eyebrow: string;
  accent: string;
  seo: { title: string; description: string };
  heroTitle: string;
  heroTitleEm: string;
  heroSubtitle: string;
  sections: PortfolioSection[];
};

export const models: PortfolioModel[] = [
  {
    slug: "led",
    name: "Painéis de LED",
    eyebrow: "painéis de led",
    accent: "var(--korum-cyan)",
    seo: {
      title: "Painéis de LED — Korum Comunicação Visual",
      description:
        "Painéis de LED para fachadas, totens, lobbys, supermercados e postos. Alto brilho, LED 3D, controle remoto via web.",
    },
    heroTitle: "Sua marca em",
    heroTitleEm: "alta definição, 24h por dia",
    heroSubtitle: "<soluções criativas em> <painéis de led>",
    sections: [
      {
        id: "fachadas",
        eyebrow: "fachadas",
        title: "Fachadas que param a rua",
        body: [
          "Num mundo dominado pela imagem, destacar-se é essencial. Nossos painéis de LED não são apenas telas — são portais para experiências visuais marcantes.",
          "Seja em fachadas, vitrines ou ambientes internos, transformamos sua comunicação em uma atração irresistível.",
        ],
        chips: [
          "Fachadas urbanas e comerciais",
          "Vitrines e lojas conceito",
          "Ambientes corporativos",
          "Eventos e feiras",
          "Publicidade em alto tráfego",
          "Supermercados",
          "Postos de combustíveis",
        ],
      },
      {
        id: "tecnologia",
        eyebrow: "nossa tecnologia de ponta",
        title: "Do P2 ao P5, o pixel certo pra cada distância",
        body: [
          "A inovação dos painéis de LED já é a maior realidade nos negócios, seja no Brasil ou no mundo.",
          "A Korum foi atrás das tecnologias mais inovadoras que existem e trouxe tudo o que há de melhor para o mercado nacional. Destaque: até 10.000 nits de brilho e pixels a partir de 2.5mm.",
        ],
        chips: ["P2 · até 2m", "P3 · até 3m", "P4 · até 4m", "P5 · até 5m", "LED 3D a olho nu"],
      },
      {
        id: "aplicacoes",
        eyebrow: "onde aplicamos",
        title: "De lobbys a supermercados",
        body: [
          "Oferecemos formatos customizados para qualquer ambiente: de totens interativos e painéis poster até paredes curvas e instalações circulares.",
          "Nos supermercados, comunicação ativa aumenta o desejo de compra. Nos postos, impacto 24h dentro e fora do ambiente comercial.",
        ],
        chips: ["Poster displays", "Colunas de LED", "Totens externos", "Painel telão"],
      },
    ],
  },
  {
    slug: "postos",
    name: "Postos de Combustíveis",
    eyebrow: "postos de combustíveis",
    accent: "var(--korum-green-dark)",
    seo: {
      title: "Comunicação Visual para Postos — Korum",
      description:
        "Testeiras, totens, precificadores, mobiliários e painéis de LED para postos. Referência nacional em comunicação visual.",
    },
    heroTitle: "Seu posto não pode passar",
    heroTitleEm: "despercebido",
    heroSubtitle: "<soluções criativas para> <postos de combustíveis>",
    sections: [
      {
        id: "impressao",
        eyebrow: "primeira impressão",
        title: "A imagem que convence antes do preço",
        body: [
          "Em um mercado competitivo e acelerado, a primeira impressão é o que atrai — e a comunicação visual é o seu maior aliado.",
          "Mais do que estética, entregamos estratégia: tornamos seu posto reconhecível, organizado e irresistível. Transformamos sua estrutura em um ponto de referência.",
        ],
        chips: [],
      },
      {
        id: "mobiliarios",
        eyebrow: "mobiliários para seu posto",
        title: "Itens de série, prontos pra rodar",
        body: ["Fabricamos toda a linha de mobiliários para seu posto se destacar entre os concorrentes. Tudo personalizado, do seu jeito, com a sua marca."],
        chips: ["Precificadores ANP", "Kit trilho", "Cavalete precificador", "Totem calibrador", "Mobiliário de caixa", "Expositor de óleo", "Lixeiras"],
      },
      {
        id: "led",
        eyebrow: "painéis de led para postos",
        title: "Preço vivo, atualizado em segundos",
        body: [
          "Também atuamos com fabricação e instalação de painéis e todos os tipos de comunicação com painéis de LED.",
          "Cavalete ilha, faixa de preços, painel coluna e totem monumental com atualização remota para campanhas e ofertas.",
        ],
        chips: ["Agendamento de campanhas", "Controle via app ou web", "Integração com CRMs", "Suporte técnico nacional"],
      },
      {
        id: "producao",
        eyebrow: "fabricação própria",
        title: "Tecnologia, acabamento e agilidade",
        body: [
          "A Korum já entregou grandes volumes de testeiras, bombas adesivadas e postos instalados por mês em SP e RJ.",
          "Do projeto de engenharia visual à finalização, com garantia e pós-venda. Atendemos todo o território nacional.",
        ],
        chips: [],
      },
    ],
  },
  {
    slug: "farmacias",
    name: "Farmácias",
    eyebrow: "farmácias",
    accent: "var(--korum-green)",
    seo: {
      title: "Comunicação Visual para Farmácias — Korum",
      description:
        "Fachadas em ACM, cruz de LED, letra caixa, sinalização interna e vitrines para farmácias. Padrão de rede para sua loja.",
    },
    heroTitle: "A farmácia que a rua inteira",
    heroTitleEm: "enxerga primeiro",
    heroSubtitle: "<soluções criativas para> <farmácias>",
    sections: [
      {
        id: "impressao",
        eyebrow: "primeira impressão",
        title: "Quem precisa de farmácia escolhe a que vê primeiro",
        body: [
          "Farmácia é compra de decisão rápida: o cliente escolhe a que reconhece de longe, a que parece organizada, iluminada e confiável.",
          "Mais do que estética, entregamos estratégia — tornamos sua farmácia visível, memorável e irresistível, de dia e de noite.",
        ],
        chips: [],
      },
      {
        id: "fachada",
        eyebrow: "fachada e identidade",
        title: "Do letreiro à cruz de LED",
        body: [
          "Fabricamos e instalamos toda a comunicação externa: cruz de farmácia em LED, fachada em ACM, letra caixa iluminada, painéis de LED para promoções e adesivação de vitrines.",
          "Projeto, padronização e acabamento de rede — para loja única ou para toda a sua bandeira.",
        ],
        chips: ["Cruz de LED 24h", "Letra caixa iluminada", "Fachada em ACM", "Adesivação de vitrines"],
      },
      {
        id: "interna",
        eyebrow: "sinalização interna",
        title: "Cliente que se localiza, compra mais",
        body: [
          "Organizamos o fluxo da loja com placas de setor, testeiras de gôndola e comunicação de categoria.",
          "O cliente encontra rápido o que veio buscar — e enxerga o que não veio, aumentando o tíquete médio.",
        ],
        chips: ["Placas de setor", "Testeiras de gôndola", "Faixas de ofertas em LED", "Comunicação de balcão", "Serviços farmacêuticos"],
      },
    ],
  },
  {
    slug: "supermercados",
    name: "Supermercados",
    eyebrow: "supermercados",
    accent: "var(--korum-orange)",
    seo: {
      title: "Comunicação Visual para Supermercados — Korum",
      description:
        "Fachadas, painéis de LED suspensos, testeiras de gôndola e sinalização de setores para supermercados. Aumente o volume de vendas.",
    },
    heroTitle: "Comunicação que",
    heroTitleEm: "vende na gôndola",
    heroSubtitle: "<soluções criativas para> <supermercados>",
    sections: [
      {
        id: "vendas",
        eyebrow: "desejo de compra",
        title: "Aumente o volume de vendas o tempo todo",
        body: [
          "Aumente o volume de vendas usando comunicação eficiente e direcionada o tempo todo.",
          "Com elementos visuais de LED no seu supermercado, os clientes são impactados com comunicação ativa — e isso aumenta o desejo de compra.",
        ],
        chips: ["Painéis suspensos", "Faixas de gôndola", "Fachada em LED", "Colunas promocionais"],
      },
      {
        id: "setores",
        eyebrow: "sinalização de setores",
        title: "Loja organizada, cliente que circula mais",
        body: [
          "Sinalização de setores, testeiras e comunicação de categoria que orientam o fluxo e valorizam as ofertas.",
          "Do hortifruti à adega, cada setor com identidade visual clara e atrativa.",
        ],
        chips: ["Placas de setor", "Testeiras de gôndola", "Comunicação de ofertas", "Sinalização de caixas"],
      },
      {
        id: "fachada",
        eyebrow: "fachada e estacionamento",
        title: "Visto de longe, lembrado sempre",
        body: [
          "Fachadas, totens e painéis que fazem seu supermercado ser visto de longe e lembrado na hora da compra.",
          "Projeto completo do início ao fim, com garantia e atendimento nacional.",
        ],
        chips: [],
      },
    ],
  },
];

export const findModel = (slug: string) => models.find((model) => model.slug === slug);

export const WHATSAPP_NUMBER = "5511917748504";
export const WHATSAPP_DISPLAY = "(11) 9 1774-8504";
export const EMAIL = "comercial2@korumcomunicacaovisual.com.br";