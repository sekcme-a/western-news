// app/api/crawl/route.js
import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

function parseDateFromText(text) {
  const match = text.match(/작성일\s+(\d{4}-\d{2}-\d{2})/);
  return match ? new Date(match[1]) : null;
}

function isWithinRange(date, start, end) {
  return date >= start && date <= end;
}

function extractViewUrlFromOnClick(onClick) {
  const match = onClick.match(
    /goTo\.view\('list','(\d+)',\s*'(\d+)',\s*'(\d+)'\)/
  );
  if (!match) return null;
  const [_, bIdx, ptIdx, mId] = match;
  return `https://www.siheung.go.kr/media/bbs/view.do?mId=${mId}&bIdx=${bIdx}&ptIdx=${ptIdx}`;
}

async function crawlViewPage(viewUrl) {
  try {
    const res = await axios.get(viewUrl);
    const $ = cheerio.load(res.data);

    const title = $("div.bod_view h4").text().trim();
    const mT10 = $("div.view_cont .mT10").first();
    mT10.find("br").replaceWith("\n");
    const content = mT10.text().trim();

    const images = [];
    $("div.view_cont img").each((_, img) => {
      const src = $(img).attr("src");
      if (src) images.push(new URL(src, viewUrl).href);
    });

    return { title, content, images, url: viewUrl };
  } catch (err) {
    console.error(`상세 페이지 크롤링 실패: ${viewUrl}`, err);
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");

  if (!startDateStr || !endDateStr) {
    return NextResponse.json(
      { error: "start, end 날짜 쿼리 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const maxCount = 100;
  let currentPage = 1;
  let collected = [];

  try {
    while (collected.length < maxCount) {
      const url = `https://www.siheung.go.kr/media/bbs/list.do?ptIdx=82&mId=0100000000&page=${currentPage}`;
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      const items = $("div.bod_blog ul li");
      if (items.length === 0) break;

      // ✅ 한 페이지에서 처리할 URL 수집
      const viewUrls = [];
      for (const el of items.toArray()) {
        if (collected.length + viewUrls.length >= maxCount) break;

        const a = $(el).find("a");
        const rawText = a.text().trim();
        const onClick = a.attr("onclick");

        const html = a.html()?.replace(/<br\s*\/?>/gi, "\n") || "";
        const decodedText = $("<div>").html(html).text().trim();
        const fullText = `[${rawText}]\n\n${decodedText}`;
        const createdAt = parseDateFromText(fullText);

        if (!createdAt || !isWithinRange(createdAt, startDate, endDate))
          continue;

        const viewUrl = extractViewUrlFromOnClick(onClick);
        if (viewUrl) viewUrls.push(viewUrl);
      }

      if (viewUrls.length === 0 && collected.length !== 0) break;

      // ✅ 병렬로 상세 페이지 크롤링
      const details = await Promise.all(viewUrls.map(crawlViewPage));
      for (const detail of details) {
        if (detail && collected.length < maxCount) collected.push(detail);
      }

      currentPage++;
    }

    return NextResponse.json({ posts: collected });
  } catch (err) {
    console.error("크롤링 중 오류:", err);
    return NextResponse.json({ error: "크롤링 실패" }, { status: 500 });
  }
}
