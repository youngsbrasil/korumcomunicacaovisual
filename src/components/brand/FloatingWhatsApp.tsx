import { MessageCircle } from "lucide-react";

import { WHATSAPP_NUMBER } from "@/data/models";

export function FloatingWhatsApp({ message = "Olá, gostaria de falar com a Korum." }: { message?: string }) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      data-floating-whatsapp
      className="pulse-glow fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-korum-whatsapp px-4 py-3 font-bold text-korum-paper shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}