"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CreditCard,
  Leaf,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Truck,
  WifiOff,
} from "lucide-react"
import { useShop } from "./shop-provider"
import { AuthForm } from "./account"
import { Button, ButtonLink, Eyebrow, Field, Heading, Input } from "./ui"
import { money, totals } from "@/lib/format"
import { db, readLocal, writeLocal, type OrderRequest } from "@/lib/offline"

const emptyShipping = {
  name: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "United States",
}
export function Checkout() {
  const { cart, clearCart, user, ready, online } = useShop()
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState(emptyShipping)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    reference: string
    queued: boolean
    total: number
  } | null>(null)
  const [key, setKey] = useState("")
  const total = totals(cart)
  useEffect(() => {
    setKey(crypto.randomUUID())
    readLocal("shipping", emptyShipping).then(setShipping)
  }, [])
  useEffect(() => {
    if (user)
      setShipping((previous) => ({
        ...previous,
        name: previous.name || user.name,
        email: previous.email || user.email,
      }))
  }, [user])
  const shippingSubmit = (event: FormEvent) => {
    event.preventDefault()
    writeLocal("shipping", shipping)
    setStep(1)
  }
  const paymentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (String(data.get("card")).replace(/\s/g, "") !== "4242424242424242") {
      setError("This is a demo. Please use the test card 4242 4242 4242 4242.")
      return
    }
    setError("")
    setStep(2)
  }
  async function placeOrder() {
    if (!user || busy) return
    setBusy(true)
    setError("")
    const body: OrderRequest = {
      idempotencyKey: key,
      shipping,
      items: cart.map((v) => ({ product: v.product.id, quantity: v.quantity })),
    }
    try {
      if (!online) {
        await db().outbox.put({ ...body, ownerId: user.id })
        const registration = await navigator.serviceWorker?.getRegistration()
        if (registration && "sync" in registration)
          await (registration as ServiceWorkerRegistration & {
            sync: { register(tag: string): Promise<void> }
          }).sync
            .register("forma-orders")
            .catch(() => {})
        setConfirmation({
          reference: `FM-${key.slice(0, 8).toUpperCase()}`,
          queued: true,
          total: total.total,
        })
      } else {
        const response = await fetch("/api/shop/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setConfirmation({
          reference: result.order.reference,
          queued: false,
          total: result.order.total,
        })
      }
      clearCart()
      writeLocal("shipping", emptyShipping)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your order hasn’t been placed. Please try again. Your bag is safe.",
      )
    } finally {
      setBusy(false)
    }
  }
  if (!ready)
    return (
      <main className="mx-auto min-h-[70vh] max-w-6xl animate-pulse px-6 py-16">
        <div className="h-12 w-72 bg-surface" />
        <div className="mt-10 h-96 bg-surface" />
      </main>
    )
  if (confirmation)
    return (
      <main className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 grid size-18 place-items-center rounded-full bg-soft-green text-forest">
          {confirmation.queued ? (
            <WifiOff size={30} strokeWidth={1.4} />
          ) : (
            <PackageCheck size={32} strokeWidth={1.4} />
          )}
        </div>
        <Eyebrow className="mb-5 text-forest">
          {confirmation.queued
            ? "Safely saved for later"
            : "A little everyday goodness"}
        </Eyebrow>
        <Heading as="h1" className="text-4xl">
          {confirmation.queued
            ? "Your order is waiting, safely."
            : "Good things are on the way."}
        </Heading>
        <p className="mt-5 max-w-md text-sm leading-7 text-muted">
          {confirmation.queued
            ? "Your mock order is stored on this device. We’ll automatically submit it when you reconnect with this account. You can review or cancel it in your account."
            : "Thank you for making room for something good. Your mock order is confirmed. No payment was taken, and no physical items will be shipped."}
        </p>
        <div className="my-8 w-full max-w-sm border-y border-line py-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Order reference</span>
            <span>{confirmation.reference}</span>
          </div>
          <div className="mt-3 flex justify-between">
            <span className="text-muted">
              {confirmation.queued ? "Estimated total" : "Order total"}
            </span>
            <span>{money(confirmation.total)}</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/account" secondary>
            View your orders
          </ButtonLink>
          <ButtonLink href="/#collection">
            Keep exploring
            <ArrowRight size={15} />
          </ButtonLink>
        </div>
      </main>
    )
  if (!cart.length)
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
        <Leaf size={32} className="mb-5 text-forest" />
        <Heading as="h1" className="text-3xl">
          A little room for good things.
        </Heading>
        <p className="mt-4 text-sm text-muted">
          Your bag is empty. Find your everyday favorite first.
        </p>
        <ButtonLink href="/#collection" className="mt-7">
          Explore the collection
          <ArrowRight size={15} />
        </ButtonLink>
      </main>
    )
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
      <Link
        href="/#collection"
        className="mb-8 flex items-center gap-2 text-xs text-muted"
      >
        <ArrowLeft size={13} />
        Back to the good things
      </Link>
      <Eyebrow className="mb-3 text-forest">
        Make it part of your everyday
      </Eyebrow>
      <Heading as="h1" className="text-4xl">
        A considered checkout.
      </Heading>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted">
        <ShieldCheck size={14} />
        This is a demo. No real payments, no real shipments.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div>
          <ol className="mb-8 flex items-center gap-3 border-b border-line pb-6 sm:gap-6">
            {["Shipping", "Payment", "Review"].map((label, i) => (
              <li
                key={label}
                className={`flex items-center gap-2 text-xs ${
                  step === i ? "font-medium text-forest" : "text-muted"
                }`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-full border ${
                    step >= i
                      ? "border-forest bg-forest text-on-forest"
                      : "border-line"
                  }`}
                >
                  {step > i ? <Check size={12} /> : i + 1}
                </span>
                {label}
                {i < 2 && (
                  <span className="ml-1 h-px w-5 bg-line sm:ml-3 sm:w-8" />
                )}
              </li>
            ))}
          </ol>
          {step === 0 && (
            <form onSubmit={shippingSubmit} className="grid gap-5">
              <Heading className="mb-1 text-2xl">
                Where should the good things go?
              </Heading>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name">
                  <Input
                    required
                    autoComplete="name"
                    maxLength={100}
                    value={shipping.name}
                    onChange={(e) =>
                      setShipping({ ...shipping, name: e.target.value })
                    }
                    placeholder="Alex Taylor"
                  />
                </Field>
                <Field label="Email address">
                  <Input
                    required
                    autoComplete="email"
                    type="email"
                    maxLength={100}
                    value={shipping.email}
                    onChange={(e) =>
                      setShipping({ ...shipping, email: e.target.value })
                    }
                    placeholder="you@example.com"
                  />
                </Field>
              </div>
              <Field label="Street address">
                <Input
                  required
                  autoComplete="street-address"
                  maxLength={200}
                  value={shipping.address}
                  onChange={(e) =>
                    setShipping({ ...shipping, address: e.target.value })
                  }
                  placeholder="123 Slow Living Lane"
                />
              </Field>
              <div className="grid grid-cols-2 gap-5">
                <Field label="City">
                  <Input
                    required
                    autoComplete="address-level2"
                    maxLength={100}
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                  />
                </Field>
                <Field label="Postal code">
                  <Input
                    required
                    autoComplete="postal-code"
                    maxLength={20}
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping({ ...shipping, postalCode: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Country">
                <Input
                  required
                  autoComplete="country-name"
                  maxLength={100}
                  value={shipping.country}
                  onChange={(e) =>
                    setShipping({ ...shipping, country: e.target.value })
                  }
                />
              </Field>
              <div className="flex items-center gap-3 border border-forest bg-soft-green p-4 text-sm text-forest">
                <Truck size={20} />
                <div>
                  <p>
                    Standard delivery ·{" "}
                    {total.shipping ? money(total.shipping) : "On us"}
                  </p>
                  <p className="mt-1 text-xs opacity-75">
                    3–5 business days · Demo shipping
                  </p>
                </div>
              </div>
              <Button type="submit" className="mt-2 justify-between">
                Continue to payment
                <ArrowRight size={16} />
              </Button>
            </form>
          )}
          {step === 1 && (
            <form onSubmit={paymentSubmit} className="grid gap-5">
              <Heading className="text-2xl">Just a practice payment.</Heading>
              <div className="border-l-2 border-forest bg-soft-green p-4 text-sm leading-6 text-forest">
                Use the test card <strong>4242 4242 4242 4242</strong>. Any
                future expiry and 3-digit CVC will work. Never enter real card
                details.
              </div>
              <Field label="Name on card">
                <Input
                  required
                  defaultValue={shipping.name}
                  placeholder="Alex Taylor"
                />
              </Field>
              <Field label="Test card number">
                <Input
                  name="card"
                  required
                  inputMode="numeric"
                  defaultValue="4242 4242 4242 4242"
                  maxLength={19}
                  minLength={16}
                />
              </Field>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Expiry (MM/YY)">
                  <Input
                    required
                    pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                    defaultValue="12/30"
                    placeholder="12/30"
                    maxLength={5}
                  />
                </Field>
                <Field label="CVC">
                  <Input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{3}"
                    defaultValue="123"
                    maxLength={3}
                  />
                </Field>
              </div>
              {error && (
                <p role="alert" className="text-sm">
                  {error}
                </p>
              )}
              <p className="flex items-center gap-2 text-xs text-muted">
                <LockKeyhole size={13} />
                Card details are not stored or sent to our server.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStep(0)
                    setError("")
                  }}
                >
                  <ArrowLeft size={15} />
                  Back
                </Button>
                <Button type="submit" className="flex-1 justify-between">
                  Review your order
                  <ArrowRight size={16} />
                </Button>
              </div>
            </form>
          )}
          {step === 2 && (
            <div>
              <Heading className="text-2xl">One last thoughtful look.</Heading>
              <div className="my-6 border-y border-line py-5">
                <div className="flex justify-between text-sm">
                  <span>Delivering to</span>
                  <Button
                    variant="ghost"
                    className="min-h-0 p-0 text-xs underline"
                    onClick={() => setStep(0)}
                  >
                    Edit
                  </Button>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {shipping.name}
                  <br />
                  {shipping.address}
                  <br />
                  {shipping.city}, {shipping.postalCode}
                  <br />
                  {shipping.country}
                  <br />
                  {shipping.email}
                </p>
              </div>
              <div className="mb-6 flex items-center gap-3 text-sm">
                <CreditCard size={20} />
                <span>Test card ending in 4242</span>
                <span className="ml-auto text-xs text-muted">No charge</span>
              </div>
              {!user ? (
                <div className="border border-line p-6">
                  <p className="mb-5 text-sm text-muted">
                    Sign in or create an account to safely save this mock order.
                  </p>
                  <AuthForm compact />
                </div>
              ) : (
                <>
                  <p className="mb-5 text-xs leading-6 text-muted">
                    {online
                      ? "By placing this mock order, you’re trying out our demo checkout. No money will be taken and no items will be shipped."
                      : "You’re offline. This mock order will be saved locally and submitted automatically when your connection returns. Final pricing is checked on reconnect."}
                  </p>
                  {error && (
                    <p
                      role="alert"
                      className="mb-4 border-l-2 border-forest bg-surface p-3 text-sm"
                    >
                      {error}
                    </p>
                  )}
                  <Button
                    disabled={busy}
                    className="w-full justify-between"
                    onClick={placeOrder}
                  >
                    {busy
                      ? "Putting good things together…"
                      : online
                        ? "Place demo order"
                        : "Save order for reconnect"}
                    <span className="flex items-center gap-3">
                      {money(total.total)}
                      <ArrowRight size={16} />
                    </span>
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                className="mt-4 text-xs"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={13} />
                Back to payment
              </Button>
            </div>
          )}
        </div>
        <aside className="h-fit border border-line bg-surface/40 p-6 sm:p-7">
          <Heading className="mb-5 text-xl">Your everyday edit</Heading>
          <div className="grid gap-5">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="relative size-18 shrink-0 overflow-hidden rounded-sm bg-surface">
                  {typeof product.image === "object" && product.image?.url && (
                    <Image
                      src={product.image.url}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {product.color} · Qty {quantity}
                  </p>
                </div>
                <span className="text-sm">
                  {money(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{money(total.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{total.shipping ? money(total.shipping) : "On us"}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-5 text-lg font-medium">
              <span>
                Total{" "}
                <span className="text-xs font-normal text-muted">USD</span>
              </span>
              <span>{money(total.total)}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[11px] text-muted">
            <ShieldCheck size={14} />
            Thoughtful choices. Secure checkout.
          </div>
        </aside>
      </div>
    </main>
  )
}
