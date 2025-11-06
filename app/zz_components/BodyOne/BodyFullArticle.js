import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function BodyFullArticle({ categorySlug }) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("article_categories")
      .select("articles(title, thumbnail_image, id, content)")
      .eq("category_slug", categorySlug)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);

    if (!data) throw new Error("No article found");

    const article = data[0]?.articles;

    const plainContent = article?.content
      .replace(/<br\s*\/?>/gi, "\n") // <br>을 줄바꿈으로 변환
      .replace(/<[^>]+>/g, "") // 모든 HTML 태그 제거
      .replace(/\n\s*\n/g, "\n\n") // 연속 줄바꿈 정리
      .trim();

    return (
      <article className="hover-effect">
        <Link href={`article/${article.id}`} aria-label="기사로 이동">
          <h4 className="text-2xl font-bold mb-6 line-clamp-2 leading-relaxed">
            {article.title}
          </h4>
          <p className="text-sm text-[#999] line-clamp-4 leading-relaxed">
            {plainContent}
          </p>
          <div className="relative w-full h-64 rounded-xl overflow-hidden mt-6">
            <Image
              src={article.thumbnail_image ?? "/images/og_logo.png"}
              alt={article.title}
              fill
              objectFit="cover"
            />
          </div>
        </Link>
      </article>
    );
  } catch (err) {
    console.error(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}
