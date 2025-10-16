import { Suspense } from "react";
import SkeletonsMain from "./SkeletonsMain";
import Headline from "./Headline";
import MainNews from "./MainNews";
import RecentArticles from "./RecentArticles";

export default function Main() {
  return (
    <div className="xl:flex gap-x-10 mt-4">
      <div className="w-full xl:w-3/4">
        <div className="md:flex gap-x-10">
          <div className="w-full md:w-2/3 mt-7 md:mt-0 ">
            <Suspense fallback={<SkeletonsMain variant="Headline" />}>
              <Headline />
            </Suspense>
          </div>
          <div className="w-full md:w-1/3 mt-10 md:mt-0">
            <Suspense fallback={<SkeletonsMain variant="MainNews" />}>
              <MainNews />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="w-full xl:w-1/4 mt-5 xl:mt-0">
        <Suspense fallback={<SkeletonsMain variant="RecentArticles" />}>
          <RecentArticles />
        </Suspense>
      </div>
    </div>
  );
}
