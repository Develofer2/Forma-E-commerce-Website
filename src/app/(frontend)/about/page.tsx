import Image from "next/image"
import { getCatalog } from "@/lib/catalog"
import { ButtonLink, Eyebrow, Heading } from "@/components/ui"
import { ArrowRight, Leaf, Layers, Heart } from "lucide-react"
export const metadata = { title: "Less, but better — The Forma philosophy" }
export default async function AboutPage() {
  const { story } = await getCatalog()
  const image = typeof story?.storyImage === "object" ? story.storyImage : null
  return (
    <main className="mx-auto max-w-screen-2xl px-5 py-14 sm:px-8 lg:px-14">
      <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-20">
        <div>
          <Eyebrow className="mb-6 text-forest">The Forma philosophy</Eyebrow>
          <Heading as="h1" className="text-5xl leading-tight sm:text-6xl">
            Less, but
            <br />
            <span className="font-editorial font-normal italic">better.</span>
          </Heading>
          <p className="mt-7 max-w-md text-base leading-8 text-muted">
            {story?.intro}
          </p>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            Forma began with a simple question: what if everything we brought
            into our homes had a reason to be there? We look for honest
            materials, useful forms, and little details that turn ordinary
            routines into something worth noticing.
          </p>
          <ButtonLink href="/#collection" className="mt-8">
            Explore our objects
            <ArrowRight size={16} />
          </ButtonLink>
        </div>
        <div className="relative min-h-110 overflow-hidden rounded-sm bg-surface">
          {image?.url && (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
      </div>
      <section className="grid gap-10 border-b border-line py-16 md:grid-cols-3">
        {[
          {
            Icon: Layers,
            title: "Honest materials.",
            text: "Natural textures, thoughtful finishes, and materials that age with character. Beautiful from the first day, better with time.",
          },
          {
            Icon: Leaf,
            title: "A lighter footprint.",
            text: "Fewer, more intentional purchases. We choose useful objects over passing trends, because the best thing is the one you keep.",
          },
          {
            Icon: Heart,
            title: "Everyday, elevated.",
            text: "A favorite cup. A comfortable chair. The right light. Small things that quietly make a big difference.",
          },
        ].map(({ Icon, title, text }) => (
          <div key={title}>
            <Icon className="mb-5 text-forest" size={25} strokeWidth={1.3} />
            <Heading as="h3" className="text-xl">
              {title}
            </Heading>
            <p className="mt-3 text-sm leading-7 text-muted">{text}</p>
          </div>
        ))}
      </section>
      <div className="mx-auto max-w-xl py-14 text-center">
        <Eyebrow className="mb-4 text-muted">Behind the storefront</Eyebrow>
        <Heading className="text-3xl">A considered portfolio project.</Heading>
        <p className="mt-5 text-sm leading-7 text-muted">
          Forma is an independent e-commerce demo exploring thoughtful design
          and offline-first engineering. Products are CMS-managed, your bag and
          favorites persist offline, accounts use secure authentication, and
          checkout creates real mock-order records. No money changes hands, and
          nothing is shipped.
        </p>
      </div>
    </main>
  )
}
