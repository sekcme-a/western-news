// CategoryManager.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * @typedef {object} Category
 * @property {string} id - 카테고리 고유 ID (UUID)
 * @property {string} name - 카테고리 이름
 * @property {string} slug - 카테고리 URL 슬러그 ⭐추가됨
 * @property {string | null} parentId - 상위 카테고리 ID. 최상위는 null
 * @property {number} order - 동일 부모 내에서의 순서
 */

// --- 슬러그 생성 유틸리티 함수 ---
/**
 * 문자열을 SEO 친화적인 슬러그(Slug)로 변환합니다.
 * - 한글, 특수문자 등을 제거하고 소문자, 하이픈(-)만 사용하도록 정규화합니다.
 * @param {string} text 변환할 텍스트
 * @returns {string} 슬러그 문자열
 */
const slugify = (text) => {
  // 1. 한글을 포함한 특수문자 제거 (영문, 숫자, 공백, 하이픈 외)
  // (실제 프로덕션에서는 한글을 영어로 음역 변환하는 라이브러리 사용을 고려할 수 있습니다)
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // 영문, 숫자, 공백, 하이픈 외 문자 제거
    .replace(/[\s_-]+/g, "-") // 공백, 언더바, 복수의 대시를 하나의 대시로 통일
    .replace(/^-+|-+$/g, ""); // 문자열 시작이나 끝에 있는 대시 제거
};

// --- 카테고리 관리 컴포넌트 ---
export default function CategoryManager({ categories, onCategoriesChange }) {
  // 상태 관리 훅
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingSlug, setEditingSlug] = useState(""); // ⭐ 슬러그 상태 추가
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false); // ⭐ 수동 편집 여부
  const [dragOverId, setDragOverId] = useState(null);

  // 드래그 앤 드롭 관련 참조 (Ref)
  const dragItem = useRef(null);
  const isReordering = useRef(false);

  // ⭐ useEffect: 카테고리 이름 변경 시 슬러그 자동 업데이트
  useEffect(() => {
    // 편집 모드이며, 슬러그를 수동으로 편집하지 않은 경우에만 자동 생성/업데이트
    if (editingId && !isSlugManuallyEdited) {
      setEditingSlug(slugify(editingName));
    }
  }, [editingName, editingId, isSlugManuallyEdited]);

  // --- 카테고리 CRUD 함수 ---

  const addCategory = (parentId = null) => {
    const siblingCategories = categories.filter(
      (cat) => cat.parentId === parentId
    );
    const newOrder = siblingCategories.length;
    const initialName = "새 카테고리"; // 초기 이름 설정
    const newCategory = {
      id: uuidv4(),
      name: initialName,
      slug: slugify(initialName), // ⭐ 초기 슬러그 추가
      parentId,
      order: newOrder,
    };
    onCategoriesChange([...categories, newCategory]);
  };

  const deleteCategory = (id) => {
    // 기존 로직 유지...
    if (
      window.confirm(
        "카테고리를 삭제하시겠습니까? 하위 카테고리도 모두 삭제됩니다."
      )
    ) {
      const descendants = getAllDescendants(id).map((c) => c.id);
      const categoriesToDelete = [id, ...descendants];
      const newCategories = categories.filter(
        (cat) => !categoriesToDelete.includes(cat.id)
      );
      onCategoriesChange(newCategories);
    }
  };

  /**
   * 카테고리 수정 모드 활성화 함수
   * @param {string} id - 수정할 카테고리 ID
   * @param {string} name - 현재 카테고리 이름
   * @param {string} slug - 현재 카테고리 슬러그 ⭐ 추가됨
   */
  const startEdit = (id, name, slug) => {
    setEditingId(id);
    setEditingName(name);
    setEditingSlug(slug); // ⭐ 현재 슬러그 로드
    setIsSlugManuallyEdited(false); // ⭐ 편집 시작 시 수동 편집 플래그 초기화
  };

  /**
   * 수정된 카테고리 이름과 슬러그를 저장하는 함수
   * @param {string} id - 수정된 카테고리 ID
   */
  const saveEdit = (id) => {
    // 저장 전, 입력된 슬러그를 최종적으로 정규화 (사용자가 오타를 넣었을 경우 대비)
    const finalSlug = slugify(editingSlug);

    const updatedCategories = categories.map(
      (cat) =>
        cat.id === id ? { ...cat, name: editingName, slug: finalSlug } : cat // ⭐ 슬러그 저장
    );
    onCategoriesChange(updatedCategories);
    setEditingId(null);
    setEditingName("");
    setEditingSlug(""); // ⭐ 상태 초기화
    setIsSlugManuallyEdited(false); // ⭐ 상태 초기화
  };

  const getAllDescendants = (id) => {
    // 기존 로직 유지...
    const children = categories.filter((cat) => cat.parentId === id);
    let all = [...children];
    children.forEach((child) => {
      all = all.concat(getAllDescendants(child.id));
    });
    return all;
  };

  // --- 드래그 앤 드롭 함수 (변경 없음) ---
  // ... (기존 드래그 앤 드롭 로직 유지) ...

  const handleReorderDragStart = (e, id) => {
    e.stopPropagation();
    dragItem.current = id;
    isReordering.current = true;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleReorderDrop = (e, targetId) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isReordering.current || !dragItem.current || !targetId) {
      isReordering.current = false;
      dragItem.current = null;
      return;
    }

    const draggedId = dragItem.current;
    if (draggedId === targetId) {
      isReordering.current = false;
      dragItem.current = null;
      return;
    }

    const draggedCategory = categories.find((cat) => cat.id === draggedId);
    const dropCategory = categories.find((cat) => cat.id === targetId);

    if (draggedCategory.parentId !== dropCategory.parentId) {
      isReordering.current = false;
      dragItem.current = null;
      return;
    }

    const parentId = draggedCategory.parentId;
    let siblings = categories
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    const draggedIndex = siblings.findIndex((cat) => cat.id === draggedId);
    const dropIndex = siblings.findIndex((cat) => cat.id === targetId);

    const [removed] = siblings.splice(draggedIndex, 1);
    siblings.splice(dropIndex, 0, removed);

    const newCategories = categories.map((cat) => {
      const updatedCatIndex = siblings.findIndex((s) => s.id === cat.id);
      return updatedCatIndex !== -1 ? { ...cat, order: updatedCatIndex } : cat;
    });

    onCategoriesChange(newCategories);
    isReordering.current = false;
    dragItem.current = null;
  };

  const handleParentDragStart = (e, id) => {
    dragItem.current = id;
    isReordering.current = false;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleParentDrop = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();

    if (isReordering.current || !dragItem.current || !targetId) {
      dragItem.current = null;
      setDragOverId(null);
      return;
    }

    const draggedId = dragItem.current;
    if (draggedId === targetId) {
      dragItem.current = null;
      setDragOverId(null);
      return;
    }

    const draggedCategory = categories.find((cat) => cat.id === draggedId);
    if (!draggedCategory) return;

    const descendants = getAllDescendants(draggedId).map((c) => c.id);
    if (descendants.includes(targetId)) {
      dragItem.current = null;
      setDragOverId(null);
      return;
    }

    const oldParentId = draggedCategory.parentId;
    const newOrder = categories.filter(
      (cat) => cat.parentId === targetId
    ).length;

    const updatedCategories = categories.map((cat) => {
      if (cat.id === draggedId) {
        return { ...cat, parentId: targetId, order: newOrder };
      }
      if (cat.parentId === oldParentId) {
        const siblings = categories.filter((c) => c.parentId === oldParentId);
        const reorderedSiblings = siblings
          .filter((c) => c.id !== draggedId)
          .sort((a, b) => a.order - b.order)
          .map((c, index) => ({ ...c, order: index }));
        return reorderedSiblings.find((s) => s.id === cat.id) || cat;
      }
      return cat;
    });

    onCategoriesChange(updatedCategories);
    dragItem.current = null;
    setDragOverId(null);
  };

  const handleDragEnter = (e, id) => {
    e.stopPropagation();
    if (!isReordering.current) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setDragOverId(null);
  };

  const handleDropToBackground = (e) => {
    e.preventDefault();
    if (dragItem.current && !isReordering.current) {
      const newOrder = categories.filter((c) => c.parentId === null).length;
      const updatedCategories = categories.map((cat) =>
        cat.id === dragItem.current
          ? { ...cat, parentId: null, order: newOrder }
          : cat
      );
      onCategoriesChange(updatedCategories);
      dragItem.current = null;
    }
    setDragOverId(null);
  };

  // --- UI 렌더링 함수 ---

  const renderCategories = (parentId) => {
    const filteredCategories = categories
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    return (
      <ul className="list-none p-0 mt-2">
        {filteredCategories.map((cat) => (
          <li
            key={cat.id}
            className={`flex flex-col border border-gray-300 rounded-md p-4 mb-2 transition-colors duration-200 
            ${dragOverId === cat.id ? "bg-yellow-100" : "bg-white"}`}
            onDragEnter={(e) => handleDragEnter(e, cat.id)}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleParentDrop(e, cat.id)}
          >
            <div className="flex justify-between items-center w-full">
              {/* 순서 변경 드래그 핸들 */}
              <div
                className="cursor-grab flex items-center active:cursor-grabbing text-xl mr-2 py-1 px-2 rounded-md hover:bg-gray-100 transition-colors"
                draggable
                onDragStart={(e) => handleReorderDragStart(e, cat.id)}
                onDragEnter={(e) => e.stopPropagation()}
                onDrop={(e) => handleReorderDrop(e, cat.id)}
              >
                🖐️<p className="text-xs ml-1">순서변경</p>
              </div>

              {/* 카테고리 이름/수정 폼 */}
              <div
                className="flex-grow flex flex-col cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => handleParentDragStart(e, cat.id)}
              >
                {editingId === cat.id ? (
                  <div className="flex-grow flex flex-col gap-2 w-full">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="p-2 border rounded-md"
                      placeholder="카테고리 이름"
                    />
                    {/* ⭐ 슬러그 입력 필드 추가 */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 min-w-[50px]">
                        슬러그:
                      </span>
                      <input
                        type="text"
                        value={editingSlug}
                        onChange={(e) => {
                          setEditingSlug(e.target.value);
                          setIsSlugManuallyEdited(true); // 수동 편집 플래그 설정
                        }}
                        onBlur={() => setEditingSlug(slugify(editingSlug))} // 포커스 잃으면 정규화
                        className="flex-grow p-2 border rounded-md text-sm font-mono"
                        placeholder="slug-for-url"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-lg font-medium">{cat.name}</span>
                    <span className="text-xs text-gray-500 font-mono mt-1">
                      /{cat.slug}
                    </span>
                  </div>
                )}
              </div>

              {/* 버튼 그룹 */}
              <div className="flex space-x-2 ml-4">
                {editingId === cat.id ? (
                  <button
                    onClick={() => saveEdit(cat.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    저장
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(cat.id, cat.name, cat.slug)} // ⭐ 슬러그 전달
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-300"
                  >
                    수정
                  </button>
                )}
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                >
                  삭제
                </button>
                <button
                  onClick={() => addCategory(cat.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                >
                  하위 추가
                </button>
              </div>
            </div>
            {/* 하위 카테고리 렌더링 */}
            <div className="pl-6 mt-2 w-full">{renderCategories(cat.id)}</div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className="max-w-3xl mx-auto p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropToBackground}
    >
      <button
        onClick={() => addCategory()}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md mb-4 hover:bg-blue-700 transition-colors duration-200"
      >
        최상위 카테고리 추가
      </button>
      {renderCategories(null)}
    </div>
  );
}
