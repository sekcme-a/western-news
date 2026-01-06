export const addSession = (key, data) => {
  const prevSession = sessionStorage.getItem(key);
  const sessions = prevSession ? JSON.parse(prevSession) : [];

  sessions.push(data);
  sessionStorage.setItem(key, JSON.stringify(sessions));
};

export const getSession = (key) => {
  const sessionData = sessionStorage.getItem(key);

  // 데이터가 존재하면 파싱하고, 없으면 빈 배열을 반환합니다.
  return sessionData ? JSON.parse(sessionData) : [];
};
