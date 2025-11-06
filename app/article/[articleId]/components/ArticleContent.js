import Image from "next/image";
import QuillArticle from "./QuillArticle";

export default function ArticleContent({ article }) {
  const formatDate = (isoString) => {
    const date = new Date(isoString);

    const pad = (n) => n.toString().padStart(2, "0");

    return (
      `${date.getFullYear()}.` +
      `${pad(date.getMonth() + 1)}.` +
      `${pad(date.getDate())} ` +
      `${pad(date.getHours())}:` +
      `${pad(date.getMinutes())}:` +
      `${pad(date.getSeconds())}`
    );
  };
  return (
    <article>
      <h1 className="text-3xl font-bold ">{article.title}</h1>

      <p className="text-xs text-gray-400 mt-3">
        {formatDate(article.created_at)}
      </p>
      {/* <div className="flex items-center w-full justify-center my-10">
        <div className="relative w-full max-w-xl aspect-video">
          <Image
            src={article.thumbnail_image ?? "/images/logo.png"}
            alt={article.title ?? "투데이태백 로고"}
            fill
            className="object-cover "
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div> */}

      {/* seo */}

      <div
        className="prose prose-neutral max-w-none hidden"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {!article.subtitle && (
        <h2 className="text-xl font-bold mt-3">{article.subtitle}</h2>
      )}
      {article.images_bodo?.map((img, index) => (
        <div className="w-full mt-5" key={index}>
          <Image
            src={img}
            alt={`${article.title} 이미지 ${index + 1}`}
            width={800} // 아무 값이나 OK (비율 계산용)
            height={600} // 아무 값이나 OK (비율 계산용)
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
          {article.image_descriptions?.[index] && (
            <p className="mt-1 text-sm text-gray-400">
              {article.image_descriptions[index]}
            </p>
          )}
        </div>
      ))}

      <div className="mt-9 quill-article mb-10">
        <QuillArticle html={article.content} />
      </div>

      <p className="text-sm text-[#999]">{article.author}</p>
    </article>
  );
}
