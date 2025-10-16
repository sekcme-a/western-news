import Skeleton from "@/components/Skeleton";

export default async function SkeletonCategory({ variant }) {
  if (variant === "Headline")
    return (
      <div className="grid md:grid-cols-2 gap-x-4 w-full hover-effect">
        <div className="">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4 mt-3" />
          <Skeleton className="h-3 w-full mt-5" />
          <Skeleton className="h-3 w-3/4 mt-3" />
          <Skeleton className="h-3 w-1/2 mt-3" />
        </div>
        <Skeleton variant="square" className="w-full h-64" />
      </div>
    );
  if (variant === "ArticleList")
    return (
      <section className="border-t-[1px] border-white mt-10">
        {[0, 1, 2, 3, 4, 5, 6].map((item, index) => (
          <div className="flex gap-x-4 py-8 items-center" key={index}>
            <Skeleton variant="square" className="w-1/5 h-24" />
            <div className="flex-1">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-full mt-5" />
              <Skeleton className="h-3 w-3/4 mt-3" />
            </div>
          </div>
        ))}
      </section>
    );

  if (variant === "HeadlineList")
    return (
      <>
        <Skeleton className="w-32 h-5" />
        {[0, 1, 2, 3, 4, 5, 6].map((item, index) => (
          <div className="flex items-center w-full gap-x-3 py-4" key={index}>
            <div className="w-3/4">
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-3/4 h-3 mt-3" />
            </div>
            <Skeleton className="w-1/4 h-16" />
          </div>
        ))}
      </>
    );
}
