"use client";

import { useAuth } from "@/providers/AuthProvider";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarkOutlinedIcon from "@mui/icons-material/BookmarkOutlined";
export default function BookmarkButton({ articleId }) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserSupabaseClient();

  // 초기 로드 시 북마크 여부 확인
  useEffect(() => {
    if (user) {
      checkBookmarkStatus();
    }
  }, [user, articleId]);

  const checkBookmarkStatus = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .single();

    if (data) setIsBookmarked(true);
    setLoading(false);
  };

  const toggleBookmark = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    console.log("asdf");
    setLoading(true);

    if (isBookmarked) {
      // 북마크 취소
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("article_id", articleId);

      if (!error) setIsBookmarked(false);
    } else {
      // 북마크 추가
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, article_id: articleId });

      console.log(error);
      if (!error) setIsBookmarked(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`
      
         cursor-pointer
    transition ${
      isBookmarked ? "text-yellow-500 border-yellow-500" : "text-white"
    }`}
    >
      {isBookmarked ? (
        <BookmarkOutlinedIcon style={{ fontSize: "27px" }} />
      ) : (
        <BookmarkBorderOutlinedIcon style={{ fontSize: "27px" }} />
      )}
      {/* <p className="text-xs mt-1">북마크</p> */}
    </button>
  );
}
