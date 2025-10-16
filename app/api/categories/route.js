import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  console.log("🔥 Supabase 실제 호출 발생"); // 로그 확인용

  const { data, error } = await supabase.from("categories").select("*");
  return Response.json(data || []);
}

export const revalidate = 3600; // ISR 캐싱
