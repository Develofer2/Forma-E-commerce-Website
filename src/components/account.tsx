"use client"

import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import {
  ArrowRight,
  Check,
  Clock3,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react"
import type { Order } from "@/payload-types"
import { useShop } from "./shop-provider"
import { Button, ButtonLink, Eyebrow, Field, Heading, Input } from "./ui"
import { money } from "@/lib/format"
import { db, type PendingOrder } from "@/lib/offline"

export function AuthForm({ compact = false }: { compact?: boolean }) {
  const { authenticate, online } = useShop()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setBusy(true)
    const data = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>
    try {
      await authenticate(mode, data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not connect. Please try again.",
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className={compact ? "" : "w-full max-w-md"}>
      <Eyebrow className="mb-4 text-forest">
        {mode === "login" ? "Make yourself at home" : "A little more connected"}
      </Eyebrow>
      <Heading as={compact ? "h2" : "h1"} className="text-3xl sm:text-4xl">
        {mode === "login" ? "Good to have you back." : "Your everyday, saved."}
      </Heading>
      <p className="mt-4 text-sm leading-6 text-muted">
        {mode === "login"
          ? "Sign in for saved favorites, a bag that follows you, and all your orders in one place."
          : "Create an account and keep your considered collection close, wherever you are."}
      </p>
      <div className="mt-7 flex border-b border-line">
        <Button
          variant="ghost"
          className={`flex-1 rounded-none border-0 border-b-2 ${
            mode === "login"
              ? "border-forest text-forest"
              : "border-transparent text-muted"
          }`}
          onClick={() => {
            setMode("login")
            setError("")
          }}
        >
          Sign in
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 rounded-none border-0 border-b-2 ${
            mode === "register"
              ? "border-forest text-forest"
              : "border-transparent text-muted"
          }`}
          onClick={() => {
            setMode("register")
            setError("")
          }}
        >
          Create account
        </Button>
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-5">
        {mode === "register" && (
          <Field label="Your name">
            <Input
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="Alex Taylor"
            />
          </Field>
        )}
        <Field label="Email address">
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength={8}
            maxLength={128}
            required
            placeholder="At least 8 characters"
          />
        </Field>
        {error && (
          <p
            role="alert"
            className="border-l-2 border-forest bg-surface p-3 text-sm"
          >
            {error}
          </p>
        )}
        {!online && (
          <p role="status" className="text-sm text-muted">
            You’re offline. Please reconnect to sign in securely.
          </p>
        )}
        <Button
          type="submit"
          disabled={busy || !online}
          className="w-full justify-between"
        >
          {busy
            ? "One thoughtful moment…"
            : mode === "login"
              ? "Sign in"
              : "Create your account"}
          <ArrowRight size={16} />
        </Button>
        <p className="flex items-center justify-center gap-2 text-[11px] text-muted">
          <ShieldCheck size={13} />
          Secure sign-in. No real payments, ever.
        </p>
      </form>
    </div>
  )
}

export function Account() {
  const { user, ready, logout, online, notify } = useShop()
  const [orders, setOrders] = useState<Order[]>([])
  const [pending, setPending] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => {
    if (!user) return
    setLoading(true)
    db()
      .outbox.toArray()
      .then((items) => setPending(items.filter((v) => v.ownerId === user.id)))
      .catch(() => {})
    fetch("/api/shop/orders", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setOrders(result.orders ?? [])
        setError("")
      })
      .catch(() =>
        setError(
          online
            ? "We couldn’t load your orders. Refresh to try again."
            : "Order history will be available when you’re back online. Your bag and favorites are still here.",
        ),
      )
      .finally(() => setLoading(false))
  }, [user, online])
  if (!ready)
    return (
      <main className="mx-auto min-h-[60vh] max-w-5xl animate-pulse px-6 py-16">
        <div className="mb-5 h-10 w-72 bg-surface" />
        <div className="h-64 bg-surface" />
      </main>
    )
  if (!user)
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-16">
        <AuthForm />
      </main>
    )
  return (
    <main className="mx-auto min-h-[65vh] max-w-5xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow className="mb-4 text-forest">Your own little corner</Eyebrow>
          <Heading as="h1" className="text-4xl">
            Hello, {user.name.split(" ")[0]}.
          </Heading>
          <p className="mt-3 text-sm text-muted">{user.email}</p>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await logout()
            } catch {
              notify("Connect to sign out securely.")
            }
          }}
        >
          <LogOut size={14} />
          Sign out
        </Button>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Link
          href="/wishlist"
          className="group flex items-center justify-between border border-line p-6"
        >
          <span>
            <HeartIcon />
            <span className="mt-3 block text-lg">Your saved objects</span>
            <span className="mt-1 block text-xs text-muted">
              Keep the good things close.
            </span>
          </span>
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="/checkout"
          className="group flex items-center justify-between border border-line p-6"
        >
          <span>
            <ShoppingBag size={22} strokeWidth={1.4} />
            <span className="mt-3 block text-lg">Your everyday bag</span>
            <span className="mt-1 block text-xs text-muted">
              Pick up where you left off.
            </span>
          </span>
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
      <section className="mt-12">
        <div className="flex items-center gap-3">
          <Package size={22} strokeWidth={1.4} />
          <Heading className="text-2xl">Your orders</Heading>
        </div>
        <p className="mt-2 text-xs text-muted">
          A history of good choices. All orders are demo orders.
        </p>
        {pending.map((order) => (
          <div
            key={order.idempotencyKey}
            className="mt-5 border border-line bg-surface p-5"
          >
            <div className="flex items-center gap-2 text-sm">
              <Clock3 size={16} />
              Waiting for a connection
            </div>
            <p className="mt-2 text-xs text-muted">
              {order.error ||
                "Your order is safely saved on this device and will sync when you reconnect."}
            </p>
            <Button
              variant="ghost"
              className="mt-3 min-h-0 p-0 text-xs underline"
              onClick={async () => {
                await db().outbox.delete(order.idempotencyKey)
                setPending((previous) =>
                  previous.filter(
                    (v) => v.idempotencyKey !== order.idempotencyKey,
                  ),
                )
                notify("Queued order cancelled.")
              }}
            >
              Cancel queued order
            </Button>
          </div>
        ))}
        {loading ? (
          <div className="mt-6 h-30 animate-pulse bg-surface" />
        ) : error ? (
          <p className="mt-6 border border-line p-6 text-sm text-muted">
            {error}
          </p>
        ) : !orders.length ? (
          <div className="mt-6 border border-dashed border-line py-12 text-center">
            <Package
              className="mx-auto mb-4 text-muted"
              size={28}
              strokeWidth={1.2}
            />
            <p className="text-lg">Your story is just beginning.</p>
            <p className="mt-2 text-sm text-muted">
              Your mock orders will find a home here.
            </p>
            <ButtonLink href="/#collection" className="mt-5">
              Explore the collection
              <ArrowRight size={15} />
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {orders.map((order) => (
              <div key={order.id} className="border border-line p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{order.reference}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-soft-green px-3 py-1.5 text-xs capitalize text-forest">
                    <Check size={12} />
                    {order.status}
                  </span>
                </div>
                <div className="mt-5 border-t border-line pt-4">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between gap-3 py-1.5 text-sm"
                    >
                      <span>
                        {item.name ||
                          (typeof item.product === "object"
                            ? item.product.name
                            : "Considered object")}{" "}
                        <span className="text-muted">× {item.quantity}</span>
                      </span>
                      <span>
                        {money((item.unitPrice ?? 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 flex justify-between border-t border-line pt-4 text-sm font-medium">
                    <span>Total, including shipping</span>
                    <span>{money(order.total ?? 0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
function HeartIcon() {
  return <UserRound size={22} strokeWidth={1.4} />
}
