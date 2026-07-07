export function SiteSignature({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-center text-xs text-korum-paper/60 ${className}`}
      style={{ fontFamily: "Space Mono, monospace" }}
    >
      Desenvolvido para gerar negócios 🎯 por{" "}
      <a
        href="https://www.youngsbrasil.com.br?utm_source=SITE&utm_medium=LINK-RODAPE&utm_campaign=KORUMCV&utm_id=CLIENTES"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-korum-paper/90 underline underline-offset-4 hover:text-korum-green"
      >
        Y&amp;Br PP&amp;M
      </a>
    </p>
  );
}
