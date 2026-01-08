"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function PdfAdminPage() {
  const supabase = createBrowserSupabaseClient();
  const [papers, setPapers] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 1. 목록 불러오기 (동일)
  const fetchPapers = async () => {
    const { data } = await supabase
      .from("pdf_papers")
      .select("*")
      .order("published_date", { ascending: false });
    setPapers(data || []);
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  // 2. PDF 업로드 (동일)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert("제목과 파일을 선택하세요.");

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    // 파일명 중복 방지를 위해 타임스탬프 추가 추천
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `admin/pdf/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from("public-bucket")
      .upload(filePath, file);

    if (uploadError) {
      alert("파일 업로드 실패: " + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("public-bucket").getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from("pdf_papers")
      .insert([{ title, pdf_url: publicUrl, published_date: new Date() }]);

    if (dbError) alert(dbError.message);
    else {
      alert("업로드 완료!");
      setTitle("");
      setFile(null);
      fetchPapers();
    }
    setUploading(false);
  };

  /**
   * 3. 핵심 수정 부분: Storage와 DB 동시 삭제
   */
  const deletePaper = async (paper) => {
    if (!confirm(`'${paper.title}' 지면을 정말 삭제하시겠습니까?`)) return;

    try {
      // 3-1. URL에서 Storage 경로 추출
      // 예: .../storage/v1/object/public/public-bucket/admin/pdf/filename.pdf
      // 여기서 'admin/pdf/filename.pdf' 부분만 필요합니다.
      const urlParts = paper.pdf_url.split("public-bucket/");
      const filePath = urlParts[1];

      if (filePath) {
        // 3-2. Storage에서 실제 파일 삭제
        const { error: storageError } = await supabase.storage
          .from("public-bucket")
          .remove([filePath]);

        if (storageError) {
          console.error("Storage 삭제 에러:", storageError);
          // 스토리지 삭제 실패 시 로직을 중단할지 결정 (보통 중단 권장)
          throw new Error("파일 삭제 중 오류가 발생했습니다.");
        }
      }

      // 3-3. DB에서 행 삭제
      const { error: dbError } = await supabase
        .from("pdf_papers")
        .delete()
        .eq("id", paper.id);

      if (dbError) throw dbError;

      alert("삭제되었습니다.");
      fetchPapers();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen p-5">
      <h1 className="text-3xl font-bold mb-8">지면 PDF 관리자</h1>

      {/* 등록 폼 (동일) */}
      <form
        onSubmit={handleUpload}
        className=" p-6 rounded-lg mb-10 border border-[#3a3a3a]"
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="지면 제목 (예: 제 124호)"
            className=" border border-[#3a3a3a] p-2 rounded "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-bold transition disabled:bg-gray-600 cursor-pointer"
          >
            {uploading ? "업로드 중..." : "새 지면 등록"}
          </button>
        </div>
      </form>

      {/* 목록 */}
      <div className="grid gap-4">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="flex justify-between items-center bg-[#2a2a2a] p-4 rounded border border-[#3a3a3a]"
          >
            <div>
              <p className="font-bold">{paper.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(paper.published_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={paper.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm bg-[#3a3a3a] px-3 py-1 rounded"
              >
                보기
              </a>
              <button
                onClick={() => deletePaper(paper)} // 객체 전체를 전달하도록 변경
                className="text-sm bg-red-900 hover:bg-red-700 px-3 py-1 rounded transition"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
