import Header from "@/components/Header/Header";
import { getParentCategories } from "@/utils/supabase/getCategories";
// export const revalidate = 3600;

export default async function CategoryLayout({ children }) {
  const cat = await getParentCategories();

  console.log(cat);
  return (
    <>
      <Header scrolled={true} />
      {children}
    </>
  );
}
