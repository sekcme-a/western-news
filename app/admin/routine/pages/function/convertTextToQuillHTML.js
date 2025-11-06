export function convertTextToQuillHTML(text) {
  if (!text) return "";

  // HTML 특수문자 이스케이프 (보안용)
  const escapeHTML = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // 줄바꿈(\n) → <br>
  const html = escapeHTML(text).replace(/\n/g, "<br>");

  // 전체를 <p>로 감싸기
  return `<p>${html}</p>`;
}
