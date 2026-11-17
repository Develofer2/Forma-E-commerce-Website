"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Heart, Plus, Star } from "lucide-react"
import type { Product } from "@/payload-types"
import { useShop } from "./shop-provider"
import { Heading, IconButton } from "./ui"
import { money } from "@/lib/format"

export function ProductCard({
  product,
  list = false,
}: {
  product: Product
  list?: boolean
}) {
  const { wishlist, toggleSaved, add } = useShop()
  const saved = wishlist.includes(product.id)
  const category =
    typeof product.category === "object" ? product.category?.name : ""
  const image = typeof product.image === "object" ? product.image : null
  return (
    <article
      className={`group relative ${
        list
          ? "grid grid-cols-[8rem_1fr] items-center gap-6 border-b border-line pb-5 sm:grid-cols-[12rem_1fr]"
          : ""
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-sm bg-surface ${
          list ? "aspect-square" : "aspect-[1/1.12]"
        }`}
      >
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0"
          aria-label={`View ${product.name}`}
        >
          {image?.url && (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              sizes={
                list
                  ? "200px"
                  : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              }
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 bg-paper/95 px-2.5 py-1.5 text-[10px] font-medium tracking-wide">
            {product.badge}
          </span>
        )}
        <IconButton
          aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${
            saved ? "from" : "to"
          } wishlist`}
          aria-pressed={saved}
          onClick={() => toggleSaved(product.id)}
          className={`absolute right-2.5 top-2.5 size-8 bg-paper/90 hover:bg-paper ${
            saved ? "text-forest" : "text-ink"
          }`}
        >
          <Heart
            size={16}
            strokeWidth={1.5}
            fill={saved ? "currentColor" : "none"}
          />
        </IconButton>
        <div className="absolute inset-x-3 bottom-3 flex translate-y-14 items-center justify-between bg-paper/95 px-4 py-3 text-xs opacity-0 backdrop-blur-sm transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-sm:hidden">
          <span>A new everyday favorite.</span>
          <Link
            aria-label={`Discover ${product.name}`}
            href={`/products/${product.slug}`}
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className={list ? "" : "pt-4"}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-widest text-muted">
            {category}
          </p>
          <span className="flex items-center gap-1 text-[10px] text-muted">
            <Star size={10} className="fill-ink text-ink" />
            {product.rating ? product.rating.toFixed(1) : "New"}
            <span className="hidden sm:inline">
              ({product.reviewCount ?? 0})
            </span>
          </span>
        </div>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div>
            <Link href={`/products/${product.slug}`}>
              <Heading as="h3" className="text-sm tracking-normal sm:text-base">
                {product.name}
              </Heading>
            </Link>
            <p className="mt-1 text-xs text-muted">
              {product.material || product.color}
            </p>
          </div>
        </div>
        {list && (
          <p className="my-3 max-w-xl text-sm leading-6 text-muted">
            {product.description}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-medium">{money(product.price)}</p>
          <IconButton
            aria-label={`Add ${product.name} to bag`}
            className="size-7 border border-line hover:border-forest hover:bg-forest hover:text-on-forest"
            disabled={!product.stock}
            onClick={() => add(product)}
          >
            <Plus size={15} strokeWidth={1.5} />
          </IconButton>
        </div>
      </div>
    </article>
  )
}
