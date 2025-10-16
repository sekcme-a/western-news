import { getParentCategories } from "@/utils/supabase/getCategories";
import Link from "next/link";

export default async function NavList() {
  const categories = await getParentCategories();
  return (
    <ul className="hidden lg:flex">
      {categories?.map((category) => (
        <li
          key={category.id}
          className="text-white font-semibold px-4 text-lg hover:text-gray-300"
        >
          <Link href={`/${category.slug}`}>{category.name}</Link>
        </li>
      ))}
    </ul>
  );
}
