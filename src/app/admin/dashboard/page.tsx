import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminDiscordId } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import { AdminChatsClient } from "./AdminChatsClient";

export const metadata: Metadata = {
  title: "Dashboard de Chats | Hollow",
  description: "Painel administrativo de suporte ao cliente",
};

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || !isAdminDiscordId(session.discordId)) {
    redirect("/login");
  }

  return <AdminChatsClient />;
}