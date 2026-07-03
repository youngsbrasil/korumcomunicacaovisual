import logoKorum from "@/assets/logo-korum.png";

export function KorumLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logoKorum} alt="Korum Comunicação Visual" className={className} />;
}