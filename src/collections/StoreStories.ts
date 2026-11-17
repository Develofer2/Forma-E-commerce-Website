import type { CollectionConfig } from "payload"
import { isAdmin } from "@/access/store"
import { catalogChanged, catalogDeleted } from "@/hooks/catalog-cache"

export const StoreStories: CollectionConfig = {
  slug: "store-stories",
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
    { name: "heroImage", type: "upload", relationTo: "media", required: true },
    { name: "storyImage", type: "upload", relationTo: "media" },
    { name: "intro", type: "textarea" },
  ],
}
