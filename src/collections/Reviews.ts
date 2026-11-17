import type { CollectionConfig } from "payload"
import { adminField, isAdmin, isShopper, ownRecord } from "@/access/store"
import { reviewChanged, reviewDeleted } from "@/hooks/review-ratings"

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: { useAsTitle: "authorName", group: "Customers" },
  access: {
    read: () => true,
    create: isShopper,
    update: ownRecord,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [reviewChanged],
    afterDelete: [reviewDeleted],
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (!data) return data
        if (operation === "create") {
          if (req.user?.collection !== "users")
            throw new Error("Sign in to leave a review.")
          data.owner = req.user.id
          data.authorName = req.user.name
        }
        if (data.product)
          await req.payload.findByID({
            collection: "products",
            id:
              typeof data.product === "object" ? data.product.id : data.product,
            req,
            overrideAccess: false,
          })
        return data
      },
    ],
  },
  fields: [
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
    },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      access: { create: () => false, read: adminField, update: () => false },
    },
    {
      name: "authorName",
      type: "text",
      access: { create: () => false, update: () => false },
    },
    {
      name: "rating",
      type: "number",
      min: 1,
      max: 5,
      required: true,
      validate: (v: number | null | undefined) =>
        Number.isInteger(v) || "Choose a whole star rating.",
    },
    {
      name: "comment",
      type: "textarea",
      required: true,
      minLength: 5,
      maxLength: 2000,
    },
  ],
}
