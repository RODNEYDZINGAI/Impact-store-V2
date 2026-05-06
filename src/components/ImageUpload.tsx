"use client";

import { useState, useRef } from "react";
import { Upload, X, Star } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  slug: string;
}

export default function ImageUpload({ images, onImagesChange, slug }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFileSelect = async (files: FileList) => {
    if (!slug) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("slug", slug);
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        onImagesChange([...images, ...data.urls]);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setAsMain = (index: number) => {
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.unshift(moved);
    onImagesChange(reordered);
  };

  const removeImage = (index: number) => {
    const url = images[index];
    // Delete from R2 in background
    fetch("/api/upload/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-500">Product Images</label>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-navy-light"
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).alt = "Broken image";
                  (e.target as HTMLImageElement).className = "hidden";
                  (e.target as HTMLImageElement).parentElement!.classList.add("flex", "items-center", "justify-center");
                  const placeholder = document.createElement("span");
                  placeholder.className = "text-xs text-gray-600";
                  placeholder.textContent = "Image not found";
                  (e.target as HTMLImageElement).parentElement!.appendChild(placeholder);
                }}
              />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-steel px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                  MAIN
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsMain(i)}
                    className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm hover:bg-white/30"
                    title="Set as main image"
                  >
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm hover:bg-red-500/50"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {!slug ? (
        <div className="rounded-xl border-2 border-dashed border-white/10 p-6 text-center">
          <p className="text-sm text-gray-600">Enter a product name first to enable image uploads</p>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current++;
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current--;
            if (dragCounter.current === 0) setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(false);
            dragCounter.current = 0;
            if (!uploading && e.dataTransfer.files.length) {
              handleFileSelect(e.dataTransfer.files);
            }
          }}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
            dragging
              ? "border-steel bg-steel/10"
              : "border-white/10 hover:border-steel/30"
          }`}
        >
          <Upload className={`mx-auto h-7 w-7 ${dragging ? "text-steel" : "text-gray-600"}`} />
          <p className="mt-2 text-sm text-gray-500">
            {uploading ? "Uploading..." : dragging ? "Drop images here" : "Drag & drop or click to upload"}
          </p>
          <p className="mt-1 text-xs text-gray-700">JPG, PNG, WebP — max 5MB each</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.length && handleFileSelect(e.target.files)}
      />
    </div>
  );
}
