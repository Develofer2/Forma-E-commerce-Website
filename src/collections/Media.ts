import type { CollectionConfig } from "payload"
import { createFolderField, createTagField } from "payload"
import { isAdmin } from "@/access/store"
import { catalogChanged, catalogDeleted } from "@/hooks/catalog-cache"

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: { afterChange: [catalogChanged], afterDelete: [catalogDeleted] },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    createFolderField({ relationTo: "folders" }),
    createTagField({ relationTo: "tags" }),
  ],
  upload: {
    modifyResponseHeaders: ({ headers }) => {
      headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600")
      return headers
    },
  },
}
