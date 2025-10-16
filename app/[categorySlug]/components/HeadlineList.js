import { createServerSupabaseClient } from "@/utils/supabase/server";
import {
  getCategory,
  getParentCategory,
  getChildCategories,
} from "@/utils/supabase/getCategories";
import Image from "next/image";
import ArticleSmallThumbnail from "@/components/thumbnails/AritlceSmallThumbnail";

export default async function HeadlineList({ categorySlug }) {
  const supabase = await createServerSupabaseClient();
  const parentCategory = await getParentCategory(categorySlug);

  const categories = await getChildCategories(parentCategory.slug);
  const slugs = categories.map((item) => item.slug);
  console.log(slugs);
  try {
    const { data, error } = await supabase
      .from("article_categories")
      .select("articles(title, thumbnail_image, id)")
      .in("category_slug", slugs)
      .eq("is_main", true);

    if (error) throw new Error(error.message);
    if (!data) throw new Error("기사가 없습니다");

    const articles = data.map((item) => item.articles);

    return (
      <>
        <p className="font-bold text-xl">{parentCategory.name} 기사</p>
        <ul>
          {articles.map((article, index) => (
            <ArticleSmallThumbnail article={article} key={index} />
          ))}
        </ul>
      </>
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
