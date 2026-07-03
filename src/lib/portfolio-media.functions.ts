import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "node:crypto";

function verifyAdmin(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const [raw, sig] = token.split(".");
  if (!raw || !sig) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const SIGNED_URL_TTL = 60 * 60; // 1 hour

function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u) || u.startsWith("/__l5e/") || u.startsWith("/");
}

async function signUrls<T extends { kind: string; url: string }>(
  rows: T[],
): Promise<(T & { signedUrl: string })[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return Promise.all(
    rows.map(async (row) => {
      if (row.kind === "videolink" || isAbsoluteUrl(row.url)) {
        return { ...row, signedUrl: row.url };
      }
      const { data } = await supabaseAdmin.storage
        .from("portfolios")
        .createSignedUrl(row.url, SIGNED_URL_TTL);
      return { ...row, signedUrl: data?.signedUrl ?? "" };
    }),
  );
}

// ============ PUBLIC READ (used by /portifolios/$slug) ============
export const getMediaForView = createServerFn({ method: "POST" })
  .inputValidator((data: { slug: string; preview?: boolean; token?: string }) => ({
    slug: String(data.slug).slice(0, 64),
    preview: Boolean(data.preview),
    token: data.token ? String(data.token).slice(0, 512) : undefined,
  }))
  .handler(async ({ data }) => {
    const status = data.preview ? "draft" : "published";
    if (data.preview && !verifyAdmin(data.token)) {
      // preview requires admin token
      return [];
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("portfolio_media")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", status)
      .order("section_id")
      .order("ordem");
    if (error) throw new Error(error.message);
    return signUrls(rows ?? []);
  });

// ============ ADMIN OPS ============
export const adminListDraft = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; slug: string }) => ({
    token: String(data.token).slice(0, 512),
    slug: String(data.slug).slice(0, 64),
  }))
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("portfolio_media")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "draft")
      .order("section_id")
      .order("ordem");
    if (error) throw new Error(error.message);
    return signUrls(rows ?? []);
  });

export const adminCreateSignedUpload = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; slug: string; ext: string }) => ({
    token: String(data.token).slice(0, 512),
    slug: String(data.slug).slice(0, 64).replace(/[^a-z0-9_-]/gi, ""),
    ext: String(data.ext).slice(0, 8).replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin",
  }))
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uuid = crypto.randomUUID();
    const path = `${data.slug}/${uuid}.${data.ext}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("portfolios")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Failed to sign upload");
    return { path, uploadUrl: signed.signedUrl, uploadToken: signed.token };
  });

export const adminInsertMedia = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      token: string;
      slug: string;
      section_id: string;
      kind: "image" | "video" | "videolink";
      url: string;
      caption?: string;
      alt?: string;
    }) => ({
      token: String(data.token).slice(0, 512),
      slug: String(data.slug).slice(0, 64),
      section_id: String(data.section_id).slice(0, 64),
      kind: data.kind,
      url: String(data.url).slice(0, 1024),
      caption: (data.caption ?? "").slice(0, 500),
      alt: (data.alt ?? "").slice(0, 300),
    }),
  )
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // hero section allows only 1 item — replace any existing
    if (data.section_id === "__hero") {
      const { data: existing } = await supabaseAdmin
        .from("portfolio_media")
        .select("id, kind, url")
        .eq("slug", data.slug)
        .eq("section_id", "__hero")
        .eq("status", "draft");
      for (const row of existing ?? []) {
        if (row.kind !== "videolink") {
          await supabaseAdmin.storage.from("portfolios").remove([row.url]);
        }
        await supabaseAdmin.from("portfolio_media").delete().eq("id", row.id);
      }
    }
    // next ordem
    const { data: maxRow } = await supabaseAdmin
      .from("portfolio_media")
      .select("ordem")
      .eq("slug", data.slug)
      .eq("section_id", data.section_id)
      .eq("status", "draft")
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrdem = (maxRow?.ordem ?? -1) + 1;
    const { data: inserted, error } = await supabaseAdmin
      .from("portfolio_media")
      .insert({
        slug: data.slug,
        section_id: data.section_id,
        status: "draft",
        kind: data.kind,
        url: data.url,
        caption: data.caption,
        alt: data.alt,
        ordem: nextOrdem,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

export const adminUpdateMedia = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { token: string; id: string; caption?: string; alt?: string; ordem?: number }) => ({
      token: String(data.token).slice(0, 512),
      id: String(data.id),
      caption: data.caption !== undefined ? String(data.caption).slice(0, 500) : undefined,
      alt: data.alt !== undefined ? String(data.alt).slice(0, 300) : undefined,
      ordem: typeof data.ordem === "number" ? Math.trunc(data.ordem) : undefined,
    }),
  )
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    const patch: { caption?: string; alt?: string; ordem?: number } = {};
    if (data.caption !== undefined) patch.caption = data.caption;
    if (data.alt !== undefined) patch.alt = data.alt;
    if (data.ordem !== undefined) patch.ordem = data.ordem;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("portfolio_media").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReorderMedia = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; ids: string[] }) => ({
    token: String(data.token).slice(0, 512),
    ids: (data.ids ?? []).map((id) => String(id)).slice(0, 200),
  }))
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all(
      data.ids.map((id, index) =>
        supabaseAdmin.from("portfolio_media").update({ ordem: index }).eq("id", id),
      ),
    );
    return { ok: true };
  });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string }) => ({
    token: String(data.token).slice(0, 512),
    id: String(data.id),
  }))
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("portfolio_media")
      .select("kind, url")
      .eq("id", data.id)
      .maybeSingle();
    if (row && row.kind !== "videolink") {
      await supabaseAdmin.storage.from("portfolios").remove([row.url]);
    }
    const { error } = await supabaseAdmin.from("portfolio_media").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminPublishSlug = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; slug: string }) => ({
    token: String(data.token).slice(0, 512),
    slug: String(data.slug).slice(0, 64),
  }))
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // delete existing published
    await supabaseAdmin
      .from("portfolio_media")
      .delete()
      .eq("slug", data.slug)
      .eq("status", "published");
    // fetch draft
    const { data: drafts, error } = await supabaseAdmin
      .from("portfolio_media")
      .select("slug, section_id, kind, url, caption, alt, ordem")
      .eq("slug", data.slug)
      .eq("status", "draft");
    if (error) throw new Error(error.message);
    if (!drafts || drafts.length === 0) return { ok: true, count: 0 };
    const toInsert = drafts.map((d) => ({ ...d, status: "published" as const }));
    const { error: insErr } = await supabaseAdmin.from("portfolio_media").insert(toInsert);
    if (insErr) throw new Error(insErr.message);
    return { ok: true, count: toInsert.length };
  });
