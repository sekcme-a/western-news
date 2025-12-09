import { NextRequest, NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;

  if (token_hash && type) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // profiles 테이블에서 해당 유저가 이미 있는지 확인
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          display_name:
            user?.user_metadata?.name ?? `유저_${user.id.slice(0, 8)}`,
          email: user.email,
          avatar_url: user?.user_metadata?.avatar_url ?? null,
        });
        const { error } = await supabase.auth.updateUser({
          data: {
            display_name:
              user?.user_metadata?.name ?? `유저_${user.id.slice(0, 8)}`,
          },
        });
      }
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = "/auth/auth-code-error";
  return NextResponse.redirect(redirectTo);
}
