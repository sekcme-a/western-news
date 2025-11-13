import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function RightBodyOne({
  rightCategorySlug,
  rightCategoryName,
  limit = 10,
}) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
      id,
      title,
      article_categories!inner(category_slug)
    `
      )
      .eq("article_categories.category_slug", rightCategorySlug)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    if (!data) throw new Error("No articles found");

    const articles = data?.map((item) => item.articles) || [];

    return (
      <div>
        <h5 className="font-bold text-xl italic"># {rightCategoryName}</h5>
        <ul>
          {articles.map((article, index) => (
            <li
              key={article.id}
              className={`py-5 hover-effect ${
                index !== articles.length - 1 ? "border-b-[1px]" : ""
              } border-[#3d3d3d]`}
            >
              <article>
                <Link href={`article/${article.id}`} aria-label="기사로 이동">
                  <h4 className="text-md font-semibold line-clamp-2 text-[#e3e3e3]">
                    {article.title}
                  </h4>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (err) {
    console.error(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}
