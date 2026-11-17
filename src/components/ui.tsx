import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  HTMLAttributes,
} from "react"
import Link from "next/link"

const variants = {
  primary: "bg-forest text-on-forest border-forest hover:bg-forest-dark",
  secondary: "bg-transparent text-ink border-line hover:bg-surface",
  ghost: "bg-transparent text-ink border-transparent hover:bg-surface",
}
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
}) {
  return (
    <button
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2.5 rounded-sm border px-5 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
export function IconButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-surface disabled:opacity-40 ${className}`}
      {...props}
    />
  )
}
export function ButtonLink({
  className = "",
  secondary = false,
  ...props
}: React.ComponentProps<typeof Link> & {
  className?: string
  secondary?: boolean
}) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center gap-3 rounded-sm border px-5 py-3 text-sm font-medium transition-colors ${
        secondary ? variants.secondary : variants.primary
      } ${className}`}
      {...props}
    />
  )
}
export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-12 w-full rounded-sm border border-line bg-paper px-3.5 py-3 text-sm outline-none placeholder:text-muted focus:border-forest focus:ring-1 focus:ring-forest ${className}`}
      {...props}
    />
  )
}
export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`min-h-11 cursor-pointer rounded-sm border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-forest ${className}`}
      {...props}
    />
  )
}
export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-sm border border-line bg-paper p-3 text-sm outline-none focus:border-forest ${className}`}
      {...props}
    />
  )
}
export function Heading({
  as: Tag = "h2",
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag className={`font-medium tracking-tight ${className}`} {...props} />
  )
}
export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  )
}
export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={`text-xs font-medium uppercase tracking-widest ${className}`}>
      {children}
    </p>
  )
}
