import { Button, Heading, Text } from "@medusajs/ui";

import type { HeroBanner } from "./validators";

const DELETE_TEXTS = {
  title: "Delete banner",
  bodyPrefix: "Are you sure you want to delete ",
  bodySuffix: " ? This cannot be undone.",
  cancel: "Cancel",
  confirm: "Delete",
};

const DeleteConfirmDialog = ({
  deletingBanner,
  onCancel,
  onConfirm,
}: {
  deletingBanner: HeroBanner | null;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <Heading level="h3" className="text-base font-semibold">
          {DELETE_TEXTS.title}
        </Heading>
        <Text size="small" className="mt-2 text-neutral-600">
          {DELETE_TEXTS.bodyPrefix}
          &ldquo;{deletingBanner?.title_en || deletingBanner?.id}
          &rdquo;{DELETE_TEXTS.bodySuffix}
        </Text>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {DELETE_TEXTS.cancel}
          </Button>
          <Button
            variant="primary"
            className="bg-rose-600 hover:bg-rose-700"
            onClick={onConfirm}
          >
            {DELETE_TEXTS.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
export { DeleteConfirmDialog };
