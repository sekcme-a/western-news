"use client";

import { useState, useEffect } from "react";
import CategoryManager from "./components/CategoryManager";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@mui/material";

export default function CategoryPage() {
  const supabase = createBrowserSupabaseClient();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 Supabase에서 카테고리 데이터 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, parent_id, order, slug");

      if (error) {
        console.error("카테고리 불러오기 오류:", error);
      } else {
        const formattedData = data.map((item) => ({
          ...item,
          id: String(item.id),
          parentId: item.parent_id ? String(item.parent_id) : null,
          order: Number(item.order),
          slug: item.slug || "",
        }));
        setCategories(formattedData);
      }
      setIsLoading(false);
    };

    fetchCategories();
  }, [supabase]);

  const saveCategories = async () => {
    try {
      // 1. 서버에서 현재 데이터 가져오기
      const { data: existingData, error: fetchError } = await supabase
        .from("categories")
        .select("id");

      if (fetchError) {
        console.error("서버 데이터 불러오기 오류:", fetchError);
        return;
      }

      const existingIds = existingData.map((cat) => cat.id);

      // 2. 삭제할 항목 찾기 (UI에서 제거된 항목)
      const idsToDelete = existingIds.filter(
        (id) => !categories.some((cat) => cat.id === id)
      );

      if (idsToDelete.length) {
        const { error: deleteError } = await supabase
          .from("categories")
          .delete()
          .in("id", idsToDelete);

        if (deleteError) {
          console.error("삭제 오류:", deleteError);
          return;
        }
      }

      // 3. upsert 처리 (수정 + 새로 추가)
      const dataToUpsert = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        parent_id: cat.parentId,
        order: cat.order,
        slug: cat.slug,
      }));

      const { error: upsertError } = await supabase
        .from("categories")
        .upsert(dataToUpsert, { onConflict: ["id"] });

      if (upsertError) {
        console.error("업서트 오류:", upsertError);
        return;
      }

      alert("카테고리가 성공적으로 저장되었습니다.");

      // 4. 최신 데이터로 상태 동기화
      const { data: freshData, error: freshError } = await supabase
        .from("categories")
        .select("id, name, parent_id, order, slug");

      if (freshError) {
        console.error("데이터 동기화 오류:", freshError);
        return;
      }

      const formattedData = freshData.map((item) => ({
        ...item,
        id: String(item.id),
        parentId: item.parent_id ? String(item.parent_id) : null,
        order: Number(item.order),
        slug: item.slug,
      }));

      setCategories(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      <CategoryManager
        categories={categories}
        onCategoriesChange={setCategories}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={saveCategories}
        style={{ marginTop: "16px" }}
      >
        저장
      </Button>
    </>
  );
}
