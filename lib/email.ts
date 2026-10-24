// Quick shape check for an email field: name@domain.tld, no spaces. Labels
// can't contain dots, so the regex never backtracks and stays linear even on
// huge pasted input. The backend does the real validation.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function looksLikeEmail(value: string) {
  return EMAIL_SHAPE.test(value.trim());
}
