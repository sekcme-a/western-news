"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function DeleteDuplicates() {
  const handleCleanup = async () => {
    const supabase = createBrowserSupabaseClient();

    // 1. 데이터 가져오기
    const { data, error } = await supabase.from("articles").select("id, title");

    if (error) {
      console.error("데이터 로드 실패:", error.message);
      return;
    }

    // 2. 중복 처리 로직
    const titleMap = {};
    const idsToDelete = [];

    data.forEach((item) => {
      if (!titleMap[item.title]) {
        // 이 타이틀을 처음 만났다면, '남길 것'으로 간주하고 Map에 저장
        titleMap[item.title] = item.id;
      } else {
        // 이미 해당 타이틀이 Map에 있다면, 현재 id는 '삭제 대상' 배열에 추가
        idsToDelete.push(item.id);
      }
    });

    // 3. 결과 확인
    console.log("삭제할 ID 배열:", idsToDelete);
    console.log("중복 제거 완료. 남긴 항목들:", titleMap);
    console.log(`총 ${idsToDelete.length}개의 중복 항목을 찾았습니다.`);

    if (idsToDelete.length === 0) {
      alert("중복된 항목이 없습니다.");
      return;
    }

    // 4. (선택 사항) 실제 삭제 실행
    if (confirm(`${idsToDelete.length}개의 데이터를 삭제하시겠습니까?`)) {
      const { error: deleteError } = await supabase
        .from("articles")
        .delete()
        .in("id", idsToDelete); // 배열에 담긴 ID들만 한꺼번에 삭제

      if (deleteError) {
        console.error("삭제 중 에러:", deleteError.message);
      } else {
        alert("중복 제거 완료!");
      }
    }
  };

  return (
    <button onClick={handleCleanup} style={{ padding: "10px", color: "red" }}>
      중복 기사 정리하기 (1개만 남기고 삭제)
    </button>
  );
}
