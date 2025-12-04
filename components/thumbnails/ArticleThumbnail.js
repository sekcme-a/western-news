import Image from "next/image";
import Link from "next/link";

export default function ArticleThumbnail({ article, key }) {
  return (
    <li key={key} className="py-5 md:py-8 border-b-[1px] border-[#3d3d3d]">
      <Link href={`article/${article.id}`} aria-label="기사로 이동">
        <article className="hover-effect flex gap-x-4 md:gap-x-8 items-center">
          <div className="w-2/5 md:w-1/5 relative  h-24 rounded-lg overflow-hidden">
            <Image
              src={
                article.thumbnail_image ??
                (article.title?.includes("덕암") &&
                  article.title?.includes("칼럼"))
                  ? "/images/kyunsik.png"
                  : "/images/og_logo.png"
              }
              alt={article.title}
              fill
              objectFit={
                article.title?.includes("덕암") &&
                article.title?.includes("칼럼")
                  ? "contain"
                  : "cover"
              }
              style={{ backgroundColor: "black" }}
            />
          </div>
          <div className="w-3/5 md:w-4/5">
            <span className="font-semibold text-xl line-clamp-2">
              {article.title}
            </span>
            <p className="text-sm leading-relaxed mt-2 text-[#999] line-clamp-2">
              {article.content}
            </p>
          </div>
        </article>
      </Link>
    </li>
  );
}
