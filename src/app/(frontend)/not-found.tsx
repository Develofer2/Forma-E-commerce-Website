import { ArrowRight } from "lucide-react"
import { ButtonLink, Eyebrow, Heading } from "@/components/ui"
export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-6 py-20 text-center">
      <div>
        <Eyebrow className="mb-5 text-muted">
          A little off the beaten path · 404
        </Eyebrow>
        <Heading as="h1" className="text-4xl">
          This object has wandered off.
        </Heading>
        <p className="mt-4 text-sm text-muted">
          It may have moved, or it might not be part of our collection anymore.
        </p>
        <ButtonLink href="/" className="mt-7">
          Back to the good things
          <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </main>
  )
}
