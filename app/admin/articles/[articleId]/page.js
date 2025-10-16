"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button, CircularProgress, TextField } from "@mui/material";
import { useParams } from "next/navigation";
import { use, useEffect } from "react";
import { useState } from "react";
import ArticleEditor from "./components/ArticleEditor/ArticleEditor";

export default function NewArticlePage() {
  const supabase = createBrowserSupabaseClient();
  const { articleId } = useParams();

  const [article, setArticle] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchArticle = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .single();

    if (error) {
      console.error("Error fetching article:", error);
    } else {
      setArticle(data);
    }
    if (data) await fetchCategories();
    setLoading(false);
  };

  const fetchCategories = async () => {
    // article_categories에서 slug 가져오기
    const { data: articleCategories, error: acError } = await supabase
      .from("article_categories")
      .select("category_slug")
      .eq("article_id", articleId); // 공백 제거!

    if (acError) {
      console.error("Error fetching article categories:", acError);
      return;
    }

    if (!articleCategories || articleCategories.length === 0) {
      setSelectedCategories([]);
      return;
    }

    // slug 배열 생성
    const slugs = articleCategories.map((item) => item.category_slug);

    // categories 테이블에서 slug로 id 찾기
    const { data: categoriesData, error: catError } = await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", slugs);

    if (catError) {
      console.error("Error fetching categories:", catError);
      return;
    }

    // id 배열로 변환
    const categoryIds = categoriesData.map((item) => item.id);
    setSelectedCategories(categoryIds);
  };

  useEffect(() => {
    if (articleId === "new") {
      setLoading(false);
      return;
    }
    fetchArticle();
  }, [articleId]);

  if (loading)
    return (
      <div className="mt-10 flex flex-wrap justify-center">
        <CircularProgress />
        <p className="mt-5 w-full text-center">기사를 불러오는 중입니다...</p>
      </div>
    );
  return (
    <div>
      <ArticleEditor
        article={article}
        prevSelectedCategories={selectedCategories}
      />
    </div>
  );
}
