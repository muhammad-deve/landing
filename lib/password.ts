export interface PasswordRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

// Password policy (must match the backend in internal/model/constants.go):
// at least 8 characters, with at least one letter and one number.
export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (pw) => pw.length >= 8,
  },
  {
    id: "letter",
    label: "At least one letter",
    test: (pw) => /[a-zA-Z]/.test(pw),
  },
  {
    id: "number",
    label: "At least one number",
    test: (pw) => /[0-9]/.test(pw),
  },
];

/** Returns true when the password satisfies every rule. */
export function isPasswordValid(pw: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(pw));
}
