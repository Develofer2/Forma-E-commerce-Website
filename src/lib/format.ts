export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
export function totals(
  items: {
    quantity: number
    product: { price: number }
  }[],
) {
  const subtotal = items.reduce(
    (sum, item) => sum + Math.round(item.product.price * 100) * item.quantity,
    0,
  )
  const shipping = subtotal === 0 || subtotal >= 10000 ? 0 : 800
  return {
    subtotal: subtotal / 100,
    shipping: shipping / 100,
    total: (subtotal + shipping) / 100,
  }
}
