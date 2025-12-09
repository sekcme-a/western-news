"use client";

import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

export default function ResultPage() {
  const router = useRouter();
  const [success, setSuccess] = useState([]);
  const [warning, setWarning] = useState([]);
  const [error, setError] = useState([]);

  const [open, setOpen] = useState(null);

  useEffect(() => {
    const sc = sessionStorage.getItem("success");
    setSuccess(JSON.parse(sc));
    const wn = sessionStorage.getItem("warning");
    setWarning(JSON.parse(wn));
    const er = sessionStorage.getItem("error");
    setError(JSON.parse(er));
  }, []);
  return (
    <div>
      {success?.map((item, index) => (
        <li key={index}>
          <p className="text-green-800">{item.title}</p>

          {open === index &&
            item?.articles?.map((article, index) => (
              <a
                key={article.id}
                href={`/admin/articles/${article.id}`}
                target="_blank"
              >
                <li key={article.id}>
                  {`[${item?.articleSlugs?.[index]}]`}
                  {article.title}
                </li>
              </a>
            ))}
          {item?.articles &&
            (open === index ? (
              <div onClick={() => setOpen(null)} className="cursor-pointer">
                닫기
              </div>
            ) : (
              <div onClick={() => setOpen(index)} className="cursor-pointer">
                자세히 보기
              </div>
            ))}
        </li>
      ))}

      <div className="mt-10" />
      {error?.map((item, index) => (
        <li key={index}>
          <p>{item.title}</p>
          <p>{item.message}</p>
          {item.button && (
            <Button
              onClick={() => router.push(item.button.url)}
              variant="contained"
            >
              {item.button.text}
            </Button>
          )}
          {item.articleIds?.map((id, index) => (
            <Link href={`/admin/articles/${id}`} target="_blank" key={index}>
              <p>기사 보기 {index}</p>
            </Link>
          ))}
        </li>
      ))}
    </div>
  );
}
