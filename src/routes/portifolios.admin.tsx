import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { KorumLogo } from "@/components/brand/KorumLogo";
import { adminLogin, adminVerify } from "@/lib/admin-auth.functions";

const TOKEN_KEY = "korum_admin_token";

export const Route = createFileRoute("/portifolios/admin")({
  head: () => ({
    meta: [
      { title: "Painel Korum — Portfólios" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const login = useServerFn(adminLogin);
  const verify = useServerFn(adminVerify);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setChecking(false);
      return;
    }
    verify({ data: { token } })
      .then((r) => {
        if (r.ok) setAuthed(true);
        else localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setChecking(false));
  }, [verify]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const r = await login({ data: { password } });
      if (r.ok) {
        localStorage.setItem(TOKEN_KEY, r.token);
        setAuthed(true);
        setPassword("");
      } else {
        setError("Senha incorreta");
      }
    } catch {
      setError("Erro ao entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--korum-navy))] text-white">
        <p className="opacity-70">Carregando…</p>
      </div>
    );
  }

  if (authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[hsl(var(--korum-navy))] text-white px-6">
        <KorumLogo className="h-14 w-auto" />
        <h1 className="font-[Archivo_Black,sans-serif] text-3xl md:text-4xl text-center">
          Painel — em construção
        </h1>
        <p className="opacity-70 text-center max-w-md">
          Em breve você poderá gerenciar as mídias dos portfólios por aqui.
        </p>
        <button
          onClick={logout}
          className="mt-4 px-6 py-2 rounded-md bg-[hsl(var(--korum-green))] text-[hsl(var(--korum-navy))] font-semibold hover:opacity-90 transition"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--korum-navy))] text-white px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm flex flex-col items-center gap-6"
      >
        <KorumLogo className="h-14 w-auto" />
        <div className="text-center">
          <h1 className="font-[Archivo_Black,sans-serif] text-3xl md:text-4xl">
            Painel Korum
          </h1>
          <p
            className="mt-1 tracking-widest text-sm"
            style={{ fontFamily: "Space Mono, monospace", color: "hsl(var(--korum-green))" }}
          >
            PORTFÓLIOS
          </p>
        </div>

        <label className="w-full">
          <span className="sr-only">Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/15 focus:border-[hsl(var(--korum-green))] outline-none placeholder:text-white/40"
            required
          />
        </label>

        {error && (
          <p className="text-sm text-red-400 -mt-2 w-full text-left">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full px-6 py-3 rounded-md bg-[hsl(var(--korum-green))] text-[hsl(var(--korum-navy))] font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
