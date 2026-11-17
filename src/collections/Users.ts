import type { CollectionConfig } from "payload"
import { isAdmin } from "@/access/store"

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  admin: { useAsTitle: "name", group: "Customers" },
  access: {
    admin: () => false,
    create: () => true,
    read: ({ req }) =>
      req.user?.collection === "admins"
        ? true
        : req.user?.collection === "users"
          ? { id: { equals: req.user.id } }
          : false,
    update: ({ req }) =>
      req.user?.collection === "users"
        ? { id: { equals: req.user.id } }
        : false,
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 100 },
    {
      name: "wishlist",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "cart",
      type: "array",
      maxRows: 50,
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 1,
          max: 99,
          validate: (v: number | null | undefined) =>
            Number.isInteger(v) || "Quantity must be a whole number.",
        },
      ],
    },
  ],
}
