"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const AdBanner = ({ data, ad_type, width = "100%", className = "" }) => {
  const supabase = createBrowserSupabaseClient();
  const [adData, setAdData] = useState(data);

  useEffect(() => {
    if (ad_type) fetchAdData();
  }, [ad_type]);

  const fetchAdData = async () => {
    const { data } = await supabase
      .from("advertisements")
      .select("image_url, target_url, ad_type")
      .eq("ad_type", ad_type)
      .maybeSingle();

    if (data) setAdData(data);
  };

  if (!adData || !adData.image_url) return null;

  const hasTargetUrl =
    adData.target_url && adData.target_url.startsWith("http");

  // 이미지 출력 부분 (핵심 수정 구간)
  const content = (
    <div
      style={{ width: width }}
      className={`relative overflow-hidden  ${className}`}
    >
      <Image
        src={adData.image_url}
        alt={`광고 - ${adData.ad_type}`}
        /* Next.js Image 원본 비율 유지 설정:
           1. width, height에 큰 값을 주어 원본 해상도 대응
           2. style에서 width: 100%, height: auto로 가로 기준 비율 조정
        */
        width={1200}
        height={0} // 비율 계산을 위해 큰 값을 넣어도 되지만, style이 우선합니다.
        sizes="100vw"
        style={{
          width: "100%",
          height: "auto", // 가로 길이에 맞춰 세로를 자동으로 계산 (비율 유지)
          display: "block", // 이미지 하단 미세 공백 제거
          objectFit: "contain", // 이미지 전체가 다 나오도록 보장
        }}
      />
    </div>
  );

  return (
    <li className="list-none">
      {hasTargetUrl ? (
        <Link
          href={adData.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          {content}
        </Link>
      ) : (
        <div className="block w-full">{content}</div>
      )}
    </li>
  );
};

export default AdBanner;
