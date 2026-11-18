"use client";

import { useEffect, useRef, useState } from "react";
import { useYasminat } from "../Provider";
import { MascotCard } from "./MascotWelcome";
import { mountMascotDock } from "./mascot-scenes";

/** Persistent introduction launcher. The photo assistant remains a disclosed concept. */
export function MascotDock() {
  const { language, tr } = useYasminat();
  const root = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<ReturnType<typeof mountMascotDock> | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const element = root.current,
      shell = element?.closest<HTMLElement>(".screen-shell");
    if (!element || !shell) return;
    const dock = mountMascotDock(element, {
      shell,
      language,
      onOpen: () => setOpen(true),
      isPanelOpen: () => !!dialog.current?.open,
    });
    controller.current = dock;
    return () => {
      dock.destroy();
      controller.current = null;
    };
  }, [language]);
  useEffect(() => {
    const panel = dialog.current;
    if (!panel) return;
    if (open && !panel.open) panel.showModal();
    else if (!open && panel.open) panel.close();
    controller.current?.panelChanged(open);
  }, [open]);
  return (
    <>
      <div ref={root} className="mascot-dock" data-release="mascot-scenes-v1" />
      <dialog
        ref={dialog}
        className="mascot-dock-panel"
        aria-label={tr(
          "التعريف بمساعد ياسمينات",
          "Yasminat companion introduction",
        )}
        onClose={(event) => {
          if(event.target!==event.currentTarget)return;
          setOpen(false);
          controller.current?.panelChanged(false);
          root.current
            ?.querySelector<HTMLButtonElement>(".dock-launch")
            ?.focus({ preventScroll: true });
        }}
      >
        {open && (
          <>
            <div className="dock-panel-heading">
              <strong>{tr("مساعد ياسمينات", "Yasminat companion")}</strong>
              <button
                type="button"
                className="dock-panel-close"
                aria-label={tr("إغلاق المساعد", "Close assistant")}
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <MascotCard language={language} />
            <p className="dock-disclosure">
              {tr(
                "معاينة تعريفية · خدمة الذكاء الاصطناعي وتنسيق الصور قيد التطوير.",
                "Introduction preview · AI and photo styling are in development.",
              )}
            </p>
          </>
        )}
      </dialog>
    </>
  );
}
