import { appAuth } from "@/lib/app-auth"
import { getPayloadClient } from "@/lib/payload"
import { errorResponse, verifyOrigin } from "@/lib/http"

export async function GET() {
  const user = await appAuth.currentUser()
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 })
  const payload = await getPayloadClient()
  const orders = await payload.find({
    collection: "orders",
    user,
    overrideAccess: false,
    limit: 50,
    sort: "-createdAt",
    depth: 0,
    select: {
      reference: true,
      items: true,
      total: true,
      status: true,
      createdAt: true,
      idempotencyKey: true,
    },
  })
  return Response.json({ orders: orders.docs }, {
    headers: { "Cache-Control": "private, no-store" },
  })
}
export async function POST(request: Request) {
  try {
    verifyOrigin(request)
    const user = await appAuth.currentUser()
    if (!user)
      return Response.json(
        { error: "Please sign in before placing your order." },
        { status: 401 },
      )
    const body = await request.json()
    if (body.ownerId && body.ownerId !== user.id)
      throw new Error("Sign in to the account that saved this order.")
    if (
      typeof body.idempotencyKey !== "string" ||
      !/^[\w-]{8,80}$/.test(body.idempotencyKey)
    )
      throw new Error("Invalid order reference.")
    if (
      !Array.isArray(body.items) ||
      body.items.length < 1 ||
      body.items.length > 50
    )
      throw new Error("Your bag is empty or too large.")
    const items = body.items.map(
      (item: {
        product: unknown
        quantity: unknown
      }) => {
        if (
          typeof item.product !== "string" ||
          !Number.isInteger(item.quantity) ||
          Number(item.quantity) < 1 ||
          Number(item.quantity) > 99
        )
          throw new Error("Invalid quantity.")
        return { product: item.product, quantity: Number(item.quantity) }
      },
    )
    const shipping: Record<string, string> = {}
    for (const key of [
      "name",
      "email",
      "address",
      "city",
      "postalCode",
      "country",
    ]) {
      const value = body.shipping?.[key]
      if (
        typeof value !== "string" ||
        !value.trim() ||
        value.length >
          (key === "address" ? 200 : key === "postalCode" ? 20 : 100)
      )
        throw new Error(`Please check your ${key}.`)
      shipping[key] = value.trim()
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email))
      throw new Error("Please enter a valid email.")
    const payload = await getPayloadClient()
    const existing = await payload.find({
      collection: "orders",
      user,
      overrideAccess: false,
      limit: 1,
      depth: 0,
      select: {
        reference: true,
        items: true,
        total: true,
        status: true,
        createdAt: true,
        idempotencyKey: true,
      },
      where: { idempotencyKey: { equals: body.idempotencyKey } },
    })
    if (existing.docs[0]) return Response.json({ order: existing.docs[0] })
    const order = await payload.create({
      collection: "orders",
      user,
      overrideAccess: false,
      depth: 0,
      select: {
        reference: true,
        items: true,
        total: true,
        status: true,
        createdAt: true,
        idempotencyKey: true,
      },
      data: {
        owner: user.id,
        items,
        shipping: shipping as {
          name: string
          email: string
          address: string
          city: string
          postalCode: string
          country: string
        },
        idempotencyKey: body.idempotencyKey,
      },
    })
    return Response.json({ order })
  } catch (error) {
    return errorResponse(error)
  }
}
