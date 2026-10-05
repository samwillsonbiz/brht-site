// Public game-art origin. Keep runtime assets off Google Drive.\nconst FABLE_STORAGE_ROOT =
  "https://zqwdooykgwkfhwyayucg.supabase.co/storage/v1/object/public/fable-fury-assets";

export function fableAsset(path: string) {
  const encoded = path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  return `${FABLE_STORAGE_ROOT}/${encoded}`;
}

// Runtime asset host.

// Preview deployment retry.

// Deployment retry after Vercel daily window reset.

// Deployment retry marker 2026-10-05.

// Deployment retry 2026-10-05
