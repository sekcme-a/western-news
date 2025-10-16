import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function BodyArticles({ categorySlug }) {
  const supabase = await createServerSupabaseClient();
  try {
    const { data: dataWithContent, error } = await supabase
      .from("article_categories")
      .select("articles(title, content, id)")
      .eq("category_slug", categorySlug)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .range(1, 2);

    if (error) throw new Error(error.message);
    if (!dataWithContent) throw new Error("No articles found");

    const contentArticles = dataWithContent.map((item) => {
      const plainContent = item.articles.content
        .replace(/<br\s*\/?>/gi, "\n") // <br>을 줄바꿈으로 변환
        .replace(/<[^>]+>/g, "") // 모든 HTML 태그 제거
        .replace(/\n\s*\n/g, "\n\n") // 연속 줄바꿈 정리
        .trim();
      return { ...item.articles, content: plainContent };
    });

    const { data: dataWithImg, error: imgError } = await supabase
      .from("article_categories")
      .select("articles(title, thumbnail_image, content,id)")
      .eq("category_slug", categorySlug)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .range(3, 3);
    if (imgError) throw new Error(imgError.message);
    if (!dataWithImg) throw new Error("No articles found");

    const plainContent = dataWithImg[0].articles.content
      .replace(/<br\s*\/?>/gi, "\n") // <br>을 줄바꿈으로 변환
      .replace(/<[^>]+>/g, "") // 모든 HTML 태그 제거
      .replace(/\n\s*\n/g, "\n\n") // 연속 줄바꿈 정리
      .trim();
    const imgArticle = { ...dataWithImg[0].articles, content: plainContent };

    return (
      <div>
        <ul>
          {contentArticles.map((article) => (
            <li key={article.id} className="mb-10 hover-effect">
              <article>
                <Link href={`article/${article.id}`} aria-label="기사로 이동">
                  <h4 className="text-xl font-semibold mb-3 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-[#999] line-clamp-2">
                    {article.content}
                  </p>
                </Link>
              </article>
            </li>
          ))}
          <li className="hover-effect">
            <article>
              <Link href={`article/${imgArticle.id}`} aria-label="기사로 이동">
                <h4 className="text-xl font-semibold mb-2 line-clamp-2">
                  {imgArticle.title}
                </h4>
                <p className="text-sm text-[#999] line-clamp-1 ">
                  {imgArticle.content}
                </p>
                <div className="relative w-[30%] h-20 rounded-xl overflow-hidden mt-3">
                  <Image
                    src={imgArticle.thumbnail_image ?? "/images/og_logo.png"}
                    alt={imgArticle.title}
                    fill
                    objectFit="cover"
                  />
                </div>
              </Link>
            </article>
          </li>
        </ul>
      </div>
    );
  } catch (err) {
    console.error(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}
