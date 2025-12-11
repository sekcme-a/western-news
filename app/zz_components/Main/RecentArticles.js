import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

// main_1_right 광고를 표시하는 컴포넌트입니다.
const AdComponent = ({ ad }) => {
  if (!ad || !ad.image_url) return null;

  // target_url이 있는지 확인
  const hasTargetUrl = ad.target_url && ad.target_url.startsWith("http");

  const content = (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        overflow: "hidden",
        borderRadius: "4px",
      }}
    >
      <Image
        src={ad.image_url}
        alt={`광고 이미지 - ${ad.ad_type}`}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        style={{ objectFit: "contain" }}
        priority={true}
      />
    </div>
  );

  return (
    <li className="">
      {hasTargetUrl ? (
        // target_url이 있을 경우: <a> 태그를 사용하여 링크 처리
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`광고: ${ad.ad_type}으로 이동`}
        >
          {content}
        </a>
      ) : (
        // target_url이 없을 경우: <a> 태그 없이 이미지만 표시 (클릭 비활성화)
        <div aria-label={`광고 이미지: ${ad.ad_type} (링크 없음)`}>
          {content}
        </div>
      )}
      {/* "광고"라는 텍스트 표기 제거 */}
    </li>
  );
};

export default async function RecentArticles() {
  const supabase = await createServerSupabaseClient();

  // 1. main_1_right 광고 데이터 조회
  const { data: adData, error: adError } = await supabase
    .from("advertisements")
    .select("image_url, target_url, ad_type")
    .eq("ad_type", "main_1_right")
    .maybeSingle();

  if (adError) {
    console.error(`광고 데이터 조회 실패 (main_1_right): ${adError.message}`);
  }

  const mainRightAd = adData;

  try {
    // 2. 뉴스 기사 데이터 조회 (기존 로직)
    const { data: recentArticles, error } = await supabase
      .from("articles")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(mainRightAd ? 5 : 7);

    if (error) throw new Error(`최근 뉴스 조회 실패: ${error.message}`);

    return (
      <ul>
        {recentArticles.map((article, index) => (
          <li
            key={index}
            className={`py-5 md:py-4 hover-effect ${
              index !== recentArticles.length - 1 ? "border-b-[1px]" : ""
            } border-[#3d3d3d]`}
          >
            <Link href={`/article/${article.id}`} aria-label="기사로 이동">
              <span className="font-semibold text-lg line-clamp-2">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
        {/* 이곳에 광고 추가 */}
        {mainRightAd && <AdComponent ad={mainRightAd} />}
      </ul>
    );
  } catch (err) {
    console.error(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}
