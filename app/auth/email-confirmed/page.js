"use client";

// src/pages/email-confirmed.js
import React, { useEffect, useState } from "react";
import Container from "../login/components/Container";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// 공통 스타일
const buttonStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#34c759", // Apple Green (성공 색상)
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "30px",
  transition: "background-color 0.3s",
};

const EmailConfirmedPage = () => {
  const router = useRouter();
  return (
    <Container title="이메일 인증 완료">
      <p className="text-center mb-4">
        **회원가입이 성공적으로 완료되었습니다.**
      </p>
      <p style={{ textAlign: "center", color: "#ccc", fontSize: "15px" }}>
        회원가입해 주셔서 감사합니다! 이제 로그인 페이지로 이동하여 계정에
        접속할 수 있습니다.
      </p>
      <button
        onClick={() => router.push("/auth/login")}
        style={{ ...buttonStyle, backgroundColor: "#007aff" }}
      >
        로그인 페이지로
      </button>
    </Container>
  );
};

export default EmailConfirmedPage;
