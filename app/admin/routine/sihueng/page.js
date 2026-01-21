"use client";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { convertTextToQuillHTML } from "../pages/function/convertTextToQuillHTML";
import { Button, TextField } from "@mui/material";
import Room from "./Room";
import { addSession } from "../handleSession";

const TEXT = `역할: 너는 분류기다. 출력은 데이터다.

각 기사 제목에 대해 아래 카테고리 목록 중 정확히 1개를 선택해라.
기사 제목의 순서를 반드시 유지해라.

출력 규칙:
- 반드시 JSON 배열만 코드블럭에 출력
- 마크다운, 설명, 문장, 주석, 공백 텍스트 일절 금지

배열 형식 예시:
["society","lifestyle","sports"]

\n`;

export default function SiheungBodo({ setErrors }) {
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
  const [lastDateInput, setlastDateInput] = useState("");
  const [isFixedDate, setIsFixedDate] = useState(false);

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
    setDateInput(JSON.stringify(d));
    setlastDateInput(JSON.stringify(d));
    // setDateInput(`["2025-11-11"]`);
    fetchDateFix();
  };
  const fetchDateFix = async () => {
    const { data, error } = await supabase
      .from("routine")
      .select("data")
      .eq("type", "siheung_fix_date")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data?.data) {
      setDateInput(data.data);
      setIsFixedDate(true);
    } else {
      setIsFixedDate(false);
    }
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
            `/api/crawl/siheung?start=${date}&end=${date}`,
          );
          const data = await res.json();

          setLog((prev) => [
            ...prev,
            `[성공] ${date} 보도자료 ${data?.posts?.length}개 확인`,
          ]);
          list = [...list, ...(data?.posts ?? [])];
          setPosts((prev) => [...prev, ...(data?.posts ?? [])]);
          if (data?.posts?.length === 0) navigator.clipboard.writeText("null");
        } catch (error) {
          console.log(error);
          setLog((prev) => [...prev, `[에러] ${date} 보도자료 수집 실패`]);
          setErrors((prev) => [
            ...prev,
            {
              title: "시흥 보도자료 수집 실패",
              message: `시흥시청 ${date} 날짜 보도자료를 수집하지 못했습니다.`,
            },
          ]);
        }
      }
      const titles = list.map((item) => item.title);
      setAiText(
        `${TEXT}카테고리 목록: ${categoriesText}\n\n기사 제목 목록: ${JSON.stringify(
          titles,
        )}`,
      );
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRoutine = async () => {
    const { data, error } = await supabase
      .from("routine")
      .select("date")
      .eq("type", "siheung")
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
            .replace(/\.$/, ""),
        );
      }
      current.setDate(current.getDate() + 1);
    }

    return result;
  };

  let newArticleIds = [];
  const onSaveChange = async (e) => {
    try {
      const slugValues = JSON.parse(e.target.value);
      setSlugs(e.target.value);

      // 1. 현재 시점을 기준으로 잡습니다.
      const now = new Date();

      // 2. 데이터 가공: 각 기사마다 1초씩 차이를 둠
      const datas = posts.map((item, index) => {
        // index를 활용해 1초(1000ms)씩 더해 중복 생성을 방지합니다.
        const timestamp = new Date(now.getTime() + index * 1000).toISOString();

        return {
          title: item.title,
          content: convertTextToQuillHTML(item.content),
          images_bodo: item.images,
          author: "심수연 기자 bkshim21@naver.com",
          thumbnail_image: item.images?.[0] ?? null, // 옵셔널 체이닝으로 안전하게 접근
          created_at: timestamp, // 명시적 시간 주입
        };
      });

      // 3. articles 테이블 insert
      const { data: insertedArticles, error: articleError } = await supabase
        .from("articles")
        .insert(datas)
        .select("id");

      if (articleError) throw articleError;

      const newArticleIds = insertedArticles.map((item) => item.id);

      // 4. 카테고리 데이터 생성 (기본/일반/시흥)
      const slugList = insertedArticles.map((item, index) => ({
        article_id: item.id,
        category_slug: slugValues[index],
      }));

      const generalSlugList = insertedArticles.map((item) => ({
        article_id: item.id,
        category_slug: "general",
      }));

      const siheungSlugList = insertedArticles.map((item) => ({
        article_id: item.id,
        category_slug: "siheung",
      }));

      // 5. article_categories 테이블 insert
      const { error: categoryError } = await supabase
        .from("article_categories")
        .insert([...slugList, ...generalSlugList, ...siheungSlugList]);

      if (categoryError) throw categoryError;

      // 6. UI 및 세션 알림 업데이트
      addSession("success", {
        title: `[시흥 보도자료 저장 성공] 총 ${datas.length}개의 보도자료를 저장했습니다.`,
        articleTitles: datas.map((item) => item.title),
        articleSlugs: slugList,
      });

      setOpenRoom(true);
    } catch (error) {
      console.error("Siheung Save Error:", error);

      // JSON 파싱 에러 또는 기타 에러 메시지 처리
      if (error.message?.includes("JSON") || error instanceof SyntaxError) {
        addSession("error", {
          title: `시흥 보도자료 카테고리 선택 실패`,
          message: `AI가 카테고리를 올바르게 생성하지 못했습니다. 형식을 확인해주세요.`,
          articleIds: typeof newArticleIds !== "undefined" ? newArticleIds : [],
        });
      } else {
        addSession("error", {
          title: `시흥 보도자료 저장 실패`,
          message: `저장 과정에서 오류가 발생했습니다: ${error.message}`,
        });
      }
    }
  };
  const onFixClick = async () => {
    if (!isFixedDate) {
      const { error } = await supabase
        .from("routine")
        .insert({ type: "siheung_fix_date", data: dateInput });

      if (error) {
        console.log(error);
        alert("저장 실패");
      } else {
        setIsFixedDate(true);
        alert("고정 성공");
      }
    } else {
      const { error } = await supabase
        .from("routine")
        .delete()
        .eq("type", "siheung_fix_date");

      if (error) {
        console.log(error);
        alert("해제 실패");
      } else {
        setIsFixedDate(false);
        setDateInput(lastDateInput);
        alert("해제 성공");
      }
    }
  };

  if (openRoom) return <Room posts={posts} />;
  return (
    <>
      <p>{`["2025-09-13","2025-09-14"] 형식으로 똑같이 작성해주세요.(괄호, " 포함)`}</p>
      <div className="flex gap-x-3">
        <TextField
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          fullWidth
          className="flex-1"
        />
        <Button variant="contained" onClick={onFixClick}>
          {isFixedDate ? "날짜 고정 해제" : "해당 날짜 고정"}
        </Button>
      </div>

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
        문구 복사
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
