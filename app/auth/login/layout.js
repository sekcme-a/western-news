import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginLayout({ children }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
