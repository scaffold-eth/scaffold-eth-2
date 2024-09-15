import { cookies } from "next/headers";
// import { randomUUID } from "crypto";
// import {JWT} from "next-auth/jwt";
import {
  // Account,
  // Profile,
  AuthOptions,
  Session,
  SessionStrategy,
  User,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { Config, adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import { createBuilder, getBuilderById } from "~~/services/database/repositories/builders";
import { SigninMessage } from "~~/utils/SigninMessage";

export const providers = [
  CredentialsProvider({
    name: "anonymous",
    id: "anonymous",
    credentials: {
      publicKey: { label: "publicKey", type: "text", placeholder: "0x0" },
    },
    async authorize(credentials) {
      // return createAnonymousUser();
      return createAnonymousEthUser(credentials);
    },
  }),

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
  provider?: string;
}

export const authOptions: AuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers,
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }: { token: any; user: ExtendedUser; account: any }) {
      if (user) {
        token.role = user.role;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      const user = session.user as ExtendedUser;

      user.address = token.sub;
      user.role = token.role;
      user.provider = token.provider;

      return session;
    },
  },

  // events: {
  //   async signIn({user, account, profile}: {user: ExtendedUser, account: Account | null, profile?: Profile}): Promise<void> {
  //     console.log(`signIn of ${user.name} from ${user?.provider || account?.provider}`);
  //   },
  //   async signOut({session, token}: {session: Session, token: JWT}): Promise<void> {
  //     console.log(`signOut of ${token.name} from ${token.provider}`);
  //   },
  // },
} as const;

// Helper functions

// const createAnonymousUser = (): ExtendedUser => {
//   // generate a random name and email for this anonymous user
//   const customConfig: Config = {
//     dictionaries: [adjectives, colors, animals],
//     separator: "-",
//     length: 3,
//     style: "capital",
//   };
//   // handle is simple-red-aardvark
//   const unique_handle: string = uniqueNamesGenerator(customConfig).replaceAll(" ", "");
//   // real name is Red Aardvark
//   const unique_realname: string = unique_handle.split("-").slice(1).join(" ");
//   const unique_uuid: string = randomUUID();
//   return {
//     id: unique_uuid,
//     email: `${unique_handle.toLowerCase()}@example.com`,
//     name: unique_realname,
//     image: "",
//     provider: "anonymous",
//   };
// };

const createAnonymousEthUser = (credentials: any): ExtendedUser => {
  const publicKey = credentials?.publicKey as string;

  // generate a random name and email for this anonymous user
  const customConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
    style: "capital",
  };
  // handle is simple-red-aardvark
  const unique_handle: string = uniqueNamesGenerator(customConfig).replaceAll(" ", "");
  // real name is Red Aardvark
  const unique_realname: string = unique_handle.split("-").slice(1).join(" ");

  return {
    id: publicKey,
    email: `${unique_handle.toLowerCase()}@example.com`,
    name: unique_realname,
    image: "",
    provider: "anonymous",
  };
};
