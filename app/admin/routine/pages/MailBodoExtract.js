import DragDropZone from "@/components/DragDropZone";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button, TextField } from "@mui/material";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { saveArticle } from "./function/saveArticle";
import { convertTextToQuillHTML } from "./function/convertTextToQuillHTML";
import { useRouter } from "next/navigation";
import { addSession } from "../handleSession";

const TEXT = `아래의 문장은 hwp파일에 들어있는 보도자료들을 복사한거야. 규칙에 맞게 json 형태로 변환해줘. 
1. 데이터 형식은 [{title, subtitle, image_descriptions:[], content, slug}] 
2. subtitle와 image_descriptions 는 기사에 존재하지 않을 수 있어 
3. 기사의 내용은 절때 바꾸면 안되. 
4. 보도자료 내용이 길어도 모든 보도자료를 추출해줘. “…” 와 같은 방식으로 content 데이터를 자르면 안되.
5. JSON형식의 코드로만 대답하고, 다른 부가적인 설명이나 말 하지마.
6.`;

export default function MailBodoExtract({
  selectedMails,
  setPage,
  setWarnings,
  setErrors,
}) {
  const router = useRouter();
  const imageRef = useRef([]);
  const [mailPage, setMailPage] = useState(0);
  const [aiInstruction, setAiInstruction] = useState("");
  const [categories, setCategories] = useState([]);

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  // const [aiResults, setAiResults] = useState([]);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (selectedMails.length === 0) navigator.clipboard.writeText("next");
  }, [selectedMails]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    imageRef.current = [];
    setImages([]);
    //메일 페이지가 끝나면 다음 페이즈로 넘어가기 위해(오토마우스 인지)
    if (mailPage >= selectedMails.length) setAiInstruction("");
  }, [mailPage]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("slug")
      .eq("parent_id", "422d1e7f-6582-4fe6-8362-ed7e83c04ec3");
    const cats = data.map((item) => item.slug);
    setCategories(cats);
    const text = data.map((item) => item.slug).join(",");
    setAiInstruction(
      `${TEXT} "${text}" 중에 가장 어울리는 주제 하나 선택해 slug에 추가해.
     `
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiInstruction);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const handleImageChange = (files) => {
    imageRef.current = files;
  };

  const onChange = async (e) => {
    try {
      setText(e.target.value);
      const aiResults = JSON.parse(e.target.value);
      const images = imageRef.current;

      let articles = [];

      if (aiResults.length === 0) throw new Error("asdf");

      articles = aiResults.map((item, index) => {
        let imgs = [];
        //기사가 1개라면, 모든 이미지 첨부파일이 해당 기사의 이미지
        if (aiResults.length === 1) imgs = images;
        else {
          imgs = images.filter(
            (img) =>
              img.file.name?.trim().startsWith(`${index + 1}`) ||
              img.file.name?.includes(item.title)
          );
        }

        return {
          images: imgs,
          ...item,
          content: convertTextToQuillHTML(item.content),
          author: "심수연 기자 bkshim21@naver.com",
        };
      });

      Promise.all(
        articles.map(async (article, index) => {
          try {
            await saveArticle(article);
            addSession("success", {
              title: `[메일 보도자료 저장 성공] "${article.title}"`,
            });
          } catch (error) {
            console.log(error);
            if (error.code === "23503") {
              addSession("error", {
                title: "메일 보도자료 카테고리 선정 실패",
                message: `멍청한 AI가 "${error.title}"의 카테고리를 정상적으로 선정하지 못했습니다.`,
                button: {
                  text: "해당 보도자료 카테고리 선정하기",
                  url: `/admin/articles/${error.article_id}`,
                },
              });
            } else {
              addSession("error", {
                title: "메일 보도자료 저장실패",
                message: `"${error.title}" 보도자료를 저장하지 못했습니다.`,
                error: error,
              });
            }
          }
        })
      );
      // await saveArticle(articles[0]);
    } catch (error) {
      if (error.message.includes("JSON")) {
        addSession("error", {
          title: `매일 보도자료 추출 실패`,
          message: `멍청한 AI가 "${selectedMails[mailPage]?.subject}"의 보도자료 추출을 실패했습니다.\n아래 버튼을 통해 보도자료를 다운로드 받고, 수동으로 보도자료를 입력해주세요.`,
          button: {
            text: "해당 보도자료 첨부파일 다운로드",
            url: `/api/mail/download/${selectedMails[mailPage]?.uid}`,
          },
        });
      }
    }
  };
  return (
    <div className="">
      <h1 className="text-xl font-bold mb-4">메일 보도자료 추출</h1>
      <p className="mt-2">{`${mailPage + 1} / ${selectedMails.length}번째`}</p>

      <p className="mt-2 font-bold">{selectedMails[mailPage]?.subject}</p>

      <a href={`/api/mail/download/${selectedMails[mailPage]?.uid}`}>
        <Button fullWidth className="h-[15vh]" variant="contained">
          첨부파일 다운로드
        </Button>
      </a>

      <Button
        fullWidth
        className="h-[15vh] "
        sx={{ mt: 1 }}
        variant="contained"
        onClick={handleCopy}
      >
        문구 복사
      </Button>
      <TextField
        fullWidth
        sx={{ mt: 1 }}
        rows={5}
        multiline
        value={text}
        onChange={onChange}
      />
      <div key={mailPage}>
        <DragDropZone
          initialFiles={images}
          maxMB={2}
          onChange={handleImageChange}
        />
      </div>
      <Button
        fullWidth
        className="h-[15vh] "
        sx={{ mt: 1 }}
        variant="contained"
        onClick={async () => {
          if (mailPage >= selectedMails.length - 1) {
            navigator.clipboard.writeText("next");
            const { error } = await supabase
              .from("routine")
              .insert({ type: "mail_bodo", date: new Date() });
            console.log(error);
            router.push(`/admin/routine/sihueng`);
            // setPage((prev) => prev + 1);
          } else {
            setText("");
            setMailPage((prev) => prev + 1);
          }
        }}
      >
        {mailPage >= selectedMails.length - 1 ? "다음 루틴" : "다음 기사"}
      </Button>
    </div>
  );
}
