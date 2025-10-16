"use client";

import { IconButton, TextField } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";

export default function ArticleSearch({ search }) {
  const [input, setInput] = useState(search);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (input.trim()) params.set("search", input.trim());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <TextField
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      placeholder="제목 또는 내용 검색"
      className="w-full md:w-80"
      slotProps={{
        input: {
          endAdornment: (
            <IconButton onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          ),
        },
      }}
      size="small"
    />
  );
}
