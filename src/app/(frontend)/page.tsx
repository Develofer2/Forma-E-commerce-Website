import { getCatalog } from "@/lib/catalog"
import { Storefront } from "@/components/storefront"

export default async function HomePage() {
  const catalog = await getCatalog()
  return <Storefront {...catalog} />
}
