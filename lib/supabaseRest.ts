type JsonRecord = Record<string, unknown>;

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const serverKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serverKey) {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY as server-only environment variables.",
    );
  }
  return { url: url.replace(/\/$/, ""), serverKey };
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}

async function request(
  path: string,
  init: RequestInit = {},
  searchParams?: Record<string, string>,
) {
  const { url, serverKey } = getConfig();
  const endpoint = new URL(`${url}/rest/v1/${path}`);
  Object.entries(searchParams ?? {}).forEach(([key, value]) =>
    endpoint.searchParams.set(key, value),
  );

  const response = await fetch(endpoint, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: serverKey,
      Authorization: `Bearer ${serverKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Supabase REST request failed (${response.status})${body ? `: ${body.slice(0, 300)}` : ""}`,
    );
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function upsertRows(
  table: string,
  rows: JsonRecord[],
  onConflict: string,
) {
  if (!rows.length) return [];
  return request(
    table,
    {
      method: "POST",
      body: JSON.stringify(rows),
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
    },
    { on_conflict: onConflict },
  );
}

export async function insertRows(table: string, rows: JsonRecord[]) {
  if (!rows.length) return [];
  return request(table, {
    method: "POST",
    body: JSON.stringify(rows),
    headers: { Prefer: "return=representation" },
  });
}

export async function selectRows(
  table: string,
  query: Record<string, string> = {},
) {
  return request(table, { method: "GET" }, query);
}

export async function rpc<T = unknown>(
  functionName: string,
  args: JsonRecord = {},
): Promise<T> {
  return request(`rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify(args),
  }) as Promise<T>;
}
