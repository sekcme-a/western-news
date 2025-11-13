import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

function parseDate(str) {
  const [yyyy, mm, dd] = str.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const startPage = searchParams.get("page");

  const startDate = startParam ? parseDate(startParam) : null;
  const endDate = endParam ? parseDate(endParam) : null;

  const maxArticles = 50;
  let currentPage = startPage.toString() === "0" ? 1 : parseInt(startPage);
  let articles = [];
  let shouldStop = false; // ✅ 날짜 범위 벗어나면 종료

  try {
    while (articles.length < maxArticles && !shouldStop) {
      if (currentPage === 15) break;

      const url = `https://www.ansan.go.kr/www/common/bbs/selectPageListBbs.do?key=274&bbs_code=B0238&currentPage=${currentPage}`;
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      const rows = $("tbody.text_center > tr");
      if (rows.length === 0) break;

      let addedThisPage = 0;

      for (let i = 0; i < rows.length; i++) {
        if (articles.length >= maxArticles) break;

        const row = rows.eq(i);
        const tds = row.find("td");
        const number = tds.eq(0).text().trim();
        const title = tds.eq(1).find("a").text().trim();
        const onclick = tds.eq(1).find("a").attr("onclick") || "";
        const dateStr = tds.eq(4).text().trim();
        const date = parseDate(dateStr);

        // 번호 없는 공지 등은 스킵
        if (isNaN(parseInt(number))) continue;

        // ✅ 최신순이므로 startDate보다 이전이면 루프 종료
        if (startDate && date < startDate) {
          shouldStop = true;
          break;
        }

        // ✅ endDate보다 이후(너무 최신)는 스킵
        if (endDate && date > endDate) continue;

        // ✅ detail URL 파싱
        const match = onclick?.match(/fnGoDetail\(\s*(\d+)\s*\)/);
        if (!match) continue;
        const seq = match[1];
        const detailUrl = `https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?key=274&bbs_code=B0238&bbs_seq=${seq}&currentPage=${currentPage}`;

        // 상세 페이지 크롤링
        const detailRes = await axios.get(detailUrl);
        const $$ = cheerio.load(detailRes.data);

        const subjectRow = $$("tbody.p-table--th-left tr.p-table__subject").eq(
          0
        );
        const contentRow = $$("tbody.p-table--th-left tr.p-table__subject").eq(
          2
        );

        const detailTitle = subjectRow.find("td").text().trim();
        let content = contentRow.find("td").html()?.trim() || "";
        content = content
          .replace(/<br\s*\/?>/g, "\n")
          .replace(/<[^>]+>/g, "")
          .trim();

        // ✅ 이미지 가져오기
        const images = [];
        $$(".p-photo__wrap img").each((_, el) => {
          const src = $$(el).attr("src");
          if (src) {
            const absoluteUrl = src.startsWith("http")
              ? src
              : `https://www.ansan.go.kr${src}`;
            images.push(absoluteUrl);
          }
        });

        // ✅ 첨부파일 가져오기
        const files = [];
        $$(".p-attach__item a").each((_, el) => {
          const fileOnclick = $$(el).attr("onclick");
          const fileMatch = fileOnclick?.match(/fnFileDownLoad\('(.+?)'\)/);
          if (fileMatch) {
            const fileId = fileMatch[1];
            const fileUrl = `https://www.ansan.go.kr/common/file/FileDown.do?key=274&bbs_seq=${seq}&bbs_code=B0238&currentPage=${currentPage}&file_id=${fileId}`;
            files.push(fileUrl);
          }
        });

        articles.push({
          number,
          title: detailTitle,
          date: dateStr,
          content,
          attachments: files,
          images,
          url: detailUrl,
        });
        addedThisPage++;
      }

      // ✅ startDate보다 오래된 글을 만나면 루프 즉시 종료
      if (shouldStop) break;

      // ✅ 게시글 추가 없으면 종료
      if (addedThisPage === 0 && articles.length > 0) break;

      // ✅ 단일 페이지 조회 요청일 경우 (page param 지정 시)
      if (startPage.toString() !== "0") break;

      currentPage++;
    }

    return new NextResponse(
      JSON.stringify({
        count: articles.length,
        articles,
        message:
          articles.length === 0
            ? "해당 기간에는 게시물이 없습니다."
            : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "크롤링 실패",
        message: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
