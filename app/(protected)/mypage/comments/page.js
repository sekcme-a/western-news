"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import MyPageNavbar from "../components/MypageNavbar";
import { useAuth } from "@/providers/AuthProvider";

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CommentsPage() {
  const supabase = createBrowserSupabaseClient();
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchComments = async () => {
      if (!user) return;

      setLoading(true);
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          articles (
            id,
            title,
            thumbnail_image,
             images_bodo,
            category
          )
        `,
          { count: "exact" },
        )
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        setComments(data || []);
        setTotalCount(count || 0);
      }
      setLoading(false);
    };

    fetchComments();
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
          <MyPageNavbar selectedMenu="내 댓글" />

          <div className="mt-8">
            <h1 className="text-2xl font-bold mb-6 px-2">
              내가 쓴 댓글 ({totalCount})
            </h1>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#2a2a2a] h-40 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                작성한 댓글이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((item) => {
                  const article = item.articles;
                  return (
                    <div
                      key={item.id}
                      className="group bg-[#2a2a2a] hover:bg-[#333333] transition-colors rounded-lg overflow-hidden border border-[#3a3a3a] shadow-sm"
                    >
                      <Link
                        href={`/article/${article?.id}`}
                        className="flex flex-col md:flex-row"
                      >
                        {/* 기사 썸네일 영역 */}
                        <div className="w-full md:w-40 h-32 md:h-auto flex-shrink-0 overflow-hidden relative bg-black">
                          {article?.thumbnail_image ? (
                            <img
                              src={article.thumbnail_image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-[#1a1a1a]">
                              <span className="text-[10px]">No Image</span>
                            </div>
                          )}
                          {article?.category && (
                            <span className="absolute top-2 left-2 bg-[#444] text-white text-[10px] px-2 py-0.5 rounded opacity-80">
                              {article.category}
                            </span>
                          )}
                        </div>

                        {/* 댓글 및 기사 정보 영역 */}
                        <div className="p-5 flex flex-col justify-between flex-grow">
                          <div>
                            {/* 기사 제목 (작게) */}
                            <h2 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 text-gray-100 group-hover:text-blue-400 transition-colors">
                              {article?.title || "삭제된 기사입니다"}
                            </h2>

                            {/* 내 댓글 내용 (메인) */}
                            <p className="text-gray-100 text-sm md:text-base line-clamp-2 mb-2 leading-relaxed">
                              {item.content}
                            </p>
                          </div>

                          {/* 하단 정보 */}
                          <div className="flex justify-between items-center border-t border-[#3a3a3a] pt-3 mt-1">
                            <span className="text-[11px] text-gray-300 font-light">
                              댓글 작성일: {formatDate(item.created_at)}
                            </span>
                            <span className="text-[11px] text-gray-400 group-hover:text-white transition-colors">
                              원문 보기 →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 페이지네이션 */}
            {!loading && totalCount > 0 && (
              <div className="flex justify-center items-center mt-10 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-50 border border-[#3a3a3a]"
                >
                  이전
                </button>
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 rounded-md text-sm flex items-center justify-center ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:bg-[#3a3a3a]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-50 border border-[#3a3a3a]"
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
