import { appAuth } from "@/lib/app-auth"
import { getPayloadClient } from "@/lib/payload"
import { errorResponse, verifyOrigin } from "@/lib/http"

export async function GET() {
  const user = await appAuth.currentUser()
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 })
  const payload = await getPayloadClient()
  const doc = await payload.findByID({
    collection: "users",
    id: user.id,
    user,
    overrideAccess: false,
    depth: 2,
  })
  return Response.json({ cart: doc.cart ?? [], wishlist: doc.wishlist ?? [] }, {
    headers: { "Cache-Control": "private, no-store" },
  })
}
export async function POST(request: Request) {
  try {
    verifyOrigin(request)
    const user = await appAuth.currentUser()
    if (!user)
      return Response.json({ error: "Please sign in." }, { status: 401 })
    const body = await request.json()
    if (
      !Array.isArray(body.cart) ||
      body.cart.length > 50 ||
      !Array.isArray(body.wishlist) ||
      body.wishlist.length > 100
    )
      throw new Error("Too many saved items.")
    const cart = body.cart.map(
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
          throw new Error("Invalid bag item.")
        return { product: item.product, quantity: Number(item.quantity) }
      },
    )
    const wishlist = body.wishlist.filter(
      (id: unknown) => typeof id === "string",
    )
    const payload = await getPayloadClient()
    await payload.update({
      collection: "users",
      id: user.id,
      user,
      overrideAccess: false,
      data: { cart, wishlist },
    })
    return Response.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
