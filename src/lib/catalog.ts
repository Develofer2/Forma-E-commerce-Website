import { unstable_cache } from "next/cache"
import { findBySlug, getPayloadClient } from "@/lib/payload"

export const getCatalog = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const [products, categories, stories] = await Promise.all([
      payload.find({
        collection: "products",
        limit: 100,
        depth: 2,
        sort: "position",
        overrideAccess: false,
      }),
      payload.find({
        collection: "categories",
        limit: 30,
        sort: "position",
        overrideAccess: false,
      }),
      payload.find({
        collection: "store-stories",
        limit: 1,
        depth: 1,
        overrideAccess: false,
      }),
    ])
    return {
      products: products.docs,
      categories: categories.docs,
      story: stories.docs[0] ?? null,
    }
  },
  ["forma-catalog-v2"],
  { tags: ["catalog"] },
)

export function getProduct(slug: string) {
  return unstable_cache(
    () => findBySlug("products", slug),
    ["forma-product", slug],
    { tags: ["catalog", `product:${slug}`] },
  )()
}
