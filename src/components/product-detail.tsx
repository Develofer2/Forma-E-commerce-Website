"use client"
// Client-side Next navigation loads RSC, not HTML. Save the full page for offline reloads too.

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react"
import type { Product, Review } from "@/payload-types"
import {
  Button,
  ButtonLink,
  Eyebrow,
  Field,
  Heading,
  IconButton,
  Select,
  Textarea,
} from "./ui"
import { useShop } from "./shop-provider"
import { ProductCard } from "./product-card"
import { money } from "@/lib/format"

export function ProductDetail({
  product,
  related,
}: {
  product: Product
  related: Product[]
}) {
  const { add, toggleSaved, wishlist, view, user, online, notify } = useShop()
  const [count, setCount] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [busy, setBusy] = useState(false)
  const image =
    typeof product.image ===
    "object"
      ? product.image
      : null
  const category =
    typeof product.category ===
    "object"
      ? product.category
      : null
  const saved = wishlist.includes(product.id)
  useEffect(() => {
    view(product)
  }, [product, view])
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.ready
        .then(() =>
          fetch(`/products/${product.slug}`, {
            headers: { accept: "text/html" },
          }),
        )
        .catch(() => {})
  }, [product.slug])
  useEffect(() => {
    fetch(`/api/shop/reviews?product=${product.id}`)
      .then((r) => r.json())
      .then((v) => setReviews(v.reviews ?? []))
      .catch(() => {})
  }, [product.id])
  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setReviewError("")
    const data = new FormData(event.currentTarget)
    try {
      const response = await fetch("/api/shop/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product.id,
          rating: Number(data.get("rating")),
          comment: data.get("comment"),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      const fresh = await fetch(`/api/shop/reviews?product=${product.id}`).then(
        (r) => r.json(),
      )
      setReviews(fresh.reviews ?? [])
      setReviewOpen(false)
      notify("Thank you. Your review is now part of the story.")
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Unable to send your review while offline.",
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-16 sm:px-8 lg:px-14">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 py-7 text-xs text-muted"
      >
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <Link href="/#collection">{category?.name || "The collection"}</Link>
        <ChevronRight size={12} />
        <span className="text-ink">{product.name}</span>
      </nav>
      <div className="grid gap-9 md:grid-cols-2 lg:gap-20">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-surface">
          {image?.url && (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
          {product.badge && (
            <span className="absolute left-5 top-5 bg-paper/95 px-3 py-2 text-xs">
              {product.badge}
            </span>
          )}
        </div>
        <div className="flex flex-col justify-center py-1 lg:pr-6">
          <Eyebrow className="mb-4 text-forest">{category?.name}</Eyebrow>
          <Heading as="h1" className="text-4xl sm:text-5xl">
            {product.name}
          </Heading>
          <div className="mt-5 flex items-center gap-2">
            <Star size={14} className="fill-forest text-forest" />
            <span className="text-sm">
              {product.rating?.toFixed(1) || "New"}
            </span>
            <Link
              href="#reviews"
              className="text-xs text-muted underline underline-offset-4"
            >
              Thoughts from our community
            </Link>
          </div>
          <p className="mt-6 text-2xl">{money(product.price)}</p>
          <p className="mt-5 text-sm leading-7 text-muted">
            {product.description}
          </p>
          <div className="mt-7 border-t border-line pt-5">
            <p className="text-xs">
              Color <span className="ml-3 text-muted">{product.color}</span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full border border-forest bg-surface">
                <Check size={15} className="text-forest" />
              </span>
              <span className="text-xs text-muted">The natural choice.</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-12 items-center border border-line">
              <IconButton
                aria-label="Decrease quantity"
                disabled={count <= 1}
                className="rounded-none"
                onClick={() => setCount(count - 1)}
              >
                <Minus size={14} />
              </IconButton>
              <span className="w-6 text-center text-sm">{count}</span>
              <IconButton
                aria-label="Increase quantity"
                disabled={count >= product.stock}
                className="rounded-none"
                onClick={() => setCount(count + 1)}
              >
                <Plus size={14} />
              </IconButton>
            </div>
            <Button
              className="h-12 flex-1 justify-between"
              disabled={!product.stock}
              onClick={() => add(product, count)}
            >
              {product.stock ? "Add to bag" : "Out of stock"}
              <Plus size={18} />
            </Button>
            <IconButton
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              className="size-12 rounded-sm border border-line"
              onClick={() => toggleSaved(product.id)}
            >
              <Heart
                size={18}
                fill={saved ? "currentColor" : "none"}
                className={saved ? "text-forest" : ""}
              />
            </IconButton>
          </div>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-muted">
            <span
              className={`size-1.5 rounded-full ${
                product.stock ? "bg-forest" : "bg-muted"
              }`}
            />
            {product.stock
              ? "In stock. Ready for your everyday."
              : "Taking a little pause. Check back soon."}
          </p>
          <div className="mt-7 grid gap-4 border-y border-line py-5 text-xs text-muted">
            <span className="flex items-center gap-3">
              <Truck size={17} strokeWidth={1.4} />
              Free shipping on orders $100+ · 3–5 business days
            </span>
            <span className="flex items-center gap-3">
              <ShieldCheck size={17} strokeWidth={1.4} />
              30-day returns. A little peace of mind.
            </span>
          </div>
          <details className="border-b border-line py-4 text-sm">
            <summary className="cursor-pointer">Materials & care</summary>
            <p className="pt-3 text-xs leading-6 text-muted">
              {product.material}. Treat with a little care to enjoy for years to
              come. Clean gently with a soft cloth; follow the specific care
              instructions included with your object.
            </p>
          </details>
          <details className="border-b border-line py-4 text-sm">
            <summary className="cursor-pointer">
              A note about this store
            </summary>
            <p className="pt-3 text-xs leading-6 text-muted">
              Forma is a working portfolio storefront. Explore freely: all
              orders are mock orders, no card is charged, and no physical item
              is shipped.
            </p>
          </details>
        </div>
      </div>
      <section id="reviews" className="scroll-mt-28 border-b border-line py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow className="mb-3 text-muted">Better, together</Eyebrow>
            <Heading className="text-3xl">A few thoughtful words.</Heading>
          </div>
          <Button
            variant="secondary"
            onClick={() => setReviewOpen(!reviewOpen)}
          >
            Write a review
            <Plus size={15} />
          </Button>
        </div>
        {reviewOpen &&
          (user ? (
            <form
              onSubmit={submitReview}
              className="mt-7 grid max-w-xl gap-4 rounded-sm border border-line p-6"
            >
              <Field label="Your rating">
                <Select name="rating" defaultValue="5">
                  <option value="5">5 — An everyday favorite</option>
                  <option value="4">4 — Really good</option>
                  <option value="3">3 — It’s okay</option>
                  <option value="2">2 — Could be better</option>
                  <option value="1">1 — Not for me</option>
                </Select>
              </Field>
              <Field label="Your experience">
                <Textarea
                  name="comment"
                  rows={4}
                  minLength={5}
                  maxLength={2000}
                  required
                  placeholder="What makes this object part of your everyday?"
                />
              </Field>
              {reviewError && (
                <p role="alert" className="text-sm">
                  {reviewError}
                </p>
              )}
              <Button disabled={busy || !online} type="submit">
                {busy
                  ? "Sharing your thoughts…"
                  : !online
                    ? "Connect to share your review"
                    : "Share your review"}
                <ArrowRight size={15} />
              </Button>
            </form>
          ) : (
            <div className="mt-6 bg-surface p-6 text-sm">
              <p>Sign in to share your experience with the community.</p>
              <ButtonLink href="/account" className="mt-4">
                Sign in
                <ArrowRight size={15} />
              </ButtonLink>
            </div>
          ))}
        {reviews.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="border border-line p-6">
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className="fill-forest text-forest"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6">{review.comment}</p>
                <p className="mt-5 text-xs text-muted">
                  {review.authorName} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">
            Every good story starts somewhere. Be the first to share yours.
          </p>
        )}
      </section>
      <section className="pt-14">
        <div className="mb-7 flex items-end justify-between gap-3">
          <div>
            <Eyebrow className="mb-3 text-muted">
              Good things go together
            </Eyebrow>
            <Heading className="text-3xl">A few more to consider.</Heading>
          </div>
          <Link href="/#collection" className="flex items-center gap-2 text-xs">
            All objects
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-5 border-t border-line bg-paper p-4 md:hidden">
        <span className="text-sm font-medium">{money(product.price)}</span>
        <Button
          onClick={() => add(product, count)}
          disabled={!product.stock}
          className="min-w-48"
        >
          {product.stock ? "Add to bag" : "Out of stock"}
          <Plus size={15} />
        </Button>
      </div>
    </main>
  )
}
