"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExtractPage() {
  const router = useRouter();
  const [mails, setMails] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedMails");
    if (stored) {
      setMails(JSON.parse(stored));
    } else {
    }
  }, [router]);

  const currentMail = mails[currentIndex];

  const handleNext = () => {
    if (currentIndex < mails.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert("모든 메일을 확인했습니다!");
    }
  };

  // ... (기존 코드)

  // Mail 객체를 유니크하게 식별할 수 있는 키가 없어서,
  // 제목, 보낸이, 날짜 조합을 사용합니다.
  // 실제 서비스에서는 UID나 Message-ID를 사용하는 것이 좋습니다.
  const downloadFile = async (fileType) => {
    // 다운로드할 파일을 식별하기 위한 정보
    const mailInfo = {
      subject: currentMail.subject,
      from: currentMail.from,
      date: currentMail.date,
      // 이 정보는 /app/api/mail/attachments에서 메일을 찾을 때 사용됩니다.
    };

    try {
      // 새로운 API 라우트 호출 (첨부파일을 요청)
      const res = await fetch("/api/mail/attachments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 메일 정보와 요청 파일 타입 전송
        body: JSON.stringify({ mailInfo, fileType }),
      });

      if (!res.ok) {
        throw new Error(`다운로드 실패: ${res.statusText}`);
      }

      const attachments = await res.json();
      console.log(attachments);

      if (attachments.length === 0) {
        alert(`${currentMail.subject} 메일에는 해당되는 첨부파일이 없습니다.`);
        return;
      }

      // 🚨 받은 첨부파일들을 하나씩 다운로드 실행
      for (const attachment of attachments) {
        const blob = b64toBlob(attachment.content);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = attachment.filename; // 파일 이름 설정
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // 메모리 해제
      }
    } catch (error) {
      console.error("다운로드 오류:", error);
      alert(`파일 다운로드 중 오류 발생: ${error.message}`);
    }
  };

  // base64 → Blob 변환 함수 (기존 코드 유지)
  function b64toBlob(base64Data) {
    // ... (기존 코드 유지)
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray]);
  }

  // ... (기존 코드)

  // base64 → Blob 변환 함수
  function b64toBlob(base64Data) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray]);
  }

  if (!currentMail) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📎 첨부파일 추출</h1>

      <div className="border p-4 rounded-md shadow-sm bg-gray-50 mb-4">
        <p className="font-semibold mb-1">{currentMail.subject}</p>
        <p className="text-sm text-gray-600">보낸이: {currentMail.from}</p>
        <p className="text-xs text-gray-500">
          {new Date(currentMail.date).toLocaleString("ko-KR")}
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        <button
          onClick={() => downloadFile("hwp")}
          className="bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600"
        >
          한글 파일들 다운로드
        </button>
        <button
          onClick={() => downloadFile("image")}
          className="bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600"
        >
          이미지들 다운로드
        </button>
        <button
          onClick={handleNext}
          className="bg-gray-700 text-white py-2 rounded-lg font-medium hover:bg-gray-800"
        >
          다음 메일
        </button>
      </div>
    </div>
  );
}
