"use client";

import { useSoldier } from "@/hooks/use-soldier";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useCallback, useState } from "react";

interface ImageUploadProps {
  onUploadSuccess: (path: string) => void;
  defaultValue?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  defaultValue,
}) => {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadImage } = useSoldier();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn tệp hình ảnh");
        return;
      }

      setIsUploading(true);
      try {
        const result = await uploadImage(file);
        // Assuming result is the path string or an object with a path property
        const path =
          typeof result === "string" ? result : result.data || result;
        setPreview(URL.createObjectURL(file));
        onUploadSuccess(path);
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadImage, onUploadSuccess],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="relative w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden group"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Icon icon="mdi:camera" className="text-white text-3xl" />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 text-gray-500">
          <Icon icon="mdi:cloud-upload" className="text-4xl" />
          <p className="text-sm">Kéo thả hoặc nhấn để tải ảnh lên</p>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
};
