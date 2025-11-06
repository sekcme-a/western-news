export const addSession = (key, data) => {
  const prevSession = sessionStorage.getItem(key);
  const sessions = prevSession ? JSON.parse(prevSession) : [];

  sessions.push(data);
  sessionStorage.setItem(key, JSON.stringify(sessions));
};
