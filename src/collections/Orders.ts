import type { CollectionConfig } from "payload"
import { adminField, isAdmin, isShopper, ownRecord } from "@/access/store"

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "reference",
    group: "Customers",
    defaultColumns: ["reference", "owner", "total", "status", "createdAt"],
  },
  access: {
    create: isShopper,
    read: ownRecord,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation !== "create" || !data) return data
        if (req.user?.collection !== "users")
          throw new Error("Sign in to place an order.")
        data.owner = req.user.id
        data.status = "confirmed"
        if (
          !Array.isArray(data.items) ||
          !data.items.length ||
          data.items.length > 50
        )
          throw new Error("Your bag must contain 1–50 items.")
        let subtotal = 0
        for (const item of data.items) {
          if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1 ||
            item.quantity > 99
          )
            throw new Error("Invalid item quantity.")
          const product = await req.payload.findByID({
            collection: "products",
            id:
              typeof item.product === "object" ? item.product.id : item.product,
            req,
            overrideAccess: false,
          })
          if (product.stock < item.quantity)
            throw new Error(`${product.name} does not have enough stock.`)
          item.name = product.name
          item.unitPrice = product.price
          subtotal += Math.round(product.price * 100) * item.quantity
        }
        data.total = (subtotal + (subtotal >= 10000 ? 0 : 800)) / 100
        data.reference = `FM-${String(data.idempotencyKey).slice(0, 8).toUpperCase()}`
        return data
      },
    ],
  },
  fields: [
    {
      name: "reference",
      type: "text",
      access: { create: () => false, update: adminField },
    },
    {
      name: "idempotencyKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
      maxLength: 80,
    },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      access: { create: () => false, update: () => false },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "confirmed",
      options: ["confirmed", "shipped", "delivered", "cancelled"],
      access: { create: () => false, update: adminField },
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        { name: "quantity", type: "number", required: true, min: 1, max: 99 },
        {
          name: "name",
          type: "text",
          access: { create: () => false, update: () => false },
        },
        {
          name: "unitPrice",
          type: "number",
          access: { create: () => false, update: () => false },
        },
      ],
    },
    {
      name: "total",
      type: "number",
      access: { create: () => false, update: () => false },
    },
    {
      name: "shipping",
      type: "group",
      fields: [
        { name: "name", type: "text", required: true, maxLength: 100 },
        { name: "email", type: "email", required: true },
        { name: "address", type: "text", required: true, maxLength: 200 },
        { name: "city", type: "text", required: true, maxLength: 100 },
        { name: "postalCode", type: "text", required: true, maxLength: 20 },
        { name: "country", type: "text", required: true, maxLength: 100 },
      ],
    },
  ],
}
