import Header from "@/components/Header/Header";
import DateToday from "./zz_components/DateToday";
import { Suspense } from "react";
import Skeleton from "@/components/Skeleton";
import Main from "./zz_components/Main/Main";
import BodyOne from "./zz_components/BodyOne/BodyOne";
import BodyTwo from "./zz_components/BodyTwo/BodyTwo";
import BodyThree from "./zz_components/BodyThree/BodyThree";
import Footer from "@/components/Footer";
import AdBanner from "./zz_components/AdBanner";

export default function Home() {
  return (
    <>
      <Header hasH1 />
      <main className="pt-14 md:pt-20  md:mx-[4vw] lg:mx-[7vw] mx-[12px]">
        <DateToday />
        <Main />

        <AdBanner
          ad_type="main_top_full"
          width="100%"
          className="my-4 md:my-10"
        />
        <BodyOne
          leftCategorySlugs={["politics", "siheung"]}
          rightCategorySlug="events"
          rightCategoryName="행사/축제"
          id="1"
        />

        <AdBanner
          ad_type="main_body_one_bottom_full"
          width="100%"
          className="my-4 md:my-10 aspect-[720/144] md:aspect-[720/90] "
        />
        <BodyTwo categorySlug="special" />
        <AdBanner
          ad_type="main_body_two_bottom_full"
          width="100%"
          className="my-4 md:my-10 aspect-[720/144] md:aspect-[720/90] "
        />
        <BodyOne
          leftCategorySlugs={["ansan", "gwangmyeong"]}
          rightCategorySlug="opinion"
          rightCategoryName="오피니언"
          id="2"
        />

        <AdBanner
          ad_type="main_body_one_2_bottom_full"
          width="100%"
          className="my-4 md:my-10 aspect-[720/144] md:aspect-[720/90] "
        />
        <BodyTwo categorySlug="economy" />
        <AdBanner
          ad_type="main_body_two_2_bottom_full"
          width="100%"
          className="my-4 md:my-10 aspect-[720/144] md:aspect-[720/90] "
        />
        <BodyThree
          categorys={[
            { slug: "society", name: "사회" },
            { slug: "lifestyle", name: "생활/문화" },
            { slug: "sports", name: "스포츠" },
            { slug: "special", name: "기획/특집" },
          ]}
        />
        <AdBanner ad_type="main_bottom_full" width="100%" />
      </main>

      <Footer />
    </>
  );
}
