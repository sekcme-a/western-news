// src/components/PasswordField.js
import React, { useState } from "react";

// 간단한 스타일 정의
const inputGroupStyle = {
  marginBottom: "20px",
};
const inputStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "1px solid #444",
  backgroundColor: "#333",
  color: "#fff",
  fontSize: "16px",
  boxSizing: "border-box",
  transition: "border-color 0.3s",
};
const inputFocusStyle = {
  borderColor: "#007aff", // Apple Blue
};
const passwordContainerStyle = {
  position: "relative",
};
const toggleButtonStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "#999",
  cursor: "pointer",
  padding: "5px",
};

const PasswordField = ({
  label,
  value,
  onChange,
  placeholder = "********",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={inputGroupStyle}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontSize: "14px",
          color: "#ccc",
        }}
      >
        {label}
      </label>
      <div style={passwordContainerStyle}>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={inputStyle}
          // 여기에 focus 스타일을 적용하기 위한 로직이 필요하지만, 인라인 스타일의 한계로 생략
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={toggleButtonStyle}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {/* 간단한 텍스트 아이콘으로 대체, 실제로는 SVG 사용 권장 */}
          {showPassword ? "👁️" : "🔒"}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
