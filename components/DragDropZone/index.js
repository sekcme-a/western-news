"use client";
import { useDropzone } from "react-dropzone";
import { useDragDropZone } from "./useDragDropZone";
import ImagePreviewItem from "./ImagePreviewItem";
import { useRef } from "react";

const DragDropZone = ({ maxMB = 1, initialFiles = [], onChange }) => {
  const { files, onDrop, onRemove, onDragEnd, statusText } = useDragDropZone({
    maxMB,
    initialFiles,
    onChange,
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const pasteInputRef = useRef(null);

  const handlePaste = (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const images = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) images.push(file);
      }
    }

    if (images.length > 0) {
      event.preventDefault(); // 브라우저 기본 붙여넣기 방지
      onDrop(images);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-10 rounded-md text-center cursor-pointer hover:border-blue-500"
      >
        <input {...getInputProps()} />
        <p className={statusText === "" ? "" : `mb-5`}>
          {statusText === ""
            ? "이미지를 드래그하거나 클릭하여 업로드하세요"
            : statusText}
        </p>

        {/* 붙여넣기 input */}
        <input
          onClick={(e) => e.stopPropagation()}
          ref={pasteInputRef}
          type="text"
          placeholder="이곳을 클릭 후, Ctrl+V로 이미지 붙여넣기"
          onPaste={handlePaste}
          className="border p-2 rounded w-full text-sm focus:outline-none focus:ring"
        />

        <div className="grid grid-cols-3 gap-4 mt-4">
          {files.map((file, index) => (
            <ImagePreviewItem
              key={file.id}
              file={file}
              index={index}
              onRemove={() => onRemove(index)}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragDropZone;
