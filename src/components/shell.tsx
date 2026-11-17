"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Check,
  ChevronDown,
  Download,
  Heart,
  Leaf,
  Menu,
  Minus,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Truck,
  UserRound,
  Wifi,
  X,
} from "lucide-react"
import { useShop } from "./shop-provider"
import { Button, ButtonLink, Heading, IconButton, Input } from "./ui"
import { money, totals } from "@/lib/format"

const menuLinks = [
  { key: "all", href: "/#collection", label: "Shop all" },
  { key: "new", href: "/?edit=new#collection", label: "New arrivals" },
  { key: "best", href: "/?edit=best#collection", label: "Bestsellers" },
  { key: "story", href: "/about", label: "Our story" },
]

function MenuSelection({ onChange }: { onChange(edit: string): void }) {
  const params = useSearchParams()
  useEffect(() => {
    onChange(params.get("edit") || "")
  }, [params, onChange])
  return null
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Forma home"
      className={`inline-flex items-center gap-1 text-3xl font-semibold tracking-tighter sm:text-4xl ${
        light ? "text-white" : "text-ink"
      }`}
    >
      forma
      <span className="mb-4 size-1.5 rounded-full bg-forest" />
    </Link>
  )
}
export function Header() {
  const { cart, wishlist, user, setCartOpen, online } = useShop()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [edit, setEdit] = useState("")
  const pathname = usePathname()
  const activeMenu = pathname === "/about"
    ? "story"
    : pathname === "/"
      ? edit === "new" || edit === "best" ? edit : "all"
      : null
  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [pathname, edit])
  const count = cart.reduce((sum, v) => sum + v.quantity, 0)
  return (
    <>
      <Suspense fallback={null}>
        <MenuSelection onChange={setEdit} />
      </Suspense>
      <div className="flex min-h-8 items-center justify-center gap-2 bg-soft-green px-4 text-center text-xs text-forest">
        <Leaf size={12} />
        <span>A little less, a little better.</span>
        <span className="mx-2 hidden opacity-30 sm:inline">|</span>
        <span className="hidden sm:inline">Free shipping on orders $100+</span>
        <ArrowUpRight size={12} className="hidden sm:block" />
      </div>
      <header className="sticky top-[var(--store-safe-top)] z-40 border-b border-line bg-paper/95 backdrop-blur-lg">
        <div className="mx-auto flex h-18 max-w-screen-2xl items-center justify-between gap-2 px-4 sm:h-22 sm:gap-8 sm:px-8 lg:px-14">
          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Toggle menu"
              className="-ml-1 size-8 sm:size-10 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </IconButton>
            <Brand />
          </div>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 text-sm md:flex"
          >
            {menuLinks.map(item => (
              <Link
                key={item.key}
                href={item.href}
                className={`nav-link ${activeMenu === item.key ? "text-forest" : ""}`}
                aria-current={activeMenu === item.key ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton
              aria-label="Search products"
              className="size-8 sm:size-10"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={20} strokeWidth={1.6} />
            </IconButton>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlist.length} saved items`}
              className="relative hidden size-10 items-center justify-center rounded-full hover:bg-surface sm:inline-flex"
            >
              <Heart size={20} strokeWidth={1.6} />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 size-1.5 rounded-full bg-forest" />
              )}
            </Link>
            <Link
              href="/account"
              aria-label={user ? "Your account" : "Sign in"}
              className="flex size-8 items-center justify-center rounded-full hover:bg-surface sm:size-10"
            >
              <UserRound size={20} strokeWidth={1.6} />
            </Link>
            <div className="mx-2 hidden h-5 w-px bg-line sm:block" />
            <IconButton
              aria-label={`Open shopping bag, ${count} items`}
              onClick={() => setCartOpen(true)}
              className="relative size-8 sm:size-10"
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
            </IconButton>
            <span className="flex size-5 items-center justify-center rounded-full bg-forest text-[10px] text-on-forest">
              {count}
            </span>
          </div>
        </div>
        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="grid gap-5 border-t border-line px-6 py-6 text-sm">
            {menuLinks.map(item => (
              <Link
                key={item.key}
                href={item.href}
                className={activeMenu === item.key ? "text-forest" : undefined}
                aria-current={activeMenu === item.key ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              className={pathname === "/wishlist" ? "text-forest" : undefined}
              aria-current={pathname === "/wishlist" ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              Saved objects
            </Link>
          </nav>
        )}
        {searchOpen && (
          <form
            action="/"
            className="mx-auto flex max-w-3xl items-center gap-2 px-5 pb-5 sm:gap-3 sm:px-6 sm:pb-6"
          >
            <Search size={20} className="hidden sm:block" />
            <Input
              name="search"
              autoFocus
              placeholder="Find something good…"
              value={search}
              className="min-w-0 flex-1"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" className="px-3">
              Search
              <ArrowRight size={16} />
            </Button>
            <IconButton
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <X size={18} />
            </IconButton>
          </form>
        )}
      </header>
      {!online && (
        <div className="sr-only" role="status">
          Offline mode is active.
        </div>
      )}
    </>
  )
}

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, quantity, online } = useShop()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (cartOpen) {
      dialog.current?.showModal()
      document.body.style.overflow = "hidden"
    } else {
      dialog.current?.close()
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [cartOpen])
  const total = totals(cart)
  return (
    <dialog
      ref={dialog}
      aria-label="Your shopping bag"
      onCancel={() => setCartOpen(false)}
      onClick={(e) => {
        if (e.target === e.currentTarget) setCartOpen(false)
      }}
      className="cart-dialog fixed inset-y-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-lg border-0 bg-paper p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line p-6">
          <Heading className="text-2xl">
            Your bag{" "}
            <span className="ml-2 text-sm text-muted">
              ({cart.reduce((sum, v) => sum + v.quantity, 0)})
            </span>
          </Heading>
          <IconButton aria-label="Close bag" onClick={() => setCartOpen(false)}>
            <X size={22} />
          </IconButton>
        </div>
        {cart.length ? (
          <>
            <div className="border-b border-line px-6 py-4 text-xs">
              <div className="flex items-center gap-2 text-forest">
                <Truck size={16} />
                {total.subtotal >= 100
                  ? "Your order ships on us."
                  : `You're ${money(100 - total.subtotal)} away from free shipping.`}
              </div>
              <progress
                className="mt-3 h-1 w-full accent-forest"
                value={Math.min(total.subtotal, 100)}
                max={100}
              />
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              {cart.map(({ product, quantity: count }) => (
                <div
                  key={product.id}
                  className="flex gap-4 border-b border-line py-6"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="relative h-28 w-24 shrink-0 overflow-hidden bg-surface"
                  >
                    {typeof product.image === "object" &&
                      product.image?.url && (
                        <Image
                          src={product.image.url}
                          alt={product.name}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      )}
                  </Link>
                  <div className="flex flex-1 flex-col items-start">
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="font-medium"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {product.color} · {product.material}
                    </p>
                    <p className="mt-2 text-sm">{money(product.price)}</p>
                    <div className="mt-auto flex w-full items-center justify-between gap-3 pt-3">
                      <div className="flex h-8 items-center border border-line">
                        <IconButton
                          aria-label={`Decrease ${product.name} quantity`}
                          className="size-8 rounded-none"
                          onClick={() => quantity(product.id, count - 1)}
                        >
                          <Minus size={12} />
                        </IconButton>
                        <span className="w-5 text-center text-xs">{count}</span>
                        <IconButton
                          aria-label={`Increase ${product.name} quantity`}
                          className="size-8 rounded-none"
                          disabled={count >= product.stock}
                          onClick={() => quantity(product.id, count + 1)}
                        >
                          <Plus size={12} />
                        </IconButton>
                      </div>
                      <Button
                        variant="ghost"
                        className="min-h-0 px-0 py-1 text-xs text-muted underline"
                        onClick={() => quantity(product.id, 0)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-paper p-6">
              <div className="mb-3 flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{money(total.subtotal)}</span>
              </div>
              <p className="mb-5 text-xs text-muted">
                Shipping calculated at checkout. No hidden extras.
              </p>
              <ButtonLink
                href="/checkout"
                className="w-full justify-between"
                onClick={() => setCartOpen(false)}
              >
                Checkout{" "}
                <span className="flex items-center gap-3">
                  {money(total.total)}
                  <ArrowRight size={17} />
                </span>
              </ButtonLink>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                <ShieldCheck size={14} />
                Demo checkout. No real payment.
              </p>
              <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted">
                {online ? <Check size={13} /> : <WifiOffIcon />}
                {online
                  ? "Your bag is safely saved."
                  : "Saved offline, just for you."}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
            <ShoppingBag
              size={40}
              strokeWidth={1}
              className="mb-6 text-muted"
            />
            <Heading className="text-3xl">Room for something good.</Heading>
            <p className="mt-3 text-sm leading-6 text-muted">
              Your bag is empty. Find a new everyday favorite in our collection.
            </p>
            <Button className="mt-7" onClick={() => setCartOpen(false)}>
              Keep exploring
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </dialog>
  )
}
function WifiOffIcon() {
  return <Wifi size={13} />
}

export function Footer() {
  const { install, online, notify } = useShop()
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const setting = localStorage.getItem("forma-theme")
    const isDark =
      setting === "dark" ||
      (!setting && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])
  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("forma-theme", next ? "dark" : "light")
  }
  return (
    <footer className="border-t border-line bg-surface/50">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-6 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-14">
        <div>
          <Brand />
          <p className="mt-4 max-w-60 text-sm leading-6 text-muted">
            Fewer, better things.
            <br />
            For a life well lived.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-forest" />
            {online
              ? "Online, and always here."
              : "Offline. Still here for you."}
          </div>
        </div>
        <div>
          <p className="mb-5 text-sm font-medium">Explore</p>
          <div className="grid gap-3 text-sm text-muted">
            <Link href="/#collection" className="hover:text-ink">
              Shop the collection
            </Link>
            <Link href="/?edit=new#collection" className="hover:text-ink">
              New arrivals
            </Link>
            <Link href="/about" className="hover:text-ink">
              The Forma philosophy
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-5 text-sm font-medium">A little help</p>
          <div className="grid gap-3 text-sm text-muted">
            <Link href="/account" className="hover:text-ink">
              Your account & orders
            </Link>
            <Button
              variant="ghost"
              className="min-h-0 justify-start p-0 text-muted"
              onClick={() =>
                notify(
                  "Complimentary shipping over $100. Otherwise $8. Delivery in 3–5 business days. Demo orders only.",
                )
              }
            >
              Shipping & delivery
              <ArrowUpRight size={12} />
            </Button>
            <Button
              variant="ghost"
              className="min-h-0 justify-start p-0 text-muted"
              onClick={() =>
                notify(
                  "A little peace of mind: 30-day returns on unused objects. This is a portfolio demo, so no items are shipped.",
                )
              }
            >
              Returns & exchanges
              <ArrowUpRight size={12} />
            </Button>
            <Link href="/admin" className="hover:text-ink">
              Store admin
              <ArrowUpRight size={12} className="ml-1 inline" />
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-5 text-sm font-medium">Make yourself at home.</p>
          <p className="text-sm leading-6 text-muted">
            Take Forma with you. Install our app to keep your favorites close,
            even offline.
          </p>
          <Button
            variant="secondary"
            className="mt-4 min-h-10 px-4 py-2 text-xs"
            onClick={install}
          >
            <Download size={14} />
            Install Forma
            <ArrowUpRight size={13} />
          </Button>
        </div>
      </div>
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-5 border-t border-line px-6 py-5 text-xs text-muted sm:px-8 lg:px-14">
        <span>© 2026 Forma. Thoughtfully put together.</span>
        <span className="hidden sm:inline">
          A considered store. A portfolio project.
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            United States · USD
            <ChevronDown size={12} />
          </span>
          <IconButton
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className="size-7"
            onClick={toggleTheme}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </IconButton>
        </div>
      </div>
    </footer>
  )
}

export function Benefits() {
  return (
    <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-6 border-b border-line px-6 py-7 sm:grid-cols-3 sm:gap-0 sm:px-8 lg:px-14">
      {[
        {
          Icon: Truck,
          title: "Good things, delivered.",
          text: "Free shipping on orders $100+",
        },
        {
          Icon: Leaf,
          title: "Made with intention.",
          text: "Thoughtful materials. Lasting design.",
        },
        {
          Icon: ShieldCheck,
          title: "A little peace of mind.",
          text: "Easy returns within 30 days",
        },
      ].map(({ Icon, title, text }, i) => (
        <div
          className={`flex items-center justify-center gap-4 ${
            i ? "sm:border-l sm:border-line" : ""
          }`}
          key={title}
        >
          <Icon size={24} strokeWidth={1.3} className="text-forest" />
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs text-muted">{text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
