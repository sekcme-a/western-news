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

      <div className="mt-9 quill-article mb-10">
        <QuillArticle html={article.content} />
      </div>

      <p className="text-sm text-[#999]">{article.author}</p>
    </article>
  );
}
