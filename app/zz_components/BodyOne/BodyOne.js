import Skeleton from "@/components/Skeleton";
import { Suspense } from "react";
import BodyArticles from "./BodyArticles";
import BodyFullArticle from "./BodyFullArticle";
import SkeletonsBodyOne from "./SkeletonsBodyOne";
import RightBodyOne from "./RightBodyOne";

//leftCategorySlugs 2개
export default function BodyOne({
  leftCategorySlugs = [],
  rightCategorySlug,
  rightCategoryName,
}) {
  return (
    <>
      <div className="lg:flex gap-x-7 mt-10">
        <div className="w-full lg:w-3/4 border-t-[1px] border-[#e6e6e6] md:pt-10">
          <div className="md:flex gap-x-7">
            <div className="w-full md:w-1/2 mt-7 md:mt-0">
              <Suspense
                fallback={<SkeletonsBodyOne variant="BodyFullArticle" />}
              >
                <BodyFullArticle categorySlug={leftCategorySlugs[0]} />
              </Suspense>
            </div>
            <div className="w-full md:w-1/2 mt-10 md:mt-0">
              <Suspense fallback={<SkeletonsBodyOne variant="BodyArticles" />}>
                <BodyArticles categorySlug={leftCategorySlugs[0]} />
              </Suspense>
            </div>
          </div>
          <div className="md:flex gap-x-7 border-t-[1px] border-[#e6e6e6] md:pt-10 mt-10">
            <div className="w-full md:w-1/2 mt-7 md:mt-0">
              <Suspense
                fallback={<SkeletonsBodyOne variant="BodyFullArticle" />}
              >
                <BodyFullArticle categorySlug={leftCategorySlugs[1]} />
              </Suspense>
            </div>
            <div className="w-full md:w-1/2 mt-10 md:mt-0">
              <Suspense fallback={<SkeletonsBodyOne variant="BodyArticles" />}>
                <BodyArticles categorySlug={leftCategorySlugs[1]} />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/4 border-t-[1px] border-[#e6e6e6] pt-6 mt-10 lg:mt-0">
          <Suspense fallback={<SkeletonsBodyOne variant="Opinions" />}>
            <RightBodyOne {...{ rightCategorySlug, rightCategoryName }} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
