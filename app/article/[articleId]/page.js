import ClientBackComponent from "@/components/client/ClientBackComponent";
import Header from "@/components/Header/Header";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import ArticleContent from "./components/ArticleContent";
import MoreArticles from "./components/MoreArticles";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import SkeletonCategory from "@/app/[categorySlug]/components/SkeletonCategory";
import RandomArticles from "./components/RandomArticles";

import { generateMetadata } from "./metadata";
import AdBanner from "@/app/zz_components/AdBanner";
import CommentSection from "./components/CommentSection";

export { generateMetadata };

export default async function Article({ params }) {
  const { articleId } = params;

  const supabase = await createServerSupabaseClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select()
    .eq("id", articleId)
    .single();

  if (error || !article) {
    return <ClientBackComponent message="존재하지 않거나 삭제된 기사입니다." />;
  }

  return (
    <>
      <main>
        <Header />
        <div className="pt-14 md:pt-20 md:flex  md:mx-[4vw] lg:mx-[7vw] mx-[12px]">
          <div className="md:w-3/4 mt-10 md:mr-5">
            <ArticleContent article={article} />
            <div className="mt-10 flex justify-center"></div>
            <AdBanner
              ad_type="article_middle_full"
              width="100%"
              className="mt-10"
            />
            <CommentSection articleId={articleId} />
            <Suspense fallback={<SkeletonCategory variant="ArticleList" />}>
              <MoreArticles articleId={articleId} />
            </Suspense>
          </div>
          <div className="md:w-1/4 mt-10">
            <RandomArticles />
          </div>
        </div>
        <div className=" md:mx-[4vw] lg:mx-[7vw] mx-[12px]">
          <AdBanner
            ad_type="article_bottom_full"
            width="100%"
            className="mt-10"
          />
        </div>
        <Footer />
      </main>
    </>
  );
}
