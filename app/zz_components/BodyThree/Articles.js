"use client";

import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Add } from "@mui/icons-material";

export default function Articles({ categorySlug, categoryName, key }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const { data: dataWithImg, error: imgError } = await supabase
      .from("article_categories")
      .select("articles(title, id, thumbnail_image, content)")
      .eq("category_slug", categorySlug)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .limit(1);
    const { data, error } = await supabase
      .from("article_categories")
      .select("articles(title, id, content)")
      .eq("category_slug", categorySlug)
      .order("created_at", { referencedTable: "articles", ascending: false })
      .range(1, 2);

    setList([
      ...dataWithImg.map((item) => item.articles),
      ...data.map((item) => item.articles),
    ]);
  };

  return (
    <section className="w-full" key={key}>
      <Link href={`/${categorySlug}`} aria-label="카테고리로 이동">
        <div className="flex items-center w-full">
          <p className="text-xl font-bold flex-1">{categoryName}</p>
          <AddRoundedIcon className="cursor-pointer" fontSize="small" />
        </div>
      </Link>
      <ul className="">
        <li>
          <article className="hover-effect">
            <Link href={`article/${list[0]?.id}`} aria-label="기사로 이동">
              <div className="mt-4 rounded-md overflow-hidden relative w-full h-36">
                <Image
                  src={list[0]?.thumbnail_image ?? "/images/og_logo.png"}
                  alt={list[0]?.title}
                  fill
                  objectFit="cover"
                />
              </div>
              <p className="font-semibold text-md py-4 ">{list[0]?.title}</p>
            </Link>
          </article>
        </li>
        {list.slice(1).map((item) => (
          <li key={item.id} className="py-5 border-t-[1px] border-[#3d3d3d]">
            <article className="hover-effect">
              <Link href={`article/${item.id}`} aria-label="기사로 이동">
                <p className="text-md font-semibold">{item.title}</p>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
