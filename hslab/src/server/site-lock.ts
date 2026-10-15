/**
 * The whole site sits behind one shared passphrase. Unlocking stores a hash of it in a cookie,
 * so changing SITE_PASSPHRASE signs every device out. Uses Web Crypto so middleware can run it.
 */
export const LOCK_COOKIE = "bubby_key";

export async function lockToken(passphrase: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`bubbyverse:${passphrase}`),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** Only same-site paths, so `?next=` can't bounce someone to another site. */
export function safeNextPath(value: unknown): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : "/";
}
