const API_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/categories`;

// 모든 카테고리 가져오기 (캐시 포함)
export const getCategories = async () => {
  const res = await fetch(API_URL, { next: { revalidate: 360 } });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

// parent_id가 null인 카테고리 정렬
export const getParentCategories = async () => {
  const categories = await getCategories();
  return categories
    .filter((c) => c.parent_id === null)
    .sort((a, b) => a.order - b.order);
};

export const getParentCategory = async (slug) => {
  const categories = await getCategories();
  const currentCategory = categories.find((c) => c.slug === slug);
  if (currentCategory.parent_id === null) return currentCategory;
  const parentCategory = categories.find(
    (c) => c.id === currentCategory.parent_id
  );
  return parentCategory;
};

// 특정 parent의 자식 카테고리 가져오기
export const getChildCategories = async (parentSlug) => {
  const categories = await getCategories();
  const parent = categories.find((c) => c.slug === parentSlug);
  if (!parent) return [];

  return categories
    .filter((c) => c.parent_id === parent.id)
    .sort((a, b) => a.order - b.order);
};

// slug로 카테고리 이름 가져오기
export const getCategory = async (slug) => {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  return category || {};
};
