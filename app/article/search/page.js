import Footer from "@/components/Footer";
import Header from "@/components/Header/Header";
import SearchInput from "./components/SearchInput";
import SearchArticleList from "./components/SearchArticleList";

export default function Search({ searchParams }) {
  const { input } = searchParams;
  return (
    <>
      <Header />
      <div className="pt-14 md:pt-20   md:mx-[4vw] lg:mx-[7vw] mx-[12px]">
        <SearchInput input={input} />
        <SearchArticleList input={input} />
      </div>
      <Footer />
    </>
  );
}
