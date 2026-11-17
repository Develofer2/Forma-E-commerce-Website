export default function Loading() {
  return (
    <div aria-busy="true" className="mx-auto max-w-6xl px-5 py-16">
      <div className="h-3 w-24 animate-pulse bg-line" />
      <div className="mt-6 h-10 w-2/3 max-w-lg animate-pulse bg-line" />
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse bg-line/60" />
        ))}
      </div>
    </div>
  )
}
