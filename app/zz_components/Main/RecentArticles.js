import { createServerSupabaseClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import AdBanner from "../AdBanner";

export default async function RecentArticles() {
  const supabase = await createServerSupabaseClient();

  // 1. main_1_right 광고 데이터 조회
  const { data: adData, error: adError } = await supabase
    .from("advertisements")
    .select("image_url, target_url, ad_type")
    .eq("ad_type", "main_top_right")
    .maybeSingle();
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
        {mainRightAd && <AdBanner data={mainRightAd} />}
      </ul>
    );
  } catch (err) {
    console.error(err);
    return <p className="text-center text-gray-500">표시할 뉴스가 없습니다.</p>;
  }
}
