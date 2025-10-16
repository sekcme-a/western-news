"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function GoogleButton() {
  const signInWithGoogle = async () => {
    const supabase = await createBrowserSupabaseClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div
      className="relative w-9/12 md:w-[300px] mt-5 cursor-pointer 
    flex items-center bg-white rounded-md py-1"
      onClick={signInWithGoogle}
    >
      <Image
        src="/images/google.png"
        alt="구글 로그인"
        width={600}
        height={600}
        style={{
          width: "20px",
          marginLeft: "10px",
          position: "absolute",
          top: 6,
          left: 5,
        }}
      />
      <p className="text-black font-semibold ml-2 text-center w-full">
        구글 로그인
      </p>
    </div>
  );
}
