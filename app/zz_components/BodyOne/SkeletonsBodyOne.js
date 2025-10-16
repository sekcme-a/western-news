import Skeleton from "@/components/Skeleton";

export default async function SkeletonsBodyOne({ variant }) {
  if (variant === "BodyFullArticle")
    return (
      <>
        <Skeleton className="w-full h-5" />
        <Skeleton className="mt-5 w-full h-2.5" />
        <Skeleton className="mt-3 w-[70%] h-2.5" />
        <Skeleton className="mt-3 w-[50%] h-2.5" />
        <Skeleton variant="square" className="w-full h-64 mt-5" />
      </>
    );

  if (variant === "BodyArticles")
    return (
      <>
        <Skeleton className="w-full h-5" />
        <Skeleton className="mt-3 h-5 w-[70%]" />
        <Skeleton className="mt-5 w-full h-2.5" />
        <Skeleton className="mt-3 w-[50%] h-2.5" />
        <Skeleton className="w-full h-5 mt-8" />
        <Skeleton className="mt-3 h-5 w-[70%]" />
        <Skeleton className="mt-5 w-full h-2.5" />
        <Skeleton className="mt-3 w-[50%] h-2.5" />
        <Skeleton className="w-full h-5 mt-8" />
        <Skeleton className="mt-3 h-5 w-[70%]" />
        <Skeleton className="mt-5 w-full h-2.5" />
        <Skeleton className="mt-3 w-[50%] h-2.5" />
      </>
    );

  if (variant === "Opinions")
    return (
      <>
        <h5 className="font-bold text-xl md:text-lg"># 오피니언</h5>
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
        <Skeleton className="h-5 w-full my-10" />
      </>
    );
}
