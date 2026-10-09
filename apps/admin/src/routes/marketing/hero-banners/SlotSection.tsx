import { PlusMini } from "@medusajs/icons";
import { Button, Heading, Text } from "@medusajs/ui";

import BannerRow from "./BannerRow";
import { SLOT_LABELS, type HeroBanner, type HeroBannerSlot } from "./validators";

const SLOT_TEXTS = {
  entry: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,
  add: "Add",
  empty: "No banners in this slot.",
};

const SlotSection = ({
  slot,
  banners,
  onToggle,
  onMove,
  onEdit,
  onCreate,
  onDelete,
}: {
  slot: HeroBannerSlot;
  banners: HeroBanner[];
  onToggle: (id: string, next: boolean) => void;
  onMove: (slot: HeroBannerSlot, orderedIds: string[]) => void;
  onEdit: (b: HeroBanner) => void;
  onCreate: (slot: HeroBannerSlot) => void;
  onDelete: (b: HeroBanner) => void;
}) => {
  const ordered = [...banners].sort((a, b) => a.rank - b.rank);
  const handleMove = (id: string, dir: -1 | 1) => {
    const idx = ordered.findIndex((x) => x.id === id);
    const swapIdx = idx + dir;
    if (idx === -1 || swapIdx < 0 || swapIdx >= ordered.length) return;
    const next = [...ordered];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    onMove(slot, next.map((x) => x.id));
  };
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Heading level="h2" className="text-base font-semibold">
            {SLOT_LABELS[slot]}
          </Heading>
          <Text size="small" className="text-neutral-500">
            {SLOT_TEXTS.entry(ordered.length)}
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => onCreate(slot)}
          className="inline-flex items-center gap-1"
        >
          <PlusMini />
          {SLOT_TEXTS.add}
        </Button>
      </div>
      {ordered.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
          <Text size="small" className="text-neutral-500">
            {SLOT_TEXTS.empty}
          </Text>
        </div>
      ) : (
        <div className="space-y-3">
          {ordered.map((b, i) => (
            <BannerRow
              key={b.id}
              banner={b}
              canMoveUp={i > 0}
              canMoveDown={i < ordered.length - 1}
              onToggle={onToggle}
              onMove={(_id, dir) => handleMove(_id, dir)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SlotSection;
export { SlotSection };
