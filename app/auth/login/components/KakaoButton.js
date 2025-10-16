"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function KakaoButton() {
  const signInWithKakao = async () => {
    const supabase = await createBrowserSupabaseClient();

    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div
      className="relative w-9/12 md:w-[300px] mt-10 cursor-pointer 
    flex items-center bg-[#fee500] rounded-md py-1"
      onClick={signInWithKakao}
    >
      <Image
        src="/images/kakao.png"
        alt="카카오톡 로그인"
        width={600}
        height={600}
        style={{
          width: "30px",
          marginLeft: "10px",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <p className="text-black font-semibold ml-2 text-center w-full">
        카카오 로그인
      </p>
    </div>
  );
}
