"use client";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useState } from "react";

// 3. 비밀번호 유효성 검사 함수 (이 함수는 변경 없이 재사용)
const validatePassword = (pw) => {
  // 6자리 이상 && 숫자 포함 && 기호(특수 문자) 포함
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/;
  return regex.test(pw);
};

const AuthForm = () => {
  const supabase = createBrowserSupabaseClient();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // ⭐ 비밀번호 확인 상태 추가
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // ⭐ 회원가입 시 비밀번호 일치 및 유효성 검사
    if (!isLogin) {
      if (password !== confirmPassword) {
        setMessage("비밀번호가 일치하지 않습니다.");
        setLoading(false);
        return;
      }
      if (!validatePassword(password)) {
        setMessage(
          "비밀번호는 6자리 이상이며, 숫자와 기호가 포함되어야 합니다."
        );
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // ... (로그인 로직은 동일)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("로그인 성공!");
      } else {
        // 회원가입 로직
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("회원가입 성공! 이메일을 확인하여 인증을 완료해주세요.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl shadow-2xl bg-[#2c2c2c] transition-all duration-300">
        {/* ... (제목) */}
        <form onSubmit={handleAuth} className="space-y-4">
          {/* ... (이메일 인풋) */}
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg border-2 border-[#404040] focus:border-white bg-[#333333] text-white placeholder-gray-400 focus:outline-none transition-colors"
            />
          </div>
          {/* 비밀번호 인풋 */}
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg border-2 border-[#404040] focus:border-white bg-[#333333] text-white placeholder-gray-400 focus:outline-none transition-colors"
            />
          </div>

          {/* ⭐ 비밀번호 확인 인풋 (회원가입 모드일 때만 표시) */}
          {!isLogin && (
            <div>
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg border-2 border-[#404040] focus:border-white bg-[#333333] text-white placeholder-gray-400 focus:outline-none transition-colors"
              />
            </div>
          )}
          {/* ... (버튼 및 메시지) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 text-lg font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>
        {/* ... (메시지 및 전환 버튼) */}
      </div>
    </div>
  );
};

export default AuthForm;
