import Footer from "@/components/Footer";
import ArticleList from "./components/ArticleList";
import Headline from "./components/Headline";
import Navbar from "./components/Navbar";
import HeadlineList from "./components/HeadlineList";
import RightBodyOne from "../zz_components/BodyOne/RightBodyOne";
import { Suspense } from "react";
import SkeletonCategory from "./components/SkeletonCategory";
import { categories } from "@/utils/data/categories";
import { createMetadata } from "@/utils/metadata";

export async function generateMetadata({ params }) {
  const { categorySlug } = params;

  const category = categories.find((cat) => cat.slug === categorySlug);

  return createMetadata({
    title: category?.name,
    description: category?.description,
    url: `/category/${categorySlug}`,
  });
}

export default function CategoryPage({ params }) {
  const { categorySlug } = params;
  return (
    <>
      <main className="pt-14 md:pt-20  md:mx-[4vw] lg:mx-[7vw] mx-[12px]">
        <Navbar categorySlug={categorySlug} />

        <div className="md:flex gap-x-10 mt-7">
          <div className="md:w-3/4">
            <Suspense fallback={<SkeletonCategory variant="Headline" />}>
              <Headline categorySlug={categorySlug} />
            </Suspense>
            <Suspense fallback={<SkeletonCategory variant="ArticleList" />}>
              <ArticleList categorySlug={categorySlug} />
            </Suspense>
          </div>
          <div className="md:w-1/4">
            <Suspense fallback={<SkeletonCategory variant="HeadlineList" />}>
              <HeadlineList categorySlug={categorySlug} />
            </Suspense>
            <div className="w-full h-8 border-t-[1px] border-white" />
            <Suspense fallback={<></>}>
              <RightBodyOne
                rightCategorySlug="opinion"
                rightCategoryName="행사/축제"
                limit={5}
              />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
