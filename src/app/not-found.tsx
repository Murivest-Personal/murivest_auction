import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="py-24 md:py-40">
      <Container>
        <div className="max-w-[42rem]">
          <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-6">
            404
          </span>
          <h1 className="font-serif font-light text-green leading-tight text-[clamp(2rem,3.5vw,3.2rem)] mb-6">
            This page could not be found.
          </h1>
          <p className="text-[1.05rem] leading-[1.9] text-ink mb-10">
            The page or lot you are looking for may have been withdrawn,
            completed, or moved. Browse current lots across both markets, or
            contact the deal team.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display bg-green text-cream hover:bg-gold transition-colors"
            >
              Browse current lots
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 text-[0.65rem] tracking-[0.22em] uppercase font-display text-green border border-green hover:bg-green hover:text-cream transition-colors"
            >
              Return home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
