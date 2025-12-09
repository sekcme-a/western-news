import { createServerSupabaseClient } from "@/utils/supabase/server";
import GoogleButton from "./GoogleButton";
import KakaoButton from "./KakaoButton";

const SocialLogin = async () => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user);
  return (
    <div className="flex justify-center pt-40 flex-wrap">
      <h2 className="text-3xl font-bold w-full text-center">로그인</h2>
      <p className="mt-5 w-full text-center">
        소셜로그인으로 간편하게 로그인하세요!
      </p>

      <div className="w-full flex justify-center">
        <KakaoButton />
      </div>
      <GoogleButton />
    </div>
  );
};

export default SocialLogin;
