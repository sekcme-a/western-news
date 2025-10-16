"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchInput({ input }) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(input);

  const handleSearch = () => {
    if (searchValue.trimStart().length === 0) return;
    if (searchValue.trimStart().length < 2) {
      alert("검색어는 2글자 이상 입력해주세요.");
      return;
    }
    router.push(`/article/search?input=${searchValue}`);
  };

  return (
    <section className="w-full flex justify-center">
      <div className="w-full lg:w-3/4 items-center mt-8 gap-x-5 flex  ">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="검색어를 입력하세요."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-1 bg-[#3a3a3a] text-white placeholder-gray-400 px-4 py-3 rounded-3xl
         outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          className="bg-white text-black font-semibold px-4 py-1 rounded-lg hover:bg-gray-200 cursor-pointer"
          onClick={handleSearch}
        >
          검색
        </button>
      </div>
    </section>
  );
}
