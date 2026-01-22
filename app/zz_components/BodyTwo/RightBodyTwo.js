import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function RightBodyTwo({ categorySlug }) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
      id,
      title,
      thumbnail_image,
      images_bodo,
      article_categories!inner(category_slug)
    `,
      )
      .eq("article_categories.category_slug", categorySlug)
      .order("created_at", { ascending: false })
      .range(4, 5);

    if (error) throw new Error(error.message);
    if (!data) throw new Error("No article found");

    const imageArticles = data || [];

    const { data: arts, error: artsErr } = await supabase
      .from("articles")
      .select(
        `
      id,
      title,
      article_categories!inner(category_slug)
    `,
      )
      .eq("article_categories.category_slug", categorySlug)
      .order("created_at", { ascending: false })
      .range(6, 9);

    if (artsErr) throw new Error(artsErr.message);
    if (!arts) throw new Error("No article found");

    const textArticles = arts || [];
    console.log(textArticles);
    return (
      <section className="md:flex w-full gap-x-4">
        <div className="md:flex-1">
          <article className="hover-effect">
            <Link
              href={`article/${imageArticles[0]?.id}`}
              aria-label="기사로 이동"
            >
              <div className="relative w-full h-36 rounded-md overflow-hidden">
                <Image
                  src={
                    imageArticles[0]?.thumbnail_image ??
                    imageArticles[0]?.images_bodo?.[0] ??
                    "/images/og_logo.png"
                  }
                  alt={imageArticles[0]?.title}
                  fill
                  objectFit="cover"
                />
              </div>
              <h3 className="mt-2 text-lg line-clamp-2 font-semibold py-2">
                {imageArticles[0]?.title}
              </h3>
            </Link>
          </article>
          <ul className="mt-2">
            {textArticles.slice(0, 2).map((article, index) => (
              <li
                key={article.id}
                className={`hover-effect py-3 font-bold border-t-[1px] border-[#3d3d3d]`}
              >
                <article>
                  <Link href={`article/${article.id}`} aria-label="기사로 이동">
                    <span className="text-lg">{article.title}</span>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:flex-1 mt-10 md:mt-0">
          <article className="hover-effect">
            <Link
              href={`article/${imageArticles[1]?.id}`}
              aria-label="기사로 이동"
            >
              <div className="relative w-full h-36 rounded-md overflow-hidden">
                <Image
                  src={
                    imageArticles[1]?.thumbnail_image ??
                    imageArticles[1]?.images_bodo?.[0] ??
                    "/images/og_logo.png"
                  }
                  alt={imageArticles[1]?.title}
                  fill
                  objectFit="cover"
                />
              </div>
              <h3 className="mt-2 text-lg line-clamp-2 font-semibold py-2">
                {imageArticles[1]?.title}
              </h3>
            </Link>
          </article>
          <ul className="mt-2">
            {textArticles.slice(2, 4).map((article) => (
              <li
                key={article.id}
                className="hover-effect py-3 font-bold border-t-[1px] border-[#3d3d3d]"
              >
                <article>
                  <Link href={`article/${article.id}`} aria-label="기사로 이동">
                    <span className="text-lg">{article.title}</span>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  } catch (err) {
    console.log(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}
