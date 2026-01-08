"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import MyPageNavbar from "../components/MypageNavbar";
import { useAuth } from "@/providers/AuthProvider";
import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function BookmarksPage() {
  const supabase = createBrowserSupabaseClient();
  const { user } = useAuth();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // bookmarks 테이블에서 데이터를 가져오되, articles 테이블을 조인하여 필요한 정보 선택
      const { data, count, error } = await supabase
        .from("bookmarks")
        .select(
          `
          id,
          created_at,
          article_id,
          articles (
            id,
            title,
            content,
            thumbnail_image,
            category,
            created_at,
            author
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching bookmarks:", error);
      } else {
        setBookmarks(data || []);
        setTotalCount(count || 0);
      }
      setLoading(false);
    };

    fetchBookmarks();
  }, [user, currentPage, supabase]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white">
      <div className="md:mx-[4vw] lg:mx-[7vw] pt-10 pb-20">
        <div className="lg:mx-32">
          {/* 네비게이션 바 */}
          <MyPageNavbar selectedMenu="북마크" />

          <div className="mt-8">
            <h1 className="text-2xl font-bold mb-6 px-2">
              북마크한 기사 ({totalCount})
            </h1>

            {loading ? (
              // 로딩 스켈레톤
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#2a2a2a] h-40 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : bookmarks.length === 0 ? (
              // 데이터 없음
              <div className="text-center py-20 text-gray-400 bg-[#2a2a2a] rounded-lg">
                북마크한 기사가 없습니다.
              </div>
            ) : (
              // 북마크 리스트
              <div className="space-y-4">
                {bookmarks.map((item) => {
                  const article = item.articles;
                  if (!article) return null; // 기사가 삭제된 경우 방어 코드

                  return (
                    <div
                      key={item.id}
                      className="group bg-[#2a2a2a] hover:bg-[#333333] transition-colors rounded-lg overflow-hidden border border-[#3a3a3a] shadow-sm"
                    >
                      <Link
                        href={`/article/${article.id}`}
                        className="flex flex-col md:flex-row"
                      >
                        {/* 썸네일 이미지 영역 */}
                        <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden relative bg-black">
                          {article.thumbnail_image ? (
                            <img
                              src={article.thumbnail_image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            // 이미지가 없을 때 보여줄 placeholder
                            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-[#1a1a1a]">
                              <span className="text-xs">No Image</span>
                            </div>
                          )}
                          {/* 카테고리 뱃지 */}
                          {article.category && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-md opacity-90">
                              {article.category}
                            </span>
                          )}
                        </div>

                        {/* 기사 내용 영역 */}
                        <div className="p-5 flex flex-col justify-between flex-grow">
                          <div>
                            <h2 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 text-gray-100 group-hover:text-blue-400 transition-colors">
                              {article.title}
                            </h2>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                              {htmlToPlainString(article.content) ||
                                "내용 미리보기가 없습니다."}
                            </p>
                          </div>

                          <div className="flex justify-between items-end border-t border-[#3a3a3a] pt-3 mt-2">
                            <div className="text-xs text-gray-500">
                              <span className="mr-2">
                                {article.author || "편집부"}
                              </span>
                              <span>{formatDate(article.created_at)}</span>
                            </div>
                            <span className="text-xs text-blue-400 font-medium">
                              기사 보러가기 →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 페이지네이션 (댓글 페이지와 동일) */}
            {!loading && totalCount > 0 && (
              <div className="flex justify-center items-center mt-10 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed border border-[#3a3a3a]"
                >
                  이전
                </button>

                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white font-bold"
                          : "text-gray-400 hover:bg-[#2a2a2a]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed border border-[#3a3a3a]"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
