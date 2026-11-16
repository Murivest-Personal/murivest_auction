import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { BuyerRegisterForm } from "@/components/buyers/BuyerRegisterForm";

export const metadata = buildMetadata({
  title: "Create buyer account — Registration & qualification | Murivest Auctions",
  description:
    "Create your Murivest Auctions buyer account to save lots, submit enquiries or bids where available, and complete qualification steps for commercial property auctions in Kenya and the UK.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <div className="auth-canvas min-h-screen">
      <Container className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          {/* Green intro band */}
          <div className="bg-green text-cream p-6 md:p-10 mb-8">
            <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
              Buyer account registration
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-light leading-[1.15] mb-4">
              Create your marketplace account.
            </h1>
            <p className="text-[0.95rem] leading-[1.8] text-[color:var(--mv-on-dark)] max-w-2xl mb-4">
              Register to save lots, track activity, submit enquiries or bids
              where available, and complete verification steps required by the
              marketplace or selling party. Your information is reviewed by the
              Murivest team and handled confidentially; funding evidence is
              stored outside the public website.
            </p>
            <p className="text-[0.8rem] leading-[1.7] text-[color:var(--mv-on-dark-faint)]">
              Confidential · Reviewed by the Murivest team
            </p>
          </div>

          {/* White form panel */}
          <div className="border border-hairline bg-white p-4 md:p-8">
            <BuyerRegisterForm />
          </div>
        </div>
      </Container>
    </div>
  );
}