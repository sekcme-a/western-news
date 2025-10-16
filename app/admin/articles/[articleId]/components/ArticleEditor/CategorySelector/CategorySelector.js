// components/CategorySelector.js
"use client";

import { useEffect, useState } from "react";
import CategoryItem from "./CategoryItem";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// selectedCategories와 onChange prop을 추가합니다.
export default function CategorySelector({ selectedCategories, onChange }) {
  const supabase = createBrowserSupabaseClient();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    const tree = buildCategoryTree(data);
    setCategories(tree);
  };

  const buildCategoryTree = (data, parentId = null) => {
    return data
      .filter((category) => category.parent_id === parentId)
      .map((category) => ({
        ...category,
        children: buildCategoryTree(data, category.id),
      }));
  };

  const handleToggle = (categoryId, isChecked, parentId) => {
    // 부모로부터 받은 selectedCategories를 사용하여 Set을 생성합니다.
    const newSelected = new Set(selectedCategories);

    if (isChecked) {
      newSelected.add(categoryId);
      if (parentId) {
        newSelected.add(parentId);
      }
    } else {
      newSelected.delete(categoryId);
    }

    // onChange prop을 호출하여 부모 컴포넌트의 상태를 업데이트합니다.
    onChange(Array.from(newSelected));
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">카테고리 선택</h2>
      <ul className="space-y-4">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            // 부모로부터 받은 selectedCategories를 CategoryItem에 전달합니다.
            selectedCategories={new Set(selectedCategories)}
            onToggle={handleToggle}
          />
        ))}
      </ul>
    </div>
  );
}
