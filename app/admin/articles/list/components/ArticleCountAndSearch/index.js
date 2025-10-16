import { createServerSupabaseClient } from "@/utils/supabase/server";
import ArticleSearch from "./ArticleSearch";

export default function ArticleCountAndSearch({ search, page, count }) {
  return (
    <div className="flex justify-between md:items-center">
      <p className="mb-0 hidden md:block  text-gray-800">
        총 {count || 0}개의 게시글
      </p>
      <ArticleSearch search={search} />
    </div>
  );
}
