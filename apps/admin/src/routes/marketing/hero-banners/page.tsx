import { PlusMini } from "@medusajs/icons";
import { Button, Heading, Text, toast } from "@medusajs/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

import BannerModal from "./BannerModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import SlotSection from "./SlotSection";
import {
  SLOT_ORDER,
  apiFetch,
  type HeroBanner,
  type HeroBannerSlot,
} from "./validators";

export const config = {
  label: "Hero Banners",
  nested: "marketing",
  rank: 10,
};

type BannersResponse = { rows: HeroBanner[]; count: number; offset: number; limit: number };

const BANNER_TEXTS = {
  pageTitle: "Hero Banners",
  pageSubtitle:
    "Manage the three homepage hero slots: one main banner and two side cards.",
  newBanner: "New Banner",
  loading: "Loading…",
  retry: "Retry",
  loadError: "Could not load hero banners.",
  toastActivated: "Banner activated",
  toastDeactivated: "Banner deactivated",
  toastError: "Error",
  toastReordered: "Priority order updated",
  toastReorderError: "Could not update priority order",
  toastDeleted: "Banner deleted",
  toastDeleteError: "Could not delete banner",
};

function HeroBannersPage() {
  const [rows, setRows] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [createSlot, setCreateSlot] = useState<HeroBannerSlot>("main");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BannersResponse>(
        "/admin/hero-banners?limit=100"
      );
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (e: any) {
      setError(e?.message || BANNER_TEXTS.loadError);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const bySlot = useMemo(() => {
    const out: Record<HeroBannerSlot, HeroBanner[]> = {
      main: [],
      side_top: [],
      side_bottom: [],
    };
    for (const r of rows) out[r.slot]?.push(r);
    return out;
  }, [rows]);

  const handleToggle = async (id: string, next: boolean) => {
    try {
      await apiFetch(`/admin/hero-banners/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: next }),
      });
      toast.success(next ? BANNER_TEXTS.toastActivated : BANNER_TEXTS.toastDeactivated);
      await load();
    } catch (e: any) {
      toast.error(e?.message || BANNER_TEXTS.toastError);
    }
  };

  const handleReorder = async (
    slot: HeroBannerSlot,
    orderedIds: string[]
  ) => {
    try {
      await apiFetch("/admin/hero-banners/reorder", {
        method: "POST",
        body: JSON.stringify({ slot, ordered_ids: orderedIds }),
      });
      toast.success(BANNER_TEXTS.toastReordered);
      await load();
    } catch (e: any) {
      toast.error(e?.message || BANNER_TEXTS.toastReorderError);
    }
  };

  const handleEdit = (b: HeroBanner) => {
    setEditing(b);
    setCreateSlot(b.slot);
    setModalOpen(true);
  };

  const handleCreate = (slot: HeroBannerSlot) => {
    setEditing(null);
    setCreateSlot(slot);
    setModalOpen(true);
  };

  const confirmDelete = (b: HeroBanner) => {
    setDeletingId(b.id);
  };

  const runDelete = async () => {
    if (!deletingId) return;
    try {
      await apiFetch(`/admin/hero-banners/${deletingId}`, { method: "DELETE" });
      toast.success(BANNER_TEXTS.toastDeleted);
    } catch (e: any) {
      toast.error(e?.message || BANNER_TEXTS.toastDeleteError);
    } finally {
      setDeletingId(null);
      await load();
    }
  };

  const deletingBanner = rows.find((r) => r.id === deletingId) || null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading level="h1" className="text-xl font-semibold">
            {BANNER_TEXTS.pageTitle}
          </Heading>
          <Text size="small" className="text-neutral-500">
            {BANNER_TEXTS.pageSubtitle}
          </Text>
        </div>
        <Button
          variant="primary"
          onClick={() => handleCreate("main")}
          className="inline-flex items-center gap-1 self-start"
        >
          <PlusMini />
          {BANNER_TEXTS.newBanner}
        </Button>
      </header>

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <Text>{BANNER_TEXTS.loading}</Text>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">
          <Text weight="plus">{error}</Text>
          <div className="mt-3">
            <Button variant="secondary" size="small" onClick={load}>
              {BANNER_TEXTS.retry}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {SLOT_ORDER.map((slot) => (
            <SlotSection
              key={slot}
              slot={slot}
              banners={bySlot[slot]}
              onToggle={handleToggle}
              onMove={handleReorder}
              onEdit={handleEdit}
              onCreate={handleCreate}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}

      <BannerModal
        open={modalOpen}
        initial={editing}
        defaultSlot={createSlot}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={load}
      />

      {deletingId && (
        <DeleteConfirmDialog
          deletingBanner={deletingBanner}
          onCancel={() => setDeletingId(null)}
          onConfirm={runDelete}
        />
      )}
    </div>
  );
}

export default HeroBannersPage;
