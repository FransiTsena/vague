import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import { Member } from "@/lib/models";
import { compare } from "bcryptjs";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        const member = await Member.findOne({ email: email.toLowerCase() });
        if (!member?.passwordHash) return null;
        const isValid = await compare(password, member.passwordHash);
        if (!isValid) return null;

        return {
          id: member._id.toString(),
          email: member.email,
          name: member.name,
          accessRole: member.accessRole,
          departmentId: member.departmentId ? member.departmentId.toString() : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessRole = (user as any).accessRole;
        token.departmentId = (user as any).departmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).accessRole = token.accessRole;
        (session.user as any).departmentId = token.departmentId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
