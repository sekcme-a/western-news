/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 💡 Next.js 13+ 앱 라우터 환경에서 권장되는 설정 방식
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hedqpbzdfsbextngpdtg.supabase.co", // 👈 여기에 추출한 호스트 이름을 추가
        port: "",
        pathname: "/**", // 👈 Supabase Public Bucket 경로 패턴 추가 (선택 사항이지만 권장)
      },
      {
        protocol: "https",
        hostname: "img.seoul.co.kr", // 👈 여기에 추출한 호스트 이름을 추가
        port: "",
        pathname: "/**", // 👈 Supabase Public Bucket 경로 패턴 추가 (선택 사항이지만 권장)
      },
      {
        protocol: "https",
        hostname: "www.siheung.go.kr", // 👈 여기에 추출한 호스트 이름을 추가
        port: "",
        pathname: "/**", // 👈 Supabase Public Bucket 경로 패턴 추가 (선택 사항이지만 권장)
      },
      {
        protocol: "https",
        hostname: "www.ansan.go.kr", // 👈 여기에 추출한 호스트 이름을 추가
        port: "",
        pathname: "/**", // 👈 Supabase Public Bucket 경로 패턴 추가 (선택 사항이지만 권장)
      },
      // 만약 다른 외부 이미지 호스트가 있다면 여기에 추가합니다.
    ],
  },
};

export default nextConfig;
