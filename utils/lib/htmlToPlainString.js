export const htmlToPlainString = (html) => {
  const plainString = html
    .replace(/<br\s*\/?>/gi, "\n") // <br>을 줄바꿈으로 변환
    .replace(/<[^>]+>/g, "") // 모든 HTML 태그 제거
    .replace(/\n\s*\n/g, "\n\n") // 연속 줄바꿈 정리
    .trim();

  return plainString;
};
