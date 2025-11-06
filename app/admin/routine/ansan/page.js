"use client";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { convertTextToQuillHTML } from "../pages/function/convertTextToQuillHTML";
import { Button, TextField } from "@mui/material";
import Room from "./Room";
import { addSession } from "../handleSession";

const TEXT = `각 기사 제목에 맞는 카테고리를 아래의 카테고리 목록중에서 1개씩 골라줘. 그리고 차례대로 배열로 만들어줘.
JSON형식의 코드로만 대답하고, 다른 부가적인 설명이나 말 하지마.
배열 형식: ["society","lifestyle","",...]\n`;

export default function AnsanBodo({ setErrors }) {
  const supabase = createBrowserSupabaseClient();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [openRoom, setOpenRoom] = useState(false);

  const [aiText, setAiText] = useState("");

  const [slugs, setSlugs] = useState([]);

  const [log, setLog] = useState([]);
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    // fetchArticles();
    fetchDates();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("slug")
      .eq("parent_id", "422d1e7f-6582-4fe6-8362-ed7e83c04ec3");
    const text = data.map((item) => item.slug).join(",");
    return text;
  };

  const fetchDates = async () => {
    const d = await fetchRoutine();
    console.log(d);
    // setDateInput(JSON.stringify(d));
    setDateInput(`["2025-11-05]`);
  };

  const fetchArticles = async () => {
    const dates = JSON.parse(dateInput);

    try {
      const categoriesText = await fetchCategories();
      let list = [];
      for (const date of dates) {
        try {
          setLog((prev) => [...prev, `${date} 보도자료 크롤링 중...`]);

          const res = await fetch(
            `/api/crawl/ansan?start=${date}&end=${date}&page=0`
          );
          const data = await res.json();

          setLog((prev) => [
            ...prev,
            `[성공] ${date} 보도자료 ${data?.articles.length}개 확인`,
          ]);
          list = [...list, ...data.articles];
          console.log(list);
          setPosts((prev) => [...prev, ...data.articles]);
        } catch (error) {
          console.log(error);
          setLog((prev) => [...prev, `[에러] ${date} 보도자료 수집 실패`]);
          setErrors((prev) => [
            ...prev,
            {
              title: "안산 보도자료 수집 실패",
              message: `안산시청 ${date} 날짜 보도자료를 수집하지 못했습니다.`,
            },
          ]);
        }
      }
      const titles = list.map((item) => item.title);
      setAiText(
        `${TEXT}카테고리 목록: ${categoriesText}\r기사 제목 목록: ${JSON.stringify(
          titles
        )}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRoutine = async () => {
    const { data, error } = await supabase
      .from("routine")
      .select("date")
      .eq("type", "ansan")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("fetchRoutine error:", error);
      return;
    }

    if (data?.date) {
      const result = generateWeekdays(data.date);
      // setDates(result);
      console.log("📅 생성된 날짜:", result);
      return result;
    }
  };

  // ✅ timestamptz 이후부터 오늘까지 (주말 제외)
  const generateWeekdays = (startDateString) => {
    // Supabase timestamptz → KST 기준으로 변환
    const startDate = new Date(startDateString);
    const today = new Date();

    // 시작일의 KST 기준 날짜만 추출
    const startY = startDate.getFullYear();
    const startM = startDate.getMonth();
    const startD = startDate.getDate();

    // 오늘의 KST 기준 날짜만 추출
    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();

    const start = new Date(startY, startM, startD); // 자정 기준
    const end = new Date(todayY, todayM, todayD);

    const result = [];
    let current = new Date(start);
    current.setDate(current.getDate() + 1); // "이후"부터 시작

    while (current <= end) {
      const day = current.getDay(); // 0=일, 6=토
      if (day !== 0 && day !== 6) {
        result.push(
          current
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\. /g, "-")
            .replace(/\.$/, "")
        );
      }
      current.setDate(current.getDate() + 1);
    }

    return result;
  };

  function cleanText(raw) {
    let text = raw;

    // 1. "사진 확대보기"가 여러 번 있을 수 있으므로 반복 처리
    while (text.includes("사진 확대보기")) {
      const photoIndex = text.indexOf("사진 확대보기");
      if (photoIndex === -1) break;

      const before = text.slice(0, photoIndex);
      let after = text.slice(photoIndex + "사진 확대보기".length);

      const firstContentMatch = after.match(/[^\n\s]/); // 공백/줄바꿈이 아닌 첫 문자 찾기
      if (firstContentMatch) {
        const firstContentIndex = after.indexOf(firstContentMatch[0]);
        after = after.slice(firstContentIndex);
      }

      text = before + after;
    }

    // 2. &nbsp; → 일반 공백
    text = text.replace(/&nbsp;/g, " ");

    // 3. 줄바꿈 3번 이상 → 2번으로
    text = text.replace(/\n{3,}/g, "\n\n");

    // 4. "줄바꿈 + 담당부서 + 줄바꿈" 이후는 삭제
    text = text.replace(/\n담당부서\n[\s\S]*/g, "");

    return text.trim(); // 앞뒤 공백 제거
  }

  let newArticleIds = [];
  const onSaveChange = async (e) => {
    try {
      setSlugs(e.target.value);
      console.log(posts);
      const datas = posts.map((item) => ({
        title: item.title,
        content: convertTextToQuillHTML(cleanText(item.content)),
        images_bodo: item.images,
        author: "심수연 기자 bkshim21@naver.com",
        thumbnail_image: item.images?.[0] ?? null,
      }));

      const { data } = await supabase
        .from("articles")
        .insert(datas)
        .select("id");
      newArticleIds = data.map((item) => item.id);
      const s = JSON.parse(e.target.value);
      const slugList = data.map((item, index) => ({
        article_id: item.id,
        category_slug: s[index],
      }));
      //general 는 상위카테고리라 무조건 포함
      const generalSlugList = data.map((item, index) => ({
        article_id: item.id,
        category_slug: "general",
      }));
      const ansanSlugList = data.map((item, index) => ({
        article_id: item.id,
        category_slug: "ansan",
      }));
      await supabase
        .from("article_categories")
        .insert([...slugList, ...generalSlugList, ...ansanSlugList]);

      addSession("success", {
        title: `[안산 보도자료 저장 성공] 총 ${datas.length}개의 보도자료를 저장했습니다.`,
        articles: datas,
        articleSlugs: slugList,
      });
      setOpenRoom(true);
    } catch (error) {
      console.log(error);
      if (error.message.includes("JSON")) {
        addSession("error", {
          title: `안산 보도자료 카테고리 선택 실패`,
          message: `멍청한 AI가 안산의 보도자료 카테고리 선택을 실패했습니다.\n카테고리가 없는 기사들의 카테고리를 지정해주세요.`,
          articleIds: newArticleIds,
        });
      } else {
        addSession("error", {
          title: `안산 보도자료 저장 실패`,
          message: `코드상 문제로 저장에 실패했습니다.`,
        });
      }
    }
  };

  if (openRoom) return <Room posts={posts} />;
  return (
    <>
      <p>{`["2025-09-13","2025-09-14"] 형식으로 똑같이 작성해주세요.(괄호, " 포함)`}</p>
      <TextField
        value={dateInput}
        onChange={(e) => setDateInput(e.target.value)}
        fullWidth
      />

      <Button
        variant="contained"
        fullWidth
        className="h-[15vh]"
        onClick={fetchArticles}
      >
        크롤링 시작
      </Button>
      <Button
        variant="contained"
        fullWidth
        className="h-[15vh]"
        onClick={() => {
          navigator.clipboard.writeText(aiText);
        }}
      >
        전지전능한 챗GPT 문구 복사
      </Button>
      <TextField
        fullWidth
        multiline
        rows={5}
        value={slugs}
        onChange={onSaveChange}
      />
      <Button
        variant="contained"
        fullWidth
        className="h-[15vh]"
        onClick={() => {
          setOpenRoom(true);
        }}
      >
        룸 열기
      </Button>

      {log.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
      <></>
    </>
  );
}
