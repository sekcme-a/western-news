import { htmlToPlainString } from "@/utils/lib/htmlToPlainString";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function generateMetadata({ params }) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("articles")
    .select("title, content, thumbnail_image")
    .eq("id", params.articleId)
    .single();

  const plainContent = htmlToPlainString(data.content);

  if (!data)
    return { title: "기사 없음", description: "존재하지 않는 기사입니다." };

  return {
    title: data.title,
    description: `${plainContent}`.slice(0, 100),
    openGraph: {
      title: data.title,
      description: `${plainContent}`.slice(0, 100),
      images: data.thumbnail_image
        ? [data.thumbnail_image]
        : ["/images/og_logo.png"],
    },
    twitter: {
      title: data.title,
      description: `${plainContent}`.slice(0, 100),
      images: data.thumbnail_image
        ? [data.thumbnail_image]
        : ["/images/og_logo.png"],
    },
  };
}
