// MainArticleSetterDialog.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

// Supabase 클라이언트 임포트 (프로젝트의 설정 경로에 맞게 수정 필요)
import {
  createBrowserSupabaseClient,
  createClient,
} from "@/utils/supabase/client";

// ⭐️ 테이블 이름 상수
const CATEGORIES_TABLE = "categories";
const ARTICLES_TABLE = "articles";
const MAIN_MAPPING_TABLE = "article_categories"; // is_main 필드가 포함된 N:M 테이블

// --- Helper Functions (buildCategoryTree, CategoryItem) ---

const buildCategoryTree = (categories, mainArticlesMap) => {
  const map = {};
  const tree = [];

  categories.forEach((category) => {
    const currentMain = mainArticlesMap[category.id];
    map[category.id] = {
      ...category,
      children: [],
      current_main_title: currentMain ? currentMain.title : null,
      current_main_article_id: currentMain ? currentMain.article_id : null,
      // current_mapping_id는 저장 시 업데이트를 위해 필요합니다. (is_main을 업데이트할 때 사용)
      current_mapping_id: currentMain ? currentMain.mapping_id : null,
    };
  });

  // ... (트리 구축 및 정렬 로직 생략 - 이전과 동일) ...
  categories.forEach((category) => {
    if (category.parent_id && map[category.parent_id]) {
      map[category.parent_id].children.push(map[category.id]);
    } else {
      if (map[category.id]) {
        tree.push(map[category.id]);
      }
    }
  });

  const sortChildren = (node) => {
    if (node.children.length > 0) {
      node.children.sort((a, b) => a.order - b.order);
      node.children.forEach(sortChildren);
    }
  };

  tree.sort((a, b) => a.order - b.order);
  tree.forEach(sortChildren);

  return tree;
};

const CategoryItem = ({
  category,
  level = 0,
  onSelectCategory,
  selectedArticleMap,
}) => {
  // ... (기존 CategoryItem 로직 유지) ...
  const paddingLeft = level * 2 + 2;
  const fontWeight =
    level === 0 ? "fontWeightBold" : level === 1 ? 600 : "fontWeightRegular";
  const variant = level === 0 ? "h6" : level === 1 ? "subtitle1" : "body1";

  const selectedTitle = selectedArticleMap[category.id]
    ? selectedArticleMap[category.id].selected_article_title
    : category.current_main_title;

  const isChanged =
    selectedArticleMap[category.id] &&
    selectedArticleMap[category.id].selected_article_id !==
      category.current_main_article_id;

  return (
    <Box>
      <ListItem
        disablePadding
        onClick={() => onSelectCategory(category)}
        sx={{
          pl: paddingLeft,
          py: 0.8,
          backgroundColor: level === 0 ? "action.hover" : "background.paper",
          borderLeft:
            level > 0
              ? `4px solid ${level === 1 ? "primary.light" : "grey.300"}`
              : "none",
          "&:hover": {
            backgroundColor: "action.selected",
          },
          cursor: "pointer",
          transition: "background-color 0.2s",
          borderRight: isChanged ? "8px solid orange" : "none",
        }}
      >
        <ListItemText
          primary={
            <Typography
              variant={variant}
              sx={{
                fontWeight: fontWeight,
                color: level === 0 ? "primary.dark" : "text.primary",
              }}
            >
              {level > 0 ? "└── " : ""}
              {category.name}
            </Typography>
          }
          secondary={
            <Typography
              component="span"
              variant="body2"
              color={isChanged ? "orange" : "text.secondary"}
              sx={{
                fontStyle: "italic",
                fontWeight: isChanged ? "fontWeightBold" : "fontWeightRegular",
              }}
            >
              {selectedTitle ? `메인: ${selectedTitle}` : "메인 기사 없음"}
              {isChanged && " (변경됨)"}
            </Typography>
          }
        />
      </ListItem>

      {category.children.length > 0 && (
        <List disablePadding>
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              onSelectCategory={onSelectCategory}
              selectedArticleMap={selectedArticleMap}
            />
          ))}
        </List>
      )}

      {level === 0 && (
        <Divider sx={{ my: 0.5, borderColor: "primary.light" }} />
      )}
    </Box>
  );
};

// -------------------------------------------------------------

export default function MainArticleSetterDialog({
  open,
  onClose,
  articleTitle,
  articleId,
}) {
  const [categories, setCategories] = useState([]);
  // mapping_id 필드를 추가합니다.
  const [mainArticlesMap, setMainArticlesMap] = useState({}); // { category_id: { title, article_id, mapping_id } }
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedArticleMap, setSelectedArticleMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const supabase = createBrowserSupabaseClient();

  // --- 1. 데이터 패칭 (fetchData) 함수: is_main=true 조건 추가 ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1-1. 모든 카테고리 가져오기 (id와 slug 모두 필요)
      const { data: catData, error: catError } = await supabase
        .from(CATEGORIES_TABLE)
        .select('id, name, parent_id, "order", slug');

      if (catError) throw catError;
      const categoriesData = catData || [];
      setCategories(categoriesData);

      // 1-2. 연결 테이블을 통해 현재 메인 기사 정보 가져오기 (is_main=true 조건)
      const { data: mainData, error: mainError } = await supabase
        .from(MAIN_MAPPING_TABLE)
        .select(
          `
                    id,
                    category_slug, 
                    article_id,
                    articles ( title )
                `
        )
        .eq("is_main", true); // ⭐️ 오직 is_main이 true인 레코드만 조회

      if (mainError) throw mainError;

      // slug-id 맵 생성
      const slugToIdMap = categoriesData.reduce((acc, cat) => {
        acc[cat.slug] = cat.id;
        return acc;
      }, {});

      // 메인 기사 맵 { category_id: { title, article_id, mapping_id } } 생성
      const map = {};
      (mainData || []).forEach((item) => {
        const category_id = slugToIdMap[item.category_slug];
        if (category_id && item.articles) {
          map[category_id] = {
            title: item.articles.title,
            article_id: item.article_id,
            mapping_id: item.id, // ⭐️ DB 레코드 ID 저장
          };
        }
      });
      setMainArticlesMap(map);
    } catch (e) {
      setError(e.message || "초기 데이터를 불러오는 데 실패했습니다.");
      console.error("Fetch Data Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
      setSelectedArticleMap({});
      setSaveStatus(null);
    }
  }, [open]);

  useEffect(() => {
    if (categories.length > 0) {
      const tree = buildCategoryTree(categories, mainArticlesMap);
      setCategoryTree(tree);
    }
  }, [categories, mainArticlesMap]);

  // --- 2. 카테고리 클릭 핸들러 (로직 변경 없음) ---
  const handleSelectCategory = (category) => {
    if (!articleTitle || !articleId) {
      alert("메인 기사로 설정할 기사를 먼저 선택해주세요.");
      return;
    }

    const newMap = { ...selectedArticleMap };

    newMap[category.id] = {
      category_id: category.id,
      selected_article_id: articleId,
      selected_article_title: articleTitle,
      // mapping_id는 저장 시 필요
      current_mapping_id: category.current_mapping_id || null,
    };

    setSelectedArticleMap(newMap);
    setSaveStatus(null);
  };

  // --- 3. 저장 버튼 핸들러: is_main 필드 업데이트 로직 추가 ---
  const handleSave = async () => {
    if (Object.keys(selectedArticleMap).length === 0) {
      alert("저장할 변경 사항이 없습니다.");
      return;
    }

    setIsLoading(true);
    setSaveStatus(null);

    const updates = Object.values(selectedArticleMap).map((item) => ({
      category_id: item.category_id,
      new_article_id: item.selected_article_id,
      current_article_id: mainArticlesMap[item.category_id]?.article_id || null,
      current_mapping_id: mainArticlesMap[item.category_id]?.mapping_id || null,
    }));

    try {
      const updatePromises = [];

      // 1단계: 기존 메인 기사 해제 (is_main: false로 업데이트)
      // 카테고리당 하나의 메인 기사만 가능하다는 전제 하에,
      // 새로운 기사를 선택했을 때 기존 메인 기사의 is_main을 false로 설정합니다.
      const oldMainIdsToDeactivate = [];

      updates.forEach(
        ({
          category_id,
          new_article_id,
          current_article_id,
          current_mapping_id,
        }) => {
          if (current_article_id !== new_article_id && current_mapping_id) {
            // 기사가 바뀌었고, 이전에 메인 기사로 설정된 연결 레코드가 있는 경우
            oldMainIdsToDeactivate.push(current_mapping_id);
          }
        }
      );

      if (oldMainIdsToDeactivate.length > 0) {
        updatePromises.push(
          supabase
            .from(MAIN_MAPPING_TABLE)
            .update({ is_main: false })
            .in("id", oldMainIdsToDeactivate)
        );
      }

      // 2단계: 새로운 기사 설정 (Upsert 또는 Insert/Update)
      // 새로운 기사를 메인으로 설정하거나, 이미 해당 카테고리에 연결된 기사를 메인으로 승격합니다.
      const newMainInsertsOrUpdates = [];

      updates.forEach(({ category_id, new_article_id, current_article_id }) => {
        if (new_article_id) {
          const category = categories.find((c) => c.id === category_id);
          if (!category) return;
          const category_slug = category.slug;

          newMainInsertsOrUpdates.push({
            article_id: new_article_id,
            category_slug: category_slug,
            is_main: true, // ⭐️ 메인 기사로 설정
          });
        }
      });

      if (newMainInsertsOrUpdates.length > 0) {
        updatePromises.push(
          supabase
            .from(MAIN_MAPPING_TABLE)
            // article_id와 category_slug를 기준으로 Upsert (기존에 일반 기사로 연결된 경우 is_main만 true로 업데이트)
            .upsert(newMainInsertsOrUpdates, {
              onConflict: "article_id, category_slug",
              ignoreDuplicates: false,
            })
        );
      }

      // 모든 업데이트 병렬 처리
      await Promise.all(updatePromises.map((p) => p.throwOnError()));

      setSaveStatus("success");
      setSelectedArticleMap({});
      await fetchData(); // 최신 DB 상태로 UI 갱신
    } catch (e) {
      setError(e.message || "저장 중 오류가 발생했습니다.");
      setSaveStatus("error");
      console.error("Save Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI 렌더링 (이전과 동일) ---
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          textAlign: "center",
          fontSize: "1.25rem",
        }}
      >
        메인 기사 설정 (is_main 필드 기반)
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            현재 선택 기사:{" "}
            <Box
              component="span"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              {articleTitle || "선택된 기사 없음"}
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            카테고리를 클릭하면 **위 기사**가 해당 카테고리의 메인 기사로
            설정됩니다.
          </Typography>

          {saveStatus === "success" && (
            <Alert severity="success" sx={{ mb: 1 }}>
              저장 완료! 메인 기사 설정이 업데이트되었습니다.
            </Alert>
          )}
          {saveStatus === "error" && (
            <Alert severity="error" sx={{ mb: 1 }}>
              저장 실패: {error}
            </Alert>
          )}
          {error && saveStatus !== "error" && (
            <Alert severity="error" sx={{ mb: 1 }}>
              데이터 로드 오류: {error}
            </Alert>
          )}
        </Box>

        {isLoading && Object.keys(mainArticlesMap).length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : categoryTree.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="subtitle1" color="text.secondary">
              로드된 카테고리 데이터가 없습니다.
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: "100%", bgcolor: "background.paper", pt: 0 }}>
            {categoryTree.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                level={0}
                onSelectCategory={handleSelectCategory}
                selectedArticleMap={selectedArticleMap}
              />
            ))}
          </List>
        )}
      </DialogContent>

      <Box sx={{ p: 2, borderTop: "1px solid #eee", textAlign: "right" }}>
        <Button
          onClick={handleSave}
          disabled={isLoading || Object.keys(selectedArticleMap).length === 0}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
        >
          {isLoading
            ? "저장 중..."
            : `변경사항 ${Object.keys(selectedArticleMap).length}개 저장`}
        </Button>
        <Button onClick={onClose} variant="outlined" sx={{ ml: 1 }}>
          닫기
        </Button>
      </Box>
    </Dialog>
  );
}
