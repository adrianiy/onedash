import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { comparePassword } from "@/lib/auth";

// Extend NextAuth User type
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
    // Credentials Provider for existing email/password users
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await comparePassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      try {
        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // Check if this OAuth provider is already linked
          const providerExists = existingUser.providerAccounts?.some(
            (acc: { provider: string; providerAccountId: string }) =>
              acc.provider === account?.provider &&
              acc.providerAccountId === account?.providerAccountId
          );

          if (!providerExists) {
            // Link new provider to existing user
            await User.findByIdAndUpdate(existingUser._id, {
              $push: {
                providerAccounts: {
                  provider: account?.provider,
                  providerAccountId: account?.providerAccountId,
                },
              },
              $set: {
                image: user.image || existingUser.image,
              },
            });
          }
        } else {
          // Create new user with OAuth provider
          const newUser = new User({
            name: user.name,
            email: user.email,
            image: user.image,
            role: "user",
            providerAccounts: [
              {
                provider: account?.provider,
                providerAccountId: account?.providerAccountId,
              },
            ],
          });

          await newUser.save();
        }

        return true;
      } catch (error) {
        console.error("Error during OAuth sign in:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
