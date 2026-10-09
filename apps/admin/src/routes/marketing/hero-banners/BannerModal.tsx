import { zodResolver } from "@hookform/resolvers/zod";
import { XMarkMini } from "@medusajs/icons";
import {
  Button,
  Heading,
  IconButton,
  Input,
  Switch,
  Text,
  toast,
} from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import {
  SLOT_LABELS,
  SLOT_ORDER,
  UPLOAD_DIMS,
  apiFetch,
  fromLocalInput,
  toLocalInput,
  uploadImage,
  validateLocalFile,
  type FormValues,
  type HeroBanner,
  type HeroBannerSlot,
  HeroBannerFormSchema,
} from "./validators";

const BANNER_TEXTS = {
  toasts: {
    desktopUploaded: "Desktop image uploaded",
    uploadFailed: "Upload failed",
    mobileUploaded: "Mobile image uploaded",
    bannerUpdated: "Banner updated",
    bannerCreated: "Banner created",
    saveError: "Save error",
  },
  heading: {
    edit: "Edit banner",
    new: "New banner",
  },
  aria: {
    close: "Close",
  },
  labels: {
    slot: "Slot",
    rank: "Rank (priority within slot)",
    imageDesktop: "Desktop image *",
    imageMobile: "Mobile image",
    altEn: "Alt text EN *",
    altAr: "Alt text AR",
    titleEn: "Title EN",
    titleAr: "Title AR",
    subtitleEn: "Subtitle EN",
    subtitleAr: "Subtitle AR",
    ctaEn: "Button text EN",
    ctaAr: "Button text AR",
    link: "Button link",
    start: "Start",
    end: "End",
    status: "Status",
  },
  alt: {
    desktopPreview: "desktop preview",
    mobilePreview: "mobile preview",
  },
  hints: {
    desktopRecommended: (dims: string) => `Recommended ${dims} — jpg/png/webp ≤ 2 MB`,
    mobileRecommended: (dims: string) => `Recommended ${dims} — falls back to desktop if empty`,
    safeZone: "Safe area — keep subject/text inside the center ~80% (8% margin all sides) to avoid edge crop across widths.",
    altPurpose: "For screen readers and SEO",
    titleSeo: "SEO only — not displayed; the image carries its own text.",
    linkFormat: "Internal path (e.g. /qa/categories/flowers) or https://...",
    dohaTz: "Doha timezone UTC+3",
    dohaTzAfterStart: "Doha timezone UTC+3, after Start",
    activeVisible: "Active — visible if within date range",
    inactiveHidden: "Inactive — never displayed",
  },
  placeholders: {
    altEnExample: "e.g. Yellow flower bouquet",
    subtitleEnExample: "Free delivery in Doha",
  },
  buttons: {
    cancel: "Cancel",
    save: "Save",
    create: "Create",
  },
};

const BannerModal = ({
  open,
  initial,
  defaultSlot,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: HeroBanner | null;
  defaultSlot: HeroBannerSlot;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [desktopPreview, setDesktopPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: FormValues = useMemo(() => {
    if (initial) {
      return {
        slot: initial.slot,
        rank: initial.rank,
        is_active: initial.is_active,
        starts_at: toLocalInput(initial.starts_at),
        ends_at: toLocalInput(initial.ends_at),
        title_en: initial.title_en ?? "",
        title_ar: initial.title_ar ?? "",
        subtitle_en: initial.subtitle_en ?? "",
        subtitle_ar: initial.subtitle_ar ?? "",
        cta_label_en: initial.cta_label_en ?? "",
        cta_label_ar: initial.cta_label_ar ?? "",
        cta_link: initial.cta_link ?? "",
        image_desktop: initial.image_desktop,
        image_mobile: initial.image_mobile ?? "",
        image_alt_en: initial.image_alt_en,
        image_alt_ar: initial.image_alt_ar ?? "",
      };
    }
    return {
      slot: defaultSlot,
      rank: 0,
      is_active: true,
      starts_at: "",
      ends_at: "",
      title_en: "",
      title_ar: "",
      subtitle_en: "",
      subtitle_ar: "",
      cta_label_en: "",
      cta_label_ar: "",
      cta_link: "",
      image_desktop: "",
      image_mobile: "",
      image_alt_en: "",
      image_alt_ar: "",
    };
  }, [initial, defaultSlot, open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(HeroBannerFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { setValue, watch, reset, register, formState } = form;
  const { errors } = formState;

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setDesktopPreview(defaultValues.image_desktop || "");
      setMobilePreview(defaultValues.image_mobile || "");
    }
  }, [open, defaultValues, reset]);

  const watchSlot = watch("slot") as HeroBannerSlot;
  const watchIsActive = watch("is_active");
  const watchImageDesktop = watch("image_desktop");
  const watchImageMobile = watch("image_mobile");

  const handleDesktopFile = async (f: FileList | null) => {
    const file = f?.[0];
    if (!file) return;
    const err = validateLocalFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      const { url } = await uploadImage(file);
      setValue("image_desktop", url, { shouldDirty: true, shouldValidate: true });
      setDesktopPreview(url);
      toast.success(BANNER_TEXTS.toasts.desktopUploaded);
    } catch (e: any) {
      toast.error(e?.message || BANNER_TEXTS.toasts.uploadFailed);
    }
  };

  const handleMobileFile = async (f: FileList | null) => {
    const file = f?.[0];
    if (!file) return;
    const err = validateLocalFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      const { url } = await uploadImage(file);
      setValue("image_mobile", url, { shouldDirty: true, shouldValidate: false });
      setMobilePreview(url);
      toast.success(BANNER_TEXTS.toasts.mobileUploaded);
    } catch (e: any) {
      toast.error(e?.message || BANNER_TEXTS.toasts.uploadFailed);
    }
  };

  const doSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        slot: values.slot,
        rank: values.rank,
        is_active: values.is_active,
        starts_at: fromLocalInput(values.starts_at),
        ends_at: fromLocalInput(values.ends_at),
        title_en: values.title_en?.trim() ? values.title_en.trim() : null,
        title_ar: values.title_ar?.trim() ? values.title_ar.trim() : null,
        subtitle_en: values.subtitle_en?.trim() ? values.subtitle_en.trim() : null,
        subtitle_ar: values.subtitle_ar?.trim() ? values.subtitle_ar.trim() : null,
        cta_label_en: values.cta_label_en?.trim() ? values.cta_label_en.trim() : null,
        cta_label_ar: values.cta_label_ar?.trim() ? values.cta_label_ar.trim() : null,
        cta_link: values.cta_link?.trim() ? values.cta_link.trim() : null,
        image_desktop: values.image_desktop,
        image_mobile: values.image_mobile?.trim() ? values.image_mobile.trim() : null,
        image_alt_en: values.image_alt_en.trim(),
        image_alt_ar: values.image_alt_ar?.trim() ? values.image_alt_ar.trim() : null,
      };
      if (initial) {
        await apiFetch(`/admin/hero-banners/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success(BANNER_TEXTS.toasts.bannerUpdated);
      } else {
        await apiFetch("/admin/hero-banners", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success(BANNER_TEXTS.toasts.bannerCreated);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || BANNER_TEXTS.toasts.saveError);
    } finally {
      setSubmitting(false);
    }
  });

  if (!open) return null;

  const dims = UPLOAD_DIMS[watchSlot];

  const Label = ({ children, className = "", htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) => (
    <label htmlFor={htmlFor} className={`label-md block text-secondary ${className}`}>{children}</label>
  );
  const FieldWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`space-y-1.5 ${className}`}>{children}</div>
  );
  const ErrorMsg = ({ name }: { name: keyof FormValues }) => {
    const err = errors[name] as { message?: string } | undefined;
    if (!err?.message) return null;
    return <span className="text-rose-600 text-sm">{String(err.message)}</span>;
  };
  const Hint = ({ children }: { children: React.ReactNode }) => (
    <p className="label-xs text-secondary">{children}</p>
  );

  const regSlot: UseFormRegisterReturn<"slot"> = register("slot");
  const regRank: UseFormRegisterReturn<"rank"> = register("rank");
  const regImgDesktop = register("image_desktop");
  const regImgMobile = register("image_mobile");
  const regAltEn = register("image_alt_en");
  const regAltAr = register("image_alt_ar");
  const regTitleEn = register("title_en");
  const regTitleAr = register("title_ar");
  const regSubtitleEn = register("subtitle_en");
  const regSubtitleAr = register("subtitle_ar");
  const regCtaLabelEn = register("cta_label_en");
  const regCtaLabelAr = register("cta_label_ar");
  const regCtaLink = register("cta_link");
  const regStarts = register("starts_at");
  const regEnds = register("ends_at");
  const regActive = register("is_active");

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-8">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <Heading level="h2" className="text-lg font-semibold">
            {initial ? BANNER_TEXTS.heading.edit : BANNER_TEXTS.heading.new}
          </Heading>
          <IconButton variant="transparent" onClick={onClose} aria-label={BANNER_TEXTS.aria.close}>
            <XMarkMini />
          </IconButton>
        </div>
        <form onSubmit={doSubmit} className="px-5 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <FieldWrapper>
                <Label htmlFor="hb-slot">{BANNER_TEXTS.labels.slot}</Label>
                <select
                  id="hb-slot"
                  className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                  {...regSlot}
                  value={watchSlot}
                  onChange={(e) => { regSlot.onChange(e); }}
                >
                  {SLOT_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {SLOT_LABELS[s]}
                    </option>
                  ))}
                </select>
                <ErrorMsg name="slot" />
              </FieldWrapper>
              <FieldWrapper>
                <Label htmlFor="hb-rank">{BANNER_TEXTS.labels.rank}</Label>
                <Input id="hb-rank" type="number" min={0} step={1} {...regRank} />
                <ErrorMsg name="rank" />
              </FieldWrapper>
            </div>

            <FieldWrapper className="md:col-span-1">
              <Label>{BANNER_TEXTS.labels.imageDesktop}</Label>
              <div className="space-y-2">
                {desktopPreview ? (
                  <div className="relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={desktopPreview}
                      alt={BANNER_TEXTS.alt.desktopPreview}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : null}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleDesktopFile(e.target.files)}
                />
                {watchImageDesktop && (
                  <Text size="xsmall" className="truncate text-neutral-500">
                    {watchImageDesktop}
                  </Text>
                )}
                <input type="hidden" {...regImgDesktop} value={watchImageDesktop ?? ""} onChange={regImgDesktop.onChange} />
              </div>
              <Hint>{BANNER_TEXTS.hints.desktopRecommended(dims.desktop)}</Hint>
              <Hint>{BANNER_TEXTS.hints.safeZone}</Hint>
              <ErrorMsg name="image_desktop" />
            </FieldWrapper>

            <FieldWrapper className="md:col-span-1">
              <Label>{BANNER_TEXTS.labels.imageMobile}</Label>
              <div className="space-y-2">
                {mobilePreview ? (
                  <div className="relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mobilePreview}
                      alt={BANNER_TEXTS.alt.mobilePreview}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : null}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleMobileFile(e.target.files)}
                />
                {watchImageMobile && (
                  <Text size="xsmall" className="truncate text-neutral-500">
                    {watchImageMobile}
                  </Text>
                )}
                <input type="hidden" {...regImgMobile} value={watchImageMobile ?? ""} onChange={regImgMobile.onChange} />
              </div>
              <Hint>{BANNER_TEXTS.hints.mobileRecommended(dims.mobile)}</Hint>
              <Hint>{BANNER_TEXTS.hints.safeZone}</Hint>
              <ErrorMsg name="image_mobile" />
            </FieldWrapper>

            <FieldWrapper>
              <Label htmlFor="hb-alt-en">{BANNER_TEXTS.labels.altEn}</Label>
              <Input
                id="hb-alt-en"
                {...regAltEn}
                value={watch('image_alt_en') ?? ''}
                placeholder={BANNER_TEXTS.placeholders.altEnExample}
              />
              <Hint>{BANNER_TEXTS.hints.altPurpose}</Hint>
              <ErrorMsg name="image_alt_en" />
            </FieldWrapper>
            <FieldWrapper>
              <Label htmlFor="hb-alt-ar">{BANNER_TEXTS.labels.altAr}</Label>
              <Input
                id="hb-alt-ar"
                {...regAltAr}
                value={watch('image_alt_ar') ?? ''}
                dir="rtl"
                placeholder="عنوان الصورة"
              />
              <ErrorMsg name="image_alt_ar" />
            </FieldWrapper>

            <FieldWrapper>
              <Label htmlFor="hb-title-en">{BANNER_TEXTS.labels.titleEn}</Label>
              <Input
                id="hb-title-en"
                {...regTitleEn}
                value={watch('title_en') ?? ''}
                placeholder="Spring Collection"
              />
              <Hint>{BANNER_TEXTS.hints.titleSeo}</Hint>
              <ErrorMsg name="title_en" />
            </FieldWrapper>
            <FieldWrapper>
              <Label htmlFor="hb-title-ar">{BANNER_TEXTS.labels.titleAr}</Label>
              <Input
                id="hb-title-ar"
                {...regTitleAr}
                value={watch('title_ar') ?? ''}
                dir="rtl"
                placeholder="مجموعة الربيع"
              />
              <ErrorMsg name="title_ar" />
            </FieldWrapper>

            <FieldWrapper>
              <Label htmlFor="hb-sub-en">{BANNER_TEXTS.labels.subtitleEn}</Label>
              <Input
                id="hb-sub-en"
                {...regSubtitleEn}
                value={watch('subtitle_en') ?? ''}
                placeholder={BANNER_TEXTS.placeholders.subtitleEnExample}
              />
              <ErrorMsg name="subtitle_en" />
            </FieldWrapper>
            <FieldWrapper>
              <Label htmlFor="hb-sub-ar">{BANNER_TEXTS.labels.subtitleAr}</Label>
              <Input
                id="hb-sub-ar"
                {...regSubtitleAr}
                value={watch('subtitle_ar') ?? ''}
                dir="rtl"
                placeholder="توصيل مجاني في الدوحة"
              />
              <ErrorMsg name="subtitle_ar" />
            </FieldWrapper>

            <FieldWrapper>
              <Label htmlFor="hb-cta-en">{BANNER_TEXTS.labels.ctaEn}</Label>
              <Input
                id="hb-cta-en"
                {...regCtaLabelEn}
                value={watch('cta_label_en') ?? ''}
                placeholder="Shop now"
              />
              <ErrorMsg name="cta_label_en" />
            </FieldWrapper>
            <FieldWrapper>
              <Label htmlFor="hb-cta-ar">{BANNER_TEXTS.labels.ctaAr}</Label>
              <Input
                id="hb-cta-ar"
                {...regCtaLabelAr}
                value={watch('cta_label_ar') ?? ''}
                dir="rtl"
                placeholder="تسوق الآن"
              />
              <ErrorMsg name="cta_label_ar" />
            </FieldWrapper>

            <FieldWrapper className="md:col-span-2">
              <Label htmlFor="hb-link">{BANNER_TEXTS.labels.link}</Label>
              <Input
                id="hb-link"
                {...regCtaLink}
                value={watch('cta_link') ?? ''}
                placeholder="/qa/categories/flowers"
              />
              <Hint>{BANNER_TEXTS.hints.linkFormat}</Hint>
              <ErrorMsg name="cta_link" />
            </FieldWrapper>

            <FieldWrapper>
              <Label htmlFor="hb-starts">{BANNER_TEXTS.labels.start}</Label>
              <Input
                id="hb-starts"
                type="datetime-local"
                {...regStarts}
                value={watch('starts_at') ?? ''}
              />
              <Hint>{BANNER_TEXTS.hints.dohaTz}</Hint>
              <ErrorMsg name="starts_at" />
            </FieldWrapper>
            <FieldWrapper>
              <Label htmlFor="hb-ends">{BANNER_TEXTS.labels.end}</Label>
              <Input
                id="hb-ends"
                type="datetime-local"
                {...regEnds}
                value={watch('ends_at') ?? ''}
              />
              <Hint>{BANNER_TEXTS.hints.dohaTzAfterStart}</Hint>
              <ErrorMsg name="ends_at" />
            </FieldWrapper>

            <FieldWrapper className="md:col-span-2">
              <div>
                <div className="flex items-start justify-between">
                  <Label htmlFor="hb-active">{BANNER_TEXTS.labels.status}</Label>
                  <Switch
                    id="hb-active"
                    dir="ltr"
                    checked={!!watchIsActive}
                    onCheckedChange={(c: boolean) => {
                      setValue("is_active", c, { shouldDirty: true, shouldValidate: true });
                      regActive.onChange({ target: { name: "is_active", value: c } });
                    }}
                    onBlur={regActive.onBlur}
                    name={regActive.name}
                    ref={regActive.ref}
                  />
                </div>
                <Hint>
                  {watchIsActive
                    ? BANNER_TEXTS.hints.activeVisible
                    : BANNER_TEXTS.hints.inactiveHidden}
                </Hint>
                <ErrorMsg name="is_active" />
              </div>
            </FieldWrapper>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              {BANNER_TEXTS.buttons.cancel}
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={submitting}
              disabled={submitting}
            >
              {initial ? BANNER_TEXTS.buttons.save : BANNER_TEXTS.buttons.create}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;
export { BannerModal };
