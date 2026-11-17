import { appAuth } from "@/lib/app-auth"
import { getPayloadClient } from "@/lib/payload"
import { errorResponse, verifyOrigin } from "@/lib/http"

export async function GET(request: Request) {
  const product = new URL(request.url).searchParams.get("product")
  if (!product) return errorResponse(new Error("Choose a product."))
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: "reviews",
    overrideAccess: false,
    where: { product: { equals: product } },
    limit: 50,
    sort: "-createdAt",
    depth: 0,
  })
  return Response.json({ reviews: docs })
}
export async function POST(request: Request) {
  try {
    verifyOrigin(request)
    const user = await appAuth.currentUser()
    if (!user)
      return Response.json({ error: "Sign in to share your thoughts." }, {
        status: 401,
      })
    const body = await request.json()
    if (
      typeof body.product !== "string" ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5 ||
      typeof body.comment !== "string" ||
      body.comment.trim().length < 5 ||
      body.comment.length > 2000
    )
      throw new Error("Choose a rating and write at least 5 characters.")
    const payload = await getPayloadClient()
    await payload.create({
      collection: "reviews",
      user,
      overrideAccess: false,
      data: {
        owner: user.id,
        product: body.product,
        rating: body.rating,
        comment: body.comment.trim(),
      },
    })
    return Response.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
