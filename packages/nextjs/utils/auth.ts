import { cookies } from "next/headers";
import { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { createBuilder, getBuilderById } from "~~/services/database/repositories/builders";
import { SigninMessage } from "~~/utils/SigninMessage";

export const providers = [
  GithubProvider({
    clientId: process.env.AUTH_GITHUB_ID as string,
    clientSecret: process.env.AUTH_GITHUB_SECRET as string,
  }),

  CredentialsProvider({
    name: "Ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials) {
      try {
        const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));
        const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);

        const result = await siwe.verify({
          signature: credentials?.signature || "",
          domain: nextAuthUrl.host,
          nonce: await getCsrfToken({
            req: {
              headers: {
                cookie: cookies().toString(),
              },
            },
          }),
        });

        if (result.success) {
          let user = await getBuilderById(siwe.address);

          if (!user) {
            // Create a new user if don't exist
            user = (
              await createBuilder({
                id: siwe.address,
                role: "user",
                github: null,
                telegram: null,
                email: null,
              })
            )[0];
          }

          return {
            id: user.id,
            role: user.role,
            github: user.github,
            telegram: user.telegram,
            email: user.email,
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    },
  }),

  CredentialsProvider({
    name: "Solana",
    id: "solana",
    credentials: {
      message: {
        label: "Message",
        type: "text",
      },
      signature: {
        label: "Signature",
        type: "text",
      },
    },
    async authorize(credentials) {
      try {
        const signinMessage = new SigninMessage(JSON.parse(credentials?.message || "{}"));
        const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
        if (signinMessage.domain !== nextAuthUrl.host) {
          return null;
        }

        if (
          signinMessage.nonce !==
          (await getCsrfToken({
            req: {
              headers: {
                cookie: cookies().toString(),
              },
            },
          }))
        ) {
          return null;
        }

        const validationResult = await signinMessage.validate(credentials?.signature || "");

        if (!validationResult) throw new Error("Could not validate the signed message");

        return {
          id: signinMessage.publicKey,
        };
      } catch (e) {
        return null;
      }
    },
  }),
];

interface ExtendedUser extends User {
  role?: string;
  address?: string;
}

export const authOptions: AuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any; user: ExtendedUser }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      const user = session.user as ExtendedUser;

      user.address = token.sub;
      user.role = token.role;

      return session;
    },
  },
} as const;
