"use client";

import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";

import { resolveImageUrl } from "@/lib/image-url";
import { useVehicle } from "@/hooks/use-vehicle";

interface VehicleImagesUploadProps {
  imagePaths: string[];
  imageUrls?: string[];
  vehicleId?: number;
  onChange: (paths: string[]) => void;
}

const MAX_IMAGES = 10;

export const VehicleImagesUpload: React.FC<VehicleImagesUploadProps> = ({
  imagePaths,
  imageUrls,
  vehicleId,
  onChange,
}) => {
  const { uploadVehicleImage, deleteVehicleImage } = useVehicle();
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [removingPath, setRemovingPath] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrls) return;
    const map: Record<string, string> = {};

    imagePaths.forEach((path, i) => {
      if (imageUrls[i]) map[path] = imageUrls[i];
    });
    setPreviewUrls((prev) => ({ ...map, ...prev }));
  }, [vehicleId]);

  const resolveThumb = (path: string) => {
    const url = previewUrls[path];

    if (!url) return null;

    return url.startsWith("blob:") ? url : resolveImageUrl(url);
  };

  const isBusy = isUploading || removingPath !== null;

  const handleFile = async (file: File) => {
    if (isBusy) return;
    if (!file.type.startsWith("image/")) return;
    if (imagePaths.length >= MAX_IMAGES) return;

    setIsUploading(true);
    try {
      const result = await uploadVehicleImage(file);
      const path =
        (result as any)?.data?.path ?? (result as any)?.data ?? result;

      setPreviewUrls((prev) => ({
        ...prev,
        [path]: URL.createObjectURL(file),
      }));
      onChange([...imagePaths, path]);
    } catch (error) {
      console.error("Upload vehicle image failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (path: string) => {
    if (isBusy) return;
    setRemovingPath(path);
    try {
      if (vehicleId) {
        await deleteVehicleImage(vehicleId, path);
      }
      onChange(imagePaths.filter((p) => p !== path));
    } catch (error) {
      console.error("Remove vehicle image failed", error);
    } finally {
      setRemovingPath(null);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {imagePaths.map((path) => (
          <div
            key={path}
            className="relative aspect-square rounded-lg overflow-hidden border border-default-200 group"
          >
            <img
              alt="Ảnh phương tiện"
              className="w-full h-full object-cover"
              src={resolveThumb(path) ?? undefined}
            />
            <button
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              disabled={isBusy}
              type="button"
              onClick={() => handleRemove(path)}
            >
              {removingPath === path ? (
                <Spinner size="sm" />
              ) : (
                <Icon icon="mdi:close" />
              )}
            </button>
          </div>
        ))}

        {imagePaths.length < MAX_IMAGES && (
          <label
            className={`relative aspect-square rounded-lg border-2 border-dashed border-default-300 flex items-center justify-center transition-colors ${isBusy ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary"}`}
            htmlFor="vehicle-image-upload"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <input
              accept="image/*"
              className="hidden"
              disabled={isBusy}
              id="vehicle-image-upload"
              type="file"
              onChange={onFileChange}
            />
            {isUploading ? (
              <Spinner size="sm" />
            ) : (
              <Icon className="text-2xl text-default-400" icon="mdi:plus" />
            )}
          </label>
        )}
      </div>
      <p className="text-xs text-default-400">
        Tối đa 10 ảnh ({imagePaths.length}/10)
      </p>
    </div>
  );
};
