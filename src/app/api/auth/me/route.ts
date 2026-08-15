import { NextResponse } from "next/server";
import {
  getSession,
  publicUserFromSession,
} from "@/lib/auth/session";
import { userHasPassword } from "@/lib/auth/users";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: true, user: null });
  }

  const hasPassword = await userHasPassword(session.sub);

  return NextResponse.json({
    ok: true,
    user: {
      ...publicUserFromSession(session),
      hasPassword,
    },
  });
}
