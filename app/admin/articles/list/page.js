import { Suspense } from "react";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import ArticlesList from "./components/ArticlesList";
import ArticleCountAndSearch from "./components/ArticleCountAndSearch";
import ArticlePagination from "./components/ArticlePagination";
import { Button, CircularProgress, Skeleton } from "@mui/material";
import Link from "next/link";
// 새로 추가된 Provider 임포트
import { ArticleSelectionProvider } from "./components/ArticleSelectionProvider";
// 새로 추가된 일괄 처리 컴포넌트 임포트
import BulkActions from "./components/BulkActions";

export default async function ListPage({ params, searchParams }) {
  const { search = "", page = 1 } = searchParams;

  // Supabase에서 총 게시물 수 구하기 (Server-side)
  const supabase = await createServerSupabaseClient();
  let countQuery = supabase
    .from("articles")
    .select("*", { count: "exact", head: true });

  if (search) {
    countQuery = countQuery.or(
      `title.ilike.%${search}%,content.ilike.%${search}%`,
    );
  }

  const { count } = await countQuery;
  const totalPages = count ? Math.ceil(count / 10) : 0;

  return (
    // 전체 목록을 ArticleSelectionProvider로 감싸서 상태를 공유합니다.
    <ArticleSelectionProvider>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">기사 목록</h1>

        {/* 새 게시물 버튼과 BulkActions를 위한 flex div */}
        <div className="flex justify-between items-center mb-3">
          <BulkActions />
          <Link href={`/admin/articles/new`}>
            <Button variant="contained" size="small">
              + 새 게시물
            </Button>
          </Link>
        </div>

        <ArticleCountAndSearch search={search} page={page} count={count} />

        <div className="mt-5" />

        <Suspense
          fallback={
            <div className="mt-24 flex justify-center flex-wrap">
              <CircularProgress />
              <p className="mt-5 text-center w-full">
                기사를 불러오는 중입니다...
              </p>
            </div>
          }
        >
          <ArticlesList search={search} page={page} pageSize={10} />
        </Suspense>

        {/* Client Component로 totalPages, currentPage 전달 */}
        <ArticlePagination
          search={search}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </ArticleSelectionProvider>
  );
}
