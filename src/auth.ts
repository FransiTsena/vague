import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const auth = () => getServerSession(authOptions);
