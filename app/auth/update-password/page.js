"use client";

// src/pages/update-password.js (개선된 코드)
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validatePassword } from "../utils/validation";
import Container from "../login/components/Container";
import PasswordField from "../login/components/PasswordField";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// ... [이전과 동일한 스타일 정의] ...
const buttonStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#007aff",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px",
  marginBottom: "15px",
  transition: "background-color 0.3s",
};
const errorStyle = {
  color: "#ff3b30",
  textAlign: "center",
  marginBottom: "15px",
};
const successStyle = {
  color: "#34c759",
  textAlign: "center",
  marginBottom: "15px",
};

const UpdatePasswordPage = () => {
  const supabase = createBrowserSupabaseClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 페이지 로드 시, Supabase는 URL의 해시로부터 세션(AccessToken)을 읽어 세션을 설정합니다.
    // onAuthStateChange를 사용하여 PASSWORD_RECOVERY 이벤트를 감지할 수도 있지만,
    // 간단한 플로우에서는 페이지 로드 시 세션 유효성을 확인하는 것이 일반적입니다.
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setMessage(
          "유효한 비밀번호 재설정 세션이 없습니다. 이메일 링크를 통해 접속했는지 확인해주세요."
        );
      }
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("오류: 비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    // 요청하신 비밀번호 유효성 검사
    if (!validatePassword(password)) {
      setMessage(
        "오류: 비밀번호는 6자리 이상, 숫자와 기호가 포함되어야 합니다."
      );
      setLoading(false);
      return;
    }

    try {
      // **핵심**: 세션이 확보된 상태에서 updateUser()를 호출하여 비밀번호를 변경합니다.
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setMessage(
        "비밀번호가 성공적으로 재설정되었습니다! 2초 후 로그인 페이지로 이동합니다."
      );
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setMessage(`비밀번호 업데이트 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) {
    return (
      <Container title="확인 중">
        <p style={{ textAlign: "center", color: "#ccc" }}>
          세션 유효성 확인 중...
        </p>
      </Container>
    );
  }

  return (
    <Container title="비밀번호 재설정">
      {message.includes("유효한 비밀번호 재설정 세션") ? (
        <p style={errorStyle}>{message}</p>
      ) : (
        <form onSubmit={handlePasswordUpdate}>
          <p
            style={{ color: "#ccc", marginBottom: "20px", textAlign: "center" }}
          >
            새로운 비밀번호를 입력해주세요.
          </p>

          <PasswordField
            label="새 비밀번호 (6자 이상, 숫자, 기호 포함)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordField
            label="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {message && (
            <p style={message.includes("성공") ? successStyle : errorStyle}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "업데이트 중..." : "비밀번호 업데이트"}
          </button>
        </form>
      )}
    </Container>
  );
};

export default UpdatePasswordPage;
