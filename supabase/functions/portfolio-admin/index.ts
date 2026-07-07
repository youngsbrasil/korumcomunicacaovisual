import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const SIGNED_URL_TTL = 60 * 60;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url) || url.startsWith("/__l5e/") || url.startsWith("/");
}

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacHex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyAdmin(token: unknown) {
  if (typeof token !== "string") return false;
  const secret = Deno.env.get("ADMIN_SESSION_SECRET");
  if (!secret) return false;
  const [raw, sig] = token.split(".");
  if (!raw || !sig) return false;
  const expected = await hmacHex(secret, raw);
  return safeEqual(sig, expected);
}

function cleanSlug(value: unknown) {
  return String(value ?? "").slice(0, 64).replace(/[^a-z0-9_-]/gi, "");
}

function cleanId(value: unknown) {
  return String(value ?? "").slice(0, 120);
}

async function signRows(supabaseAdmin: ReturnType<typeof createClient>, rows: PortfolioMediaRow[]) {
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

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json(405, { ok: false, error: "Método não permitido." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "Supabase não configurado para administração." });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) {
    return json(400, { ok: false, error: "Requisição inválida." });
  }

  const isPublicOp = body.op === "listPublished";
  if (!isPublicOp && !(await verifyAdmin(body.token))) {
    return json(401, { ok: false, error: "Acesso não autorizado." });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    global: { fetch: createSupabaseFetch(serviceRoleKey) },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    switch (body.op) {
      case "listPublished": {
        const slug = cleanSlug(body.slug);
        const { data: rows, error } = await supabaseAdmin
          .from("portfolio_media")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .order("section_id")
          .order("ordem");
        if (error) throw error;
        return json(200, { ok: true, result: await signRows(supabaseAdmin, rows ?? []) });
      }
      case "list": {
        const slug = cleanSlug(body.slug);
        const { data: rows, error } = await supabaseAdmin
          .from("portfolio_media")
          .select("*")
          .eq("slug", slug)
          .eq("status", "draft")
          .order("section_id")
          .order("ordem");
        if (error) throw error;
        return json(200, { ok: true, result: await signRows(supabaseAdmin, rows ?? []) });
      }

      case "createSignedUpload": {
        const slug = cleanSlug(body.slug);
        const ext = String(body.ext ?? "bin").slice(0, 8).replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
        const path = `${slug}/${crypto.randomUUID()}.${ext}`;
        const { data, error } = await supabaseAdmin.storage.from("portfolios").createSignedUploadUrl(path);
        if (error || !data) throw error ?? new Error("Falha ao criar URL de upload.");
        return json(200, { ok: true, result: { path, uploadUrl: data.signedUrl, uploadToken: data.token } });
      }

      case "insertMedia": {
        const slug = cleanSlug(body.slug);
        const sectionId = String(body.section_id ?? "").slice(0, 64);
        const kind = body.kind === "video" || body.kind === "videolink" ? body.kind : "image";
        const url = String(body.url ?? "").slice(0, 1024);
        const caption = String(body.caption ?? "").slice(0, 500);
        const alt = String(body.alt ?? "").slice(0, 300);

        if (sectionId === "__hero") {
          const { data: existing, error: existingError } = await supabaseAdmin
            .from("portfolio_media")
            .select("id, kind, url")
            .eq("slug", slug)
            .eq("section_id", "__hero")
            .eq("status", "draft");
          if (existingError) throw existingError;
          for (const row of existing ?? []) {
            if (row.kind !== "videolink" && !isAbsoluteUrl(row.url)) {
              await supabaseAdmin.storage.from("portfolios").remove([row.url]);
            }
            const { error } = await supabaseAdmin.from("portfolio_media").delete().eq("id", row.id);
            if (error) throw error;
          }
        }

        const { data: maxRow, error: maxError } = await supabaseAdmin
          .from("portfolio_media")
          .select("ordem")
          .eq("slug", slug)
          .eq("section_id", sectionId)
          .eq("status", "draft")
          .order("ordem", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (maxError) throw maxError;

        const { data: inserted, error } = await supabaseAdmin
          .from("portfolio_media")
          .insert({
            slug,
            section_id: sectionId,
            status: "draft",
            kind,
            url,
            caption,
            alt,
            ordem: (maxRow?.ordem ?? -1) + 1,
          })
          .select("*")
          .single();
        if (error) throw error;
        return json(200, { ok: true, result: inserted });
      }

      case "updateMedia": {
        const patch: Record<string, string | number> = {};
        if (body.caption !== undefined) patch.caption = String(body.caption).slice(0, 500);
        if (body.alt !== undefined) patch.alt = String(body.alt).slice(0, 300);
        if (typeof body.ordem === "number") patch.ordem = Math.trunc(body.ordem);
        if (Object.keys(patch).length > 0) {
          const { error } = await supabaseAdmin.from("portfolio_media").update(patch).eq("id", cleanId(body.id));
          if (error) throw error;
        }
        return json(200, { ok: true, result: { ok: true } });
      }

      case "reorderMedia": {
        const ids = Array.isArray(body.ids) ? body.ids.map(cleanId).slice(0, 200) : [];
        for (let index = 0; index < ids.length; index += 1) {
          const { error } = await supabaseAdmin.from("portfolio_media").update({ ordem: index }).eq("id", ids[index]);
          if (error) throw error;
        }
        return json(200, { ok: true, result: { ok: true } });
      }

      case "deleteMedia": {
        const id = cleanId(body.id);
        const { data: row, error: rowError } = await supabaseAdmin
          .from("portfolio_media")
          .select("kind, url")
          .eq("id", id)
          .maybeSingle();
        if (rowError) throw rowError;
        if (row && row.kind !== "videolink" && !isAbsoluteUrl(row.url)) {
          await supabaseAdmin.storage.from("portfolios").remove([row.url]);
        }
        const { error } = await supabaseAdmin.from("portfolio_media").delete().eq("id", id);
        if (error) throw error;
        return json(200, { ok: true, result: { ok: true } });
      }

      case "publishSlug": {
        const slug = cleanSlug(body.slug);
        const { error: deleteError } = await supabaseAdmin
          .from("portfolio_media")
          .delete()
          .eq("slug", slug)
          .eq("status", "published");
        if (deleteError) throw deleteError;

        const { data: drafts, error: draftError } = await supabaseAdmin
          .from("portfolio_media")
          .select("slug, section_id, kind, url, caption, alt, ordem")
          .eq("slug", slug)
          .eq("status", "draft");
        if (draftError) throw draftError;

        const toInsert = (drafts ?? []).map((draft) => ({ ...draft, status: "published" }));
        if (toInsert.length > 0) {
          const { error: insertError } = await supabaseAdmin.from("portfolio_media").insert(toInsert);
          if (insertError) throw insertError;
        }
        return json(200, { ok: true, result: { ok: true, count: toInsert.length } });
      }

      default:
        return json(400, { ok: false, error: "Operação inválida." });
    }
  } catch (error) {
    console.error("portfolio-admin error", error);
    const message = error instanceof Error ? error.message : "Erro no painel de portfólios.";
    return json(500, { ok: false, error: message });
  }
});