import { notFound } from "next/navigation"
import { getCatalog, getProduct } from "@/lib/catalog"
import { ProductDetail } from "@/components/product-detail"

export async function generateStaticParams() {
  const { products } = await getCatalog()
  return products.map((product) => ({ slug: product.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const product = await getProduct((await params).slug)
  return {
    title: product ? `${product.name} — Forma` : "Object not found — Forma",
    description: product?.description,
  }
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const product = await getProduct((await params).slug)
  if (!product) notFound()
  const { products } = await getCatalog()
  return (
    <ProductDetail
      product={product}
      related={products.filter((v) => v.id !== product.id).slice(0, 4)}
    />
  )
}
