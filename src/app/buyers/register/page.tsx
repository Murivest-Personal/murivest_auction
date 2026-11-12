import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { BuyerRegisterForm } from "@/components/buyers/BuyerRegisterForm";

export const metadata = buildMetadata({
  title: "Buyer registration — qualification file | Murivest Group Ltd",
  description:
    "Register as a buyer: individual or corporate status, residence and tax jurisdiction, identification, purchasing entity and beneficial ownership, budget, preferred markets and asset classes, funding position, proof of funds and acquisition timeline.",
  path: "/buyers/register",
});

export default function BuyerRegisterPage() {
  return (
    <Container className="py-14 md:py-20">
      <div className="max-w-3xl mx-auto">
        <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
          Buyer registration
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-green leading-[1.15] mb-4">
          Build your qualification file.
        </h1>
        <p className="text-[0.95rem] leading-[1.8] text-ink mb-12">
          Four steps, ten data points. The file is reviewed by the Murivest
          team, and you move through identity verification and funding
          verification to qualification. Everything you submit is treated as
          confidential; funding evidence is stored outside the public website.
        </p>
        <BuyerRegisterForm />
      </div>
    </Container>
  );
}
