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
        const emailInput = credentials?.email?.toLowerCase();
        const password = credentials?.password;
        if (!emailInput || !password) return null;

        // EMERGENCY OVERRIDE for Hackathon Demo
        if (password === "changeme") {
          const mockUsers: Record<string, any> = {
            "gm@hotel.local": { id: "mock-gm", name: "Thomas Miller", role: "ADMIN" },
            "head.culinarybanquets@hotel.local": { id: "mock-cv", name: "Chef Elena Rodriguez", role: "DEPT_HEAD" },
            "staff.bellman@hotel.local": { id: "mock-bell", name: "James Wilson", role: "STAFF" },
            "admin@hotel.local": { id: "mock-admin", name: "General Admin", role: "ADMIN" }
          };

          if (mockUsers[emailInput]) {
            const user = mockUsers[emailInput];
            return {
              id: user.id,
              email: emailInput,
              name: user.name,
              accessRole: user.role,
              departmentId: "mock-dept",
            };
          }
        }

        await dbConnect();
        const member = await Member.findOne({ email: emailInput });
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
    async redirect({ url, baseUrl }) {
      // Use the actual request's origin instead of falling back to localhost or a static baseUrl
      if (typeof window !== "undefined") {
        return window.location.origin;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
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
