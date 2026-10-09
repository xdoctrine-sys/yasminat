import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260930142212 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "hero_banner" ("id" text not null, "slot" text check ("slot" in ('main', 'side_top', 'side_bottom')) not null, "rank" integer not null default 0, "is_active" boolean not null default true, "starts_at" timestamptz null, "ends_at" timestamptz null, "title_en" text null, "title_ar" text null, "subtitle_en" text null, "subtitle_ar" text null, "cta_label_en" text null, "cta_label_ar" text null, "cta_link" text null, "image_desktop" text not null, "image_mobile" text null, "image_alt_en" text not null, "image_alt_ar" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "hero_banner_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hero_banner_deleted_at" ON "hero_banner" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hero_banner" cascade;`);
  }

}
