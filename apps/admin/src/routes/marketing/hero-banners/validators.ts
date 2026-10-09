import * as zod from "zod";

export type HeroBannerSlot = "main" | "side_top" | "side_bottom";

export type HeroBanner = {
  id: string;
  slot: HeroBannerSlot;
  rank: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  title_en: string | null;
  title_ar: string | null;
  subtitle_en: string | null;
  subtitle_ar: string | null;
  cta_label_en: string | null;
  cta_label_ar: string | null;
  cta_link: string | null;
  image_desktop: string;
  image_mobile: string | null;
  image_alt_en: string;
  image_alt_ar: string | null;
  created_at: string;
  updated_at: string;
};

export const SLOT_LABELS: Record<HeroBannerSlot, string> = {
  main: "Main banner slot",
  side_top: "Top side card slot",
  side_bottom: "Bottom side card slot",
};

export const SLOT_ORDER: HeroBannerSlot[] = ["main", "side_top", "side_bottom"];

export const UPLOAD_DIMS = {
  main: { desktop: "2760 × 1200", mobile: "1242 × 540" },
  side_top: { desktop: "2001 × 972", mobile: "1242 × 603" },
  side_bottom: { desktop: "2001 × 972", mobile: "1242 × 603" },
} as const;

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];

export const INTERNAL_LINK_RE = /^\/(?!\/)[A-Za-z0-9/_\-#?%.=&+,]*$/;
export const EXTERNAL_HTTPS_RE = /^https:\/\/[^\s"'<>]+$/i;

export const formatQatar = (iso: string | null): string => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return (
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Qatar",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d) + " (Doha)"
    );
  } catch {
    return iso;
  }
};

export const statusOf = (
  b: HeroBanner
): {
  key: "active" | "scheduled" | "expired" | "inactive";
  label: string;
  tone: "green" | "blue" | "grey" | "red";
} => {
  if (!b.is_active) return { key: "inactive", label: "Inactive", tone: "red" };
  const now = Date.now();
  const s = b.starts_at ? new Date(b.starts_at).getTime() : null;
  const e = b.ends_at ? new Date(b.ends_at).getTime() : null;
  if (s && s > now) return { key: "scheduled", label: "Scheduled", tone: "blue" };
  if (e && e <= now) return { key: "expired", label: "Expired", tone: "grey" };
  return { key: "active", label: "Active", tone: "green" };
};

export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const initHeaders = ((init.headers as Record<string, string>) || {});
  const hasCT = Object.keys(initHeaders).some(
    (k) => k.toLowerCase() === "content-type"
  );
  const mergedHeaders: Record<string, string> = {
    ...(hasCT ? {} : { "Content-Type": "application/json" }),
    ...initHeaders,
  };
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: mergedHeaders,
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data &&
        (data.message ||
          (data.errors && Object.values(data.errors).join(" ; ")))) ||
      `Error ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data as T;
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("files", file);
  const res = await fetch("/admin/uploads", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Invalid upload response");
  }
  if (!res.ok) {
    throw new Error(data?.message || `Upload failed ${res.status}`);
  }
  const url = data?.files?.[0]?.url;
  if (!url) throw new Error("Image URL missing after upload");
  return { url };
}

export function validateLocalFile(f: File): string | null {
  const ext = f.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_IMAGE_EXT.includes(ext))
    return `Type ${ext.toUpperCase()} not allowed (allowed: ${ALLOWED_IMAGE_EXT.join(", ")})`;
  if (f.size > MAX_IMAGE_BYTES)
    return `File too large (${(f.size / 1024 / 1024).toFixed(2)} MB, max 2 MB)`;
  return null;
}

export const toLocalInput = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  try {
    const utcMs = d.getTime() + 3 * 60 * 60 * 1000;
    const q = new Date(utcMs);
    return `${q.getUTCFullYear()}-${pad(q.getUTCMonth() + 1)}-${pad(
      q.getUTCDate()
    )}T${pad(q.getUTCHours())}:${pad(q.getUTCMinutes())}`;
  } catch {
    return "";
  }
};

export const fromLocalInput = (val: string | undefined | null): string | null => {
  if (!val) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  const utcMs = d.getTime() - 3 * 60 * 60 * 1000;
  return new Date(utcMs).toISOString();
};

export const HeroBannerFormSchema = zod
  .object({
    slot: zod.enum(["main", "side_top", "side_bottom"]),
    rank: zod.number().int().min(0).default(0),
    is_active: zod.boolean().default(true),
    starts_at: zod.string().nullable().optional(),
    ends_at: zod.string().nullable().optional(),
    title_en: zod.string().trim().max(120).nullable().optional(),
    title_ar: zod.string().trim().max(120).nullable().optional(),
    subtitle_en: zod.string().trim().max(240).nullable().optional(),
    subtitle_ar: zod.string().trim().max(240).nullable().optional(),
    cta_label_en: zod.string().trim().max(60).nullable().optional(),
    cta_label_ar: zod.string().trim().max(60).nullable().optional(),
    cta_link: zod.string().trim().nullable().optional(),
    image_desktop: zod.string().min(1, "Desktop image required"),
    image_mobile: zod.string().trim().nullable().optional(),
    image_alt_en: zod.string().trim().min(1, "Alt text EN required"),
    image_alt_ar: zod.string().trim().nullable().optional(),
  })
  .superRefine((v, ctx) => {
    const hasLabel =
      (typeof v.cta_label_en === "string" && v.cta_label_en.length > 0) ||
      (typeof v.cta_label_ar === "string" && v.cta_label_ar.length > 0);
    if (hasLabel && !v.cta_link) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        path: ["cta_link"],
        message: "Link required when button text is provided",
      });
    }
    if (v.cta_link) {
      const ok =
        INTERNAL_LINK_RE.test(v.cta_link) || EXTERNAL_HTTPS_RE.test(v.cta_link);
      if (!ok) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          path: ["cta_link"],
          message: "Internal link starting with a single '/' or https:// URL",
        });
      } else if (
        /^javascript:|^data:|^vbscript:|^mailto:|^tel:/i.test(v.cta_link)
      ) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          path: ["cta_link"],
          message: "Forbidden link scheme",
        });
      }
    }
    if (v.starts_at && v.ends_at) {
      const s = new Date(v.starts_at).getTime();
      const e = new Date(v.ends_at).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e <= s) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          path: ["ends_at"],
          message: "End must be strictly after start",
        });
      }
    }
  });

export type FormValues = zod.infer<typeof HeroBannerFormSchema>;
