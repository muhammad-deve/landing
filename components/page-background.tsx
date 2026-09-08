export function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_50%_-12%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_58%)]" />
      <div className="absolute inset-x-0 top-[46rem] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
