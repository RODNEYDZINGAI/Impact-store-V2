"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setSelected((s) => (s - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setSelected((s) => (s + 1) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, images.length]);

  if (!images.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex h-64 w-64 items-center justify-center text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="h-32 w-32">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Gallery layout: stacked on mobile (thumbnails below), side-by-side on desktop */}
      <div className="flex flex-col-reverse gap-3 md:flex-row">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex flex-row gap-2 overflow-x-auto pb-1 md:max-h-[30rem] md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pb-0">
            {images.map((url, i) => (
              <button
                key={url}
                onClick={() => setSelected(i)}
                className={`flex-shrink-0 overflow-hidden rounded-xl border bg-white transition ${
                  i === selected
                    ? "border-[#1f4f8f] shadow-lg shadow-blue-900/10"
                    : "border-slate-200 hover:border-[#fbbf24]"
                }`}
              >
                <img
                  src={url}
                  alt={`${name} product thumbnail ${i + 1}`}
                  className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="group/main relative flex-1 cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="aspect-square w-full overflow-hidden">
            <img
              src={images[selected]}
              alt={`${name} product image`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/main:scale-110"
              onClick={() => setLightboxOpen(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
              {selected + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selected]}
              alt={`${name} product image`}
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected((s) => (s - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected((s) => (s + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                {selected + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
