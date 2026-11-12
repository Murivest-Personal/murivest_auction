import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { BuyerSignInForm } from "@/components/buyers/BuyerSignInForm";

export const metadata = buildMetadata({
  title: "Buyer portal sign-in | Murivest Group Ltd",
  description:
    "Sign in to the Murivest buyer portal with your registered email address and access code to view your qualification status and authorised data rooms.",
  path: "/buyers/sign-in",
});

export default function BuyerSignInPage() {
  return (
    <Container className="py-14 md:py-20">
      <div className="max-w-2xl mx-auto">
        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Buyer portal
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-green leading-[1.15] mb-10">
          Sign in.
        </h1>
        <BuyerSignInForm />
      </div>
    </Container>
  );
}
