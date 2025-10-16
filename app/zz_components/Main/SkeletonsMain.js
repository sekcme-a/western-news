import Skeleton from "@/components/Skeleton";

export default async function SkeletonsMain({ variant }) {
  if (variant === "Headline")
    return (
      <>
        <Skeleton variant="square" className="w-full h-64 md:h-96" />
        <Skeleton className="mt-3 md:mt-5 w-full h-5" />
        <Skeleton className="mt-3 w-[50%] h-5" />
      </>
    );
  else if (variant === "MainNews")
    return (
      <>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="mt-3 w-full h-4" />
        <Skeleton className="mt-3 w-[50%] h-4" />
        <Skeleton className="mt-9 w-full h-4" />
        <Skeleton className="mt-3 w-[50%] h-4" />
        <Skeleton className="mt-9 w-full h-4" />
        <Skeleton className="mt-3 w-[50%] h-4" />
      </>
    );
  else if (variant === "RecentArticles")
    return (
      <>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[50%] mt-3" />
        <Skeleton className="h-4 w-full mt-10" />
        <Skeleton className="h-4 w-[50%] mt-3" />
        <Skeleton className="h-4 w-full mt-10" />
        <Skeleton className="h-4 w-[50%] mt-3" />
        <Skeleton className="h-4 w-full mt-10" />
        <Skeleton className="h-4 w-[50%] mt-3" />
        <Skeleton className="h-4 w-full mt-10" />
        <Skeleton className="h-4 w-[50%] mt-3" />
        <Skeleton className="h-4 w-full mt-10" />
        <Skeleton className="h-4 w-[50%] mt-3" />
      </>
    );
}
