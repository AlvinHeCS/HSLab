import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import { type AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { db } from "~/server/db";
import { type Grade, type Role } from "../../../generated/prisma";
import {
  generateUniqueFriendCode,
  generateUniqueUsername,
  pickAvatarColor,
} from "./helpers";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      grade: Grade | null;
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Wrap the Prisma adapter so OAuth user creation populates our extra
// required fields (displayName, username, avatarColor, friendCode).
const baseAdapter = PrismaAdapter(db);
const adapter = {
  ...baseAdapter,
  createUser: async (data: AdapterUser): Promise<AdapterUser> => {
    const seedName = data.name ?? data.email.split("@")[0] ?? "user";
    const username = await generateUniqueUsername(seedName);
    const friendCode = await generateUniqueFriendCode();
    const created = await db.user.create({
      data: {
        email: data.email,
        emailVerified: data.emailVerified,
        avatarUrl: data.image,
        displayName: data.name ?? seedName,
        username,
        avatarColor: pickAvatarColor(),
        friendCode,
      },
    });
    return {
      id: created.id,
      email: created.email,
      emailVerified: created.emailVerified,
      name: created.displayName,
      image: created.avatarUrl,
    };
  },
};

export const authConfig = {
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  adapter,
  // JWT strategy is required to mix Credentials with the OAuth adapter.
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (token.id && session.user) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, role: true, grade: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.grade = dbUser.grade;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
