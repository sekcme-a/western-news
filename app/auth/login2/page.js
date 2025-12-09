"use client";
// src/pages/login.js
import React, { useState } from "react";
import { useRouter } from "next/router";
import Container from "../login/components/Container";
import PasswordField from "../login/components/PasswordField";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// 공통 버튼 스타일
const buttonStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#007aff", // Apple Blue
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px",
  marginBottom: "15px",
  transition: "background-color 0.3s",
};
// 일반 입력 스타일 (Email용)
const inputStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "1px solid #444",
  backgroundColor: "#333",
  color: "#fff",
  fontSize: "16px",
  boxSizing: "border-box",
  marginBottom: "20px",
};
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  color: "#ccc",
};

const LoginPage = () => {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setMessage("로그인 성공! 대시보드로 이동합니다...");
      // 성공 시 대시보드 페이지로 리다이렉트
      // router.push("/dashboard");
    } catch (error) {
      setMessage(`로그인 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container title="로그인">
      <form onSubmit={handleLogin}>
        <div>
          <label style={labelStyle}>이메일</label>
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <PasswordField
          label="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <p
            style={{
              color: message.includes("성공") ? "#34c759" : "#ff3b30",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div style={{ textAlign: "center", fontSize: "14px" }}>
        <a
          href="/auth/signup"
          style={{
            color: "#007aff",
            textDecoration: "none",
            marginRight: "15px",
          }}
        >
          회원가입
        </a>
        <a
          href="/auth/forgot-password"
          style={{ color: "#007aff", textDecoration: "none" }}
        >
          비밀번호 찾기
        </a>
      </div>
    </Container>
  );
};

export default LoginPage;
