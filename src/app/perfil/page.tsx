import type { Metadata } from "next";
import { ProfileClient } from "@/components/ProfileClient";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Gerencie sua conta Hollow e altere a senha.",
};

export default function PerfilPage() {
  return <ProfileClient />;
}
