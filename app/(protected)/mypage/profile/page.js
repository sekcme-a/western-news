import { createServerSupabaseClient } from "@/utils/supabase/server";
import MyPageNavbar from "../components/MypageNavbar";
import MyPageClient from "./MyPageClient";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 사용자가 로그인되어 있지 않다면 로그인 페이지로 리디렉션
    return redirect("/login");
  }

  // 닉네임은 user_metadata에서, 로그인 제공자는 app_metadata에서 가져옵니다.
  const email = user.email || "N/A";
  const nickname = user.user_metadata?.display_name || "닉네임 미설정";
  const providers = user.app_metadata.providers || [];

  const userData = {
    email,
    nickname,
    providers,
  };

  return (
    <div className="md:mx-[4vw] lg:mx-[7vw]">
      <div className="lg:mx-32">
        <MyPageNavbar selectedMenu="프로필" />
        <MyPageClient initialUserData={userData} />
      </div>
    </div>
  );
}
