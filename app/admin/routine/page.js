"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MailBodoExtract from "./pages/MailBodoExtract";
import Instructions from "./pages/Instructions";
import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
// import SiheungBodo from "./pages/SiheungBodo/SiheungBodo";

export default function Routine() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [senders, setSenders] = useState("");
  const [subject, setSubject] = useState("보도");
  const [after, setAfter] = useState("");
  const [mails, setMails] = useState([]);
  const [selectedMails, setSelectedMails] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetchRoutineHistory();
  }, []);
  const fetchRoutineHistory = async () => {
    const { data } = await supabase
      .from("routine")
      .select()
      .eq("type", "mail_bodo")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data?.date) {
      // timestamptz → datetime-local 형식 변환
      const local = new Date(data.date);
      const offset = local.getTimezoneOffset();
      const localTime = new Date(local.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 16); // "YYYY-MM-DDTHH:MM"

      setAfter(localTime);
    }
  };
  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const fetchMails = async () => {
    setLoading(true);
    setMails([]); // 이전 결과 초기화
    setSelectedMails([]); // 선택된 메일 초기화

    const params = new URLSearchParams();
    if (senders) params.append("senders", senders);
    if (subject) params.append("subject", subject);
    if (after) params.append("after", after);

    try {
      const res = await fetch(`/api/mail?${params.toString()}`);
      const data = await res.json();
      setMails(data);
    } catch (error) {
      console.error("Fetch Mail Error:", error);
      setMails({ error: "메일 검색 중 오류가 발생했습니다." });
    }
    setLoading(false);
  };

  const toggleSelect = (mail) => {
    setSelectedMails((prev) =>
      prev.includes(mail) ? prev.filter((m) => m !== mail) : [...prev, mail]
    );
  };

  const handleExtract = () => {
    if (selectedMails.length === 0) {
      alert("메일을 한 개 이상 선택하세요!");
      return;
    }
    // 선택된 메일을 sessionStorage에 저장 (다음 페이지로 전달)
    // sessionStorage.setItem("selectedMails", JSON.stringify(selectedMails));
    // console.log(selectedMails);
    // router.push("/admin/articles/mail/extract");
    setPage(1);
  };

  if (page === 1) return <Instructions {...{ setPage }} />;
  if (page === 2)
    return (
      <MailBodoExtract
        {...{ selectedMails, setPage, setErrors, setWarnings }}
      />
    );

  // if (page === 3) return <SiheungBodo {...{ setErrors }} />;
  if (page === 0)
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
            {loading ? "검색 중..." : "검색"}
          </button>
        </div>

        {loading ? (
          <p>📨 메일 불러오는 중...</p>
        ) : mails.error ? (
          <p className="text-red-500">❌ 오류 발생: {mails.error}</p>
        ) : mails.length === 0 && !loading ? (
          <p>📭 검색 결과가 없습니다.</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-2">
              총 {mails.length}개의 메일이 검색되었습니다.
            </p>
            <ul className="space-y-3">
              {mails.map((mail, i) => (
                <li
                  key={i}
                  className={`p-3 rounded-md border border-gray-200 
                  shadow-sm flex items-center space-x-3 
                  ${selectedMails.includes(mail) ? "bg-green-100" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMails.includes(mail)}
                    onChange={() => toggleSelect(mail)}
                    className="w-4 h-4 cursor-pointer"
                    onClick={(e) => e.stopPropagation()} // li 클릭 이벤트 전파 방지
                  />
                  <div
                    className="flex-grow cursor-pointer"
                    onClick={() => toggleSelect(mail)} // 메일 정보를 클릭해도 선택되게
                  >
                    <p className="font-semibold">{mail.subject}</p>
                    <p className="text-sm text-gray-600">보낸이: {mail.from}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(mail.date).toLocaleString("ko-KR")}
                    </p>
                  </div>

                  {/* ⭐ 첨부파일 다운로드 링크 추가 */}
                  {mail.hasAttachments && mail.uid && (
                    <a
                      href={`/api/mail/download/${mail.uid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} // li의 선택 이벤트 방지
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-gray-200 flex-shrink-0"
                      title="첨부파일 다운로드"
                    >
                      📎
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <button
              onClick={handleExtract}
              className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition"
            >
              선택한 메일 ({selectedMails.length}개) 추출하기
            </button>
          </>
        )}
        <button
          onClick={async () => {
            // await navigator.clipboard.writeText("hop");
            setPage(1);
          }}
          className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition"
        >
          건너뛰기
        </button>
      </div>
    );
}
