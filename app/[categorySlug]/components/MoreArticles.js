"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";
import ArticleThumbnail from "@/components/thumbnails/ArticleThumbnail";
import AdBanner from "@/app/zz_components/AdBanner";

export default function MoreArticles({ categorySlug }) {
  const supabase = createBrowserSupabaseClient();
  const PAGE_SIZE = 7;

  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async (pageNumber = 1) => {
    setLoading(true);
    const from = (pageNumber - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        id,
        title,
        thumbnail_image,
        content,
        created_at,
        article_categories!inner(category_slug, is_main)
      `
      )
      .eq("article_categories.category_slug", categorySlug)
      .eq("article_categories.is_main", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
    } else {
      if (data.length < PAGE_SIZE) setHasMore(false);

      const list = data.map((item) => {
        const plainContent = htmlToPlainString(item.content);
        return { ...item, content: plainContent };
      });

      // 기사와 해당 페이지의 광고 정보를 묶어서 저장할 수도 있지만,
      // 렌더링 시 인덱스로 처리하는 것이 가장 깔끔합니다.
      setArticles((prev) => [...prev, ...list]);
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchArticles(nextPage);
    setPage(nextPage);
  };

  return (
    <>
      <ul>
        {articles.map((article, index) => {
          // 현재 기사의 순서 (1부터 시작)
          const articleNumber = index + 1;
          // 매 PAGE_SIZE(7개) 마다 광고를 보여줄지 결정
          const showAd = articleNumber % PAGE_SIZE === 0;
          // 몇 번째 광고인지 계산 (7번째 기사 뒤는 1번 광고, 14번째 뒤는 2번 광고...)
          const adIndex = articleNumber / PAGE_SIZE;

          return (
            <div key={`wrapper-${article.id || index}`}>
              {/* 기사 출력 */}
              <ArticleThumbnail article={article} />

              {/* n번째 기사마다 광고 출력 */}
              {showAd && (
                <li key={`ad-${adIndex}`} className="list-none">
                  <AdBanner
                    ad_type={`category_middle_${adIndex + 1}`}
                    className="my-5"
                  />
                </li>
              )}
            </div>
          );
        })}
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
