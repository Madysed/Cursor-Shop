import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            email: true,
            name: true,
            hashedPassword: true,
            role: true,
            image: true,
          }
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        const { hashedPassword: _, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          isAdmin: userWithoutPassword.role === "ADMIN"
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    signOut: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/login` : "http://localhost:3001/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as Role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    }
  }
}; 