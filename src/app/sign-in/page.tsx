import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { BuyerSignInForm } from "@/components/buyers/BuyerSignInForm";

export const metadata = buildMetadata({
  title: "Sign in | Murivest Auctions",
  description:
    "Sign in to your Murivest Auctions account to manage saved lots, track enquiries or bids, and view your verification status.",
  path: "/sign-in",
});

export default function SignInPage() {
  return (
    <div className="auth-canvas min-h-screen">
      <Container className="py-10 md:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="border border-hairline bg-white overflow-hidden">
            <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* Left green panel */}
              <div className="bg-green text-cream p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[400px]">
                <div>
                  <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-5">
                    Marketplace account access
                  </span>
                  <h1 className="font-serif text-3xl md:text-4xl font-light leading-[1.15] mb-6">
                    Welcome back.
                  </h1>
                  <p className="text-[0.95rem] leading-[1.8] text-[color:var(--mv-on-dark)] max-w-[24rem]">
                    Sign in with your registered email and access code to manage
                    saved lots, track enquiries or bids, and view your account
                    and verification status.
                  </p>
                </div>
                <p className="text-[0.8rem] leading-[1.7] text-[color:var(--mv-on-dark-faint)]">
                  Questions? Contact{" "}
                  <a
                    href="mailto:office@murivest.com"
                    className="text-cream underline underline-offset-4 hover:text-gold transition-colors"
                  >
                    office@murivest.com
                  </a>
                </p>
              </div>

              {/* Right white panel — form */}
              <div className="p-6 md:p-10 lg:p-14">
                <Suspense>
                  <BuyerSignInForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}