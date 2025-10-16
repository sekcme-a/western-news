import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import MoreArticles from "./MoreArticles";
import ArticleThumbnail from "@/components/thumbnails/ArticleThumbnail";

export default async function ArticleList({ categorySlug }) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("article_categories")
      .select("articles(title, thumbnail_image, content)")
      .eq("category_slug", categorySlug)
      .eq("is_main", false)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .limit(10);

    if (error) throw new Error(error.message);
    if (!data) throw new Error("기사가 없습니다");

    const articles = data.map((item) => {
      const article = item.articles;
      const plainContent = htmlToPlainString(article.content);
      return { ...article, content: plainContent };
    });

    console.log(articles);

    return (
      <section className="border-t-[1px] border-white mt-10">
        <ul>
          {articles.map((article, index) => (
            <ArticleThumbnail key={index} article={article} />
          ))}
        </ul>
        <MoreArticles categorySlug={categorySlug} />
      </section>
    );
  } catch (err) {
    console.error(err);
    return (
      <p className="text-center text-red-500">
        뉴스를 불러오는 중 오류가 발생했습니다.
      </p>
    );
  }
}
