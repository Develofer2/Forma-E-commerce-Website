import { getCatalog } from "@/lib/catalog"
import { Wishlist } from "@/components/wishlist"
export const metadata = { title: "Your saved objects — Forma" }
export default async function WishlistPage() {
  const { products } = await getCatalog()
  return <Wishlist products={products} />
}
