"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";
import ArticleThumbnail from "@/components/thumbnails/ArticleThumbnail";

export default function MoreArticles({ categorySlug }) {
  const supabase = createBrowserSupabaseClient();

  const PAGE_SIZE = 7;

  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1); // 1부터 시작
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 데이터 불러오기 함수
  const fetchArticles = async (pageNumber = 1) => {
    setLoading(true);
    const from = (pageNumber - 1) * PAGE_SIZE; // 1페이지부터 계산
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("article_categories")
      .select("articles(title, thumbnail_image, content, id)")
      .eq("category_slug", categorySlug)
      .eq("is_main", false)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
    } else {
      if (data.length < PAGE_SIZE) setHasMore(false); // 더 이상 데이터 없으면

      const list = data.map((item) => {
        const article = item.articles;
        const plainContent = htmlToPlainString(article.content);
        return { ...article, content: plainContent };
      });
      setArticles((prev) => [...prev, ...list]);
    }
    setLoading(false);
  };

  // // 초기 데이터 로드
  // useEffect(() => {
  //   setArticles([]);
  //   setPage(1); // 1페이지로 초기화
  //   setHasMore(true);
  //   fetchArticles(1);
  // }, [categorySlug]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchArticles(nextPage);
    setPage(nextPage);
  };

  return (
    <>
      <ul>
        {articles.map((article, index) => (
          <ArticleThumbnail key={index} article={article} />
        ))}
      </ul>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-1.5 rounded-4xl border-[1px]
             border-white w-fit flex items-center
             cursor-pointer group hover:bg-[#f2f2f2] transition disabled:opacity-50"
          >
            <p className="text-sm mr-1 font-semibold group-hover:text-black transition">
              {loading ? "불러오는 중..." : "기사 더보기"}
            </p>
            <AddRoundedIcon
              sx={{ fontSize: 17 }}
              className="group-hover:text-black transition"
            />
          </button>
        </div>
      )}
    </>
  );
}
