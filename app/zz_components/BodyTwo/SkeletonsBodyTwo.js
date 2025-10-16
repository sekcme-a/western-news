import Skeleton from "@/components/Skeleton";

export default async function SkeletonsBodyTwo({ variant }) {
  if (variant === "LeftBodyTwo")
    return (
      <>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="mt-5 w-full h-2.5" />
        <Skeleton className="mt-3 w-[70%] h-2.5" />
        <Skeleton className="mt-3 w-[50%] h-2.5" />
      </>
    );
  if (variant === "RightBodyTwo")
    return (
      <div className="flex gap-x-4">
        <div className="flex-1">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="mt-5 w-full h-5" />
          <Skeleton className="mt-5 w-[50%] h-5" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="mt-5 w-full h-5" />
          <Skeleton className="mt-5 w-[50%] h-5" />
        </div>
      </div>
    );
}
