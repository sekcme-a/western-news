import { createServerSupabaseClient } from "@/utils/supabase/server";
import NoResult from "./NoResult";
import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";
import Link from "next/link";
import ArticleThumbnail from "@/components/thumbnails/ArticleThumbnail";
import MoreSearchArticles from "./MoreSearchArticles";

const PAGE_SIZE = 7;

export default async function SearchArticleList({ input }) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("articles")
      .select("title, thumbnail_image,  images_bodo, content, id")
      .or(`title.ilike.%${input}%`)
      // .or(`title.ilike.%${input}%,content.ilike.%${input}%`)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (data.length === 0 || error) return <NoResult input={input} />;

    const articles = data.map((item) => {
      const plainContent = htmlToPlainString(item.content);
      return { ...item, content: plainContent };
    });

    return (
      <section>
        <ul className="mt-6">
          {articles.map((article, index) => (
            <ArticleThumbnail article={article} key={index} />
            // <li key={index} className="hover-effect" >
            //   <Link href={`/article/${article.id}`}>
            //   </Link>
            // </li>
          ))}
        </ul>
        {articles.length === PAGE_SIZE && (
          <MoreSearchArticles input={input} pageSize={PAGE_SIZE} />
        )}
      </section>
    );
  } catch (err) {
    console.log(err);
    return <NoResult input={input} />;
  }
}
