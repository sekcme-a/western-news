import { Suspense } from "react";
import LeftBodyTwo from "./LeftBodyTwo";
import RightBodyTwo from "./RightBodyTwo";
import SkeletonsBodyTwo from "./SkeletonsBodyTwo";

export default function BodyTwo({ categorySlug }) {
  return (
    <div className="lg:flex gap-x-7 pt-10 mt-10 border-t-[1px] border-[#e6e6e6] ">
      <div className="lg:w-1/2 w-full">
        <Suspense fallback={<SkeletonsBodyTwo variant="LeftBodyTwo" />}>
          <LeftBodyTwo categorySlug={categorySlug} />
        </Suspense>
      </div>
      <div className="lg:w-1/2 w-full mt-10 lg:mt-0">
        <Suspense fallback={<SkeletonsBodyTwo variant="RightBodyTwo" />}>
          <RightBodyTwo categorySlug={categorySlug} />
        </Suspense>
      </div>
    </div>
  );
}
