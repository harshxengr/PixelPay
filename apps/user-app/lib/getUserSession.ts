import { getServerSession, Session } from "next-auth";
import { authOptions } from "./authOptions";
import { redirect } from "next/navigation";

export async function getUserSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/sign-in");
  }

  return session;
}
