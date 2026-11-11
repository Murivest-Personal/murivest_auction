import { cn } from "@/lib/utils";
import type { ArticleBlock } from "@/lib/types";

/** Article body renderer — prose measure capped at 42rem. */
export function Prose({
  blocks,
  className,
}: {
  blocks: ArticleBlock[];
  className?: string;
}) {
  return (
    <div className={cn("max-w-[42rem]", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="font-serif text-2xl md:text-3xl font-light text-green mt-12 mb-5"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="font-serif text-xl font-light text-green mt-8 mb-3"
              >
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="my-8 space-y-3">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-4 text-[1rem] leading-[1.8] text-ink">
                    <span className="text-gold flex-shrink-0" aria-hidden="true">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="font-serif text-2xl italic font-light text-green border-l-2 border-gold pl-10 max-w-3xl my-12"
              >
                {block.text}
              </blockquote>
            );
          default:
            return (
              <p key={i} className="text-[1.05rem] leading-[1.9] text-ink mb-6">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
