"use client";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useState } from "react";

const PasswordReset = () => {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // 비밀번호 재설정 후 사용자가 리다이렉트될 URL 설정
        // 이 URL은 Supabase Auth 설정의 "Site URL"과 "Redirect URLs"에 등록되어야 합니다.
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) throw error;
      setMessage(
        "비밀번호 재설정 링크가 이메일로 전송되었습니다. 확인해주세요."
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 rounded-xl shadow-2xl bg-[#2c2c2c] mx-auto mt-10">
      <h3 className="text-xl font-bold text-center text-white">
        비밀번호 찾기
      </h3>
      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="등록된 이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg border-2 border-[#404040] focus:border-white bg-[#333333] text-white placeholder-gray-400 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 text-lg font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? "전송 중..." : "재설정 이메일 받기"}
        </button>
      </form>

      {message && (
        <p
          className={`text-center text-sm ${
            message.includes("성공") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default PasswordReset;
