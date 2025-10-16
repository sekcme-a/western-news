import Header from "@/components/Header/Header";
import DateToday from "./zz_components/DateToday";
import { Suspense } from "react";
import Skeleton from "@/components/Skeleton";
import Main from "./zz_components/Main/Main";
import BodyOne from "./zz_components/BodyOne/BodyOne";
import BodyTwo from "./zz_components/BodyTwo/BodyTwo";
import BodyThree from "./zz_components/BodyThree/BodyThree";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header hasH1 />
      <main className="pt-14 md:pt-20  md:mx-[4vw] lg:mx-[7vw] mx-[12px]">
        <DateToday />
        <Main />

        <BodyOne
          leftCategorySlugs={["politics", "siheung"]}
          rightCategorySlug="events"
          rightCategoryName="행사/축제"
        />

        <BodyTwo categorySlug="special" />

        <BodyOne
          leftCategorySlugs={["ansan", "gwangmyeong"]}
          rightCategorySlug="opinion"
          rightCategoryName="오피니언"
        />

        <BodyTwo categorySlug="economy" />

        <BodyThree
          categorys={[
            { slug: "social", name: "사회" },
            { slug: "culture", name: "생활/문화" },
            { slug: "sports", name: "스포츠" },
            { slug: "special", name: "기획/특집" },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
