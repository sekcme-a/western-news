import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";
import Article from "./Article";

export default async function ArticlesList({
  search,
  page = 1,
  pageSize = 10,
}) {
  const supabase = await createServerSupabaseClient();

  let query = supabase.from("articles").select("id");

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
        <Article key={article.id} articleId={article.id} />
      ))}
    </ul>
  );
}
