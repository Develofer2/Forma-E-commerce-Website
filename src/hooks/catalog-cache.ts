import { revalidatePath, revalidateTag } from "next/cache"
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload"

function invalidate(doc?: { slug?: string }, previousDoc?: { slug?: string }) {
  // CLI writes run outside a Next request; the production Admin runs inside one.
  try {
    revalidateTag("catalog", { expire: 0 })
    for (const slug of new Set([doc?.slug, previousDoc?.slug])) {
      if (slug) {
        revalidateTag(`product:${slug}`, { expire: 0 })
        revalidatePath(`/products/${slug}`)
      }
    }
    for (const path of ["/", "/wishlist", "/about"]) revalidatePath(path)
    revalidatePath("/products/[slug]", "page")
  } catch (error) {
    if (!String(error).includes("static generation store")) throw error
  }
}

export const catalogChanged: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
}) => {
  invalidate(doc, previousDoc)
  return doc
}
export const catalogDeleted: CollectionAfterDeleteHook = ({ doc }) => {
  invalidate(doc)
  return doc
}
