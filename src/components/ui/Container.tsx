import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        !wide && "max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16",
        className
      )}
    >
      {children}
    </div>
  );
}
