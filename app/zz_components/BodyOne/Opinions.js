import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Opinions() {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("article_categories")
      .select("articles(title, id), category_slug")
      .eq("category_slug", "opinion")
      .order("created_at", { referencedTable: "articles", ascending: false })
      .limit(14);

    if (error) throw new Error(error.message);
    if (!data) throw new Error("No articles found");

    const articles = data?.map((item) => item.articles) || [];

    return (
      <div>
        <h5 className="font-bold text-xl  italic"># 오피니언</h5>
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
