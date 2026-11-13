import { formatDate } from "@/lib/format";
import type { PublicComment } from "@/lib/types";

/** Server-rendered approved comments — indexable and citable
    (addendum §4.5). Email is never displayed. `hideHeading` drops
    the section heading when the list sits inside a collapsible
    dropdown whose header already names it. */
export function CommentList({
  comments,
  hideHeading = false,
}: {
  comments: PublicComment[];
  hideHeading?: boolean;
}) {
  return (
    <section
      id={hideHeading ? undefined : "public-comments"}
      className="scroll-mt-24"
    >
      {hideHeading ? (
        <h3 className="font-serif text-xl font-light text-green mb-6 mt-10">
          Published comments
        </h3>
      ) : (
        <>
          <span className="block font-display text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
            Moderated by default
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-green mb-8">
            Public comments
          </h2>
        </>
      )}
      {comments.length === 0 ? (
        <p className="text-[0.85rem] text-charcoal font-body">
          No comments have been approved for publication on this lot yet.
        </p>
      ) : (
        <div className="max-w-[42rem]">
          {comments.map((c, i) => (
            <article key={i} className="border-t border-[#E8E3DA] py-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-body text-sm text-green">{c.author_name}</span>
                <time className="text-[0.55rem] tracking-[0.25em] uppercase text-charcoal">
                  {formatDate(c.created_at)}
                </time>
              </div>
              <p className="font-body text-[0.95rem] leading-[1.8] text-ink">
                {c.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
