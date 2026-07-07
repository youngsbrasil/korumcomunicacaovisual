import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Trash2, Upload, X } from "lucide-react";

import { KorumLogo } from "@/components/brand/KorumLogo";
import { SiteSignature } from "@/components/brand/SiteSignature";
import { adminLogin, adminVerify } from "@/lib/admin-auth.functions";
import {
  adminCreateSignedUpload,
  adminDeleteMedia,
  adminInsertMedia,
  adminListDraft,
  adminMigrateL5eAssets,
  adminPublishSlug,
  adminReorderMedia,
  adminUpdateMedia,
} from "@/lib/portfolio-media.functions";
import { models } from "@/data/models";
import { compressImage, formatBytes } from "@/lib/image-compress";

const TOKEN_KEY = "korum_admin_token";

type MediaRow = {
  id: string;
  slug: string;
  section_id: string;
  status: string;
  kind: string;
  url: string;
  caption: string | null;
  alt: string | null;
  ordem: number;
  created_at: string;
  signedUrl: string;
};

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
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!t) {
      setChecking(false);
      return;
    }
    verify({ data: { token: t } })
      .then((r) => {
        if (r.ok) setToken(t);
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
        setToken(r.token);
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
    setToken(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-korum-navy text-korum-paper">
        <p className="opacity-70">Carregando…</p>
      </div>
    );
  }

  if (token) {
    return <AdminManager token={token} onLogout={logout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-korum-navy text-korum-paper px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm flex flex-col items-center gap-6">
        <KorumLogo className="h-14 w-auto" />
        <div className="text-center">
          <h1 className="font-[Archivo_Black,sans-serif] text-3xl md:text-4xl">Painel Korum</h1>
          <p
            className="mt-1 tracking-widest text-sm"
            style={{ fontFamily: "Space Mono, monospace", color: "var(--korum-green)" }}
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
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/15 focus:border-korum-green outline-none placeholder:text-white/40"
            required
          />
        </label>
        {error && <p className="text-sm text-red-400 -mt-2 w-full text-left">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full px-6 py-3 rounded-md bg-korum-green text-korum-navy font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <SiteSignature />
      </div>
    </div>
  );
}

// ==================== MANAGER ====================

type SaveStatus = "idle" | "saving" | "saved";

function AdminManager({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [activeSlug, setActiveSlug] = useState(models[0].slug);
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [publishing, setPublishing] = useState(false);

  const list = useServerFn(adminListDraft);
  const signUpload = useServerFn(adminCreateSignedUpload);
  const insert = useServerFn(adminInsertMedia);
  const update = useServerFn(adminUpdateMedia);
  const reorder = useServerFn(adminReorderMedia);
  const del = useServerFn(adminDeleteMedia);
  const publish = useServerFn(adminPublishSlug);
  const migrateL5e = useServerFn(adminMigrateL5eAssets);
  const [migrating, setMigrating] = useState(false);

  async function handleMigrateL5e() {
    if (!confirm("Migrar TODAS as imagens antigas (do preview) para o storage do Supabase?\nIsso corrige imagens que somem no site publicado. Pode demorar alguns minutos.")) return;
    setMigrating(true);
    const toastId = toast.loading("Migrando imagens antigas…");
    try {
      const r = await migrateL5e({ data: { token } });
      toast.success(`Migradas ${r.migrated}/${r.total}. Falhas: ${r.failed}`, { id: toastId });
      await reload();
    } catch (e) {
      toast.error("Falha na migração: " + (e instanceof Error ? e.message : "erro"), { id: toastId });
    } finally {
      setMigrating(false);
    }
  }

  const activeModel = useMemo(() => models.find((m) => m.slug === activeSlug)!, [activeSlug]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await list({ data: { token, slug: activeSlug } });
      setItems(rows as MediaRow[]);
    } catch (e) {
      toast.error("Falha ao carregar mídias");
    } finally {
      setLoading(false);
    }
  }, [list, token, activeSlug]);

  useEffect(() => {
    reload();
  }, [reload]);

  function markSaving() {
    setSaveStatus("saving");
  }
  function markSaved() {
    setSaveStatus("saved");
  }

  async function handleUpload(sectionId: string, files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    for (const originalFile of arr) {
      const extRaw = (originalFile.name.split(".").pop() || "bin").toLowerCase();
      const isImage = /^(jpg|jpeg|png|webp|gif)$/.test(extRaw);
      const isVideo = /^(mp4|webm|mov|m4v)$/.test(extRaw);
      if (!isImage && !isVideo) {
        toast.error(`Formato não aceito: ${originalFile.name}`);
        continue;
      }
      markSaving();
      const toastId = toast.loading(`Enviando ${originalFile.name}…`);
      try {
        let file: File = originalFile;
        let ext = extRaw;
        if (isImage) {
          toast.loading(`Otimizando ${originalFile.name}…`, { id: toastId });
          const result = await compressImage(originalFile);
          file = result.file;
          ext = result.ext;
          if (result.compressed) {
            const saved = Math.round(
              (1 - result.finalSize / result.originalSize) * 100,
            );
            toast.loading(
              `Enviando ${file.name} (${formatBytes(result.originalSize)} → ${formatBytes(result.finalSize)}, -${saved}%)…`,
              { id: toastId },
            );
          } else {
            toast.loading(`Enviando ${file.name}…`, { id: toastId });
          }
        }
        const { path, uploadUrl } = await signUpload({
          data: { token, slug: activeSlug, ext },
        });
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!putRes.ok) throw new Error("upload failed");
        await insert({
          data: {
            token,
            slug: activeSlug,
            section_id: sectionId,
            kind: isImage ? "image" : "video",
            url: path,
          },
        });
        toast.success("Upload concluído", { id: toastId });
      } catch {
        toast.error("Erro no upload", { id: toastId });
      }
    }
    await reload();
    markSaved();
  }

  async function handleAddVideoLink(sectionId: string, url: string) {
    if (!url.trim()) return;
    markSaving();
    try {
      await insert({
        data: {
          token,
          slug: activeSlug,
          section_id: sectionId,
          kind: "videolink",
          url: url.trim(),
        },
      });
      toast.success("Link adicionado");
      await reload();
      markSaved();
    } catch {
      toast.error("Erro ao adicionar link");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta mídia?")) return;
    markSaving();
    try {
      await del({ data: { token, id } });
      await reload();
      markSaved();
    } catch {
      toast.error("Erro ao remover");
    }
  }

  async function handleUpdateCaption(id: string, caption: string) {
    markSaving();
    try {
      await update({ data: { token, id, caption } });
      markSaved();
    } catch {
      toast.error("Erro ao salvar legenda");
    }
  }

  async function handleReorder(sectionId: string, id: string, direction: -1 | 1) {
    const sectionItems = items
      .filter((i) => i.section_id === sectionId)
      .sort((a, b) => a.ordem - b.ordem);
    const idx = sectionItems.findIndex((i) => i.id === id);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= sectionItems.length) return;
    const newOrder = [...sectionItems];
    [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
    markSaving();
    try {
      await reorder({ data: { token, ids: newOrder.map((i) => i.id) } });
      await reload();
      markSaved();
    } catch {
      toast.error("Erro ao reordenar");
    }
  }

  async function handlePreview() {
    window.open(`/portifolios/${activeSlug}?preview=1&t=${encodeURIComponent(token)}`, "_blank");
  }

  async function handlePublish() {
    if (!confirm(`Publicar as alterações de "${activeModel.name}"?`)) return;
    setPublishing(true);
    try {
      const r = await publish({ data: { token, slug: activeSlug } });
      toast.success(`Publicado! Já está no ar. (${r.count ?? 0} itens)`);
    } catch {
      toast.error("Erro ao publicar");
    } finally {
      setPublishing(false);
    }
  }

  const heroItems = items.filter((i) => i.section_id === "__hero");

  const statusText =
    saveStatus === "saving"
      ? "Alterações não salvas…"
      : saveStatus === "saved"
        ? "Rascunho salvo"
        : "Tudo salvo";

  return (
    <div className="min-h-screen bg-korum-navy text-korum-paper pb-28">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-korum-navy/95 backdrop-blur border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <KorumLogo className="h-8 w-auto" />
        <div className="flex items-center gap-3 text-sm">
          <span className="opacity-60 hidden md:inline">{statusText}</span>
          <button
            onClick={handleMigrateL5e}
            disabled={migrating}
            className="px-3 py-1.5 rounded-md border border-korum-green/60 text-korum-green hover:bg-korum-green/10 transition disabled:opacity-50"
            title="Corrige imagens antigas que somem no site publicado"
          >
            {migrating ? "Migrando…" : "Migrar imagens antigas"}
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/10 transition"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 md:px-6 pt-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {models.map((m) => (
            <button
              key={m.slug}
              onClick={() => setActiveSlug(m.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeSlug === m.slug
                  ? "bg-korum-green text-korum-navy"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {m.name}
            </button>
          ))}
          <button
            onClick={() =>
              toast.info("Novos modelos são adicionados no código — peça ao desenvolvedor.")
            }
            className="px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed border-white/25 text-white/70 hover:text-white hover:border-white/40 transition"
          >
            + Novo modelo
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 pt-6">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
          <h2 className="font-[Archivo_Black,sans-serif] text-2xl md:text-3xl">
            {activeModel.name}
          </h2>
          <span className="text-sm opacity-60 md:hidden">{statusText}</span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 opacity-60 text-sm mb-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
          </div>
        )}

        {/* Hero block */}
        <SectionBlock
          title="Imagem/vídeo de destaque (topo)"
          subtitle="Apenas 1 item — subir novo substitui o atual"
          items={heroItems}
          sectionId="__hero"
          isHero
          onUpload={handleUpload}
          onAddLink={handleAddVideoLink}
          onDelete={handleDelete}
          onUpdateCaption={handleUpdateCaption}
          onReorder={handleReorder}
        />

        {/* Section blocks */}
        {activeModel.sections.map((s) => {
          const sectionItems = items
            .filter((i) => i.section_id === s.id)
            .sort((a, b) => a.ordem - b.ordem);
          return (
            <SectionBlock
              key={s.id}
              title={s.title}
              subtitle={s.eyebrow}
              items={sectionItems}
              sectionId={s.id}
              onUpload={handleUpload}
              onAddLink={handleAddVideoLink}
              onDelete={handleDelete}
              onUpdateCaption={handleUpdateCaption}
              onReorder={handleReorder}
            />
          );
        })}
      </div>

      <div className="px-4 md:px-6 pt-8 pb-6">
        <SiteSignature />
      </div>


      {/* Bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-korum-navy/95 backdrop-blur border-t border-white/10 px-4 py-3 flex gap-3 justify-end">
        <button
          onClick={handlePreview}
          className="px-5 py-2.5 rounded-md border border-white/25 hover:bg-white/10 text-sm font-medium transition inline-flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" /> Pré-visualizar
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-5 py-2.5 rounded-md bg-korum-green text-korum-navy font-semibold hover:opacity-90 disabled:opacity-50 text-sm transition"
        >
          {publishing ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </div>
  );
}

// ==================== SECTION BLOCK ====================

function SectionBlock({
  title,
  subtitle,
  items,
  sectionId,
  isHero = false,
  onUpload,
  onAddLink,
  onDelete,
  onUpdateCaption,
  onReorder,
}: {
  title: string;
  subtitle: string;
  items: MediaRow[];
  sectionId: string;
  isHero?: boolean;
  onUpload: (sectionId: string, files: FileList | File[]) => void;
  onAddLink: (sectionId: string, url: string) => void;
  onDelete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  onReorder: (sectionId: string, id: string, dir: -1 | 1) => void;
}) {
  const [linkValue, setLinkValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="mb-10 border border-white/10 rounded-xl p-4 md:p-6 bg-white/[0.02]">
      <div className="mb-4">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "Space Mono, monospace", color: "var(--korum-green)" }}
        >
          {subtitle}
        </p>
        <h3 className="font-[Archivo_Black,sans-serif] text-lg md:text-xl mt-1">{title}</h3>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) onUpload(sectionId, e.dataTransfer.files);
        }}
        className={`cursor-pointer border-2 border-dashed rounded-lg px-4 py-8 text-center text-sm transition ${
          dragOver
            ? "border-korum-green bg-korum-green/10"
            : "border-white/20 hover:border-white/40 hover:bg-white/5"
        }`}
      >
        <Upload className="w-5 h-5 mx-auto mb-2 opacity-70" />
        <p className="opacity-80">Arraste arquivos aqui ou clique para enviar</p>
        <p className="opacity-50 text-xs mt-1">JPG, PNG, WEBP · MP4, WEBM, MOV</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple={!isHero}
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onUpload(sectionId, e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Link input */}
      <div className="mt-3 flex gap-2">
        <input
          type="url"
          value={linkValue}
          onChange={(e) => setLinkValue(e.target.value)}
          placeholder="Ou cole link do YouTube/Instagram"
          className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/15 focus:border-korum-green outline-none text-sm placeholder:text-white/40"
        />
        <button
          onClick={() => {
            onAddLink(sectionId, linkValue);
            setLinkValue("");
          }}
          disabled={!linkValue.trim()}
          className="px-4 py-2 rounded-md bg-white/15 hover:bg-white/25 text-sm font-medium disabled:opacity-40 transition"
        >
          Adicionar
        </button>
      </div>

      {/* Thumbs grid */}
      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, idx) => (
            <ThumbCard
              key={item.id}
              item={item}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
              showReorder={!isHero}
              onDelete={() => onDelete(item.id)}
              onCaption={(c) => onUpdateCaption(item.id, c)}
              onMoveUp={() => onReorder(sectionId, item.id, -1)}
              onMoveDown={() => onReorder(sectionId, item.id, 1)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ThumbCard({
  item,
  isFirst,
  isLast,
  showReorder,
  onDelete,
  onCaption,
  onMoveUp,
  onMoveDown,
}: {
  item: MediaRow;
  isFirst: boolean;
  isLast: boolean;
  showReorder: boolean;
  onDelete: () => void;
  onCaption: (c: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [caption, setCaption] = useState(item.caption ?? "");
  useEffect(() => {
    setCaption(item.caption ?? "");
  }, [item.caption]);

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden border border-white/10 flex flex-col">
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {item.kind === "image" && item.signedUrl && (
          <img src={item.signedUrl} alt={item.alt ?? ""} className="w-full h-full object-cover" />
        )}
        {item.kind === "video" && item.signedUrl && (
          <video src={item.signedUrl} muted playsInline className="w-full h-full object-cover" />
        )}
        {item.kind === "videolink" && (
          <div className="text-center p-3 text-xs">
            <div className="text-2xl mb-1">▶</div>
            <div className="opacity-70 break-all line-clamp-2">{item.url}</div>
          </div>
        )}
        <button
          onClick={onDelete}
          title="Remover"
          className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 rounded-full p-1 transition"
        >
          <X className="w-4 h-4" />
        </button>
        {showReorder && (
          <div className="absolute top-1 left-1 flex flex-col gap-1">
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="bg-black/60 hover:bg-black/80 rounded p-0.5 disabled:opacity-30"
              title="Mover para cima"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="bg-black/60 hover:bg-black/80 rounded p-0.5 disabled:opacity-30"
              title="Mover para baixo"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={() => {
          if (caption !== (item.caption ?? "")) onCaption(caption);
        }}
        placeholder="Legenda…"
        className="px-2 py-1.5 bg-transparent text-xs text-white/80 placeholder:text-white/30 border-t border-white/10 outline-none focus:bg-white/5"
      />
    </div>
  );
}
