import Header from "@/components/Header/Header";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase?.auth?.getSession();
  if (!session) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
