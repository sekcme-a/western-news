import Skeleton from "@/components/Skeleton";
import { Suspense } from "react";
import BodyArticles from "./BodyArticles";
import BodyFullArticle from "./BodyFullArticle";
import SkeletonsBodyOne from "./SkeletonsBodyOne";
import RightBodyOne from "./RightBodyOne";
import AdBanner from "../AdBanner";

//leftCategorySlugs 2개
//id 는 광고 위치 나누려고
export default function BodyOne({
  leftCategorySlugs = [],
  rightCategorySlug,
  rightCategoryName,
  id,
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
          <AdBanner
            ad_type={`main_body_one_${id}_middle`}
            width="100%"
            aspectRatio="720/100"
            className="my-4 md:my-10 aspect-[720/144] md:aspect-[720/100]"
          />
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

          <AdBanner
            ad_type={`main_body_one_${id}_right`}
            width="100%"
            className="aspect-[16/9]"
          />
        </div>
      </div>
    </>
  );
}
