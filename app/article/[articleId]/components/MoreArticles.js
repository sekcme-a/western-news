import ArticleThumbnail from "@/components/thumbnails/ArticleThumbnail";
import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function MoreArticles({ articleId }) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: category, error: catErr } = await supabase
      .from("article_categories")
      .select("category_slug")
      .eq("article_id", articleId)
      .limit(1);

    if (catErr) throw new Error(catErr.message);

    const { data, error } = await supabase.rpc(
      "get_random_article_last_month",
      { category_slug: category[0].category_slug, days: 30, count: 6 }
    );

    if (error) throw new Error(error.message);

    const articles = data.map((item) => {
      const plainContent = htmlToPlainString(item.content);
      return { ...item, content: plainContent };
    });

    return (
      <section className="mt-20">
        <h3 className="font-bold text-xl">추천 기사</h3>
        <ul>
          {articles?.map((article, index) => (
            <ArticleThumbnail article={article} key={index} />
          ))}
        </ul>
      </section>
    );
  } catch (err) {
    console.error("❌ MainNews 에러:", err);
    return (
      <p className="text-center text-red-500">
        뉴스를 불러오는 중 오류가 발생했습니다.
      </p>
    );
  }
}
