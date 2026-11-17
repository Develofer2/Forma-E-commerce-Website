"use client"
import { Button, ButtonLink, Heading } from "@/components/ui"
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
      <Heading as="h1" className="text-3xl">
        A little pause, not the end.
      </Heading>
      <p className="mt-4 max-w-md text-sm text-muted">
        Something didn’t load quite right. Your saved bag is safe. Please try
        again.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" secondary>
          Back to Forma
        </ButtonLink>
      </div>
    </main>
  )
}
