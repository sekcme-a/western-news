"use client";

import { useState } from "react";

export default function MailPage() {
  const [senders, setSenders] = useState("");
  const [subject, setSubject] = useState("");
  const [after, setAfter] = useState("");
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMails = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (senders) params.append("senders", senders);
    if (subject) params.append("subject", subject);
    if (after) params.append("after", after);

    const res = await fetch(`/api/mail?${params.toString()}`);
    const data = await res.json();
    setMails(data);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📬 Daum 메일 검색</h1>

      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="보낸이 입력 (예: naver.com,gmail.com)"
          value={senders}
          onChange={(e) => setSenders(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="메일 제목 검색 (예: 청구서, 공지)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            날짜 이후의 메일만 보기
          </label>
          <input
            type="datetime-local"
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={fetchMails}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
        >
          검색
        </button>
      </div>

      {loading ? (
        <p>📨 메일 불러오는 중...</p>
      ) : mails.error ? (
        <p className="text-red-500">❌ 오류 발생: {mails.error}</p>
      ) : mails.length === 0 ? (
        <p>📭 검색 결과가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {mails.map((mail, i) => (
            <li
              key={i}
              className="p-3 rounded-md border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <p className="font-semibold">{mail.subject}</p>
              <p className="text-sm text-gray-600">보낸이: {mail.from}</p>
              <p className="text-xs text-gray-500">
                {new Date(mail.date).toLocaleString("ko-KR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
