import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { BuyerSignInForm } from "@/components/buyers/BuyerSignInForm";

export const metadata = buildMetadata({
  title: "Sign in | Murivest Auctions",
  description:
    "Sign in to your Murivest account with your registered email address and access code to follow your verification status, saved lots, bids and alert settings.",
  path: "/sign-in",
});

export default function SignInPage() {
  return (
    <Container className="py-14 md:py-20">
      <div className="max-w-2xl mx-auto">
        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Your account
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-green leading-[1.15] mb-10">
          Sign in.
        </h1>
        <Suspense>
          <BuyerSignInForm />
        </Suspense>
      </div>
    </Container>
  );
}
