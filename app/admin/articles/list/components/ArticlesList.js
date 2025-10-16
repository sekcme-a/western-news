import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ArticlesList({
  search,
  page = 1,
  pageSize = 10,
}) {
  const supabase = await createServerSupabaseClient();

  let query = supabase.from("articles").select("id, title, created_at");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data: articles, error } = await query;

  if (error) {
    console.error("Error fetching articles:", error);
    return (
      <div className="text-center mt-24 text-gray-500">
        기사를 불러오지 못했습니다, 관리자에게 문의하세요.
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center mt-24 text-gray-500">
        아직 기사가 없습니다.
      </div>
    );
  }

  return (
    <ul>
      {articles?.map((article) => (
        <li
          key={article.id}
          className=" border border-gray-300 rounded \
          hover:shadow-xl hover:border-blue-700 hover:text-blue-700 
          transition cursor-pointer mb-2"
        >
          <Link href={`/admin/articles/${article.id}`}>
            <article className="md:flex justify-between items-center px-4 py-3 break-keep">
              <h2 className="text-lg md:text-xl font-semibold leading-tight line-clamp-2">
                {article.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                작성일:{" "}
                <time dateTime={article.created_at}>
                  {new Date(article.created_at).toLocaleDateString()}
                </time>
              </p>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
