// app/mypage/components/NicknameSection.js
"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function NicknameSection({ currentNickname, onUpdate }) {
  const supabase = createBrowserSupabaseClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentNickname);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateNickname = async () => {
    if (!newNickname || newNickname === currentNickname) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    // user_metadata의 display_name 필드 업데이트 (수정됨)
    const { error } = await supabase.auth.updateUser({
      data: { display_name: newNickname },
    });
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: newNickname })
      .eq("id", (await supabase.auth.getUser()).data.user.id);
    setIsLoading(false);

    if (error) {
      alert(`닉네임 변경 실패: ${error.message}`);
    } else {
      onUpdate(newNickname);
      setIsEditing(false);
      alert("닉네임이 성공적으로 변경되었습니다.");
    }
  };

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-500">
      <span className="font-medium w-1/4">닉네임</span>
      <div className="w-3/4 flex items-center space-x-2">
        {isEditing ? (
          <input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            className="border p-1 rounded w-full"
            disabled={isLoading}
          />
        ) : (
          <span className=" flex-grow">{currentNickname}</span>
        )}
        <button
          onClick={isEditing ? handleUpdateNickname : () => setIsEditing(true)}
          className={`px-3 py-1 text-sm rounded cursor-pointer ${
            isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "저장 중..." : isEditing ? "저장" : "변경"}
        </button>
        {isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              setNewNickname(currentNickname);
            }}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            disabled={isLoading}
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
}
