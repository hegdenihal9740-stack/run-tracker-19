import { createFileRoute } from "@tanstack/react-router";
import { RESOURCES, isResource } from "@/lib/admin-api/resources";

// Admin REST API: /api/public/admin/<resource>[/<id>], secured by the x-api-key header.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "content-type,x-api-key",
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: CORS });
const UUID = /^[0-9a-f-]{36}$/i;

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function handle(request: Request, splat: string | undefined) {
  const key = process.env.ADMIN_API_KEY;
  const given = request.headers.get("x-api-key") ?? "";
  if (!key || !safeEqual(given, key)) return json({ error: "Unauthorized" }, 401);

  const [name, id, ...rest] = (splat ?? "").split("/").filter(Boolean);
  if (!name) return json({ resources: Object.keys(RESOURCES) });
  if (!isResource(name) || rest.length) return json({ error: "Not found" }, 404);
  if (id && !UUID.test(id)) return json({ error: "Invalid id" }, 400);

  const res = RESOURCES[name];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin.from(res.table as never) as any;
  const method = request.method;

  if (method === "GET") {
    if (id) {
      const { data, error } = await db.select("*").eq("id", id).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return data ? json({ data }) : json({ error: "Not found" }, 404);
    }
    const url = new URL(request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 200);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
    let q = db.select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    for (const f of res.filters) {
      const v = url.searchParams.get(f);
      if (v) q = q.eq(f, v.slice(0, 200));
    }
    const search = url.searchParams.get("search")?.replace(/[,()%*]/g, "").slice(0, 100);
    if (search) q = q.or(res.search.map((c) => `${c}.ilike.%${search}%`).join(","));
    const { data, error, count } = await q;
    if (error) return json({ error: error.message }, 500);
    return json({ data, total: count, limit, offset });
  }

  let body: unknown;
  if (method === "POST" || method === "PATCH") {
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  }

  if (method === "POST" && !id) {
    if (!res.create) return json({ error: "Create not allowed for this resource" }, 405);
    const p = res.create.safeParse(body);
    if (!p.success) return json({ error: "Validation failed", details: p.error.flatten() }, 400);
    const { data, error } = await db.insert(p.data).select("*").single();
    if (error) return json({ error: error.message }, 400);
    return json({ data }, 201);
  }

  if (method === "PATCH" && id) {
    if (!res.update) return json({ error: "Update not allowed for this resource" }, 405);
    const p = res.update.safeParse(body);
    if (!p.success) return json({ error: "Validation failed", details: p.error.flatten() }, 400);
    if (!Object.keys(p.data as object).length) return json({ error: "No fields to update" }, 400);
    const { data, error } = await db.update(p.data).eq("id", id).select("*").maybeSingle();
    if (error) return json({ error: error.message }, 400);
    return data ? json({ data }) : json({ error: "Not found" }, 404);
  }

  if (method === "DELETE" && id && (name === "students" || name === "batches" || name === "fee-payments")) {
    const { error } = await db.delete().eq("id", id);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
}

export const Route = createFileRoute("/api/public/admin/$")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request, params }) => handle(request, params._splat),
      POST: async ({ request, params }) => handle(request, params._splat),
      PATCH: async ({ request, params }) => handle(request, params._splat),
      DELETE: async ({ request, params }) => handle(request, params._splat),
    },
  },
});
