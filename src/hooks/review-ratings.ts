import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from "payload"

function productID(value: unknown): string | null {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id
  return null
}

async function refreshRating(id: string, req: PayloadRequest) {
  let sum = 0
  let count = 0
  let page = 1
  while (true) {
    // Trusted aggregate only: no private review/profile fields leave this hook.
    const result = await req.payload.find({
      collection: "reviews",
      overrideAccess: true,
      req,
      where: { product: { equals: id } },
      depth: 0,
      select: { rating: true },
      limit: 100,
      page,
    })
    for (const review of result.docs) {
      sum += review.rating
      count++
    }
    if (!result.hasNextPage) break
    page++
  }
  await req.payload.update({
    collection: "products",
    id,
    overrideAccess: true,
    req,
    data: { rating: count ? Math.round(sum / count * 10) / 10 : 0, reviewCount: count },
  })
}

export const reviewChanged: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  for (const id of new Set([productID(doc.product), productID(previousDoc?.product)])) {
    if (id) await refreshRating(id, req)
  }
  return doc
}
export const reviewDeleted: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const id = productID(doc.product)
  if (id) await refreshRating(id, req)
  return doc
}
