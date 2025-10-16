import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function LeftBodyTwo({ categorySlug }) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: fullData, error } = await supabase
      .from("article_categories")
      .select("articles(title, thumbnail_image, id, content)")
      .eq("category_slug", categorySlug)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);
    if (!fullData) throw new Error("No article found");

    const plainContent = fullData[0]?.articles.content
      .replace(/<br\s*\/?>/gi, "\n") // <br>을 줄바꿈으로 변환
      .replace(/<[^>]+>/g, "") // 모든 HTML 태그 제거
      .replace(/\n\s*\n/g, "\n\n") // 연속 줄바꿈 정리
      .trim();
    const fullArticle = { ...fullData[0]?.articles, content: plainContent };

    const { data: datas, error: datasError } = await supabase
      .from("article_categories")
      .select("articles(title, id)")
      .eq("category_slug", categorySlug)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .range(1, 3);

    if (datasError) throw new Error(datasError.message);
    if (!datas) throw new Error("No article found");

    const articles = datas.map((item) => item.articles);

    return (
      <section>
        <article className="hover-effect">
          <Link href={`article/${fullArticle.id}`} aria-label="기사로 이동">
            <span className="text-xl font-semibold">{fullArticle.title}</span>
            <div className="flex gap-x-4 items-center">
              <div className="flex-1 relative h-36 w-full mt-4 rounded-md overflow-hidden">
                <Image
                  src={fullArticle.thumbnail_image ?? "/images/og_logo.png"}
                  alt={fullArticle.title}
                  fill
                  objectFit="cover"
                />
              </div>
              <div className="flex-1">
                <p className="mt-4 text-sm leading-relaxed line-clamp-6 text-[#999] ">
                  {fullArticle.content}
                </p>
              </div>
            </div>
          </Link>
        </article>
        <ul className="mt-4">
          {articles.map((article, index) => (
            <li
              key={article.id}
              className={`py-4 hover-effect ${
                index !== articles.length - 1 ? "border-b-[1px]" : ""
              } border-[#3d3d3d]`}
            >
              <article>
                <Link href={`article/${article.id}`} aria-label="기사로 이동">
                  <h4 className="text-lg font-semibold line-clamp-1">
                    {article.title}
                  </h4>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </section>
    );
  } catch (err) {
    console.log(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}
