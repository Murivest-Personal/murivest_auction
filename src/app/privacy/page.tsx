import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Privacy Policy | Murivest Auctions",
  description:
    "How auctions.murivest.com handles personal data — bid registrations, public comments, IP hashing, cookies and your rights. Murivest Group Ltd.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" },
        ])}
      />

      <section className="py-16 md:py-24 border-b border-hairline">
        <Container>
          <SectionHeader
            numeral="—"
            eyebrow="Legal"
            title="Privacy Policy."
          />
          <p className="max-w-[42rem] text-[1.05rem] leading-[1.9] text-ink">
            This policy explains what personal data auctions.murivest.com
            collects, why it is collected, how it is protected, and the rights
            you have over it. It should be read together with the Terms of
            Service.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="max-w-[42rem] space-y-12">
            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Data we collect
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                The portal collects personal data only where you provide it:
              </p>
              <ul className="space-y-3">
                {[
                  "Bid registrations — name, email address, phone number, intended bid amount and the lot the registration relates to.",
                  "Public comments — the name you choose to publish, your email address (for moderation only, never displayed), and the comment text.",
                  "Technical metadata — a salted, one-way hash of your IP address, used solely for rate limiting and abuse prevention. Raw IP addresses are never stored.",
                ].map((item) => (
                  <li key={item} className="flex gap-4 text-[0.95rem] leading-[1.8] text-ink">
                    <span className="text-gold flex-shrink-0" aria-hidden="true">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Why we collect it
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Bid registrations are collected to route your registration of
                intent to the selling party named on the listing and to
                contact you about it. Comments are collected to publish
                moderated public discussion of a lot. Hashed IP metadata is
                collected to enforce the published rate limits and to detect
                abuse.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Where an engagement with Murivest Group Ltd follows, KYC/AML
                verification applies and is conducted under separate, explicit
                consent.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Calculators and analytics
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                The calculators on this portal run entirely in your browser.
                Nothing entered into them is transmitted to, or stored by,
                Murivest or any third party.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Storage, sharing and retention
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                Bid registrations and comments are stored in the firm&rsquo;s
                data infrastructure, accessible to the Murivest deal team for
                triage, routing and moderation. Registrations are shared with
                the selling party named on the relevant listing — that is
                their purpose. Email addresses are never displayed publicly
                and are never sold.
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Records are retained for as long as needed to handle the
                registration or moderation decision and to meet legal and
                record-keeping obligations, after which they are deleted.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Cookies
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                The portal sets only the technical cookies required to deliver
                the site. No advertising or third-party tracking cookies are
                set by Murivest.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Your rights
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink mb-4">
                You may request access to the personal data the portal holds
                about you, ask for its correction or deletion, and object to
                its processing. To exercise any of these rights, write to{" "}
                <a
                  href={`mailto:${SITE.officeEmail}`}
                  className="text-gold hover:text-green transition-colors"
                >
                  {SITE.officeEmail}
                </a>
                .
              </p>
              <p className="text-[1rem] leading-[1.9] text-ink">
                You also have the right to lodge a complaint with your local
                data protection authority.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-light text-green mb-4">
                Changes to this policy
              </h2>
              <p className="text-[1rem] leading-[1.9] text-ink">
                Murivest may update this policy from time to time. Material
                changes will be reflected on this page. Continued use of the
                portal after a change constitutes acceptance of the updated
                policy.
              </p>
            </section>
          </div>
        </Container>
      </section>
    </>
  );
}
