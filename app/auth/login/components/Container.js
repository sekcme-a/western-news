// src/components/Container.js
import React from "react";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: "20px",
};

const cardStyle = {
  backgroundColor: "rgba(35, 35, 35, 0.8)", // 배경색보다 약간 밝은 반투명 카드
  backdropFilter: "blur(20px)", // 블러 효과 (Apple 스타일의 핵심)
  borderRadius: "15px",
  padding: "40px",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  width: "100%",
  maxWidth: "400px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "30px",
  color: "#ffffff",
};

const Container = ({ title, children }) => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <h2 style={headerStyle}>{title}</h2>
      {children}
    </div>
  </div>
);

export default Container;
