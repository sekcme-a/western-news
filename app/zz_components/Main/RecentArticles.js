import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function RecentArticles() {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: recentArticles, error } = await supabase
      .from("articles")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) throw new Error(`최근 뉴스 조회 실패: ${error.message}`);

    return (
      <ul>
        {recentArticles.map((article, index) => (
          <li
            key={index}
            className={`py-5 md:py-4 hover-effect ${
              index !== recentArticles.length - 1 ? "border-b-[1px]" : ""
            } border-[#3d3d3d]`}
          >
            <Link href={`/article/${article.id}`} aria-label="기사로 이동">
              <span className="font-semibold text-lg line-clamp-2">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  } catch (err) {
    console.error(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}
