// src/utils/validation.js

/**
 * 비밀번호 유효성을 검사합니다.
 * - 6자리 이상
 * - 숫자 포함
 * - 기호 (영숫자가 아닌 문자) 포함
 * @param {string} password - 검사할 비밀번호
 * @returns {boolean} 유효하면 true
 */
export const validatePassword = (password) => {
  // 6자리 이상 확인
  if (password.length < 6) return false;

  // 숫자 포함 확인 (0-9)
  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) return false;

  // 기호 포함 확인 (영숫자가 아닌 문자: \W는 [^A-Za-z0-9_]와 같음)
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (!hasSymbol) return false;

  return true;
};
