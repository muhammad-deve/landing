// Pages that hold session or CLI tokens, share links, or OAuth codes. They
// never load analytics, and links into them from public pages do a full page
// load so scripts loaded on the public page don't come along.
const PRIVATE_PREFIXES = ["/dashboard", "/login", "/signup", "/auth", "/s", "/f"];

export function isPrivatePath(href: string) {
  const pathname = href.split(/[?#]/, 1)[0];
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
