import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, description, className, titleClassName, align = "center" }: SectionHeaderProps) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl text-left", className)}>
      {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
      <h2 className={cn("mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl", titleClassName)}>{title}</h2>
      {description && <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground">{description}</p>}
    </div>
  );
}
