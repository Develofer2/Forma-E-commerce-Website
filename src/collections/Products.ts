import type { CollectionConfig } from "payload"
import { isAdmin } from "@/access/store"
import { catalogChanged, catalogDeleted } from "@/hooks/catalog-cache"

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    group: "Store",
    defaultColumns: ["name", "category", "price", "stock"],
  },
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
    { name: "description", type: "textarea", required: true },
    { name: "image", type: "upload", relationTo: "media", required: true },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    { name: "price", type: "number", required: true, min: 0 },
    { name: "stock", type: "number", required: true, min: 0, defaultValue: 30 },
    { name: "material", type: "text" },
    { name: "color", type: "text", defaultValue: "Natural" },
    {
      name: "badge",
      type: "select",
      options: ["New arrival", "Bestseller", "Small batch"],
    },
    { name: "position", type: "number", defaultValue: 0 },
    { name: "rating", type: "number", min: 0, max: 5, defaultValue: 0 },
    { name: "reviewCount", type: "number", defaultValue: 0, min: 0 },
  ],
}
