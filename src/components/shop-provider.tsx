"use client"
// A returning browser's latest offline state wins; a new device loads server state.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Check, X, WifiOff, ArrowUpRight, Download } from "lucide-react"
import type { Product } from "@/payload-types"
import { db, readLocal, writeLocal, type CartLine } from "@/lib/offline"
import { Button, IconButton } from "./ui"

type Shopper = {
  id: string
  name: string
  email: string
}
type InstallEvent = Event & {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: string }>
}
type ShopContextValue = {
  cart: CartLine[]
  wishlist: string[]
  recent: Product[]
  ready: boolean
  online: boolean
  user: Shopper | null
  cartOpen: boolean
  setCartOpen(v: boolean): void
  add(product: Product, quantity?: number): void
  quantity(id: string, count: number): void
  toggleSaved(id: string): void
  view(product: Product): void
  clearCart(): void
  notify(message: string): void
  authenticate(
    action: "login" | "register",
    data: Record<string, string>,
  ): Promise<void>
  logout(): Promise<void>
  install(): void
  installable: boolean
}
const ShopContext = createContext<ShopContextValue | null>(null)
export function useShop() {
  const value = useContext(ShopContext)
  if (!value) throw new Error("Shopping context is missing.")
  return value
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [recent, setRecent] = useState<Product[]>([])
  const [user, setUser] = useState<Shopper | null>(null)
  const [ready, setReady] = useState(false)
  const [online, setOnline] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null)
  const [installHelp, setInstallHelp] = useState(false)
  const installDialog = useRef<HTMLDialogElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notify = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(""), 3800)
  }, [])

  useEffect(() => {
    if (installHelp) installDialog.current?.showModal()
    else installDialog.current?.close()
  }, [installHelp])

  useEffect(() => {
    let mounted = true
    async function initialize() {
      const [localCart, localWishlist, localRecent, cachedUser] =
        await Promise.all([
          readLocal<CartLine[] | null>("cart", null),
          readLocal<string[]>("wishlist", []),
          readLocal<Product[]>("recent", []),
          readLocal<Shopper | null>("user", null),
        ])
      if (!mounted) return
      setCart(
        localCart ??
          [],
      )
      setWishlist(localWishlist)
      setRecent(localRecent)
      setOnline(navigator.onLine)
      try {
        const result = await fetch("/api/shop/auth", {
          cache: "no-store",
        }).then((r) => r.json())
        if (!mounted) return
        setUser(result.user)
        if (result.user) {
          const remote = await fetch("/api/shop/state", {
            cache: "no-store",
          }).then((r) => r.json())
          if (!mounted) return
          const remoteCart: CartLine[] = (
            remote.cart ??
            []
          ).filter(
            (v: CartLine) =>
              typeof v.product ===
              "object",
          )
          if (localCart === null || cachedUser?.id !== result.user.id)
            setCart(remoteCart.length ? remoteCart : (localCart ?? []))
          setWishlist([
            ...new Set([
              ...localWishlist,
              ...(remote.wishlist ?? []).map((v: string | Product) =>
                typeof v === "string" ? v : v.id,
              ),
            ]),
          ])
        }
      } catch {
        if (mounted) setUser(cachedUser)
      }
      if (mounted) setReady(true)
    }
    initialize()
    const handleOnline = () => setOnline(navigator.onLine)
    const beforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as InstallEvent)
    }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOnline)
    window.addEventListener("beforeinstallprompt", beforeInstall)
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .then(async () => {
          const registration = await navigator.serviceWorker.ready
          const urls = performance
            .getEntriesByType("resource")
            .map((entry) => entry.name)
          registration.active?.postMessage({ type: "CACHE_RESOURCES", urls })
        })
        .catch(() => {})
    return () => {
      mounted = false
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOnline)
      window.removeEventListener("beforeinstallprompt", beforeInstall)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    writeLocal("cart", cart)
    writeLocal("wishlist", wishlist)
    writeLocal("recent", recent)
    writeLocal("user", user)
    if (!user || !online) return
    const timer = setTimeout(() => {
      fetch("/api/shop/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((v) => ({
            product: v.product.id,
            quantity: v.quantity,
          })),
          wishlist,
        }),
      }).catch(() => {})
    }, 650)
    return () => clearTimeout(timer)
  }, [cart, wishlist, recent, ready, user, online])

  useEffect(() => {
    if (!online || !user || !ready) return
    async function flush() {
      const orders = await db().outbox.toArray()
      for (const pending of orders) {
        if (pending.ownerId !== user!.id) continue
        try {
          const response = await fetch("/api/shop/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pending),
          })
          const result = await response.json()
          if (response.ok) {
            await db().outbox.delete(pending.idempotencyKey)
            notify(
              `You're back online. Order ${result.order.reference} is confirmed.`,
            )
          } else {
            await db().outbox.update(pending.idempotencyKey, {
              error: result.error,
            })
            notify(
              result.error ||
                "An offline order needs your attention in your account.",
            )
          }
        } catch {
          break
        }
      }
    }
    flush().catch(() => {})
  }, [online, user, ready, notify])

  const add = (product: Product, count = 1) => {
    if (product.stock <= 0)
      return notify("This object is currently out of stock.")
    setCart((previous) => {
      const exists = previous.find((v) => v.product.id === product.id)
      return exists
        ? previous.map((v) =>
            v.product.id === product.id
              ? {
                  product,
                  quantity: Math.min(product.stock, 99, v.quantity + count),
                }
              : v,
          )
        : [
            ...previous,
            { product, quantity: Math.min(count, product.stock, 99) },
          ]
    })
    notify(`${product.name} added to your bag.`)
  }
  const quantity = (id: string, count: number) =>
    setCart((previous) =>
      previous
        .map((v) =>
          v.product.id === id
            ? { ...v, quantity: Math.min(count, v.product.stock, 99) }
            : v,
        )
        .filter((v) => v.quantity > 0),
    )
  const toggleSaved = (id: string) =>
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((v) => v !== id)
        : [...previous, id],
    )
  const view = useCallback(
    (product: Product) =>
      setRecent((previous) =>
        [product, ...previous.filter((v) => v.id !== product.id)].slice(0, 8),
      ),
    [],
  )
  const authenticate = async (
    action: "login" | "register",
    data: Record<string, string>,
  ) => {
    const response = await fetch("/api/shop/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...data }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error)
    const remote = await fetch("/api/shop/state", { cache: "no-store" }).then(
      (r) => r.json(),
    )
    setCart((previous) => {
      const merged = new Map<string, CartLine>(
        (remote.cart ?? [])
          .filter((v: CartLine) => typeof v.product === "object")
          .map((v: CartLine) => [v.product.id, v]),
      )
      previous.forEach((v) => merged.set(v.product.id, v))
      return [...merged.values()]
    })
    setWishlist((previous) => [
      ...new Set([
        ...previous,
        ...(remote.wishlist ?? []).map((v: string | Product) =>
          typeof v === "string" ? v : v.id,
        ),
      ]),
    ])
    setUser(result.user)
    notify(
      `Welcome${
        action === "register" ? " to Forma" : " back"
      }, ${result.user.name.split(" ")[0]}.`,
    )
  }
  const logout = async () => {
    const response = await fetch("/api/shop/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    })
    if (!response.ok)
      return notify("Connect to the internet to sign out securely.")
    setUser(null)
    setCart([])
    setWishlist([])
    notify("You’re signed out.")
  }
  const install = async () => {
    if (installEvent) {
      await installEvent.prompt()
      await installEvent.userChoice
      setInstallEvent(null)
    } else setInstallHelp(true)
  }
  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        recent,
        user,
        ready,
        online,
        cartOpen,
        setCartOpen,
        add,
        quantity,
        toggleSaved,
        view,
        clearCart: () => setCart([]),
        notify,
        authenticate,
        logout,
        install,
        installable: !!installEvent,
      }}
    >
      {!online && (
        <div className="flex items-center justify-center gap-2 bg-ink px-4 py-2 text-center text-xs text-paper">
          <WifiOff size={14} /> You’re offline. Your saved objects and bag are
          still here.
        </div>
      )}
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-80 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-sm bg-ink px-5 py-4 text-sm text-paper shadow-xl"
        >
          <Check size={17} className="shrink-0" />
          {toast}
          <IconButton
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
            className="size-6 hover:bg-white/10"
          >
            <X size={15} />
          </IconButton>
        </div>
      )}
      {installHelp && (
        <dialog
          ref={installDialog}
          aria-labelledby="install-title"
          className="fixed inset-0 m-auto w-full max-w-md rounded-sm border-0 bg-paper p-8 text-ink backdrop:bg-ink/40"
          onCancel={() => setInstallHelp(false)}
          onClick={(event) => { if (event.target === event.currentTarget) setInstallHelp(false) }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="mb-5 text-forest" />
            <p id="install-title" className="text-2xl font-medium">
              A little more at home.
            </p>
            <p className="mt-4 leading-7 text-muted">
              In Chrome or Edge, open your browser menu and choose “Install
              Forma” or “Add to home screen.” On iPhone, use Share{" "}
              <ArrowUpRight className="inline" size={14} /> then “Add to Home
              Screen.”
            </p>
            <p className="mt-4 text-xs text-muted">
              Installation is available on supported browsers over HTTPS.
            </p>
            <Button className="mt-6" onClick={() => setInstallHelp(false)}>
              Got it
            </Button>
          </div>
        </dialog>
      )}
    </ShopContext.Provider>
  )
}
