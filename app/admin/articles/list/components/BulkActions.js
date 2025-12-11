"use client";

import { useArticleSelection } from "./ArticleSelectionProvider";
import { Button } from "@mui/material";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function BulkActions() {
  // clearSelection 함수를 Context에서 가져옵니다.
  const { selectedArticleIds, clearSelection } = useArticleSelection();
  const router = useRouter();
  const isSelected = selectedArticleIds.length > 0;

  const handleDelete = async () => {
    if (
      !isSelected ||
      !window.confirm(
        `${selectedArticleIds.length}개의 기사를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();

      // Supabase에서 선택된 ID들을 가진 기사 삭제
      const { error } = await supabase
        .from("articles")
        .delete()
        .in("id", selectedArticleIds);

      if (error) throw error;

      alert(
        `${selectedArticleIds.length}개의 기사가 성공적으로 삭제되었습니다.`
      );
      clearSelection(); // 삭제 후 선택 목록 초기화
      router.refresh(); // 목록 갱신
    } catch (error) {
      console.error("일괄 삭제 오류:", error);
      alert(`기사 삭제에 실패했습니다: ${error.message}`);
    }
  };

  // "전체 선택 해제" 버튼 클릭 핸들러
  const handleClearSelection = () => {
    clearSelection();
  };

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-600">
          선택된 기사: {selectedArticleIds.length}개
        </p>

        {/* --- 새로 추가된 버튼 --- */}
        <Button
          variant="outlined"
          color="inherit" // 일반적인 색상 사용
          size="small"
          disabled={!isSelected} // 선택된 항목이 있을 때만 활성화
          onClick={handleClearSelection}
        >
          전체 선택 해제
        </Button>
        {/* ------------------- */}
      </div>

      <Button
        variant="contained"
        color="error"
        size="small"
        sx={{ ml: 2 }}
        disabled={!isSelected}
        onClick={handleDelete}
      >
        선택된 기사 일괄 삭제
      </Button>
    </div>
  );
}
