"use client";

import ArticleSmallThumbnail from "@/components/thumbnails/AritlceSmallThumbnail";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useEffect } from "react";
import { useState } from "react";

export default function RandomArticles() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createBrowserSupabaseClient();

    const { data, error } = await supabase.rpc(
      "get_random_articles_within_days",
      { days: 30, count: 7 }
    );

    setArticles(data);
  };

  return (
    <section>
      <h2 className="font-bold text-xl">다른 기사 더보기</h2>
      <ul>
        {articles?.map((article, index) => (
          <ArticleSmallThumbnail article={article} key={index} />
        ))}
      </ul>
    </section>
  );
}
