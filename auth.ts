import prisma from "@/lib/prisma";
import NextAuth, { type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: Role | string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role | string;
  }

  interface JWT {
    id?: string;
    role?: Role | string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider === "google") {
        const { email, name } = user;

        if (email && name) {
          const alreadyUser = await prisma.user.findUnique({
            where: { email },
            select: {
              email: true,
            },
          });
          if (alreadyUser) {
            return true;
          } else {
            await prisma.user.create({
              data: {
                email,
                name: name,
                role: "CUSTOMER",
              },
            });
          }
          return true;
        } else {
          return false;
        }
      }
      return true;
    },
    jwt: async ({ token, user, trigger, session }) => {
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }

      if (user) {
        const alreadyUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            name: true,
            role: true,
          },
        });

        if (alreadyUser) {
          token.id = alreadyUser.id;
          token.name = alreadyUser.name as string;
          token.role = alreadyUser.role;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? session.user.name;
        session.user.role = token.role as string;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
