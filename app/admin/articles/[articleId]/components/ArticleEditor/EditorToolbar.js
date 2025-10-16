import { Quill } from "react-quill-new";
import { ImageResize } from "quill-image-resize-module-ts";
import imageCompression from "browser-image-compression";

if (typeof window !== "undefined" && window.Quill) window.Quill = Quill;
Quill.register("modules/ImageResize", ImageResize);

export const handleImageInsert = async ({ quillRef }) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const compressed =
      file.size > 2 * 1024 * 1024
        ? await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 1920 })
        : file;

    const reader = new FileReader();
    reader.onload = () => {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, "image", reader.result);
      editor.setSelection(range.index + 1);
    };
    reader.readAsDataURL(compressed);
  };

  input.click();
};

export const modules = ({ handleImageInsert, quillRef }) => ({
  toolbar: {
    container: [
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ align: [] }],
      [{ size: [] }],
      [{ color: [] }, { background: [] }],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
    handlers: { image: () => handleImageInsert({ quillRef }) },
  },
  ImageResize: { modules: ["Resize", "DisplaySize"] },
});
