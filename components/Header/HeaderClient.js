"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SideNavbar from "./SideNavbar";
import NavList from "./NavList";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeaderClient({ children, scrolled, categories }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(scrolled ?? false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (scrolled) return;
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const borderClasses = `
    ${
      isScrolled
        ? "bg-gray-500 h-[1px] w-full"
        : "bg-white h-[3px] w-full md:w-[92vw] lg:w-[86vw]"
    } 
    transition-all duration-300
  `;

  const handleSearch = () => {
    if (searchValue.trimStart().length === 0) return;
    if (searchValue.trimStart().length < 2) {
      alert("검색어는 2글자 이상 입력해주세요.");
      return;
    }
    router.push(`article/search?input=${searchValue}`);
  };

  return (
    <header className="fixed z-20 w-full bg-[#1f1f1f]">
      {/* 상단 헤더 */}
      <div className="h-14 md:h-20 flex justify-center items-center relative z-30">
        <div
          className="w-full md:w-[92vw] lg:w-[86vw] flex justify-between items-center
      px-2 md:px-0"
        >
          {children}

          <ul className="flex items-center">
            <li>
              <PersonOutlineRoundedIcon
                style={{ color: "white", fontSize: "28px" }}
              />
            </li>
            <li>
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                aria-label="검색"
                className="cursor-pointer"
              >
                <SearchRoundedIcon
                  style={{
                    color: "white",
                    fontSize: "28px",
                    marginLeft: "10px",
                  }}
                />
              </button>
            </li>
            <li>
              <SideNavbar
                categoriess={categories}
                onClick={() => setShowSearch(false)}
              />
            </li>
          </ul>
        </div>
      </div>

      <hr className={`${borderClasses} m-auto p-0 border-none z-20`} />

      {/* 검색창을 navbar 아래에서 슬라이드 */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1f1f1f] flex justify-center items-center 
            relative z-30"
          >
            <div className="w-full md:px-[4vw] lg:px-[7vw] flex items-center gap-2 py-3 px-4 -z-0 bg-[#1f1f1f] ">
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
                className="flex-1 bg-[#3a3a3a] text-white placeholder-gray-400 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                className="bg-white text-black font-semibold px-4 py-1 rounded-lg hover:bg-gray-200 cursor-pointer"
                onClick={handleSearch}
              >
                검색
              </button>
            </div>
            <div
              className="absolute top-0  opacity-40 left-0 w-screen h-screen bg-black -z-10"
              onClick={() => setShowSearch(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
