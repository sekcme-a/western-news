import { createServerSupabaseClient } from "@/utils/supabase/server";
import GoogleButton from "./GoogleButton";
import KakaoButton from "./KakaoButton";

const SocialLogin = () => {
  return (
    <div className="flex justify-center flex-wrap">
      <p className="mt-5 w-full text-center text-sm">
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
