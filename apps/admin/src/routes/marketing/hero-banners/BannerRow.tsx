import {
  ArrowDownMini,
  ArrowUpMini,
  PencilSquare,
  Trash,
} from "@medusajs/icons";
import { Badge, Heading, IconButton, Switch, Text, clx } from "@medusajs/ui";

import { formatQatar, statusOf, type HeroBanner } from "./validators";

const ROW_TEXTS = {
  statusLabel: {
    active: "Active",
    scheduled: "Scheduled",
    inactive: "Inactive",
    expired: "Expired",
  },
  aria: {
    moveUp: "Move up",
    moveDown: "Move down",
    edit: "Edit",
    delete: "Delete",
    toggleActive: (t: string) => `Toggle active for ${t}`,
  },
  switchLabel: {
    on: "Active",
    off: "Inactive",
  },
  start: "Start: ",
  end: "End: ",
  untitled: "Untitled",
  priority: "#",
};

const BannerRow = ({
  banner,
  canMoveUp,
  canMoveDown,
  onToggle,
  onMove,
  onEdit,
  onDelete,
}: {
  banner: HeroBanner;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggle: (id: string, next: boolean) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onEdit: (b: HeroBanner) => void;
  onDelete: (b: HeroBanner) => void;
}) => {
  const status = statusOf(banner);
  const toneClass: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    grey: "bg-slate-100 text-slate-600 border-slate-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const toggleId = `banner-toggle-${banner.id}`;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
          {banner.image_mobile || banner.image_desktop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.image_mobile || banner.image_desktop}
              alt={banner.image_alt_en || ""}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge className={clx("border", toneClass[status.tone])}>
                  {status.label}
                </Badge>
                <Text size="small" className="text-neutral-500">
                  {ROW_TEXTS.priority}
                  {banner.rank}
                </Text>
              </div>
              <Heading
                level="h3"
                className="mt-1 truncate text-base font-medium"
              >
                {banner.title_en || banner.title_ar || (
                  <span className="italic text-neutral-400">
                    {ROW_TEXTS.untitled}
                  </span>
                )}
              </Heading>
              {(banner.subtitle_en || banner.subtitle_ar) && (
                <Text size="small" className="mt-1 line-clamp-2 text-neutral-600">
                  {banner.subtitle_en || banner.subtitle_ar}
                </Text>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <IconButton
                size="small"
                variant="transparent"
                disabled={!canMoveUp}
                aria-label={ROW_TEXTS.aria.moveUp}
                onClick={() => onMove(banner.id, -1)}
              >
                <ArrowUpMini />
              </IconButton>
              <IconButton
                size="small"
                variant="transparent"
                disabled={!canMoveDown}
                aria-label={ROW_TEXTS.aria.moveDown}
                onClick={() => onMove(banner.id, 1)}
              >
                <ArrowDownMini />
              </IconButton>
              <IconButton
                size="small"
                variant="transparent"
                aria-label={ROW_TEXTS.aria.edit}
                onClick={() => onEdit(banner)}
              >
                <PencilSquare />
              </IconButton>
              <IconButton
                size="small"
                variant="transparent"
                className="text-rose-600 hover:text-rose-700"
                aria-label={ROW_TEXTS.aria.delete}
                onClick={() => onDelete(banner)}
              >
                <Trash />
              </IconButton>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
            <label
              htmlFor={toggleId}
              className="inline-flex items-center gap-2"
            >
              <Switch
                id={toggleId}
                checked={banner.is_active}
                onCheckedChange={(c) => onToggle(banner.id, !!c)}
                aria-label={ROW_TEXTS.aria.toggleActive(
                  banner.title_en || banner.id
                )}
              />
              <span className="select-none">
                {banner.is_active
                  ? ROW_TEXTS.switchLabel.on
                  : ROW_TEXTS.switchLabel.off}
              </span>
            </label>
            <span>
              {ROW_TEXTS.start}
              {formatQatar(banner.starts_at)}
            </span>
            <span>
              {ROW_TEXTS.end}
              {formatQatar(banner.ends_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerRow;
export { BannerRow };
