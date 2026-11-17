"use client"
import { ArrowRight, Heart } from "lucide-react"
import type { Product } from "@/payload-types"
import { useShop } from "./shop-provider"
import { ButtonLink, Eyebrow, Heading } from "./ui"
import { ProductCard } from "./product-card"

export function Wishlist({ products }: { products: Product[] }) {
  const { wishlist, ready } = useShop()
  const saved = products.filter((v) => wishlist.includes(v.id))
  return (
    <main className="mx-auto min-h-[65vh] max-w-screen-2xl px-5 py-14 sm:px-8 lg:px-14">
      <Eyebrow className="mb-4 text-forest">A little wishful thinking</Eyebrow>
      <Heading as="h1" className="text-4xl sm:text-5xl">
        The ones you’re considering.
      </Heading>
      <p className="mt-4 text-sm text-muted">
        Good things are worth coming back to. Your favorites stay here, even
        offline.
      </p>
      {!ready ? (
        <div className="mt-10 grid animate-pulse grid-cols-2 gap-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((v) => (
            <div key={v} className="aspect-square bg-surface" />
          ))}
        </div>
      ) : saved.length ? (
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="my-12 flex flex-col items-center border border-dashed border-line px-6 py-16 text-center">
          <Heart size={32} strokeWidth={1.2} className="mb-5 text-muted" />
          <Heading className="text-2xl">Save a little inspiration.</Heading>
          <p className="mt-3 text-sm text-muted">
            Tap the heart on any object to make it part of your collection.
          </p>
          <ButtonLink href="/#collection" className="mt-6">
            Find your favorites
            <ArrowRight size={15} />
          </ButtonLink>
        </div>
      )}
    </main>
  )
}
