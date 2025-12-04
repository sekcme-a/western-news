import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function Headline({ categorySlug }) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("article_categories")
      .select("articles(title, thumbnail_image, content, id)")
      .eq("category_slug", categorySlug)
      .eq("is_main", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("기사가 없습니다");

    const plainContent = htmlToPlainString(data.articles.content);
    const article = { ...data.articles, content: plainContent };

    return (
      <Link href={`article/${article.id}`}>
        <article className="grid md:grid-cols-2 gap-x-4 w-full hover-effect">
          <div className="">
            <h3 className="font-bold text-3xl leading-snug line-clamp-3">
              {article.title}
            </h3>
            <span className="text-sm text-[#999] line-clamp-4 leading-relaxed mt-3">
              {article.content}
            </span>
          </div>
          <div className="relative w-full h-64 rounded-lg overflow-hidden mt-5 md:mt-0">
            <Image
              src={
                article.thumbnail_image ??
                (article.title?.includes("덕암") &&
                  article.title?.includes("칼럼"))
                  ? "/images/kyunsik.png"
                  : "/images/og_logo.png"
              }
              alt={article.title}
              fill
              objectFit={
                article.title?.includes("덕암") &&
                article.title?.includes("칼럼")
                  ? "contain"
                  : "cover"
              }
              style={{ backgroundColor: "black" }}
            />
          </div>
        </article>
      </Link>
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
