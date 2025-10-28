import Image from "next/image";
import HeaderClient from "./HeaderClient";
import NavList from "./NavList";
import { getCategories } from "@/utils/supabase/getCategories";
import Link from "next/link";
import { headers } from "next/headers";

export default async function Header({ scrolled, hasH1 }) {
  // return res.json();

  const categories = await getCategories();

  return (
    <HeaderClient scrolled={scrolled} categories={categories}>
      {hasH1 ? (
        <h1>
          <Link
            href="/"
            title="서부뉴스 홈으로 이동"
            className="relative w-[100px] h-[33px] md:w-[150px] md:h-[50px] block"
          >
            <Image
              src="/images/logo_white.png"
              alt="서부뉴스"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
        </h1>
      ) : (
        <Link
          href="/"
          title="서부뉴스 홈으로 이동"
          className="relative w-[100px] h-[33px] md:w-[150px] md:h-[50px] block"
        >
          <Image
            src="/images/logo_white.png"
            alt="서부뉴스"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>
      )}
      <NavList />
    </HeaderClient>
  );
}
