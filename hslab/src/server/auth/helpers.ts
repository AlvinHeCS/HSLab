import { db } from "~/server/db";

const FRIEND_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
const AVATAR_COLORS = [
  "#FF6B6B", "#FFA94D", "#FFD43B", "#69DB7C",
  "#4DABF7", "#9775FA", "#F783AC", "#63E6BE",
  "#FFB199", "#74C0FC", "#B197FC", "#FFA8A8",
];

function randomString(length: number, alphabet: string): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** ABCD-1234 style code, retries until unique. */
export async function generateUniqueFriendCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code =
      randomString(4, FRIEND_CODE_ALPHABET) +
      "-" +
      randomString(4, FRIEND_CODE_ALPHABET);
    const exists = await db.user.findUnique({ where: { friendCode: code } });
    if (!exists) return code;
  }
  throw new Error("Failed to generate unique friend code after 10 attempts");
}

/** Slugify name + numeric suffix until unique. */
export async function generateUniqueUsername(seed: string): Promise<string> {
  const base = seed
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 16) || "user";
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? base : `${base}${Math.floor(Math.random() * 9000) + 1000}`;
    const exists = await db.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate unique username after 20 attempts");
}

export function pickAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!;
}
