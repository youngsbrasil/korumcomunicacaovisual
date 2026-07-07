import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "node:crypto";

type PortfolioMediaRow = {
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
};

type SignedPortfolioMediaRow = PortfolioMediaRow & { signedUrl: string };

type PortfolioAdminPayload =
  | { op: "list"; token: string; slug: string }
  | { op: "createSignedUpload"; token: string; slug: string; ext: string }
  | {
      op: "insertMedia";
      token: string;
      slug: string;
      section_id: string;
      kind: "image" | "video" | "videolink";
      url: string;
      caption?: string;
      alt?: string;
    }
  | { op: "updateMedia"; token: string; id: string; caption?: string; alt?: string; ordem?: number }
  | { op: "reorderMedia"; token: string; ids: string[] }
  | { op: "deleteMedia"; token: string; id: string }
  | { op: "publishSlug"; token: string; slug: string };

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

function hasServiceRoleKey() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getPostgresConfig() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (connectionString) {
    return {
      connectionString,
      ssl: { rejectUnauthorized: false },
    };
  }

  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) return null;

  return {
    host: PGHOST,
    port: PGPORT ? Number(PGPORT) : 5432,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  };
}

function hasPostgresConfig() {
  return Boolean(process.env.SUPABASE_DB_URL || getPostgresConfig());
}

function canCallPortfolioAdminEdge() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

async function callPortfolioAdminEdge<T>(payload: PortfolioAdminPayload): Promise<T> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Backend de portfólios não configurado.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/portfolio-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => null)) as
    | { ok?: boolean; result?: T; error?: string }
    | null;

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error ?? `Falha no backend de portfólios (${response.status}).`);
  }

  return result.result as T;
}

async function withPortfolioDb<T>(callback: (client: import("pg").PoolClient) => Promise<T>) {
  const config = getPostgresConfig();
  if (!config) {
    throw new Error("Banco de dados não configurado no preview.");
  }

  const { Pool } = await import("pg");
  const pool = new Pool(config);
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
    await pool.end();
  }
}

function mapPortfolioRow(row: Record<string, unknown>): PortfolioMediaRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    section_id: String(row.section_id),
    status: String(row.status),
    kind: String(row.kind),
    url: String(row.url),
    caption: row.caption == null ? null : String(row.caption),
    alt: row.alt == null ? null : String(row.alt),
    ordem: Number(row.ordem ?? 0),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? new Date().toISOString()),
  };
}

async function readMediaRows(slug: string, status: "draft" | "published") {
  if (hasServiceRoleKey()) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("portfolio_media")
      .select("*")
      .eq("slug", slug)
      .eq("status", status)
      .order("section_id")
      .order("ordem");
    if (error) throw new Error(error.message);
    return (rows ?? []).map((row) => mapPortfolioRow(row));
  }

  if (!hasPostgresConfig()) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase não configurado no preview.");
    }

    const supabasePublic = createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { data: rows, error } = await supabasePublic
      .from("portfolio_media")
      .select("*")
      .eq("slug", slug)
      .eq("status", status)
      .order("section_id")
      .order("ordem");
    if (error) throw new Error(error.message);
    return (rows ?? []).map((row) => mapPortfolioRow(row));
  }

  return withPortfolioDb(async (client) => {
    const result = await client.query(
      `SELECT id, slug, section_id, status, kind, url, caption, alt, ordem, created_at
       FROM public.portfolio_media
       WHERE slug = $1 AND status = $2
       ORDER BY section_id ASC, ordem ASC`,
      [slug, status],
    );
    return result.rows.map(mapPortfolioRow);
  });
}

async function signUrls<T extends { kind: string; url: string }>(
  rows: T[],
): Promise<(T & { signedUrl: string })[]> {
  const supabaseAdmin = hasServiceRoleKey()
    ? (await import("@/integrations/supabase/client.server")).supabaseAdmin
    : null;
  return Promise.all(
    rows.map(async (row) => {
      if (row.kind === "videolink" || isAbsoluteUrl(row.url)) {
        return { ...row, signedUrl: row.url };
      }
      if (!supabaseAdmin) {
        return { ...row, signedUrl: "" };
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
    if (data.preview && !hasServiceRoleKey() && !hasPostgresConfig() && canCallPortfolioAdminEdge()) {
      return callPortfolioAdminEdge<SignedPortfolioMediaRow[]>({
        op: "list",
        token: data.token ?? "",
        slug: data.slug,
      });
    }
    const rows = await readMediaRows(data.slug, status);
    return signUrls(rows);
  });

// ============ ADMIN OPS ============
export const adminListDraft = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; slug: string }) => ({
    token: String(data.token).slice(0, 512),
    slug: String(data.slug).slice(0, 64),
  }))
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    if (!hasServiceRoleKey() && !hasPostgresConfig() && canCallPortfolioAdminEdge()) {
      return callPortfolioAdminEdge<SignedPortfolioMediaRow[]>({
        op: "list",
        token: data.token,
        slug: data.slug,
      });
    }
    let rows = await readMediaRows(data.slug, "draft");
    if (rows.length === 0 && !hasServiceRoleKey() && !hasPostgresConfig()) {
      rows = await readMediaRows(data.slug, "published");
    }
    return signUrls(rows);
  });

export const adminCreateSignedUpload = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; slug: string; ext: string }) => ({
    token: String(data.token).slice(0, 512),
    slug: String(data.slug).slice(0, 64).replace(/[^a-z0-9_-]/gi, ""),
    ext: String(data.ext).slice(0, 8).replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin",
  }))
  .handler(async ({ data }) => {
    if (!verifyAdmin(data.token)) throw new Error("Unauthorized");
    if (!hasServiceRoleKey()) {
      if (canCallPortfolioAdminEdge()) {
        return callPortfolioAdminEdge<{ path: string; uploadUrl: string; uploadToken: string }>({
          op: "createSignedUpload",
          token: data.token,
          slug: data.slug,
          ext: data.ext,
        });
      }
      throw new Error("Upload indisponível: backend de portfólios não configurado.");
    }
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
    if (!hasServiceRoleKey() && !hasPostgresConfig() && canCallPortfolioAdminEdge()) {
      return callPortfolioAdminEdge<PortfolioMediaRow>({ op: "insertMedia", ...data });
    }
    if (!hasServiceRoleKey()) {
      return withPortfolioDb(async (client) => {
        await client.query("BEGIN");
        try {
          if (data.section_id === "__hero") {
            await client.query(
              `DELETE FROM public.portfolio_media
               WHERE slug = $1 AND section_id = '__hero' AND status = 'draft'`,
              [data.slug],
            );
          }

          const maxResult = await client.query(
            `SELECT ordem
             FROM public.portfolio_media
             WHERE slug = $1 AND section_id = $2 AND status = 'draft'
             ORDER BY ordem DESC
             LIMIT 1`,
            [data.slug, data.section_id],
          );
          const nextOrdem = Number(maxResult.rows[0]?.ordem ?? -1) + 1;
          const inserted = await client.query(
            `INSERT INTO public.portfolio_media (slug, section_id, status, kind, url, caption, alt, ordem)
             VALUES ($1, $2, 'draft', $3, $4, $5, $6, $7)
             RETURNING id, slug, section_id, status, kind, url, caption, alt, ordem, created_at`,
            [
              data.slug,
              data.section_id,
              data.kind,
              data.url,
              data.caption,
              data.alt,
              nextOrdem,
            ],
          );
          await client.query("COMMIT");
          return mapPortfolioRow(inserted.rows[0]);
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      });
    }

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
    if (!hasServiceRoleKey() && !hasPostgresConfig() && canCallPortfolioAdminEdge()) {
      return callPortfolioAdminEdge<{ ok: true }>({ op: "updateMedia", ...data });
    }
    if (!hasServiceRoleKey()) {
      await withPortfolioDb(async (client) => {
        await client.query(
          `UPDATE public.portfolio_media
           SET caption = COALESCE($1, caption),
               alt = COALESCE($2, alt),
               ordem = COALESCE($3, ordem)
           WHERE id = $4`,
          [patch.caption ?? null, patch.alt ?? null, patch.ordem ?? null, data.id],
        );
      });
      return { ok: true };
    }
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
    if (!hasServiceRoleKey() && !hasPostgresConfig() && canCallPortfolioAdminEdge()) {
      return callPortfolioAdminEdge<{ ok: true }>({
        op: "reorderMedia",
        token: data.token,
        ids: data.ids,
      });
    }
    if (!hasServiceRoleKey()) {
      await withPortfolioDb(async (client) => {
        await client.query("BEGIN");
        try {
          for (let index = 0; index < data.ids.length; index += 1) {
            await client.query("UPDATE public.portfolio_media SET ordem = $1 WHERE id = $2", [
              index,
              data.ids[index],
            ]);
          }
          await client.query("COMMIT");
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      });
      return { ok: true };
    }
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
    if (!hasServiceRoleKey() && !hasPostgresConfig() && canCallPortfolioAdminEdge()) {
      return callPortfolioAdminEdge<{ ok: true }>({ op: "deleteMedia", token: data.token, id: data.id });
    }
    if (!hasServiceRoleKey()) {
      await withPortfolioDb(async (client) => {
        await client.query("DELETE FROM public.portfolio_media WHERE id = $1", [data.id]);
      });
      return { ok: true };
    }
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
    if (!hasServiceRoleKey() && !hasPostgresConfig() && canCallPortfolioAdminEdge()) {
      return callPortfolioAdminEdge<{ ok: true; count: number }>({
        op: "publishSlug",
        token: data.token,
        slug: data.slug,
      });
    }
    if (!hasServiceRoleKey()) {
      return withPortfolioDb(async (client) => {
        await client.query("BEGIN");
        try {
          await client.query(
            "DELETE FROM public.portfolio_media WHERE slug = $1 AND status = 'published'",
            [data.slug],
          );
          const inserted = await client.query(
            `INSERT INTO public.portfolio_media (slug, section_id, kind, url, caption, alt, ordem, status)
             SELECT slug, section_id, kind, url, caption, alt, ordem, 'published'
             FROM public.portfolio_media
             WHERE slug = $1 AND status = 'draft'
             RETURNING id`,
            [data.slug],
          );
          await client.query("COMMIT");
          return { ok: true, count: inserted.rowCount ?? 0 };
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      });
    }
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
