"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Grid2X2,
  LayoutList,
  Leaf,
  SlidersHorizontal,
  Star,
  Wifi,
  X,
} from "lucide-react"
import type { Category, Product, StoreStory } from "@/payload-types"
import { Benefits } from "./shell"
import { ProductCard } from "./product-card"
import {
  Button,
  ButtonLink,
  Eyebrow,
  Heading,
  IconButton,
  Input,
  Select,
} from "./ui"
import { useShop } from "./shop-provider"
import { writeLocal } from "@/lib/offline"

function URLFilters({
  onChange,
}: {
  onChange(search: string, edit: string): void
}) {
  const params = useSearchParams()
  useEffect(() => {
    onChange(params.get("search") || "", params.get("edit") || "")
  }, [params, onChange])
  return null
}

export function Storefront({
  products,
  categories,
  story,
}: {
  products: Product[]
  categories: Category[]
  story: StoreStory | null
}) {
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("featured")
  const [search, setSearch] = useState("")
  const [edit, setEdit] = useState("")
  const [list, setList] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState(500)
  const [rating, setRating] = useState(0)
  const { online, recent } = useShop()
  const hero = typeof story?.heroImage === "object" ? story.heroImage : null
  const storyImage =
    typeof story?.storyImage === "object" ? story.storyImage : null
  useEffect(() => {
    writeLocal("catalog", products)
  }, [products])
  const urlChange = useMemo(
    () => (nextSearch: string, nextEdit: string) => {
      setSearch(nextSearch)
      setEdit(nextEdit)
      setCategory("all")
    },
    [],
  )
  const filtered = useMemo(() => {
    let items = products.filter((product) => {
      const productCategory =
        typeof product.category === "object" ? product.category?.slug : ""
      return (
        (category === "all" || productCategory === category) &&
        (!search ||
          `${product.name} ${product.description} ${product.material}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        product.price <= maxPrice &&
        (product.rating ?? 0) >= rating &&
        (!edit ||
          (edit === "new"
            ? product.badge === "New arrival"
            : product.badge === "Bestseller"))
      )
    })
    if (sort === "price-asc")
      items = [...items].sort((a, b) => a.price - b.price)
    if (sort === "price-desc")
      items = [...items].sort((a, b) => b.price - a.price)
    if (sort === "rating")
      items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (sort === "newest")
      items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return items
  }, [products, category, search, edit, maxPrice, rating, sort])
  const clear = () => {
    setCategory("all")
    setSearch("")
    setEdit("")
    setMaxPrice(500)
    setRating(0)
  }
  return (
    <main>
      <Suspense fallback={null}>
        <URLFilters onChange={urlChange} />
      </Suspense>
      <section className="mx-auto max-w-screen-2xl px-5 pt-7 sm:px-8 lg:px-14 lg:pt-8">
        <div className="grid min-h-112 overflow-hidden rounded-sm bg-surface md:grid-cols-[0.95fr_1.05fr] lg:min-h-120">
          <div className="flex flex-col items-start justify-center px-7 py-12 sm:px-12 lg:px-14">
            <Eyebrow className="mb-7 flex items-center gap-2 text-forest">
              <span className="h-px w-6 bg-forest" />
              The everyday, elevated
            </Eyebrow>
            <Heading
              as="h1"
              className="text-5xl leading-[1.08] tracking-tighter sm:text-6xl lg:text-7xl"
            >
              Good things.
              <br />
              <span className="font-editorial font-normal italic">
                For everyday.
              </span>
            </Heading>
            <p className="mt-6 max-w-80 text-sm leading-7 text-muted">
              Thoughtfully designed objects for the way you live.
              <br className="hidden xl:block" /> Less clutter. More meaning.
              Made to stay.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <ButtonLink href="#collection" className="gap-6 px-6">
                Explore the collection
                <ArrowRight size={16} />
              </ButtonLink>
              <Link
                href="/about"
                className="flex items-center gap-2 border-b border-ink/30 py-2 text-xs"
              >
                Our philosophy
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={10} className="fill-forest text-forest" />
                ))}
              </div>
              <p className="text-[10px] text-muted">
                Good design. Thoughtfully selected.
              </p>
            </div>
          </div>
          <div className="relative min-h-88 overflow-hidden md:min-h-0">
            {hero?.url ? (
              <Image
                src={hero.url}
                alt={
                  hero.alt ||
                  "A considered space, filled with warm light and natural materials"
                }
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                priority
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-line" />
            )}
          </div>
        </div>
      </section>
      <Benefits />

      <section
        id="collection"
        className="mx-auto max-w-screen-2xl scroll-mt-28 px-5 pb-14 pt-13 sm:px-8 lg:px-14"
      >
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Eyebrow className="mb-3 text-muted">Considered essentials</Eyebrow>
            <Heading className="text-3xl sm:text-4xl">
              Find your everyday favorite.
            </Heading>
            <p className="mt-3 text-sm text-muted">
              Useful. Beautiful. Nothing more than it needs to be.
            </p>
          </div>
          <div className="mb-1 flex items-center gap-2 rounded-full border border-line px-3 py-2 text-[10px] text-muted">
            {online ? (
              <Wifi size={12} className="text-forest" />
            ) : (
              <Check size={12} className="text-forest" />
            )}
            {online
              ? "Made for online. Ready for offline."
              : "Your collection, available offline."}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-b border-line pb-5">
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            <Button
              variant={category === "all" && !edit ? "primary" : "secondary"}
              className="min-h-9 shrink-0 rounded-full px-4 py-2 text-xs"
              onClick={() => {
                setCategory("all")
                setEdit("")
              }}
            >
              All objects
              <span className="ml-1 text-[10px] opacity-65">
                {products.length}
              </span>
            </Button>
            {categories.map((item) => (
              <Button
                key={item.id}
                variant={category === item.slug ? "primary" : "secondary"}
                className="min-h-9 shrink-0 rounded-full px-4 py-2 text-xs"
                onClick={() => {
                  setCategory(item.slug)
                  setEdit("")
                }}
              >
                {item.name}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className={`min-h-9 gap-2 px-1 py-2 text-xs ${
                filtersOpen ? "text-forest" : ""
              }`}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={14} />
              Filters
              {(maxPrice < 500 || rating > 0) && (
                <span className="size-1.5 rounded-full bg-forest" />
              )}
            </Button>
            <span className="h-4 w-px bg-line" />
            <Select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-9 max-w-42 border-none bg-transparent p-1 text-xs"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="newest">Newest first</option>
              <option value="rating">Top rated</option>
            </Select>
          </div>
        </div>
        {filtersOpen && (
          <div className="flex flex-wrap items-end gap-8 border-b border-line bg-surface/40 p-5">
            <label className="grid gap-3 text-xs">
              Maximum price: ${maxPrice}
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-56 accent-forest"
              />
            </label>
            <label className="grid gap-2 text-xs">
              Rating
              <Select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={0}>All ratings</option>
                <option value={4}>4 stars & up</option>
                <option value={4.8}>4.8 stars & up</option>
              </Select>
            </label>
            <Button
              variant="ghost"
              className="min-h-9 text-xs underline"
              onClick={clear}
            >
              Reset filters
            </Button>
          </div>
        )}
        <div className="flex min-h-15 items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {filtered.length} {filtered.length === 1 ? "object" : "objects"}
            {search
              ? ` for “${search}”`
              : edit === "new"
                ? " · New arrivals"
                : edit === "best"
                  ? " · Bestsellers"
                  : " for a better everyday"}
            {(search || edit) && (
              <IconButton
                aria-label="Clear search"
                className="ml-1 inline-flex size-6"
                onClick={clear}
              >
                <X size={12} />
              </IconButton>
            )}
          </p>
          <div className="flex gap-1">
            <IconButton
              aria-label="Grid view"
              aria-pressed={!list}
              className={`size-7 rounded-sm ${
                !list ? "bg-surface text-ink" : "text-muted"
              }`}
              onClick={() => setList(false)}
            >
              <Grid2X2 size={15} />
            </IconButton>
            <IconButton
              aria-label="List view"
              aria-pressed={list}
              className={`size-7 rounded-sm ${
                list ? "bg-surface text-ink" : "text-muted"
              }`}
              onClick={() => setList(true)}
            >
              <LayoutList size={16} />
            </IconButton>
          </div>
        </div>
        {filtered.length ? (
          <div
            className={
              list
                ? "grid gap-6"
                : "grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
            }
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} list={list} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line py-18 text-center">
            <Heading className="text-2xl">Nothing here, just yet.</Heading>
            <p className="mt-3 text-sm text-muted">
              Try a different search or make a little more room in your filters.
            </p>
            <Button variant="secondary" className="mt-6" onClick={clear}>
              See all objects
              <ArrowRight size={15} />
            </Button>
          </div>
        )}
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[11px] text-muted">
            Thoughtfully selected. Never more than you need.
          </p>
          <span className="h-px w-16 bg-line" />
        </div>
      </section>
      {storyImage?.url && (
        <section className="mx-auto mb-16 max-w-screen-2xl px-5 sm:px-8 lg:px-14">
          <div className="grid overflow-hidden rounded-sm bg-surface md:grid-cols-2">
            <div className="relative min-h-76 md:min-h-88">
              <Image
                src={storyImage.url}
                alt={
                  storyImage.alt ||
                  "Natural materials, beautiful in their simplicity"
                }
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start justify-center p-9 sm:p-12 lg:px-16">
              <Eyebrow className="mb-5 text-forest">
                The Forma philosophy
              </Eyebrow>
              <Heading className="text-3xl leading-tight sm:text-4xl">
                Less, but <span className="font-editorial italic">better.</span>
              </Heading>
              <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
                {story?.intro ||
                  "We believe the things you surround yourself with should earn their place. Honest materials. Thoughtful details. Objects that quietly make life a little better."}
              </p>
              <Link
                href="/about"
                className="mt-6 flex items-center gap-8 border-b border-ink/40 pb-2 text-xs font-medium"
              >
                A little about us
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
      {recent.length > 0 && (
        <section className="mx-auto max-w-screen-2xl px-5 pb-16 sm:px-8 lg:px-14">
          <Eyebrow className="text-muted">Worth another look</Eyebrow>
          <Heading className="mb-7 mt-3 text-3xl">Recently considered.</Heading>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {recent.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      <div className="border-t border-line px-6 py-10 text-center">
        <Leaf
          size={20}
          strokeWidth={1.3}
          className="mx-auto mb-3 text-forest"
        />
        <p className="font-editorial text-xl">
          Buy less. Choose well. Make it last.
        </p>
        <p className="mt-2 text-[11px] text-muted">
          A simple idea, at the heart of everything we do.
        </p>
      </div>
    </main>
  )
}
