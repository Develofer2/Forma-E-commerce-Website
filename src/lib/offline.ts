import Dexie, { type Table } from "dexie"
import type { Product } from "@/payload-types"

export type CartLine = {
  product: Product
  quantity: number
}
export type OrderRequest = {
  idempotencyKey: string
  items: {
    product: string
    quantity: number
  }[]
  shipping: {
    name: string
    email: string
    address: string
    city: string
    postalCode: string
    country: string
  }
}
export type PendingOrder = OrderRequest & {
  ownerId: string
  error?: string
}
export class FormaDB extends Dexie {
  declare state: Table<{
    key: string
    value: unknown
  }, string>
  declare outbox: Table<PendingOrder, string>
  constructor() {
    super("forma-offline")
    this.version(1).stores({ state: "key", outbox: "idempotencyKey" })
  }
}
let database: FormaDB | undefined
export function db() {
  return (database ??= new FormaDB())
}
export async function readLocal<T>(key: string, fallback: T): Promise<T> {
  try {
    return (await db().state.get(key))?.value as T ?? fallback
  } catch {
    return fallback
  }
}
export async function writeLocal(key: string, value: unknown) {
  try {
    await db().state.put({ key, value })
  } catch {
    /* Shopping still works when browser storage is unavailable. */
  }
}
