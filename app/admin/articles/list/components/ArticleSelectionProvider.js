"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// 1. Context 생성
const ArticleSelectionContext = createContext({
  selectedArticleIds: [],
  setSelectedArticleIds: () => {},
  toggleArticleSelection: () => {},
  isSelected: () => false,
  clearSelection: () => {},
});

// 2. Provider 컴포넌트
export function ArticleSelectionProvider({ children }) {
  // 선택된 기사 ID들을 저장할 상태
  const [selectedArticleIds, setSelectedArticleIds] = useState([]);

  // 단일 기사 선택/해제 토글 함수
  const toggleArticleSelection = useCallback((articleId) => {
    setSelectedArticleIds((prevIds) => {
      if (prevIds.includes(articleId)) {
        // 이미 선택된 경우: 제거
        return prevIds.filter((id) => id !== articleId);
      } else {
        // 선택되지 않은 경우: 추가
        return [...prevIds, articleId];
      }
    });
  }, []);

  // 기사가 선택되었는지 확인하는 함수
  const isSelected = useCallback(
    (articleId) => selectedArticleIds.includes(articleId),
    [selectedArticleIds]
  );

  // 선택된 목록 전체 초기화 함수
  const clearSelection = useCallback(() => {
    setSelectedArticleIds([]);
  }, []);

  const value = {
    selectedArticleIds,
    setSelectedArticleIds,
    toggleArticleSelection,
    isSelected,
    clearSelection,
  };

  return (
    <ArticleSelectionContext.Provider value={value}>
      {children}
    </ArticleSelectionContext.Provider>
  );
}

// 3. Context Hook
export function useArticleSelection() {
  const context = useContext(ArticleSelectionContext);
  if (!context) {
    throw new Error(
      "useArticleSelection must be used within an ArticleSelectionProvider"
    );
  }
  return context;
}
