"use client";

import { useAuth } from "@/providers/AuthProvider";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useState, useEffect, useCallback } from "react";

/** 아이콘 컴포넌트들 (SVG) */
const Icons = {
  Reply: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  ThumbsUp: ({ filled }) => (
    <svg
      width="16"
      height="16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  ThumbsDown: ({ filled }) => (
    <svg
      width="16"
      height="16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  ),
  Flag: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
};

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);
  if (diffInSeconds < 60) return "방금 전";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;
  return past.toLocaleDateString();
};

export default function CommentSection({ articleId }) {
  const supabase = createBrowserSupabaseClient();
  const [comments, setComments] = useState([]);
  // const [user, setUser] = useState(null);
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  // 평면 배열 -> 트리 구조 변환 함수 (currentUser를 인자로 받아 myVote 정확히 계산)
  const buildCommentTree = useCallback((flatComments, currentUser) => {
    const map = {};
    const roots = [];

    flatComments.forEach((c) => {
      map[c.id] = {
        ...c,
        children: [],
        likes: c.comment_votes?.filter((v) => v.vote_type === 1).length || 0,
        dislikes:
          c.comment_votes?.filter((v) => v.vote_type === -1).length || 0,
        myVote: currentUser
          ? c.comment_votes?.find((v) => v.user_id === currentUser.id)
              ?.vote_type || 0
          : 0,
      };
    });

    flatComments.forEach((c) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  }, []);

  const fetchComments = useCallback(
    async (currentUser) => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
        *,
        profiles ( display_name, avatar_url ),
        comment_votes ( user_id, vote_type )
      `
        )
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        const commentTree = buildCommentTree(data, currentUser);
        setComments(commentTree);
      }
      setLoading(false);
    },
    [articleId, buildCommentTree, supabase]
  );

  // 초기 데이터 로드
  useEffect(() => {
    // const fetchData = async () => {
    //   setLoading(true);
    //   const {
    //     data: { session },
    //   } = await supabase.auth.getSession();
    //   const currentUser = session?.user || null;
    //   setUser(currentUser);
    //   // 세션 정보를 바로 fetchComments에 전달하여 myVote가 누락되지 않게 함
    //   await fetchComments(currentUser);
    // };
    // fetchData();
    if (!authLoading) fetchComments(user);
  }, [articleId, authLoading, user]);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      content: newComment,
    });

    if (!error) {
      setNewComment("");
      fetchComments(user);
    }
  };

  const countChildren = (comment) => {
    if (!comment.children || comment.children.length === 0) return 0;
    return (
      comment.children.length +
      comment.children.reduce((acc, c) => acc + countChildren(c), 0)
    );
  };

  if (loading)
    return <div className="p-4 text-gray-400">댓글을 불러오는 중...</div>;

  return (
    <div className="w-full bg-[#1f1f1f] text-gray-200 mt-8 border-t-[1px] border-white">
      <h3 className="text-xl font-bold text-white mb-6 mt-5">
        댓글 {comments.reduce((acc, c) => acc + 1 + countChildren(c), 0)}
      </h3>

      {user ? (
        <form onSubmit={handleCreateComment} className="mb-6 flex gap-3">
          <div className="flex-1 flex items-end gap-x-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 남겨보세요..."
              className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none h-24"
            />
            <button
              type="submit"
              className="h-fit px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              등록
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-[#2a2a2a] rounded text-center text-gray-400">
          댓글을 작성하려면 로그인이 필요합니다.
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 && (
          <div className="text-gray-500 mt-20 text-center">
            아직 등록된 댓글이 없습니다.
          </div>
        )}
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            user={user}
            supabase={supabase}
            refresh={() => fetchComments(user)}
            articleId={articleId}
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({ comment, user, supabase, refresh, articleId }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);

  const isMyComment = user && user.id === comment.user_id;

  const handleVote = async (type) => {
    if (!user) return alert("로그인이 필요합니다.");

    if (comment.myVote === type) {
      await supabase
        .from("comment_votes")
        .delete()
        .match({ comment_id: comment.id, user_id: user.id });
    } else {
      await supabase
        .from("comment_votes")
        .upsert(
          { comment_id: comment.id, user_id: user.id, vote_type: type },
          { onConflict: "comment_id, user_id" }
        );
    }
    refresh();
  };
  // 댓글 신고

  const handleReport = async () => {
    if (!user) return alert("로그인이 필요합니다.");

    const reason = prompt("신고 사유를 입력해주세요.");

    if (reason) {
      const { error } = await supabase.from("comment_reports").insert({
        comment_id: comment.id,

        user_id: user.id,

        reason: reason,
      });

      if (!error) alert("신고가 접수되었습니다.");
    }
  };

  const submitReply = async () => {
    if (!replyContent.trim()) return;
    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      content: replyContent,
      parent_id: comment.id,
    });
    if (!error) {
      setIsReplying(false);
      setReplyContent("");
      refresh();
    }
  };

  const submitEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    const { error } = await supabase
      .from("comments")
      .update({
        content: editContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", comment.id);

    if (!error) {
      setIsEditing(false);
      refresh();
    }
  };

  const handleDelete = async () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", comment.id);
      if (!error) refresh();
    }
  };

  return (
    <div className="flex gap-3 group">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-200 text-sm">
              {comment.profiles?.display_name || "익명 사용자"}
            </span>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(comment.created_at)}
            </span>
            {comment.updated_at && (
              <span className="text-[10px] text-gray-400 bg-[#2a2a2a] px-1 rounded">
                (수정됨)
              </span>
            )}
          </div>
          <button
            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleReport}
          >
            <Icons.Flag />
          </button>
        </div>

        <div className="text-white text-sm leading-relaxed mb-2">
          {isEditing ? (
            <div className="mt-2">
              <textarea
                className="w-full bg-[#2a2a2a] border border-gray-600 rounded p-2 text-white focus:outline-none mb-2"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-3 py-1 text-gray-400 hover:text-white"
                >
                  취소
                </button>
                <button
                  onClick={submitEdit}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  수정 완료
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-white">{comment.content}</p>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote(1)}
                className={`hover:text-blue-400 flex items-center gap-1 cursor-pointer ${
                  comment.myVote === 1 ? "text-blue-400" : ""
                }`}
              >
                <Icons.ThumbsUp filled={comment.myVote === 1} />
                <span>{comment.likes}</span>
              </button>
              <button
                onClick={() => handleVote(-1)}
                className={`hover:text-red-400 flex items-center gap-1 ml-2 cursor-pointer ${
                  comment.myVote === -1 ? "text-red-400" : ""
                }`}
              >
                <Icons.ThumbsDown filled={comment.myVote === -1} />
                <span>{comment.dislikes}</span>
              </button>
            </div>
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Icons.Reply /> 답글
            </button>
            {isMyComment && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="hover:text-white flex items-center gap-1 ml-auto cursor-pointer"
                >
                  <Icons.Edit /> 수정
                </button>
                <button
                  onClick={handleDelete}
                  className="hover:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <Icons.Trash /> 삭제
                </button>
              </>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-3 flex gap-3">
            <div className="flex-1">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white text-sm focus:outline-none focus:border-blue-500 h-20 resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsReplying(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  취소
                </button>
                <button
                  onClick={submitReply}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  답글 등록
                </button>
              </div>
            </div>
          </div>
        )}

        {comment.children && comment.children.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-[#333]">
            {comment.children.map((child) => (
              <div key={child.id} className="mt-4 first:mt-0">
                <CommentItem
                  comment={child}
                  user={user}
                  supabase={supabase}
                  refresh={refresh}
                  articleId={articleId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
