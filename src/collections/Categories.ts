import type { CollectionConfig } from "payload"
import { isAdmin } from "@/access/store"
import { catalogChanged, catalogDeleted } from "@/hooks/catalog-cache"

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: { useAsTitle: "name", group: "Store" },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: { afterChange: [catalogChanged], afterDelete: [catalogDeleted] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "slug", useAsSlug: "name" },
    { name: "description", type: "textarea" },
    { name: "position", type: "number", defaultValue: 0 },
  ],
}
