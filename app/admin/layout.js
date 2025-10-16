import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "./components/NavBar";
import Header from "./components/Header";

export default async function AdminLayout({ children }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase?.auth?.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (member?.role !== "admin" && member?.role !== "super_admin") {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-lg">⚠️ 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col md:flex-row text-black">
      <div className="bg-gray-100 hidden md:block">
        <NavBar />
      </div>
      <div className="flex-1 bg-white">
        <Header />
        <div className="p-8">{children}</div>
      </div>
    </main>
  );
}
