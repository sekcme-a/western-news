import Image from "next/image";

export default function ArticleSmallThumbnail({ article, key }) {
  return (
    <li
      key={key}
      className=" hover-effect py-4 border-b-[1px] border-[#3d3d3d]"
    >
      <article className="flex items-center gap-x-3">
        <span className="flex-1 line-clamp-2 font-semibold text-[#dfdfdf]">
          {article.title}
        </span>
        <div className="relative w-1/4 h-16 rounded-lg overflow-hidden">
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
              article.title?.includes("덕암") && article.title?.includes("칼럼")
                ? "contain"
                : "cover"
            }
            style={{ backgroundColor: "black" }}
          />
        </div>
      </article>
    </li>
  );
}
