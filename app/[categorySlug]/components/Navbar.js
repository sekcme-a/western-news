import {
  getCategory,
  getParentCategory,
  getChildCategories,
} from "@/utils/supabase/getCategories";
import Link from "next/link";

export default async function Navbar({ categorySlug }) {
  const parentCategory = await getParentCategory(categorySlug);
  const categories = await getChildCategories(parentCategory.slug);
  const currentCategory = await getCategory(categorySlug);

  if (categories?.length > 0)
    return (
      <nav className="mt-5 md:mt-10 flex flex-wrap items-end relative">
        <h2 className="text-3xl md:text-4xl font-bold w-full ">
          {parentCategory.name}
        </h2>

        {/* ✅ 스크롤 가능한 리스트 + 오른쪽 투명 gradient 표시 */}
        <div className="relative w-full">
          <ul
            className="flex gap-x-8 mt-4 md:text-lg font-semibold text-[#999]
          w-full overflow-x-scroll [&::-webkit-scrollbar]:hidden scroll-smooth pr-6"
          >
            {[{ ...parentCategory, name: "전체" }, ...categories].map(
              (cat, index) => (
                <li key={index} className="cursor-pointer hover:text-[#d2d2d2]">
                  <Link href={`/${cat.slug}`}>
                    <span
                      className={`${
                        currentCategory.slug === cat.slug ? "text-white" : ""
                      }`}
                    >
                      {cat.name}
                    </span>
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* ✅ 오른쪽 fade 효과 */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-[#1f1f1f] via-[#1f1f1f]/10 to-transparent" />
        </div>

        <div className="w-full h-[1px] md:h-[2px] bg-gray-300 mt-4" />
      </nav>
    );
}
