// routine/pages/RoutineResult.js
"use client";

import { useEffect, useState } from "react";
import { getSession, clearSession } from "../handleSession";
import Link from "next/link";
import { Button } from "@mui/material";

export default function RoutineResult({ setPage }) {
  const [results, setResults] = useState({ success: [], error: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션에서 결과 데이터 가져오기
    const data = getSession();
    setResults(data);
    setLoading(false);

    // 결과를 보여준 후 세션 데이터는 삭제 (선택 사항)
    // clearSession();

    // 모든 작업이 끝났음을 알리기 위해 오토마우스 인지용 코드 추가 (선택 사항)
    navigator.clipboard.writeText("routine_finished");
  }, []);

  const totalArticles = results?.success?.length + results?.error?.length;

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">⏳ 루틴 결과 분석 중...</h1>
        <p>잠시만 기다려주세요.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-4 text-blue-700">
        ✅ 루틴 작업 결과
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        총 **{totalArticles}개**의 기사 중 **{results?.success?.length}개** 저장
        성공, **
        {results?.error?.length}개** 저장 실패
      </p>

      {/* 성공 목록 - 저장된 기사 */}
      <div className="mb-10 p-5 border-2 border-green-200 rounded-xl bg-green-50">
        <h2 className="text-xl font-bold mb-4 text-green-700">
          🟢 성공적으로 저장된 기사 ({results?.success?.length}개)
        </h2>
        {results?.success?.length > 0 ? (
          <ul className="space-y-3">
            {results?.success?.map((res, index) => (
              <li
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <p className="font-semibold text-gray-800">
                  {/* MailBodoExtract에서 저장된 성공 데이터 처리 */}
                  {res.title
                    ?.replace("[메일 보도자료 저장 성공]", "")
                    ?.trim() || "제목 정보 없음"}
                </p>
                {/* 시흥/안산 보도자료 저장 성공 데이터 처리 */}
                {res.articleTitles ? (
                  res.articleTitles.map((title, i) => (
                    <div key={i} className="mt-1">
                      <p className="text-sm">📝 **제목:** {title}</p>
                      <p className="text-sm text-blue-600">
                        🏷️ **카테고리:**{" "}
                        {res.articleSlugs?.[i]?.category_slug || "미지정"}
                      </p>
                      {/* 실제 기사 링크가 있다면 여기에 추가 */}
                      {/* <Link
                                href={`/articles/${articleId}`} 
                                className="text-xs text-indigo-500 hover:underline"
                            >
                                기사 바로가기
                            </Link> */}
                      <hr className="my-2 border-gray-100 last:hidden" />
                    </div>
                  ))
                ) : (
                  <>
                    <p className="text-sm text-blue-600">
                      🏷️ **카테고리:**{" "}
                      {res.articleSlugs?.[0]?.category_slug || "미지정"}
                    </p>
                    {/* MailBodoExtract의 성공 메시지에는 article_id가 직접 없으므로, 필요하다면 추가적인 로직 필요 */}
                    {/* <Link
                            href={`/admin/articles/${articleId}`}
                            className="text-xs text-indigo-500 hover:underline"
                        >
                            기사 바로가기
                        </Link> */}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">저장된 기사가 없습니다.</p>
        )}
      </div>

      {/* 실패 목록 - 저장되지 않은 기사 및 이유 */}
      <div className="p-5 border-2 border-red-200 rounded-xl bg-red-50">
        <h2 className="text-xl font-bold mb-4 text-red-700">
          🛑 저장 실패 및 경고 ({results?.error?.length}개)
        </h2>
        {results?.error?.length > 0 ? (
          <ul className="space-y-3">
            {results.error.map((err, index) => (
              <li
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <p className="font-semibold text-gray-800">{err.title}</p>
                <p className="text-sm text-red-600 mt-1 whitespace-pre-wrap">
                  ⚠️ **실패 이유:** {err.message}
                </p>
                {err.button && (
                  <Link
                    href={err.button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outlined" size="small" className="mt-2">
                      {err.button.text}
                    </Button>
                  </Link>
                )}
                {err.articleIds && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      카테고리 미지정 기사 ID:
                    </p>
                    <ul className="list-disc ml-5 text-xs text-gray-600">
                      {err.articleIds.map((id, i) => (
                        <li key={i}>
                          <Link
                            href={`/admin/articles/${id}`}
                            className="text-indigo-500 hover:underline"
                          >
                            {id} (수동 편집)
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">저장 실패 항목이 없습니다.</p>
        )}
      </div>

      {/* <Button
        variant="contained"
        fullWidth
        className="h-[15vh]"
        sx={{
          mt: 4,
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
        }}
        onClick={() => {
          clearSession(); // 세션 클리어 후
          setPage(0); // 첫 화면으로 돌아가기
        }}
      >
        새 루틴 시작하기
      </Button> */}
    </div>
  );
}
