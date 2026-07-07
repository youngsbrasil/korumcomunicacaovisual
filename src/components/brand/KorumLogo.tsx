import logoKorum from "@/assets/logo-korum-bco.png.asset.json";

export function KorumLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logoKorum.url} alt="Korum Comunicação Visual" className={className} />;
}
